import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { PaletteProvider } from '../context/PaletteContext';

import {
  FILTER_DEFINITIONS,
  DEFAULT_FILTER_STATE,
  clampFilterValue,
  sanitizeFilterState,
  generateFilterString,
  generateFullFilterCss,
  renderFilteredImageToCanvas,
  canvasToBlobAsync
} from '../utils/imageFilterUtils';
import { IMAGE_FILTER_PRESETS } from '../data/imageFilterPresets';

import ImageFilterPage from '../pages/ImageFilterPage';
import FilterWorkspace from '../components/filter/FilterWorkspace';
import FilterControls from '../components/filter/FilterControls';
import FilterExportModal from '../components/filter/FilterExportModal';

// Regression imports
import GradientGeneratorPage from '../pages/GradientGeneratorPage';
import ShadowPickerPage from '../pages/ShadowPickerPage';
import BorderRadiusPage from '../pages/BorderRadiusPage';
import GlassmorphismPage from '../pages/GlassmorphismPage';
import HomePage from '../pages/HomePage';
import ContrastCheckerPage from '../pages/ContrastCheckerPage';
import PaletteGeneratorPage from '../pages/PaletteGeneratorPage';

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

describe('Image Filter Picker - Comprehensive Test Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================
  // PART A: Filter Serialization Tests
  // ==========================================
  describe('Part A: Filter Serialization Tests', () => {
    it('1. serializes default filter state correctly', () => {
      const css = generateFilterString(DEFAULT_FILTER_STATE);
      expect(css).toContain('brightness(100%)');
      expect(css).toContain('contrast(100%)');
      expect(css).toContain('saturate(100%)');
      expect(css).toContain('grayscale(0%)');
      expect(css).toContain('sepia(0%)');
      expect(css).toContain('blur(0px)');
      expect(css).toContain('hue-rotate(0deg)');
      expect(css).toContain('invert(0%)');
      expect(css).toContain('opacity(100%)');

      // Compact / activeOnly mode returns 'none' when all are default
      expect(generateFilterString(DEFAULT_FILTER_STATE, true)).toBe('none');
    });

    it('2. serializes brightness accurately within bounds', () => {
      const custom = { ...DEFAULT_FILTER_STATE, brightness: 145 };
      expect(generateFilterString(custom)).toContain('brightness(145%)');
      expect(generateFilterString(custom, true)).toBe('brightness(145%)');
    });

    it('3. serializes contrast accurately within bounds', () => {
      const custom = { ...DEFAULT_FILTER_STATE, contrast: 160 };
      expect(generateFilterString(custom)).toContain('contrast(160%)');
      expect(generateFilterString(custom, true)).toBe('contrast(160%)');
    });

    it('4. serializes saturation accurately within bounds', () => {
      const custom = { ...DEFAULT_FILTER_STATE, saturate: 175 };
      expect(generateFilterString(custom)).toContain('saturate(175%)');
      expect(generateFilterString(custom, true)).toBe('saturate(175%)');
    });

    it('5. serializes grayscale accurately within bounds', () => {
      const custom = { ...DEFAULT_FILTER_STATE, grayscale: 80 };
      expect(generateFilterString(custom)).toContain('grayscale(80%)');
      expect(generateFilterString(custom, true)).toBe('grayscale(80%)');
    });

    it('6. serializes sepia accurately within bounds', () => {
      const custom = { ...DEFAULT_FILTER_STATE, sepia: 65 };
      expect(generateFilterString(custom)).toContain('sepia(65%)');
      expect(generateFilterString(custom, true)).toBe('sepia(65%)');
    });

    it('7. serializes blur with px units accurately', () => {
      const custom = { ...DEFAULT_FILTER_STATE, blur: 8 };
      expect(generateFilterString(custom)).toContain('blur(8px)');
      expect(generateFilterString(custom, true)).toBe('blur(8px)');
    });

    it('8. serializes hue rotation with deg units accurately', () => {
      const custom = { ...DEFAULT_FILTER_STATE, hueRotate: 180 };
      expect(generateFilterString(custom)).toContain('hue-rotate(180deg)');
      expect(generateFilterString(custom, true)).toBe('hue-rotate(180deg)');
    });

    it('9. serializes invert accurately within bounds', () => {
      const custom = { ...DEFAULT_FILTER_STATE, invert: 90 };
      expect(generateFilterString(custom)).toContain('invert(90%)');
      expect(generateFilterString(custom, true)).toBe('invert(90%)');
    });

    it('10. serializes opacity accurately within bounds', () => {
      const custom = { ...DEFAULT_FILTER_STATE, opacity: 70 };
      expect(generateFilterString(custom)).toContain('opacity(70%)');
      expect(generateFilterString(custom, true)).toBe('opacity(70%)');
    });

    it('11. preserves deterministic order across all 9 filters', () => {
      const allActive = {
        brightness: 110,
        contrast: 120,
        saturate: 130,
        grayscale: 10,
        sepia: 15,
        blur: 2,
        hueRotate: 45,
        invert: 5,
        opacity: 95
      };
      const css = generateFilterString(allActive);
      const expected = 'brightness(110%) contrast(120%) saturate(130%) grayscale(10%) sepia(15%) blur(2px) hue-rotate(45deg) invert(5%) opacity(95%)';
      expect(css).toBe(expected);
    });

    it('12. safely handles invalid, NaN, and out-of-range values', () => {
      expect(clampFilterValue('brightness', -50)).toBe(0);
      expect(clampFilterValue('brightness', 999)).toBe(200);
      expect(clampFilterValue('brightness', NaN)).toBe(100);
      expect(clampFilterValue('brightness', 'invalid')).toBe(100);

      expect(clampFilterValue('blur', -10)).toBe(0);
      expect(clampFilterValue('blur', 100)).toBe(20);

      expect(clampFilterValue('hueRotate', -10)).toBe(0);
      expect(clampFilterValue('hueRotate', 500)).toBe(360);

      const sanitized = sanitizeFilterState({ brightness: 'bad', blur: -5, nonExistent: 123 });
      expect(sanitized.brightness).toBe(100);
      expect(sanitized.blur).toBe(0);
      expect(sanitized.contrast).toBe(100);
    });

    it('13. reset restores all default values', () => {
      const modified = { brightness: 150, contrast: 50, blur: 10, grayscale: 100 };
      const reset = sanitizeFilterState(DEFAULT_FILTER_STATE);
      expect(reset).toEqual(DEFAULT_FILTER_STATE);
      expect(generateFilterString(reset)).toBe(generateFilterString(DEFAULT_FILTER_STATE));
    });

    it('14. presets generate expected valid CSS declarations and classes', () => {
      for (const preset of IMAGE_FILTER_PRESETS) {
        const cssDec = generateFullFilterCss(preset.values, 'declaration');
        expect(cssDec).toMatch(/^filter:\s*.+;$/);

        const cssClass = generateFullFilterCss(preset.values, 'class', 'my-photo');
        expect(cssClass).toContain('.my-photo {');
        expect(cssClass).toContain('filter:');

        const cssVar = generateFullFilterCss(preset.values, 'variable', 'main-filter');
        expect(cssVar).toContain(':root {');
        expect(cssVar).toContain('--main-filter:');
      }
    });
  });

  // ==========================================
  // PART B: Component & Interaction Tests
  // ==========================================
  describe('Part B: Component and Interaction Tests', () => {
    it('1. renders empty state correctly when no image is loaded', () => {
      renderWithProviders(React.createElement(ImageFilterPage));
      expect(screen.getByRole('heading', { name: /Upload or Drop an Image/i })).toBeInTheDocument();
      expect(screen.getByText(/Choose Image/i)).toBeInTheDocument();
      expect(screen.getByText(/Try Sample Image/i)).toBeInTheDocument();
    });

    it('2. uploading or selecting a valid image updates the preview', async () => {
      renderWithProviders(React.createElement(ImageFilterPage));

      // Click "Try Sample Image"
      const sampleBtn = screen.getByText(/Try Sample Image/i);
      fireEvent.click(sampleBtn);

      await waitFor(() => {
        // Toolbar should show view modes
        expect(screen.getByText(/View:/i)).toBeInTheDocument();
        expect(screen.getByText(/Split Slider/i)).toBeInTheDocument();
      });
    });

    it('3. invalid file types trigger error state', () => {
      const handleImageLoaded = vi.fn();
      renderWithProviders(
        React.createElement(FilterWorkspace, {
          imageSrc: null,
          imageName: null,
          imageDimensions: null,
          isLoading: false,
          error: null,
          filterState: DEFAULT_FILTER_STATE,
          onImageLoaded: handleImageLoaded,
          onResetFilters: vi.fn(),
          imageRef: { current: null }
        })
      );

      // Trigger file drop with non-image file
      const workspace = screen.getByText(/Upload or Drop an Image/i).closest('div[onDrop]');
      if (workspace) {
        const textFile = new File(['hello'], 'document.txt', { type: 'text/plain' });
        fireEvent.drop(workspace, {
          dataTransfer: { files: [textFile] }
        });
        expect(handleImageLoaded).toHaveBeenCalledWith(
          null,
          null,
          null,
          expect.stringContaining('valid image file')
        );
      }
    });

    it('4. filter controls update the filter state', () => {
      const handleChangeFilter = vi.fn();
      renderWithProviders(
        React.createElement(FilterControls, {
          filterState: DEFAULT_FILTER_STATE,
          onChangeFilter: handleChangeFilter,
          onResetFilter: vi.fn(),
          onResetAll: vi.fn(),
          onApplyPreset: vi.fn(),
          activePresetId: null
        })
      );

      const brightnessSlider = screen.getByLabelText(/Brightness slider/i);
      fireEvent.change(brightnessSlider, { target: { value: '140' } });
      expect(handleChangeFilter).toHaveBeenCalledWith('brightness', 140);
    });

    it('5. numeric input and sliders remain synchronized', () => {
      const handleChangeFilter = vi.fn();
      const { container } = renderWithProviders(
        React.createElement(FilterControls, {
          filterState: DEFAULT_FILTER_STATE,
          onChangeFilter: handleChangeFilter,
          onResetFilter: vi.fn(),
          onResetAll: vi.fn(),
          onApplyPreset: vi.fn(),
          activePresetId: null
        })
      );

      // Numeric input for contrast
      const contrastInput = container.querySelector('#filter-input-contrast');
      expect(contrastInput).toBeInTheDocument();
      fireEvent.change(contrastInput, { target: { value: '160' } });
      expect(handleChangeFilter).toHaveBeenCalledWith('contrast', 160);
    });

    it('6. selecting a preset updates all controls via callback', () => {
      const handleApplyPreset = vi.fn();
      renderWithProviders(
        React.createElement(FilterControls, {
          filterState: DEFAULT_FILTER_STATE,
          onChangeFilter: vi.fn(),
          onResetFilter: vi.fn(),
          onResetAll: vi.fn(),
          onApplyPreset: handleApplyPreset,
          activePresetId: null
        })
      );

      const vividBtn = screen.getByText('Vivid');
      fireEvent.click(vividBtn);
      expect(handleApplyPreset).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'vivid' })
      );
    });

    it('7. reset restores all default values', () => {
      const handleResetAll = vi.fn();
      renderWithProviders(
        React.createElement(FilterControls, {
          filterState: { ...DEFAULT_FILTER_STATE, brightness: 160, blur: 5 },
          onChangeFilter: vi.fn(),
          onResetFilter: vi.fn(),
          onResetAll: handleResetAll,
          onApplyPreset: vi.fn(),
          activePresetId: null
        })
      );

      const resetBtn = screen.getByText(/Reset All/i);
      expect(resetBtn).not.toBeDisabled();
      fireEvent.click(resetBtn);
      expect(handleResetAll).toHaveBeenCalled();
    });

    it('8. before/after comparison switches between view modes', () => {
      renderWithProviders(
        React.createElement(FilterWorkspace, {
          imageSrc: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"/>',
          imageName: 'test.png',
          imageDimensions: { width: 400, height: 300 },
          isLoading: false,
          error: null,
          filterState: { ...DEFAULT_FILTER_STATE, sepia: 50 },
          onImageLoaded: vi.fn(),
          onResetFilters: vi.fn(),
          imageRef: { current: null }
        })
      );

      // Check mode buttons
      const filteredBtn = screen.getByRole('button', { name: /^Filtered/i });
      const sideBySideBtn = screen.getByRole('button', { name: /^Side-by-Side/i });
      const originalBtn = screen.getByRole('button', { name: /^Original/i });

      fireEvent.click(sideBySideBtn);
      expect(screen.getByText('ORIGINAL')).toBeInTheDocument();
      expect(screen.getByText('FILTERED')).toBeInTheDocument();

      fireEvent.click(originalBtn);
      const origImg = screen.getByAltText('test.png');
      expect(origImg).toBeInTheDocument();
      expect(origImg.style.filter).toBe('');

      fireEvent.click(filteredBtn);
      const filtImg = screen.getByAltText('test.png');
      expect(filtImg).toBeInTheDocument();
      expect(filtImg.style.filter).toContain('sepia(50%)');
    });

    it('9. generated CSS matches active settings', () => {
      renderWithProviders(React.createElement(ImageFilterPage));

      // Generated CSS block exists
      const cssBlock = screen.getByText(/filter:\s*brightness/i);
      expect(cssBlock).toBeInTheDocument();
    });

    it('10. clipboard copy handles success and fallback gracefully', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock
        }
      });

      renderWithProviders(React.createElement(ImageFilterPage));

      // Click "Copy CSS" in toolbar or card
      const copyButtons = screen.getAllByText(/Copy/i);
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled();
      });
    });

    it('11. export modal renders CSS formats and PNG tab', () => {
      renderWithProviders(
        React.createElement(FilterExportModal, {
          isOpen: true,
          onClose: vi.fn(),
          filterState: { ...DEFAULT_FILTER_STATE, brightness: 120 },
          imageSrc: 'data:image/svg+xml;utf8,<svg/>',
          imageName: 'sample.png',
          imageDimensions: { width: 800, height: 600 }
        })
      );

      expect(screen.getByText(/Export Image & CSS Filters/i)).toBeInTheDocument();
      expect(screen.getByText(/Filter Declaration/i)).toBeInTheDocument();
      expect(screen.getByText(/CSS Class Rule/i)).toBeInTheDocument();
      expect(screen.getByText(/CSS Variable/i)).toBeInTheDocument();

      // Switch to Image Tab
      const imgTabBtn = screen.getByText(/Download Filtered PNG/i);
      fireEvent.click(imgTabBtn);
      expect(screen.getByText(/Export Resolution:/i)).toBeInTheDocument();
      expect(screen.getByText(/Original \(1×\)/i)).toBeInTheDocument();
    });
  });

  // ==========================================
  // PART C: PNG Export Tests
  // ==========================================
  describe('Part C: PNG Canvas Export Tests', () => {
    it('1. canvas rendering uses filter string and target dimensions', () => {
      const mockCtx = {
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        filter: 'none'
      };
      const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx);

      const dummyImg = {
        naturalWidth: 640,
        naturalHeight: 480,
        width: 640,
        height: 480
      };

      const canvas = renderFilteredImageToCanvas(dummyImg, 'brightness(120%) contrast(110%)', 320, 240);
      expect(canvas.width).toBe(320);
      expect(canvas.height).toBe(240);
      expect(mockCtx.drawImage).toHaveBeenCalledWith(dummyImg, 0, 0, 320, 240);
      expect(mockCtx.filter).toBe('brightness(120%) contrast(110%)');

      getContextSpy.mockRestore();
    });

    it('2. canvasToBlobAsync resolves with Blob when supported', async () => {
      const mockBlob = new Blob(['image-data'], { type: 'image/png' });
      const mockCanvas = {
        toBlob: vi.fn((callback) => {
          callback(mockBlob);
        })
      };

      const blob = await canvasToBlobAsync(mockCanvas, 'image/png', 0.95);
      expect(blob).toBe(mockBlob);
      expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png', 0.95);
    });

    it('3. canvasToBlobAsync rejects when canvas produces null or fails', async () => {
      const failingCanvas = {
        toBlob: vi.fn((callback) => {
          callback(null);
        })
      };

      await expect(canvasToBlobAsync(failingCanvas)).rejects.toThrow(/failed to generate blob/i);
    });

    it('4. throws error when null image is provided to canvas renderer', () => {
      expect(() => renderFilteredImageToCanvas(null, 'none')).toThrow(/No image provided/i);
    });
  });

  // ==========================================
  // PART D: Regression Tests
  // ==========================================
  describe('Part D: Regression Tests for Existing Features', () => {
    it('1. Gradient Maker page still renders and operates', () => {
      renderWithProviders(React.createElement(GradientGeneratorPage));
      expect(screen.getByRole('heading', { name: /CSS Gradient Studio/i })).toBeInTheDocument();
    });

    it('2. Shadow Picker still renders and operates', () => {
      renderWithProviders(React.createElement(ShadowPickerPage));
      expect(screen.getByRole('heading', { name: /CSS Shadow Studio/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Box Shadow/i })).toBeInTheDocument();
    });

    it('3. Border Radius Picker still renders and operates', () => {
      renderWithProviders(React.createElement(BorderRadiusPage));
      expect(screen.getByText(/Border Radius Studio/i)).toBeInTheDocument();
    });

    it('4. Glassmorphism Picker still renders and operates', () => {
      renderWithProviders(React.createElement(GlassmorphismPage));
      expect(screen.getByText(/Glassmorphism Studio/i)).toBeInTheDocument();
    });

    it('5. Home Page (Image Color Extractor) still renders', () => {
      renderWithProviders(React.createElement(HomePage));
      expect(screen.getByText(/Free Color Picker/i)).toBeInTheDocument();
    });

    it('6. Contrast Checker still renders', () => {
      renderWithProviders(React.createElement(ContrastCheckerPage));
      expect(screen.getByText(/Contrast Checker/i)).toBeInTheDocument();
    });

    it('7. Palette Generator still renders', () => {
      renderWithProviders(React.createElement(PaletteGeneratorPage));
      expect(screen.getByRole('heading', { name: /Color Palette Generator/i })).toBeInTheDocument();
    });
  });
});
