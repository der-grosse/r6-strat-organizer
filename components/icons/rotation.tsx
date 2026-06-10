import { LayoutAsset } from "@/lib/types/asset.types";
import RotationPath from "./rotationPath";

export interface RotationProps {
  className?: string;
  color?: string;
  variant: Exclude<LayoutAsset["variant"], "explosion" | "barricade" | "reinforcement">;
  height?: number;
  width?: number;
}

export default function Rotation(props: RotationProps) {
  const { className, color = "#cfe2f3", variant, height = 300, width = 300 } = props;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className}>
      <RotationPath x={0} y={0} width={width} height={height} color={color} variant={variant} />
    </svg>
  );
}
