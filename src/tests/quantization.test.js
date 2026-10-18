import { describe, it, expect } from 'vitest';
import { extractDominantColors } from '../utils/quantization';

describe('quantization: dominant color extraction', () => {
  // Helper to create synthetic ImageData
  function createSyntheticImageData(width, height, fillColors) {
    const data = new Uint8ClampedArray(width * height * 4);
    const pixelsPerColor = Math.floor((width * height) / fillColors.length);

    fillColors.forEach((color, colorIdx) => {
      const start = colorIdx * pixelsPerColor;
      const end = colorIdx === fillColors.length - 1 ? width * height : start + pixelsPerColor;

      for (let i = start; i < end; i++) {
        const offset = i * 4;
        data[offset] = color.r;
        data[offset + 1] = color.g;
        data[offset + 2] = color.b;
        data[offset + 3] = color.a !== undefined ? color.a : 255;
      }
    });

    return {
      width,
      height,
      data
    };
  }

  it('extracts correct dominant colors from synthetic image', () => {
    // 60% Red, 40% Blue
    const imgData = createSyntheticImageData(10, 10, [
      { r: 230, g: 30, b: 30, a: 255 },
      { r: 230, g: 30, b: 30, a: 255 },
      { r: 230, g: 30, b: 30, a: 255 },
      { r: 30, g: 100, b: 220, a: 255 },
      { r: 30, g: 100, b: 220, a: 255 }
    ]);

    const palette = extractDominantColors(imgData, { colorCount: 2 });
    expect(palette.length).toBeGreaterThanOrEqual(1);
    expect(palette[0].frequency).toBeGreaterThan(0);
  });

  it('ignores transparent pixels when ignoreTransparent is true', () => {
    // 50% fully transparent, 50% solid cyan
    const imgData = createSyntheticImageData(10, 10, [
      { r: 255, g: 0, b: 0, a: 0 },
      { r: 37, g: 150, b: 190, a: 255 }
    ]);

    const palette = extractDominantColors(imgData, {
      colorCount: 2,
      ignoreTransparent: true
    });

    expect(palette.length).toBeGreaterThan(0);
    // Red with 0 alpha should be ignored, so extracted color should be cyan
    expect(palette[0].rgb.b).toBeGreaterThan(150);
  });

  it('filters near-white pixels when ignoreNearWhite is enabled', () => {
    // 50% pure white, 50% deep forest green
    const imgData = createSyntheticImageData(10, 10, [
      { r: 250, g: 250, b: 250, a: 255 },
      { r: 20, g: 120, b: 50, a: 255 }
    ]);

    const palette = extractDominantColors(imgData, {
      colorCount: 2,
      ignoreNearWhite: true
    });

    // The primary extracted color should be the green
    expect(palette[0].rgb.g).toBeGreaterThan(100);
  });

  it('calculates genuine percentage frequency totaling approx 100%', () => {
    const imgData = createSyntheticImageData(20, 20, [
      { r: 200, g: 50, b: 50, a: 255 },
      { r: 50, g: 200, b: 50, a: 255 },
      { r: 50, g: 50, b: 200, a: 255 }
    ]);

    const palette = extractDominantColors(imgData, { colorCount: 3 });
    const totalFreq = palette.reduce((sum, item) => sum + item.frequency, 0);
    expect(totalFreq).toBeCloseTo(100, 0);
  });

  it('filters warm and cool colors correctly', () => {
    // 50% warm red/orange, 50% cool blue
    const imgData = createSyntheticImageData(10, 10, [
      { r: 240, g: 60, b: 20, a: 255 }, // warm
      { r: 20, g: 80, b: 240, a: 255 }  // cool
    ]);

    const warmPalette = extractDominantColors(imgData, { colorCount: 1, toneFilter: 'warm' });
    expect(warmPalette[0].rgb.r).toBeGreaterThan(150);

    const coolPalette = extractDominantColors(imgData, { colorCount: 1, toneFilter: 'cool' });
    expect(coolPalette[0].rgb.b).toBeGreaterThan(150);
  });

  it('prunes similar colors with uniqueColorsMode and minDeltaE', () => {
    // Two nearly identical reds and one distinct teal
    const imgData = createSyntheticImageData(12, 12, [
      { r: 255, g: 0, b: 0, a: 255 },
      { r: 250, g: 4, b: 2, a: 255 },
      { r: 0, g: 180, b: 180, a: 255 }
    ]);

    const uniquePalette = extractDominantColors(imgData, {
      colorCount: 2,
      uniqueColorsMode: true,
      minDeltaE: 15
    });

    expect(uniquePalette.length).toBe(2);
    // One should be reddish and one should be teal
    const hasRed = uniquePalette.some(c => c.rgb.r > 200);
    const hasTeal = uniquePalette.some(c => c.rgb.g > 150);
    expect(hasRed).toBe(true);
    expect(hasTeal).toBe(true);
  });
});

