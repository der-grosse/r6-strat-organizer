"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MAPS from "@/lib/static/maps";
import StratEditorLayout from "./Layout";
import StratEditorCanvas, { ASSET_BASE_SIZE, CANVAS_BASE_SIZE } from "./canvas/Canvas";
import useMountAssets from "./canvas/useMountedAssets";
import { useKeys } from "../hooks/useKey";
import { deepCopy, deepEqual } from "../Objects";
import { toast } from "sonner";
import { useUser } from "../context/UserContext";
import StratDisplay from "../StratDisplay/StratDisplay";
import { FullTeam, TeamMember } from "@/lib/types/team.types";
import { Strat } from "@/lib/types/strat.types";
import {
  ArrowAsset,
  GadgetAsset,
  ImageAsset,
  LayoutAsset,
  OperatorAsset,
  PlacedAsset,
  TextboxAsset,
} from "@/lib/types/asset.types";
import { Id } from "@/convex/_generated/dataModel";
import { ReactMutation, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useDebounced from "../hooks/useDebounced";
import useOnUnmount from "../hooks/useOnUnmount";
import isKeyDown from "../hooks/isKeyDown";
import { SidebarTab } from "./sidebar/Sidebar";
import { X } from "lucide-react";

interface StratEditorProps {
  strat: Strat;
  team: FullTeam;
}

type Selection = Id<"placedAssets">;

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
  selection: Selection[];
  userID: TeamMember["_id"];
}
export interface AssetDeselection {
  type: "selection-deselected";
  selection: Selection[];
  userID: TeamMember["_id"];
}

const HISTORY_SIZE = 100;

