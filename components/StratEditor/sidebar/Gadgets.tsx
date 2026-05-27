"use client";
import {
  DEFENDER_PRIMARY_GADGETS,
  DEFENDER_SECONDARY_GADGETS,
  DEFENDERS,
} from "@/lib/static/operator";
import { Badge } from "../../ui/badge";
import { ScrollArea } from "../../ui/scroll-area";
import PrimaryGadgetIcon from "@/components/general/PrimaryGadgetIcon";
import SecondaryGadgetIcon from "@/components/general/SecondaryGadgetIcon";
import { ASSET_BASE_SIZE } from "../canvas/Canvas";
import { Asset, GadgetAsset, PlacedAsset } from "@/lib/types/asset.types";
import { StratPositions } from "@/lib/types/strat.types";
import DraggableAssetButton from "./DraggableAssetButton";
import { Id } from "@/convex/_generated/dataModel";

export interface StratEditorGadgetsSidebarProps {
  onAssetAdd: (asset: Omit<Asset & Partial<PlacedAsset>, "_id">) => void;
  stratPositions: StratPositions[];
  activeStratPositionID: Id<"stratPositions"> | null;
}

export default function StratEditorGadgetsSidebar(
  props: Readonly<StratEditorGadgetsSidebarProps>,
) {
  const selectedOperators = props.stratPositions
    .flatMap((position) => {
      const operators = DEFENDERS.filter((def) =>
        position.pickedOperators.some((op) => op.operator === def.name),
      );
      return operators.map((op) => ({ ...op, stratPositionID: position._id }));
    })
    .filter(Boolean);
  const selectedPrimaryGadetIDs = selectedOperators
    .map((op) =>
      "gadget" in op
        ? {
            id: op.gadget,
            stratPositionID: op.stratPositionID,
            gadget: DEFENDER_PRIMARY_GADGETS.find((g) => g.id === op.gadget),
          }
        : undefined!,
    )
    .filter(Boolean);
  const selectedSecondaryGadgets = (() => {
    const gadgets = props.stratPositions
      .map((position) => {
        const gadgetIDs = position.pickedOperators.flatMap((op) => [
          op.secondaryGadget,
          ...("tertiaryGadgets" in op ? [op.tertiaryGadget] : []),
        ]);
        return {
          gadgets: DEFENDER_SECONDARY_GADGETS.filter((g) =>
            gadgetIDs.includes(g.id),
          )!,
          position,
        };
      })
      .flatMap(({ gadgets, position }) =>
        gadgets.map((gadget) => ({
          gadget,
          position,
        })),
      );

    // prevent duplicates
    const assignedGadgets = gadgets.filter(
      (g1, i, gadgets) =>
        !gadgets.some((g2, j) => g1.gadget.id === g2.gadget.id && i > j),
    );

    const activeAssignedGadgets = assignedGadgets.map(
      (g) =>
        gadgets.find(
          (g1) =>
            g1.gadget.id === g.gadget.id &&
            g1.position._id === props.activeStratPositionID,
        ) ?? g,
    );
    return activeAssignedGadgets;
  })();

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
              <Badge className="sticky top-0 w-full col-span-full">
                Selected primary gadgets
              </Badge>
              {selectedPrimaryGadetIDs.map((gadget) => (
                <DraggableAssetButton
                  variant="outline"
                  key={gadget.id}
                  className="p-1 h-auto"
                  onAssetAdd={props.onAssetAdd}
                  asset={
                    {
                      type: "gadget",
                      gadget: gadget.id,
                      stratPositionID: gadget.stratPositionID,
                      size: {
                        width: ASSET_BASE_SIZE,
                        height:
                          ASSET_BASE_SIZE * (gadget.gadget?.aspectRatio ?? 1),
                      },
                    } as Omit<GadgetAsset, "_id">
                  }
                >
                  <PrimaryGadgetIcon id={gadget.id} />
                </DraggableAssetButton>
              ))}
            </>
          )}
          {selectedSecondaryGadgets.length > 0 && (
            <>
              <Badge className="sticky top-0 w-full col-span-full">
                Selected secondary gadgets
              </Badge>
              {selectedSecondaryGadgets.map(({ gadget, position }) => (
                <DraggableAssetButton
                  variant="outline"
                  key={gadget.id}
                  className="p-1 h-auto"
                  onAssetAdd={props.onAssetAdd}
                  asset={
                    {
                      type: "gadget",
                      gadget: gadget.id,
                      stratPositionID: position._id,
                      size: {
                        width: ASSET_BASE_SIZE,
                        height: ASSET_BASE_SIZE * (gadget.aspectRatio ?? 1),
                      },
                    } as Omit<GadgetAsset, "_id">
                  }
                >
                  <SecondaryGadgetIcon id={gadget.id} />
                </DraggableAssetButton>
              ))}
            </>
          )}
          <Badge className="sticky top-0 w-full col-span-full">
            Primary Gadgets
          </Badge>
          {DEFENDER_PRIMARY_GADGETS.map((gadget) => (
            <DraggableAssetButton
              variant="outline"
              key={gadget.id}
              className="p-1 h-auto"
              onAssetAdd={props.onAssetAdd}
              asset={
                {
                  type: "gadget",
                  gadget: gadget.id,
                  size: {
                    width: ASSET_BASE_SIZE,
                    height: ASSET_BASE_SIZE * (gadget.aspectRatio ?? 1),
                  },
                } as Omit<GadgetAsset, "_id">
              }
            >
              <PrimaryGadgetIcon id={gadget.id} />
            </DraggableAssetButton>
          ))}
          <Badge className="sticky top-0 w-full col-span-full">
            Secondary Gadgets
          </Badge>
          {DEFENDER_SECONDARY_GADGETS.map((gadget) => (
            <DraggableAssetButton
              variant="outline"
              key={gadget.id}
              className="p-1 h-auto"
              onAssetAdd={props.onAssetAdd}
              asset={
                {
                  type: "gadget",
                  gadget: gadget.id,
                  size: {
                    width: ASSET_BASE_SIZE,
                    height: ASSET_BASE_SIZE * (gadget.aspectRatio ?? 1),
                  },
                } as Omit<GadgetAsset, "_id">
              }
            >
              <SecondaryGadgetIcon id={gadget.id} />
            </DraggableAssetButton>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
