/**
 * Comprehensive Box-Shadow & Text-Shadow Utilities for Chromapick
 * Supports multi-layer shadows, alpha opacity, inset, spread,
 * CSS serialization, layer reordering, presets, and validation.
 */

import { hexToRgb, isValidHex, normalizeHex } from './colorMath';

/**
 * Normalizes a single shadow layer ensuring valid numbers, colors, and opacity
 */
export function normalizeShadowLayer(layer, mode = 'box-shadow') {
  const isBox = mode === 'box-shadow';
  const id = layer && layer.id ? layer.id : `shadow_${Math.random().toString(36).substring(2, 9)}`;
  const enabled = layer && layer.enabled !== undefined ? Boolean(layer.enabled) : true;
  const x = typeof layer?.x === 'number' && !isNaN(layer.x) ? Math.round(layer.x) : 0;
  const y = typeof layer?.y === 'number' && !isNaN(layer.y) ? Math.round(layer.y) : (isBox ? 10 : 4);
  const blur = typeof layer?.blur === 'number' && !isNaN(layer.blur) ? Math.max(0, Math.round(layer.blur)) : (isBox ? 20 : 8);
  const spread = isBox && typeof layer?.spread === 'number' && !isNaN(layer.spread) ? Math.round(layer.spread) : 0;
  const inset = isBox ? Boolean(layer?.inset) : false;
  const color = layer && isValidHex(layer.color) ? '#' + normalizeHex(layer.color, true) : '#000000';
  const opacity = typeof layer?.opacity === 'number' && !isNaN(layer.opacity)
    ? Math.min(100, Math.max(0, Math.round(layer.opacity)))
    : 20;

  return {
    id,
    enabled,
    x,
    y,
    blur,
    spread,
    inset,
    color,
    opacity
  };
}

/**
 * Serializes color with opacity into valid CSS color string
 */
export function formatShadowColor(hex, opacity = 100) {
  const cleanHex = isValidHex(hex) ? '#' + normalizeHex(hex, true) : '#000000';
  const alphaClamped = Math.min(100, Math.max(0, Math.round(opacity)));

  if (alphaClamped >= 100) {
    return cleanHex;
  }

  const rgb = hexToRgb(cleanHex);
  const alpha = Number((alphaClamped / 100).toFixed(2));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Formats a single layer for box-shadow
 * Format: [inset] <x>px <y>px <blur>px <spread>px <color>
 */
export function formatBoxShadowLayer(layer) {
  const norm = normalizeShadowLayer(layer, 'box-shadow');
  const colorStr = formatShadowColor(norm.color, norm.opacity);
  const parts = [];

  if (norm.inset) {
    parts.push('inset');
  }

  parts.push(`${norm.x}px`);
  parts.push(`${norm.y}px`);
  parts.push(`${norm.blur}px`);
  parts.push(`${norm.spread}px`);
  parts.push(colorStr);

  return parts.join(' ');
}

/**
 * Formats a single layer for text-shadow
 * Format: <x>px <y>px <blur>px <color>
 * (text-shadow does NOT support spread or inset)
 */
export function formatTextShadowLayer(layer) {
  const norm = normalizeShadowLayer(layer, 'text-shadow');
  const colorStr = formatShadowColor(norm.color, norm.opacity);

  return `${norm.x}px ${norm.y}px ${norm.blur}px ${colorStr}`;
}

/**
 * Generates the CSS shadow value (comma-separated list of enabled layers)
 * Returns 'none' if all layers are disabled or empty.
 */
export function generateShadowValue(layers, mode = 'box-shadow') {
  if (!Array.isArray(layers) || layers.length === 0) {
    return 'none';
  }

  const enabledLayers = layers.filter(l => l && l.enabled !== false);
  if (enabledLayers.length === 0) {
    return 'none';
  }

  if (mode === 'text-shadow') {
    return enabledLayers.map(formatTextShadowLayer).join(', ');
  }

  return enabledLayers.map(formatBoxShadowLayer).join(', ');
}

/**
 * Generates full CSS rule or declaration
 * @param {Array} layers
 * @param {'box-shadow' | 'text-shadow'} mode
 * @param {'declaration' | 'class' | 'variable'} format
 * @param {string} identifier - class name or custom variable name
 */
export function generateFullShadowCss(layers, mode = 'box-shadow', format = 'declaration', identifier = 'shadow-element') {
  const prop = mode === 'text-shadow' ? 'text-shadow' : 'box-shadow';
  const val = generateShadowValue(layers, mode);

  switch (format) {
    case 'class': {
      const safeClass = (identifier || 'shadow-element').replace(/[^a-zA-Z0-9_-]/g, '') || 'shadow-element';
      return `.${safeClass} {\n  ${prop}: ${val};\n}`;
    }

    case 'variable': {
      const safeProp = (identifier || prop).replace(/[^a-zA-Z0-9_-]/g, '') || prop;
      return `:root {\n  --${safeProp}: ${val};\n}`;
    }

    case 'declaration':
    default:
      return `${prop}: ${val};`;
  }
}

/**
 * Reorders a layer in the array from fromIndex to toIndex
 */
export function reorderLayers(layers, fromIndex, toIndex) {
  if (fromIndex < 0 || fromIndex >= layers.length || toIndex < 0 || toIndex >= layers.length) {
    return layers;
  }
  const result = [...layers];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Duplicates a layer at index and returns new array
 */
export function duplicateLayer(layers, index) {
  if (index < 0 || index >= layers.length) return layers;
  const target = layers[index];
  const clone = {
    ...target,
    id: `shadow_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    // Nudge offset slightly so the duplicate is immediately noticeable
    x: target.x + 2,
    y: target.y + 2
  };
  const result = [...layers];
  result.splice(index + 1, 0, clone);
  return result;
}

/**
 * Sanitizes and validates a complete shadow state object or preset
 */
export function sanitizeShadowState(data, defaultMode = 'box-shadow') {
  const mode = data?.mode
    ? (data.mode === 'text-shadow' ? 'text-shadow' : 'box-shadow')
    : (defaultMode === 'text-shadow' ? 'text-shadow' : 'box-shadow');
  let layers = [];

  if (Array.isArray(data?.layers) && data.layers.length > 0) {
    layers = data.layers.map(l => normalizeShadowLayer(l, mode));
  } else {
    // Sensible defaults
    if (mode === 'text-shadow') {
      layers = [
        normalizeShadowLayer({ x: 0, y: 4, blur: 10, color: '#000000', opacity: 30 }, 'text-shadow')
      ];
    } else {
      layers = [
        normalizeShadowLayer({ x: 0, y: 10, blur: 25, spread: -5, color: '#000000', opacity: 15 }, 'box-shadow'),
        normalizeShadowLayer({ x: 0, y: 4, blur: 10, spread: -3, color: '#000000', opacity: 10 }, 'box-shadow')
      ];
    }
  }

  return {
    mode,
    layers
  };
}
