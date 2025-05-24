"use server";

import db from "@/src/db/db";
import {
  pickedOperators,
  placedAssets,
  playerPositions,
  strats,
} from "@/src/db/schema";
import { getPayload } from "@/src/auth/getPayload";
import { eq, is } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import StratsDB from "./stratsDB";
import ActiveStratDB from "./activeStrat";
import { PLAYER_COUNT } from "../static/general";

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

    const positions = db
      .select()
      .from(playerPositions)
      .where(eq(playerPositions.teamID, session.teamID))
      .all();

    db.insert(pickedOperators)
      .values(
        Array.from({ length: PLAYER_COUNT }, (_, i) => ({
          isPowerOP: 0,
          operator: null,
          positionID: positions[i]?.id,
          stratsID: newStrat.id,
        }))
      )
      .run();

    revalidatePath("/", "layout");

    return { success: true, data: newStrat };
  } catch (error) {
    console.error("Error creating strat:", error);
    return { success: false, error: "Failed to create strat" };
  }
}

export async function archiveStrat(stratId: number) {
  try {
    const session = await getPayload();
    if (!session) {
      throw new Error("Unauthorized");
    }

    StratsDB.archive(session, stratId);

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

export async function updateStratAssets(
  stratID: Strat["id"],
  asset: PlacedAsset[]
) {
  const user = await getPayload();
  for (const a of asset) {
    StratsDB.updateAsset(user!, stratID, a);
  }

  revalidatePath(`/editor/${stratID}`);
  revalidatePath("/strats");
  revalidatePath(`/strat/${stratID}`);
  revalidatePath("/", "layout");
}

export async function deleteStratAssets(
  stratID: Strat["id"],
  assetIDs: PlacedAsset["id"][]
) {
  const user = await getPayload();
  StratsDB.deleteAssets(user!, stratID, assetIDs);

  revalidatePath(`/editor/${stratID}`);
  revalidatePath("/strats");
  revalidatePath(`/strat/${stratID}`);
  revalidatePath("/", "layout");
}

export async function addAsset(stratID: Strat["id"], asset: PlacedAsset) {
  const user = await getPayload();
  StratsDB.addAsset(user!, stratID, asset);

  revalidatePath(`/editor/${stratID}`);
  revalidatePath("/strats");
  revalidatePath(`/strat/${stratID}`);
  revalidatePath("/", "layout");
}

export async function updatePickedOperator(
  stratID: Strat["id"],
  operator: Partial<PickedOperator> & Pick<PickedOperator, "id">
) {
  const user = await getPayload();
  if (!user) throw new Error("User not found");
  if (!user.isAdmin) throw new Error("Only admins can set user position name");
  const strat = db.select().from(strats).where(eq(strats.id, stratID)).get();
  if (!strat) throw new Error("Strat not found");
  if (strat.teamID !== user.teamID)
    throw new Error("Strat must be in the same team");
  db.update(pickedOperators)
    .set({
      isPowerOP: operator.isPowerOP ? 1 : 0,
      operator: operator.operator,
      positionID: operator.positionID,
      stratsID: stratID,
    })
    .where(eq(pickedOperators.id, operator.id))
    .run();

  revalidatePath(`/editor/${stratID}`);
  revalidatePath("/strats");
  revalidatePath(`/strat/${stratID}`);
  revalidatePath("/", "layout");
}
