import { StratEditor } from "@/components/StratEditor";

export default function StratEditorPage() {
  return (
    <div className="h-full p-4">
      <StratEditor
        strat={{
          assets: [],
          description: "",
          name: "",
          drawingID: "",
          id: 0,
          map: "Border",
          powerOPs: [],
          rotationIndex: [],
          site: "B Lockers",
        }}
      />
    </div>
  );
}
