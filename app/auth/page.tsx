"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/src/auth/auth";
import { useState } from "react";
import Link from "next/link";
import { CircleX } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  return (
    <form
      className="h-screen flex flex-col items-center justify-center w-full gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(false);

        const user = await login(username, password);

        setError(!user);

        if (user) {
          window.location.href = "/";
        }
      }}
    >
      <h1 className="text-3xl font-extrabold text-foreground text-center">
        Login
        <br />
        <span className="text-muted-foreground text-lg font-normal">
          R6 Strats Management
        </span>
      </h1>
      <Input
        type="text"
        placeholder="Username"
        autoComplete="username"
        autoFocus
        className="w-full max-w-[20rem]"
        value={username}
        onInput={(e) => setUsername((e.target as HTMLInputElement).value)}
      />
      <Input
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        className="w-full max-w-[20rem]"
        value={password}
        onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
      />
      <Button type="submit" variant="default" className="w-full max-w-[20rem]">
        Login
      </Button>
      <p className="text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-primary hover:text-primary/90 hover:underline"
        >
          Create a team or join existing team
        </Link>
      </p>
      <p className="text-lg text-destructive min-h-[2rem]">
        {error && (
          <>
            <CircleX className="w-5 h-5 inline align-sub mr-1" />
            Invalid password
          </>
        )}
      </p>
    </form>
  );
}
