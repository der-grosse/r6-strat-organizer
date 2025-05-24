import Database from "better-sqlite3";
import { Pool } from "pg";

const sqlite = new Database("../db.sqlite", { verbose: console.log });
const pg = new Pool({
  connectionString: "postgres://postgres:postgres@localhost:5432/strats",
});

async function migrate() {
  try {
    console.log("Starting migration from SQLite to PostgreSQL...");

    // Begin a transaction in PostgreSQL
    const pgClient = await pg.connect();
    await pgClient.query("BEGIN");

    // Step 1: Migrate teams
    console.log("Migrating teams...");
    const teams = sqlite.prepare("SELECT * FROM team").all();
    for (const team of teams) {
      console.log(`Migrating team: ${team.name}`);
      await pgClient.query(
        "INSERT INTO team(id, name, created_at) VALUES($1, $2, $3)",
        [team.id, team.name, team.created_at]
      );
    }

    // Reset PostgreSQL sequence for team.id
    await pgClient.query(
      `SELECT setval('team_id_seq', (SELECT MAX(id) FROM team))`
    );

    // Step 2: Migrate users
    console.log("Migrating users...");
    const users = sqlite.prepare("SELECT * FROM users").all();
    for (const user of users) {
      console.log(`Migrating user: ${user.name}`);
      await pgClient.query(
        "INSERT INTO users(id, name, password, created_at, team_id, is_admin, default_color) VALUES($1, $2, $3, $4, $5, $6, $7)",
        [
          user.id,
          user.name,
          user.password,
          user.created_at,
          user.team_id,
          user.is_admin ? true : false,
          user.default_color,
        ]
      );
    }

    // Reset PostgreSQL sequence for users.id
    await pgClient.query(
      `SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))`
    );

    // Step 3: Migrate team invites
    console.log("Migrating team invites...");
    const teamInvites = sqlite.prepare("SELECT * FROM team_invites").all();
    for (const invite of teamInvites) {
      await pgClient.query(
        "INSERT INTO team_invites(invite_key, team_id, used_by, used_at) VALUES($1, $2, $3, $4)",
        [invite.invite_key, invite.team_id, invite.used_by, invite.used_at]
      );
    }

    // Step 4: Migrate player positions
    console.log("Migrating player positions...");
    const positions = sqlite.prepare("SELECT * FROM player_positions").all();
    for (const position of positions) {
      await pgClient.query(
        "INSERT INTO player_positions(id, player_id, position_name, team_id) VALUES($1, $2, $3, $4)",
        [
          position.id,
          position.player_id,
          position.position_name,
          position.team_id,
        ]
      );
    }

    // Reset PostgreSQL sequence for player_positions.id
    await pgClient.query(
      `SELECT setval('player_positions_id_seq', (SELECT MAX(id) FROM player_positions))`
    );

    // Step 5: Migrate strats
    console.log("Migrating strats...");
    const strats = sqlite.prepare("SELECT * FROM strats").all();
    for (const strat of strats) {
      await pgClient.query(
        "INSERT INTO strats(id, map, site, name, description, drawing_id, team_id, archived) VALUES($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          strat.id,
          strat.map,
          strat.site,
          strat.name,
          strat.description,
          strat.drawing_id,
          strat.team_id,
          strat.archived,
        ]
      );
    }

    // Reset PostgreSQL sequence for strats.id
    await pgClient.query(
      `SELECT setval('strats_id_seq', (SELECT MAX(id) FROM strats))`
    );

    // Step 6: Migrate rotation indexes
    console.log("Migrating rotation indexes...");
    const rotationIndexes = sqlite
      .prepare("SELECT * FROM rotation_indexes")
      .all();
    for (const index of rotationIndexes) {
      await pgClient.query(
        "INSERT INTO rotation_indexes(rotation_index, strats_id) VALUES($1, $2)",
        [index.rotation_index, index.strats_id]
      );
    }

    // Step 7: Migrate active strats
    console.log("Migrating active strats...");
    const activeStrats = sqlite.prepare("SELECT * FROM active_strat").all();
    for (const active of activeStrats) {
      await pgClient.query(
        "INSERT INTO active_strat(team_id, strat_id) VALUES($1, $2)",
        [active.team_id, active.strat_id]
      );
    }

    // Step 8: Migrate picked operators (first, since it's referenced by placed_assets)
    console.log("Migrating picked operators...");
    const pickedOperators = sqlite
      .prepare("SELECT * FROM picked_operators")
      .all();
    for (const op of pickedOperators) {
      await pgClient.query(
        'INSERT INTO picked_operators(id, operator, "positionID", strats_id, is_power_op) VALUES($1, $2, $3, $4, $5)',
        [op.id, op.operator, op.position_id, op.strats_id, op.is_power_op]
      );
    }

    // Reset PostgreSQL sequence for picked_operators.id
    await pgClient.query(
      `SELECT setval('picked_operators_id_seq', (SELECT MAX(id) FROM picked_operators))`
    );

    // Step 9: Migrate placed assets
    console.log("Migrating placed assets...");
    const placedAssets = sqlite.prepare("SELECT * FROM placed_assets").all();
    for (const asset of placedAssets) {
      await pgClient.query(
        "INSERT INTO placed_assets(id, strats_id, asset_id, position_x, position_y, width, height, picked_op_id, custom_color, type, operator, side, show_icon, gadget, rotate) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)",
        [
          asset.id,
          asset.strats_id,
          asset.asset_id,
          asset.position_x,
          asset.position_y,
          asset.width,
          asset.height,
          asset.picked_op_id,
          asset.custom_color,
          asset.type,
          asset.operator,
          asset.side,
          asset.show_icon,
          asset.gadget,
          asset.rotate,
        ]
      );
    }

    // Reset PostgreSQL sequence for placed_assets.id
    await pgClient.query(
      `SELECT setval('placed_assets_id_seq', (SELECT MAX(id) FROM placed_assets))`
    );

    // Commit the transaction
    await pgClient.query("COMMIT");
    console.log("Migration completed successfully!");
  } catch (error) {
    // If anything goes wrong, rollback the transaction
    const pgClient = await pg.connect();
    await pgClient.query("ROLLBACK");
    console.error("Migration failed:", error);
  } finally {
    // Clean up connections
    sqlite.close();
    await pg.end();
  }
}

// Run the migration
migrate().catch(console.error);
