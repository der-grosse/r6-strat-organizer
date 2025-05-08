"use server";
import { eq } from "drizzle-orm";
import db from "../db";
import { team, teamInvites, users } from "../db/schema";
import * as bcrypt from "bcrypt-ts";
import { cookies } from "next/headers";
import { generateJWT } from "./jwt";

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

  (await cookies()).set("jwt", await generateJWT(user), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return user;
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
  if (!invite) throw new Error("Invalid invite key");
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

export async function getTeamName(teamID: number) {
  const teamData = db.select().from(team).where(eq(team.id, teamID)).get();
  return teamData?.name;
}
