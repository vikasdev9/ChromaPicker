import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Copy,
  Check,
  Maximize2,
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
  ArrowUpDown
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
    triggerExtractionWithCurrent
  } = usePalette();

  const containerRef = useRef(null);
  const imageAreaRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const exportDropdownRef = useRef(null);

  // Loupe zoom magnification (range 2x - 32x, default 12x matching Screenshot 1)
  const [magnification, setMagnification] = useState(12);

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

  // Calculate pixel coordinates from event
  const getCoordinatesFromEvent = (e) => {
    if (!imageRef.current || !canvasRef.current || !containerRef.current) return null;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = imageRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) {
      return null;
    }

    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const actualX = Math.floor(mouseX * scaleX);
    const actualY = Math.floor(mouseY * scaleY);

    const targetArea = imageAreaRef.current || containerRef.current;
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
    const paletteName = `Chromapick-${currentImage.filename.replace(/\.[^/.]+$/, '')}`;
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
            overflow: 'hidden'
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
                  maxWidth: 'clamp(90px, 25vw, 220px)'
                }}
                title={currentImage.filename}
              >
                {currentImage.filename}
              </span>
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
            </div>

            {/* Viewport & Image Action Controls matching Screenshot 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {/* Change Image button */}
              <button
                onClick={() => setIsSelectModalOpen(true)}
                className="btn-change-image"
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  minHeight: 36,
                  transition: 'var(--transition-normal)'
                }}
                title="Change or upload image"
              >
                <ImageIcon size={14} />
                <span className="btn-change-text">Change Image</span>
              </button>

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
              padding: 'clamp(8px, 2.5vw, 24px)',
              overflow: 'hidden',
              cursor: 'crosshair',
              position: 'relative',
              minHeight: 'clamp(260px, 45vh, 440px)',
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
          >
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
              isTouch={loupeState.isTouch}
              onCopy={(hex) => showToast(`Copied ${hex}`, 'success')}
            />

            {/* Main Interactive Source Image */}
            <img
              ref={imageRef}
              src={currentImage.src}
              alt={currentImage.title || 'Source image for palette extraction'}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 12,
                boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)',
                transform: `scale(${imageZoom})`,
                transition: 'transform 0.15s ease-out',
                pointerEvents: 'none'
              }}
            />

            {/* Instruction Overlay Pill at bottom left matching Screenshot 1 */}
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(6px)',
                color: '#FFFFFF',
                fontSize: '0.74rem',
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: 20,
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                pointerEvents: 'none'
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>🖱️</span>
              <span>Move to inspect · Click to pick · Drag on mobile</span>
            </div>

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
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            background: 'var(--bg-card)'
          }}
        >
          {/* Header with Title and Favorite button matching Screenshot 1 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0 }}>
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
              borderRadius: 14,
              backgroundColor: activeHex,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm), inset 0 0 0 1px rgba(0,0,0,0.08)',
              transition: 'background-color 0.2s ease',
              minHeight: 88
            }}
          >
            {/* Left: Large HEX and Color Name */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.45rem',
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
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: sampleTextColor,
                  opacity: 0.88,
                  marginTop: 2
                }}
              >
                {colorName}
              </span>
            </div>

            {/* Right: Aa Sample Text Preview showing Live Contrast */}
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: sampleTextColor,
                  lineHeight: 1.15
                }}
              >
                Aa
              </span>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: sampleTextColor,
                  opacity: 0.88,
                  marginTop: 2
                }}
              >
                Sample Text
              </span>
            </div>
          </div>

          {/* Color Values Table (HEX, RGB, HSL, CMYK) with Copy Buttons matching Screenshot 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  gap: 8,
                  minWidth: 0
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)', width: 44, flexShrink: 0 }}>
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
                    fontSize: 'clamp(0.74rem, 2.4vw, 0.85rem)'
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
                    padding: 6,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 36,
                    minHeight: 36,
                    flexShrink: 0
                  }}
                  title={`Copy ${item.label}`}
                  aria-label={`Copy ${item.label}`}
                >
                  {copiedKey === item.label ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
            ))}
          </div>

          {/* Contrast Ratio (WCAG) Section matching Screenshot 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Contrast Ratio (WCAG)
            </span>

            <div className="color-contrast-row">
              {/* White Text Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card-subtle)',
                  minWidth: 0
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    flexShrink: 0
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {contrastWhite}:1
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: contrastWhite >= 4.5 ? 'var(--badge-success-text)' : 'var(--badge-error-text)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    White text: {whiteRating}
                  </span>
                </div>
              </div>

              {/* Black Text Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card-subtle)',
                  minWidth: 0
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: '#000000',
                    flexShrink: 0
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {contrastBlack}:1
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: contrastBlack >= 4.5 ? 'var(--badge-success-text)' : 'var(--badge-error-text)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Black text: {blackRating}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Eyedropper Mode & Zoom Level Controls matching Screenshot 1 */}
          <div className="workspace-controls-row">
            {/* Eyedropper Mode Switcher */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Eyedropper Mode
                </span>
                <HelpCircle size={13} color="var(--text-muted)" title="Pick color commits on click; Live preview updates continuously as you hover" />
              </div>
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card-subtle)', padding: 3, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => setEyedropperMode('pick')}
                  style={{
                    flex: 1,
                    padding: '8px 8px',
                    borderRadius: 7,
                    border: 'none',
                    background: eyedropperMode === 'pick' ? 'var(--bg-card)' : 'transparent',
                    boxShadow: eyedropperMode === 'pick' ? 'var(--shadow-sm)' : 'none',
                    color: eyedropperMode === 'pick' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    minHeight: 38
                  }}
                >
                  <Pipette size={13} />
                  <span>Pick color</span>
                </button>
                <button
                  onClick={() => setEyedropperMode('live')}
                  style={{
                    flex: 1,
                    padding: '8px 8px',
                    borderRadius: 7,
                    border: 'none',
                    background: eyedropperMode === 'live' ? 'var(--bg-card)' : 'transparent',
                    boxShadow: eyedropperMode === 'live' ? 'var(--shadow-sm)' : 'none',
                    color: eyedropperMode === 'live' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    minHeight: 38
                  }}
                >
                  <Eye size={13} />
                  <span>Live preview</span>
                </button>
              </div>
            </div>

            {/* Magnifier Zoom Level Slider */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Zoom Level
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-accent-blue)', fontFamily: 'var(--font-mono)' }}>
                  {magnification}×
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>2×</span>
                <input
                  type="range"
                  min="2"
                  max="32"
                  step="1"
                  value={magnification}
                  onChange={(e) => setMagnification(Number(e.target.value))}
                  style={{ flex: 1, cursor: 'pointer', accentColor: 'var(--color-accent-blue)', minHeight: 28 }}
                  aria-label="Magnifier Zoom Level"
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>32×</span>
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
              padding: '12px 18px',
              borderRadius: 12,
              background: 'var(--color-accent-blue)',
              color: 'var(--text-inverse)',
              border: 'none',
              fontSize: '0.94rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              minHeight: 44,
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
          <div className="workspace-action-buttons">
            {/* Upload Image button */}
            <button
              onClick={() => setIsSelectModalOpen(true)}
              style={{
                padding: '11px 14px',
                borderRadius: 10,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.86rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                minHeight: 44,
                transition: 'var(--transition-normal)'
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
                padding: '11px 14px',
                borderRadius: 10,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.86rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                minHeight: 44,
                transition: 'var(--transition-normal)'
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
              fontSize: '0.74rem',
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
          background: 'var(--bg-card)'
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
