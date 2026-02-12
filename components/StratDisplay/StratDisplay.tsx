"use client";

import {
  getGoogleDrawingsEditURL,
  getGoogleDrawingsPreviewURL,
} from "@/lib/googleDrawings";
import { Ban, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useUser } from "../context/UserContext";
import StratViewer from "../StratEditor/StratViewer";
import OperatorIcon from "../general/OperatorIcon";
import { Fragment, useEffect, useState } from "react";
import Cookie from "js-cookie";
import Shotgun from "../StratEditor/assets/Shotgun";
import GadgetIcon from "../general/GadgetIcon";
import { useFilter } from "../context/FilterContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { FullTeam } from "@/lib/types/team.types";
import { Strat } from "@/lib/types/strat.types";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface StratDisplayProps {
  strat: Strat | null | undefined;
  team: FullTeam;
  editView?: boolean;
  hideDetails?: boolean;
  initialViewModifier?: "none" | "hideForeign" | "grayscaleForeign";
}

export default function StratDisplay(props: StratDisplayProps) {
  const settings = useQuery(api.settings.get);
  const bannedOps = useQuery(api.bannedOps.get) ?? [];
  const user = useUser();
  const teamMember = props.team.members.find(
    (member) => member._id === user?.user?._id,
  );
  const stratPosition = props.strat?.stratPositions.find(
    (op) => op.teamPositionID === teamMember?.teamPositionID,
  );

  const availableOperators = (() => {
    const ops = stratPosition?.pickedOperators.filter(
      (op) => !bannedOps.includes(op.operator),
    );
    if (!ops?.length) return stratPosition?.pickedOperators ?? [];
    return ops;
  })();

  const teamLineUp = (
    props.strat?.stratPositions.filter(
      (stratPositions) =>
        stratPositions.teamPositionID !== teamMember?.teamPositionID,
    ) ?? []
  )
    .map((pos) => {
      const teamPosition = props.team.teamPositions.find(
        (teamPos) => teamPos._id === pos.teamPositionID,
      );
      const player = props.team.members.find(
        (member) => member.teamPositionID === pos.teamPositionID,
      );
      const color = player?.defaultColor ?? undefined;

      return {
        op: pos.pickedOperators.find((op) => !bannedOps.includes(op.operator)),
        color,
        playerName: player?.name,
        positionName: teamPosition?.positionName,
        index: teamPosition?.index ?? 10,
      };
    })
    .filter((pos) => pos.op !== undefined)
    .sort((a, b) => a.index - b.index);

  const [viewModifier, setViewModifier] = useState<
    "none" | "hideForeign" | "grayscaleForeign"
  >(() => {
    // Prefer server-provided initial value when available to avoid
    // hydration mismatches. Fallback to client cookie if not provided.
    try {
      if (
        props.initialViewModifier === "none" ||
        props.initialViewModifier === "hideForeign" ||
        props.initialViewModifier === "grayscaleForeign"
      ) {
        return props.initialViewModifier;
      }
    } catch (e) {
      // ignore
    }

    try {
      const cookie = Cookie.get("strat_view_modifier");
      if (
        cookie === "none" ||
        cookie === "hideForeign" ||
        cookie === "grayscaleForeign"
      ) {
        return cookie as "none" | "hideForeign" | "grayscaleForeign";
      }
    } catch (e) {
      // ignore cookie read errors and fallback to default
    }
    return "none";
  });

  useEffect(() => {
    Cookie.set("strat_view_modifier", viewModifier, { expires: 365 });
  }, [viewModifier]);

  const Details = !props.hideDetails && props.strat && (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto_1fr] w-full gap-4",
        settings?.activeStratLayout === "top" ? "items-start" : "items-end ",
      )}
    >
      <div className="p-2">
        {!props.strat.drawingID && (
          <Select
            value={viewModifier}
            onValueChange={(value) => {
              const v = value as "none" | "hideForeign" | "grayscaleForeign";
              setViewModifier(v);
            }}
          >
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="Strat view modifier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <em>No view modifier</em>
              </SelectItem>
              <SelectItem value="hideForeign">Hide setup of others</SelectItem>
              <SelectItem value="grayscaleForeign">
                Grayscale setup of others
              </SelectItem>
            </SelectContent>
          </Select>
        )}
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
                  <OperatorIcon op={op.operator} />
                  {op.secondaryGadget && (
                    <GadgetIcon
                      id={op.secondaryGadget}
                      className="absolute size-6 -right-2 -bottom-2"
                    />
                  )}
                  {op.tertiaryGadget && (
                    <GadgetIcon
                      id={op.tertiaryGadget}
                      className="absolute size-6 -left-2 -bottom-2"
                    />
                  )}
                </div>
                {i === 0 ? (
                  <p className="text-lg font-bold text-center">{op.operator}</p>
                ) : i !== Math.min(availableOperators.length, 2) ? (
                  <div className="w-1" />
                ) : null}
              </Fragment>
            ))}
            {stratPosition?.shouldBringShotgun && (
              <Shotgun className="size-8" />
            )}
          </div>
        )}
        <div className="flex justify-center gap-1 text-sm">
          <span className="ml-2">{props.strat.site}</span>
          <Link
            href={`/editor/${props.strat._id}`}
            className="text-muted-foreground hover:text-primary"
          >
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer -my-2 -mx-1"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex justify-end items-end gap-2.5 py-1">
        {teamLineUp.map(({ op, color, playerName, positionName }, index) => (
          <Tooltip key={index}>
            <TooltipTrigger>
              <div
                className="relative rounded-sm scale-90"
                style={{ backgroundColor: color }}
              >
                <OperatorIcon op={op?.operator!} className="scale-125" />
                {op?.secondaryGadget && (
                  <GadgetIcon
                    id={op?.secondaryGadget}
                    className="absolute size-6 -right-2 -bottom-2"
                  />
                )}
                {op?.tertiaryGadget && (
                  <GadgetIcon
                    id={op?.tertiaryGadget}
                    className="absolute size-6 -left-2 -bottom-2"
                  />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-center">
                {playerName ? playerName : "Unassigned"} | {positionName}
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
        "relative h-full w-full flex justify-center items-center flex-col z-0",
        props.strat &&
          settings?.activeStratLayout === "top" &&
          "flex-col-reverse",
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
        <>
          <div className="flex-1 relative h-screen overflow-hidden py-0 block">
            <div className="relative h-full w-full flex items-center justify-center">
              <StratViewer
                strat={props.strat}
                team={props.team}
                assetModifier={
                  viewModifier === "hideForeign"
                    ? (assets) =>
                        assets.filter(
                          (asset) =>
                            asset.stratPositionID === stratPosition?._id,
                        )
                    : viewModifier === "grayscaleForeign"
                      ? (assets) =>
                          assets.map((asset) => ({
                            ...asset,
                            ...(asset.stratPositionID !==
                              stratPosition?._id && {
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
        </>
      ) : props.strat === null ? (
        <>
          <Ban className="text-muted-foreground" height={64} width={64} />
          <p className="text-muted-foreground">No strat selected</p>
        </>
      ) : null}
    </div>
  );
}
