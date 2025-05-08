import { cn } from "@/src/utils";

export interface OperatorIconProps {
  op: { icon: string; name: string };
  className?: string;
}

export default function OperatorIcon(props: OperatorIconProps) {
  return (
    <img
      src={props.op.icon}
      alt={props.op.name}
      className={cn("w-8 h-8", props.className)}
    />
  );
}
