import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToCmyk,
  rgbToLab,
  getRelativeLuminance,
  getContrastRatio,
  getWcagRating,
  generateHarmonies,
  generateVariations,
  normalizeHex,
  isValidHex
} from '../utils/colorMath';

describe('colorMath: conversions', () => {
  it('normalizes 3-char and 6-char hex strings', () => {
    expect(normalizeHex('#fff')).toBe('ffffff');
    expect(normalizeHex('2596be')).toBe('2596be');
    expect(normalizeHex('#2596BE')).toBe('2596be');
  });

  it('validates hex codes correctly', () => {
    expect(isValidHex('#2596BE')).toBe(true);
    expect(isValidHex('2596be')).toBe(true);
    expect(isValidHex('#fff')).toBe(true);
    expect(isValidHex('invalid-hex')).toBe(false);
  });

  it('converts HEX to RGB accurately', () => {
    const rgb = hexToRgb('#2596BE');
    expect(rgb).toEqual({ r: 37, g: 150, b: 190 });

    const black = hexToRgb('#000000');
    expect(black).toEqual({ r: 0, g: 0, b: 0 });

    const white = hexToRgb('#FFFFFF');
    expect(white).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('converts RGB to HEX accurately', () => {
    expect(rgbToHex(37, 150, 190)).toBe('#2596BE');
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
    expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF');
  });

  it('converts RGB to HSL and back', () => {
    const hsl = rgbToHsl(37, 150, 190);
    expect(hsl.h).toBeCloseTo(196, -1);
    expect(hsl.s).toBeCloseTo(67, -1);
    expect(hsl.l).toBeCloseTo(45, -1);

    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    expect(rgb.r).toBeCloseTo(37, -1);
    expect(rgb.g).toBeCloseTo(150, -1);
    expect(rgb.b).toBeCloseTo(190, -1);
  });

  it('calculates screen-oriented CMYK approximation', () => {
    const cmyk = rgbToCmyk(37, 150, 190);
    expect(cmyk.c).toBeGreaterThan(70);
    expect(cmyk.k).toBeGreaterThan(20);
  });
});

describe('colorMath: WCAG accessibility', () => {
  it('calculates relative luminance accurately', () => {
    expect(getRelativeLuminance(0, 0, 0)).toBe(0);
    expect(getRelativeLuminance(255, 255, 255)).toBe(1);
  });

  it('calculates contrast ratios conforming to WCAG 2.1', () => {
    const maxContrast = getContrastRatio('#000000', '#FFFFFF');
    expect(maxContrast).toBe(21);

    const minContrast = getContrastRatio('#FFFFFF', '#FFFFFF');
    expect(minContrast).toBe(1);

    // #2596BE on white
    const ratio = getContrastRatio('#2596BE', '#FFFFFF');
    expect(ratio).toBeGreaterThan(3.0);
  });

  it('verifies WCAG rating tiers', () => {
    const passAA = getWcagRating(4.8);
    expect(passAA.aaNormal).toBe(true);
    expect(passAA.aaLarge).toBe(true);
    expect(passAA.aaaNormal).toBe(false);

    const passAAA = getWcagRating(7.5);
    expect(passAAA.aaaNormal).toBe(true);
    expect(passAAA.aaaLarge).toBe(true);
  });
});

describe('colorMath: Harmonies and Variations', () => {
  it('generates 6 harmony groups for a base color', () => {
    const harmonies = generateHarmonies('#2596BE');
    expect(harmonies.complementary).toHaveLength(2);
    expect(harmonies.analogous).toHaveLength(3);
    expect(harmonies.triadic).toHaveLength(3);
    expect(harmonies.tetradic).toHaveLength(4);
    expect(harmonies.splitComplementary).toHaveLength(3);
  });

  it('generates tints, shades, and tones', () => {
    const variations = generateVariations('#2596BE', 5);
    expect(variations.tints).toHaveLength(5);
    expect(variations.shades).toHaveLength(5);
    expect(variations.tones).toHaveLength(5);
  });
});
