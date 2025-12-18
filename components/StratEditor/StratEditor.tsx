"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MAPS from "@/lib/static/maps";
import StratEditorLayout from "./Layout";
import StratEditorCanvas, { ASSET_BASE_SIZE, CANVAS_BASE_SIZE } from "./Canvas";
import useMountAssets from "./Assets";
import { useKeys } from "../hooks/useKey";
import { deepCopy, deepEqual } from "../Objects";
import { toast } from "sonner";
import { useUser } from "../context/UserContext";
import StratDisplay from "../StratDisplay/StratDisplay";
import { FullTeam, TeamMember } from "@/lib/types/team.types";
import { Strat } from "@/lib/types/strat.types";
import {
  GadgetAsset,
  LayoutAsset,
  OperatorAsset,
  PlacedAsset,
} from "@/lib/types/asset.types";
import { Id } from "@/convex/_generated/dataModel";
import { ReactMutation, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface StratEditorProps {
  strat: Strat;
  team: FullTeam;
}

export interface Selection {
  _id: string;
  userID: TeamMember["_id"];
}

export type HistoryEvent = AssetEvent | SelectionEvent;

export type AssetEvent = AssetAdded | AssetUpdated | AssetDeleted;

export type SelectionEvent = AssetSelection | AssetDeselection;
export interface AssetAdded {
  type: "asset-added";
  asset: PlacedAsset;
}
export interface AssetUpdated {
  type: "asset-updated";
  old_assets: PlacedAsset[];
  new_assets: PlacedAsset[];
}
export interface AssetDeleted {
  type: "asset-deleted";
  assets: PlacedAsset[];
}
export interface AssetSelection {
  type: "selection-selected";
  selection: string[];
  userID: TeamMember["_id"];
}
export interface AssetDeselection {
  type: "selection-deselected";
  selection: string[];
  userID: TeamMember["_id"];
}

const HISTORY_SIZE = 100;

export function StratEditor({
  strat: propStrat,
  team,
}: Readonly<StratEditorProps>) {
  const addAssetFct = useMutation(api.strats.addAsset);
  const updateAssetsFct = useMutation(api.strats.updateAssets);
  const deleteAssets = useMutation(api.strats.deleteAssets);

  const [strat, setStrat] = useState<Strat>(propStrat);
  // Update local state when prop changes
  useEffect(() => {
    setStrat(propStrat);
  }, [propStrat]);

  const { user } = useUser();

  const addAsset = useCallback(
    async (asset: Omit<PlacedAsset, "_id">) => {
      await addAssetFct({
        ...convertPlacedAssetToAPI(asset),
        stratID: strat._id,
      });
    },
    [addAssetFct, strat._id]
  );

  const updateAssets = useCallback(
    async (assets: PlacedAsset[]) => {
      await updateAssetsFct({
        assets: assets.map((asset) => convertPlacedAssetToAPI(asset)),
      });
    },
    [updateAssetsFct]
  );

  const queryAssets = useQuery(api.strats.getAssets, { stratID: strat._id });
  const [assets, setAssets] = useState<PlacedAsset[]>([]);
  useEffect(() => {
    if (queryAssets) {
      setAssets(queryAssets);
    }
  }, [queryAssets]);

  const [selected, setSelected] = useState<Selection[]>([]);

  const history = useRef<HistoryEvent[]>([]);
  const historyIndex = useRef(-1);
  const pushEvent = useCallback((event: HistoryEvent, fromRemote = false) => {
    if (
      JSON.stringify(history.current[historyIndex.current]) ===
      JSON.stringify(event)
    )
      return;
    if (
      event.type === "asset-updated" &&
      JSON.stringify(event.old_assets) === JSON.stringify(event.new_assets)
    )
      return;

    history.current = history.current.slice(0, historyIndex.current + 1);
    historyIndex.current += 1;
    history.current.push(deepCopy(event));
    if (history.current.length > HISTORY_SIZE) {
      history.current.shift();
      historyIndex.current -= 1;
    }
  }, []);

  // function collection passed to undo/redo to have access to mutations
  const fcts = {
    updateAssets: setAssets,
    updateSelection: setSelected,
    addStratAsset: addAssetFct,
    deleteAssets,
    updateStratAssets: updateAssetsFct,
  };

  const redo = useCallback(() => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current += 1;
      const event = history.current[historyIndex.current];
      redoEvent(strat._id, event, fcts);
    }
  }, [setAssets, setSelected, strat._id]);
  const undo = useCallback(() => {
    if (historyIndex.current >= 0) {
      const event = history.current[historyIndex.current];
      historyIndex.current -= 1;
      undoEvent(strat._id, event, fcts);
    }
  }, [setAssets, strat._id]);
  useKeys([
    {
      shortcut: {
        key: "z",
        ctrlKey: true,
        shiftKey: false,
      },
      action: undo,
    },
    {
      shortcut: {
        key: "y",
        ctrlKey: true,
      },
      action: redo,
    },
  ]);

  const { renderAsset, UI } = useMountAssets(
    { team, stratPositions: strat.stratPositions },
    {
      deleteAsset(asset) {
        setAssets((assets) => assets.filter((a) => a._id !== asset._id));
        deleteAssets({ placedAssetIDs: [asset._id] }).catch((err) =>
          toast.error(
            `Your changes could not be saved! Failed to delete asset: ${err.message}`
          )
        );
        pushEvent({
          type: "asset-deleted",
          assets: [asset],
        });
      },
      updateAsset(asset) {
        setAssets((assets) => {
          pushEvent({
            type: "asset-updated",
            old_assets: assets.filter((a) => a._id === asset._id),
            new_assets: [asset],
          });
          return assets.map((a) => (a._id === asset._id ? asset : a));
        });
        updateAssets([asset]).catch((err) =>
          toast.error(
            `Your changes could not be saved! Failed to update assets: ${err.message}`
          )
        );
      },
    }
  );

  const map = useMemo(
    () => MAPS.find((map) => map.name === strat.map) ?? null,
    [strat.map]
  );

  return (
    <StratEditorLayout
      hideAssets={!!strat.drawingID}
      onAssetAdd={(asset) => {
        const placedAsset = {
          _id: "UNSET" as Id<"placedAssets">,
          size: { width: ASSET_BASE_SIZE, height: ASSET_BASE_SIZE },
          position: { x: CANVAS_BASE_SIZE / 20, y: CANVAS_BASE_SIZE / 20 },
          rotation: 0,
          ...asset,
        } as PlacedAsset;
        setAssets((assets) => [...assets, placedAsset]);
        addAsset(placedAsset).catch((err) =>
          toast.error(
            `Your changes could not be saved! Failed to add asset: ${err.message}`
          )
        );
        pushEvent({
          type: "asset-added",
          asset: placedAsset,
        });
      }}
      assets={assets}
      strat={strat}
      team={team}
    >
      {strat.drawingID ? (
        <StratDisplay editView hideDetails strat={strat} team={team} />
      ) : (
        <StratEditorCanvas
          selectedAssets={selected}
          onDeselect={(deselected) => {
            setSelected((selected) =>
              selected.filter((s) => !deselected.includes(s._id))
            );
            if (user?._id) {
              pushEvent({
                type: "selection-deselected",
                selection: deselected,
                userID: user._id as Id<"users">,
              });
            }
          }}
          onSelect={(newSelected) => {
            setSelected((selected) =>
              selected.concat(
                newSelected.map((_id) => ({
                  _id,
                  userID: user?._id as Id<"users">,
                }))
              )
            );
            if (user?._id)
              pushEvent({
                type: "selection-selected",
                selection: newSelected,
                userID: user._id as Id<"users">,
              });
          }}
          map={map}
          assets={assets}
          onAssetAdd={(asset) => {
            const placedAsset = {
              _id: "UNSET" as Id<"placedAssets">,
              size: { width: ASSET_BASE_SIZE, height: ASSET_BASE_SIZE },
              position: { x: CANVAS_BASE_SIZE / 20, y: CANVAS_BASE_SIZE / 20 },
              rotation: 0,
              ...asset,
            } as PlacedAsset;
            setAssets((assets) => [...assets, placedAsset]);
            addAsset(placedAsset).catch((err) =>
              toast.error(
                `Your changes could not be saved! Failed to add asset: ${err.message}`
              )
            );
            pushEvent({
              type: "asset-added",
              asset: placedAsset,
            });
          }}
          onAssetChange={(assets) => {
            setAssets((existing) => {
              pushEvent({
                type: "asset-updated",
                old_assets: existing.filter((a) =>
                  assets.some((asset) => asset._id === a._id)
                ),
                new_assets: assets,
              });
              return existing.map((a) => {
                const newAsset = assets.find((asset) => asset._id === a._id);
                if (!newAsset) return a;
                return deepCopy(newAsset);
              });
            });
            updateAssets(assets).catch((err) =>
              toast.error(
                `Your changes could not be saved! Failed to update asset: ${err.message}`
              )
            );
          }}
          onAssetRemove={(ids) => {
            setAssets((assets) => {
              const newAssets = assets.filter((a) => !ids.includes(a._id));
              pushEvent({
                type: "asset-deleted",
                assets: newAssets,
              });
              return [...newAssets];
            });
            deleteAssets({ placedAssetIDs: ids }).catch((err) =>
              toast.error(
                `Your changes could not be saved! Failed to delete asset: ${err.message}`
              )
            );
          }}
          renderAsset={renderAsset}
          showFloorNames={strat.showFloorNames}
        />
      )}
      {UI}
    </StratEditorLayout>
  );
}

