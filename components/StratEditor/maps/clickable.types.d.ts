interface MapFloorClickableProps {
  className?: string;
  onClick?: (
    type: "barricade" | "reinforcement-wall" | "reinforcement-hatch",
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number
  ) => void;
}
