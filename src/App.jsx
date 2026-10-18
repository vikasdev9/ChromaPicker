import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { PaletteProvider } from './context/PaletteContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import ColorDetailPage from './pages/ColorDetailPage';
import PaletteGeneratorPage from './pages/PaletteGeneratorPage';
import ContrastCheckerPage from './pages/ContrastCheckerPage';
import GradientGeneratorPage from './pages/GradientGeneratorPage';
import ColorBlindnessPage from './pages/ColorBlindnessPage';
import BrowseColorsPage from './pages/BrowseColorsPage';
import ColorConverterPage from './pages/ColorConverterPage';
import PaletteCreatorPage from './pages/PaletteCreatorPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';

function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 12 }}>404</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>The color or page you are looking for does not exist.</p>
      <a href="/" className="btn-primary" style={{ display: 'inline-flex' }}>
        Return to Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <PaletteProvider>
          <BrowserRouter>
            {/* Ambient Background Gradient with subtle vertical lines matching Screenshot 1 & 2 */}
            <div className="chromapick-bg-ambient" />

            <div className="app-container">
              <Header />

              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/image-color-extractor" element={<HomePage />} />
                  <Route path="/color-picker" element={<Navigate to="/color/2596be" replace />} />
                  <Route path="/color/:hex" element={<ColorDetailPage />} />
                  <Route path="/color-palette-generator" element={<PaletteGeneratorPage />} />
                  <Route path="/color-contrast-checker" element={<ContrastCheckerPage />} />
                  <Route path="/color-gradient-generator" element={<GradientGeneratorPage />} />
                  <Route path="/color-blindness-simulator" element={<ColorBlindnessPage />} />
                  <Route path="/browse-colors" element={<BrowseColorsPage />} />
                  <Route path="/color-converter" element={<ColorConverterPage />} />
                  <Route path="/palette-creator" element={<PaletteCreatorPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </BrowserRouter>
        </PaletteProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
