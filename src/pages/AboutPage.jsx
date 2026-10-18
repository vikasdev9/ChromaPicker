import React from 'react';
import { Palette, ShieldCheck, Cpu, Code2, Users, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ paddingBottom: 60, maxWidth: 840, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', padding: '40px 16px 32px 16px' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
          About Chromapick
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          The private, client-side color science engine built for modern designers, frontend developers, and digital creators.
        </p>
      </div>

      <div className="chroma-card" style={{ padding: 36, marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Palette color="var(--color-accent-blue)" size={22} />
            <span>Our Mission</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
            Chromapick was born out of frustration with existing online color pickers that upload user images to remote servers, require annoying logins, or inundate users with invasive advertisements. We built Chromapick to be <strong>100% browser-powered</strong>, lightning fast, and deeply rooted in rigorous color science.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Cpu color="var(--color-accent-blue)" size={22} />
            <span>Browser-Side Architecture</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
            Every image you inspect is processed locally on your device via the HTML5 Canvas API and Web Workers using Modified Median Cut Quantization (MMCQ) and Delta-E color distance calculations. No image bytes or personal identifiers are ever transmitted across the network.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Code2 color="var(--color-accent-blue)" size={22} />
            <span>Built with Modern Standards</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
            Built using React, Vite, and native CSS custom properties. Our color formulas comply with the official CIE 1931, CIE 1976 (L*a*b*), and W3C WCAG 2.1 accessibility guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
