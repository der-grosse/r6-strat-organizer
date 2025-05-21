import { and, eq, sql } from "drizzle-orm";
import db from "./db";
import { powerOPs, rotationIndexes, strats } from "./db/schema";

class StratsDBClass {
  async create(user: User, strat: Strat): Promise<number> {
    const { lastInsertRowid } = db
      .insert(strats)
      .values({ ...strat, teamID: user.teamID })
      .run();
    return lastInsertRowid as number;
  }

  async list(user: User): Promise<Strat[]> {
    const data = db
      .select()
      .from(strats)
      .leftJoin(powerOPs, eq(strats.id, powerOPs.stratsID))
      .leftJoin(rotationIndexes, eq(strats.id, rotationIndexes.stratsID))
      .where(eq(strats.teamID, user.teamID))
      .orderBy(
        strats.map,
        sql`${rotationIndexes.rotationIndex} asc nulls last`,
        strats.site
      )
      .all();

    return this.parseStratRows(data);
  }

  async get(user: User, id: Strat["id"]): Promise<Strat | null> {
    const data = db
      .select()
      .from(strats)
      .leftJoin(powerOPs, eq(strats.id, powerOPs.stratsID))
      .leftJoin(rotationIndexes, eq(strats.id, rotationIndexes.stratsID))
      .where(and(eq(strats.id, id), eq(strats.teamID, user.teamID)))
      .all();

    if (data.length === 0) return null;
    return this.parseStratRows(data)[0] ?? null;
  }

  update(
    user: User,
    updatedStrat: Partial<Strat> & Pick<Strat, "id">
  ): Promise<undefined> {
    const strat = this.get(user, updatedStrat.id);
    if (!strat) return Promise.reject(new Error("Strat not found"));
    const newStrat = { ...strat, ...updatedStrat };
    db.update(strats).set(newStrat).where(eq(strats.id, updatedStrat.id)).run();

    if (updatedStrat.powerOPs) {
      db.delete(powerOPs).where(eq(powerOPs.stratsID, updatedStrat.id)).run();
      for (const op of updatedStrat.powerOPs ?? []) {
        db.insert(powerOPs).values({ op, stratsID: updatedStrat.id }).run();
      }
    }

    if (updatedStrat.rotationIndex) {
      db.delete(rotationIndexes)
        .where(eq(rotationIndexes.stratsID, updatedStrat.id))
        .run();
      for (const rotationIndex of updatedStrat.rotationIndex) {
        db.insert(rotationIndexes)
          .values({ rotationIndex, stratsID: updatedStrat.id })
          .run();
      }
    }

    return Promise.resolve(undefined);
  }

  async delete(id: Strat["id"]): Promise<void> {
    db.delete(strats).where(eq(strats.id, id)).run();
  }

  private parseStratRows(
    rows: {
      strats: {
        id: number;
        map: string;
        site: string;
        name: string;
        description: string;
        drawingID: string;
      };
      power_ops: {
        op: string;
        stratsID: number;
      } | null;
      rotation_indexes: {
        rotationIndex: number;
        stratsID: number;
      } | null;
    }[]
  ): Strat[] {
    const parsedStrats: Strat[] = [];
    for (const row of rows) {
      const strat = parsedStrats.find((strat) => strat.id === row.strats.id);
      if (strat) {
        if (row.power_ops && !strat.powerOPs?.includes(row.power_ops.op)) {
          strat.powerOPs.push(row.power_ops.op);
        }
        if (row.rotation_indexes?.rotationIndex) {
          if (!strat.rotationIndex) {
            strat.rotationIndex = [];
          }
          if (
            !strat.rotationIndex.includes(row.rotation_indexes.rotationIndex)
          ) {
            strat.rotationIndex.push(row.rotation_indexes.rotationIndex);
          }
        }
      } else {
        parsedStrats.push({
          id: row.strats.id,
          map: row.strats.map,
          site: row.strats.site,
          name: row.strats.name,
          description: row.strats.description,
          drawingID: row.strats.drawingID,
          powerOPs: row.power_ops ? [row.power_ops.op] : [],
          rotationIndex: row.rotation_indexes?.rotationIndex
            ? [row.rotation_indexes.rotationIndex]
            : [],
        });
      }
    }

    return parsedStrats;
  }
}

const StratsDB = new StratsDBClass();

export default StratsDB;
