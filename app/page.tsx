"use client";
import Server from "@/src/server";
import { useEffect, useState } from "react";

export default function Home() {
  const [src, setSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    let stop = false;

    (async () => {
      while (!stop) {
        const current = await Server.getActive();
        if (current) setSrc(current);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    })();

    return () => {
      stop = true;
    };
  });

  return <iframe className="w-full h-full" src={src} />;
}
