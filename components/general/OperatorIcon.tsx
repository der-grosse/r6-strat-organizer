import { Attacker, ATTACKERS, Defender, DEFENDERS } from "@/lib/static/operator";
import { cn } from "@/lib/utils";

export interface OperatorIconProps {
  op: Attacker | Defender | string;
  variant?: "default" | "bw";
  className?: string;
  style?: React.CSSProperties;
}

const OPERATORS = [...DEFENDERS, ...ATTACKERS];

export default function OperatorIcon(props: OperatorIconProps) {
  const op = typeof props.op === "string" ? OPERATORS.find((op) => op.name === props.op) : props.op;
  const img = props.variant === "bw" && op && "iconBW" in op ? op.iconBW : op?.icon;

  if (!img) {
    return (
      <div className={cn("w-8 h-8 bg-gray-500 rounded", props.className)} style={props.style} />
    );
  }

  return (
    <img
      src={img}
      alt={op?.name}
      loading="lazy"
      className={cn("w-8 h-8 object-contain", props.className)}
      draggable={false}
      style={props.style}
    />
  );
}
