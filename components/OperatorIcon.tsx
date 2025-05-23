import {
  Attacker,
  ATTACKERS,
  Defender,
  DEFENDERS,
} from "@/src/static/operator";
import { cn } from "@/src/utils";

export interface OperatorIconProps {
  op: Attacker | Defender | string;
  className?: string;
}

const OPERATORS = [...DEFENDERS, ...ATTACKERS];

export default function OperatorIcon(props: OperatorIconProps) {
  const op =
    typeof props.op === "string"
      ? OPERATORS.find((op) => op.name === props.op)
      : props.op;
  return (
    <img
      src={op?.icon}
      alt={op?.name}
      className={cn("w-8 h-8", props.className)}
      draggable={false}
    />
  );
}
