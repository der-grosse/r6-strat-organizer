"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useId } from "react";

export default function AppSettings() {
  const selectID = useId();
  const settings = useQuery(api.settings.get);
  const updateSettings = useMutation(api.settings.update);

  return (
    <Card>
      <CardHeader>
        <CardTitle>App Settings</CardTitle>
        <CardDescription>Customize your experience</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor={selectID}>Active Strat Layout</Label>
          <Select
            value={settings?.activeStratLayout ?? "bottom"}
            onValueChange={(value: "bottom" | "top") =>
              updateSettings({ activeStratLayout: value })
            }
          >
            <SelectTrigger id={selectID} className="w-full">
              <SelectValue placeholder="Select layout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bottom">Bottom</SelectItem>
              <SelectItem value="top">Top</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
