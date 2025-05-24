import { and, eq, inArray, is, min, sql } from "drizzle-orm";
import db from "../db/db";
import {
  pickedOperators,
  placedAssets,
  rotationIndexes,
  strats,
} from "../db/schema";
import { PLAYER_COUNT } from "../static/general";

class StratsDBClass {
  async create(user: JWTPayload, strat: Strat): Promise<number> {
    const { lastInsertRowid } = db
      .insert(strats)
      .values({ ...strat, teamID: user.teamID })
      .run();

    const stratID = lastInsertRowid as number;

    db.insert(pickedOperators).values(
      Array.from({ length: PLAYER_COUNT }, () => ({
        operator: null,
        positionID: null,
        stratsID: stratID,
        isPowerOP: 0,
      }))
    );

    return stratID;
  }

  async list(user: JWTPayload): Promise<Strat[]> {
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
      .where(and(eq(strats.teamID, user.teamID), eq(strats.archived, 0)))
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

  async get(user: JWTPayload, id: Strat["id"]): Promise<Strat | null> {
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
    user: JWTPayload,
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
            positionID: op.positionID,
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
            showIcon: asset.type === "operator" ? (asset.showIcon ? 1 : 0) : 0,
            rotate: asset.type === "rotate" ? asset.variant : undefined,
            pickedOPID: asset.pickedOPID,
            width: asset.size.width,
            height: asset.size.height,
          })
          .run();
      }
    }

    return Promise.resolve(undefined);
  }

  updateAsset(user: JWTPayload, stratID: Strat["id"], asset: PlacedAsset) {
    const strat = db.select().from(strats).where(eq(strats.id, stratID)).all();
    if (strat[0]?.teamID !== user.teamID) throw new Error("Strat not found");
    db.update(placedAssets)
      .set({
        assetID: asset.id,
        positionX: asset.position.x,
        positionY: asset.position.y,
        customColor: asset.customColor,
        type: asset.type,
        gadget: asset.type === "gadget" ? asset.gadget : undefined,
        operator: asset.type === "operator" ? asset.operator : undefined,
        side: asset.type === "operator" ? asset.side : undefined,
        showIcon: asset.type === "operator" ? (asset.showIcon ? 1 : 0) : 0,
        rotate: asset.type === "rotate" ? asset.variant : undefined,
        pickedOPID: asset.pickedOPID,
        width: asset.size.width,
        height: asset.size.height,
      })
      .where(
        and(
          eq(placedAssets.stratsID, stratID),
          eq(placedAssets.assetID, asset.id)
        )
      )
      .run();
  }

  addAsset(user: JWTPayload, stratID: Strat["id"], asset: PlacedAsset) {
    const strat = db.select().from(strats).where(eq(strats.id, stratID)).all();
    if (strat[0]?.teamID !== user.teamID) throw new Error("Strat not found");
    db.insert(placedAssets)
      .values({
        assetID: asset.id,
        positionX: asset.position.x,
        positionY: asset.position.y,
        customColor: asset.customColor,
        stratsID: stratID,
        type: asset.type,
        gadget: asset.type === "gadget" ? asset.gadget : undefined,
        operator: asset.type === "operator" ? asset.operator : undefined,
        side: asset.type === "operator" ? asset.side : undefined,
        showIcon: asset.type === "operator" ? (asset.showIcon ? 1 : 0) : 0,
        rotate: asset.type === "rotate" ? asset.variant : undefined,
        pickedOPID: asset.pickedOPID,
        width: asset.size.width,
        height: asset.size.height,
      })
      .run();
  }

  deleteAssets(
    user: JWTPayload,
    stratID: Strat["id"],
    assetIDs: PlacedAsset["id"][]
  ) {
    const strat = db.select().from(strats).where(eq(strats.id, stratID)).all();
    if (strat[0]?.teamID !== user.teamID) throw new Error("Strat not found");
    db.delete(placedAssets)
      .where(
        and(
          eq(placedAssets.stratsID, stratID),
          inArray(placedAssets.assetID, assetIDs)
        )
      )
      .run();
  }

  async archive(user: JWTPayload, id: Strat["id"]): Promise<void> {
    db.update(strats)
      .set({ archived: 1 })
      .where(and(eq(strats.id, id), eq(strats.teamID, user.teamID)))
      .run();
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
      pickedOPID: number | null;
      customColor: string | null;
      type: string;
      operator: string | null;
      side: "att" | "def" | null;
      showIcon: number | null;
      gadget: string | null;
      rotate: string | null;
      width: number;
      height: number;
    }[];
    pickedOperators: {
      id: number;
      operator: string | null;
      positionID: number | null;
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
          size: { width: r.width, height: r.height },
          pickedOPID: r.pickedOPID,
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
                  showIcon: r.showIcon === 1,
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
          id: r.id,
          operator: r.operator ?? undefined,
          positionID: r.positionID ?? undefined,
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
