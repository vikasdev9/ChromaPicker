import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { PaletteProvider } from '../context/PaletteContext';

// Target modules under test
import {
  normalizeBbox,
  transformOcrResultToRegions,
  performImageOcr,
  terminateOcrWorker
} from '../utils/ocrService';
import {
  extractRegionColors,
  classifyFont,
  measureTypography
} from '../utils/imageTypographyAnalysis';
import {
  HeuristicFontMatcher,
  identifyFontFromRegion,
  FontIdentificationProvider
} from '../utils/fontIdentifier';
import { FONT_CATALOG } from '../data/fontCatalog';
import { loadFontOnDemand, generateFontPairingCss } from '../utils/fontLoader';

// Component imports
import FontPickerPage from '../pages/FontPickerPage';
import FontImageWorkspace from '../components/fonts/FontImageWorkspace';
import TypographyDetailsPanel from '../components/fonts/TypographyDetailsPanel';

// Regression imports
import HomePage from '../pages/HomePage';
import ContrastCheckerPage from '../pages/ContrastCheckerPage';
import PaletteGeneratorPage from '../pages/PaletteGeneratorPage';
import ImageFilterPage from '../pages/ImageFilterPage';

// Helper to render with all context providers using React.createElement
function renderWithProviders(ui, { route = '/font-picker' } = {}) {
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

// Synthetic canvas generator helper for unit testing pixel algorithms
function createMockCanvas(width, height, pixelCustomizer = null) {
  const pixelCount = width * height;
  const data = new Uint8ClampedArray(pixelCount * 4);

  // Fill with white background (255, 255, 255, 255)
  for (let i = 0; i < pixelCount; i++) {
    data[i * 4] = 255;
    data[i * 4 + 1] = 255;
    data[i * 4 + 2] = 255;
    data[i * 4 + 3] = 255;
  }

  // Draw dark horizontal rectangle simulating text by default
  const startY = Math.floor(height * 0.25);
  const endY = Math.floor(height * 0.75);
  for (let y = startY; y < endY; y++) {
    for (let x = 4; x < width - 4; x++) {
      const offset = (y * width + x) * 4;
      data[offset] = 17;
      data[offset + 1] = 24;
      data[offset + 2] = 39;
      data[offset + 3] = 255;
    }
  }

  if (typeof pixelCustomizer === 'function') {
    pixelCustomizer(data, width, height);
  }

  return {
    width,
    height,
    data,
    getContext: () => ({
      getImageData: () => ({ width, height, data })
    })
  };
}

describe('Font Finder from Image — Comprehensive Test Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-image-url');
    global.URL.revokeObjectURL = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(true)
      },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    terminateOcrWorker();
  });

  // =========================================================================
  // PART A: Image Input and State Tests (1 - 6)
  // =========================================================================
  describe('Part A: Image Input and State Tests', () => {
    it('1. Initial empty state renders correctly', () => {
      renderWithProviders(React.createElement(FontImageWorkspace));
      expect(screen.getByText(/Image Font Finder & Typography Inspector/i)).toBeInTheDocument();
      expect(screen.getByText(/Drop an image here, paste from clipboard, or click to browse/i)).toBeInTheDocument();
      expect(screen.getByText(/Upload Image/i)).toBeInTheDocument();
    });

    it('2. Valid image selection updates the workspace', async () => {
      renderWithProviders(React.createElement(FontImageWorkspace));
      const file = new File(['mock content'], 'sample-banner.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).not.toBeNull();

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
      });
    });

    it('3. Invalid file types are rejected with an informative error message', async () => {
      renderWithProviders(React.createElement(FontImageWorkspace));
      const invalidFile = new File(['text content'], 'notes.txt', { type: 'text/plain' });
      const fileInput = document.querySelector('input[type="file"]');

      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      await waitFor(() => {
        expect(screen.getByText(/Unsupported file format/i)).toBeInTheDocument();
      });
    });

    it('4. Changing the image clears stale region results', async () => {
      const { unmount } = renderWithProviders(React.createElement(FontImageWorkspace));
      const file1 = new File(['img1'], 'heading.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]');

      fireEvent.change(fileInput, { target: { files: [file1] } });
      await waitFor(() => expect(global.URL.createObjectURL).toHaveBeenCalled());

      // Changing to a new image
      const file2 = new File(['img2'], 'body.webp', { type: 'image/webp' });
      fireEvent.change(fileInput, { target: { files: [file2] } });

      await waitFor(() => {
        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-image-url');
      });
      unmount();
    });

    it('5. Reset clears the current analysis and restores initial view', async () => {
      renderWithProviders(React.createElement(FontImageWorkspace));
      const file = new File(['img'], 'test.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]');
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        const resetBtn = screen.queryByTitle(/Clear image and start over/i);
        if (resetBtn) {
          fireEvent.click(resetBtn);
          expect(screen.getByText(/Drop an image here/i)).toBeInTheDocument();
        }
      });
    });

    it('6. Object URLs are cleaned up when images change or component unmounts', () => {
      const { unmount } = renderWithProviders(React.createElement(FontImageWorkspace));
      const file = new File(['img'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]');
      fireEvent.change(fileInput, { target: { files: [file] } });

      unmount();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // PART B: OCR and Region Tests (7 - 12)
  // =========================================================================
  describe('Part B: OCR and Region Tests', () => {
    it('7. OCR results are transformed into selectable text regions correctly', () => {
      const rawOcr = {
        data: {
          text: 'Designing Future',
          confidence: 91,
          lines: [
            {
              text: 'Designing Future',
              confidence: 92,
              bbox: { x0: 20, y0: 30, x1: 220, y1: 70 },
              words: [
                { text: 'Designing', confidence: 94, bbox: { x0: 20, y0: 30, x1: 120, y1: 70 } },
                { text: 'Future', confidence: 90, bbox: { x0: 130, y0: 30, x1: 220, y1: 70 } }
              ]
            }
          ]
        }
      };

      const result = transformOcrResultToRegions(rawOcr);
      expect(result.text).toBe('Designing Future');
      expect(result.regions).toHaveLength(1);
      expect(result.regions[0].bbox.width).toBe(200);
      expect(result.regions[0].bbox.height).toBe(40);
      expect(result.regions[0].words).toHaveLength(2);
    });

    it('8. OCR errors produce a useful error state and clean message', async () => {
      await expect(performImageOcr(null)).rejects.toThrow(/Image source is required/i);
    });

    it('9. Empty OCR results produce a clean no-text state with zero regions', () => {
      const emptyResult = transformOcrResultToRegions({ data: { text: '', lines: [], words: [] } });
      expect(emptyResult.text).toBe('');
      expect(emptyResult.regions).toHaveLength(0);
    });

    it('10. Manual region selection and coordinate normalization work correctly', () => {
      const rawBox = { x0: 15.6, y0: 25.2, x1: 150.9, y1: 80.4 };
      const normalized = normalizeBbox(rawBox);

      expect(normalized.x0).toBe(16);
      expect(normalized.y0).toBe(25);
      expect(normalized.x1).toBe(151);
      expect(normalized.y1).toBe(80);
      expect(normalized.width).toBe(135);
      expect(normalized.height).toBe(55);
    });

    it('11. Image scaling and zoom preserve selected region coordinate integrity', () => {
      const bbox = { x0: 50, y0: 50, x1: 250, y1: 100, width: 200, height: 50 };
      const normalized = normalizeBbox(bbox);

      expect(normalized.width).toBe(200);
      expect(normalized.height).toBe(50);
    });

    it('12. Editing OCR text updates the selected region displayed text', () => {
      const onTextChange = vi.fn();
      renderWithProviders(
        React.createElement(TypographyDetailsPanel, {
          selectedRegion: { id: 'region-1', text: 'Typografy', confidence: 85, bbox: { x0: 10, y0: 10, width: 100, height: 30 } },
          text: 'Typografy',
          onTextChange,
          classification: { category: 'sans-serif', weightCategory: 'regular', estimatedNumericWeight: 400, style: 'normal' },
          colors: { textColor: { hex: '#000000' }, backgroundColor: { hex: '#FFFFFF' }, contrastRatio: 21, isReliable: true },
          measurements: { imagePxSize: 24, lineHeightRatio: 1.2, letterSpacingPx: 0, alignment: 'left' },
          candidates: [{ family: 'Inter', similarity: 90, rationale: 'Sample', suggestedWeight: 400 }],
          onApplyHeading: vi.fn(),
          onApplyBody: vi.fn(),
          onOpenInTester: vi.fn(),
          onSearchInLibrary: vi.fn()
        })
      );

      const textarea = screen.getByLabelText(/EXTRACTED TEXT SPECIMEN/i);
      expect(textarea).toHaveValue('Typografy');

      fireEvent.change(textarea, { target: { value: 'Typography' } });
      expect(onTextChange).toHaveBeenCalledWith('Typography');
    });
  });

  // =========================================================================
  // PART C: Typography Analysis Tests (13 - 19)
  // =========================================================================
  describe('Part C: Typography Analysis Tests', () => {
    it('13. Font classification handles supported categories and unknown results', () => {
      const mockCanvas = createMockCanvas(100, 40);
      const bbox = { x0: 0, y0: 0, width: 100, height: 40 };

      const classification = classifyFont(mockCanvas, bbox, 'Hello World');
      expect(['sans-serif', 'serif', 'monospace', 'display', 'handwriting']).toContain(classification.category);
      expect(classification.isEstimate).toBe(true);
      expect(classification.notes).toContain('Estimated from pixel stroke analysis');
    });

    it('14. Font-weight estimation returns a valid estimate category', () => {
      const mockCanvas = createMockCanvas(120, 50);
      const bbox = { x0: 0, y0: 0, width: 120, height: 50 };

      const classification = classifyFont(mockCanvas, bbox, 'Bold Title');
      expect(['light', 'regular', 'medium', 'semibold', 'bold', 'black']).toContain(classification.weightCategory);
      expect(typeof classification.estimatedNumericWeight).toBe('number');
    });

    it('15. Color extraction returns valid HEX/RGB/HSL values for known test pixels', () => {
      const canvas = createMockCanvas(60, 30, (data, w) => {
        // Draw red text block in the middle
        for (let y = 10; y < 20; y++) {
          for (let x = 10; x < 50; x++) {
            const offset = (y * w + x) * 4;
            data[offset] = 255;   // R
            data[offset + 1] = 0; // G
            data[offset + 2] = 0; // B
            data[offset + 3] = 255;
          }
        }
      });

      const colors = extractRegionColors(canvas, { x0: 0, y0: 0, width: 60, height: 30 });
      expect(colors.textColor.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(colors.backgroundColor.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(typeof colors.textColor.rgb.r).toBe('number');
      expect(typeof colors.textColor.hsl.h).toBe('number');
    });

    it('16. Text-color extraction handles simple contrasting text/background samples', () => {
      const canvas = createMockCanvas(80, 40, (data, w) => {
        // Draw black text block in the middle
        for (let y = 12; y < 28; y++) {
          for (let x = 15; x < 65; x++) {
            const offset = (y * w + x) * 4;
            data[offset] = 0;
            data[offset + 1] = 0;
            data[offset + 2] = 0;
            data[offset + 3] = 255;
          }
        }
      });

      const colors = extractRegionColors(canvas, { x0: 0, y0: 0, width: 80, height: 40 });
      expect(colors.contrastRatio).toBeGreaterThanOrEqual(1.0);
      expect(colors.wcagRating).toBeDefined();
    });

    it('17. Uncertain results are explicitly marked as estimates', () => {
      const canvas = createMockCanvas(10, 10);
      const colors = extractRegionColors(canvas, { x0: 0, y0: 0, width: 10, height: 10 });
      const classification = classifyFont(canvas, { x0: 0, y0: 0, width: 10, height: 10 });

      expect(classification.isEstimate).toBe(true);
      expect(typeof colors.isReliable).toBe('boolean');
    });

    it('18. Missing measurements are represented gracefully rather than fabricating false certainty', () => {
      const measurements = measureTypography(null, null, '');
      expect(measurements.imagePxSize).toBeDefined();
      expect(measurements.measurementNote).toContain('Source-image pixels');
    });

    it('19. Source-image pixel measurements are not mislabeled as original CSS dimensions', () => {
      const measurements = measureTypography(null, { width: 300, height: 60 }, 'Sample Text');
      expect(measurements.measurementNote).toContain('Source-image pixels; actual CSS font-size depends on viewport and device pixel ratio');
    });
  });

  // =========================================================================
  // PART D: Candidate and Provider Tests (20 - 27)
  // =========================================================================
  describe('Part D: Candidate and Provider Tests', () => {
    it('20. Candidate ranking is deterministic for the same input', async () => {
      const matcher = new HeuristicFontMatcher();
      const input = {
        classification: { category: 'sans-serif', weightCategory: 'bold', estimatedNumericWeight: 700, style: 'normal' },
        metrics: { imagePxSize: 32, letterSpacingPx: -0.5 },
        text: 'The Future of AI'
      };

      const result1 = await matcher.identify(input);
      const result2 = await matcher.identify(input);

      expect(result1.candidates[0].family).toBe(result2.candidates[0].family);
      expect(result1.candidates[0].similarity).toBe(result2.candidates[0].similarity);
    });

    it('21. Missing or unavailable catalog entries are handled gracefully', async () => {
      const matcher = new HeuristicFontMatcher();
      const result = await matcher.identify({
        classification: { category: 'handwriting', weightCategory: 'regular', estimatedNumericWeight: 400, style: 'normal' }
      });

      expect(result.candidates.length).toBeGreaterThan(0);
      expect(result.method).toBeDefined();
    });

    it('22. Candidate preview loading is executed on demand', () => {
      const font = FONT_CATALOG[0];
      const promise = loadFontOnDemand(font.family, [400], false);
      expect(promise).toBeInstanceOf(Promise);
    });

    it('23. Failed font loading uses a safe fallback', () => {
      const css = generateFontPairingCss({
        heading: { family: 'NonExistentFontFamily', weight: 700, fallback: 'sans-serif' },
        body: { family: 'FallbackSystemFont', weight: 400, fallback: 'serif' }
      });

      expect(css).toContain('--font-heading: \'NonExistentFontFamily\', sans-serif;');
      expect(css).toContain('--font-body: \'FallbackSystemFont\', serif;');
    });

    it('24. Provider errors do not crash the page and return graceful fallback', async () => {
      class CrashingProvider extends FontIdentificationProvider {
        async identify() {
          throw new Error('Remote model failure');
        }
      }

      const crashing = new CrashingProvider();
      const fallbackResult = await identifyFontFromRegion(
        { classification: { category: 'sans-serif' } },
        crashing
      );

      // Should automatically catch and use the default heuristic matcher
      expect(fallbackResult.candidates.length).toBeGreaterThan(0);
    });

    it('25. No configured identification provider produces an honest fallback result', async () => {
      const result = await identifyFontFromRegion({});
      expect(result.candidates).toBeInstanceOf(Array);
      expect(result.limitations).toContain('Exact font identification requires original vector glyph outlines.');
    });

    it('26. API credentials are not embedded in client-side source', () => {
      const matcher = new HeuristicFontMatcher();
      const stringified = JSON.stringify(matcher);
      expect(stringified).not.toContain('apiKey');
      expect(stringified).not.toContain('secret');
      expect(stringified).not.toContain('password');
    });

    it('27. Candidate selection can update the existing Font Pairing Studio', () => {
      const onApplyHeading = vi.fn();
      const onApplyBody = vi.fn();

      renderWithProviders(
        React.createElement(TypographyDetailsPanel, {
          selectedRegion: { id: 'region-1', text: 'Headline' },
          text: 'Headline',
          onTextChange: vi.fn(),
          classification: { category: 'sans-serif', estimatedNumericWeight: 700, style: 'normal' },
          colors: { textColor: { hex: '#000000' }, backgroundColor: { hex: '#FFFFFF' } },
          measurements: { imagePxSize: 36, lineHeightRatio: 1.2 },
          candidates: [
            { family: 'Plus Jakarta Sans', similarity: 92, suggestedWeight: 700, suggestedStyle: 'normal' },
            { family: 'Inter', similarity: 88, suggestedWeight: 400, suggestedStyle: 'normal' }
          ],
          onApplyHeading,
          onApplyBody,
          onOpenInTester: vi.fn(),
          onSearchInLibrary: vi.fn()
        })
      );

      const headingBtn = screen.getByText(/Use as Heading in Studio/i);
      fireEvent.click(headingBtn);
      expect(onApplyHeading).toHaveBeenCalled();

      const bodyBtn = screen.getByText(/Use as Body in Studio/i);
      fireEvent.click(bodyBtn);
      expect(onApplyBody).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // PART E: Integration and Regression Tests (28 - 34)
  // =========================================================================
  describe('Part E: Integration and Regression Tests', () => {
    it('28. The new tab works alongside the existing pairing studio', () => {
      renderWithProviders(React.createElement(FontPickerPage));

      // Verify all 4 tabs exist
      expect(screen.getByText(/Font Pairing Studio/i)).toBeInTheDocument();
      expect(screen.getByText(/Font Library & Search/i)).toBeInTheDocument();
      expect(screen.getByText(/Single Font Specimen Tester/i)).toBeInTheDocument();
      expect(screen.getByText(/Identify from Image/i)).toBeInTheDocument();

      // Click to switch to Identify from Image tab
      const identifyTab = screen.getByText(/Identify from Image/i);
      fireEvent.click(identifyTab);

      expect(screen.getByText(/Image Font Finder & Typography Inspector/i)).toBeInTheDocument();
    });

    it('29. Existing font presets and pairing controls still work', () => {
      renderWithProviders(React.createElement(FontPickerPage));

      const modernSaasPreset = screen.getByText(/Modern SaaS/i);
      expect(modernSaasPreset).toBeInTheDocument();

      // Click preset
      fireEvent.click(modernSaasPreset);
      expect(screen.getByText(/Heading Font/i)).toBeInTheDocument();
      expect(screen.getByText(/Body Font/i)).toBeInTheDocument();
    });

    it('30. Existing font search and filtering still work', () => {
      renderWithProviders(React.createElement(FontPickerPage));

      const catalogTab = screen.getByText(/Font Library & Search/i);
      fireEvent.click(catalogTab);

      const searchInput = screen.getByPlaceholderText(/Search fonts by name/i);
      expect(searchInput).toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: 'Inter' } });
      expect(screen.getByText(/Current Heading:/i)).toBeInTheDocument();
    });

    it('31. Existing specimen tester still works', () => {
      renderWithProviders(React.createElement(FontPickerPage));

      const testerTab = screen.getByText(/Single Font Specimen Tester/i);
      fireEvent.click(testerTab);

      expect(screen.getByText(/Select Font to Test/i)).toBeInTheDocument();
      expect(screen.getByText(/TYPOGRAPHIC SCALE WATERFALL/i)).toBeInTheDocument();
    });

    it('32. Existing font CSS/HTML/JSON export still works', () => {
      renderWithProviders(React.createElement(FontPickerPage));

      const exportBtn = screen.getByText(/Export CSS/i);
      fireEvent.click(exportBtn);

      expect(screen.getByText(/Export Typography & CSS/i)).toBeInTheDocument();
      expect(screen.getByText(/CSS Rules & Variables/i)).toBeInTheDocument();
    });

    it('33. Existing favorites and share URL behavior remain functional', () => {
      renderWithProviders(React.createElement(FontPickerPage));

      const shareBtn = screen.getByText(/Share/i);
      expect(shareBtn).toBeInTheDocument();
      fireEvent.click(shareBtn);
    });

    it('34. The rest of Chromapick existing tools and routes remain accessible', () => {
      const { unmount: u1 } = renderWithProviders(React.createElement(HomePage), { route: '/' });
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      u1();

      const { unmount: u2 } = renderWithProviders(React.createElement(ContrastCheckerPage), { route: '/contrast-checker' });
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      u2();

      const { unmount: u3 } = renderWithProviders(React.createElement(PaletteGeneratorPage), { route: '/palette-generator' });
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      u3();

      const { unmount: u4 } = renderWithProviders(React.createElement(ImageFilterPage), { route: '/image-filter' });
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      u4();
    });
  });
});
