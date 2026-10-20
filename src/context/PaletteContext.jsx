import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SAMPLE_IMAGES } from '../data/sampleImages';
import { extractPaletteAsync } from '../utils/quantization';
import { useToast } from './ToastContext';

const PaletteContext = createContext();

export function PaletteProvider({ children }) {
  const { showToast } = useToast();

  const [currentImage, setCurrentImage] = useState(() => {
    return {
      src: SAMPLE_IMAGES[0].dataUrl,
      filename: SAMPLE_IMAGES[0].filename,
      width: SAMPLE_IMAGES[0].width,
      height: SAMPLE_IMAGES[0].height,
      size: SAMPLE_IMAGES[0].size,
      title: SAMPLE_IMAGES[0].title
    };
  });

  const [extractedPalette, setExtractedPalette] = useState([
    { hex: '#1A8EAC', rgb: { r: 26, g: 142, b: 172 }, hsl: { h: 192, s: 74, l: 39 }, frequency: 28 },
    { hex: '#E5A158', rgb: { r: 229, g: 161, b: 88 }, hsl: { h: 31, s: 75, l: 62 }, frequency: 22 },
    { hex: '#6D5EA6', rgb: { r: 109, g: 94, b: 166 }, hsl: { h: 252, s: 30, l: 51 }, frequency: 16 },
    { hex: '#2F4827', rgb: { r: 47, g: 72, b: 39 }, hsl: { h: 105, s: 30, l: 22 }, frequency: 14 },
    { hex: '#D96638', rgb: { r: 217, g: 102, b: 56 }, hsl: { h: 17, s: 67, l: 54 }, frequency: 10 },
    { hex: '#F4D35E', rgb: { r: 244, g: 211, b: 94 }, hsl: { h: 47, s: 87, l: 66 }, frequency: 8 },
    { hex: '#7FAAB9', rgb: { r: 127, g: 170, b: 185 }, hsl: { h: 196, s: 31, l: 61 }, frequency: 6 },
    { hex: '#203142', rgb: { r: 32, g: 49, b: 66 }, hsl: { h: 210, s: 35, l: 19 }, frequency: 4 }
  ]);

  const [selectedColor, setSelectedColor] = useState('#1A8EAC');
  const [hoveredColor, setHoveredColor] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const [extractionOptions, setExtractionOptions] = useState({
    colorCount: 8,
    detailMode: 'balanced', // 'fast' | 'balanced' | 'detailed'
    ignoreTransparent: true,
    ignoreNearWhite: false,
    ignoreNearBlack: false,
    minSaturation: 0,
    excludeSimilar: true,
    uniqueColorsMode: true,
    minDeltaE: 12,
    toneFilter: 'all', // 'all' | 'vibrant' | 'dark' | 'light' | 'warm' | 'cool'
    generationMode: 'dominant', // 'dominant' | 'vivid' | 'pastel' | 'balanced'
    sortBy: 'frequency' // 'frequency' | 'hue' | 'brightness' | 'saturation'
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('chromapick_favorites');
      return saved ? JSON.parse(saved) : ['#2596BE', '#FFB6D2', '#B8FFE4'];
    } catch {
      return ['#2596BE', '#FFB6D2', '#B8FFE4'];
    }
  });

  const [recentColors, setRecentColors] = useState(() => {
    try {
      const saved = localStorage.getItem('chromapick_recents');
      return saved ? JSON.parse(saved) : ['#2596BE', '#67BDD4', '#D08846', '#844321'];
    } catch {
      return ['#2596BE', '#67BDD4', '#D08846'];
    }
  });

  const [savedPalettes, setSavedPalettes] = useState(() => {
    try {
      const saved = localStorage.getItem('chromapick_saved_palettes');
      return saved ? JSON.parse(saved) : [
        {
          id: 'default-1',
          name: 'Chromapick Signature',
          colors: ['#2596BE', '#67BDD4', '#FFD5BE', '#FFB6D2', '#B8FFE4'],
          createdAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem('chromapick_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not save favorites', e);
    }
  }, [favorites]);

  // Persist recent colors
  useEffect(() => {
    try {
      localStorage.setItem('chromapick_recents', JSON.stringify(recentColors));
    } catch (e) {
      console.warn('Could not save recents', e);
    }
  }, [recentColors]);

  // Persist custom palettes
  useEffect(() => {
    try {
      localStorage.setItem('chromapick_saved_palettes', JSON.stringify(savedPalettes));
    } catch (e) {
      console.warn('Could not save palettes', e);
    }
  }, [savedPalettes]);

  const addRecentColor = useCallback((hex) => {
    const clean = hex.toUpperCase();
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== clean);
      return [clean, ...filtered].slice(0, 24);
    });
  }, []);

  const toggleFavorite = useCallback((hex) => {
    const clean = hex.toUpperCase();
    setFavorites(prev => {
      const exists = prev.includes(clean);
      if (exists) {
        showToast(`Removed ${clean} from favorites`, 'info');
        return prev.filter(c => c !== clean);
      } else {
        showToast(`Added ${clean} to favorites!`, 'success');
        return [clean, ...prev];
      }
    });
  }, [showToast]);

  const selectColor = useCallback((hex) => {
    const clean = hex.toUpperCase();
    setSelectedColor(clean);
    addRecentColor(clean);
  }, [addRecentColor]);

  // Run real color extraction on an HTMLImageElement
  const processImageExtraction = useCallback(async (imgElement, options = extractionOptions) => {
    setIsExtracting(true);
    try {
      const colors = await extractPaletteAsync(imgElement, options);
      if (colors && colors.length > 0) {
        setExtractedPalette(colors);
        setSelectedColor(colors[0].hex);
        addRecentColor(colors[0].hex);
        showToast(`Extracted ${colors.length} dominant colors!`, 'success');
      }
    } catch (err) {
      console.error('Extraction error:', err);
      showToast('Error analyzing image. Please try a different image.', 'error');
    } finally {
      setIsExtracting(false);
    }
  }, [extractionOptions, showToast, addRecentColor]);

  // Extract from current image source
  const triggerExtractionWithCurrent = useCallback((customOpts) => {
    const opts = customOpts || extractionOptions;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      processImageExtraction(img, opts);
    };
    img.onerror = () => {
      showToast('Failed to load image for extraction.', 'error');
    };
    img.src = currentImage.src;
  }, [currentImage.src, extractionOptions, processImageExtraction, showToast]);

  // Load a sample image
  const loadSampleImage = useCallback((sampleId) => {
    const sample = SAMPLE_IMAGES.find(s => s.id === sampleId) || SAMPLE_IMAGES[0];
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setCurrentImage({
        src: sample.dataUrl,
        filename: sample.filename,
        width: sample.width,
        height: sample.height,
        size: sample.size,
        title: sample.title
      });
      processImageExtraction(img, extractionOptions);
    };
    img.src = sample.dataUrl;
  }, [extractionOptions, processImageExtraction]);

  // Handle file upload locally in browser
  const handleFileUpload = useCallback((file) => {
    if (!file) return;

    // Validate size (max 25MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast('File is too large. Maximum supported size is 25 MB.', 'error');
      return;
    }

    // Validate MIME type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml'];
    if (!validMimes.includes(file.type) && !file.type.startsWith('image/')) {
      showToast('Unsupported file type. Please upload a JPG, PNG, WebP, GIF, or BMP.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        const sizeFormatted = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

        setCurrentImage({
          src: dataUrl,
          filename: file.name,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          size: sizeFormatted,
          title: file.name
        });

        processImageExtraction(img, extractionOptions);
      };
      img.onerror = () => {
        showToast('Could not decode image file. File may be corrupt.', 'error');
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      showToast('Error reading file from disk.', 'error');
    };
    reader.readAsDataURL(file);
  }, [extractionOptions, processImageExtraction, showToast]);

  // Handle clipboard paste
  const handleClipboardPaste = useCallback((clipboardData) => {
    if (!clipboardData || !clipboardData.items) return false;
    const items = clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleFileUpload(file);
          showToast('Image pasted from clipboard!', 'success');
          return true;
        }
      }
    }
    return false;
  }, [handleFileUpload, showToast]);

  // Add custom color to current palette
  const addColorToPalette = useCallback((hex) => {
    const clean = hex.toUpperCase();
    setExtractedPalette(prev => {
      if (prev.some(c => c.hex === clean)) {
        showToast(`${clean} is already in the palette`, 'info');
        return prev;
      }
      showToast(`Added ${clean} to current palette`, 'success');
      return [...prev, { hex: clean, rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 }, frequency: 0 }];
    });
  }, [showToast]);

  // Remove color from palette
  const removeColorFromPalette = useCallback((hex) => {
    setExtractedPalette(prev => {
      if (prev.length <= 1) {
        showToast('A palette must have at least one color.', 'error');
        return prev;
      }
      showToast(`Removed ${hex} from palette`, 'info');
      return prev.filter(c => c.hex !== hex);
    });
  }, [showToast]);

  // Save custom palette
  const saveCustomPalette = useCallback((name, colors) => {
    const newPalette = {
      id: Date.now().toString(),
      name: name || `Custom Palette ${savedPalettes.length + 1}`,
      colors: colors.map(c => typeof c === 'string' ? c : c.hex),
      createdAt: new Date().toISOString()
    };
    setSavedPalettes(prev => [newPalette, ...prev]);
    showToast(`Saved palette "${newPalette.name}"!`, 'success');
    return newPalette;
  }, [savedPalettes.length, showToast]);

  const deleteCustomPalette = useCallback((id) => {
    setSavedPalettes(prev => prev.filter(p => p.id !== id));
    showToast('Deleted custom palette', 'info');
  }, [showToast]);

  return (
    <PaletteContext.Provider
      value={{
        currentImage,
        setCurrentImage,
        extractedPalette,
        setExtractedPalette,
        selectedColor,
        setSelectedColor: selectColor,
        hoveredColor,
        setHoveredColor,
        isExtracting,
        extractionOptions,
        setExtractionOptions,
        triggerExtractionWithCurrent,
        loadSampleImage,
        handleFileUpload,
        handleClipboardPaste,
        addColorToPalette,
        removeColorFromPalette,
        favorites,
        toggleFavorite,
        recentColors,
        addRecentColor,
        savedPalettes,
        saveCustomPalette,
        deleteCustomPalette
      }}
    >
      {children}
    </PaletteContext.Provider>
  );
}

export function usePalette() {
  const context = useContext(PaletteContext);
  if (!context) {
    throw new Error('usePalette must be used within a PaletteProvider');
  }
  return context;
}
