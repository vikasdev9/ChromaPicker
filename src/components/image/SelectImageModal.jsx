import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Pipette,
  Globe,
  Link as LinkIcon,
  Clipboard,
  Search,
  ShieldCheck,
  Loader2,
  Monitor
} from 'lucide-react';
import { usePalette } from '../../context/PaletteContext';
import { useToast } from '../../context/ToastContext';
import { SAMPLE_IMAGES } from '../../data/sampleImages';

export default function SelectImageModal({ isOpen, onClose }) {
  const { handleFileUpload, loadSampleImage, setCurrentImage, processImageExtraction, extractionOptions, setSelectedColor, addColorToPalette } = usePalette();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'screen' | 'web' | 'url' | 'paste' | 'search'
  const [isDragging, setIsDragging] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');

  const fileInputRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Global paste handler while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const handleModalPaste = (e) => {
      if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          if (e.clipboardData.items[i].type.indexOf('image') !== -1) {
            const file = e.clipboardData.items[i].getAsFile();
            if (file) {
              handleFileUpload(file);
              showToast('Image pasted from clipboard!', 'success');
              onClose();
              break;
            }
          }
        }
      }
    };
    window.addEventListener('paste', handleModalPaste);
    return () => window.removeEventListener('paste', handleModalPaste);
  }, [isOpen, handleFileUpload, showToast, onClose]);

  if (!isOpen) return null;

  // Local helper to load any image URL into a local clean Data URL (preventing tainted canvas)
  const loadImageFromUrl = async (url, title = 'Web Image') => {
    setIsLoading(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const localDataUrl = canvas.toDataURL('image/png');

          setCurrentImage({
            src: localDataUrl,
            filename: title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.png',
            width: canvas.width,
            height: canvas.height,
            size: `${Math.round(localDataUrl.length / 1024)} KB`,
            title: title
          });

          if (processImageExtraction) {
            processImageExtraction(img, extractionOptions);
          }
          showToast(`Successfully loaded "${title}"!`, 'success');
          setIsLoading(false);
          onClose();
        } catch {
          // If CORS prevents canvas export, still set image source
          setCurrentImage({
            src: url,
            filename: 'external-image.jpg',
            width: img.naturalWidth || 800,
            height: img.naturalHeight || 600,
            size: 'External',
            title: title
          });
          showToast(`Loaded external image: ${title}`, 'success');
          setIsLoading(false);
          onClose();
        }
      };
      img.onerror = () => {
        setIsLoading(false);
        showToast('Could not load image. Please verify URL or check CORS restrictions.', 'error');
      };
      img.src = url;
    } catch {
      setIsLoading(false);
      showToast('Error loading image URL.', 'error');
    }
  };

  // Pick color directly from screen using native EyeDropper API
  const handlePickFromScreen = async () => {
    if (window.EyeDropper) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          setSelectedColor(result.sRGBHex);
          addColorToPalette(result.sRGBHex);
          showToast(`Picked screen color: ${result.sRGBHex}`, 'success');
          onClose();
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          showToast('Could not sample color from screen.', 'info');
        }
      }
    } else {
      showToast('EyeDropper API is supported in Chrome, Edge & Opera. Use Screen Capture below for all browsers!', 'info');
    }
  };

  // Capture whole screen or window directly into workspace image
  const handleCaptureScreen = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Grab current frame onto canvas
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      // Stop stream tracks immediately
      stream.getTracks().forEach(track => track.stop());

      const dataUrl = canvas.toDataURL('image/png');
      const img = new Image();
      img.onload = () => {
        setCurrentImage({
          src: dataUrl,
          filename: 'screen-capture.png',
          width: canvas.width,
          height: canvas.height,
          size: `${Math.round(dataUrl.length / 1024)} KB`,
          title: 'Screen Capture'
        });
        if (processImageExtraction) {
          processImageExtraction(img, extractionOptions);
        }
        showToast('Captured screen imported into workspace!', 'success');
        setIsLoading(false);
        onClose();
      };
      img.src = dataUrl;
    } catch (err) {
      setIsLoading(false);
      if (err.name !== 'NotAllowedError') {
        showToast('Screen capture was cancelled or denied.', 'info');
      }
    }
  };

  // Website screenshot extraction
  const handleWebsiteCapture = (targetUrl) => {
    const url = targetUrl || websiteUrl;
    if (!url.trim()) {
      showToast('Please enter a website URL', 'error');
      return;
    }

    let normalized = url.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }

    // High reliability screenshot proxy
    const screenshotUrl = `https://api.microlink.io?url=${encodeURIComponent(normalized)}&screenshot=true&meta=false&embed=screenshot.url`;
    loadImageFromUrl(screenshotUrl, `Website: ${normalized.replace(/^https?:\/\//, '')}`);
  };

  // Stock library photos for Search tab
  const STOCK_PHOTOS = [
    {
      id: 'yellow-portrait',
      title: 'Studio Portrait Yellow (Reference)',
      category: 'portrait',
      sampleId: 'yellow-portrait',
      colors: ['#FED100', '#E59A57', '#1D1A20']
    },
    {
      id: 'desert-car',
      title: 'Vintage Desert Highway (Reference)',
      category: 'cars',
      sampleId: 'desert-car',
      colors: ['#2596BE', '#D08846', '#844321']
    },
    {
      id: 'tropical-sunset',
      title: 'Tropical Sunset Coast',
      category: 'sunset',
      sampleId: 'tropical-sunset',
      colors: ['#9333EA', '#F97316', '#047857']
    },
    {
      id: 'cyberpunk-neon',
      title: 'Cyberpunk Neon Metropolis',
      category: 'cyberpunk',
      sampleId: 'cyberpunk-neon',
      colors: ['#22D3EE', '#EC4899', '#0B0F19']
    },
    {
      id: 'nature-autumn',
      title: 'Emerald Forest Mist',
      category: 'nature',
      url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
      colors: ['#103823', '#2D5A27', '#E09F3E']
    },
    {
      id: 'minimal-architecture',
      title: 'Modern Architecture Geometry',
      category: 'minimal',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      colors: ['#E2E8F0', '#334155', '#94A3B8']
    }
  ];

  const filteredStock = STOCK_PHOTOS.filter(item => {
    const matchesCat = searchCategory === 'all' || item.category === searchCategory;
    const matchesQuery = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(8px, 2.5vw, 20px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="chroma-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="select-image-modal-title"
        style={{
          width: '100%',
          maxWidth: 820,
          background: 'var(--bg-card)',
          borderRadius: 20,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border-color)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Modal Header matching Screenshot 1 */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h2
              id="select-image-modal-title"
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                margin: 0
              }}
            >
              SELECT IMAGE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="theme-toggle-btn"
            style={{
              position: 'absolute',
              right: 20,
              width: 34,
              height: 34,
              borderRadius: '50%'
            }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Navigation Tabs matching Screenshot 1 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '10px 18px',
            background: 'var(--bg-card-subtle)',
            borderBottom: '1px solid var(--border-color)',
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}
        >
          {[
            { id: 'upload', label: 'Upload image', icon: Upload },
            { id: 'screen', label: 'Color on your Screen', icon: Pipette },
            { id: 'web', label: 'Website URL', icon: Globe },
            { id: 'url', label: 'Image URL', icon: LinkIcon },
            { id: 'paste', label: 'Paste clipboard', icon: Clipboard },
            { id: 'search', label: 'Search', icon: Search }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: 'none',
                  background: isActive ? 'var(--bg-card)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.08), 0 0 0 1px var(--border-color)' : 'none',
                  transition: 'var(--transition-normal)'
                }}
              >
                <Icon size={15} color={isActive ? 'var(--color-accent-blue)' : 'currentColor'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Tab Content */}
        <div style={{ padding: '28px 32px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: Upload image matching Screenshot 1 */}
          {activeTab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                    onClose();
                  }
                }}
              />

              <div
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                    onClose();
                  }
                }}
                style={{
                  border: isDragging ? '2px dashed var(--color-accent-blue)' : '2px dashed var(--border-color)',
                  background: isDragging ? 'rgba(37, 150, 190, 0.08)' : 'var(--bg-card-subtle)',
                  borderRadius: 16,
                  padding: '60px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 16,
                    background: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <Upload size={28} color="var(--color-accent-blue)" />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>
                  Browse or drop image
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 360, margin: 0 }}>
                  Supports PNG, JPG, WebP, SVG, and GIF formats up to 25 MB
                </p>
              </div>

              {/* Data protection guarantee banner matching Screenshot 1 */}
              <div
                style={{
                  marginTop: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <ShieldCheck size={18} color="#10B981" />
                <span>
                  We think data protection is important!{' '}
                  <span style={{ color: '#8B5CF6', fontWeight: 700 }}>No data is sent.</span> The magic happens in your browser.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Color on your Screen */}
          {activeTab === 'screen' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div
                style={{
                  background: 'var(--bg-card-subtle)',
                  borderRadius: 14,
                  padding: 24,
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14
                  }}
                >
                  <Pipette size={26} />
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>
                  Sample Colors Directly Anywhere on Screen
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 460, marginBottom: 20 }}>
                  Click below to activate the browser eyedropper and click any pixel inside or outside the browser window.
                </p>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    onClick={handlePickFromScreen}
                    className="btn-primary"
                    style={{ padding: '12px 24px', fontSize: '0.92rem' }}
                  >
                    <Pipette size={18} />
                    <span>Pick Color from Screen</span>
                  </button>

                  <button
                    onClick={handleCaptureScreen}
                    className="btn-secondary"
                    style={{ padding: '12px 24px', fontSize: '0.92rem' }}
                  >
                    <Monitor size={18} />
                    <span>Capture Screen to Workspace</span>
                  </button>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={16} color="#10B981" />
                <span>Screen eyedropper is supported natively in Chrome, Edge, and Opera browsers.</span>
              </div>
            </div>
          )}

          {/* TAB 3: Website URL */}
          {activeTab === 'web' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: 8 }}>
                  Enter website address to extract design palette:
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Globe
                      size={18}
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                    />
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com or apple.com"
                      className="search-input"
                      style={{ paddingLeft: 42, width: '100%' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleWebsiteCapture();
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleWebsiteCapture()}
                    disabled={isLoading || !websiteUrl.trim()}
                    className="btn-primary"
                    style={{ padding: '0 24px', whiteSpace: 'nowrap' }}
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <span>Capture & Pick</span>}
                  </button>
                </div>
              </div>

              {/* Quick suggestions */}
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Popular sites to test:
                </span>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {['google.com', 'github.com', 'stripe.com', 'dribbble.com', 'wikipedia.org'].map(site => (
                    <button
                      key={site}
                      onClick={() => {
                        setWebsiteUrl(site);
                        handleWebsiteCapture(site);
                      }}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 20,
                        background: 'var(--bg-card-subtle)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {site}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Image URL */}
          {activeTab === 'url' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: 8 }}>
                  Paste direct link to any image:
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <LinkIcon
                      size={18}
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                    />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="search-input"
                      style={{ paddingLeft: 42, width: '100%' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && imageUrl.trim()) loadImageFromUrl(imageUrl.trim());
                      }}
                    />
                  </div>
                  <button
                    onClick={() => imageUrl.trim() && loadImageFromUrl(imageUrl.trim())}
                    disabled={isLoading || !imageUrl.trim()}
                    className="btn-primary"
                    style={{ padding: '0 24px', whiteSpace: 'nowrap' }}
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <span>Load Image</span>}
                  </button>
                </div>
              </div>

              {imageUrl.trim() && (
                <div
                  style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card-subtle)',
                    padding: 12,
                    textAlign: 'center'
                  }}
                >
                  <img
                    src={imageUrl}
                    alt="Preview"
                    style={{ maxHeight: 220, maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }}
                    onError={() => showToast('Image preview failed. Ensure URL is valid.', 'error')}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Paste clipboard */}
          {activeTab === 'paste' && (
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 16,
                padding: '48px 24px',
                textAlign: 'center',
                background: 'var(--bg-card-subtle)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  background: 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  border: '1px solid var(--border-color)'
                }}
              >
                <Clipboard size={26} color="var(--color-accent-blue)" />
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
                Press <kbd style={{ padding: '2px 8px', borderRadius: 6, background: 'var(--border-color)', fontFamily: 'var(--font-mono)' }}>Ctrl + V</kbd> (or <kbd style={{ padding: '2px 8px', borderRadius: 6, background: 'var(--border-color)', fontFamily: 'var(--font-mono)' }}>⌘V</kbd>)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 440, marginBottom: 20 }}>
                Copy any screenshot or image from your clipboard and paste it directly into this window to start color picking.
              </p>

              <button
                onClick={async () => {
                  try {
                    const clipboardItems = await navigator.clipboard.read();
                    for (const item of clipboardItems) {
                      for (const type of item.types) {
                        if (type.startsWith('image/')) {
                          const blob = await item.getType(type);
                          handleFileUpload(blob);
                          showToast('Pasted image from clipboard!', 'success');
                          onClose();
                          return;
                        }
                      }
                    }
                    showToast('No image found in clipboard.', 'info');
                  } catch {
                    showToast('Please press Ctrl+V to paste your image.', 'info');
                  }
                }}
                className="btn-secondary"
                style={{ padding: '10px 20px', fontSize: '0.88rem' }}
              >
                <Clipboard size={16} />
                <span>Read from Clipboard</span>
              </button>
            </div>
          )}

          {/* TAB 6: Search Stock Library */}
          {activeTab === 'search' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Search bar & filter pills */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                  <Search
                    size={16}
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter photos..."
                    className="search-input"
                    style={{ paddingLeft: 38, width: '100%', height: 38 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'portrait', label: 'Portrait' },
                    { id: 'cars', label: 'Cars' },
                    { id: 'sunset', label: 'Sunset' },
                    { id: 'cyberpunk', label: 'Cyberpunk' },
                    { id: 'nature', label: 'Nature' },
                    { id: 'minimal', label: 'Architecture' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSearchCategory(cat.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 20,
                        border: '1px solid var(--border-color)',
                        background: searchCategory === cat.id ? 'var(--color-accent-blue)' : 'var(--bg-card-subtle)',
                        color: searchCategory === cat.id ? '#FFFFFF' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gallery Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 180px), 1fr))',
                  gap: 14,
                  maxHeight: 380,
                  overflowY: 'auto'
                }}
              >
                {filteredStock.map(photo => {
                  const sampleObj = photo.sampleId ? SAMPLE_IMAGES.find(s => s.id === photo.sampleId) : null;
                  const imgSrc = sampleObj ? sampleObj.dataUrl : photo.url;

                  return (
                    <div
                      key={photo.id}
                      onClick={() => {
                        if (photo.sampleId) {
                          loadSampleImage(photo.sampleId);
                          onClose();
                        } else if (photo.url) {
                          loadImageFromUrl(photo.url, photo.title);
                        }
                      }}
                      className="chroma-card"
                      style={{
                        cursor: 'pointer',
                        padding: 8,
                        borderRadius: 12,
                        border: '1px solid var(--border-color)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'var(--color-accent-blue)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                      }}
                    >
                      <div
                        style={{
                          height: 110,
                          borderRadius: 8,
                          overflow: 'hidden',
                          background: '#0B0F19',
                          marginBottom: 8
                        }}
                      >
                        <img
                          src={imgSrc}
                          alt={photo.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {photo.title}
                        </span>
                        <div style={{ display: 'flex', gap: 3 }}>
                          {photo.colors.map((c, i) => (
                            <span
                              key={i}
                              style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
