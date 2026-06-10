"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestResetPassword } from "@/server/auth";
import Link from "next/link";
import { useState } from "react";

export interface ResetPasswordProps {}

export default function ResetPassword(props: ResetPasswordProps) {
  const [email, setEmail] = useState("");

  const [mailSent, setMailSent] = useState(false);

  if (mailSent) {
    return (
      <div className="h-screen flex flex-col items-center justify-center w-full gap-4">
        <h1 className="text-3xl font-extrabold text-foreground text-center">
          Check your email
          <br />
          <span className="text-muted-foreground text-lg font-normal">
            We have sent you an email with instructions to reset your password
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
        if (!email) return;

        await requestResetPassword(email);
        setMailSent(true);
      }}
    >
      <h1 className="text-3xl font-extrabold text-foreground text-center">
        Reset Password
        <br />
        <span className="text-muted-foreground text-lg font-normal">R6 Strats Management</span>
      </h1>
      <Input
        type="text"
        placeholder="Email"
        autoComplete="email"
        autoFocus
        className="w-full max-w-[20rem]"
        value={email}
        onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
      />
      <Button type="submit" variant="default" className="w-full max-w-[20rem]" disabled={!email}>
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
