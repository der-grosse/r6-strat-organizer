"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import AccountInfo from "../team/AccountInfo";
import AppSettings from "./AppSettings";

export default function SettingsPage() {
  const team = useQuery(api.team.get);

  if (!team) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-8">
        <Skeleton className="w-full h-8 rounded mb-4" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="grid grid-cols-2 gap-8">
        <AccountInfo team={team} />
        <AppSettings />
      </div>
    </div>
  );
}
