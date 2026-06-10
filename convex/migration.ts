import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireServerJWT } from "./auth";

export const importTeams = mutation({
  args: {
    teams: v.array(
      v.object({
        originalId: v.number(),
        name: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireServerJWT(ctx);
    const idMap = [];
    for (const team of args.teams) {
      const newId = await ctx.db.insert("teams", { name: team.name });
      idMap.push({ originalId: team.originalId, newId });
    }
    return idMap;
  },
});
export const importUsers = mutation({
  args: {
    users: v.array(
      v.object({
        originalId: v.number(),
        name: v.string(),
        email: v.optional(v.string()),
        password: v.string(),
        ubisoftID: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireServerJWT(ctx);
    const idMap = [];
    for (const user of args.users) {
      const newId = await ctx.db.insert("users", {
        name: user.name,
        email: user.email,
        password: user.password,
        ubisoftID: user.ubisoftID,
      });
      idMap.push({ originalId: user.originalId, newId });
    }
    return idMap;
  },
});
export const importUserTeams = mutation({
  args: {
    userTeams: v.array(
      v.object({
        userID: v.id("users"),
        teamID: v.id("teams"),
        isAdmin: v.boolean(),
        defaultColor: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireServerJWT(ctx);
    for (const ut of args.userTeams) {
      await ctx.db.insert("userTeams", ut);
    }
  },
});
export const importTeamInvites = mutation({
  args: {
    invites: v.array(
      v.object({
        inviteKey: v.string(),
        teamID: v.id("teams"),
        usedBy: v.optional(v.id("users")),
        usedAt: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireServerJWT(ctx);
    for (const invite of args.invites) {
      await ctx.db.insert("teamInvites", invite);
    }
  },
});

export const importPasswordResetTokens = mutation({
  args: {
    tokens: v.array(
      v.object({
        token: v.string(),
        userID: v.id("users"),
        expiresAt: v.string(),
        invalidTokenInsertionCounts: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireServerJWT(ctx);
    for (const token of args.tokens) {
      await ctx.db.insert("passwordResetTokens", token);
    }
  },
});

export const importTeamPositions = mutation({
  args: {
    positions: v.array(
      v.object({
        originalId: v.number(),
        playerID: v.optional(v.id("users")),
        positionName: v.string(),
        teamID: v.id("teams"),
        index: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireServerJWT(ctx);
    const idMap = [];
    for (const pos of args.positions) {
      const newId = await ctx.db.insert("teamPositions", {
        playerID: pos.playerID,
        positionName: pos.positionName,
        teamID: pos.teamID,
        index: pos.index,
      });
      idMap.push({ originalId: pos.originalId, newId });
    }
    return idMap;
  },
});
export const importStrats = mutation({
  args: {
    strats: v.array(
      v.object({
        originalId: v.number(),
        map: v.string(),
        site: v.string(),
        name: v.string(),
        description: v.string(),
        drawingID: v.optional(v.string()),
        teamID: v.id("teams"),
        archived: v.boolean(),
        mapIndex: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireServerJWT(ctx);
    const idMap = [];
    for (const strat of args.strats) {
      const newId = await ctx.db.insert("strats", {
        map: strat.map,
        site: strat.site,
        name: strat.name,
        description: strat.description,
        drawingID: strat.drawingID,
        teamID: strat.teamID,
        archived: strat.archived,
        mapIndex: strat.archived ? -1 : strat.mapIndex,
      });
      idMap.push({ originalId: strat.originalId, newId });
    }
    return idMap;
  },
});

export const importStratPositions = mutation({
  args: {
    stratPositions: v.array(
      v.object({
        originalId: v.number(),
        teamPositionID: v.optional(v.id("teamPositions")),
        stratID: v.id("strats"),
        isPowerPosition: v.boolean(),
        shouldBringShotgun: v.boolean(),
        index: v.number(), // Added index as it is in schema.ts
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireServerJWT(ctx);
    const idMap = [];
    for (const sp of args.stratPositions) {
      const newId = await ctx.db.insert("stratPositions", {
        teamPositionID: sp.teamPositionID,
        stratID: sp.stratID,
        isPowerPosition: sp.isPowerPosition,
        shouldBringShotgun: sp.shouldBringShotgun,
        index: sp.index,
      });
      idMap.push({ originalId: sp.originalId, newId });
    }
    return idMap;
  },
});
export const importPickedOperators = mutation({
  args: {
    pickedOperators: v.array(
      v.object({
        originalId: v.number(), // Need this to link placedAssets? No, placedAssets doesn't link to pickedOperators in PG.
        // Wait, placedAssets in Convex DOES link to pickedOperators.
        // So I need to return a map for pickedOperators too if I want to link them.
        // But how do I link them if PG doesn't have the link?
        // In PG, placedAssets has stratPositionID.
        // In Convex, placedAssets has pickedOperatorID AND stratPositionID.
        // Maybe I can just set stratPositionID in Convex and leave pickedOperatorID null?
        // Or maybe I can infer pickedOperatorID from stratPositionID?
        // A stratPosition has one pickedOperator?
        // In PG: pickedOperators has stratPositionID. It's 1:1 or 1:N?
        // PG: stratPositionID is unique in pickedOperators?
        // "stratPositionID: integer("positionID").notNull().references(...)"
        // It doesn't say unique. But usually one operator per position.
        // If so, I can look it up.
        // But for now, let's just import them.
        stratID: v.id("strats"),
        stratPositionID: v.id("stratPositions"),
        operator: v.string(),
        secondaryGadget: v.optional(v.string()),
        tertiaryGadget: v.optional(v.string()),
        index: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireServerJWT(ctx);
    // I might need to return IDs if I want to link placedAssets to pickedOperators later.
    // But if I don't have the link in PG, I can't easily create it unless I query.
    // Let's return the map anyway.
    const idMap = [];
    for (const po of args.pickedOperators) {
      const newId = await ctx.db.insert("pickedOperators", {
        stratID: po.stratID,
        stratPositionID: po.stratPositionID,
        operator: po.operator,
        secondaryGadget: po.secondaryGadget,
        tertiaryGadget: po.tertiaryGadget,
        index: po.index,
      });
      idMap.push({ originalId: po.originalId, newId });
    }
    return idMap;
  },
});
export const importPlacedAssets = mutation({
  args: {
    assets: v.array(
      v.object({
        stratID: v.id("strats"),
        posX: v.number(),
        posY: v.number(),
        width: v.number(),
        height: v.number(),
        rotation: v.number(),
        stratPositionID: v.optional(v.id("stratPositions")),
        pickedOperatorID: v.optional(v.id("pickedOperators")),
        customColor: v.optional(v.string()),
        type: v.string(),
        operator: v.optional(v.string()),
        iconType: v.optional(v.string()),
        gadget: v.optional(v.string()),
        variant: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireServerJWT(ctx);
    for (const asset of args.assets) {
      await ctx.db.insert("placedAssets", asset);
    }
  },
});
