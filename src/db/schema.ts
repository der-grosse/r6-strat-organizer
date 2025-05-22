import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const team = sqliteTable("team", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
});

export const teamInvites = sqliteTable("team_invites", {
  inviteKey: text("invite_key").primaryKey().notNull(),
  teamID: int("team_id")
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),
  usedBy: int("used_by").references(() => users.id),
  usedAt: text("used_at"),
});

export const users = sqliteTable("users", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  password: text("password").notNull(),
  createdAt: text("created_at").notNull(),
  teamID: int("team_id")
    .notNull()
    .references(() => team.id),
  isAdmin: int("is_admin").notNull(),
  defaultColor: text("default_color"),
});

export const strats = sqliteTable("strats", {
  id: int("id").primaryKey({ autoIncrement: true }),
  map: text("map").notNull(),
  site: text("site").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  drawingID: text("drawing_id").notNull(),
  teamID: int("team_id")
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),
});

export const rotationIndexes = sqliteTable(
  "rotation_indexes",
  {
    rotationIndex: int("rotation_index").notNull(),
    stratsID: int("strats_id")
      .notNull()
      .references(() => strats.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.rotationIndex, table.stratsID] })]
);

export const activeStrat = sqliteTable(
  "active_strat",
  {
    teamID: int("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    stratID: int("strat_id").references(() => strats.id, {
      onDelete: "cascade",
    }),
  },
  (table) => [primaryKey({ columns: [table.teamID, table.stratID] })]
);

export const placedAssets = sqliteTable("placed_assets", {
  id: int("id").primaryKey({ autoIncrement: true }),
  stratsID: int("strats_id")
    .notNull()
    .references(() => strats.id, { onDelete: "cascade" }),
  assetID: text("asset_id").notNull(),
  positionX: int("position_x").notNull(),
  positionY: int("position_y").notNull(),
  width: int("width").notNull(),
  height: int("height").notNull(),
  player: int("player").references(() => users.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  customColor: text("custom_color"),
  type: text("type").notNull(),

  // Operator type
  operator: text("operator"),
  side: text("side", { enum: ["att", "def"] }),
  showIcon: int("show_icon"),

  // Gadget type
  gadget: text("gadget"),

  // Rotate type
  rotate: text("rotate"),
});

export const pickedOperators = sqliteTable("picked_operators", {
  id: int("id").primaryKey({ autoIncrement: true }),
  operator: text("operator").notNull(),
  player: int("player").references(() => users.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  stratsID: int("strats_id")
    .notNull()
    .references(() => strats.id, { onDelete: "cascade" }),
  isPowerOP: int("is_power_op").notNull(),
});
