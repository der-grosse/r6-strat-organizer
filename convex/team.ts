import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ensureUserHasTeam, requireServerJWT, requireUser } from "./auth";
import { Id } from "./_generated/dataModel";
import { generate } from "random-words";

// Returns every team the current user belongs to, with names, so the UI can
// render a team switcher. `isActive` reflects the team selected in the JWT.
export const listMine = query({
  async handler(ctx) {
    const { _id, activeTeamID } = await requireUser(ctx);

    const memberships = await ctx.db
      .query("userTeams")
      .withIndex("byUser", (q) => q.eq("userID", _id))
      .collect();

    const teams = await Promise.all(
      memberships.map(async (membership) => {
        const teamDoc = await ctx.db.get(membership.teamID);
        if (!teamDoc) return null!;
        return {
          teamID: teamDoc._id,
          name: teamDoc.name,
          isAdmin: membership.isAdmin,
          isActive: teamDoc._id === activeTeamID,
        };
      }),
    );

    return teams.filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  },
});

// Looks up the team an invite key points to so the accept-invite page can show
// its name. Guarded by the server JWT because the invitee is not (yet) a member.
export const getInviteInfo = query({
  args: {
    inviteKey: v.string(),
  },
  async handler(ctx, args) {
    await requireServerJWT(ctx);

    const invite = await ctx.db
      .query("teamInvites")
      .withIndex("byInviteKey", (q) => q.eq("inviteKey", args.inviteKey))
      .first();
    if (!invite) return null;

    const teamDoc = await ctx.db.get(invite.teamID);
    if (!teamDoc) return null;

    return {
      teamID: invite.teamID,
      teamName: teamDoc.name,
      used: !!invite.usedAt,
    };
  },
});

export const get = query({
  async handler(ctx) {
    const { activeTeamID, _id } = await requireUser(ctx);
    if (!activeTeamID) return null;
    const teamDoc = await ctx.db.get(activeTeamID);
    if (!teamDoc) return null;

    const memberships = await ctx.db
      .query("userTeams")
      .withIndex("byTeam", (q) => q.eq("teamID", activeTeamID))
      .collect();
    const isSelfAdmin = memberships.some(
      (membership) => membership.userID === _id && membership.isAdmin,
    );

    const teamPositions = await ctx.db
      .query("teamPositions")
      .withIndex("byTeam", (q) => q.eq("teamID", activeTeamID))
      .collect();

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const userDoc = await ctx.db.get(membership.userID);
        if (!userDoc) return null!;
        return {
          isAdmin: membership.isAdmin,
          _id: userDoc._id,
          name: userDoc.name,
          ubisoftID: userDoc.ubisoftID ?? null,
          teamPositionID: teamPositions.find((pos) => pos.playerID === userDoc._id)?._id || null,
          defaultColor: membership.defaultColor ?? null,
          memberSince: membership._creationTime,
        };
      }),
    );

    return {
      _id: teamDoc._id,
      _creationTime: teamDoc._creationTime,
      name: teamDoc.name,
      isSelfAdmin,
      members,
      teamPositions: teamPositions
        .map((pos) => ({
          _id: pos._id,
          playerID: pos.playerID ?? null,
          positionName: pos.positionName ?? null,
          index: pos.index,
        }))
        .sort((a, b) => a.index - b.index),
    };
  },
});

export const updateTeam = mutation({
  args: {
    _id: v.id("teams"),
    name: v.string(),
  },
  async handler(ctx, args) {
    await requireUser(ctx, { teamID: args._id, admin: true });

    await ctx.db.patch(args._id, { name: args.name });
    return true;
  },
});

export const getInviteKeys = query({
  async handler(ctx) {
    const { activeTeamID } = await requireUser(ctx);
    if (!activeTeamID) return null;
    const inviteKeys = await ctx.db
      .query("teamInvites")
      .withIndex("byTeam", (q) => q.eq("teamID", activeTeamID))
      .collect();
    return inviteKeys.map((invite) => ({
      _id: invite._id,
      inviteKey: invite.inviteKey,
      teamID: invite.teamID,
      usedBy: invite.usedBy ?? null,
      usedAt: invite.usedAt ?? null,
    }));
  },
});

