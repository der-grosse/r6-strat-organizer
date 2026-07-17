import { v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { requireUser } from "./auth";
import { Doc, Id } from "./_generated/dataModel";
import { Strat, StratFilter } from "../lib/types/strat.types";
import { PlacedAsset } from "../lib/types/asset.types";
import { DefenderSecondaryGadgetID } from "../lib/static/operator";
import { stratFilter } from "./schema";

// Reads must tolerate the legacy attacker/defender pair until every stored doc has
// been through migration.migrateStratFilters.
function normalizeFilters(filters: Doc<"strats">["filters"]): StratFilter[] {
  if (!filters) return [];
  if (Array.isArray(filters)) return filters;
  return [filters.attackers, filters.defenders].filter((filter) => filter !== undefined);
}

export const get = query({
  args: {
    id: v.id("strats"),
  },
  async handler(ctx, { id }) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) return null;

    return await getStrat(ctx, id as Id<"strats">);
  },
});

export const list = query({
  args: {
    map: v.optional(v.nullable(v.string())),
    site: v.optional(v.nullable(v.string())),
    showArchived: v.optional(v.nullable(v.boolean())),
  },
  async handler(ctx, { map, site, showArchived }) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) return [];
    let strats: Doc<"strats">[] = [];
    if (site && map) {
      strats = await ctx.db
        .query("strats")
        .withIndex("byTeamMapAndSite", (q) =>
          q.eq("teamID", activeTeamID).eq("map", map).eq("site", site),
        )
        .collect();
    } else if (map) {
      strats = await ctx.db
        .query("strats")
        .withIndex("byTeamAndMap", (q) => q.eq("teamID", activeTeamID).eq("map", map))
        .collect();
    } else {
      strats = await ctx.db
        .query("strats")
        .withIndex("byTeam", (q) => q.eq("teamID", activeTeamID))
        .collect();
    }

    if (!showArchived) {
      strats = strats.filter((strat) => !strat.archived);
    }

    const fullStrats: Strat[] = [];
    for (const strat of strats) {
      const stratPositions = await ctx.db
        .query("stratPositions")
        .withIndex("byStrat", (q) => q.eq("stratID", strat._id))
        .collect();

      const pickedOperators = await ctx.db
        .query("pickedOperators")
        .withIndex("byStrat", (q) => q.eq("stratID", strat._id))
        .collect();

      fullStrats.push({
        _id: strat._id,
        map: strat.map,
        site: strat.site,
        name: strat.name,
        description: strat.description,
        drawingID: strat.drawingID,
        archived: strat.archived,
        mapIndex: strat.mapIndex,
        hiddenFloors: strat.hiddenFloors || [],
        showFloorNames: strat.showFloorNames ?? true,
        filters: normalizeFilters(strat.filters),
        stratPositions: stratPositions
          .map((pos) => ({
            _id: pos._id,
            teamPositionID: pos.teamPositionID,
            isPowerPosition: pos.isPowerPosition,
            shouldBringShotgun: pos.shouldBringShotgun,
            fightsLongRange: pos.fightsLongRange ?? false,
            index: pos.index,
            pickedOperators: pickedOperators
              .filter((op) => op.stratPositionID === pos._id)
              .map((op) => ({
                _id: op._id,
                stratPositionID: op.stratPositionID,
                operator: op.operator,
                secondaryGadget: op.secondaryGadget as DefenderSecondaryGadgetID | undefined,
                tertiaryGadget: op.tertiaryGadget as DefenderSecondaryGadgetID | undefined,
                index: op.index,
              }))
              .sort((a, b) => a.index - b.index),
          }))
          .sort((a, b) => a.index - b.index),
      });
    }

    return fullStrats.sort((a, b) => a.map.localeCompare(b.map) || a.mapIndex - b.mapIndex);
  },
});

