import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, View } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

const ICONS = [
  {
    name: "none",
    icon: Eye,
  },
  {
    name: "grayscaleForeign",
    icon: View,
  },
  {
    name: "hideForeign",
    icon: EyeOff,
  },
] as const;

export interface StratGadgetVisibiltyPickerProps {
  onChange?: (
    viewModifier: "none" | "hideForeign" | "grayscaleForeign",
  ) => void;
}

export default function StratGadgetVisibiltyPicker(
  props: StratGadgetVisibiltyPickerProps,
) {
  const settings = useQuery(api.settings.get);
  const updateSettings = useMutation(api.settings.update);
  const initialViewModifierChangeSent = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      settings?.stratGadgetViewModifier &&
      !initialViewModifierChangeSent.current
    ) {
      props.onChange?.(settings.stratGadgetViewModifier);
      initialViewModifierChangeSent.current = true;
    }
  }, [settings?.stratGadgetViewModifier, props]);

  // Close when clicking/tapping outside
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const onChange = useCallback(
    (viewModifier: "none" | "hideForeign" | "grayscaleForeign") => {
      updateSettings({ stratGadgetViewModifier: viewModifier });
      props.onChange?.(viewModifier);
      setIsOpen(false);
    },
    [updateSettings, props],
  );

  const viewModifier = settings?.stratGadgetViewModifier ?? "none";

  const ActiveIcon =
    ICONS.find((icon) => icon.name === viewModifier)?.icon ?? Eye;

  return (
    <div ref={containerRef} className="flex justify-start items-start relative">
      <Button
        size="icon"
        variant="ghost"
        className="!opacity-100"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <ActiveIcon className="!text-muted-foreground" />
      </Button>
      {isOpen && (
        <div
          className={cn(
            "absolute left-0 flex",
            settings?.activeStratLayout === "top"
              ? "top-[100%] flex-col-reverse"
              : "bottom-[100%] flex-col ",
          )}
        >
          {ICONS.map((icon) => {
            const IconComponent = icon.icon;
            return (
              <Button
                key={icon.name}
                size="icon"
                variant="ghost"
                onClick={() => onChange(icon.name)}
              >
                <IconComponent
                  className={
                    viewModifier === icon.name ? "" : "text-muted-foreground"
                  }
                />
              </Button>
            );
          })}
          <div className="mx-1 w-[calc(100%-2*var(--spacing))]">
            <Separator orientation="horizontal" />
          </div>
        </div>
      )}
    </div>
  );
}
