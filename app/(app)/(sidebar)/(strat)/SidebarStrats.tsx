import DndList from "@/components/general/DndList";
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Strat } from "@/lib/types/strat.types";
import { useMutation } from "convex/react";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export interface SidebarStratsProps {
  strats: Strat[];
  onSelect: (strat: Strat) => void;
  showSite: boolean;
}

export default function SidebarStrats(props: SidebarStratsProps) {
  const updateStratIndex = useMutation(api.strats.updateIndex);
  const mappedStrats = useMemo(
    () =>
      props.strats.map((strat) => ({
        ...strat,
        id: strat._id,
      })),
    [props.strats],
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
