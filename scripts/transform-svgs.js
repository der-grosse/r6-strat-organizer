#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Converts RGB color to hex format
 * @param {string} rgbColor - Color in format "rgb(r, g, b)" or "rgb(r,g,b)"
 * @returns {string} Hex color format "#RRGGBB"
 */
function rgbToHex(rgbColor) {
  const match = rgbColor.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (!match) return rgbColor;

  const [, r, g, b] = match;
  const toHex = (n) => parseInt(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Parses a transform attribute to extract translate values
 * @param {string} transform - Transform attribute value
 * @returns {{x: number, y: number} | null} Translate coordinates or null
 */
function parseTranslate(transform) {
  if (!transform) return null;
  const match = transform.match(/translate\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/);
  if (match) {
    return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
  }
  return null;
}

/**
 * Applies translate offset to path coordinates
 * @param {string} pathData - SVG path data string
 * @param {number} offsetX - X offset to apply
 * @param {number} offsetY - Y offset to apply
 * @returns {string} Modified path data
 */
function applyTranslateToPath(pathData, offsetX, offsetY) {
  return pathData.replace(/([MLHVCSQTAZ])([-\d.]+)/gi, (match, command, value) => {
    // Only apply to coordinate pairs (handle M, L, C, S, Q, T commands)
    if (["M", "L", "C", "S", "Q", "T"].includes(command.toUpperCase())) {
      // This is a simplified version - a full implementation would need more sophisticated parsing
      return match;
    }
    return match;
  });
}

/**
 * Applies translate offset to SVG path coordinates (handles x,y pairs)
 * @param {string} pathData - SVG path data string
 * @param {number} offsetX - X offset to apply
 * @param {number} offsetY - Y offset to apply
 * @returns {string} Modified path data
 */
function applyTranslateToCoordinates(pathData, offsetX, offsetY) {
  // Match coordinate pairs in format "number,number"
  return pathData.replace(/([\d.]+),([\d.]+)/g, (match, x, y) => {
    const newX = (parseFloat(x) + offsetX).toFixed(2);
    const newY = (parseFloat(y) + offsetY).toFixed(2);
    return `${parseFloat(newX)},${parseFloat(newY)}`;
  });
}

/**
 * Cleans and formats numeric values
 * @param {string} value - Numeric value (possibly with decimals)
 * @returns {string} Cleaned numeric value
 */
function cleanNumber(value) {
  const num = parseFloat(value);
  // Remove unnecessary decimals
  if (Number.isInteger(num)) {
    return num.toString();
  }
  // Keep meaningful decimals (max 2)
  return parseFloat(num.toFixed(2)).toString();
}

/**
 * Capitalizes the first character in a string.
 * @param {string} value
 * @returns {string}
 */
function capitalize(value) {
  if (!value) return value;
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

/**
 * Parses attributes from a self-closing SVG element.
 * @param {string} element - SVG element string
 * @returns {{tagName: string | null, attributes: Record<string, string>}}
 */
function parseSvgElement(element) {
  const tagMatch = element.match(/^<(\w+)/);
  const attributes = {};

  for (const match of element.matchAll(/([:\w-]+)="([^"]*)"/g)) {
    attributes[match[1]] = match[2];
  }

  return {
    tagName: tagMatch ? tagMatch[1] : null,
    attributes,
  };
}

/**
 * Converts a parsed SVG element into JSX with only geometry attributes.
 * @param {{element: string, isRect: boolean}} svgElement - Parsed SVG element
 * @param {string} dataType - Semantic map element type
 * @returns {string | null} JSX element string
 */
function toInteractiveJsx(svgElement, dataType) {
  const { tagName, attributes } = parseSvgElement(svgElement.element);
  if (!tagName) return null;

  const allowedAttributes = tagName === "rect" ? ["x", "y", "width", "height", "rx", "ry"] : ["d"];

  const geometryAttributes = allowedAttributes
    .filter((name) => attributes[name] !== undefined)
    .map((name) => `          ${name}="${attributes[name]}"`);

  if (geometryAttributes.length === 0) {
    return null;
  }

  return [
    `        <${tagName}`,
    ...geometryAttributes,
    ...(tagName === "rect" ? ['          fill="transparent"'] : []),
    `          data-type="${dataType}"`,
    "          onClick={onClickHandler}",
    "        />",
  ].join("\n");
}

/**
 * Returns true when two rectangles overlap or are close enough to belong to the same hatch cluster.
 * @param {{x: number, y: number, width: number, height: number}} left
 * @param {{x: number, y: number, width: number, height: number}} right
 * @param {number} gap
 * @returns {boolean}
 */
function rectanglesAreConnected(left, right, gap = 20) {
  const leftRight = left.x + left.width;
  const rightRight = right.x + right.width;
  const leftBottom = left.y + left.height;
  const rightBottom = right.y + right.height;

  return !(
    leftRight + gap < right.x ||
    rightRight + gap < left.x ||
    leftBottom + gap < right.y ||
    rightBottom + gap < left.y
  );
}

/**
 * Merges rectangles that belong to the same hatch cluster.
 * @param {Array<{x: number, y: number, width: number, height: number}>} rectangles
 * @returns {Array<{x: number, y: number, width: number, height: number}>}
 */
function mergeConnectedRectangles(rectangles) {
  const remaining = [...rectangles];
  const merged = [];

  while (remaining.length > 0) {
    const cluster = [remaining.pop()];
    let changed = true;

    while (changed) {
      changed = false;

      for (let index = remaining.length - 1; index >= 0; index -= 1) {
        const candidate = remaining[index];
        if (cluster.some((item) => rectanglesAreConnected(item, candidate))) {
          cluster.push(candidate);
          remaining.splice(index, 1);
          changed = true;
        }
      }
    }

    const minX = Math.min(...cluster.map((item) => item.x));
    const minY = Math.min(...cluster.map((item) => item.y));
    const maxX = Math.max(...cluster.map((item) => item.x + item.width));
    const maxY = Math.max(...cluster.map((item) => item.y + item.height));

    merged.push({
      x: parseFloat(minX.toFixed(2)),
      y: parseFloat(minY.toFixed(2)),
      width: parseFloat((maxX - minX).toFixed(2)),
      height: parseFloat((maxY - minY).toFixed(2)),
    });
  }

  return merged;
}

/**
 * Consolidates path attributes to group level if they're identical
 * @param {string} svgContent - SVG content
 * @returns {string} SVG with consolidated attributes
 */
function consolidateAttributes(svgContent) {
  // Extract common stroke and fill attributes from paths and move to group
  const pathStrokeMatch = svgContent.match(/<path[^>]*stroke="([^"]+)"/);
  const pathFillMatch = svgContent.match(/<path[^>]*fill="([^"]+)"/);

  let content = svgContent;

  // Add stroke and fill to group if not already present
  if (pathStrokeMatch && !content.includes("<g fill=") && !content.includes("<g stroke=")) {
    content = content.replace(/<g([^>]*)>/, (match) => {
      let attrs = `stroke="${pathStrokeMatch[1]}"`;
      if (pathFillMatch) {
        attrs += ` fill="${pathFillMatch[1]}"`;
      }
      // Only add if not already there
      if (!match.includes("stroke=") && !match.includes("fill=")) {
        return match.replace(/^<g/, `<g ${attrs}`);
      }
      return match;
    });

    // Remove redundant stroke/fill from individual paths
    content = content.replace(/ stroke="[^"]+"/g, "");
    if (pathFillMatch) {
      content = content.replace(/ fill="[^"]+"/g, "");
    }
  }

  return content;
}

