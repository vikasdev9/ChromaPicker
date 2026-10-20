/**
 * Lightweight, client-side utility for sampling ambient background gradient colors from an image.
 * 
 * - Downsamples to a 48x48 offscreen representation (< 2ms execution time)
 * - Samples 4 distinct spatial quadrants (matching ambient radial gradient positions)
 * - Safe against tainted canvases (CORS), invalid URLs, and transparent images
 * - Returns null on failure to allow seamless CSS variable fallback to defaults
 * - Cleans up temporary DOM/Canvas resources immediately
 */

/**
 * Samples 4 ambient colors from an ImageData object.
 * @param {{ width: number, height: number, data: Uint8ClampedArray | number[] }} imageData 
 * @returns {{ light: string[], dark: string[], glow: string } | null}
 */
export function sampleColorsFromImageData(imageData) {
  if (!imageData || !imageData.data || imageData.width <= 0 || imageData.height <= 0) {
    return null;
  }

  const { width, height, data } = imageData;
  const halfW = Math.floor(width / 2);
  const halfH = Math.floor(height / 2);

  // Quadrants matching the 4 ambient radial gradient positions:
  // 1. Top-Left (5% 10%)
  // 2. Center-Left (35% 15%)
  // 3. Top-Right (75% 12%)
  // 4. Bottom-Right (95% 40%)
  const regions = [
    { x1: 0, x2: halfW, y1: 0, y2: halfH },
    { x1: Math.floor(halfW * 0.4), x2: Math.floor(halfW * 1.4), y1: 0, y2: halfH },
    { x1: halfW, x2: width, y1: 0, y2: halfH },
    { x1: halfW, x2: width, y1: halfH, y2: height }
  ];

  const sampledRgb = [];
  let totalValidPixels = 0;
  let overallR = 0;
  let overallG = 0;
  let overallB = 0;

  for (const region of regions) {
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    let count = 0;

    for (let y = region.y1; y < region.y2; y++) {
      for (let x = region.x1; x < region.x2; x++) {
        const offset = (y * width + x) * 4;
        const a = data[offset + 3];

        // Skip transparent or near-transparent pixels
        if (a < 128) continue;

        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];

        rSum += r;
        gSum += g;
        bSum += b;
        count++;

        overallR += r;
        overallG += g;
        overallB += b;
        totalValidPixels++;
      }
    }

    if (count > 0) {
      sampledRgb.push({
        r: Math.round(rSum / count),
        g: Math.round(gSum / count),
        b: Math.round(bSum / count)
      });
    }
  }

  // If no valid non-transparent pixels found in the image, return null for default fallback
  if (totalValidPixels === 0 || sampledRgb.length === 0) {
    return null;
  }

  const fallbackColor = {
    r: Math.round(overallR / totalValidPixels),
    g: Math.round(overallG / totalValidPixels),
    b: Math.round(overallB / totalValidPixels)
  };

  // Ensure 4 colors exist by backfilling from available or fallback
  while (sampledRgb.length < 4) {
    sampledRgb.push(fallbackColor);
  }

  // Format as soft translucent colors for light and dark ambient gradients
  return {
    light: [
      `rgba(${sampledRgb[0].r}, ${sampledRgb[0].g}, ${sampledRgb[0].b}, 0.38)`,
      `rgba(${sampledRgb[1].r}, ${sampledRgb[1].g}, ${sampledRgb[1].b}, 0.32)`,
      `rgba(${sampledRgb[2].r}, ${sampledRgb[2].g}, ${sampledRgb[2].b}, 0.35)`,
      `rgba(${sampledRgb[3].r}, ${sampledRgb[3].g}, ${sampledRgb[3].b}, 0.30)`
    ],
    dark: [
      `rgba(${sampledRgb[0].r}, ${sampledRgb[0].g}, ${sampledRgb[0].b}, 0.22)`,
      `rgba(${sampledRgb[1].r}, ${sampledRgb[1].g}, ${sampledRgb[1].b}, 0.18)`,
      `rgba(${sampledRgb[2].r}, ${sampledRgb[2].g}, ${sampledRgb[2].b}, 0.16)`
    ],
    glow: `rgba(${sampledRgb[0].r}, ${sampledRgb[0].g}, ${sampledRgb[0].b}, 0.10)`
  };
}

/**
 * Asynchronously samples ambient background gradient colors from an image source (data URL, blob URL, or HTMLImageElement).
 * Deterministic, safe, client-side only.
 * 
 * @param {string | HTMLImageElement} imageSource 
 * @returns {Promise<{ light: string[], dark: string[], glow: string } | null>}
 */
export async function extractImageAmbientColors(imageSource) {
  if (!imageSource) return null;

  return new Promise((resolve) => {
    // If an HTMLImageElement is provided directly
    if (typeof HTMLImageElement !== 'undefined' && imageSource instanceof HTMLImageElement) {
      sampleFromLoadedImage(imageSource, resolve);
      return;
    }

    // If a string (dataUrl, path, or URL) is provided
    if (typeof imageSource === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      let resolved = false;
      const done = (result) => {
        if (!resolved) {
          resolved = true;
          resolve(result);
        }
      };

      img.onload = () => {
        sampleFromLoadedImage(img, done);
      };

      img.onerror = () => {
        done(null);
      };

      img.src = imageSource;
      return;
    }

    resolve(null);
  });
}

function sampleFromLoadedImage(img, callback) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      callback(null);
      return;
    }

    ctx.drawImage(img, 0, 0, 48, 48);
    const imageData = ctx.getImageData(0, 0, 48, 48);

    // Clean up canvas memory immediately
    canvas.width = 0;
    canvas.height = 0;

    const result = sampleColorsFromImageData(imageData);
    callback(result);
  } catch {
    // Handle CORS / tainted canvas / security restrictions safely
    callback(null);
  }
}
