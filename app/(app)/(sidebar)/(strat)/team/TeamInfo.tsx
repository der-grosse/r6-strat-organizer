"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useSaveDebounced from "@/components/hooks/useSaveDebounced";
import { FullTeam } from "@/lib/types/team.types";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface TeamInfoProps {
  team: Pick<FullTeam, "_creationTime" | "members" | "name" | "_id">;
}

export default function TeamInfo(props: TeamInfoProps) {
  const updateTeam = useMutation(api.team.updateTeam);
  const teamNameInputRef = useRef<HTMLInputElement | null>(null);
  const [newTeamName, setNewTeamName] = useState(props.team.name);

  const { saveNow: saveTeamName } = useSaveDebounced(newTeamName, async (newTeamName) => {
    try {
      await updateTeam({ _id: props.team._id, name: newTeamName });
      toast.success("Team name updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update team name");
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Settings</CardTitle>
        <CardDescription>Manage your team settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="teamname-input">Team Name</Label>
          <Input
            id="teamname-input"
            ref={teamNameInputRef}
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveTeamName();
              }
            }}
            onBlur={() => saveTeamName()}
            placeholder="Team Name"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="created-at-info">Created at</Label>
          <span id="created-at-info" className="text-sm text-muted-foreground">
            {new Date(props.team._creationTime).toLocaleDateString("de-DE", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </span>
        </div>
        <div className="space-y-1">
          <Label htmlFor="team-member-count">Team member count</Label>
          <span id="team-member-count" className="text-sm text-muted-foreground">
            {props.team.members.length} member
            {props.team.members.length !== 1 ? "s" : ""}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
