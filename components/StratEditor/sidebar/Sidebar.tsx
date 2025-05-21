"use client";
import { Button } from "@/components/ui/button";
import StratEditorOperatorsSidebar from "./Operator";
import {
  CircleUserRound,
  Fingerprint,
  Info,
  LayoutGrid,
  UsersRound,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMemo, useState } from "react";
import StratEditorGadgetsSidebar from "./Gadgets";

export interface StratEditorSidebarProps {
  onAssetAdd: (asset: Asset) => void;
}

export default function StratEditorSidebar(
  props: Readonly<StratEditorSidebarProps>
) {
  const [openTab, setOpenTab] = useState<
    | "meta"
    | "player-ops"
    | "operator-gadgets"
    | "layout-assets"
    | "operator-assets"
  >("meta");

  const sidebarContent = useMemo(() => {
    switch (openTab) {
      case "operator-assets":
        return (
          <StratEditorOperatorsSidebar
            onAssetAdd={props.onAssetAdd}
            selectedOPs={[]}
          />
        );
      case "operator-gadgets":
        return (
          <StratEditorGadgetsSidebar
            onAssetAdd={props.onAssetAdd}
            selectedOPs={[]}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No content available</p>
          </div>
        );
    }
  }, [openTab, props.onAssetAdd]);

  return (
    <div className="flex flex-1">
      <div className="flex flex-col h-screen">
        {/* Meta data (name, description) */}
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpenTab("meta")}
            >
              <Info />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="flex flex-col">
              <p className="text-sm">Strat Meta Info</p>
              <p className="text-xs text-muted-foreground">
                Set the name and description of the strat
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
        {/* player OPs */}
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpenTab("player-ops")}
            >
              <UsersRound />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="flex flex-col">
              <p className="text-sm">Operator Lineup</p>
              <p className="text-xs text-muted-foreground">
                Select what operators you want to bring and which player will
                pick them
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
        {/* operator gadget assets */}
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpenTab("operator-gadgets")}
            >
              <Fingerprint />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="flex flex-col">
              <p className="text-sm">Operator Gadgets</p>
              <p className="text-xs text-muted-foreground">
                Add primary and secondary operator gadgets.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
        {/* layout assets - rotate, reinforcement */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpenTab("layout-assets")}
            >
              <LayoutGrid />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="flex flex-col">
              <p className="text-sm">Layout Assets</p>
              <p className="text-xs text-muted-foreground">
                Add rotates, headholes, barricades or reinforcements
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
        {/* operator assets - extra operators */}
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpenTab("operator-assets")}
            >
              <CircleUserRound />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="flex flex-col">
              <p className="text-sm">Add Operators</p>
              <p className="text-xs text-muted-foreground">
                Add an operators or player locators to the map.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
      <Separator orientation="vertical" className="h-full" />
      <div className="flex-1 relative">{sidebarContent}</div>
    </div>
  );
}
