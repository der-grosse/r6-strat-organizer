"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { acceptInvite } from "@/server/auth";

interface InviteInfo {
  teamID: string;
  teamName: string;
  used: boolean;
}

export default function AcceptInvite(props: {
  userName: string;
  inviteKey?: string;
  info: InviteInfo | null;
}) {
  const [manualKey, setManualKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // A key passed via the invite link takes precedence over manual entry.
  const keyToUse = props.inviteKey ?? manualKey;
  const linkedInvalid = !!props.inviteKey && props.info === null;
  const linkedUsed = !!props.info?.used;

  const handleAccept = async () => {
    setError("");
    setLoading(true);
    try {
      await acceptInvite(keyToUse);
      // Full reload so the Convex client picks up the new JWT / active team.
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Join another team</CardTitle>
            <CardDescription>
              You are signed in as <strong>{props.userName}</strong>.
              {props.info && !props.info.used ? (
                <>
                  {" "}
                  Accept the invite to join{" "}
                  <strong>{props.info.teamName}</strong>.
                </>
              ) : (
                " Enter an invite key to join an existing team."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {linkedInvalid && (
              <p className="text-sm text-destructive">
                This invite key is invalid.
              </p>
            )}
            {linkedUsed && (
              <p className="text-sm text-destructive">
                This invite has already been used.
              </p>
            )}

            {!props.inviteKey && (
              <div>
                <label htmlFor="invite-key" className="sr-only">
                  Invite Key
                </label>
                <Input
                  id="invite-key"
                  name="invite-key"
                  type="text"
                  placeholder="Invite Key"
                  value={manualKey}
                  onChange={(e) => setManualKey(e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              className="w-full"
              onClick={handleAccept}
              disabled={loading || linkedInvalid || linkedUsed || !keyToUse}
            >
              {loading ? "Joining team..." : "Accept invite"}
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">Back to app</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
