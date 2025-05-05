interface Strat {
  id: number;
  map: string;
  site: string;
  name: string;
  rotationIndex: number[] | null;
  powerOPs: string[];
  previewURL: string;
  editURL: string;
}

interface R6Map {
  name: string;
  sites: string[];
}
