import { describe, it, expect } from 'vitest';
import {
  exportPaletteJson,
  exportPaletteCssVariables,
  exportPaletteScss,
  exportPaletteSvg,
  exportPaletteTxt,
  exportPaletteGpl,
  exportPaletteAse
} from '../utils/downloadUtils';

describe('downloadUtils: palette exports', () => {
  const sampleColors = ['#2596BE', '#67BDD4', '#B8FFE4'];

  it('generates valid JSON with metadata and color objects', () => {
    const jsonStr = exportPaletteJson('Test Palette', sampleColors);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.name).toBe('Test Palette');
    expect(parsed.colors).toHaveLength(3);
    expect(parsed.colors[0].hex).toBe('#2596BE');
    expect(parsed.colors[0].rgb).toEqual({ r: 37, g: 150, b: 190 });
  });

  it('generates valid CSS Variables format', () => {
    const css = exportPaletteCssVariables('Test Palette', sampleColors);
    expect(css).toContain(':root {');
    expect(css).toContain('--color-1: #2596BE;');
    expect(css).toContain('--color-2: #67BDD4;');
    expect(css).toContain('}');
  });

  it('generates SCSS variables format', () => {
    const scss = exportPaletteScss('Test Palette', sampleColors);
    expect(scss).toContain('$color-1: #2596BE;');
    expect(scss).toContain('$color-2: #67BDD4;');
  });

  it('generates valid SVG swatch elements', () => {
    const svg = exportPaletteSvg('Test Palette', sampleColors);
    expect(svg).toContain('<svg');
    expect(svg).toContain('fill="#2596BE"');
    expect(svg).toContain('Test Palette');
    expect(svg).toContain('</svg>');
  });

  it('generates clean Plain TXT HEX list', () => {
    const txt = exportPaletteTxt('Test Palette', sampleColors);
    expect(txt).toContain('#2596BE');
    expect(txt).toContain('#67BDD4');
  });

  it('generates GIMP/Inkscape GPL format', () => {
    const gpl = exportPaletteGpl('Test Palette', sampleColors);
    expect(gpl).toContain('GIMP Palette');
    expect(gpl).toContain('Name: Test Palette');
  });

  it('generates valid Adobe Swatch Exchange (ASE) binary blob', async () => {
    const blob = exportPaletteAse('Test Palette', ['#FFD814', '#1D1A20']);
    expect(blob).toBeInstanceOf(Blob);
    const arrayBuffer = await blob.arrayBuffer();
    const view = new DataView(arrayBuffer);
    // Header 'ASEF'
    expect(String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3))).toBe('ASEF');
    // Version 1.0
    expect(view.getUint16(4, false)).toBe(1);
    expect(view.getUint16(6, false)).toBe(0);
    // Block count = 2
    expect(view.getUint32(8, false)).toBe(2);
  });
});

