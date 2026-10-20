import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Clipboard,
  Sparkles,
  Columns,
  Split,
  Eye,
  RotateCcw,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { generateFilterString } from '../../utils/imageFilterUtils';
import { SAMPLE_IMAGES } from '../../data/sampleImages';

export default function FilterWorkspace({
  imageSrc,
  imageName,
  imageDimensions,
  isLoading,
  error,
  filterState,
  onImageLoaded,
  onResetFilters,
  imageRef
}) {
  const [compareMode, setCompareMode] = useState('split'); // 'split' | 'filtered' | 'original' | 'side-by-side'
  const [splitPos, setSplitPos] = useState(50); // 0% to 100%
  const [isDragging, setIsDragging] = useState(false);
  const [bgPattern, setBgPattern] = useState('dark'); // 'dark' | 'checkerboard' | 'light'

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const filterString = generateFilterString(filterState);

  // Drag handler for Split Slider comparison
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleTouchStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSplitPos(pct);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  // Drag and drop onto workspace
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onImageLoaded(null, null, null, 'Please select a valid image file (JPEG, PNG, WebP, SVG).');
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      onImageLoaded(url, file.name, { width: img.naturalWidth, height: img.naturalHeight }, null);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      onImageLoaded(null, null, null, 'Failed to decode image. Please check the file.');
    };
    img.src = url;
  };

  // Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          handleFile(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Background style
  const getCanvasBg = () => {
    switch (bgPattern) {
      case 'checkerboard':
        return {
          backgroundColor: '#1E293B',
          backgroundImage: 'linear-gradient(45deg, #0F172A 25%, transparent 25%), linear-gradient(-45deg, #0F172A 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #0F172A 75%), linear-gradient(-45deg, transparent 75%, #0F172A 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
        };
      case 'light':
        return { background: '#F8FAFC' };
      case 'dark':
      default:
        return { background: '#0B0F17' };
    }
  };

  return (
    <div
      className="chroma-card"
      style={{
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column'
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Top Workspace Toolbar */}
      <div
        style={{
          background: 'var(--bg-card-subtle)',
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        {/* Left Side: Comparison View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            View:
          </span>
          <div style={{ display: 'flex', background: 'var(--bg-input)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'filtered', label: 'Filtered', icon: Eye },
              { id: 'split', label: 'Split Slider', icon: Split },
              { id: 'side-by-side', label: 'Side-by-Side', icon: Columns },
              { id: 'original', label: 'Original', icon: RotateCcw }
            ].map(m => {
              const IconComp = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setCompareMode(m.id)}
                  style={{
                    background: compareMode === m.id ? 'var(--color-accent-blue)' : 'transparent',
                    color: compareMode === m.id ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    transition: 'var(--transition-normal)'
                  }}
                >
                  <IconComp size={13} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Canvas Background & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Canvas Background */}
          <div style={{ display: 'flex', background: 'var(--bg-input)', padding: 2, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'dark', label: 'Dark' },
              { id: 'checkerboard', label: 'Grid' },
              { id: 'light', label: 'Light' }
            ].map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBgPattern(b.id)}
                style={{
                  background: bgPattern === b.id ? 'var(--bg-card)' : 'transparent',
                  color: bgPattern === b.id ? 'var(--color-accent-blue)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            style={{ display: 'none' }}
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          {/* Change Image Button */}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{ padding: '5px 10px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            <Upload size={13} />
            <span>Upload Image</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            borderBottom: '1px solid var(--badge-error-border)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--badge-error-text)',
            fontSize: '0.82rem'
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Canvas Area */}
      <div
        id="image-filter-canvas"
        style={{
          minHeight: 440,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: 20,
          ...getCanvasBg()
        }}
      >
        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 12px' }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Decoding and loading image...
            </div>
          </div>
        )}

        {/* Empty State (No Image Loaded) */}
        {!isLoading && !imageSrc && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              maxWidth: 480,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 'var(--radius-xl)',
                background: 'rgba(56, 189, 248, 0.12)',
                color: 'var(--color-accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ImageIcon size={32} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 800 }}>
                Upload or Drop an Image
              </h3>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Drop an image here, paste from your clipboard (Ctrl+V), or try a bundled high-res sample image.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{ padding: '8px 18px', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Upload size={14} />
                <span>Choose Image</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  const sample = SAMPLE_IMAGES[0];
                  const img = new Image();
                  img.onload = () => {
                    onImageLoaded(sample.dataUrl, sample.filename, { width: sample.width, height: sample.height }, null);
                  };
                  img.src = sample.dataUrl;
                }}
                style={{ padding: '8px 16px', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Sparkles size={14} color="var(--color-accent-blue)" />
                <span>Try Sample Image</span>
              </button>
            </div>
          </div>
        )}

        {/* Image Loaded View Modes */}
        {!isLoading && imageSrc && (
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              maxWidth: '100%',
              maxHeight: 520,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none'
            }}
          >
            {/* Mode 1: Filtered Only */}
            {compareMode === 'filtered' && (
              <img
                ref={imageRef}
                src={imageSrc}
                alt={imageName || 'Filtered preview'}
                style={{
                  maxWidth: '100%',
                  maxHeight: 500,
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  filter: filterString,
                  transition: 'filter 0.05s ease'
                }}
              />
            )}

            {/* Mode 2: Original Only */}
            {compareMode === 'original' && (
              <img
                src={imageSrc}
                alt={imageName || 'Original preview'}
                style={{
                  maxWidth: '100%',
                  maxHeight: 500,
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)'
                }}
              />
            )}

            {/* Mode 3: Split Slider Draggable Comparison */}
            {compareMode === 'split' && (
              <div
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  maxWidth: '100%',
                  maxHeight: 500,
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                {/* Background Layer: Filtered Image */}
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Filtered layer"
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: 500,
                    objectFit: 'contain',
                    filter: filterString
                  }}
                />

                {/* Foreground Layer: Original Image (Clipped by splitPos) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: `${splitPos}%`,
                    overflow: 'hidden',
                    borderRight: '2px solid #FFFFFF'
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Original layer"
                    style={{
                      display: 'block',
                      maxWidth: 'none',
                      height: '100%',
                      width: containerRef.current ? containerRef.current.clientWidth : 'auto',
                      objectFit: 'contain'
                    }}
                  />
                  {/* Original Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      background: 'rgba(0, 0, 0, 0.75)',
                      color: '#FFFFFF',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      textTransform: 'uppercase'
                    }}
                  >
                    Original
                  </span>
                </div>

                {/* Filtered Badge */}
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(56, 189, 248, 0.85)',
                    color: '#0F172A',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    textTransform: 'uppercase'
                  }}
                >
                  Filtered
                </span>

                {/* Draggable Divider Handle */}
                <div
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${splitPos}%`,
                    transform: 'translateX(-50%)',
                    width: 28,
                    cursor: 'ew-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      color: '#0F172A',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}
                  >
                    ↔
                  </div>
                </div>
              </div>
            )}

            {/* Mode 4: Side-by-Side Comparison */}
            {compareMode === 'side-by-side' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%' }}>
                {/* Left: Original */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>ORIGINAL</span>
                  <img
                    src={imageSrc}
                    alt="Original"
                    style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                  />
                </div>

                {/* Right: Filtered */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-accent-blue)' }}>FILTERED</span>
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Filtered"
                    style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', filter: filterString }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Info Bar */}
      {imageSrc && imageDimensions && (
        <div
          style={{
            background: 'var(--bg-card-subtle)',
            padding: '10px 18px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            fontSize: '0.76rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            <strong style={{ color: 'var(--text-secondary)' }}>{imageName || 'image'}</strong> · {imageDimensions.width} × {imageDimensions.height}px
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Sample Images:</span>
            {SAMPLE_IMAGES.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  const img = new Image();
                  img.onload = () => {
                    onImageLoaded(s.dataUrl, s.filename, { width: s.width, height: s.height }, null);
                  };
                  img.src = s.dataUrl;
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                {s.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
