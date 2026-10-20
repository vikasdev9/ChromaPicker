import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Check, Sparkles } from 'lucide-react';
import { generateCssGradient } from '../../utils/gradientUtils';
import { GRADIENT_PRESETS } from '../../data/gradientPresets';

export default function GradientComparison({
  activeGradient,
  onApplyGradient
}) {
  // Comparison slot gradient state (default to Chromapick Signature or a preset)
  const [compareGradient, setCompareGradient] = useState(() => {
    return GRADIENT_PRESETS[1]; // Sunset Ocean
  });

  const activeCss = generateCssGradient(activeGradient);
  const compareCss = generateCssGradient(compareGradient);

  const handleCopyCurrentToCompare = () => {
    setCompareGradient({ ...activeGradient });
  };

  const handleSwap = () => {
    const temp = { ...compareGradient };
    setCompareGradient({ ...activeGradient });
    onApplyGradient(temp);
  };

  return (
    <div
      className="chroma-card"
      style={{
        padding: '22px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }}
    >
      {/* Header & Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Side-by-Side Comparison</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Compare your active gradient against an alternative scheme in real time.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCopyCurrentToCompare}
            style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Duplicate active gradient into comparison slot"
          >
            <Copy size={13} />
            <span>Copy Active to Slot B</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleSwap}
            style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Swap active and comparison gradients"
          >
            <ArrowLeftRight size={13} />
            <span>Swap A & B</span>
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16
        }}
      >
        {/* Slot A: Active Gradient */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--color-accent-blue)',
                background: 'rgba(56, 189, 248, 0.12)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              SLOT A • ACTIVE GRADIENT
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {activeGradient.type.toUpperCase()} • {activeGradient.stops.length} STOPS
            </span>
          </div>

          <div
            style={{
              height: 180,
              borderRadius: 'var(--radius-lg)',
              background: activeCss,
              border: '2px solid var(--color-accent-blue)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: 12
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#FFFFFF',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              Current Editor State
            </span>
          </div>
        </div>

        {/* Slot B: Comparison Gradient */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                background: 'var(--bg-input)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              SLOT B • COMPARISON
            </span>

            {/* Quick Preset Selector for Slot B */}
            <select
              value={compareGradient.id || ''}
              onChange={e => {
                const found = GRADIENT_PRESETS.find(p => p.id === e.target.value);
                if (found) setCompareGradient({ ...found });
              }}
              className="input-text"
              style={{ padding: '2px 6px', fontSize: '0.72rem', appearance: 'auto' }}
            >
              <option value="" disabled>Load Preset...</option>
              {GRADIENT_PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div
            style={{
              height: 180,
              borderRadius: 'var(--radius-lg)',
              background: compareCss,
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              padding: 12
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#FFFFFF',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {compareGradient.name || 'Custom Comparison'}
            </span>

            <button
              type="button"
              onClick={() => onApplyGradient(compareGradient)}
              style={{
                background: '#FFFFFF',
                color: '#0F172A',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
              title="Apply this comparison gradient to the active editor"
            >
              Load into Editor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
