"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { createTeamForCurrentUser, switchTeam } from "@/server/auth";
import { useQuery } from "convex/react";
import { Check, ChevronsUpDown, Plus, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function TeamSwitcher() {
  const teams = useQuery(api.team.listMine);
  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  if (!teams) {
    return <Skeleton className="h-8 flex-1" />;
  }

  const activeTeam = teams.find((t) => t.isActive);

  const handleSwitch = async (teamID: string) => {
    if (teamID === activeTeam?.teamID || busy) return;
    setBusy(true);
    try {
      await switchTeam(teamID);
      // Full reload so the Convex client fetches a token for the new team.
      window.location.href = "/";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to switch team");
      setBusy(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            disabled={busy}
            className="flex-1 justify-between gap-1 px-2 font-semibold"
          >
            <span className="truncate">{activeTeam?.name ?? "Select a team"}</span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {teams.map((team) => (
            <DropdownMenuItem key={team.teamID} onSelect={() => handleSwitch(team.teamID)}>
              <span className="truncate">{team.name}</span>
              {team.isActive && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/signup/join">
              <UserPlus className="mr-2 h-4 w-4" />
              Join a team
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create a team
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateTeamDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}

function CreateTeamDialog(props: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setLoading(true);
    try {
      await createTeamForCurrentUser(name.trim());
      // Full reload so the Convex client switches to the new team.
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
      setLoading(false);
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle>Create a new team</DialogTitle>
            <DialogDescription>
              You&apos;ll be the admin of this team and it will become your active team.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-2">
            <Input
              autoFocus
              placeholder="Team name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Creating..." : "Create team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
