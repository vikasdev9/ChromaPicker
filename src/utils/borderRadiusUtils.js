/**
 * Comprehensive Border-Radius Utilities for Chromapick
 * Supports 4-corner independent editing, linked mode, units (px, %),
 * CSS shorthand serialization, elliptical radii, presets, and validation.
 */

export const DEFAULT_RADIUS_STATE = {
  unit: 'px', // 'px' | '%'
  isLinked: true,
  tl: 16,
  tr: 16,
  br: 16,
  bl: 16,
  // Optional elliptical vertical radii (used when isElliptical is true)
  isElliptical: false,
  vtl: 16,
  vtr: 16,
  vbr: 16,
  vbl: 16,
  // Preview container dimensions
  previewWidth: 260,
  previewHeight: 180
};

/**
 * Normalizes a single corner numeric value based on unit
 */
export function normalizeCornerValue(val, unit = 'px') {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num) || !isFinite(num)) {
    return 0;
  }

  const clampedNonNegative = Math.max(0, Math.round(num));

  if (unit === '%') {
    return Math.min(100, clampedNonNegative);
  }

  // px: limit to sensible maximum (e.g. 2000px)
  return Math.min(9999, clampedNonNegative);
}

/**
 * Formats 4 corner values into standard CSS shorthand
 * If all 4 are identical, returns single value "16px".
 * If corners differ, returns the standard 4-value shorthand "10px 20px 30px 40px".
 */
export function formatCornerGroup(corners, unit = 'px') {
  const tl = normalizeCornerValue(corners?.tl, unit);
  const tr = normalizeCornerValue(corners?.tr, unit);
  const br = normalizeCornerValue(corners?.br, unit);
  const bl = normalizeCornerValue(corners?.bl, unit);

  // If all 4 are identical, return single value
  if (tl === tr && tr === br && br === bl) {
    return `${tl}${unit}`;
  }

  // Four-value shorthand: top-left top-right bottom-right bottom-left
  return `${tl}${unit} ${tr}${unit} ${br}${unit} ${bl}${unit}`;
}

/**
 * Generates the CSS border-radius value
 * Supports standard 4 corners or 8-point elliptical syntax (horizontal / vertical)
 */
export function generateBorderRadiusValue(state) {
  const s = sanitizeRadiusState(state);
  const horizontalStr = formatCornerGroup(
    { tl: s.tl, tr: s.tr, br: s.br, bl: s.bl },
    s.unit
  );

  if (s.isElliptical) {
    const verticalStr = formatCornerGroup(
      { tl: s.vtl, tr: s.vtr, br: s.vbr, bl: s.vbl },
      s.unit
    );
    return `${horizontalStr} / ${verticalStr}`;
  }

  return horizontalStr;
}

/**
 * Generates complete CSS declaration, class rule, or custom property
 * @param {Object} state
 * @param {'declaration' | 'class' | 'variable'} format
 * @param {string} identifier
 */
export function generateFullBorderRadiusCss(state, format = 'declaration', identifier = 'custom-box') {
  const val = generateBorderRadiusValue(state);

  switch (format) {
    case 'class': {
      const safeClass = (identifier || 'custom-box').replace(/[^a-zA-Z0-9_-]/g, '') || 'custom-box';
      return `.${safeClass} {\n  border-radius: ${val};\n}`;
    }

    case 'variable': {
      const safeProp = (identifier || 'border-radius').replace(/[^a-zA-Z0-9_-]/g, '') || 'border-radius';
      return `:root {\n  --${safeProp}: ${val};\n}`;
    }

    case 'declaration':
    default:
      return `border-radius: ${val};`;
  }
}

/**
 * Updates a single corner in the state, respecting isLinked mode
 */
