"use client";
import { Button } from "@/components/ui/button";
import StratEditorOperatorsSidebar from "./Operator";
import {
  ChessRook,
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
import { useCallback, useMemo, useState } from "react";
import StratEditorGadgetsSidebar from "./Gadgets";
import StratEditorMetaSidebar from "./Meta";
import { cn } from "@/lib/utils";
import Reinforcement from "@/components/icons/reinforcement";
import { MAX_REINFORCEMENT } from "@/lib/static/general";
import Link from "next/link";
import StratEditorPlayerPositionsSidebar from "./StratPositions";
import StratEditorLayoutSidebar from "./Layout";
import { getAssetColor } from "../canvas/useMountedAssets";
import { ColorButton } from "@/components/general/ColorPickerDialog";
import { Asset, PlacedAsset } from "@/lib/types/asset.types";
import { Strat } from "@/lib/types/strat.types";
import { FullTeam, TeamMember, TeamPosition } from "@/lib/types/team.types";
import { Id } from "@/convex/_generated/dataModel";

export interface StratEditorSidebarProps {
  onAssetAdd: (asset: Omit<Asset & Partial<PlacedAsset>, "_id">) => void;
  strat: Strat;
  assets: PlacedAsset[];
  team: FullTeam;
  hideAssets?: boolean;
}

export default function StratEditorSidebar(
  props: Readonly<StratEditorSidebarProps>,
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
    (asset: Omit<Asset, "_id">) => {
      props.onAssetAdd(asset);
      setSidebarOpen(false);
    },
    [props.onAssetAdd],
  );

  const placedReeinforcements = useMemo(
    () =>
      Array.from(
        props.assets
          .filter((a) => a.type === "layout" && a.variant === "reinforcement")
          .reduce(
            (acc, asset) => {
              const cur = asset.stratPositionID
                ? acc.get(asset.stratPositionID)
                : undefined;
              if (cur) {
                acc.set(asset.stratPositionID!, {
                  ...cur,
                  count: cur.count + 1,
                });
              } else {
                acc.set("unassigned", {
                  position: null,
                  player: null,
                  color: null,
                  count: (acc.get("unassigned")?.count ?? 0) + 1,
                });
              }
              return acc;
            },
            new Map<
              Id<"stratPositions"> | "unassigned",
              {
                position: TeamPosition | null;
                player: TeamMember | null;
                color: string | null;
                count: number;
              }
            >([
              ...props.strat.stratPositions.map((stratPos) => {
                const position =
                  props.team.teamPositions.find(
                    (teamPos) => teamPos._id === stratPos.teamPositionID,
                  ) ?? null;
                const player =
                  props.team.members.find(
                    (m) => m._id === position?.playerID,
                  ) ?? null;
                return [
                  stratPos._id,
                  {
                    position,
                    player,
                    color:
                      getAssetColor(
                        { stratPositionID: stratPos._id },
                        props.strat.stratPositions,
                        props.team,
                      ) ?? null,
                    count: 0 as number,
                  },
                ] as const;
              }),
            ]),
          )
          .values(),
      ),
    [props.strat, props.assets],
  );

  const sidebarContent = useMemo(() => {
    switch (openTab) {
      case "meta":
        return <StratEditorMetaSidebar strat={props.strat} team={props.team} />;
      case "operator-assets":
        return (
          <StratEditorOperatorsSidebar
            onAssetAdd={onAssetAdd}
            stratPositions={props.strat.stratPositions}
          />
        );
      case "operator-gadgets":
        return (
          <StratEditorGadgetsSidebar
            onAssetAdd={onAssetAdd}
            stratPositions={props.strat.stratPositions}
          />
        );
      case "player-ops":
        return (
          <StratEditorPlayerPositionsSidebar
            strat={props.strat}
            team={props.team}
          />
        );
      case "layout-assets":
        return <StratEditorLayoutSidebar onAssetAdd={onAssetAdd} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No content available</p>
          </div>
        );
    }
  }, [openTab, onAssetAdd, props.strat, props.team]);

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
        {!props.hideAssets && (
          <SidebarButton
            icon={<Fingerprint />}
            onClick={() => {
              setOpenTab("operator-gadgets");
              setSidebarOpen((open) =>
                openTab === "operator-gadgets" ? !open : true,
              );
            }}
            tooltip={{
              title: "Operator Gadgets",
              description: "Add primary and secondary operator gadgets",
            }}
            active={openTab === "operator-gadgets"}
          />
        )}
        {/* layout assets - rotate, reinforcement */}
        {!props.hideAssets && (
          <SidebarButton
            icon={<LayoutGrid />}
            onClick={() => {
              setOpenTab("layout-assets");
              setSidebarOpen((open) =>
                openTab === "layout-assets" ? !open : true,
              );
            }}
            tooltip={{
              title: "Layout Assets",
              description:
                "Add rotates, headholes, barricades or reinforcements",
            }}
            active={openTab === "layout-assets"}
          />
        )}
        {/* operator assets - extra operators */}
        {!props.hideAssets && (
          <SidebarButton
            icon={<ChessRook />}
            onClick={() => {
              setOpenTab("operator-assets");
              setSidebarOpen((open) =>
                openTab === "operator-assets" ? !open : true,
              );
            }}
            tooltip={{
              title: "Operator Assets",
              description: "Add operators or player locators to the map",
            }}
            active={openTab === "operator-assets"}
          />
        )}
        <div className="flex-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex gap-1 p-1 items-center cursor-default">
              <span className="text-xs text-muted-foreground text-right">
                {MAX_REINFORCEMENT -
                  placedReeinforcements
                    .map((v) => v.count)
                    .reduce((a, b) => a + b, 0)}
              </span>
              <div className="flex-1">
                <Reinforcement color="white" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="text-sm">
              {MAX_REINFORCEMENT -
                placedReeinforcements
                  .map((v) => v.count)
                  .reduce((a, b) => a + b, 0)}{" "}
              Reinforcements remaining
            </p>
            {placedReeinforcements
              .filter((p) => p.count > 0)
              .map((p) => (
                <div
                  className="flex items-center gap-1 mt-1"
                  key={p.position?._id ?? -1}
                >
                  <p className="w-4">{p.count}x</p>
                  {p.player ? (
                    <>
                      <ColorButton disabled color={p.color} size="small" />
                      <p>{p.player.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.position?.positionName}
                      </p>
                    </>
                  ) : (
                    <p>
                      <em>No player assigned</em>
                    </p>
                  )}
                </div>
              ))}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
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
          "bg-background flex-1 h-full absolute xl:relative transition-[left] duration-300 max-xl:w-(--sidebar-width) border-r border-border",
          sidebarOpen ? "max-xl:left-[100%]" : "max-xl:-left-(--sidebar-width)",
        )}
      >
        {sidebarContent}
        <div
          className={cn(
            "xl:hidden w-screen h-full absolute top-0 left-[100%]",
            !sidebarOpen && "hidden",
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
    <Tooltip>
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
