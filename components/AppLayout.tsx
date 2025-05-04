"use client";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FilterProvider } from "./FilterContext";

export interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout(props: AppLayoutProps) {
  return (
    <FilterProvider>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset>
          <SidebarTrigger className="absolute top-2 left-2" />
          {props.children}
        </SidebarInset>
      </SidebarProvider>
    </FilterProvider>
  );
}