/**
 * Prettifies SVG content with proper indentation
 * @param {string} content - SVG content
 * @returns {string} Formatted SVG
 */
function prettifySVG(content) {
  let indent = 0;
  const indentStr = "  ";
  let result = [];

  // Split by tags and rebuild with proper indentation
  const tags = content.split(/(<[^>]+>)/);

  tags.forEach((tag) => {
    if (!tag.trim()) return;

    if (tag.startsWith("</")) {
      indent = Math.max(0, indent - 1);
      result.push(indentStr.repeat(indent) + tag);
    } else if (tag.startsWith("<") && !tag.endsWith("/>")) {
      if (!tag.includes("?")) {
        // Skip XML declaration
        result.push(indentStr.repeat(indent) + tag);
        if (!tag.startsWith("<!")) {
          indent++;
        }
      } else {
        result.push(tag);
      }
    } else if (tag.startsWith("<") && tag.endsWith("/>")) {
      result.push(indentStr.repeat(indent) + tag);
    } else if (tag.trim()) {
      // Text content
      const text = tag.trim();
      if (text.length > 0) {
        result.push(indentStr.repeat(indent) + text);
      }
    }
  });

  return result.join("\n");
}

/**
 * Transforms a raw SVG file to the finished format
 * @param {string} inputPath - Path to input SVG
 * @param {string} outputPath - Path to output SVG
 */
