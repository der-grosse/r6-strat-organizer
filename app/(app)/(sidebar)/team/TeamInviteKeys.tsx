"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createInviteKey, deleteInviteKey } from "@/src/auth/inviteKeys";

export interface TeamInviteKeysProps {
  inviteKeys: InviteKey[];
}

export default function TeamInviteKeys(props: TeamInviteKeysProps) {
  const handleCreateInviteKey = async () => {
    try {
      const key = await createInviteKey();
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
      toast.success("Invite key deleted successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete invite key"
      );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Keys</CardTitle>
        <CardDescription>
          Create and manage invite keys for your team
        </CardDescription>
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
              {props.inviteKeys
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
                    <TableCell className="font-mono">{key.inviteKey}</TableCell>
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
  );
}
