import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HexColorPicker } from "react-colorful";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { DEFAULT_COLORS } from "@/lib/static/colors";

export interface ColorPickerDialogProps {
  color?: string;
  onChange?: (color: string) => void;
  onClose?: () => void;
  open?: boolean;
}

export default function ColorPickerDialog(props: ColorPickerDialogProps) {
  const [currentCustomColor, setCurrentCustomColor] = useState(
    props.color || DEFAULT_COLORS.at(-1)!,
  );

  const isValidHexColor = (color: string) => {
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
  };

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        if (!open) {
          props.onClose?.();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="sr-only">Choose a color</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="presets">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          <TabsContent value="presets">
            <div className="grid grid-cols-4 gap-2 px-1 w-fit mx-auto">
              {DEFAULT_COLORS.map((color) => (
                <ColorButton
                  size="large"
                  className="outline"
                  key={color}
                  color={color}
                  onClick={(color) => {
                    props.onChange?.(color);
                  }}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="custom" className="flex flex-col items-center">
            <HexColorPicker
              color={props.color}
              onChange={(color) => {
                setCurrentCustomColor(color);
              }}
            />
            <Input
              value={currentCustomColor}
              onChange={(e) => {
                setCurrentCustomColor(e.target.value);
              }}
              className="mt-4 w-48"
            />
            <Button
              className="mt-4"
              disabled={!isValidHexColor(currentCustomColor)}
              onClick={() => {
                props.onChange?.(currentCustomColor);
              }}
            >
              <Check />
              Confirm
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export function ColorButton(props: {
  color: string | undefined | null;
  onClick?: (color: string) => void;
  disabled?: boolean;
  size: "small" | "large";
  className?: string;
  component?: React.ElementType;
}) {
  const Component = props.component || "button";
  return (
    <Component
      type="button"
      className={cn(
        "rounded-full hover:shadow-lg focus:outline-none focus:ring-2",
        props.size === "small" ? "w-6 h-6" : "w-12 h-12",
        !props.disabled && "cursor-pointer",
        props.className,
      )}
      disabled={props.disabled}
      style={{ backgroundColor: props.color ?? DEFAULT_COLORS.at(-1) }}
      onClick={() => {
        if (props.disabled) return;
        props.onClick?.(props.color ?? DEFAULT_COLORS.at(-1)!);
      }}
    />
  );
}
