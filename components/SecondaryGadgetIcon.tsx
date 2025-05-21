import { DefenderSecondaryGadget, PrimaryGadget } from "@/src/static/operator";
import { cn } from "@/src/utils";

export interface SecondaryGadgetIconProps {
  id: DefenderSecondaryGadget;
  className?: string;
}

export default function SecondaryGadgetIcon(props: SecondaryGadgetIconProps) {
  return (
    <img
      src={"/MISSING"}
      alt={props.id}
      className={cn("w-8 h-8", props.className)}
      draggable={false}
    />
  );
}
