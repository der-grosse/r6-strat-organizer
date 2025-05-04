"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkCredentials } from "@/src/auth";
import { useState } from "react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  return (
    <form
      className="h-screen flex flex-col items-center justify-center w-full gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(false);

        const valid = await checkCredentials(password);

        setError(!valid);

        if (valid) {
          document.cookie = `r6-strat-token=${password}; path=/; max-age=31536000; secure; SameSite=Strict`;

          window.location.href = "/";
        }
      }}
    >
      <h1 className="text-xl">R6 Strats Management - Login</h1>
      <Input
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        autoFocus
        className="w-1/2"
        value={password}
        onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
      />
      <Button type="submit" variant="default" className="w-1/2">
        Login
      </Button>
      <p className="text-sm text-red-400">{error && "Invalid password"}</p>
    </form>
  );
}