function transformSVG(inputPath, outputPath) {
  try {
    let content = fs.readFileSync(inputPath, "utf8");

    // 1. Remove XML declaration and DOCTYPE
    content = content.replace(/<\?xml[^?]*\?>\n?/g, "").replace(/<!DOCTYPE[^>]*>\n?/g, "");

    // 2. Remove xlink namespace if unused
    content = content.replace(/ xmlns:xlink="[^"]*"/g, "");

    // 3. Handle transform attributes - bake into coordinates
    const groupTransformMatch = content.match(/<g([^>]*?)transform="([^"]*)"([^>]*)>/);
    if (groupTransformMatch) {
      const translate = parseTranslate(groupTransformMatch[2]);
      if (translate) {
        // Apply translate to all path coordinates
        content = content.replace(/d="([^"]*)"/g, (match, pathData) => {
          const modified = applyTranslateToCoordinates(pathData, translate.x, translate.y);
          return `d="${modified}"`;
        });

        // Remove transform attribute from group
        content = content.replace(/(<g[^>]*)transform="[^"]*"([^>]*>)/, "$1$2");
      }
    }

    // 4. Convert RGB colors to hex
    content = content.replace(/rgb\([^)]+\)/g, rgbToHex);

    // 5. Clean up numeric values - remove unnecessary .00
    content = content.replace(/(\d+)\.00(?!\d)/g, "$1");

    // 6. Clean up viewBox format
    content = content.replace(
      /viewBox="([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)"/g,
      (match, x, y, w, h) => {
        return `viewBox="${cleanNumber(x)} ${cleanNumber(y)} ${cleanNumber(w)} ${cleanNumber(h)}"`;
      },
    );

    // 7. Consolidate common attributes to group level
    content = consolidateAttributes(content);

    // 8. Clean up whitespace
    content = content.trim() + "\n";

    // 9. Write output
    fs.writeFileSync(outputPath, content, "utf8");

    return true;
  } catch (error) {
    console.error(`Error transforming ${path.basename(inputPath)}: ${error.message}`);
    return false;
  }
}

/**
 * Converts file name from raw format to finished format
 * @param {string} filename - Original filename
 * @returns {string} Converted filename
 */
function convertFilename(filename) {
  // "MAP 1F Doors.svg" -> "1f-doors.svg"
  // "MAP 2F Hatches.svg" -> "2f-hatches.svg"
  // "MAP B Walls.svg" -> "b-walls.svg"
  const floor = ["1F", "2F", "3F", "B"].find((f) => filename.includes(f))?.toLowerCase();
  const type = ["doors", "hatches", "walls", "windows"].find((t) =>
    filename.toLocaleLowerCase().includes(t),
  );
  if (floor && type) {
    return `${floor}-${type}.svg`;
  }
  return filename;
}

/**
 * Generates hatches-bounding SVG from hatches SVG
 * @param {string} hatchesSvgPath - Path to the hatches SVG file
 * @param {string} outputPath - Path for the bounding SVG output
 */
