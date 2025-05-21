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
  const sidebar = (
    <StratEditorSidebar
      onAssetAdd={(...args) => {
        props.onAssetAdd(...args);
      }}
      strat={props.strat}
    />
  );

  return (
    <div className="h-screen w-screen overflow-hidden grid grid-cols-[auto_1fr] xl:grid-cols-[1fr_4fr]">
      {sidebar}

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
