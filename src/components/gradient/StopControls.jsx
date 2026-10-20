import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Plus, Trash2, Copy, Sliders, Check, Eye } from 'lucide-react';
import { isValidHex, normalizeHex } from '../../utils/colorMath';

export default function StopControls({
  stops,
  activeStopIndex,
  onSelectStop,
  onAddStop,
  onDuplicateStop,
  onRemoveStop,
  onUpdateColor,
  onUpdatePos,
  onUpdateOpacity
}) {
  const activeStop = stops[activeStopIndex] || stops[0];

  // Local state for editable HEX input to allow comfortable typing without losing focus
  const [hexInput, setHexInput] = useState(activeStop ? activeStop.color : '#2596BE');
  const [hexError, setHexError] = useState(false);

  useEffect(() => {
    if (activeStop) {
      setHexInput(activeStop.color);
      setHexError(false);
    }
  }, [activeStop]);

  const handleHexChange = (e) => {
    const val = e.target.value;
    setHexInput(val);

    if (isValidHex(val)) {
      setHexError(false);
      onUpdateColor('#' + normalizeHex(val, true));
    } else {
      setHexError(true);
    }
  };

  const handleHexBlur = () => {
    if (isValidHex(hexInput)) {
      const formatted = '#' + normalizeHex(hexInput, true);
      setHexInput(formatted);
      onUpdateColor(formatted);
      setHexError(false);
    } else {
      // Revert to valid active color
      setHexInput(activeStop.color);
      setHexError(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stops Summary Row */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Color Stops</span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-input)',
                color: 'var(--text-muted)',
                fontWeight: 600
              }}
            >
              {stops.length} stops
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={onDuplicateStop}
              className="btn-subtle"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent-blue)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Duplicate current selected stop"
            >
              <Copy size={13} />
              <span>Duplicate</span>
            </button>

            <button
              type="button"
              onClick={onAddStop}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent-blue)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Add a new color stop"
            >
              <Plus size={14} />
              <span>Add Stop</span>
            </button>
          </div>
        </div>

        {/* Horizontal Chips List of Stops */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {stops.map((stop, idx) => {
            const isSelected = activeStopIndex === idx;
            const opacity = typeof stop.opacity === 'number' ? stop.opacity : 100;

            return (
              <div
                key={stop.id || idx}
                onClick={() => onSelectStop(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '1.5px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card-subtle)',
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)'
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: stop.color,
                    opacity: opacity / 100,
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
                    flexShrink: 0
                  }}
                />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {stop.pos}%
                </span>

                {stops.length > 2 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveStop(idx);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    aria-label={`Remove color stop ${idx + 1}`}
                    title="Remove this stop"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Stop Fine-Tuning Panel */}
      {activeStop && (
        <div
          style={{
            background: 'var(--bg-card-subtle)',
            padding: 16,
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14
          }}
        >
          {/* Header with Stop index & HEX input */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>
              Stop #{activeStopIndex + 1} Settings
            </span>

            {/* Editable HEX input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  backgroundColor: activeStop.color,
                  opacity: (activeStop.opacity !== undefined ? activeStop.opacity : 100) / 100,
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)'
                }}
              />
              <input
                type="text"
                value={hexInput}
                onChange={handleHexChange}
                onBlur={handleHexBlur}
                aria-label={`Hex color code for stop ${activeStopIndex + 1}`}
                className="input-text"
                style={{
                  width: 90,
                  padding: '4px 8px',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  borderColor: hexError ? 'var(--badge-error-text)' : undefined,
                  background: hexError ? 'rgba(239, 68, 68, 0.08)' : undefined
                }}
              />
            </div>
          </div>

          {/* Color Picker */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <HexColorPicker
              color={activeStop.color}
              onChange={(newColor) => onUpdateColor(newColor.toUpperCase())}
              style={{ width: '100%', height: 140 }}
            />
          </div>

          {/* Dual Sliders with Numeric Inputs: Position and Opacity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Position Slider & Numeric Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label htmlFor="stop-pos-input" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Position</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    id="stop-pos-input"
                    type="number"
                    min="0"
                    max="100"
                    value={activeStop.pos}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) onUpdatePos(Math.min(100, Math.max(0, val)));
                    }}
                    className="input-text"
                    style={{ width: 50, padding: '2px 4px', fontSize: '0.76rem', fontFamily: 'var(--font-mono)', textAlign: 'right' }}
                  />
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeStop.pos}
                onChange={e => onUpdatePos(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
                aria-label="Color stop position percentage slider"
              />
            </div>

            {/* Opacity Slider & Numeric Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label htmlFor="stop-opacity-input" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Opacity</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    id="stop-opacity-input"
                    type="number"
                    min="0"
                    max="100"
                    value={activeStop.opacity !== undefined ? activeStop.opacity : 100}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) onUpdateOpacity(Math.min(100, Math.max(0, val)));
                    }}
                    className="input-text"
                    style={{ width: 50, padding: '2px 4px', fontSize: '0.76rem', fontFamily: 'var(--font-mono)', textAlign: 'right' }}
                  />
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeStop.opacity !== undefined ? activeStop.opacity : 100}
                onChange={e => onUpdateOpacity(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
                aria-label="Color stop opacity percentage slider"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
