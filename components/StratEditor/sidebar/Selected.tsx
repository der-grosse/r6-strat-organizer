"use client";
import {
  DEFENDER_PRIMARY_GADGETS,
  DEFENDER_SECONDARY_GADGETS,
  DEFENDERS,
  DefenderSecondaryGadget,
} from "@/lib/static/operator";
import { Badge } from "../../ui/badge";
import { ScrollArea } from "../../ui/scroll-area";
import PrimaryGadgetIcon from "@/components/general/PrimaryGadgetIcon";
import SecondaryGadgetIcon from "@/components/general/SecondaryGadgetIcon";
import { ASSET_BASE_SIZE } from "../canvas/Canvas";
import {
  ArrowAsset,
  Asset,
  GadgetAsset,
  ImageAsset,
  LayoutAsset,
  OperatorAsset,
  PlacedAsset,
  TextboxAsset,
} from "@/lib/types/asset.types";
import { StratPositions } from "@/lib/types/strat.types";
import DraggableAssetButton from "./DraggableAssetButton";
import { Id } from "@/convex/_generated/dataModel";
import OperatorIcon from "@/components/general/OperatorIcon";
import Reinforcement from "@/components/icons/reinforcement";
import WoodenBarricade from "@/components/icons/woodenBarricade";
import Rotation from "@/components/icons/rotation";
import Explosion from "../assets/Explosion";
import { ImageIcon, MoveUpRight, Type } from "lucide-react";

export interface StratEditorSelectedElementsSidebarProps {
  onAssetAdd: (asset: Omit<Asset & Partial<PlacedAsset>, "_id">) => void;
  stratPositions: StratPositions[];
  activeStratPositionID: Id<"stratPositions"> | null;
  assets: PlacedAsset[];
}

