"use client";

import {
  getGoogleDrawingsEditURL,
  getGoogleDrawingsPreviewURL,
} from "@/src/googleDrawings";
import { Ban, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useUser } from "./context/UserContext";
import OperatorIcon from "./OperatorIcon";

export interface StratDisplayProps {
  strat: Strat | null;
  editView?: boolean;
}

export default function StratDisplay(props: StratDisplayProps) {
  const user = useUser();
  const playedOP = props.strat?.operators.find(
    (op) => op.player === user?.user?.id
  )?.operator;
  return (
    <div className="relative h-full w-full flex justify-center items-center flex-col z-0">
      {props.strat?.drawingID ? (
        <>
          <iframe
            className="w-full flex-1"
            src={
              props.editView
                ? getGoogleDrawingsEditURL(props.strat.drawingID)
                : getGoogleDrawingsPreviewURL(props.strat.drawingID)
            }
          />
          <div className="flex flex-col gap-1 p-2 rounded bg-background">
            {playedOP && (
              <div className="flex gap-2 justify-center items-center">
                <OperatorIcon op={playedOP} />
                <p className="text-lg font-bold text-center">{playedOP}</p>
              </div>
            )}
            <div className="flex gap-1 text-sm">
              {props.strat.map}
              {" | "}
              {props.strat.site}
              {" | "}
              {props.strat.name}
              <Link
                href={`/editor/${props.strat.id}`}
                className="text-muted-foreground hover:text-primary"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer -my-2"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
            </div>
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
