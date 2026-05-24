"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { register } from "@/server/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function JoinTeamForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteKey, setInviteKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await register({ name: username, password, invite_key: inviteKey });
      // Redirect to login page on success
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Join a team
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary/90 hover:underline"
            >
              go back to signup options
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* since we might load the code from search params, we need to wrap it in a suspense */}
            <Suspense>
              <CodeInput
                value={inviteKey}
                onChange={setInviteKey}
                error={!!error}
              />
            </Suspense>
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {error && (
            <div className="text-destructive text-sm text-center">{error}</div>
          )}

          <div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Joining team..." : "Join Team"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CodeInput({
  value,
  onChange,
  error = false,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}) {
  const searchParams = useSearchParams();
  const searchParamsInviteKey = searchParams.get("inviteKey");
  useEffect(() => {
    if (searchParamsInviteKey) {
      onChange(searchParamsInviteKey);
    }
  }, [searchParamsInviteKey, onChange]);

  return (
    <div className={cn(!!searchParamsInviteKey && "hidden")}>
      <label htmlFor="invite-key" className="sr-only">
        Invite Key
      </label>
      <Input
        id="invite-key"
        name="invite-key"
        type="text"
        required
        placeholder="Invite Key"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    </div>
  );
}
