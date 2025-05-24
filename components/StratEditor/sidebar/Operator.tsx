"use client";
import { DefenderPrimaryGadget, DEFENDERS } from "@/src/static/operator";
import { Badge } from "../../ui/badge";
import { ScrollArea } from "../../ui/scroll-area";
import { Button } from "../../ui/button";
import OperatorIcon from "../../OperatorIcon";

export interface StratEditorOperatorsSidebarProps {
  onAssetAdd: (asset: Asset) => void;
  operators: PickedOperator[];
}

export default function StratEditorOperatorsSidebar(
  props: Readonly<StratEditorOperatorsSidebarProps>
) {
  const selectedOperators = props.operators
    .map((op) => {
      const operator = DEFENDERS.find((def) => def.name === op.operator);
      if (!operator) return null!;
      return {
        ...operator,
        pickedOPID: op.id,
      };
    })
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
                      showIcon: true,
                      pickedOPID: op.pickedOPID,
                    });
                  }}
                >
                  <OperatorIcon op={op} />
                </Button>
              ))}
            </>
          )}
          <Badge className="sticky top-0 w-full col-span-full">Defenders</Badge>
          {DEFENDERS.map((op) => (
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
                  showIcon: true,
                });
              }}
            >
              <OperatorIcon op={op} />
            </Button>
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
                      showIcon: true,
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
