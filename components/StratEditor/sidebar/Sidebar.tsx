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
import { useCallback, useEffect, useMemo, useState } from "react";
import StratEditorGadgetsSidebar from "./Gadgets";
import StratEditorMetaSidebar from "./Meta";
import { cn } from "@/src/utils";

export interface StratEditorSidebarProps {
  onAssetAdd: (asset: Asset) => void;
  strat: Strat;
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

  const sidebarContent = useMemo(() => {
    switch (openTab) {
      case "operator-assets":
        return (
          <StratEditorOperatorsSidebar
            onAssetAdd={onAssetAdd}
            selectedOPs={[]}
          />
        );
      case "operator-gadgets":
        return (
          <StratEditorGadgetsSidebar onAssetAdd={onAssetAdd} selectedOPs={[]} />
        );
      case "meta":
        return <StratEditorMetaSidebar strat={props.strat} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No content available</p>
          </div>
        );
    }
  }, [openTab, onAssetAdd, props.strat]);

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
      </div>
      <Separator orientation="vertical" className="h-full" />
      <div
        className={cn(
          "bg-background flex-1 h-full absolute xl:relative transition-[left] duration-300 max-lg:w-[50vw]",
          sidebarOpen ? "max-lg:left-[100%]" : "max-lg:-left-[50vw]"
        )}
      >
        {sidebarContent}
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
}) {
  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={props.active ? "default" : "ghost"}
          onClick={props.onClick}
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
