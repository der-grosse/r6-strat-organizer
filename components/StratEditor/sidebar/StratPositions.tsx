import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PLAYER_COUNT } from "@/lib/static/general";
import { useMemo } from "react";
import StratPositionItem from "./StratPositionItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Strat } from "@/lib/types/strat.types";
import { FullTeam } from "@/lib/types/team.types";

export interface StratEditorPlayerPositionsSidebarProps {
  strat: Pick<Strat, "stratPositions" | "_id">;
  team: FullTeam;
}

export default function StratEditorPlayerPositionsSidebar({
  strat: { stratPositions, _id: stratID },
  team,
}: StratEditorPlayerPositionsSidebarProps) {
  const sortedStratPositions = useMemo(
    () =>
      stratPositions
        .map((data) => ({
          data,
          position: team.teamPositions.find((pos) => pos._id === data.teamPositionID),
        }))
        .sort((a, b) => {
          if (a.position && b.position) {
            return a.position.index - b.position.index;
          }
          return 0;
        })
        .map(({ data }) => data),
    [stratPositions, team],
  );

  return (
    <ScrollArea className="h-screen">
      <div className="p-2 flex flex-col gap-4">
        <Label className="text-muted-foreground p-2 -mb-2">Player positions</Label>

        {sortedStratPositions.map((stratPos) => (
          <StratPositionItem
            key={stratPos._id}
            stratID={stratID}
            team={team}
            stratPosition={stratPos}
            hasError={stratPositions.some(
              (o) =>
                o._id !== stratPos._id &&
                ((stratPos.teamPositionID && o.teamPositionID === stratPos.teamPositionID) ||
                  (o.pickedOperators.length === 1 &&
                    stratPos.pickedOperators.length === 1 &&
                    o.pickedOperators[0] === stratPos.pickedOperators[0])),
            )}
          />
        ))}
        {team.members.length < PLAYER_COUNT && (
          <>
            <Separator />
            <div className="text-sm text-muted-foreground">
              {`It is strongly recommended to have ${PLAYER_COUNT} players in your team to be able to use all features properly.`}
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}
