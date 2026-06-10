"use client";
import { getUbisoftAvatarUrl } from "@/lib/ubisoft/ubi";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Ubisoft from "../icons/ubisoft";

export interface UbisoftAvatarProps {
  ubisoftID: string;
  className?: string;
  onValidChange?: (isValid: boolean) => void;
  showUbisoftIndex?: boolean;
}

export default function UbisoftAvatar(props: UbisoftAvatarProps) {
  const [valid, setValid] = useState(true);
  useEffect(() => {
    setValid(!!props.ubisoftID && props.ubisoftID.length === 36);
  }, [props.ubisoftID]);

  if (!valid) {
    return <Ubisoft className={cn("h-8 w-8 text-muted-foreground", props.className)} />;
  }

  return (
    <div className={cn("relative inline-block", props.className)}>
      <img
        rel="noreferrer"
        src={getUbisoftAvatarUrl(props.ubisoftID) ?? undefined}
        alt="Ubisoft Avatar"
        className={cn("h-8 w-8", props.className)}
        onError={() => {
          setValid(false);
          props.onValidChange?.(false);
        }}
        onLoad={() => {
          setValid(true);
          props.onValidChange?.(true);
        }}
      />
      {props.showUbisoftIndex && (
        <Ubisoft className="absolute -bottom-1 -right-1 size-4 bg-card rounded-full" />
      )}
    </div>
  );
}
