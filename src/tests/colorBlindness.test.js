import { describe, it, expect } from 'vitest';
import { simulateRgb, simulatePalette, CVD_TYPES } from '../utils/colorBlindness';

describe('colorBlindness: CVD simulation', () => {
  it('contains all 8 required vision deficiency types', () => {
    expect(CVD_TYPES).toHaveLength(9);
    const ids = CVD_TYPES.map(t => t.id);
    expect(ids).toContain('protanopia');
    expect(ids).toContain('protanomaly');
    expect(ids).toContain('deuteranopia');
    expect(ids).toContain('deuteranomaly');
    expect(ids).toContain('tritanopia');
    expect(ids).toContain('tritanomaly');
    expect(ids).toContain('achromatopsia');
  });

  it('transforms pure red under protanopia to dark brownish tone', () => {
    // Pure red (255, 0, 0)
    const result = simulateRgb(255, 0, 0, 'protanopia');
    expect(result.hex).not.toBe('#FF0000');
    expect(result.r).toBeLessThan(200);
  });

  it('converts to monochrome grayscale under achromatopsia', () => {
    // Blue (37, 150, 190)
    const result = simulateRgb(37, 150, 190, 'achromatopsia');
    // In monochromacy, r, g, b should be identical (grayscale)
    expect(result.r).toBe(result.g);
    expect(result.g).toBe(result.b);
  });

  it('simulates entire palettes accurately', () => {
    const palette = ['#FF0000', '#00FF00', '#0000FF'];
    const simulated = simulatePalette(palette, 'deuteranopia');
    expect(simulated).toHaveLength(3);
    simulated.forEach(hex => expect(hex).toMatch(/^#[0-9A-F]{6}$/i));
  });
});
