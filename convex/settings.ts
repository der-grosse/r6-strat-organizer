import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireUser } from "./auth";

const DEFAULT_SETTINGS = {
  activeStratLayout: "bottom" as const,
  stratGadgetViewModifier: "none" as const,
  activeStratNameTemplate: {
    stratName: true,
    mapName: false,
    siteName: true,
  },
  hideEmptyFloors: true, // if a floor has no own assets, hide it
  showSidebarOperators: true, // show the resolved operators of a strat in the sidebar
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
    // optional values in DB will be filled in with defaults here
    return { ...DEFAULT_SETTINGS, ...rest };
  },
});

export const update = mutation({
  args: {
    activeStratLayout: v.optional(v.union(v.literal("bottom"), v.literal("top"))),
    stratGadgetViewModifier: v.optional(
      v.union(v.literal("none"), v.literal("hideForeign"), v.literal("grayscaleForeign")),
    ),
    activeStratNameTemplate: v.optional(
      v.object({
        stratName: v.boolean(),
        mapName: v.boolean(),
        siteName: v.boolean(),
      }),
    ),
    hideEmptyFloors: v.optional(v.boolean()),
    showSidebarOperators: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const user = await requireUser(ctx);

    // Strip undefined values
    const patch = Object.fromEntries(Object.entries(args).filter(([, v]) => v !== undefined));

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
