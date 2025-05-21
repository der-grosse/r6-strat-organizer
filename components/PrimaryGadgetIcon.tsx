import { PrimaryGadget } from "@/src/static/operator";
import { cn } from "@/src/utils";

export interface PrimaryGadgetIconProps {
  id: PrimaryGadget["id"];
  className?: string;
}

export default function PrimaryGadgetIcon(props: PrimaryGadgetIconProps) {
  return (
    <img
      src={"MISSING"}
      alt={props.id}
      className={cn("w-8 h-8", props.className)}
      draggable={false}
    />
  );
}
