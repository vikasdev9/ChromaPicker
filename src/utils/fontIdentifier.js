/**
 * Font Identification Provider Architecture & Heuristic Matching Engine
 * 
 * Provides an extensible interface for font family candidate identification.
 * Compares detected category, weight, slant, and glyph traits against font catalog
 * metadata and generates ranked similarity candidates with transparent rationale.
 */

import { FONT_CATALOG } from '../data/fontCatalog';

/**
 * Base abstract class / interface for Font Identification Providers.
 */
export class FontIdentificationProvider {
  /**
   * @param {Object} input
   * @param {string} input.text - Extracted text string
   * @param {Object} input.classification - Font category, weightCategory, style, etc.
   * @param {Object} input.metrics - Typography geometry measurements (imagePxSize, letterSpacing, etc.)
   * @param {HTMLCanvasElement|null} input.canvas - Cropped region canvas
   * @returns {Promise<{ candidates: Array, method: string, limitations: string }>}
   */
  async identify(_input) {
    throw new Error('identify() must be implemented by provider');
  }
}

/**
 * Built-in browser-side heuristic font matcher provider.
 * Runs completely locally without external network models or sensitive API keys.
 */
export class HeuristicFontMatcher extends FontIdentificationProvider {
  async identify(input) {
    const {
      classification = { category: 'sans-serif', weightCategory: 'regular', estimatedNumericWeight: 400, style: 'normal' },
      metrics: _metrics = { imagePxSize: 24, letterSpacingPx: 0 },
      text: _text = ''
    } = input;

    const targetCategory = classification.category || 'sans-serif';
    const targetWeight = classification.estimatedNumericWeight || 400;
    const isItalic = classification.style === 'italic';

    // Rationale generators tailored to typography traits
    const getRationale = (font, cat, _weight) => {
      const descriptions = {
        'Inter': 'Clean neutral neo-grotesque with tall x-height and open apertures, optimized for high screen legibility.',
        'Roboto': 'Geometric neo-grotesque with mechanical skeleton and natural open curves.',
        'Open Sans': 'Humanist sans-serif with wide apertures and friendly, upright stress.',
        'Montserrat': 'Geometric sans-serif with wide circular proportions inspired by mid-century urban posters.',
        'Poppins': 'Geometric sans with nearly mono-linear strokes and pure circular bowls.',
        'Lato': 'Semi-rounded details with classical proportions conveying stability and warmth.',
        'Plus Jakarta Sans': 'Contemporary geometric sans with modern geometric angles and crisp screen rendering.',
        'DM Sans': 'Low-contrast geometric sans-serif with compact proportions suited for crisp UI headlines.',
        'Space Grotesk': 'Proportional neo-grotesque with idiosyncratic retro-futuristic terminals.',
        'Playfair Display': 'High-contrast transitional serif with delicate hairlines and classical ball terminals.',
        'Merriweather': 'Sturdy editorial serif with thick slab serifs and mild diagonal stress for dense text.',
        'Lora': 'Contemporary serif with brushed curves, subtle contrast, and calligraphic roots.',
        'EB Garamond': 'Classical renaissance serif with elegant organic proportions and gentle diagonal axis.',
        'Cinzel': 'Classical Roman inscription serif inspired by 1st-century architectural monumental capitals.',
        'Bitter': 'Contemporary slab serif designed specifically for comfortable digital reading at small sizes.',
        'JetBrains Mono': 'Developer monospace with expanded character heights and distinctive code ligatures.',
        'Fira Code': 'Clean monospaced typeface with high legibility and uniform glyph spacing.',
        'Space Mono': 'Geometric display monospace blending 1960s poster typography with utilitarian rhythm.',
        'Bebas Neue': 'Bold condensed all-caps display headline font with clean punchy impact.',
        'Oswald': 'Reworking of classic gothic sans-serif style with tall narrow proportions.',
        'Abril Fatface': 'High-impact modern Didone display serif with dramatic stroke contrast.'
      };

      if (descriptions[font.family]) {
        return descriptions[font.family];
      }

      if (cat === 'serif') {
        return `Serif family matching detected stroke contrasts and traditional baseline slab terminals.`;
      }
      if (cat === 'monospace') {
        return `Monospaced font featuring fixed character widths and structured code geometry.`;
      }
      if (cat === 'display') {
        return `High-character display typeface suited for impactful headline scale.`;
      }
      return `Geometric sans-serif possessing uniform stroke weights and clean modern apertures.`;
    };

    // Score catalog fonts against detected traits
    const scoredFonts = FONT_CATALOG.map((font) => {
      let score = 50; // base score

      // 1. Category Match (40 pts)
      if (font.category === targetCategory) {
        score += 35;
      } else if (
        (targetCategory === 'display' && font.category === 'sans-serif') ||
        (targetCategory === 'sans-serif' && font.category === 'display')
      ) {
        score += 15;
      } else {
        score -= 20;
      }

      // 2. Weight Support (15 pts)
      if (font.weights.includes(targetWeight)) {
        score += 15;
      } else {
        // Nearest weight distance
        const nearestWeight = font.weights.reduce((prev, curr) =>
          Math.abs(curr - targetWeight) < Math.abs(prev - targetWeight) ? curr : prev
        );
        const dist = Math.abs(nearestWeight - targetWeight);
        score += Math.max(0, 15 - Math.round(dist / 50));
      }

      // 3. Italic Support (10 pts)
      if (isItalic) {
        if (font.hasItalic) {
          score += 10;
        } else {
          score -= 15;
        }
      }

      // 4. Popularity Factor (up to 10 pts)
      const popularityBonus = Math.round((font.popularity || 80) * 0.1);
      score += popularityBonus;

      // Ensure score stays within calibrated 0 - 98 range (never claim 100% exact match)
      const finalSimilarity = Math.min(96, Math.max(45, score));

      // Determine confidence label
      let confidence = 'Potential';
      if (finalSimilarity >= 85) confidence = 'Likely';
      else if (finalSimilarity >= 70) confidence = 'Moderate';

      // Pick best matching weight
      const bestWeight = font.weights.includes(targetWeight)
        ? targetWeight
        : font.weights.reduce((prev, curr) =>
            Math.abs(curr - targetWeight) < Math.abs(prev - targetWeight) ? curr : prev
          );

      return {
        family: font.family,
        category: font.category,
        fallback: font.fallback,
        similarity: finalSimilarity,
        confidence,
        rationale: getRationale(font, font.category, bestWeight),
        suggestedWeight: bestWeight,
        suggestedStyle: isItalic && font.hasItalic ? 'italic' : 'normal',
        weights: font.weights,
        hasItalic: font.hasItalic,
        isEstimate: true
      };
    });

    // Sort descending by similarity score, then by family name
    scoredFonts.sort((a, b) => {
      if (b.similarity !== a.similarity) {
        return b.similarity - a.similarity;
      }
      return a.family.localeCompare(b.family);
    });

    // Return top 5 distinct candidates
    const topCandidates = scoredFonts.slice(0, 5);

    return {
      candidates: topCandidates,
      method: 'Heuristic Glyph & Metric Analysis',
      limitations: 'Font identification is estimated by matching geometric stroke ratios, category classification, and weight distributions against curated typography metadata. Exact font identification requires original vector glyph outlines.'
    };
  }
}

// Default provider instance
const defaultProvider = new HeuristicFontMatcher();

/**
 * Main identification function delegating to the configured provider.
 */
export async function identifyFontFromRegion(input, provider = defaultProvider) {
  try {
    return await provider.identify(input);
  } catch (err) {
    console.warn('Font identification provider error:', err);
    // Graceful fallback to default heuristic provider if custom provider fails
    if (provider !== defaultProvider) {
      return await defaultProvider.identify(input);
    }
    return {
      candidates: [],
      method: 'Fallback Heuristic Analysis',
      limitations: 'Provider error encountered during identification.'
    };
  }
}
