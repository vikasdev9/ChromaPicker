import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import {
  generateGlassStyleObject,
  checkBackdropFilterSupport
} from '../../utils/glassmorphismUtils';

export default function GlassPreview({
  state,
  onChangeState
}) {
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(checkBackdropFilterSupport());
  }, []);

  const glassStyle = generateGlassStyleObject(state);

  // Background style generator
  const getBackgroundStyle = () => {
    switch (state.previewBg) {
      case 'dark-gradient':
        return {
          background: 'linear-gradient(135deg, #0B0F17 0%, #1E1B4B 50%, #0F172A 100%)'
        };
      case 'light-clean':
        return {
          background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 50%, #CBD5E1 100%)'
        };
      case 'checkerboard':
        return {
          backgroundColor: '#1E293B',
          backgroundImage: 'linear-gradient(45deg, #0F172A 25%, transparent 25%), linear-gradient(-45deg, #0F172A 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #0F172A 75%), linear-gradient(-45deg, transparent 75%, #0F172A 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        };
      case 'abstract-shapes':
        return {
          background: '#0F172A'
        };
      case 'mesh-gradient':
      default:
        return {
          background: 'linear-gradient(135deg, #020617 0%, #0F172A 100%)'
        };
    }
  };

  const bgStyle = getBackgroundStyle();

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
      {/* Top Bar: Background Canvas Selector & Text Color */}
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
        {/* Background Canvas Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Background:
          </span>
          <div style={{ display: 'flex', background: 'var(--bg-input)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'mesh-gradient', label: 'Vibrant Mesh' },
              { id: 'abstract-shapes', label: 'Floating Orbs' },
              { id: 'dark-gradient', label: 'Dark Space' },
              { id: 'light-clean', label: 'Light' },
              { id: 'checkerboard', label: 'Grid' }
            ].map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => onChangeState({ previewBg: b.id })}
                style={{
                  background: state.previewBg === b.id ? 'var(--color-accent-blue)' : 'transparent',
                  color: state.previewBg === b.id ? 'var(--text-inverse)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)'
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Color Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Text:
          </span>
          <div style={{ display: 'flex', background: 'var(--bg-input)', padding: 2, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {[
              { val: '#FFFFFF', label: 'Light' },
              { val: '#0F172A', label: 'Dark' }
            ].map(t => (
              <button
                key={t.val}
                type="button"
                onClick={() => onChangeState({ textColor: t.val })}
                style={{
                  background: state.textColor === t.val ? 'var(--bg-card)' : 'transparent',
                  color: state.textColor === t.val ? 'var(--color-accent-blue)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Browser Support Warning Banner (if not supported) */}
      {!isSupported && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            borderBottom: '1px solid var(--badge-error-border)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--badge-error-text)',
            fontSize: '0.78rem'
          }}
        >
          <AlertTriangle size={15} />
          <span>Your browser does not currently support <code>backdrop-filter</code>. The preview will render a fallback alpha background.</span>
        </div>
      )}

      {/* Main Canvas Area: Contains the background and the glass card in front */}
      <div
        id="glass-preview-canvas"
        style={{
          minHeight: 400,
          padding: '48px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          ...bgStyle
        }}
      >
        {/* Layer 1: Background Visual Elements (Rendered BEHIND the glass card for backdrop refraction) */}
        <div
          className="glass-preview-bg-elements"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          {/* Abstract colorful floating orbs/blobs to demonstrate blur */}
          <div
            style={{
              position: 'absolute',
              top: '12%',
              left: '18%',
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #EC4899 0%, #A855F7 70%, transparent 100%)',
              opacity: 0.85
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '10%',
              right: '15%',
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #38BDF8 0%, #3B82F6 70%, transparent 100%)',
              opacity: 0.8
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '40%',
              right: '30%',
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #F59E0B 0%, #EF4444 80%, transparent 100%)',
              opacity: 0.75
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '25%',
              left: '25%',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #10B981 0%, #064E3B 80%, transparent 100%)',
              opacity: 0.7
            }}
          />
        </div>

        {/* Layer 2: The Translucent Glass Card Surface */}
        <div
          id="glass-preview-card"
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 380,
            padding: '24px 28px',
            color: state.textColor,
            transition: 'background 0.15s ease, backdrop-filter 0.15s ease, border-radius 0.15s ease, box-shadow 0.15s ease',
            ...glassStyle
          }}
        >
          {/* Top Badge & Metric */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: state.textColor === '#0F172A' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Sparkles size={12} />
              <span>Glassmorphism</span>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700 }}>
              <TrendingUp size={14} color="#34D399" />
              <span>+24.8%</span>
            </div>
          </div>

          {/* Card Title & Description */}
          <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.25 }}>
            Chromapick Studio
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '0.84rem', opacity: 0.88, lineHeight: 1.5 }}>
            Experience real-time frosted glass refraction with browser-native CSS backdrop-filter.
          </p>

          {/* Mini Interactive Metric Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: state.textColor === '#0F172A' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)',
              marginBottom: 18
            }}
          >
            <div>
              <div style={{ fontSize: '0.68rem', opacity: 0.75, fontWeight: 700 }}>BLUR</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{state.blur}px</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', opacity: 0.75, fontWeight: 700 }}>TINT ALPHA</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{state.bgOpacity}%</div>
            </div>
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '9px 16px',
                borderRadius: 'var(--radius-md)',
                background: state.textColor === '#0F172A' ? '#0F172A' : '#FFFFFF',
                color: state.textColor === '#0F172A' ? '#FFFFFF' : '#0F172A',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              Explore Component
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
