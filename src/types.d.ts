interface Strat {
  id: number;
  map: string;
  site: string;
  name: string;
  description: string;
  rotationIndex: number[] | null;
  powerOPs: string[];
  drawingID: string;
}

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

interface StratDrawing extends Strat {
  assets: PlacedAsset[];
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

type Asset = BaseAsset & (Marker | Operator | Gadget);

interface BaseAsset {
  id: string;
  player?: string;
  customColor?: string;
}

interface Marker {
  id: `marker-${string}`;
  type: "marker";
}

interface Operator {
  id: `operator-${string}`;
  type: "operator";
  operator: string;
  side: "att" | "def";
}

interface Gadget {
  id: `gadget-${string}`;
  type: "gadget";
  gadget: string;
}
