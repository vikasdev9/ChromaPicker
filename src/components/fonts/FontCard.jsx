import React, { useEffect } from 'react';
import { Heart, Type, ArrowUpRight } from 'lucide-react';
import { loadFontOnDemand } from '../../utils/fontLoader';

export default function FontCard({
  font,
  sampleText,
  isHeading,
  isBody,
  onSelectHeading,
  onSelectBody,
  isFavorite,
  onToggleFavorite
}) {
  // Load font on mount
  useEffect(() => {
    loadFontOnDemand(font.family, font.weights.slice(0, 3), font.hasItalic);
  }, [font.family, font.weights, font.hasItalic]);

  const previewStyle = {
    fontFamily: `'${font.family}', ${font.fallback || 'sans-serif'}`,
    fontWeight: font.weights.includes(400) ? 400 : font.weights[0],
    fontSize: '1.25rem',
    lineHeight: 1.4,
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginBottom: 12
  };

  return (
    <div
      className="chroma-card"
      style={{
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 'var(--radius-lg)',
        border: (isHeading || isBody) ? '1.5px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
        background: (isHeading || isBody) ? 'var(--bg-card-subtle)' : 'var(--bg-card)',
        transition: 'var(--transition-normal)',
        position: 'relative'
      }}
    >
      {/* Top Header: Family Name, Category & Favorite */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {font.family}
            </h4>
            {isHeading && (
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  background: 'var(--color-accent-blue)',
                  color: 'var(--text-inverse)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  textTransform: 'uppercase'
                }}
              >
                Heading
              </span>
            )}
            {isBody && (
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  background: 'var(--badge-success-bg)',
                  color: 'var(--badge-success-text)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: '1px solid rgba(4, 120, 87, 0.2)',
                  textTransform: 'uppercase'
                }}
              >
                Body
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            {font.category} • {font.weights.length} weights
          </span>
        </div>

        <button
          onClick={() => onToggleFavorite(font.family)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            borderRadius: '50%',
            color: isFavorite ? '#EF4444' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s ease'
          }}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-label={`Toggle favorite for ${font.family}`}
        >
          <Heart size={16} fill={isFavorite ? '#EF4444' : 'none'} />
        </button>
      </div>

      {/* Live Specimen Text */}
      <div style={previewStyle} title={sampleText}>
        {sampleText || 'The quick brown fox jumps over the lazy dog.'}
      </div>

      {/* Weights Chips */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
        {font.weights.map(w => (
          <span
            key={w}
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              padding: '1px 6px',
              borderRadius: 4,
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)'
            }}
          >
            {w}
          </span>
        ))}
      </div>

      {/* Action Buttons: Set Heading / Set Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
        <button
          type="button"
          onClick={() => onSelectHeading(font)}
          style={{
            padding: '6px 10px',
            borderRadius: 7,
            border: isHeading ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
            background: isHeading ? 'var(--color-accent-blue)' : 'var(--bg-card-subtle)',
            color: isHeading ? 'var(--text-inverse)' : 'var(--text-primary)',
            fontSize: '0.76rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            transition: 'var(--transition-normal)'
          }}
        >
          <Type size={12} />
          <span>{isHeading ? 'Active Heading' : 'Use as Heading'}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectBody(font)}
          style={{
            padding: '6px 10px',
            borderRadius: 7,
            border: isBody ? '1px solid var(--badge-success-text)' : '1px solid var(--border-color)',
            background: isBody ? 'var(--badge-success-bg)' : 'var(--bg-card-subtle)',
            color: isBody ? 'var(--badge-success-text)' : 'var(--text-primary)',
            fontSize: '0.76rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            transition: 'var(--transition-normal)'
          }}
        >
          <ArrowUpRight size={12} />
          <span>{isBody ? 'Active Body' : 'Use as Body'}</span>
        </button>
      </div>
    </div>
  );
}
