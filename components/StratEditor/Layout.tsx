"use client";
import { Menu, Save } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Separator } from "../ui/separator";
import { useState } from "react";
import StratEditorSidebar, { StratEditorSidebarProps } from "./sidebar/Sidebar";

export default function StratEditorLayout(
  props: Readonly<
    {
      children: React.ReactNode;
    } & StratEditorSidebarProps
  >
) {
  // only used for small screen
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebar = (
    <StratEditorSidebar
      onAssetAdd={(...args) => {
        props.onAssetAdd(...args);
        setSidebarOpen(false);
      }}
      strat={props.strat}
    />
  );

  return (
    <div className="h-screen w-screen overflow-hidden xl:grid xl:grid-cols-[1fr_4fr]">
      {/* small screen sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden absolute top-2 left-2 z-10"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0" hideClose>
          <SheetTitle className="sr-only">Toolbar</SheetTitle>
          {sidebar}
        </SheetContent>
      </Sheet>

      {/* large screen sidebar */}
      <div className="hidden xl:flex flex-row">
        {sidebar}
        <Separator orientation="vertical" className="mx-2 hidden xl:block" />
      </div>

      {/* Canvas */}
      <div className="flex-1 relative h-screen overflow-hidden py-0 block">
        <div className="relative h-full w-full flex items-center justify-center">
          {props.children}
        </div>
      </div>

      {/* Save Button */}
      <Button
        className="absolute top-4 right-4"
        size="icon"
        onClick={() => {
          alert("Not implemented");
        }}
      >
        <Save />
      </Button>
    </div>
  );
}
