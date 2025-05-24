import {
  integer,
  primaryKey,
  pgTable,
  text,
  serial,
  boolean,
} from "drizzle-orm/pg-core";

export const team = pgTable("team", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
});

export const teamInvites = pgTable("team_invites", {
  inviteKey: text("invite_key").primaryKey().notNull(),
  teamID: integer("team_id")
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),
  usedBy: integer("used_by").references(() => users.id),
  usedAt: text("used_at"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  createdAt: text("created_at").notNull(),
  teamID: integer("team_id")
    .notNull()
    .references(() => team.id),
  isAdmin: boolean("is_admin").notNull().default(false),
  defaultColor: text("default_color"),
});

export const playerPositions = pgTable("player_positions", {
  id: serial("id").primaryKey(),
  playerID: integer("player_id").references(() => users.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  positionName: text("position_name").notNull(),
  teamID: integer("team_id")
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),
});

export const strats = pgTable("strats", {
  id: serial("id").primaryKey(),
  map: text("map").notNull(),
  site: text("site").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  drawingID: text("drawing_id").notNull(),
  teamID: integer("team_id")
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),
  archived: integer("archived").notNull().default(0),
});

export const rotationIndexes = pgTable(
  "rotation_indexes",
  {
    rotationIndex: integer("rotation_index").notNull(),
    stratsID: integer("strats_id")
      .notNull()
      .references(() => strats.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.rotationIndex, table.stratsID] })]
);

export const activeStrat = pgTable(
  "active_strat",
  {
    teamID: integer("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    stratID: integer("strat_id").references(() => strats.id, {
      onDelete: "cascade",
    }),
  },
  (table) => [primaryKey({ columns: [table.teamID, table.stratID] })]
);

export const placedAssets = pgTable("placed_assets", {
  id: serial("id").primaryKey(),
  stratsID: integer("strats_id")
    .notNull()
    .references(() => strats.id, { onDelete: "cascade" }),
  assetID: text("asset_id").notNull(),
  positionX: integer("position_x").notNull(),
  positionY: integer("position_y").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  pickedOPID: integer("picked_op_id").references(() => pickedOperators.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  customColor: text("custom_color"),
  type: text("type").notNull(),

  // Operator type
  operator: text("operator"),
  side: text("side", { enum: ["att", "def"] }),
  showIcon: integer("show_icon"),

  // Gadget type
  gadget: text("gadget"),

  // Rotate type
  rotate: text("rotate"),
});

export const pickedOperators = pgTable("picked_operators", {
  id: serial("id").primaryKey(),
  operator: text("operator"),
  positionID: integer("positionID").references(() => playerPositions.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  stratsID: integer("strats_id")
    .notNull()
    .references(() => strats.id, { onDelete: "cascade" }),
  isPowerOP: integer("is_power_op").notNull(),
});
