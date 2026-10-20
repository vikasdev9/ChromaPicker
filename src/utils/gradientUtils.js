/**
 * Comprehensive CSS Gradient Mathematics, Serialization, and Export Utilities
 * Supporting Linear, Radial, and Conic gradients with repeating modes,
 * alpha opacity, SVG export, and PNG canvas rendering.
 */

import { hexToRgb, isValidHex, normalizeHex } from './colorMath';

/**
 * Normalizes a color stop ensuring valid hex, alpha opacity, and bounded position
 */
export function normalizeStop(stop, defaultPos = 0) {
  const color = stop && isValidHex(stop.color) ? normalizeHex(stop.color, true) : '2596BE';
  const pos = typeof stop.pos === 'number' && !isNaN(stop.pos) ? Math.min(100, Math.max(0, Math.round(stop.pos))) : defaultPos;
  const opacity = typeof stop.opacity === 'number' && !isNaN(stop.opacity) ? Math.min(100, Math.max(0, Math.round(stop.opacity))) : 100;
  const id = stop.id || `stop_${Math.random().toString(36).substring(2, 9)}`;

  return {
    id,
    color: `#${color}`,
    pos,
    opacity
  };
}

/**
 * Formats a single stop into valid CSS color with position
 * E.g., "#2596BE 0%" or "rgba(37, 150, 190, 0.5) 50%"
 */
export function formatCssStop(stop) {
  const pos = `${Math.min(100, Math.max(0, Math.round(stop.pos)))}%`;
  const opacity = typeof stop.opacity === 'number' ? stop.opacity : 100;

  if (opacity >= 100) {
    return `${stop.color} ${pos}`;
  }

  const rgb = hexToRgb(stop.color);
  const alpha = Number((opacity / 100).toFixed(2));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha}) ${pos}`;
}

/**
 * Calculates start and end points (x1, y1, x2, y2) in percentages for an SVG linearGradient from degrees
 */
export function angleToSvgCoordinates(angleDeg) {
  // SVG angles: 0deg is to right, CSS angles: 0deg is to top
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const x1 = Math.round(50 - Math.cos(rad) * 50);
  const y1 = Math.round(50 - Math.sin(rad) * 50);
  const x2 = Math.round(50 + Math.cos(rad) * 50);
  const y2 = Math.round(50 + Math.sin(rad) * 50);

  return { x1: `${x1}%`, y1: `${y1}%`, x2: `${x2}%`, y2: `${y2}%` };
}

/**
 * Generates the pure CSS gradient string based on the gradient state
 * Supports:
 * - linear-gradient & repeating-linear-gradient
 * - radial-gradient & repeating-radial-gradient
 * - conic-gradient & repeating-conic-gradient
 */
export function generateCssGradient(state) {
  if (!state || !state.stops || state.stops.length === 0) {
    return 'linear-gradient(135deg, #2596BE 0%, #B8FFE4 100%)';
  }

  // Sort stops by position for standard rendering
  const sortedStops = [...state.stops].sort((a, b) => a.pos - b.pos);
  const stopsString = sortedStops.map(formatCssStop).join(', ');

  const isRepeating = Boolean(state.repeating);

  switch (state.type) {
    case 'radial': {
      const funcName = isRepeating ? 'repeating-radial-gradient' : 'radial-gradient';
      const shape = state.radialShape || 'circle';
      const extent = state.radialExtent || 'farthest-corner';
      const posX = state.radialPositionX !== undefined ? state.radialPositionX : 50;
      const posY = state.radialPositionY !== undefined ? state.radialPositionY : 50;

      // Format: radial-gradient(circle farthest-corner at 50% 50%, #color 0%, ...)
      return `${funcName}(${shape} ${extent} at ${posX}% ${posY}%, ${stopsString})`;
    }

    case 'conic': {
      const funcName = isRepeating ? 'repeating-conic-gradient' : 'conic-gradient';
      const angle = state.conicAngle !== undefined ? state.conicAngle : 0;
      const posX = state.conicPositionX !== undefined ? state.conicPositionX : 50;
      const posY = state.conicPositionY !== undefined ? state.conicPositionY : 50;

      // Format: conic-gradient(from 0deg at 50% 50%, #color 0%, ...)
      return `${funcName}(from ${angle}deg at ${posX}% ${posY}%, ${stopsString})`;
    }

    case 'linear':
    default: {
      const funcName = isRepeating ? 'repeating-linear-gradient' : 'linear-gradient';
      const angle = state.angle !== undefined ? state.angle : 135;
      return `${funcName}(${angle}deg, ${stopsString})`;
    }
  }
}

/**
 * Generates formatted CSS code for various export formats
 * @param {Object} state - Gradient state
 * @param {'declaration' | 'class' | 'variable'} format
 * @param {string} identifier - class name or custom variable name
 */
export function generateFullCss(state, format = 'declaration', identifier = 'gradient-background') {
  const cssGradient = generateCssGradient(state);

  switch (format) {
    case 'class': {
      const safeClass = identifier.replace(/[^a-zA-Z0-9_-]/g, '') || 'gradient-background';
      return `.${safeClass} {\n  background: ${cssGradient};\n}`;
    }

    case 'variable': {
      const safeProp = identifier.replace(/[^a-zA-Z0-9_-]/g, '') || 'gradient-background';
      return `:root {\n  --${safeProp}: ${cssGradient};\n}`;
    }

    case 'declaration':
    default:
      return `background: ${cssGradient};`;
  }
}

/**
 * Generates a full scalable SVG vector string from gradient state
 */
export function generateGradientSvg(state, width = 1200, height = 800) {
  const sortedStops = [...state.stops].sort((a, b) => a.pos - b.pos);

  const svgStops = sortedStops.map(s => {
    const opacity = typeof s.opacity === 'number' ? s.opacity / 100 : 1;
    return `      <stop offset="${s.pos}%" stop-color="${s.color}" stop-opacity="${opacity}" />`;
  }).join('\n');

  if (state.type === 'radial') {
    const cx = (state.radialPositionX !== undefined ? state.radialPositionX : 50) + '%';
    const cy = (state.radialPositionY !== undefined ? state.radialPositionY : 50) + '%';
    const r = '50%';

    return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="chromaGradient" cx="${cx}" cy="${cy}" r="${r}" fx="${cx}" fy="${cy}">
${svgStops}
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#chromaGradient)" />
</svg>`;
  }

  if (state.type === 'conic') {
    // Conic gradient representation via embedded foreignObject with standard CSS conic-gradient
    const cssGradient = generateCssGradient(state);
    return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;background:${cssGradient};"></div>
  </foreignObject>
</svg>`;
  }

  // Linear gradient
  const coords = angleToSvgCoordinates(state.angle !== undefined ? state.angle : 135);

  return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="chromaGradient" x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}">
${svgStops}
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#chromaGradient)" />
</svg>`;
}

