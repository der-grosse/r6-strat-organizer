"use client";

import * as React from "react";
import { useState } from "react";
import { Button, buttonVariants } from "./button";
import { Spinner } from "./spinner";
import type { VariantProps } from "class-variance-authority";

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

interface PromiseButtonProps extends Omit<ButtonProps, "onClick"> {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => Promise<unknown>;
}

function PromiseButton({ onClick, disabled, children, ...props }: PromiseButtonProps) {
  const [pending, setPending] = useState(false);

  return (
    <Button
      {...props}
      disabled={disabled || pending}
      onClick={async (e) => {
        if (pending) return;
        setPending(true);
        try {
          await onClick(e);
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? <Spinner /> : children}
    </Button>
  );
}

export { PromiseButton };
