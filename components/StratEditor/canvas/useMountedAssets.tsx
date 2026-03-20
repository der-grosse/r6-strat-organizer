import Operator from "../assets/Operator";
import Textbox from "../assets/Textbox";
import { useCallback, useMemo, useState } from "react";
import GadgetIcon from "../../general/GadgetIcon";
import AssetOutline from "../assets/AssetOutline";
import Reinforcement from "../../icons/reinforcement";
import Rotation from "../../icons/rotation";
import Explosion from "../assets/Explosion";
import WoodenBarricade from "../../icons/woodenBarricade";
import { useUser } from "../../context/UserContext";
import ColorPickerDialog from "../../general/ColorPickerDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { FullTeam, TeamMember } from "@/lib/types/team.types";
import { StratPositions } from "@/lib/types/strat.types";
import { PlacedAsset } from "@/lib/types/asset.types";
import { Id } from "@/convex/_generated/dataModel";
import AssetMenu from "./AssetMenu";

export default function useMountAssets(
  {
    team,
    stratPositions,
  }: { team: FullTeam; stratPositions: StratPositions[] },
  {
    deleteAssets,
    updateAssets,
  }: {
    deleteAssets: (assets: PlacedAsset[]) => void;
    updateAssets: (assets: PlacedAsset[]) => void;
  },
) {
  const { user } = useUser();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerAssets, setColorPickerAssets] = useState<
    PlacedAsset[] | null
  >(null);
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [textEditorAsset, setTextEditorAsset] = useState<PlacedAsset | null>(
    null,
  );
  const [textEditorValue, setTextEditorValue] = useState("");

  const colorPickerDialog = useMemo(
    () => (
      <ColorPickerDialog
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        onChange={(color) => {
          updateAssets(
            colorPickerAssets!.map((asset) => ({
              ...asset,
              stratPositionID: undefined,
              customColor: color,
            })),
          );
          setColorPickerOpen(false);
        }}
        color={
          colorPickerAssets?.reduce(
            (acc, asset) => (acc === asset.customColor ? acc : undefined),
            colorPickerAssets[0]?.customColor,
          ) ?? ""
        }
      />
    ),
    [colorPickerOpen, colorPickerAssets, updateAssets],
  );

  const textEditorDialog = useMemo(
    () => (
      <Dialog open={textEditorOpen} onOpenChange={setTextEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Text</DialogTitle>
          </DialogHeader>
          <Textarea
            value={textEditorValue}
            onChange={(e) => setTextEditorValue(e.target.value)}
            placeholder="Enter text..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && textEditorAsset) {
                e.preventDefault();
                updateAssets([{ ...textEditorAsset, text: textEditorValue } as PlacedAsset]);
                setTextEditorOpen(false);
              }
            }}
            rows={3}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setTextEditorOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (textEditorAsset) {
                  updateAssets([{ ...textEditorAsset, text: textEditorValue } as PlacedAsset]);
                  setTextEditorOpen(false);
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
    [textEditorOpen, textEditorValue, textEditorAsset, updateAssets],
  );

  const renderAsset = useCallback(
    function renderAsset(
      asset: PlacedAsset,
      selectedAssets: PlacedAsset[],
      selectedBy: TeamMember["_id"][],
      latestSelected: boolean,
    ) {
      const assetElement = (() => {
        switch (asset.type) {
          case "operator":
            return (
              <Operator
                asset={asset}
                team={team}
                stratPositions={stratPositions}
              />
            );
          case "gadget":
            return (
              <AssetOutline
                asset={asset}
                team={team}
                stratPositions={stratPositions}
              >
                <GadgetIcon id={asset.gadget} className="h-full w-full" />
              </AssetOutline>
            );
          case "textbox":
            return (
              <Textbox
                asset={asset}
                team={team}
                stratPositions={stratPositions}
              />
            );
          //@ts-expect-error -- for legacy types, should not occur after migration
          case "reinforcement":
          //@ts-expect-error
          case "rotate":
          case "layout":
            if (asset.variant === "barricade") {
              return (
                <AssetOutline
                  asset={asset}
                  team={team}
                  stratPositions={stratPositions}
                >
                  <WoodenBarricade />
                </AssetOutline>
              );
            } else if (asset.variant === "reinforcement") {
              return (
                <Reinforcement
                  height={asset.size.height}
                  width={asset.size.width}
                  color={getAssetColor(asset, stratPositions, team)}
                />
              );
            } else if (asset.variant === "explosion") {
              return (
                <Explosion color={getAssetColor(asset, stratPositions, team)} />
              );
            } else {
              return (
                <Rotation
                  variant={asset.variant}
                  height={asset.size.height}
                  width={asset.size.width}
                  color={getAssetColor(asset, stratPositions, team)}
                />
              );
            }
          default:
            return <>Missing Asset</>;
        }
      })();
      const fullAsset = (() => {
        if (
          selectedBy.length === 0 ||
          selectedBy.every((id) => id === user?._id)
        ) {
          return assetElement;
        } else {
          const shadowColors = selectedBy
            .filter((id) => id !== user?._id)
            .map((id) => team.members.find((m) => m._id === id)?.defaultColor!)
            .filter(Boolean);
          return (
            <div
              style={{
                boxShadow: shadowColors.length
                  ? shadowColors.map((c) => `0 0 .4rem .3rem ${c}`).join(", ")
                  : undefined,
              }}
              className="size-full"
              title={`Selected by ${selectedBy
                .map((id) => team.members.find((m) => m._id === id)?.name)
                .join(", ")}`}
            >
              {assetElement}
            </div>
          );
        }
      })();
      return {
        menu:
          user &&
          latestSelected &&
          selectedBy.includes(user._id as Id<"users">) ? (
            <AssetMenu
              deleteAssets={deleteAssets}
              updateAssets={updateAssets}
              selectedAssets={selectedAssets}
              stratPositions={stratPositions}
              team={team}
              openColorPickerForAssets={(assets) => {
                setColorPickerAssets(assets);
                setColorPickerOpen(true);
              }}
              openTextEditorForAsset={(asset) => {
                setTextEditorAsset(asset);
                setTextEditorValue(
                  asset.type === "textbox" ? asset.text : "",
                );
                setTextEditorOpen(true);
              }}
            />
          ) : undefined,
        asset: fullAsset,
      };
    },
    [team, stratPositions],
  );

  const onAssetDoubleClick = useCallback(
    (asset: PlacedAsset) => {
      if (asset.type === "textbox") {
        setTextEditorAsset(asset);
        setTextEditorValue(asset.text);
        setTextEditorOpen(true);
      }
    },
    [],
  );

  return {
    renderAsset,
    onAssetDoubleClick,
    UI: (
      <>
        {colorPickerDialog}
        {textEditorDialog}
      </>
    ),
  };
}

export function getAssetColor(
  asset: Pick<PlacedAsset, "customColor" | "stratPositionID">,
  stratPositions: StratPositions[],
  team: FullTeam,
): string | undefined {
  if (asset.customColor) return asset.customColor;
  if (!asset.stratPositionID) return undefined;
  const pickedOP = stratPositions.find(
    (op) => op._id === asset.stratPositionID,
  );
  if (!pickedOP) return undefined;
  const postion = team.teamPositions.find(
    (pos) => pos._id === pickedOP.teamPositionID,
  );
  if (!postion) return undefined;
  const teamMember = team.members.find(
    (member) => member._id === postion.playerID,
  );
  return teamMember?.defaultColor ?? undefined;
}
