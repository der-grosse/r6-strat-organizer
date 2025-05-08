"use server";
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
  const activeStrat = ActiveStratDB.getActiveStrat(user!);
  return activeStrat;
}

export async function setActive(user: JWTPayload, newStrat: Strat["id"]) {
  ActiveStratDB.setActiveStrat(user, newStrat);
}
