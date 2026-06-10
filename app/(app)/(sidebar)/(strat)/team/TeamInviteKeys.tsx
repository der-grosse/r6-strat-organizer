"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "@/convex/_generated/dataModel";

export default function TeamInviteKeys(props: { teamID: Id<"teams"> }) {
  const inviteKeys = useQuery(api.team.getInviteKeys);
  const createInviteKey = useMutation(api.team.createInviteKey);
  const deleteInviteKey = useMutation(api.team.deleteInviteKey);

  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);

  const handleCreateInviteKey = async () => {
    try {
      const key = await createInviteKey({
        teamID: props.teamID,
      });
      navigator.clipboard.writeText(getFullInviteURL(key.inviteKey));
      toast.success("Invite key created successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create invite key");
    }
  };

  const handleDeleteInviteKey = async (id: Id<"teamInvites">) => {
    try {
      await deleteInviteKey({ inviteKey: id });
      toast.success("Invite key deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete invite key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (!inviteKeys) {
    return <Skeleton className="w-full h-24 rounded mb-4" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Keys</CardTitle>
        <CardDescription>Create and manage invite keys for your team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={handleCreateInviteKey}>Create New Invite Key</Button>
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
                    return new Date(a.usedAt).getTime() - new Date(b.usedAt).getTime();
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
                  <TableRow key={key._id}>
                    <TableCell className="font-mono w-2/3">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="-my-2 align-sub"
                        onClick={() => {
                          if (visibleKeys.includes(key.inviteKey)) {
                            setVisibleKeys(visibleKeys.filter((k) => k !== key.inviteKey));
                          } else {
                            setVisibleKeys([...visibleKeys, key.inviteKey]);
                          }
                        }}
                      >
                        {visibleKeys.includes(key.inviteKey) ? <EyeOff /> : <Eye />}
                      </Button>
                      {visibleKeys.includes(key.inviteKey)
                        ? key.inviteKey
                        : "*****-*****-*****-*****"}
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
                      <div className="flex gap-2 -m-2">
                        {!key.usedAt && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                copyToClipboard(getFullInviteURL(key.inviteKey));
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteInviteKey(key._id)}
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
  );
}

function getFullInviteURL(inviteKey: string) {
  return `${window.location.origin}/signup/join?inviteKey=${inviteKey}`;
}
