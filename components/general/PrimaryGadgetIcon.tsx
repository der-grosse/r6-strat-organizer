import { DEFENDER_PRIMARY_GADGETS, PrimaryGadget } from "@/lib/static/operator";
import { cn } from "@/lib/utils";
import CastleBarricade from "../icons/castleBarricade";

export interface PrimaryGadgetIconProps {
  id: PrimaryGadget["id"];
  variant?: number;
  className?: string;
  showName?: boolean;
}

const SPECIAL_ICONS = {
  armor_panel: CastleBarricade,
} as const;

export default function PrimaryGadgetIcon(props: PrimaryGadgetIconProps) {
  if (props.id in SPECIAL_ICONS) {
    const SpecialIcon = SPECIAL_ICONS[props.id as keyof typeof SPECIAL_ICONS];
    return (
      <>
        <SpecialIcon
          className={cn("w-8 h-8 object-contain", props.className)}
        />
        {props.showName && <span className="text-sm">{props.id}</span>}
      </>
    );
  }

  const gadget = DEFENDER_PRIMARY_GADGETS.find((g) => g.id === props.id);
  const icon = gadget?.icon[props.variant ?? 0];

  return (
    <>
      <img
        src={icon}
        alt={gadget?.name ?? props.id}
        className={cn("w-8 h-8 object-contain", props.className)}
        draggable={false}
      />
      {props.showName && (
        <span className="text-sm">{gadget?.name ?? props.id}</span>
      )}
    </>
  );
}
