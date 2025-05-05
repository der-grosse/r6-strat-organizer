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
  ChevronUp,
  Database,
  Edit,
  FolderOpen,
  Link2,
  MapPinned,
} from "lucide-react";
import Link from "next/link";
import { useFilter } from "./FilterContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import MAPS from "@/data/maps";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { setActive } from "@/src/strats";
import { Checkbox } from "./ui/checkbox";
import { useRouter } from "next/navigation";
import OPERATORS from "@/data/operator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import OperatorIcon from "./OperatorIcon";

export function AppSidebar() {
  const router = useRouter();
  const { filter, setFilter, filteredStrats, isLeading, setIsLeading } =
    useFilter();

  return (
    <Sidebar variant="inset">
      <SidebarHeader />
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton>
                          {filter.map ?? "Select map"}
                          <ChevronRight className="ml-auto" />
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" className="w-56">
                        <DropdownMenuItem
                          key="clear"
                          onClick={() => {
                            setFilter({
                              ...filter,
                              map: null,
                              site: null,
                            });
                          }}
                        >
                          <em>Clear</em>
                        </DropdownMenuItem>
                        {MAPS.map((map) => (
                          <DropdownMenuItem
                            key={map.name}
                            onClick={() => {
                              setFilter({
                                ...filter,
                                map: map.name,
                              });
                            }}
                          >
                            {map.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                  {/* site selection */}
                  <SidebarMenuItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild disabled={!filter.map}>
                        <SidebarMenuButton>
                          {filter.site ??
                            (filter.map ? "Select site" : "Select map first")}
                          <ChevronRight className="ml-auto" />
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" className="w-56">
                        <DropdownMenuItem
                          key="clear"
                          onClick={() => {
                            setFilter({
                              ...filter,
                              site: null,
                            });
                          }}
                        >
                          <em>Clear</em>
                        </DropdownMenuItem>
                        {MAPS.find((map) => map.name === filter.map)?.sites.map(
                          (site) => (
                            <DropdownMenuItem
                              key={site}
                              onClick={() => {
                                setFilter({
                                  ...filter,
                                  site,
                                });
                              }}
                            >
                              {site}
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                  {/* banned OPs selector */}
                  <SidebarMenuItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <SidebarMenuButton>
                          {filter.bannedOPs.length
                            ? filter.bannedOPs
                                .map((op) =>
                                  OPERATORS.find((o) => o.name === op)
                                )
                                .filter(Boolean)
                                .map((op) => (
                                  <OperatorIcon key={op!.name} op={op!} />
                                ))
                            : "Select banned OPs"}
                          <ChevronRight className="ml-auto" />
                        </SidebarMenuButton>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" side="right">
                        <Command>
                          <CommandInput placeholder="Type a command or search..." />
                          <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                key="clear"
                                onSelect={() =>
                                  setFilter({ ...filter, bannedOPs: [] })
                                }
                              >
                                <em>Clear</em>
                              </CommandItem>
                              {OPERATORS.map((op) => (
                                <CommandItem
                                  key={op.name}
                                  onSelect={() => {
                                    setFilter((filter) => ({
                                      ...filter,
                                      bannedOPs: filter.bannedOPs.includes(
                                        op.name
                                      )
                                        ? filter.bannedOPs.filter(
                                            (op2) => op2 !== op.name
                                          )
                                        : [...filter.bannedOPs, op.name],
                                    }));
                                  }}
                                >
                                  <OperatorIcon op={op} />
                                  {op.name}
                                  <CommandShortcut>
                                    {filter.bannedOPs.includes(op.name) && (
                                      <Check className="text-muted-foreground" />
                                    )}
                                  </CommandShortcut>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                                await setActive(strat);
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
                            onClick={() => window.open(strat.editURL, "_blank")}
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
              className="mr-2"
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
