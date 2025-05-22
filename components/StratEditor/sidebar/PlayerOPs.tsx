import { ColorButton, DEFAULT_COLORS } from "@/components/ColorPickerDialog";
import OperatorIcon from "@/components/OperatorIcon";
import OperatorPicker from "@/components/OperatorPicker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TeamMember } from "@/src/auth/team";
import { PLAYER_COUNT } from "@/src/static/general";
import { updateStrat } from "@/src/strats/strats";
import { cn } from "@/src/utils";
import { CircleOff, Link, Unlink, Zap, ZapOff } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

export interface StratEditorPlayerOperatorsSidebarProps {
  strat: Pick<Strat, "operators" | "id">;
  teamMembers: TeamMember[];
}

export default function StratEditorPlayerOperatorsSidebar({
  strat: { operators, id: stratID },
  teamMembers,
}: StratEditorPlayerOperatorsSidebarProps) {
  const [ops, setOPs] = useState<
    { teamMember?: TeamMember; operator: PickedOperator | null }[]
  >([]);

  useEffect(() => {
    const mappedOPs: typeof ops = operators.map((o) => {
      const teamMember = teamMembers.find((m) => m.id === o.player);
      return {
        teamMember,
        operator: o,
      };
    });
    const missingTeamMembers = teamMembers.filter(
      (m) => !mappedOPs.some((o) => o.teamMember?.id === m.id)
    );
    mappedOPs.push(
      ...missingTeamMembers.map((m) => ({
        teamMember: m,
        operator: null,
      }))
    );
    if (mappedOPs.length < PLAYER_COUNT) {
      for (let i = mappedOPs.length; i < PLAYER_COUNT; i++) {
        mappedOPs.push({
          operator: null,
        });
      }
    }
    setOPs(
      mappedOPs.toSorted((a, b) => {
        if (a.teamMember && b.teamMember) {
          return a.teamMember.name.localeCompare(b.teamMember.name);
        }
        if (a.teamMember) {
          return -1;
        }
        if (b.teamMember) {
          return 1;
        }
        if (a.operator && b.operator) {
          return a.operator.operator.localeCompare(b.operator.operator);
        }
        if (a.operator) {
          return -1;
        }
        if (b.operator) {
          return 1;
        }
        return 0;
      })
    );
  }, [teamMembers, operators]);

  return (
    <div className="p-2 flex flex-col gap-2">
      <Label className="text-muted-foreground">Player operators</Label>
      <Separator />
      {ops.map(({ operator, teamMember }, i) => (
        <div className="flex items-center gap-2" key={i}>
          {teamMember ? (
            <>
              <ColorButton
                color={teamMember?.defaultColor ?? DEFAULT_COLORS[0]}
                size="small"
                disabled
              />
              <Label>{teamMember?.name}</Label>
            </>
          ) : (
            <Label>
              <em>No player available</em>
            </Label>
          )}
          <div className="flex-1" />
          <OperatorPicker
            closeOnSelect
            selected={operator?.operator ?? null}
            onChange={(op) =>
              updateStrat({
                id: stratID,
                operators: (() => {
                  if (op) {
                    if (operators.some((o) => o === operator)) {
                      return operators.map((o) => {
                        if (o === operator) {
                          return {
                            ...o,
                            operator: op,
                            player: teamMember?.id,
                          };
                        }
                        return o;
                      });
                    } else {
                      return [
                        ...operators,
                        {
                          operator: op,
                          player: teamMember?.id,
                          isPowerOP: operator?.isPowerOP,
                        },
                      ];
                    }
                  } else {
                    return operators.filter((o) => o !== operator);
                  }
                })(),
              })
            }
            trigger={({ children, ...props }) => (
              <Button {...props} variant="ghost" size="icon">
                {operator ? (
                  <OperatorIcon op={operator.operator} />
                ) : (
                  <CircleOff />
                )}
              </Button>
            )}
          />
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  operator?.isPowerOP
                    ? "text-primary"
                    : "text-muted-foreground/50"
                )}
                onClick={() =>
                  updateStrat({
                    id: stratID,
                    operators: operators.map((o) =>
                      o === operator
                        ? { ...o, isPowerOP: !operator.isPowerOP }
                        : o
                    ),
                  })
                }
              >
                {operator?.isPowerOP ? <Zap /> : <ZapOff />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-sm">
                {operator?.isPowerOP
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
      ))}
      {teamMembers.length < PLAYER_COUNT && (
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
