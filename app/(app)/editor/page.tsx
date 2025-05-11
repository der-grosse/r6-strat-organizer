import { StratEditor } from "@/components/StratEditor";

export default function StratEditorPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <StratEditor
        strat={{
          assets: [],
          description: "",
          name: "",
          drawingID: "",
          id: 0,
          map: "Bank",
          powerOPs: [],
          rotationIndex: [],
          site: "B Lockers",
        }}
      />
    </div>
  );
}
