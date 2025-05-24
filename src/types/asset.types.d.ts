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
  pickedOPID?: PickedOperator["id"];
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
