import React, { useState, useMemo } from 'react';
import { X, Copy, Download, Code, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { generateFullBorderRadiusCss } from '../../utils/borderRadiusUtils';

export default function RadiusExportModal({
  isOpen,
  onClose,
  state
}) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('declaration'); // 'declaration' | 'class' | 'variable'
  const [classNameInput, setClassNameInput] = useState('custom-card');
  const [isCopied, setIsCopied] = useState(false);

  const exportedCss = useMemo(() => {
    return generateFullBorderRadiusCss(state, activeTab, classNameInput);
  }, [state, activeTab, classNameInput]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(exportedCss).then(() => {
      setIsCopied(true);
      showToast('Copied CSS to clipboard!', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
      showToast('Failed to copy to clipboard', 'error');
    });
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([exportedCss], { type: 'text/css;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${classNameInput || 'border-radius'}.css`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Downloaded CSS file!', 'success');
    } catch {
      showToast('Failed to download CSS file', 'error');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="radius-export-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
          maxWidth: '560px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Code size={18} color="var(--color-accent-blue)" />
            <h3 id="radius-export-title" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
              Export Border Radius CSS
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
              padding: 4,
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Format Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-input)',
              padding: 4,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}
          >
            {[
              { id: 'declaration', label: 'CSS Declaration' },
              { id: 'class', label: 'CSS Class' },
              { id: 'variable', label: 'Custom Property' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  background: activeTab === tab.id ? 'var(--color-accent-blue)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Optional Class / Variable Name Input */}
          {activeTab !== 'declaration' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label htmlFor="radius-export-name" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {activeTab === 'class' ? 'Class Name:' : 'Variable Name:'}
              </label>
              <input
                id="radius-export-name"
                type="text"
                value={classNameInput}
                onChange={e => setClassNameInput(e.target.value)}
                className="input-text"
                placeholder={activeTab === 'class' ? 'custom-card' : 'border-radius'}
                style={{
                  flex: 1,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  padding: '6px 10px'
                }}
              />
            </div>
          )}

          {/* Code Output Box */}
          <pre
            style={{
              background: 'var(--bg-input)',
              padding: 16,
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              margin: 0,
              minHeight: 90,
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            {exportedCss}
          </pre>
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            background: 'var(--bg-card-subtle)'
          }}
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={handleDownload}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.82rem' }}
          >
            <Download size={14} />
            <span>Download .css</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleCopy}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 18px', fontSize: '0.82rem' }}
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
            <span>{isCopied ? 'Copied!' : 'Copy CSS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