export function StratEditor({ strat: propStrat, team }: Readonly<StratEditorProps>) {
  const addAssetFct = useMutation(api.strats.addAsset);
  const updateAssetsFct = useMutation(api.strats.updateAssets);
  const deleteAssets = useMutation(api.strats.deleteAssets);
  const setSelectedAssets = useMutation(api.strats.setSelectedAssets);
  const updateAdaptationFct = useMutation(api.strats.updateAdaptation);

  const [strat, setStrat] = useState<Strat>(propStrat);
  // Update local state when prop changes
  useEffect(() => {
    setStrat(propStrat);
  }, [propStrat]);

  const { user } = useUser();

  const [activeStratPosition, setActiveStratPosition] = useState<Id<"stratPositions"> | null>(null);

  // Sidebar tab + open state are lifted here so the adaptation banner can
  // navigate to the Adaptations tab.
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("meta");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // The adaptation currently being edited on the canvas (null = editing the
  // base strat).
  const [activeAdaptationID, setActiveAdaptationID] = useState<Id<"adaptations"> | null>(null);
  const activeAdaptation = useMemo(
    () => strat.adaptations.find((a) => a._id === activeAdaptationID) ?? null,
    [strat.adaptations, activeAdaptationID],
  );
  // Reset the active adaptation if it disappears (e.g. deleted).
  useEffect(() => {
    if (activeAdaptationID && !strat.adaptations.some((a) => a._id === activeAdaptationID)) {
      setActiveAdaptationID(null);
    }
  }, [strat.adaptations, activeAdaptationID]);

  const addAsset = useCallback(
    async (asset: Omit<PlacedAsset, "_id">) => {
      const result = await addAssetFct({
        ...convertPlacedAssetToAPI(asset),
        stratID: strat._id,
      });
      return result;
    },
    [addAssetFct, strat._id],
  );

  const updateAssets = useCallback(
    async (assets: PlacedAsset[]) => {
      await updateAssetsFct({
        assets: assets.map((asset) => convertPlacedAssetToAPI(asset)),
      });
    },
    [updateAssetsFct],
  );

  const queryAssets = useQuery(api.strats.getAssets, { stratID: strat._id });
  const [assets, setAssets] = useState<PlacedAsset[]>([]);
  useEffect(() => {
    if (queryAssets) {
      setAssets(queryAssets);
    }
  }, [queryAssets]);

  // Assets rendered on the canvas: base assets always, plus the active
  // adaptation's own assets when editing one. Other adaptations' assets stay
  // hidden.
  const visibleAssets = useMemo(
    () =>
      assets.filter((asset) => !asset.adaptationID || asset.adaptationID === activeAdaptationID),
    [assets, activeAdaptationID],
  );

  // Assets considered "active" for sidebar counts: the active adaptation's own
  // assets plus the base assets it does not hide (or just base assets when no
  // adaptation is being edited). Unlike visibleAssets, this excludes base assets
  // hidden by the active adaptation so gadget budgets reflect what is really on
  // the canvas for the adaptation.
  const activeAssets = useMemo(() => {
    if (!activeAdaptation) return assets.filter((asset) => !asset.adaptationID);
    const hidden = new Set(activeAdaptation.hiddenAssetIDs);
    return assets.filter(
      (asset) =>
        asset.adaptationID === activeAdaptation._id ||
        (!asset.adaptationID && !hidden.has(asset._id)),
    );
  }, [assets, activeAdaptation]);

  // Toggle whether the given base assets are hidden for the active adaptation.
  const setAssetsHiddenInAdaptation = useCallback(
    (assetIDs: Id<"placedAssets">[], hidden: boolean) => {
      if (!activeAdaptation) return;
      const next = new Set(activeAdaptation.hiddenAssetIDs);
      for (const id of assetIDs) {
        if (hidden) next.add(id);
        else next.delete(id);
      }
      const hiddenAssetIDs = [...next];
      // optimistic update so the canvas reflects the change immediately
      setStrat((s) => ({
        ...s,
        adaptations: s.adaptations.map((a) =>
          a._id === activeAdaptation._id ? { ...a, hiddenAssetIDs } : a,
        ),
      }));
      updateAdaptationFct({ adaptationID: activeAdaptation._id, hiddenAssetIDs }).catch((err) =>
        toast.error(`Your changes could not be saved! Failed to update adaptation: ${err.message}`),
      );
    },
    [activeAdaptation, updateAdaptationFct],
  );

  const selectedAssetsOfOtherUsers = useQuery(api.strats.getSelectedAssets, {
    stratID: strat._id,
  });
  const [selected, setSelected] = useState<Selection[]>([]);
  const allSelectedAssets = useMemo(
    () =>
      selected
        .map((s) => ({
          assetID: s,
          userID: user?._id as Id<"users">,
        }))
        .concat(
          selectedAssetsOfOtherUsers?.flatMap((s) =>
            s.placedAssetIDs.map((id) => ({
              assetID: id,
              userID: s.userID,
            })),
          ) ?? [],
        ),
    [selected, selectedAssetsOfOtherUsers, user],
  );
  useDebounced(selected, {
    onChange(selected) {
      setSelectedAssets({
        placedAssetIDs: selected.filter((s) => s !== "UNSET"),
        stratID: strat._id,
      });
    },
  });
  useOnUnmount(() => setSelectedAssets({ placedAssetIDs: [], stratID: strat._id }));

  const history = useRef<HistoryEvent[]>([]);
  const historyIndex = useRef(-1);
  const pushEvent = useCallback((event: HistoryEvent) => {
    if (JSON.stringify(history.current[historyIndex.current]) === JSON.stringify(event)) return;
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

  const shiftPressed = isKeyDown("Shift");

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
      shortcut: [
        {
          key: "y",
          ctrlKey: true,
        },
        {
          key: "z",
          ctrlKey: true,
          shiftKey: true,
        },
      ],
      action: redo,
    },
  ]);

  const { renderAsset, onAssetDoubleClick, UI } = useMountAssets(
    { team, stratPositions: strat.stratPositions, activeAdaptation },
    {
      setAssetsHiddenInAdaptation,
      deleteAssets(delAssets) {
        setAssets((assets) =>
          assets.filter((a) => !delAssets.some((asset) => asset._id === a._id)),
        );
        deleteAssets({
          placedAssetIDs: delAssets.map((asset) => asset._id),
        }).catch((err) =>
          toast.error(`Your changes could not be saved! Failed to delete asset: ${err.message}`),
        );
        pushEvent({
          type: "asset-deleted",
          assets,
        });
      },
      updateAssets(updatedAssets) {
        setAssets((assets) => {
          pushEvent({
            type: "asset-updated",
            old_assets: assets.filter((a) => updatedAssets.some((asset) => asset._id === a._id)),
            new_assets: updatedAssets,
          });
          return assets.map((a) => updatedAssets.find((asset) => asset._id === a._id) ?? a);
        });
        updateAssets(updatedAssets).catch((err) =>
          toast.error(`Your changes could not be saved! Failed to update assets: ${err.message}`),
        );
      },
    },
  );

  const map = useMemo(() => MAPS.find((map) => map.name === strat.map) ?? null, [strat.map]);

  return (
    <StratEditorLayout
      activeStratPosition={activeStratPosition}
      onActiveStratPositionChange={setActiveStratPosition}
      hideAssets={!!strat.drawingID}
      onAssetAdd={(asset) => {
        const placedAsset = {
          _id: "UNSET" as Id<"placedAssets">,
          size: { width: ASSET_BASE_SIZE, height: ASSET_BASE_SIZE },
          position: { x: CANVAS_BASE_SIZE / 20, y: CANVAS_BASE_SIZE / 20 },
          rotation: 0,
          stratPositionID: activeStratPosition ?? undefined,
          adaptationID: activeAdaptationID ?? undefined,
          ...asset,
        } as PlacedAsset;
        setAssets((assets) => [...assets, placedAsset]);
        setSelected((s) => (shiftPressed ? [...s, placedAsset._id] : [placedAsset._id]));
        addAsset(placedAsset)
          .then((result) => {
            if (result?.success && result.placedAssetID) {
              setSelected((s) => [...s, result.placedAssetID].filter((id) => id !== "UNSET"));
            }
          })
          .catch((err) =>
            toast.error(`Your changes could not be saved! Failed to add asset: ${err.message}`),
          );
        pushEvent({
          type: "asset-added",
          asset: placedAsset,
        });
      }}
      assets={activeAssets}
      allAssets={assets}
      strat={strat}
      team={team}
      activeAdaptationID={activeAdaptationID}
      onActiveAdaptationChange={setActiveAdaptationID}
      openTab={sidebarTab}
      setOpenTab={setSidebarTab}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      {activeAdaptation && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-full border border-primary bg-background/95 py-1 pl-4 pr-1 shadow-lg backdrop-blur">
          <button
            type="button"
            className="text-sm cursor-pointer"
            title="Show this adaptation in the sidebar"
            onClick={() => {
              setSidebarTab("adaptations");
              setSidebarOpen(true);
            }}
          >
            Editing adaptation: <span className="font-semibold">{activeAdaptation.name}</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            aria-label="Exit adaptation editing"
            onClick={() => setActiveAdaptationID(null)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {strat.drawingID ? (
        <StratDisplay editView hideDetails strat={strat} team={team} />
      ) : (
        <StratEditorCanvas
          selectedAssets={allSelectedAssets}
          onDeselect={(deselected) => {
            setSelected((selected) => selected.filter((s) => !deselected.includes(s)));
            if (user?._id) {
              pushEvent({
                type: "selection-deselected",
                selection: deselected,
                userID: user._id as Id<"users">,
              });
            }
          }}
          onSelect={(newSelected) => {
            setSelected((selected) => selected.concat(newSelected));
            if (user?._id)
              pushEvent({
                type: "selection-selected",
                selection: newSelected,
                userID: user._id as Id<"users">,
              });
          }}
          map={map}
          assets={visibleAssets}
          onAssetAdd={(asset) => {
            const placedAsset = {
              _id: "UNSET" as Id<"placedAssets">,
              size: { width: ASSET_BASE_SIZE, height: ASSET_BASE_SIZE },
              position: { x: CANVAS_BASE_SIZE / 20, y: CANVAS_BASE_SIZE / 20 },
              rotation: 0,
              stratPositionID: activeStratPosition ?? undefined,
              adaptationID: activeAdaptationID ?? undefined,
              ...asset,
            } as PlacedAsset;
            setAssets((assets) => [...assets, placedAsset]);
            setSelected((s) => (shiftPressed ? [...s, placedAsset._id] : [placedAsset._id]));
            addAsset(placedAsset)
              .then((result) => {
                if (result?.success && result.placedAssetID) {
                  setSelected((s) => [...s, result.placedAssetID].filter((id) => id !== "UNSET"));
                }
              })
              .catch((err) =>
                toast.error(`Your changes could not be saved! Failed to add asset: ${err.message}`),
              );
            pushEvent({
              type: "asset-added",
              asset: placedAsset,
            });
          }}
          onAssetsAdd={(assetsToAdd) => {
            if (assetsToAdd.length === 0) return;
            // optimistically render the copies with temporary ids, then swap in
            // the real ids returned by the server
            const tempAssets = assetsToAdd.map((asset, i) => ({
              ...asset,
              _id: `UNSET-${Date.now()}-${i}` as Id<"placedAssets">,
            })) as PlacedAsset[];
            setAssets((assets) => [...assets, ...tempAssets]);
            setSelected(tempAssets.map((a) => a._id));

            Promise.all(assetsToAdd.map((asset) => addAsset(asset as Omit<PlacedAsset, "_id">)))
              .then((results) => {
                const created: PlacedAsset[] = [];
                results.forEach((result, i) => {
                  if (result?.success && result.placedAssetID) {
                    created.push({ ...tempAssets[i], _id: result.placedAssetID });
                  }
                });
                // replace the temporary selection with the real asset ids
                setSelected((s) => [
                  ...s.filter((id) => !tempAssets.some((t) => t._id === id)),
                  ...created.map((c) => c._id),
                ]);
                for (const asset of created) {
                  pushEvent({ type: "asset-added", asset });
                }
              })
              .catch((err) =>
                toast.error(
                  `Your changes could not be saved! Failed to add assets: ${err.message}`,
                ),
              );
          }}
          onAssetChange={(assets) => {
            setAssets((existing) => {
              pushEvent({
                type: "asset-updated",
                old_assets: existing.filter((a) => assets.some((asset) => asset._id === a._id)),
                new_assets: assets,
              });
              return existing.map((a) => {
                const newAsset = assets.find((asset) => asset._id === a._id);
                if (!newAsset) return a;
                if (!deepEqual(a.position, newAsset?.position)) {
                  // if position changed, reset placedOn property for layout assets
                  if (newAsset.type === "layout") {
                    newAsset.placedOn = undefined;
                  }
                }
                return deepCopy(newAsset);
              });
            });
            updateAssets(assets).catch((err) =>
              toast.error(
                `Your changes could not be saved! Failed to update asset: ${err.message}`,
              ),
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
                `Your changes could not be saved! Failed to delete asset: ${err.message}`,
              ),
            );
          }}
          renderAsset={renderAsset}
          onAssetDoubleClick={onAssetDoubleClick}
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
  },
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
  },
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
  },
) {
  switch (event.type) {
    case "asset-added":
      requestAnimationFrame(() => {
        fcts
          .deleteAssets({ placedAssetIDs: [event.asset._id] })
          .catch((err) =>
            toast.error(`Your changes could not be saved! Failed to delete asset: ${err.message}`),
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
            toast.error(`Your changes could not be saved! Failed to update assets: ${err.message}`),
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
              toast.error(`Your changes could not be saved! Failed to add asset: ${err.message}`),
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
  },
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
      return state.filter((a) => !event.assets.some((asset) => asset._id === a._id));
    default:
      throw new Error(`Unknown event type: ${(event as any)?.type}`);
  }
}

function undoSelectionEvent(state: Selection[], event: SelectionEvent): Selection[] {
  switch (event.type) {
    case "selection-selected":
      return state.filter((s) => !event.selection.includes(s));
    case "selection-deselected":
      return state.concat(event.selection);
  }
}

function redoSelectionEvent(state: Selection[], event: SelectionEvent): Selection[] {
  switch (event.type) {
    case "selection-selected":
      return state.concat(event.selection);
    case "selection-deselected":
      return state.filter((s) => !event.selection.includes(s));
  }
}

function convertPlacedAssetToAPI<T extends PlacedAsset | Omit<PlacedAsset, "_id">>(
  asset: T,
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
    _id: ("_id" in asset && asset._id !== "UNSET" ? asset._id : undefined) as T extends PlacedAsset
      ? Id<"placedAssets">
      : undefined,
    height: asset.size.height,
    width: asset.size.width,
    posX: asset.position.x,
    posY: asset.position.y,
    rotation: asset.rotation,
    stratPositionID: asset.stratPositionID ?? null,
    adaptationID: asset.adaptationID ?? null,

    type: asset.type,
    operator:
      asset.type === "operator" ? (asset as Omit<OperatorAsset, "_id">).operator : undefined,
    iconType:
      asset.type === "operator" ? (asset as Omit<OperatorAsset, "_id">).iconType : undefined,
    gadget: asset.type === "gadget" ? (asset as Omit<GadgetAsset, "_id">).gadget : undefined,
    variant: asset.type === "layout" ? (asset as Omit<LayoutAsset, "_id">).variant : undefined,
    placedOn:
      asset.type === "layout" ? ((asset as Omit<LayoutAsset, "_id">).placedOn ?? null) : undefined,
    text: asset.type === "textbox" ? (asset as Omit<TextboxAsset, "_id">).text : undefined,
    fontSize: asset.type === "textbox" ? (asset as Omit<TextboxAsset, "_id">).fontSize : undefined,
    background:
      asset.type === "textbox" ? (asset as Omit<TextboxAsset, "_id">).background : undefined,
    startCorner:
      asset.type === "arrow" ? (asset as Omit<ArrowAsset, "_id">).startCorner : undefined,
    startArrowHead:
      asset.type === "arrow" ? (asset as Omit<ArrowAsset, "_id">).startArrowHead : undefined,
    endArrowHead:
      asset.type === "arrow" ? (asset as Omit<ArrowAsset, "_id">).endArrowHead : undefined,
    url: asset.type === "image" ? (asset as Omit<ImageAsset, "_id">).url : undefined,
  };
}
