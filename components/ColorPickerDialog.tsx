import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { HexColorPicker } from "react-colorful";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useRef } from "react";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { cn } from "@/src/utils";

export interface ColorPickerDialogProps {
  color?: string;
  onChange?: (color: string) => void;
  onClose?: () => void;
  open?: boolean;
}

export const DEFAULT_COLORS = [
  "#db2777",
  "#dc2626",
  "#ea580c",
  "#d97706",
  "#facc15",
  "#84cc16",
  "#2dd4bf",
  "#06b6d4",
  "#3b82f6",
  "#6d28d9",
  "#e879f9",
  "#fda4af",
];

export default function ColorPickerDialog(props: ColorPickerDialogProps) {
  const currentCustomColor = useRef(props.color || DEFAULT_COLORS[0]);
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
                currentCustomColor.current = color;
              }}
            />
            <Button
              className="mt-4 "
              onClick={() => {
                props.onChange?.(currentCustomColor.current);
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
  color: string;
  onClick?: (color: string) => void;
  disabled?: boolean;
  size: "small" | "large";
  className?: string;
}) {
  return (
    <button
      className={cn(
        "rounded-full hover:shadow-lg focus:outline-none focus:ring-2 not:disabled:cursor-pointer",
        props.size === "small" ? "w-6 h-6" : "w-12 h-12",
        props.className
      )}
      disabled={props.disabled}
      style={{ backgroundColor: props.color }}
      onClick={() => {
        if (props.disabled) return;
        props.onClick?.(props.color);
      }}
    />
  );
}
