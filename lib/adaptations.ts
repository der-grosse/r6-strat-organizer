import { Adaptation, AdaptationFilter, Strat } from "./types/strat.types";
import { PlacedAsset } from "./types/asset.types";

export const ADAPTATION_AUTO = "auto";
export const ADAPTATION_NONE = "none";

/** Whether a single activation filter matches the current operator bans. */
export function isAdaptationFilterHit(filter: AdaptationFilter, bannedOps: string[]): boolean {
  if (!filter.operators.length) return false;
  if (filter.triggerOn === "banned") {
    return filter.operators[filter.filterType === "any" ? "some" : "every"]((op) =>
      bannedOps.includes(op),
    );
  }
  return filter.operators[filter.filterType === "any" ? "some" : "every"](
    (op) => !bannedOps.includes(op),
  );
}

/** An adaptation is active when all of its activation filters match. */
export function isAdaptationActive(adaptation: Adaptation, bannedOps: string[]): boolean {
  // Filters without operators are incomplete and simply ignored.
  const filters = adaptation.filters.filter((filter) => filter.operators.length > 0);
  if (!filters.length) return false;
  return filters.every((filter) => isAdaptationFilterHit(filter, bannedOps));
}

/** The highest-priority (lowest index) adaptation whose filters match, or null. */
export function resolveAutoAdaptation(strat: Strat, bannedOps: string[]): Adaptation | null {
  return (
    [...strat.adaptations]
      .sort((a, b) => a.index - b.index)
      .find((adaptation) => isAdaptationActive(adaptation, bannedOps)) ?? null
  );
}

/**
 * Resolves the effective adaptation for a given manual selection.
 * `null` / {@link ADAPTATION_AUTO} → auto-resolve from bans;
 * {@link ADAPTATION_NONE} → base strat (no adaptation);
 * an id → that adaptation (falling back to auto if it no longer exists).
 */
export function resolveSelectedAdaptation(
  strat: Strat,
  selection: string | null,
  bannedOps: string[],
): Adaptation | null {
  if (selection === ADAPTATION_NONE) return null;
  if (selection && selection !== ADAPTATION_AUTO) {
    const found = strat.adaptations.find((adaptation) => adaptation._id === selection);
    if (found) return found;
  }
  return resolveAutoAdaptation(strat, bannedOps);
}

/**
 * Filters a strat's assets down to those visible for the given adaptation:
 * base assets not hidden by it, plus the adaptation's own assets. When no
 * adaptation is active only the base assets are shown.
 */
export function applyAdaptationToAssets(
  assets: PlacedAsset[],
  adaptation: Adaptation | null,
): PlacedAsset[] {
  if (!adaptation) return assets.filter((asset) => !asset.adaptationID);
  const hidden = new Set(adaptation.hiddenAssetIDs);
  return assets.filter(
    (asset) =>
      asset.adaptationID === adaptation._id || (!asset.adaptationID && !hidden.has(asset._id)),
  );
}
