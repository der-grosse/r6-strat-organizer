import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import { Eye, EyeOff, View } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

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
  initialViewModifier?: "none" | "hideForeign" | "grayscaleForeign";
  onChange?: (
    viewModifier: "none" | "hideForeign" | "grayscaleForeign",
  ) => void;
}

export default function StratGadgetVisibiltyPicker(
  props: StratGadgetVisibiltyPickerProps,
) {
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
    props.onChange?.(viewModifier);
  }, [viewModifier]);

  const ActiveIcon =
    ICONS.find((icon) => icon.name === viewModifier)?.icon ?? Eye;

  return (
    <div className="flex justify-start items-start group relative">
      <Button size="icon" variant="ghost" disabled className="!opacity-100">
        <ActiveIcon className="!text-muted-foreground" />
      </Button>
      <div className="absolute bottom-[100%] left-0 flex flex-col hidden group-hover:flex">
        {ICONS.map((icon) => {
          const IconComponent = icon.icon;
          return (
            <Button
              key={icon.name}
              size="icon"
              variant="ghost"
              onClick={() => setViewModifier(icon.name)}
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
