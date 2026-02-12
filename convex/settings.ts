import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireUser } from "./auth";

const DEFAULT_SETTINGS = {
  activeStratLayout: "bottom" as const,
};

export const get = query({
  args: {},
  async handler(ctx) {
    const user = await requireUser(ctx);
    const settings = await ctx.db
      .query("settings")
      .withIndex("byUser", (q) => q.eq("userId", user._id))
      .unique();

    if (!settings) {
      return DEFAULT_SETTINGS;
    }

    const { _id, _creationTime, userId, ...rest } = settings;
    return rest;
  },
});

export const update = mutation({
  args: {
    activeStratLayout: v.optional(
      v.union(v.literal("bottom"), v.literal("top")),
    ),
  },
  async handler(ctx, args) {
    const user = await requireUser(ctx);

    // Strip undefined values
    const patch = Object.fromEntries(
      Object.entries(args).filter(([, v]) => v !== undefined),
    );

    if (Object.keys(patch).length === 0) return;

    const existing = await ctx.db
      .query("settings")
      .withIndex("byUser", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("settings", {
        ...DEFAULT_SETTINGS,
        ...patch,
        userId: user._id,
      });
    }
  },
});
