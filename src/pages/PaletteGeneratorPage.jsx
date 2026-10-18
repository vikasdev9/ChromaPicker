import React, { useState, useEffect, useCallback } from 'react';
import {
  Shuffle,
  Lock,
  Unlock,
  Copy,
  Check,
  Download,
  RotateCcw,
  RotateCw,
  Plus,
  Trash2,
  Share2,
  Sliders
} from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import {
  rgbToHex,
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  getReadableTextColor,
  generateHarmonies
} from '../utils/colorMath';
import { findNearestColorName } from '../data/colorNames';
import { useToast } from '../context/ToastContext';
import { usePalette } from '../context/PaletteContext';
import {
  exportPaletteJson,
  exportPaletteCssVariables,
  exportPaletteSvg,
  exportPalettePng,
  exportPaletteTxt,
  triggerFileDownload
} from '../utils/downloadUtils';

// Helper to generate a random pleasant color
function getRandomHex() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(45 + Math.random() * 45); // 45 - 90%
  const l = Math.floor(35 + Math.random() * 45); // 35 - 80%
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

export default function PaletteGeneratorPage() {
  const { showToast } = useToast();
  const { saveCustomPalette, addRecentColor } = usePalette();

  const [palette, setPalette] = useState([
    { id: '1', hex: '#2596BE', locked: false },
    { id: '2', hex: '#67BDD4', locked: false },
    { id: '3', hex: '#FFD5BE', locked: false },
    { id: '4', hex: '#FFB6D2', locked: false },
    { id: '5', hex: '#B8FFE4', locked: false }
  ]);

  const [harmonyMode, setHarmonyMode] = useState('random');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [editingIndex, setEditingIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Push to history
  const pushHistory = (newPalette) => {
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, newPalette];
    });
    setHistoryIndex(prev => prev + 1);
  };

  // Generate new colors respecting locked state
  const generateNewColors = useCallback(() => {
    setPalette(prev => {
      let baseHue = Math.floor(Math.random() * 360);
      const updated = prev.map((item, idx) => {
        if (item.locked) return item;

        let hex;
        if (harmonyMode === 'analogous') {
          const rgb = hslToRgb((baseHue + idx * 25) % 360, 65, 55);
          hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        } else if (harmonyMode === 'monochromatic') {
          const rgb = hslToRgb(baseHue, 60, 25 + idx * 14);
          hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        } else if (harmonyMode === 'pastel') {
          const rgb = hslToRgb((baseHue + idx * 45) % 360, 50, 80);
          hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        } else if (harmonyMode === 'vibrant') {
          const rgb = hslToRgb((baseHue + idx * 60) % 360, 85, 52);
          hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        } else {
          hex = getRandomHex();
        }
        return { ...item, hex };
      });

      pushHistory(updated);
      return updated;
    });
  }, [harmonyMode]);

  // Spacebar key shortcut for regeneration
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        generateNewColors();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generateNewColors]);

  const toggleLock = (id) => {
    setPalette(prev => prev.map(c => c.id === id ? { ...c, locked: !c.locked } : c));
  };

  const updateColor = (id, newHex) => {
    setPalette(prev => prev.map(c => c.id === id ? { ...c, hex: newHex.toUpperCase() } : c));
  };

  const addColor = () => {
    if (palette.length >= 10) {
      showToast('Maximum palette size is 10 colors', 'error');
      return;
    }
    const newColor = { id: Date.now().toString(), hex: getRandomHex(), locked: false };
    const updated = [...palette, newColor];
    setPalette(updated);
    pushHistory(updated);
  };

  const removeColor = (id) => {
    if (palette.length <= 2) {
      showToast('Palette must contain at least 2 colors', 'error');
      return;
    }
    const updated = palette.filter(c => c.id !== id);
    setPalette(updated);
    pushHistory(updated);
  };

  const handleCopyColor = (hex, idx) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(idx);
    showToast(`Copied ${hex}!`, 'success');
    addRecentColor(hex);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = () => {
    const hexList = palette.map(c => c.hex).join(', ');
    navigator.clipboard.writeText(hexList);
    showToast('Copied all HEX codes!', 'success');
  };

  const handleExport = (format) => {
    const name = 'Chromapick-Palette';
    const colors = palette.map(c => c.hex);
    if (format === 'json') {
      triggerFileDownload(exportPaletteJson(name, colors), `${name}.json`, 'application/json');
    } else if (format === 'css') {
      triggerFileDownload(exportPaletteCssVariables(name, colors), `${name}.css`, 'text/css');
    } else if (format === 'svg') {
      triggerFileDownload(exportPaletteSvg(name, colors), `${name}.svg`, 'image/svg+xml');
    } else if (format === 'png') {
      exportPalettePng(name, colors);
    } else if (format === 'txt') {
      triggerFileDownload(exportPaletteTxt(name, colors), `${name}.txt`, 'text/plain');
    }
    showToast(`Exported as ${format.toUpperCase()}`, 'success');
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Top Controls Header */}
      <div style={{ textAlign: 'center', padding: '36px 16px 24px 16px', maxWidth: 840, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>
          Color Palette Generator
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Press <kbd style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: 6, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>Spacebar</kbd> to generate random harmonious schemes, lock your favorites, and export instantly.
        </p>

        {/* Action Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
          <button
            onClick={generateNewColors}
            className="btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.95rem' }}
          >
            <Shuffle size={16} />
            <span>Generate (Space)</span>
          </button>

          <select
            value={harmonyMode}
            onChange={e => setHarmonyMode(e.target.value)}
            className="input-text"
            style={{ width: 'auto', padding: '8px 14px', fontWeight: 600, fontSize: '0.85rem' }}
          >
            <option value="random">Harmonious Random</option>
            <option value="analogous">Analogous Spectrum</option>
            <option value="monochromatic">Monochromatic Tones</option>
            <option value="pastel">Pastel Aesthetic</option>
            <option value="vibrant">Vibrant & Punchy</option>
          </select>

          <button
            onClick={addColor}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            title="Add Color"
          >
            <Plus size={15} />
            <span>Add Color ({palette.length}/10)</span>
          </button>

          <button
            onClick={handleCopyAll}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Copy size={15} />
            <span>Copy All</span>
          </button>

          <button
            onClick={() => handleExport('svg')}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Download size={15} />
            <span>Export SVG</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Palette Bar */}
      <div
        className="chroma-card"
        style={{
          display: 'flex',
          height: 480,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          marginBottom: 32
        }}
      >
        {palette.map((item, idx) => {
          const textColor = getReadableTextColor(item.hex);
          const colorName = findNearestColorName(item.hex).name;

          return (
            <div
              key={item.id}
              style={{
                flex: 1,
                backgroundColor: item.hex,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px 16px',
                position: 'relative',
                transition: 'background-color 0.2s ease',
                color: textColor
              }}
            >
              {/* Top Controls: Remove, Lock */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => removeColor(item.id)}
                  style={{
                    background: 'rgba(0,0,0,0.15)',
                    border: 'none',
                    color: textColor,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Remove color"
                >
                  <Trash2 size={14} />
                </button>

                <button
                  onClick={() => toggleLock(item.id)}
                  style={{
                    background: item.locked ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)',
                    border: 'none',
                    color: textColor,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title={item.locked ? 'Unlock color' : 'Lock color'}
                >
                  {item.locked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
              </div>

              {/* Center: Color info & Quick copy */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => handleCopyColor(item.hex, idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: textColor,
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  title="Click to copy HEX"
                >
                  <span>{item.hex}</span>
                  {copiedIndex === idx ? <Check size={16} /> : <Copy size={14} opacity={0.7} />}
                </button>

                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 4, opacity: 0.9 }}>
                  {colorName}
                </div>
              </div>

              {/* Bottom: Color picker trigger */}
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <button
                  onClick={() => setEditingIndex(editingIndex === idx ? null : idx)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(6px)',
                    border: 'none',
                    color: textColor,
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Adjust Color
                </button>

                {/* Popover Color Picker */}
                {editingIndex === idx && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 12px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--bg-card)',
                      padding: 12,
                      borderRadius: 14,
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 30,
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <HexColorPicker
                      color={item.hex}
                      onChange={val => updateColor(item.id, val)}
                      style={{ width: 170, height: 140 }}
                    />
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="btn-primary"
                      style={{ width: '100%', marginTop: 8, padding: '4px 0', fontSize: '0.75rem' }}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Export Options Grid */}
      <div className="chroma-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>
          Export Palette Formats
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {[
            { label: 'CSS Variables', desc: ':root { --color: ... }', format: 'css' },
            { label: 'SVG Swatches', desc: 'Vector graphics file', format: 'svg' },
            { label: 'PNG Image', desc: 'High-res image card', format: 'png' },
            { label: 'JSON Dataset', desc: 'Full palette metadata', format: 'json' },
            { label: 'Plain Text', desc: 'HEX list for editors', format: 'txt' }
          ].map((exp, i) => (
            <button
              key={i}
              onClick={() => handleExport(exp.format)}
              style={{
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: '14px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'var(--transition-normal)'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent-blue)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{exp.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{exp.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
