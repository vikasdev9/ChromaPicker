import React, { useState } from 'react';
import { X, Copy, Check, Download, Code, FileText, CheckCircle2 } from 'lucide-react';
import { generateFontPairingCss, buildGoogleFontUrl } from '../../utils/fontLoader';
import { useToast } from '../../context/ToastContext';

export default function FontCssExportModal({
  isOpen,
  onClose,
  headingFont,
  bodyFont,
  headingWeight,
  headingStyle,
  headingSize,
  headingLineHeight,
  headingLetterSpacing,
  bodyWeight,
  bodyStyle,
  bodySize,
  bodyLineHeight,
  bodyLetterSpacing
}) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('css'); // 'css' | 'html' | 'json'
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  // Generate CSS string
  const cssCode = generateFontPairingCss({
    heading: {
      family: headingFont.family,
      weight: headingWeight,
      style: headingStyle,
      size: headingSize,
      lineHeight: headingLineHeight,
      letterSpacing: headingLetterSpacing,
      fallback: headingFont.fallback
    },
    body: {
      family: bodyFont.family,
      weight: bodyWeight,
      style: bodyStyle,
      size: bodySize,
      lineHeight: bodyLineHeight,
      letterSpacing: bodyLetterSpacing,
      fallback: bodyFont.fallback
    },
    selectorPrefix: '.font-preview'
  });

  // Generate HTML <link> tags
  const headingUrl = buildGoogleFontUrl(headingFont.family, [headingWeight], headingStyle === 'italic');
  const bodyUrl = buildGoogleFontUrl(bodyFont.family, [bodyWeight], bodyStyle === 'italic');

  const htmlHeadLinks = `<!-- Google Fonts Embed Code -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${headingUrl ? `<link href="${headingUrl}" rel="stylesheet">` : ''}
${bodyUrl && bodyUrl !== headingUrl ? `<link href="${bodyUrl}" rel="stylesheet">` : ''}`.trim();

  // Generate JSON configuration
  const jsonExport = JSON.stringify(
    {
      app: 'Chromapick Typography Studio',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      pairing: {
        heading: {
          family: headingFont.family,
          category: headingFont.category,
          weight: headingWeight,
          style: headingStyle,
          sizePx: headingSize,
          lineHeight: headingLineHeight,
          letterSpacingPx: headingLetterSpacing,
          googleFontUrl: headingUrl
        },
        body: {
          family: bodyFont.family,
          category: bodyFont.category,
          weight: bodyWeight,
          style: bodyStyle,
          sizePx: bodySize,
          lineHeight: bodyLineHeight,
          letterSpacingPx: bodyLetterSpacing,
          googleFontUrl: bodyUrl
        }
      }
    },
    null,
    2
  );

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      showToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopiedKey(null), 2000);
    }).catch(() => {
      showToast('Failed to copy to clipboard', 'error');
    });
  };

  const handleDownloadFile = (content, filename, mimeType) => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Downloaded ${filename}`, 'success');
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
        aria-labelledby="font-export-modal-title"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 680, width: '92%' }}
      >
        {/* Close Button */}
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

        {/* Modal Header */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Code size={20} color="var(--color-accent-blue)" />
            <h3 id="font-export-modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
              Export Typography & CSS
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Use this code in your CSS stylesheets, Next.js, Vite, or web applications.
          </p>
        </div>

        {/* Export Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            borderBottom: '1px solid var(--border-color)',
            marginBottom: 16
          }}
        >
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
              borderBottom: activeTab === 'css' ? '2px solid var(--color-accent-blue)' : '2px solid transparent'
            }}
          >
            CSS Rules & Variables
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('html')}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 14px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'html' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'html' ? '2px solid var(--color-accent-blue)' : '2px solid transparent'
            }}
          >
            HTML &lt;link&gt; Tags
          </button>
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
              borderBottom: activeTab === 'json' ? '2px solid var(--color-accent-blue)' : '2px solid transparent'
            }}
          >
            Pairing JSON
          </button>
        </div>

        {/* Code Content Container */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <pre
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              lineHeight: 1.55,
              maxHeight: 280,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              margin: 0
            }}
          >
            {activeTab === 'css' && cssCode}
            {activeTab === 'html' && htmlHeadLinks}
            {activeTab === 'json' && jsonExport}
          </pre>
        </div>

        {/* Bottom Actions */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Selected: <strong>{headingFont.family}</strong> + <strong>{bodyFont.family}</strong>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {activeTab === 'css' && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleDownloadFile(cssCode, 'chromapick-typography.css', 'text/css')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  fontSize: '0.84rem'
                }}
              >
                <Download size={14} />
                <span>Download .css</span>
              </button>
            )}

            {activeTab === 'json' && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleDownloadFile(jsonExport, 'font-pairing.json', 'application/json')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  fontSize: '0.84rem'
                }}
              >
                <Download size={14} />
                <span>Download .json</span>
              </button>
            )}

            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                const textToCopy =
                  activeTab === 'css' ? cssCode : activeTab === 'html' ? htmlHeadLinks : jsonExport;
                handleCopy(textToCopy, activeTab);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                fontSize: '0.84rem'
              }}
            >
              {copiedKey === activeTab ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedKey === activeTab ? 'Copied!' : `Copy ${activeTab.toUpperCase()}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
