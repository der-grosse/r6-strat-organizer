import { Id } from "@/convex/_generated/dataModel";
import { DefenderSecondaryGadget, PrimaryGadget } from "../static/operator";

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
  gadget: DefenderSecondaryGadget | PrimaryGadget["id"];
}

export interface TextboxAsset extends BaseAsset {
  type: "textbox";
  text: string;
  fontSize: number;
  background: "none" | "light" | "dark";
}

export type Asset = LayoutAsset | OperatorAsset | GadgetAsset | TextboxAsset;

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
