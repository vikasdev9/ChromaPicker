import React, { useState } from 'react';
import { X, Sparkles, ExternalLink, Info, Play, Volume2, Maximize2 } from 'lucide-react';

export default function AdSlot({ position = 'inline', onRemoveAdsClick }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <div
        style={{
          padding: '6px 12px',
          background: 'var(--bg-card-subtle)',
          borderRadius: 8,
          border: '1px dashed var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          margin: '8px 0'
        }}
      >
        <span>Ad space (hidden for session)</span>
        <button
          onClick={() => setIsVisible(true)}
          style={{ background: 'none', border: 'none', color: 'var(--color-accent-blue)', cursor: 'pointer', fontSize: '0.72rem' }}
        >
          Restore
        </button>
      </div>
    );
  }

  // 1. Top Leaderboard Banner matching Reference Screenshot ("Stitch it all together with Firefly Pro")
  if (position === 'top-leaderboard') {
    return (
      <div
        className="ad-top-leaderboard"
        style={{
          width: '100%',
          maxWidth: 728,
          margin: '0 auto 14px auto',
          background: '#0B0F19',
          borderRadius: 10,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          color: '#FFFFFF',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative'
        }}
        role="complementary"
        aria-label="Leaderboard Advertisement"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              color: '#FFFFFF',
              flexShrink: 0
            }}
          >
            Ai
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Stitch it all together with Firefly Pro.
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
              Generate creative assets with generative AI.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            onClick={onRemoveAdsClick}
            style={{
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Start free trial
          </button>
          <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>Adobe Firefly</span>
          <button
            onClick={() => setIsVisible(false)}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 2 }}
            aria-label="Close ad"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  // 2. Left Skyscraper Ad matching Reference Screenshot ("Save with the Creative Cloud Pro plan")
  if (position === 'sidebar-left') {
    return (
      <div
        className="ad-sidebar-card ad-sidebar-left"
        style={{
          width: '100%',
          background: '#181B20',
          color: '#FFFFFF',
          borderRadius: 14,
          padding: '16px 14px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid #2B313A',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
        role="complementary"
        aria-label="Sidebar Advertisement Left"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.65rem', color: '#8B949E' }}>
          <span>SPONSORED · AdChoices</span>
          <button
            onClick={() => setIsVisible(false)}
            style={{ background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer' }}
            aria-label="Close advertisement"
          >
            <X size={13} />
          </button>
        </div>

        {/* Graphic Area */}
        <div
          style={{
            height: 160,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #FF5E62 0%, #FF9966 50%, #4ECDC4 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0F172A',
            fontWeight: 800,
            fontSize: '1rem',
            padding: 12,
            textAlign: 'center',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)'
          }}
        >
          <span style={{ fontSize: '1.2rem', marginBottom: 4 }}>🎨</span>
          Creative Cloud Pro
        </div>

        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 800, lineHeight: 1.3, marginBottom: 6 }}>
            Save with the Creative Cloud Pro plan.
          </h4>
          <p style={{ fontSize: '0.76rem', color: '#94A3B8', lineHeight: 1.45 }}>
            Up to ₹637/mo less than the cost of three apps for the first year.
          </p>
        </div>

        <button
          onClick={onRemoveAdsClick}
          style={{
            background: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 20,
            padding: '7px 16px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            alignSelf: 'flex-start'
          }}
        >
          Learn more
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingTop: 8, borderTop: '1px solid #2B313A' }}>
          <span style={{ fontSize: '0.72rem', color: '#F43F5E', fontWeight: 800 }}>Adobe</span>
          <span style={{ fontSize: '0.68rem', color: '#8B949E' }}>Creative Cloud Pro</span>
        </div>
      </div>
    );
  }

  // 3. Right Skyscraper Ad Rail matching Reference Screenshot (Firefly Card + Video Ad)
  if (position === 'sidebar-right') {
    return (
      <div className="ad-sidebar-right" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Card 1: Generate images, video and audio */}
        <div
          className="ad-sidebar-card"
          style={{
            width: '100%',
            background: '#151922',
            color: '#FFFFFF',
            borderRadius: 14,
            padding: '16px 14px',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid #272E3B',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
          role="complementary"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94A3B8' }}>
            <span>AdChoices</span>
            <button
              onClick={() => setIsVisible(false)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              aria-label="Close advertisement"
            >
              <X size={13} />
            </button>
          </div>

          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, lineHeight: 1.3, marginBottom: 4 }}>
              Generate images, video and audio. All in one place.
            </h4>
          </div>

          <button
            onClick={onRemoveAdsClick}
            style={{
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              alignSelf: 'flex-start'
            }}
          >
            Learn more
          </button>

          {/* Graphic Banner */}
          <div
            style={{
              height: 110,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #9333EA 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
          >
            Adobe Firefly
          </div>
        </div>

        {/* Card 2: Video Advertisement Slot matching Reference Screenshot */}
        <div
          className="ad-sidebar-card"
          style={{
            width: '100%',
            background: '#0F172A',
            color: '#FFFFFF',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid #1E293B',
            position: 'relative'
          }}
        >
          <div
            style={{
              height: 150,
              background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 12,
              position: 'relative'
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                marginBottom: 6
              }}
            >
              <Play size={18} fill="currentColor" />
            </div>
            <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600 }}>Sponsored Stream</span>

            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: 10,
                right: 10,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.65rem',
                color: '#94A3B8'
              }}
            >
              <span>Advertisement: 0:04</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <Volume2 size={12} />
                <Maximize2 size={12} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Sticky Bottom Anchor Ad Bar matching Reference Screenshot
  if (position === 'sticky-bottom') {
    return (
      <div
        className="ad-sticky-bottom-bar"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 45,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.25)'
        }}
        role="complementary"
        aria-label="Sticky Footer Advertisement"
      >
        <div
          style={{
            maxWidth: 1200,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}
        >
          {/* Ad Block 1: Firefly */}
          <div
            style={{
              flex: 1,
              minWidth: 240,
              background: 'linear-gradient(90deg, #0284C7 0%, #0369A1 100%)',
              color: '#FFFFFF',
              borderRadius: 8,
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Generate video intros in Firefly.
              </div>
              <div style={{ fontSize: '0.68rem', opacity: 0.85 }}>Adobe Firefly</div>
            </div>
            <button
              onClick={onRemoveAdsClick}
              style={{
                background: '#FFFFFF',
                color: '#0369A1',
                border: 'none',
                borderRadius: 20,
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              Start free
            </button>
          </div>

          {/* Ad Block 2: Acrobat */}
          <div
            className="ad-bottom-second-block"
            style={{
              flex: 1,
              minWidth: 240,
              background: 'linear-gradient(90deg, #DC2626 0%, #B91C1C 100%)',
              color: '#FFFFFF',
              borderRadius: 8,
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Unlock insights that spark success.
              </div>
              <div style={{ fontSize: '0.68rem', opacity: 0.85 }}>Adobe Acrobat</div>
            </div>
            <button
              onClick={onRemoveAdsClick}
              style={{
                background: '#FFFFFF',
                color: '#B91C1C',
                border: 'none',
                borderRadius: 20,
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              Start free trial
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              flexShrink: 0
            }}
            aria-label="Close bottom banner"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  // 5. Floating Corner Ad
  if (position === 'floating-bottom-right') {
    return (
      <div
        className="floating-corner-ad"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 320,
          maxWidth: 'calc(100vw - 32px)',
          background: '#0B0F19',
          color: '#FFFFFF',
          borderRadius: 14,
          padding: '12px 14px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
          zIndex: 40,
          border: '1px solid #1E293B',
          animation: 'fadeIn 0.3s ease'
        }}
        role="complementary"
        aria-label="Sponsor Advertisement"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', color: '#94A3B8' }}>
            <span style={{ background: '#1E293B', padding: '2px 5px', borderRadius: 4, fontWeight: 600 }}>SPONSORED</span>
            <span>AdChoices</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 2 }}
            aria-label="Close ad"
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #2596BE 0%, #10B981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem',
              color: '#FFFFFF',
              flexShrink: 0
            }}
          >
            CP
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Chromapick Pro Workspace
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 2, lineHeight: 1.3 }}>
              Export unlimited palettes with zero ads & batch image extraction.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: '1px solid #1E293B' }}>
          <button
            onClick={onRemoveAdsClick}
            style={{
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              border: 'none',
              borderRadius: 6,
              color: '#B45309',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '4px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Sparkles size={11} />
            Remove Ads
          </button>

          <span style={{ fontSize: '0.68rem', color: '#64748B' }}>Ad Demonstration</span>
        </div>
      </div>
    );
  }

  // 6. Standard In-page Banner
  return (
    <div
      style={{
        margin: '24px 0',
        padding: '14px 18px',
        background: 'var(--bg-card-subtle)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14
      }}
      role="complementary"
      aria-label="Sponsor Advertisement"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'var(--btn-gold-bg)',
            border: '1px solid var(--btn-gold-border)',
            color: 'var(--btn-gold-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Sparkles size={18} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Enjoying Chromapick? Support continuous development</span>
            <span style={{ fontSize: '0.68rem', background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 4, color: '#334155', fontWeight: 600 }}>AD</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Switch to Chromapick Pro to unlock unlimited vector exports and clean UI.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onRemoveAdsClick}
          className="btn-gold"
          style={{ fontSize: '0.78rem', padding: '6px 14px' }}
        >
          <Sparkles size={13} />
          Go Pro
        </button>
        <button
          onClick={() => setIsVisible(false)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
          aria-label="Hide advertisement"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
