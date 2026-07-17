import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";

export const migrations = new Migrations<DataModel>(components.migrations);

/**
 * Rewrites strat filters from the legacy { attackers?, defenders? } pair to a flat
 * array. Docs that already hold an array are skipped, so re-runs are a no-op. Once
 * this has run against every deployment, the legacy branch of `stratFilters` in
 * schema.ts and normalizeFilters in strats.ts can be removed.
 *
 *   npx convex run migration:runMigrateStratFilters
 */
export const migrateStratFilters = migrations.define({
  table: "strats",
  migrateOne: (_ctx, strat) => {
    const filters = strat.filters;
    if (!filters || Array.isArray(filters)) return;

    // Legacy filters with no operators never matched anything, so they are dropped
    // rather than carried over as empty entries.
    return {
      filters: [filters.attackers, filters.defenders]
        .filter((filter) => filter !== undefined)
        .filter((filter) => filter.operators.length > 0),
    };
  },
});

export const runMigrateStratFilters = migrations.runner(internal.migration.migrateStratFilters);
