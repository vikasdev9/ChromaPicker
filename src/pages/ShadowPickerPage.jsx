import React, { useState, useMemo, useCallback } from 'react';
import {
  BoxSelect,
  Type,
  Copy,
  RotateCcw,
  Code,
  Sparkles,
  Layers,
  Sliders
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  normalizeShadowLayer,
  generateShadowValue,
  generateFullShadowCss,
  reorderLayers,
  duplicateLayer,
  sanitizeShadowState
} from '../utils/shadowUtils';
import { BOX_SHADOW_PRESETS, TEXT_SHADOW_PRESETS } from '../data/shadowPresets';
import ShadowPreview from '../components/shadow/ShadowPreview';
import ShadowLayerList from '../components/shadow/ShadowLayerList';
import ShadowLayerControls from '../components/shadow/ShadowLayerControls';
import ShadowExportModal from '../components/shadow/ShadowExportModal';

export default function ShadowPickerPage() {
  const { showToast } = useToast();

  // Mode: 'box-shadow' | 'text-shadow'
  const [mode, setMode] = useState('box-shadow');

  // Box-shadow layers state
  const [boxLayers, setBoxLayers] = useState(() => [
    normalizeShadowLayer({ x: 0, y: 10, blur: 25, spread: -5, color: '#000000', opacity: 20 }, 'box-shadow'),
    normalizeShadowLayer({ x: 0, y: 4, blur: 10, spread: -3, color: '#000000', opacity: 12 }, 'box-shadow')
  ]);
  const [activeBoxIndex, setActiveBoxIndex] = useState(0);

  // Text-shadow layers state
  const [textLayers, setTextLayers] = useState(() => [
    normalizeShadowLayer({ x: 0, y: 4, blur: 12, color: '#000000', opacity: 45 }, 'text-shadow'),
    normalizeShadowLayer({ x: 0, y: 1, blur: 3, color: '#000000', opacity: 30 }, 'text-shadow')
  ]);
  const [activeTextIndex, setActiveTextIndex] = useState(0);

  // Export Modal state
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Current active layers and active index based on mode
  const currentLayers = mode === 'box-shadow' ? boxLayers : textLayers;
  const setLayers = mode === 'box-shadow' ? setBoxLayers : setTextLayers;
  const activeIndex = mode === 'box-shadow' ? activeBoxIndex : activeTextIndex;
  const setActiveIndex = mode === 'box-shadow' ? setActiveBoxIndex : setActiveTextIndex;

  // Active layer object
  const activeLayer = currentLayers[activeIndex] || currentLayers[0];

  // Presets based on current mode
  const currentPresets = mode === 'box-shadow' ? BOX_SHADOW_PRESETS : TEXT_SHADOW_PRESETS;

  // Generated CSS declaration string
  const cssDeclaration = useMemo(() => {
    return generateFullShadowCss(currentLayers, mode, 'declaration');
  }, [currentLayers, mode]);

  // Mode change handler
  const handleModeChange = (newMode) => {
    setMode(newMode);
    showToast(`Switched to ${newMode === 'text-shadow' ? 'Text Shadow' : 'Box Shadow'} mode`, 'info');
  };

  // Add new layer
  const handleAddLayer = () => {
    if (currentLayers.length >= 8) {
      showToast('Maximum of 8 shadow layers supported', 'info');
      return;
    }

    const newLayer = normalizeShadowLayer(
      mode === 'box-shadow'
        ? { x: 0, y: 15, blur: 30, spread: 0, color: '#000000', opacity: 15 }
        : { x: 0, y: 6, blur: 15, color: '#000000', opacity: 40 },
      mode
    );

    setLayers(prev => [...prev, newLayer]);
    setActiveIndex(currentLayers.length);
    showToast('Added new shadow layer', 'success');
  };

  // Duplicate layer
  const handleDuplicateLayer = (idx) => {
    if (currentLayers.length >= 8) {
      showToast('Maximum of 8 shadow layers supported', 'info');
      return;
    }

    setLayers(prev => duplicateLayer(prev, idx));
    setActiveIndex(idx + 1);
    showToast('Duplicated shadow layer', 'success');
  };

  // Remove layer
  const handleRemoveLayer = (idx) => {
    if (currentLayers.length <= 1) {
      showToast('At least 1 shadow layer is required', 'error');
      return;
    }

    setLayers(prev => prev.filter((_, i) => i !== idx));
    setActiveIndex(Math.max(0, idx - 1));
    showToast('Removed shadow layer', 'info');
  };

  // Toggle layer visibility
  const handleToggleLayerEnabled = (idx) => {
    setLayers(prev =>
      prev.map((l, i) => (i === idx ? { ...l, enabled: l.enabled === false ? true : false } : l))
    );
  };

  // Move layer Up (in array: towards index 0, which renders behind later layers)
  const handleMoveLayerUp = (idx) => {
    if (idx <= 0) return;
    setLayers(prev => reorderLayers(prev, idx, idx - 1));
    setActiveIndex(idx - 1);
  };

  // Move layer Down
  const handleMoveLayerDown = (idx) => {
    if (idx >= currentLayers.length - 1) return;
    setLayers(prev => reorderLayers(prev, idx, idx + 1));
    setActiveIndex(idx + 1);
  };

  // Update layer properties
  const handleUpdateLayer = (idx, updates) => {
    setLayers(prev =>
      prev.map((l, i) => (i === idx ? { ...l, ...updates } : l))
    );
  };

  // Reset to default
  const handleReset = () => {
    const defaultPreset = currentPresets[0];
    const sanitized = sanitizeShadowState(defaultPreset, mode);
    setLayers(sanitized.layers);
    setActiveIndex(0);
    showToast(`Reset ${mode === 'text-shadow' ? 'text' : 'box'} shadow to default`, 'info');
  };

  // Apply a preset
  const handleApplyPreset = (preset) => {
    const sanitized = sanitizeShadowState(preset, mode);
    setLayers(sanitized.layers);
    setActiveIndex(0);
    showToast(`Applied preset: ${preset.name}`, 'info');
  };

  // Quick Copy CSS
  const handleCopyCss = () => {
    navigator.clipboard.writeText(cssDeclaration).then(() => {
      showToast('Copied CSS shadow declaration!', 'success');
    }).catch(() => {
      showToast('Failed to copy CSS', 'error');
    });
  };

  return (
    <div className="content-container" style={{ padding: '32px 20px 80px' }}>
      {/* Page Header */}
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
            <BoxSelect size={20} />
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, margin: 0 }}>
            CSS Shadow Studio
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: 780, margin: 0, lineHeight: 1.55 }}>
          Design layered box-shadows and text-shadows with real-time blur, spread, offset, and opacity controls. Test on light & dark surfaces and export production-ready CSS.
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
            padding: '12px 18px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Presets:
            </span>
            {currentPresets.slice(0, 4).map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                style={{
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-secondary)',
                  padding: '5px 11px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)'
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
              onClick={handleReset}
              style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              title="Reset shadow settings"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleCopyCss}
              style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Copy size={14} />
              <span>Copy CSS</span>
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsExportOpen(true)}
              style={{ padding: '7px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Code size={14} />
              <span>Export Studio</span>
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
        {/* Left Column: Live Preview & CSS Output & Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Live Preview Component */}
          <ShadowPreview
            mode={mode}
            layers={currentLayers}
            onChangeMode={handleModeChange}
          />

          {/* CSS Output Card */}
          <div className="chroma-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Generated CSS
              </span>
              <button
                type="button"
                onClick={handleCopyCss}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                <Copy size={13} />
                <span>Copy</span>
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
              {cssDeclaration}
            </pre>
          </div>

          {/* Presets Grid Card */}
          <div className="chroma-card" style={{ padding: 20 }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700 }}>
              Curated {mode === 'text-shadow' ? 'Text' : 'Box'} Shadow Presets
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              {currentPresets.map((p) => {
                const previewVal = generateShadowValue(p.layers, p.mode);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleApplyPreset(p)}
                    style={{
                      padding: 12,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card-subtle)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 80,
                      transition: 'var(--transition-normal)'
                    }}
                    title={p.description}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          color: 'var(--color-accent-blue)',
                          background: 'rgba(56, 189, 248, 0.12)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          display: 'inline-block',
                          marginBottom: 4
                        }}
                      >
                        {p.badge}
                      </span>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {p.name}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {p.layers.length} layer{p.layers.length > 1 ? 's' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Layer List & Layer Detail Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Layer List Card */}
          <div className="chroma-card" style={{ padding: 20 }}>
            <ShadowLayerList
              layers={currentLayers}
              activeLayerIndex={activeIndex}
              mode={mode}
              onSelectLayer={setActiveIndex}
              onAddLayer={handleAddLayer}
              onDuplicateLayer={handleDuplicateLayer}
              onRemoveLayer={handleRemoveLayer}
              onToggleLayerEnabled={handleToggleLayerEnabled}
              onMoveLayerUp={handleMoveLayerUp}
              onMoveLayerDown={handleMoveLayerDown}
            />
          </div>

          {/* Active Layer Fine-Tuning Controls */}
          {activeLayer && (
            <ShadowLayerControls
              layer={activeLayer}
              layerIndex={activeIndex}
              mode={mode}
              onUpdateLayer={handleUpdateLayer}
            />
          )}
        </div>
      </div>

      {/* Complete Export Studio Modal */}
      <ShadowExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        layers={currentLayers}
        mode={mode}
      />
    </div>
  );
}
