import { Id } from "@/convex/_generated/dataModel";
import { DefenderSecondaryGadgetID, PrimaryGadget } from "../static/operator";

export interface BaseAsset {
  _id: Id<"placedAssets">;
  stratPositionID?: Id<"stratPositions">;
  customColor?: string;
}

export interface LayoutAsset extends BaseAsset {
  type: "layout";
  variant:
    | "barricade"
    | "reinforcement"
    | "full"
    | "crouch"
    | "jump"
    | "headholes"
    | "floorholes"
    | "ceilingholes"
    | "explosion";
  placedOn?: "hatch" | "wall" | "door";
}

export interface OperatorAsset extends BaseAsset {
  type: "operator";
  operator: string;
  iconType: "default" | "hidden" | "bw";
}

export interface GadgetAsset extends BaseAsset {
  type: "gadget";
  gadget: DefenderSecondaryGadgetID | PrimaryGadget["id"];
}

export interface TextboxAsset extends BaseAsset {
  type: "textbox";
  text: string;
  fontSize: number;
  background: "none" | "light" | "dark";
}

// An arrow is the diagonal of its bounding box. `startCorner` marks which
// corner the (tail) start point sits at; the (head) end point is always the
// diagonally opposite corner. This keeps arrows compatible with the generic
// position/size box model while still allowing both line ends to be moved
// freely into any of the four orientations.
export type ArrowCorner = "tl" | "tr" | "bl" | "br";

export interface ArrowAsset extends BaseAsset {
  type: "arrow";
  startCorner: ArrowCorner;
  startArrowHead: boolean;
  endArrowHead: boolean;
}

export type Asset =
  | LayoutAsset
  | OperatorAsset
  | GadgetAsset
  | TextboxAsset
  | ArrowAsset;

export type PlacedAsset = Asset & {
  position: Position;
  size: Size;
  rotation: number;
};

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}
