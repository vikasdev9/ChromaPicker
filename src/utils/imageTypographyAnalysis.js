/**
 * Image Typography and Pixel Analysis Utilities
 * 
 * Performs client-side pixel extraction, foreground/background color separation,
 * WCAG contrast computation, stroke-width weight estimation, italic slant detection,
 * and typography geometry measurements from cropped image regions.
 */

import { rgbToHex, rgbToHsl, getContrastRatio, getWcagRating } from './colorMath';

/**
 * Extracts raw pixel data for a bounding box from an HTML Canvas or ImageBitmap.
 */
export function getRegionImageData(canvas, bbox) {
  if (!canvas || !bbox) return null;

  const width = Math.max(1, Math.round(bbox.width));
  const height = Math.max(1, Math.round(bbox.height));
  const x = Math.max(0, Math.round(bbox.x0 ?? bbox.x ?? 0));
  const y = Math.max(0, Math.round(bbox.y0 ?? bbox.y ?? 0));

  // If input is already an ImageData or synthetic pixel object
  if (canvas.data && typeof canvas.width === 'number' && typeof canvas.height === 'number') {
    return canvas;
  }

  // If input is an Image/Canvas
  let ctx = null;
  if (typeof canvas.getContext === 'function') {
    ctx = canvas.getContext('2d');
  } else if (canvas.naturalWidth || canvas.width) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.naturalWidth || canvas.width;
    tempCanvas.height = canvas.naturalHeight || canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0);
      ctx = tempCtx;
    }
  }

  if (!ctx) {
    // Graceful fallback for non-canvas environments (e.g. headless jsdom)
    return {
      width,
      height,
      data: new Uint8ClampedArray(width * height * 4).fill(255)
    };
  }

  try {
    return ctx.getImageData(x, y, width, height);
  } catch (err) {
    console.warn('Failed to extract image data from region:', err);
    return null;
  }
}

/**
 * Calculates Otsu's optimal bimodal threshold for grayscale separation.
 */
function calculateOtsuThreshold(grayPixels) {
  const histogram = new Array(256).fill(0);
  const total = grayPixels.length;

  for (let i = 0; i < total; i++) {
    histogram[grayPixels[i]]++;
  }

  let sum = 0;
  for (let t = 0; t < 256; t++) {
    sum += t * histogram[t];
  }

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let varMax = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;

    wF = total - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];

    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const varBetween = wB * wF * (mB - mF) * (mB - mF);

    if (varBetween > varMax) {
      varMax = varBetween;
      threshold = t;
    }
  }

  return threshold;
}

/**
 * Separates foreground text pixels from background pixels using Otsu's thresholding
 * and extracts reliable colors, contrast ratio, and quality indicators.
 */