/**
 * Renders the gradient to an offscreen Canvas and returns a Blob / data URL for PNG export
 */
export async function renderGradientToCanvas(state, width = 1200, height = 800) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  const sortedStops = [...state.stops].sort((a, b) => a.pos - b.pos);

  // Helper to get rgba string for canvas stop
  const getCanvasColor = (stop) => {
    const opacity = typeof stop.opacity === 'number' ? stop.opacity / 100 : 1;
    const rgb = hexToRgb(stop.color);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  };

  if (state.type === 'radial') {
    const cx = ((state.radialPositionX !== undefined ? state.radialPositionX : 50) / 100) * width;
    const cy = ((state.radialPositionY !== undefined ? state.radialPositionY : 50) / 100) * height;
    const r = Math.max(width, height) / 2;

    const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    sortedStops.forEach(s => radGrad.addColorStop(s.pos / 100, getCanvasColor(s)));
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, width, height);
  } else if (state.type === 'conic' && typeof ctx.createConicGradient === 'function') {
    const startAngleRad = ((state.conicAngle !== undefined ? state.conicAngle : 0) * Math.PI) / 180;
    const cx = ((state.conicPositionX !== undefined ? state.conicPositionX : 50) / 100) * width;
    const cy = ((state.conicPositionY !== undefined ? state.conicPositionY : 50) / 100) * height;

    const conicGrad = ctx.createConicGradient(startAngleRad, cx, cy);
    sortedStops.forEach(s => conicGrad.addColorStop(s.pos / 100, getCanvasColor(s)));
    ctx.fillStyle = conicGrad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Linear gradient
    const angleDeg = state.angle !== undefined ? state.angle : 135;
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const halfDiag = Math.sqrt(width * width + height * height) / 2;
    const cx = width / 2;
    const cy = height / 2;

    const x1 = cx - Math.cos(rad) * halfDiag;
    const y1 = cy - Math.sin(rad) * halfDiag;
    const x2 = cx + Math.cos(rad) * halfDiag;
    const y2 = cy + Math.sin(rad) * halfDiag;

    const linGrad = ctx.createLinearGradient(x1, y1, x2, y2);
    sortedStops.forEach(s => linGrad.addColorStop(s.pos / 100, getCanvasColor(s)));
    ctx.fillStyle = linGrad;
    ctx.fillRect(0, 0, width, height);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas export to blob failed'));
    }, 'image/png');
  });
}

