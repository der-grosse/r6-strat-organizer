import { Id } from "@/convex/_generated/dataModel";
import { DefenderSecondaryGadgetID } from "../static/operator";

export interface R6Map {
  name: string;
  sites: string[];
  floors: R6Floor[];
}

export type R6FloorLayer = "doors" | "windows" | "reinforcements" | "hatches";
export interface R6Floor {
  floor: "B" | "1F" | "2F" | "3F";
  src: string;
  clickables?: React.FC<MapFloorClickableProps>;
}

export interface Strat {
  _id: Id<"strats">;
  map: string;
  site: string;
  name: string;
  description: string;
  drawingID: string | undefined;
  archived: boolean;
  mapIndex: number;
  showFloorNames: boolean;
  hiddenFloors: number[];
  stratPositions: StratPositions[];
  filters?: {
    attackers?: StratFilter;
    defenders?: StratFilter;
  };
}

interface StratFilter {
  triggerOn: "banned" | "available";
  action: "hide" | "show";
  filterType: "any" | "all";
  operators: string[];
}

export interface StratPositions {
  _id: Id<"stratPositions">;
  teamPositionID?: Id<"teamPositions"> | null;
  isPowerPosition: boolean;
  shouldBringShotgun: boolean;
  fightsLongRange: boolean;
  index: number;
  pickedOperators: PickedOperator[];
}

export interface PickedOperator {
  _id: Id<"pickedOperators">;
  stratPositionID: Id<"stratPositions">;
  operator: string;
  secondaryGadget: DefenderSecondaryGadgetID | undefined;
  tertiaryGadget: DefenderSecondaryGadgetID | undefined; // only used for operator sentry
  index: number;
}
