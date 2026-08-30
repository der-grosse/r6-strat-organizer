"use client";

import { getGoogleDrawingsEditURL, getGoogleDrawingsPreviewURL } from "@/lib/googleDrawings";
import { Ban, Crosshair, Pencil, Slash } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useUser } from "../context/UserContext";
import StratViewer from "../StratEditor/StratViewer";
import OperatorIcon from "../general/OperatorIcon";
import { Fragment, useState } from "react";
import Shotgun from "../StratEditor/assets/Shotgun";
import GadgetIcon from "../general/GadgetIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { FullTeam } from "@/lib/types/team.types";
import { Strat } from "@/lib/types/strat.types";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import StratGadgetVisibiltyPicker from "./StratGadgetVisibiltyPicker";
import AdaptationSelector from "./AdaptationSelector";
import { resolveAutoAdaptation, resolveSelectedAdaptation } from "@/lib/adaptations";
import { getStratLineup } from "@/lib/strats";

export interface StratDisplayProps {
  strat: Strat | null | undefined;
  team: FullTeam;
  editView?: boolean;
  hideDetails?: boolean;
  /** Raw adaptation selection (null/"auto" → auto, "none" → base, or an id). */
  adaptationSelection?: string | null;
  /** When omitted the adaptation selector is read-only. */
  onAdaptationSelectionChange?: (selection: string | null) => void;
}