function generateHatchesBounding(hatchesSvgPath, outputPath) {
  try {
    const content = fs.readFileSync(hatchesSvgPath, "utf8");

    // Extract SVG header info (viewBox, width, height)
    const svgMatch = content.match(/<svg([^>]*)>/);
    if (!svgMatch) return false;

    const viewBoxMatch = content.match(/viewBox="([^"]*)"/);
    const widthMatch = content.match(/width="([^"]*)"/);
    const heightMatch = content.match(/height="([^"]*)"/);

    const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 3332 2499";
    const width = widthMatch ? widthMatch[1] : "799.68";
    const height = heightMatch ? heightMatch[1] : "599.76";

    const rectangles = [];
    const pathMatches = content.match(/<path[^>]*d="[^"]*"[^>]*\/>/g) || [];
    const rectMatches = content.match(/<rect[^>]*\/>/g) || [];

    pathMatches.forEach((pathElement) => {
      const dMatch = pathElement.match(/d="([^"]*)"/);
      if (!dMatch) return;

      const coords = [];
      const coordMatches = dMatch[1].match(/([\d.]+),([\d.]+)/g) || [];
      coordMatches.forEach((coord) => {
        const [x, y] = coord.split(",").map(Number);
        coords.push({ x, y });
      });

      if (coords.length === 0) return;

      const minX = Math.min(...coords.map((item) => item.x));
      const minY = Math.min(...coords.map((item) => item.y));
      const maxX = Math.max(...coords.map((item) => item.x));
      const maxY = Math.max(...coords.map((item) => item.y));
      const padding = 5;

      rectangles.push({
        x: minX - padding,
        y: minY - padding,
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2,
      });
    });

    rectMatches.forEach((rectElement) => {
      const { attributes } = parseSvgElement(rectElement);
      if (
        attributes.x === undefined ||
        attributes.y === undefined ||
        attributes.width === undefined ||
        attributes.height === undefined
      ) {
        return;
      }

      rectangles.push({
        x: parseFloat(attributes.x),
        y: parseFloat(attributes.y),
        width: parseFloat(attributes.width),
        height: parseFloat(attributes.height),
      });
    });

    if (rectangles.length === 0) return false;

    const mergedRectangles = mergeConnectedRectangles(rectangles);

    // Build new SVG with rectangles
    let boundingSvg = `<svg width="${width}" height="${height}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">\n`;

    mergedRectangles.forEach((rect) => {
      boundingSvg += `  <rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" fill="transparent" stroke="none" />\n`;
    });

    boundingSvg += "</svg>\n";

    fs.writeFileSync(outputPath, boundingSvg, "utf8");
    return true;
  } catch (error) {
    console.error(
      `Error generating hatches-bounding from ${path.basename(hatchesSvgPath)}: ${error.message}`,
    );
    return false;
  }
}

/**
 * Extracts path elements from SVG content
 * @param {string} svgContent - SVG content
 * @returns {Array} Array of {element: string, type: string}
 */
function extractSVGElements(svgContent) {
  const elements = [];

  // Extract paths
  const pathMatches = svgContent.match(/<path[^>]*d="[^"]*"[^>]*\/>/g) || [];
  pathMatches.forEach((pathElement) => {
    elements.push({
      element: pathElement.trim(),
      isRect: false,
    });
  });

  // Extract rects
  const rectMatches = svgContent.match(/<rect[^>]*\/>/g) || [];
  rectMatches.forEach((rectElement) => {
    elements.push({
      element: rectElement.trim(),
      isRect: true,
    });
  });

  return elements;
}

/**
 * Generates a TSX component file from SVG layers
 * @param {string} floor - Floor identifier (e.g., "1f", "2f", "b")
 * @param {Object} svgLayers - Object with SVG content by type {doors, hatches, reinforcements, windows}
 * @param {string} floorName - Display name (e.g., "Clubhouse1F")
 * @param {string} outputPath - Path to write TSX file
 */
