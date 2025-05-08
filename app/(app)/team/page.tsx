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
import { useState, useEffect } from "react";
import {
  getTeamUsers,
  removeUser,
  promoteToAdmin,
  demoteFromAdmin,
  createInviteKey,
  getInviteKeys,
  deleteInviteKey,
  getTeamName,
  updateTeamName,
} from "@/src/auth/auth";
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
  Copy,
  Trash2,
  Shield,
  ShieldOff,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function TeamManagement() {
  const { user } = useUser();
  const [teamUsers, setTeamUsers] = useState<
    {
      isAdmin: boolean;
      id: number;
      name: string;
      password: string;
      createdAt: string;
      teamID: number;
    }[]
  >([]);
  const [inviteKeys, setInviteKeys] = useState<
    {
      inviteKey: string;
      teamID: number;
      usedBy: number | null;
      usedAt: string | null;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teamName, setTeamName] = useState<string | null>(null);
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  const loadData = async () => {
    try {
      const [users, keys, name] = await Promise.all([
        getTeamUsers(),
        user?.isAdmin ? getInviteKeys() : [],
        getTeamName(),
      ]);
      setTeamUsers(users);
      setInviteKeys(keys);
      setTeamName(name ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.teamID) {
      loadData();
    }
  }, [user?.teamID]);

  const handleRemoveUser = async (userID: number) => {
    try {
      await removeUser(userID);
      await loadData();
      toast.success("User removed successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove user");
    }
  };

  const handlePromoteToAdmin = async (userID: number) => {
    try {
      await promoteToAdmin(userID);
      await loadData();
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
      await loadData();
      toast.success("User demoted from admin successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to demote user from admin"
      );
    }
  };

  const handleCreateInviteKey = async () => {
    try {
      const key = await createInviteKey();
      await loadData();
      navigator.clipboard.writeText(key);
      toast.success("Invite key created successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create invite key"
      );
    }
  };

  const handleDeleteInviteKey = async (key: string) => {
    try {
      await deleteInviteKey(key);
      await loadData();
      toast.success("Invite key deleted successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete invite key"
      );
    }
  };

  const handleUpdateTeamName = async () => {
    try {
      await updateTeamName(newTeamName);
      await loadData();
      setIsEditingTeamName(false);
      toast.success("Team name updated successfully");
      window.location.reload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update team name"
      );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {user?.isAdmin && (
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
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
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
                  <div className="text-lg font-semibold">{teamName}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsEditingTeamName(true);
                      setNewTeamName(teamName ?? "");
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined at</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamUsers.map((member) => (
                <TableRow key={member.id}>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={user?.id === member.id || !user?.isAdmin}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user?.isAdmin && member.id !== user?.id && (
                          <>
                            {!member.isAdmin ? (
                              <DropdownMenuItem
                                onClick={() => handlePromoteToAdmin(member.id)}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Promote to Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleDemoteFromAdmin(member.id)}
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

      {user?.isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Keys</CardTitle>
            <CardDescription>
              Create and manage invite keys for your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={handleCreateInviteKey}>
                Create New Invite Key
              </Button>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invite Key</TableHead>
                    <TableHead>Used At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inviteKeys
                    .toSorted((a, b) => {
                      if (a.usedAt && b.usedAt) {
                        return (
                          new Date(a.usedAt).getTime() -
                          new Date(b.usedAt).getTime()
                        );
                      }
                      if (a.usedAt) {
                        return 1;
                      }
                      if (b.usedAt) {
                        return -1;
                      }
                      return 0;
                    })
                    .map((key) => (
                      <TableRow key={key.inviteKey}>
                        <TableCell className="font-mono">
                          {key.inviteKey}
                        </TableCell>
                        <TableCell>
                          {key.usedAt ? (
                            new Date(key.usedAt).toLocaleDateString("de-DE", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })
                          ) : (
                            <em>Not used</em>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!key.usedAt && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyToClipboard(key.inviteKey)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleDeleteInviteKey(key.inviteKey)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
