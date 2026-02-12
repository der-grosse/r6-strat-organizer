import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  teams: defineTable({
    name: v.string(),
  }),

  teamInvites: defineTable({
    inviteKey: v.string(),
    teamID: v.id("teams"),
    usedBy: v.optional(v.id("users")),
    usedAt: v.optional(v.string()),
  })
    .index("byInviteKey", ["inviteKey"])
    .index("byTeam", ["teamID"]),

  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    password: v.string(),
    ubisoftID: v.optional(v.string()),
    lastLoginAt: v.optional(v.string()),
  })
    .index("byName", ["name"])
    .index("byEmail", ["email"]),

  userTeams: defineTable({
    userID: v.id("users"),
    teamID: v.id("teams"),
    isAdmin: v.boolean(),
    defaultColor: v.optional(v.string()),
  })
    .index("byUser", ["userID"])
    .index("byTeam", ["teamID"])
    .index("byUserAndTeam", ["userID", "teamID"]),

  passwordResetTokens: defineTable({
    token: v.string(),
    userID: v.id("users"),
    expiresAt: v.string(),
    invalidTokenInsertionCounts: v.number(),
  }).index("byUser", ["userID"]),

  teamPositions: defineTable({
    playerID: v.optional(v.id("users")),
    positionName: v.string(),
    teamID: v.id("teams"),
    index: v.number(),
  }).index("byTeam", ["teamID"]),

  activeStrats: defineTable({
    teamID: v.id("teams"),
    stratID: v.id("strats"),
  }).index("byTeam", ["teamID"]),

  bannedOps: defineTable({
    teamID: v.id("teams"),
    operators: v.array(v.string()),
  }).index("byTeam", ["teamID"]),

  // STRATS WITH ASSETS SCHEMA
  strats: defineTable({
    map: v.string(),
    site: v.string(),
    name: v.string(),
    description: v.string(),
    drawingID: v.optional(v.string()),
    teamID: v.id("teams"),
    archived: v.boolean(),
    mapIndex: v.number(),
    showFloorNames: v.optional(v.boolean()),
    hiddenFloors: v.optional(v.array(v.number())),
  })
    .index("byTeam", ["teamID"])
    .index("byTeamAndMap", ["teamID", "map"])
    .index("byTeamMapAndSite", ["teamID", "map", "site"]),

  placedAssets: defineTable({
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
    placedOn: v.optional(v.string()),
  }).index("byStrat", ["stratID"]),

  stratPositions: defineTable({
    teamPositionID: v.optional(v.id("teamPositions")),
    stratID: v.id("strats"),
    isPowerPosition: v.boolean(),
    shouldBringShotgun: v.boolean(),
    index: v.number(),
  }).index("byStrat", ["stratID"]),

  pickedOperators: defineTable({
    stratID: v.id("strats"),
    stratPositionID: v.id("stratPositions"),
    operator: v.string(),
    secondaryGadget: v.optional(v.string()),
    tertiaryGadget: v.optional(v.string()),
    index: v.number(),
  })
    .index("byStratPosition", ["stratPositionID"])
    .index("byStrat", ["stratID"]),

  selectedAssets: defineTable({
    stratID: v.id("strats"),
    userID: v.id("users"),
    placedAssetIDs: v.array(v.id("placedAssets")),
  })
    .index("byStratAndUser", ["stratID", "userID"])
    .index("byStrat", ["stratID"]),

  settings: defineTable({
    userId: v.id("users"),
    activeStratLayout: v.union(v.literal("bottom"), v.literal("top")),
  }).index("byUser", ["userId"]),
});

export default schema;
