"use client";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FilterProvider } from "./context/FilterContext";
import { Filter } from "./context/FilterContext.functions";
import { UserProvider } from "./context/UserContext";

export interface AppLayoutProps {
  children: React.ReactNode;
  cookieFilter?: Filter;
  jwt?: string;
  defaultLeading?: boolean;
}

export default function AppLayout(props: AppLayoutProps) {
  return (
    <UserProvider jwt={props.jwt}>
      <FilterProvider
        defaultFilter={props.cookieFilter}
        defaultLeading={props.defaultLeading}
      >
        <SidebarProvider defaultOpen>
          <AppSidebar />
          <SidebarInset>
            <SidebarTrigger className="absolute top-2 left-2 z-10 cursor-pointer" />
            {props.children}
          </SidebarInset>
        </SidebarProvider>
      </FilterProvider>
    </UserProvider>
  );
}
