import { TextboxAsset, PlacedAsset } from "@/lib/types/asset.types";
import { getAssetColor } from "../canvas/useMountedAssets";
import { StratPositions } from "@/lib/types/strat.types";
import { FullTeam } from "@/lib/types/team.types";

const BACKGROUND_STYLES: Record<TextboxAsset["background"], React.CSSProperties> = {
  none: {},
  light: { backgroundColor: "rgba(255, 255, 255, 0.7)" },
  dark: { backgroundColor: "rgba(0, 0, 0, 0.7)" },
};

export default function Textbox({
  asset,
  stratPositions,
  team,
}: {
  asset: PlacedAsset & TextboxAsset;
  stratPositions: StratPositions[];
  team: FullTeam;
}) {
  const assignedColor = getAssetColor(asset, stratPositions, team);
  const bg = asset.background ?? "none";
  const color = assignedColor ?? (bg === "light" ? "black" : "white");

  return (
    <div
      className="h-full w-full flex items-center justify-center overflow-hidden rounded-sm"
      style={{
        color,
        fontSize: `${asset.fontSize}px`,
        lineHeight: 1.2,
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
        ...BACKGROUND_STYLES[bg],
      }}
    >
      <span className="text-center">{asset.text || "Text"}</span>
    </div>
  );
}
