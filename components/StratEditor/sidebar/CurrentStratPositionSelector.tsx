import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CircleOff, Dot } from "lucide-react";
import { Strat } from "@/lib/types/strat.types";
import { FullTeam } from "@/lib/types/team.types";
import { Id } from "@/convex/_generated/dataModel";

export interface CurrentStratPositionSelectorProps {
  strat: Strat;
  team: FullTeam;
  selected: Id<"stratPositions"> | null;
  emptyIcon?: React.ReactNode;
  fixedSelectedIcon?: React.ReactNode;
  onSelect: (id: Id<"stratPositions"> | null) => void;
}

export default function CurrentStratPositionSelector({
  strat,
  team,
  selected,
  emptyIcon,
  fixedSelectedIcon,
  onSelect,
}: CurrentStratPositionSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTouchRef = useRef(false);

  const mappedStratPositions = useMemo(
    () =>
      strat.stratPositions.map((sp) => {
        const teamPosition = team.teamPositions.find(
          (tp) => tp._id === sp.teamPositionID,
        );
        const player = team.members.find(
          (m) => m._id === teamPosition?.playerID,
        );
        return {
          _id: sp._id,
          label: teamPosition?.positionName ?? "Unassigned",
          icon: (
            <div
              className={cn(
                "w-4 h-4 rounded-full",
                !player?.defaultColor &&
                  "outline-2 outline-offset-1 outline-muted",
              )}
              style={{
                background: player?.defaultColor ?? undefined,
              }}
            />
          ),
        };
      }),
    [strat.stratPositions, team.teamPositions],
  );
  const selectedStratPosition = useMemo(
    () => mappedStratPositions.find((option) => option._id === selected),
    [mappedStratPositions, selected],
  );

  // Close the menu when tapping outside on touch devices
  useEffect(() => {
    if (!open) return;

    function handleTouchOutside(e: TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("touchstart", handleTouchOutside);
    return () => {
      document.removeEventListener("touchstart", handleTouchOutside);
    };
  }, [open]);

  const handleTouchStart = useCallback(() => {
    isTouchRef.current = true;
  }, []);

  const handleMouseEnter = useCallback(() => {
    // Don't open on hover if the interaction was initiated by touch
    if (isTouchRef.current) {
      isTouchRef.current = false;
      return;
    }
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isTouchRef.current) return;
    setOpen(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("group relative size-9", !open && "overflow-hidden")}
      onTouchStart={handleTouchStart}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setOpen(true)}
      onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
      role="group"
      aria-label="Multi option selector"
      aria-expanded={open}
    >
      <div className="absolute left-0 h-full z-10 flex flex-row bg-background rounded-md shadow-md">
        {selectedStratPosition && (
          <ItemButton
            key={selectedStratPosition._id}
            label={selectedStratPosition.label}
            onClick={() => setOpen(true)}
          >
            {selectedStratPosition.icon}
          </ItemButton>
        )}
        <ItemButton
          label="No option selected"
          onClick={() => {
            if (!open) {
              setOpen(true);
              return;
            }
            onSelect(null);
            setOpen(false);
          }}
        >
          {emptyIcon ?? <CircleOff />}
        </ItemButton>
        {mappedStratPositions
          .filter((sp) => sp._id !== selected)
          .map((sp) => (
            <ItemButton
              key={sp._id}
              label={sp.label}
              onClick={() => {
                onSelect(sp._id);
                setOpen(false);
              }}
            >
              {!open && fixedSelectedIcon && sp._id === selected
                ? fixedSelectedIcon
                : sp.icon}
            </ItemButton>
          ))}
      </div>
    </div>
  );
}

function ItemButton({
  onClick,
  children,
  label,
}: {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Button type="button" variant="ghost" size="icon" onClick={onClick}>
      <span className="sr-only">{label}</span>
      {children}
    </Button>
  );
}
