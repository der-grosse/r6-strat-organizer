"use client";
import {
  DEFENDER_PRIMARY_GADGETS,
  DEFENDER_SECONDARY_GADGETS,
  DEFENDERS,
} from "@/src/static/operator";
import { Badge } from "../../ui/badge";
import { ScrollArea } from "../../ui/scroll-area";
import { Button } from "../../ui/button";
import PrimaryGadgetIcon from "@/components/PrimaryGadgetIcon";
import SecondaryGadgetIcon from "@/components/SecondaryGadgetIcon";
import { Separator } from "@/components/ui/separator";

export interface StratEditorGadgetsSidebarProps {
  onAssetAdd: (asset: Asset) => void;
  selectedOPs: { id: string; player?: number }[];
}

export default function StratEditorGadgetsSidebar(
  props: Readonly<StratEditorGadgetsSidebarProps>
) {
  const selectedOperators = props.selectedOPs
    .map((op) => {
      const operator = DEFENDERS.find((def) => def.name === op.id);
      if (!operator) return null!;
      return {
        ...operator,
        player: op.player,
      };
    })
    .filter(Boolean);
  const selectedPrimaryGadetIDs = selectedOperators
    .map((op) =>
      "gadget" in op ? { id: op.gadget?.id, player: op.player } : undefined!
    )
    .filter(Boolean);
  const selectedSecondaryGadgetIDs = selectedOperators
    .flatMap((op) =>
      "secondaryGadgets" in op
        ? op.secondaryGadgets?.map((g) => ({
            id: g,
            player: op.player,
          })) ?? []
        : []
    )
    // prevent duplicates
    .filter(
      (g1, i, gadgets) => !gadgets.some((g2, j) => g1.id === g2.id && i > j)
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
              <Badge className="sticky top-0 w-full col-span-full">
                Selected primary gadgets
              </Badge>
              {selectedPrimaryGadetIDs.map((gadget) => (
                <Button
                  variant="outline"
                  key={gadget.id}
                  className="p-1 h-auto"
                  onClick={() => {
                    props.onAssetAdd({
                      id: `gadget-${gadget.id}`,
                      type: "gadget",
                      gadget: gadget.id,
                      player: gadget.player,
                    });
                  }}
                >
                  <PrimaryGadgetIcon id={gadget.id} />
                </Button>
              ))}
            </>
          )}
          {selectedSecondaryGadgetIDs.length > 0 && (
            <>
              <Badge className="sticky top-0 w-full col-span-full">
                Selected primary gadgets
              </Badge>
              {selectedSecondaryGadgetIDs.map((gadget) => (
                <Button
                  variant="outline"
                  key={gadget.id}
                  className="p-1 h-auto"
                  onClick={() => {
                    props.onAssetAdd({
                      id: `gadget-${gadget.id}`,
                      type: "gadget",
                      gadget: gadget.id,
                      player: gadget.player,
                    });
                  }}
                >
                  <SecondaryGadgetIcon id={gadget.id} />
                </Button>
              ))}
            </>
          )}
          <Badge className="sticky top-0 w-full col-span-full">
            Primary Gadgets
          </Badge>
          {DEFENDER_PRIMARY_GADGETS.map((gadget) => (
            <Button
              variant="outline"
              key={gadget}
              className="p-1 h-auto"
              onClick={() => {
                props.onAssetAdd({
                  id: `gadget-${gadget}`,
                  type: "gadget",
                  gadget,
                });
              }}
            >
              <PrimaryGadgetIcon id={gadget} />
            </Button>
          ))}
          <Badge className="sticky top-0 w-full col-span-full">
            Secondary Gadgets
          </Badge>
          {DEFENDER_SECONDARY_GADGETS.map((gadget) => (
            <Button
              variant="outline"
              key={gadget.id}
              className="p-1 h-auto"
              onClick={() => {
                props.onAssetAdd({
                  id: `gadget-${gadget}`,
                  type: "gadget",
                  gadget: gadget.id,
                });
              }}
            >
              <SecondaryGadgetIcon id={gadget.id} />
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
