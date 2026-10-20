import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Palette,
  ChevronDown,
  Star,
  Sun,
  Moon,
  Menu,
  X,
  Pipette,
  CheckCircle2,
  Eye,
  Sparkles,
  Grid,
  Type,
  BoxSelect,
  Square
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ToolsMegaMenu from '../navigation/ToolsMegaMenu';
import ProModal from '../common/ProModal';
import AuthModal from '../common/AuthModal';

export default function Header() {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [authModalState, setAuthModalState] = useState({ isOpen: false, mode: 'login' });

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          {/* Brand Logo matching Screenshot 1 & 2 */}
          <Link to="/" className="brand-logo" onClick={() => setIsToolsOpen(false)}>
            <div className="brand-icon-wrap">
              <Palette size={20} />
            </div>
            <span>Chromapick</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="header-nav">
            <div style={{ position: 'relative' }}>
              <button
                className={`nav-link ${isToolsOpen ? 'active' : ''}`}
                onClick={() => setIsToolsOpen(prev => !prev)}
                aria-expanded={isToolsOpen}
              >
                <span>Tools</span>
                <ChevronDown
                  size={15}
                  style={{
                    transform: isToolsOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </button>

              <ToolsMegaMenu isOpen={isToolsOpen} onClose={() => setIsToolsOpen(false)} />
            </div>

            <Link
              to="/image-color-extractor"
              className={`nav-link ${location.pathname === '/image-color-extractor' ? 'active' : ''}`}
            >
              <Pipette size={15} />
              <span>Color picker</span>
            </Link>

            <Link
              to="/color-palette-generator"
              className={`nav-link ${location.pathname === '/color-palette-generator' ? 'active' : ''}`}
            >
              <span>Palettes</span>
            </Link>

            <Link
              to="/pricing"
              className={`nav-link ${location.pathname === '/pricing' ? 'active' : ''}`}
            >
              <span>Pricing</span>
            </Link>
          </nav>

          {/* Header Right Actions */}
          <div className="header-actions">
            {/* Gold Remove Ads button matching screenshot 1 */}
            <button
              className="btn-gold header-desktop-action"
              onClick={() => setIsProModalOpen(true)}
              title="Remove advertisements and unlock Pro features"
            >
              <Star size={14} fill="currentColor" />
              <span>Remove ads</span>
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Auth Demonstration Buttons */}
            <button
              className="btn-login header-desktop-action"
              onClick={() => setAuthModalState({ isOpen: true, mode: 'login' })}
            >
              Login
            </button>

            <button
              className="btn-signup header-desktop-action"
              onClick={() => setAuthModalState({ isOpen: true, mode: 'signup' })}
            >
              Sign up
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              className="theme-toggle-btn mobile-only-btn"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            top: 'var(--header-height)',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 90
          }}
        >
          <div
            className="mobile-drawer-content"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              height: '100%',
              maxWidth: 380,
              marginLeft: 'auto',
              padding: '20px 20px 40px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              boxShadow: 'var(--shadow-lg)',
              borderLeft: '1px solid var(--border-color)'
            }}
          >
            {/* Top Quick Actions in Drawer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
              <button
                className="btn-gold"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsProModalOpen(true);
                }}
                style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', minHeight: 44 }}
              >
                <Star size={16} fill="currentColor" />
                <span>Remove Ads & Unlock Pro</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  className="btn-login"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setAuthModalState({ isOpen: true, mode: 'login' });
                  }}
                  style={{ width: '100%', justifyContent: 'center', minHeight: 44 }}
                >
                  Login
                </button>
                <button
                  className="btn-signup"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setAuthModalState({ isOpen: true, mode: 'signup' });
                  }}
                  style={{ width: '100%', justifyContent: 'center', minHeight: 44 }}
                >
                  Sign up
                </button>
              </div>
            </div>

            {/* Navigation links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Color Tools
              </span>

              <Link
                to="/image-color-extractor"
                className="nav-link"
                style={{ fontSize: '0.95rem', padding: '10px 14px', borderRadius: 'var(--radius-md)', minHeight: 44 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Pipette size={18} color="var(--color-accent-blue)" />
                <span>Image Color Extractor</span>
              </Link>
              <Link
                to="/color/2596be"
                className="nav-link"
                style={{ fontSize: '0.95rem', padding: '10px 14px', borderRadius: 'var(--radius-md)', minHeight: 44 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Palette size={18} color="#6366F1" />
                <span>Color Details & Harmonies</span>
              </Link>
              <Link
                to="/color-palette-generator"
                className="nav-link"
                style={{ fontSize: '0.95rem', padding: '10px 14px', borderRadius: 'var(--radius-md)', minHeight: 44 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Sparkles size={18} color="#EC4899" />
                <span>Palette Generator</span>
              </Link>
              <Link
                to="/color-contrast-checker"
                className="nav-link"
                style={{ fontSize: '0.95rem', padding: '10px 14px', borderRadius: 'var(--radius-md)', minHeight: 44 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <CheckCircle2 size={18} color="#10B981" />
                <span>Contrast Checker (WCAG)</span>
              </Link>
              <Link
                to="/color-blindness-simulator"
                className="nav-link"
                style={{ fontSize: '0.95rem', padding: '10px 14px', borderRadius: 'var(--radius-md)', minHeight: 44 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Eye size={18} color="#A855F7" />
                <span>Blindness Simulator</span>
              </Link>
              <Link
                to="/browse-colors"
                className="nav-link"
                style={{ fontSize: '0.95rem', padding: '10px 14px', borderRadius: 'var(--radius-md)', minHeight: 44 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Grid size={18} color="#F59E0B" />
                <span>Browse 300+ Colors</span>
              </Link>
              <Link
                to="/font-picker"
                className="nav-link"
                style={{ fontSize: '0.95rem', padding: '10px 14px', borderRadius: 'var(--radius-md)', minHeight: 44 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Type size={18} color="var(--color-accent-blue)" />
                <span>Font Picker & Pairing</span>
              </Link>
              <Link
                to="/shadow-picker"
                className="nav-link"
                style={{ fontSize: '0.95rem', padding: '10px 14px', borderRadius: 'var(--radius-md)', minHeight: 44 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BoxSelect size={18} color="var(--color-accent-blue)" />
                <span>Shadow Picker</span>
              </Link>
              <Link
                to="/border-radius-picker"
                className="nav-link"
                style={{ fontSize: '0.95rem', padding: '10px 14px', borderRadius: 'var(--radius-md)', minHeight: 44 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Square size={18} color="var(--color-accent-blue)" />
                <span>Border Radius</span>
              </Link>
              <Link
                to="/pricing"
                className="nav-link"
                style={{ fontSize: '0.95rem', padding: '10px 14px', borderRadius: 'var(--radius-md)', minHeight: 44 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Pricing & Pro</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Demonstration Modals */}
      <ProModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
      <AuthModal
        isOpen={authModalState.isOpen}
        mode={authModalState.mode}
        onClose={() => setAuthModalState({ isOpen: false, mode: 'login' })}
        onSwitchMode={(newMode) => setAuthModalState({ isOpen: true, mode: newMode })}
      />
    </>
  );
}
