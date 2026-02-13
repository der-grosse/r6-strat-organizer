import { useEffect, useRef } from "react";
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
  useEffect(() => {
    if (
      settings?.stratGadgetViewModifier &&
      !initialViewModifierChangeSent.current
    ) {
      props.onChange?.(settings.stratGadgetViewModifier);
      initialViewModifierChangeSent.current = true;
    }
  }, [settings?.stratGadgetViewModifier, props]);

  const onChange = (
    viewModifier: "none" | "hideForeign" | "grayscaleForeign",
  ) => {
    updateSettings({ stratGadgetViewModifier: viewModifier });
    props.onChange?.(viewModifier);
  };

  const viewModifier = settings?.stratGadgetViewModifier ?? "none";

  const ActiveIcon =
    ICONS.find((icon) => icon.name === viewModifier)?.icon ?? Eye;

  return (
    <div className="flex justify-start items-start group relative">
      <Button size="icon" variant="ghost" disabled className="!opacity-100">
        <ActiveIcon className="!text-muted-foreground" />
      </Button>
      <div
        className={cn(
          "absolute left-0 flex hidden group-hover:flex",
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
    </div>
  );
}
