import { and, eq, inArray, is, min, sql } from "drizzle-orm";
import db from "../db/db";
import {
  pickedOperators,
  placedAssets,
  rotationIndexes,
  strats,
} from "../db/schema";

class StratsDBClass {
  async create(user: User, strat: Strat): Promise<number> {
    const { lastInsertRowid } = db
      .insert(strats)
      .values({ ...strat, teamID: user.teamID })
      .run();
    return lastInsertRowid as number;
  }

  async list(user: User): Promise<Strat[]> {
    const stratRows = db
      .select({
        id: strats.id,
        map: strats.map,
        site: strats.site,
        name: strats.name,
        description: strats.description,
        drawingID: strats.drawingID,
        rotationIndex: min(rotationIndexes.rotationIndex).as("rotationIndex"),
      })
      .from(strats)
      .leftJoin(rotationIndexes, eq(strats.id, rotationIndexes.stratsID))
      .where(eq(strats.teamID, user.teamID))
      .groupBy(strats.id)
      .orderBy(strats.map, sql`rotationIndex asc nulls last`, strats.site)
      .all();

    const stratsIDs = stratRows.map((strat) => strat.id);

    const rotationIndexRows = db
      .select()
      .from(rotationIndexes)
      .where(inArray(rotationIndexes.stratsID, stratsIDs))
      .all();
    const placedAssetsRows = db
      .select()
      .from(placedAssets)
      .where(inArray(placedAssets.stratsID, stratsIDs))
      .all();
    const pickedOperatorsRows = db
      .select()
      .from(pickedOperators)
      .where(inArray(pickedOperators.stratsID, stratsIDs))
      .all();

    return this.parseStratRows({
      strat: stratRows,
      rotationIndexes: rotationIndexRows,
      placedAssets: placedAssetsRows,
      pickedOperators: pickedOperatorsRows,
    });
  }

  async get(user: User, id: Strat["id"]): Promise<Strat | null> {
    const stratRows = db
      .select()
      .from(strats)
      .where(and(eq(strats.id, id), eq(strats.teamID, user.teamID)))
      .all();

    if (stratRows.length === 0) return null;

    const rotationIndexRows = db
      .select()
      .from(rotationIndexes)
      .where(eq(rotationIndexes.stratsID, id))
      .all();
    const placedAssetsRows = db
      .select()
      .from(placedAssets)
      .where(eq(placedAssets.stratsID, id))
      .all();
    const pickedOperatorsRows = db
      .select()
      .from(pickedOperators)
      .where(eq(pickedOperators.stratsID, id))
      .all();

    return (
      this.parseStratRows({
        strat: stratRows,
        rotationIndexes: rotationIndexRows,
        placedAssets: placedAssetsRows,
        pickedOperators: pickedOperatorsRows,
      })[0] ?? null
    );
  }

  update(
    user: User,
    updatedStrat: Partial<Strat> & Pick<Strat, "id">
  ): Promise<undefined> {
    const strat = this.get(user, updatedStrat.id);
    if (!strat) return Promise.reject(new Error("Strat not found"));
    const newStrat = { ...strat, ...updatedStrat };
    db.update(strats).set(newStrat).where(eq(strats.id, updatedStrat.id)).run();

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

    if (updatedStrat.operators) {
      db.delete(pickedOperators)
        .where(eq(pickedOperators.stratsID, updatedStrat.id))
        .run();
      for (const op of updatedStrat.operators) {
        db.insert(pickedOperators)
          .values({
            operator: op.operator,
            stratsID: updatedStrat.id,
            player: op.player,
            isPowerOP: op.isPowerOP ? 1 : 0,
          })
          .run();
      }
    }

    if (updatedStrat.assets) {
      db.delete(placedAssets).where(eq(placedAssets.id, updatedStrat.id)).run();
      for (const asset of updatedStrat.assets) {
        db.insert(placedAssets)
          .values({
            assetID: asset.id,
            positionX: asset.position.x,
            positionY: asset.position.y,
            customColor: asset.customColor,
            stratsID: updatedStrat.id,
            type: asset.type,
            gadget: asset.type === "gadget" ? asset.gadget : undefined,
            operator: asset.type === "operator" ? asset.operator : undefined,
            side: asset.type === "operator" ? asset.side : undefined,
            rotate: asset.type === "rotate" ? asset.variant : undefined,
            player: asset.player,
          })
          .run();
      }
    }

    return Promise.resolve(undefined);
  }

  async delete(id: Strat["id"]): Promise<void> {
    db.delete(strats).where(eq(strats.id, id)).run();
  }

  private parseStratRows(data: {
    strat: {
      id: number;
      map: string;
      site: string;
      name: string;
      description: string;
      drawingID: string;
    }[];
    rotationIndexes: {
      rotationIndex: number;
      stratsID: number;
    }[];
    placedAssets: {
      id: number;
      stratsID: number;
      assetID: string;
      positionX: number;
      positionY: number;
      player: number | null;
      customColor: string | null;
      type: string;
      operator: string | null;
      side: "att" | "def" | null;
      gadget: string | null;
      rotate: string | null;
    }[];
    pickedOperators: {
      operator: string;
      player: number | null;
      stratsID: number;
      isPowerOP: number;
    }[];
  }): Strat[] {
    const parsedStrats: Strat[] = [];
    for (const row of data.strat) {
      const rotationIndexes = data.rotationIndexes
        .filter((r) => r.stratsID === row.id)
        .map((r) => r.rotationIndex);
      const placedAssets = data.placedAssets
        .filter((r) => r.stratsID === row.id)
        .map((r) => ({
          id: r.assetID,
          position: { x: r.positionX, y: r.positionY },
          player: r.player,
          customColor: r.customColor,
          type: r.type,
          ...(() => {
            switch (r.type) {
              case "gadget":
                return {
                  gadget: r.gadget,
                };
              case "operator":
                return {
                  operator: r.operator,
                  side: r.side,
                };
              case "rotate":
                return {
                  variant: r.rotate,
                };
              default:
                return {};
            }
          })(),
        })) as PlacedAsset[];
      const operators = data.pickedOperators
        .filter((r) => r.stratsID === row.id)
        .map((r) => ({
          operator: r.operator,
          player: r.player ?? undefined,
          isPowerOP: r.isPowerOP === 1,
        }));

      parsedStrats.push({
        id: row.id,
        map: row.map,
        site: row.site,
        name: row.name,
        description: row.description,
        drawingID: row.drawingID,
        rotationIndex: rotationIndexes,
        assets: placedAssets,
        operators,
      });
    }

    return parsedStrats;
  }
}

const StratsDB = new StratsDBClass();

export default StratsDB;