export const updateTeamMember = mutation({
  args: {
    teamID: v.id("teams"),
    userID: v.optional(v.id("users")),
    isAdmin: v.optional(v.boolean()),
    defaultColor: v.optional(v.string()),
    ubisoftID: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const selfID = (await ctx.auth.getUserIdentity())?.subject as Id<"users">;
    const userID = args.userID ?? selfID;
    await requireUser(ctx, {
      teamID: args.teamID,
      admin: userID !== selfID || args.isAdmin === true,
    });

    if (args.isAdmin !== undefined || args.defaultColor !== undefined) {
      const membership = await ctx.db
        .query("userTeams")
        .withIndex("byUserAndTeam", (q) => q.eq("userID", userID).eq("teamID", args.teamID))
        .first();

      if (!membership) {
        throw new Error("User is not a member of the team");
      }

      await ctx.db.patch(membership._id, {
        isAdmin: args.isAdmin ?? membership.isAdmin,
        defaultColor: args.defaultColor ?? membership.defaultColor,
      });
    }

    if (args.ubisoftID !== undefined) {
      const userDoc = await ctx.db.get(userID);
      if (!userDoc) {
        throw new Error("User not found");
      }
      await ctx.db.patch(userID, { ubisoftID: args.ubisoftID });
    }

    return true;
  },
});

export const createInviteKey = mutation({
  args: {
    teamID: v.id("teams"),
  },
  async handler(ctx, args) {
    await requireUser(ctx, {
      teamID: args.teamID,
      admin: true,
    });

    const inviteKey = generate({ exactly: 5, join: "-" });

    const id = await ctx.db.insert("teamInvites", {
      teamID: args.teamID,
      inviteKey,
      usedBy: undefined,
      usedAt: undefined,
    });
    return {
      _id: id,
      teamID: args.teamID,
      inviteKey,
      usedBy: undefined,
      usedAt: undefined,
    };
  },
});

export const deleteInviteKey = mutation({
  args: {
    inviteKey: v.id("teamInvites"),
  },
  async handler(ctx, args) {
    const invite = await ctx.db.get(args.inviteKey);
    if (!invite) {
      throw new Error("Invite key not found");
    }
    await requireUser(ctx, {
      teamID: invite.teamID,
      admin: true,
    });
    await ctx.db.delete(args.inviteKey);
  },
});

export const removeTeamMember = mutation({
  args: {
    teamID: v.id("teams"),
    userID: v.id("users"),
  },
  async handler(ctx, args) {
    const selfID = (await ctx.auth.getUserIdentity())?.subject as Id<"users">;
    await requireUser(ctx, {
      teamID: args.teamID,
      admin: args.userID !== selfID,
    });

    const membership = await ctx.db
      .query("userTeams")
      .withIndex("byUserAndTeam", (q) => q.eq("userID", args.userID).eq("teamID", args.teamID))
      .first();

    if (!membership) {
      throw new Error("User is not a member of the team");
    }

    // check that user is not the last member or the last member
    const teamMembers = await ctx.db
      .query("userTeams")
      .withIndex("byTeam", (q) => q.eq("teamID", args.teamID))
      .collect();

    if (teamMembers.length <= 1) {
      throw new Error("Cannot remove the last member of the team");
    }

    if (membership.isAdmin) {
      const adminCount = teamMembers.filter((member) => member.isAdmin).length;
      if (adminCount <= 1) {
        throw new Error("Cannot remove the last admin of the team");
      }
    }

    await ctx.db.delete(membership._id);
  },
});

// Removes the calling user's own membership from a team. The last admin cannot
// leave (that would orphan the team) — they must delete the team instead.
export const leaveTeam = mutation({
  args: {
    userID: v.id("users"),
    teamID: v.id("teams"),
  },
  async handler(ctx, args) {
    await requireServerJWT(ctx);

    const memberships = await ctx.db
      .query("userTeams")
      .withIndex("byTeam", (q) => q.eq("teamID", args.teamID))
      .collect();

    const myMembership = memberships.find((m) => m.userID === args.userID);
    if (!myMembership) {
      throw new Error("You are not a member of this team");
    }

    if (myMembership.isAdmin) {
      const adminCount = memberships.filter((m) => m.isAdmin).length;
      if (adminCount <= 1) {
        throw new Error("You are the last admin of this team. Delete the team instead of leaving.");
      }
    }

    await ctx.db.delete(myMembership._id);

    // If that was their last team, give them a fresh personal one so they
    // always have somewhere to work.
    await ensureUserHasTeam(ctx, args.userID);
    return true;
  },
});

