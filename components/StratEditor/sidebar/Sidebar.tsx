"use client";
import { Button } from "@/components/ui/button";
import StratEditorOperatorsSidebar from "./Operator";
import {
  CircleUserRound,
  DoorOpen,
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
import { useCallback, useEffect, useMemo, useState } from "react";
import StratEditorGadgetsSidebar from "./Gadgets";
import StratEditorMetaSidebar from "./Meta";
import { cn } from "@/src/utils";
import Reinforcement from "@/components/icons/reinforcement";
import { MAX_REINFORCEMENT } from "@/src/static/general";
import Link from "next/link";
import StratEditorPlayerOperatorsSidebar from "./PlayerOPs";
import { TeamMember } from "@/src/auth/team";
import config from "@/src/static/config";

export interface StratEditorSidebarProps {
  onAssetAdd: (asset: Asset) => void;
  strat: Strat;
  teamMembers: TeamMember[];
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

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onAssetAdd = useCallback(
    (asset: Asset) => {
      props.onAssetAdd(asset);
      setSidebarOpen(false);
    },
    [props.onAssetAdd]
  );

  const placedReeinforcements = useMemo(
    () => props.strat.assets.filter((a) => a.type === "reinforcement").length,
    [props.strat.assets]
  );

  const sidebarContent = useMemo(() => {
    switch (openTab) {
      case "operator-assets":
        return (
          <StratEditorOperatorsSidebar
            onAssetAdd={onAssetAdd}
            selectedOPs={props.strat.operators
              .map((op) => ({
                id: op.operator,
                player: op.player,
              }))
              .filter(Boolean)}
          />
        );
      case "operator-gadgets":
        return (
          <StratEditorGadgetsSidebar
            onAssetAdd={onAssetAdd}
            selectedOPs={props.strat.operators
              .map((op) => ({
                id: op.operator,
                player: op.player,
              }))
              .filter(Boolean)}
          />
        );
      case "meta":
        return <StratEditorMetaSidebar strat={props.strat} />;
      case "player-ops":
        return (
          <StratEditorPlayerOperatorsSidebar
            strat={props.strat}
            teamMembers={props.teamMembers}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No content available</p>
          </div>
        );
    }
  }, [openTab, onAssetAdd, props.strat, props.teamMembers]);

  return (
    <div className="flex relative z-10">
      <div className="flex flex-col h-screen z-10 bg-background">
        {/* Meta data (name, description) */}
        <SidebarButton
          icon={<Info />}
          onClick={() => {
            setOpenTab("meta");
            setSidebarOpen((open) => (openTab === "meta" ? !open : true));
          }}
          tooltip={{
            title: "Strat Meta Info",
            description: "Set the name and description of the strat",
          }}
          active={openTab === "meta"}
        />
        {/* player OPs */}
        <SidebarButton
          icon={<UsersRound />}
          onClick={() => {
            setOpenTab("player-ops");
            setSidebarOpen((open) => (openTab === "player-ops" ? !open : true));
          }}
          tooltip={{
            title: "Operator Lineup",
            description:
              "Select what operators you want to bring and which player will pick them",
          }}
          active={openTab === "player-ops"}
        />
        {/* operator gadget assets */}
        <SidebarButton
          disabled={config.disabledFeatures.includes("editor")}
          icon={<Fingerprint />}
          onClick={() => {
            setOpenTab("operator-gadgets");
            setSidebarOpen((open) =>
              openTab === "operator-gadgets" ? !open : true
            );
          }}
          tooltip={{
            title: "Operator Gadgets",
            description: "Add primary and secondary operator gadgets",
          }}
          active={openTab === "operator-gadgets"}
        />
        {/* layout assets - rotate, reinforcement */}
        <SidebarButton
          disabled={config.disabledFeatures.includes("editor")}
          icon={<LayoutGrid />}
          onClick={() => {
            setOpenTab("layout-assets");
            setSidebarOpen((open) =>
              openTab === "layout-assets" ? !open : true
            );
          }}
          tooltip={{
            title: "Layout Assets",
            description: "Add rotates, headholes, barricades or reinforcements",
          }}
          active={openTab === "layout-assets"}
        />
        {/* operator assets - extra operators */}
        <SidebarButton
          disabled={config.disabledFeatures.includes("editor")}
          icon={<CircleUserRound />}
          onClick={() => {
            setOpenTab("operator-assets");
            setSidebarOpen((open) =>
              openTab === "operator-assets" ? !open : true
            );
          }}
          tooltip={{
            title: "Operator Assets",
            description: "Add operators or player locators to the map",
          }}
          active={openTab === "operator-assets"}
        />
        <div className="flex-1" />
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <div className="flex gap-1 p-1 items-center">
              <span className="text-sm text-muted-foreground text-right">
                {MAX_REINFORCEMENT - placedReeinforcements}
              </span>
              <div className="h-2.5 flex-1">
                <Reinforcement color="white" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="text-sm">
              {MAX_REINFORCEMENT - placedReeinforcements} Reinforcements
              remaining
            </p>
          </TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Link href="/">
              <Button size="icon" variant="ghost">
                <DoorOpen />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="text-sm">Leave editor</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <Separator orientation="vertical" className="h-full" />
      <div
        style={{ "--sidebar-width": "min(90vw, 20rem)" } as React.CSSProperties}
        className={cn(
          "bg-background flex-1 h-full absolute xl:relative transition-[left] duration-300 max-xl:w-(--sidebar-width)",
          sidebarOpen ? "max-xl:left-[100%]" : "max-xl:-left-(--sidebar-width)"
        )}
      >
        {sidebarContent}
        <div
          className={cn(
            "xl:hidden w-screen h-full absolute top-0 left-[100%]",
            !sidebarOpen && "hidden"
          )}
          onClick={() => setSidebarOpen(false)}
        />
      </div>
    </div>
  );
}

function SidebarButton(props: {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: {
    title: string;
    description: string;
  };
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={props.active ? "default" : "ghost"}
          onClick={props.onClick}
          disabled={props.disabled}
        >
          {props.icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <div className="flex flex-col">
          <p className="text-sm">{props.tooltip.title}</p>
          <p className="text-xs text-muted-foreground">
            {props.tooltip.description}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
