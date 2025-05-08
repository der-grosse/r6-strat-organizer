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

export const powerOPs = sqliteTable(
  "power_ops",
  {
    op: text("op").notNull(),
    stratsID: int("strats_id")
      .notNull()
      .references(() => strats.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.op, table.stratsID] })]
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
