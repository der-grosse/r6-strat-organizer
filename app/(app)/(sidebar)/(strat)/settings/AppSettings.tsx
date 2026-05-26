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
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Eye, EyeOff } from "lucide-react";
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

        <div className="space-y-2">
          <Label>Active Strat Info</Label>
          <p className="text-sm text-muted-foreground">
            Choose which details appear below the active strat.
          </p>
          {[
            { key: "mapName" as const, label: "Map Name" },
            { key: "siteName" as const, label: "Site Name" },
            { key: "stratName" as const, label: "Strat Name" },
          ].map(({ key, label }) => {
            const isVisible =
              settings?.activeStratNameTemplate?.[key] ?? key !== "mapName";
            return (
              <Button
                key={key}
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() =>
                  updateSettings({
                    activeStratNameTemplate: {
                      stratName:
                        settings?.activeStratNameTemplate?.stratName ?? true,
                      mapName:
                        settings?.activeStratNameTemplate?.mapName ?? false,
                      siteName:
                        settings?.activeStratNameTemplate?.siteName ?? true,
                      [key]: !isVisible,
                    },
                  })
                }
              >
                {isVisible ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4 text-muted-foreground" />
                )}
                <span className={!isVisible ? "text-muted-foreground" : ""}>
                  {label}
                </span>
              </Button>
            );
          })}
        </div>

        <div className="space-y-2">
          <Label>Floors</Label>
          <p className="text-sm text-muted-foreground">
            Hide floors that have no setup placed on them when viewing a strat.
          </p>
          {(() => {
            const hideEmptyFloors = settings?.hideEmptyFloors ?? true;
            return (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() =>
                  updateSettings({ hideEmptyFloors: !hideEmptyFloors })
                }
              >
                {hideEmptyFloors ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4 text-muted-foreground" />
                )}
                <span
                  className={!hideEmptyFloors ? "text-muted-foreground" : ""}
                >
                  Hide empty floors
                </span>
              </Button>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
}
