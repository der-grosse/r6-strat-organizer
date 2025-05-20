import OperatorIcon from "@/components/OperatorIcon";
import { TeamUsers } from "../Assets";

export interface OperatorProps {
  asset: Extract<PlacedAsset, { type: "operator" }>;
  teamUsers: TeamUsers[];
}

export default function Operator(props: OperatorProps) {
  const color =
    props.asset.customColor ??
    (props.asset.player
      ? props.teamUsers.find((user) => user.id === props.asset.player)
          ?.defaultColor
      : undefined);
  return (
    <div className="w-[130%] h-[130%] m-[-15%] relative">
      {props.asset.showIcon && (
        <OperatorIcon
          op={props.asset.operator}
          className="w-full h-full absolute z-10"
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
