"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("SidebarLayout");
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger className="absolute top-2 left-2 z-10 cursor-pointer" />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
