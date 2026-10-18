import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import {
  Plus,
  Trash2,
  Lock,
  Unlock,
  Save,
  Download,
  Share2,
  Copy,
  Layers,
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { usePalette } from '../context/PaletteContext';
import { useToast } from '../context/ToastContext';
import { getReadableTextColor } from '../utils/colorMath';
import {
  exportPaletteJson,
  exportPaletteCssVariables,
  exportPaletteSvg,
  exportPalettePng,
  exportPaletteTxt,
  triggerFileDownload
} from '../utils/downloadUtils';

export default function PaletteCreatorPage() {
  const { showToast } = useToast();
  const { savedPalettes, saveCustomPalette, deleteCustomPalette } = usePalette();

  const [paletteTitle, setPaletteTitle] = useState('Brand Studio Palette');
  const [paletteDesc, setPaletteDesc] = useState('Primary design system palette for modern web application.');
  const [colors, setColors] = useState([
    { id: '1', hex: '#2596BE', label: 'Primary Accent' },
    { id: '2', hex: '#67BDD4', label: 'Secondary Soft' },
    { id: '3', hex: '#111827', label: 'Dark Surface' },
    { id: '4', hex: '#F8FAFC', label: 'Light Ground' },
    { id: '5', hex: '#10B981', label: 'Success Feedback' }
  ]);
  const [activePickerIdx, setActivePickerIdx] = useState(0);

  const handleAddColor = () => {
    if (colors.length >= 10) {
      showToast('Maximum 10 colors allowed in studio palette', 'info');
      return;
    }
    const newColor = { id: Date.now().toString(), hex: '#FFB6D2', label: `Color ${colors.length + 1}` };
    setColors(prev => [...prev, newColor]);
    setActivePickerIdx(colors.length);
  };

  const handleRemoveColor = (id) => {
    if (colors.length <= 2) {
      showToast('Palette requires at least 2 colors', 'error');
      return;
    }
    setColors(prev => prev.filter(c => c.id !== id));
    setActivePickerIdx(0);
  };

  const handleUpdateHex = (newHex) => {
    setColors(prev => prev.map((c, i) => i === activePickerIdx ? { ...c, hex: newHex.toUpperCase() } : c));
  };

  const handleUpdateLabel = (idx, newLabel) => {
    setColors(prev => prev.map((c, i) => i === idx ? { ...c, label: newLabel } : c));
  };

  const handleSave = () => {
    saveCustomPalette(paletteTitle, colors.map(c => c.hex));
  };

  const handleExport = (format) => {
    const rawColors = colors.map(c => c.hex);
    if (format === 'json') {
      triggerFileDownload(exportPaletteJson(paletteTitle, rawColors), `${paletteTitle}.json`, 'application/json');
    } else if (format === 'css') {
      triggerFileDownload(exportPaletteCssVariables(paletteTitle, rawColors), `${paletteTitle}.css`, 'text/css');
    } else if (format === 'svg') {
      triggerFileDownload(exportPaletteSvg(paletteTitle, rawColors), `${paletteTitle}.svg`, 'image/svg+xml');
    } else if (format === 'png') {
      exportPalettePng(paletteTitle, rawColors);
    } else if (format === 'txt') {
      triggerFileDownload(exportPaletteTxt(paletteTitle, rawColors), `${paletteTitle}.txt`, 'text/plain');
    }
    showToast(`Exported ${paletteTitle} as ${format.toUpperCase()}`, 'success');
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', padding: '36px 16px 28px 16px', maxWidth: 840, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>
          Custom Palette Studio
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Build, refine, label, and test brand color schemes with live website component mockups and multi-format exports.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
          gap: 28,
          alignItems: 'start'
        }}
        className="studio-grid"
      >
        {/* Left: Palette Editor */}
        <div className="chroma-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Metadata */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              Palette Title
            </label>
            <input
              type="text"
              value={paletteTitle}
              onChange={e => setPaletteTitle(e.target.value)}
              className="input-text"
              style={{ fontWeight: 600, fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              Description & Usage
            </label>
            <input
              type="text"
              value={paletteDesc}
              onChange={e => setPaletteDesc(e.target.value)}
              className="input-text"
            />
          </div>

          {/* Color Items List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Palette Colors ({colors.length}/10)</label>
              <button
                onClick={handleAddColor}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent-blue)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={15} />
                <span>Add Color</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {colors.map((colorItem, idx) => (
                <div
                  key={colorItem.id}
                  onClick={() => setActivePickerIdx(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 10,
                    borderRadius: 12,
                    border: '1.5px solid',
                    borderColor: activePickerIdx === idx ? 'var(--color-accent-blue)' : 'var(--border-color)',
                    background: activePickerIdx === idx ? 'rgba(37, 150, 190, 0.04)' : 'var(--bg-card-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: colorItem.hex,
                      border: '1px solid var(--border-color)',
                      flexShrink: 0
                    }}
                  />
                  <input
                    type="text"
                    value={colorItem.label}
                    onChange={e => handleUpdateLabel(idx, e.target.value)}
                    className="input-text"
                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.85rem' }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700 }}>
                    {colorItem.hex}
                  </span>
                  {colors.length > 2 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveColor(colorItem.id);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Color Picker */}
          {colors[activePickerIdx] && (
            <div style={{ background: 'var(--bg-card-subtle)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 10 }}>
                Adjusting {colors[activePickerIdx].label} ({colors[activePickerIdx].hex})
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <HexColorPicker
                  color={colors[activePickerIdx].hex}
                  onChange={handleUpdateHex}
                  style={{ width: '100%', height: 160 }}
                />
              </div>
            </div>
          )}

          {/* Save & Export Actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handleSave} className="btn-primary" style={{ flex: 1 }}>
              <Save size={16} />
              <span>Save to Library</span>
            </button>
            <button onClick={() => handleExport('svg')} className="btn-secondary">
              <Download size={16} />
              <span>SVG</span>
            </button>
            <button onClick={() => handleExport('png')} className="btn-secondary">
              <Download size={16} />
              <span>PNG</span>
            </button>
            <button onClick={() => handleExport('css')} className="btn-secondary">
              <Download size={16} />
              <span>CSS</span>
            </button>
          </div>
        </div>

        {/* Right: Live Website Component Mockup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="chroma-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 6 }}>
              Live Website Mockup Preview
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Testing palette synergy in simulated application UI components.
            </p>

            {/* Mockup Frame */}
            <div
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)',
                backgroundColor: colors[3] ? colors[3].hex : '#FFFFFF'
              }}
            >
              {/* Mockup Header */}
              <div
                style={{
                  backgroundColor: colors[0] ? colors[0].hex : '#2596BE',
                  color: getReadableTextColor(colors[0]?.hex || '#2596BE'),
                  padding: '14px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{paletteTitle}</span>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', fontWeight: 600 }}>
                  <span>Products</span>
                  <span>Solutions</span>
                  <span>Pricing</span>
                </div>
              </div>

              {/* Mockup Hero Banner */}
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: colors[2]?.hex || '#111827', marginBottom: 8 }}>
                  Designed with Intent & Harmony
                </h3>
                <p style={{ fontSize: '0.88rem', color: colors[2]?.hex || '#4B5563', opacity: 0.85, maxWidth: 360, margin: '0 auto 20px auto' }}>
                  {paletteDesc}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                  <button
                    style={{
                      backgroundColor: colors[0]?.hex || '#2596BE',
                      color: getReadableTextColor(colors[0]?.hex || '#2596BE'),
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}
                  >
                    Get Started Free
                  </button>
                  <button
                    style={{
                      backgroundColor: 'transparent',
                      color: colors[0]?.hex || '#2596BE',
                      border: `1.5px solid ${colors[0]?.hex || '#2596BE'}`,
                      padding: '10px 18px',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}
                  >
                    Documentation
                  </button>
                </div>
              </div>

              {/* Mockup Feature Badge */}
              <div
                style={{
                  backgroundColor: colors[1]?.hex || '#67BDD4',
                  color: getReadableTextColor(colors[1]?.hex || '#67BDD4'),
                  padding: '12px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <span>Live Status: High Contrast Compliance Verified</span>
                <span>v1.0.0</span>
              </div>
            </div>
          </div>

          {/* Saved Palettes Local Library */}
          <div className="chroma-card" style={{ padding: 24 }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
              Saved Library ({savedPalettes.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {savedPalettes.map(p => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.name}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                      {p.colors.map((c, i) => (
                        <div key={i} style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: c }} />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteCustomPalette(p.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