export default function StratEditorSelectedElementsSidebar(
  props: Readonly<StratEditorSelectedElementsSidebarProps>,
) {
  const rawSelectedOperators = props.stratPositions
    .flatMap((stratPos) => {
      const operators = DEFENDERS.filter((def) =>
        stratPos.pickedOperators.some((op) => op.operator === def.name),
      );
      return operators.map((operator) => ({
        ...operator,
        stratPositionID: stratPos._id,
      }));
    })
    .filter(Boolean);
  const selectedOperators = rawSelectedOperators.filter(
    (v, i, a) => a.findIndex((t) => t.name === v.name) === i,
  ); // Prune duplicate operators
  const selectedPrimaryGadetIDs = rawSelectedOperators
    .map((op) =>
      "gadget" in op
        ? {
            id: op.gadget,
            stratPositionID: op.stratPositionID,
            gadget: DEFENDER_PRIMARY_GADGETS.find((g) => g.id === op.gadget),
            placed: props.assets.filter(
              (a) =>
                a.stratPositionID === op.stratPositionID &&
                a.type === "gadget" &&
                a.gadget === op.gadget,
            ).length,
          }
        : undefined!,
    )
    .filter(Boolean)
    .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i); // Prune duplicate gadgets
  const selectedSecondaryGadgets = mapSecondaryGadgetsToStratPositions(
    props.stratPositions,
    props.assets,
    props.activeStratPositionID,
  );

  return (
    <div className="h-full absolute inset-0">
      <ScrollArea className="h-full p-2">
        <div
          className="grid gap-2 items-center pb-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(42px, 1fr))",
          }}
        >
          {selectedPrimaryGadetIDs.length > 0 && (
            <>
              <Badge className="sticky top-0 w-full col-span-full">Selected primary gadgets</Badge>
              {selectedPrimaryGadetIDs.map((gadget) => (
                <DraggableAssetButton
                  variant="outline"
                  key={gadget.id}
                  className="p-1 h-auto relative"
                  onAssetAdd={props.onAssetAdd}
                  asset={
                    {
                      type: "gadget",
                      gadget: gadget.id,
                      stratPositionID: gadget.stratPositionID,
                      size: {
                        width: ASSET_BASE_SIZE,
                        height: ASSET_BASE_SIZE * (gadget.gadget?.aspectRatio ?? 1),
                      },
                    } as Omit<GadgetAsset, "_id">
                  }
                >
                  <PrimaryGadgetIcon id={gadget.id} />
                  <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {(gadget.gadget?.count ?? 0) - gadget.placed}
                  </div>
                </DraggableAssetButton>
              ))}
            </>
          )}
          {selectedSecondaryGadgets.length > 0 && (
            <>
              <Badge className="sticky top-0 w-full col-span-full">
                Selected secondary gadgets
              </Badge>
              {selectedSecondaryGadgets.map(({ gadget, nextStratPositionId, total, placed }) => (
                <DraggableAssetButton
                  key={gadget.id}
                  variant="outline"
                  className="p-1 h-auto relative"
                  onAssetAdd={props.onAssetAdd}
                  asset={
                    {
                      type: "gadget",
                      gadget: gadget.id,
                      stratPositionID: nextStratPositionId ?? undefined,
                      size: {
                        width: ASSET_BASE_SIZE,
                        height: ASSET_BASE_SIZE * (gadget.aspectRatio ?? 1),
                      },
                    } as Omit<GadgetAsset, "_id">
                  }
                >
                  <SecondaryGadgetIcon id={gadget.id} />
                  <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {total - placed}
                  </div>
                </DraggableAssetButton>
              ))}
            </>
          )}
          {selectedOperators.length > 0 && (
            <>
              <Badge className="sticky top-0 w-full col-span-full">Selected OPs</Badge>
              {selectedOperators.map((op) => (
                <DraggableAssetButton
                  variant="outline"
                  key={op.name}
                  className="p-1 h-auto"
                  onAssetAdd={props.onAssetAdd}
                  asset={
                    {
                      operator: op.name,
                      type: "operator",
                      side: "def",
                      iconType: "bw",
                      stratPositionID: op.stratPositionID,
                    } as Omit<OperatorAsset, "_id">
                  }
                >
                  <OperatorIcon op={op} />
                </DraggableAssetButton>
              ))}
            </>
          )}
        </div>
        <div
          className="grid gap-2 items-center pb-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(32px, 1fr))",
          }}
        >
          <Badge className="sticky top-0 w-full col-span-full">Reinforcements</Badge>
          <DraggableAssetButton
            variant="outline"
            size="unset"
            key="reinforcement"
            className="p-1 h-auto aspect-square"
            onAssetAdd={props.onAssetAdd}
            asset={
              {
                type: "layout",
                variant: "reinforcement",
              } as Omit<LayoutAsset, "_id">
            }
          >
            <Reinforcement className="size-full" />
          </DraggableAssetButton>
          <DraggableAssetButton
            variant="outline"
            size="unset"
            key="barricade"
            className="p-1 h-auto aspect-square"
            onAssetAdd={props.onAssetAdd}
            asset={
              {
                type: "layout",
                variant: "barricade",
              } as Omit<LayoutAsset, "_id">
            }
          >
            <WoodenBarricade className="size-4" />
          </DraggableAssetButton>
          <Badge className="sticky top-0 w-full col-span-full">Rotate and Headholes</Badge>
          {(["full", "crouch", "jump", "headholes", "floorholes", "ceilingholes"] as const).map(
            (variant) => (
              <DraggableAssetButton
                variant="outline"
                size="unset"
                key={`rotate-${variant}`}
                className="p-1 h-auto aspect-square"
                onAssetAdd={props.onAssetAdd}
                asset={
                  {
                    type: "layout",
                    variant,
                  } as Omit<LayoutAsset, "_id">
                }
              >
                <Rotation variant={variant} className="size-full" />
              </DraggableAssetButton>
            ),
          )}
          <DraggableAssetButton
            variant="outline"
            size="unset"
            key="rotate-explosion"
            className="p-1 h-auto aspect-square"
            onAssetAdd={props.onAssetAdd}
            asset={
              {
                type: "layout",
                variant: "explosion",
              } as Omit<LayoutAsset, "_id">
            }
          >
            <Explosion />
          </DraggableAssetButton>
          <Badge className="sticky top-0 w-full col-span-full">Annotations</Badge>
          <DraggableAssetButton
            variant="outline"
            size="unset"
            key="textbox"
            className="p-1 h-auto aspect-square"
            onAssetAdd={props.onAssetAdd}
            asset={
              {
                type: "textbox",
                text: "Text",
                fontSize: 16,
                background: "none",
                size: { width: 80, height: 40 },
              } as Omit<TextboxAsset, "_id">
            }
          >
            <Type className="size-full" />
          </DraggableAssetButton>
          <DraggableAssetButton
            variant="outline"
            size="unset"
            key="arrow"
            className="p-1 h-auto aspect-square"
            onAssetAdd={props.onAssetAdd}
            asset={
              {
                type: "arrow",
                startCorner: "bl",
                startArrowHead: false,
                endArrowHead: true,
                size: { width: 160, height: 100 },
              } as Omit<ArrowAsset, "_id">
            }
          >
            <MoveUpRight className="size-full" />
          </DraggableAssetButton>
          <DraggableAssetButton
            variant="outline"
            size="unset"
            key="image"
            className="p-1 h-auto aspect-square"
            onAssetAdd={props.onAssetAdd}
            asset={
              {
                type: "image",
                url: "",
                size: { width: 120, height: 120 },
              } as Omit<ImageAsset, "_id">
            }
          >
            <ImageIcon className="size-full" />
          </DraggableAssetButton>
        </div>
      </ScrollArea>
    </div>
  );
}

