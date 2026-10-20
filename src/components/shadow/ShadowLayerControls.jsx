import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { isValidHex, normalizeHex } from '../../utils/colorMath';

export default function ShadowLayerControls({
  layer,
  layerIndex,
  mode,
  onUpdateLayer
}) {
  const isBox = mode === 'box-shadow';

  // Local state for editable HEX input
  const [hexInput, setHexInput] = useState(layer ? layer.color : '#000000');
  const [hexError, setHexError] = useState(false);

  useEffect(() => {
    if (layer) {
      setHexInput(layer.color);
      setHexError(false);
    }
  }, [layer]);

  if (!layer) return null;

  const handleHexChange = (e) => {
    const val = e.target.value;
    setHexInput(val);
    if (isValidHex(val)) {
      setHexError(false);
      onUpdateLayer(layerIndex, { color: '#' + normalizeHex(val, true) });
    } else {
      setHexError(true);
    }
  };

  const handleHexBlur = () => {
    if (isValidHex(hexInput)) {
      const formatted = '#' + normalizeHex(hexInput, true);
      setHexInput(formatted);
      onUpdateLayer(layerIndex, { color: formatted });
      setHexError(false);
    } else {
      setHexInput(layer.color);
      setHexError(false);
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-card-subtle)',
        padding: '20px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      {/* Header: Layer Index & Color Preview / Hex */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.86rem', fontWeight: 800 }}>
          Layer #{layerIndex + 1} Properties
        </span>

        {/* Color and HEX input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              backgroundColor: layer.color,
              opacity: (layer.opacity !== undefined ? layer.opacity : 100) / 100,
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)'
            }}
          />
          <input
            type="text"
            value={hexInput}
            onChange={handleHexChange}
            onBlur={handleHexBlur}
            aria-label={`Hex color for layer ${layerIndex + 1}`}
            className="input-text"
            style={{
              width: 90,
              padding: '4px 8px',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              borderColor: hexError ? 'var(--badge-error-text)' : undefined,
              background: hexError ? 'rgba(239, 68, 68, 0.08)' : undefined
            }}
          />
        </div>
      </div>

      {/* HexColorPicker */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <HexColorPicker
          color={layer.color}
          onChange={(newColor) => onUpdateLayer(layerIndex, { color: newColor.toUpperCase() })}
          style={{ width: '100%', height: 130 }}
        />
      </div>

      {/* Sliders Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Horizontal Offset (X) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <label htmlFor={`offset-x-${layerIndex}`} style={{ fontSize: '0.76rem', fontWeight: 700 }}>
              Offset X
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                id={`offset-x-${layerIndex}`}
                type="number"
                min="-100"
                max="100"
                value={layer.x}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) onUpdateLayer(layerIndex, { x: val });
                }}
                className="input-text"
                style={{ width: 50, padding: '2px 4px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', textAlign: 'right' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>px</span>
            </div>
          </div>
          <input
            type="range"
            min="-60"
            max="60"
            value={layer.x}
            onChange={e => onUpdateLayer(layerIndex, { x: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
            aria-label="Horizontal offset X slider"
          />
        </div>

        {/* Vertical Offset (Y) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <label htmlFor={`offset-y-${layerIndex}`} style={{ fontSize: '0.76rem', fontWeight: 700 }}>
              Offset Y
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                id={`offset-y-${layerIndex}`}
                type="number"
                min="-100"
                max="100"
                value={layer.y}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) onUpdateLayer(layerIndex, { y: val });
                }}
                className="input-text"
                style={{ width: 50, padding: '2px 4px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', textAlign: 'right' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>px</span>
            </div>
          </div>
          <input
            type="range"
            min="-60"
            max="60"
            value={layer.y}
            onChange={e => onUpdateLayer(layerIndex, { y: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
            aria-label="Vertical offset Y slider"
          />
        </div>

        {/* Blur Radius */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <label htmlFor={`blur-${layerIndex}`} style={{ fontSize: '0.76rem', fontWeight: 700 }}>
              Blur Radius
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                id={`blur-${layerIndex}`}
                type="number"
                min="0"
                max="100"
                value={layer.blur}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) onUpdateLayer(layerIndex, { blur: Math.max(0, val) });
                }}
                className="input-text"
                style={{ width: 50, padding: '2px 4px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', textAlign: 'right' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>px</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={layer.blur}
            onChange={e => onUpdateLayer(layerIndex, { blur: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
            aria-label="Blur radius slider"
          />
        </div>

        {/* Opacity */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <label htmlFor={`opacity-${layerIndex}`} style={{ fontSize: '0.76rem', fontWeight: 700 }}>
              Opacity
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                id={`opacity-${layerIndex}`}
                type="number"
                min="0"
                max="100"
                value={layer.opacity !== undefined ? layer.opacity : 100}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) onUpdateLayer(layerIndex, { opacity: Math.min(100, Math.max(0, val)) });
                }}
                className="input-text"
                style={{ width: 50, padding: '2px 4px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', textAlign: 'right' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>%</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={layer.opacity !== undefined ? layer.opacity : 100}
            onChange={e => onUpdateLayer(layerIndex, { opacity: parseInt(e.target.value, 10) })}
            style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
            aria-label="Shadow opacity percentage slider"
          />
        </div>

        {/* Spread Radius: ONLY for box-shadow (HIDDEN in text-shadow) */}
        {isBox && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label htmlFor={`spread-${layerIndex}`} style={{ fontSize: '0.76rem', fontWeight: 700 }}>
                Spread Radius
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <input
                  id={`spread-${layerIndex}`}
                  type="number"
                  min="-50"
                  max="50"
                  value={layer.spread || 0}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) onUpdateLayer(layerIndex, { spread: val });
                  }}
                  className="input-text"
                  style={{ width: 50, padding: '2px 4px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', textAlign: 'right' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>px</span>
              </div>
            </div>
            <input
              type="range"
              min="-30"
              max="50"
              value={layer.spread || 0}
              onChange={e => onUpdateLayer(layerIndex, { spread: parseInt(e.target.value, 10) })}
              style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
              aria-label="Spread radius slider"
            />
          </div>
        )}

        {/* Inset Toggle: ONLY for box-shadow (HIDDEN in text-shadow) */}
        {isBox && (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, marginBottom: 6 }}>
              Shadow Direction
            </span>
            <button
              type="button"
              onClick={() => onUpdateLayer(layerIndex, { inset: !layer.inset })}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: layer.inset ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                background: layer.inset ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-input)',
                color: layer.inset ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <span>{layer.inset ? 'Inset (Inner Shadow)' : 'Outset (Drop Shadow)'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
