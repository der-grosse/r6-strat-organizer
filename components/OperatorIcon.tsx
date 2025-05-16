import { ATTACKERS, DEFENDERS, Operator } from "@/src/static/operator";
import { cn } from "@/src/utils";

export interface OperatorIconProps {
  op: Operator | string;
  className?: string;
}

const OPERATORS = DEFENDERS.concat(ATTACKERS);

export default function OperatorIcon(props: OperatorIconProps) {
  const op =
    typeof props.op === "string"
      ? OPERATORS.find((op) => op.name === props.op)
      : props.op;
  return (
    <picture>
      <source srcSet={op?.icon.full} media="(min-width: 640px)" />
      <img
        src={op?.icon.small}
        alt={op?.name}
        className={cn("w-8 h-8", props.className)}
        draggable={false}
      />
    </picture>
  );
}
