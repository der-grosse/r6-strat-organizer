export interface ReinforcementPathProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export default function ReinforcementPath(props: ReinforcementPathProps) {
  const { x, y, width, height, color = "#cfe2f3" } = props;
  const barBorderWidth = height * 0.04;
  const barSpacing = height * 0.075;
  const barHeight = (height - barBorderWidth * 2 - barSpacing) / 2;
  const borderRadius = height * 0.075;
  return (
    <g name="reinforcement" stroke="#000" fill={color}>
      <rect
        x={x + barBorderWidth / 2}
        y={y + barBorderWidth / 2}
        width={width - barBorderWidth}
        height={barHeight}
        strokeWidth={barBorderWidth}
        rx={borderRadius}
        ry={borderRadius}
      />
      <rect
        x={x + barBorderWidth / 2}
        y={y + (barBorderWidth * 3) / 2 + barHeight + barSpacing}
        width={width - barBorderWidth}
        height={barHeight}
        strokeWidth={barBorderWidth}
        rx={borderRadius}
        ry={borderRadius}
      />
    </g>
  );
}
