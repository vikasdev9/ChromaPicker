import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, HelpCircle } from 'lucide-react';
import ProModal from '../components/common/ProModal';

export default function PricingPage() {
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState('yearly');

  const faqs = [
    {
      q: 'Do I need to create an account to use the color extractor?',
      a: 'No. Chromapick is completely free to use with zero signup required. All image analysis, dominant color extraction, and palette downloads run entirely in your browser.'
    },
    {
      q: 'Are my uploaded images saved on your servers?',
      a: 'Never. Chromapick operates 100% client-side using the HTML5 Canvas API and Web Workers. Your images never leave your computer.'
    },
    {
      q: 'What extra features come with Chromapick Pro?',
      a: 'Chromapick Pro provides a completely ad-free workspace, batch multi-image color extraction, and unlimited cloud palette syncing.'
    },
    {
      q: 'Can I export palettes for Adobe Creative Cloud or Figma?',
      a: 'Yes! Chromapick supports JSON, SVG, PNG swatches, CSS variables, SCSS variables, and GPL files.'
    }
  ];

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', padding: '40px 16px 32px 16px', maxWidth: 840, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Simple, Transparent Pricing
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto' }}>
          Use all core color extraction, palette generation, and contrast tools completely free. Upgrade to Pro for an ad-free, high-productivity studio experience.
        </p>

        {/* Billing Switcher */}
        <div style={{ display: 'inline-flex', background: 'var(--bg-card)', padding: 4, borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', marginTop: 24 }}>
          <button
            onClick={() => setBillingCycle('monthly')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: billingCycle === 'monthly' ? 'var(--btn-primary-bg)' : 'transparent',
              color: billingCycle === 'monthly' ? 'var(--btn-primary-text)' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: billingCycle === 'yearly' ? 'var(--btn-primary-bg)' : 'transparent',
              color: billingCycle === 'yearly' ? 'var(--btn-primary-text)' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Annual (Save 40%)
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 28,
          maxWidth: 920,
          margin: '0 auto 64px auto'
        }}
      >
        {/* Free Plan */}
        <div className="chroma-card" style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Free Community</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Everything needed to extract and create professional color palettes.
            </p>
          </div>

          <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24 }}>
            $0 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ forever</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {[
              'Unlimited browser-side image color extraction',
              'Dominant color frequency calculation',
              'Real-time loupe pixel inspector',
              'WCAG 2.1 contrast ratio checker & auto-fix',
              'CSS gradient generator with live preview',
              'Color blindness simulation (8 vision types)',
              'Export to JSON, CSS, SCSS, SVG, PNG & TXT',
              'Access to 350+ named colors catalog'
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem' }}>
                <Check size={16} color="#10B981" strokeWidth={2.5} />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <button
            className="btn-secondary"
            style={{ width: '100%', marginTop: 'auto', padding: '12px' }}
            onClick={() => window.location.href = '/image-color-extractor'}
          >
            Start Using Free Now
          </button>
        </div>

        {/* Pro Plan */}
        <div
          className="chroma-card"
          style={{
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            border: '2px solid var(--color-accent-blue)',
            position: 'relative'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -12,
              right: 24,
              background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, #10B981 100%)',
              color: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: '0.72rem',
              fontWeight: 700
            }}
          >
            RECOMMENDED
          </div>

          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Chromapick Pro</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Enhanced toolkit for professional design agencies and power users.
            </p>
          </div>

          <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24 }}>
            {billingCycle === 'yearly' ? '$2.99' : '$4.99'}{' '}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ month</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {[
              'Everything in Free Plan',
              '100% Ad-Free interface across all studio tools',
              'Batch multi-image color extraction',
              'Advanced Delta-E 2000 precision quantization',
              'Cloud synced palette library across devices',
              'Unlimited high-resolution vector exports',
              'Export palettes directly to Figma / Adobe ASE',
              'Priority customer support'
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem' }}>
                <Check size={16} color="var(--color-accent-blue)" strokeWidth={2.5} />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: 'auto', padding: '12px' }}
            onClick={() => setIsProModalOpen(true)}
          >
            <Sparkles size={16} />
            <span>Try Pro Free (14 Days)</span>
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', marginBottom: 28 }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {faqs.map((faq, i) => (
            <div key={i} className="chroma-card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <HelpCircle size={18} color="var(--color-accent-blue)" />
                <span>{faq.q}</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: 26 }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      <ProModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
