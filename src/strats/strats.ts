"use server";

import db from "@/src/db/db";
import { strats } from "@/src/db/schema";
import { getPayload } from "@/src/auth/getPayload";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import StratsDB from "./stratsDB";
import ActiveStratDB from "./activeStrat";

export async function createStrat(data: {
  map: string;
  site: string;
  name: string;
  description: string;
  drawingID: string;
}) {
  try {
    const session = await getPayload();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const { map, site, name, description, drawingID } = data;

    const [newStrat] = await db
      .insert(strats)
      .values({
        map,
        site,
        name,
        description,
        drawingID,
        teamID: session.teamID,
      })
      .returning();

    revalidatePath("/", "layout");

    return { success: true, data: newStrat };
  } catch (error) {
    console.error("Error creating strat:", error);
    return { success: false, error: "Failed to create strat" };
  }
}

export async function deleteStrat(stratId: number) {
  try {
    const session = await getPayload();
    if (!session) {
      throw new Error("Unauthorized");
    }

    // Delete the strat
    await db.delete(strats).where(eq(strats.id, stratId));

    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Error deleting strat:", error);
    return { success: false, error: "Failed to delete strat" };
  }
}

export async function getAllStrats() {
  const user = await getPayload();
  return StratsDB.list(user!);
}

export async function getStrat(id: number) {
  const user = await getPayload();
  const strat = await StratsDB.get(user!, id);

  return strat;
}

export async function getActive() {
  const user = await getPayload();
  const activeStrat = await ActiveStratDB.getActiveStrat(user!);
  return activeStrat;
}

export async function setActive(newStrat: Strat["id"]) {
  const user = await getPayload();
  await ActiveStratDB.setActiveStrat(user!, newStrat);
}

export async function updateStrat(
  updatedStrat: Partial<Strat> & Pick<Strat, "id">
) {
  const user = await getPayload();
  await StratsDB.update(user!, updatedStrat);

  revalidatePath(`/editor/${updatedStrat.id}`);
  revalidatePath("/strats");
  revalidatePath(`/strat/${updatedStrat.id}`);
  revalidatePath("/", "layout");
}
