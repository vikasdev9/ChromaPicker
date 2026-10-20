import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Sliders,
  Copy,
  RotateCcw,
  Code,
  Check,
  Download,
  Sparkles,
  Upload,
  Layers
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  DEFAULT_FILTER_STATE,
  generateFilterString,
  generateFullFilterCss,
  sanitizeFilterState
} from '../utils/imageFilterUtils';
import { IMAGE_FILTER_PRESETS } from '../data/imageFilterPresets';
import FilterWorkspace from '../components/filter/FilterWorkspace';
import FilterControls from '../components/filter/FilterControls';
import FilterExportModal from '../components/filter/FilterExportModal';

export default function ImageFilterPage() {
  const { showToast } = useToast();

  const [imageSrc, setImageSrc] = useState(null);
  const [imageName, setImageName] = useState(null);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filterState, setFilterState] = useState(() => ({ ...DEFAULT_FILTER_STATE }));
  const [activePresetId, setActivePresetId] = useState(null);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCopiedQuick, setIsCopiedQuick] = useState(false);

  const prevBlobUrlRef = useRef(null);
  const imageElementRef = useRef(null);

  // Clean up Object URLs when replaced or on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current && prevBlobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(prevBlobUrlRef.current);
      }
    };
  }, []);

  const handleImageLoaded = useCallback((src, name, dimensions, err) => {
    if (prevBlobUrlRef.current && prevBlobUrlRef.current.startsWith('blob:') && prevBlobUrlRef.current !== src) {
      URL.revokeObjectURL(prevBlobUrlRef.current);
    }

    if (src && src.startsWith('blob:')) {
      prevBlobUrlRef.current = src;
    } else {
      prevBlobUrlRef.current = null;
    }

    setImageSrc(src);
    setImageName(name);
    setImageDimensions(dimensions);
    setError(err);
    setIsLoading(false);
  }, []);

  // Update a single filter value
  const handleChangeFilter = useCallback((key, value) => {
    setFilterState(prev => ({
      ...prev,
      [key]: value
    }));
    setActivePresetId(null);
  }, []);

  // Reset a single filter to default
  const handleResetFilter = useCallback((key) => {
    setFilterState(prev => ({
      ...prev,
      [key]: DEFAULT_FILTER_STATE[key]
    }));
    setActivePresetId(null);
  }, []);

  // Reset all filters to default
  const handleResetAll = useCallback(() => {
    setFilterState({ ...DEFAULT_FILTER_STATE });
    setActivePresetId(null);
    showToast('Reset all filters to default', 'info');
  }, [showToast]);

  // Apply a preset
  const handleApplyPreset = useCallback((preset) => {
    const clean = sanitizeFilterState(preset.values);
    setFilterState(clean);
    setActivePresetId(preset.id);
    showToast(`Applied preset: ${preset.name}`, 'info');
  }, [showToast]);

  // Synchronized CSS declaration
  const filterCssDeclaration = useMemo(() => {
    return generateFullFilterCss(filterState, 'declaration');
  }, [filterState]);

  // Quick 1-click Copy CSS
  const handleQuickCopy = useCallback(() => {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      showToast('Clipboard access not supported in this browser', 'error');
      return;
    }

    navigator.clipboard.writeText(filterCssDeclaration).then(() => {
      setIsCopiedQuick(true);
      showToast('Copied CSS filter declaration!', 'success');
      setTimeout(() => setIsCopiedQuick(false), 2000);
    }).catch(() => {
      showToast('Failed to copy CSS', 'error');
    });
  }, [filterCssDeclaration, showToast]);

  return (
    <div className="content-container" style={{ padding: '32px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(56, 189, 248, 0.14)',
              color: 'var(--color-accent-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sliders size={20} />
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, margin: 0 }}>
            Image Filter Picker
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: 840, margin: 0, lineHeight: 1.55 }}>
          Upload or drop an image, fine-tune real-time CSS filters with precision sliders, compare original and filtered states with split views, and export clean CSS or filtered PNGs locally in your browser.
        </p>

        {/* Global Toolbar */}
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 16px',
            background: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)'
          }}
        >
          {/* Quick Preset Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: 2 }}>
              Presets:
            </span>
            {IMAGE_FILTER_PRESETS.slice(0, 6).map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                style={{
                  background: activePresetId === p.id ? 'var(--color-accent-blue)' : 'var(--bg-main)',
                  color: activePresetId === p.id ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={p.description}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetAll}
              style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              title="Reset all filters to default"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleQuickCopy}
              style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              {isCopiedQuick ? <Check size={14} /> : <Copy size={14} />}
              <span>{isCopiedQuick ? 'Copied!' : 'Copy CSS'}</span>
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsExportOpen(true)}
              style={{ padding: '7px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Code size={14} />
              <span>Export & Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Two-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 28,
          alignItems: 'start'
        }}
      >
        {/* Left Column: Workspace & Live Preview + Synchronized CSS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <FilterWorkspace
            imageSrc={imageSrc}
            imageName={imageName}
            imageDimensions={imageDimensions}
            isLoading={isLoading}
            error={error}
            filterState={filterState}
            onImageLoaded={handleImageLoaded}
            onResetFilters={handleResetAll}
            imageRef={imageElementRef}
          />

          {/* Synchronized CSS Output Card */}
          <div className="chroma-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Generated CSS
              </span>
              <button
                type="button"
                onClick={handleQuickCopy}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                {isCopiedQuick ? <Check size={13} /> : <Copy size={13} />}
                <span>{isCopiedQuick ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre
              style={{
                background: 'var(--bg-input)',
                padding: 14,
                borderRadius: 10,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                overflowX: 'auto',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}
            >
              {filterCssDeclaration}
            </pre>
          </div>
        </div>

        {/* Right Column: Filter Controls */}
        <div>
          <FilterControls
            filterState={filterState}
            onChangeFilter={handleChangeFilter}
            onResetFilter={handleResetFilter}
            onResetAll={handleResetAll}
            onApplyPreset={handleApplyPreset}
            activePresetId={activePresetId}
          />
        </div>
      </div>

      {/* Export Modal */}
      <FilterExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        filterState={filterState}
        imageSrc={imageSrc}
        imageName={imageName}
        imageDimensions={imageDimensions}
      />
    </div>
  );
}
