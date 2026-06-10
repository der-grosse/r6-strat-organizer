import { cn } from "@/lib/utils";
import MapFloorClickableHandler from "../clickHandler";

export default function ConsulateB(props: MapFloorClickableProps) {
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
          d="M3024.31,1342.25 L3024.31,1384.46"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M2916.25,1729.69 L2958.46,1729.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M2277.31,1219.25 L2277.31,1261.46"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1970.25,1345.69 L2012.46,1345.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1970.25,1129.69 L2012.46,1129.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1788.25,1456.69 L1830.46,1456.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1535.25,1129.69 L1577.46,1129.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1690.31,1618.25 L1690.31,1660.46"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1232.25,1456.69 L1274.46,1456.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path d="M691.31,1190.25 L691.31,1232.46" data-type="barricade" onClick={onClickHandler} />
        <path
          d="M1166.28,1191.19 L1166.09,1290.18"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path d="M412.31,796.25 L412.31,838.46" data-type="barricade" onClick={onClickHandler} />
        {/* doors end */}
        {/* reinforcements start */}
        <path
          d="M2875.19,917.11 L2982.25,917.66"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2277.39,1482.21 L2276.84,1577.75"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2277.39,1589.21 L2276.84,1684.75"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2277.39,1375.21 L2276.84,1470.75"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1928.39,1466.21 L1927.84,1561.75"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2331.19,1863.11 L2438.25,1863.66"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1350.39,1246.21 L1349.84,1341.75"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1350.39,1139.21 L1349.84,1234.75"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1409.19,1456.11 L1516.25,1456.66"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1166.39,1841.69 L1165.84,1948.75"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1690.20,1916.20 L1690.03,2004.73"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1690.20,1816.20 L1690.03,1904.73"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1166.20,1585.20 L1166.03,1673.73"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1166.20,1485.20 L1166.03,1573.73"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1166.20,1042.20 L1166.03,1130.73"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1166.20,942.20 L1166.03,1030.73"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M555.39,1562.21 L554.84,1657.75"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M555.39,1455.21 L554.84,1550.75"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        {/* reinforcements end */}
      </g>
    </svg>
  );
}
