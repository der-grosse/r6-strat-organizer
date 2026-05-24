import { cn } from "@/lib/utils";
import MapFloorClickableHandler from "../clickHandler";

export default function ChaletB(props: MapFloorClickableProps) {
  const onClickHandler = MapFloorClickableHandler(props.onClick);
  return (
    <svg
      width="799.68"
      height="599.76"
      viewBox="0.00 0.00 3332.00 2499.00"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={cn("size-full", props.className)}
    >
      <g
        strokeLinecap="round"
        fill="none"
        stroke="transparent"
        strokeWidth="20.00"
        strokeLinejoin="round"
        className="*:cursor-pointer"
      >
        {/* doors start */}
        <path
          d="M1828.25,1912.69 L1870.46,1912.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1753.31,2064.25 L1753.31,2106.46"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1431.25,1706.69 L1473.46,1706.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1659.31,1315.25 L1659.31,1357.46"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M2061.25,1279.69 L2103.46,1279.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M2343.31,1194.25 L2343.31,1236.46"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M2110.25,169.69 L2152.46,169.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M2041.31,290.25 L2041.31,332.46"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1884.25,788.69 L1926.46,788.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        {/* doors end */}
        {/* reinforcements start */}
        <path
          d="M1674.71,2356.11 L1738.53,2356.66"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1599.71,2356.11 L1663.53,2356.66"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1668.73,1912.11 L1743.23,1912.66"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1659.39,1814.58 L1658.84,1902.11"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1659.39,1715.58 L1658.84,1803.11"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2207.39,1512.58 L2206.84,1592.15"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2207.39,1603.58 L2206.84,1683.15"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1827.83,1278.61 L1906.08,1279.16"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1916.83,1278.61 L1995.08,1279.16"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1602.39,181.21 L1601.84,256.57"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1602.39,268.21 L1601.84,343.57"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1602.39,366.21 L1601.84,441.57"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1602.39,453.21 L1601.84,528.57"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        {/* reinforcements end */}
      </g>
    </svg>
  );
}
