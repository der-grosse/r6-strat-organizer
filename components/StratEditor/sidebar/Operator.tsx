"use client";
import { ATTACKERS, DEFENDERS } from "@/lib/static/operator";
import { Badge } from "../../ui/badge";
import { ScrollArea } from "../../ui/scroll-area";
import OperatorIcon from "../../general/OperatorIcon";
import { DEFAULT_COLORS } from "@/lib/static/colors";
import { Asset, OperatorAsset } from "@/lib/types/asset.types";
import { StratPositions } from "@/lib/types/strat.types";
import DraggableAssetButton from "./DraggableAssetButton";

export interface StratEditorOperatorsSidebarProps {
  onAssetAdd: (asset: Omit<Asset, "_id">) => void;
  stratPositions: StratPositions[];
}

export default function StratEditorOperatorsSidebar(
  props: Readonly<StratEditorOperatorsSidebarProps>,
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
          <Badge className="sticky top-0 w-full col-span-full">Defenders</Badge>
          {DEFENDERS.map((op) => (
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
                  customColor: DEFAULT_COLORS.at(-1),
                } as Omit<OperatorAsset, "_id">
              }
            >
              <OperatorIcon op={op} />
            </DraggableAssetButton>
          ))}
          <Badge className="sticky top-0 w-full col-span-full">Attackers</Badge>
          {ATTACKERS.map((op) => (
            <DraggableAssetButton
              variant="outline"
              key={op.name}
              className="p-1 h-auto"
              onAssetAdd={props.onAssetAdd}
              asset={
                {
                  operator: op.name,
                  type: "operator",
                  side: "att",
                  iconType: "bw",
                  customColor: DEFAULT_COLORS.at(-1),
                } as Omit<OperatorAsset, "_id">
              }
            >
              <OperatorIcon op={op} />
            </DraggableAssetButton>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
