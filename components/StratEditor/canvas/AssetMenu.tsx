import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlacedAsset } from "@/lib/types/asset.types";
import { StratPositions } from "@/lib/types/strat.types";
import { FullTeam } from "@/lib/types/team.types";
import { cn } from "@/lib/utils";
import {
  ALargeSmall,
  ArrowLeft,
  ArrowRight,
  Ban,
  Brush,
  EyeOff,
  ImageIcon,
  TextCursorInput,
  Trash,
  UserRound,
  UserRoundPen,
} from "lucide-react";
import { Fragment } from "react";
import MultiOptionSelector from "./MultiOptionSelector";
import Reinforcement from "@/components/icons/reinforcement";
import Explosion from "../assets/Explosion";
import Rotation from "@/components/icons/rotation";
import WoodenBarricade from "@/components/icons/woodenBarricade";
import GadgetIcon from "@/components/general/GadgetIcon";
import { DEFENDERS } from "@/lib/static/operator";

export interface AssetMenuProps {
  selectedAssets: PlacedAsset[];
  team: FullTeam;
  stratPositions: StratPositions[];
  updateAssets: (assets: PlacedAsset[]) => void;
  deleteAssets: (assets: PlacedAsset[]) => void;
  openColorPickerForAssets: (assets: PlacedAsset[]) => void;
  openTextEditorForAsset?: (asset: PlacedAsset) => void;
  openImageUrlEditorForAsset?: (asset: PlacedAsset) => void;
}

