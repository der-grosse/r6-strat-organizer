import { ATTACKERS, DEFENDERS } from "@/lib/static/operator";
import { getAssetColor } from "../canvas/useMountedAssets";
import { PlacedAsset } from "@/lib/types/asset.types";
import { StratPositions } from "@/lib/types/strat.types";
import { FullTeam } from "@/lib/types/team.types";

const OPERATORS = [...DEFENDERS, ...ATTACKERS];

export interface SVGOperatorProps {
  asset: Pick<
    Extract<PlacedAsset, { type: "operator" }>,
    "customColor" | "stratPositionID" | "iconType" | "operator" | "size"
  >;
  stratPositions: StratPositions[];
  team: FullTeam;
}

/**
 * Renders an operator as native SVG (a colored backplate <rect> + the portrait
 * <image>) instead of HTML inside a <foreignObject>. Safari/iPadOS mispaints
 * foreignObject content (wrong size, pinned to the SVG origin) regardless of how
 * the transform is applied, so operators are mounted directly into the SVG where
 * the viewBox/translate/rotate transforms are honored in every browser.
 *
 * Coordinates are local to the asset's bounding box: (0, 0) is the top-left and
 * (width, height) the bottom-right, matching SVGAsset's translate transform. The
 * marker is drawn at 130% of the box (centered, overflowing it) to match the
 * previous HTML version.
 */
export default function SVGOperator({
  asset,
  stratPositions,
  team,
}: SVGOperatorProps) {
  const color = getAssetColor(asset, stratPositions, team);
  const { width: W, height: H } = asset.size;

  // Marker: 130% of the asset box, centered so it overflows on every side.
  const markerW = W * 1.3;
  const markerH = H * 1.3;
  const markerX = (W - markerW) / 2;
  const markerY = (H - markerH) / 2;

  // Colored backplate: 90% of the marker, centered, with rounded corners.
  const plateW = markerW * 0.9;
  const plateH = markerH * 0.9;
  const plateX = markerX + (markerW - plateW) / 2;
  const plateY = markerY + (markerH - plateH) / 2;
  const radius = plateW * 0.05;

  const op = OPERATORS.find((o) => o.name === asset.operator);
  const img =
    asset.iconType === "bw" && op && "iconBW" in op ? op.iconBW : op?.icon;

  return (
    <g>
      <rect
        x={plateX}
        y={plateY}
        width={plateW}
        height={plateH}
        rx={radius}
        ry={radius}
        fill={color ?? "transparent"}
        filter="url(#globalDropShadow)"
      />
      {asset.iconType !== "hidden" &&
        (img ? (
          <image
            href={img}
            x={markerX}
            y={markerY}
            width={markerW}
            height={markerH}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : (
          // Fallback when the operator has no icon, mirroring OperatorIcon.
          <rect
            x={markerX}
            y={markerY}
            width={markerW}
            height={markerH}
            rx={radius}
            ry={radius}
            fill="#6b7280"
          />
        ))}
    </g>
  );
}
