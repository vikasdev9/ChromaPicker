import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Image as ImageIcon,
  Heart,
  Plus,
  X,
  Pipette,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
  HelpCircle,
  Eye,
  Palette,
  ArrowUpDown,
  Upload,
  Sparkles,
  CircleDot
} from 'lucide-react';
import { usePalette } from '../../context/PaletteContext';
import { useToast } from '../../context/ToastContext';
import MagnifierLoupe from './MagnifierLoupe';
import ExtractionSettings from './ExtractionSettings';
import SelectImageModal from './SelectImageModal';
import { findNearestColorName } from '../../data/colorNames';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  rgbToCmyk,
  getContrastRatio,
  getReadableTextColor,
  getRelativeLuminance
} from '../../utils/colorMath';
import {
  exportPaletteJson,
  exportPaletteCssVariables,
  exportPaletteScss,
  exportPaletteSvg,
  exportPalettePng,
  exportPaletteTxt,
  exportPaletteGpl,
  exportPaletteAse,
  triggerFileDownload,
  triggerBlobDownload
} from '../../utils/downloadUtils';

export default function ImageWorkspace() {
  const { showToast } = useToast();
  const {
    currentImage,
    extractedPalette,
    selectedColor,
    setSelectedColor,
    handleFileUpload,
    handleClipboardPaste,
    addColorToPalette,
    removeColorFromPalette,
    favorites,
    toggleFavorite,
    triggerExtractionWithCurrent,
    loadSampleImage
  } = usePalette();

  const containerRef = useRef(null);
  const imageAreaRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const exportDropdownRef = useRef(null);

  // Loupe zoom magnification (range 2x - 32x, default 12x matching Screenshot 1)
  const [magnification, setMagnification] = useState(12);

  // Loupe circle diameter (range 90px - 320px, default 180px)
  const [loupeSize, setLoupeSize] = useState(180);

  // Background image fit mode: 'cover' (fills & covers whole area) vs 'contain'
  const [imageFit, setImageFit] = useState('cover');

  // Overall image zoom in viewport (1x - 3x)
  const [imageZoom, setImageZoom] = useState(1);

  // Eyedropper inspection mode: 'pick' (click to lock) or 'live' (hover continuously updates)
  const [eyedropperMode, setEyedropperMode] = useState('pick');

  // Palette sorting: 'frequency' | 'hue' | 'brightness' | 'saturation'
  const [sortBy, setSortBy] = useState('frequency');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Loupe state
  const [loupeState, setLoupeState] = useState({
    visible: false,
    x: 0,
    y: 0,
    actualX: 0,
    actualY: 0,
    pixelColor: null,
    containerWidth: 600,
    containerHeight: 400,
    isTouch: false
  });

  // Keep offscreen canvas updated with image pixels for ultra-accurate sampling
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      canvasRef.current = canvas;
    };
    img.src = currentImage.src;
  }, [currentImage.src]);

  // Global paste handler
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData) {
        handleClipboardPaste(e.clipboardData);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleClipboardPaste]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setIsSortMenuOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track fullscreen changes
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Keyboard shortcut to resize magnifier circle loupe ([ shrink, ] grow)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === '[') {
        setLoupeSize(prev => Math.max(90, prev - 15));
      } else if (e.key === ']') {
        setLoupeSize(prev => Math.min(320, prev + 15));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Copy helper with visual checkmark feedback
  const handleCopy = (text, keyName) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    showToast(`Copied ${keyName}: ${text}`, 'success');
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Image viewport zoom handlers
  const handleZoomIn = () => setImageZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setImageZoom(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setImageZoom(1);

  // Mouse wheel handler to resize loupe circle when Alt or Shift is held
  const handleAreaWheel = (e) => {
    if (e.altKey || e.shiftKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 15 : -15;
      setLoupeSize(prev => Math.min(320, Math.max(90, prev + delta)));
    }
  };

  // Calculate pixel coordinates from event with accurate cover/contain aspect-ratio math
  const getCoordinatesFromEvent = (e) => {
    if (!imageRef.current || !canvasRef.current) return null;

    const targetArea = imageAreaRef.current || containerRef.current;
    if (!targetArea) return null;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const imgRect = imageRef.current.getBoundingClientRect();
    const mouseX = clientX - imgRect.left;
    const mouseY = clientY - imgRect.top;

    if (mouseX < 0 || mouseX > imgRect.width || mouseY < 0 || mouseY > imgRect.height) {
      return null;
    }

    const naturalW = canvasRef.current.width;
    const naturalH = canvasRef.current.height;
    if (!naturalW || !naturalH) return null;

    const renderedW = imgRect.width;
    const renderedH = imgRect.height;

    let actualX, actualY;

    if (imageFit === 'cover') {
      // In cover mode: image fills renderedW x renderedH completely, centered
      const scale = Math.max(renderedW / naturalW, renderedH / naturalH);
      const drawnW = naturalW * scale;
      const drawnH = naturalH * scale;
      const offsetX = (renderedW - drawnW) / 2;
      const offsetY = (renderedH - drawnH) / 2;

      actualX = Math.floor((mouseX - offsetX) / scale);
      actualY = Math.floor((mouseY - offsetY) / scale);
    } else {
      // In contain mode: image fits inside renderedW x renderedH, centered
      const scale = Math.min(renderedW / naturalW, renderedH / naturalH);
      const drawnW = naturalW * scale;
      const drawnH = naturalH * scale;
      const offsetX = (renderedW - drawnW) / 2;
      const offsetY = (renderedH - drawnH) / 2;

      if (mouseX < offsetX || mouseX > offsetX + drawnW || mouseY < offsetY || mouseY > offsetY + drawnH) {
        return null;
      }
      actualX = Math.floor((mouseX - offsetX) / scale);
      actualY = Math.floor((mouseY - offsetY) / scale);
    }

    actualX = Math.min(Math.max(actualX, 0), naturalW - 1);
    actualY = Math.min(Math.max(actualY, 0), naturalH - 1);

    const containerRect = targetArea.getBoundingClientRect();
    const relativeX = clientX - containerRect.left;
    const relativeY = clientY - containerRect.top;

    return {
      relativeX,
      relativeY,
      actualX,
      actualY,
      containerWidth: containerRect.width,
      containerHeight: containerRect.height
    };
  };

  // Mouse / Touch inspection handler
  const handlePointerInspect = useCallback((coords) => {
    if (!coords || !canvasRef.current) {
      setLoupeState(prev => ({ ...prev, visible: false }));
      return;
    }

    try {
      const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
      const pixel = ctx.getImageData(coords.actualX, coords.actualY, 1, 1).data;
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

      setLoupeState({
        visible: true,
        x: coords.relativeX,
        y: coords.relativeY,
        actualX: coords.actualX,
        actualY: coords.actualY,
        pixelColor: hex,
        containerWidth: coords.containerWidth,
        containerHeight: coords.containerHeight,
        isTouch: !!coords.isTouch
      });

      // If in Live preview mode, update selected color continuously
      if (eyedropperMode === 'live') {
        setSelectedColor(hex);
      }
    } catch {
      // Ignore cross-origin canvas read restrictions
    }
  }, [eyedropperMode, setSelectedColor]);

  const handleMouseMove = (e) => {
    const coords = getCoordinatesFromEvent(e);
    handlePointerInspect(coords);
  };

  const handleMouseLeave = () => {
    setLoupeState(prev => ({ ...prev, visible: false }));
  };

  // Touch handlers for mobile devices
  const handleTouchMove = (e) => {
    const coords = getCoordinatesFromEvent(e);
    if (coords) {
      if (e.cancelable) e.preventDefault();
      handlePointerInspect({ ...coords, isTouch: true });
    }
  };

  const handleTouchEnd = () => {
    if (loupeState.pixelColor) {
      setSelectedColor(loupeState.pixelColor);
      showToast(`Selected pixel: ${loupeState.pixelColor}`, 'success');
    }
  };

  // Click on image to lock/pick color
  const handleImageClick = () => {
    if (loupeState.pixelColor) {
      setSelectedColor(loupeState.pixelColor);
      showToast(`Selected pixel: ${loupeState.pixelColor}`, 'success');
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Screen Eyedropper API
  const handlePickFromScreen = async () => {
    if (window.EyeDropper) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          const hex = result.sRGBHex.toUpperCase();
          setSelectedColor(hex);
          addColorToPalette(hex);
          showToast(`Sampled screen color: ${hex}`, 'success');
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          showToast('Could not sample color from screen.', 'info');
        }
      }
    } else {
      setIsSelectModalOpen(true);
    }
  };

  // Formatted representations of current selected color
  const activeHex = (selectedColor || '#FFD814').toUpperCase();
  const colorNameInfo = findNearestColorName(activeHex);
  const colorName = colorNameInfo ? colorNameInfo.name : 'Vibrant Color';

  const rgb = hexToRgb(activeHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
  const cmykString = `${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}`;

  // WCAG 2.1 Contrast ratios
  const contrastWhite = getContrastRatio(activeHex, '#FFFFFF');
  const contrastBlack = getContrastRatio(activeHex, '#000000');
  const whiteRating = contrastWhite >= 7.0 ? 'AAA' : contrastWhite >= 4.5 ? 'AA' : contrastWhite >= 3.0 ? 'AA Large' : 'Fail';
  const blackRating = contrastBlack >= 7.0 ? 'AAA' : contrastBlack >= 4.5 ? 'AA' : contrastBlack >= 3.0 ? 'AA Large' : 'Fail';
  const sampleTextColor = getReadableTextColor(activeHex);

  // Sort extracted palette according to current sort criteria
  const sortedPalette = [...extractedPalette].sort((a, b) => {
    if (sortBy === 'frequency') {
      return (b.frequency || 0) - (a.frequency || 0);
    }
    if (sortBy === 'hue') {
      const hslA = rgbToHsl(hexToRgb(a.hex).r, hexToRgb(a.hex).g, hexToRgb(a.hex).b);
      const hslB = rgbToHsl(hexToRgb(b.hex).r, hexToRgb(b.hex).g, hexToRgb(b.hex).b);
      return hslA.h - hslB.h;
    }
    if (sortBy === 'brightness') {
      const lumA = getRelativeLuminance(hexToRgb(a.hex).r, hexToRgb(a.hex).g, hexToRgb(a.hex).b);
      const lumB = getRelativeLuminance(hexToRgb(b.hex).r, hexToRgb(b.hex).g, hexToRgb(b.hex).b);
      return lumB - lumA;
    }
    if (sortBy === 'saturation') {
      const hslA = rgbToHsl(hexToRgb(a.hex).r, hexToRgb(a.hex).g, hexToRgb(a.hex).b);
      const hslB = rgbToHsl(hexToRgb(b.hex).r, hexToRgb(b.hex).g, hexToRgb(b.hex).b);
      return hslB.s - hslA.s;
    }
    return 0;
  });

  // Export handlers
  const handleExport = async (format) => {
    setIsExportMenuOpen(false);
    const paletteName = currentImage?.filename
      ? `Chromapick-${currentImage.filename.replace(/\.[^/.]+$/, '')}`
      : 'Chromapick-Palette';
    const colors = sortedPalette;

    if (format === 'json') {
      const content = exportPaletteJson(paletteName, colors);
      triggerFileDownload(content, `${paletteName}.json`, 'application/json');
    } else if (format === 'css') {
      const content = exportPaletteCssVariables(paletteName, colors);
      triggerFileDownload(content, `${paletteName}.css`, 'text/css');
    } else if (format === 'ase') {
      const aseBlob = exportPaletteAse(paletteName, colors);
      triggerBlobDownload(aseBlob, `${paletteName}.ase`);
    } else if (format === 'scss') {
      const content = exportPaletteScss(paletteName, colors);
      triggerFileDownload(content, `${paletteName}.scss`, 'text/x-scss');
    } else if (format === 'txt') {
      const content = exportPaletteTxt(paletteName, colors);
      triggerFileDownload(content, `${paletteName}.txt`, 'text/plain');
    } else if (format === 'gpl') {
      const content = exportPaletteGpl(paletteName, colors);
      triggerFileDownload(content, `${paletteName}.gpl`, 'text/plain');
    } else if (format === 'svg') {
      const content = exportPaletteSvg(paletteName, colors);
      triggerFileDownload(content, `${paletteName}.svg`, 'image/svg+xml');
    } else if (format === 'png') {
      await exportPalettePng(paletteName, colors);
    }
    showToast(`Exported palette as ${format.toUpperCase()}`, 'success');
  };

  return (
    <div
      className="chroma-card"
      style={{
        width: '100%',
        maxWidth: '100%',
        marginBottom: 40,
        background: 'var(--bg-card)',
        borderRadius: 20,
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden'
      }}
    >
      {/* 2-Column Main Workspace matching Reference Screenshot 1 */}
      <div className="workspace-grid">
        {/* ================= LEFT COLUMN: IMAGE PREVIEW PANEL ================= */}
        <div
          ref={containerRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="workspace-left-col"
          style={{
            position: 'relative',
            background: 'var(--bg-card-subtle)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: 0
          }}
        >
          {/* Image Toolbar Header matching Screenshot 1 */}
          <div
            className="workspace-image-toolbar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px clamp(12px, 2.5vw, 20px)',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              flexWrap: 'wrap',
              gap: 8
            }}
          >
            {/* Image info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '1 1 auto' }}>
              <ImageIcon size={18} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 'clamp(100px, 28vw, 320px)'
                }}
                title={currentImage?.filename || 'No image loaded'}
              >
                {currentImage?.filename || 'No image loaded'}
              </span>
              {currentImage?.width && currentImage?.height ? (
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-card-subtle)',
                    padding: '2px 6px',
                    borderRadius: 6,
                    border: '1px solid var(--border-color)',
                    flexShrink: 0,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {currentImage.width}×{currentImage.height}
                </span>
              ) : null}
            </div>

            {/* Viewport & Image Action Controls */}
            <div className="workspace-toolbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, flexWrap: 'nowrap' }}>
              {/* Change Image button */}
              <button
                onClick={() => setIsSelectModalOpen(true)}
                className="btn-change-image"
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  cursor: 'pointer',
                  minHeight: 32,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'var(--transition-normal)'
                }}
                title="Change or upload image"
              >
                <ImageIcon size={14} />
                <span className="btn-change-text">Change Image</span>
              </button>

              {/* Fit Mode Toggle: Clean, Never-wrapping Cover / Contain Toggle */}
              <button
                type="button"
                className={`btn-fit-toggle ${imageFit === 'cover' ? 'active' : ''}`}
                style={{
                  height: 32,
                  padding: '0 10px',
                  borderRadius: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-color)',
                  background: imageFit === 'cover' ? 'rgba(37, 150, 190, 0.12)' : 'var(--bg-card)',
                  color: imageFit === 'cover' ? 'var(--color-accent-blue)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  width: 'auto',
                  minWidth: 'max-content',
                  transition: 'var(--transition-normal)'
                }}
                onClick={() => setImageFit(prev => prev === 'cover' ? 'contain' : 'cover')}
                title={imageFit === 'cover' ? 'Image Fit: Cover (Taking whole area). Click to switch to Contain.' : 'Image Fit: Contain (Fits whole image). Click to switch to Cover.'}
                aria-label={`Toggle image fit mode, currently ${imageFit}`}
              >
                {imageFit === 'cover' ? <Minimize2 size={13} style={{ flexShrink: 0 }} /> : <Maximize2 size={13} style={{ flexShrink: 0 }} />}
                <span className="btn-fit-text" style={{ whiteSpace: 'nowrap' }}>
                  <span className="fit-prefix">Fit: </span>
                  <strong style={{ fontWeight: 700 }}>{imageFit === 'cover' ? 'Cover' : 'Contain'}</strong>
                </span>
              </button>

              {/* Loupe Circle Size Toolbar Control */}
              <div
                className="loupe-toolbar-picker"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  padding: '2px 4px',
                  gap: 2,
                  height: 32,
                  flexShrink: 0,
                  whiteSpace: 'nowrap'
                }}
                title="Resize Magnifier Circle Loupe (Shortcut: [ / ] or Alt+Scroll)"
              >
                <CircleDot size={13} color="var(--color-accent-blue)" style={{ marginLeft: 2 }} />
                <span className="loupe-toolbar-label" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0 2px' }}>
                  Loupe
                </span>
                <button
                  type="button"
                  onClick={() => setLoupeSize(prev => Math.max(90, prev - 20))}
                  disabled={loupeSize <= 90}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    border: 'none',
                    background: 'var(--bg-card-subtle)',
                    color: 'var(--text-primary)',
                    cursor: loupeSize <= 90 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    lineHeight: 1
                  }}
                  title="Decrease circle loupe size"
                >
                  -
                </button>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    minWidth: 38,
                    textAlign: 'center'
                  }}
                >
                  {loupeSize}px
                </span>
                <button
                  type="button"
                  onClick={() => setLoupeSize(prev => Math.min(320, prev + 20))}
                  disabled={loupeSize >= 320}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    border: 'none',
                    background: 'var(--bg-card-subtle)',
                    color: 'var(--text-primary)',
                    cursor: loupeSize >= 320 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    lineHeight: 1
                  }}
                  title="Increase circle loupe size"
                >
                  +
                </button>
              </div>

              <button
                className="theme-toggle-btn"
                style={{ width: 32, height: 32, borderRadius: 8 }}
                onClick={handleZoomOut}
                title="Zoom Out Image View"
              >
                <ZoomOut size={14} />
              </button>

              <button
                className="theme-toggle-btn"
                style={{ width: 32, height: 32, borderRadius: 8 }}
                onClick={handleZoomIn}
                title="Zoom In Image View"
              >
                <ZoomIn size={14} />
              </button>

              {imageZoom !== 1 && (
                <button
                  className="theme-toggle-btn"
                  style={{ width: 32, height: 32, borderRadius: 8 }}
                  onClick={handleResetZoom}
                  title="Fit to Screen / Reset Zoom"
                >
                  <RotateCcw size={14} />
                </button>
              )}

              <button
                className="theme-toggle-btn"
                style={{ width: 32, height: 32, borderRadius: 8 }}
                onClick={handleToggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Image View'}
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          {/* Interactive Image Display Area with Circular Magnifier Loupe */}
          <div
            ref={imageAreaRef}
            className="workspace-image-area"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: imageFit === 'cover' ? 0 : 'clamp(8px, 2.5vw, 24px)',
              overflow: 'hidden',
              cursor: currentImage?.src ? 'crosshair' : 'default',
              position: 'relative',
              background: 'var(--bg-preview)',
              userSelect: 'none',
              touchAction: 'none'
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchMove}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleImageClick}
            onWheel={handleAreaWheel}
          >
            {!currentImage?.src ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '48px 24px',
                  textAlign: 'center',
                  gap: 14
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-accent-blue)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <ImageIcon size={32} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    No image loaded
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto', lineHeight: 1.5 }}>
                    Upload or paste an image, or try one of our curated sample images to inspect colors and extract palettes.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
                  <button
                    onClick={() => setIsSelectModalOpen(true)}
                    className="btn-primary"
                    style={{ padding: '9px 18px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 10 }}
                  >
                    <Upload size={15} />
                    <span>Upload Image</span>
                  </button>
                  <button
                    onClick={() => loadSampleImage('alpine-lake')}
                    className="btn-secondary"
                    style={{ padding: '9px 16px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 10 }}
                  >
                    <Sparkles size={15} color="var(--color-accent-blue)" />
                    <span>Try Sample</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Large Circular Magnifier Loupe with Pixel Grid & Floating Card matching Screenshot 1 */}
                <MagnifierLoupe
                  x={loupeState.x}
                  y={loupeState.y}
                  actualX={loupeState.actualX}
                  actualY={loupeState.actualY}
                  sourceCanvasRef={canvasRef}
                  pixelColor={loupeState.pixelColor}
                  visible={loupeState.visible}
                  containerWidth={loupeState.containerWidth}
                  containerHeight={loupeState.containerHeight}
                  magnification={magnification}
                  loupeDiameter={loupeSize}
                  isTouch={loupeState.isTouch}
                  onCopy={(hex) => showToast(`Copied ${hex}`, 'success')}
                />

                {/* Main Interactive Source Image with cover fit to take whole area */}
                <img
                  ref={imageRef}
                  src={currentImage.src}
                  alt={currentImage.title || 'Source image for palette extraction'}
                  style={{
                    width: imageFit === 'cover' ? '100%' : 'auto',
                    height: imageFit === 'cover' ? '100%' : 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: imageFit,
                    borderRadius: imageFit === 'cover' ? 0 : 12,
                    boxShadow: imageFit === 'cover' ? 'none' : '0 8px 24px -4px rgba(0,0,0,0.12)',
                    transform: `scale(${imageZoom})`,
                    transition: 'transform 0.15s ease-out',
                    pointerEvents: 'none',
                    display: 'block'
                  }}
                />

                {/* Instruction Overlay Pill at bottom left */}
                <div
                  className="instruction-overlay-pill"
                  style={{
                    position: 'absolute',
                    bottom: 'clamp(8px, 1.8vw, 16px)',
                    left: 'clamp(8px, 1.8vw, 16px)',
                    background: 'rgba(15, 23, 42, 0.88)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    fontSize: 'clamp(0.66rem, 1.2vw, 0.74rem)',
                    fontWeight: 600,
                    padding: 'clamp(4px, 0.8vw, 6px) clamp(8px, 1.4vw, 14px)',
                    borderRadius: 20,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.28)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    maxWidth: 'calc(100% - 24px)',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  <Pipette size={13} color="var(--color-accent-blue)" style={{ flexShrink: 0 }} />
                  <span className="instruction-text-desktop" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Move to inspect · Click to pick · [ / ] Resize loupe
                  </span>
                  <span className="instruction-text-mobile" style={{ display: 'none', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Tap to pick · Drag to inspect
                  </span>
                </div>
              </>
            )}

            {/* Drag & Drop Overlay */}
            {isDragOver && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(37, 150, 190, 0.9)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  zIndex: 30
                }}
              >
                <ImageIcon size={48} style={{ marginBottom: 12 }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Drop image here</h3>
                <p style={{ fontSize: '0.88rem', opacity: 0.9 }}>PNG, JPG, WebP, SVG supported</p>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: SELECTED COLOR DETAILS PANEL ================= */}
        <div
          className="workspace-right-col"
          style={{
            padding: 'clamp(14px, 1.8vw, 22px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(10px, 1.4vw, 14px)',
            background: 'var(--bg-card)',
            minWidth: 0
          }}
        >
          {/* Header with Title and Favorite button matching Screenshot 1 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontWeight: 800, fontSize: 'clamp(1.05rem, 1.8vw, 1.18rem)', color: 'var(--text-primary)', margin: 0 }}>
              Selected Color
            </h3>
            <button
              onClick={() => toggleFavorite(activeHex)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 6,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s ease'
              }}
              title={favorites.includes(activeHex) ? 'Remove from favorites' : 'Add to favorites'}
              aria-label="Toggle favorite"
            >
              <Heart
                size={18}
                fill={favorites.includes(activeHex) ? '#EF4444' : 'none'}
                color={favorites.includes(activeHex) ? '#EF4444' : 'var(--text-secondary)'}
              />
            </button>
          </div>

          {/* Large Color Swatch with Color Name and Live Sample Text matching Screenshot 1 */}
          <div
            style={{
              borderRadius: 'clamp(10px, 1.5vw, 14px)',
              backgroundColor: activeHex,
              padding: 'clamp(12px, 1.8vw, 18px) clamp(14px, 2.2vw, 20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm), inset 0 0 0 1px rgba(0,0,0,0.08)',
              transition: 'background-color 0.2s ease',
              minHeight: 'clamp(72px, 9vh, 84px)'
            }}
          >
            {/* Left: Large HEX and Color Name */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(1.25rem, 2.3vw, 1.48rem)',
                  fontWeight: 800,
                  color: sampleTextColor,
                  letterSpacing: '0.02em',
                  lineHeight: 1.15
                }}
              >
                {activeHex}
              </span>
              <span
                style={{
                  fontSize: 'clamp(0.74rem, 1.3vw, 0.82rem)',
                  fontWeight: 600,
                  color: sampleTextColor,
                  opacity: 0.88,
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {colorName}
              </span>
            </div>

            {/* Right: Aa Sample Text Preview showing Live Contrast */}
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
              <span
                style={{
                  fontSize: 'clamp(1.25rem, 2.3vw, 1.48rem)',
                  fontWeight: 800,
                  color: sampleTextColor,
                  lineHeight: 1.15
                }}
              >
                Aa
              </span>
              <span
                style={{
                  fontSize: 'clamp(0.66rem, 1.2vw, 0.74rem)',
                  fontWeight: 600,
                  color: sampleTextColor,
                  opacity: 0.88,
                  marginTop: 2,
                  whiteSpace: 'nowrap'
                }}
              >
                Sample Text
              </span>
            </div>
          </div>

          {/* Color Values Table (HEX, RGB, HSL, CMYK) with Copy Buttons matching Screenshot 1 */}
          {/* Color Values Table (HEX, RGB, HSL, CMYK) with Copy Buttons matching Screenshot 1 */}
          <div className="color-values-grid" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(5px, 0.8vw, 7px)' }}>
            {[
              { label: 'HEX', value: activeHex },
              { label: 'RGB', value: rgbString },
              { label: 'HSL', value: hslString },
              { label: 'CMYK', value: cmykString }
            ].map(item => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'clamp(5px, 0.8vw, 7px) clamp(8px, 1.2vw, 12px)',
                  borderRadius: 10,
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                  gap: 8,
                  minWidth: 0
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)', width: 'clamp(36px, 5vw, 42px)', flexShrink: 0, fontSize: 'clamp(0.72rem, 1.2vw, 0.8rem)' }}>
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    flex: 1,
                    textAlign: 'right',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: 'clamp(0.75rem, 1.2vw, 0.82rem)',
                    letterSpacing: '-0.01em'
                  }}
                  title={item.value}
                >
                  {item.value}
                </span>
                <button
                  onClick={() => handleCopy(item.value, item.label)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: copiedKey === item.label ? 'var(--badge-success-text)' : 'var(--text-secondary)',
                    padding: 3,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    flexShrink: 0
                  }}
                  title={`Copy ${item.label}`}
                  aria-label={`Copy ${item.label}`}
                >
                  {copiedKey === item.label ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>

          {/* Contrast Ratio (WCAG) Section matching Screenshot 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 'clamp(0.76rem, 1.3vw, 0.82rem)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Contrast Ratio (WCAG)
            </span>

            <div className="color-contrast-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(6px, 1.2vw, 10px)' }}>
              {/* White Text Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 'clamp(6px, 1vw, 8px) clamp(8px, 1.2vw, 10px)',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card-subtle)',
                  minWidth: 0
                }}
              >
                <div
                  style={{
                    width: 'clamp(20px, 3vw, 24px)',
                    height: 'clamp(20px, 3vw, 24px)',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    flexShrink: 0
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontWeight: 800, fontSize: 'clamp(0.82rem, 1.4vw, 0.88rem)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    {contrastWhite}:1
                  </span>
                  <span
                    style={{
                      fontSize: 'clamp(0.62rem, 1.1vw, 0.68rem)',
                      fontWeight: 700,
                      color: contrastWhite >= 4.5 ? 'var(--badge-success-text)' : 'var(--badge-error-text)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    White: {whiteRating}
                  </span>
                </div>
              </div>

              {/* Black Text Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 'clamp(6px, 1vw, 8px) clamp(8px, 1.2vw, 10px)',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card-subtle)',
                  minWidth: 0
                }}
              >
                <div
                  style={{
                    width: 'clamp(20px, 3vw, 24px)',
                    height: 'clamp(20px, 3vw, 24px)',
                    borderRadius: '50%',
                    backgroundColor: '#000000',
                    flexShrink: 0
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontWeight: 800, fontSize: 'clamp(0.82rem, 1.4vw, 0.88rem)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    {contrastBlack}:1
                  </span>
                  <span
                    style={{
                      fontSize: 'clamp(0.62rem, 1.1vw, 0.68rem)',
                      fontWeight: 700,
                      color: contrastBlack >= 4.5 ? 'var(--badge-success-text)' : 'var(--badge-error-text)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Black: {blackRating}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Eyedropper Mode & Zoom Level Controls */}
          <div className="workspace-controls-row">
            {/* Eyedropper Mode Switcher */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                <span style={{ fontSize: 'clamp(0.74rem, 1.3vw, 0.78rem)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Eyedropper Mode
                </span>
                <HelpCircle size={13} color="var(--text-muted)" title="Pick color commits on click; Live preview updates continuously as you hover" />
              </div>
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card-subtle)', padding: 3, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => setEyedropperMode('pick')}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: 7,
                    border: 'none',
                    background: eyedropperMode === 'pick' ? 'var(--bg-card)' : 'transparent',
                    boxShadow: eyedropperMode === 'pick' ? 'var(--shadow-sm)' : 'none',
                    color: eyedropperMode === 'pick' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: 'clamp(0.72rem, 1.2vw, 0.76rem)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    minHeight: 'clamp(32px, 4.2vh, 36px)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Pipette size={13} />
                  <span>Pick color</span>
                </button>
                <button
                  onClick={() => setEyedropperMode('live')}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: 7,
                    border: 'none',
                    background: eyedropperMode === 'live' ? 'var(--bg-card)' : 'transparent',
                    boxShadow: eyedropperMode === 'live' ? 'var(--shadow-sm)' : 'none',
                    color: eyedropperMode === 'live' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: 'clamp(0.72rem, 1.2vw, 0.76rem)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    minHeight: 'clamp(32px, 4.2vh, 36px)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Eye size={13} />
                  <span>Live preview</span>
                </button>
              </div>
            </div>

            {/* Magnifier Zoom Level Slider */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 'clamp(0.74rem, 1.3vw, 0.78rem)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Zoom Level
                </span>
                <span style={{ fontSize: 'clamp(0.76rem, 1.3vw, 0.8rem)', fontWeight: 800, color: 'var(--color-accent-blue)', fontFamily: 'var(--font-mono)' }}>
                  {magnification}×
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 0' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>2×</span>
                <input
                  type="range"
                  min="2"
                  max="32"
                  step="1"
                  value={magnification}
                  onChange={(e) => setMagnification(Number(e.target.value))}
                  style={{
                    flex: 1,
                    width: '100%',
                    minWidth: 0,
                    cursor: 'pointer',
                    accentColor: 'var(--color-accent-blue)',
                    minHeight: 24,
                    margin: 0
                  }}
                  aria-label="Magnifier Zoom Level"
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>32×</span>
              </div>
            </div>

            {/* Magnifier Circle Size (Loupe Diameter) Slider */}
            <div style={{ marginTop: 'clamp(8px, 1.2vw, 12px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 'clamp(0.74rem, 1.3vw, 0.78rem)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Loupe Circle Size
                </span>
                <span style={{ fontSize: 'clamp(0.76rem, 1.3vw, 0.8rem)', fontWeight: 800, color: 'var(--color-accent-blue)', fontFamily: 'var(--font-mono)' }}>
                  {loupeSize}px
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 0' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>90px</span>
                <input
                  type="range"
                  min="90"
                  max="320"
                  step="10"
                  value={loupeSize}
                  onChange={(e) => setLoupeSize(Number(e.target.value))}
                  style={{
                    flex: 1,
                    width: '100%',
                    minWidth: 0,
                    cursor: 'pointer',
                    accentColor: 'var(--color-accent-blue)',
                    minHeight: 24,
                    margin: 0
                  }}
                  aria-label="Loupe Circle Size"
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>320px</span>
              </div>
              {/* Quick preset chips */}
              <div className="loupe-presets-grid" style={{ display: 'flex', gap: 5, marginTop: 6 }}>
                {[
                  { label: 'S', size: 120 },
                  { label: 'M', size: 160 },
                  { label: 'L', size: 200 },
                  { label: 'XL', size: 260 }
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setLoupeSize(preset.size)}
                    className={`loupe-preset-chip ${loupeSize === preset.size ? 'active' : ''}`}
                    style={{
                      flex: 1,
                      padding: 'clamp(3px, 0.6vw, 5px) 0',
                      fontSize: 'clamp(0.66rem, 1.1vw, 0.72rem)',
                      fontWeight: loupeSize === preset.size ? 700 : 500,
                      borderRadius: 6,
                      border: '1px solid var(--border-color)',
                      background: loupeSize === preset.size ? 'var(--color-accent-blue)' : 'var(--bg-card-subtle)',
                      color: loupeSize === preset.size ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>{preset.label}</span>
                    <span className="preset-chip-size"> ({preset.size}px)</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Action Button: Add to Palette matching Screenshot 1 */}
          <button
            onClick={() => {
              addColorToPalette(activeHex);
              showToast(`Added ${activeHex} to palette!`, 'success');
            }}
            style={{
              width: '100%',
              padding: 'clamp(10px, 1.6vw, 13px) clamp(14px, 2vw, 18px)',
              borderRadius: 12,
              background: 'var(--color-accent-blue)',
              color: 'var(--text-inverse)',
              border: 'none',
              fontSize: 'clamp(0.86rem, 1.6vw, 0.94rem)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              minHeight: 'clamp(40px, 5.2vh, 46px)',
              boxShadow: '0 4px 14px rgba(37, 150, 190, 0.35)',
              transition: 'var(--transition-normal)'
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            <Plus size={18} />
            <span>Add to palette</span>
          </button>

          {/* Secondary Action Buttons matching Screenshot 1 */}
          <div className="workspace-action-buttons" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(6px, 1.2vw, 10px)' }}>
            {/* Upload Image button */}
            <button
              onClick={() => setIsSelectModalOpen(true)}
              style={{
                padding: 'clamp(8px, 1.4vw, 11px) clamp(10px, 1.6vw, 14px)',
                borderRadius: 10,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: 'clamp(0.78rem, 1.4vw, 0.86rem)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                cursor: 'pointer',
                minHeight: 'clamp(38px, 4.8vh, 44px)',
                transition: 'var(--transition-normal)',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent-blue)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <ImageIcon size={16} />
              <span>Upload image</span>
            </button>

            {/* Pick from Screen button */}
            <button
              onClick={handlePickFromScreen}
              style={{
                padding: 'clamp(8px, 1.4vw, 11px) clamp(10px, 1.6vw, 14px)',
                borderRadius: 10,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: 'clamp(0.78rem, 1.4vw, 0.86rem)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                cursor: 'pointer',
                minHeight: 'clamp(38px, 4.8vh, 44px)',
                transition: 'var(--transition-normal)',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent-blue)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <Pipette size={16} />
              <span>Pick from screen</span>
            </button>
          </div>

          {/* Privacy Note matching Screenshot 1 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: 'clamp(0.68rem, 1.2vw, 0.74rem)',
              color: 'var(--text-muted)',
              marginTop: 2
            }}
          >
            <ShieldCheck size={14} color="var(--badge-success-text)" />
            <span>Image stays in your browser. No data is uploaded.</span>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM: EXTRACTED COLOR PALETTE SECTION ================= */}
      <div
        className="workspace-palette-section"
        style={{
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          width: '100%'
        }}
      >
        {/* Palette Section Header with Toolbar matching Screenshot 1 */}
        <div
          className="palette-section-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
            marginBottom: 20
          }}
        >
          {/* Left Title & Count Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Palette size={20} color="var(--color-accent-blue)" />
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Extracted Palette
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--color-accent-blue)',
                background: 'rgba(37, 150, 190, 0.1)',
                padding: '3px 10px',
                borderRadius: 20
              }}
            >
              {sortedPalette.length} colors
            </span>
          </div>

          {/* Right Action Toolbar matching Screenshot 1 */}
          <div className="palette-toolbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Re-extract button */}
            <button
              onClick={() => {
                triggerExtractionWithCurrent();
                showToast('Re-extracting color palette...', 'info');
              }}
              style={{
                padding: '7px 14px',
                borderRadius: 9,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} />
              <span>Re-extract</span>
            </button>

            {/* Sort by dropdown */}
            <div ref={sortDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setIsSortMenuOpen(prev => !prev)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 9,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <ArrowUpDown size={14} />
                <span>
                  Sort by {sortBy === 'frequency' ? 'prominence' : sortBy}
                </span>
                <ChevronDown size={14} />
              </button>

              {isSortMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    width: 170,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 12,
                    boxShadow: 'var(--shadow-lg)',
                    padding: 6,
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  {[
                    { id: 'frequency', label: 'Prominence' },
                    { id: 'hue', label: 'Hue' },
                    { id: 'brightness', label: 'Brightness' },
                    { id: 'saturation', label: 'Saturation' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSortBy(item.id);
                        setIsSortMenuOpen(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        border: 'none',
                        background: sortBy === item.id ? 'var(--bg-card-hover)' : 'transparent',
                        color: sortBy === item.id ? 'var(--color-accent-blue)' : 'var(--text-primary)',
                        fontWeight: sortBy === item.id ? 700 : 500,
                        fontSize: '0.82rem',
                        borderRadius: 8,
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Copy all HEX button */}
            <button
              onClick={() => {
                const hexList = sortedPalette.map(c => c.hex).join(', ');
                handleCopy(hexList, 'All HEX codes');
              }}
              style={{
                padding: '7px 14px',
                borderRadius: 9,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
            >
              <Copy size={14} />
              <span>Copy all HEX</span>
            </button>

            {/* Export dropdown menu */}
            <div ref={exportDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setIsExportMenuOpen(prev => !prev)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 9,
                  border: 'none',
                  background: 'var(--btn-primary-bg)',
                  color: 'var(--btn-primary-text)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <Download size={14} />
                <span>Export</span>
                <ChevronDown size={14} />
              </button>

              {isExportMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    width: 220,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 12,
                    boxShadow: 'var(--shadow-lg)',
                    padding: 8,
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                  }}
                >
                  <button onClick={() => handleExport('css')} className="mega-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', padding: '7px 12px', fontSize: '0.82rem' }}>
                    CSS Variables (:root)
                  </button>
                  <button onClick={() => handleExport('json')} className="mega-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', padding: '7px 12px', fontSize: '0.82rem' }}>
                    JSON Palette
                  </button>
                  <button onClick={() => handleExport('ase')} className="mega-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', padding: '7px 12px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-accent-blue)' }}>
                    ASE (Adobe Swatch Exchange)
                  </button>
                  <button onClick={() => handleExport('png')} className="mega-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', padding: '7px 12px', fontSize: '0.82rem' }}>
                    PNG Image Card
                  </button>
                  <button onClick={() => handleExport('svg')} className="mega-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', padding: '7px 12px', fontSize: '0.82rem' }}>
                    SVG Vector Swatches
                  </button>
                  <button onClick={() => handleExport('scss')} className="mega-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', padding: '7px 12px', fontSize: '0.82rem' }}>
                    SCSS Variables
                  </button>
                  <button onClick={() => handleExport('txt')} className="mega-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', padding: '7px 12px', fontSize: '0.82rem' }}>
                    Plain TXT List
                  </button>
                  <button onClick={() => handleExport('gpl')} className="mega-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', padding: '7px 12px', fontSize: '0.82rem' }}>
                    GIMP/Inkscape GPL
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Swatches Row & Quick Format Chips matching Screenshot 1 */}
        <div className="palette-bottom-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          {/* Swatches + Add Color Card */}
          <div className="palette-swatches-grid" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {sortedPalette.map((colorItem, idx) => {
              const isSelected = selectedColor?.toUpperCase() === colorItem.hex?.toUpperCase();
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedColor(colorItem.hex)}
                >
                  {/* Color Swatch Box */}
                  <div
                    style={{
                      position: 'relative',
                      width: 62,
                      height: 60,
                      borderRadius: 12,
                      backgroundColor: colorItem.hex,
                      boxShadow: isSelected
                        ? '0 0 0 3px var(--color-accent-blue), 0 0 0 5px var(--bg-card), var(--shadow-md)'
                        : '0 2px 6px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.06)',
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                      zIndex: isSelected ? 3 : 1,
                      transition: 'all 0.15s ease'
                    }}
                    title={`${colorItem.hex} (${Math.round(colorItem.frequency || 0)}%) - Click to select`}
                  >
                    {/* Check icon if selected */}
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))'
                        }}
                      >
                        <Check size={18} strokeWidth={3} />
                      </div>
                    )}

                    {/* Delete hover icon */}
                    {sortedPalette.length > 2 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeColorFromPalette(colorItem.hex);
                        }}
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: 'rgba(15, 23, 42, 0.9)',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255, 255, 255, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title={`Remove ${colorItem.hex}`}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>

                  {/* Underneath: HEX & Frequency % */}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--color-accent-blue)' : 'var(--text-primary)',
                      marginTop: 6
                    }}
                  >
                    {colorItem.hex}
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)'
                    }}
                  >
                    {colorItem.frequency > 0 ? `${Math.round(colorItem.frequency)}%` : ''}
                  </span>
                </div>
              );
            })}

            {/* Add Color Card matching Screenshot 1 */}
            <button
              onClick={() => {
                const hex = prompt('Enter a HEX color code (e.g. #FF5733):');
                if (hex) addColorToPalette(hex);
              }}
              style={{
                width: 68,
                height: 94,
                borderRadius: 12,
                border: '1.5px dashed var(--border-color)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-accent-blue)';
                e.currentTarget.style.color = 'var(--color-accent-blue)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
              title="Add color to palette"
            >
              <Plus size={20} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Add color</span>
            </button>
          </div>

          {/* Quick Palette Formats Chips matching Screenshot 1 */}
          <div
            className="palette-formats-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              background: 'var(--bg-card-subtle)',
              padding: '12px 18px',
              borderRadius: 14,
              border: '1px solid var(--border-color)'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Palette formats:
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {['CSS', 'JSON', 'ASE'].map(fmt => (
                <button
                  key={fmt}
                  onClick={() => handleExport(fmt.toLowerCase())}
                  aria-label={`Export palette as ${fmt.toUpperCase()}`}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition-normal)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-blue)';
                    e.currentTarget.style.color = 'var(--color-accent-blue)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Extraction Controls Drawer */}
      <ExtractionSettings
        isExpanded={isSettingsOpen}
        onToggle={() => setIsSettingsOpen(prev => !prev)}
      />

      {/* Select Image Modal */}
      <SelectImageModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
      />
    </div>
  );
}
