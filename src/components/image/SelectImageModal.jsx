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
  Monitor,
  RotateCcw
} from 'lucide-react';
import { usePalette } from '../../context/PaletteContext';
import { useToast } from '../../context/ToastContext';
import { SAMPLE_IMAGES } from '../../data/sampleImages';
import AdSlot from '../ads/AdSlot';
import ProModal from '../common/ProModal';

export default function SelectImageModal({ isOpen, onClose }) {
  const {
    handleFileUpload,
    loadSampleImage,
    setCurrentImage,
    processImageExtraction,
    extractionOptions,
    setSelectedColor,
    addColorToPalette
  } = usePalette();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'screen' | 'web' | 'url' | 'paste' | 'search'
  const [isDragging, setIsDragging] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const fileInputRef = useRef(null);
  const tabRefs = useRef([]);

  const TABS = [
    { id: 'upload', label: 'Upload image', icon: Upload },
    { id: 'screen', label: 'Color on Screen', icon: Pipette },
    { id: 'web', label: 'Website URL', icon: Globe },
    { id: 'url', label: 'Image URL', icon: LinkIcon },
    { id: 'paste', label: 'Paste Clipboard', icon: Clipboard },
    { id: 'search', label: 'Search', icon: Search }
  ];

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

  // Keyboard navigation for tablist
  const handleTabKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % TABS.length;
      setActiveTab(TABS[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + TABS.length) % TABS.length;
      setActiveTab(TABS[prevIndex].id);
      tabRefs.current[prevIndex]?.focus();
    }
  };

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
      category: 'architecture',
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
      className="select-image-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="select-image-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="select-image-modal-title"
      >
        {/* Modal Header */}
        <div className="select-image-header">
          <h2 id="select-image-modal-title">
            SELECT IMAGE
          </h2>
          <button
            onClick={onClose}
            className="select-image-close-btn"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dedicated Top Advertisement Section */}
        <div className="select-image-ad-container">
          <AdSlot position="modal-top" onRemoveAdsClick={() => setIsProModalOpen(true)} />
        </div>

        {/* Modal Navigation Tabs */}
        <div className="select-image-tabs-wrapper">
          <div
            className="select-image-tabs"
            role="tablist"
            aria-label="Image selection sources"
          >
            {TABS.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={el => (tabRefs.current[idx] = el)}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  className={`select-image-tab-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon size={15} style={{ color: isActive ? 'var(--modal-accent)' : 'inherit' }} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body Tab Content */}
        <div
          className="select-image-body"
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {/* TAB 1: Upload image */}
          {activeTab === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                className={`select-image-dropzone ${isDragging ? 'dragging' : ''}`}
              >
                <div className="select-image-dropzone-icon">
                  <Upload size={24} />
                </div>
                <h3 style={{ fontSize: '1.08rem', fontWeight: 700, marginBottom: 6, color: 'var(--modal-text-primary)' }}>
                  Browse or drop image
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--modal-text-muted)', maxWidth: 360, margin: 0 }}>
                  Supports PNG, JPG, WebP, SVG, and GIF formats up to 25 MB
                </p>
              </div>

              {/* Data protection guarantee banner */}
              <div
                style={{
                  marginTop: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: '0.82rem',
                  color: 'var(--modal-text-secondary)',
                  textAlign: 'center'
                }}
              >
                <ShieldCheck size={17} color="#10B981" style={{ flexShrink: 0 }} />
                <span>
                  We think data protection is important!{' '}
                  <strong style={{ color: '#8B5CF6' }}>No data is sent.</strong> The magic happens in your browser.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Color on Screen */}
          {activeTab === 'screen' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  background: 'var(--modal-input-bg)',
                  borderRadius: 14,
                  padding: '24px 20px',
                  border: '1px solid var(--modal-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12
                  }}
                >
                  <Pipette size={24} />
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6, color: 'var(--modal-text-primary)' }}>
                  Sample Colors Directly Anywhere on Screen
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--modal-text-secondary)', maxWidth: 440, marginBottom: 18 }}>
                  Click below to activate the browser eyedropper and click any pixel inside or outside the browser window, or capture full screen.
                </p>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                  <button
                    onClick={handlePickFromScreen}
                    className="select-image-submit-btn"
                    style={{ flex: '1 1 200px', maxWidth: 260 }}
                  >
                    <Pipette size={16} />
                    <span>Pick Color from Screen</span>
                  </button>

                  <button
                    onClick={handleCaptureScreen}
                    className="select-image-chip"
                    style={{
                      height: 42,
                      padding: '0 20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.85rem',
                      borderRadius: 10,
                      flex: '1 1 200px',
                      maxWidth: 260,
                      justifyContent: 'center'
                    }}
                  >
                    <Monitor size={16} />
                    <span>Capture Screen to Workspace</span>
                  </button>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--modal-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <ShieldCheck size={15} color="#10B981" style={{ flexShrink: 0 }} />
                <span>Screen eyedropper is supported natively in Chrome, Edge, and Opera browsers.</span>
              </div>
            </div>
          )}

          {/* TAB 3: Website URL */}
          {activeTab === 'web' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: 8, color: 'var(--modal-text-primary)' }}>
                  Enter website address to extract design palette:
                </label>
                <div className="select-image-form-row">
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Globe
                      size={17}
                      style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--modal-text-muted)',
                        pointerEvents: 'none'
                      }}
                    />
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com or apple.com"
                      className="select-image-input"
                      style={{ paddingLeft: 42 }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleWebsiteCapture();
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleWebsiteCapture()}
                    disabled={isLoading || !websiteUrl.trim()}
                    className="select-image-submit-btn"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>Capture & Pick</span>}
                  </button>
                </div>
              </div>

              {/* Quick suggestions */}
              <div style={{ marginTop: 4 }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--modal-text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  Popular references to test:
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['google.com', 'github.com', 'stripe.com', 'dribbble.com', 'wikipedia.org'].map(site => (
                    <button
                      key={site}
                      onClick={() => {
                        setWebsiteUrl(site);
                        handleWebsiteCapture(site);
                      }}
                      className="select-image-chip"
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: 8, color: 'var(--modal-text-primary)' }}>
                  Paste direct link to any image:
                </label>
                <div className="select-image-form-row">
                  <div style={{ position: 'relative', flex: 1 }}>
                    <LinkIcon
                      size={17}
                      style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--modal-text-muted)',
                        pointerEvents: 'none'
                      }}
                    />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="select-image-input"
                      style={{ paddingLeft: 42 }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && imageUrl.trim()) loadImageFromUrl(imageUrl.trim());
                      }}
                    />
                  </div>
                  <button
                    onClick={() => imageUrl.trim() && loadImageFromUrl(imageUrl.trim())}
                    disabled={isLoading || !imageUrl.trim()}
                    className="select-image-submit-btn"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>Load Image</span>}
                  </button>
                </div>
              </div>

              {imageUrl.trim() ? (
                <div
                  style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid var(--modal-border)',
                    background: 'var(--modal-input-bg)',
                    padding: 12,
                    textAlign: 'center'
                  }}
                >
                  <img
                    src={imageUrl}
                    alt="Preview"
                    style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }}
                    onError={() => showToast('Image preview failed. Ensure URL is valid.', 'error')}
                  />
                </div>
              ) : (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 12,
                    border: '1px dashed var(--modal-border)',
                    background: 'var(--modal-input-bg)',
                    fontSize: '0.8rem',
                    color: 'var(--modal-text-muted)',
                    textAlign: 'center'
                  }}
                >
                  Supports direct links to JPG, PNG, WebP, SVG, and GIF images hosted publicly on the web.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Paste clipboard */}
          {activeTab === 'paste' && (
            <div
              style={{
                border: '2px dashed var(--modal-border)',
                borderRadius: 16,
                padding: '36px 20px',
                textAlign: 'center',
                background: 'var(--modal-input-bg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'var(--modal-tab-bar-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                  border: '1px solid var(--modal-border)',
                  color: 'var(--modal-accent)'
                }}
              >
                <Clipboard size={24} />
              </div>

              <h3 style={{ fontSize: '1.08rem', fontWeight: 700, marginBottom: 6, color: 'var(--modal-text-primary)' }}>
                Press{' '}
                <kbd
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: 'var(--modal-tab-bar-bg)',
                    border: '1px solid var(--modal-border)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    color: 'var(--modal-text-primary)'
                  }}
                >
                  Ctrl + V
                </kbd>{' '}
                (or{' '}
                <kbd
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: 'var(--modal-tab-bar-bg)',
                    border: '1px solid var(--modal-border)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    color: 'var(--modal-text-primary)'
                  }}
                >
                  ⌘V
                </kbd>
                )
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--modal-text-muted)', maxWidth: 420, marginBottom: 18 }}>
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
                className="select-image-submit-btn"
              >
                <Clipboard size={16} />
                <span>Read from Clipboard</span>
              </button>
            </div>
          )}

          {/* TAB 6: Search Stock Library */}
          {activeTab === 'search' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Row 1: Search bar with clear button */}
              <div style={{ position: 'relative', width: '100%' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--modal-text-muted)',
                    pointerEvents: 'none'
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter stock photos by name or mood..."
                  className="select-image-input"
                  style={{ paddingLeft: 38, paddingRight: searchQuery ? 38 : 14 }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--modal-text-muted)',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%'
                    }}
                    aria-label="Clear search input"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Row 2: Category filter pills */}
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  overflowX: 'auto',
                  paddingBottom: 4,
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {[
                  { id: 'all', label: 'All' },
                  { id: 'portrait', label: 'Portrait' },
                  { id: 'cars', label: 'Cars' },
                  { id: 'sunset', label: 'Sunset' },
                  { id: 'cyberpunk', label: 'Cyberpunk' },
                  { id: 'nature', label: 'Nature' },
                  { id: 'architecture', label: 'Architecture' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSearchCategory(cat.id)}
                    className={`select-image-pill ${searchCategory === cat.id ? 'active' : ''}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Row 3: Gallery Grid or Empty State */}
              {filteredStock.length > 0 ? (
                <div className="select-image-stock-grid">
                  {filteredStock.map(photo => {
                    const sampleObj = photo.sampleId ? SAMPLE_IMAGES.find(s => s.id === photo.sampleId) : null;
                    const imgSrc = sampleObj ? sampleObj.dataUrl : photo.url;

                    return (
                      <div
                        key={photo.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (photo.sampleId) {
                            loadSampleImage(photo.sampleId);
                            onClose();
                          } else if (photo.url) {
                            loadImageFromUrl(photo.url, photo.title);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (photo.sampleId) {
                              loadSampleImage(photo.sampleId);
                              onClose();
                            } else if (photo.url) {
                              loadImageFromUrl(photo.url, photo.title);
                            }
                          }
                        }}
                        className="select-image-stock-card"
                      >
                        <div
                          style={{
                            height: 105,
                            borderRadius: 8,
                            overflow: 'hidden',
                            background: '#0B0F19',
                            marginBottom: 8,
                            position: 'relative'
                          }}
                        >
                          <img
                            src={imgSrc}
                            alt={photo.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: 'var(--modal-text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {photo.title}
                          </span>
                          <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                            {photo.colors.map((c, i) => (
                              <span
                                key={i}
                                style={{
                                  width: 9,
                                  height: 9,
                                  borderRadius: '50%',
                                  backgroundColor: c,
                                  border: '1px solid rgba(0,0,0,0.2)'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    padding: '36px 20px',
                    borderRadius: 12,
                    border: '1px dashed var(--modal-border)',
                    background: 'var(--modal-input-bg)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <Search size={24} style={{ color: 'var(--modal-text-muted)', marginBottom: 8 }} />
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--modal-text-primary)', marginBottom: 4 }}>
                    No photos found
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--modal-text-muted)', maxWidth: 300, marginBottom: 14 }}>
                    No photos match &ldquo;{searchQuery}&rdquo; in {searchCategory === 'all' ? 'any category' : searchCategory}.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchCategory('all');
                    }}
                    className="select-image-chip"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <RotateCcw size={13} />
                    <span>Reset filters</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pro Modal for Ad Upgrades */}
      <ProModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
    </div>
  );
}
