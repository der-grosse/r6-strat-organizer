"use client";

import { Filter } from "@/components/context/FilterContext.functions";
import { PickedOperator, Strat } from "./types/strat.types";
import { TeamPosition } from "./types/team.types";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo } from "react";

export function filterPlayableStrats(strats: Strat[], filter: Filter, bannedOps: string[]) {
  return strats
    ?.filter((strat) => {
      if (filter.map && filter.map !== strat.map) return false;
      if (filter.site && filter.site !== strat.site) return false;
      return true;
    })
    .map((strat) => {
      const powerPositionsPlayable = (() => {
        if (bannedOps.length > 0) {
          const positionUnplayable = strat.stratPositions.some(
            (position) =>
              position.isPowerPosition &&
              position.pickedOperators.length &&
              position.pickedOperators.every((op) => bannedOps.includes(op.operator)),
          );
          if (positionUnplayable) return false;
        }
        return true;
      })();
      const shouldHideDueToOperatorFilter = strat.filters.some(
        ({ operators, action, filterType, triggerOn }) => {
          if (!operators.length) return false;
          const isHit = (() => {
            if (triggerOn === "banned") {
              return operators[filterType === "any" ? "some" : "every"]((op) =>
                bannedOps.includes(op),
              );
            } else {
              return operators[filterType === "any" ? "some" : "every"](
                (op) => !bannedOps.includes(op),
              );
            }
          })();
          return isHit ? action === "hide" : action === "show";
        },
      );
      return {
        strat,
        playable: powerPositionsPlayable && !shouldHideDueToOperatorFilter,
      };
    });
}

export function usePlayableStrats(filter: Filter, bannedOps: string[] | undefined | null) {
  const strats = useQuery(api.strats.list, filter);

  const playableStrats = useMemo(() => {
    return filterPlayableStrats(strats ?? [], filter, bannedOps ?? []);
  }, [strats, filter, bannedOps]);
  return strats ? playableStrats : undefined;
}

export interface StratLineupEntry {
  stratPositionID: Id<"stratPositions">;
  teamPositionID: Id<"teamPositions"> | null | undefined;
  /** The operator that would actually be played, respecting the current bans. */
  operator: PickedOperator;
  isPowerPosition: boolean;
  /** True when every operator picked for this position is banned. */
  isBanned: boolean;
  /** True when this is the viewer's own position, only set when `ownTeamPositionID` is given. */
  isSelf: boolean;
  positionName: string | null | undefined;
}

/**
 * Primary sort key of a lineup, ties are always broken by team position order.
 * - `"power-ops"`: power positions first
 * - `"team-positions"`: team position order only
 * - `"self-first"`: the viewer's own position first, needs `ownTeamPositionID`
 */
export type StratLineupSort = "self-first" | "team-positions" | "power-ops";

export interface StratLineupOptions {
  /**
   * Team positions to resolve position names and ordering from. Without them the
   * strat position order is used; with them, positions that are not assigned to a
   * team position sort last.
   */
  teamPositions?: TeamPosition[];
  /** Defaults to `"power-ops"`. */
  sort?: StratLineupSort;
  /** The viewer's team position, only used by the `"self-first"` sort and `isSelf`. */
  ownTeamPositionID?: Id<"teamPositions"> | null;
}

/**
 * Resolves the operators a strat is actually played with under the current bans:
 * per strat position the first picked operator that is not banned, falling back to
 * the first pick when all of them are banned (flagged as `isBanned`). Positions
 * without any picked operator are left out.
 */
export function getStratLineup(
  strat: Strat,
  bannedOps: string[],
  options: StratLineupOptions = {},
): StratLineupEntry[] {
  const { teamPositions, sort = "power-ops", ownTeamPositionID } = options;
  return strat.stratPositions
    .filter((position) => position.pickedOperators.length > 0)
    .map((position) => {
      const teamPosition = teamPositions?.find((pos) => pos._id === position.teamPositionID);
      const available = position.pickedOperators.filter((op) => !bannedOps.includes(op.operator));
      return {
        stratPositionID: position._id,
        teamPositionID: position.teamPositionID,
        operator: available[0] ?? position.pickedOperators[0],
        isPowerPosition: position.isPowerPosition,
        isBanned: available.length === 0,
        isSelf: ownTeamPositionID != null && position.teamPositionID === ownTeamPositionID,
        positionName: teamPosition?.positionName,
        index: teamPosition?.index ?? (teamPositions ? Number.MAX_SAFE_INTEGER : position.index),
      };
    })
    .sort((a, b) => {
      if (sort === "power-ops" && a.isPowerPosition !== b.isPowerPosition) {
        return a.isPowerPosition ? -1 : 1;
      }
      if (sort === "self-first" && a.isSelf !== b.isSelf) {
        return a.isSelf ? -1 : 1;
      }
      return a.index - b.index;
    })
    .map(({ index: _, ...entry }) => entry);
}
