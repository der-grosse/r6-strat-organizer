import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./auth";
import { getStrat } from "./strats";

export const get = query({
  args: {},
  async handler(ctx) {
    const { activeTeamID } = (await requireUser(ctx, { allowNull: true })) ?? {};
    if (!activeTeamID) return null;

    const activeStratDoc = await ctx.db
      .query("activeStrats")
      .withIndex("byTeam", (q) => q.eq("teamID", activeTeamID))
      .first();
    if (!activeStratDoc || activeStratDoc.teamID !== activeTeamID) return null;

    if (!activeStratDoc.stratID) return null;

    const activeStrat = await getStrat(ctx, activeStratDoc.stratID);
    return activeStrat;
  },
});

export const getAdaptationSelection = query({
  args: {},
  async handler(ctx) {
    const { activeTeamID } = (await requireUser(ctx, { allowNull: true })) ?? {};
    if (!activeTeamID) return null;

    const activeStratDoc = await ctx.db
      .query("activeStrats")
      .withIndex("byTeam", (q) => q.eq("teamID", activeTeamID))
      .first();

    return activeStratDoc?.adaptationSelection ?? null;
  },
});

export const set = mutation({
  args: { stratID: v.union(v.id("strats"), v.null()) },
  async handler(ctx, { stratID }) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) throw new Error("No active team set");

    const existing = await ctx.db
      .query("activeStrats")
      .withIndex("byTeam", (q) => q.eq("teamID", activeTeamID))
      .first();

    // Delete currently active strat if null/undefined passed
    if (stratID == null) {
      if (existing) {
        await ctx.db.delete(existing._id);
      }
      return null;
    }

    // Update if exists, otherwise create. Reset the adaptation selection back
    // to auto whenever the active strat changes.
    if (existing) {
      await ctx.db.patch(existing._id, { stratID, adaptationSelection: undefined });
    } else {
      await ctx.db.insert("activeStrats", { teamID: activeTeamID, stratID });
    }

    return stratID;
  },
});

export const setAdaptation = mutation({
  args: { selection: v.union(v.string(), v.null()) },
  async handler(ctx, { selection }) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) throw new Error("No active team set");

    const existing = await ctx.db
      .query("activeStrats")
      .withIndex("byTeam", (q) => q.eq("teamID", activeTeamID))
      .first();
    if (!existing) return null;

    await ctx.db.patch(existing._id, { adaptationSelection: selection ?? undefined });
    return selection;
  },
});

export const clear = mutation({
  args: {},
  async handler(ctx) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) throw new Error("No active team set");
    const existing = await ctx.db
      .query("activeStrats")
      .withIndex("byTeam", (q) => q.eq("teamID", activeTeamID))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});
