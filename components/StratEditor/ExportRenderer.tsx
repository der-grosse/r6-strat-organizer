"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import StratViewer from "./StratViewer";
import { Strat } from "@/lib/types/strat.types";
import { FullTeam } from "@/lib/types/team.types";
import { svgToImg } from "@/lib/exportCanvasAsPng";

const EXPORT_WIDTH = 2400;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface StratExportContextValue {
  exporting: boolean;
  exportStratAsPNG: (strat: Strat, team: FullTeam) => Promise<void>;
}

const StratExportContext = createContext<StratExportContextValue>(null!);

export function useStratExport() {
  return useContext(StratExportContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface ExportJob {
  strat: Strat;
  team: FullTeam;
  resolve: () => void;
  reject: (err: unknown) => void;
}

export function StratExportProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [job, setJob] = useState<ExportJob | null>(null);
  const jobRef = useRef<ExportJob | null>(null);

  const exportStratAsPNG = useCallback(
    (strat: Strat, team: FullTeam): Promise<void> =>
      new Promise((resolve, reject) => {
        const newJob = { strat, team, resolve, reject };
        jobRef.current = newJob;
        setJob(newJob);
      }),
    [],
  );

  const finish = useCallback(() => {
    jobRef.current?.resolve();
    jobRef.current = null;
    setJob(null);
  }, []);

  const fail = useCallback((err: unknown) => {
    jobRef.current?.reject(err);
    jobRef.current = null;
    setJob(null);
  }, []);

  return (
    <StratExportContext.Provider
      value={{ exporting: job !== null, exportStratAsPNG }}
    >
      {children}
      {job && (
        <ExportRenderer
          strat={job.strat}
          team={job.team}
          onFinish={finish}
          onFail={fail}
        />
      )}
    </StratExportContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Offscreen renderer
// ---------------------------------------------------------------------------

interface ExportRendererProps {
  strat: Strat;
  team: FullTeam;
  onFinish: () => void;
  onFail: (err: unknown) => void;
}

function waitForImages(container: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      const images = Array.from(container.querySelectorAll("image, img")) as (
        | SVGImageElement
        | HTMLImageElement
      )[];

      // Force lazy-loaded images to load (they won't trigger offscreen)
      for (const img of images) {
        if (img instanceof HTMLImageElement && img.loading === "lazy") {
          img.loading = "eager";
        }
      }

      const allLoaded = images.every((img) =>
        img instanceof HTMLImageElement ? img.complete : true,
      );
      if (allLoaded) {
        resolve();
      } else {
        requestAnimationFrame(check);
      }
    };
    // Give the browser a frame to start painting after mount
    requestAnimationFrame(check);
  });
}

function ExportRenderer({
  strat,
  team,
  onFinish,
  onFail,
}: ExportRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const running = useRef(false);

  const handleLoaded = useCallback(async () => {
    if (running.current) return;
    running.current = true;

    try {
      const container = containerRef.current;
      if (!container) throw new Error("Export container not found");

      await waitForImages(container);

      const svg = container.querySelector("svg");
      if (!svg) throw new Error("SVG element not found");

      await svgToImg(svg, strat.name || "strat", {
        scale: 2,
        format: "png",
        quality: 1,
        download: true,
      });
      onFinish();
    } catch (err) {
      onFail(err);
    }
  }, [strat.name, onFinish, onFail]);

  return createPortal(
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        left: "-99999px",
        top: 0,
        width: EXPORT_WIDTH,
        height: "auto",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <StratViewer strat={strat} team={team} onLoaded={handleLoaded} />
    </div>,
    document.body,
  );
}
