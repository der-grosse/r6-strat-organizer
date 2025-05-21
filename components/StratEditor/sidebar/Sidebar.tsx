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
import StratEditorMetaSidebar from "./Meta";

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
      case "meta":
        return <StratEditorMetaSidebar strat={props.strat} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No content available</p>
          </div>
        );
    }
  }, [openTab, props.onAssetAdd, props.strat]);

  return (
    <div className="flex flex-1">
      <div className="flex flex-col h-screen">
        {/* Meta data (name, description) */}
        <SidebarButton
          icon={<Info />}
          onClick={() => setOpenTab("meta")}
          tooltip={{
            title: "Strat Meta Info",
            description: "Set the name and description of the strat",
          }}
          active={openTab === "meta"}
        />
        {/* player OPs */}
        <SidebarButton
          icon={<UsersRound />}
          onClick={() => setOpenTab("player-ops")}
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
          onClick={() => setOpenTab("operator-gadgets")}
          tooltip={{
            title: "Operator Gadgets",
            description: "Add primary and secondary operator gadgets",
          }}
          active={openTab === "operator-gadgets"}
        />
        {/* layout assets - rotate, reinforcement */}
        <SidebarButton
          icon={<LayoutGrid />}
          onClick={() => setOpenTab("layout-assets")}
          tooltip={{
            title: "Layout Assets",
            description: "Add rotates, headholes, barricades or reinforcements",
          }}
          active={openTab === "layout-assets"}
        />
        {/* operator assets - extra operators */}
        <SidebarButton
          icon={<CircleUserRound />}
          onClick={() => setOpenTab("operator-assets")}
          tooltip={{
            title: "Operator Assets",
            description: "Add operators or player locators to the map",
          }}
          active={openTab === "operator-assets"}
        />
      </div>
      <Separator orientation="vertical" className="h-full" />
      <div className="flex-1 relative">{sidebarContent}</div>
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
