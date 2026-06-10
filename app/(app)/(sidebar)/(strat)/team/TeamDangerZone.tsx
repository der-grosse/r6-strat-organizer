"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Id } from "@/convex/_generated/dataModel";
import { deleteTeam, leaveTeam } from "@/server/auth";
import { useState } from "react";
import { toast } from "sonner";

export interface TeamDangerZoneProps {
  team: {
    _id: Id<"teams">;
    name: string;
    isSelfAdmin: boolean;
    members: { isAdmin: boolean }[];
  };
}

export default function TeamDangerZone(props: TeamDangerZoneProps) {
  const { team } = props;
  const adminCount = team.members.filter((m) => m.isAdmin).length;
  // The only admin left can't leave (it would orphan the team) — their only
  // way out is to delete it.
  const isLastAdmin = team.isSelfAdmin && adminCount <= 1;

  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLeave = async () => {
    setLoading(true);
    try {
      await leaveTeam(team._id);
      window.location.href = "/";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to leave team");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteTeam(team._id);
      window.location.href = "/";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete team");
      setLoading(false);
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          {isLastAdmin
            ? "You are the last admin of this team. You can't leave it — you can only delete it permanently."
            : "Leave this team. You'll lose access to its strats until you're invited back."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLastAdmin ? (
          <Button variant="destructive" onClick={() => setOpen(true)}>
            Delete team permanently
          </Button>
        ) : (
          <Button variant="destructive" onClick={() => setOpen(true)}>
            Leave team
          </Button>
        )}
      </CardContent>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setConfirmName("");
        }}
      >
        <DialogContent>
          {isLastAdmin ? (
            <>
              <DialogHeader>
                <DialogTitle>Delete {team.name}?</DialogTitle>
                <DialogDescription>
                  This permanently deletes the team and all of its strats, positions and invites for
                  everyone. This cannot be undone. Type <strong>{team.name}</strong> to confirm.
                </DialogDescription>
              </DialogHeader>
              <Input
                autoFocus
                placeholder="Team name"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={loading || confirmName !== team.name}
                  onClick={handleDelete}
                >
                  {loading ? "Deleting..." : "Delete team"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Leave {team.name}?</DialogTitle>
                <DialogDescription>
                  You'll lose access to this team's strats until someone invites you back.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" disabled={loading} onClick={handleLeave}>
                  {loading ? "Leaving..." : "Leave team"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
