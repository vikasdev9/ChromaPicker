import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, Copy, Check, Filter, ArrowUpDown } from 'lucide-react';
import { COLOR_DATASET } from '../data/colorNames';
import { getReadableTextColor } from '../utils/colorMath';
import { usePalette } from '../context/PaletteContext';
import { useToast } from '../context/ToastContext';

export default function BrowseColorsPage() {
  const { showToast } = useToast();
  const { favorites, toggleFavorite, addRecentColor } = usePalette();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [brightnessFilter, setBrightnessFilter] = useState('all'); // 'all' | 'light' | 'medium' | 'dark'
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'hue' | 'brightness' | 'saturation'
  const [copiedHex, setCopiedHex] = useState(null);

  const categories = ['all', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink', 'brown', 'neutral'];

  const filteredColors = useMemo(() => {
    return COLOR_DATASET.filter(item => {
      // Query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesHex = item.hex.toLowerCase().includes(query);
        if (!matchesName && !matchesHex) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Brightness filter
      if (brightnessFilter === 'light' && item.brightness < 60) return false;
      if (brightnessFilter === 'medium' && (item.brightness < 35 || item.brightness > 65)) return false;
      if (brightnessFilter === 'dark' && item.brightness > 40) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'hue') return a.hue - b.hue;
      if (sortBy === 'brightness') return b.brightness - a.brightness;
      if (sortBy === 'saturation') return b.saturation - a.saturation;
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery, selectedCategory, brightnessFilter, sortBy]);

  const handleCopy = (hex, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    addRecentColor(hex);
    showToast(`Copied ${hex}!`, 'success');
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const handleFavorite = (hex, e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(hex);
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', padding: '36px 16px 28px 16px', maxWidth: 840, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>
          Browse Named Colors Catalog
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Explore our curated catalog of recognized color shades with precise color codes, harmonic pairings, and instant 1-click copying.
        </p>

        {/* Search Bar */}
        <div style={{ position: 'relative', maxWidth: 540, margin: '24px auto 0 auto' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: 14, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by color name (e.g. Fjord Signal, Cobalt) or HEX code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-text"
            style={{ paddingLeft: 46, paddingRight: 16, height: 46, borderRadius: 'var(--radius-full)' }}
          />
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div
        className="chroma-card"
        style={{
          padding: '16px 20px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        {/* Hue Categories */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--color-accent-blue)' : 'var(--border-color)',
                background: selectedCategory === cat ? 'var(--color-accent-blue)' : 'var(--bg-card-subtle)',
                color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary filters & Sort */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={brightnessFilter}
            onChange={e => setBrightnessFilter(e.target.value)}
            className="input-text"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <option value="all">All Brightness</option>
            <option value="light">Light Tones</option>
            <option value="medium">Medium Tones</option>
            <option value="dark">Dark Tones</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input-text"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <option value="name">Sort by Name</option>
            <option value="hue">Sort by Spectrum (Hue)</option>
            <option value="brightness">Sort by Brightness</option>
            <option value="saturation">Sort by Saturation</option>
          </select>
        </div>
      </div>

      {/* Showing count */}
      <div style={{ marginBottom: 16, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
        Showing {filteredColors.length} recognized colors
      </div>

      {/* Colors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 160px), 1fr))', gap: 16 }}>
        {filteredColors.map(color => {
          const textColor = getReadableTextColor(color.hex);
          const isFav = favorites.includes(color.hex);

          return (
            <Link
              key={color.hex + color.name}
              to={`/color/${color.hex.replace('#', '').toLowerCase()}`}
              className="chroma-card"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              {/* Swatch */}
              <div
                style={{
                  height: 120,
                  backgroundColor: color.hex,
                  position: 'relative',
                  padding: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <button
                  onClick={(e) => handleFavorite(color.hex, e)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(4px)',
                    border: 'none',
                    color: isFav ? '#EF4444' : textColor,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Favorite"
                >
                  <Heart size={14} fill={isFav ? '#EF4444' : 'none'} />
                </button>

                <button
                  onClick={(e) => handleCopy(color.hex, e)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(4px)',
                    border: 'none',
                    color: textColor,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Copy HEX"
                >
                  {copiedHex === color.hex ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {/* Info Details */}
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {color.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {color.hex}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {color.category}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