export async function getStrat(
  ctx: QueryCtx | MutationCtx,
  id: Id<"strats">,
): Promise<Strat | null> {
  const stratDoc = await ctx.db.get(id);
  if (!stratDoc) return null;

  const stratPositions = await ctx.db
    .query("stratPositions")
    .withIndex("byStrat", (q) => q.eq("stratID", id))
    .collect();

  const pickedOperators = await ctx.db
    .query("pickedOperators")
    .withIndex("byStrat", (q) => q.eq("stratID", id))
    .collect();

  return {
    _id: stratDoc._id,
    map: stratDoc.map,
    site: stratDoc.site,
    name: stratDoc.name,
    description: stratDoc.description,
    drawingID: stratDoc.drawingID,
    archived: stratDoc.archived,
    mapIndex: stratDoc.mapIndex,
    showFloorNames: stratDoc.showFloorNames ?? true,
    hiddenFloors: stratDoc.hiddenFloors || [],
    filters: normalizeFilters(stratDoc.filters),
    stratPositions: stratPositions
      .map((pos) => ({
        _id: pos._id,
        teamPositionID: pos.teamPositionID,
        isPowerPosition: pos.isPowerPosition,
        shouldBringShotgun: pos.shouldBringShotgun,
        fightsLongRange: pos.fightsLongRange ?? false,
        index: pos.index,
        pickedOperators: pickedOperators
          .filter((op) => op.stratPositionID === pos._id)
          .map((op) => ({
            _id: op._id,
            stratPositionID: op.stratPositionID,
            operator: op.operator,
            secondaryGadget: op.secondaryGadget as DefenderSecondaryGadgetID | undefined,
            tertiaryGadget: op.tertiaryGadget as DefenderSecondaryGadgetID | undefined,
            index: op.index,
          }))
          .sort((a, b) => a.index - b.index),
      }))
      .sort((a, b) => a.index - b.index),
  };
}

export const archive = mutation({
  args: {
    stratID: v.id("strats"),
  },
  async handler(ctx, { stratID }) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) {
      return { success: false, error: "No active team selected" };
    }
    const stratDoc = await ctx.db.get(stratID);
    if (!stratDoc || stratDoc.teamID !== activeTeamID) {
      return { success: false, error: "Strat not found" };
    }
    await ctx.db.patch(stratID, { archived: true, mapIndex: -1 });

    // fix map indexes for other strats on the same map
    const stratsOnMap = await ctx.db
      .query("strats")
      .withIndex("byTeamAndMap", (q) => q.eq("teamID", activeTeamID).eq("map", stratDoc.map))
      .collect();

    for (const strat of stratsOnMap) {
      if (strat._id !== stratID && strat.mapIndex > stratDoc.mapIndex) {
        await ctx.db.patch(strat._id, {
          mapIndex: strat.mapIndex - 1,
        });
      }
    }

    const activeStrat = await ctx.db
      .query("activeStrats")
      .withIndex("byTeam", (q) => q.eq("teamID", activeTeamID))
      .first();
    if (activeStrat?.stratID === stratID) {
      await ctx.db.delete(activeStrat._id);
    }

    return { success: true };
  },
});

export const update = mutation({
  args: {
    _id: v.id("strats"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    map: v.optional(v.string()),
    site: v.optional(v.string()),
    drawingID: v.optional(v.nullable(v.string())),
    hiddenFloors: v.optional(v.array(v.number())),
    showFloorNames: v.optional(v.boolean()),
    filters: v.optional(v.nullable(v.array(stratFilter))),
  },
  async handler(ctx, args) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) {
      return { success: false, error: "No active team selected" };
    }

    const stratDoc = await ctx.db.get(args._id);
    if (!stratDoc || stratDoc.teamID !== activeTeamID) {
      return { success: false, error: "Strat not found" };
    }

    await ctx.db.patch(args._id, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.description !== undefined ? { description: args.description } : {}),
      ...(args.map !== undefined ? { map: args.map } : {}),
      ...(args.site !== undefined ? { site: args.site } : {}),
      ...(args.drawingID !== undefined
        ? { drawingID: args.drawingID ?? undefined } // when drawingID is null, we want to remove it
        : {}),
      ...(args.hiddenFloors !== undefined ? { hiddenFloors: args.hiddenFloors } : {}),
      ...(args.showFloorNames !== undefined ? { showFloorNames: args.showFloorNames } : {}),
      ...(args.filters !== undefined ? { filters: args.filters ?? undefined } : {}),
    });
    return { success: true };
  },
});