export default function AssetMenu({
  selectedAssets,
  team,
  stratPositions,
  updateAssets,
  deleteAssets,
  openColorPickerForAssets,
  openTextEditorForAsset,
  openImageUrlEditorForAsset,
}: AssetMenuProps) {
  const assetStratPosition = stratPositions.find((op) =>
    selectedAssets.every((asset) => asset.stratPositionID === op._id),
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
                  (p) => p._id === m.teamPositionID,
                )!,
              }))
              .filter((m) => m.position)
              .sort((a, b) => a.position.index - b.position.index)
              .map(({ member }) => {
                const stratPositionOfMember = stratPositions?.find(
                  (stratPos) =>
                    stratPos.teamPositionID === member.teamPositionID,
                );
                if (!stratPositionOfMember) return null;
                return (
                  <Tooltip key={member._id}>
                    <TooltipTrigger asChild>
                      <Button
                        disabled={!stratPositionOfMember}
                        size="icon"
                        variant="ghost"
                        className={cn(
                          member.teamPositionID ===
                            assetStratPosition?.teamPositionID &&
                            "bg-card dark:hover:bg-card",
                        )}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => {
                          const allAlreadySetToThisPosition =
                            selectedAssets.every(
                              (asset) =>
                                asset.stratPositionID ===
                                stratPositionOfMember._id,
                            );
                          updateAssets(
                            selectedAssets.map((asset) => ({
                              ...asset,
                              stratPositionID: allAlreadySetToThisPosition
                                ? undefined
                                : stratPositionOfMember._id,
                              customColor: undefined,
                            })),
                          );
                        }}
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full",
                            !member.defaultColor &&
                              "outline-2 outline-offset-1 outline-muted",
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
                            (p) => p._id === member.teamPositionID,
                          )?.positionName
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
          </Fragment>,
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
                "bg-card dark:hover:bg-card",
            )}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => openColorPickerForAssets(selectedAssets)}
          >
            <Brush />
          </Button>,
        );
        break;
      case "operator-icon-type": {
        const iconTypes = selectedAssets
          .map((asset) => (asset.type === "operator" ? asset.iconType : null!))
          .filter(Boolean);
        const mainIconType = iconTypes.reduce(
          (acc, type) => (acc === type ? acc : null),
          iconTypes[0] as (typeof iconTypes)[0] | null,
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
                })),
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
          </Button>,
        );
        break;
      }
      case "hatch-type": {
        const variants = selectedAssets
          .map((asset) => (asset.type === "layout" ? asset.variant : null!))
          .filter(Boolean);
        const mainVariant = variants.reduce(
          (acc, type) => (acc === type ? acc : null),
          variants[0] as (typeof variants)[0] | null,
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
                })),
              );
            }}
          />,
        );
        break;
      }
      case "door-type": {
        const types = selectedAssets
          .map((asset) => getDoorType(asset)!)
          .filter(Boolean);
        const mainVariant = types.reduce<(typeof types)[0] | null>(
          (acc, type) => (acc === type ? acc : null),
          types[0],
        );
        sections.push(
          <MultiOptionSelector
            key="door-type"
            options={[
              {
                id: "barricade",
                label: "Barricade",
                icon: <WoodenBarricade className="w-[16px] h-[16px]" />,
              },
              {
                id: "armor_panel",
                label: "Castle Barricade",
                icon: (
                  <GadgetIcon id="armor_panel" className="w-[16px] h-[16px]" />
                ),
              },
              {
                id: "surya_gate",
                label: "Aruni Gate",
                icon: (
                  <GadgetIcon id="surya_gate" className="w-[16px] h-[16px]" />
                ),
              },
            ]}
            selected={mainVariant}
            onSelect={(id) => {
              updateAssets(
                selectedAssets.map((asset) => {
                  if (getDoorType(asset) === null) return asset; // don't change other selected assets that are not doors

                  const baseAsset = {
                    position: asset.position,
                    size: asset.size,
                    rotation: asset.rotation,
                    _id: asset._id,
                    stratPositionID: asset.stratPositionID,
                    customColor: asset.customColor,
                  };

                  if (id === "barricade") {
                    return {
                      ...baseAsset,
                      type: "layout",
                      variant: "barricade",
                      placedOn:
                        asset.type === "layout" ? asset.placedOn : undefined,
                    };
                  } else {
                    const operatorOfGadget = DEFENDERS.find(
                      (o) => "gadget" in o && o.gadget === id,
                    )?.name;
                    // find the strat position that has that operator picked at the lowest index
                    const stratPositionId = stratPositions
                      .map((s) => ({
                        operatorIndex: s.pickedOperators.findIndex(
                          (o) => o.operator === operatorOfGadget,
                        ),
                        id: s._id,
                      }))
                      .sort((a, b) => a.operatorIndex - b.operatorIndex)
                      .find((i) => i.operatorIndex !== -1)?.id;

                    return {
                      ...baseAsset,
                      type: "gadget",
                      gadget: id,
                      stratPositionID: stratPositionId ?? asset.stratPositionID,
                    };
                  }
                }),
              );
            }}
          />,
        );
        break;
      }
      case "rotation-type": {
        const variants = selectedAssets
          .map((asset) => (asset.type === "layout" ? asset.variant : null!))
          .filter(Boolean);
        const mainVariant = variants.reduce(
          (acc, type) => (acc === type ? acc : null),
          variants[0] as (typeof variants)[0] | null,
        );
        sections.push(
          <MultiOptionSelector
            key="rotation-type"
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
                selectedAssets.map((asset) => {
                  if (asset.type !== "layout") return asset;
                  // change size of asset when default aspect ration of layout variant changes
                  // reinforcements are wide while rotates are square
                  // change the height accordingly to keep the same width, so the asset doesn't look stretched or squished
                  // recenter the asset position to keep it centered on the same point
                  const oldVariant =
                    asset.type === "layout" ? asset.variant : null;
                  const oldAspectRatio = oldVariant
                    ? LAYOUT_VARIANT_ASPECT_RATIO[oldVariant]
                    : 1;
                  const newAspectRatio = LAYOUT_VARIANT_ASPECT_RATIO[id];
                  const aspectRatioDiff = newAspectRatio / oldAspectRatio;
                  const newHeight = asset.size.height / aspectRatioDiff;

                  const heightChange = asset.size.height - newHeight;

                  const changes =
                    aspectRatioDiff !== 1
                      ? {
                          size: {
                            ...asset.size,
                            height: newHeight,
                          },
                          position: {
                            ...asset.position,
                            y: asset.position.y + heightChange / 2,
                          },
                          rotation:
                            oldVariant === "reinforcement" &&
                            id !== "reinforcement"
                              ? 0
                              : asset.rotation, // reset rotation for non-reinforcement variants, since they look weird when rotated and don't have a specific rotation variant
                        }
                      : undefined;

                  return {
                    ...asset,
                    variant: id,
                    ...changes,
                  };
                }),
              );
            }}
          />,
        );
        break;
      }
      case "divider":
        sections.push(
          <div key={`divider-${index}`} className="bg-border w-[1px] h-6" />,
        );
        break;
      case "arrow-heads": {
        const arrows = selectedAssets.filter((a) => a.type === "arrow");
        if (arrows.length === 0) break;
        const allStartHeads = arrows.every(
          (a) => a.type === "arrow" && a.startArrowHead,
        );
        const allEndHeads = arrows.every(
          (a) => a.type === "arrow" && a.endArrowHead,
        );
        sections.push(
          <Fragment key="arrow-heads">
            <Button
              size="icon"
              variant="ghost"
              className={cn(allStartHeads && "bg-card dark:hover:bg-card")}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() =>
                updateAssets(
                  selectedAssets.map((asset) =>
                    asset.type === "arrow"
                      ? { ...asset, startArrowHead: !allStartHeads }
                      : asset,
                  ),
                )
              }
            >
              <ArrowLeft />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={cn(allEndHeads && "bg-card dark:hover:bg-card")}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() =>
                updateAssets(
                  selectedAssets.map((asset) =>
                    asset.type === "arrow"
                      ? { ...asset, endArrowHead: !allEndHeads }
                      : asset,
                  ),
                )
              }
            >
              <ArrowRight />
            </Button>
          </Fragment>,
        );
        break;
      }
      case "text-edit": {
        const textboxAsset = selectedAssets.find((a) => a.type === "textbox");
        if (textboxAsset && openTextEditorForAsset) {
          sections.push(
            <Button
              key="text-edit"
              size="icon"
              variant="ghost"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => openTextEditorForAsset(textboxAsset)}
            >
              <TextCursorInput />
            </Button>,
          );
        }
        break;
      }
      case "font-size": {
        const textAssets = selectedAssets.filter((a) => a.type === "textbox");
        if (textAssets.length > 0) {
          sections.push(
            <MultiOptionSelector
              key="font-size"
              options={[4, 8, 10, 12, 14, 16, 24, 32, 48, 72, 144].map((e) => ({
                label: e.toString(),
                id: e,
                icon: e,
              }))}
              onSelect={(fontSize) =>
                updateAssets(
                  selectedAssets.map((asset) =>
                    asset.type === "textbox"
                      ? {
                          ...asset,
                          fontSize: Number(fontSize),
                        }
                      : asset,
                  ),
                )
              }
              selected={
                textAssets[0].type === "textbox" ? textAssets[0].fontSize : null
              }
              fixedSelectedIcon={<ALargeSmall className="size-6" />}
            />,
          );
        }
        break;
      }
      case "text-background": {
        const textAssets = selectedAssets.filter((a) => a.type === "textbox");
        if (textAssets.length > 0) {
          const currentBg =
            textAssets[0].type === "textbox"
              ? (textAssets[0].background ?? "none")
              : "none";
          sections.push(
            <MultiOptionSelector
              key="text-background"
              options={[
                {
                  id: "none" as const,
                  label: "No background",
                  icon: <Ban className="size-4" />,
                },
                {
                  id: "light" as const,
                  label: "Light background",
                  icon: (
                    <div className="w-4 h-4 rounded-sm bg-white border border-neutral-300" />
                  ),
                },
                {
                  id: "dark" as const,
                  label: "Dark background",
                  icon: (
                    <div className="w-4 h-4 rounded-sm bg-black border border-neutral-600" />
                  ),
                },
              ]}
              selected={currentBg}
              onSelect={(id) => {
                updateAssets(
                  selectedAssets.map((asset) =>
                    asset.type === "textbox"
                      ? { ...asset, background: id }
                      : asset,
                  ),
                );
              }}
            />,
          );
        }
        break;
      }
      case "image-url": {
        const imageAsset = selectedAssets.find((a) => a.type === "image");
        if (imageAsset && openImageUrlEditorForAsset) {
          sections.push(
            <Button
              key="image-url"
              size="icon"
              variant="ghost"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => openImageUrlEditorForAsset(imageAsset)}
            >
              <ImageIcon />
            </Button>,
          );
        }
        break;
      }
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
          </Button>,
        );
    }
  }

  return (
    <div
      className={cn(
        "absolute bottom-0 left-[50%] -translate-x-1/2 bg-muted text-muted-foreground rounded-lg flex items-center justify-center scale-200 origin-bottom z-100 h-9 pointer-events-auto",
      )}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {sections}
    </div>
  );
}

