"use client";

import { StratEditor } from "@/components/StratEditor/StratEditor";
import { StratExportProvider } from "@/components/StratEditor/ExportRenderer";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { CircleX } from "lucide-react";
import { useEffect } from "react";

export interface StratEditorClientProps {
  id: string | undefined;
}

export default function StratEditorClient(props: StratEditorClientProps) {
  const strat = useQuery(api.strats.get, props.id ? { id: props.id as Id<"strats"> } : "skip");
  const team = useQuery(api.team.get, {});

  useEffect(() => {
    if (strat) {
      window.document.title = `${strat.name} | ${strat.map} - ${strat.site}`;
    } else {
      window.document.title = "Strat not found";
    }
  }, [strat]);

  if (!team || strat === undefined) return null;

  if (!strat || !props.id) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center">
        <CircleX className="text-destructive" size={64} />
        <h2 className="text-destructive">Strat not found</h2>
      </div>
    );
  }

  return (
    <StratExportProvider>
      <div className="h-screen w-screen overflow-hidden">
        <StratEditor team={team} strat={strat} />
      </div>
    </StratExportProvider>
  );
}
