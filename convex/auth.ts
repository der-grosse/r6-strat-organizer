import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type ActionCtx,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";

interface JWTPayload {
  v: "2.0";
  _id: string;
  name: string;
  teams: {
    teamID: string;
    isAdmin: boolean;
  }[];
  activeTeamID?: string;
}

type User = Omit<JWTPayload, "v" | "_id" | "activeTeamID" | "teams"> & {
  _id: Id<"users">;
  activeTeamID?: Id<"teams">;
  teams: {
    teamID: Id<"teams">;
    isAdmin: boolean;
  }[];
};

export async function requireUser(
  ctx: QueryCtx | ActionCtx | MutationCtx,
): Promise<User>;
export async function requireUser(
  ctx: QueryCtx | ActionCtx | MutationCtx,
  filter: Partial<{ teamID: Id<"teams"> | string; admin: boolean }> & {
    allowNull: true;
  },
): Promise<User | null>;
export async function requireUser(
  ctx: QueryCtx | ActionCtx | MutationCtx,
  filter?: Partial<{
    teamID: Id<"teams"> | string;
    admin: boolean;
    allowNull: false;
  }>,
): Promise<User>;
export async function requireUser(
  ctx: QueryCtx | ActionCtx | MutationCtx,
  filter?: Partial<{
    teamID: Id<"teams"> | string;
    admin: boolean;
    allowNull: boolean;
  }>,
): Promise<User | null> {
  const payload = await ctx.auth.getUserIdentity();
  if (filter?.allowNull && !payload) {
    return null;
  }
  if (!payload) {
    throw new Error("Not authenticated");
  }
  if (!("v" in payload) || payload.v !== "2.0") {
    throw new Error("Unsupported JWT version");
  }
  if (!("_id" in payload) || typeof payload._id !== "string") {
    throw new Error("Malformed _id");
  }
  if (!("name" in payload) || typeof payload.name !== "string") {
    throw new Error("Malformed name");
  }
  if (
    !("teams" in payload) ||
    !Array.isArray(payload.teams) ||
    payload.teams.some((team) => {
      if (!team || typeof team !== "object") return true;
      if (!("teamID" in team) || typeof team.teamID !== "string") return true;
      if (!("isAdmin" in team) || typeof team.isAdmin !== "boolean")
        return true;
      return false;
    })
  ) {
    throw new Error("Malformed teams");
  }
  if (
    "activeTeamID" in payload &&
    payload.activeTeamID !== undefined &&
    typeof payload.activeTeamID !== "string"
  ) {
    throw new Error("Malformed activeTeamID");
  }

  if (filter?.teamID) {
    const memberData = (payload as unknown as JWTPayload).teams.find(
      (team) => team.teamID === filter.teamID,
    );
    if (!memberData) {
      throw new Error("User is not a member of the specified team");
    }
    if (filter.admin && !memberData.isAdmin) {
      throw new Error("User is not an admin of the specified team");
    }
  }

  return {
    _id: payload._id,
    name: payload.name,
    teams: payload.teams,
    activeTeamID: payload.activeTeamID,
  } as User;
}

export async function requireServerJWT(
  ctx: QueryCtx | ActionCtx | MutationCtx,
) {
  const user = await requireUser(ctx);
  if (!user || user._id !== "NEXTJS_SERVER_JWT") {
    throw new Error("Unauthorized");
  }
}

export async function getFullUser(ctx: QueryCtx, userDoc: Doc<"users">) {
  const memberships = await ctx.db
    .query("userTeams")
    .withIndex("byUser", (q) => q.eq("userID", userDoc._id))
    .collect();

  if (memberships.length === 0) {
    return {
      _id: userDoc._id,
      name: userDoc.name,
      email: userDoc.email ?? null,
      ubisoftID: userDoc.ubisoftID ?? null,
      lastLoginAt: userDoc.lastLoginAt ?? null,
      teams: [],
    };
  }

  const teams = (
    await Promise.all(
      memberships.map(async (membership) => {
        const teamDoc = await ctx.db.get(membership.teamID);
        if (!teamDoc) return null!;
        return {
          teamID: teamDoc._id,
          isAdmin: membership.isAdmin,
          defaultColor: membership.defaultColor ?? null,
        };
      }),
    )
  ).filter(Boolean);

  return {
    _id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email ?? null,
    ubisoftID: userDoc.ubisoftID ?? null,
    lastLoginAt: userDoc.lastLoginAt ?? null,
    teams,
  };
}

export const getUserFromName = query({
  args: {
    name: v.string(),
  },
  async handler(ctx, args) {
    await requireServerJWT(ctx);

    const user =
      (await ctx.db
        .query("users")
        .withIndex("byName", (q) => q.eq("name", args.name))
        .first()) ??
      (await ctx.db
        .query("users")
        .withIndex("byEmail", (q) => q.eq("email", args.name))
        .first());

    if (!user) return null;

    const fullUser = await getFullUser(ctx, user);
    return {
      ...fullUser,
      hashedPassword: user.password,
    };
  },
});