export function extractRegionColors(canvas, bbox) {
  const defaultFallback = {
    textColor: { hex: '#111827', rgb: { r: 17, g: 24, b: 39 }, hsl: { h: 220, s: 39, l: 11 } },
    backgroundColor: { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
    contrastRatio: 16.4,
    wcagRating: getWcagRating(16.4),
    isReliable: false,
    reason: 'Default fallback used; insufficient or unreadable pixel region'
  };

  const imgData = getRegionImageData(canvas, bbox);
  if (!imgData || !imgData.data || imgData.data.length < 16) {
    return defaultFallback;
  }

  const { data, width, height } = imgData;
  const pixelCount = width * height;

  const gray = new Uint8Array(pixelCount);
  const rgbList = [];

  for (let i = 0; i < pixelCount; i++) {
    const offset = i * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const a = data[offset + 3];

    // Grayscale luminance (Rec. 601)
    const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    gray[i] = a < 50 ? 255 : luma; // Treat transparent as white
    rgbList.push({ r, g, b, a, luma: gray[i] });
  }

  const threshold = calculateOtsuThreshold(gray);

  // Group pixels into dark and bright clusters
  const darkCluster = [];
  const brightCluster = [];

  // Corner and border pixels are predominantly background in typical text crops
  const borderLumSum = [];
  for (let x = 0; x < width; x++) {
    borderLumSum.push(gray[x]); // top edge
    borderLumSum.push(gray[(height - 1) * width + x]); // bottom edge
  }
  for (let y = 0; y < height; y++) {
    borderLumSum.push(gray[y * width]); // left edge
    borderLumSum.push(gray[y * width + (width - 1)]); // right edge
  }

  const avgBorderLum = borderLumSum.reduce((acc, v) => acc + v, 0) / (borderLumSum.length || 1);
  const backgroundIsBright = avgBorderLum >= threshold;

  for (let i = 0; i < pixelCount; i++) {
    const px = rgbList[i];
    if (px.a < 50) continue;

    if (px.luma <= threshold) {
      darkCluster.push(px);
    } else {
      brightCluster.push(px);
    }
  }

  const textPixels = backgroundIsBright ? darkCluster : brightCluster;
  const bgPixels = backgroundIsBright ? brightCluster : darkCluster;

  // Average colors of text and background
  const averageRgb = (cluster, fallbackRgb) => {
    if (!cluster || cluster.length === 0) return fallbackRgb;
    let rSum = 0, gSum = 0, bSum = 0;
    // Trim potential anti-aliasing edge blend by sampling the central core of the cluster
    const sorted = [...cluster].sort((a, b) => backgroundIsBright ? a.luma - b.luma : b.luma - a.luma);
    const coreSample = sorted.slice(0, Math.max(1, Math.floor(sorted.length * 0.75)));

    for (let i = 0; i < coreSample.length; i++) {
      rSum += coreSample[i].r;
      gSum += coreSample[i].g;
      bSum += coreSample[i].b;
    }
    const len = coreSample.length;
    return {
      r: Math.round(rSum / len),
      g: Math.round(gSum / len),
      b: Math.round(bSum / len)
    };
  };

  const textRgb = averageRgb(textPixels, backgroundIsBright ? { r: 20, g: 25, b: 35 } : { r: 245, g: 245, b: 250 });
  const bgRgb = averageRgb(bgPixels, backgroundIsBright ? { r: 255, g: 255, b: 255 } : { r: 15, g: 20, b: 25 });

  const textHex = rgbToHex(textRgb.r, textRgb.g, textRgb.b);
  const bgHex = rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b);
  const textHsl = rgbToHsl(textRgb.r, textRgb.g, textRgb.b);
  const bgHsl = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);

  const contrast = getContrastRatio(textHex, bgHex);
  const isReliable = contrast >= 2.0 && textPixels.length >= 8 && bgPixels.length >= 8;

  let reason = 'High contrast text separation';
  if (!isReliable) {
    reason = contrast < 2.0
      ? 'Low contrast between text and background pixels may reduce separation accuracy'
      : 'Crop region contains insufficient pixel samples';
  }

  return {
    textColor: { hex: textHex, rgb: textRgb, hsl: textHsl },
    backgroundColor: { hex: bgHex, rgb: bgRgb, hsl: bgHsl },
    contrastRatio: contrast,
    wcagRating: getWcagRating(contrast),
    isReliable,
    reason
  };
}

/**
 * Classifies font category, weight, and style based on stroke geometry,
 * serif projections, slant angle, and text casing.
 */
