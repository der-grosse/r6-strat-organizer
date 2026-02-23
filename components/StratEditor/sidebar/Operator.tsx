"use client";
import { DEFENDERS } from "@/lib/static/operator";
import { Badge } from "../../ui/badge";
import { ScrollArea } from "../../ui/scroll-area";
import { Button } from "../../ui/button";
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
  const selectedOperators = props.stratPositions
    .flatMap((stratPos) => {
      const operators = DEFENDERS.filter((def) =>
        stratPos.pickedOperators.some((op) => op.operator === def.name),
      );
      return operators.map((operator) => ({
        ...operator,
        stratPositionID: stratPos._id,
      }));
    })
    .filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i) // Prune duplicate operators
    .filter(Boolean);

  return (
    <div className="h-full absolute inset-0">
      <ScrollArea className="h-full p-2">
        <div
          className="grid gap-2 items-center pb-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(42px, 1fr))",
          }}
        >
          {selectedOperators.length > 0 && (
            <>
              <Badge className="sticky top-0 w-full col-span-full">
                Selected OPs
              </Badge>
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
          {/* <Badge className="sticky top-0 w-full col-span-full">
                Attackers
              </Badge>
              {ATTACKERS.map((op) => (
                <Button
                  variant="outline"
                  key={op.name}
                  className="p-1 h-auto"
                  onClick={() => {
                    props.onAssetAdd({
                      id: `operator-${op.name}`,
                      operator: op.name,
                      type: "operator",
                      side: "def",
                      iconType: "bw",
                    });
                  }}
                >
                  <OperatorIcon op={op} />
                </Button>
              ))} */}
        </div>
      </ScrollArea>
    </div>
  );
}
