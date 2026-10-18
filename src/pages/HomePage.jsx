import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Clipboard,
  Sparkles,
  ShieldCheck,
  Zap,
  Download,
  Eye,
  CheckCircle2,
  Palette
} from 'lucide-react';
import ImageWorkspace from '../components/image/ImageWorkspace';
import AdSlot from '../components/ads/AdSlot';
import { usePalette } from '../context/PaletteContext';
import { useToast } from '../context/ToastContext';
import ProModal from '../components/common/ProModal';

export default function HomePage() {
  const { handleFileUpload, loadSampleImage } = usePalette();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [isProModalOpen, setIsProModalOpen] = React.useState(false);

  const handlePasteClick = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find(t => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            handleFileUpload(new File([blob], 'pasted-image.png', { type: imageType }));
            showToast('Pasted image from clipboard!', 'success');
            return;
          }
        }
      }
      showToast('No image found in clipboard. Press Ctrl+V directly to paste.', 'info');
    } catch {
      showToast('Press Ctrl+V anywhere on the page to paste an image.', 'info');
    }
  };

  return (
    <div>
      {/* 3-Column Desktop Layout matching Reference: Left Ad Rail | Center Workspace | Right Ad Rail */}
      <div className="desktop-ad-layout">
        {/* Left Skyscraper Ad Rail (Visible on wide screens >= 1220px) */}
        <aside className="desktop-ad-left" aria-label="Left Advertisement Sidebar">
          <AdSlot position="sidebar-left" onRemoveAdsClick={() => setIsProModalOpen(true)} />
        </aside>

        {/* Center Main Content Rail */}
        <main className="desktop-center-content">
          {/* Top Leaderboard Ad matching Reference Screenshot */}
          <AdSlot position="top-leaderboard" onRemoveAdsClick={() => setIsProModalOpen(true)} />

          {/* Centered Hero Section */}
          <section className="hero-section" style={{ padding: 'clamp(8px, 2.5vw, 20px) clamp(10px, 2vw, 16px) 16px', textAlign: 'center' }}>
            <h1 className="hero-title" style={{ fontSize: 'clamp(1.65rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.18, marginBottom: 10, letterSpacing: '-0.025em' }}>
              Free Color Picker: Extract Colors from Any Image Instantly
            </h1>

            <p className="hero-subtitle" style={{ fontSize: 'clamp(0.88rem, 2.2vw, 1.02rem)', color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 16px', lineHeight: 1.5 }}>
              Upload, paste, or select a sample image to get HEX, RGB, HSL, CMYK and more. No signup needed.
            </p>

            {/* Primary Hero Actions */}
            <div className="hero-buttons" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="btn-primary"
                style={{ padding: '10px 20px', fontSize: '0.9rem', borderRadius: 'var(--radius-md)', minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Upload size={16} />
                <span>Upload Image</span>
              </button>

              <button
                onClick={handlePasteClick}
                className="btn-secondary"
                style={{ padding: '10px 18px', fontSize: '0.9rem', borderRadius: 'var(--radius-md)', minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Clipboard size={16} />
                <span>Paste Image (Ctrl+V)</span>
              </button>

              <button
                onClick={() => loadSampleImage('yellow-portrait')}
                className="btn-secondary"
                style={{ padding: '10px 18px', fontSize: '0.9rem', borderRadius: 'var(--radius-md)', minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Sparkles size={16} color="var(--color-accent-blue)" />
                <span>Try Sample Image</span>
              </button>
            </div>

            {/* Compact Feature Badges */}
            <div className="hero-badges" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div className="hero-badge" style={{ fontSize: '0.78rem', padding: '5px 12px' }}>
                <ShieldCheck size={14} color="#10B981" />
                <span>Browser-Side Processing</span>
              </div>
              <div className="hero-badge" style={{ fontSize: '0.78rem', padding: '5px 12px' }}>
                <Zap size={14} color="#F59E0B" />
                <span>No Account Required</span>
              </div>
              <div className="hero-badge" style={{ fontSize: '0.78rem', padding: '5px 12px' }}>
                <Download size={14} color="#3B82F6" />
                <span>Multiple Export Formats</span>
              </div>
            </div>
          </section>

          {/* Main Image Extraction Workspace Card */}
          <ImageWorkspace />

          {/* Reusable In-page Advertisement Banner */}
          <AdSlot
            position="inline"
            onRemoveAdsClick={() => setIsProModalOpen(true)}
          />

          {/* Explore Suite Features Cards */}
          <section style={{ margin: '48px 0 24px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>
                Complete Color Science Studio
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Everything you need to craft harmonic palettes, test accessibility, and design with confidence.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 18 }}>
              <Link to="/color/2596be" className="chroma-card" style={{ padding: 20, textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(37, 150, 190, 0.1)', color: 'var(--color-accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Palette size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>Color Inspector & Harmonies</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Convert HEX, RGB, HSL, CMYK, LAB, and explore complementary, triadic, and analogous harmonies.
                </p>
              </Link>

              <Link to="/color-contrast-checker" className="chroma-card" style={{ padding: 20, textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <CheckCircle2 size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>WCAG 2.1 Contrast Checker</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Verify AA & AAA compliance for normal and large text with 1-click automatic accessible fixes.
                </p>
              </Link>

              <Link to="/color-blindness-simulator" className="chroma-card" style={{ padding: 20, textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Eye size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>Blindness Simulator</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Preview how colors and images look to people with Protanopia, Deuteranopia, Tritanopia, and Monochromacy.
                </p>
              </Link>

              <Link to="/color-gradient-generator" className="chroma-card" style={{ padding: 20, textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Sparkles size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>CSS Gradient Maker</h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Craft multi-stop linear and radial gradients with angle controls and ready-to-paste CSS code.
                </p>
              </Link>
            </div>
          </section>
        </main>

        {/* Right Ad Rail (Visible on >= 1024px) */}
        <aside className="desktop-ad-right" aria-label="Right Advertisement Sidebar">
          <AdSlot position="sidebar-right" onRemoveAdsClick={() => setIsProModalOpen(true)} />
        </aside>
      </div>

      {/* Sticky Bottom Anchor Ad Bar matching Reference Screenshot */}
      <AdSlot position="sticky-bottom" onRemoveAdsClick={() => setIsProModalOpen(true)} />

      {/* Pro Modal */}
      <ProModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
