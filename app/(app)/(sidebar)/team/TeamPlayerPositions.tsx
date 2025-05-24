"use client";
import { ColorButton } from "@/components/ColorPickerDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { setMemberPosition, setMemberPositionName } from "@/src/auth/team";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

export interface TeamPlayerPositionsProps {
  team: Team;
  canEdit: boolean;
}

export default function TeamPlayerPositions(props: TeamPlayerPositionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Positions</CardTitle>
        <CardDescription>
          Assign each player a position in your team. This is useful so you can
          easily switch players for subs without sharing login data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {props.team.playerPositions.map((position, i) => (
            <Fragment key={position.id}>
              <div className="grid grid-cols-[auto_1fr] gap-2">
                {props.canEdit ? (
                  <>
                    <Input
                      defaultValue={position.positionName ?? ""}
                      onBlur={(e) =>
                        setMemberPositionName(position.id, e.target.value)
                      }
                    />
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost">
                            {(() => {
                              const member = props.team.members.find(
                                (m) => m.id === position.playerID
                              );
                              if (!member) return <em>Select player</em>;
                              return (
                                <>
                                  <ColorButton
                                    component="span"
                                    color={member.defaultColor}
                                    size="small"
                                  />
                                  {member.name}
                                </>
                              );
                            })()}
                            <ChevronRight className="ml-auto" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" className="w-56">
                          <DropdownMenuItem
                            key="clear"
                            onClick={() => setMemberPosition(position.id, null)}
                          >
                            <em>Clear</em>
                          </DropdownMenuItem>
                          {props.team.members.map((member) => (
                            <DropdownMenuItem
                              key={member.name}
                              onClick={() =>
                                setMemberPosition(position.id, member.id)
                              }
                            >
                              <ColorButton
                                component="span"
                                color={member.defaultColor}
                                size="small"
                              />
                              {member.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="min-w-48">{position.positionName}</span>
                    <span>
                      {(() => {
                        const member = props.team.members.find(
                          (m) => m.id === position.playerID
                        );
                        if (!member) return <em>Unassigned</em>;
                        return (
                          <>
                            <ColorButton
                              component="span"
                              color={member.defaultColor}
                              size="small"
                              className="inline-block align-sub mr-1"
                            />
                            {member.name}
                          </>
                        );
                      })()}
                    </span>
                  </>
                )}
              </div>
              {i < props.team.playerPositions.length - 1 && <Separator />}
            </Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
