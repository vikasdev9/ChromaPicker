import React, { useState, useEffect, useRef } from 'react';
import { Eye, ShieldAlert, Sparkles, Image as ImageIcon, Palette as PaletteIcon } from 'lucide-react';
import { usePalette } from '../context/PaletteContext';
import { CVD_TYPES, simulateRgb, simulateImageCanvas } from '../utils/colorBlindness';
import { hexToRgb } from '../utils/colorMath';

export default function ColorBlindnessPage() {
  const { currentImage, extractedPalette } = usePalette();
  const [activeMode, setActiveMode] = useState('palette'); // 'palette' | 'image'
  const [selectedType, setSelectedType] = useState('protanopia');
  const [simulatedImages, setSimulatedImages] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Process image across CVD matrices when image mode is selected
  useEffect(() => {
    if (activeMode === 'image' && currentImage.src) {
      setIsProcessing(true);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Create downsampled canvas for fast processing
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const simulations = {};
        for (const type of CVD_TYPES) {
          simulations[type.id] = simulateImageCanvas(canvas, type.id);
        }
        setSimulatedImages(simulations);
        setIsProcessing(false);
      };
      img.src = currentImage.src;
    }
  }, [activeMode, currentImage.src]);

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', padding: '36px 16px 28px 16px', maxWidth: 840, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>
          Color Blindness Simulator
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Accurately simulate how people with different color vision deficiencies perceive your images and design palettes.
        </p>

        {/* Mode Switcher */}
        <div style={{ display: 'inline-flex', background: 'var(--bg-card)', padding: 4, borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', marginTop: 20 }}>
          <button
            onClick={() => setActiveMode('palette')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeMode === 'palette' ? 'var(--btn-primary-bg)' : 'transparent',
              color: activeMode === 'palette' ? 'var(--btn-primary-text)' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <PaletteIcon size={15} />
            <span>Palette Simulation</span>
          </button>
          <button
            onClick={() => setActiveMode('image')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeMode === 'image' ? 'var(--btn-primary-bg)' : 'transparent',
              color: activeMode === 'image' ? 'var(--btn-primary-text)' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <ImageIcon size={15} />
            <span>Image Simulation</span>
          </button>
        </div>
      </div>

      {/* Medical Disclaimer Banner */}
      <div
        style={{
          background: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 28,
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}
      >
        <ShieldAlert size={18} color="var(--color-accent-blue)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Scientific Simulation Disclaimer:</strong> Results are based on Brettel & Machado mathematical color-perception algorithms. They serve as design simulation aids and are not intended for medical diagnosis or clinical assessment.
        </span>
      </div>

      {/* Mode 1: Palette Simulation Grid */}
      {activeMode === 'palette' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
          {CVD_TYPES.map(type => (
            <div key={type.id} className="chroma-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{type.name}</h3>
                <span style={{ fontSize: '0.72rem', background: 'var(--bg-card-subtle)', padding: '2px 8px', borderRadius: 10, color: 'var(--text-muted)' }}>
                  {type.prevalence}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 14, minHeight: 32 }}>
                {type.description}
              </p>

              {/* Swatches comparison */}
              <div style={{ display: 'flex', gap: 6 }}>
                {extractedPalette.slice(0, 7).map((color, idx) => {
                  const rgb = hexToRgb(color.hex);
                  const sim = simulateRgb(rgb.r, rgb.g, rgb.b, type.id);

                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: 64,
                        borderRadius: 8,
                        backgroundColor: sim.hex,
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: 4
                      }}
                      title={`${color.hex} -> ${sim.hex}`}
                    >
                      <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#FFFFFF', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        {sim.hex}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mode 2: Full Image Simulation Grid */}
      {activeMode === 'image' && (
        <div>
          {isProcessing ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Sparkles size={32} className="spin-anim" color="var(--color-accent-blue)" />
              <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: 12 }}>
                Calculating CVD color matrix transformations...
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24 }}>
              {CVD_TYPES.map(type => (
                <div key={type.id} className="chroma-card" style={{ padding: 18, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{type.name}</h3>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{type.prevalence}</span>
                  </div>

                  {simulatedImages[type.id] ? (
                    <img
                      src={simulatedImages[type.id]}
                      alt={`${type.name} simulation`}
                      style={{
                        width: '100%',
                        height: 220,
                        objectFit: 'cover',
                        borderRadius: 10,
                        border: '1px solid var(--border-color)'
                      }}
                    />
                  ) : (
                    <div style={{ height: 220, background: 'var(--bg-card-subtle)', borderRadius: 10 }} />
                  )}

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                    {type.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