/**
 * Reverses the visual gradient: inverts stop positions (100 - pos) and preserves color order
 */
export function reverseGradient(state) {
  const reversedStops = state.stops.map(s => ({
    ...s,
    pos: 100 - s.pos
  })).sort((a, b) => a.pos - b.pos);

  return {
    ...state,
    stops: reversedStops
  };
}

/**
 * Generates a randomized, visually harmonic gradient state
 */
export function randomizeGradient(currentType = 'linear') {
  // Vibrant, curated color pools for balanced randomized palettes
  const colorPool = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B',
    '#06B6D4', '#6366F1', '#14B8A6', '#F43F5E', '#2596BE',
    '#B8FFE4', '#FFD5BE', '#FFB6D2', '#A855F7', '#0EA5E9'
  ];

  // Pick 2 to 4 unique colors
  const stopCount = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4 stops
  const shuffled = [...colorPool].sort(() => 0.5 - Math.random());
  const selectedColors = shuffled.slice(0, stopCount);

  let positions = [];
  if (stopCount === 2) {
    positions = [0, 100];
  } else if (stopCount === 3) {
    positions = [0, Math.floor(Math.random() * 30) + 35, 100];
  } else {
    positions = [0, 30, 70, 100];
  }

  const stops = selectedColors.map((color, idx) => ({
    id: `stop_rand_${idx}_${Date.now()}`,
    color,
    pos: positions[idx],
    opacity: 100
  }));

  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  const randomAngle = angles[Math.floor(Math.random() * angles.length)];

  return {
    type: currentType,
    angle: randomAngle,
    repeating: false,
    radialShape: 'circle',
    radialExtent: 'farthest-corner',
    radialPositionX: 50,
    radialPositionY: 50,
    conicAngle: 0,
    conicPositionX: 50,
    conicPositionY: 50,
    stops
  };
}

/**
 * Validates and safely normalizes any imported or stored gradient state
 */
export function sanitizeGradientState(data, fallback = null) {
  const defaultState = {
    type: 'linear',
    angle: 135,
    repeating: false,
    radialShape: 'circle',
    radialExtent: 'farthest-corner',
    radialPositionX: 50,
    radialPositionY: 50,
    conicAngle: 0,
    conicPositionX: 50,
    conicPositionY: 50,
    stops: [
      { id: 'stop_1', color: '#2596BE', pos: 0, opacity: 100 },
      { id: 'stop_2', color: '#B8FFE4', pos: 100, opacity: 100 }
    ]
  };

  if (!data || typeof data !== 'object') {
    return fallback || defaultState;
  }

  const validTypes = ['linear', 'radial', 'conic'];
  const type = validTypes.includes(data.type) ? data.type : 'linear';
  const angle = typeof data.angle === 'number' && !isNaN(data.angle) ? ((data.angle % 360) + 360) % 360 : 135;
  const repeating = Boolean(data.repeating);

  const radialShape = data.radialShape === 'ellipse' ? 'ellipse' : 'circle';
  const radialExtent = ['closest-side', 'closest-corner', 'farthest-side', 'farthest-corner'].includes(data.radialExtent)
    ? data.radialExtent
    : 'farthest-corner';

  const radialPositionX = typeof data.radialPositionX === 'number' ? Math.min(100, Math.max(0, data.radialPositionX)) : 50;
  const radialPositionY = typeof data.radialPositionY === 'number' ? Math.min(100, Math.max(0, data.radialPositionY)) : 50;

  const conicAngle = typeof data.conicAngle === 'number' ? ((data.conicAngle % 360) + 360) % 360 : 0;
  const conicPositionX = typeof data.conicPositionX === 'number' ? Math.min(100, Math.max(0, data.conicPositionX)) : 50;
  const conicPositionY = typeof data.conicPositionY === 'number' ? Math.min(100, Math.max(0, data.conicPositionY)) : 50;

  // Validate stops
  let stops = [];
  if (Array.isArray(data.stops) && data.stops.length >= 2) {
    stops = data.stops.map((s, idx) => normalizeStop(s, idx === 0 ? 0 : 100));
  } else {
    stops = [
      { id: 'stop_1', color: '#2596BE', pos: 0, opacity: 100 },
      { id: 'stop_2', color: '#B8FFE4', pos: 100, opacity: 100 }
    ];
  }

  return {
    type,
    angle,
    repeating,
    radialShape,
    radialExtent,
    radialPositionX,
    radialPositionY,
    conicAngle,
    conicPositionX,
    conicPositionY,
    stops
  };
}
