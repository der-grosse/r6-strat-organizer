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
import { Fragment, useCallback, useMemo, useState } from "react";
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
import MultiOptionSelector from "./MultiOptionSelector";

export default function useMountAssets(
  {
    team,
    stratPositions,
  }: { team: FullTeam; stratPositions: StratPositions[] },
  {
    deleteAssets,
    updateAssets,
  }: {
    deleteAssets: (assets: PlacedAsset[]) => void;
    updateAssets: (assets: PlacedAsset[]) => void;
  }
) {
  const { user } = useUser();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerAssets, setColorPickerAssets] = useState<
    PlacedAsset[] | null
  >(null);

  const menu = useCallback(
    (selectedAssets: PlacedAsset[]) => {
      const assetStratPosition = stratPositions.find((op) =>
        selectedAssets.every((asset) => asset.stratPositionID === op._id)
      );

      const menuItemIDs = getMenuItemsIDs(selectedAssets);

      const sections: React.ReactNode[] = [];
      for (const [index, id] of Object.entries(menuItemIDs)) {
        switch (id) {
          case "strat-position":
            sections.push(
              <Fragment key="strat-position">
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
                      (stratPos) =>
                        stratPos.teamPositionID === member.teamPositionID
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
                              updateAssets(
                                selectedAssets.map((asset) => ({
                                  ...asset,
                                  stratPositionID: stratPositionOfMember._id,
                                  customColor: undefined,
                                }))
                              );
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
              </Fragment>
            );
            break;
          case "color-picker":
            sections.push(
              <Button
                key="color-picker"
                size="icon"
                variant="ghost"
                className={cn(
                  selectedAssets.every((asset) => asset.customColor) &&
                    "bg-card dark:hover:bg-card"
                )}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => {
                  setColorPickerAssets(selectedAssets);
                  setColorPickerOpen(true);
                }}
              >
                <Brush />
              </Button>
            );
            break;
          case "operator-icon-type": {
            const iconTypes = selectedAssets
              .map((asset) =>
                asset.type === "operator" ? asset.iconType : null!
              )
              .filter(Boolean);
            const mainIconType = iconTypes.reduce(
              (acc, type) => (acc === type ? acc : null),
              iconTypes[0] as (typeof iconTypes)[0] | null
            );
            sections.push(
              <Button
                key="operator-icon-type"
                size="icon"
                variant="ghost"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => {
                  updateAssets(
                    selectedAssets.map((asset) => ({
                      ...asset,
                      iconType: getNextOperatorIconType(mainIconType),
                    }))
                  );
                }}
              >
                {mainIconType === "hidden" ? (
                  <EyeOff />
                ) : mainIconType === "bw" ? (
                  <UserRound />
                ) : (
                  <UserRoundPen />
                )}
              </Button>
            );
            break;
          }
          case "hatch-type": {
            const variants = selectedAssets
              .map((asset) => (asset.type === "layout" ? asset.variant : null!))
              .filter(Boolean);
            const mainVariant = variants.reduce(
              (acc, type) => (acc === type ? acc : null),
              variants[0] as (typeof variants)[0] | null
            );
            sections.push(
              <MultiOptionSelector
                key="hatch-type"
                options={[
                  {
                    id: "reinforcement",
                    label: "Reinforcement",
                    icon: <Reinforcement width={16} height={16} />,
                  },
                  {
                    id: "explosion",
                    label: "Explosion",
                    icon: <Explosion className="w-6 h-6" />,
                  },
                ]}
                selected={
                  mainVariant === "reinforcement" || mainVariant === "explosion"
                    ? mainVariant
                    : null
                }
                onSelect={(id) => {
                  updateAssets(
                    selectedAssets.map((asset) => ({
                      ...asset,
                      ...(asset.type === "layout" && {
                        variant: id,
                      }),
                    }))
                  );
                }}
              />
            );
            break;
          }
          case "rotation-type": {
            const variants = selectedAssets
              .map((asset) => (asset.type === "layout" ? asset.variant : null!))
              .filter(Boolean);
            const mainVariant = variants.reduce(
              (acc, type) => (acc === type ? acc : null),
              variants[0] as (typeof variants)[0] | null
            );
            sections.push(
              <MultiOptionSelector
                key="hatch-type"
                options={[
                  {
                    id: "reinforcement",
                    label: "Reinforcement",
                    icon: <Reinforcement width={16} height={16} />,
                  },
                  ...(
                    [
                      "full",
                      "crouch",
                      "jump",
                      "headholes",
                      "floorholes",
                      "ceilingholes",
                    ] as const
                  ).map((id) => ({
                    id,
                    label: id,
                    icon: <Rotation className="w-6 h-6" variant={id} />,
                  })),
                  {
                    id: "explosion",
                    label: "Explosion",
                    icon: <Explosion className="w-6 h-6" />,
                  },
                ]}
                selected={mainVariant === "barricade" ? null : mainVariant}
                onSelect={(id) => {
                  updateAssets(
                    selectedAssets.map((asset) => ({
                      ...asset,
                      ...(asset.type === "layout" && {
                        variant: id,
                      }),
                    }))
                  );
                }}
              />
            );
            break;
          }
          case "divider":
            sections.push(
              <div key={`divider-${index}`} className="bg-border w-[1px] h-6" />
            );
            break;
          case "delete":
            sections.push(
              <Button
                key="delete-asset"
                size="icon"
                variant="ghost"
                onClick={() => deleteAssets(selectedAssets)}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Trash />
              </Button>
            );
        }
      }

      return (
        <div
          className={cn(
            "absolute bottom-[110%] left-[50%] -translate-x-1/2 bg-muted text-muted-foreground rounded flex items-center justify-center scale-200 origin-bottom z-100 h-9"
          )}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {sections}
        </div>
      );
    },
    [team, stratPositions, deleteAssets, updateAssets]
  );

  const colorPickerDialog = useMemo(
    () => (
      <ColorPickerDialog
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        onChange={(color) => {
          updateAssets(
            colorPickerAssets!.map((asset) => ({
              ...asset,
              stratPositionID: undefined,
              customColor: color,
            }))
          );
          setColorPickerOpen(false);
        }}
        color={
          colorPickerAssets?.reduce(
            (acc, asset) => (acc === asset.customColor ? acc : undefined),
            colorPickerAssets[0]?.customColor
          ) ?? ""
        }
      />
    ),
    [colorPickerOpen, colorPickerAssets, updateAssets]
  );

  const renderAsset = useCallback(
    function renderAsset(
      asset: PlacedAsset,
      selectedAssets: PlacedAsset[],
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
            ? menu(selectedAssets)
            : undefined,
        asset: fullAsset,
      };
    },
    [menu, team, stratPositions]
  );

  return { renderAsset, UI: colorPickerDialog };
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

