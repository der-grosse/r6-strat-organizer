type ImageFormat = "png" | "jpg";

interface ToImgOptions {
  scale?: number;
  format?: ImageFormat;
  quality?: number;
  download?: boolean;
  ignore?: string | null;
  cssinline?: 0 | 1;
  background?: string | null;
}

/** Convert a URL to an inline base64 data URL. */
async function fetchAsDataURL(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Replace all external image sources inside `svg` with inline base64 data URLs
 * so they survive XML serialization. Returns a restore function.
 */
async function inlineImages(svg: SVGSVGElement): Promise<() => void> {
  const restoreFns: (() => void)[] = [];

  // SVG <image> elements (map backgrounds)
  const svgImages = svg.querySelectorAll("image[href]");
  await Promise.all(
    Array.from(svgImages).map(async (img) => {
      const href = img.getAttribute("href");
      if (!href || href.startsWith("data:")) return;
      try {
        const dataUrl = await fetchAsDataURL(href);
        img.setAttribute("href", dataUrl);
        restoreFns.push(() => img.setAttribute("href", href));
      } catch {
        // skip images that fail to load
      }
    }),
  );

  // HTML <img> elements inside foreignObject (operator icons, gadgets, etc.)
  const htmlImages = svg.querySelectorAll("foreignObject img");
  await Promise.all(
    Array.from(htmlImages).map(async (el) => {
      const img = el as HTMLImageElement;
      const src = img.getAttribute("src");
      if (!src || src.startsWith("data:")) return;
      try {
        const dataUrl = await fetchAsDataURL(src);
        img.setAttribute("src", dataUrl);
        restoreFns.push(() => img.setAttribute("src", src));
      } catch {
        // skip images that fail to load
      }
    }),
  );

  return () => restoreFns.forEach((fn) => fn());
}

/** Recursively inline computed styles from `source` onto `target`. */
function inlineStyles(source: Element, target: Element): void {
  const computed = window.getComputedStyle(source);
  const targetEl = target as HTMLElement | SVGElement;
  for (const key of computed) {
    targetEl.style.setProperty(key, computed.getPropertyValue(key));
  }

  for (let i = 0; i < source.children.length; i++) {
    inlineStyles(source.children[i], target.children[i]);
  }
}

/**
 * Serialize `target` SVG to a canvas and return a data URL.
 * `scale` is a resolution multiplier applied to the source's display size.
 */
function copyToCanvas(
  source: SVGSVGElement,
  target: SVGSVGElement,
  scale: number,
  format: ImageFormat,
  quality: number,
): Promise<string> {
  const svgData = new XMLSerializer().serializeToString(target);
  const svgSize = source.getBoundingClientRect();

  const canvas = document.createElement("canvas");
  canvas.width = svgSize.width * scale;
  canvas.height = svgSize.height * scale;

  const ctx = canvas.getContext("2d")!;
  // ctx.scale(scale, scale);

  const img = document.createElement("img");
  img.setAttribute(
    "src",
    "data:image/svg+xml;base64," +
      btoa(
        new TextEncoder()
          .encode(svgData)
          .reduce((acc, byte) => acc + String.fromCharCode(byte), ""),
      ),
  );

  return new Promise((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL(`image/${format === "jpg" ? "jpeg" : format}`, quality));
    };
  });
}

function downloadImage(file: string, name: string, format: ImageFormat): void {
  const a = document.createElement("a");
  a.download = `${name}.${format}`;
  a.href = file;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function svgToImg(
  selector: string | Element,
  name: string,
  {
    scale = 1,
    format = "png",
    quality = 0.92,
    download = true,
    ignore = null,
    cssinline = 1,
    background = null,
  }: ToImgOptions = {},
): Promise<string> {
  const source = (
    selector instanceof Element ? selector : document.querySelector(selector)
  ) as SVGSVGElement;

  // Inline external images on the source before cloning so the base64
  // data URLs are carried over into the serialized copy.
  const restoreImages = await inlineImages(source);

  try {
    // Clone into a detached SVG so we don't mutate the live DOM with
    // inlined styles / removed elements.
    const target = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    target.innerHTML = source.innerHTML;
    for (const attr of source.attributes) {
      target.setAttribute(attr.name, attr.value);
    }

    if (cssinline === 1) {
      inlineStyles(source, target);
    }

    if (background) {
      target.style.background = background;
    }

    if (ignore != null) {
      target.querySelectorAll(ignore).forEach((el) => el.parentNode?.removeChild(el));
    }

    // Use the SVG viewBox to derive the output resolution so the image
    // matches the logical canvas size, not the on-screen pixel size.
    const viewBox = source.viewBox.baseVal;
    const svgSize = source.getBoundingClientRect();
    const resolutionScale = viewBox.width > 0 ? (viewBox.width / svgSize.width) * scale : scale;

    const file = await copyToCanvas(source, target, resolutionScale, format, quality);

    if (download) {
      downloadImage(file, name, format);
    }
    return file;
  } finally {
    restoreImages();
  }
}