function undoEvent(
  stratID: Strat["_id"],
  event: HistoryEvent,
  fcts: {
    deleteAssets: ReactMutation<typeof api.strats.deleteAssets>;
    addStratAsset: ReactMutation<typeof api.strats.addAsset>;
    updateStratAssets: ReactMutation<typeof api.strats.updateAssets>;
    updateAssets: (updater: (assets: PlacedAsset[]) => PlacedAsset[]) => void;
    updateSelection: (updater: (selection: Selection[]) => Selection[]) => void;
  }
) {
  if ("type" in event && event.type.startsWith("asset-")) {
    fcts.updateAssets((assets) => {
      return undoAssetEvent(stratID, assets, event as AssetEvent, fcts);
    });
  } else if ("type" in event && event.type.startsWith("selection-")) {
    fcts.updateSelection((selection) => {
      return undoSelectionEvent(selection, event as SelectionEvent);
    });
  } else {
    throw new Error(`Unknown event type: ${(event as any)?.type}`);
  }
}

function redoEvent(
  stratID: Strat["_id"],
  event: HistoryEvent,
  fcts: {
    updateAssets: (updater: (assets: PlacedAsset[]) => PlacedAsset[]) => void;
    updateSelection: (updater: (selection: Selection[]) => Selection[]) => void;
    deleteAssets: ReactMutation<typeof api.strats.deleteAssets>;
    addStratAsset: ReactMutation<typeof api.strats.addAsset>;
    updateStratAssets: ReactMutation<typeof api.strats.updateAssets>;
  }
) {
  if ("type" in event && event.type.startsWith("asset-")) {
    fcts.updateAssets((assets) => {
      return redoAssetEvent(stratID, assets, event as AssetEvent, fcts);
    });
  } else if ("type" in event && event.type.startsWith("selection-")) {
    fcts.updateSelection((selection) => {
      return redoSelectionEvent(selection, event as SelectionEvent);
    });
  } else {
    throw new Error(`Unknown event type: ${(event as any)?.type}`);
  }
}

