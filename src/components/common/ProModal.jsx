import React, { useState } from 'react';
import { X, Sparkles, Check, ShieldCheck, Zap } from 'lucide-react';

export default function ProModal({ isOpen, onClose }) {
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pro-modal-title"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 540 }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              color: '#B45309',
              marginBottom: 12
            }}
          >
            <Sparkles size={28} />
          </div>
          <h2 id="pro-modal-title" style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: 6 }}>
            Chromapick Pro
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Elevate your design workflow with unlimited exports and an ad-free workspace.
          </p>

          <div
            style={{
              marginTop: 12,
              display: 'inline-block',
              background: 'rgba(37, 150, 190, 0.1)',
              color: 'var(--color-accent-blue)',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            Frontend Demonstration UI — No Payment Required
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {[
            '100% Ad-Free Experience across all tools',
            'Unlimited high-res image analysis & palette exports',
            'Full color space exports (ASE, GPL, SVG, PNG, CSS)',
            'Unlimited saved custom palettes in local cloud sync',
            'Priority WCAG 2.1 accessibility reports',
            'Batch multi-image color extraction'
          ].map((feature, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem' }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#DCFCE7',
                  color: '#15803D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Check size={12} strokeWidth={3} />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div
            onClick={() => setSelectedPlan('monthly')}
            style={{
              padding: 14,
              borderRadius: 14,
              border: `2px solid ${selectedPlan === 'monthly' ? 'var(--color-accent-blue)' : 'var(--border-color)'}`,
              background: selectedPlan === 'monthly' ? 'rgba(37, 150, 190, 0.05)' : 'var(--bg-card-subtle)',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Monthly</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 4 }}>$4.99 <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>/ mo</span></div>
          </div>

          <div
            onClick={() => setSelectedPlan('yearly')}
            style={{
              padding: 14,
              borderRadius: 14,
              border: `2px solid ${selectedPlan === 'yearly' ? 'var(--color-accent-blue)' : 'var(--border-color)'}`,
              background: selectedPlan === 'yearly' ? 'rgba(37, 150, 190, 0.05)' : 'var(--bg-card-subtle)',
              cursor: 'pointer',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -10,
                right: 12,
                background: '#10B981',
                color: '#FFFFFF',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 10
              }}
            >
              SAVE 40%
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Annual</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 4 }}>$2.99 <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>/ mo</span></div>
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
          onClick={() => {
            alert('This is a demonstration build. All core color extraction, palette generation, contrast checking, and file downloads are 100% free with no account required!');
            onClose();
          }}
        >
          <Zap size={16} />
          Start Free 14-Day Trial
        </button>

        <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Cancel anytime. Zero commitment.
        </div>
      </div>
    </div>
  );
}
