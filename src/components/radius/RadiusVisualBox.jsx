import React, { useState } from 'react';
import { generateBorderRadiusValue } from '../../utils/borderRadiusUtils';

export default function RadiusVisualBox({
  state,
  onChangeDimensions,
  activeCorner,
  onSelectCorner
}) {
  const [surfaceTheme, setSurfaceTheme] = useState('card'); // 'card' | 'dark' | 'light' | 'slate' | 'paper'
  const [fillMode, setFillMode] = useState('gradient'); // 'gradient' | 'solid' | 'glass'

  const borderRadiusCss = generateBorderRadiusValue(state);

  // Surface background styling
  const getSurfaceStyles = () => {
    switch (surfaceTheme) {
      case 'dark':
        return { background: '#0B0F17', color: '#F8FAFC', borderColor: '#1E293B' };
      case 'light':
        return { background: '#F8FAFC', color: '#0F172A', borderColor: '#E2E8F0' };
      case 'slate':
        return { background: '#1E293B', color: '#F8FAFC', borderColor: '#334155' };
      case 'paper':
        return { background: '#FAF8F5', color: '#262626', borderColor: '#E7E5E4' };
      case 'card':
      default:
        return { background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' };
    }
  };

  // Box fill styling
  const getFillStyles = () => {
    switch (fillMode) {
      case 'solid':
        return {
          background: 'var(--color-accent-blue)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        };
      case 'glass':
        return {
          background: 'rgba(56, 189, 248, 0.15)',
          backdropFilter: 'blur(12px)',
          color: 'var(--text-primary)',
          border: '2px dashed var(--color-accent-blue)'
        };
      case 'gradient':
      default:
        return {
          background: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 50%, #EC4899 100%)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 12px 32px -8px rgba(99, 102, 241, 0.35)'
        };
    }
  };

  const surface = getSurfaceStyles();
  const fill = getFillStyles();

  // Quick dimension presets
  const DIMENSION_PRESETS = [
    { label: 'Square', w: 220, h: 220 },
    { label: 'Card', w: 280, h: 180 },
    { label: 'Banner', w: 340, h: 120 },
    { label: 'Button', w: 200, h: 56 }
  ];

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
    >
      {/* Top Bar: Themes & Fill Options */}
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
        {/* Fill Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Fill:
          </span>
          <div style={{ display: 'flex', background: 'var(--bg-input)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'gradient', label: 'Gradient' },
              { id: 'solid', label: 'Solid' },
              { id: 'glass', label: 'Glass' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFillMode(f.id)}
                style={{
                  background: fillMode === f.id ? 'var(--color-accent-blue)' : 'transparent',
                  color: fillMode === f.id ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Surface Theme Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Canvas:
          </span>
          <div style={{ display: 'flex', background: 'var(--bg-input)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'card', label: 'Default' },
              { id: 'dark', label: 'Dark' },
              { id: 'light', label: 'Light' },
              { id: 'slate', label: 'Slate' },
              { id: 'paper', label: 'Paper' }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSurfaceTheme(t.id)}
                style={{
                  background: surfaceTheme === t.id ? 'var(--bg-card)' : 'transparent',
                  color: surfaceTheme === t.id ? 'var(--color-accent-blue)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div
        style={{
          minHeight: 340,
          background: surface.background,
          borderColor: surface.borderColor,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          position: 'relative',
          transition: 'background 0.2s ease'
        }}
      >
        {/* Subtle background grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(120, 120, 120, 0.12) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            pointerEvents: 'none'
          }}
        />

        {/* The Live Radius Shape Container */}
        <div
          style={{
            position: 'relative',
            width: state.previewWidth,
            height: state.previewHeight,
            maxWidth: '100%',
            transition: 'width 0.2s ease, height 0.2s ease'
          }}
        >
          {/* Animated/Reactive Preview Element */}
          <div
            id="radius-preview-card"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: borderRadiusCss,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-radius 0.15s ease',
              position: 'relative',
              userSelect: 'none',
              ...fill
            }}
          >
            <div style={{ textAlign: 'center', padding: '10px 16px', textShadow: fillMode === 'gradient' ? '0 1px 3px rgba(0,0,0,0.3)' : undefined }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                Chromapick
              </div>
              <div style={{ fontSize: '0.74rem', opacity: 0.9, marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                {state.previewWidth} × {state.previewHeight}px
              </div>
            </div>
          </div>

          {/* Corner Interactive Badges (Pins) */}
          {[
            { key: 'tl', label: 'TL', val: state.tl, top: -12, left: -12 },
            { key: 'tr', label: 'TR', val: state.tr, top: -12, right: -12 },
            { key: 'br', label: 'BR', val: state.br, bottom: -12, right: -12 },
            { key: 'bl', label: 'BL', val: state.bl, bottom: -12, left: -12 }
          ].map(pin => {
            const isSelected = activeCorner === pin.key;
            return (
              <button
                key={pin.key}
                type="button"
                onClick={() => onSelectCorner && onSelectCorner(pin.key)}
                style={{
                  position: 'absolute',
                  top: pin.top,
                  left: pin.left,
                  right: pin.right,
                  bottom: pin.bottom,
                  background: isSelected ? 'var(--color-accent-blue)' : 'var(--bg-card)',
                  color: isSelected ? 'var(--text-inverse)' : 'var(--text-primary)',
                  border: isSelected ? '2px solid #FFFFFF' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-full)',
                  padding: '3px 7px',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'var(--transition-normal)'
                }}
                title={`Click to focus ${pin.label} (${pin.val}${state.unit})`}
              >
                <span>{pin.label}:</span>
                <span>{pin.val}{state.unit}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar: Dimension Controls (Width & Height) */}
      <div
        style={{
          background: 'var(--bg-card-subtle)',
          padding: '14px 18px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}
      >
        {/* Dimension Sliders & Inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Width */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label htmlFor="preview-width" style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              W:
            </label>
            <input
              id="preview-width"
              type="number"
              min="80"
              max="500"
              step="10"
              value={state.previewWidth}
              onChange={e => onChangeDimensions('previewWidth', parseInt(e.target.value, 10))}
              className="input-text"
              style={{ width: 62, padding: '3px 6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', textAlign: 'center' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>px</span>
          </div>

          {/* Height */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label htmlFor="preview-height" style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              H:
            </label>
            <input
              id="preview-height"
              type="number"
              min="40"
              max="400"
              step="10"
              value={state.previewHeight}
              onChange={e => onChangeDimensions('previewHeight', parseInt(e.target.value, 10))}
              className="input-text"
              style={{ width: 62, padding: '3px 6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', textAlign: 'center' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>px</span>
          </div>
        </div>

        {/* Quick Aspect Ratio Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Preset Size:
          </span>
          {DIMENSION_PRESETS.map(d => (
            <button
              key={d.label}
              type="button"
              onClick={() => {
                onChangeDimensions('previewWidth', d.w);
                onChangeDimensions('previewHeight', d.h);
              }}
              style={{
                border: '1px solid var(--border-color)',
                background: state.previewWidth === d.w && state.previewHeight === d.h ? 'var(--bg-input)' : 'transparent',
                color: state.previewWidth === d.w && state.previewHeight === d.h ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
