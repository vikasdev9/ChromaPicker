/**
 * Utility for on-demand dynamic Google Font loading, deduplication, and CSS export generation.
 */

const loadedFonts = new Set();

const SYSTEM_FONTS = new Set([
  'sans-serif',
  'serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Courier New'
]);

/**
 * Builds the Google Fonts CSS2 URL for a single font family.
 * e.g. https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700&display=swap
 */
export function buildGoogleFontUrl(family, weights = [400, 700], includeItalic = false) {
  if (!family || SYSTEM_FONTS.has(family)) return null;

  const encodedFamily = encodeURIComponent(family).replace(/%20/g, '+');
  const sortedWeights = Array.from(new Set(weights.map(Number))).sort((a, b) => a - b);

  if (sortedWeights.length === 0) sortedWeights.push(400);

  if (includeItalic) {
    const tuples = [];
    sortedWeights.forEach(w => tuples.push(`0,${w}`));
    sortedWeights.forEach(w => tuples.push(`1,${w}`));
    return `https://fonts.googleapis.com/css2?family=${encodedFamily}:ital,wght@${tuples.join(';')}&display=swap`;
  }

  return `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${sortedWeights.join(';')}&display=swap`;
}

/**
 * Builds a combined Google Fonts CSS2 URL for multiple font families.
 */
export function buildCombinedGoogleFontUrl(fontConfigs = []) {
  const validConfigs = fontConfigs.filter(cfg => cfg && cfg.family && !SYSTEM_FONTS.has(cfg.family));
  if (validConfigs.length === 0) return null;

  const parts = validConfigs.map(cfg => {
    const encodedFamily = encodeURIComponent(cfg.family).replace(/%20/g, '+');
    const weights = Array.from(new Set((cfg.weights || [400, 700]).map(Number))).sort((a, b) => a - b);
    if (cfg.hasItalic || cfg.style === 'italic') {
      const tuples = [];
      weights.forEach(w => tuples.push(`0,${w}`));
      weights.forEach(w => tuples.push(`1,${w}`));
      return `family=${encodedFamily}:ital,wght@${tuples.join(';')}`;
    }
    return `family=${encodedFamily}:wght@${weights.join(';')}`;
  });

  return `https://fonts.googleapis.com/css2?${parts.join('&')}&display=swap`;
}

/**
 * Asynchronously loads a font family into document.head on demand with deduplication.
 */
export function loadFontOnDemand(family, weights = [400, 700], includeItalic = false) {
  if (typeof document === 'undefined') return Promise.resolve(true);
  if (!family || SYSTEM_FONTS.has(family)) return Promise.resolve(true);

  const cacheKey = `${family}:${weights.join(',')}:${includeItalic}`;
  if (loadedFonts.has(cacheKey)) {
    return Promise.resolve(true);
  }

  const url = buildGoogleFontUrl(family, weights, includeItalic);
  if (!url) return Promise.resolve(true);

  return new Promise((resolve) => {
    // Check if element with this URL already exists in head
    const existing = document.querySelector(`link[href="${url}"]`);
    if (existing) {
      loadedFonts.add(cacheKey);
      resolve(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => {
      loadedFonts.add(cacheKey);
      resolve(true);
    };
    link.onerror = () => {
      console.warn(`Could not load font: ${family}`);
      resolve(false);
    };

    document.head.appendChild(link);
  });
}

/**
 * Generates clean, production-grade scoped CSS export.
 */
export function generateFontPairingCss({ heading, body, selectorPrefix = '.font-preview' }) {
  const combinedUrl = buildCombinedGoogleFontUrl([
    { family: heading.family, weights: [heading.weight], style: heading.style },
    { family: body.family, weights: [body.weight], style: body.style }
  ]);

  const importStatement = combinedUrl
    ? `@import url('${combinedUrl}');\n\n`
    : '';

  const quoteFamily = (fam) => {
    if (!fam || SYSTEM_FONTS.has(fam)) return fam;
    return fam.startsWith("'") || fam.startsWith('"') ? fam : `'${fam}'`;
  };

  const safeHeadingFamily = quoteFamily(heading.family);
  const safeBodyFamily = quoteFamily(body.family);

  return `${importStatement}/* Chromapick Typography Variables */
:root {
  --font-heading: ${safeHeadingFamily}, ${heading.fallback || 'sans-serif'};
  --font-body: ${safeBodyFamily}, ${body.fallback || 'sans-serif'};
}

/* Headings */
${selectorPrefix} h1,
${selectorPrefix} h2,
${selectorPrefix} h3,
${selectorPrefix} .font-heading {
  font-family: var(--font-heading);
  font-weight: ${heading.weight};
  font-style: ${heading.style || 'normal'};
  font-size: ${heading.size}px;
  line-height: ${heading.lineHeight};
  letter-spacing: ${heading.letterSpacing}px;
}

/* Body & Paragraph Text */
${selectorPrefix} p,
${selectorPrefix} body,
${selectorPrefix} .font-body {
  font-family: var(--font-body);
  font-weight: ${body.weight};
  font-style: ${body.style || 'normal'};
  font-size: ${body.size}px;
  line-height: ${body.lineHeight};
  letter-spacing: ${body.letterSpacing}px;
}

/* Button & Interactive Label */
${selectorPrefix} button,
${selectorPrefix} .btn-label {
  font-family: var(--font-body);
  font-weight: ${Math.min(700, Math.max(500, Number(body.weight) + 100))};
  font-size: 0.95rem;
  letter-spacing: 0.02em;
}
`;
}
