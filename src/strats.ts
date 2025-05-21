"use server";
import { revalidatePath } from "next/cache";
import ActiveStratDB from "./activeStrat";
import { getPayload } from "./auth/getPayload";
import StratsDB from "./stratsDB";

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

  revalidatePath("/editor/[id]");
  revalidatePath("/strats");
  revalidatePath("/strat/[id]");
}