export function updateCornerState(currentState, cornerKey, newValue) {
  const s = sanitizeRadiusState(currentState);
  const cleanVal = normalizeCornerValue(newValue, s.unit);

  if (s.isLinked) {
    // When linked, changing one corner updates all 4 horizontal corners
    return {
      ...s,
      tl: cleanVal,
      tr: cleanVal,
      br: cleanVal,
      bl: cleanVal,
      vtl: s.isElliptical ? cleanVal : s.vtl,
      vtr: s.isElliptical ? cleanVal : s.vtr,
      vbr: s.isElliptical ? cleanVal : s.vbr,
      vbl: s.isElliptical ? cleanVal : s.vbl
    };
  }

  // When unlinked, only the target corner changes
  return {
    ...s,
    [cornerKey]: cleanVal
  };
}

/**
 * Calculates dynamic radius values for dimensional presets (e.g. circle, pill)
 */
export function calculatePresetValues(preset, width = 260, height = 180, currentUnit = 'px') {
  if (!preset) return DEFAULT_RADIUS_STATE;

  if (preset.type === 'circle') {
    // Circle preset:
    // If unit is '%', 50% gives a perfect circle/ellipse
    // If dimensions are equal, 50% or width/2 is a circle
    if (preset.unit === '%' || currentUnit === '%') {
      return {
        unit: '%',
        isLinked: true,
        tl: 50,
        tr: 50,
        br: 50,
        bl: 50,
        isElliptical: false
      };
    }
    const side = Math.min(width, height);
    const half = Math.round(side / 2);
    return {
      unit: 'px',
      isLinked: true,
      tl: half,
      tr: half,
      br: half,
      bl: half,
      isElliptical: false
    };
  }

  if (preset.type === 'pill') {
    // Pill preset:
    // If unit is 'px', 9999px or half of height
    const halfHeight = Math.round(height / 2);
    return {
      unit: 'px',
      isLinked: true,
      tl: 9999,
      tr: 9999,
      br: 9999,
      bl: 9999,
      isElliptical: false
    };
  }

  // Standard preset
  return {
    unit: preset.unit || 'px',
    isLinked: preset.isLinked !== undefined ? preset.isLinked : false,
    tl: preset.tl ?? 0,
    tr: preset.tr ?? 0,
    br: preset.br ?? 0,
    bl: preset.bl ?? 0,
    isElliptical: Boolean(preset.isElliptical),
    vtl: preset.vtl ?? preset.tl ?? 0,
    vtr: preset.vtr ?? preset.tr ?? 0,
    vbr: preset.vbr ?? preset.br ?? 0,
    vbl: preset.vbl ?? preset.bl ?? 0
  };
}

/**
 * Sanitizes and validates complete state
 */
export function sanitizeRadiusState(state) {
  if (!state || typeof state !== 'object') {
    return { ...DEFAULT_RADIUS_STATE };
  }

  const unit = state.unit === '%' ? '%' : 'px';
  const isLinked = state.isLinked !== undefined ? Boolean(state.isLinked) : true;
  const isElliptical = Boolean(state.isElliptical);

  const getCorner = (val, fallback) => (val === undefined ? fallback : normalizeCornerValue(val, unit));

  return {
    unit,
    isLinked,
    tl: getCorner(state.tl, DEFAULT_RADIUS_STATE.tl),
    tr: getCorner(state.tr, DEFAULT_RADIUS_STATE.tr),
    br: getCorner(state.br, DEFAULT_RADIUS_STATE.br),
    bl: getCorner(state.bl, DEFAULT_RADIUS_STATE.bl),
    isElliptical,
    vtl: getCorner(state.vtl ?? state.tl, DEFAULT_RADIUS_STATE.vtl),
    vtr: getCorner(state.vtr ?? state.tr, DEFAULT_RADIUS_STATE.vtr),
    vbr: getCorner(state.vbr ?? state.br, DEFAULT_RADIUS_STATE.vbr),
    vbl: getCorner(state.vbl ?? state.bl, DEFAULT_RADIUS_STATE.vbl),
    previewWidth: typeof state.previewWidth === 'number' && state.previewWidth > 0 ? state.previewWidth : DEFAULT_RADIUS_STATE.previewWidth,
    previewHeight: typeof state.previewHeight === 'number' && state.previewHeight > 0 ? state.previewHeight : DEFAULT_RADIUS_STATE.previewHeight
  };
}
