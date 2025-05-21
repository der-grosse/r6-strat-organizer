"use server";
import { eq } from "drizzle-orm";
import db from "../db";
import { teamInvites } from "../db/schema";
import { generate } from "random-words";
import { getPayload } from "./getPayload";
import { revalidatePath } from "next/cache";

export async function getInviteKeys() {
  const user = await getPayload();
  if (!user?.isAdmin) throw new Error("Only admins can get invite keys");
  return db
    .select()
    .from(teamInvites)
    .where(eq(teamInvites.teamID, user.teamID))
    .all();
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

  // team page
  revalidatePath("/team");

  return inviteKey;
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

  // team page
  revalidatePath("/team");

  return true;
}
