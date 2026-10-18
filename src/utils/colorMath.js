/**
 * Comprehensive Color Mathematics and Conversion Utilities for Chromapick
 */

// Clamp value between min and max
export const clamp = (val, min = 0, max = 255) => Math.min(Math.max(val, min), max);

/**
 * Normalizes a HEX string to a clean 6-character hex without '#'
 */
export function normalizeHex(hex) {
  if (!hex) return '000000';
  let clean = hex.toString().replace(/[^0-9a-fA-F]/g, '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  return clean.padEnd(6, '0').slice(0, 6).toLowerCase();
}

/**
 * Validates a HEX color string
 */
export function isValidHex(hex) {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
}

/**
 * Converts HEX to RGB object { r, g, b }
 */
export function hexToRgb(hex) {
  const clean = normalizeHex(hex);
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Converts RGB numbers to 6-digit uppercase HEX string '#RRGGBB'
 */
export function rgbToHex(r, g, b) {
  const toHex = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Converts RGB { r, g, b } (0-255) to HSL { h, s, l }
 * h: 0-360, s: 0-100, l: 0-100
 */
export function rgbToHsl(r, g, b) {
  r = clamp(r, 0, 255) / 255;
  g = clamp(g, 0, 255) / 255;
  b = clamp(b, 0, 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Converts HSL { h, s, l } (h: 0-360, s: 0-100, l: 0-100) to RGB { r, g, b }
 */
export function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Converts RGB to HSV/HSB { h, s, v } (h: 0-360, s: 0-100, v: 0-100)
 */
export function rgbToHsv(r, g, b) {
  r = clamp(r, 0, 255) / 255;
  g = clamp(g, 0, 255) / 255;
  b = clamp(b, 0, 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

/**
 * Converts RGB to screen-oriented CMYK approximation { c, m, y, k } (0-100)
 * Note: screen-oriented CMYK approximation, not equivalent to printer ICC profile.
 */
export function rgbToCmyk(r, g, b) {
  const rNorm = clamp(r, 0, 255) / 255;
  const gNorm = clamp(g, 0, 255) / 255;
  const bNorm = clamp(b, 0, 255) / 255;

  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k >= 0.9999) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - rNorm - k) / (1 - k);
  const m = (1 - gNorm - k) / (1 - k);
  const y = (1 - bNorm - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100)
  };
}

/**
 * Converts RGB to CIE XYZ (D65 standard observer)
 */
export function rgbToXyz(r, g, b) {
  const pivot = (val) => {
    val /= 255;
    return val > 0.04045 ? Math.pow((val + 0.055) / 1.055, 2.4) : val / 12.92;
  };

  const rLin = pivot(clamp(r, 0, 255)) * 100;
  const gLin = pivot(clamp(g, 0, 255)) * 100;
  const bLin = pivot(clamp(b, 0, 255)) * 100;

  const x = rLin * 0.4124 + gLin * 0.3576 + bLin * 0.1805;
  const y = rLin * 0.2126 + gLin * 0.7152 + bLin * 0.0722;
  const z = rLin * 0.0193 + gLin * 0.1192 + bLin * 0.9505;

  return {
    x: Math.round(x),
    y: Math.round(y),
    z: Math.round(z)
  };
}

/**
 * Converts XYZ to CIE L*a*b*
 */
export function xyzToLab(x, y, z) {
  // D65 reference white points
  const refX = 95.047;
  const refY = 100.0;
  const refZ = 108.883;

  const pivot = (val) => {
    return val > 0.008856 ? Math.cbrt(val) : 7.787 * val + 16 / 116;
  };

  const xP = pivot(x / refX);
  const yP = pivot(y / refY);
  const zP = pivot(z / refZ);

  const l = 116 * yP - 16;
  const a = 500 * (xP - yP);
  const b = 200 * (yP - zP);

  return {
    l: Math.round(l),
    a: Math.round(a),
    b: Math.round(b)
  };
}

/**
 * Converts RGB directly to LAB
 */
export function rgbToLab(r, g, b) {
  const xyz = rgbToXyz(r, g, b);
  return xyzToLab(xyz.x, xyz.y, xyz.z);
}

/**
 * Converts RGB to CIE Luv
 */
export function rgbToLuv(r, g, b) {
  const xyz = rgbToXyz(r, g, b);
  const denom = xyz.x + 15 * xyz.y + 3 * xyz.z;
  const uPrime = denom !== 0 ? (4 * xyz.x) / denom : 0;
  const vPrime = denom !== 0 ? (9 * xyz.y) / denom : 0;

  // D65 reference
  const u0 = (4 * 95.047) / (95.047 + 15 * 100.0 + 3 * 108.883);
  const v0 = (9 * 100.0) / (95.047 + 15 * 100.0 + 3 * 108.883);

  const yNorm = xyz.y / 100.0;
  const l = yNorm > 0.008856 ? 116 * Math.cbrt(yNorm) - 16 : 903.3 * yNorm;
  const u = 13 * l * (uPrime - u0);
  const v = 13 * l * (vPrime - v0);

  return {
    l: Math.round(l),
    u: Math.round(u),
    v: Math.round(v)
  };
}

/**
 * Converts RGB to HWB (Hue, Whiteness, Blackness)
 */
export function rgbToHwb(r, g, b) {
  const hsl = rgbToHsl(r, g, b);
  const w = Math.min(r, g, b) / 255 * 100;
  const blk = (1 - Math.max(r, g, b) / 255) * 100;
  return {
    h: hsl.h,
    w: Math.round(w),
    b: Math.round(blk)
  };
}

/**
 * Calculates WCAG 2.1 relative luminance for an RGB color
 */
export function getRelativeLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

/**
 * Calculates WCAG contrast ratio between two colors (hex1, hex2)
 * Returns ratio e.g. 4.54
 */
export function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Number(ratio.toFixed(2));
}

/**
 * Returns compliance ratings for WCAG 2.1 standards
 */
export function getWcagRating(ratio) {
  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3.0,
    aaaNormal: ratio >= 7.0,
    aaaLarge: ratio >= 4.5,
    uiComponent: ratio >= 3.0
  };
}

/**
 * Recommends optimal text color ('#000000' or '#FFFFFF') for a given background hex
 */
export function getReadableTextColor(bgHex) {
  const rgb = hexToRgb(bgHex);
  const lum = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
  return lum > 0.179 ? '#111827' : '#FFFFFF';
}

/**
 * CIE76 Delta E color difference between two hex colors
 */
export function getDeltaE(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lab1 = rgbToLab(rgb1.r, rgb1.g, rgb1.b);
  const lab2 = rgbToLab(rgb2.r, rgb2.g, rgb2.b);

  return Math.sqrt(
    Math.pow(lab1.l - lab2.l, 2) +
    Math.pow(lab1.a - lab2.a, 2) +
    Math.pow(lab1.b - lab2.b, 2)
  );
}

/**
 * Generates color harmonies based on standard color theory angles
 */
export function generateHarmonies(baseHex) {
  const rgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const makeColor = (degOffset, satMod = 0, lightMod = 0) => {
    const newHue = ((hsl.h + degOffset) % 360 + 360) % 360;
    const newSat = clamp(hsl.s + satMod, 0, 100);
    const newLight = clamp(hsl.l + lightMod, 0, 100);
    const newRgb = hslToRgb(newHue, newSat, newLight);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  };

  return {
    base: baseHex.toUpperCase(),
    complementary: [
      baseHex.toUpperCase(),
      makeColor(180)
    ],
    analogous: [
      makeColor(-30),
      baseHex.toUpperCase(),
      makeColor(30)
    ],
    triadic: [
      baseHex.toUpperCase(),
      makeColor(120),
      makeColor(240)
    ],
    tetradic: [
      baseHex.toUpperCase(),
      makeColor(90),
      makeColor(180),
      makeColor(270)
    ],
    splitComplementary: [
      baseHex.toUpperCase(),
      makeColor(150),
      makeColor(210)
    ],
    monochromatic: [
      makeColor(0, 0, -30),
      makeColor(0, 0, -15),
      baseHex.toUpperCase(),
      makeColor(0, 0, 15),
      makeColor(0, 0, 30)
    ]
  };
}

/**
 * Generates variations: shades (darker), tints (lighter), and tones (desaturated)
 */
export function generateVariations(baseHex, steps = 10) {
  const rgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const shades = [];
  const tints = [];
  const tones = [];

  for (let i = 1; i <= steps; i++) {
    const factor = i / (steps + 1);
    
    // Tints: blend towards white (higher lightness)
    const tintL = hsl.l + (100 - hsl.l) * factor;
    const tintRgb = hslToRgb(hsl.h, hsl.s, tintL);
    tints.push({
      hex: rgbToHex(tintRgb.r, tintRgb.g, tintRgb.b),
      label: `+${Math.round(factor * 100)}%`
    });

    // Shades: blend towards black (lower lightness)
    const shadeL = hsl.l * (1 - factor);
    const shadeRgb = hslToRgb(hsl.h, hsl.s, shadeL);
    shades.push({
      hex: rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b),
      label: `-${Math.round(factor * 100)}%`
    });

    // Tones: reduce saturation
    const toneS = hsl.s * (1 - factor);
    const toneRgb = hslToRgb(hsl.h, toneS, hsl.l);
    tones.push({
      hex: rgbToHex(toneRgb.r, toneRgb.g, toneRgb.b),
      label: `${Math.round(toneS)}% sat`
    });
  }

  return { shades, tints, tones };
}

/**
 * Formats a hex into full color object bundle with all representation strings
 */
export function getColorSummary(hex) {
  const cleanHex = '#' + normalizeHex(hex).toUpperCase();
  const rgb = hexToRgb(cleanHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const xyz = rgbToXyz(rgb.r, rgb.g, rgb.b);
  const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
  const luv = rgbToLuv(rgb.r, rgb.g, rgb.b);
  const hwb = rgbToHwb(rgb.r, rgb.g, rgb.b);
  const lum = getRelativeLuminance(rgb.r, rgb.g, rgb.b);

  return {
    hex: cleanHex,
    rgb,
    hsl,
    hsv,
    cmyk,
    xyz,
    lab,
    luv,
    hwb,
    luminance: Number(lum.toFixed(4)),
    rgbString: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    rgbaString: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
    hslString: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hsvString: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    cmykString: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    cssVar: `--color-${cleanHex.slice(1).toLowerCase()}: ${cleanHex};`,
    textColor: getReadableTextColor(cleanHex)
  };
}
