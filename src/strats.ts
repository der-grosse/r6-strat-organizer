"use server";
import StratsDB from "./db";

export async function getAllStrats() {
  return StratsDB.list();
}

let currentStrat: Strat | null = null;

export async function getActive() {
  return currentStrat;
}

export async function setActive(newStrat: Strat) {
  currentStrat = newStrat;
}
