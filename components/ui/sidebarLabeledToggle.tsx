import { cn } from "@/lib/utils";
import { Button } from "./button";
import { ButtonGroup } from "./button-group";
import { Label } from "./label";

export interface SidebarLabeledToggleProps {
  active: boolean;
  onChange: (value: boolean) => void;
  labels: [string, string];
  label: string;
  disabled?: boolean;
  className?: string;
  slots?: {
    button?: {
      className?: string;
    };
    buttonGroup?: {
      className?: string;
    };
  };
}

export default function SidebarLabeledToggle(props: SidebarLabeledToggleProps) {
  return (
    <div className={cn("flex flex-row flex-wrap gap-2", props.className)}>
      <Label className="text-muted-foreground p-1">{props.label}</Label>
      <div className="flex-1" />
      <ButtonGroup className={props.slots?.buttonGroup?.className}>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "rounded-md px-3",
            !props.active && "opacity-50 bg-secondary/10 hover:bg-secondary/20",
            props.slots?.button?.className,
          )}
          aria-pressed={props.active}
          disabled={props.disabled}
          onClick={() => props.onChange(true)}
        >
          {props.labels[0]}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "rounded-md px-3",
            props.active && "opacity-50 bg-secondary/10 hover:bg-secondary/20",
            props.slots?.button?.className,
          )}
          aria-pressed={!props.active}
          disabled={props.disabled}
          onClick={() => props.onChange(false)}
        >
          {props.labels[1]}
        </Button>
      </ButtonGroup>
    </div>
  );
}
