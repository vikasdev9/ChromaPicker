/**
 * Advanced Color Quantization Engine for Chromapick
 * Implements Modified Median Cut Quantization (MMCQ) with frequency tracking,
 * intelligent pixel filtering, and real dominant percentage distribution.
 */

import { rgbToHex, rgbToHsl, getDeltaE } from './colorMath';

class ColorBox {
  constructor(r1, r2, g1, g2, b1, b2, histo) {
    this.r1 = r1;
    this.r2 = r2;
    this.g1 = g1;
    this.g2 = g2;
    this.b1 = b1;
    this.b2 = b2;
    this.histo = histo;
    this._count = null;
    this._avg = null;
  }

  volume() {
    return (this.r2 - this.r1 + 1) * (this.g2 - this.g1 + 1) * (this.b2 - this.b1 + 1);
  }

  count() {
    if (this._count !== null) return this._count;
    let total = 0;
    for (let r = this.r1; r <= this.r2; r++) {
      for (let g = this.g1; g <= this.g2; g++) {
        for (let b = this.b1; b <= this.b2; b++) {
          const index = (r << 10) | (g << 5) | b;
          total += this.histo[index] || 0;
        }
      }
    }
    this._count = total;
    return this._count;
  }

  avg() {
    if (this._avg !== null) return this._avg;
    let ntot = 0;
    let rsum = 0;
    let gsum = 0;
    let bsum = 0;

    for (let r = this.r1; r <= this.r2; r++) {
      for (let g = this.g1; g <= this.g2; g++) {
        for (let b = this.b1; b <= this.b2; b++) {
          const index = (r << 10) | (g << 5) | b;
          const hval = this.histo[index] || 0;
          if (hval > 0) {
            ntot += hval;
            rsum += hval * (r + 0.5) * 8;
            gsum += hval * (g + 0.5) * 8;
            bsum += hval * (b + 0.5) * 8;
          }
        }
      }
    }

    if (ntot > 0) {
      this._avg = {
        r: Math.min(255, Math.round(rsum / ntot)),
        g: Math.min(255, Math.round(gsum / ntot)),
        b: Math.min(255, Math.round(bsum / ntot)),
        count: ntot
      };
    } else {
      this._avg = {
        r: Math.min(255, Math.round(8 * (this.r1 + this.r2 + 1) / 2)),
        g: Math.min(255, Math.round(8 * (this.g1 + this.g2 + 1) / 2)),
        b: Math.min(255, Math.round(8 * (this.b1 + this.b2 + 1) / 2)),
        count: 0
      };
    }
    return this._avg;
  }
}

/**
 * Splits a ColorBox along its longest dimension using median cut
 */
function medianCutSplit(box, histo) {
  const rw = box.r2 - box.r1;
  const gw = box.g2 - box.g1;
  const bw = box.b2 - box.b1;
  const maxw = Math.max(rw, gw, bw);

  if (maxw === 0) return [box];

  // Determine split dimension
  const axis = maxw === rw ? 'r' : maxw === gw ? 'g' : 'b';

  // Compute partial sums along axis
  let total = box.count();
  if (total <= 1) return [box];

  let sum = 0;
  let splitPoint = -1;

  if (axis === 'r') {
    for (let r = box.r1; r <= box.r2; r++) {
      let rsum = 0;
      for (let g = box.g1; g <= box.g2; g++) {
        for (let b = box.b1; b <= box.b2; b++) {
          const index = (r << 10) | (g << 5) | b;
          rsum += histo[index] || 0;
        }
      }
      sum += rsum;
      if (sum >= total / 2) {
        splitPoint = r;
        break;
      }
    }
    if (splitPoint <= box.r1) splitPoint = box.r1 + 1;
    if (splitPoint > box.r2) splitPoint = box.r2;
    const b1 = new ColorBox(box.r1, splitPoint - 1, box.g1, box.g2, box.b1, box.b2, histo);
    const b2 = new ColorBox(splitPoint, box.r2, box.g1, box.g2, box.b1, box.b2, histo);
    return [b1, b2];
  } else if (axis === 'g') {
    for (let g = box.g1; g <= box.g2; g++) {
      let gsum = 0;
      for (let r = box.r1; r <= box.r2; r++) {
        for (let b = box.b1; b <= box.b2; b++) {
          const index = (r << 10) | (g << 5) | b;
          gsum += histo[index] || 0;
        }
      }
      sum += gsum;
      if (sum >= total / 2) {
        splitPoint = g;
        break;
      }
    }
    if (splitPoint <= box.g1) splitPoint = box.g1 + 1;
    if (splitPoint > box.g2) splitPoint = box.g2;
    const b1 = new ColorBox(box.r1, box.r2, box.g1, splitPoint - 1, box.b1, box.b2, histo);
    const b2 = new ColorBox(box.r1, box.r2, splitPoint, box.g2, box.b1, box.b2, histo);
    return [b1, b2];
  } else {
    for (let b = box.b1; b <= box.b2; b++) {
      let bsum = 0;
      for (let r = box.r1; r <= box.r2; r++) {
        for (let g = box.g1; g <= box.g2; g++) {
          const index = (r << 10) | (g << 5) | b;
          bsum += histo[index] || 0;
        }
      }
      sum += bsum;
      if (sum >= total / 2) {
        splitPoint = b;
        break;
      }
    }
    if (splitPoint <= box.b1) splitPoint = box.b1 + 1;
    if (splitPoint > box.b2) splitPoint = box.b2;
    const b1 = new ColorBox(box.r1, box.r2, box.g1, box.g2, box.b1, splitPoint - 1, histo);
    const b2 = new ColorBox(box.r1, box.r2, box.g1, box.g2, splitPoint, box.b2, histo);
    return [b1, b2];
  }
}

