import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getFullUser, requireServerJWT, requireUser } from "./auth";

export const get = query({
  args: {
    userID: v.optional(v.id("users")),
  },
  async handler(ctx, args) {
    const payload = await requireUser(ctx);
    let isNextServer = false;
    if (args.userID) {
      await requireServerJWT(ctx);
      isNextServer = true;
    }
    const userID = args.userID ?? payload._id;
    const userDoc = await ctx.db.get(userID);
    if (!userDoc) return null;
    const fullUser = await getFullUser(ctx, userDoc);
    if (payload.activeTeamID) {
      return {
        ...fullUser,
        team: fullUser.teams.find((t) => t.teamID === payload.activeTeamID) ?? null,
        ...(isNextServer ? { hashedPassword: userDoc.password } : {}),
      };
    } else {
      return {
        ...fullUser,
        team: null,
        ...(isNextServer ? { hashedPassword: userDoc.password } : {}),
      };
    }
  },
});

export const update = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    ubisoftID: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const { _id } = await requireUser(ctx);
    await ctx.db.patch(_id, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.email !== undefined ? { email: args.email } : {}),
      ...(args.ubisoftID !== undefined ? { ubisoftID: args.ubisoftID } : {}),
    });
    return true;
  },
});
