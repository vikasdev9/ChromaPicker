import React from 'react';
import { ArrowRight, Sparkles, Star, ShieldCheck, Zap } from 'lucide-react';
import { generateCssGradient } from '../../utils/gradientUtils';

export default function GradientComponentPreviews({ gradientState }) {
  const gradientCss = generateCssGradient(gradientState);

  return (
    <div
      className="chroma-card"
      style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}
    >
      <div>
        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Component Previews</h4>
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          See how your current gradient looks applied to real interface components.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20
        }}
      >
        {/* Preview 1: Typography Text Clipping Banner */}
        <div
          style={{
            background: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '24px 20px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: 180
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
            Typography with Text Clip
          </span>

          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              backgroundImage: gradientCss,
              WebkitBackgroundImage: gradientCss,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              lineHeight: 1.15
            }}
          >
            Digital Aesthetics & Color Science
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Elevate user interfaces with vibrant gradient fills.
          </p>
        </div>

        {/* Preview 2: Interactive Buttons & Badge */}
        <div
          style={{
            background: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '24px 20px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 16,
            minHeight: 180
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Buttons & Accent Badges
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Primary Gradient Fill Button */}
            <button
              type="button"
              style={{
                background: gradientCss,
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>

            {/* Pill Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                background: gradientCss,
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Zap size={13} fill="currentColor" />
              <span>Pro Scheme</span>
            </div>
          </div>

          {/* Border-Gradient Card / Outline Button */}
          <div
            style={{
              padding: 1.5,
              borderRadius: 'var(--radius-md)',
              background: gradientCss,
              display: 'inline-block'
            }}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '8px 16px',
                borderRadius: 'calc(var(--radius-md) - 1.5px)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            >
              <ShieldCheck size={16} color="var(--color-accent-blue)" />
              <span>Gradient Border Box Container</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
