"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/src/auth/auth";
import { useState } from "react";

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
      <h1 className="text-xl">R6 Strats Management - Login</h1>
      <Input
        type="text"
        placeholder="Username"
        autoComplete="username"
        autoFocus
        className="w-1/2"
        value={username}
        onInput={(e) => setUsername((e.target as HTMLInputElement).value)}
      />
      <Input
        type="password"
        placeholder="Password"
        autoComplete="current-password"
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