export const create = mutation({
  args: {
    map: v.string(),
    site: v.string(),
    name: v.string(),
    description: v.string(),
    drawingID: v.optional(v.nullable(v.string())),
    filters: v.optional(v.array(stratFilter)),
  },
  async handler(ctx, args) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) {
      return { success: false, error: "No active team selected" };
    }
    const mapStrats = await ctx.db
      .query("strats")
      .withIndex("byTeamAndMap", (q) => q.eq("teamID", activeTeamID).eq("map", args.map))
      .collect();

    const maxIndex = mapStrats.reduce(
      (max, strat) => (strat.mapIndex > max ? strat.mapIndex : max),
      -1,
    );

    const stratID = await ctx.db.insert("strats", {
      map: args.map,
      site: args.site,
      name: args.name,
      description: args.description,
      drawingID: args.drawingID ?? undefined,
      teamID: activeTeamID,
      archived: false,
      mapIndex: maxIndex + 1,
      hiddenFloors: [],
      showFloorNames: true,
      filters: args.filters,
    });

    // create strat positions for each team position
    const teamPositions = await ctx.db
      .query("teamPositions")
      .withIndex("byTeam", (q) => q.eq("teamID", activeTeamID))
      .collect();

    for (const teamPosition of teamPositions) {
      await ctx.db.insert("stratPositions", {
        stratID,
        teamPositionID: teamPosition._id,
        index: teamPosition.index,
        isPowerPosition: false,
        shouldBringShotgun: false,
        fightsLongRange: false,
      });
    }

    // check that five positions were created
    if (teamPositions.length < 5) {
      for (let i = teamPositions.length; i < 5; i++) {
        await ctx.db.insert("stratPositions", {
          stratID,
          teamPositionID: undefined,
          index: i,
          isPowerPosition: false,
          shouldBringShotgun: false,
          fightsLongRange: false,
        });
      }
    }

    return { success: true, stratID };
  },
});

export const createCopy = mutation({
  args: {
    stratID: v.id("strats"),
  },
  async handler(ctx, { stratID }) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) {
      return { success: false, error: "No active team selected" };
    }
    const stratDoc = await ctx.db.get(stratID);
    if (!stratDoc || stratDoc.teamID !== activeTeamID) {
      return { success: false, error: "Strat not found" };
    }

    const stratsOnMap = await ctx.db
      .query("strats")
      .withIndex("byTeamAndMap", (q) => q.eq("teamID", activeTeamID).eq("map", stratDoc.map))
      .collect();
    const mapIndex =
      stratsOnMap.reduce((max, strat) => (strat.mapIndex > max ? strat.mapIndex : max), -1) + 1;

    const stratPositions = await ctx.db
      .query("stratPositions")
      .withIndex("byStrat", (q) => q.eq("stratID", stratID))
      .collect();
    const pickedOperators = await ctx.db
      .query("pickedOperators")
      .withIndex("byStrat", (q) => q.eq("stratID", stratID))
      .collect();

    const placedAssets = await ctx.db
      .query("placedAssets")
      .withIndex("byStrat", (q) => q.eq("stratID", stratID))
      .collect();

    const newStratID = await ctx.db.insert("strats", {
      map: stratDoc.map,
      site: stratDoc.site,
      name: `${stratDoc.name} (Copy)`,
      description: stratDoc.description,
      drawingID: stratDoc.drawingID,
      archived: false,
      teamID: activeTeamID,
      mapIndex,
      hiddenFloors: stratDoc.hiddenFloors,
      showFloorNames: stratDoc.showFloorNames,
      filters: normalizeFilters(stratDoc.filters),
    });

    const stratPositionIDMap: Record<string, Id<"stratPositions">> = {};

    for (const pos of stratPositions) {
      const newPosID = await ctx.db.insert("stratPositions", {
        stratID: newStratID,
        teamPositionID: pos.teamPositionID,
        isPowerPosition: pos.isPowerPosition,
        shouldBringShotgun: pos.shouldBringShotgun,
        fightsLongRange: pos.fightsLongRange,
        index: pos.index,
      });
      stratPositionIDMap[pos._id] = newPosID;
    }

    for (const op of pickedOperators) {
      await ctx.db.insert("pickedOperators", {
        stratID: newStratID,
        stratPositionID: stratPositionIDMap[op.stratPositionID],
        operator: op.operator,
        secondaryGadget: op.secondaryGadget,
        tertiaryGadget: op.tertiaryGadget,
        index: op.index,
      });
    }

    for (const asset of placedAssets) {
      // Remove the _id field before inserting
      //@ts-ignore
      delete asset._id;
      //@ts-ignore
      delete asset._creationTime;
      await ctx.db.insert("placedAssets", {
        ...asset,
        stratID: newStratID,
        stratPositionID: asset.stratPositionID
          ? stratPositionIDMap[asset.stratPositionID]
          : undefined,
      });
    }
    return { success: true, stratID: newStratID };
  },
});

