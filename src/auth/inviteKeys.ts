"use server";
import { eq } from "drizzle-orm";
import db from "../db/db";
import { teamInvites } from "../db/schema";
import { generate } from "random-words";
import { getPayload } from "./getPayload";
import { revalidatePath } from "next/cache";

export async function getInviteKeys() {
  const user = await getPayload();
  if (!user?.isAdmin) throw new Error("Only admins can get invite keys");
  return await db
    .select()
    .from(teamInvites)
    .where(eq(teamInvites.teamID, user.teamID));
}

export async function createInviteKey() {
  const user = await getPayload();
  if (!user?.isAdmin) throw new Error("Only admins can create invite keys");
  const inviteKey = generate({ exactly: 5, join: "-" });

  await db.insert(teamInvites).values({
    teamID: user.teamID,
    inviteKey,
  });

  // team page
  revalidatePath("/team");

  return inviteKey;
}

export async function deleteInviteKey(inviteKey: string) {
  const user = await getPayload();
  if (!user?.isAdmin) throw new Error("Only admins can delete invite keys");
  const [invite] = await db
    .select()
    .from(teamInvites)
    .where(eq(teamInvites.inviteKey, inviteKey));
  if (!invite) return;
  if (invite.teamID !== user.teamID || invite.usedAt)
    throw new Error("Invalid request");
  await db.delete(teamInvites).where(eq(teamInvites.inviteKey, inviteKey));

  // team page
  revalidatePath("/team");

  return true;
}
