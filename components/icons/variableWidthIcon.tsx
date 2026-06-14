import { cn } from "@/lib/utils";

interface VariableWidthIconPart {
  src: string;
  alt: string;
}

export default function VariableWidthIcon({
  parts,
}: {
  parts: {
    left: VariableWidthIconPart;
    right: VariableWidthIconPart;
    middle: VariableWidthIconPart;
    between: VariableWidthIconPart;
  };
}) {
  return function VariableWidthIcon(props: { className?: string }) {
    return (
      <div
        className={cn(
          "size-full grid grid-cols-[auto_1fr_auto_1fr_auto] grid-rows-1 items-center",
          props.className,
        )}
      >
        <img
          src={parts.left.src}
          alt={parts.left.alt}
          className="h-full aspect-auto object-contain max-h-full"
          draggable={false}
        />
        <div className="flex h-full -mx-0.125">
          <img
            src={parts.between.src}
            alt={parts.between.alt}
            className="h-full aspect-auto flex-[1_1_0]"
            draggable={false}
          />
        </div>
        <img
          src={parts.middle.src}
          alt={parts.middle.alt}
          className="h-full aspect-auto object-contain"
          draggable={false}
        />
        <div className="flex h-full -mx-0.125">
          <img
            src={parts.between.src}
            alt={parts.between.alt}
            className="h-full aspect-auto flex-[1_1_0]"
            draggable={false}
          />
        </div>
        <img
          src={parts.right.src}
          alt={parts.right.alt}
          className="h-full aspect-auto object-contain"
          draggable={false}
        />
      </div>
    );
  };
}