export const updateIndex = mutation({
  args: {
    stratID: v.id("strats"),
    newIndex: v.number(),
    orderedStratIDs: v.optional(v.array(v.id("strats"))),
  },
  async handler(ctx, { stratID, newIndex, orderedStratIDs }) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) {
      return { success: false, error: "No active team selected" };
    }

    const stratDoc = await ctx.db.get(stratID);
    if (!stratDoc || stratDoc.teamID !== activeTeamID) {
      return { success: false, error: "Strat not found" };
    }

    // resort all strats on the same map
    const stratsOnMap = (
      await ctx.db
        .query("strats")
        .withIndex("byTeamAndMap", (q) => q.eq("teamID", activeTeamID).eq("map", stratDoc.map))
        .collect()
    ).filter((s) => !s.archived);

    if (orderedStratIDs && orderedStratIDs.length > 0) {
      const stratById = new Map(stratsOnMap.map((strat) => [strat._id, strat]));
      const orderedSet = new Set(orderedStratIDs);

      if (orderedSet.size !== orderedStratIDs.length) {
        return {
          success: false,
          error: "Duplicate strat IDs in reorder payload",
        };
      }

      const visibleCount = stratsOnMap.filter((strat) => orderedSet.has(strat._id)).length;
      if (visibleCount !== orderedStratIDs.length) {
        return {
          success: false,
          error: "Reorder payload does not match current strat list",
        };
      }

      const reorderedStrats: Doc<"strats">[] = new Array(stratsOnMap.length);
      let visibleIndex = 0;

      for (let index = 0; index < stratsOnMap.length; index++) {
        const strat = stratsOnMap[index];
        if (!orderedSet.has(strat._id)) {
          reorderedStrats[index] = strat;
        }
      }

      for (let index = 0; index < reorderedStrats.length; index++) {
        if (reorderedStrats[index]) continue;

        const nextVisibleID = orderedStratIDs[visibleIndex++];
        const nextVisibleStrat = stratById.get(nextVisibleID);
        if (!nextVisibleStrat) {
          return {
            success: false,
            error: "Reorder payload contains an unknown strat",
          };
        }

        reorderedStrats[index] = nextVisibleStrat;
      }

      for (let index = 0; index < reorderedStrats.length; index++) {
        const strat = reorderedStrats[index];
        if (strat.mapIndex !== index) {
          await ctx.db.patch(strat._id, { mapIndex: index });
        }
      }

      return { success: true };
    }

    const oldIndex = stratDoc.mapIndex;

    // Update indexes
    for (const strat of stratsOnMap) {
      let updatedIndex = strat.mapIndex;
      if (strat._id === stratID) {
        updatedIndex = newIndex;
      } else if (oldIndex < newIndex) {
        // moved down
        if (strat.mapIndex > oldIndex && strat.mapIndex <= newIndex) {
          updatedIndex = strat.mapIndex - 1;
        }
      } else if (oldIndex > newIndex) {
        // moved up
        if (strat.mapIndex < oldIndex && strat.mapIndex >= newIndex) {
          updatedIndex = strat.mapIndex + 1;
        }
      }
      if (updatedIndex !== strat.mapIndex) {
        await ctx.db.patch(strat._id, { mapIndex: updatedIndex });
      }
    }
    return { success: true };
  },
});

