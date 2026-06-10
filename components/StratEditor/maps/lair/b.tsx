import { cn } from "@/lib/utils";
import FloorClickableClickHandler from "../clickHandler";

export default function LairB(props: MapFloorClickableProps) {
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
        <path d="M982.19,603.25 L982.19,659.97" data-type="barricade" onClick={onClickHandler} />
        <path d="M2623.75,691.19 L2567.03,691.19" data-type="barricade" onClick={onClickHandler} />
        {/* windows end */}
        {/* doors start */}
        <path d="M869.25,1012.69 L921.72,1012.69" data-type="barricade" onClick={onClickHandler} />
        <path
          d="M1165.25,1012.69 L1217.72,1012.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path d="M907.25,1560.69 L959.72,1560.69" data-type="barricade" onClick={onClickHandler} />
        <path d="M684.25,1796.69 L736.72,1796.69" data-type="barricade" onClick={onClickHandler} />
        <path
          d="M1121.31,1720.25 L1121.31,1772.72"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1747.31,1180.25 L1747.31,1232.72"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path d="M2220.25,968.81 L2167.78,968.81" data-type="barricade" onClick={onClickHandler} />
        <path
          d="M2024.25,1392.81 L1971.78,1392.81"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M2276.73,1424.09 L2276.54,1530.12"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1747.31,1782.25 L1747.31,1834.72"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1667.75,1560.31 L1615.28,1560.31"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M2859.75,2129.31 L2807.28,2129.31"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M2411.25,1037.81 L2358.78,1037.81"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path d="M2114.69,793.75 L2114.69,741.28" data-type="barricade" onClick={onClickHandler} />
        <path d="M1747.69,920.75 L1747.69,868.28" data-type="barricade" onClick={onClickHandler} />
        <path d="M653.25,1012.69 L705.72,1012.69" data-type="barricade" onClick={onClickHandler} />
        {/* doors end */}
        {/* reinforcements start */}
        <path
          d="M809.04,860.11 L885.56,860.09"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M899.04,860.11 L975.56,860.09"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1352.36,1561.11 L1427.9,1561.09"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1441.04,1561.11 L1516.64,1561.09"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1121.89,1202.04 L1121.91,1278.56"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1121.89,1292.04 L1121.91,1368.56"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1747.39,1261.82 L1747.41,1366.14"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1939.36,969.11 L2014.9,969.09"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2028.04,969.11 L2103.64,969.09"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2161.39,1603.82 L2161.41,1708.14"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2902.89,1156.36 L2902.91,1231.9"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2902.89,1245.04 L2902.91,1320.64"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        {/* reinforcements end */}
        {/* hatches start */}
        {/* no hatches */}
        {/* hatches end */}
      </g>
    </svg>
  );
}
