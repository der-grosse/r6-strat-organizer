import { DEFAULT_COLORS } from "@/lib/static/colors";
import { PlacedAsset } from "@/lib/types/asset.types";
import { StratPositions } from "@/lib/types/strat.types";
import { FullTeam } from "@/lib/types/team.types";
import { useMemo } from "react";

export default function AssetOutline(props: {
  children?: React.ReactNode;
  stratPositions: StratPositions[];
  asset: PlacedAsset;
  team: FullTeam;
}) {
  const color = useMemo(
    () =>
      props.asset.customColor ??
      (() => {
        const pickedOperator = props.stratPositions.find(
          (op) => op._id === props.asset.stratPositionID,
        );
        if (!pickedOperator?.teamPositionID) return null;
        const teamPos = props.team.teamPositions.find(
          (teamPos) => teamPos._id === pickedOperator.teamPositionID,
        );
        if (!teamPos) return null;
        const member = props.team.members.find((m) => m._id === teamPos.playerID);
        if (!member) return null;
        return member.defaultColor;
      })() ??
      DEFAULT_COLORS.at(-1)!,
    [props.asset, props.stratPositions, props.team],
  );

  return (
    <div className="border-4 h-full w-full rounded-xs" style={{ borderColor: color }}>
      {props.children}
    </div>
  );
}
