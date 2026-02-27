import Reinforcement from "@/components/icons/reinforcement";
import Rotation from "@/components/icons/rotation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Explosion from "../assets/Explosion";
import WoodenBarricade from "@/components/icons/woodenBarricade";
import { Asset, PlacedAsset, LayoutAsset } from "@/lib/types/asset.types";
import DraggableAssetButton from "./DraggableAssetButton";

export interface StratEditorLayoutSidebarProps {
  onAssetAdd: (asset: Omit<Asset & Partial<PlacedAsset>, "_id">) => void;
}

export default function StratEditorLayoutSidebar(
  props: Readonly<StratEditorLayoutSidebarProps>,
) {
  return (
    <div className="h-full absolute inset-0">
      <ScrollArea className="h-full p-2">
        <div
          className="grid gap-2 items-center pb-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(32px, 1fr))",
          }}
        >
          <Badge className="sticky top-0 w-full col-span-full">
            Reinforcements
          </Badge>
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
          <Badge className="sticky top-0 w-full col-span-full">
            Rotate and Headholes
          </Badge>
          {(
            [
              "full",
              "crouch",
              "jump",
              "headholes",
              "floorholes",
              "ceilingholes",
            ] as const
          ).map((variant) => (
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
          ))}
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
        </div>
      </ScrollArea>
    </div>
  );
}
