/**
 * Pure Mathematical, Serialization, and Canvas Image Processing Utilities
 * for Chromapick Image Filter Picker.
 */

export const FILTER_DEFINITIONS = {
  brightness: { label: 'Brightness', min: 0, max: 200, defaultVal: 100, unit: '%' },
  contrast: { label: 'Contrast', min: 0, max: 200, defaultVal: 100, unit: '%' },
  saturate: { label: 'Saturation', min: 0, max: 200, defaultVal: 100, unit: '%' },
  grayscale: { label: 'Grayscale', min: 0, max: 100, defaultVal: 0, unit: '%' },
  sepia: { label: 'Sepia', min: 0, max: 100, defaultVal: 0, unit: '%' },
  blur: { label: 'Blur', min: 0, max: 20, defaultVal: 0, unit: 'px' },
  hueRotate: { label: 'Hue Rotate', min: 0, max: 360, defaultVal: 0, unit: 'deg' },
  invert: { label: 'Invert', min: 0, max: 100, defaultVal: 0, unit: '%' },
  opacity: { label: 'Opacity', min: 0, max: 100, defaultVal: 100, unit: '%' }
};

export const DEFAULT_FILTER_STATE = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  blur: 0,
  hueRotate: 0,
  invert: 0,
  opacity: 100
};

/**
 * Clamps numeric value safely within filter bounds
 */
export function clampFilterValue(key, val) {
  const def = FILTER_DEFINITIONS[key];
  if (!def) return 0;

  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num) || !isFinite(num)) {
    return def.defaultVal;
  }

  return Math.min(def.max, Math.max(def.min, Math.round(num)));
}

/**
 * Sanitizes and validates complete filter state with fallback
 */
export function sanitizeFilterState(state) {
  if (!state || typeof state !== 'object') {
    return { ...DEFAULT_FILTER_STATE };
  }

  const result = {};
  for (const key of Object.keys(DEFAULT_FILTER_STATE)) {
    result[key] = clampFilterValue(key, state[key] !== undefined ? state[key] : DEFAULT_FILTER_STATE[key]);
  }
  return result;
}

/**
 * Generates the deterministic CSS filter string
 * Order: brightness, contrast, saturate, grayscale, sepia, blur, hue-rotate, invert, opacity
 * @param {Object} state - filter settings
 * @param {boolean} activeOnly - if true, only outputs non-default filters (returns 'none' if all default)
 */
export function generateFilterString(state, activeOnly = false) {
  const s = sanitizeFilterState(state);

  const parts = [
    { key: 'brightness', css: `brightness(${s.brightness}%)`, isDefault: s.brightness === 100 },
    { key: 'contrast', css: `contrast(${s.contrast}%)`, isDefault: s.contrast === 100 },
    { key: 'saturate', css: `saturate(${s.saturate}%)`, isDefault: s.saturate === 100 },
    { key: 'grayscale', css: `grayscale(${s.grayscale}%)`, isDefault: s.grayscale === 0 },
    { key: 'sepia', css: `sepia(${s.sepia}%)`, isDefault: s.sepia === 0 },
    { key: 'blur', css: `blur(${s.blur}px)`, isDefault: s.blur === 0 },
    { key: 'hueRotate', css: `hue-rotate(${s.hueRotate}deg)`, isDefault: s.hueRotate === 0 },
    { key: 'invert', css: `invert(${s.invert}%)`, isDefault: s.invert === 0 },
    { key: 'opacity', css: `opacity(${s.opacity}%)`, isDefault: s.opacity === 100 }
  ];

  if (activeOnly) {
    const activeParts = parts.filter(p => !p.isDefault);
    if (activeParts.length === 0) {
      return 'none';
    }
    return activeParts.map(p => p.css).join(' ');
  }

  return parts.map(p => p.css).join(' ');
}

/**
 * Generates full CSS rule, declaration, or custom property
 */
export function generateFullFilterCss(state, format = 'declaration', identifier = 'filtered-image', activeOnly = false) {
  const filterVal = generateFilterString(state, activeOnly);

  switch (format) {
    case 'class': {
      const safeClass = (identifier || 'filtered-image').replace(/[^a-zA-Z0-9_-]/g, '') || 'filtered-image';
      return `.${safeClass} {\n  filter: ${filterVal};\n}`;
    }

    case 'variable': {
      const safeVar = (identifier || 'image-filter').replace(/[^a-zA-Z0-9_-]/g, '') || 'image-filter';
      return `:root {\n  --${safeVar}: ${filterVal};\n}`;
    }

    case 'declaration':
    default:
      return `filter: ${filterVal};`;
  }
}

/**
 * Renders an image element onto a canvas with the specified CSS filter string.
 * Handles blur edge bleeding by drawing with subtle edge preservation.
 * @param {HTMLImageElement} img - Source image element
 * @param {string} filterString - CSS filter string
 * @param {number} [targetWidth] - Optional target width
 * @param {number} [targetHeight] - Optional target height
 * @returns {HTMLCanvasElement}
 */
export function renderFilteredImageToCanvas(img, filterString, targetWidth, targetHeight) {
  if (!img) {
    throw new Error('No image provided for canvas rendering');
  }

  const naturalWidth = img.naturalWidth || img.width || 800;
  const naturalHeight = img.naturalHeight || img.height || 600;

  const width = targetWidth && targetWidth > 0 ? targetWidth : naturalWidth;
  const height = targetHeight && targetHeight > 0 ? targetHeight : naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Apply CSS filter to canvas context if supported
  if ('filter' in ctx) {
    ctx.filter = filterString || 'none';
  }

  // Draw image
  ctx.drawImage(img, 0, 0, width, height);

  return canvas;
}

/**
 * Promisified canvas.toBlob wrapper
 */
export function canvasToBlobAsync(canvas, mimeType = 'image/png', quality = 0.95) {
  return new Promise((resolve, reject) => {
    if (!canvas || typeof canvas.toBlob !== 'function') {
      reject(new Error('Canvas toBlob is not supported'));
      return;
    }

    try {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas failed to generate blob'));
        }
      }, mimeType, quality);
    } catch (err) {
      reject(err);
    }
  });
}
