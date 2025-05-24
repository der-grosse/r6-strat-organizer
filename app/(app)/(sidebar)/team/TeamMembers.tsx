"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/components/context/UserContext";
import { useRef, useState } from "react";
import {
  removeMember,
  promoteToAdmin,
  demoteFromAdmin,
  changeUsername,
  changePassword,
  setMemberColor,
} from "@/src/auth/team";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Trash2,
  Shield,
  ShieldOff,
  Edit2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ColorPickerDialog, {
  ColorButton,
  DEFAULT_COLORS,
} from "@/components/ColorPickerDialog";

export interface TeamMembersProps {
  team: Team;
}

export default function TeamMembers(props: TeamMembersProps) {
  const { user } = useUser();
  const [isChangeUsernameOpen, setIsChangeUsernameOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const newUsernameRef = useRef<HTMLInputElement | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const newPasswordRef = useRef<HTMLInputElement | null>(null);

  const [userColorChangeOpen, setUserColorChangeOpen] = useState(false);
  const [userColorID, setUserColorID] = useState<number | null>(null);

  const handleRemoveUser = async (userID: number) => {
    try {
      await removeMember(userID);
      toast.success("User removed successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove user");
    }
  };

  const handlePromoteToAdmin = async (userID: number) => {
    try {
      await promoteToAdmin(userID);
      toast.success("User promoted to admin successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to promote user to admin"
      );
    }
  };

  const handleDemoteFromAdmin = async (userID: number) => {
    try {
      await demoteFromAdmin(userID);
      toast.success("User demoted from admin successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to demote user from admin"
      );
    }
  };

  const handleChangeUsername = async () => {
    try {
      await changeUsername(newUsername);
      setIsChangeUsernameOpen(false);
      setNewUsername("");
      toast.success("Username changed successfully");
      window.location.reload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to change username"
      );
    }
  };

  const handleChangePassword = async () => {
    try {
      await changePassword(newPassword);
      setIsChangePasswordOpen(false);
      setNewPassword("");
      toast.success("Password changed successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to change password"
      );
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined at</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.team.members
                .toSorted((a, b) => {
                  // Sort current user to top
                  if (a.id === user?.id) return -1;
                  if (b.id === user?.id) return 1;
                  // Sort admins next
                  if (a.isAdmin && !b.isAdmin) return -1;
                  if (!a.isAdmin && b.isAdmin) return 1;
                  // Sort alphabetically
                  return a.name.localeCompare(b.name);
                })
                .map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="w-[50px]">
                      <ColorButton
                        size="small"
                        color={member.defaultColor ?? DEFAULT_COLORS[0]}
                        onClick={() => {
                          setUserColorID(member.id);
                          setUserColorChangeOpen(true);
                        }}
                        disabled={member.id !== user?.id && !user?.isAdmin}
                      />
                    </TableCell>
                    <TableCell>
                      {member.name}
                      {user?.id === member.id && (
                        <span className="ml-2 text-muted-foreground text-sm">
                          (You)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{member.isAdmin ? "Admin" : "Member"}</TableCell>
                    <TableCell>
                      {new Date(member.createdAt).toLocaleDateString("de-DE", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu modal>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={user?.id !== member.id && !user?.isAdmin}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="right">
                          {member.id === user?.id && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setIsChangeUsernameOpen(true);
                                  setNewUsername(member.name);
                                  requestAnimationFrame(() => {
                                    newUsernameRef.current?.focus();
                                  });
                                }}
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Change Username
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setIsChangePasswordOpen(true);
                                  setNewPassword("");
                                  requestAnimationFrame(() => {
                                    newPasswordRef.current?.focus();
                                  });
                                }}
                              >
                                <Lock className="mr-2 h-4 w-4" />
                                Change Password
                              </DropdownMenuItem>
                            </>
                          )}
                          {user?.isAdmin && member.id !== user?.id && (
                            <>
                              {!member.isAdmin ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handlePromoteToAdmin(member.id)
                                  }
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Promote to Admin
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDemoteFromAdmin(member.id)
                                  }
                                >
                                  <ShieldOff className="mr-2 h-4 w-4" />
                                  Demote from Admin
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                          {user?.isAdmin && !member.isAdmin && (
                            <DropdownMenuItem
                              onClick={() => handleRemoveUser(member.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ColorPickerDialog
        open={userColorChangeOpen}
        onClose={() => setUserColorChangeOpen(false)}
        color={
          props.team.members.find((u) => u.id === userColorID)?.defaultColor ??
          DEFAULT_COLORS[0]
        }
        onChange={async (color) => {
          if (userColorID) await setMemberColor(color, userColorID);
          setUserColorID(null);
          setUserColorChangeOpen(false);
        }}
      />

      <Dialog
        open={isChangeUsernameOpen}
        onOpenChange={(open) => {
          setIsChangeUsernameOpen(open);
          if (!open)
            setTimeout(() => (document.body.style.pointerEvents = ""), 500);
        }}
      >
        <DialogContent className="w-auto">
          <DialogHeader>
            <DialogTitle>Change Username</DialogTitle>
            <DialogDescription>
              Enter your new username below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              ref={newUsernameRef}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleChangeUsername();
              }}
              placeholder="New username"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChangeUsernameOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleChangeUsername}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isChangePasswordOpen}
        onOpenChange={(open) => {
          setIsChangePasswordOpen(open);
          if (!open)
            setTimeout(() => (document.body.style.pointerEvents = ""), 500);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your new password below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              ref={newPasswordRef}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleChangePassword();
              }}
              placeholder="New password"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChangePasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
