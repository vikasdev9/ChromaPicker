import React, { useState } from 'react';
import { RefreshCw, Copy, Check, ArrowRight } from 'lucide-react';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  rgbToCmyk,
  rgbToLab,
  rgbToXyz,
  isValidHex,
  normalizeHex,
  getReadableTextColor
} from '../utils/colorMath';
import { useToast } from '../context/ToastContext';

export default function ColorConverterPage() {
  const { showToast } = useToast();

  const [hexInput, setHexInput] = useState('#2596BE');
  const [rgbState, setRgbState] = useState({ r: 37, g: 150, b: 190 });
  const [copiedKey, setCopiedKey] = useState(null);

  // Derived formats
  const currentHex = rgbToHex(rgbState.r, rgbState.g, rgbState.b);
  const hsl = rgbToHsl(rgbState.r, rgbState.g, rgbState.b);
  const hsv = rgbToHsv(rgbState.r, rgbState.g, rgbState.b);
  const cmyk = rgbToCmyk(rgbState.r, rgbState.g, rgbState.b);
  const lab = rgbToLab(rgbState.r, rgbState.g, rgbState.b);
  const xyz = rgbToXyz(rgbState.r, rgbState.g, rgbState.b);
  const textColor = getReadableTextColor(currentHex);

  const handleHexChange = (val) => {
    setHexInput(val);
    if (isValidHex(val)) {
      const rgb = hexToRgb(val);
      setRgbState(rgb);
    }
  };

  const handleRgbChange = (channel, val) => {
    const num = Math.min(255, Math.max(0, parseInt(val || 0, 10)));
    const updated = { ...rgbState, [channel]: num };
    setRgbState(updated);
    setHexInput(rgbToHex(updated.r, updated.g, updated.b));
  };

  const handleHslChange = (channel, val) => {
    const num = parseInt(val || 0, 10);
    const updatedHsl = { ...hsl, [channel]: num };
    const rgb = hslToRgb(updatedHsl.h, updatedHsl.s, updatedHsl.l);
    setRgbState(rgb);
    setHexInput(rgbToHex(rgb.r, rgb.g, rgb.b));
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${key}: ${text}`, 'success');
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', padding: '36px 16px 28px 16px', maxWidth: 840, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>
          Universal Color Converter
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Real-time, bidirectional color space conversion between HEX, RGB, HSL, HSV, CMYK, LAB, and XYZ with dev-ready code outputs.
        </p>
      </div>

      {/* Main Converter Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
          gap: 28,
          alignItems: 'start'
        }}
        className="converter-grid"
      >
        {/* Left: Input Channels */}
        <div className="chroma-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Enter Color Values</h3>

          {/* HEX Input */}
          <div>
            <label htmlFor="hex-color-input" style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              HEX Color
            </label>
            <input
              id="hex-color-input"
              aria-label="HEX Color"
              type="text"
              value={hexInput}
              onChange={e => handleHexChange(e.target.value)}
              className="input-text"
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
              placeholder="#2596BE"
            />
          </div>

          {/* RGB Inputs */}
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              RGB Channels (0 - 255)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div>
                <label htmlFor="rgb-red-channel" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Red</label>
                <input
                  id="rgb-red-channel"
                  aria-label="Red channel (0-255)"
                  type="number"
                  min="0"
                  max="255"
                  value={rgbState.r}
                  onChange={e => handleRgbChange('r', e.target.value)}
                  className="input-text"
                />
              </div>
              <div>
                <label htmlFor="rgb-green-channel" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Green</label>
                <input
                  id="rgb-green-channel"
                  aria-label="Green channel (0-255)"
                  type="number"
                  min="0"
                  max="255"
                  value={rgbState.g}
                  onChange={e => handleRgbChange('g', e.target.value)}
                  className="input-text"
                />
              </div>
              <div>
                <label htmlFor="rgb-blue-channel" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Blue</label>
                <input
                  id="rgb-blue-channel"
                  aria-label="Blue channel (0-255)"
                  type="number"
                  min="0"
                  max="255"
                  value={rgbState.b}
                  onChange={e => handleRgbChange('b', e.target.value)}
                  className="input-text"
                />
              </div>
            </div>
          </div>

          {/* HSL Inputs */}
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              HSL Channels
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div>
                <label htmlFor="hsl-hue-channel" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Hue (0-360°)</label>
                <input
                  id="hsl-hue-channel"
                  aria-label="Hue channel (0-360 degrees)"
                  type="number"
                  min="0"
                  max="360"
                  value={hsl.h}
                  onChange={e => handleHslChange('h', e.target.value)}
                  className="input-text"
                />
              </div>
              <div>
                <label htmlFor="hsl-sat-channel" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Sat (0-100%)</label>
                <input
                  id="hsl-sat-channel"
                  aria-label="Saturation channel (0-100 percent)"
                  type="number"
                  min="0"
                  max="100"
                  value={hsl.s}
                  onChange={e => handleHslChange('s', e.target.value)}
                  className="input-text"
                />
              </div>
              <div>
                <label htmlFor="hsl-light-channel" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Light (0-100%)</label>
                <input
                  id="hsl-light-channel"
                  aria-label="Lightness channel (0-100 percent)"
                  type="number"
                  min="0"
                  max="100"
                  value={hsl.l}
                  onChange={e => handleHslChange('l', e.target.value)}
                  className="input-text"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Color Output Card and Export Snippets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Color Preview Swatch */}
          <div
            className="chroma-card"
            style={{
              height: 120,
              backgroundColor: currentHex,
              color: textColor,
              padding: '24px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {currentHex}
              </h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                rgb({rgbState.r}, {rgbState.g}, {rgbState.b})
              </p>
            </div>
            <button
              onClick={() => handleCopy(currentHex, 'HEX')}
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                border: 'none',
                color: textColor,
                padding: '8px 14px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Copy size={14} />
              <span>Copy HEX</span>
            </button>
          </div>

          {/* Formats Grid */}
          <div className="chroma-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'HEX', val: currentHex },
              { label: 'RGB', val: `rgb(${rgbState.r}, ${rgbState.g}, ${rgbState.b})` },
              { label: 'HSL', val: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
              { label: 'HSV', val: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
              { label: 'CMYK', val: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
              { label: 'LAB', val: `lab(${lab.l}, ${lab.a}, ${lab.b})` },
              { label: 'XYZ', val: `xyz(${xyz.x}, ${xyz.y}, ${xyz.z})` }
            ].map(item => (
              <div key={item.label} className="code-value-box">
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', width: 50 }}>
                  {item.label}
                </span>
                <span style={{ fontWeight: 600, flex: 1 }}>{item.val}</span>
                <button
                  className="copy-icon-btn"
                  aria-label={`Copy ${item.label} value`}
                  onClick={() => handleCopy(item.val, item.label)}
                >
                  {copiedKey === item.label ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
