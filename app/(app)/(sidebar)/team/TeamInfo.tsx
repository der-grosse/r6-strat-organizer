"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRef, useState } from "react";
import { updateTeamName } from "@/src/auth/team";
import { Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export interface TeamInfoProps {
  team: Team;
}

export default function TeamInfo(props: TeamInfoProps) {
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const teamNameInputRef = useRef<HTMLInputElement | null>(null);
  const [newTeamName, setNewTeamName] = useState("");

  const handleUpdateTeamName = async () => {
    try {
      await updateTeamName(newTeamName);
      setIsEditingTeamName(false);
      toast.success("Team name updated successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update team name"
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Settings</CardTitle>
        <CardDescription>Manage your team settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {isEditingTeamName ? (
            <>
              <Input
                ref={teamNameInputRef}
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdateTeamName();
                  }
                }}
                placeholder="Enter new team name"
                className="max-w-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUpdateTeamName}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditingTeamName(false);
                  setNewTeamName("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="text-lg font-semibold">{props.team.name}</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditingTeamName(true);
                  setNewTeamName(props.team.name);
                  setTimeout(() => {
                    teamNameInputRef.current?.focus();
                  }, 0);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
