import { Fragment } from "react";
import { CanvasAsset, clampAssetSize } from "./Canvas";
import { R6Map } from "@/lib/types/strat.types";
import { Asset, PlacedAsset, LayoutAsset } from "@/lib/types/asset.types";

export interface MapBackgroundProps {
  // To check for existing assets when adding new ones
  assets: CanvasAsset[];
  map: R6Map | null;
  viewBox: {
    width: number;
    height: number;
  };
  addAsset: (asset: Omit<Asset & Partial<PlacedAsset>, "_id">) => void;
  readonly?: boolean;
  showFloorNames: boolean;
}

export default function MapBackground(props: MapBackgroundProps) {
  const { map, viewBox, readonly, assets, addAsset, showFloorNames } = props;

  return (
    <>
      {/* Render map background */}
      {map?.floors.map((floor, i) => {
        const x = i % 2 === 0 ? 0 : viewBox.width / 2;
        const y = (Math.floor(i / 2) * viewBox.height) / 2;
        const width = viewBox.width / (map.floors.length > 1 ? 2 : 1);
        const height = viewBox.height / (map.floors.length > 2 ? 2 : 1);

        const labelText = floor.floor;
        const labelPadding = 24;
        const fontSize = 52;
        return (
          <Fragment key={floor.floor}>
            <image
              key={floor.floor}
              href={floor.src}
              width={width}
              height={height}
              x={x}
              y={y}
              preserveAspectRatio="xMidYMid meet"
              className="pointer-events-none"
            />
            {showFloorNames && (
              <g className="pointer-events-none select-none">
                <text
                  x={x + labelPadding}
                  y={y + labelPadding + fontSize / 2}
                  fill="#f8fafc"
                  fontSize={fontSize}
                  fontWeight={700}
                  dominantBaseline="middle"
                >
                  {labelText}
                </text>
              </g>
            )}
            {!readonly && floor.clickables && (
              <g transform={`translate(${x}, ${y})`}>
                <foreignObject width={width} height={height}>
                  <floor.clickables
                    onClick={(
                      type,
                      rel_x,
                      rel_y,
                      rel_width,
                      rel_height,
                      rotation
                    ) => {
                      const { width: abs_width, height: abs_height } =
                        clampAssetSize({
                          width:
                            rel_width * width +
                            (type === "barricade" ? 10 : -5), // add a little bit of spacing that the edge is over the window edge
                          height:
                            rel_height * height +
                            (type === "barricade" ? 10 : -5), // add a little bit of spacing that the edge is over the window edge
                        });
                      const abs_x = rel_x * width + x - abs_width / 2;
                      const abs_y = rel_y * width + y - abs_height / 2;
                      const baseAsset = ((): Pick<
                        LayoutAsset,
                        "type" | "variant"
                      > => {
                        switch (type) {
                          case "barricade":
                            return {
                              type: "layout",
                              variant: "barricade",
                            };
                          case "reinforcement":
                            return {
                              type: "layout",
                              variant: "reinforcement",
                            };
                          default:
                            return null!;
                        }
                      })();

                      // check if an asset at this position alreaady exists -> prevent duplicate assets
                      const existingAsset = assets?.find((asset) => {
                        if (asset.type !== baseAsset.type) return false;
                        const assetCenterX =
                          asset.position.x + (asset.size?.width || 0) / 2;
                        const assetCenterY =
                          asset.position.y + (asset.size?.height || 0) / 2;
                        const distance = Math.sqrt(
                          Math.pow(assetCenterX - (abs_x + abs_width / 2), 2) +
                            Math.pow(assetCenterY - (abs_y + abs_height / 2), 2)
                        );
                        return distance < 5; // small threshold to account for minor differences
                      });

                      if (existingAsset) return;

                      addAsset({
                        ...baseAsset,
                        position: {
                          x: abs_x,
                          y: abs_y,
                        },
                        size: {
                          width: abs_width,
                          height: abs_height,
                        },
                        rotation,
                      });
                    }}
                  />
                </foreignObject>
              </g>
            )}
          </Fragment>
        );
      })}
    </>
  );
}
