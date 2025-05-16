"use server";
import { and, eq } from "drizzle-orm";
import db from "../db";
import { team, teamInvites, users } from "../db/schema";
import * as bcrypt from "bcrypt-ts";
import { cookies } from "next/headers";
import { generateJWT } from "./jwt";
import { generate } from "random-words";
import { getPayload } from "./getPayload";

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

export async function login(name: string, password: string) {
  const userRaw = db.select().from(users).where(eq(users.name, name)).get();

  if (!userRaw) return null;

  const user = {
    ...userRaw,
    isAdmin: userRaw.isAdmin === 1,
  };

  // hash password and compare with db password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  await resetJWT(user);

  return user;
}

export async function resetJWT(payload?: JWTPayload) {
  if (!payload) {
    const userid = (await getPayload())?.id;
    if (!userid) throw new Error("User not found");
    const user = db.select().from(users).where(eq(users.id, userid)).get();
    if (!user) throw new Error("User not found");
    payload = {
      ...user,
      isAdmin: user.isAdmin === 1,
    };
  }
  if (!payload) throw new Error("User not found");

  (await cookies()).set("jwt", await generateJWT(payload), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function register(
  name: string,
  password: string,
  invite_key: string
) {
  const invite = db
    .select()
    .from(teamInvites)
    .where(eq(teamInvites.inviteKey, invite_key))
    .get();
  if (!invite || invite.usedAt) throw new Error("Invalid invite key");
  const hash = await hashPassword(password);
  const { lastInsertRowid } = db
    .insert(users)
    .values({
      name,
      password: hash,
      createdAt: new Date().toISOString(),
      teamID: invite.teamID,
      isAdmin: 0,
    })
    .run();
  db.update(teamInvites)
    .set({
      usedBy: lastInsertRowid as number,
      usedAt: new Date().toISOString(),
    })
    .where(eq(teamInvites.inviteKey, invite_key))
    .run();
  return lastInsertRowid as number;
}

export async function createTeam(input: {
  teamName: string;
  username: string;
  password: string;
}) {
  try {
    const { teamName, username, password } = input;

    // Validate input
    if (!teamName || !username || !password) {
      return { error: "Missing required fields" };
    }

    // Check if team name already exists
    const existingTeam = await db
      .select()
      .from(team)
      .where(eq(team.name, teamName))
      .limit(1);

    if (existingTeam.length) {
      return { error: "Team name already exists" };
    }

    // Check if username already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.name, username))
      .limit(1);

    if (existingUser.length) {
      return { error: "Username already exists" };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create team and admin user in a transaction
    await db.transaction(async (tx) => {
      // Create team
      const { lastInsertRowid } = await tx.insert(team).values({
        name: teamName,
        createdAt: new Date().toISOString(),
      });
      const teamID = lastInsertRowid as number;

      // Create admin user
      await tx
        .insert(users)
        .values({
          name: username,
          password: hashedPassword,
          teamID,
          isAdmin: 1,
          createdAt: new Date().toISOString(),
        })
        .returning();
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Internal server error" };
  }
}

export async function logout() {
  (await cookies()).delete("jwt");
  return true;
}

export async function getTeamName() {
  const user = await getPayload();
  const teamData = db
    .select()
    .from(team)
    .where(eq(team.id, user!.teamID))
    .get();
  return teamData?.name;
}

export async function getTeamUsers() {
  const user = await getPayload();
  const teamUsers = db
    .select()
    .from(users)
    .where(eq(users.teamID, user!.teamID))
    .all();
  return teamUsers.map((user) => ({
    ...user,
    isAdmin: user.isAdmin === 1,
  }));
}

export async function removeUser(userID: number) {
  const user = await getPayload();
  if (!user?.isAdmin) throw new Error("Only admins can remove users");
  const targetUser = db.select().from(users).where(eq(users.id, userID)).get();
  if (!targetUser) throw new Error("User not found");

  // Don't allow removing the last admin
  if (targetUser.isAdmin === 1) {
    const adminCount = db
      .select()
      .from(users)
      .where(and(eq(users.teamID, targetUser.teamID), eq(users.isAdmin, 1)))
      .all().length;

    if (adminCount <= 1) {
      throw new Error("Cannot remove the last admin");
    }
  }

  db.delete(users).where(eq(users.id, userID)).run();
  return true;
}

export async function createInviteKey() {
  const user = await getPayload();
  if (!user?.isAdmin) throw new Error("Only admins can create invite keys");
  const inviteKey = generate({ exactly: 5, join: "-" });

  db.insert(teamInvites)
    .values({
      teamID: user.teamID,
      inviteKey,
    })
    .run();

  return inviteKey;
}

export async function getInviteKeys() {
  const user = await getPayload();
  if (!user?.isAdmin) throw new Error("Only admins can get invite keys");
  return db
    .select()
    .from(teamInvites)
    .where(eq(teamInvites.teamID, user.teamID))
    .all();
}

export async function deleteInviteKey(inviteKey: string) {
  const user = await getPayload();
  if (!user?.isAdmin) throw new Error("Only admins can delete invite keys");
  const invite = db
    .select()
    .from(teamInvites)
    .where(eq(teamInvites.inviteKey, inviteKey))
    .get();
  if (!invite) return;
  if (invite.teamID !== user.teamID || invite.usedAt)
    throw new Error("Invalid request");
  db.delete(teamInvites).where(eq(teamInvites.inviteKey, inviteKey)).run();
  return true;
}

export async function promoteToAdmin(userID: number) {
  const user = await getPayload();
  if (!user?.isAdmin) throw new Error("Only admins can promote users");
  const targetUser = db.select().from(users).where(eq(users.id, userID)).get();
  if (!targetUser) throw new Error("User not found");
  if (targetUser.teamID !== user.teamID)
    throw new Error("User must be in the same team");
  if (targetUser.isAdmin === 1) throw new Error("User is already an admin");

  db.update(users).set({ isAdmin: 1 }).where(eq(users.id, userID)).run();

  await resetJWT();

  return true;
}

export async function demoteFromAdmin(userID: number) {
  const user = await getPayload();
  if (!user?.isAdmin) throw new Error("Only admins can demote users");
  const targetUser = db.select().from(users).where(eq(users.id, userID)).get();
  if (!targetUser) throw new Error("User not found");
  if (targetUser.teamID !== user.teamID)
    throw new Error("User must be in the same team");
  if (targetUser.isAdmin !== 1) throw new Error("User is not an admin");

  // Don't allow demoting the last admin
  const adminCount = db
    .select()
    .from(users)
    .where(and(eq(users.teamID, targetUser.teamID), eq(users.isAdmin, 1)))
    .all().length;

  if (adminCount <= 1) {
    throw new Error("Cannot demote the last admin");
  }

  db.update(users).set({ isAdmin: 0 }).where(eq(users.id, userID)).run();

  return true;
}

export async function updateTeamName(newName: string) {
  const user = await getPayload();
  if (!user?.isAdmin) throw new Error("Only admins can update team name");

  // Check if team name already exists
  const existingTeam = db
    .select()
    .from(team)
    .where(eq(team.name, newName))
    .get();

  if (existingTeam) {
    throw new Error("Team name already exists");
  }

  db.update(team).set({ name: newName }).where(eq(team.id, user.teamID)).run();

  return true;
}

export async function changeUsername(newUsername: string) {
  const user = await getPayload();
  const targetUser = db
    .select()
    .from(users)
    .where(eq(users.id, user!.id))
    .get();
  if (!targetUser) throw new Error("User not found");

  const existingUser = db
    .select()
    .from(users)
    .where(eq(users.name, newUsername))
    .get();
  if (existingUser) throw new Error("Username already taken");

  if (targetUser.name === newUsername) return true;

  db.update(users)
    .set({ name: newUsername })
    .where(eq(users.id, user!.id))
    .run();

  await resetJWT();

  return true;
}

export async function changePassword(newPassword: string) {
  const user = await getPayload();
  const targetUser = db
    .select()
    .from(users)
    .where(eq(users.id, user!.id))
    .get();
  if (!targetUser) throw new Error("User not found");
  const hashedPassword = await hashPassword(newPassword);
  db.update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, user!.id))
    .run();
  return true;
}
