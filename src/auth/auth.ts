"use server";
import { eq } from "drizzle-orm";
import db from "../db";
import { teamInvites, users } from "../db/schema";
import * as bcrypt from "bcrypt-ts";
import { cookies } from "next/headers";
import { generateJWT } from "./jwt";

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
  async function hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

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
