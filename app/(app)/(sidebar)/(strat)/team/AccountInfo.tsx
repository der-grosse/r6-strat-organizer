"use client";
import { useUser } from "@/components/context/UserContext";
import useSaveDebounced from "@/components/hooks/useSaveDebounced";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { FullTeam } from "@/lib/types/team.types";
import { checkUbisoftID } from "@/lib/ubisoft/ubi";
import { changePassword } from "@/server/auth";
import { useMutation, useQuery } from "convex/react";
import { Check, RotateCcwKey, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function AccountInfo(props: { team: Pick<FullTeam, "members"> }) {
  const self = useQuery(api.self.get, {});
  const user = useMemo(
    () => props.team.members.find((m) => m._id === self?._id),
    [props.team, self],
  );

  const updateSelf = useMutation(api.self.update);

  const [newUsername, setNewUsername] = useState(user?.name ?? "");
  const [usernameInvalid, setUsernameInvalid] = useState(false);
  const [newEmail, setNewEmail] = useState(self?.email ?? "");
  const [ubisoftID, setUbisoftID] = useState(user?.ubisoftID ?? "");
  const [ubisoftIDValid, setUbisoftIDValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user || !self) return;
    if (!newUsername) setNewUsername(user.name);
    if (!newEmail) setNewEmail(self.email ?? "");
    if (!ubisoftID) setUbisoftID(user.ubisoftID ?? "");
  }, [user]);

  const { saveNow: saveUsername } = useSaveDebounced(newUsername, async (newUsername) => {
    try {
      await updateSelf({
        name: newUsername,
      });
    } catch (err) {
      setUsernameInvalid(true);
      toast.error(err instanceof Error ? err.message : "Failed to change username");
    }
  });

  const { saveNow: saveEmail } = useSaveDebounced(newEmail, async (newEmail) => {
    if (newEmail && !isEmailValid(newEmail)) return;
    try {
      await updateSelf({ email: newEmail });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change email");
    }
  });

  const { saveNow: saveUbisoftID } = useSaveDebounced(ubisoftID, async (ubisoftID) => {
    try {
      await updateSelf({
        ubisoftID,
      });
      const isValid = await checkUbisoftID(ubisoftID);
      setUbisoftIDValid(isValid);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change Ubisoft ID");
    }
  });

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleChangePassword = async () => {
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res) {
        toast.error(res);
      } else {
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setChangePasswordOpen(false);
        toast.success("Password changed successfully");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Info</CardTitle>
        <CardDescription>Manage your account data</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="username-input">Username</Label>
          <Input
            id="username-input"
            value={newUsername}
            onChange={(e) => {
              setUsernameInvalid(false);
              setNewUsername(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveUsername();
            }}
            onBlur={() => saveUsername()}
            placeholder="Username"
            className={usernameInvalid ? "!border-destructive !bg-destructive/25" : undefined}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email-input">Email</Label>
          <Input
            id="email-input"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEmail();
            }}
            onBlur={() => saveEmail()}
            placeholder="Email"
            aria-invalid={!!newEmail && !isEmailValid(newEmail)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ubisoft-id-input">Ubisoft ID</Label>
          <div className="relative">
            <Input
              id="ubisoft-id-input"
              value={ubisoftID}
              onChange={(e) => setUbisoftID(e.target.value.slice(0, 50))}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveUbisoftID();
              }}
              onBlur={() => saveUbisoftID()}
              placeholder="Ubisoft ID"
            />
            {ubisoftID && ubisoftIDValid !== null && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {ubisoftIDValid ? (
                      <Check className="text-green-500" />
                    ) : (
                      <X className="text-red-500" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <span>
                    {ubisoftIDValid
                      ? "Valid Ubisoft ID"
                      : "Invalid Ubisoft ID (User could have no profile picture)"}
                  </span>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => {}}>
              <RotateCcwKey />
              Change Password
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="old-password-input">Old Password</Label>
                <Input
                  id="old-password-input"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Old Password"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-password-input">New Password</Label>
                <Input
                  id="new-password-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm-new-password-input">Confirm New Password</Label>
                <Input
                  id="confirm-new-password-input"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm New Password"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
                  <X /> Cancel
                </Button>
              </DialogClose>
              <Button
                variant="outline"
                onClick={handleChangePassword}
                disabled={newPassword !== confirmNewPassword || !newPassword || !oldPassword}
              >
                <Check /> Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function isEmailValid(email: string) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
