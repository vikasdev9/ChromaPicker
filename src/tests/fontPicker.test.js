import { describe, it, expect } from 'vitest';
import {
  buildGoogleFontUrl,
  buildCombinedGoogleFontUrl,
  generateFontPairingCss
} from '../utils/fontLoader';
import { FONT_CATALOG, TYPOGRAPHY_PRESETS } from '../data/fontCatalog';

describe('Font Picker & Pairing Studio tests', () => {
  it('builds a valid Google Fonts URL for single font family', () => {
    const url = buildGoogleFontUrl('Inter', [400, 700]);
    expect(url).toBe('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
  });

  it('builds Google Fonts URL with italics when specified', () => {
    const url = buildGoogleFontUrl('Playfair Display', [400, 700], true);
    expect(url).toContain('family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700');
  });

  it('builds combined Google Fonts URL for heading and body pairing', () => {
    const combined = buildCombinedGoogleFontUrl([
      { family: 'Plus Jakarta Sans', weights: [700] },
      { family: 'Inter', weights: [400] }
    ]);
    expect(combined).toContain('family=Plus+Jakarta+Sans:wght@700');
    expect(combined).toContain('family=Inter:wght@400');
  });

  it('returns null for system fonts to avoid unnecessary network requests', () => {
    expect(buildGoogleFontUrl('sans-serif')).toBeNull();
    expect(buildGoogleFontUrl('monospace')).toBeNull();
  });

  it('generates valid scoped CSS export with variables and selectors', () => {
    const css = generateFontPairingCss({
      heading: {
        family: 'Playfair Display',
        weight: 700,
        style: 'normal',
        size: 40,
        lineHeight: 1.2,
        letterSpacing: -0.5,
        fallback: 'serif'
      },
      body: {
        family: 'Lora',
        weight: 400,
        style: 'normal',
        size: 16,
        lineHeight: 1.6,
        letterSpacing: 0,
        fallback: 'serif'
      },
      selectorPrefix: '.font-preview'
    });

    expect(css).toContain('--font-heading: \'Playfair Display\', serif;');
    expect(css).toContain('--font-body: \'Lora\', serif;');
    expect(css).toContain('.font-preview h1');
    expect(css).toContain('.font-preview p');
    expect(css).toContain('@import url(');
  });

  it('validates all typography presets map to known catalog fonts', () => {
    const catalogFamilies = new Set(FONT_CATALOG.map(f => f.family));

    TYPOGRAPHY_PRESETS.forEach(preset => {
      expect(catalogFamilies.has(preset.heading.family)).toBe(true);
      expect(catalogFamilies.has(preset.body.family)).toBe(true);
      expect(preset.heading.size).toBeGreaterThan(0);
      expect(preset.body.size).toBeGreaterThan(0);
    });
  });

  it('validates suggested pairings contain valid catalog fonts', () => {
    const catalogFamilies = new Set(FONT_CATALOG.map(f => f.family));
    FONT_CATALOG.forEach(f => {
      expect(f.weights.length).toBeGreaterThan(0);
      expect(['sans-serif', 'serif', 'monospace', 'display', 'handwriting']).toContain(f.category);
    });
  });

  it('correctly handles italic style in generated CSS', () => {
    const css = generateFontPairingCss({
      heading: {
        family: 'Playfair Display',
        weight: 700,
        style: 'italic',
        size: 38,
        lineHeight: 1.2,
        letterSpacing: 0,
        fallback: 'serif'
      },
      body: {
        family: 'Inter',
        weight: 400,
        style: 'normal',
        size: 16,
        lineHeight: 1.6,
        letterSpacing: 0,
        fallback: 'sans-serif'
      }
    });

    expect(css).toContain('font-style: italic;');
    expect(css).toContain('ital,wght@0,700;1,700');
  });

  it('preserves system font fallback in CSS variable declarations', () => {
    const css = generateFontPairingCss({
      heading: { family: 'JetBrains Mono', weight: 600, fallback: 'monospace' },
      body: { family: 'Work Sans', weight: 400, fallback: 'sans-serif' }
    });

    expect(css).toContain('--font-heading: \'JetBrains Mono\', monospace;');
    expect(css).toContain('--font-body: \'Work Sans\', sans-serif;');
  });
});
