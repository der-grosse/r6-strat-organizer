"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export interface SidebarLayoutProps {
  team: Team;
  children: React.ReactNode;
}

export default function SidebarLayout(props: SidebarLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar teamName={props.team.name} />
      <SidebarInset>
        <SidebarTrigger className="absolute top-0 left-0 z-10 cursor-pointer" />
        {props.children}
      </SidebarInset>
    </SidebarProvider>
  );
}
