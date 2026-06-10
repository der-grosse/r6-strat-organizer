import {
  DEFENDER_PRIMARY_GADGETS,
  DEFENDER_SECONDARY_GADGETS,
  DefenderSecondaryGadgetID,
  PrimaryGadget,
} from "@/lib/static/operator";
import PrimaryGadgetIcon from "./PrimaryGadgetIcon";
import SecondaryGadgetIcon from "./SecondaryGadgetIcon";

export interface GadgetIconProps {
  id: PrimaryGadget["id"] | DefenderSecondaryGadgetID;
  showName?: boolean;
  variant?: number;
  className?: string;
}

export default function GadgetIcon(props: GadgetIconProps) {
  const isPrimaryGadget = DEFENDER_PRIMARY_GADGETS.find((g) => g.id === props.id);
  const isSecondaryGadget = DEFENDER_SECONDARY_GADGETS.find((g) => g.id === props.id);
  if (!isPrimaryGadget && !isSecondaryGadget) {
    console.warn(`GadgetIcon: No gadget found for id ${props.id}`);
    return null;
  }

  if (isPrimaryGadget) {
    return (
      <PrimaryGadgetIcon
        id={props.id as PrimaryGadget["id"]}
        variant={props.variant}
        className={props.className}
        showName={props.showName}
      />
    );
  }
  return (
    <SecondaryGadgetIcon
      id={props.id as DefenderSecondaryGadgetID}
      variant={props.variant}
      className={props.className}
      showName={props.showName}
    />
  );
}
