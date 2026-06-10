import ReinforcementPath from "./reinforcementPath";

export interface ReinforcementProps {
  className?: string;
  color?: string;
  height?: number;
  width?: number;
}

export default function Reinforcement(props: ReinforcementProps) {
  const { className, color = "#cfe2f3", height = 200, width = 300 } = props;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className}>
      <ReinforcementPath x={0} y={0} width={width} height={height} color={color} />
    </svg>
  );
}