export function classifyFont(canvas, bbox, text = '') {
  const imgData = getRegionImageData(canvas, bbox);
  const cleanText = (text || '').trim();

  // Baseline classification structure
  const classification = {
    category: 'sans-serif',
    weightCategory: 'regular',
    estimatedNumericWeight: 400,
    style: 'normal',
    casing: 'mixed',
    isEstimate: true,
    confidence: 'Moderate',
    notes: 'Estimated from pixel stroke analysis; not verified vector metadata'
  };

  // Determine casing from recognized text
  if (cleanText.length > 0) {
    const lettersOnly = cleanText.replace(/[^a-zA-Z]/g, '');
    if (lettersOnly.length > 0) {
      if (lettersOnly === lettersOnly.toUpperCase()) {
        classification.casing = 'uppercase';
      } else if (lettersOnly === lettersOnly.toLowerCase()) {
        classification.casing = 'lowercase';
      } else if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(cleanText)) {
        classification.casing = 'titlecase';
      } else {
        classification.casing = 'mixed';
      }
    }
  }

  if (!imgData || !imgData.data) {
    return classification;
  }

  const { data, width, height } = imgData;
  const pixelCount = width * height;
  if (pixelCount < 64) return classification;

  // Grayscale & binarize
  const gray = new Uint8Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    const offset = i * 4;
    gray[i] = Math.round(0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2]);
  }
  const threshold = calculateOtsuThreshold(gray);

  // Border luminance check
  const borderLum = (gray[0] + gray[width - 1] + gray[(height - 1) * width] + gray[pixelCount - 1]) / 4;
  const bgIsLight = borderLum >= threshold;

  // Binary mask: true = text pixel
  const isText = new Uint8Array(pixelCount);
  let textPixelCount = 0;
  for (let i = 0; i < pixelCount; i++) {
    const val = bgIsLight ? gray[i] <= threshold : gray[i] > threshold;
    isText[i] = val ? 1 : 0;
    if (val) textPixelCount++;
  }

  const textFillRatio = textPixelCount / pixelCount;

  // Horizontal stroke width run-length measurement
  const horizontalRuns = [];
  for (let y = 1; y < height - 1; y++) {
    let currentRun = 0;
    for (let x = 0; x < width; x++) {
      if (isText[y * width + x]) {
        currentRun++;
      } else {
        if (currentRun > 0) {
          // Exclude runs that span the entire width (background noise/lines)
          if (currentRun < width * 0.8) {
            horizontalRuns.push(currentRun);
          }
          currentRun = 0;
        }
      }
    }
    if (currentRun > 0 && currentRun < width * 0.8) {
      horizontalRuns.push(currentRun);
    }
  }

  let medianStrokeWidth = 2;
  if (horizontalRuns.length > 0) {
    horizontalRuns.sort((a, b) => a - b);
    medianStrokeWidth = horizontalRuns[Math.floor(horizontalRuns.length / 2)] || 2;
  }

  // Weight estimation via stroke width to height ratio and text fill ratio
  const strokeToHeightRatio = medianStrokeWidth / (height || 1);

  if (strokeToHeightRatio > 0.22 || textFillRatio > 0.45) {
    classification.weightCategory = 'black';
    classification.estimatedNumericWeight = 900;
  } else if (strokeToHeightRatio > 0.16 || textFillRatio > 0.36) {
    classification.weightCategory = 'bold';
    classification.estimatedNumericWeight = 700;
  } else if (strokeToHeightRatio > 0.12 || textFillRatio > 0.28) {
    classification.weightCategory = 'semibold';
    classification.estimatedNumericWeight = 600;
  } else if (strokeToHeightRatio > 0.09 || textFillRatio > 0.22) {
    classification.weightCategory = 'medium';
    classification.estimatedNumericWeight = 500;
  } else if (strokeToHeightRatio < 0.05 && textFillRatio < 0.15) {
    classification.weightCategory = 'light';
    classification.estimatedNumericWeight = 300;
  } else {
    classification.weightCategory = 'regular';
    classification.estimatedNumericWeight = 400;
  }

  // Slant / Italic angle estimation
  // Measure horizontal centroid shift between top half and bottom half of vertical strokes
  let topHalfXSum = 0;
  let topHalfCount = 0;
  let bottomHalfXSum = 0;
  let bottomHalfCount = 0;

  const midY = Math.floor(height / 2);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isText[y * width + x]) {
        if (y < midY) {
          topHalfXSum += x;
          topHalfCount++;
        } else {
          bottomHalfXSum += x;
          bottomHalfCount++;
        }
      }
    }
  }

  if (topHalfCount > 20 && bottomHalfCount > 20) {
    const topCentroid = topHalfXSum / topHalfCount;
    const bottomCentroid = bottomHalfXSum / bottomHalfCount;
    const deltaX = topCentroid - bottomCentroid;
    // Italic text slants forward (top leans right relative to bottom)
    const slantAngleDeg = (Math.atan2(deltaX, midY) * 180) / Math.PI;
    if (slantAngleDeg > 7) {
      classification.style = 'italic';
    } else {
      classification.style = 'normal';
    }
  }

  // Serif vs Sans-serif detection:
  // Serifs create small horizontal spurs at stroke terminations.
  // We examine horizontal variance in stroke widths and vertical stroke terminations.
  let serifIndicatorCount = 0;
  for (let y = 3; y < height - 3; y++) {
    for (let x = 2; x < width - 2; x++) {
      if (isText[y * width + x]) {
        // Check for T-shape or foot-shape protrusions
        const hasTopWhite = !isText[(y - 1) * width + x];
        const hasBottomWhite = !isText[(y + 1) * width + x];
        const hasLeftBlack = isText[y * width + (x - 1)];
        const hasRightBlack = isText[y * width + (x + 1)];

        if ((hasTopWhite || hasBottomWhite) && hasLeftBlack && hasRightBlack) {
          serifIndicatorCount++;
        }
      }
    }
  }

  const serifRatio = serifIndicatorCount / (textPixelCount || 1);
  if (serifRatio > 0.16) {
    classification.category = 'serif';
  } else if (cleanText.length > 5 && isLikelyMonospace(cleanText)) {
    classification.category = 'monospace';
  } else {
    classification.category = 'sans-serif';
  }

  return classification;
}

