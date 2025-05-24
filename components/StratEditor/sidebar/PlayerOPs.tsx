import OperatorIcon from "@/components/OperatorIcon";
import OperatorPicker from "@/components/OperatorPicker";
import PlayerPositionPicker from "@/components/PlayerPositionPicker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PLAYER_COUNT } from "@/src/static/general";
import { updatePickedOperator } from "@/src/strats/strats";
import { cn } from "@/src/utils";
import { CircleOff, Zap, ZapOff } from "lucide-react";

export interface StratEditorPlayerOperatorsSidebarProps {
  strat: Pick<Strat, "operators" | "id">;
  team: Team;
}

export default function StratEditorPlayerOperatorsSidebar({
  strat: { operators, id: stratID },
  team,
}: StratEditorPlayerOperatorsSidebarProps) {
  return (
    <div className="p-2 flex flex-col gap-2">
      <Label className="text-muted-foreground">Player operators</Label>
      <Separator />
      {operators.map(({ operator, isPowerOP, positionID, id }) => {
        const position = team.playerPositions.find(
          (pos) => pos.id === positionID
        );
        const teamMember = team.members.find(
          (member) => member.id === position?.playerID
        );
        return (
          <div
            className={cn(
              "flex items-center gap-2",
              operators.some(
                (o) =>
                  o.id !== id &&
                  ((positionID && o.positionID === positionID) ||
                    (operator && o.operator === operator))
              ) && "outline-2 outline-destructive rounded-md"
            )}
            key={id}
          >
            <PlayerPositionPicker
              className="flex-1"
              positionID={positionID}
              team={team}
              onChange={(positionID) => {
                updatePickedOperator(stratID, {
                  id,
                  positionID: positionID ?? undefined,
                });
              }}
            />
            {/* <div className="flex-1" /> */}
            <OperatorPicker
              closeOnSelect
              selected={operator ?? null}
              onChange={(op) =>
                updatePickedOperator(stratID, {
                  id,
                  operator: op ?? undefined,
                })
              }
              trigger={({ children, ...props }) => (
                <Button {...props} variant="ghost" size="icon">
                  {operator ? <OperatorIcon op={operator} /> : <CircleOff />}
                </Button>
              )}
            />
            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    isPowerOP ? "text-primary" : "text-muted-foreground/50"
                  )}
                  onClick={() =>
                    updatePickedOperator(stratID, {
                      id,
                      isPowerOP: !isPowerOP,
                    })
                  }
                >
                  {isPowerOP ? <Zap /> : <ZapOff />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-sm">
                  {isPowerOP
                    ? "Remove from power operators"
                    : "Set as power operator"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Power operators are essential to a strat. If they get banned,
                  the strat is not viable anymore.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      })}
      {team.members.length < PLAYER_COUNT && (
        <>
          <Separator />
          <div className="text-sm text-muted-foreground">
            {`It is strongly recommended to have ${PLAYER_COUNT} players in your team to be able to use all features properly.`}
          </div>
        </>
      )}
    </div>
  );
}
