import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Shield, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand Column */}
          <div>
            <Link to="/" className="brand-logo" style={{ marginBottom: 16 }}>
              <div className="brand-icon-wrap">
                <Palette size={20} />
              </div>
              <span>Chromapick</span>
            </Link>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 320, marginBottom: 18 }}>
              Professional image color extractor, palette generator, and color science studio. All processing runs directly in your browser.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--badge-success-text)', fontWeight: 600 }}>
              <Shield size={16} />
              <span>100% Client-Side Privacy</span>
            </div>
          </div>

          {/* Column 2: COLOR TOOLS (Matching Screenshot 3) */}
          <div>
            <h4 className="footer-col-title">COLOR TOOLS</h4>
            <ul className="footer-links">
              <li><Link to="/image-color-extractor" className="footer-link">Color Picker</Link></li>
              <li><Link to="/color/2596be" className="footer-link">Color Code</Link></li>
              <li><Link to="/color-contrast-checker" className="footer-link">Contrast Checker</Link></li>
              <li><Link to="/color-blindness-simulator" className="footer-link">Blindness Simulator</Link></li>
              <li><Link to="/color-gradient-generator" className="footer-link">Gradient Maker</Link></li>
              <li><Link to="/color/2596be" className="footer-link">HEX Color Picker</Link></li>
              <li><Link to="/color-converter" className="footer-link">Color Converter</Link></li>
            </ul>
          </div>

          {/* Column 3: BROWSE (Matching Screenshot 3) */}
          <div>
            <h4 className="footer-col-title">BROWSE</h4>
            <ul className="footer-links">
              <li><Link to="/browse-colors" className="footer-link">Browse Colors</Link></li>
              <li><Link to="/color-palette-generator" className="footer-link">Color Palettes</Link></li>
              <li><Link to="/palette-creator" className="footer-link">Palette Creator</Link></li>
              <li><Link to="/color-gradient-generator" className="footer-link">CSS Gradients</Link></li>
              <li><Link to="/shadow-picker" className="footer-link">Shadow Picker</Link></li>
              <li><Link to="/border-radius-picker" className="footer-link">Border Radius</Link></li>
              <li><Link to="/glassmorphism-picker" className="footer-link">Glassmorphism Studio</Link></li>
              <li><Link to="/font-picker" className="footer-link">Font Pairing Studio</Link></li>
            </ul>
          </div>

          {/* Column 4: ABOUT (Matching Screenshot 3) */}
          <div>
            <h4 className="footer-col-title">ABOUT</h4>
            <ul className="footer-links">
              <li><Link to="/pricing" className="footer-link">Pricing</Link></li>
              <li><Link to="/about" className="footer-link">About Chromapick</Link></li>
              <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
              <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
              <li><Link to="/about" className="footer-link">Terms of Service</Link></li>
              <li><Link to="/about" className="footer-link">Give Feedback</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} Chromapick Studio. All rights reserved. Free and open client-side color utility.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Crafted with</span>
            <Heart size={14} fill="#EF4444" color="#EF4444" />
            <span>for designers & developers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
