"use server";
import StratsDB from "./db";

export async function getAllStrats() {
  return StratsDB.list();
}

export async function getStrat(id: number) {
  const strat = StratsDB.get(id);

  return strat;
}

let currentStrat: Strat | null = null;

export async function getActive() {
  return currentStrat;
}

export async function setActive(newStrat: Strat) {
  currentStrat = newStrat;
}
