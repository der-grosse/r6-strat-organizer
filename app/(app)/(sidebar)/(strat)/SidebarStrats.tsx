import DndList from "@/components/general/DndList";
import OperatorIcon from "@/components/general/OperatorIcon";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getStratLineup } from "@/lib/strats";
import { Strat } from "@/lib/types/strat.types";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { Slash } from "lucide-react";
import { useMemo } from "react";

export interface SidebarStratsProps {
  strats: Strat[];
  onSelect: (strat: Strat) => void;
  showSite: boolean;
}

export default function SidebarStrats(props: SidebarStratsProps) {
  const updateStratIndex = useMutation(api.strats.updateIndex);
  const bannedOps = useQuery(api.bannedOps.get);
  const team = useQuery(api.team.get);
  const settings = useQuery(api.settings.get);
  const showOperators = settings?.showSidebarOperators ?? true;
  const mappedStrats = useMemo(
    () =>
      props.strats.map((strat) => ({
        ...strat,
        id: strat._id,
        lineup: showOperators
          ? getStratLineup(strat, bannedOps ?? [], {
              teamPositions: team?.teamPositions,
              sort: "power-ops",
            })
          : [],
      })),
    [props.strats, bannedOps, team?.teamPositions, showOperators],
  );
  return (
    <div className="overflow-hidden">
      <DndList
        items={mappedStrats}
        onChange={async (strats, movedStrat, _oldIndex, newIndex) => {
          const result = await updateStratIndex({
            stratID: movedStrat.id as Id<"strats">,
            newIndex,
            orderedStratIDs: strats.map((strat) => strat.id as Id<"strats">),
          });
          if (!result.success) {
            throw new Error(result.error);
          }
        }}
        slots={{
          handle: {
            className: "pl-2",
          },
        }}
      >
        {(strat, rootProps, handle) => (
          <SidebarMenuItem {...rootProps} className="-ml-1">
            <SidebarMenuButton className="inline h-auto" onClick={() => props.onSelect(strat)}>
              <span className="inline-block align-text-bottom -ml-2">{handle}</span>
              {!props.showSite ? (
                strat.name
              ) : (
                <>
                  <span>{strat.site}</span>
                  {strat.name && (
                    <>
                      <span className="mx-1">|</span>
                      <span className="text-muted-foreground">{strat.name}</span>
                    </>
                  )}
                </>
              )}
              {strat.lineup.length > 0 && (
                <span className="flex items-center gap-0.5 ml-4 mt-0.5">
                  {strat.lineup.map((entry) => (
                    <span
                      key={entry.stratPositionID}
                      className={cn("relative", !entry.isPowerPosition && "scale-75")}
                      title={[entry.operator.operator, entry.positionName]
                        .filter(Boolean)
                        .join(" | ")}
                    >
                      <OperatorIcon
                        op={entry.operator.operator}
                        className={cn(
                          "size-5",
                          !entry.isPowerPosition && "grayscale",
                          entry.isBanned && "opacity-50",
                        )}
                      />
                      {entry.isBanned && (
                        <Slash className="absolute inset-0 size-5 text-destructive opacity-70" />
                      )}
                    </span>
                  ))}
                </span>
              )}
            </SidebarMenuButton>
            {/* <Link href={`/editor/${strat.id}`}>
              <SidebarMenuAction className="cursor-pointer my-0.5">
                <Pencil />
              </SidebarMenuAction>
            </Link> */}
          </SidebarMenuItem>
        )}
      </DndList>
    </div>
  );
}
