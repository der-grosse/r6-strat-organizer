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
