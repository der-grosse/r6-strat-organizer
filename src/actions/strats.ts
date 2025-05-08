"use server";

import db from "@/src/db";
import { strats, powerOPs } from "@/src/db/schema";
import { getPayload } from "@/src/auth/getPayload";
import { eq } from "drizzle-orm";

export async function createStrat(data: {
  map: string;
  site: string;
  name: string;
  description: string;
  drawingID: string;
  powerOPs: string[];
  teamID: number;
}) {
  try {
    const session = await getPayload();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const {
      map,
      site,
      name,
      description,
      drawingID,
      powerOPs: ops,
      teamID,
    } = data;

    const [newStrat] = await db
      .insert(strats)
      .values({
        map,
        site,
        name,
        description,
        drawingID,
        teamID,
      })
      .returning();

    // Insert power operators
    if (ops && ops.length > 0) {
      await db.insert(powerOPs).values(
        ops.map((op: string) => ({
          op,
          stratsID: newStrat.id,
        }))
      );
    }

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

    return { success: true };
  } catch (error) {
    console.error("Error deleting strat:", error);
    return { success: false, error: "Failed to delete strat" };
  }
}
