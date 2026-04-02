"use client";

import { Filter } from "@/components/context/FilterContext.functions";
import { Strat } from "./types/strat.types";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo } from "react";

export function filterPlayableStrats(
  strats: Strat[],
  filter: Filter,
  bannedOps: string[],
) {
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
              position.pickedOperators.every((op) =>
                bannedOps.includes(op.operator),
              ),
          );
          if (positionUnplayable) return false;
        }
        return true;
      })();
      const shouldHideDueToAttackerFilter = (() => {
        if (
          !strat.filters?.attackers ||
          !strat.filters?.attackers?.attackers.length
        )
          return false;
        const { attackers, action, filterType, triggerOn } =
          strat.filters.attackers;
        const isHit = (() => {
          if (triggerOn === "banned") {
            return attackers[filterType === "any" ? "some" : "every"]((op) =>
              bannedOps.includes(op),
            );
          } else {
            return attackers[filterType === "any" ? "some" : "every"](
              (op) => !bannedOps.includes(op),
            );
          }
        })();
        return isHit ? action === "hide" : action === "show";
      })();
      return {
        strat,
        playable: powerPositionsPlayable && !shouldHideDueToAttackerFilter,
      };
    });
}

export function usePlayableStrats(
  filter: Filter,
  bannedOps: string[] | undefined | null,
) {
  const strats = useQuery(api.strats.list, filter);

  const playableStrats = useMemo(() => {
    return filterPlayableStrats(strats ?? [], filter, bannedOps ?? []);
  }, [strats, filter, bannedOps]);
  return strats ? playableStrats : undefined;
}
