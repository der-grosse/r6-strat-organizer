import SVGOperator from "../assets/SVGOperator";
import Textbox from "../assets/Textbox";
import Arrow from "../assets/Arrow";
import Image from "../assets/Image";
import { useCallback, useMemo, useState } from "react";
import GadgetIcon from "../../general/GadgetIcon";
import AssetOutline from "../assets/AssetOutline";
import Reinforcement from "../../icons/reinforcement";
import Rotation from "../../icons/rotation";
import Explosion from "../assets/Explosion";
import WoodenBarricade from "../../icons/woodenBarricade";
import { useUser } from "../../context/UserContext";
import ColorPickerDialog from "../../general/ColorPickerDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { FullTeam, TeamMember } from "@/lib/types/team.types";
import { Adaptation, StratPositions } from "@/lib/types/strat.types";
import { PlacedAsset } from "@/lib/types/asset.types";
import { Id } from "@/convex/_generated/dataModel";
import AssetMenu from "./AssetMenu";
import { Input } from "@/components/ui/input";

export default function useMountAssets(
  {
    team,
    stratPositions,
    activeAdaptation,
  }: {
    team: FullTeam;
    stratPositions: StratPositions[];
    activeAdaptation: Adaptation | null;
  },
  {
    deleteAssets,
    updateAssets,
    setAssetsHiddenInAdaptation,
  }: {
    deleteAssets: (assets: PlacedAsset[]) => void;
    updateAssets: (assets: PlacedAsset[]) => void;
    setAssetsHiddenInAdaptation: (assetIDs: Id<"placedAssets">[], hidden: boolean) => void;
  },
) {
  const { user } = useUser();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerAssets, setColorPickerAssets] = useState<PlacedAsset[] | null>(null);
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [textEditorAsset, setTextEditorAsset] = useState<PlacedAsset | null>(null);
  const [textEditorValue, setTextEditorValue] = useState("");
  const [imageUrlEditorOpen, setImageUrlEditorOpen] = useState(false);
  const [imageUrlEditorAsset, setImageUrlEditorAsset] = useState<PlacedAsset | null>(null);
  const [imageUrlEditorValue, setImageUrlEditorValue] = useState("");

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
            <Button variant="ghost" onClick={() => setTextEditorOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (textEditorAsset) {
                  updateAssets([
                    {
                      ...textEditorAsset,
                      text: textEditorValue,
                    } as PlacedAsset,
                  ]);
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

  const imageUrlEditorDialog = useMemo(
    () => (
      <Dialog open={imageUrlEditorOpen} onOpenChange={setImageUrlEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Image URL</DialogTitle>
          </DialogHeader>
          <span className="text-sm text-muted-foreground mb-1 block">
            The link must be publicly accessible and directly point to an image file (e.g. ending in
            .png or .jpg). <br />
            If the image fails to load, check the URL.
          </span>
          <Input
            type="url"
            value={imageUrlEditorValue}
            onChange={(e) => setImageUrlEditorValue(e.target.value)}
            placeholder="https://example.com/image.png"
            onKeyDown={(e) => {
              if (e.key === "Enter" && imageUrlEditorAsset) {
                e.preventDefault();
                updateAssets([
                  {
                    ...imageUrlEditorAsset,
                    url: imageUrlEditorValue,
                  } as PlacedAsset,
                ]);
                setImageUrlEditorOpen(false);
              }
            }}
            autoFocus
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setImageUrlEditorOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (imageUrlEditorAsset) {
                  updateAssets([
                    {
                      ...imageUrlEditorAsset,
                      url: imageUrlEditorValue,
                    } as PlacedAsset,
                  ]);
                  setImageUrlEditorOpen(false);
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
    [imageUrlEditorOpen, imageUrlEditorValue, imageUrlEditorAsset, updateAssets],
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
            return <SVGOperator asset={asset} team={team} stratPositions={stratPositions} />;
          case "gadget":
            return (
              <AssetOutline asset={asset} team={team} stratPositions={stratPositions}>
                <GadgetIcon id={asset.gadget} className="h-full w-full" />
              </AssetOutline>
            );
          case "textbox":
            return <Textbox asset={asset} team={team} stratPositions={stratPositions} />;
          case "arrow":
            return (
              <Arrow
                asset={asset}
                team={team}
                stratPositions={stratPositions}
                selected={selectedAssets.some((a) => a._id === asset._id)}
              />
            );
          case "image":
            return <Image asset={asset} team={team} stratPositions={stratPositions} />;
          //@ts-expect-error -- for legacy types, should not occur after migration
          case "reinforcement":
          //@ts-expect-error
          case "rotate":
          case "layout":
            if (asset.variant === "barricade") {
              return (
                <AssetOutline asset={asset} team={team} stratPositions={stratPositions}>
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
              return <Explosion color={getAssetColor(asset, stratPositions, team)} />;
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
      // arrows and operators render as native SVG and cannot be wrapped in an
      // HTML div — wrap them in an SVG <g> instead when dimming is needed.
      const isSvgNative = asset.type === "arrow" || asset.type === "operator";

      // While editing an adaptation, base assets (not owned by the adaptation)
      // are dimmed; those marked hidden for the adaptation are dimmed further.
      const isBaseAsset = !asset.adaptationID;
      const isHiddenInAdaptation =
        !!activeAdaptation && isBaseAsset && activeAdaptation.hiddenAssetIDs.includes(asset._id);
      const dimOpacity = activeAdaptation && isBaseAsset ? (isHiddenInAdaptation ? 0.2 : 0.5) : 1;

      const fullAsset = (() => {
        let element = assetElement;

        const otherSelectors = selectedBy.filter((id) => id !== user?._id);
        if (otherSelectors.length > 0 && !isSvgNative) {
          const shadowColors = otherSelectors
            .map((id) => team.members.find((m) => m._id === id)?.defaultColor!)
            .filter(Boolean);
          element = (
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

        if (dimOpacity !== 1) {
          const dimStyle = {
            opacity: dimOpacity,
            filter: isHiddenInAdaptation ? "grayscale(1)" : undefined,
          };
          element = isSvgNative ? (
            <g style={dimStyle}>{element}</g>
          ) : (
            <div style={dimStyle} className="size-full">
              {element}
            </div>
          );
        }

        return element;
      })();
      return {
        menu:
          user && latestSelected && selectedBy.includes(user._id as Id<"users">) ? (
            <AssetMenu
              deleteAssets={deleteAssets}
              updateAssets={updateAssets}
              selectedAssets={selectedAssets}
              stratPositions={stratPositions}
              team={team}
              activeAdaptation={activeAdaptation}
              setAssetsHiddenInAdaptation={setAssetsHiddenInAdaptation}
              openColorPickerForAssets={(assets) => {
                setColorPickerAssets(assets);
                setColorPickerOpen(true);
              }}
              openTextEditorForAsset={(asset) => {
                setTextEditorAsset(asset);
                setTextEditorValue(asset.type === "textbox" ? asset.text : "");
                setTextEditorOpen(true);
              }}
              openImageUrlEditorForAsset={(asset) => {
                setImageUrlEditorAsset(asset);
                setImageUrlEditorValue(asset.type === "image" ? asset.url : "");
                setImageUrlEditorOpen(true);
              }}
            />
          ) : undefined,
        asset: fullAsset,
      };
    },
    [
      team,
      stratPositions,
      activeAdaptation,
      deleteAssets,
      updateAssets,
      setAssetsHiddenInAdaptation,
    ],
  );

  const onAssetDoubleClick = useCallback((asset: PlacedAsset) => {
    if (asset.type === "textbox") {
      setTextEditorAsset(asset);
      setTextEditorValue(asset.text);
      setTextEditorOpen(true);
    } else if (asset.type === "image") {
      setImageUrlEditorAsset(asset);
      setImageUrlEditorValue(asset.url);
      setImageUrlEditorOpen(true);
    }
  }, []);

  return {
    renderAsset,
    onAssetDoubleClick,
    UI: (
      <>
        {colorPickerDialog}
        {textEditorDialog}
        {imageUrlEditorDialog}
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
  const pickedOP = stratPositions.find((op) => op._id === asset.stratPositionID);
  if (!pickedOP) return undefined;
  const postion = team.teamPositions.find((pos) => pos._id === pickedOP.teamPositionID);
  if (!postion) return undefined;
  const teamMember = team.members.find((member) => member._id === postion.playerID);
  return teamMember?.defaultColor ?? undefined;
}
