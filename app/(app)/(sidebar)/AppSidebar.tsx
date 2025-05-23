"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Database,
  Edit,
  FolderOpen,
  Link2,
  LogOut,
  MapPinned,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useFilter } from "../../../components/context/FilterContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { setActive } from "@/src/strats/strats";
import { Checkbox } from "../../../components/ui/checkbox";
import { useRouter } from "next/navigation";
import { getGoogleDrawingsEditURL } from "@/src/googleDrawings";
import { Button } from "@/components/ui/button";
import { logout } from "@/src/auth/auth";
import MapSelector from "@/components/MapSelector";
import SiteSelector from "@/components/SiteSelector";
import OperatorPicker from "@/components/OperatorPicker";

export function AppSidebar(props: { teamName: string }) {
  const router = useRouter();
  const { filter, setFilter, filteredStrats, isLeading, setIsLeading } =
    useFilter();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="ml-1 -mr-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            <img
              src="/icon.svg"
              className="w-6 h-6 mr-1 inline-block align-sub"
              alt="R6 Strats Logo"
            />
            {props.teamName}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              await logout();
              router.push("/auth");
            }}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Collapsible defaultOpen className="group/pages">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="cursor-pointer">
                <Link2 className="mr-2" />
                Pages
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/pages:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/">
                      <SidebarMenuButton>
                        <FolderOpen className="mr-2" />
                        Current Strat
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/strats">
                      <SidebarMenuButton>
                        <Database className="mr-2" />
                        All strats
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/team">
                      <SidebarMenuButton>
                        <Users className="mr-2" />
                        Team Management
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        <Collapsible defaultOpen className="group/strats">
          <SidebarGroup>
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
                            map: null,
                            site: null,
                          });
                        } else {
                          setFilter((filter) => ({
                            ...filter,
                            map: map.name,
                            site: filter.map === map.name ? filter.site : null,
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
                    <OperatorPicker
                      multiple
                      selected={filter.bannedOPs}
                      onChange={(bannedOPs) => {
                        setFilter({
                          ...filter,
                          bannedOPs,
                        });
                      }}
                      trigger={SidebarMenuButton}
                    />
                  </SidebarMenuItem>
                </SidebarMenu>
                <SidebarSeparator />
                <SidebarGroupLabel>Filtered Strats</SidebarGroupLabel>
                {/* filtered strats result */}
                <SidebarMenu>
                  {filter.map
                    ? filteredStrats.map((strat) => (
                        <SidebarMenuItem key={strat.id}>
                          <SidebarMenuButton
                            className="inline h-auto"
                            onClick={async () => {
                              if (isLeading) {
                                await setActive(strat.id);
                                if (window.location.pathname !== "/") {
                                  router.push("/");
                                }
                              } else {
                                router.push(`/strat/${strat.id}`);
                              }
                            }}
                          >
                            {filter.site ? (
                              strat.name
                            ) : (
                              <>
                                <span>{strat.site}</span>
                                {strat.name && (
                                  <>
                                    <span className="mx-1">|</span>
                                    <span className="text-muted-foreground">
                                      {strat.name}
                                    </span>
                                  </>
                                )}
                              </>
                            )}
                          </SidebarMenuButton>
                          <SidebarMenuAction
                            className="cursor-pointer my-0.5"
                            onClick={() =>
                              window.open(
                                getGoogleDrawingsEditURL(strat.drawingID),
                                "_blank"
                              )
                            }
                          >
                            <Edit />
                          </SidebarMenuAction>
                        </SidebarMenuItem>
                      ))
                    : null}
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
                        No filter selected
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Checkbox
              id="sidebar-leading-checkbox"
              className="mx-2"
              checked={isLeading}
              onCheckedChange={(checked) => setIsLeading(!!checked)}
            />
            <label
              htmlFor="sidebar-leading-checkbox"
              className="text-sm leading-none"
            >
              Lead current open strat
            </label>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
