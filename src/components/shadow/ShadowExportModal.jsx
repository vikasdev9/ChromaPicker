import React, { useState } from 'react';
import { X, Copy, Check, Download, Code } from 'lucide-react';
import { generateFullShadowCss } from '../../utils/shadowUtils';
import { triggerFileDownload } from '../../utils/downloadUtils';
import { useToast } from '../../context/ToastContext';

export default function ShadowExportModal({
  isOpen,
  onClose,
  layers,
  mode
}) {
  const { showToast } = useToast();
  const [format, setFormat] = useState('declaration'); // 'declaration' | 'class' | 'variable'
  const [classNameInput, setClassNameInput] = useState('shadow-card');
  const [variableNameInput, setVariableNameInput] = useState('elevation-shadow');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activeIdentifier = format === 'class' ? classNameInput : variableNameInput;
  const generatedCss = generateFullShadowCss(layers, mode, format, activeIdentifier);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCss).then(() => {
      setCopied(true);
      showToast('Copied shadow CSS to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      showToast('Failed to copy to clipboard', 'error');
    });
  };

  const handleDownload = () => {
    triggerFileDownload(generatedCss, 'chromapick-shadow.css', 'text/css');
    showToast('Downloaded CSS file!', 'success');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shadow-export-modal-title"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 640, width: '92%' }}
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
            <h3 id="shadow-export-modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
              Export {mode === 'text-shadow' ? 'Text' : 'Box'} Shadow CSS
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Use this code in your CSS stylesheets, React components, Tailwind, or modern web frameworks.
          </p>
        </div>

        {/* Format Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            Format:
          </span>
          {[
            { id: 'declaration', label: 'Declaration (property only)' },
            { id: 'class', label: 'CSS Class' },
            { id: 'variable', label: 'CSS Custom Property (:root)' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFormat(f.id)}
              style={{
                border: format === f.id ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                background: format === f.id ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-input)',
                color: format === f.id ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
                padding: '5px 12px',
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

        {/* Configurable Identifier Inputs */}
        {format === 'class' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <label htmlFor="export-class-name" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Class Name:
            </label>
            <input
              id="export-class-name"
              type="text"
              value={classNameInput}
              onChange={e => setClassNameInput(e.target.value)}
              className="input-text"
              style={{ maxWidth: 220, padding: '4px 8px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
              placeholder="shadow-card"
            />
          </div>
        )}

        {format === 'variable' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <label htmlFor="export-var-name" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Variable Name:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>--</span>
              <input
                id="export-var-name"
                type="text"
                value={variableNameInput}
                onChange={e => setVariableNameInput(e.target.value)}
                className="input-text"
                style={{ maxWidth: 220, padding: '4px 8px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
                placeholder="elevation-shadow"
              />
            </div>
          </div>
        )}

        {/* Code Block Container */}
        <div style={{ marginBottom: 20 }}>
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
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleDownload}
            style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={14} />
            <span>Download .css</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleCopy}
            style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy CSS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
