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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  ChartColumn,
  ChevronDown,
  Database,
  FolderOpen,
  Link2,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Slot } from "@/components/layout/Slot";
import { logout } from "@/server/auth";
import { TeamSwitcher } from "./TeamSwitcher";

export function AppSidebar() {
  const router = useRouter();

  return (
    <Sidebar variant="inset" className="pr-0">
      <SidebarHeader className="pl-0">
        <div className="ml-1 -mr-1 flex items-center justify-between gap-1">
          <img
            src="/icon.svg"
            className="w-6 h-6 shrink-0"
            alt="R6 Strats Logo"
          />
          <TeamSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Collapsible defaultOpen className="group/pages">
          <SidebarGroup className="pl-0">
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
                        Active Strat
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
                  <SidebarMenuItem>
                    <Link href="/settings">
                      <SidebarMenuButton>
                        <Settings className="mr-2" />
                        Settings
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  {/* <SidebarMenuItem>
                    <Link href="/replays">
                      <SidebarMenuButton>
                        <ChartColumn className="mr-2" />
                        Replay Analyzer
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem> */}
                  <Slot name="sidebar-links" />
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        <Slot name="sidebar-content" />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="-mt-2" />
        <Slot name="sidebar-footer" />
      </SidebarFooter>
    </Sidebar>
  );
}
