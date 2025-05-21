import { cn } from "@/src/utils";

export interface ReinforcementProps {
  className?: string;
  color?: string;
}

export default function Reinforcement(props: ReinforcementProps) {
  const { className, color = "#cfe2f3" } = props;
  return (
    <div className={cn("relative h-full w-full", className)}>
      <div className="w-full absolute top-0 left-0 w-full h-[45%] bg-black rounded-[5%] p-[5%]">
        <div
          style={{ backgroundColor: color }}
          className="h-full w-full rounded-[5%]"
        />
      </div>
      <div className="w-full absolute top-[55%] left-0 w-full h-[45%] bg-black rounded-[5%] p-[5%]">
        <div
          style={{ backgroundColor: color }}
          className="h-full w-full rounded-[5%]"
        />
      </div>
    </div>
  );
}
