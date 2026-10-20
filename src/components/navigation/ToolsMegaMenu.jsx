import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Pipette,
  CheckCircle2,
  Eye,
  Grid,
  Palette,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  Shuffle,
  Type
} from 'lucide-react';

export default function ToolsMegaMenu({ isOpen, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="mega-menu-overlay" onClick={onClose} />
      <div className="mega-menu-dropdown" ref={menuRef} role="dialog" aria-label="Tools Navigation">
        {/* Banner Link matching Screenshot 2 */}
        <Link to="/image-color-extractor" className="mega-menu-banner" onClick={onClose}>
          <div className="mega-item-icon" style={{ background: 'var(--color-accent-blue)', color: 'var(--text-inverse)' }}>
            <Pipette size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              Pick color from image
              <ArrowRight size={14} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Upload, paste or link an image: get HEX, RGB, HSL
            </div>
          </div>
        </Link>

        {/* 2-Column Menu Grid matching Screenshot 2 */}
        <div className="mega-menu-grid">
          {/* Column 1: EXTRACT */}
          <div>
            <div className="mega-column-title">EXTRACT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Link to="/color/2596be" className="mega-item" onClick={onClose}>
                <div className="mega-item-icon">
                  <Pipette size={16} />
                </div>
                <div>
                  <div className="mega-item-title">Color picker</div>
                  <div className="mega-item-desc">Explore any color: variations, harmony, accessibility</div>
                </div>
              </Link>

              <Link to="/color-contrast-checker" className="mega-item" onClick={onClose}>
                <div className="mega-item-icon">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="mega-item-title">Contrast checker</div>
                  <div className="mega-item-desc">Check WCAG AA/AAA ratios for any color pair</div>
                </div>
              </Link>

              <Link to="/color-blindness-simulator" className="mega-item" onClick={onClose}>
                <div className="mega-item-icon">
                  <Eye size={16} />
                </div>
                <div>
                  <div className="mega-item-title">Blindness simulator</div>
                  <div className="mega-item-desc">Preview how colors look to color-blind users</div>
                </div>
              </Link>

              <Link to="/browse-colors" className="mega-item" onClick={onClose}>
                <div className="mega-item-icon">
                  <Grid size={16} />
                </div>
                <div>
                  <div className="mega-item-title">Browse colors</div>
                  <div className="mega-item-desc">A catalog of named colors with codes</div>
                </div>
              </Link>

              <Link to="/color-converter" className="mega-item" onClick={onClose}>
                <div className="mega-item-icon">
                  <RefreshCw size={16} />
                </div>
                <div>
                  <div className="mega-item-title">Color converter</div>
                  <div className="mega-item-desc">Convert HEX, RGB, HSL, CMYK, LAB</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Column 2: CREATE */}
          <div>
            <div className="mega-column-title">CREATE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Link to="/color-palette-generator" className="mega-item" onClick={onClose}>
                <div className="mega-item-icon">
                  <Palette size={16} />
                </div>
                <div>
                  <div className="mega-item-title">Palette generator</div>
                  <div className="mega-item-desc">Auto-generate balanced palettes</div>
                </div>
              </Link>

              <Link to="/color-gradient-generator" className="mega-item" onClick={onClose}>
                <div className="mega-item-icon">
                  <Sparkles size={16} />
                </div>
                <div>
                  <div className="mega-item-title">Gradient maker</div>
                  <div className="mega-item-desc">Build CSS gradients with live preview</div>
                </div>
              </Link>

              <Link to="/palette-creator" className="mega-item" onClick={onClose}>
                <div className="mega-item-icon">
                  <Layers size={16} />
                </div>
                <div>
                  <div className="mega-item-title">Palette creator</div>
                  <div className="mega-item-desc">Build a custom palette from scratch</div>
                </div>
              </Link>

              <Link to="/color-palette-generator" className="mega-item" onClick={onClose}>
                <div className="mega-item-icon">
                  <Shuffle size={16} />
                </div>
                <div>
                  <div className="mega-item-title">Harmonies & Tones</div>
                  <div className="mega-item-desc">Explore triadic, complementary & split palettes</div>
                </div>
              </Link>

              <Link to="/font-picker" className="mega-item" onClick={onClose}>
                <div className="mega-item-icon">
                  <Type size={16} />
                </div>
                <div>
                  <div className="mega-item-title">Font Picker & Pairing</div>
                  <div className="mega-item-desc">Browse fonts, preview pairings & export CSS</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
