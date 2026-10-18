import React from 'react';
import { Sliders, RefreshCw, Sparkles, Sun, Moon, Flame, Snowflake, Palette } from 'lucide-react';
import { usePalette } from '../../context/PaletteContext';

export default function ExtractionSettings({ isExpanded, onToggle }) {
  const {
    extractionOptions,
    setExtractionOptions,
    triggerExtractionWithCurrent,
    isExtracting
  } = usePalette();

  const handleChange = (key, value) => {
    setExtractionOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    triggerExtractionWithCurrent();
  };

  const toneFilters = [
    { id: 'all', label: 'All Colors', icon: Palette, color: 'var(--text-secondary)' },
    { id: 'vibrant', label: 'Vibrant', icon: Sparkles, color: '#F59E0B' },
    { id: 'dark', label: 'Dark', icon: Moon, color: '#6366F1' },
    { id: 'light', label: 'Light', icon: Sun, color: '#EAB308' },
    { id: 'warm', label: 'Warm', icon: Flame, color: '#EF4444' },
    { id: 'cool', label: 'Cool', icon: Snowflake, color: '#06B6D4' }
  ];

  const generationModes = [
    { id: 'dominant', label: 'Dominant (MMCQ)', desc: 'Standard frequency & spatial balance' },
    { id: 'vivid', label: 'Vivid Saturation', desc: 'Prioritize punchy, saturated pigments' },
    { id: 'pastel', label: 'Soft Pastel', desc: 'Prioritize airy, gentle tones' },
    { id: 'balanced', label: 'Dynamic Contrast', desc: 'Wide spread across luminance spectrum' }
  ];

  return (
    <div
      style={{
        borderTop: '1px solid var(--border-color)',
        padding: '16px 24px',
        background: 'var(--bg-card-subtle)',
        borderBottomLeftRadius: 'var(--radius-xl)',
        borderBottomRightRadius: 'var(--radius-xl)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isExpanded ? 18 : 0 }}>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          <Sliders size={16} color="var(--color-accent-blue)" />
          <span>Advanced Extraction Controls & Filters</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ({isExpanded ? 'Hide' : 'Show'})
          </span>
        </button>

        <button
          onClick={handleApply}
          disabled={isExtracting}
          className="btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
        >
          <RefreshCw size={13} className={isExtracting ? 'spin-anim' : ''} />
          <span>{isExtracting ? 'Analyzing...' : 'Re-extract Palette'}</span>
        </button>
      </div>

      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 4 }}>
          {/* Tone & Mood Filter Strip */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 8, color: 'var(--text-primary)' }}>
              Color Tone & Mood Filter
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {toneFilters.map(filter => {
                const Icon = filter.icon;
                const isActive = (extractionOptions.toneFilter || 'all') === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => handleChange('toneFilter', filter.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      borderRadius: 20,
                      border: '1px solid',
                      borderColor: isActive ? 'var(--color-accent-blue)' : 'var(--border-color)',
                      background: isActive ? 'rgba(37, 150, 190, 0.12)' : 'var(--bg-card)',
                      color: isActive ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={14} color={isActive ? 'var(--color-accent-blue)' : filter.color} />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid of Sliders and Selectors */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: 20
            }}
          >
            {/* Number of Colors to Extract */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Colors to Extract</label>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-accent-blue)' }}>
                  {extractionOptions.colorCount} swatches
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="16"
                value={extractionOptions.colorCount}
                onChange={e => handleChange('colorCount', parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--color-accent-blue)' }}
              />
            </div>

            {/* Minimum Color Difference (Delta-E) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Min Color Difference (ΔE)</label>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-accent-blue)' }}>
                  {extractionOptions.minDeltaE || 12} ΔE
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={extractionOptions.minDeltaE || 12}
                onChange={e => handleChange('minDeltaE', parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--color-accent-blue)' }}
              />
            </div>

            {/* Palette Generation Algorithm */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Generation Strategy
              </label>
              <select
                value={extractionOptions.generationMode || 'dominant'}
                onChange={e => handleChange('generationMode', e.target.value)}
                className="input-text"
                style={{ padding: '6px 10px', fontSize: '0.82rem', width: '100%' }}
              >
                {generationModes.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Sort Colors By
              </label>
              <select
                value={extractionOptions.sortBy || 'frequency'}
                onChange={e => handleChange('sortBy', e.target.value)}
                className="input-text"
                style={{ padding: '6px 10px', fontSize: '0.82rem', width: '100%' }}
              >
                <option value="frequency">Frequency (Dominance %)</option>
                <option value="hue">Hue Spectrum (Rainbow)</option>
                <option value="brightness">Brightness (Light to Dark)</option>
                <option value="saturation">Saturation (Vivid to Muted)</option>
              </select>
            </div>
          </div>

          {/* Toggles & Checkbox Filters */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 18,
              paddingTop: 8,
              borderTop: '1px dashed var(--border-color)'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer', fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={extractionOptions.uniqueColorsMode ?? true}
                onChange={e => {
                  handleChange('uniqueColorsMode', e.target.checked);
                  handleChange('excludeSimilar', e.target.checked);
                }}
                style={{ accentColor: 'var(--color-accent-blue)', width: 15, height: 15 }}
              />
              <span><strong>Unique Colors Mode</strong> (Enforce ΔE color distinctiveness)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={extractionOptions.ignoreTransparent ?? true}
                onChange={e => handleChange('ignoreTransparent', e.target.checked)}
                style={{ accentColor: 'var(--color-accent-blue)', width: 15, height: 15 }}
              />
              <span>Ignore transparent pixels</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={extractionOptions.ignoreNearWhite ?? false}
                onChange={e => handleChange('ignoreNearWhite', e.target.checked)}
                style={{ accentColor: 'var(--color-accent-blue)', width: 15, height: 15 }}
              />
              <span>Ignore near-white backgrounds</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={extractionOptions.ignoreNearBlack ?? false}
                onChange={e => handleChange('ignoreNearBlack', e.target.checked)}
                style={{ accentColor: 'var(--color-accent-blue)', width: 15, height: 15 }}
              />
              <span>Ignore near-black borders</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
