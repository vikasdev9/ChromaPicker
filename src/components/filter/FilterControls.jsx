import React from 'react';
import {
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
  Contrast,
  Droplet,
  Eye,
  Layers,
  Wand2
} from 'lucide-react';
import { FILTER_DEFINITIONS, DEFAULT_FILTER_STATE, clampFilterValue } from '../../utils/imageFilterUtils';
import { IMAGE_FILTER_PRESETS } from '../../data/imageFilterPresets';

export default function FilterControls({
  filterState,
  onChangeFilter,
  onResetFilter,
  onResetAll,
  onApplyPreset,
  activePresetId
}) {
  const isAllDefault = Object.keys(DEFAULT_FILTER_STATE).every(
    key => filterState[key] === DEFAULT_FILTER_STATE[key]
  );

  const handleSliderChange = (key, e) => {
    const val = parseFloat(e.target.value);
    onChangeFilter(key, clampFilterValue(key, val));
  };

  const handleNumberChange = (key, e) => {
    const raw = e.target.value;
    if (raw === '') {
      // Allow user to temporarily clear before typing, but pass default or 0
      onChangeFilter(key, 0);
      return;
    }
    const val = parseFloat(raw);
    onChangeFilter(key, clampFilterValue(key, val));
  };

  const renderFilterRow = (key, label, icon) => {
    const def = FILTER_DEFINITIONS[key];
    const currentVal = filterState[key] !== undefined ? filterState[key] : def.defaultVal;
    const isModified = currentVal !== def.defaultVal;

    return (
      <div
        key={key}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '10px 12px',
          background: isModified ? 'rgba(59, 130, 246, 0.04)' : 'transparent',
          border: isModified ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
          borderRadius: 'var(--radius-md)',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {icon && <span style={{ color: isModified ? 'var(--color-accent-blue)' : 'var(--text-muted)' }}>{icon}</span>}
            <label
              htmlFor={`filter-input-${key}`}
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: isModified ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              {label}
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Individual Reset */}
            <button
              type="button"
              onClick={() => onResetFilter(key)}
              disabled={!isModified}
              title={`Reset ${label} to ${def.defaultVal}${def.unit}`}
              style={{
                background: 'transparent',
                border: 'none',
                color: isModified ? 'var(--text-secondary)' : 'var(--text-muted)',
                cursor: isModified ? 'pointer' : 'default',
                opacity: isModified ? 0.85 : 0.2,
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <RotateCcw size={12} />
            </button>

            {/* Numeric Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                id={`filter-input-${key}`}
                type="number"
                min={def.min}
                max={def.max}
                value={currentVal}
                onChange={(e) => handleNumberChange(key, e)}
                className="input-text"
                style={{
                  width: 54,
                  padding: '2px 4px',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'right',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)'
                }}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', minWidth: 20 }}>
                {def.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Slider Input */}
        <input
          id={`filter-slider-${key}`}
          type="range"
          min={def.min}
          max={def.max}
          value={currentVal}
          onChange={(e) => handleSliderChange(key, e)}
          aria-label={`${label} slider`}
          style={{
            width: '100%',
            accentColor: 'var(--color-accent-blue)',
            cursor: 'pointer'
          }}
        />
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* PRESETS SECTION */}
      <div
        className="chroma-card"
        style={{
          background: 'var(--bg-card-subtle)',
          padding: 16,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="var(--color-accent-blue)" />
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>
              Filter Presets
            </h4>
          </div>

          <button
            type="button"
            onClick={onResetAll}
            disabled={isAllDefault}
            className="btn-subtle"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.74rem',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              opacity: isAllDefault ? 0.4 : 1,
              cursor: isAllDefault ? 'not-allowed' : 'pointer'
            }}
          >
            <RotateCcw size={12} />
            <span>Reset All</span>
          </button>
        </div>

        {/* Presets Horizontal / Grid List */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: 8,
            maxHeight: 220,
            overflowY: 'auto',
            paddingRight: 4
          }}
        >
          {IMAGE_FILTER_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onApplyPreset(preset)}
                style={{
                  background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-main)',
                  border: isSelected ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 4,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 800 : 700,
                      color: isSelected ? 'var(--color-accent-blue)' : 'var(--text-primary)'
                    }}
                  >
                    {preset.name}
                  </span>
                  {preset.badge && (
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '1px 4px',
                        borderRadius: 3,
                        background: isSelected ? 'var(--color-accent-blue)' : 'var(--bg-card)',
                        color: isSelected ? '#ffffff' : 'var(--text-muted)'
                      }}
                    >
                      {preset.badge}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.25,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {preset.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: Tonal & Exposure */}
      <div
        className="chroma-card"
        style={{
          background: 'var(--bg-card-subtle)',
          padding: 16,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <Sun size={15} color="var(--color-accent-blue)" />
          <h4 style={{ margin: 0, fontSize: '0.86rem', fontWeight: 800 }}>
            Tonal & Exposure
          </h4>
        </div>

        {renderFilterRow('brightness', 'Brightness', <Sun size={13} />)}
        {renderFilterRow('contrast', 'Contrast', <Contrast size={13} />)}
        {renderFilterRow('opacity', 'Opacity', <Eye size={13} />)}
      </div>

      {/* SECTION 2: Color & Vibrance */}
      <div
        className="chroma-card"
        style={{
          background: 'var(--bg-card-subtle)',
          padding: 16,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <Droplet size={15} color="var(--color-accent-blue)" />
          <h4 style={{ margin: 0, fontSize: '0.86rem', fontWeight: 800 }}>
            Color & Vibrance
          </h4>
        </div>

        {renderFilterRow('saturate', 'Saturation', <Droplet size={13} />)}
        {renderFilterRow('hueRotate', 'Hue Rotation', <Sliders size={13} />)}
      </div>

      {/* SECTION 3: Stylistic & Creative */}
      <div
        className="chroma-card"
        style={{
          background: 'var(--bg-card-subtle)',
          padding: 16,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <Wand2 size={15} color="var(--color-accent-blue)" />
          <h4 style={{ margin: 0, fontSize: '0.86rem', fontWeight: 800 }}>
            Stylistic & Creative
          </h4>
        </div>

        {renderFilterRow('blur', 'Blur', <Layers size={13} />)}
        {renderFilterRow('grayscale', 'Grayscale', <Contrast size={13} />)}
        {renderFilterRow('sepia', 'Sepia', <Sparkles size={13} />)}
        {renderFilterRow('invert', 'Invert', <Layers size={13} />)}
      </div>
    </div>
  );
}
