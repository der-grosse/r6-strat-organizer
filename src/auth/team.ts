"use server";
import { and, eq } from "drizzle-orm";
import db from "../db/db";
import { playerPositions, team, users } from "../db/schema";
import { getPayload } from "./getPayload";
import { revalidatePath } from "next/cache";
import { hashPassword, resetJWT } from "./auth";
import { PLAYER_COUNT } from "../static/general";

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

      await tx.insert(playerPositions).values(
        Array.from({ length: PLAYER_COUNT }, (_, i) => ({
          playerID: null,
          positionName: `Position ${i + 1}`,
          teamID,
        }))
      );
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Internal server error" };
  }
}

export async function getTeam() {
  const user = await getPayload();
  const teamData = db
    .select()
    .from(team)
    .where(eq(team.id, user!.teamID))
    .get();
  const positionData = db
    .select()
    .from(playerPositions)
    .where(eq(playerPositions.teamID, user!.teamID))
    .all();
  const membersData = db
    .select()
    .from(users)
    .where(eq(users.teamID, user!.teamID))
    .all();
  return {
    ...teamData,
    playerPositions: positionData.map((pos) => ({
      id: pos.id,
      playerID: pos.playerID,
      positionName: pos.positionName,
    })),
    members: membersData.map((member) => ({
      id: member.id,
      name: member.name,
      defaultColor: member.defaultColor,
      createdAt: member.createdAt,
      isAdmin: member.isAdmin === 1,
      positionID:
        positionData.find((pos) => pos.playerID === member.id)?.id || null,
    })),
  } as Team;
}

export async function removeMember(userID: number) {
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

  // team page
  revalidatePath("/team");
  // editor
  revalidatePath("/editor");

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

  // team page
  revalidatePath("/team");

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

  // team page
  revalidatePath("/team");

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

  // team page
  revalidatePath("/team");
  // sidebar
  revalidatePath("/", "layout");

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

export async function setMemberColor(color: string, userID?: TeamMember["id"]) {
  if (!color) throw new Error("Color is required");
  const user = await getPayload();
  if (!user) throw new Error("User not found");
  if (!userID) userID = user!.id;
  if (userID !== user.id && !user.isAdmin)
    throw new Error("Only admins can set user color");
  const targetUser = db.select().from(users).where(eq(users.id, userID)).get();
  if (!targetUser) throw new Error("User not found");
  if (targetUser.teamID !== user.teamID)
    throw new Error("User must be in the same team");
  db.update(users)
    .set({ defaultColor: color })
    .where(eq(users.id, userID))
    .run();

  // team page
  revalidatePath("/team");
  // editor
  revalidatePath("/editor");
}

export async function setMemberPosition(
  positionID: PlayerPosition["id"],
  memberID: TeamMember["id"] | null
) {
  const user = await getPayload();
  if (!user) throw new Error("User not found");
  if (!user.isAdmin) throw new Error("Only admins can set user position");
  if (memberID) {
    const targetUser = db
      .select()
      .from(users)
      .where(eq(users.id, memberID))
      .get();
    if (!targetUser) throw new Error("User not found");
    if (targetUser.teamID !== user.teamID)
      throw new Error("User must be in the same team");
  }
  db.update(playerPositions)
    .set({ playerID: memberID })
    .where(
      and(
        eq(playerPositions.id, positionID),
        eq(playerPositions.teamID, user.teamID)
      )
    )
    .run();

  // team page
  revalidatePath("/team");
  // editor
  revalidatePath("/editor");
}

export async function setMemberPositionName(
  positionID: PlayerPosition["id"],
  positionName: string
) {
  const user = await getPayload();
  if (!user) throw new Error("User not found");
  if (!user.isAdmin) throw new Error("Only admins can set user position name");
  db.update(playerPositions)
    .set({ positionName })
    .where(
      and(
        eq(playerPositions.id, positionID),
        eq(playerPositions.teamID, user.teamID)
      )
    )
    .run();

  // team page
  revalidatePath("/team");
  // editor
  revalidatePath("/editor");
}