function generateTSXComponent(floor, svgLayers, floorName, outputPath) {
  try {
    // Extract SVG metadata from doors file (use as base)
    const doorsContent = svgLayers.doors || "";
    const viewBoxMatch = doorsContent.match(/viewBox="([^"]*)"/);
    const widthMatch = doorsContent.match(/width="([^"]*)"/);
    const heightMatch = doorsContent.match(/height="([^"]*)"/);

    const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 3332 2499";
    const width = widthMatch ? widthMatch[1] : "799.68";
    const height = heightMatch ? heightMatch[1] : "599.76";

    // Extract elements by type
    const elements = {
      windows: [],
      doors: [],
      reinforcements: [],
      hatches: [],
    };

    // Process each layer
    if (svgLayers.windows) {
      elements.windows = extractSVGElements(svgLayers.windows);
    }
    if (svgLayers.doors) {
      elements.doors = extractSVGElements(svgLayers.doors);
    }
    if (svgLayers.reinforcements || svgLayers.walls) {
      elements.reinforcements = extractSVGElements(svgLayers.reinforcements || svgLayers.walls);
    }
    if (svgLayers.hatches) {
      elements.hatches = extractSVGElements(svgLayers.hatches);
    }

    // Generate TSX content
    let tsx = `import { cn } from "@/lib/utils";
import FloorClickableClickHandler from "../clickHandler";

export default function ${floorName}(props: MapFloorClickableProps) {
  const onClickHandler = FloorClickableClickHandler(props.onClick);
  return (
    <svg
      width="${width}"
      height="${height}"
      viewBox="${viewBox}"
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
      >`;

    // Add windows section
    if (elements.windows.length > 0) {
      tsx += `\n        {/* windows start */}\n`;
      elements.windows.forEach((el) => {
        const jsxElement = toInteractiveJsx(el, "barricade");
        if (jsxElement) {
          tsx += `${jsxElement}\n`;
        }
      });
      tsx += `        {/* windows end */}\n`;
    } else {
      tsx += `\n        {/* windows start */}
        {/* no windows */}
        {/* windows end */}\n`;
    }

    // Add doors section
    if (elements.doors.length > 0) {
      tsx += `        {/* doors start */}\n`;
      elements.doors.forEach((el) => {
        const jsxElement = toInteractiveJsx(el, "barricade");
        if (jsxElement) {
          tsx += `${jsxElement}\n`;
        }
      });
      tsx += `        {/* doors end */}\n`;
    } else {
      tsx += `        {/* doors start */}\n        {/* no doors */}\n        {/* doors end */}\n`;
    }

    // Add reinforcements section
    if (elements.reinforcements.length > 0) {
      tsx += `        {/* reinforcements start */}\n`;
      elements.reinforcements.forEach((el) => {
        const jsxElement = toInteractiveJsx(el, "reinforcement");
        if (jsxElement) {
          tsx += `${jsxElement}\n`;
        }
      });
      tsx += `        {/* reinforcements end */}\n`;
    } else {
      tsx += `        {/* reinforcements start */}\n        {/* no reinforcements */}\n        {/* reinforcements end */}\n`;
    }

    // Add hatches section
    if (elements.hatches.length > 0) {
      tsx += `        {/* hatches start */}\n`;
      elements.hatches.forEach((el) => {
        const jsxElement = toInteractiveJsx(el, "hatch");
        if (jsxElement) {
          tsx += `${jsxElement}\n`;
        }
      });
      tsx += `        {/* hatches end */}\n`;
    } else {
      tsx += `        {/* hatches start */}\n        {/* no hatches */}\n        {/* hatches end */}\n`;
    }

    tsx += `      </g>
    </svg>
  );
}
`;

    fs.writeFileSync(outputPath, tsx, "utf8");
    return true;
  } catch (error) {
    console.error(`Error generating TSX component for ${floor}: ${error.message}`);
    return false;
  }
}

/**
 * Main function to process all SVG files
 */
