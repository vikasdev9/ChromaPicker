import React, { useState } from 'react';
import { BoxSelect, Type, Sparkles, RefreshCw, Sun, Moon } from 'lucide-react';
import { generateShadowValue } from '../../utils/shadowUtils';

export default function ShadowPreview({
  mode,
  layers,
  onChangeMode
}) {
  const [canvasBg, setCanvasBg] = useState('card'); // 'card' | 'dark' | 'light' | 'slate' | 'paper'
  const [cardBg, setCardBg] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#0F172A');
  const [previewText, setPreviewText] = useState('Chromapick Studio');
  const [fontSize, setFontSize] = useState(48);

  const shadowValue = generateShadowValue(layers, mode);

  // Canvas background styles
  const getCanvasStyles = () => {
    switch (canvasBg) {
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

  const canvasTheme = getCanvasStyles();

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
      {/* Top Bar: Mode Switcher & Canvas Themes */}
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
        {/* Mode Selector Tabs (Box-Shadow vs Text-Shadow) */}
        <div style={{ display: 'flex', background: 'var(--bg-input)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => onChangeMode('box-shadow')}
            style={{
              background: mode === 'box-shadow' ? 'var(--color-accent-blue)' : 'transparent',
              color: mode === 'box-shadow' ? 'var(--text-inverse)' : 'var(--text-secondary)',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'var(--transition-normal)'
            }}
          >
            <BoxSelect size={14} />
            <span>Box Shadow</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeMode('text-shadow')}
            style={{
              background: mode === 'text-shadow' ? 'var(--color-accent-blue)' : 'transparent',
              color: mode === 'text-shadow' ? 'var(--text-inverse)' : 'var(--text-secondary)',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'var(--transition-normal)'
            }}
          >
            <Type size={14} />
            <span>Text Shadow</span>
          </button>
        </div>

        {/* Canvas Theme Selector */}
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
                onClick={() => setCanvasBg(t.id)}
                style={{
                  background: canvasBg === t.id ? 'var(--bg-card)' : 'transparent',
                  color: canvasBg === t.id ? 'var(--color-accent-blue)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Preview Specimen Area */}
      <div
        style={{
          minHeight: 340,
          background: canvasTheme.background,
          padding: '40px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.25s ease',
          overflow: 'hidden'
        }}
      >
        {/* Box Shadow Mode Preview */}
        {mode === 'box-shadow' && (
          <div
            style={{
              width: 'min(320px, 80vw)',
              height: 200,
              borderRadius: 'var(--radius-xl)',
              backgroundColor: cardBg,
              boxShadow: shadowValue,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              textAlign: 'center',
              transition: 'box-shadow 0.15s ease',
              border: cardBg === '#FFFFFF' ? '1px solid rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--color-accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10
              }}
            >
              <BoxSelect size={20} />
            </div>
            <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: cardBg === '#FFFFFF' || cardBg === '#FAF8F5' ? '#0F172A' : '#FFFFFF' }}>
              Elevated Component
            </h4>
            <p style={{ margin: 0, fontSize: '0.78rem', color: cardBg === '#FFFFFF' || cardBg === '#FAF8F5' ? '#64748B' : 'rgba(255,255,255,0.7)' }}>
              Interactive Box-Shadow Preview
            </p>
          </div>
        )}

        {/* Text Shadow Mode Preview */}
        {mode === 'text-shadow' && (
          <div style={{ textAlign: 'center', maxWidth: '100%', wordBreak: 'break-word', padding: '0 10px' }}>
            <h1
              style={{
                margin: 0,
                fontSize: `clamp(2rem, 5vw, ${fontSize}px)`,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: textColor,
                textShadow: shadowValue,
                transition: 'text-shadow 0.15s ease',
                lineHeight: 1.15
              }}
            >
              {previewText}
            </h1>
          </div>
        )}
      </div>

      {/* Preview Bottom Fine-Tuning Bar */}
      <div
        style={{
          background: 'var(--bg-card-subtle)',
          padding: '10px 18px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        {/* Box Shadow Options: Card Fill Color Swatches */}
        {mode === 'box-shadow' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Card Color:
            </span>
            {[
              { label: 'White', color: '#FFFFFF' },
              { label: 'Slate Dark', color: '#111827' },
              { label: 'Subtle Slate', color: '#1E293B' },
              { label: 'Soft Peach', color: '#FFD5BE' },
              { label: 'Accent Cyan', color: '#A8F3FA' }
            ].map(c => (
              <button
                key={c.color}
                type="button"
                onClick={() => setCardBg(c.color)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  backgroundColor: c.color,
                  border: cardBg === c.color ? '2px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
                title={c.label}
              />
            ))}
          </div>
        )}

        {/* Text Shadow Options: Custom editable text & text color */}
        {mode === 'text-shadow' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '1 1 180px' }}>
              <input
                type="text"
                value={previewText}
                onChange={e => setPreviewText(e.target.value)}
                placeholder="Type sample headline text..."
                className="input-text"
                style={{ padding: '4px 8px', fontSize: '0.8rem', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Text Color:
              </span>
              {[
                { label: 'Dark', color: '#0F172A' },
                { label: 'Light', color: '#F8FAFC' },
                { label: 'Cyan', color: '#38BDF8' },
                { label: 'Pink', color: '#EC4899' }
              ].map(c => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setTextColor(c.color)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    backgroundColor: c.color,
                    border: textColor === c.color ? '2px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                    cursor: 'pointer'
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        )}

        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {layers.filter(l => l.enabled !== false).length} active {mode === 'box-shadow' ? 'box' : 'text'} layer(s)
        </div>
      </div>
    </div>
  );
}
