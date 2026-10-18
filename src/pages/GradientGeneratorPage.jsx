import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import {
  Sparkles,
  Copy,
  Check,
  Plus,
  Trash2,
  Download,
  RotateCw,
  Compass
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { triggerFileDownload } from '../utils/downloadUtils';

const PRESET_GRADIENTS = [
  { name: 'Chromapick Signature', type: 'linear', angle: 90, stops: [{ color: '#FFD5BE', pos: 0 }, { color: '#FFB6D2', pos: 35 }, { color: '#B8FFE4', pos: 75 }, { color: '#2596BE', pos: 100 }] },
  { name: 'Sunset Ocean', type: 'linear', angle: 135, stops: [{ color: '#F97316', pos: 0 }, { color: '#EC4899', pos: 50 }, { color: '#3B82F6', pos: 100 }] },
  { name: 'Northern Lights', type: 'linear', angle: 180, stops: [{ color: '#0F172A', pos: 0 }, { color: '#10B981', pos: 50 }, { color: '#06B6D4', pos: 100 }] },
  { name: 'Neon Cyberpunk', type: 'linear', angle: 135, stops: [{ color: '#3B82F6', pos: 0 }, { color: '#EC4899', pos: 100 }] },
  { name: 'Glacier Sky', type: 'linear', angle: 45, stops: [{ color: '#2596BE', pos: 0 }, { color: '#A8F3FA', pos: 100 }] },
  { name: 'Pastel Sorbet', type: 'linear', angle: 90, stops: [{ color: '#FFB6D2', pos: 0 }, { color: '#FFE4E6', pos: 100 }] }
];

export default function GradientGeneratorPage() {
  const { showToast } = useToast();

  const [type, setType] = useState('linear'); // 'linear' | 'radial'
  const [angle, setAngle] = useState(135);
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [stops, setStops] = useState([
    { color: '#2596BE', pos: 0 },
    { color: '#B8FFE4', pos: 100 }
  ]);

  // Construct CSS string
  const sortedStops = [...stops].sort((a, b) => a.pos - b.pos);
  const stopString = sortedStops.map(s => `${s.color} ${s.pos}%`).join(', ');
  const cssGradient = type === 'linear'
    ? `linear-gradient(${angle}deg, ${stopString})`
    : `radial-gradient(circle, ${stopString})`;

  const fullCssOutput = `background: ${cssGradient};`;

  const handleCopyCss = () => {
    navigator.clipboard.writeText(fullCssOutput);
    showToast('Copied CSS gradient declaration!', 'success');
  };

  const handleAddStop = () => {
    if (stops.length >= 6) {
      showToast('Maximum of 6 color stops supported', 'info');
      return;
    }
    const newPos = Math.round((stops[stops.length - 1].pos + stops[0].pos) / 2);
    const newStop = { color: '#FFB6D2', pos: newPos };
    setStops(prev => [...prev, newStop]);
    setActiveStopIndex(stops.length);
  };

  const handleRemoveStop = (idx) => {
    if (stops.length <= 2) {
      showToast('A gradient requires at least 2 color stops', 'error');
      return;
    }
    setStops(prev => prev.filter((_, i) => i !== idx));
    setActiveStopIndex(0);
  };

  const handleUpdateActiveColor = (newHex) => {
    setStops(prev => prev.map((s, i) => i === activeStopIndex ? { ...s, color: newHex.toUpperCase() } : s));
  };

  const handleUpdateActivePos = (pos) => {
    setStops(prev => prev.map((s, i) => i === activeStopIndex ? { ...s, pos: parseInt(pos, 10) } : s));
  };

  const handleDownloadSvg = () => {
    const svg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="chromaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      ${sortedStops.map(s => `<stop offset="${s.pos}%" stop-color="${s.color}" />`).join('\n      ')}
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#chromaGrad)" />
</svg>`;
    triggerFileDownload(svg, 'gradient-background.svg', 'image/svg+xml');
    showToast('Downloaded SVG gradient!', 'success');
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', padding: '36px 16px 28px 16px', maxWidth: 840, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>
          CSS Gradient Generator
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Design linear and radial gradients with customizable color stops, real-time preview, and 1-click CSS export.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: 28,
          alignItems: 'start'
        }}
        className="gradient-grid"
      >
        {/* Left Column: Live Gradient Preview & CSS Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Huge Gradient Canvas */}
          <div
            className="chroma-card"
            style={{
              height: 380,
              background: cssGradient,
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              padding: 24,
              boxShadow: 'var(--shadow-float)',
              position: 'relative'
            }}
          >
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              {type.toUpperCase()} • {type === 'linear' ? `${angle}°` : 'Circle'} • {stops.length} Stops
            </div>

            <button
              onClick={handleDownloadSvg}
              style={{
                background: '#FFFFFF',
                color: '#0F172A',
                border: 'none',
                padding: '8px 14px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <Download size={14} />
              <span>SVG</span>
            </button>
          </div>

          {/* CSS Code Output Card */}
          <div className="chroma-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Generated CSS
              </span>
              <button
                onClick={handleCopyCss}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                <Copy size={13} />
                <span>Copy CSS</span>
              </button>
            </div>
            <pre
              style={{
                background: 'var(--bg-input)',
                padding: 14,
                borderRadius: 10,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                overflowX: 'auto',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
            >
              {fullCssOutput}
            </pre>
          </div>

          {/* Curated Presets */}
          <div className="chroma-card" style={{ padding: 20 }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 14 }}>
              Gradient Presets
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
              {PRESET_GRADIENTS.map((p, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setType(p.type);
                    setAngle(p.angle);
                    setStops(p.stops);
                    setActiveStopIndex(0);
                  }}
                  style={{
                    height: 52,
                    borderRadius: 10,
                    background: `linear-gradient(${p.angle}deg, ${p.stops.map(s => `${s.color} ${s.pos}%`).join(', ')})`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: 6,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  title={p.name}
                >
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#FFFFFF', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="chroma-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Gradient Settings</h3>

          {/* Type Toggle */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              Gradient Style
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['linear', 'radial'].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setType(mode)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textTransform: 'capitalize',
                    border: '1px solid',
                    borderColor: type === mode ? 'var(--color-accent-blue)' : 'var(--border-color)',
                    background: type === mode ? 'rgba(37, 150, 190, 0.1)' : 'var(--bg-card-subtle)',
                    color: type === mode ? 'var(--color-accent-blue)' : 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Angle Slider (Linear only) */}
          {type === 'linear' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Angle</label>
                <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={e => setAngle(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--color-accent-blue)' }}
              />

              {/* Angle Presets */}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {[0, 45, 90, 135, 180, 270].map(deg => (
                  <button
                    key={deg}
                    onClick={() => setAngle(deg)}
                    style={{
                      flex: 1,
                      padding: '4px 0',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: angle === deg ? 'var(--color-accent-blue)' : 'var(--bg-card-subtle)',
                      color: angle === deg ? '#FFFFFF' : 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer'
                    }}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Stops Row */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Color Stops</label>
              <button
                onClick={handleAddStop}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent-blue)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={14} />
                <span>Add Stop</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {stops.map((stop, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveStopIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: '1.5px solid',
                    borderColor: activeStopIndex === idx ? 'var(--color-accent-blue)' : 'var(--border-color)',
                    background: 'var(--bg-card-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: stop.color }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{stop.pos}%</span>
                  {stops.length > 2 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStop(idx);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stop Adjuster Picker */}
          {stops[activeStopIndex] && (
            <div style={{ background: 'var(--bg-card-subtle)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Stop #{activeStopIndex + 1} Color</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700 }}>
                  {stops[activeStopIndex].color}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <HexColorPicker
                  color={stops[activeStopIndex].color}
                  onChange={handleUpdateActiveColor}
                  style={{ width: '100%', height: 140 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Position ({stops[activeStopIndex].pos}%)</label>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={stops[activeStopIndex].pos}
                onChange={e => handleUpdateActivePos(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--color-accent-blue)' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
