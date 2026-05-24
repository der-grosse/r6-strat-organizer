import { cn } from "@/lib/utils";
import MapFloorClickableHandler from "../clickHandler";

export default function ClubhouseB(props: MapFloorClickableProps) {
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
          d="M1155.28,1164.19 L1155.09,1263.18"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1648.69,1269.22 L1747.68,1269.41"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M2022.25,2183.69 L2064.46,2183.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1434.31,1641.25 L1434.31,1683.46"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1205.25,1536.69 L1247.46,1536.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M2020.25,1414.69 L2062.46,1414.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1784.31,1186.25 L1784.31,1228.46"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1914.19,882.21 L1955.65,890.12"
          data-type="barricade"
          onClick={onClickHandler}
        />
        {/* doors end */}
        {/* reinforcements start */}
        <path
          d="M1275.71,1146.11 L1358.23,1146.66"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1371.71,1146.11 L1454.23,1146.66"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1488.21,1146.11 L1561.85,1146.66"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1576.21,1146.11 L1649.85,1146.66"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1664.21,1146.11 L1737.85,1146.66"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1804.21,1414.11 L1888.30,1414.66"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1903.21,1414.11 L1987.30,1414.66"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1784.39,1471.71 L1783.84,1545.25"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1784.39,1559.71 L1783.84,1633.25"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1784.39,1647.71 L1783.84,1721.25"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1294.39,1278.71 L1293.84,1351.57"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1294.39,1365.71 L1293.84,1438.57"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1294.39,1453.71 L1293.84,1526.57"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1287.91,131.12 L1327.78,57.17"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1327.27,164.79 L1403.47,202.14"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        {/* reinforcements end */}
      </g>
    </svg>
  );
}
