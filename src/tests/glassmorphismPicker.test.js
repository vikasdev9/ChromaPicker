import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { PaletteProvider } from '../context/PaletteContext';
import {
  DEFAULT_GLASS_STATE,
  formatRgbaColor,
  formatBackdropFilterValue,
  generateGlassStyleObject,
  generateGlassCssDeclaration,
  generateFullGlassCss,
  sanitizeGlassState,
  checkBackdropFilterSupport
} from '../utils/glassmorphismUtils';
import { GLASSMORPHISM_PRESETS } from '../data/glassmorphismPresets';
import GlassmorphismPage from '../pages/GlassmorphismPage';
import GradientGeneratorPage from '../pages/GradientGeneratorPage';
import ShadowPickerPage from '../pages/ShadowPickerPage';
import BorderRadiusPage from '../pages/BorderRadiusPage';
import HomePage from '../pages/HomePage';

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

describe('Glassmorphism Picker - Complete Test Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Default glass CSS generation
  it('1. generates valid default glassmorphism CSS declarations', () => {
    const defaultState = sanitizeGlassState(DEFAULT_GLASS_STATE);
    const css = generateGlassCssDeclaration(defaultState);

    expect(css).toContain('background: rgba(255, 255, 255, 0.2);');
    expect(css).toContain('-webkit-backdrop-filter: blur(16px);');
    expect(css).toContain('backdrop-filter: blur(16px);');
    expect(css).toContain('border: 1px solid rgba(255, 255, 255, 0.3);');
    expect(css).toContain('border-radius: 16px;');
    expect(css).toContain('box-shadow: 0px 8px 32px 0px rgba(0, 0, 0, 0.37);');
  });

  // 2. Background color and opacity serialization
  it('2. converts background color and opacity to valid rgba format', () => {
    expect(formatRgbaColor('#FF0000', 50)).toBe('rgba(255, 0, 0, 0.5)');
    expect(formatRgbaColor('#38BDF8', 25)).toBe('rgba(56, 189, 248, 0.25)');
    expect(formatRgbaColor('#000000', 0)).toBe('rgba(0, 0, 0, 0)');
    expect(formatRgbaColor('#FFFFFF', 100)).toBe('rgba(255, 255, 255, 1)');
  });

  // 3. Border color, width, and opacity serialization
  it('3. serializes border styles or none when disabled/zero-width', () => {
    const activeBorder = {
      ...DEFAULT_GLASS_STATE,
      borderEnabled: true,
      borderColor: '#38BDF8',
      borderWidth: 2,
      borderOpacity: 50
    };
    const cssActive = generateGlassCssDeclaration(activeBorder);
    expect(cssActive).toContain('border: 2px solid rgba(56, 189, 248, 0.5);');

    const disabledBorder = {
      ...DEFAULT_GLASS_STATE,
      borderEnabled: false
    };
    const cssDisabled = generateGlassCssDeclaration(disabledBorder);
    expect(cssDisabled).toContain('border: none;');

    const zeroWidthBorder = {
      ...DEFAULT_GLASS_STATE,
      borderEnabled: true,
      borderWidth: 0
    };
    const cssZero = generateGlassCssDeclaration(zeroWidthBorder);
    expect(cssZero).toContain('border: none;');
  });

  // 4. Backdrop blur serialization
  it('4. serializes backdrop blur and optional saturation correctly', () => {
    const simpleBlur = { blur: 24, useSaturation: false };
    expect(formatBackdropFilterValue(simpleBlur)).toBe('blur(24px)');

    const saturatedBlur = { blur: 20, useSaturation: true, saturation: 180 };
    expect(formatBackdropFilterValue(saturatedBlur)).toBe('blur(20px) saturate(180%)');

    // Negative blur clamped to 0
    const clampedBlur = { blur: -10, useSaturation: false };
    expect(formatBackdropFilterValue(clampedBlur)).toBe('blur(0px)');
  });

  // 5. WebKit-prefixed backdrop-filter output when required
  it('5. includes both -webkit-backdrop-filter and backdrop-filter in CSS output', () => {
    const css = generateGlassCssDeclaration(DEFAULT_GLASS_STATE);
    expect(css).toMatch(/-webkit-backdrop-filter:\s*blur\(16px\);/);
    expect(css).toMatch(/backdrop-filter:\s*blur\(16px\);/);

    const styleObj = generateGlassStyleObject(DEFAULT_GLASS_STATE);
    expect(styleObj.WebkitBackdropFilter).toBe('blur(16px)');
    expect(styleObj.backdropFilter).toBe('blur(16px)');
  });

  // 6. Shadow settings serialize correctly
  it('6. serializes ambient box-shadow settings accurately', () => {
    const shadowState = {
      ...DEFAULT_GLASS_STATE,
      shadowEnabled: true,
      shadowX: 4,
      shadowY: 12,
      shadowBlur: 24,
      shadowSpread: -2,
      shadowColor: '#000000',
      shadowOpacity: 40
    };
    const css = generateGlassCssDeclaration(shadowState);
    expect(css).toContain('box-shadow: 4px 12px 24px -2px rgba(0, 0, 0, 0.4);');

    const disabledShadow = { ...DEFAULT_GLASS_STATE, shadowEnabled: false };
    expect(generateGlassCssDeclaration(disabledShadow)).toContain('box-shadow: none;');
  });

  // 7. Radius settings serialize correctly
  it('7. serializes border radius correctly in pixels', () => {
    const state = { ...DEFAULT_GLASS_STATE, borderRadius: 28 };
    expect(generateGlassCssDeclaration(state)).toContain('border-radius: 28px;');
  });

  // 8. Numeric boundary validation for opacity, blur, width, and radius
  it('8. validates and clamps numeric boundaries for all properties', () => {
    const outOfBounds = {
      bgOpacity: 250,
      borderOpacity: -20,
      shadowOpacity: 999,
      blur: -100,
      borderWidth: 50,
      borderRadius: 999,
      saturation: 900
    };
    const clean = sanitizeGlassState(outOfBounds);
    expect(clean.bgOpacity).toBe(100);
    expect(clean.borderOpacity).toBe(0);
    expect(clean.shadowOpacity).toBe(100);
    expect(clean.blur).toBe(0);
    expect(clean.borderWidth).toBe(20); // max 20px
    expect(clean.borderRadius).toBe(200); // max 200px
    expect(clean.saturation).toBe(300); // max 300%
  });

  // 9. Invalid input fallback behavior
  it('9. safely falls back when encountering malformed inputs and non-hex colors', () => {
    const malformed = {
      bgColor: 'invalid-color',
      borderColor: 12345,
      shadowColor: null,
      bgOpacity: 'not-a-number',
      blur: NaN
    };
    const clean = sanitizeGlassState(malformed);
    expect(clean.bgColor).toBe(DEFAULT_GLASS_STATE.bgColor);
    expect(clean.borderColor).toBe(DEFAULT_GLASS_STATE.borderColor);
    expect(clean.shadowColor).toBe(DEFAULT_GLASS_STATE.shadowColor);
    expect(clean.bgOpacity).toBe(DEFAULT_GLASS_STATE.bgOpacity);
    expect(clean.blur).toBe(DEFAULT_GLASS_STATE.blur);
  });

  // 10. Preset selection updates all expected settings
  it('10. updates all relevant settings when applying a preset', () => {
    const darkPreset = GLASSMORPHISM_PRESETS.find(p => p.id === 'dark-glass');
    expect(darkPreset).toBeDefined();

    const cleanDark = sanitizeGlassState(darkPreset);
    expect(cleanDark.bgColor).toBe('#0F172A');
    expect(cleanDark.bgOpacity).toBe(60);
    expect(cleanDark.blur).toBe(20);
    expect(cleanDark.useSaturation).toBe(true);

    const css = generateGlassCssDeclaration(cleanDark);
    expect(css).toContain('background: rgba(15, 23, 42, 0.6);');
    expect(css).toContain('backdrop-filter: blur(20px) saturate(120%);');
  });

  // 11. Reset restores the default state
  it('11. restores default configuration when reset', () => {
    const defaultState = sanitizeGlassState(null);
    expect(defaultState.bgColor).toBe('#FFFFFF');
    expect(defaultState.bgOpacity).toBe(20);
    expect(defaultState.blur).toBe(16);
    expect(defaultState.borderRadius).toBe(16);
    expect(defaultState.borderEnabled).toBe(true);
  });

  // 12. CSS class export is valid
  it('12. generates valid scoped CSS class rule and variables', () => {
    const classCss = generateFullGlassCss(DEFAULT_GLASS_STATE, 'class', 'modal-glass');
    expect(classCss).toContain('.modal-glass {');
    expect(classCss).toContain('  background: rgba(255, 255, 255, 0.2);');
    expect(classCss).toContain('  -webkit-backdrop-filter: blur(16px);');
    expect(classCss).toContain('  backdrop-filter: blur(16px);');
    expect(classCss).toContain('}');

    const varCss = generateFullGlassCss(DEFAULT_GLASS_STATE, 'variable', 'header-glass');
    expect(varCss).toContain(':root {');
    expect(varCss).toContain('--header-glass-bg: rgba(255, 255, 255, 0.2);');
    expect(varCss).toContain('--header-glass-filter: blur(16px);');
    expect(varCss).toContain('}');
  });

  // 13. Copy action handles success and failure
  it('13. handles clipboard copy success and error rejection feedback', async () => {
    const writeTextMock = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true
    });

    writeTextMock.mockResolvedValueOnce(undefined);

    renderWithProviders(React.createElement(GlassmorphismPage));

    const copyBtns = screen.getAllByRole('button', { name: /copy/i });
    expect(copyBtns.length).toBeGreaterThan(0);
    fireEvent.click(copyBtns[0]);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
    });

    writeTextMock.mockRejectedValueOnce(new Error('Permission denied'));
    fireEvent.click(copyBtns[0]);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledTimes(2);
    });
  });

  // 14. Live preview reflects changed settings
  it('14. updates preview styles and generated CSS on control changes', async () => {
    const { container } = renderWithProviders(React.createElement(GlassmorphismPage));

    expect(screen.getByText('Glassmorphism Studio')).toBeInTheDocument();

    // Adjust blur number input
    const blurInput = container.querySelector('#glass-blur');
    expect(blurInput).toBeInTheDocument();
    fireEvent.change(blurInput, { target: { value: '28' } });

    await waitFor(() => {
      const cssOutput = screen.getByText(/backdrop-filter: blur\(28px\);/i);
      expect(cssOutput).toBeInTheDocument();
    });

    // Click a preset button (e.g. Heavy Ice)
    const presetBtn = screen.getByRole('button', { name: /heavy ice/i });
    fireEvent.click(presetBtn);

    await waitFor(() => {
      expect(screen.getByText(/backdrop-filter: blur\(30px\);/i)).toBeInTheDocument();
    });
  });

  // 15. Preview background is rendered behind the translucent glass card
  it('15. ensures background elements are positioned behind the translucent glass surface', () => {
    const { container } = renderWithProviders(React.createElement(GlassmorphismPage));

    const canvas = container.querySelector('#glass-preview-canvas');
    expect(canvas).toBeInTheDocument();

    const bgElements = container.querySelector('.glass-preview-bg-elements');
    expect(bgElements).toBeInTheDocument();
    expect(bgElements.style.zIndex).toBe('0');

    const glassCard = container.querySelector('#glass-preview-card');
    expect(glassCard).toBeInTheDocument();
    expect(glassCard.style.zIndex).toBe('1');
  });

  // 16. Unsupported backdrop-filter behavior is handled gracefully
  it('16. handles backdrop-filter browser support detection safely', () => {
    // In Node / JSDOM environment, checkBackdropFilterSupport returns boolean
    const result = checkBackdropFilterSupport();
    expect(typeof result).toBe('boolean');

    // Test with mock CSS.supports returning false
    const origCss = window.CSS;
    window.CSS = {
      supports: vi.fn().mockReturnValue(false)
    };

    expect(checkBackdropFilterSupport()).toBe(false);

    // Restore CSS
    window.CSS = origCss;
  });

  // 17. Regression check: Gradient Maker, Shadow Picker, Border Radius Picker, and Color Picker still work
  it('17. verifies existing tools and pages mount without regressions', () => {
    // 1. Gradient Studio Page
    const { unmount: u1 } = renderWithProviders(
      React.createElement(GradientGeneratorPage),
      { route: '/color-gradient-generator' }
    );
    expect(screen.getByText(/CSS Gradient Studio/i)).toBeInTheDocument();
    u1();

    // 2. Shadow Studio Page
    const { unmount: u2 } = renderWithProviders(
      React.createElement(ShadowPickerPage),
      { route: '/shadow-picker' }
    );
    expect(screen.getByText(/CSS Shadow Studio/i)).toBeInTheDocument();
    u2();

    // 3. Border Radius Studio Page
    const { unmount: u3 } = renderWithProviders(
      React.createElement(BorderRadiusPage),
      { route: '/border-radius-picker' }
    );
    expect(screen.getByText(/Border Radius Studio/i)).toBeInTheDocument();
    u3();

    // 4. Home Page
    const { unmount: u4 } = renderWithProviders(
      React.createElement(HomePage),
      { route: '/' }
    );
    expect(screen.getByText(/Free Color Picker/i)).toBeInTheDocument();
    u4();
  });
});
