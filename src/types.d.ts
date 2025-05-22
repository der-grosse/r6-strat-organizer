interface R6Map {
  name: string;
  sites: string[];
  floors: R6Floor[];
}

interface R6Floor {
  floor: "B" | "1F" | "2F" | "3F";
  src: string;
}

interface User {
  id: number;
  name: string;
  teamID: number;
}

interface JWTPayload {
  id: number;
  name: string;
  teamID: number;
  isAdmin: boolean;
}

interface Strat {
  id: number;
  map: string;
  site: string;
  name: string;
  description: string;
  rotationIndex: number[] | null;
  drawingID: string;

  assets: PlacedAsset[];
  operators: PickedOperator[];
}

type PickedOperator = {
  operator: string;
  player?: number;
  isPowerOP?: boolean;
};

type PlacedAsset = Asset & {
  position: Position;
  size: Size;
};
interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

type Asset = BaseAsset &
  (
    | MarkerAsset
    | OperatorAsset
    | GadgetAsset
    | RotateAsset
    | ReinforcementAsset
  );

interface BaseAsset {
  id: string;
  player?: User["id"];
  customColor?: string;
}

interface MarkerAsset {
  id: `marker-${string}`;
  type: "marker";
}

interface ReinforcementAsset {
  id: `reinforcement-${string}`;
  type: "reinforcement";
}

interface RotateAsset {
  id: `rotate-${string}`;
  type: "rotate";
  variant:
    | "full"
    | "crouch"
    | "jump"
    | "headholes"
    | "floorholes"
    | "ceilingholes";
}

interface OperatorAsset {
  id: `operator-${string}`;
  type: "operator";
  operator: string;
  side: "att" | "def";
  showIcon: boolean;
}

interface GadgetAsset {
  id: `gadget-${string}`;
  type: "gadget";
  gadget: string;
}
