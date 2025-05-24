import OperatorIcon from "@/components/OperatorIcon";

export interface OperatorProps {
  asset: Extract<PlacedAsset, { type: "operator" }>;
  operators: PickedOperator[];
  team: Team;
}

export default function Operator(props: OperatorProps) {
  const color = (() => {
    if (props.asset.customColor) return props.asset.customColor;
    if (!props.asset.pickedOPID) return undefined;
    const pickedOP = props.operators.find(
      (op) => op.id === props.asset.pickedOPID
    );
    if (!pickedOP) return undefined;
    const postion = props.team.playerPositions.find(
      (pos) => pos.id === pickedOP.positionID
    );
    if (!postion) return undefined;
    const teamMember = props.team.members.find(
      (member) => member.id === postion.playerID
    );
    return teamMember?.defaultColor;
  })();
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
