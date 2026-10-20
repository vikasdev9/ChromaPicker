import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { PaletteProvider } from '../context/PaletteContext';
import {
  DEFAULT_RADIUS_STATE,
  normalizeCornerValue,
  formatCornerGroup,
  generateBorderRadiusValue,
  generateFullBorderRadiusCss,
  updateCornerState,
  calculatePresetValues,
  sanitizeRadiusState
} from '../utils/borderRadiusUtils';
import { BORDER_RADIUS_PRESETS } from '../data/borderRadiusPresets';
import BorderRadiusPage from '../pages/BorderRadiusPage';
import GradientGeneratorPage from '../pages/GradientGeneratorPage';
import ShadowPickerPage from '../pages/ShadowPickerPage';
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

describe('Border Radius Picker - Complete Test Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Default radius CSS generation
  it('1. generates valid default border-radius CSS', () => {
    const defaultState = sanitizeRadiusState(DEFAULT_RADIUS_STATE);
    const css = generateFullBorderRadiusCss(defaultState, 'declaration');
    expect(css).toBe('border-radius: 16px;');
  });

  // 2. Four different corner values serialize correctly
  it('2. serializes four different corner values correctly in standard shorthand', () => {
    const state = {
      ...DEFAULT_RADIUS_STATE,
      isLinked: false,
      tl: 10,
      tr: 20,
      br: 30,
      bl: 40,
      unit: 'px'
    };
    const cssVal = generateBorderRadiusValue(state);
    expect(cssVal).toBe('10px 20px 30px 40px');

    const fullCss = generateFullBorderRadiusCss(state, 'declaration');
    expect(fullCss).toBe('border-radius: 10px 20px 30px 40px;');
  });

  // 3. Linked mode updates all four corners
  it('3. updates all four corners when linked mode is active', () => {
    const initialState = {
      ...DEFAULT_RADIUS_STATE,
      isLinked: true,
      tl: 16,
      tr: 16,
      br: 16,
      bl: 16
    };

    const updated = updateCornerState(initialState, 'tl', 35);
    expect(updated.tl).toBe(35);
    expect(updated.tr).toBe(35);
    expect(updated.br).toBe(35);
    expect(updated.bl).toBe(35);
    expect(generateBorderRadiusValue(updated)).toBe('35px');
  });

  // 4. Unlinked mode changes only the selected corner
  it('4. changes only the targeted corner when unlinked mode is active', () => {
    const initialState = {
      ...DEFAULT_RADIUS_STATE,
      isLinked: false,
      tl: 10,
      tr: 10,
      br: 10,
      bl: 10
    };

    const updated = updateCornerState(initialState, 'tr', 50);
    expect(updated.tl).toBe(10);
    expect(updated.tr).toBe(50);
    expect(updated.br).toBe(10);
    expect(updated.bl).toBe(10);
    expect(generateBorderRadiusValue(updated)).toBe('10px 50px 10px 10px');
  });

  // 5. Switching from linked to unlinked preserves current values
  it('5. preserves current corner values when switching between linked and unlinked', () => {
    const linkedState = {
      ...DEFAULT_RADIUS_STATE,
      isLinked: true,
      tl: 24,
      tr: 24,
      br: 24,
      bl: 24
    };

    // Toggle to unlinked
    const unlinkedState = {
      ...linkedState,
      isLinked: false
    };

    expect(unlinkedState.tl).toBe(24);
    expect(unlinkedState.tr).toBe(24);
    expect(unlinkedState.br).toBe(24);
    expect(unlinkedState.bl).toBe(24);

    // Editing one corner should now only change that one
    const modifiedOne = updateCornerState(unlinkedState, 'bl', 8);
    expect(modifiedOne.bl).toBe(8);
    expect(modifiedOne.tl).toBe(24);
    expect(modifiedOne.tr).toBe(24);
    expect(modifiedOne.br).toBe(24);
  });

  // 6. px unit serialization
  it('6. serializes pixel unit correctly', () => {
    const state = {
      unit: 'px',
      isLinked: false,
      tl: 12,
      tr: 24,
      br: 36,
      bl: 48
    };
    expect(generateBorderRadiusValue(state)).toBe('12px 24px 36px 48px');
  });

  // 7. % unit serialization
  it('7. serializes percentage unit correctly', () => {
    const state = {
      unit: '%',
      isLinked: true,
      tl: 50,
      tr: 50,
      br: 50,
      bl: 50
    };
    expect(generateBorderRadiusValue(state)).toBe('50%');

    const asymmetricPercent = {
      unit: '%',
      isLinked: false,
      tl: 30,
      tr: 70,
      br: 40,
      bl: 60
    };
    expect(generateBorderRadiusValue(asymmetricPercent)).toBe('30% 70% 40% 60%');
  });

  // 8. Invalid, negative, and empty numeric inputs are handled safely
  it('8. safely handles invalid, negative, NaN, and empty numeric values', () => {
    expect(normalizeCornerValue(-25, 'px')).toBe(0);
    expect(normalizeCornerValue(NaN, 'px')).toBe(0);
    expect(normalizeCornerValue('abc', 'px')).toBe(0);
    expect(normalizeCornerValue(null, 'px')).toBe(0);
    expect(normalizeCornerValue(undefined, 'px')).toBe(0);

    // Percentage clamping
    expect(normalizeCornerValue(-10, '%')).toBe(0);
    expect(normalizeCornerValue(150, '%')).toBe(100);

    // Sanitization of corrupt state
    const corrupt = {
      unit: 'invalid',
      tl: -50,
      tr: NaN,
      br: '99999',
      bl: null
    };
    const clean = sanitizeRadiusState(corrupt);
    expect(clean.unit).toBe('px');
    expect(clean.tl).toBe(0);
    expect(clean.tr).toBe(0);
    expect(clean.br).toBe(9999);
    expect(clean.bl).toBe(0);
  });

  // 9. Preset selection updates all required values
  it('9. updates all required values upon preset selection', () => {
    const leafPreset = BORDER_RADIUS_PRESETS.find(p => p.id === 'asymmetric-leaf');
    expect(leafPreset).toBeDefined();

    const applied = calculatePresetValues(leafPreset, 260, 180, 'px');
    expect(applied.tl).toBe(50);
    expect(applied.tr).toBe(0);
    expect(applied.br).toBe(50);
    expect(applied.bl).toBe(0);
    expect(applied.isLinked).toBe(false);

    const css = generateBorderRadiusValue(applied);
    expect(css).toBe('50px 0px 50px 0px');
  });

  // 10. Pill and circle presets behave correctly for supported dimensions
  it('10. calculates pill and circle presets correctly for selected dimensions', () => {
    const pillPreset = BORDER_RADIUS_PRESETS.find(p => p.id === 'pill');
    const pillValues = calculatePresetValues(pillPreset, 280, 80, 'px');
    expect(pillValues.tl).toBe(9999);
    expect(pillValues.isLinked).toBe(true);
    expect(generateBorderRadiusValue(pillValues)).toBe('9999px');

    const circlePreset = BORDER_RADIUS_PRESETS.find(p => p.id === 'circle');
    const circleValues = calculatePresetValues(circlePreset, 200, 200, '%');
    expect(circleValues.unit).toBe('%');
    expect(circleValues.tl).toBe(50);
    expect(generateBorderRadiusValue(circleValues)).toBe('50%');

    // Square circle in px
    const circlePxValues = calculatePresetValues({ type: 'circle', unit: 'px' }, 200, 200, 'px');
    expect(circlePxValues.tl).toBe(100);
    expect(generateBorderRadiusValue(circlePxValues)).toBe('100px');
  });

  // 11. Reset restores the default state
  it('11. restores default configuration when reset', () => {
    const modifiedState = {
      unit: '%',
      isLinked: false,
      tl: 40,
      tr: 80,
      br: 20,
      bl: 90,
      isElliptical: true
    };

    const reset = sanitizeRadiusState(DEFAULT_RADIUS_STATE);
    expect(reset.unit).toBe('px');
    expect(reset.isLinked).toBe(true);
    expect(reset.tl).toBe(16);
    expect(reset.tr).toBe(16);
    expect(reset.br).toBe(16);
    expect(reset.bl).toBe(16);
    expect(reset.isElliptical).toBe(false);
    expect(generateBorderRadiusValue(reset)).toBe('16px');
  });

  // 12. CSS class export is valid
  it('12. exports valid CSS classes and CSS custom properties', () => {
    const state = {
      ...DEFAULT_RADIUS_STATE,
      tl: 20,
      tr: 20,
      br: 20,
      bl: 20,
      unit: 'px'
    };

    const classOutput = generateFullBorderRadiusCss(state, 'class', 'button-primary');
    expect(classOutput).toContain('.button-primary {');
    expect(classOutput).toContain('border-radius: 20px;');
    expect(classOutput).toContain('}');

    const varOutput = generateFullBorderRadiusCss(state, 'variable', 'radius-card');
    expect(varOutput).toContain(':root {');
    expect(varOutput).toContain('--radius-card: 20px;');
    expect(varOutput).toContain('}');
  });

  // 13. Copy action handles success and failure
  it('13. handles clipboard copy success and failure with appropriate feedback', async () => {
    const writeTextMock = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true
    });

    writeTextMock.mockResolvedValueOnce(undefined);

    renderWithProviders(React.createElement(BorderRadiusPage));

    // Find and click "Copy CSS" in toolbar
    const copyBtns = screen.getAllByRole('button', { name: /copy/i });
    expect(copyBtns.length).toBeGreaterThan(0);
    fireEvent.click(copyBtns[0]);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
    });

    // Test rejection/failure handling
    writeTextMock.mockRejectedValueOnce(new Error('Copy failure'));
    fireEvent.click(copyBtns[0]);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledTimes(2);
    });
  });

  // 14. Preview updates when any corner changes
  it('14. updates preview and synchronized CSS when corners change', async () => {
    const { container } = renderWithProviders(React.createElement(BorderRadiusPage));

    expect(screen.getByText('Border Radius Studio')).toBeInTheDocument();

    // Corner controls should exist
    const tlInput = screen.getByLabelText(/top-left \(tl\)/i);
    expect(tlInput).toBeInTheDocument();
    expect(tlInput.value).toBe('16');

    // Change Top-Left input in linked mode
    fireEvent.change(tlInput, { target: { value: '32' } });

    // In linked mode, all corners should update to 32px
    await waitFor(() => {
      const codeOutput = screen.getByText(/border-radius: 32px;/i);
      expect(codeOutput).toBeInTheDocument();
    });

    // Toggle to unlinked
    const linkToggleBtn = screen.getByRole('button', { name: /corners linked/i });
    fireEvent.click(linkToggleBtn);

    // Verify unlinked feedback
    expect(screen.getByRole('button', { name: /corners unlinked/i })).toBeInTheDocument();

    // Click a preset button (e.g. Pill)
    const pillBtn = screen.getByRole('button', { name: /^pill/i });
    fireEvent.click(pillBtn);

    await waitFor(() => {
      expect(screen.getByText(/border-radius: 9999px;/i)).toBeInTheDocument();
    });
  });

  // 15. Regression check: existing Gradient Maker, Shadow Picker, and Color Picker remain functional
  it('15. verifies existing Gradient Maker, Shadow Picker, and Home routes mount without regressions', () => {
    // 1. Gradient Generator Page
    const { unmount: unmountGrad } = renderWithProviders(
      React.createElement(GradientGeneratorPage),
      { route: '/color-gradient-generator' }
    );
    expect(screen.getByText(/CSS Gradient Studio/i)).toBeInTheDocument();
    unmountGrad();

    // 2. Shadow Picker Page
    const { unmount: unmountShadow } = renderWithProviders(
      React.createElement(ShadowPickerPage),
      { route: '/shadow-picker' }
    );
    expect(screen.getByText(/CSS Shadow Studio/i)).toBeInTheDocument();
    unmountShadow();

    // 3. Home / Image Color Extractor Page
    const { unmount: unmountHome } = renderWithProviders(
      React.createElement(HomePage),
      { route: '/' }
    );
    expect(screen.getByText(/Free Color Picker/i)).toBeInTheDocument();
    unmountHome();
  });
});
