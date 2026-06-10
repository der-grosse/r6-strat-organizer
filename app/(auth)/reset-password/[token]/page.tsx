"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/server/auth";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ConfirmPasswordReset() {
  const { token } = useParams();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordsValid = password.length >= 4 && password === confirmPassword;

  if (!token || typeof token !== "string" || !email) {
    return (
      <div className="h-screen flex flex-col items-center justify-center w-full gap-4">
        <h1 className="text-3xl font-extrabold text-foreground text-center">
          Invalid password reset link
          <br />
          <span className="text-muted-foreground text-lg font-normal">
            The password reset link is invalid or incomplete
          </span>
        </h1>
      </div>
    );
  }

  return (
    <form
      className="h-screen flex flex-col items-center justify-center w-full gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!email || !passwordsValid) return;

        const res = await resetPassword(email, token, password);
        window.open("/", "_self");
      }}
    >
      <h1 className="text-3xl font-extrabold text-foreground text-center">
        Reset Password
        <br />
        <span className="text-muted-foreground text-lg font-normal">R6 Strats Management</span>
      </h1>
      <Input
        type="password"
        placeholder="New password"
        autoComplete="new-password"
        autoFocus
        className="w-full max-w-[20rem]"
        value={password}
        onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
      />
      <Input
        type="password"
        placeholder="Confirm new password"
        autoComplete="new-password"
        autoFocus
        className="w-full max-w-[20rem]"
        value={confirmPassword}
        onInput={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
      />
      <Button
        type="submit"
        variant="default"
        className="w-full max-w-[20rem]"
        disabled={!passwordsValid}
      >
        Reset Password
      </Button>
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:text-primary/90 hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}
