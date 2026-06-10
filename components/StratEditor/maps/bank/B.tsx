import { cn } from "@/lib/utils";
import MapFloorClickableHandler from "../clickHandler";

export default function BankB(props: MapFloorClickableProps) {
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
        {/* windows start */}
        <path
          d="M1232.34,1153.06 L1317.52,1153.06"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1464.11,1172.50 L1483.74,1255.39"
          data-type="barricade"
          onClick={onClickHandler}
        />
        {/* windows end */}
        {/* doors start */}
        <path d="M2488.25,864.69 L2530.46,864.69" data-type="barricade" onClick={onClickHandler} />
        <path d="M2424.25,607.69 L2466.46,607.69" data-type="barricade" onClick={onClickHandler} />
        <path
          d="M2156.31,1329.25 L2156.31,1371.46"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1976.69,1272.22 L2075.68,1272.41"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path d="M2003.25,860.69 L2045.46,860.69" data-type="barricade" onClick={onClickHandler} />
        <path
          d="M1713.31,1334.25 L1713.31,1376.46"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1852.25,1272.69 L1894.46,1272.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path d="M1766.28,567.19 L1766.09,666.18" data-type="barricade" onClick={onClickHandler} />
        <path
          d="M1106.25,1153.69 L1148.46,1153.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1542.25,1444.69 L1584.46,1444.69"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1713.31,1476.25 L1713.31,1518.46"
          data-type="barricade"
          onClick={onClickHandler}
        />
        <path
          d="M1792.69,1444.22 L1891.68,1444.41"
          data-type="barricade"
          onClick={onClickHandler}
        />
        {/* doors end */}
        {/* reinforcements start */}
        <path
          d="M2571.39,874.21 L2570.84,971.73"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2438.79,864.39 L2360.77,863.84"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2129.39,914.21 L2128.84,983.97"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2129.39,995.21 L2128.84,1064.97"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2129.39,1181.21 L2128.84,1250.97"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2129.39,1099.21 L2128.84,1168.97"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1923.39,914.21 L1922.84,983.97"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1923.39,995.21 L1922.84,1064.97"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1923.39,1181.21 L1922.84,1250.97"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1923.39,1099.21 L1922.84,1168.97"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1461.39,1054.79 L1460.84,1143.73"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1461.39,953.79 L1460.84,1042.73"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1565.79,1272.39 L1496.03,1271.84"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M1647.79,1272.39 L1578.03,1271.84"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        <path
          d="M2036.65,1444.39 L1943.03,1443.84"
          data-type="reinforcement"
          onClick={onClickHandler}
        />
        {/* reinforcements end */}
      </g>
    </svg>
  );
}