export default function StratDisplay(props: StratDisplayProps) {
  const settings = useQuery(api.settings.get);
  const bannedOps = useQuery(api.bannedOps.get) ?? [];
  const user = useUser();
  const teamMember = props.team.members.find((member) => member._id === user?.user?._id);
  const stratPosition = props.strat?.stratPositions.find(
    (op) => op.teamPositionID === teamMember?.teamPositionID,
  );

  const availableOperators = (() => {
    const ops = stratPosition?.pickedOperators.filter((op) => !bannedOps.includes(op.operator));
    if (!ops?.length) return stratPosition?.pickedOperators ?? [];
    return ops;
  })();

  const teamLineUp = (
    props.strat
      ? getStratLineup(props.strat, bannedOps, {
          teamPositions: props.team.teamPositions,
          sort: "team-positions",
        })
      : []
  )
    .filter((entry) => entry.teamPositionID !== teamMember?.teamPositionID)
    .map((entry) => {
      const player = props.team.members.find(
        (member) => member.teamPositionID === entry.teamPositionID,
      );
      return {
        ...entry,
        color: player?.defaultColor ?? undefined,
        playerName: player?.name,
      };
    });

  const [viewModifier, setViewModifier] = useState<"none" | "hideForeign" | "grayscaleForeign">(
    "none",
  );

  const adaptationSelection = props.adaptationSelection ?? null;
  const autoResolvedAdaptation = props.strat ? resolveAutoAdaptation(props.strat, bannedOps) : null;
  const resolvedAdaptation = props.strat
    ? resolveSelectedAdaptation(props.strat, adaptationSelection, bannedOps)
    : null;

  const Details = !props.hideDetails && props.strat && (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto_1fr] w-full gap-4",
        settings?.activeStratLayout === "top" ? "items-start" : "items-end ",
      )}
    >
      <div className={cn(settings?.activeStratLayout === "top" && "pl-6 -mt-1")}>
        {!props.strat.drawingID && <StratGadgetVisibiltyPicker onChange={setViewModifier} />}
      </div>
      <div
        className={cn(
          "flex flex-col gap-1 px-2 rounded bg-background",
          // settings?.activeStratLayout === "top" && "flex-col-reverse",
        )}
      >
        {availableOperators.length > 0 && (
          <div className="flex gap-2 justify-center items-center">
            {availableOperators.slice(0, 3).map((op, i) => (
              <Fragment key={i}>
                <div className={cn("relative", i !== 0 && "opacity-50")}>
                  <OperatorIcon op={op.operator} className="scale-150" />
                  {op.secondaryGadget && (
                    <GadgetIcon
                      id={op.secondaryGadget}
                      className="absolute size-6 -right-2 -bottom-3"
                    />
                  )}
                  {op.tertiaryGadget && (
                    <GadgetIcon
                      id={op.tertiaryGadget}
                      className="absolute size-6 -left-2 -bottom-3"
                    />
                  )}
                </div>
                {i === 0 ? (
                  <p className="text-2xl font-bold text-center mr-1">{op.operator}</p>
                ) : i !== Math.min(availableOperators.length, 2) ? (
                  <div className="w-1" />
                ) : null}
              </Fragment>
            ))}
            {stratPosition?.shouldBringShotgun && (
              <Tooltip>
                <TooltipTrigger>
                  <Shotgun className="size-8 ml-1" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-center">
                    You make rotates or other site setup, where you need soft destruction, bring a
                    shotgun.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            {stratPosition?.fightsLongRange && (
              <Tooltip>
                <TooltipTrigger>
                  <Crosshair className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-center">
                    This position takes for long-range fights, pick an appropriate primary weapon
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
        <div className="flex justify-center items-center gap-1 text-sm">
          <span className="ml-2">
            {[
              settings?.activeStratNameTemplate?.mapName && props.strat.map,
              settings?.activeStratNameTemplate?.siteName !== false && props.strat.site,
              settings?.activeStratNameTemplate?.stratName !== false && props.strat.name,
            ]
              .filter(Boolean)
              .join(" | ")}
          </span>
          {!props.strat.drawingID && props.strat.adaptations.length > 0 && (
            <AdaptationSelector
              adaptations={props.strat.adaptations}
              selection={adaptationSelection}
              autoResolved={autoResolvedAdaptation}
              onChange={props.onAdaptationSelectionChange}
            />
          )}
          <Link
            href={`/editor/${props.strat._id}`}
            className="text-muted-foreground hover:text-primary"
          >
            <Button variant="ghost" size="icon" className="cursor-pointer -my-2 -mx-1">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex justify-end items-end gap-2.5 py-1">
        {teamLineUp.map(({ operator, isBanned, color, playerName, positionName }, index) => (
          <Tooltip key={index}>
            <TooltipTrigger>
              <div className="relative rounded-sm scale-90" style={{ backgroundColor: color }}>
                <OperatorIcon
                  op={operator.operator}
                  className={cn("scale-125", isBanned && "opacity-50")}
                />
                {isBanned && (
                  <Slash className="absolute inset-0 size-8 text-destructive opacity-70" />
                )}
                {operator.secondaryGadget && (
                  <GadgetIcon
                    id={operator.secondaryGadget}
                    className="absolute size-6 -right-2 -bottom-2"
                  />
                )}
                {operator.tertiaryGadget && (
                  <GadgetIcon
                    id={operator.tertiaryGadget}
                    className="absolute size-6 -left-2 -bottom-2"
                  />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-center">
                {playerName ? playerName : "Unassigned"} | {positionName}
                {isBanned && " | all operators banned"}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "relative h-full w-full flex justify-center flex-col z-0",
        props.strat && settings?.activeStratLayout === "top" && "flex-col-reverse",
      )}
    >
      {props.strat?.drawingID ? (
        <>
          <iframe
            className="w-full flex-1"
            src={
              props.editView
                ? getGoogleDrawingsEditURL(props.strat.drawingID)
                : getGoogleDrawingsPreviewURL(props.strat.drawingID)
            }
          />
          {Details}
        </>
      ) : props.strat ? (
        <div className="absolute inset-0 flex flex-col justify-center">
          <div className="flex-1 overflow-hidden py-0 block">
            <div className="relative h-full w-full flex items-center justify-center">
              <StratViewer
                strat={props.strat}
                team={props.team}
                adaptation={resolvedAdaptation}
                assetModifier={
                  viewModifier === "hideForeign"
                    ? (assets) =>
                        assets.filter((asset) => asset.stratPositionID === stratPosition?._id)
                    : viewModifier === "grayscaleForeign"
                      ? (assets) =>
                          assets.map((asset) => ({
                            ...asset,
                            ...(asset.stratPositionID !== stratPosition?._id && {
                              stratPositionID: undefined,
                              customColor: undefined,
                            }),
                          }))
                      : undefined
                }
              />
            </div>
          </div>
          {Details}
        </div>
      ) : props.strat === null ? (
        <div className="flex flex-col items-center gap-4">
          <Ban className="text-muted-foreground" height={64} width={64} />
          <p className="text-muted-foreground">No strat selected</p>
        </div>
      ) : null}
    </div>
  );
}
