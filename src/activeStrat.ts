import { eq } from "drizzle-orm";
import db from "./db";
import { activeStrat } from "./db/schema";
import StratsDB from "./stratsDB";

class ActiveStratClass {
  async setActiveStrat(user: JWTPayload, stratID: Strat["id"]) {
    db.update(activeStrat)
      .set({ stratID })
      .where(eq(activeStrat.teamID, user.teamID))
      .run();
  }

  async getActiveStrat(user: JWTPayload): Promise<Strat | null> {
    const active = db
      .select()
      .from(activeStrat)
      .where(eq(activeStrat.teamID, user.teamID))
      .get();
    if (!active?.stratID) return null;
    return await StratsDB.get(active.stratID);
  }
}

const ActiveStratDB = new ActiveStratClass();

export default ActiveStratDB;
