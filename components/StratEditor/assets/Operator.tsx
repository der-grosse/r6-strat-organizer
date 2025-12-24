import OperatorIcon from "@/components/general/OperatorIcon";
import { getAssetColor } from "../canvas/useMountedAssets";
import { cn } from "@/lib/utils";
import { PlacedAsset } from "@/lib/types/asset.types";
import { StratPositions } from "@/lib/types/strat.types";
import { FullTeam } from "@/lib/types/team.types";

export interface OperatorProps {
  asset: Pick<
    Extract<PlacedAsset, { type: "operator" }>,
    "customColor" | "stratPositionID" | "iconType" | "operator"
  >;
  stratPositions: StratPositions[];
  team: FullTeam;
  className?: string;
}

export default function Operator(props: OperatorProps) {
  const color = getAssetColor(props.asset, props.stratPositions, props.team);
  return (
    <div
      className={cn(
        "w-[130%] h-[130%] translate-[-12.5%] relative",
        props.className
      )}
    >
      {props.asset.iconType !== "hidden" && (
        <OperatorIcon
          op={props.asset.operator}
          className="w-full h-full absolute z-10"
          variant={props.asset.iconType}
        />
      )}
      <div
        className="m-[5%] w-[90%] h-[90%] absolute top-0 left-0 z-0 shadow-lg rounded-[5%]"
        style={{
          background: color ?? undefined,
        }}
      />
    </div>
  );
}
