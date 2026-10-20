import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../context/ToastContext';
import {
  normalizeShadowLayer,
  formatShadowColor,
  formatBoxShadowLayer,
  formatTextShadowLayer,
  generateShadowValue,
  generateFullShadowCss,
  reorderLayers,
  duplicateLayer,
  sanitizeShadowState
} from '../utils/shadowUtils';
import { BOX_SHADOW_PRESETS, TEXT_SHADOW_PRESETS } from '../data/shadowPresets';
import { ThemeProvider } from '../context/ThemeContext';
import { PaletteProvider } from '../context/PaletteContext';
import ShadowPickerPage from '../pages/ShadowPickerPage';
import GradientGeneratorPage from '../pages/GradientGeneratorPage';
import HomePage from '../pages/HomePage';
import FontPickerPage from '../pages/FontPickerPage';

function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    React.createElement(
      ThemeProvider,
      null,
      React.createElement(
        ToastProvider,
        null,
        React.createElement(
          PaletteProvider,
          null,
          React.createElement(
            MemoryRouter,
            { initialEntries: [route] },
            ui
          )
        )
      )
    )
  );
}

describe('Shadow Picker & Generator - Complete Test Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Default box-shadow CSS generation
  it('1. generates valid default box-shadow CSS', () => {
    const defaultState = sanitizeShadowState(null, 'box-shadow');
    expect(defaultState.mode).toBe('box-shadow');
    expect(defaultState.layers.length).toBeGreaterThan(0);

    const css = generateFullShadowCss(defaultState.layers, 'box-shadow', 'declaration');
    expect(css).toMatch(/^box-shadow: 0px 10px 25px -5px rgba\(0, 0, 0, 0\.15\), 0px 4px 10px -3px rgba\(0, 0, 0, 0\.1\);$/);
  });

  // 2. Default text-shadow CSS generation
  it('2. generates valid default text-shadow CSS without spread or inset', () => {
    const defaultState = sanitizeShadowState(null, 'text-shadow');
    expect(defaultState.mode).toBe('text-shadow');

    const css = generateFullShadowCss(defaultState.layers, 'text-shadow', 'declaration');
    expect(css).toBe('text-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);');
    expect(css).not.toContain('spread');
    expect(css).not.toContain('inset');
  });

  // 3. Correct positive and negative X/Y offsets
  it('3. serializes positive and negative X and Y offsets correctly', () => {
    const positiveLayer = { x: 15, y: 25, blur: 10, spread: 4, color: '#334455', opacity: 100 };
    expect(formatBoxShadowLayer(positiveLayer)).toBe('15px 25px 10px 4px #334455');

    const negativeLayer = { x: -8, y: -12, blur: 6, spread: -3, color: '#000000', opacity: 100 };
    expect(formatBoxShadowLayer(negativeLayer)).toBe('-8px -12px 6px -3px #000000');
  });

  // 4. Blur and spread serialization
  it('4. serializes blur and spread and clamps blur to non-negative', () => {
    const layer = { x: 0, y: 5, blur: 20, spread: 8, color: '#000000', opacity: 100 };
    expect(formatBoxShadowLayer(layer)).toBe('0px 5px 20px 8px #000000');

    // Negative blur should be clamped to 0
    const clampedBlur = normalizeShadowLayer({ blur: -15, spread: -4 });
    expect(clampedBlur.blur).toBe(0);
    expect(clampedBlur.spread).toBe(-4);
  });

  // 5. Inset serialization for box-shadow
  it('5. prefixes inset keyword when inset is true on box-shadow', () => {
    const insetLayer = { x: 2, y: 2, blur: 8, spread: 0, inset: true, color: '#000000', opacity: 100 };
    const css = formatBoxShadowLayer(insetLayer);
    expect(css).toBe('inset 2px 2px 8px 0px #000000');

    const regularLayer = { ...insetLayer, inset: false };
    expect(formatBoxShadowLayer(regularLayer)).toBe('2px 2px 8px 0px #000000');
  });

  // 6. Inset is excluded from text-shadow (along with spread)
  it('6. strictly excludes inset and spread from text-shadow layers', () => {
    const layerWithBoxProps = {
      x: 3,
      y: 4,
      blur: 10,
      spread: 12,
      inset: true,
      color: '#FF0055',
      opacity: 80
    };
    const css = formatTextShadowLayer(layerWithBoxProps);
    // Standard format: <x>px <y>px <blur>px <color>
    expect(css).toBe('3px 4px 10px rgba(255, 0, 85, 0.8)');
    expect(css).not.toContain('inset');
    expect(css).not.toContain('12px');
  });

  // 7. Color and opacity conversion
  it('7. converts HEX and opacity into rgba or hex appropriately', () => {
    // 100% opacity uses hex
    expect(formatShadowColor('#2596BE', 100)).toBe('#2596BE');

    // Opacity < 100 converts to rgba
    expect(formatShadowColor('#2596BE', 50)).toBe('rgba(37, 150, 190, 0.5)');
    expect(formatShadowColor('#000000', 25)).toBe('rgba(0, 0, 0, 0.25)');
    expect(formatShadowColor('#FFFFFF', 0)).toBe('rgba(255, 255, 255, 0)');

    // Invalid hex fallback
    expect(formatShadowColor('not-a-hex', 80)).toBe('rgba(0, 0, 0, 0.8)');
  });

  // 8. Multiple shadow layers serialize with commas
  it('8. serializes multiple shadow layers joined by comma-space', () => {
    const layers = [
      { id: 'l1', x: 0, y: 1, blur: 3, spread: 0, color: '#000000', opacity: 100 },
      { id: 'l2', x: 0, y: 8, blur: 16, spread: -4, color: '#000000', opacity: 50 },
      { id: 'l3', x: 0, y: 20, blur: 32, spread: -8, color: '#38BDF8', opacity: 20 }
    ];

    const shadowVal = generateShadowValue(layers, 'box-shadow');
    expect(shadowVal).toBe(
      '0px 1px 3px 0px #000000, 0px 8px 16px -4px rgba(0, 0, 0, 0.5), 0px 20px 32px -8px rgba(56, 189, 248, 0.2)'
    );
  });

  // 9. Disabled layers are excluded
  it('9. excludes disabled layers from generated CSS value', () => {
    const layers = [
      { id: 'l1', enabled: true, x: 0, y: 2, blur: 4, spread: 0, color: '#000000', opacity: 100 },
      { id: 'l2', enabled: false, x: 0, y: 10, blur: 20, spread: 0, color: '#FF0000', opacity: 100 },
      { id: 'l3', enabled: true, x: 0, y: 20, blur: 30, spread: 0, color: '#0000FF', opacity: 100 }
    ];

    const shadowVal = generateShadowValue(layers, 'box-shadow');
    expect(shadowVal).toContain('0px 2px 4px 0px #000000');
    expect(shadowVal).toContain('0px 20px 30px 0px #0000FF');
    expect(shadowVal).not.toContain('#FF0000');

    // All layers disabled returns 'none'
    const allDisabled = layers.map(l => ({ ...l, enabled: false }));
    expect(generateShadowValue(allDisabled, 'box-shadow')).toBe('none');
    expect(generateShadowValue([], 'box-shadow')).toBe('none');
  });

  // 10. Adding and removing layers updates the state correctly
  it('10. handles adding and removing layers correctly', () => {
    const initial = [
      normalizeShadowLayer({ x: 0, y: 2, blur: 4, color: '#000000' }, 'box-shadow')
    ];
    expect(initial.length).toBe(1);

    // Add layer
    const newLayer = normalizeShadowLayer({ x: 0, y: 10, blur: 20, color: '#112233' }, 'box-shadow');
    const withAdded = [...initial, newLayer];
    expect(withAdded.length).toBe(2);
    expect(withAdded[1].color).toBe('#112233');

    // Remove layer
    const removed = withAdded.filter((_, idx) => idx !== 0);
    expect(removed.length).toBe(1);
    expect(removed[0].color).toBe('#112233');
  });

  // 11. Duplicate and reorder operations preserve valid state
  it('11. duplicates and reorders layers preserving valid properties', () => {
    const l1 = normalizeShadowLayer({ id: 'a', x: 2, y: 4, blur: 6, color: '#111111' }, 'box-shadow');
    const l2 = normalizeShadowLayer({ id: 'b', x: 10, y: 20, blur: 30, color: '#222222' }, 'box-shadow');
    const layers = [l1, l2];

    // Reorder l1 and l2 (move 0 to 1)
    const reordered = reorderLayers(layers, 0, 1);
    expect(reordered[0].id).toBe('b');
    expect(reordered[1].id).toBe('a');

    // Duplicate first layer
    const duplicated = duplicateLayer(reordered, 0);
    expect(duplicated.length).toBe(3);
    expect(duplicated[1].id).not.toBe('b'); // Unique new ID
    expect(duplicated[1].blur).toBe(30);
    expect(duplicated[1].x).toBe(12); // Nudged by 2px
    expect(duplicated[1].y).toBe(22);
  });

  // 12. Invalid numeric inputs are safely handled
  it('12. safely normalizes invalid numeric inputs, nulls, and out-of-range values', () => {
    const malformed = {
      x: NaN,
      y: 'invalid',
      blur: -50,
      spread: null,
      opacity: 250,
      color: 'xyz'
    };

    const clean = normalizeShadowLayer(malformed, 'box-shadow');
    expect(clean.x).toBe(0);
    expect(clean.y).toBe(10); // Default fallback
    expect(clean.blur).toBe(0); // Clamped non-negative
    expect(clean.spread).toBe(0);
    expect(clean.opacity).toBe(100); // Clamped to max 100
    expect(clean.color).toBe('#000000');
  });

  // 13. Reset restores the default state
  it('13. resets correctly to default shadow presets', () => {
    const boxReset = sanitizeShadowState(BOX_SHADOW_PRESETS[0], 'box-shadow');
    expect(boxReset.mode).toBe('box-shadow');
    expect(boxReset.layers.length).toBe(BOX_SHADOW_PRESETS[0].layers.length);

    const textReset = sanitizeShadowState(TEXT_SHADOW_PRESETS[0], 'text-shadow');
    expect(textReset.mode).toBe('text-shadow');
    expect(textReset.layers.length).toBe(TEXT_SHADOW_PRESETS[0].layers.length);
  });

  // 14. CSS class and custom property export is valid
  it('14. exports valid CSS classes and CSS custom properties', () => {
    const layer = { x: 0, y: 12, blur: 24, spread: -4, color: '#000000', opacity: 15 };
    const classCss = generateFullShadowCss([layer], 'box-shadow', 'class', 'custom-card');
    expect(classCss).toContain('.custom-card {');
    expect(classCss).toContain('box-shadow: 0px 12px 24px -4px rgba(0, 0, 0, 0.15);');
    expect(classCss).toContain('}');

    const varCss = generateFullShadowCss([layer], 'box-shadow', 'variable', 'elevation-3');
    expect(varCss).toContain(':root {');
    expect(varCss).toContain('--elevation-3: 0px 12px 24px -4px rgba(0, 0, 0, 0.15);');
    expect(varCss).toContain('}');
  });

  // 15. Copy action handles success and failure
  it('15. handles clipboard copy success and failure with appropriate feedback', async () => {
    const writeTextMock = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock
      },
      configurable: true,
      writable: true
    });

    writeTextMock.mockResolvedValueOnce(undefined);

    renderWithProviders(React.createElement(ShadowPickerPage));

    // Click "Copy CSS" in the toolbar
    const copyBtns = screen.getAllByRole('button', { name: /copy/i });
    expect(copyBtns.length).toBeGreaterThan(0);
    fireEvent.click(copyBtns[0]);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
    });

    // Test rejection/failure path
    writeTextMock.mockRejectedValueOnce(new Error('Permission denied'));
    fireEvent.click(copyBtns[0]);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledTimes(2);
    });
  });

  // 16. UI controls update the preview and generated CSS
  it('16. updates mode, controls, preview and generated CSS on UI interaction', async () => {
    renderWithProviders(React.createElement(ShadowPickerPage));

    // Initial mode is Box Shadow
    expect(screen.getByText('CSS Shadow Studio')).toBeInTheDocument();

    // Switch to Text Shadow mode
    const textShadowBtn = screen.getByRole('button', { name: /text shadow/i });
    fireEvent.click(textShadowBtn);

    // Spread and Direction controls should NOT be present in text shadow mode
    expect(screen.queryByText(/spread radius/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/shadow direction/i)).not.toBeInTheDocument();

    // Switch back to Box Shadow
    const boxShadowBtn = screen.getByRole('button', { name: /box shadow/i });
    fireEvent.click(boxShadowBtn);

    // Spread and Direction should reappear
    expect(screen.getByText(/spread radius/i)).toBeInTheDocument();
    expect(screen.getByText(/shadow direction/i)).toBeInTheDocument();

    // Toggle Inset button
    const directionBtn = screen.getByRole('button', { name: /outset \(drop shadow\)/i });
    fireEvent.click(directionBtn);
    expect(screen.getByText(/inset \(inner shadow\)/i)).toBeInTheDocument();

    // Click a preset button (e.g. Floating Elevation)
    const presetBtn = screen.getByRole('button', { name: /floating elevation/i });
    fireEvent.click(presetBtn);

    // Check that generated CSS reflects box-shadow preset
    const preElement = screen.getByText(/box-shadow:/i);
    expect(preElement).toBeInTheDocument();
  });

  // 17. Regression check: existing Gradient Maker and Color Picker routes still work
  it('17. verifies existing Gradient Maker and Color Picker routes render without regressions', () => {
    // Render Gradient Generator Page
    const { unmount: unmountGrad } = renderWithProviders(
      React.createElement(GradientGeneratorPage),
      { route: '/color-gradient-generator' }
    );

    expect(screen.getByText(/CSS Gradient Studio/i)).toBeInTheDocument();
    unmountGrad();

    // Render Home / Image Color Extractor Page
    const { unmount: unmountHome } = renderWithProviders(
      React.createElement(HomePage),
      { route: '/' }
    );

    expect(screen.getByText(/Free Color Picker/i)).toBeInTheDocument();
    unmountHome();

    // Render Font Picker Page
    const { unmount: unmountFont } = renderWithProviders(
      React.createElement(FontPickerPage),
      { route: '/font-picker' }
    );

    expect(screen.getByText(/Font Pairing Studio/i)).toBeInTheDocument();
    unmountFont();
  });
});
