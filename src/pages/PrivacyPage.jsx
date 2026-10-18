import React from 'react';
import { ShieldCheck, Lock, EyeOff, ServerOff, Database } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div style={{ paddingBottom: 60, maxWidth: 840, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', padding: '40px 16px 32px 16px' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Chromapick is architected with a strict privacy-first model: your images and palettes remain on your device.
        </p>
      </div>

      <div className="chroma-card" style={{ padding: 36, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ServerOff size={20} color="#10B981" />
            <span>1. Zero Image Uploads</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem' }}>
            When you drag, upload, or paste an image into Chromapick, it is decoded entirely within your local browser's memory using JavaScript and the Canvas 2D API. We do not have a backend server that receives, caches, or stores your image files.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Database size={20} color="#10B981" />
            <span>2. Local Storage Usage</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem' }}>
            To make your experience seamless across browser refreshes, we store non-sensitive user preferences (such as your chosen light/dark theme, your saved custom palette HEX values, and recent color history) directly in your browser's standard <code>localStorage</code>. This data never leaves your device and is never synchronized to third parties without your explicit command.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <EyeOff size={20} color="#10B981" />
            <span>3. No Third-Party Trackers or Data Selling</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem' }}>
            We do not sell, rent, or trade user analytics or extracted palette data. We respect your right to private, unmonitored digital creation.
          </p>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Last updated: October 2026. For privacy inquiries, please contact privacy@chromapick.io.
        </div>
      </div>
    </div>
  );
}
