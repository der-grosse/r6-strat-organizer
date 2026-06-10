"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TeamPositionsList from "./TeamPositionsList";
import { FullTeam } from "@/lib/types/team.types";

export interface TeamPositionsProps {
  team: FullTeam;
  canEdit: boolean;
}

export default function TeamPositions(props: TeamPositionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Positions</CardTitle>
        <CardDescription>
          Assign each player a position in your team. This is useful so you can easily switch
          players for subs without sharing login data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TeamPositionsList canEdit={props.canEdit} team={props.team} />
      </CardContent>
    </Card>
  );
}
