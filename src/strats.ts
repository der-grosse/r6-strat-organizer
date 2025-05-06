"use server";
import ActiveStratDB from "./activeStrat";
import StratsDB from "./db";

export async function getAllStrats() {
  return StratsDB.list();
}

export async function getStrat(id: number) {
  const strat = StratsDB.get(id);

  return strat;
}

export async function getActive() {
  const activeStrat = ActiveStratDB.getActiveStrat();
  return activeStrat;
}

export async function setActive(newStrat: Strat) {
  ActiveStratDB.setActiveStrat(newStrat);
}
