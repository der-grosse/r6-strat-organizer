"use client";
import MapSelector from "@/components/general/MapSelector";
import OperatorPicker from "@/components/general/OperatorPicker";
import SiteSelector from "@/components/general/SiteSelector";
import { Fill } from "@/components/layout/Fill";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  CircleSlash,
  Crown,
  Eye,
  MapPinned,
  X,
} from "lucide-react";
import SidebarStrats from "./SidebarStrats";
import { useRouter } from "next/navigation";
import { useFilter } from "@/components/context/FilterContext";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePlayableStrats } from "@/lib/strats";
import BannedOpsSelector from "./bannedOpsSelector";

export default function StratsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const setActiveStrat = useMutation(api.activeStrat.set);
  const bannedOps = useQuery(api.bannedOps.get) || [];
  const { filter, setFilter, isLeading, setIsLeading } = useFilter();
  const playableStrats = usePlayableStrats(filter, bannedOps);
  const filteredStrats =
    playableStrats
      ?.filter(({ playable }) => playable)
      .map(({ strat }) => strat) ?? [];

  return (
    <>
      {children}
      <Fill slot="sidebar-content">
        <Collapsible defaultOpen className="group/strats">
          <SidebarGroup className="pl-0">
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="cursor-pointer">
                <MapPinned className="mr-2" />
                Strats
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/strats:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                {/* filter */}
                <SidebarMenu>
                  {/* map selection */}
                  <SidebarMenuItem>
                    <MapSelector
                      map={filter.map}
                      onChange={(map) => {
                        if (!map) {
                          setFilter({
                            ...filter,
                            map: undefined,
                            site: undefined,
                          });
                        } else {
                          setFilter((filter) => ({
                            ...filter,
                            map: map.name,
                            site:
                              filter.map === map.name ? filter.site : undefined,
                          }));
                        }
                      }}
                      trigger={SidebarMenuButton}
                    />
                  </SidebarMenuItem>
                  {/* site selection */}
                  <SidebarMenuItem>
                    <SiteSelector
                      map={filter.map}
                      site={filter.site}
                      onChange={(site) =>
                        setFilter({
                          ...filter,
                          site,
                        })
                      }
                      trigger={SidebarMenuButton}
                    />
                  </SidebarMenuItem>
                  {/* banned OPs selector */}
                  <SidebarMenuItem>
                    <BannedOpsSelector />
                  </SidebarMenuItem>
                </SidebarMenu>
                <div className="pr-2">
                  <SidebarSeparator />
                </div>
                {/* filtered strats result */}
                <SidebarMenu>
                  {filter.map ? (
                    <SidebarStrats
                      strats={filteredStrats}
                      onSelect={async (strat) => {
                        if (isLeading) {
                          await setActiveStrat({ stratID: strat._id });
                          if (window.location.pathname !== "/") {
                            router.push("/");
                          }
                        } else {
                          router.push(`/strat/${strat._id}`);
                        }
                      }}
                      showSite={!filter.site}
                    />
                  ) : null}
                  {filter.map && filteredStrats.length === 0 && (
                    <SidebarMenuItem className="text-muted-foreground">
                      <SidebarMenuButton disabled>
                        No strats found
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {!filter.map && (
                    <SidebarMenuItem className="text-muted-foreground">
                      <SidebarMenuButton disabled>
                        <CircleSlash />
                        No map selected
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </Fill>
      <Fill slot="sidebar-footer">
        <SidebarMenu>
          <SidebarMenuItem>
            <Tooltip delayDuration={750}>
              <TooltipTrigger asChild>
                <SidebarMenuButton onClick={() => setIsLeading(!isLeading)}>
                  {isLeading ? <Crown /> : <Eye />}
                  {isLeading
                    ? "Leading active strat"
                    : "Not leading active strat"}
                </SidebarMenuButton>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-sm">Lead active strat</p>
                <p className="text-xs text-muted-foreground">
                  When this option is selected, your open strat will be shown to
                  all users of your team, that have the <em>Active strat</em>{" "}
                  tab open.
                </p>
              </TooltipContent>
            </Tooltip>
            {isLeading && (
              <Tooltip delayDuration={750}>
                <TooltipTrigger asChild>
                  <SidebarMenuAction
                    className={cn(
                      "cursor-pointer p-2 -my-1.5 w-7",
                      !isLeading && "pointer-events-none",
                    )}
                    onClick={() => {
                      if (!isLeading) return;
                      setActiveStrat({ stratID: null });
                    }}
                  >
                    <X className={cn(!isLeading && "text-muted-foreground")} />
                  </SidebarMenuAction>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-sm">Clear currently open strat</p>
                  <p className="text-xs text-muted-foreground">
                    You can only clear the current strat when you are leading
                    the currently open strat.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </Fill>
    </>
  );
}
