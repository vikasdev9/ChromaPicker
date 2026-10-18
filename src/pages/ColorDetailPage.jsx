import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HexColorPicker } from 'react-colorful';
import {
  Pipette,
  Copy,
  Check,
  Heart,
  Share2,
  Sliders,
  CheckCircle2,
  Layers,
  Sparkles,
  Info,
  Lock,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  normalizeHex,
  isValidHex,
  getColorSummary,
  generateHarmonies,
  generateVariations,
  getContrastRatio,
  getWcagRating,
  getReadableTextColor
} from '../utils/colorMath';
import { findNearestColorName } from '../data/colorNames';
import { simulateRgb, CVD_TYPES } from '../utils/colorBlindness';
import { useToast } from '../context/ToastContext';
import { usePalette } from '../context/PaletteContext';

export default function ColorDetailPage() {
  const { hex: routeHex } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { favorites, toggleFavorite, addRecentColor } = usePalette();

  const initialHex = routeHex && isValidHex(routeHex) ? '#' + normalizeHex(routeHex) : '#2596BE';
  const [currentColor, setCurrentColor] = useState(initialHex);
  const [activeTab, setActiveTab] = useState('conversion');
  const [copiedKey, setCopiedKey] = useState(null);

  // Update color when URL changes
  useEffect(() => {
    if (routeHex && isValidHex(routeHex)) {
      const formatted = '#' + normalizeHex(routeHex).toUpperCase();
      setCurrentColor(formatted);
      addRecentColor(formatted);
    }
  }, [routeHex, addRecentColor]);

  // Color summary and calculations
  const colorData = getColorSummary(currentColor);
  const colorInfo = findNearestColorName(currentColor);
  const harmonies = generateHarmonies(currentColor);
  const variations = generateVariations(currentColor, 8);
  const isFav = favorites.includes(currentColor);

  // Eyedropper API (Chromium native)
  const handlePickFromScreen = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          const hex = result.sRGBHex.toUpperCase();
          setCurrentColor(hex);
          navigate(`/color/${hex.replace('#', '').toLowerCase()}`);
          showToast(`Sampled ${hex} from screen!`, 'success');
        }
      } catch {
        // User cancelled picker
      }
    } else {
      showToast('Screen EyeDropper is supported in Chromium browsers (Chrome, Edge).', 'info');
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${key}: ${text}`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleColorChange = (newHex) => {
    const formatted = newHex.toUpperCase();
    setCurrentColor(formatted);
    // Replace URL without reloading
    window.history.replaceState(null, '', `/color/${formatted.replace('#', '').toLowerCase()}`);
  };

  const blackContrast = getContrastRatio(currentColor, '#000000');
  const whiteContrast = getContrastRatio(currentColor, '#FFFFFF');

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Top Hero Section matching Screenshot 4 */}
      <div style={{ textAlign: 'center', padding: '40px 16px 32px 16px', maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>
          {currentColor} {colorInfo.name}
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Generate color codes, variations, harmonies, and check contrast ratios.
        </p>
      </div>

      {/* Main Workspace Layout matching Screenshot 4 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 24,
          alignItems: 'start'
        }}
        className="color-detail-grid"
      >
        {/* Left Navigation Sidebar matching Screenshot 4 */}
        <div
          className="chroma-card"
          style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          {[
            { id: 'about', label: 'About this color', icon: <Info size={16} /> },
            { id: 'conversion', label: 'Color Conversion', icon: <RefreshCw size={16} /> },
            { id: 'variations', label: 'Variations', icon: <Sliders size={16} /> },
            { id: 'harmonies', label: 'Color Combinations', icon: <Layers size={16} /> },
            { id: 'contrast', label: 'Contrast Checker', icon: <CheckCircle2 size={16} /> },
            { id: 'blindness', label: 'Blindness Simulator', icon: <Sparkles size={16} /> },
            { id: 'preview', label: 'UI Mockup Preview', icon: <ExternalLink size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 16px',
                borderRadius: 12,
                border: 'none',
                background: activeTab === tab.id ? 'var(--bg-card-subtle)' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-accent-blue)' : 'var(--text-primary)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition-normal)'
              }}
            >
              <span style={{ color: activeTab === tab.id ? 'var(--color-accent-blue)' : 'var(--text-secondary)' }}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}

          {/* Pro Demo locked items matching Screenshot 4 */}
          <div style={{ margin: '8px 0', borderTop: '1px solid var(--border-color)', paddingTop: 8 }}>
            {[
              'Technical Formats',
              'Practical Formats',
              'Color Analysis',
              'Creative Aspects'
            ].map((lockedItem, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem'
                }}
              >
                <span>{lockedItem}</span>
                <Lock size={13} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area matching Screenshot 4 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main Card: Color Conversion Dashboard */}
          <div className="chroma-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 20 }}>
              Color Conversion
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '280px 1fr',
                gap: 28
              }}
              className="conversion-grid"
            >
              {/* Left Subcard: Interactive Color Picker */}
              <div
                style={{
                  background: 'var(--bg-card-subtle)',
                  padding: 16,
                  borderRadius: 18,
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14
                }}
              >
                {/* react-colorful HexColorPicker */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <HexColorPicker
                    color={currentColor}
                    onChange={handleColorChange}
                    style={{ width: '100%', height: 180, borderRadius: 12 }}
                  />
                </div>

                {/* Input box */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      value={currentColor}
                      onChange={e => {
                        const val = e.target.value;
                        if (isValidHex(val)) {
                          handleColorChange(val);
                        } else {
                          setCurrentColor(val);
                        }
                      }}
                      className="input-text"
                      style={{
                        padding: '8px 10px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: currentColor,
                      border: '1px solid var(--border-color)',
                      flexShrink: 0
                    }}
                  />
                </div>

                {/* Pick from screen button */}
                <button
                  onClick={handlePickFromScreen}
                  className="btn-primary"
                  style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
                >
                  <Pipette size={15} />
                  <span>Pick from screen</span>
                </button>
              </div>

              {/* Right Subcard: Huge Color Banner + Values Grid matching Screenshot 4 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Color Banner */}
                <div
                  style={{
                    height: 110,
                    borderRadius: 18,
                    backgroundColor: currentColor,
                    color: colorData.textColor,
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
                      {currentColor.toLowerCase()}
                    </h3>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: 2 }}>
                      {colorInfo.name}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => toggleFavorite(currentColor)}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.25)',
                        backdropFilter: 'blur(8px)',
                        border: 'none',
                        color: isFav ? '#EF4444' : colorData.textColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Add to favorites"
                    >
                      <Heart size={18} fill={isFav ? '#EF4444' : 'none'} />
                    </button>

                    <button
                      onClick={() => handleCopy(window.location.href, 'Link')}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.25)',
                        backdropFilter: 'blur(8px)',
                        border: 'none',
                        color: colorData.textColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Share color"
                    >
                      <Share2 size={17} />
                    </button>
                  </div>
                </div>

                {/* 2-Column Grid of 8 Formats matching Screenshot 4 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* HEX */}
                  <div className="code-value-box">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: 44 }}>HEX</span>
                    <span style={{ fontWeight: 600, flex: 1 }}>{colorData.hex.toLowerCase()}</span>
                    <button className="copy-icon-btn" onClick={() => handleCopy(colorData.hex, 'HEX')}>
                      {copiedKey === 'HEX' ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                    </button>
                  </div>

                  {/* HSL */}
                  <div className="code-value-box">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: 44 }}>HSL</span>
                    <span style={{ fontWeight: 600, flex: 1 }}>{colorData.hsl.h}, {colorData.hsl.s}, {colorData.hsl.l}</span>
                    <button className="copy-icon-btn" onClick={() => handleCopy(`${colorData.hsl.h}, ${colorData.hsl.s}, ${colorData.hsl.l}`, 'HSL')}>
                      {copiedKey === 'HSL' ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                    </button>
                  </div>

                  {/* RGB */}
                  <div className="code-value-box">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: 44 }}>RGB</span>
                    <span style={{ fontWeight: 600, flex: 1 }}>{colorData.rgb.r}, {colorData.rgb.g}, {colorData.rgb.b}</span>
                    <button className="copy-icon-btn" onClick={() => handleCopy(`${colorData.rgb.r}, ${colorData.rgb.g}, ${colorData.rgb.b}`, 'RGB')}>
                      {copiedKey === 'RGB' ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                    </button>
                  </div>

                  {/* XYZ */}
                  <div className="code-value-box">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: 44 }}>XYZ</span>
                    <span style={{ fontWeight: 600, flex: 1 }}>{colorData.xyz.x}, {colorData.xyz.y}, {colorData.xyz.z}</span>
                    <button className="copy-icon-btn" onClick={() => handleCopy(`${colorData.xyz.x}, ${colorData.xyz.y}, ${colorData.xyz.z}`, 'XYZ')}>
                      {copiedKey === 'XYZ' ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                    </button>
                  </div>

                  {/* CMYK */}
                  <div className="code-value-box">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: 44 }}>CMYK</span>
                    <span style={{ fontWeight: 600, flex: 1 }}>{colorData.cmyk.c}, {colorData.cmyk.m}, {colorData.cmyk.y}, {colorData.cmyk.k}</span>
                    <button className="copy-icon-btn" onClick={() => handleCopy(`${colorData.cmyk.c}, ${colorData.cmyk.m}, ${colorData.cmyk.y}, ${colorData.cmyk.k}`, 'CMYK')}>
                      {copiedKey === 'CMYK' ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                    </button>
                  </div>

                  {/* LUV */}
                  <div className="code-value-box">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: 44 }}>LUV</span>
                    <span style={{ fontWeight: 600, flex: 1 }}>{colorData.luv.l}, {colorData.luv.u}, {colorData.luv.v}</span>
                    <button className="copy-icon-btn" onClick={() => handleCopy(`${colorData.luv.l}, ${colorData.luv.u}, ${colorData.luv.v}`, 'LUV')}>
                      {copiedKey === 'LUV' ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                    </button>
                  </div>

                  {/* LAB */}
                  <div className="code-value-box">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: 44 }}>LAB</span>
                    <span style={{ fontWeight: 600, flex: 1 }}>{colorData.lab.l}, {colorData.lab.a}, {colorData.lab.b}</span>
                    <button className="copy-icon-btn" onClick={() => handleCopy(`${colorData.lab.l}, ${colorData.lab.a}, ${colorData.lab.b}`, 'LAB')}>
                      {copiedKey === 'LAB' ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                    </button>
                  </div>

                  {/* HWB */}
                  <div className="code-value-box">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: 44 }}>HWB</span>
                    <span style={{ fontWeight: 600, flex: 1 }}>{colorData.hwb.h}, {colorData.hwb.w}, {colorData.hwb.b}</span>
                    <button className="copy-icon-btn" onClick={() => handleCopy(`${colorData.hwb.h}, ${colorData.hwb.w}, ${colorData.hwb.b}`, 'HWB')}>
                      {copiedKey === 'HWB' ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  * Note: CMYK values are screen-oriented approximations and are not equivalent to a printer-specific ICC color profile.
                </div>
              </div>
            </div>
          </div>

          {/* Tab 1: About This Color */}
          {(activeTab === 'about' || activeTab === 'conversion') && (
            <div className="chroma-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 14 }}>
                About {colorInfo.name} ({currentColor})
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                {currentColor} is classified under the <strong>{colorInfo.category}</strong> family.
                It has a relative luminance of <strong>{colorData.luminance}</strong>, a saturation level of <strong>{colorData.hsl.s}%</strong>, and a perceived brightness of <strong>{colorData.hsl.l}%</strong>.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <div style={{ padding: 14, background: 'var(--bg-card-subtle)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Luminance</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4 }}>{colorData.luminance}</div>
                </div>
                <div style={{ padding: 14, background: 'var(--bg-card-subtle)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Suggested Text Color</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: colorData.textColor, border: '1px solid #ccc' }} />
                    {colorData.textColor === '#FFFFFF' ? 'White Text' : 'Dark Text'}
                  </div>
                </div>
                <div style={{ padding: 14, background: 'var(--bg-card-subtle)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Black Contrast</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4 }}>{blackContrast} : 1</div>
                </div>
                <div style={{ padding: 14, background: 'var(--bg-card-subtle)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>White Contrast</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4 }}>{whiteContrast} : 1</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Color Variations (Shades, Tints, Tones) */}
          {(activeTab === 'variations' || activeTab === 'conversion') && (
            <div className="chroma-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>
                Color Variations
              </h3>

              {/* Tints */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>
                  Tints (Lighter Shades)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: 8 }}>
                  {variations.tints.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => handleColorChange(item.hex)}
                      style={{
                        height: 64,
                        borderRadius: 10,
                        backgroundColor: item.hex,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: 6,
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      title={`Tint ${item.hex} (${item.label})`}
                    >
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: getReadableTextColor(item.hex) }}>
                        {item.hex}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shades */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>
                  Shades (Darker Tones)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: 8 }}>
                  {variations.shades.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => handleColorChange(item.hex)}
                      style={{
                        height: 64,
                        borderRadius: 10,
                        backgroundColor: item.hex,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: 6,
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      title={`Shade ${item.hex} (${item.label})`}
                    >
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: getReadableTextColor(item.hex) }}>
                        {item.hex}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Harmonies & Combinations */}
          {(activeTab === 'harmonies' || activeTab === 'conversion') && (
            <div className="chroma-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>
                Color Harmonies & Palettes
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Complementary */}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>
                    Complementary (180° opposite)
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {harmonies.complementary.map((hex, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleColorChange(hex)}
                        style={{
                          flex: 1,
                          height: 70,
                          borderRadius: 12,
                          backgroundColor: hex,
                          cursor: 'pointer',
                          padding: 10,
                          display: 'flex',
                          alignItems: 'flex-end',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getReadableTextColor(hex) }}>
                          {hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analogous */}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>
                    Analogous (Adjacent ±30°)
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {harmonies.analogous.map((hex, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleColorChange(hex)}
                        style={{
                          flex: 1,
                          height: 70,
                          borderRadius: 12,
                          backgroundColor: hex,
                          cursor: 'pointer',
                          padding: 10,
                          display: 'flex',
                          alignItems: 'flex-end',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getReadableTextColor(hex) }}>
                          {hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Triadic */}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>
                    Triadic (Equidistant 120°)
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {harmonies.triadic.map((hex, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleColorChange(hex)}
                        style={{
                          flex: 1,
                          height: 70,
                          borderRadius: 12,
                          backgroundColor: hex,
                          cursor: 'pointer',
                          padding: 10,
                          display: 'flex',
                          alignItems: 'flex-end',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getReadableTextColor(hex) }}>
                          {hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Live UI Mockup Preview */}
          {(activeTab === 'preview' || activeTab === 'conversion') && (
            <div className="chroma-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 14 }}>
                Live User Interface Mockup
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                See how {currentColor} performs in real-world application components.
              </p>

              <div
                style={{
                  background: 'var(--bg-card-subtle)',
                  borderRadius: 16,
                  padding: 24,
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20
                }}
              >
                {/* Simulated Navbar */}
                <div
                  style={{
                    background: currentColor,
                    color: colorData.textColor,
                    padding: '12px 20px',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Brand Application</span>
                  <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', fontWeight: 500 }}>
                    <span>Dashboard</span>
                    <span>Analytics</span>
                    <span>Settings</span>
                  </div>
                </div>

                {/* Simulated Action Card */}
                <div
                  style={{
                    background: 'var(--bg-card)',
                    padding: 20,
                    borderRadius: 12,
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 16
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Modern Feature Highlight</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      Utilizing {currentColor} for primary accents and high-priority interactive buttons.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      style={{
                        background: currentColor,
                        color: colorData.textColor,
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Primary Action
                    </button>
                    <button
                      style={{
                        background: 'transparent',
                        color: currentColor,
                        border: `1.5px solid ${currentColor}`,
                        padding: '10px 18px',
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Secondary
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Color Blindness Simulation Preview */}
          {(activeTab === 'blindness' || activeTab === 'conversion') && (
            <div className="chroma-card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  Color Blindness Simulation
                </h3>
                <Link to="/color-blindness-simulator" style={{ fontSize: '0.82rem', color: 'var(--color-accent-blue)', fontWeight: 600 }}>
                  Open Full Simulator →
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                {CVD_TYPES.slice(0, 6).map(type => {
                  const sim = simulateRgb(colorData.rgb.r, colorData.rgb.g, colorData.rgb.b, type.id);
                  return (
                    <div
                      key={type.id}
                      style={{
                        background: 'var(--bg-card-subtle)',
                        borderRadius: 12,
                        padding: 12,
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div
                        style={{
                          height: 48,
                          borderRadius: 8,
                          backgroundColor: sim.hex,
                          marginBottom: 8
                        }}
                      />
                      <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{type.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {sim.hex}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
