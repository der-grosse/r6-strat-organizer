import { ImageAsset, PlacedAsset } from "@/lib/types/asset.types";
import { StratPositions } from "@/lib/types/strat.types";
import { FullTeam } from "@/lib/types/team.types";
import { getAssetColor } from "../canvas/useMountedAssets";
import { ImageIcon, ImageOff } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Renders an image referenced by an external URL, scaled to fit its bounding
 * box while keeping its aspect ratio. When no URL is set yet, a placeholder is
 * shown so the (otherwise empty) asset stays discoverable and can be
 * double-clicked to add a link. When the URL fails to load, an explicit error
 * placeholder is shown instead of the browser's broken-image glyph.
 *
 * When the asset is assigned to a position (or given a custom color), a colored
 * border in that color is drawn around the image.
 */
export default function Image({
  asset,
  stratPositions,
  team,
}: {
  asset: PlacedAsset & ImageAsset;
  stratPositions: StratPositions[];
  team: FullTeam;
}) {
  const color = getAssetColor(asset, stratPositions, team);
  const [failed, setFailed] = useState(false);

  // Retry loading whenever the URL changes (e.g. after editing a bad link).
  useEffect(() => {
    setFailed(false);
  }, [asset.url]);

  if (!asset.url) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-muted-foreground/60 bg-muted/40 text-muted-foreground overflow-hidden">
        <ImageIcon className="size-1/3 max-h-6 max-w-6" />
      </div>
    );
  }

  if (failed) {
    return (
      <div
        className="h-full w-full flex flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-destructive/70 bg-destructive/10 text-destructive overflow-hidden p-1 text-center"
        title={`Image failed to load: ${asset.url}`}
      >
        <ImageOff className="size-1/3 max-h-6 max-w-6 shrink-0" />
        <span className="text-[8px] leading-tight font-medium max-w-full break-words line-clamp-2">
          Image failed to load
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external, user-provided URLs cannot use next/image
    <img
      src={asset.url}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
      className="h-full w-full object-contain pointer-events-none select-none border-transparent border-4 rounded-sm"
      style={color ? { borderColor: color } : undefined}
    />
  );
}
