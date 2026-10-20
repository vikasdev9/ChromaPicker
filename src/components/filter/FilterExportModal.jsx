import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Download,
  Code,
  Check,
  Image as ImageIcon,
  Loader2,
  FileText,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
  generateFullFilterCss,
  generateFilterString,
  renderFilteredImageToCanvas,
  canvasToBlobAsync
} from '../../utils/imageFilterUtils';

export default function FilterExportModal({
  isOpen,
  onClose,
  filterState,
  imageSrc,
  imageName,
  imageDimensions
}) {
  const { showToast } = useToast();
  const [modalTab, setModalTab] = useState('css'); // 'css' | 'image'
  const [cssFormat, setCssFormat] = useState('declaration'); // 'declaration' | 'class' | 'variable'
  const [classNameInput, setClassNameInput] = useState('filtered-image');
  const [omitDefaults, setOmitDefaults] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // PNG Export state
  const [exportScale, setExportScale] = useState('1'); // '1' (original) | '0.75' | '0.5'
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportError, setExportError] = useState(null);

  const exportedCss = useMemo(() => {
    return generateFullFilterCss(filterState, cssFormat, classNameInput, omitDefaults);
  }, [filterState, cssFormat, classNameInput, omitDefaults]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      showToast('Clipboard access not supported in this browser', 'error');
      return;
    }

    navigator.clipboard.writeText(exportedCss).then(() => {
      setIsCopied(true);
      showToast('Copied Filter CSS to clipboard!', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
      showToast('Failed to copy to clipboard', 'error');
    });
  };

  const handleDownloadCss = () => {
    try {
      const blob = new Blob([exportedCss], { type: 'text/css;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${classNameInput || 'filter'}.css`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Downloaded CSS file!', 'success');
    } catch {
      showToast('Failed to download CSS file', 'error');
    }
  };

  const handleDownloadPng = async () => {
    if (!imageSrc) {
      showToast('No image loaded to export', 'error');
      return;
    }

    setIsExportingImage(true);
    setExportError(null);

    try {
      // 1. Create source image object
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image for canvas export'));
        img.src = imageSrc;
      });

      // 2. Calculate dimensions
      const scale = parseFloat(exportScale) || 1;
      const naturalW = img.naturalWidth || img.width || 800;
      const naturalH = img.naturalHeight || img.height || 600;
      const targetW = Math.max(1, Math.round(naturalW * scale));
      const targetH = Math.max(1, Math.round(naturalH * scale));

      // 3. Render filtered image onto canvas
      const filterCss = generateFilterString(filterState, false);
      const canvas = renderFilteredImageToCanvas(img, filterCss, targetW, targetH);

      // 4. Convert to PNG blob
      const blob = await canvasToBlobAsync(canvas, 'image/png', 0.95);

      // 5. Trigger download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const baseName = (imageName || 'filtered-image').replace(/\.[^/.]+$/, '');
      link.download = `${baseName}-filtered.png`;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      showToast(`Exported PNG (${targetW}×${targetH})!`, 'success');
      onClose();
    } catch (err) {
      console.error('PNG export failed:', err);
      const msg = err.message || 'Image rendering failed';
      setExportError(msg);
      showToast(`Export failed: ${msg}`, 'error');
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-export-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1000
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="chroma-card"
        style={{
          width: '100%',
          maxWidth: '600px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sliders size={18} color="var(--color-accent-blue)" />
            <h3 id="filter-export-title" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
              Export Image & CSS Filters
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close export dialog"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: 4,
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Main Switcher: CSS vs Image */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-main)'
          }}
        >
          <button
            type="button"
            onClick={() => setModalTab('css')}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              background: modalTab === 'css' ? 'var(--bg-card)' : 'transparent',
              color: modalTab === 'css' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
              fontWeight: modalTab === 'css' ? 800 : 600,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              borderBottom: modalTab === 'css' ? '2px solid var(--color-accent-blue)' : '2px solid transparent'
            }}
          >
            <Code size={16} />
            <span>CSS Code</span>
          </button>

          <button
            type="button"
            onClick={() => setModalTab('image')}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              background: modalTab === 'image' ? 'var(--bg-card)' : 'transparent',
              color: modalTab === 'image' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
              fontWeight: modalTab === 'image' ? 800 : 600,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              borderBottom: modalTab === 'image' ? '2px solid var(--color-accent-blue)' : '2px solid transparent'
            }}
          >
            <ImageIcon size={16} />
            <span>Download Filtered PNG</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {modalTab === 'css' ? (
            <>
              {/* CSS Sub-tabs */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setCssFormat('declaration')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: cssFormat === 'declaration' ? 'var(--color-accent-blue)' : 'var(--border-color)',
                    background: cssFormat === 'declaration' ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-main)',
                    color: cssFormat === 'declaration' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Filter Declaration
                </button>
                <button
                  type="button"
                  onClick={() => setCssFormat('class')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: cssFormat === 'class' ? 'var(--color-accent-blue)' : 'var(--border-color)',
                    background: cssFormat === 'class' ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-main)',
                    color: cssFormat === 'class' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  CSS Class Rule
                </button>
                <button
                  type="button"
                  onClick={() => setCssFormat('variable')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: cssFormat === 'variable' ? 'var(--color-accent-blue)' : 'var(--border-color)',
                    background: cssFormat === 'variable' ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-main)',
                    color: cssFormat === 'variable' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  CSS Variable (:root)
                </button>
              </div>

              {/* Class/Variable Name Input & Options */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                {cssFormat !== 'declaration' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label htmlFor="css-ident-input" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {cssFormat === 'class' ? 'Class name:' : 'Variable name:'}
                    </label>
                    <input
                      id="css-ident-input"
                      type="text"
                      value={classNameInput}
                      onChange={e => setClassNameInput(e.target.value)}
                      className="input-text"
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.8rem',
                        fontFamily: 'var(--font-mono)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-main)',
                        color: 'var(--text-primary)',
                        width: 140
                      }}
                    />
                  </div>
                )}

                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: 'auto' }}>
                  <input
                    type="checkbox"
                    checked={omitDefaults}
                    onChange={e => setOmitDefaults(e.target.checked)}
                    style={{ accentColor: 'var(--color-accent-blue)' }}
                  />
                  <span>Omit default filters (compact)</span>
                </label>
              </div>

              {/* Code Display Area */}
              <div
                style={{
                  position: 'relative',
                  background: '#0d1117',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  color: '#e6edf3',
                  overflowX: 'auto',
                  maxHeight: 180
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {exportedCss}
                </pre>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={handleDownloadCss}
                  className="btn-subtle"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    fontSize: '0.82rem',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <Download size={15} />
                  <span>Download .css</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  {isCopied ? <Check size={15} /> : <Copy size={15} />}
                  <span>{isCopied ? 'Copied!' : 'Copy CSS'}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* IMAGE EXPORT SECTION */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14
                }}
              >
                {/* Image info banner */}
                <div
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {imageName || 'Active Image'}
                    </div>
                    {imageDimensions && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                        Source: {imageDimensions.width} × {imageDimensions.height} px
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: 'var(--color-accent-blue)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: '0.74rem'
                    }}
                  >
                    PNG Format
                  </span>
                </div>

                {/* Scale selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 6 }}>
                    Export Resolution:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                      { id: '1', label: 'Original (1×)', desc: imageDimensions ? `${imageDimensions.width}×${imageDimensions.height}` : 'Full Res' },
                      { id: '0.75', label: 'Medium (0.75×)', desc: imageDimensions ? `${Math.round(imageDimensions.width * 0.75)}×${Math.round(imageDimensions.height * 0.75)}` : '75%' },
                      { id: '0.5', label: 'Compact (0.5×)', desc: imageDimensions ? `${Math.round(imageDimensions.width * 0.5)}×${Math.round(imageDimensions.height * 0.5)}` : '50%' }
                    ].map(res => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => setExportScale(res.id)}
                        style={{
                          background: exportScale === res.id ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-main)',
                          border: exportScale === res.id ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 2,
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: exportScale === res.id ? 'var(--color-accent-blue)' : 'var(--text-primary)' }}>
                          {res.label}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {res.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {exportError && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      color: 'var(--color-accent-red)',
                      fontSize: '0.8rem'
                    }}
                  >
                    {exportError}
                  </div>
                )}

                {/* Privacy & Browser Processing Notice */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-main)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <ShieldCheck size={16} color="var(--color-accent-green)" />
                  <span>
                    Canvas rendering runs 100% locally in your browser. No files are uploaded to external servers.
                  </span>
                </div>

                {/* Export Action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    disabled={isExportingImage || !imageSrc}
                    className="btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 20px',
                      fontSize: '0.86rem',
                      borderRadius: 'var(--radius-md)',
                      opacity: (!imageSrc || isExportingImage) ? 0.6 : 1,
                      cursor: (!imageSrc || isExportingImage) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isExportingImage ? <Loader2 size={16} className="spin-animation" /> : <Download size={16} />}
                    <span>{isExportingImage ? 'Rendering PNG...' : 'Download Filtered PNG'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
