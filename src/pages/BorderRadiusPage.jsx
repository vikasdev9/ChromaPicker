import React, { useState, useMemo, useCallback } from 'react';
import {
  Square,
  Copy,
  RotateCcw,
  Code,
  Check
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  DEFAULT_RADIUS_STATE,
  updateCornerState,
  generateBorderRadiusValue,
  generateFullBorderRadiusCss,
  calculatePresetValues
} from '../utils/borderRadiusUtils';
import { BORDER_RADIUS_PRESETS } from '../data/borderRadiusPresets';
import RadiusVisualBox from '../components/radius/RadiusVisualBox';
import RadiusCornerControls from '../components/radius/RadiusCornerControls';
import RadiusExportModal from '../components/radius/RadiusExportModal';

export default function BorderRadiusPage() {
  const { showToast } = useToast();

  // Primary border-radius state
  const [state, setState] = useState(() => ({ ...DEFAULT_RADIUS_STATE }));
  const [activeCorner, setActiveCorner] = useState('tl'); // 'tl' | 'tr' | 'br' | 'bl'
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCopiedQuick, setIsCopiedQuick] = useState(false);

  // Synchronized CSS value
  const radiusCssDeclaration = useMemo(() => {
    return generateFullBorderRadiusCss(state, 'declaration');
  }, [state]);

  // Update single corner
  const handleUpdateCorner = useCallback((key, value) => {
    setState(prev => updateCornerState(prev, key, value));
  }, []);

  // Toggle Linked mode (switching between linked & unlinked preserves current values)
  const handleToggleLinked = useCallback(() => {
    setState(prev => {
      const nextLinked = !prev.isLinked;
      return {
        ...prev,
        isLinked: nextLinked
      };
    });
    showToast(!state.isLinked ? 'Linked corners (all corners sync)' : 'Unlinked corners (edit independently)', 'info');
  }, [state.isLinked, showToast]);

  // Change Unit (px vs %)
  const handleChangeUnit = useCallback((newUnit) => {
    if (state.unit === newUnit) return;
    showToast(`Switched unit to ${newUnit}`, 'info');

    setState(prev => {
      // Sensible value transformation when switching between px and %
      const convert = (val) => {
        if (newUnit === '%') {
          return Math.min(100, Math.max(0, Math.round((val / prev.previewWidth) * 100)));
        } else {
          return Math.round((val / 100) * prev.previewWidth);
        }
      };

      return {
        ...prev,
        unit: newUnit,
        tl: convert(prev.tl),
        tr: convert(prev.tr),
        br: convert(prev.br),
        bl: convert(prev.bl),
        vtl: convert(prev.vtl),
        vtr: convert(prev.vtr),
        vbr: convert(prev.vbr),
        vbl: convert(prev.vbl)
      };
    });
  }, [state.unit, showToast]);

  // Toggle 8-Point Elliptical Radii
  const handleToggleElliptical = useCallback(() => {
    const nextElliptical = !state.isElliptical;
    showToast(nextElliptical ? 'Enabled 8-point elliptical radii' : 'Disabled 8-point elliptical radii', 'info');
    setState(prev => ({
      ...prev,
      isElliptical: nextElliptical
    }));
  }, [state.isElliptical, showToast]);

  // Change Preview Dimensions
  const handleChangeDimensions = useCallback((dimKey, value) => {
    setState(prev => {
      const safeVal = Math.max(20, Math.min(1000, isNaN(value) ? 100 : value));
      return {
        ...prev,
        [dimKey]: safeVal
      };
    });
  }, []);

  // Apply a preset
  const handleApplyPreset = useCallback((preset) => {
    const calculated = calculatePresetValues(preset, state.previewWidth, state.previewHeight, state.unit);
    setState(prev => ({
      ...prev,
      ...calculated
    }));
    showToast(`Applied preset: ${preset.name}`, 'info');
  }, [state.previewWidth, state.previewHeight, state.unit, showToast]);

  // Reset to default
  const handleReset = useCallback(() => {
    setState({ ...DEFAULT_RADIUS_STATE });
    setActiveCorner('tl');
    showToast('Reset border radius to default', 'info');
  }, [showToast]);

  // Quick 1-click Copy CSS
  const handleQuickCopy = useCallback(() => {
    navigator.clipboard.writeText(radiusCssDeclaration).then(() => {
      setIsCopiedQuick(true);
      showToast('Copied border-radius CSS!', 'success');
      setTimeout(() => setIsCopiedQuick(false), 2000);
    }).catch(() => {
      showToast('Failed to copy CSS', 'error');
    });
  }, [radiusCssDeclaration, showToast]);

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
            <Square size={20} />
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, margin: 0 }}>
            Border Radius Studio
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: 780, margin: 0, lineHeight: 1.55 }}>
          Design 4-corner and 8-point elliptical border radii with real-time curvature feedback. Fine-tune individual corners, link values, test pill & circle geometries, and export production-ready CSS.
        </p>

        {/* Global Toolbar: Quick Presets & Action Buttons */}
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
          {/* Quick Preset Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Presets:
            </span>
            {BORDER_RADIUS_PRESETS.slice(0, 5).map(p => (
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
              title="Reset to default radius"
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
        {/* Left Column: Visual Box + Synchronized CSS Output + Preset Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Visual Canvas Box */}
          <RadiusVisualBox
            state={state}
            onChangeDimensions={handleChangeDimensions}
            activeCorner={activeCorner}
            onSelectCorner={setActiveCorner}
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
              {radiusCssDeclaration}
            </pre>
          </div>

          {/* Presets Grid Card */}
          <div className="chroma-card" style={{ padding: 20 }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700 }}>
              Curated Radius Presets
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
              {BORDER_RADIUS_PRESETS.map((p) => {
                const previewVal = generateBorderRadiusValue(p);
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
                      minHeight: 84,
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

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {previewVal}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Corner Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <RadiusCornerControls
            state={state}
            activeCorner={activeCorner}
            onSelectCorner={setActiveCorner}
            onUpdateCorner={handleUpdateCorner}
            onToggleLinked={handleToggleLinked}
            onChangeUnit={handleChangeUnit}
            onToggleElliptical={handleToggleElliptical}
          />
        </div>
      </div>

      {/* Export Studio Modal */}
      <RadiusExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        state={state}
      />
    </div>
  );
}