/**
 * Extracts dominant colors from raw ImageData with customizable options
 */
export function extractDominantColors(imageData, options = {}) {
  const {
    colorCount = 8,
    ignoreTransparent = true,
    ignoreNearWhite = false,
    ignoreNearBlack = false,
    minSaturation = 0, // 0 - 100
    excludeSimilar = true,
    uniqueColorsMode = true,
    minDeltaE = 12,
    sortBy = 'frequency', // 'frequency' | 'hue' | 'brightness' | 'saturation'
    toneFilter = 'all', // 'all' | 'vibrant' | 'dark' | 'light' | 'warm' | 'cool'
    generationMode = 'dominant' // 'dominant' | 'vivid' | 'pastel' | 'balanced'
  } = options;

  const shouldExcludeSimilar = excludeSimilar !== undefined ? excludeSimilar : uniqueColorsMode;

  const data = imageData.data;
  const histo = new Uint32Array(32768); // 32x32x32 5-bit color bins
  const fallbackHisto = new Uint32Array(32768);

  let rmin = 31, rmax = 0;
  let gmin = 31, gmax = 0;
  let bmin = 31, bmax = 0;
  let validPixels = 0;
  let fallbackPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Filter transparent pixels
    if (ignoreTransparent && a < 128) continue;

    // Track fallback histogram in case tone filter is too aggressive
    const r5 = r >> 3;
    const g5 = g >> 3;
    const b5 = b >> 3;
    const idx = (r5 << 10) | (g5 << 5) | b5;
    fallbackHisto[idx]++;
    fallbackPixels++;

    // Filter near white
    if (ignoreNearWhite && r > 242 && g > 242 && b > 242) continue;

    // Filter near black
    if (ignoreNearBlack && r < 18 && g < 18 && b < 18) continue;

    // Filter minimum saturation
    if (minSaturation > 0) {
      const hsl = rgbToHsl(r, g, b);
      if (hsl.s < minSaturation) continue;
    }

    // Tone filter (vibrant, dark, light, warm, cool)
    if (toneFilter && toneFilter !== 'all') {
      const hsl = rgbToHsl(r, g, b);
      if (toneFilter === 'vibrant' && (hsl.s < 35 || hsl.l < 18 || hsl.l > 88)) continue;
      if (toneFilter === 'dark' && hsl.l > 40) continue;
      if (toneFilter === 'light' && hsl.l < 60) continue;
      if (toneFilter === 'warm' && !(hsl.h <= 75 || hsl.h >= 320)) continue;
      if (toneFilter === 'cool' && !(hsl.h > 75 && hsl.h < 320)) continue;
    }

    if (r5 < rmin) rmin = r5;
    if (r5 > rmax) rmax = r5;
    if (g5 < gmin) gmin = g5;
    if (g5 > gmax) gmax = g5;
    if (b5 < bmin) bmin = b5;
    if (b5 > bmax) bmax = b5;

    const index = (r5 << 10) | (g5 << 5) | b5;
    histo[index]++;
    validPixels++;
  }

  // If tone filter filtered out all pixels, fallback to unfiltered histogram
  let activeHisto = histo;
  if (validPixels < 10 && fallbackPixels > 0) {
    activeHisto = fallbackHisto;
    rmin = 0; rmax = 31;
    gmin = 0; gmax = 31;
    bmin = 0; bmax = 31;
    validPixels = fallbackPixels;
  }

  // Handle image with zero valid pixels
  if (validPixels === 0) {
    return [
      {
        hex: '#2596BE',
        rgb: { r: 37, g: 150, b: 190 },
        hsl: { h: 196, s: 67, l: 45 },
        frequency: 100,
        count: 1
      }
    ];
  }

  const initialBox = new ColorBox(rmin, rmax, gmin, gmax, bmin, bmax, activeHisto);
  let boxes = [initialBox];

  // Request more boxes than needed if shouldExcludeSimilar is active so we can prune
  const targetBoxes = shouldExcludeSimilar ? colorCount * 2 : colorCount;

  // Priority queue split: split box with highest (count * volume) or weighted by generationMode
  while (boxes.length < targetBoxes) {
    boxes.sort((a, b) => {
      let weightA = a.count() * a.volume();
      let weightB = b.count() * b.volume();
      if (generationMode === 'vivid') {
        const avgA = a.avg();
        const avgB = b.avg();
        const hslA = rgbToHsl(avgA.r, avgA.g, avgA.b);
        const hslB = rgbToHsl(avgB.r, avgB.g, avgB.b);
        weightA *= (1 + (hslA.s / 40));
        weightB *= (1 + (hslB.s / 40));
      } else if (generationMode === 'pastel') {
        const avgA = a.avg();
        const avgB = b.avg();
        const hslA = rgbToHsl(avgA.r, avgA.g, avgA.b);
        const hslB = rgbToHsl(avgB.r, avgB.g, avgB.b);
        weightA *= (1 + (hslA.l > 55 ? (hslA.l / 40) : 0.2));
        weightB *= (1 + (hslB.l > 55 ? (hslB.l / 40) : 0.2));
      }
      return weightB - weightA;
    });
    const boxToSplit = boxes.shift();

    if (boxToSplit.count() === 0) {
      boxes.push(boxToSplit);
      break;
    }

    const splitResult = medianCutSplit(boxToSplit, activeHisto);
    if (splitResult.length === 1) {
      boxes.push(splitResult[0]);
      break;
    } else {
      boxes.push(...splitResult);
    }
  }

  // Calculate average RGB & count for each box
  let rawPalette = boxes
    .map(box => {
      const avg = box.avg();
      return {
        rgb: { r: avg.r, g: avg.g, b: avg.b },
        hex: rgbToHex(avg.r, avg.g, avg.b),
        count: avg.count
      };
    })
    .filter(item => item.count > 0);

  // Exclude overly similar colors using Delta E
  let filtered = [];
  if (shouldExcludeSimilar) {
    rawPalette.sort((a, b) => b.count - a.count);
    for (const item of rawPalette) {
      const isTooClose = filtered.some(existing => getDeltaE(item.hex, existing.hex) < minDeltaE);
      if (!isTooClose) {
        filtered.push(item);
      }
      if (filtered.length >= colorCount) break;
    }
    // If filtering pruned too aggressively, backfill from remaining
    if (filtered.length < colorCount) {
      for (const item of rawPalette) {
        if (!filtered.includes(item)) {
          filtered.push(item);
          if (filtered.length >= colorCount) break;
        }
      }
    }
  } else {
    filtered = rawPalette.slice(0, colorCount);
  }

  // Calculate actual percentage frequency
  const totalCount = filtered.reduce((acc, c) => acc + c.count, 0) || 1;
  let results = filtered.map(item => {
    const hsl = rgbToHsl(item.rgb.r, item.rgb.g, item.rgb.b);
    const pct = (item.count / totalCount) * 100;
    return {
      hex: item.hex,
      rgb: item.rgb,
      hsl,
      count: item.count,
      frequency: Number(pct.toFixed(1))
    };
  });

  // Sort based on user preference
  if (sortBy === 'hue') {
    results.sort((a, b) => a.hsl.h - b.hsl.h);
  } else if (sortBy === 'brightness') {
    results.sort((a, b) => b.hsl.l - a.hsl.l);
  } else if (sortBy === 'saturation') {
    results.sort((a, b) => b.hsl.s - a.hsl.s);
  } else {
    // Default frequency
    results.sort((a, b) => b.frequency - a.frequency);
  }

  return results;
}

/**
 * Downsamples an HTMLImageElement to an offscreen canvas and returns ImageData
 */
export function getSampledImageData(imageElement, detailMode = 'balanced') {
  const maxDim = detailMode === 'fast' ? 160 : detailMode === 'detailed' ? 600 : 320;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  let width = imageElement.naturalWidth || imageElement.width;
  let height = imageElement.naturalHeight || imageElement.height;

  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);

  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Async wrapper that offloads dominant color extraction so the UI remains 100% smooth
 */
export async function extractPaletteAsync(imageElement, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      // Allow UI thread to paint loading state first
      setTimeout(() => {
        try {
          const imageData = getSampledImageData(imageElement, options.detailMode || 'balanced');
          const colors = extractDominantColors(imageData, options);
          resolve(colors);
        } catch (err) {
          reject(err);
        }
      }, 30);
    } catch (err) {
      reject(err);
    }
  });
}