// Permanently deletes a team and every record that belongs to it. Only an admin
// of the team may do this.
export const deleteTeam = mutation({
  args: {
    userID: v.id("users"),
    teamID: v.id("teams"),
  },
  async handler(ctx, args) {
    await requireServerJWT(ctx);

    const membership = await ctx.db
      .query("userTeams")
      .withIndex("byUserAndTeam", (q) => q.eq("userID", args.userID).eq("teamID", args.teamID))
      .first();
    if (!membership || !membership.isAdmin) {
      throw new Error("Only an admin can delete the team");
    }

    // Delete every strat and the records that hang off each strat.
    const strats = await ctx.db
      .query("strats")
      .withIndex("byTeam", (q) => q.eq("teamID", args.teamID))
      .collect();
    for (const strat of strats) {
      const [placedAssets, stratPositions, pickedOperators, selectedAssets] = await Promise.all([
        ctx.db
          .query("placedAssets")
          .withIndex("byStrat", (q) => q.eq("stratID", strat._id))
          .collect(),
        ctx.db
          .query("stratPositions")
          .withIndex("byStrat", (q) => q.eq("stratID", strat._id))
          .collect(),
        ctx.db
          .query("pickedOperators")
          .withIndex("byStrat", (q) => q.eq("stratID", strat._id))
          .collect(),
        ctx.db
          .query("selectedAssets")
          .withIndex("byStrat", (q) => q.eq("stratID", strat._id))
          .collect(),
      ]);
      for (const record of [
        ...placedAssets,
        ...stratPositions,
        ...pickedOperators,
        ...selectedAssets,
      ]) {
        await ctx.db.delete(record._id);
      }
      await ctx.db.delete(strat._id);
    }

    // Delete the remaining team-scoped records.
    const teamPositions = await ctx.db
      .query("teamPositions")
      .withIndex("byTeam", (q) => q.eq("teamID", args.teamID))
      .collect();
    const activeStrats = await ctx.db
      .query("activeStrats")
      .withIndex("byTeam", (q) => q.eq("teamID", args.teamID))
      .collect();
    const bannedOps = await ctx.db
      .query("bannedOps")
      .withIndex("byTeam", (q) => q.eq("teamID", args.teamID))
      .collect();
    const teamInvites = await ctx.db
      .query("teamInvites")
      .withIndex("byTeam", (q) => q.eq("teamID", args.teamID))
      .collect();
    const userTeams = await ctx.db
      .query("userTeams")
      .withIndex("byTeam", (q) => q.eq("teamID", args.teamID))
      .collect();

    for (const record of [
      ...teamPositions,
      ...activeStrats,
      ...bannedOps,
      ...teamInvites,
      ...userTeams,
    ]) {
      await ctx.db.delete(record._id);
    }

    await ctx.db.delete(args.teamID);

    // Deleting your only team would leave you team-less — create a fresh one.
    await ensureUserHasTeam(ctx, args.userID);
    return true;
  },
});

export const updateTeamPosition = mutation({
  args: {
    teamID: v.id("teams"),
    positionID: v.id("teamPositions"),
    positionName: v.optional(v.string()),
    playerID: v.optional(v.nullable(v.id("users"))),
    index: v.optional(v.number()),
  },
  async handler(ctx, args) {
    await requireUser(ctx, {
      teamID: args.teamID,
      admin: true,
    });

    const position = await ctx.db.get(args.positionID);
    if (!position) {
      throw new Error("Position not found");
    }
    if (position.teamID !== args.teamID) {
      throw new Error("Position does not belong to the team");
    }

    const teamPositions = await ctx.db
      .query("teamPositions")
      .withIndex("byTeam", (q) => q.eq("teamID", args.teamID))
      .collect();

    if (args.playerID) {
      const playerMembership = await ctx.db
        .query("userTeams")
        .withIndex("byUserAndTeam", (q) => q.eq("userID", args.playerID!).eq("teamID", args.teamID))
        .first();
      if (!playerMembership) {
        throw new Error("Player is not a member of the team");
      }
      const assignedPosition = teamPositions.find(
        (pos) => pos.playerID === args.playerID && pos._id !== args.positionID,
      );
      if (assignedPosition) {
        await ctx.db.patch(assignedPosition._id, { playerID: undefined });
      }
    }

    await ctx.db.patch(args.positionID, {
      positionName: args.positionName ?? position.positionName,
      playerID: args.playerID === null ? undefined : (args.playerID ?? position.playerID),
      index: args.index ?? position.index,
    });

    if (args.index !== undefined) {
      // Switch indexes
      const oldIndex = position.index;
      const newIndex = args.index;
      for (const pos of teamPositions) {
        if (pos._id === args.positionID) {
          continue;
        }
        if (oldIndex < newIndex) {
          // Moving down
          if (pos.index > oldIndex && pos.index <= newIndex) {
            await ctx.db.patch(pos._id, { index: pos.index - 1 });
          }
        } else if (oldIndex > newIndex) {
          // Moving up
          if (pos.index < oldIndex && pos.index >= newIndex) {
            await ctx.db.patch(pos._id, { index: pos.index + 1 });
          }
        }
      }
    }
  },
});
