"use client";
import { getActive } from "@/src/strats";
import { Ban } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface ActiveStratProps {
  defaultOpen?: Strat | null;
}

export default function ActiveStrat(props: ActiveStratProps) {
  const [src, setSrc] = useState<string | undefined>(undefined);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    let stop = false;

    (async () => {
      while (!stop) {
        const current = await getActive();
        if (current) setSrc(current.previewURL);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    })();

    return () => {
      stop = true;
    };
  }, [setSrc]);

  return (
    <div className="relative h-full w-full flex justify-center items-center flex-col gap-4">
      {src ? (
        <iframe className="w-full h-full" src={src} ref={iframeRef} />
      ) : (
        <>
          <Ban className="text-muted-foreground" height={64} width={64} />
          <p className="text-muted-foreground">No strat selected</p>
        </>
      )}
    </div>
  );
}
