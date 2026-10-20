import React, { useState, useMemo } from 'react';
import { X, Copy, Check, Download, FileJson, Code } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { generateFontPairingCss } from '../../utils/fontLoader';

export default function FontAnalysisExportModal({
  isOpen,
  onClose,
  analysisData,
  selectedCandidate
}) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('json'); // 'json' | 'css'
  const [copied, setCopied] = useState(false);
  const [exportedAt] = useState(() => new Date().toISOString());

  const candidate = selectedCandidate || analysisData?.candidates?.[0] || {
    family: 'Inter',
    suggestedWeight: 400,
    suggestedStyle: 'normal'
  };

  // Structured analysis report
  const jsonReport = useMemo(() => {
    if (!analysisData) return '';
    return JSON.stringify(
      {
        title: 'Chromapick Typography Analysis Report',
        exportedAt,
      sourceImage: {
        width: analysisData.imageWidth,
        height: analysisData.imageHeight
      },
      selectedRegion: {
        id: analysisData.region?.id,
        coordinates: analysisData.region?.bbox,
        extractedText: analysisData.text,
        ocrConfidence: `${analysisData.region?.confidence || 0}%`
      },
      estimatedClassification: {
        category: analysisData.classification?.category,
        weightCategory: analysisData.classification?.weightCategory,
        estimatedNumericWeight: analysisData.classification?.estimatedNumericWeight,
        style: analysisData.classification?.style,
        casing: analysisData.classification?.casing,
        isEstimate: true
      },
      colorAnalysis: {
        textColor: analysisData.colors?.textColor,
        backgroundColor: analysisData.colors?.backgroundColor,
        contrastRatio: `${analysisData.colors?.contrastRatio}:1`,
        wcagCompliance: analysisData.colors?.wcagRating,
        isReliableSeparation: analysisData.colors?.isReliable
      },
      typographyMeasurements: {
        sourceImagePixelSize: `${analysisData.measurements?.imagePxSize}px (image pixels, not CSS pixels)`,
        estimatedLineHeightRatio: analysisData.measurements?.lineHeightRatio,
        estimatedLetterSpacingPx: `${analysisData.measurements?.letterSpacingPx}px`,
        textAlignment: analysisData.measurements?.alignment,
        measurementNote: analysisData.measurements?.measurementNote
      },
      identifiedCandidates: (analysisData.candidates || []).map(c => ({
        family: c.family,
        category: c.category,
        estimatedSimilarity: `${c.similarity}%`,
        confidence: c.confidence,
        rationale: c.rationale,
        suggestedWeight: c.suggestedWeight,
        suggestedStyle: c.suggestedStyle
      })),
      analysisMetadata: {
        method: analysisData.method || 'Heuristic Glyph & Metric Analysis',
        limitations: analysisData.limitations || 'Results are estimated based on pixel stroke characteristics and catalog metadata.'
      }
    },
    null,
    2
  );
  }, [analysisData, exportedAt]);

  if (!isOpen || !analysisData) return null;

  // Scoped CSS for top candidate
  const candidateCss = generateFontPairingCss({
    heading: {
      family: candidate.family,
      weight: candidate.suggestedWeight || 700,
      style: candidate.suggestedStyle || 'normal',
      size: analysisData.measurements?.imagePxSize || 36,
      lineHeight: analysisData.measurements?.lineHeightRatio || 1.25,
      letterSpacing: analysisData.measurements?.letterSpacingPx || 0,
      fallback: candidate.fallback || 'sans-serif'
    },
    body: {
      family: 'Inter',
      weight: 400,
      style: 'normal',
      size: 16,
      lineHeight: 1.6,
      letterSpacing: 0,
      fallback: 'sans-serif'
    },
    selectorPrefix: '.extracted-typography'
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      showToast('Failed to copy to clipboard', 'error');
    });
  };

  const handleDownloadJson = () => {
    try {
      const blob = new Blob([jsonReport], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `typography-analysis-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloaded analysis report', 'success');
    } catch {
      showToast('Failed to download file', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="font-analysis-modal-title"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 680, width: '92%' }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
          aria-label="Close export dialog"
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <FileJson size={20} color="var(--color-accent-blue)" />
            <h3 id="font-analysis-modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
              Export Typography Analysis
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Export the structured measurements, identified candidate fonts, colors, and limitations report.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-color)', marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 14px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'json' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'json' ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <FileJson size={15} />
            <span>Analysis Report (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('css')}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 14px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'css' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'css' ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Code size={15} />
            <span>Candidate CSS ({candidate.family})</span>
          </button>
        </div>

        {/* Code Content */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <pre
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              maxHeight: 290,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              margin: 0
            }}
          >
            {activeTab === 'json' ? jsonReport : candidateCss}
          </pre>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Note: Results are analytical estimates, not original CSS files.
          </span>

          <div style={{ display: 'flex', gap: 10 }}>
            {activeTab === 'json' && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleDownloadJson}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '0.84rem' }}
              >
                <Download size={14} />
                <span>Download .json</span>
              </button>
            )}

            <button
              type="button"
              className="btn-primary"
              onClick={() => handleCopy(activeTab === 'json' ? jsonReport : candidateCss)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.84rem' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : `Copy ${activeTab.toUpperCase()}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
