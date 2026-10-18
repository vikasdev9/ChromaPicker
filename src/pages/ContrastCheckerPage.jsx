import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import {
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Copy,
  Sparkles,
  Info,
  Sliders,
  Check
} from 'lucide-react';
import {
  getContrastRatio,
  getWcagRating,
  isValidHex,
  normalizeHex,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb
} from '../utils/colorMath';
import { useToast } from '../context/ToastContext';

export default function ContrastCheckerPage() {
  const { showToast } = useToast();

  const [textColor, setTextColor] = useState('#2596BE');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [activePicker, setActivePicker] = useState(null); // 'text' | 'bg' | null

  const ratio = getContrastRatio(textColor, bgColor);
  const rating = getWcagRating(ratio);

  const handleSwap = () => {
    const temp = textColor;
    setTextColor(bgColor);
    setBgColor(temp);
    showToast('Swapped foreground and background colors!', 'info');
  };

  // Smart Auto-Fix: Adjusts text lightness until it passes WCAG AA (4.5:1)
  const handleAutoFix = () => {
    const bgRgb = hexToRgb(bgColor);
    const textRgb = hexToRgb(textColor);
    const textHsl = rgbToHsl(textRgb.r, textRgb.g, textRgb.b);

    let fixedHex = textColor;
    // Test darkening or lightening
    for (let step = 1; step <= 80; step++) {
      // Try darkening first if bg is light
      const darkL = Math.max(0, textHsl.l - step);
      const darkRgb = hslToRgb(textHsl.h, textHsl.s, darkL);
      const testHexDark = rgbToHex(darkRgb.r, darkRgb.g, darkRgb.b);
      if (getContrastRatio(testHexDark, bgColor) >= 4.5) {
        fixedHex = testHexDark;
        break;
      }

      // Try lightening
      const lightL = Math.min(100, textHsl.l + step);
      const lightRgb = hslToRgb(textHsl.h, textHsl.s, lightL);
      const testHexLight = rgbToHex(lightRgb.r, lightRgb.g, lightRgb.b);
      if (getContrastRatio(testHexLight, bgColor) >= 4.5) {
        fixedHex = testHexLight;
        break;
      }
    }

    setTextColor(fixedHex);
    showToast(`Adjusted text color to ${fixedHex} (Passes WCAG AA)!`, 'success');
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', padding: '36px 16px 28px 16px', maxWidth: 840, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>
          Color Contrast Checker
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Calculate WCAG 2.1 contrast ratios for text and UI elements to ensure accessible, legible digital experiences.
        </p>
      </div>

      {/* Main Grid: Controls + Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.35fr',
          gap: 24,
          alignItems: 'start'
        }}
        className="contrast-grid"
      >
        {/* Left Column: Pickers & Inputs */}
        <div className="chroma-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Contrast Pair</h3>
            <button
              onClick={handleSwap}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              title="Swap Colors"
            >
              <ArrowLeftRight size={14} />
              <span>Swap</span>
            </button>
          </div>

          {/* Text / Foreground Color */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Foreground / Text Color</label>
              <button
                onClick={() => setActivePicker(activePicker === 'text' ? null : 'text')}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent-blue)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {activePicker === 'text' ? 'Close Picker' : 'Open Picker'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  backgroundColor: textColor,
                  border: '1px solid var(--border-color)',
                  flexShrink: 0
                }}
              />
              <input
                type="text"
                value={textColor}
                onChange={e => setTextColor(e.target.value)}
                className="input-text"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
              />
            </div>

            {activePicker === 'text' && (
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                <HexColorPicker color={textColor} onChange={setTextColor} style={{ width: '100%', height: 160 }} />
              </div>
            )}
          </div>

          {/* Background Color */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Background Color</label>
              <button
                onClick={() => setActivePicker(activePicker === 'bg' ? null : 'bg')}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent-blue)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {activePicker === 'bg' ? 'Close Picker' : 'Open Picker'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  backgroundColor: bgColor,
                  border: '1px solid var(--border-color)',
                  flexShrink: 0
                }}
              />
              <input
                type="text"
                value={bgColor}
                onChange={e => setBgColor(e.target.value)}
                className="input-text"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
              />
            </div>

            {activePicker === 'bg' && (
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                <HexColorPicker color={bgColor} onChange={setBgColor} style={{ width: '100%', height: 160 }} />
              </div>
            )}
          </div>

          {/* Smart Auto-Fix Suggestion */}
          {!rating.aaNormal && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                padding: 14,
                borderRadius: 12
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>
                Contrast fails WCAG AA standards
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                Normal text requires a ratio of at least 4.5:1 to be considered legible.
              </p>
              <button
                onClick={handleAutoFix}
                className="btn-primary"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem', background: '#DC2626' }}
              >
                <Sparkles size={14} />
                <span>Auto-Fix for WCAG AA (4.5:1)</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Contrast Score & Live Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Contrast Score Card */}
          <div className="chroma-card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Calculated Ratio
            </div>
            <div style={{ fontSize: '3.5rem', fontWeight: 800, margin: '8px 0', color: rating.aaNormal ? '#10B981' : '#EF4444' }}>
              {ratio} : 1
            </div>

            {/* Compliance Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 18 }}>
              {/* AA Normal */}
              <div style={{ padding: 12, background: 'var(--bg-card-subtle)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>AA Normal (4.5:1)</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: rating.aaNormal ? '#10B981' : '#EF4444' }}>
                  {rating.aaNormal ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  <span>{rating.aaNormal ? 'Pass' : 'Fail'}</span>
                </div>
              </div>

              {/* AA Large */}
              <div style={{ padding: 12, background: 'var(--bg-card-subtle)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>AA Large (3.0:1)</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: rating.aaLarge ? '#10B981' : '#EF4444' }}>
                  {rating.aaLarge ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  <span>{rating.aaLarge ? 'Pass' : 'Fail'}</span>
                </div>
              </div>

              {/* AAA Normal */}
              <div style={{ padding: 12, background: 'var(--bg-card-subtle)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>AAA Normal (7.0:1)</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: rating.aaaNormal ? '#10B981' : '#EF4444' }}>
                  {rating.aaaNormal ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  <span>{rating.aaaNormal ? 'Pass' : 'Fail'}</span>
                </div>
              </div>

              {/* AAA Large */}
              <div style={{ padding: 12, background: 'var(--bg-card-subtle)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>AAA Large (4.5:1)</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: rating.aaaLarge ? '#10B981' : '#EF4444' }}>
                  {rating.aaaLarge ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  <span>{rating.aaaLarge ? 'Pass' : 'Fail'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Text Preview Box */}
          <div
            className="chroma-card"
            style={{
              padding: 32,
              backgroundColor: bgColor,
              color: textColor,
              transition: 'background-color 0.2s, color 0.2s'
            }}
          >
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8, color: textColor }}>
              Large Heading Text Preview (24px+)
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: 20, color: textColor }}>
              Normal body text preview (16px). Good design is as little design as possible. Less, but better — because it concentrates on the essential aspects, and the products are not burdened with non-essentials.
            </p>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                style={{
                  background: textColor,
                  color: bgColor,
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                Button Element
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Sample inline link text
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
