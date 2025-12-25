import { Id } from "@/convex/_generated/dataModel";

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
  gadget: string;
}

export type Asset = LayoutAsset | OperatorAsset | GadgetAsset;

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