// --------- Strat Positions ---------

export const updateStratPosition = mutation({
  args: {
    _id: v.id("stratPositions"),
    isPowerPosition: v.optional(v.boolean()),
    shouldBringShotgun: v.optional(v.boolean()),
    teamPositionID: v.optional(v.nullable(v.id("teamPositions"))),
    fightsLongRange: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) {
      return { success: false, error: "No active team selected" };
    }
    const stratPositionDoc = await ctx.db.get(args._id);
    if (!stratPositionDoc) {
      return { success: false, error: "Strat position not found" };
    }
    const stratDoc = await ctx.db.get(stratPositionDoc.stratID);
    if (!stratDoc || stratDoc.teamID !== activeTeamID) {
      return { success: false, error: "Strat not found" };
    }
    if (args.teamPositionID) {
      const currentStratPositions = await ctx.db
        .query("stratPositions")
        .withIndex("byStrat", (q) => q.eq("stratID", stratDoc._id))
        .collect();
      const positionAlreadyUsed = currentStratPositions.find(
        (pos) => pos.teamPositionID === args.teamPositionID && pos._id !== args._id,
      );
      if (positionAlreadyUsed) {
        await ctx.db.patch(positionAlreadyUsed._id, {
          teamPositionID: stratPositionDoc.teamPositionID,
        });
      }
    }
    await ctx.db.patch(args._id, {
      ...(args.isPowerPosition !== undefined ? { isPowerPosition: args.isPowerPosition } : {}),
      ...(args.shouldBringShotgun !== undefined
        ? { shouldBringShotgun: args.shouldBringShotgun }
        : {}),
      ...(args.teamPositionID !== undefined
        ? { teamPositionID: args.teamPositionID ?? undefined } // when null, remove it
        : {}),
      ...(args.fightsLongRange !== undefined ? { fightsLongRange: args.fightsLongRange } : {}),
    });
    return { success: true };
  },
});

// --------- Picked Operators ---------

export const updatePickedOperator = mutation({
  args: {
    pickedOperatorID: v.id("pickedOperators"),
    secondaryGadget: v.optional(v.nullable(v.string())),
    tertiaryGadget: v.optional(v.nullable(v.string())),
    operator: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) {
      return { success: false, error: "No active team selected" };
    }
    const pickedOperatorDoc = await ctx.db.get(args.pickedOperatorID);
    if (!pickedOperatorDoc) {
      return { success: false, error: "Picked operator not found" };
    }
    const stratDoc = await ctx.db.get(pickedOperatorDoc.stratID);
    if (!stratDoc || stratDoc.teamID !== activeTeamID) {
      return { success: false, error: "Strat not found" };
    }
    await ctx.db.patch(args.pickedOperatorID, {
      ...(args.secondaryGadget !== undefined
        ? { secondaryGadget: args.secondaryGadget ?? undefined }
        : {}),
      ...(args.tertiaryGadget !== undefined
        ? { tertiaryGadget: args.tertiaryGadget ?? undefined }
        : {}),
      ...(args.operator !== undefined ? { operator: args.operator } : {}),
    });
    return { success: true };
  },
});

