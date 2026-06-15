"use client";

import { cn } from "@/lib/utils";
import { Fragment, useEffect, useState } from "react";

function Skeleton({
  className,
  delay = 200,
  ...props
}: React.ComponentProps<"div"> & { amount?: number; delay?: number }) {
  const [visible, setVisible] = useState(delay <= 0);

  useEffect(() => {
    if (delay <= 0) return;
    const timeout = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  const { amount, ...rest } = props;

  if (!visible) return null;

  const getSkeleton = () => (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...rest}
    />
  );

  return (
    <>
      {Array.from({ length: amount || 1 }).map((_, index) => (
        <Fragment key={index}>{getSkeleton()}</Fragment>
      ))}
    </>
  );
}

export { Skeleton };
