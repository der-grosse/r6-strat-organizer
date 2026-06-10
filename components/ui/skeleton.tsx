import { cn } from "@/lib/utils";
import { Fragment } from "react";

function Skeleton({ className, ...props }: React.ComponentProps<"div"> & { amount?: number }) {
  const getSkeleton = () => (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );

  return (
    <>
      {Array.from({ length: props.amount || 1 }).map((_, index) => (
        <Fragment key={index}>{getSkeleton()}</Fragment>
      ))}
    </>
  );
}

export { Skeleton };