export const updatePickedOperatorIndex = mutation({
  args: {
    stratPositionID: v.id("stratPositions"),
    pickedOperatorID: v.id("pickedOperators"),
    newIndex: v.number(),
  },
  async handler(ctx, args) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) {
      return { success: false, error: "No active team selected" };
    }
    const stratPositionDoc = await ctx.db.get(args.stratPositionID);
    if (!stratPositionDoc) {
      return { success: false, error: "Strat position not found" };
    }
    const stratDoc = await ctx.db.get(stratPositionDoc.stratID);
    if (!stratDoc || stratDoc.teamID !== activeTeamID) {
      return { success: false, error: "Strat not found" };
    }
    const pickedOperatorDoc = await ctx.db.get(args.pickedOperatorID);
    if (!pickedOperatorDoc || pickedOperatorDoc.stratPositionID !== args.stratPositionID) {
      return {
        success: false,
        error: "Picked operator not found in strat position",
      };
    }
    // Fetch all picked operators for the strat position
    const pickedOperators = (
      await ctx.db
        .query("pickedOperators")
        .withIndex("byStratPosition", (q) => q.eq("stratPositionID", args.stratPositionID))
        .collect()
    ).sort((a, b) => a.index - b.index); // enforce deterministic ordering

    // Find the current index of the picked operator
    const currentIndex = pickedOperators.findIndex((op) => op._id === args.pickedOperatorID);
    if (currentIndex === -1) {
      return {
        success: false,
        error: "Picked operator not found in strat position",
      };
    }

    // Move the picked operator to the new index
    const newIndex = args.newIndex;
    if (newIndex < 0 || newIndex >= pickedOperators.length) {
      return { success: false, error: "Invalid new index" };
    }

    const updatedOperators = [...pickedOperators];
    const [movedOperator] = updatedOperators.splice(currentIndex, 1);
    updatedOperators.splice(newIndex, 0, movedOperator);

    // Update the index of each picked operator
    for (let i = 0; i < updatedOperators.length; i++) {
      const op = updatedOperators[i];
      if (op.index !== i) {
        await ctx.db.patch(op._id, { index: i });
      }
    }

    return { success: true };
  },
});

export const deletePickedOperator = mutation({
  args: {
    pickedOperatorID: v.id("pickedOperators"),
  },
  async handler(ctx, { pickedOperatorID }) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) {
      return { success: false, error: "No active team selected" };
    }
    const pickedOperatorDoc = await ctx.db.get(pickedOperatorID);
    if (!pickedOperatorDoc) {
      return { success: false, error: "Picked operator not found" };
    }
    const stratDoc = await ctx.db.get(pickedOperatorDoc.stratID);
    if (!stratDoc || stratDoc.teamID !== activeTeamID) {
      return { success: false, error: "Strat not found" };
    }
    await ctx.db.delete(pickedOperatorID);
    return { success: true };
  },
});

export const createPickedOperator = mutation({
  args: {
    stratPositionID: v.id("stratPositions"),
    operator: v.string(),
  },
  async handler(ctx, { stratPositionID, operator }) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) {
      return { success: false, error: "No active team selected" };
    }
    const stratPositionDoc = await ctx.db.get(stratPositionID);
    if (!stratPositionDoc) {
      return { success: false, error: "Strat position not found" };
    }
    const stratDoc = await ctx.db.get(stratPositionDoc.stratID);
    if (!stratDoc || stratDoc.teamID !== activeTeamID) {
      return { success: false, error: "Strat not found" };
    }
    const existingOperators = await ctx.db
      .query("pickedOperators")
      .withIndex("byStratPosition", (q) => q.eq("stratPositionID", stratPositionID))
      .collect();
    const newIndex =
      existingOperators.reduce((max, op) => (op.index > max ? op.index : max), -1) + 1;
    const pickedOperatorID = await ctx.db.insert("pickedOperators", {
      stratID: stratDoc._id,
      stratPositionID: stratPositionID,
      operator,
      index: newIndex,
    });
    return { success: true, pickedOperatorID };
  },
});

// --------- Placed Assets ---------

