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
import { Asset, GadgetAsset, PlacedAsset } from "@/lib/types/asset.types";
import { StratPositions } from "@/lib/types/strat.types";
import DraggableAssetButton from "./DraggableAssetButton";
import { Id } from "@/convex/_generated/dataModel";

export interface StratEditorGadgetsSidebarProps {
  onAssetAdd: (asset: Omit<Asset & Partial<PlacedAsset>, "_id">) => void;
  stratPositions: StratPositions[];
  activeStratPositionID: Id<"stratPositions"> | null;
  assets: PlacedAsset[];
}

export default function StratEditorGadgetsSidebar(
  props: Readonly<StratEditorGadgetsSidebarProps>,
) {
  return (
    <div className="h-full absolute inset-0">
      <ScrollArea className="h-full p-2">
        <div
          className="grid gap-2 items-center pb-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(42px, 1fr))",
          }}
        >
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
        placed: assets.filter(
          (a) =>
            a.stratPositionID === position._id &&
            a.type === "gadget" &&
            a.gadget === gadget.id,
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
      g.positions.find(
        (p) =>
          p.placed < g.gadget.count && p.position._id === activeStratPositionID,
      )?.position._id ??
      // any strat position that has this gadget with available count
      g.positions.find((p) => p.placed < g.gadget.count)?.position._id ??
      // active strat position that has this gadget
      activeStratPositionID ??
      null,
  }));
}
