import {
  Brush,
  EyeOff,
  GripVertical,
  Trash,
  UserRound,
  UserRoundPen,
} from "lucide-react";
import { Button } from "../../ui/button";
import Operator from "../assets/Operator";
import { cn } from "@/lib/utils";
import { useCallback, useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import GadgetIcon from "../../general/GadgetIcon";
import AssetOutline from "../assets/AssetOutline";
import Reinforcement from "../../icons/reinforcement";
import Rotation from "../../icons/rotation";
import Explosion from "../assets/Explosion";
import WoodenBarricade from "../../icons/woodenBarricade";
import { useUser } from "../../context/UserContext";
import ColorPickerDialog from "../../general/ColorPickerDialog";
import { FullTeam, TeamMember } from "@/lib/types/team.types";
import { StratPositions } from "@/lib/types/strat.types";
import { PlacedAsset } from "@/lib/types/asset.types";
import { Id } from "@/convex/_generated/dataModel";

export default function useMountAssets(
  {
    team,
    stratPositions,
  }: { team: FullTeam; stratPositions: StratPositions[] },
  {
    deleteAsset,
    updateAsset,
  }: {
    deleteAsset: (asset: PlacedAsset) => void;
    updateAsset: (asset: PlacedAsset) => void;
  }
) {
  const { user } = useUser();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerAsset, setColorPickerAsset] = useState<PlacedAsset | null>(
    null
  );

  const menu = useCallback(
    (asset: PlacedAsset) => {
      const assetStratPosition = stratPositions.find(
        (op) => op._id === asset.stratPositionID
      );
      return (
        <div
          className={cn(
            "absolute bottom-[110%] left-[50%] -translate-x-1/2 bg-muted text-muted-foreground rounded flex items-center justify-center scale-200 origin-bottom z-100"
          )}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="cursor-grab" />
          <div className="bg-border w-[1px] h-6" />
          {team.members
            .map((m) => ({
              member: m,
              position: team.teamPositions.find(
                (p) => p._id === m.teamPositionID
              )!,
            }))
            .filter((m) => m.position)
            .sort((a, b) => a.position.index - b.position.index)
            .map(({ member }) => {
              const stratPositionOfMember = stratPositions?.find(
                (stratPos) => stratPos.teamPositionID === member.teamPositionID
              );
              if (!stratPositionOfMember) return null;
              return (
                <Tooltip delayDuration={200} key={member._id}>
                  <TooltipTrigger asChild>
                    <Button
                      disabled={!stratPositionOfMember}
                      size="icon"
                      variant="ghost"
                      className={cn(
                        member.teamPositionID ===
                          assetStratPosition?.teamPositionID &&
                          "bg-card dark:hover:bg-card"
                      )}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => {
                        updateAsset({
                          ...asset,
                          stratPositionID: stratPositionOfMember?._id,
                          customColor: undefined,
                        });
                      }}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          !member.defaultColor &&
                            "outline-2 outline-offset-1 outline-muted"
                        )}
                        style={{
                          background: member.defaultColor ?? undefined,
                        }}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-sm">
                      {member.name} |{" "}
                      {
                        team.teamPositions.find(
                          (p) => p._id === member.teamPositionID
                        )?.positionName
                      }
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          <Button
            size="icon"
            variant="ghost"
            className={cn(asset.customColor && "bg-card dark:hover:bg-card")}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              setColorPickerAsset(asset);
              setColorPickerOpen(true);
            }}
          >
            <Brush />
          </Button>
          <div className="bg-border w-[1px] h-6" />
          {asset.type === "operator" && (
            <Button
              size="icon"
              variant="ghost"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                updateAsset({
                  ...asset,
                  iconType: getNextOperatorIconType(asset.iconType),
                });
              }}
            >
              {asset.iconType === "default" ? (
                <UserRoundPen />
              ) : asset.iconType === "bw" ? (
                <UserRound />
              ) : (
                <EyeOff />
              )}
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => deleteAsset(asset)}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Trash />
          </Button>
        </div>
      );
    },
    [team, stratPositions, deleteAsset, updateAsset]
  );

  const dialog = useMemo(
    () => (
      <ColorPickerDialog
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        onChange={(color) => {
          updateAsset({
            ...colorPickerAsset!,
            stratPositionID: undefined,
            customColor: color,
          });
          setColorPickerOpen(false);
        }}
        color={colorPickerAsset?.customColor ?? ""}
      />
    ),
    [colorPickerOpen, colorPickerAsset, updateAsset]
  );

  const renderAsset = useCallback(
    function renderAsset(
      asset: PlacedAsset,
      selectedBy: TeamMember["_id"][],
      latestSelected: boolean
    ) {
      const assetElement = (() => {
        switch (asset.type) {
          case "operator":
            return (
              <Operator
                asset={asset}
                team={team}
                stratPositions={stratPositions}
              />
            );
          case "gadget":
            return (
              <AssetOutline
                asset={asset}
                team={team}
                stratPositions={stratPositions}
              >
                <GadgetIcon id={asset.gadget} className="h-full w-full" />
              </AssetOutline>
            );
          //@ts-expect-error -- for legacy types, should not occur after migration
          case "reinforcement":
          //@ts-expect-error
          case "rotate":
          case "layout":
            if (asset.variant === "barricade") {
              return (
                <AssetOutline
                  asset={asset}
                  team={team}
                  stratPositions={stratPositions}
                >
                  <WoodenBarricade />
                </AssetOutline>
              );
            } else if (asset.variant === "reinforcement") {
              return (
                <Reinforcement
                  height={asset.size.height}
                  width={asset.size.width}
                  color={getAssetColor(asset, stratPositions, team)}
                />
              );
            } else if (asset.variant === "explosion") {
              return (
                <Explosion color={getAssetColor(asset, stratPositions, team)} />
              );
            } else {
              return (
                <Rotation
                  variant={asset.variant}
                  height={asset.size.height}
                  width={asset.size.width}
                  color={getAssetColor(asset, stratPositions, team)}
                />
              );
            }
          default:
            return <>Missing Asset</>;
        }
      })();
      const fullAsset = (() => {
        if (
          selectedBy.length === 0 ||
          selectedBy.every((id) => id === user?._id)
        ) {
          return assetElement;
        } else {
          const shadowColors = selectedBy
            .filter((id) => id !== user?._id)
            .map((id) => team.members.find((m) => m._id === id)?.defaultColor!)
            .filter(Boolean);
          return (
            <div
              style={{
                boxShadow: shadowColors.length
                  ? shadowColors.map((c) => `0 0 .4rem .3rem ${c}`).join(", ")
                  : undefined,
              }}
              className="size-full"
              title={`Selected by ${selectedBy
                .map((id) => team.members.find((m) => m._id === id)?.name)
                .join(", ")}`}
            >
              {assetElement}
            </div>
          );
        }
      })();
      return {
        menu:
          user && latestSelected && selectedBy.includes(user._id as Id<"users">)
            ? menu(asset)
            : undefined,
        asset: fullAsset,
      };
    },
    [menu, team, stratPositions]
  );

  return { renderAsset, UI: dialog };
}

function getNextOperatorIconType(
  current: "default" | "hidden" | "bw" | undefined | null
): "default" | "hidden" | "bw" {
  switch (current) {
    case "default":
      return "hidden";
    case "hidden":
      return "bw";
    case "bw":
      return "default";
    default:
      return "default";
  }
}

export function getAssetColor(
  asset: Pick<PlacedAsset, "customColor" | "stratPositionID">,
  stratPositions: StratPositions[],
  team: FullTeam
): string | undefined {
  if (asset.customColor) return asset.customColor;
  if (!asset.stratPositionID) return undefined;
  const pickedOP = stratPositions.find(
    (op) => op._id === asset.stratPositionID
  );
  if (!pickedOP) return undefined;
  const postion = team.teamPositions.find(
    (pos) => pos._id === pickedOP.teamPositionID
  );
  if (!postion) return undefined;
  const teamMember = team.members.find(
    (member) => member._id === postion.playerID
  );
  return teamMember?.defaultColor ?? undefined;
}
