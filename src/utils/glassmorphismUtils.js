/**
 * Pure Mathematical & CSS Serialization Utilities for Glassmorphism
 * Supports background alpha tint, backdrop-filter (-webkit prefix),
 * translucent borders, border radius, box shadows, and validation.
 */

import { hexToRgb, isValidHex, normalizeHex } from './colorMath';

export const DEFAULT_GLASS_STATE = {
  // Background / Tint
  bgColor: '#FFFFFF',
  bgOpacity: 20, // 0 - 100%

  // Backdrop filter
  blur: 16, // 0 - 50px
  saturation: 100, // 100 - 200%
  useSaturation: false,

  // Border
  borderEnabled: true,
  borderColor: '#FFFFFF',
  borderOpacity: 30, // 0 - 100%
  borderWidth: 1, // 0 - 10px

  // Border Radius
  borderRadius: 16, // 0 - 100px

  // Shadow
  shadowEnabled: true,
  shadowColor: '#000000',
  shadowOpacity: 37, // 0 - 100%
  shadowX: 0,
  shadowY: 8,
  shadowBlur: 32,
  shadowSpread: 0,

  // Preview styling
  textColor: '#FFFFFF',
  previewBg: 'mesh-gradient'
};

/**
 * Normalizes HEX and opacity into valid CSS rgba(...) string
 */
export function formatRgbaColor(hex, opacity = 100, fallbackHex = '#FFFFFF') {
  const cleanHex = isValidHex(hex) ? '#' + normalizeHex(hex, true) : fallbackHex;
  const alphaClamped = Math.min(100, Math.max(0, isNaN(opacity) ? 100 : Math.round(opacity)));
  const rgb = hexToRgb(cleanHex);
  const alpha = Number((alphaClamped / 100).toFixed(2));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Clamps numeric value safely between min and max
 */
export function clampNumber(val, min, max, fallback = min) {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num) || !isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
}

/**
 * Formats the backdrop-filter value string (e.g. blur(16px) or blur(16px) saturate(180%))
 */
export function formatBackdropFilterValue(state) {
  const s = sanitizeGlassState(state);
  const parts = [`blur(${s.blur}px)`];

  if (s.useSaturation && s.saturation !== 100) {
    parts.push(`saturate(${s.saturation}%)`);
  }

  return parts.join(' ');
}

/**
 * Generates an object of CSS style rules suitable for React style prop
 */
export function generateGlassStyleObject(state) {
  const s = sanitizeGlassState(state);
  const bgStr = formatRgbaColor(s.bgColor, s.bgOpacity, '#FFFFFF');
  const filterStr = formatBackdropFilterValue(s);

  const styles = {
    background: bgStr,
    WebkitBackdropFilter: filterStr,
    backdropFilter: filterStr,
    borderRadius: `${s.borderRadius}px`
  };

  if (s.borderEnabled && s.borderWidth > 0) {
    styles.border = `${s.borderWidth}px solid ${formatRgbaColor(s.borderColor, s.borderOpacity, '#FFFFFF')}`;
  } else {
    styles.border = 'none';
  }

  if (s.shadowEnabled) {
    styles.boxShadow = `${s.shadowX}px ${s.shadowY}px ${s.shadowBlur}px ${s.shadowSpread}px ${formatRgbaColor(s.shadowColor, s.shadowOpacity, '#000000')}`;
  } else {
    styles.boxShadow = 'none';
  }

  return styles;
}

/**
 * Generates pure CSS declaration string
 */
export function generateGlassCssDeclaration(state) {
  const s = sanitizeGlassState(state);
  const lines = [];

  // Background
  lines.push(`background: ${formatRgbaColor(s.bgColor, s.bgOpacity, '#FFFFFF')};`);

  // Backdrop filter (both WebKit-prefixed and standard)
  const filterVal = formatBackdropFilterValue(s);
  lines.push(`-webkit-backdrop-filter: ${filterVal};`);
  lines.push(`backdrop-filter: ${filterVal};`);

  // Border
  if (s.borderEnabled && s.borderWidth > 0) {
    lines.push(`border: ${s.borderWidth}px solid ${formatRgbaColor(s.borderColor, s.borderOpacity, '#FFFFFF')};`);
  } else {
    lines.push(`border: none;`);
  }

  // Border Radius
  lines.push(`border-radius: ${s.borderRadius}px;`);

  // Box Shadow
  if (s.shadowEnabled) {
    lines.push(`box-shadow: ${s.shadowX}px ${s.shadowY}px ${s.shadowBlur}px ${s.shadowSpread}px ${formatRgbaColor(s.shadowColor, s.shadowOpacity, '#000000')};`);
  } else {
    lines.push(`box-shadow: none;`);
  }

  return lines.join('\n');
}