function processAllSVGs() {
  const inputDir = path.join(__dirname, `../public/map_blueprints/${map}`);
  const outputDir = path.join(__dirname, `../public/map_blueprints/${map}`);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get all SVG files from ${map} directory
  const allSvgFiles = fs
    .readdirSync(inputDir)
    .filter((f) => f.endsWith(".svg") && !f.includes("-bounding"))
    .sort();

  const rawFiles = allSvgFiles.filter((file) => /\s/.test(file));
  const files = (rawFiles.length > 0 ? rawFiles : allSvgFiles).sort();

  console.log(`\n🔄 Processing ${files.length} SVG files from ${map} folder...\n`);

  let successCount = 0;
  let errorCount = 0;
  const boundingFilesToCreate = [];

  files.forEach((filename) => {
    const inputPath = path.join(inputDir, filename);
    const newFilename = convertFilename(filename);
    const outputPath = path.join(outputDir, newFilename);

    process.stdout.write(`  ${filename.padEnd(30)} → ${newFilename.padEnd(30)} `);

    if (transformSVG(inputPath, outputPath)) {
      console.log("✅");
      successCount++;

      // Track hatches files for bounding box generation
      if (/hatches/i.test(filename) && !/bounding/i.test(filename)) {
        boundingFilesToCreate.push({
          hatches: outputPath,
          bounding: outputPath.replace(/\.svg$/, "-bounding.svg"),
        });
      }
    } else {
      console.log("❌");
      errorCount++;
    }
  });

  // Generate hatches-bounding overlays
  if (boundingFilesToCreate.length > 0) {
    console.log(`\n🎨 Generating hatches-bounding overlays...\n`);

    boundingFilesToCreate.forEach(({ hatches, bounding }) => {
      const filename = path.basename(hatches);
      process.stdout.write(`  ${filename.padEnd(30)} → ${path.basename(bounding).padEnd(30)} `);

      if (generateHatchesBounding(hatches, bounding)) {
        console.log("✅");
      } else {
        console.log("❌");
      }
    });
  }

  // Generate TSX component files
  console.log(`\n🎨 Generating TSX components...\n`);

  const componentDir = path.join(__dirname, `../components/StratEditor/maps/${map}`);
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }

  // Group SVG files by floor
  const floorMap = {};
  fs.readdirSync(outputDir)
    .filter((f) => f.endsWith(".svg"))
    .forEach((file) => {
      // Use hatches-bounding for hatches layer (for rectangles)
      if (file.includes("hatches-bounding")) {
        const match = file.match(/^([1b2][fb]?)-hatches-bounding\.svg$/);
        if (match) {
          const floor = match[1];
          if (!floorMap[floor]) floorMap[floor] = {};
          floorMap[floor].hatches = path.join(outputDir, file);
        }
      } else if (!file.includes("hatches")) {
        // Regular layer files (doors, windows, reinforcements, walls)
        const match = file.match(/^([1b2][fb]?)-(\w+)\.svg$/);
        if (match) {
          const [, floor, type] = match;
          if (!floorMap[floor]) floorMap[floor] = {};
          floorMap[floor][type] = path.join(outputDir, file);
        }
      }
    });

  // Generate TSX for each floor
  Object.entries(floorMap).forEach(([floor, layers]) => {
    const svgLayers = {};

    // Read SVG content for each layer
    ["doors", "hatches", "windows", "reinforcements", "walls"].forEach((type) => {
      if (layers[type]) {
        try {
          svgLayers[type] = fs.readFileSync(layers[type], "utf8");
        } catch (e) {
          // Layer not available
        }
      }
    });

    // Generate component name
    const mapName = capitalize(map);
    const floorName = {
      "1f": `${mapName}1F`,
      "2f": `${mapName}2F`,
      b: `${mapName}B`,
    }[floor];

    if (floorName) {
      const tsxPath = path.join(componentDir, `${floor}.tsx`);
      process.stdout.write(`  ${floorName} → ${floor}.tsx${" ".repeat(20)} `);

      if (generateTSXComponent(floor, svgLayers, floorName, tsxPath)) {
        console.log("✅");
      } else {
        console.log("❌");
      }
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`  ✅ Successfully processed: ${successCount}`);
  if (errorCount > 0) {
    console.log(`  ❌ Errors: ${errorCount}`);
  }
  console.log(`  📁 SVG output saved to: ${outputDir}`);
  console.log(`  📁 TSX output saved to: ${componentDir}\n`);
}

const map = "lair";

// Run the script
processAllSVGs();