type MenuItemID =
  | "strat-position"
  | "color-picker"
  | "operator-icon-type"
  | "rotation-type"
  | "door-type"
  | "hatch-type"
  | "arrow-heads"
  | "text-edit"
  | "font-size"
  | "text-background"
  | "image-url"
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
  "arrow-heads",
  "text-edit",
  "font-size",
  "text-background",
  "image-url",
  "divider",
  "delete",
];
const LAYOUT_VARIANT_ASPECT_RATIO: Record<string, number> = {
  full: 1,
  crouch: 1,
  jump: 1,
  headholes: 1,
  floorholes: 1,
  ceilingholes: 1,
  reinforcement: 3 / 2,
  explosion: 1,
};

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
      } else if (asset.placedOn !== "door" && asset.variant !== "barricade") {
        ids.add("rotation-type");
      }
    }
    if (getDoorType(asset)) {
      ids.add("door-type");
    }
    if (asset.type === "textbox") {
      ids.add("text-edit");
      ids.add("font-size");
      ids.add("text-background");
    }
    if (asset.type === "arrow") {
      ids.add("arrow-heads");
    }
    if (asset.type === "image") {
      ids.add("image-url");
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
    },
  );
}

function getDoorType(asset: PlacedAsset) {
  if (asset.type === "layout") {
    if (asset.variant === "barricade") return "barricade";
    return null;
  }
  if (asset.type === "gadget") {
    if (asset.gadget === "armor_panel" || asset.gadget === "surya_gate") {
      return asset.gadget;
    }
    return null;
  }
  return null;
}

function getNextOperatorIconType(
  current: "default" | "hidden" | "bw" | undefined | null,
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
