import React, { useState } from 'react';
import { X, Copy, Check, Download, Code, Image, FileCode, CheckCircle2 } from 'lucide-react';
import { generateFullCss, generateGradientSvg, renderGradientToCanvas } from '../../utils/gradientUtils';
import { triggerFileDownload } from '../../utils/downloadUtils';
import { useToast } from '../../context/ToastContext';

export default function GradientExportModal({
  isOpen,
  onClose,
  gradientState
}) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('css'); // 'css' | 'svg' | 'png'
  const [cssFormat, setCssFormat] = useState('declaration'); // 'declaration' | 'class' | 'variable'
  const [classNameInput, setClassNameInput] = useState('gradient-background');
  const [variableNameInput, setVariableNameInput] = useState('gradient-background');
  const [pngResolution, setPngResolution] = useState('1200x800'); // '1920x1080' | '1200x800' | '800x800'
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  // Generate CSS string according to selected format
  const activeIdentifier = cssFormat === 'class' ? classNameInput : variableNameInput;
  const generatedCss = generateFullCss(gradientState, cssFormat, activeIdentifier);

  // Generate SVG string
  const generatedSvg = generateGradientSvg(gradientState, 1200, 800);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      showToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopiedKey(null), 2000);
    }).catch(() => {
      showToast('Failed to copy to clipboard', 'error');
    });
  };

  const handleDownloadCss = () => {
    triggerFileDownload(generatedCss, 'chromapick-gradient.css', 'text/css');
    showToast('Downloaded CSS file!', 'success');
  };

  const handleDownloadSvg = () => {
    triggerFileDownload(generatedSvg, 'chromapick-gradient.svg', 'image/svg+xml');
    showToast('Downloaded SVG file!', 'success');
  };

  const handleDownloadPng = async () => {
    try {
      setIsExportingPng(true);
      const [wStr, hStr] = pngResolution.split('x');
      const width = parseInt(wStr, 10);
      const height = parseInt(hStr, 10);

      const blob = await renderGradientToCanvas(gradientState, width, height);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chromapick-gradient-${width}x${height}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast(`Exported PNG (${width}x${height})!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to export PNG gradient', 'error');
    } finally {
      setIsExportingPng(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gradient-export-modal-title"
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
            <h3 id="gradient-export-modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
              Export Gradient Studio
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Export your gradient in clean CSS declarations, classes, variables, scalable SVG, or high-res PNG.
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
              borderBottom: activeTab === 'css' ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Code size={15} />
            <span>CSS Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('svg')}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 14px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'svg' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'svg' ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <FileCode size={15} />
            <span>SVG Vector</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('png')}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 14px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'png' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'png' ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Image size={15} />
            <span>PNG Image</span>
          </button>
        </div>

        {/* Tab 1: CSS Code Formats */}
        {activeTab === 'css' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Format Selector Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Format:
              </span>
              {[
                { id: 'declaration', label: 'Declaration (background: ...)' },
                { id: 'class', label: 'CSS Class' },
                { id: 'variable', label: 'CSS Variable (:root)' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCssFormat(f.id)}
                  style={{
                    border: cssFormat === f.id ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                    background: cssFormat === f.id ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-input)',
                    color: cssFormat === f.id ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Custom Identifier Input (Class name or Variable name) */}
            {cssFormat === 'class' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Class Name:
                </label>
                <input
                  type="text"
                  value={classNameInput}
                  onChange={e => setClassNameInput(e.target.value)}
                  className="input-text"
                  style={{ maxWidth: 220, padding: '4px 8px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
                  placeholder="gradient-background"
                />
              </div>
            )}

            {cssFormat === 'variable' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Variable Name:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>--</span>
                  <input
                    type="text"
                    value={variableNameInput}
                    onChange={e => setVariableNameInput(e.target.value)}
                    className="input-text"
                    style={{ maxWidth: 220, padding: '4px 8px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
                    placeholder="gradient-background"
                  />
                </div>
              </div>
            )}

            {/* Code Box */}
            <pre
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                lineHeight: 1.55,
                maxHeight: 180,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                margin: 0
              }}
            >
              {generatedCss}
            </pre>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleDownloadCss}
                style={{ padding: '7px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Download size={14} />
                <span>Download .css</span>
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={() => handleCopy(generatedCss, 'css')}
                style={{ padding: '7px 16px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {copiedKey === 'css' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedKey === 'css' ? 'Copied!' : 'Copy CSS'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: SVG Vector */}
        {activeTab === 'svg' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Ready to import into Figma, Sketch, Illustrator, or HTML documents.
            </p>

            <pre
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                lineHeight: 1.5,
                maxHeight: 180,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                margin: 0
              }}
            >
              {generatedSvg}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleCopy(generatedSvg, 'svg')}
                style={{ padding: '7px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {copiedKey === 'svg' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedKey === 'svg' ? 'Copied SVG!' : 'Copy SVG'}</span>
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={handleDownloadSvg}
                style={{ padding: '7px 16px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Download size={14} />
                <span>Download .svg</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: PNG Image */}
        {activeTab === 'png' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Render a raster PNG image directly in your browser without any server upload.
            </p>

            {/* Resolution Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>
                Image Dimensions:
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { id: '1920x1080', label: '1920 × 1080 (Full HD Wallpaper)' },
                  { id: '1200x800', label: '1200 × 800 (Card & Web Banner)' },
                  { id: '800x800', label: '800 × 800 (Square Social Avatar)' }
                ].map(res => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setPngResolution(res.id)}
                    style={{
                      border: pngResolution === res.id ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                      background: pngResolution === res.id ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-input)',
                      color: pngResolution === res.id ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {res.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PNG Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleDownloadPng}
                disabled={isExportingPng}
                style={{
                  padding: '9px 18px',
                  fontSize: '0.84rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: isExportingPng ? 'not-allowed' : 'pointer'
                }}
              >
                <Download size={15} />
                <span>{isExportingPng ? 'Rendering Canvas...' : `Download ${pngResolution} PNG`}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