function undoAssetEvent(
  stratID: Strat["_id"],
  state: PlacedAsset[],
  event: AssetEvent,
  fcts: {
    deleteAssets: ReactMutation<typeof api.strats.deleteAssets>;
    addStratAsset: ReactMutation<typeof api.strats.addAsset>;
    updateStratAssets: ReactMutation<typeof api.strats.updateAssets>;
  }
) {
  switch (event.type) {
    case "asset-added":
      requestAnimationFrame(() => {
        fcts
          .deleteAssets({ placedAssetIDs: [event.asset._id] })
          .catch((err) =>
            toast.error(
              `Your changes could not be saved! Failed to delete asset: ${err.message}`
            )
          );
      });
      return state.filter((a) => a._id !== event.asset._id);
    case "asset-updated":
      requestAnimationFrame(() => {
        fcts
          .updateStratAssets({
            assets: event.old_assets.map((a) => convertPlacedAssetToAPI(a)),
          })
          .catch((err) =>
            toast.error(
              `Your changes could not be saved! Failed to update assets: ${err.message}`
            )
          );
      });
      return state.map((a) => {
        const oldAsset = event.old_assets.find((asset) => asset._id === a._id);
        if (!oldAsset) return a;
        return deepCopy(oldAsset);
      });
    case "asset-deleted":
      requestAnimationFrame(() => {
        for (const asset of event.assets) {
          fcts
            .addStratAsset({ ...convertPlacedAssetToAPI(asset), stratID })
            .catch((err) =>
              toast.error(
                `Your changes could not be saved! Failed to add asset: ${err.message}`
              )
            );
        }
      });
      return [...state, ...deepCopy(event.assets)];
    default:
      throw new Error(`Unknown event type: ${(event as any)?.type}`);
  }
}

