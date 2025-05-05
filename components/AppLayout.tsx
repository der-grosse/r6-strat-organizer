"use client";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FilterProvider } from "./FilterContext";
import { Filter } from "./FilterContext.functions";

export interface AppLayoutProps {
  children: React.ReactNode;
  cookieFilter?: Filter;
}

export default function AppLayout(props: AppLayoutProps) {
  return (
    <FilterProvider defaultFilter={props.cookieFilter}>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset>
          <SidebarTrigger className="absolute top-2 left-2 z-10 cursor-pointer" />
          {props.children}
        </SidebarInset>
      </SidebarProvider>
    </FilterProvider>
  );
}
