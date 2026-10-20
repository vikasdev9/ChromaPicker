import { describe, it, expect } from 'vitest';
import { sampleColorsFromImageData, extractImageAmbientColors } from '../utils/backgroundSampling';

describe('backgroundSampling: ambient background color sampling', () => {
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

    return { width, height, data };
  }

  it('samples ambient light, dark, and glow colors from synthetic image data', () => {
    const imgData = createSyntheticImageData(48, 48, [
      { r: 250, g: 150, b: 100 }, // warm peach
      { r: 40, g: 120, b: 220 },  // blue
      { r: 120, g: 200, b: 150 }, // mint
      { r: 220, g: 80, b: 180 }   // pink
    ]);

    const result = sampleColorsFromImageData(imgData);
    expect(result).not.toBeNull();
    expect(result.light).toHaveLength(4);
    expect(result.dark).toHaveLength(3);
    expect(typeof result.glow).toBe('string');

    // Light colors should use rgba with opacity
    expect(result.light[0]).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/);
    expect(result.dark[0]).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/);
  });

  it('safely ignores fully transparent pixels', () => {
    const transparentData = createSyntheticImageData(10, 10, [
      { r: 255, g: 0, b: 0, a: 0 },
      { r: 0, g: 255, b: 0, a: 0 }
    ]);

    const result = sampleColorsFromImageData(transparentData);
    expect(result).toBeNull();
  });

  it('returns null for null, empty or invalid image data (clean fallback)', () => {
    expect(sampleColorsFromImageData(null)).toBeNull();
    expect(sampleColorsFromImageData({})).toBeNull();
    expect(sampleColorsFromImageData({ width: 0, height: 0, data: [] })).toBeNull();
  });

  it('extractImageAmbientColors returns null for empty or null image source', async () => {
    const resultNull = await extractImageAmbientColors(null);
    expect(resultNull).toBeNull();

    const resultEmpty = await extractImageAmbientColors('');
    expect(resultEmpty).toBeNull();
  });
});
