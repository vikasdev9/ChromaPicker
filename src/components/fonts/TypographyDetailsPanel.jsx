import React, { useState, useEffect } from 'react';
import {
  Type,
  Sparkles,
  Copy,
  Check,
  FileJson,
  Layers,
  ArrowRight,
  ExternalLink,
  Info,
  AlertTriangle
} from 'lucide-react';
import { loadFontOnDemand } from '../../utils/fontLoader';
import { useToast } from '../../context/ToastContext';
import FontAnalysisExportModal from './FontAnalysisExportModal';

export default function TypographyDetailsPanel({
  selectedRegion,
  text,
  onTextChange,
  classification,
  colors,
  measurements,
  candidates = [],
  imageWidth,
  imageHeight,
  method,
  limitations,
  onApplyHeading,
  onApplyBody,
  onOpenInTester,
  onSearchInLibrary,
  onNavigateToPairing,
  targetSlot = null
}) {
  const { showToast } = useToast();
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(0);
  const [isComparing, setIsComparing] = useState(false);
  const [previewFontSize, setPreviewFontSize] = useState(26);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copiedHex, setCopiedHex] = useState(false);
  const [confirmedFont, setConfirmedFont] = useState(null);
  const [lastApplied, setLastApplied] = useState(null);

  const activeCandidate = candidates[selectedCandidateIndex] || candidates[0];

  // Preload top 3 candidates on demand so live preview renders cleanly
  useEffect(() => {
    candidates.slice(0, 3).forEach(c => {
      if (c && c.family) {
        loadFontOnDemand(c.family, [c.suggestedWeight || 400], c.suggestedStyle === 'italic');
      }
    });
  }, [candidates]);

  const handleCopyColor = (hex) => {
    if (!hex) return;
    navigator.clipboard.writeText(hex).then(() => {
      setCopiedHex(true);
      showToast(`Copied text color ${hex}`, 'success');
      setTimeout(() => setCopiedHex(false), 2000);
    }).catch(() => {
      showToast('Could not copy color', 'error');
    });
  };

  const handleConfirmCorrect = (candidate) => {
    setConfirmedFont(candidate.family);
    showToast(`Marked "${candidate.family}" as the identified font`, 'success');
  };

  const handleApplyHeadingClick = (candidateToUse = activeCandidate) => {
    if (!candidateToUse) return;
    onApplyHeading(candidateToUse, classification?.estimatedNumericWeight, classification?.style);
    setLastApplied({ slot: 'Heading', family: candidateToUse.family });
  };

  const handleApplyBodyClick = (candidateToUse = activeCandidate) => {
    if (!candidateToUse) return;
    onApplyBody(candidateToUse, classification?.estimatedNumericWeight, classification?.style);
    setLastApplied({ slot: 'Body', family: candidateToUse.family });
  };

  return (
    <div
      className="typography-details-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      {/* Workflow Feedback Alert: Shown when a font has been applied */}
      {lastApplied && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1.5px solid #22C55E',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#22C55E',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Check size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#16A34A' }}>
                Applied "{lastApplied.family}" to {lastApplied.slot} Font
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Your typography studio and specimen preview have been updated in the background.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onNavigateToPairing && (
              <button
                type="button"
                className="btn-primary"
                onClick={onNavigateToPairing}
                style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>View in Studio</span>
                <ArrowRight size={13} />
              </button>
            )}
            <button
              type="button"
              className="btn-subtle"
              onClick={() => setLastApplied(null)}
              style={{ fontSize: '0.74rem', padding: '4px 8px' }}
            >
              Keep Inspecting
            </button>
          </div>
        </div>
      )}

      {/* Panel Header & Region Meta */}
      <div
        className="chroma-card"
        style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                background: 'rgba(56, 189, 248, 0.14)',
                color: 'var(--color-accent-blue)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                fontWeight: 800
              }}
            >
              SELECTED REGION
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              {selectedRegion ? selectedRegion.id : 'Custom Crop'}
            </span>
            {selectedRegion?.confidence !== undefined && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: selectedRegion.confidence >= 80 ? 'rgba(34, 197, 94, 0.14)' : 'rgba(234, 179, 8, 0.14)',
                  color: selectedRegion.confidence >= 80 ? '#22C55E' : '#EAB308',
                  fontWeight: 600
                }}
              >
                {selectedRegion.confidence}% OCR confidence
              </span>
            )}
          </div>
          {selectedRegion?.bbox && (
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
              X: {selectedRegion.bbox.x0}px, Y: {selectedRegion.bbox.y0}px • {selectedRegion.bbox.width} × {selectedRegion.bbox.height}px
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => setIsExportOpen(true)}
          style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <FileJson size={14} />
          <span>Export Analysis</span>
        </button>
      </div>

      {/* Extracted Text Content Card (Editable) */}
      <div
        className="chroma-card"
        style={{
          padding: '16px 18px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label htmlFor="extracted-text-input" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            EXTRACTED TEXT SPECIMEN (EDITABLE)
          </label>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Edit if OCR had typos
          </span>
        </div>
        <textarea
          id="extracted-text-input"
          value={text}
          onChange={e => onTextChange(e.target.value)}
          rows={2}
          className="input-text"
          style={{ width: '100%', fontSize: '0.92rem', resize: 'vertical' }}
          placeholder="Extracted text from selected region..."
        />
      </div>

      {/* Font Classification Badges (Inferred) */}
      <div
        className="chroma-card"
        style={{
          padding: '16px 18px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            TYPOGRAPHY CLASSIFICATION (ESTIMATED)
          </div>
          <span
            style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-input)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)'
            }}
          >
            Inferred from stroke geometry
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
          <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-primary)' }}>
              {classification?.category || 'Sans-serif'}
            </div>
          </div>

          <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Est. Weight</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-primary)' }}>
              {classification?.weightCategory || 'Regular'} ({classification?.estimatedNumericWeight || 400})
            </div>
          </div>

          <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Style</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-primary)' }}>
              {classification?.style || 'Normal'}
            </div>
          </div>

          <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Casing</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-primary)' }}>
              {classification?.casing || 'Mixed'}
            </div>
          </div>
        </div>
      </div>

      {/* Color & Contrast Analysis (Measured) */}
      <div
        className="chroma-card"
        style={{
          padding: '16px 18px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>
          COLOR & CONTRAST ANALYSIS (MEASURED)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {/* Foreground Text Color */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: colors?.textColor?.hex || '#111827',
                border: '1px solid var(--border-color)',
                flexShrink: 0
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Text Color</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {colors?.textColor?.hex || '#111827'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopyColor(colors?.textColor?.hex || '#111827')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
              title="Copy text color hex"
            >
              {copiedHex ? <Check size={14} color="#22C55E" /> : <Copy size={14} />}
            </button>
          </div>

          {/* Background Color */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: colors?.backgroundColor?.hex || '#FFFFFF',
                border: '1px solid var(--border-color)',
                flexShrink: 0
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Background</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {colors?.backgroundColor?.hex || '#FFFFFF'}
              </div>
            </div>
          </div>
        </div>

        {/* Contrast Ratio Bar */}
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>WCAG Contrast:</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-accent-blue)', fontFamily: 'var(--font-mono)' }}>
              {colors?.contrastRatio || 16.4}:1
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                background: (colors?.contrastRatio || 16.4) >= 4.5 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: (colors?.contrastRatio || 16.4) >= 4.5 ? '#22C55E' : '#EF4444'
              }}
            >
              {(colors?.contrastRatio || 16.4) >= 4.5 ? 'AA Pass' : 'AA Fail'}
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                background: (colors?.contrastRatio || 16.4) >= 7.0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                color: (colors?.contrastRatio || 16.4) >= 7.0 ? '#22C55E' : '#EAB308'
              }}
            >
              {(colors?.contrastRatio || 16.4) >= 7.0 ? 'AAA Pass' : 'AAA Fail'}
            </span>
          </div>
        </div>

        {/* Separation Reliability Warning */}
        {colors && !colors.isReliable && (
          <div
            style={{
              marginTop: 10,
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              color: '#CA8A04',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            <span>{colors.reason || 'Text and background separation has lower confidence due to low contrast.'}</span>
          </div>
        )}
      </div>

      {/* Typography Measurements (Source Image Pixels) */}
      <div
        className="chroma-card"
        style={{
          padding: '16px 18px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            TYPOGRAPHY GEOMETRY (SOURCE IMAGE PIXELS)
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            Image px ≠ CSS px
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
          <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Approx Size</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-accent-blue)' }}>
              ~{measurements?.imagePxSize || 24}px
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>in image pixels</div>
          </div>

          <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Line Height</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {measurements?.lineHeightRatio || 1.25}×
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>relative ratio</div>
          </div>

          <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Letter Spacing</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {measurements?.letterSpacingPx || 0}px
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>tracking offset</div>
          </div>

          <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Alignment</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'capitalize', color: 'var(--text-primary)' }}>
              {measurements?.alignment || 'Left'}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>detected axis</div>
          </div>
        </div>

        <div style={{ marginTop: 10, fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Info size={13} style={{ flexShrink: 0 }} />
          <span>Note: Measurements reflect the bitmap image pixels. Screen pixel ratio, scaling, and browser zoom affect true original web CSS values.</span>
        </div>
      </div>

      {/* Identified Font Candidates & Comparison */}
      <div
        className="chroma-card"
        style={{
          padding: '18px 20px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1.5px solid var(--color-accent-blue)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="#A855F7" />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                Likely Font Family Candidates ({candidates.length})
              </h4>
            </div>
            <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
              Ranked by stroke run-lengths, geometry & catalog compatibility
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className={`btn-subtle ${isComparing ? 'active' : ''}`}
              onClick={() => setIsComparing(!isComparing)}
              style={{
                fontSize: '0.76rem',
                padding: '5px 10px',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: isComparing ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-input)',
                color: isComparing ? 'var(--color-accent-blue)' : 'var(--text-secondary)'
              }}
            >
              <Layers size={13} />
              <span>{isComparing ? 'Close Compare' : 'Compare Candidates'}</span>
            </button>
          </div>
        </div>

        {/* Candidate Cards Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {candidates.map((cand, idx) => {
            const isSelected = selectedCandidateIndex === idx;
            const isConfirmed = confirmedFont === cand.family;

            return (
              <div
                key={cand.family}
                onClick={() => setSelectedCandidateIndex(idx)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '1.5px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                  background: isSelected ? 'var(--bg-card-subtle)' : 'var(--bg-input)',
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {cand.family}
                      </span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: 'var(--bg-card)',
                          color: 'var(--text-muted)',
                          textTransform: 'capitalize'
                        }}
                      >
                        {cand.category}
                      </span>
                      {isConfirmed && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#22C55E', color: '#FFF', padding: '1px 6px', borderRadius: 4 }}>
                          Confirmed
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: cand.similarity >= 85 ? '#22C55E' : 'var(--color-accent-blue)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {cand.similarity}% est. match
                    </span>
                  </div>
                </div>

                {/* Candidate Rationale */}
                <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {cand.rationale}
                </p>

                {/* Candidate Live Specimen Preview */}
                <div
                  style={{
                    fontFamily: `'${cand.family}', ${cand.fallback || 'sans-serif'}`,
                    fontWeight: cand.suggestedWeight || 400,
                    fontStyle: cand.suggestedStyle || 'normal',
                    fontSize: '1.15rem',
                    color: colors?.textColor?.hex || 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    padding: '8px 10px',
                    borderRadius: 4,
                    background: colors?.backgroundColor?.hex || 'var(--bg-card)',
                    border: '1px solid var(--border-color)'
                  }}
                  title={text}
                >
                  {text || 'The quick brown fox jumps over the lazy dog'}
                </div>

                {/* Single Card Actions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyHeadingClick(cand);
                    }}
                    style={{
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      borderRadius: 4,
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: 'var(--color-accent-blue)'
                    }}
                  >
                    Apply as Heading
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyBodyClick(cand);
                    }}
                    style={{
                      background: 'rgba(168, 85, 247, 0.1)',
                      border: '1px solid rgba(168, 85, 247, 0.35)',
                      borderRadius: 4,
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: '#A855F7'
                    }}
                  >
                    Apply as Body
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirmCorrect(cand);
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-color)',
                      borderRadius: 4,
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      color: isConfirmed ? '#22C55E' : 'var(--text-secondary)'
                    }}
                  >
                    {isConfirmed ? '✓ Confirmed' : 'Mark Correct'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenInTester(cand.family, cand.suggestedWeight, cand.suggestedStyle);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-accent-blue)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>Specimen Tester</span>
                    <ExternalLink size={11} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSearchInLibrary(cand.family);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-accent-blue)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>Catalog</span>
                    <ExternalLink size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Candidate Side-by-Side Comparison Mode */}
        {isComparing && candidates.length > 1 && (
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              marginBottom: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                Side-by-Side Candidate Comparison
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Size:</span>
                <input
                  type="range"
                  min="16"
                  max="52"
                  value={previewFontSize}
                  onChange={e => setPreviewFontSize(Number(e.target.value))}
                  style={{ accentColor: 'var(--color-accent-blue)', width: 100 }}
                />
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>{previewFontSize}px</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {candidates.slice(0, 3).map(c => (
                <div key={c.family} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-accent-blue)', marginBottom: 4 }}>
                    {c.family} ({c.similarity}% est. match)
                  </div>
                  <div
                    style={{
                      fontFamily: `'${c.family}', sans-serif`,
                      fontWeight: c.suggestedWeight || 400,
                      fontStyle: c.suggestedStyle || 'normal',
                      fontSize: `${previewFontSize}px`,
                      lineHeight: 1.25,
                      color: colors?.textColor?.hex || 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {text || 'The quick brown fox jumps over the lazy dog'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Integration CTA Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <button
            type="button"
            className={targetSlot === 'heading' || !targetSlot ? 'btn-primary' : 'btn-secondary'}
            onClick={() => handleApplyHeadingClick(activeCandidate)}
            style={{
              padding: '10px 14px',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: targetSlot === 'heading' ? '2px solid var(--color-accent-blue)' : undefined
            }}
          >
            <Type size={14} />
            <span>Use as Heading in Studio</span>
          </button>

          <button
            type="button"
            className={targetSlot === 'body' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => handleApplyBodyClick(activeCandidate)}
            style={{
              padding: '10px 14px',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: targetSlot === 'body' ? '2px solid #A855F7' : undefined
            }}
          >
            <ArrowRight size={14} />
            <span>Use as Body in Studio</span>
          </button>
        </div>
      </div>

      {/* Analysis Export Modal */}
      <FontAnalysisExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        selectedCandidate={activeCandidate}
        analysisData={{
          text,
          region: selectedRegion,
          classification,
          colors,
          measurements,
          candidates,
          imageWidth,
          imageHeight,
          method,
          limitations
        }}
      />
    </div>
  );
}
