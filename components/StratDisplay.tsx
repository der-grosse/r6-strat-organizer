import { Ban } from "lucide-react";

export interface StratDisplayProps {
  strat: Strat | null;
  editView?: boolean;
}

export default function StratDisplay(props: StratDisplayProps) {
  return (
    <div className="relative h-full w-full flex justify-center items-center flex-col gap-4 z-0">
      {props.strat ? (
        <>
          <iframe
            className="w-full flex-1"
            src={props.editView ? props.strat.editURL : props.strat.previewURL}
          />
          <div className="flex gap-2 p-2 rounded bg-background">
            {props.strat.map}
            {" | "}
            {props.strat.site}
            {" | "}
            {props.strat.name}
          </div>
        </>
      ) : (
        <>
          <Ban className="text-muted-foreground" height={64} width={64} />
          <p className="text-muted-foreground">No strat selected</p>
        </>
      )}
    </div>
  );
}
