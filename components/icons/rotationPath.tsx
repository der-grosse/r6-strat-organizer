import { LayoutAsset } from "@/lib/types/asset.types";

export interface RotationPathProps {
  x: number;
  y: number;
  width: number;
  height: number;
  innerColor?: string;
  color?: string;
  variant: Exclude<LayoutAsset["variant"], "explosion" | "barricade" | "reinforcement">;
}

export default function RotationPath(props: RotationPathProps) {
  const { x, y, width, height, innerColor = "#b97a56", color = "#cfe2f3" } = props;
  const barBorderWidth = height * 0.055;
  const colorBorderWidth = barBorderWidth * 1.5;
  const borderRadius = height * 0.05;

  // Inner area inside the colored outline, filled by the three bars.
  const innerTop = y + colorBorderWidth;
  const innerHeight = height - colorBorderWidth * 2;
  // Subtract one bar border so the top/bottom strokes stay inside the inner area.
  const barHeight = (innerHeight - barBorderWidth) / 3;
  const barX = x + colorBorderWidth + barBorderWidth / 2;
  const barWidth = width - colorBorderWidth * 2 - barBorderWidth;
  const barTop = innerTop + barBorderWidth / 2;

  const bars = (() => {
    switch (props.variant) {
      case "ceilingholes":
        return [true, false, false];
      case "crouch":
        return [false, true, true];
      case "floorholes":
        return [false, false, true];
      case "headholes":
        return [false, true, false];
      case "full":
        return [true, true, true];
      case "jump":
        return [true, true, false];
    }
  })();

  return (
    <g name="rotation" stroke="#000">
      {/* colored outline around the whole asset */}
      <rect
        x={x + colorBorderWidth / 2}
        y={y + colorBorderWidth / 2}
        width={width - colorBorderWidth}
        height={height - colorBorderWidth}
        fill="none"
        strokeWidth={colorBorderWidth}
        rx={borderRadius + colorBorderWidth / 2}
        ry={borderRadius + colorBorderWidth / 2}
        stroke={color}
      />
      {/* three rounded bars; adjacent strokes overlap exactly on shared edges */}
      {bars.map((filled, i) => (
        <rect
          key={i}
          x={barX}
          y={barTop + i * barHeight}
          width={barWidth}
          height={barHeight}
          strokeWidth={barBorderWidth}
          rx={borderRadius}
          ry={borderRadius}
          fill={filled ? innerColor : "none"}
        />
      ))}
      <rect
        x={barX}
        y={barTop}
        width={barWidth}
        height={barHeight * 3}
        strokeWidth={barBorderWidth}
        fill="none"
        stroke="#000"
        rx={borderRadius}
        ry={borderRadius}
      />
    </g>
  );
}