export const getAssets = query({
  args: {
    stratID: v.id("strats"),
  },
  async handler(ctx, { stratID }) {
    const placedAssets = await ctx.db
      .query("placedAssets")
      .withIndex("byStrat", (q) => q.eq("stratID", stratID))
      .collect();
    return placedAssets.map(
      (asset) =>
        ({
          _id: asset._id,
          stratPositionID: asset.stratPositionID,
          customColor: asset.customColor,

          type: asset.type,
          variant: asset.variant,
          operator: asset.operator,
          iconType: asset.iconType,
          gadget: asset.gadget,
          placedOn: asset.placedOn,
          text: asset.text,
          fontSize: asset.fontSize,
          background: asset.background,
          startCorner: asset.startCorner,
          startArrowHead: asset.startArrowHead,
          endArrowHead: asset.endArrowHead,
          url: asset.url,

          position: { x: asset.posX, y: asset.posY },
          size: { width: asset.width, height: asset.height },
          rotation: asset.rotation,
        }) as PlacedAsset,
    );
  },
});

export const addAsset = mutation({
  args: {
    stratID: v.id("strats"),
    type: v.string(),
    posX: v.number(),
    posY: v.number(),
    width: v.number(),
    height: v.number(),
    rotation: v.number(),
    stratPositionID: v.optional(v.nullable(v.id("stratPositions"))),
    pickedOperatorID: v.optional(v.nullable(v.id("pickedOperators"))),
    customColor: v.optional(v.nullable(v.string())),

    variant: v.optional(v.string()),
    operator: v.optional(v.string()),
    iconType: v.optional(v.string()),
    gadget: v.optional(v.string()),
    placedOn: v.optional(v.nullable(v.string())),
    text: v.optional(v.string()),
    fontSize: v.optional(v.number()),
    background: v.optional(v.string()),
    startCorner: v.optional(v.string()),
    startArrowHead: v.optional(v.boolean()),
    endArrowHead: v.optional(v.boolean()),
    url: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) {
      return { success: false, error: "No active team selected" };
    }
    const stratDoc = await ctx.db.get(args.stratID);
    if (!stratDoc || stratDoc.teamID !== activeTeamID) {
      return { success: false, error: "Strat not found" };
    }
    const placedAssetID = await ctx.db.insert("placedAssets", {
      stratID: args.stratID,
      posX: args.posX,
      posY: args.posY,
      width: args.width,
      height: args.height,
      rotation: args.rotation,
      stratPositionID: args.stratPositionID ?? undefined,
      pickedOperatorID: args.pickedOperatorID ?? undefined,
      customColor: args.customColor ?? undefined,
      type: args.type,
      variant: args.variant,
      operator: args.operator,
      iconType: args.iconType,
      gadget: args.gadget,
      placedOn: args.placedOn ?? undefined,
      text: args.text,
      fontSize: args.fontSize,
      background: args.background,
      startCorner: args.startCorner,
      startArrowHead: args.startArrowHead,
      endArrowHead: args.endArrowHead,
      url: args.url,
    });
    return { success: true, placedAssetID };
  },
});

