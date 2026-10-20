import React, { useState, useMemo, useCallback } from 'react';
import {
  Layers,
  Copy,
  RotateCcw,
  Code,
  Check
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  DEFAULT_GLASS_STATE,
  generateGlassCssDeclaration,
  sanitizeGlassState
} from '../utils/glassmorphismUtils';
import { GLASSMORPHISM_PRESETS } from '../data/glassmorphismPresets';
import GlassPreview from '../components/glass/GlassPreview';
import GlassAppearanceControls from '../components/glass/GlassAppearanceControls';
import GlassExportModal from '../components/glass/GlassExportModal';

export default function GlassmorphismPage() {
  const { showToast } = useToast();

  const [state, setState] = useState(() => ({ ...DEFAULT_GLASS_STATE }));
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCopiedQuick, setIsCopiedQuick] = useState(false);

  // Synchronized CSS Declaration
  const glassCssDeclaration = useMemo(() => {
    return generateGlassCssDeclaration(state);
  }, [state]);

  // Update state helper
  const handleUpdateState = useCallback((updates) => {
    setState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Apply a preset
  const handleApplyPreset = useCallback((preset) => {
    const clean = sanitizeGlassState(preset);
    setState(prev => ({
      ...prev,
      ...clean
    }));
    showToast(`Applied preset: ${preset.name}`, 'info');
  }, [showToast]);

  // Reset to default
  const handleReset = useCallback(() => {
    setState({ ...DEFAULT_GLASS_STATE });
    showToast('Reset glass settings to default', 'info');
  }, [showToast]);

  // Quick 1-click Copy CSS
  const handleQuickCopy = useCallback(() => {
    navigator.clipboard.writeText(glassCssDeclaration).then(() => {
      setIsCopiedQuick(true);
      showToast('Copied Glassmorphism CSS!', 'success');
      setTimeout(() => setIsCopiedQuick(false), 2000);
    }).catch(() => {
      showToast('Failed to copy CSS', 'error');
    });
  }, [glassCssDeclaration, showToast]);

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
            <Layers size={20} />
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, margin: 0 }}>
            Glassmorphism Studio
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: 780, margin: 0, lineHeight: 1.55 }}>
          Create and preview modern translucent glass cards, navigation bars, and modal surfaces. Customize tint transparency, backdrop diffusion, borders, and ambient shadows with browser-native CSS export.
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
            {GLASSMORPHISM_PRESETS.slice(0, 5).map(p => (
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
              title="Reset glass settings"
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
        {/* Left Column: Live Preview + Synchronized CSS Output + Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Live Preview Component */}
          <GlassPreview
            state={state}
            onChangeState={handleUpdateState}
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
              {glassCssDeclaration}
            </pre>
          </div>

          {/* Curated Presets Grid Card */}
          <div className="chroma-card" style={{ padding: 20 }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700 }}>
              Curated Glassmorphism Presets
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              {GLASSMORPHISM_PRESETS.map((p) => (
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
                    Blur {p.blur}px · {p.bgOpacity}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Appearance Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <GlassAppearanceControls
            state={state}
            onChangeState={handleUpdateState}
          />
        </div>
      </div>

      {/* Export Studio Modal */}
      <GlassExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        state={state}
      />
    </div>
  );
}
