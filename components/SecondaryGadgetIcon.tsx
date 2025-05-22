import {
  DEFENDER_SECONDARY_GADGETS,
  DefenderSecondaryGadget,
} from "@/src/static/operator";
import { cn } from "@/src/utils";

export interface SecondaryGadgetIconProps {
  id: DefenderSecondaryGadget;
  variant?: number;
  className?: string;
}

export default function SecondaryGadgetIcon(props: SecondaryGadgetIconProps) {
  const gadget = DEFENDER_SECONDARY_GADGETS.find(
    (gadget) => gadget.id === props.id
  );
  const icon = gadget?.icon[props.variant ?? 0];
  return (
    <img
      src={icon}
      alt={props.id}
      className={cn("w-8 h-8", props.className)}
      draggable={false}
    />
  );
}