function redoAssetEvent(
  stratID: Strat["_id"],
  state: PlacedAsset[],
  event: AssetEvent,
  fcts: {
    deleteAssets: ReactMutation<typeof api.strats.deleteAssets>;
    addStratAsset: ReactMutation<typeof api.strats.addAsset>;
    updateStratAssets: ReactMutation<typeof api.strats.updateAssets>;
  }
) {
  switch (event.type) {
    case "asset-added":
      requestAnimationFrame(() => {
        fcts.addStratAsset({
          ...convertPlacedAssetToAPI(event.asset),
          stratID,
        });
      });
      return [...state, deepCopy(event.asset)];
    case "asset-updated":
      requestAnimationFrame(() => {
        fcts.updateStratAssets({
          assets: event.new_assets.map((a) => convertPlacedAssetToAPI(a)),
        });
      });
      return state.map((a) => {
        const newAsset = event.new_assets.find((asset) => asset._id === a._id);
        if (!newAsset) return a;
        return deepCopy(newAsset);
      });
    case "asset-deleted":
      requestAnimationFrame(() => {
        fcts.deleteAssets({ placedAssetIDs: event.assets.map((a) => a._id) });
      });
      return state.filter(
        (a) => !event.assets.some((asset) => asset._id === a._id)
      );
    default:
      throw new Error(`Unknown event type: ${(event as any)?.type}`);
  }
}

function undoSelectionEvent(
  state: Selection[],
  event: SelectionEvent
): Selection[] {
  switch (event.type) {
    case "selection-selected":
      return state.filter((s) => !event.selection.includes(s._id));
    case "selection-deselected":
      return state.concat(
        event.selection.map((_id) => ({
          _id,
          userID: event.userID,
        }))
      );
  }
}

function redoSelectionEvent(
  state: Selection[],
  event: SelectionEvent
): Selection[] {
  switch (event.type) {
    case "selection-selected":
      return state.concat(
        event.selection.map((_id) => ({
          _id,
          userID: event.userID,
        }))
      );
    case "selection-deselected":
      return state.filter((s) => !event.selection.includes(s._id));
  }
}

function convertPlacedAssetToAPI<
  T extends PlacedAsset | Omit<PlacedAsset, "_id">,
>(
  asset: T
): {
  height: number;
  width: number;
  posX: number;
  posY: number;
  rotation: number;
  type: string;
  operator?: string;
  iconType?: string;
  gadget?: string;
  variant?: string;
} & (T extends PlacedAsset ? { _id: Id<"placedAssets"> } : { _id: undefined }) {
  //@ts-expect-error -- I don't know how to make TS happy here
  return {
    _id: ("_id" in asset && asset._id !== "UNSET"
      ? asset._id
      : undefined) as T extends PlacedAsset ? Id<"placedAssets"> : undefined,
    height: asset.size.height,
    width: asset.size.width,
    posX: asset.position.x,
    posY: asset.position.y,
    rotation: asset.rotation,
    stratPositionID: asset.stratPositionID,

    type: asset.type,
    operator:
      asset.type === "operator"
        ? (asset as Omit<OperatorAsset, "_id">).operator
        : undefined,
    iconType:
      asset.type === "operator"
        ? (asset as Omit<OperatorAsset, "_id">).iconType
        : undefined,
    gadget:
      asset.type === "gadget"
        ? (asset as Omit<GadgetAsset, "_id">).gadget
        : undefined,
    variant:
      asset.type === "layout"
        ? (asset as Omit<LayoutAsset, "_id">).variant
        : undefined,
  };
}
