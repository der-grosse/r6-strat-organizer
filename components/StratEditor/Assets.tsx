import { Brush, Edit, Eye, EyeOff, GripVertical, Trash } from "lucide-react";
import { Button } from "../ui/button";
import Operator from "./assets/Operator";
import { cn } from "@/src/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getTeamUsers } from "@/src/auth/auth";
import { Separator } from "../ui/separator";
import ColorPickerDialog from "../ColorPickerDialog";

export interface TeamUsers {
  id: number;
  defaultColor: string | null;
}

export default function useMountAssets({
  deleteAsset,
  updateAsset,
}: {
  deleteAsset: (asset: PlacedAsset) => void;
  updateAsset: (asset: PlacedAsset) => void;
}) {
  const [teamUsers, setTeamUsers] = useState<TeamUsers[]>([]);
  useEffect(() => {
    let cancel = false;

    getTeamUsers().then((users) => {
      if (cancel) return;
      setTeamUsers(users);
    });

    return () => {
      cancel = true;
    };
  }, []);

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerAsset, setColorPickerAsset] = useState<PlacedAsset | null>(
    null
  );

  const menu = useCallback(
    (asset: PlacedAsset) => (
      <div
        className={cn(
          "absolute bottom-[110%] left-[50%] -translate-x-1/2 bg-muted text-muted-foreground rounded flex items-center justify-center"
        )}
      >
        <GripVertical />
        <div className="bg-border w-[1px] h-6" />
        {teamUsers.map((user) => (
          <Button
            key={user.id}
            size="icon"
            variant="ghost"
            className={cn(
              user.id === asset.player && "bg-card dark:hover:bg-card"
            )}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              updateAsset({
                ...asset,
                player: user.id,
                customColor: undefined,
              });
            }}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full",
                !user.defaultColor &&
                  "outline outline-2 outline-offset-1 outline-muted"
              )}
              style={{
                background: user.defaultColor ?? undefined,
              }}
            />
          </Button>
        ))}
        <Button
          size="icon"
          variant="ghost"
          className={cn(asset.customColor && "bg-card dark:hover:bg-card")}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => {
            setColorPickerAsset(asset);
            setColorPickerOpen(true);
          }}
        >
          <Brush />
        </Button>
        <div className="bg-border w-[1px] h-6" />
        {asset.type === "operator" && (
          <Button
            size="icon"
            variant="ghost"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              updateAsset({
                ...asset,
                showIcon: !asset.showIcon,
              });
            }}
          >
            {asset.showIcon ? <Eye /> : <EyeOff />}
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => deleteAsset(asset)}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Trash />
        </Button>
      </div>
    ),
    [teamUsers, deleteAsset, updateAsset]
  );

  const dialog = useMemo(
    () => (
      <ColorPickerDialog
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        onChange={(color) => {
          updateAsset({
            ...colorPickerAsset!,
            player: undefined,
            customColor: color,
          });
          setColorPickerOpen(false);
        }}
        color={colorPickerAsset?.customColor ?? ""}
      />
    ),
    [colorPickerOpen, colorPickerAsset, updateAsset]
  );

  const renderAsset = useCallback(
    function renderAsset(asset: PlacedAsset, selected: boolean) {
      const assetElement = (() => {
        switch (asset.type) {
          case "operator":
            return <Operator asset={asset} teamUsers={teamUsers} />;
          default:
            return <>Missing Asset</>;
        }
      })();
      return (
        <>
          {selected && menu(asset)}
          {assetElement}
        </>
      );
    },
    [menu, teamUsers]
  );

  return { renderAsset, UI: dialog };
}
