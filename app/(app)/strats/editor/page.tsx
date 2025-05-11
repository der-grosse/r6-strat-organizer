"use client";

import { useSearchParams } from "next/navigation";
import { StratEditor } from "@/components/StratEditor";
import { useFilter } from "@/components/context/FilterContext";

export default function StratEditorPage() {
  const searchParams = useSearchParams();
  const map = searchParams.get("map") ?? "";
  const site = searchParams.get("site") ?? "";
  const drawingID = searchParams.get("drawingID") ?? undefined;

  const { refreshStrats } = useFilter();

  const handleSave = async (assets: any[]) => {
    // TODO: Save the assets to the database
    console.log("Saving assets:", assets);
    await refreshStrats();
  };

  if (!map || !site) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Please select a map and site to start editing
        </p>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <StratEditor
        map={map}
        site={site}
        drawingID={drawingID}
        onSave={handleSave}
      />
    </div>
  );
}
