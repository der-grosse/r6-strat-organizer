import { DEFENDER_SECONDARY_GADGETS, DefenderSecondaryGadgetID } from "@/lib/static/operator";
import { cn } from "@/lib/utils";

export interface SecondaryGadgetIconProps {
  id: DefenderSecondaryGadgetID;
  variant?: number;
  className?: string;
  showName?: boolean;
}

export default function SecondaryGadgetIcon(props: SecondaryGadgetIconProps) {
  const gadget = DEFENDER_SECONDARY_GADGETS.find((gadget) => gadget.id === props.id);
  const icon = gadget?.icon[props.variant ?? 0];
  if (!icon) {
    return (
      <>
        <div className={cn("w-8 h-8 bg-gray-500 rounded object-contain", props.className)} />
        {props.showName && <span className="text-sm">{gadget?.name ?? props.id}</span>}
      </>
    );
  }
  return (
    <>
      <img
        src={icon}
        alt={props.id}
        className={cn("w-8 h-8 object-contain", props.className)}
        draggable={false}
      />
      {props.showName && <span className="text-sm">{gadget?.name ?? props.id}</span>}
    </>
  );
}
