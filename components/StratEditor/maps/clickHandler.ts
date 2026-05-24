const MapFloorClickableHandler =
  (onClick: MapFloorClickableProps["onClick"], viewboxWidth = 3332) =>
  (e: React.MouseEvent<SVGPathElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const type = e.currentTarget.dataset.type as
      | "barricade"
      | "reinforcement"
      | "hatch";
    if (type !== "barricade" && type !== "reinforcement" && type !== "hatch") {
      console.error("Invalid type:", type);
      return;
    }

    if (type === "hatch") {
      const x = e.currentTarget.getAttribute("x");
      const y = e.currentTarget.getAttribute("y");
      const width = e.currentTarget.getAttribute("width");
      const height = e.currentTarget.getAttribute("height");
      if (!x || !y || !width || !height) {
        console.error("Missing attributes for hatch:", {
          x,
          y,
          width,
          height,
        });
        return;
      }
      const widthNum = parseFloat(width);
      const heightNum = parseFloat(height);
      const xNum = parseFloat(x);
      const yNum = parseFloat(y);
      const x2Num = xNum + widthNum;
      const y2Num = yNum + heightNum;

      const rel_width = widthNum / viewboxWidth;
      const rel_height = heightNum / viewboxWidth;
      const rotation = 0; // Hatches are not rotated
      const centerX = (xNum + x2Num) / 2;
      const centerY = (yNum + y2Num) / 2;
      onClick?.(
        "reinforcement-hatch",
        centerX / viewboxWidth,
        centerY / viewboxWidth,
        rel_width,
        rel_height,
        rotation,
      );
    } else {
      const d = e.currentTarget.getAttribute("d");
      const coords = d?.match(
        /M(\d+\.?\d*),(\d+\.?\d*) L(\d+\.?\d*),(\d+\.?\d*)/,
      );
      if (!coords || coords.length !== 5) {
        console.error("Invalid path data for", type, ":", d);
        return;
      }

      const [x, y, x2, y2] = coords.slice(1).map((n) => parseFloat(n));

      const rel_width = Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2));
      const rel_height = type === "barricade" ? 0.01 : (rel_width / 3) * 2;
      const rotationRaw = Math.atan2(y2 - y, x2 - x) * (180 / Math.PI);
      const rotation = (Math.round(rotationRaw / 5) * 5) % 180;
      const centerX = (x + x2) / 2;
      const centerY = (y + y2) / 2;

      onClick?.(
        type === "barricade" ? "barricade" : "reinforcement-wall",
        centerX / viewboxWidth,
        centerY / viewboxWidth,
        rel_width / viewboxWidth,
        rel_height / viewboxWidth,
        rotation,
      );
    }
  };

export default MapFloorClickableHandler;
