import React, { useState } from 'react';
import { Sparkles, ArrowRight, Eye, RefreshCw, Sun, Moon, Edit3, Check } from 'lucide-react';

export default function FontPreviewMockup({
  headingFont,
  bodyFont,
  headingWeight = 700,
  headingStyle = 'normal',
  headingSize = 36,
  headingLineHeight = 1.2,
  headingLetterSpacing = -0.5,
  bodyWeight = 400,
  bodyStyle = 'normal',
  bodySize = 16,
  bodyLineHeight = 1.6,
  bodyLetterSpacing = 0,
  textColor = 'inherit',
  containerBg = 'card'
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [previewTheme, setPreviewTheme] = useState('card'); // 'card' | 'dark' | 'light' | 'paper'
  
  // Custom or default text content
  const [content, setContent] = useState({
    tag: 'TYPOGRAPHY SPOTLIGHT',
    heading: 'Designing the Next Generation of Digital Experiences',
    subheading: 'A refined typographic system brings clarity, visual hierarchy, and personality to every digital surface.',
    paragraph: 'Typography is the foundation of digital interfaces. The delicate balance between expressive headline character and effortless paragraph legibility defines how comfortably readers absorb your narrative. When paired thoughtfully, contrasting yet harmonious typefaces elevate brand trust and aesthetic maturity.',
    button: 'Start Creating Free',
    caption: 'Verified WCAG AA / AAA readability • 2026 Typography Standards'
  });

  const handleResetContent = () => {
    setContent({
      tag: 'TYPOGRAPHY SPOTLIGHT',
      heading: 'Designing the Next Generation of Digital Experiences',
      subheading: 'A refined typographic system brings clarity, visual hierarchy, and personality to every digital surface.',
      paragraph: 'Typography is the foundation of digital interfaces. The delicate balance between expressive headline character and effortless paragraph legibility defines how comfortably readers absorb your narrative. When paired thoughtfully, contrasting yet harmonious typefaces elevate brand trust and aesthetic maturity.',
      button: 'Start Creating Free',
      caption: 'Verified WCAG AA / AAA readability • 2026 Typography Standards'
    });
    setIsEditing(false);
  };

  // Preview container background theme styling
  const getThemeStyles = () => {
    switch (previewTheme) {
      case 'dark':
        return {
          background: '#0B0F17',
          color: '#F8FAFC',
          border: '1px solid #1E293B'
        };
      case 'light':
        return {
          background: '#FFFFFF',
          color: '#0F172A',
          border: '1px solid #E2E8F0'
        };
      case 'paper':
        return {
          background: '#FBF9F5',
          color: '#262626',
          border: '1px solid #E7E5E4'
        };
      case 'card':
      default:
        return {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)'
        };
    }
  };

  const themeStyles = getThemeStyles();

  // Dynamic typography styles scoped to heading and body elements
  const headingCss = {
    fontFamily: `'${headingFont.family}', ${headingFont.fallback || 'sans-serif'}`,
    fontWeight: headingWeight,
    fontStyle: headingStyle,
    fontSize: `clamp(1.5rem, 4vw, ${headingSize}px)`,
    lineHeight: headingLineHeight,
    letterSpacing: `${headingLetterSpacing}px`,
    color: textColor !== 'inherit' ? textColor : 'inherit',
    margin: 0,
    transition: 'var(--transition-normal)'
  };

  const subheadingCss = {
    fontFamily: `'${headingFont.family}', ${headingFont.fallback || 'sans-serif'}`,
    fontWeight: headingWeight > 500 ? Math.max(400, headingWeight - 100) : headingWeight,
    fontStyle: headingStyle,
    fontSize: `clamp(1rem, 2vw, ${Math.max(16, Math.round(headingSize * 0.52))}px)`,
    lineHeight: 1.4,
    opacity: 0.85,
    margin: 0
  };

  const bodyCss = {
    fontFamily: `'${bodyFont.family}', ${bodyFont.fallback || 'sans-serif'}`,
    fontWeight: bodyWeight,
    fontStyle: bodyStyle,
    fontSize: `${bodySize}px`,
    lineHeight: bodyLineHeight,
    letterSpacing: `${bodyLetterSpacing}px`,
    color: textColor !== 'inherit' ? textColor : 'inherit',
    margin: 0,
    transition: 'var(--transition-normal)'
  };

  return (
    <div
      className="font-pairing-preview-wrapper"
      style={{
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        transition: 'var(--transition-normal)'
      }}
    >
      {/* Mockup Toolbar */}
      <div
        style={{
          background: 'var(--bg-card-subtle)',
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        {/* Active Font Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(56, 189, 248, 0.12)',
              color: 'var(--color-accent-blue)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700
            }}
          >
            <span>H:</span>
            <span style={{ fontFamily: `'${headingFont.family}', sans-serif`, fontWeight: 600 }}>
              {headingFont.family}
            </span>
            <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>{headingWeight}</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(168, 85, 247, 0.12)',
              color: '#A855F7',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700
            }}
          >
            <span>P:</span>
            <span style={{ fontFamily: `'${bodyFont.family}', sans-serif`, fontWeight: 600 }}>
              {bodyFont.family}
            </span>
            <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>{bodyWeight}</span>
          </div>
        </div>

        {/* View Controls: Edit Text toggle & Theme Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className={`btn-subtle ${isEditing ? 'active' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '6px 10px',
              fontSize: '0.78rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              borderRadius: 'var(--radius-md)',
              border: isEditing ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
              background: isEditing ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: isEditing ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
            title={isEditing ? 'Done editing' : 'Customize sample text'}
          >
            {isEditing ? <Check size={14} /> : <Edit3 size={14} />}
            <span>{isEditing ? 'Done' : 'Edit Text'}</span>
          </button>

          {isEditing && (
            <button
              type="button"
              className="btn-subtle"
              onClick={handleResetContent}
              style={{
                padding: '6px 10px',
                fontSize: '0.78rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
              title="Reset sample text to default"
            >
              <RefreshCw size={13} />
              <span>Reset</span>
            </button>
          )}

          {/* Canvas Themes */}
          <div style={{ display: 'flex', background: 'var(--bg-input)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={() => setPreviewTheme('card')}
              style={{
                background: previewTheme === 'card' ? 'var(--bg-card)' : 'transparent',
                color: previewTheme === 'card' ? 'var(--text-primary)' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Card Theme"
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => setPreviewTheme('dark')}
              style={{
                background: previewTheme === 'dark' ? '#0F172A' : 'transparent',
                color: previewTheme === 'dark' ? '#38BDF8' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Dark Canvas"
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setPreviewTheme('light')}
              style={{
                background: previewTheme === 'light' ? '#FFFFFF' : 'transparent',
                color: previewTheme === 'light' ? '#0F172A' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Light Canvas"
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => setPreviewTheme('paper')}
              style={{
                background: previewTheme === 'paper' ? '#FBF9F5' : 'transparent',
                color: previewTheme === 'paper' ? '#262626' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Warm Paper Canvas"
            >
              Paper
            </button>
          </div>
        </div>
      </div>

      {/* Main Specimen Preview Canvas */}
      <div
        className="font-preview-canvas"
        style={{
          ...themeStyles,
          padding: 'clamp(24px, 5vw, 44px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          transition: 'all 0.25s ease'
        }}
      >
        {/* Category Pill / Tag */}
        <div>
          {isEditing ? (
            <input
              type="text"
              value={content.tag}
              onChange={e => setContent({ ...content, tag: e.target.value })}
              className="input-text"
              style={{
                maxWidth: 260,
                fontSize: '0.75rem',
                fontFamily: bodyCss.fontFamily,
                fontWeight: 700,
                letterSpacing: '0.08em'
              }}
              placeholder="Tag text..."
            />
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(56, 189, 248, 0.14)',
                color: 'var(--color-accent-blue)',
                fontFamily: bodyCss.fontFamily,
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              <Sparkles size={12} />
              {content.tag}
            </span>
          )}
        </div>

        {/* Heading */}
        <div>
          {isEditing ? (
            <textarea
              value={content.heading}
              onChange={e => setContent({ ...content, heading: e.target.value })}
              className="input-text"
              rows={2}
              style={{
                width: '100%',
                ...headingCss,
                background: 'transparent',
                resize: 'vertical'
              }}
              placeholder="Heading text..."
            />
          ) : (
            <h1 style={headingCss}>{content.heading}</h1>
          )}
        </div>

        {/* Subheading */}
        <div>
          {isEditing ? (
            <textarea
              value={content.subheading}
              onChange={e => setContent({ ...content, subheading: e.target.value })}
              className="input-text"
              rows={2}
              style={{
                width: '100%',
                ...subheadingCss,
                background: 'transparent',
                resize: 'vertical'
              }}
              placeholder="Subheading text..."
            />
          ) : (
            <p style={subheadingCss}>{content.subheading}</p>
          )}
        </div>

        {/* Paragraph Body Text */}
        <div style={{ maxWidth: 840 }}>
          {isEditing ? (
            <textarea
              value={content.paragraph}
              onChange={e => setContent({ ...content, paragraph: e.target.value })}
              className="input-text"
              rows={4}
              style={{
                width: '100%',
                ...bodyCss,
                background: 'transparent',
                resize: 'vertical'
              }}
              placeholder="Paragraph body text..."
            />
          ) : (
            <p style={bodyCss}>{content.paragraph}</p>
          )}
        </div>

        {/* Interactive UI Action Row (Button + Secondary Link + Metric Card) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            paddingTop: 12,
            borderTop: '1px solid rgba(128, 128, 128, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-primary"
              style={{
                fontFamily: bodyCss.fontFamily,
                fontWeight: Math.max(500, bodyWeight),
                fontSize: `${Math.max(14, bodySize - 1)}px`,
                letterSpacing: '0.02em',
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer'
              }}
            >
              <span>{content.button}</span>
              <ArrowRight size={16} />
            </button>

            <span
              style={{
                fontFamily: bodyCss.fontFamily,
                fontSize: `${Math.max(13, bodySize - 2)}px`,
                fontWeight: 600,
                color: 'var(--color-accent-blue)',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: 3
              }}
            >
              Explore Typographic Scale
            </span>
          </div>

          {/* Metric / Stat Callout */}
          <div
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(128, 128, 128, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: headingCss.fontFamily,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  lineHeight: 1.1
                }}
              >
                99.8%
              </div>
              <div
                style={{
                  fontFamily: bodyCss.fontFamily,
                  fontSize: '0.72rem',
                  opacity: 0.75,
                  letterSpacing: '0.02em'
                }}
              >
                Readability Rating
              </div>
            </div>
          </div>
        </div>

        {/* Caption / Metadata Footnote */}
        <div
          style={{
            fontFamily: bodyCss.fontFamily,
            fontSize: '0.78rem',
            opacity: 0.7,
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>{content.caption}</span>
        </div>
      </div>
    </div>
  );
}
