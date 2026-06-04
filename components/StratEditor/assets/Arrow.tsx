import { ArrowAsset, PlacedAsset } from "@/lib/types/asset.types";
import { StratPositions } from "@/lib/types/strat.types";
import { FullTeam } from "@/lib/types/team.types";
import { getAssetColor } from "../canvas/useMountedAssets";
import { getArrowEndpoints } from "../canvas/arrow";

/**
 * Renders an arrow as native SVG (not inside a foreignObject) so the diagonal
 * line, the outward-pointing heads and zero-width/height (perfectly
 * horizontal/vertical) arrows are never clipped to a box.
 *
 * Coordinates are local to the asset's bounding box: (0, 0) is the top-left and
 * (width, height) the bottom-right, matching SVGAsset's translate transform.
 */
export default function Arrow({
  asset,
  stratPositions,
  team,
  selected,
}: {
  asset: PlacedAsset & ArrowAsset;
  stratPositions: StratPositions[];
  team: FullTeam;
  selected: boolean;
}) {
  const color = getAssetColor(asset, stratPositions, team) ?? "white";
  const { start, end } = getArrowEndpoints(
    { x: 0, y: 0 },
    asset.size,
    asset.startCorner ?? "tl",
  );

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  // perpendicular unit vector
  const px = -uy;
  const py = ux;

  const strokeWidth = 8;
  const headLength = strokeWidth * 3;
  const headWidth = strokeWidth * 2.6;
  // push the head tip a little past the endpoint, along the line
  const headForward = strokeWidth;

  // An arrowhead pointing outward along (dirX, dirY) at `point`. The tip sits
  // `headForward` past the endpoint and the base is `headLength` behind the tip.
  const headPoints = (
    point: { x: number; y: number },
    dirX: number,
    dirY: number,
  ) => {
    const tipX = point.x + dirX * headForward;
    const tipY = point.y + dirY * headForward;
    const baseX = tipX - dirX * headLength;
    const baseY = tipY - dirY * headLength;
    const leftX = baseX + (px * headWidth) / 2;
    const leftY = baseY + (py * headWidth) / 2;
    const rightX = baseX - (px * headWidth) / 2;
    const rightY = baseY - (py * headWidth) / 2;
    return `${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`;
  };

  // Retract the shaft to the head's base so it doesn't poke through the head.
  const shaftInset = headLength - headForward;
  const shaftStart = asset.startArrowHead
    ? { x: start.x + ux * shaftInset, y: start.y + uy * shaftInset }
    : start;
  const shaftEnd = asset.endArrowHead
    ? { x: end.x - ux * shaftInset, y: end.y - uy * shaftInset }
    : end;

  return (
    <g filter={selected ? "url(#globalDropShadow)" : undefined}>
      {/* Wide invisible hit area so only clicks near the line grab the arrow */}
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="transparent"
        strokeWidth={Math.max(strokeWidth * 2.5, 16)}
        strokeLinecap="round"
        style={{ pointerEvents: "stroke" }}
      />
      <line
        x1={shaftStart.x}
        y1={shaftStart.y}
        x2={shaftEnd.x}
        y2={shaftEnd.y}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{ pointerEvents: "none" }}
      />
      {asset.startArrowHead && (
        <polygon
          points={headPoints(start, -ux, -uy)}
          fill={color}
          style={{ pointerEvents: "none" }}
        />
      )}
      {asset.endArrowHead && (
        <polygon
          points={headPoints(end, ux, uy)}
          fill={color}
          style={{ pointerEvents: "none" }}
        />
      )}
    </g>
  );
}
