import { cn } from "@/lib/utils";
import FloorClickableClickHandler from "../clickHandler";

export default function Lair2F(props: MapFloorClickableProps) {
  const onClickHandler = FloorClickableClickHandler(props.onClick);
  return (
    <svg
      width="799.68"
      height="599.76"
      viewBox="0 0 3332 2499"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-full", props.className)}
    >
      <g
        strokeLinecap="round"
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        strokeLinejoin="round"
        className="*:cursor-pointer"
      >
        {/* windows start */}
        <path d="M1871.25,317.81 L1927.97,317.81" data-type="barricade" onClick={onClickHandler} />
        <path d="M1758.25,462.81 L1814.97,462.81" data-type="barricade" onClick={onClickHandler} />
        <path d="M1440.25,462.81 L1496.97,462.81" data-type="barricade" onClick={onClickHandler} />
        <path
          d="M2696.25,1803.81 L2752.97,1803.81"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M2418.25,2077.81 L2474.97,2077.81"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M2051.25,2077.81 L2107.97,2077.81"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1105.25,1974.81 L1161.97,1974.81"
          data-type="barricade"
          onClick={onClickHandler}
        />
        {/* windows end */}
        {/* doors start */}
        <path d="M2639.31,507.25 L2639.31,559.72" data-type="barricade" onClick={onClickHandler} />
        <path d="M2432.75,984.31 L2380.28,984.31" data-type="barricade" onClick={onClickHandler} />
        <path d="M2130.75,752.31 L2078.28,752.31" data-type="barricade" onClick={onClickHandler} />
        <path d="M1286.75,756.31 L1234.28,756.31" data-type="barricade" onClick={onClickHandler} />
        <path
          d="M2785.75,1358.31 L2733.28,1358.31"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M2362.09,1687.27 L2468.12,1687.46"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M2335.75,1803.31 L2283.28,1803.31"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1998.19,1787.25 L1998.19,1734.78"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1685.75,1515.31 L1633.28,1515.31"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1998.23,1008.59 L1998.04,1114.62"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1998.23,1008.59 L1998.04,1114.62"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1329.23,1841.59 L1329.04,1947.62"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path d="M878.75,1515.31 L826.28,1515.31" data-type="barricade" onClick={onClickHandler} />
        {/* doors end */}
        {/* reinforcements start */}
        <path
          d="M1998.11,1488.48 L1998.09,1384.29"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2024.27,1358.61 L2129.11,1358.59"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2142.19,1358.61 L2246.84,1358.59"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2199.2,984.61 L2292.58,984.59"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2319.89,781.81 L2319.91,863.63"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2319.89,876.63 L2319.91,957.69"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1870.89,1145.42 L1870.91,1237.44"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1410.46,1236.39 L1336.06,1236.41"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1498.24,1236.39 L1423.54,1236.41"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1410.46,1515.39 L1336.06,1515.41"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1498.24,1515.39 L1423.54,1515.41"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1329.61,1687.46 L1329.59,1613.06"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1329.61,1775.24 L1329.59,1700.54"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1998.41,1954.5 L1998.59,1888.54"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1998.61,1875.11 L1998.59,1809.94"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2499.89,1492.81 L2499.91,1574.63"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2499.89,1587.63 L2499.91,1668.69"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2092.2,984.61 L2185.58,984.59"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        {/* reinforcements end */}
        {/* hatches start */}
        <rect
          x="1213.64"
          y="1552.64"
          width="78.72"
          height="77.72"
          fill="transparent"
          data-type="hatch"
          onClick={onClickHandler}
        />
        <rect
          x="2024.64"
          y="1584.64"
          width="78.72"
          height="77.72"
          fill="transparent"
          data-type="hatch"
          onClick={onClickHandler}
        />
        <rect
          x="2305.64"
          y="1255.64"
          width="78.72"
          height="77.72"
          fill="transparent"
          data-type="hatch"
          onClick={onClickHandler}
        />
        {/* hatches end */}
      </g>
    </svg>
  );
}