type MenuItemID =
  | "strat-position"
  | "color-picker"
  | "operator-icon-type"
  | "rotation-type"
  | "door-type"
  | "hatch-type"
  | "delete"
  | "divider";
const MENU_ITEM_IDS_ORDER: MenuItemID[] = [
  "strat-position",
  "color-picker",
  "divider",
  "operator-icon-type",
  "hatch-type",
  "rotation-type",
  "door-type",
  "divider",
  "delete",
];

function getMenuItemsIDs(assets: PlacedAsset[]): MenuItemID[] {
  const ids = new Set<MenuItemID>([
    "strat-position",
    "color-picker",
    "delete",
    "divider",
  ]);
  for (const asset of assets) {
    if (asset.type === "layout") {
      if (asset.placedOn === "hatch") {
        ids.add("hatch-type");
      } else if (asset.placedOn === "door" || asset.variant === "barricade") {
        ids.add("door-type");
      } else {
        ids.add("rotation-type");
      }
    }
  }
  return MENU_ITEM_IDS_ORDER.filter((id) => ids.has(id)).filter(
    (id, idx, arr) => {
      // remove divider if it's the first or last item, or if the previous item is also a divider
      if (id === "divider") {
        if (idx === 0 || idx === arr.length - 1) return false;
        if (arr[idx - 1] === "divider") return false;
      }
      return true;
    }
  );
}