// Creates a new team whose admin is either a brand-new account (signup: pass
// `name`/`password`/`email`) or an already-registered user (logged-in: pass
// `userID`). Either way the team is seeded with empty player positions.
export const createTeam = mutation({
  args: {
    teamName: v.string(),
    // Existing user becoming the admin (logged-in "create another team").
    userID: v.optional(v.id("users")),
    // New account to create as the admin (signup flow).
    name: v.optional(v.string()),
    password: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  async handler(
    ctx,
    args,
  ): Promise<{ error?: string; success?: boolean; teamID?: Id<"teams"> }> {
    await requireServerJWT(ctx);

    let userID = args.userID;

    if (userID) {
      const userDoc = await ctx.db.get(userID);
      if (!userDoc) {
        throw new Error("User not found");
      }
    } else {
      if (!args.name || !args.password) {
        throw new Error("Missing account details for new team admin");
      }

      // search for existing user with same name or email
      const existingUser =
        (await ctx.db
          .query("users")
          .withIndex("byName", (q) => q.eq("name", args.name!))
          .first()) ??
        (await ctx.db
          .query("users")
          .withIndex("byEmail", (q) => q.eq("email", args.email ?? ""))
          .first());

      if (existingUser) {
        return {
          error: "Username already exists",
        };
      }

      userID = await ctx.db.insert("users", {
        name: args.name,
        password: args.password,
        email: args.email,
      });
    }

    const teamID = await ctx.db.insert("teams", {
      name: args.teamName,
    });
    await ctx.db.insert("userTeams", {
      userID,
      teamID,
      isAdmin: true,
    });

    // create empty player positions
    const PLAYER_COUNT = 5;
    const positions = Array.from({ length: PLAYER_COUNT }, (_, i) => ({
      playerID: undefined,
      positionName: `Position ${i + 1}`,
      teamID,
      index: i,
    }));
    for (const position of positions) {
      await ctx.db.insert("teamPositions", position);
    }

    return { success: true, teamID };
  },
});

export const registerToTeam = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    password: v.string(),
    inviteKey: v.string(),
  },
  async handler(ctx, args) {
    await requireServerJWT(ctx);

    const invite = await ctx.db
      .query("teamInvites")
      .withIndex("byInviteKey", (q) => q.eq("inviteKey", args.inviteKey))
      .first();

    if (!invite || invite.usedAt) {
      throw new Error("Invalid invite key");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("byName", (q) => q.eq("name", args.name))
      .first();

    if (existingUser) {
      throw new Error("Username already taken");
    }

    const userID = await ctx.db.insert("users", {
      name: args.name,
      password: args.password,
      email: args.email,
    });
    await ctx.db.insert("userTeams", {
      userID,
      teamID: invite.teamID,
      isAdmin: false,
    });
    await ctx.db.patch(invite._id, {
      usedBy: userID,
      usedAt: new Date().toISOString(),
    });
  },
});

// Adds an already-registered user to another team via an invite key. Unlike
// `registerToTeam` (which creates a brand-new account), this links an existing
// user, letting people belong to multiple teams at once.
export const joinTeamWithInvite = mutation({
  args: {
    userID: v.id("users"),
    inviteKey: v.string(),
  },
  async handler(ctx, args) {
    await requireServerJWT(ctx);

    const invite = await ctx.db
      .query("teamInvites")
      .withIndex("byInviteKey", (q) => q.eq("inviteKey", args.inviteKey))
      .first();

    if (!invite || invite.usedAt) {
      throw new Error("Invalid invite key");
    }

    const existingMembership = await ctx.db
      .query("userTeams")
      .withIndex("byUserAndTeam", (q) =>
        q.eq("userID", args.userID).eq("teamID", invite.teamID),
      )
      .first();

    if (existingMembership) {
      throw new Error("You are already a member of this team");
    }

    await ctx.db.insert("userTeams", {
      userID: args.userID,
      teamID: invite.teamID,
      isAdmin: false,
    });
    await ctx.db.patch(invite._id, {
      usedBy: args.userID,
      usedAt: new Date().toISOString(),
    });

    return { teamID: invite.teamID };
  },
});

export const createResetToken = mutation({
  args: {
    userID: v.id("users"),
    token: v.string(),
    expiresAt: v.string(),
  },
  async handler(ctx, args) {
    await requireServerJWT(ctx);

    await ctx.db.insert("passwordResetTokens", {
      userID: args.userID,
      token: args.token,
      expiresAt: args.expiresAt,
      invalidTokenInsertionCounts: 0,
    });
  },
});

export const checkResetToken = mutation({
  args: {
    userID: v.id("users"),
    token: v.string(),
    newPassword: v.string(),
  },
  async handler(ctx, args) {
    await requireServerJWT(ctx);

    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("byUser", (q) => q.eq("userID", args.userID))
      .first();

    const MAX_TOKEN_TRIES = 10;

    const isInvalid =
      !resetToken ||
      resetToken.token !== args.token ||
      resetToken.expiresAt < new Date().toISOString() ||
      resetToken.invalidTokenInsertionCounts >= MAX_TOKEN_TRIES;

    if (resetToken && isInvalid) {
      await ctx.db.patch(resetToken._id, {
        invalidTokenInsertionCounts: resetToken.invalidTokenInsertionCounts + 1,
      });
    }

    if (isInvalid) {
      throw new Error("Invalid or expired reset token");
    }

    await ctx.db.patch(args.userID, { password: args.newPassword });
    await ctx.db.delete(resetToken._id);

    return true;
  },
});

export const setPasswordOfUser = mutation({
  args: {
    userID: v.id("users"),
    newPassword: v.string(),
  },
  async handler(ctx, args) {
    await requireServerJWT(ctx);

    await ctx.db.patch(args.userID, { password: args.newPassword });
    return true;
  },
});

export const updateLastLogin = mutation({
  args: {
    userID: v.id("users"),
  },
  async handler(ctx, args) {
    await requireServerJWT(ctx);

    await ctx.db.patch(args.userID, {
      lastLoginAt: new Date().toISOString(),
    });
    return true;
  },
});
