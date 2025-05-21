import { StratEditor } from "@/components/StratEditor/StratEditor";
import { getTeamUsers } from "@/src/auth/team";

export default async function StratEditorPage() {
  const teamMembers = await getTeamUsers();
  return (
    <div className="h-screen w-screen overflow-hidden">
      <StratEditor
        teamMembers={teamMembers}
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