function mapSecondaryGadgetsToStratPositions(
  stratPositions: StratPositions[],
  assets: Asset[],
  activeStratPositionID: Id<"stratPositions"> | null,
): {
  gadget: DefenderSecondaryGadget;
  positions: { position: StratPositions; placed: number }[];
  total: number;
  placed: number;
  nextStratPositionId: Id<"stratPositions"> | null;
}[] {
  const gadgets = stratPositions
    .map((position) => {
      const gadgetIDs = position.pickedOperators.flatMap((op) => [
        op.secondaryGadget,
        ...("tertiaryGadget" in op ? [op.tertiaryGadget] : []),
      ]);
      return {
        gadgets: DEFENDER_SECONDARY_GADGETS.filter((g) => gadgetIDs.includes(g.id))!,
        position,
      };
    })
    .flatMap(({ gadgets, position }) =>
      gadgets.map((gadget) => ({
        gadget,
        position,
        placed: assets.filter(
          (a) =>
            a.stratPositionID === position._id && a.type === "gadget" && a.gadget === gadget.id,
        ).length,
      })),
    );

  const gadgetMap: Record<
    string,
    {
      gadget: DefenderSecondaryGadget;
      positions: { position: StratPositions; placed: number }[];
      placed: number;
    }
  > = {};
  gadgets.forEach(({ gadget, position, placed }) => {
    if (!gadgetMap[gadget.id]) {
      gadgetMap[gadget.id] = {
        gadget,
        positions: [{ position, placed }],
        placed,
      };
    } else {
      gadgetMap[gadget.id].positions.push({ position, placed });
      gadgetMap[gadget.id].placed += placed;
    }
  });

  const sortedGadgets = Object.values(gadgetMap).sort((a, b) =>
    b.gadget.name.localeCompare(a.gadget.name),
  );

  return sortedGadgets.map((g) => ({
    ...g,
    total: g.positions.length * g.gadget.count,
    nextStratPositionId:
      // active strat position that has this gadget with available count
      g.positions.find((p) => p.placed < g.gadget.count && p.position._id === activeStratPositionID)
        ?.position._id ??
      // any strat position that has this gadget with available count
      g.positions.find((p) => p.placed < g.gadget.count)?.position._id ??
      // active strat position that has this gadget
      activeStratPositionID ??
      null,
  }));
}
