import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Type,
  Sparkles,
  ArrowLeftRight,
  RotateCcw,
  Share2,
  Code,
  Search,
  Sliders,
  Copy,
  Heart,
  Grid,
  ScanText
} from 'lucide-react';
import {
  FONT_CATALOG,
  FONT_CATEGORIES,
  TYPOGRAPHY_PRESETS,
  SUGGESTED_PAIRINGS
} from '../data/fontCatalog';
import { loadFontOnDemand } from '../utils/fontLoader';
import FontCard from '../components/fonts/FontCard';
import FontPreviewMockup from '../components/fonts/FontPreviewMockup';
import FontCssExportModal from '../components/fonts/FontCssExportModal';
import FontImageWorkspace from '../components/fonts/FontImageWorkspace';
import { useToast } from '../context/ToastContext';

// Local storage key for favorite fonts
const FAVORITES_STORAGE_KEY = 'chromapick_favorite_fonts';

export default function FontPickerPage() {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  // Active Main Tab: 'pairing' | 'catalog' | 'tester'
  const [activeTab, setActiveTab] = useState('pairing');

  // Favorites state (persisted in localStorage)
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['Inter', 'Playfair Display', 'Space Grotesk'];
    } catch {
      return ['Inter', 'Playfair Display', 'Space Grotesk'];
    }
  });

  const toggleFavorite = useCallback((family) => {
    setFavorites(prev => {
      const next = prev.includes(family)
        ? prev.filter(f => f !== family)
        : [...prev, family];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save font favorites', err);
      }
      return next;
    });
  }, []);

  // Selected Preset tracking
  const [selectedPresetId, setSelectedPresetId] = useState('modern-saas');

  // Heading Font State
  const [headingFamily, setHeadingFamily] = useState('Plus Jakarta Sans');
  const [headingWeight, setHeadingWeight] = useState(700);
  const [headingStyle, setHeadingStyle] = useState('normal'); // 'normal' | 'italic'
  const [headingSize, setHeadingSize] = useState(40);
  const [headingLineHeight, setHeadingLineHeight] = useState(1.2);
  const [headingLetterSpacing, setHeadingLetterSpacing] = useState(-0.8);

  // Body Font State
  const [bodyFamily, setBodyFamily] = useState('Inter');
  const [bodyWeight, setBodyWeight] = useState(400);
  const [bodyStyle, setBodyStyle] = useState('normal');
  const [bodySize, setBodySize] = useState(16);
  const [bodyLineHeight, setBodyLineHeight] = useState(1.65);
  const [bodyLetterSpacing, setBodyLetterSpacing] = useState(-0.1);

  // Export Modal State
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Font Catalog Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popularity'); // 'popularity' | 'name-asc' | 'name-desc'
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [librarySampleText, setLibrarySampleText] = useState('The quick brown fox jumps over the lazy dog.');

  // Single Font Tester State
  const [testerFamily, setTesterFamily] = useState('Inter');
  const [testerWeight, setTesterWeight] = useState(400);
  const [testerStyle, setTesterStyle] = useState('normal');
  const [testerText, setTesterText] = useState('Sphinx of black quartz, judge my vow.');

  // Hydrate from URL query parameters (?h=...&b=...) on mount
  useEffect(() => {
    const urlHeading = searchParams.get('h');
    const urlBody = searchParams.get('b');
    const urlHeadingWeight = searchParams.get('hw');
    const urlBodyWeight = searchParams.get('bw');

    if (urlHeading && FONT_CATALOG.some(f => f.family.toLowerCase() === urlHeading.toLowerCase())) {
      const match = FONT_CATALOG.find(f => f.family.toLowerCase() === urlHeading.toLowerCase());
      setHeadingFamily(match.family);
      if (urlHeadingWeight && match.weights.includes(Number(urlHeadingWeight))) {
        setHeadingWeight(Number(urlHeadingWeight));
      }
    }

    if (urlBody && FONT_CATALOG.some(f => f.family.toLowerCase() === urlBody.toLowerCase())) {
      const match = FONT_CATALOG.find(f => f.family.toLowerCase() === urlBody.toLowerCase());
      setBodyFamily(match.family);
      if (urlBodyWeight && match.weights.includes(Number(urlBodyWeight))) {
        setBodyWeight(Number(urlBodyWeight));
      }
    }
  }, [searchParams]);

  // Lookup font objects
  const headingFont = useMemo(() => {
    return FONT_CATALOG.find(f => f.family === headingFamily) || FONT_CATALOG[0];
  }, [headingFamily]);

  const bodyFont = useMemo(() => {
    return FONT_CATALOG.find(f => f.family === bodyFamily) || FONT_CATALOG[1];
  }, [bodyFamily]);

  const testerFont = useMemo(() => {
    return FONT_CATALOG.find(f => f.family === testerFamily) || FONT_CATALOG[0];
  }, [testerFamily]);

  // Ensure current font weights are supported by the active family
  useEffect(() => {
    if (!headingFont.weights.includes(headingWeight)) {
      setHeadingWeight(headingFont.weights[headingFont.weights.length - 1] || 700);
    }
    if (!headingFont.hasItalic && headingStyle === 'italic') {
      setHeadingStyle('normal');
    }
  }, [headingFont, headingWeight, headingStyle]);

  useEffect(() => {
    if (!bodyFont.weights.includes(bodyWeight)) {
      setBodyWeight(bodyFont.weights.includes(400) ? 400 : bodyFont.weights[0]);
    }
    if (!bodyFont.hasItalic && bodyStyle === 'italic') {
      setBodyStyle('normal');
    }
  }, [bodyFont, bodyWeight, bodyStyle]);

  useEffect(() => {
    if (!testerFont.weights.includes(testerWeight)) {
      setTesterWeight(testerFont.weights.includes(400) ? 400 : testerFont.weights[0]);
    }
    if (!testerFont.hasItalic && testerStyle === 'italic') {
      setTesterStyle('normal');
    }
  }, [testerFont, testerWeight, testerStyle]);

  // On-demand dynamic font loading whenever fonts or weights change
  useEffect(() => {
    loadFontOnDemand(headingFont.family, [headingWeight], headingStyle === 'italic');
  }, [headingFont.family, headingWeight, headingStyle]);

  useEffect(() => {
    loadFontOnDemand(bodyFont.family, [bodyWeight], bodyStyle === 'italic');
  }, [bodyFont.family, bodyWeight, bodyStyle]);

  useEffect(() => {
    if (activeTab === 'tester') {
      loadFontOnDemand(testerFont.family, testerFont.weights, testerFont.hasItalic);
    }
  }, [activeTab, testerFont.family, testerFont.weights, testerFont.hasItalic]);

  // Apply a Preset
  const handleApplyPreset = (preset) => {
    setSelectedPresetId(preset.id);

    // Apply Heading
    setHeadingFamily(preset.heading.family);
    setHeadingWeight(preset.heading.weight);
    setHeadingStyle(preset.heading.style || 'normal');
    setHeadingSize(preset.heading.size);
    setHeadingLineHeight(preset.heading.lineHeight);
    setHeadingLetterSpacing(preset.heading.letterSpacing);

    // Apply Body
    setBodyFamily(preset.body.family);
    setBodyWeight(preset.body.weight);
    setBodyStyle(preset.body.style || 'normal');
    setBodySize(preset.body.size);
    setBodyLineHeight(preset.body.lineHeight);
    setBodyLetterSpacing(preset.body.letterSpacing);

    showToast(`Applied preset: ${preset.name}`, 'info');
  };

  // Swap Heading & Body Fonts
  const handleSwapFonts = () => {
    const tempFamily = headingFamily;
    const tempWeight = headingWeight;
    const tempStyle = headingStyle;

    setHeadingFamily(bodyFamily);
    setHeadingWeight(bodyWeight);
    setHeadingStyle(bodyStyle);

    setBodyFamily(tempFamily);
    setBodyWeight(tempWeight);
    setBodyStyle(tempStyle);

    showToast('Swapped Heading and Body fonts!', 'info');
  };

  // Suggest Random Pairing
  const handleSuggestPairing = () => {
    // Pick a pairing that isn't the current one
    const available = SUGGESTED_PAIRINGS.filter(
      p => p.heading !== headingFamily || p.body !== bodyFamily
    );
    const suggestion = available[Math.floor(Math.random() * available.length)] || SUGGESTED_PAIRINGS[0];

    const hMatch = FONT_CATALOG.find(f => f.family === suggestion.heading);
    const bMatch = FONT_CATALOG.find(f => f.family === suggestion.body);

    if (hMatch && bMatch) {
      setHeadingFamily(hMatch.family);
      setHeadingWeight(hMatch.weights[hMatch.weights.length - 1] || 700);
      setBodyFamily(bMatch.family);
      setBodyWeight(bMatch.weights.includes(400) ? 400 : bMatch.weights[0]);
      setSelectedPresetId('');
      showToast(`Suggested pairing: ${hMatch.family} + ${bMatch.family}`, 'info');
    }
  };

  // Reset to Default
  const handleResetDefaults = () => {
    const defaultPreset = TYPOGRAPHY_PRESETS[0];
    handleApplyPreset(defaultPreset);
    showToast('Reset to default typography settings', 'info');
  };

  // Share Pairing via URL
  const handleShareUrl = () => {
    const params = new URLSearchParams();
    params.set('h', headingFamily);
    params.set('hw', headingWeight.toString());
    params.set('b', bodyFamily);
    params.set('bw', bodyWeight.toString());

    const shareUrl = `${window.location.origin}/font-picker?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Pairing link copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy link', 'error');
    });
  };

  // Image Finder Integration Handlers
  const handleApplyCandidateAsHeading = (candidate, estimatedWeight, estimatedStyle) => {
    if (!candidate) return;
    const match = FONT_CATALOG.find(f => f.family === candidate.family) || candidate;
    setHeadingFamily(match.family);
    if (estimatedWeight && match.weights && match.weights.includes(Number(estimatedWeight))) {
      setHeadingWeight(Number(estimatedWeight));
    } else if (match.weights && match.weights.length > 0) {
      setHeadingWeight(match.weights[match.weights.length - 1] || 700);
    }
    if (estimatedStyle === 'italic' && match.hasItalic) {
      setHeadingStyle('italic');
    } else {
      setHeadingStyle('normal');
    }
    setSelectedPresetId('');
    showToast(`Applied "${match.family}" as Heading Font in Studio`, 'success');
  };

  const handleApplyCandidateAsBody = (candidate, estimatedWeight, estimatedStyle) => {
    if (!candidate) return;
    const match = FONT_CATALOG.find(f => f.family === candidate.family) || candidate;
    setBodyFamily(match.family);
    if (estimatedWeight && match.weights && match.weights.includes(Number(estimatedWeight))) {
      setBodyWeight(Number(estimatedWeight));
    } else if (match.weights && match.weights.length > 0) {
      setBodyWeight(match.weights.includes(400) ? 400 : match.weights[0]);
    }
    if (estimatedStyle === 'italic' && match.hasItalic) {
      setBodyStyle('italic');
    } else {
      setBodyStyle('normal');
    }
    setSelectedPresetId('');
    showToast(`Applied "${match.family}" as Body Font in Studio`, 'success');
  };

  const handleOpenCandidateInTester = (family, weight, style) => {
    const match = FONT_CATALOG.find(f => f.family === family);
    if (match) {
      setTesterFamily(match.family);
      if (weight && match.weights.includes(Number(weight))) {
        setTesterWeight(Number(weight));
      }
      if (style === 'italic' && match.hasItalic) {
        setTesterStyle('italic');
      } else {
        setTesterStyle('normal');
      }
      setActiveTab('tester');
      showToast(`Opened "${match.family}" in Specimen Tester`, 'info');
    }
  };

  const handleSearchCandidateInLibrary = (family) => {
    setSearchQuery(family);
    setSelectedCategory('all');
    setActiveTab('catalog');
  };

  // Image Finder target slot tracking ('heading' | 'body' | null)
  const [imageTargetSlot, setImageTargetSlot] = useState(null);
  const [pendingImageFile, setPendingImageFile] = useState(null);

  // Filter and sort catalog
  const filteredCatalog = useMemo(() => {
    return FONT_CATALOG.filter(font => {
      // Category filter
      if (selectedCategory !== 'all' && font.category !== selectedCategory) {
        return false;
      }
      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(font.family)) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesFamily = font.family.toLowerCase().includes(query);
        const matchesDesc = font.description.toLowerCase().includes(query);
        const matchesCat = font.category.toLowerCase().includes(query);
        return matchesFamily || matchesDesc || matchesCat;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'popularity') {
        return b.popularity - a.popularity;
      }
      if (sortBy === 'name-asc') {
        return a.family.localeCompare(b.family);
      }
      if (sortBy === 'name-desc') {
        return b.family.localeCompare(a.family);
      }
      return 0;
    });
  }, [selectedCategory, showFavoritesOnly, searchQuery, sortBy, favorites]);

  // Quick CSS Snippet for bottom box
  const quickCss = useMemo(() => {
    return `:root {\n  --font-heading: '${headingFont.family}', ${headingFont.fallback || 'sans-serif'};\n  --font-body: '${bodyFont.family}', ${bodyFont.fallback || 'sans-serif'};\n}`;
  }, [headingFont, bodyFont]);

  return (
    <div className="content-container" style={{ padding: '32px 20px 80px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(56, 189, 248, 0.14)',
              color: 'var(--color-accent-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Type size={20} />
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, margin: 0 }}>
            Font Picker & Pairing Studio
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: 780, margin: 0, lineHeight: 1.55 }}>
          Explore Google & system typography, preview custom text specimens, craft harmonious heading & body pairings, and export production-ready CSS rules for your web projects.
        </p>

        {/* Action Bar: Presets & Tools */}
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            padding: '14px 18px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          {/* Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Presets:
            </span>
            {TYPOGRAPHY_PRESETS.map(preset => {
              const isActive = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    border: isActive ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                    background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-input)',
                    color: isActive ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
                    padding: '5px 11px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition-normal)'
                  }}
                  title={preset.description}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>

          {/* Studio Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleSwapFonts}
              style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              title="Swap Heading and Body fonts"
            >
              <ArrowLeftRight size={14} />
              <span>Swap</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleSuggestPairing}
              style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              title="Generate a suggested pairing from catalog"
            >
              <Sparkles size={14} color="#A855F7" />
              <span>Suggest</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetDefaults}
              style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              title="Reset pairing to default"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleShareUrl}
              style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              title="Copy link to current pairing"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setImageTargetSlot(null);
                setActiveTab('image-finder');
              }}
              style={{
                padding: '7px 12px',
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
              title="Identify typography from an image or screenshot"
            >
              <ScanText size={14} />
              <span>Match from Image</span>
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsExportOpen(true)}
              style={{ padding: '7px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Code size={14} />
              <span>Export CSS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          borderBottom: '1px solid var(--border-color)',
          marginBottom: 24
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('pairing')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'pairing' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'pairing' ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Sliders size={16} />
          <span>Font Pairing Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'catalog' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'catalog' ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Grid size={16} />
          <span>Font Library & Search</span>
          <span
            style={{
              fontSize: '0.7rem',
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-input)',
              color: 'var(--text-muted)'
            }}
          >
            {FONT_CATALOG.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tester')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'tester' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'tester' ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Type size={16} />
          <span>Single Font Specimen Tester</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('image-finder')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'image-finder' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'image-finder' ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <ScanText size={16} />
          <span>Identify from Image</span>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #38BDF8 0%, #A855F7 100%)',
              color: '#fff',
              letterSpacing: '0.04em'
            }}
          >
            NEW
          </span>
        </button>
      </div>

      {/* ================= TAB 1: PAIRING STUDIO ================= */}
      {activeTab === 'pairing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Dual Font Controllers: Heading & Body */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 20
            }}
          >
            {/* Heading Font Controller */}
            <div
              className="chroma-card"
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      background: 'rgba(56, 189, 248, 0.14)',
                      color: 'var(--color-accent-blue)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}
                  >
                    H
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Heading Font</h3>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {headingFont.category}
                </span>
              </div>

              {/* Font Family Selector */}
              <div style={{ marginBottom: 14 }}>
                <label htmlFor="heading-family-select" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>
                  Font Family
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="heading-family-select"
                    value={headingFamily}
                    onChange={e => {
                      setHeadingFamily(e.target.value);
                      setSelectedPresetId('');
                    }}
                    className="input-text"
                    style={{ width: '100%', cursor: 'pointer', appearance: 'auto' }}
                  >
                    {FONT_CATALOG.map(f => (
                      <option key={f.family} value={f.family}>
                        {f.family} ({f.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Weight & Style Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label htmlFor="heading-weight-select" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>
                    Font Weight
                  </label>
                  <select
                    id="heading-weight-select"
                    value={headingWeight}
                    onChange={e => setHeadingWeight(Number(e.target.value))}
                    className="input-text"
                    style={{ width: '100%', appearance: 'auto' }}
                  >
                    {headingFont.weights.map(w => (
                      <option key={w} value={w}>
                        {w} {w === 400 ? 'Regular' : w === 600 ? 'SemiBold' : w === 700 ? 'Bold' : w === 800 ? 'ExtraBold' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="heading-style-select" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>
                    Style
                  </label>
                  <select
                    id="heading-style-select"
                    value={headingStyle}
                    onChange={e => setHeadingStyle(e.target.value)}
                    disabled={!headingFont.hasItalic}
                    className="input-text"
                    style={{ width: '100%', appearance: 'auto', opacity: !headingFont.hasItalic ? 0.6 : 1 }}
                  >
                    <option value="normal">Normal</option>
                    {headingFont.hasItalic && <option value="italic">Italic</option>}
                  </select>
                </div>
              </div>

              {/* Size Slider */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                  <span>Size</span>
                  <span style={{ color: 'var(--color-accent-blue)', fontFamily: 'var(--font-mono)' }}>{headingSize}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="64"
                  value={headingSize}
                  onChange={e => setHeadingSize(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
                />
              </div>

              {/* Line Height & Letter Spacing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                    <span>Line Height</span>
                    <span style={{ color: 'var(--color-accent-blue)', fontFamily: 'var(--font-mono)' }}>{headingLineHeight}</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="1.6"
                    step="0.05"
                    value={headingLineHeight}
                    onChange={e => setHeadingLineHeight(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                    <span>Spacing</span>
                    <span style={{ color: 'var(--color-accent-blue)', fontFamily: 'var(--font-mono)' }}>{headingLetterSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="-2"
                    max="4"
                    step="0.2"
                    value={headingLetterSpacing}
                    onChange={e => setHeadingLetterSpacing(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            {/* Body Font Controller */}
            <div
              className="chroma-card"
              onDragOver={e => {
                e.preventDefault();
                setIsBodyDragging(true);
              }}
              onDragLeave={() => setIsBodyDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setIsBodyDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handlePickFromImageForBody(e.dataTransfer.files[0]);
                }
              }}
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      background: 'rgba(168, 85, 247, 0.14)',
                      color: '#A855F7',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}
                  >
                    P
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Body Font</h3>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {bodyFont.category}
                </span>
              </div>

              {/* Font Family Selector */}
              <div style={{ marginBottom: 14 }}>
                <label htmlFor="body-family-select" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>
                  Font Family
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="body-family-select"
                    value={bodyFamily}
                    onChange={e => {
                      setBodyFamily(e.target.value);
                      setSelectedPresetId('');
                    }}
                    className="input-text"
                    style={{ width: '100%', cursor: 'pointer', appearance: 'auto' }}
                  >
                    {FONT_CATALOG.map(f => (
                      <option key={f.family} value={f.family}>
                        {f.family} ({f.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Weight & Style Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label htmlFor="body-weight-select" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>
                    Font Weight
                  </label>
                  <select
                    id="body-weight-select"
                    value={bodyWeight}
                    onChange={e => setBodyWeight(Number(e.target.value))}
                    className="input-text"
                    style={{ width: '100%', appearance: 'auto' }}
                  >
                    {bodyFont.weights.map(w => (
                      <option key={w} value={w}>
                        {w} {w === 300 ? 'Light' : w === 400 ? 'Regular' : w === 500 ? 'Medium' : w === 700 ? 'Bold' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="body-style-select" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>
                    Style
                  </label>
                  <select
                    id="body-style-select"
                    value={bodyStyle}
                    onChange={e => setBodyStyle(e.target.value)}
                    disabled={!bodyFont.hasItalic}
                    className="input-text"
                    style={{ width: '100%', appearance: 'auto', opacity: !bodyFont.hasItalic ? 0.6 : 1 }}
                  >
                    <option value="normal">Normal</option>
                    {bodyFont.hasItalic && <option value="italic">Italic</option>}
                  </select>
                </div>
              </div>

              {/* Size Slider */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                  <span>Size</span>
                  <span style={{ color: '#A855F7', fontFamily: 'var(--font-mono)' }}>{bodySize}px</span>
                </div>
                <input
                  type="range"
                  min="13"
                  max="22"
                  value={bodySize}
                  onChange={e => setBodySize(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#A855F7', cursor: 'pointer' }}
                />
              </div>

              {/* Line Height & Letter Spacing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                    <span>Line Height</span>
                    <span style={{ color: '#A855F7', fontFamily: 'var(--font-mono)' }}>{bodyLineHeight}</span>
                  </div>
                  <input
                    type="range"
                    min="1.3"
                    max="2.0"
                    step="0.05"
                    value={bodyLineHeight}
                    onChange={e => setBodyLineHeight(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#A855F7', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                    <span>Spacing</span>
                    <span style={{ color: '#A855F7', fontFamily: 'var(--font-mono)' }}>{bodyLetterSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max="3"
                    step="0.1"
                    value={bodyLetterSpacing}
                    onChange={e => setBodyLetterSpacing(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#A855F7', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Realistic In-Context Sample Layout Preview */}
          <FontPreviewMockup
            headingFont={headingFont}
            bodyFont={bodyFont}
            headingWeight={headingWeight}
            headingStyle={headingStyle}
            headingSize={headingSize}
            headingLineHeight={headingLineHeight}
            headingLetterSpacing={headingLetterSpacing}
            bodyWeight={bodyWeight}
            bodyStyle={bodyStyle}
            bodySize={bodySize}
            bodyLineHeight={bodyLineHeight}
            bodyLetterSpacing={bodyLetterSpacing}
          />

          {/* Quick CSS Preview Footer Bar */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                CSS VARIABLES SNIPPET
              </div>
              <code style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent-blue)' }}>
                --font-heading: '{headingFont.family}'; --font-body: '{bodyFont.family}';
              </code>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(quickCss);
                  showToast('Copied CSS variables to clipboard!', 'success');
                }}
                style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Copy size={14} />
                <span>Copy Variables</span>
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsExportOpen(true)}
                style={{ padding: '7px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Code size={14} />
                <span>Full CSS Export</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: FONT LIBRARY & SEARCH ================= */}
      {activeTab === 'catalog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Pick from Image Discovery Banner */}
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ScanText size={18} color="var(--color-accent-blue)" />
              <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                Saw a font in an image or screenshot? Identify stroke geometry and match Google Fonts.
              </span>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setActiveTab('image-finder')}
              style={{
                padding: '6px 12px',
                fontSize: '0.76rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>Open Image Font Finder</span>
            </button>
          </div>

          {/* Search, Filter & Sample Text Bar */}
          <div
            className="chroma-card"
            style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            {/* Top row: Search input + Sorting + Favorites Toggle */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search fonts by name, style or characteristic..."
                  className="input-text"
                  style={{ paddingLeft: 36, width: '100%' }}
                />
              </div>

              {/* Sort by */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label htmlFor="font-sort-select" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Sort:
                </label>
                <select
                  id="font-sort-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="input-text"
                  style={{ padding: '6px 10px', fontSize: '0.82rem', appearance: 'auto' }}
                >
                  <option value="popularity">Most Popular</option>
                  <option value="name-asc">Alphabetical (A - Z)</option>
                  <option value="name-desc">Alphabetical (Z - A)</option>
                </select>
              </div>

              {/* Favorites Only toggle */}
              <button
                type="button"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                style={{
                  border: showFavoritesOnly ? '1px solid #EC4899' : '1px solid var(--border-color)',
                  background: showFavoritesOnly ? 'rgba(236, 72, 153, 0.12)' : 'var(--bg-input)',
                  color: showFavoritesOnly ? '#EC4899' : 'var(--text-secondary)',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <Heart size={14} fill={showFavoritesOnly ? '#EC4899' : 'none'} />
                <span>Favorites ({favorites.length})</span>
              </button>
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {FONT_CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      border: isSelected ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                      background: isSelected ? 'var(--color-accent-blue)' : 'var(--bg-input)',
                      color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'var(--transition-normal)'
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Editable Sample Text Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label htmlFor="library-sample-text" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  CUSTOM SPECIMEN PREVIEW TEXT
                </label>
                <button
                  type="button"
                  onClick={() => setLibrarySampleText('The quick brown fox jumps over the lazy dog.')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-accent-blue)', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Reset Sample Text
                </button>
              </div>
              <input
                id="library-sample-text"
                type="text"
                value={librarySampleText}
                onChange={e => setLibrarySampleText(e.target.value)}
                className="input-text"
                style={{ width: '100%' }}
                placeholder="Type anything to preview across all fonts..."
              />
            </div>
          </div>

          {/* Catalog Count & Active Pair Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div>
              Showing <strong>{filteredCatalog.length}</strong> of {FONT_CATALOG.length} fonts
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
              <span>Current Heading: <strong>{headingFont.family}</strong></span>
              <span>•</span>
              <span>Current Body: <strong>{bodyFont.family}</strong></span>
            </div>
          </div>

          {/* Grid of Font Cards */}
          {filteredCatalog.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)'
              }}
            >
              <Type size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>No matching fonts found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
                Try searching for something else or clear your category and favorites filters.
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setShowFavoritesOnly(false);
                }}
                style={{ marginTop: 12 }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                gap: 16
              }}
            >
              {filteredCatalog.map(font => (
                <FontCard
                  key={font.family}
                  font={font}
                  sampleText={librarySampleText}
                  isHeading={headingFamily === font.family}
                  isBody={bodyFamily === font.family}
                  onSelectHeading={f => {
                    setHeadingFamily(f.family);
                    setSelectedPresetId('');
                    showToast(`Set "${f.family}" as Heading font`, 'success');
                  }}
                  onSelectBody={f => {
                    setBodyFamily(f.family);
                    setSelectedPresetId('');
                    showToast(`Set "${f.family}" as Body font`, 'success');
                  }}
                  isFavorite={favorites.includes(font.family)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: SINGLE FONT TESTER ================= */}
      {activeTab === 'tester' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Tester Control Header */}
          <div
            className="chroma-card"
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16
            }}
          >
            {/* Font Family selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <label htmlFor="tester-family-select" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                  Select Font to Test
                </label>
                <select
                  id="tester-family-select"
                  value={testerFamily}
                  onChange={e => setTesterFamily(e.target.value)}
                  className="input-text"
                  style={{ minWidth: 220, appearance: 'auto' }}
                >
                  {FONT_CATALOG.map(f => (
                    <option key={f.family} value={f.family}>
                      {f.family} ({f.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tester-weight-select" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                  Weight
                </label>
                <select
                  id="tester-weight-select"
                  value={testerWeight}
                  onChange={e => setTesterWeight(Number(e.target.value))}
                  className="input-text"
                  style={{ minWidth: 120, appearance: 'auto' }}
                >
                  {testerFont.weights.map(w => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tester-style-select" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                  Style
                </label>
                <select
                  id="tester-style-select"
                  value={testerStyle}
                  onChange={e => setTesterStyle(e.target.value)}
                  disabled={!testerFont.hasItalic}
                  className="input-text"
                  style={{ minWidth: 110, appearance: 'auto' }}
                >
                  <option value="normal">Normal</option>
                  {testerFont.hasItalic && <option value="italic">Italic</option>}
                </select>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setHeadingFamily(testerFont.family);
                  setHeadingWeight(testerWeight);
                  setActiveTab('pairing');
                  showToast(`Set ${testerFont.family} as Heading`, 'success');
                }}
                style={{ padding: '8px 12px', fontSize: '0.8rem' }}
              >
                Use as Heading
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setBodyFamily(testerFont.family);
                  setBodyWeight(testerWeight);
                  setActiveTab('pairing');
                  showToast(`Set ${testerFont.family} as Body`, 'success');
                }}
                style={{ padding: '8px 12px', fontSize: '0.8rem' }}
              >
                Use as Body
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setImageTargetSlot(null);
                  setActiveTab('image-finder');
                }}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
                title="Identify typography from an image or screenshot"
              >
                <ScanText size={14} />
                <span>Identify from Image</span>
              </button>
            </div>
          </div>

          {/* Editable Specimen Bar */}
          <div
            className="chroma-card"
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                EDITABLE SPECIMEN TEXT
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setTesterText('Sphinx of black quartz, judge my vow.')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-accent-blue)', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Pangram 1
                </button>
                <button
                  type="button"
                  onClick={() => setTesterText('Pack my box with five dozen liquor jugs.')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-accent-blue)', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Pangram 2
                </button>
                <button
                  type="button"
                  onClick={() => setTesterText('0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-accent-blue)', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Alphabet & Numbers
                </button>
              </div>
            </div>
            <textarea
              value={testerText}
              onChange={e => setTesterText(e.target.value)}
              className="input-text"
              rows={2}
              style={{
                width: '100%',
                fontFamily: `'${testerFont.family}', ${testerFont.fallback || 'sans-serif'}`,
                fontWeight: testerWeight,
                fontStyle: testerStyle,
                fontSize: '1.25rem',
                lineHeight: 1.4
              }}
            />
          </div>

          {/* Waterfall Specimen Sizes */}
          <div
            className="chroma-card"
            style={{
              padding: '28px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: 24
            }}
          >
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              TYPOGRAPHIC SCALE WATERFALL
            </h4>

            {[64, 48, 36, 24, 18, 14].map(size => (
              <div
                key={size}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 16,
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: 16
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    minWidth: 44
                  }}
                >
                  {size}px
                </span>
                <div
                  style={{
                    fontFamily: `'${testerFont.family}', ${testerFont.fallback || 'sans-serif'}`,
                    fontWeight: testerWeight,
                    fontStyle: testerStyle,
                    fontSize: `${size}px`,
                    lineHeight: 1.25,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}
                >
                  {testerText}
                </div>
              </div>
            ))}
          </div>

          {/* All Supported Weights Comparison */}
          <div
            className="chroma-card"
            style={{
              padding: '28px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}
          >
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              AVAILABLE WEIGHTS ({testerFont.weights.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {testerFont.weights.map(w => (
                <div
                  key={w}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 16,
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: 12
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--color-accent-blue)',
                      minWidth: 70
                    }}
                  >
                    Weight {w}
                  </span>
                  <div
                    style={{
                      fontFamily: `'${testerFont.family}', ${testerFont.fallback || 'sans-serif'}`,
                      fontWeight: w,
                      fontStyle: testerStyle,
                      fontSize: '1.25rem',
                      lineHeight: 1.3,
                      color: 'var(--text-primary)',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {testerText}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: IDENTIFY FROM IMAGE ================= */}
      {activeTab === 'image-finder' && (
        <FontImageWorkspace
          onApplyHeading={handleApplyCandidateAsHeading}
          onApplyBody={handleApplyCandidateAsBody}
          onOpenInTester={handleOpenCandidateInTester}
          onSearchInLibrary={handleSearchCandidateInLibrary}
          onNavigateToPairing={() => setActiveTab('pairing')}
          initialFile={pendingImageFile}
          targetSlot={imageTargetSlot}
        />
      )}

      {/* CSS & Configuration Export Modal */}
      <FontCssExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        headingFont={headingFont}
        bodyFont={bodyFont}
        headingWeight={headingWeight}
        headingStyle={headingStyle}
        headingSize={headingSize}
        headingLineHeight={headingLineHeight}
        headingLetterSpacing={headingLetterSpacing}
        bodyWeight={bodyWeight}
        bodyStyle={bodyStyle}
        bodySize={bodySize}
        bodyLineHeight={bodyLineHeight}
        bodyLetterSpacing={bodyLetterSpacing}
      />
    </div>
  );
}