export const updateAssets = mutation({
  args: {
    assets: v.array(
      v.object({
        _id: v.id("placedAssets"),
        posX: v.optional(v.number()),
        posY: v.optional(v.number()),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        rotation: v.optional(v.number()),
        stratPositionID: v.optional(v.nullable(v.id("stratPositions"))),
        pickedOperatorID: v.optional(v.nullable(v.id("pickedOperators"))),
        customColor: v.optional(v.nullable(v.string())),

        type: v.optional(v.string()),
        variant: v.optional(v.string()),
        operator: v.optional(v.string()),
        iconType: v.optional(v.string()),
        gadget: v.optional(v.string()),
        placedOn: v.optional(v.nullable(v.string())),
        text: v.optional(v.string()),
        fontSize: v.optional(v.number()),
        background: v.optional(v.string()),
        startCorner: v.optional(v.string()),
        startArrowHead: v.optional(v.boolean()),
        endArrowHead: v.optional(v.boolean()),
        url: v.optional(v.string()),
      }),
    ),
  },
  async handler(ctx, args) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) {
      return { success: false, error: "No active team selected" };
    }

    for (const asset of args.assets) {
      await ctx.db.patch(asset._id, {
        ...(asset.posX !== undefined ? { posX: asset.posX } : {}),
        ...(asset.posY !== undefined ? { posY: asset.posY } : {}),
        ...(asset.width !== undefined ? { width: asset.width } : {}),
        ...(asset.height !== undefined ? { height: asset.height } : {}),
        ...(asset.rotation !== undefined ? { rotation: asset.rotation } : {}),
        ...(asset.stratPositionID !== undefined
          ? { stratPositionID: asset.stratPositionID ?? undefined }
          : {}),
        ...(asset.pickedOperatorID !== undefined
          ? { pickedOperatorID: asset.pickedOperatorID ?? undefined }
          : {}),
        ...(asset.customColor !== undefined ? { customColor: asset.customColor ?? undefined } : {}),

        ...(asset.type !== undefined ? { type: asset.type } : {}),
        ...(asset.variant !== undefined ? { variant: asset.variant } : {}),
        ...(asset.operator !== undefined ? { operator: asset.operator } : {}),
        ...(asset.iconType !== undefined ? { iconType: asset.iconType } : {}),
        ...(asset.gadget !== undefined ? { gadget: asset.gadget } : {}),
        ...(asset.placedOn !== undefined ? { placedOn: asset.placedOn ?? undefined } : {}),
        ...(asset.text !== undefined ? { text: asset.text } : {}),
        ...(asset.fontSize !== undefined ? { fontSize: asset.fontSize } : {}),
        ...(asset.background !== undefined ? { background: asset.background } : {}),
        ...(asset.startCorner !== undefined ? { startCorner: asset.startCorner } : {}),
        ...(asset.startArrowHead !== undefined ? { startArrowHead: asset.startArrowHead } : {}),
        ...(asset.endArrowHead !== undefined ? { endArrowHead: asset.endArrowHead } : {}),
        ...(asset.url !== undefined ? { url: asset.url } : {}),
      });
    }
    return { success: true };
  },
});

export const deleteAssets = mutation({
  args: {
    placedAssetIDs: v.array(v.id("placedAssets")),
  },
  async handler(ctx, { placedAssetIDs }) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) {
      return { success: false, error: "No active team selected" };
    }

    for (const placedAssetID of placedAssetIDs) {
      await ctx.db.delete(placedAssetID);
    }
    return { success: true };
  },
});

// --------- Selected Assets ---------

export const getSelectedAssets = query({
  args: {
    stratID: v.id("strats"),
  },
  async handler(ctx, { stratID }) {
    const { activeTeamID, _id: userID } = await requireUser(ctx);
    if (!activeTeamID) {
      return null;
    }
    const selectedAssetsDoc = await ctx.db
      .query("selectedAssets")
      .withIndex("byStrat", (q) => q.eq("stratID", stratID))
      .collect();

    const otherUsersSelectedAssets = selectedAssetsDoc.filter((doc) => doc.userID !== userID);

    return otherUsersSelectedAssets.map((doc) => ({
      userID: doc.userID,
      placedAssetIDs: doc.placedAssetIDs,
    }));
  },
});

export const setSelectedAssets = mutation({
  args: {
    stratID: v.id("strats"),
    placedAssetIDs: v.array(v.id("placedAssets")),
  },
  async handler(ctx, { placedAssetIDs, stratID }) {
    const { activeTeamID, _id: userID } = await requireUser(ctx);
    if (!activeTeamID) {
      return { success: false, error: "No active team selected" };
    }

    let id = (
      await ctx.db
        .query("selectedAssets")
        .withIndex("byStratAndUser", (q) => q.eq("stratID", stratID).eq("userID", userID))
        .first()
    )?._id;

    if (!id) {
      id = await ctx.db.insert("selectedAssets", {
        stratID,
        userID,
        placedAssetIDs,
      });
    }

    if (placedAssetIDs.length === 0) {
      await ctx.db.delete(id);
      return { success: true };
    }
    await ctx.db.patch(id, {
      placedAssetIDs,
    });
    return { success: true };
  },
});