/**
 * Generates complete CSS rule (declaration, scoped class, or variable)
 */
export function generateFullGlassCss(state, format = 'declaration', identifier = 'glass-card') {
  const decl = generateGlassCssDeclaration(state);

  switch (format) {
    case 'class': {
      const safeClass = (identifier || 'glass-card').replace(/[^a-zA-Z0-9_-]/g, '') || 'glass-card';
      const indented = decl.split('\n').map(l => `  ${l}`).join('\n');
      return `.${safeClass} {\n${indented}\n}`;
    }

    case 'variable': {
      const safeProp = (identifier || 'glass-card').replace(/[^a-zA-Z0-9_-]/g, '') || 'glass-card';
      const s = sanitizeGlassState(state);
      return `:root {\n  --${safeProp}-bg: ${formatRgbaColor(s.bgColor, s.bgOpacity, '#FFFFFF')};\n  --${safeProp}-filter: ${formatBackdropFilterValue(s)};\n  --${safeProp}-radius: ${s.borderRadius}px;\n}`;
    }

    case 'declaration':
    default:
      return decl;
  }
}

/**
 * Checks whether the current browser runtime natively supports backdrop-filter
 */
export function checkBackdropFilterSupport() {
  if (typeof window === 'undefined' || typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
    return true; // Default to true in non-browser or test environments
  }

  return (
    CSS.supports('backdrop-filter', 'blur(10px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(10px)')
  );
}

/**
 * Sanitizes and validates complete glassmorphism state with safe boundary fallbacks
 */
export function sanitizeGlassState(state) {
  if (!state || typeof state !== 'object') {
    return { ...DEFAULT_GLASS_STATE };
  }

  const bgColor = isValidHex(state.bgColor) ? '#' + normalizeHex(state.bgColor, true) : DEFAULT_GLASS_STATE.bgColor;
  const bgOpacity = clampNumber(state.bgOpacity, 0, 100, DEFAULT_GLASS_STATE.bgOpacity);

  const blur = clampNumber(state.blur, 0, 100, DEFAULT_GLASS_STATE.blur);
  const saturation = clampNumber(state.saturation, 0, 300, DEFAULT_GLASS_STATE.saturation);
  const useSaturation = Boolean(state.useSaturation);

  const borderEnabled = state.borderEnabled !== undefined ? Boolean(state.borderEnabled) : true;
  const borderColor = isValidHex(state.borderColor) ? '#' + normalizeHex(state.borderColor, true) : DEFAULT_GLASS_STATE.borderColor;
  const borderOpacity = clampNumber(state.borderOpacity, 0, 100, DEFAULT_GLASS_STATE.borderOpacity);
  const borderWidth = clampNumber(state.borderWidth, 0, 20, DEFAULT_GLASS_STATE.borderWidth);

  const borderRadius = clampNumber(state.borderRadius, 0, 200, DEFAULT_GLASS_STATE.borderRadius);

  const shadowEnabled = state.shadowEnabled !== undefined ? Boolean(state.shadowEnabled) : true;
  const shadowColor = isValidHex(state.shadowColor) ? '#' + normalizeHex(state.shadowColor, true) : DEFAULT_GLASS_STATE.shadowColor;
  const shadowOpacity = clampNumber(state.shadowOpacity, 0, 100, DEFAULT_GLASS_STATE.shadowOpacity);
  const shadowX = clampNumber(state.shadowX, -100, 100, DEFAULT_GLASS_STATE.shadowX);
  const shadowY = clampNumber(state.shadowY, -100, 100, DEFAULT_GLASS_STATE.shadowY);
  const shadowBlur = clampNumber(state.shadowBlur, 0, 150, DEFAULT_GLASS_STATE.shadowBlur);
  const shadowSpread = clampNumber(state.shadowSpread, -50, 50, DEFAULT_GLASS_STATE.shadowSpread);

  const textColor = state.textColor === '#0F172A' ? '#0F172A' : '#FFFFFF';
  const previewBg = state.previewBg || DEFAULT_GLASS_STATE.previewBg;

  return {
    bgColor,
    bgOpacity,
    blur,
    saturation,
    useSaturation,
    borderEnabled,
    borderColor,
    borderOpacity,
    borderWidth,
    borderRadius,
    shadowEnabled,
    shadowColor,
    shadowOpacity,
    shadowX,
    shadowY,
    shadowBlur,
    shadowSpread,
    textColor,
    previewBg
  };
}
