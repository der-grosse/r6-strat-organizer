import Operator from "../assets/Operator";
import { useCallback, useMemo, useState } from "react";
import GadgetIcon from "../../general/GadgetIcon";
import AssetOutline from "../assets/AssetOutline";
import Reinforcement from "../../icons/reinforcement";
import Rotation from "../../icons/rotation";
import Explosion from "../assets/Explosion";
import WoodenBarricade from "../../icons/woodenBarricade";
import { useUser } from "../../context/UserContext";
import ColorPickerDialog from "../../general/ColorPickerDialog";
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
            />
          ) : undefined,
        asset: fullAsset,
      };
    },
    [team, stratPositions],
  );

  return { renderAsset, UI: colorPickerDialog };
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