/**
 * Checks if text is likely code or tabular/monospace
 */
function isLikelyMonospace(text) {
  const codePatterns = /[{}();=><_$[\]/\\|]/;
  return codePatterns.test(text);
}

/**
 * Measures typography geometry: font size in source image pixels, line height,
 * letter spacing, text alignment, and bounding box dimensions.
 */
export function measureTypography(canvas, bbox, text = '') {
  const width = Math.max(1, Math.round(bbox?.width || 0));
  const height = Math.max(1, Math.round(bbox?.height || 0));
  const cleanText = (text || '').trim();

  // Count lines in text
  const lineBreaks = cleanText.split('\n').filter(l => l.trim().length > 0);
  const lineCount = Math.max(1, lineBreaks.length);

  // Approximate font size in image pixels
  // In typography, height of text region divided by lines yields approximate line height
  const lineHeightPx = height / lineCount;
  // Font em-size is typically ~70-75% of total line box height
  const estimatedFontPx = Math.max(10, Math.round(lineHeightPx * 0.72));

  // Line height ratio
  const estimatedLineHeightRatio = Number((lineHeightPx / estimatedFontPx).toFixed(2));

  // Letter spacing estimation:
  // Width minus approximate glyph widths divided by character count
  const charCount = Math.max(1, cleanText.length);
  const avgCharWidth = width / charCount;
  let letterSpacingPx = 0;
  if (avgCharWidth > estimatedFontPx * 0.65) {
    letterSpacingPx = Number(((avgCharWidth - estimatedFontPx * 0.55)).toFixed(1));
  } else if (avgCharWidth < estimatedFontPx * 0.45) {
    letterSpacingPx = -0.5;
  }

  // Alignment estimation
  let alignment = 'left';
  if (lineCount > 1) {
    alignment = 'left';
  }

  return {
    imagePxSize: estimatedFontPx,
    lineHeightRatio: estimatedLineHeightRatio,
    letterSpacingPx: Math.min(6, Math.max(-2, letterSpacingPx)),
    alignment,
    lineCount,
    boundingBox: {
      width,
      height,
      aspectRatio: Number((width / (height || 1)).toFixed(2))
    },
    measurementNote: 'Source-image pixels; actual CSS font-size depends on viewport and device pixel ratio'
  };
}
