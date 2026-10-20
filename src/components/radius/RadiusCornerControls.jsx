import React from 'react';
import { Link2, Unlink } from 'lucide-react';

export default function RadiusCornerControls({
  state,
  activeCorner,
  onSelectCorner,
  onUpdateCorner,
  onToggleLinked,
  onChangeUnit,
  onToggleElliptical
}) {
  const isPercent = state.unit === '%';
  const maxLimit = isPercent ? 100 : 200;

  const CORNERS = [
    { key: 'tl', vKey: 'vtl', label: 'Top-Left', short: 'TL' },
    { key: 'tr', vKey: 'vtr', label: 'Top-Right', short: 'TR' },
    { key: 'br', vKey: 'vbr', label: 'Bottom-Right', short: 'BR' },
    { key: 'bl', vKey: 'vbl', label: 'Bottom-Left', short: 'BL' }
  ];

  return (
    <div
      style={{
        background: 'var(--bg-card-subtle)',
        padding: '20px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}
    >
      {/* Top Header: Title, Linked Toggle & Unit Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>
            Corner Controls
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            {state.isLinked ? 'Corners are linked (all corners sync)' : 'Independent corners mode'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Linked / Unlinked Button */}
          <button
            type="button"
            onClick={onToggleLinked}
            aria-label={state.isLinked ? 'Corners linked' : 'Corners unlinked'}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: state.isLinked ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
              background: state.isLinked ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-input)',
              color: state.isLinked ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'var(--transition-normal)'
            }}
            title={state.isLinked ? 'Click to edit corners independently' : 'Click to link all corners together'}
          >
            {state.isLinked ? <Link2 size={15} /> : <Unlink size={15} />}
            <span>{state.isLinked ? 'Linked' : 'Unlinked'}</span>
          </button>

          {/* Unit Toggle: px vs % */}
          <div style={{ display: 'flex', background: 'var(--bg-input)', padding: 2, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {['px', '%'].map(u => (
              <button
                key={u}
                type="button"
                onClick={() => onChangeUnit(u)}
                style={{
                  background: state.unit === u ? 'var(--color-accent-blue)' : 'transparent',
                  color: state.unit === u ? 'var(--text-inverse)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Corners Grid Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {CORNERS.map(c => {
          const val = state[c.key] ?? 0;
          const isFocused = activeCorner === c.key;

          return (
            <div
              key={c.key}
              style={{
                background: isFocused ? 'rgba(56, 189, 248, 0.05)' : 'var(--bg-card)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: isFocused ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                transition: 'var(--transition-normal)'
              }}
              onClick={() => onSelectCorner && onSelectCorner(c.key)}
            >
              {/* Corner Label & Numeric Input */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label
                  htmlFor={`corner-${c.key}`}
                  style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  {c.label} ({c.short})
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    id={`corner-${c.key}`}
                    type="number"
                    min="0"
                    max={isPercent ? 100 : 2000}
                    value={val}
                    onChange={e => {
                      const raw = e.target.value;
                      const parsed = raw === '' ? 0 : parseInt(raw, 10);
                      onUpdateCorner(c.key, parsed);
                    }}
                    className="input-text"
                    style={{
                      width: 58,
                      padding: '3px 6px',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'right',
                      fontWeight: 700
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {state.unit}
                  </span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max={maxLimit}
                value={val}
                onChange={e => onUpdateCorner(c.key, parseInt(e.target.value, 10))}
                aria-label={`${c.label} slider`}
                style={{
                  width: '100%',
                  accentColor: 'var(--color-accent-blue)',
                  cursor: 'pointer'
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Advanced 8-Point Elliptical Radii Mode Toggle */}
      <div
        style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>
              8-Point Elliptical Radii
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Enable separate horizontal & vertical curvature (CSS / syntax)
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleElliptical}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: state.isElliptical ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
              background: state.isElliptical ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-input)',
              color: state.isElliptical ? 'var(--color-accent-blue)' : 'var(--text-secondary)'
            }}
          >
            {state.isElliptical ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Vertical sliders if elliptical is enabled */}
        {state.isElliptical && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 4 }}>
            {CORNERS.map(c => {
              const val = state[c.vKey] ?? 0;
              return (
                <div key={c.vKey} style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label htmlFor={`corner-${c.vKey}`} style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Vertical {c.short}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <input
                        id={`corner-${c.vKey}`}
                        type="number"
                        min="0"
                        max={isPercent ? 100 : 2000}
                        value={val}
                        onChange={e => onUpdateCorner(c.vKey, parseInt(e.target.value || '0', 10))}
                        className="input-text"
                        style={{ width: 50, padding: '2px 4px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', textAlign: 'right' }}
                      />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{state.unit}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={maxLimit}
                    value={val}
                    onChange={e => onUpdateCorner(c.vKey, parseInt(e.target.value, 10))}
                    aria-label={`Vertical ${c.label} slider`}
                    style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
