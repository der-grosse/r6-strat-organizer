import { Button, buttonVariants } from "@/components/ui/button";
import { Asset, PlacedAsset } from "@/lib/types/asset.types";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

export const DRAG_ASSET_DATA_TYPE = "application/r6-asset";

interface DraggableAssetButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asset: Omit<Asset & Partial<PlacedAsset>, "_id">;
  onAssetAdd: (asset: Omit<Asset & Partial<PlacedAsset>, "_id">) => void;
}

export default function DraggableAssetButton({
  asset,
  onAssetAdd,
  children,
  ...props
}: DraggableAssetButtonProps) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_ASSET_DATA_TYPE, JSON.stringify(asset));
        e.dataTransfer.effectAllowed = "copy";
      }}
    >
      <Button
        {...props}
        className={cn("w-full", props.className)}
        onClick={() => onAssetAdd(asset)}
      >
        {children}
      </Button>
    </div>
  );
}
