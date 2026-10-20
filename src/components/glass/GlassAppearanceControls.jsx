import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { isValidHex, normalizeHex } from '../../utils/colorMath';

export default function GlassAppearanceControls({
  state,
  onChangeState
}) {
  const [bgHexInput, setBgHexInput] = useState(state.bgColor);
  const [borderHexInput, setBorderHexInput] = useState(state.borderColor);
  const [shadowHexInput, setShadowHexInput] = useState(state.shadowColor);

  const [activePicker, setActivePicker] = useState(null); // 'bg' | 'border' | 'shadow' | null

  // Background HEX input handler
  const handleBgHexChange = (e) => {
    const val = e.target.value;
    setBgHexInput(val);
    if (isValidHex(val)) {
      onChangeState({ bgColor: '#' + normalizeHex(val, true) });
    }
  };

  // Border HEX input handler
  const handleBorderHexChange = (e) => {
    const val = e.target.value;
    setBorderHexInput(val);
    if (isValidHex(val)) {
      onChangeState({ borderColor: '#' + normalizeHex(val, true) });
    }
  };

  // Shadow HEX input handler
  const handleShadowHexChange = (e) => {
    const val = e.target.value;
    setShadowHexInput(val);
    if (isValidHex(val)) {
      onChangeState({ shadowColor: '#' + normalizeHex(val, true) });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      {/* SECTION 1: Background & Tint */}
      <div
        className="chroma-card"
        style={{
          background: 'var(--bg-card-subtle)',
          padding: 18,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>
            Background Tint & Transparency
          </h4>

          {/* Color swatch & Hex input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              onClick={() => setActivePicker(activePicker === 'bg' ? null : 'bg')}
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                backgroundColor: state.bgColor,
                border: '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
              title="Click to toggle color picker"
            />
            <input
              type="text"
              value={bgHexInput}
              onChange={handleBgHexChange}
              onBlur={() => setBgHexInput(state.bgColor)}
              aria-label="Background tint hex color"
              className="input-text"
              style={{ width: 85, padding: '4px 8px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
            />
          </div>
        </div>

        {activePicker === 'bg' && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
            <HexColorPicker
              color={state.bgColor}
              onChange={newCol => {
                const upper = newCol.toUpperCase();
                setBgHexInput(upper);
                onChangeState({ bgColor: upper });
              }}
              style={{ width: '100%', height: 130 }}
            />
          </div>
        )}

        {/* Opacity slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <label htmlFor="glass-bg-opacity" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
              Tint Opacity
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                id="glass-bg-opacity"
                type="number"
                min="0"
                max="100"
                value={state.bgOpacity}
                onChange={e => onChangeState({ bgOpacity: parseInt(e.target.value || '0', 10) })}
                className="input-text"
                style={{ width: 50, padding: '2px 4px', fontSize: '0.76rem', fontFamily: 'var(--font-mono)', textAlign: 'right' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>%</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={state.bgOpacity}
            onChange={e => onChangeState({ bgOpacity: parseInt(e.target.value, 10) })}
            aria-label="Background tint opacity slider"
            style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* SECTION 2: Backdrop Blur & Saturation */}
      <div
        className="chroma-card"
        style={{
          background: 'var(--bg-card-subtle)',
          padding: 18,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}
      >
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>
          Backdrop Filter (Diffusion)
        </h4>

        {/* Blur slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <label htmlFor="glass-blur" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
              Backdrop Blur
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                id="glass-blur"
                type="number"
                min="0"
                max="50"
                value={state.blur}
                onChange={e => onChangeState({ blur: parseInt(e.target.value || '0', 10) })}
                className="input-text"
                style={{ width: 50, padding: '2px 4px', fontSize: '0.76rem', fontFamily: 'var(--font-mono)', textAlign: 'right' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>px</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={state.blur}
            onChange={e => onChangeState({ blur: parseInt(e.target.value, 10) })}
            aria-label="Backdrop blur slider"
            style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
          />
        </div>

        {/* Saturation Toggle & Slider */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>
              Color Saturation Boost
            </span>
            <button
              type="button"
              onClick={() => onChangeState({ useSaturation: !state.useSaturation })}
              style={{
                padding: '3px 9px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: state.useSaturation ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                background: state.useSaturation ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-input)',
                color: state.useSaturation ? 'var(--color-accent-blue)' : 'var(--text-muted)'
              }}
            >
              {state.useSaturation ? 'Active' : 'Off'}
            </button>
          </div>

          {state.useSaturation && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label htmlFor="glass-saturation" style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  Saturation Level
                </label>
                <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>{state.saturation}%</span>
              </div>
              <input
                id="glass-saturation"
                type="range"
                min="100"
                max="250"
                value={state.saturation}
                onChange={e => onChangeState({ saturation: parseInt(e.target.value, 10) })}
                style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: Translucent Border */}
      <div
        className="chroma-card"
        style={{
          background: 'var(--bg-card-subtle)',
          padding: 18,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>
              Glass Border
            </h4>
            <button
              type="button"
              onClick={() => onChangeState({ borderEnabled: !state.borderEnabled })}
              style={{
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: state.borderEnabled ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                background: state.borderEnabled ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-input)',
                color: state.borderEnabled ? 'var(--color-accent-blue)' : 'var(--text-muted)'
              }}
            >
              {state.borderEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {state.borderEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={() => setActivePicker(activePicker === 'border' ? null : 'border')}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  backgroundColor: state.borderColor,
                  border: '1px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer'
                }}
                title="Toggle border color picker"
              />
              <input
                type="text"
                value={borderHexInput}
                onChange={handleBorderHexChange}
                onBlur={() => setBorderHexInput(state.borderColor)}
                aria-label="Border hex color"
                className="input-text"
                style={{ width: 85, padding: '3px 6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
              />
            </div>
          )}
        </div>

        {activePicker === 'border' && state.borderEnabled && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
            <HexColorPicker
              color={state.borderColor}
              onChange={newCol => {
                const upper = newCol.toUpperCase();
                setBorderHexInput(upper);
                onChangeState({ borderColor: upper });
              }}
              style={{ width: '100%', height: 130 }}
            />
          </div>
        )}

        {state.borderEnabled && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Border Width */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label htmlFor="glass-border-width" style={{ fontSize: '0.74rem', fontWeight: 700 }}>
                  Width
                </label>
                <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>{state.borderWidth}px</span>
              </div>
              <input
                id="glass-border-width"
                type="range"
                min="0"
                max="8"
                value={state.borderWidth}
                onChange={e => onChangeState({ borderWidth: parseInt(e.target.value, 10) })}
                style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
              />
            </div>

            {/* Border Opacity */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label htmlFor="glass-border-opacity" style={{ fontSize: '0.74rem', fontWeight: 700 }}>
                  Opacity
                </label>
                <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>{state.borderOpacity}%</span>
              </div>
              <input
                id="glass-border-opacity"
                type="range"
                min="0"
                max="100"
                value={state.borderOpacity}
                onChange={e => onChangeState({ borderOpacity: parseInt(e.target.value, 10) })}
                style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: Border Radius */}
      <div
        className="chroma-card"
        style={{
          background: 'var(--bg-card-subtle)',
          padding: 18,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label htmlFor="glass-radius" style={{ fontSize: '0.86rem', fontWeight: 800 }}>
            Border Radius
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              id="glass-radius"
              type="number"
              min="0"
              max="60"
              value={state.borderRadius}
              onChange={e => onChangeState({ borderRadius: parseInt(e.target.value || '0', 10) })}
              className="input-text"
              style={{ width: 50, padding: '2px 4px', fontSize: '0.76rem', fontFamily: 'var(--font-mono)', textAlign: 'right' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>px</span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="60"
          value={state.borderRadius}
          onChange={e => onChangeState({ borderRadius: parseInt(e.target.value, 10) })}
          aria-label="Border radius slider"
          style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
        />
      </div>

      {/* SECTION 5: Box Shadow */}
      <div
        className="chroma-card"
        style={{
          background: 'var(--bg-card-subtle)',
          padding: 18,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>
              Ambient Shadow
            </h4>
            <button
              type="button"
              onClick={() => onChangeState({ shadowEnabled: !state.shadowEnabled })}
              style={{
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: state.shadowEnabled ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                background: state.shadowEnabled ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-input)',
                color: state.shadowEnabled ? 'var(--color-accent-blue)' : 'var(--text-muted)'
              }}
            >
              {state.shadowEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {state.shadowEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={() => setActivePicker(activePicker === 'shadow' ? null : 'shadow')}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  backgroundColor: state.shadowColor,
                  border: '1px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer'
                }}
                title="Toggle shadow color picker"
              />
              <input
                type="text"
                value={shadowHexInput}
                onChange={handleShadowHexChange}
                onBlur={() => setShadowHexInput(state.shadowColor)}
                aria-label="Shadow hex color"
                className="input-text"
                style={{ width: 85, padding: '3px 6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
              />
            </div>
          )}
        </div>

        {activePicker === 'shadow' && state.shadowEnabled && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
            <HexColorPicker
              color={state.shadowColor}
              onChange={newCol => {
                const upper = newCol.toUpperCase();
                setShadowHexInput(upper);
                onChangeState({ shadowColor: upper });
              }}
              style={{ width: '100%', height: 130 }}
            />
          </div>
        )}

        {state.shadowEnabled && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Shadow Y */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label htmlFor="glass-shadow-y" style={{ fontSize: '0.74rem', fontWeight: 700 }}>
                  Y Offset
                </label>
                <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>{state.shadowY}px</span>
              </div>
              <input
                id="glass-shadow-y"
                type="range"
                min="-30"
                max="50"
                value={state.shadowY}
                onChange={e => onChangeState({ shadowY: parseInt(e.target.value, 10) })}
                style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
              />
            </div>

            {/* Shadow Blur */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label htmlFor="glass-shadow-blur" style={{ fontSize: '0.74rem', fontWeight: 700 }}>
                  Blur Radius
                </label>
                <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>{state.shadowBlur}px</span>
              </div>
              <input
                id="glass-shadow-blur"
                type="range"
                min="0"
                max="80"
                value={state.shadowBlur}
                onChange={e => onChangeState({ shadowBlur: parseInt(e.target.value, 10) })}
                style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
              />
            </div>

            {/* Shadow Opacity */}
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label htmlFor="glass-shadow-opacity" style={{ fontSize: '0.74rem', fontWeight: 700 }}>
                  Shadow Opacity
                </label>
                <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>{state.shadowOpacity}%</span>
              </div>
              <input
                id="glass-shadow-opacity"
                type="range"
                min="0"
                max="100"
                value={state.shadowOpacity}
                onChange={e => onChangeState({ shadowOpacity: parseInt(e.target.value, 10) })}
                style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
