import ReinforcementPath from "./reinforcementPath";

export interface ReinforcementProps {
  className?: string;
  color?: string;
}

export default function Reinforcement(props: ReinforcementProps) {
  const { className, color = "#cfe2f3" } = props;

  return (
    <svg viewBox="0 0 300 200" className={className}>
      <ReinforcementPath x={0} y={0} width={300} height={200} color={color} />
    </svg>
  );
}
