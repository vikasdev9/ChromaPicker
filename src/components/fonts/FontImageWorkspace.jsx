import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  ScanText,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertCircle,
  Loader2,
  Trash2,
  MousePointer,
  Crop,
  Sparkles,
  Check,
  ArrowRight
} from 'lucide-react';
import { performImageOcr, terminateOcrWorker } from '../../utils/ocrService';
import { extractRegionColors, classifyFont, measureTypography } from '../../utils/imageTypographyAnalysis';
import { identifyFontFromRegion } from '../../utils/fontIdentifier';
import TypographyDetailsPanel from './TypographyDetailsPanel';
import { useToast } from '../../context/ToastContext';

const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function FontImageWorkspace({
  onApplyHeading,
  onApplyBody,
  onOpenInTester,
  onSearchInLibrary,
  onNavigateToPairing,
  initialFile = null,
  targetSlot = null
}) {
  const { showToast } = useToast();

  // Image State
  const [imageUrl, setImageUrl] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Zoom & Tool State
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = 100%
  const [activeTool, setActiveTool] = useState('select'); // 'select' | 'draw'

  // OCR & Regions State
  const [regions, setRegions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [editableText, setEditableText] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  // Manual Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [currentDrawBox, setCurrentDrawBox] = useState(null);

  // References
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageUrlRef = useRef(null);

  // Keep imageUrlRef in sync
  useEffect(() => {
    imageUrlRef.current = imageUrl;
  }, [imageUrl]);

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (imageUrlRef.current && imageUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrlRef.current);
      }
      terminateOcrWorker();
    };
  }, []);

  /**
   * Resets workspace completely
   */
  const handleReset = useCallback(() => {
    if (imageUrlRef.current && imageUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrlRef.current);
    }
    imageUrlRef.current = null;
    setImageUrl(null);
    setNaturalSize({ width: 0, height: 0 });
    setRegions([]);
    setSelectedRegionId(null);
    setAnalysisData(null);
    setEditableText('');
    setErrorMessage('');
    setZoomLevel(1);
    setIsLoading(false);
    setIsDrawing(false);
    setCurrentDrawBox(null);
    setHasApplied(false);
    setActiveTool('select');
  }, []);

  /**
   * Validates file format and size
   */
  const validateFile = (file) => {
    if (!file) return 'No file selected';
    if (!SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return `Unsupported file format (${file.type || 'unknown'}). Please upload a PNG, JPG, or WebP image.`;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum limit of 20 MB.`;
    }
    return null;
  };

  /**
   * Analyzes a specific region (extracts colors, classification, measurements, and candidates)
   */
  const analyzeRegion = useCallback(async (region, canvas, currentText = null) => {
    if (!region || !canvas) return;

    const textToUse = currentText !== null ? currentText : region.text;
    const colors = extractRegionColors(canvas, region.bbox);
    const classification = classifyFont(canvas, region.bbox, textToUse);
    const measurements = measureTypography(canvas, region.bbox, textToUse);

    const identificationResult = await identifyFontFromRegion({
      text: textToUse,
      classification,
      metrics: measurements,
      canvas
    });

    setAnalysisData({
      region,
      text: textToUse,
      colors,
      classification,
      measurements,
      candidates: identificationResult.candidates || [],
      method: identificationResult.method,
      limitations: identificationResult.limitations
    });
  }, []);

  /**
   * Processes a loaded image with OCR
   */
  const processImageFile = useCallback(async (file) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      return;
    }

    if (imageUrlRef.current && imageUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrlRef.current);
    }
    handleReset();
    setIsLoading(true);
    setLoadingStatus('Loading image into memory...');
    setErrorMessage('');

    const newUrl = URL.createObjectURL(file);
    imageUrlRef.current = newUrl;
    setImageUrl(newUrl);

    // Wait for image to load to get natural dimensions
    const img = new Image();
    img.src = newUrl;

    img.onload = async () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      setNaturalSize({ width, height });

      // Create an offscreen canvas containing image pixels for analysis
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
      canvasRef.current = canvas;

      setLoadingStatus('Detecting text regions with OCR...');
      setOcrProgress(15);

      try {
        const ocrResult = await performImageOcr(newUrl, {
          onProgress: (p) => {
            if (p.progress) setOcrProgress(p.progress);
            if (p.status) setLoadingStatus(`Running OCR analysis (${p.status})...`);
          }
        });

        setIsLoading(false);

        if (ocrResult && ocrResult.regions && ocrResult.regions.length > 0) {
          setRegions(ocrResult.regions);
          // Select first region by default
          const initialRegion = ocrResult.regions[0];
          setSelectedRegionId(initialRegion.id);
          setEditableText(initialRegion.text);
          showToast(`Detected ${ocrResult.regions.length} text regions`, 'success');
          await analyzeRegion(initialRegion, canvas, initialRegion.text);
        } else {
          // No text automatically detected
          setRegions([]);
          setSelectedRegionId(null);
          setErrorMessage('No text could be automatically detected in this image. You can manually drag and draw a selection box over the text area.');
          showToast('No text detected automatically. Try drawing a custom box.', 'info');
        }
      } catch (err) {
        setIsLoading(false);
        console.error('OCR processing error:', err);
        setErrorMessage('OCR analysis was unable to complete automatically. You can still manually draw a box over any text to analyze it.');
        showToast('OCR incomplete. Manual box selection enabled.', 'warning');
      }
    };

    img.onerror = () => {
      setIsLoading(false);
      setErrorMessage('Failed to decode image file. Please verify it is a valid image.');
      showToast('Image decoding failed', 'error');
    };
  }, [handleReset, showToast, analyzeRegion]);

  /**
   * Loads an authentic bundled sample typography image
   */
  const handleLoadSampleImage = useCallback(() => {
    try {
      setIsLoading(true);
      setLoadingStatus('Generating sample typography specimen...');
      setErrorMessage('');

      // Create a crisp typography specimen canvas
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 1000;
      sampleCanvas.height = 460;
      const ctx = sampleCanvas.getContext('2d');

      if (ctx) {
        // High contrast clean white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 1000, 460);

        // Decorative color accent bar
        ctx.fillStyle = '#166A8A';
        ctx.fillRect(60, 45, 120, 6);

        // Headline: Bold Sans-Serif
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 44px Inter, sans-serif';
        ctx.fillText('DESIGNING DIGITAL EXPERIENCES', 60, 110);

        // Subtitle: Medium
        ctx.fillStyle = '#166A8A';
        ctx.font = '600 24px Inter, sans-serif';
        ctx.fillText('A Refined Typography System for Modern Web Applications', 60, 160);

        // Body paragraph lines
        ctx.fillStyle = '#475569';
        ctx.font = 'normal 19px Inter, sans-serif';
        ctx.fillText('Typography is the foundation of digital interfaces. The delicate balance', 60, 220);
        ctx.fillText('between expressive headline character and effortless paragraph legibility', 60, 255);
        ctx.fillText('defines how comfortably readers absorb your narrative and interface hierarchy.', 60, 290);

        // Callout card
        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(60, 335, 880, 80, 12);
        } else {
          ctx.rect(60, 335, 880, 80);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0F172A';
        ctx.font = '700 20px Inter, sans-serif';
        ctx.fillText('EXPLORE SCALES • 2026 CHROMAPICK DESIGN STUDIO', 90, 382);

        sampleCanvas.toBlob((blob) => {
          if (blob) {
            const sampleFile = new File([blob], 'sample-typography.png', { type: 'image/png' });
            processImageFile(sampleFile);
          } else {
            fetch('/sample-fonts.png')
              .then(res => res.blob())
              .then(b => {
                const f = new File([b], 'sample-fonts.png', { type: 'image/png' });
                processImageFile(f);
              })
              .catch(() => {
                setIsLoading(false);
                setErrorMessage('Unable to load sample image.');
              });
          }
        }, 'image/png');
      } else {
        fetch('/sample-fonts.png')
          .then(res => res.blob())
          .then(b => {
            const f = new File([b], 'sample-fonts.png', { type: 'image/png' });
            processImageFile(f);
          })
          .catch(() => {
            setIsLoading(false);
            setErrorMessage('Unable to load sample image.');
          });
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Error generating sample:', err);
      setErrorMessage('Failed to generate sample image.');
    }
  }, [processImageFile]);

  // Automatically process initialFile if passed from Heading/Body buttons
  useEffect(() => {
    if (initialFile) {
      processImageFile(initialFile);
    }
  }, [initialFile, processImageFile]);

  /**
   * Clipboard Paste Listener (Ctrl + V)
   */
  useEffect(() => {
    const handlePaste = (e) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            showToast('Pasted image from clipboard', 'info');
            processImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processImageFile, showToast]);

  /**
   * Drag & Drop Handlers
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  /**
   * Region Selection Click
   */
  const handleSelectRegion = (region) => {
    setSelectedRegionId(region.id);
    setEditableText(region.text);
    if (canvasRef.current) {
      analyzeRegion(region, canvasRef.current, region.text);
    }
  };

  /**
   * Live Text Update from Details Panel
   */
  const handleTextChange = (newText) => {
    setEditableText(newText);
    const activeRegion = regions.find(r => r.id === selectedRegionId);
    if (activeRegion && canvasRef.current) {
      analyzeRegion(activeRegion, canvasRef.current, newText);
    }
  };

  /**
   * Helper: converts mouse/touch event coordinates into source image coordinates
   */
  const getCoordinatesFromEvent = (e) => {
    if (!imageRef.current) return null;
    const rect = imageRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    const scaleX = naturalSize.width / rect.width;
    const scaleY = naturalSize.height / rect.height;

    const x = Math.max(0, Math.min(naturalSize.width, Math.round(relX * scaleX)));
    const y = Math.max(0, Math.min(naturalSize.height, Math.round(relY * scaleY)));

    return { x, y };
  };

  /**
   * Manual Box Drawing Handlers
   */
  const handleMouseDown = (e) => {
    if (!imageUrl || isLoading) return;
    const coords = getCoordinatesFromEvent(e);
    if (!coords) return;

    setIsDrawing(true);
    setDrawStart(coords);
    setCurrentDrawBox({
      x0: coords.x,
      y0: coords.y,
      x1: coords.x,
      y1: coords.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !drawStart) return;
    const coords = getCoordinatesFromEvent(e);
    if (!coords) return;

    setCurrentDrawBox({
      x0: Math.min(drawStart.x, coords.x),
      y0: Math.min(drawStart.y, coords.y),
      x1: Math.max(drawStart.x, coords.x),
      y1: Math.max(drawStart.y, coords.y)
    });
  };

  const handleMouseUp = async () => {
    if (!isDrawing || !currentDrawBox) {
      setIsDrawing(false);
      return;
    }
    setIsDrawing(false);

    const width = currentDrawBox.x1 - currentDrawBox.x0;
    const height = currentDrawBox.y1 - currentDrawBox.y0;

    // Minimum sensible crop dimensions: 15x10 px
    if (width < 15 || height < 10) {
      setCurrentDrawBox(null);
      return;
    }

    const customRegion = {
      id: `custom-${Date.now()}`,
      text: editableText || 'Sample Text',
      bbox: {
        x0: currentDrawBox.x0,
        y0: currentDrawBox.y0,
        x1: currentDrawBox.x1,
        y1: currentDrawBox.y1,
        width,
        height
      },
      isCustom: true
    };

    setRegions(prev => [customRegion, ...prev]);
    setSelectedRegionId(customRegion.id);
    setCurrentDrawBox(null);
    setErrorMessage('');

    if (canvasRef.current) {
      await analyzeRegion(customRegion, canvasRef.current, customRegion.text);
      showToast('Custom text region selected', 'success');
    }
  };

  // Current Step in 4-step workflow
  const currentStep = !imageUrl
    ? 1
    : !selectedRegionId && !analysisData
    ? 2
    : !hasApplied
    ? 3
    : 4;

  return (
    <div
      className="font-image-workspace"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}
    >
      {/* Header & Step-by-Step Experience Breadcrumb */}
      <div
        className="chroma-card"
        style={{
          padding: '18px 22px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(56, 189, 248, 0.14)',
                color: 'var(--color-accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ScanText size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                Image Font Finder & Typography Inspector
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Upload any screenshot or photo to detect text regions, inspect pixel stroke metrics, and discover matching Google Fonts.
              </p>
            </div>
          </div>

          {/* Quick Header Actions when Image is loaded */}
          {imageUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                title="Replace image with another file"
              >
                <Upload size={14} />
                <span>Replace Image</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
                style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6, color: '#EF4444' }}
                title="Clear image and start over"
              >
                <Trash2 size={14} />
                <span>Remove</span>
              </button>
            </div>
          )}
        </div>

        {/* Step-by-Step Experience Indicator */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 10,
            paddingTop: 12,
            borderTop: '1px solid var(--border-light)'
          }}
        >
          {[
            { step: 1, label: 'Upload or Paste Image', desc: 'Drag, drop, or Ctrl + V' },
            { step: 2, label: 'Select Text Region', desc: 'Click box or draw crop' },
            { step: 3, label: 'Match Font Candidates', desc: 'Stroke analysis & rating' },
            { step: 4, label: 'Apply to Studio', desc: 'Set as Heading or Body' }
          ].map((s) => {
            const isCompleted = s.step < currentStep;
            const isCurrent = s.step === currentStep;

            return (
              <div
                key={s.step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isCurrent
                    ? 'rgba(56, 189, 248, 0.1)'
                    : isCompleted
                    ? 'var(--bg-card-subtle)'
                    : 'var(--bg-input)',
                  border: isCurrent
                    ? '1.5px solid var(--color-accent-blue)'
                    : '1px solid var(--border-color)',
                  transition: 'var(--transition-normal)'
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: isCurrent
                      ? 'var(--color-accent-blue)'
                      : isCompleted
                      ? '#22C55E'
                      : 'var(--border-color)',
                    color: isCurrent || isCompleted ? '#FFF' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    flexShrink: 0
                  }}
                >
                  {isCompleted ? '✓' : s.step}
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isCurrent ? 'var(--color-accent-blue)' : 'var(--text-primary)' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {s.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Slot Banner */}
      {targetSlot && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-lg)',
            background: targetSlot === 'heading' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(168, 85, 247, 0.12)',
            border: targetSlot === 'heading' ? '1.5px solid var(--color-accent-blue)' : '1.5px solid #A855F7',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: targetSlot === 'heading' ? 'var(--color-accent-blue)' : '#A855F7',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.75rem'
              }}
            >
              {targetSlot === 'heading' ? 'H' : 'P'}
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: targetSlot === 'heading' ? 'var(--color-accent-blue)' : '#A855F7' }}>
                Targeting: {targetSlot === 'heading' ? 'Heading Font' : 'Body Font'} for Studio
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Upload or select any text region on the image to inspect and immediately apply to your {targetSlot === 'heading' ? 'Heading' : 'Body'} font.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Upload Dropzone (When No Image is Loaded) */}
      {!imageUrl ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload image or screenshot containing text"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: isDragging ? '2px dashed var(--color-accent-blue)' : '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '70px 24px',
            textAlign: 'center',
            background: isDragging ? 'rgba(56, 189, 248, 0.06)' : 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            transition: 'var(--transition-normal)'
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(56, 189, 248, 0.12)',
              color: 'var(--color-accent-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Upload size={28} />
          </div>

          <div style={{ maxWidth: 520 }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Upload or paste an image containing text
            </h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Drop an image here, paste from clipboard, or click to browse. We’ll analyze text regions, stroke metrics, and match Google Fonts.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '10px 20px',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer'
              }}
            >
              <Upload size={16} />
              <span>Upload Image</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleLoadSampleImage}
              style={{
                padding: '10px 18px',
                fontSize: '0.88rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={16} color="var(--color-accent-blue)" />
              <span>Try Sample Image</span>
            </button>
          </div>

          {/* Validation Error Alert */}
          {errorMessage && (
            <div
              style={{
                marginTop: 8,
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#EF4444',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                maxWidth: 480
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Feature Badges */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
              PNG, JPG, JPEG, WebP (up to 20MB)
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
              🔒 100% Client-Side & Private — Images never leave your device
            </span>
          </div>
        </div>
      ) : (
        /* Steps 2-4: Loaded Image Workspace (Split Layout) */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 20,
            alignItems: 'start'
          }}
        >
          {/* Left Column: Image Canvas & Region Overlays */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Canvas Toolbar: Zoom Controls & Tool Modes */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {naturalSize.width} × {naturalSize.height}px
                </span>
                <span>•</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {regions.length} {regions.length === 1 ? 'region' : 'regions'}
                </span>
              </div>

              {/* Tool Mode & Zoom Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 4, background: 'var(--bg-input)', padding: '2px 4px', borderRadius: 'var(--radius-md)' }}>
                  <button
                    type="button"
                    className={`btn-subtle ${activeTool === 'select' ? 'active' : ''}`}
                    onClick={() => setActiveTool('select')}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: activeTool === 'select' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      color: activeTool === 'select' ? 'var(--color-accent-blue)' : 'var(--text-secondary)'
                    }}
                    title="Click text regions"
                  >
                    <MousePointer size={13} />
                    <span>Select</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-subtle ${activeTool === 'draw' ? 'active' : ''}`}
                    onClick={() => setActiveTool('draw')}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: activeTool === 'draw' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      color: activeTool === 'draw' ? 'var(--color-accent-blue)' : 'var(--text-secondary)'
                    }}
                    title="Drag to crop custom region"
                  >
                    <Crop size={13} />
                    <span>Draw Box</span>
                  </button>
                </div>

                {/* Zoom Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-input)', padding: '2px 6px', borderRadius: 'var(--radius-md)' }}>
                  <button
                    type="button"
                    className="btn-subtle"
                    onClick={() => setZoomLevel(prev => Math.max(0.5, Number((prev - 0.25).toFixed(2))))}
                    style={{ padding: 4 }}
                    title="Zoom Out"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', minWidth: 38, textAlign: 'center' }}>
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    className="btn-subtle"
                    onClick={() => setZoomLevel(prev => Math.min(3, Number((prev + 0.25).toFixed(2))))}
                    style={{ padding: 4 }}
                    title="Zoom In"
                  >
                    <ZoomIn size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn-subtle"
                    onClick={() => setZoomLevel(1)}
                    style={{ padding: 4 }}
                    title="Reset Zoom to 100%"
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading / Progress Indicator */}
            {isLoading && (
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <Loader2 size={18} className="animate-spin" color="var(--color-accent-blue)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {loadingStatus}
                  </div>
                  {ocrProgress > 0 && (
                    <div
                      style={{
                        height: 4,
                        width: '100%',
                        background: 'var(--border-color)',
                        borderRadius: 2,
                        marginTop: 6,
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.round(ocrProgress)}%`,
                          background: 'var(--color-accent-blue)',
                          transition: 'width 0.2s ease'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && !isLoading && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.25)',
                  color: '#CA8A04',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Interactive Image Container */}
            <div
              ref={containerRef}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-preview)',
                overflow: 'auto',
                maxHeight: '680px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '16px',
                userSelect: 'none'
              }}
            >
              <div
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  cursor: activeTool === 'draw' ? 'crosshair' : 'default',
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.15s ease'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                {/* Source Image */}
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Uploaded typography specimen"
                  draggable={false}
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />

                {/* Detected Regions Overlays */}
                {imageRef.current &&
                  regions.map((region, index) => {
                    const isSelected = region.id === selectedRegionId;
                    const scaleX = imageRef.current.clientWidth / naturalSize.width;
                    const scaleY = imageRef.current.clientHeight / naturalSize.height;

                    const left = region.bbox.x0 * scaleX;
                    const top = region.bbox.y0 * scaleY;
                    const width = region.bbox.width * scaleX;
                    const height = region.bbox.height * scaleY;

                    return (
                      <div
                        key={region.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRegion(region);
                        }}
                        style={{
                          position: 'absolute',
                          left: `${left}px`,
                          top: `${top}px`,
                          width: `${width}px`,
                          height: `${height}px`,
                          border: isSelected
                            ? '2px solid var(--color-accent-blue)'
                            : '1.5px solid rgba(56, 189, 248, 0.65)',
                          background: isSelected
                            ? 'rgba(56, 189, 248, 0.22)'
                            : 'rgba(56, 189, 248, 0.08)',
                          boxShadow: isSelected ? '0 0 0 2px rgba(56, 189, 248, 0.35)' : 'none',
                          borderRadius: 3,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          zIndex: isSelected ? 10 : 2
                        }}
                        title={`Region #${index + 1}: "${region.text}"`}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: -18,
                            left: 0,
                            background: isSelected ? 'var(--color-accent-blue)' : 'rgba(15, 23, 42, 0.85)',
                            color: '#FFF',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: 3,
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none'
                          }}
                        >
                          #{index + 1}
                        </span>
                      </div>
                    );
                  })}

                {/* Live Drawing Box */}
                {isDrawing && currentDrawBox && imageRef.current && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${Math.min(currentDrawBox.x0, currentDrawBox.x1) * (imageRef.current.clientWidth / naturalSize.width)}px`,
                      top: `${Math.min(currentDrawBox.y0, currentDrawBox.y1) * (imageRef.current.clientHeight / naturalSize.height)}px`,
                      width: `${Math.abs(currentDrawBox.x1 - currentDrawBox.x0) * (imageRef.current.clientWidth / naturalSize.width)}px`,
                      height: `${Math.abs(currentDrawBox.y1 - currentDrawBox.y0) * (imageRef.current.clientHeight / naturalSize.height)}px`,
                      border: '2px dashed var(--color-accent-blue)',
                      background: 'rgba(56, 189, 248, 0.18)',
                      borderRadius: 3,
                      pointerEvents: 'none',
                      zIndex: 20
                    }}
                  />
                )}
              </div>
            </div>

            {/* Instruction Footer below Image */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8
              }}
            >
              <span>
                💡 <strong>Tip:</strong> Click any highlighted box above to select text, or choose <strong>Draw Box</strong> to crop custom regions.
              </span>
              <button
                type="button"
                className="btn-subtle"
                onClick={() => {
                  if (imageUrl && canvasRef.current) {
                    processImageFile(new File([new Blob()], 'retry.png'));
                  }
                }}
                style={{ fontSize: '0.72rem', padding: '2px 6px' }}
              >
                Re-analyze
              </button>
            </div>
          </div>

          {/* Right Column: Typography Analysis & Font Candidate Details */}
          <div>
            <TypographyDetailsPanel
              selectedRegion={regions.find(r => r.id === selectedRegionId)}
              text={editableText}
              onTextChange={handleTextChange}
              classification={analysisData?.classification}
              colors={analysisData?.colors}
              measurements={analysisData?.measurements}
              candidates={analysisData?.candidates || []}
              imageWidth={naturalSize.width}
              imageHeight={naturalSize.height}
              method={analysisData?.method}
              limitations={analysisData?.limitations}
              onApplyHeading={(cand, weight, style) => {
                onApplyHeading(cand, weight, style);
                setHasApplied(true);
              }}
              onApplyBody={(cand, weight, style) => {
                onApplyBody(cand, weight, style);
                setHasApplied(true);
              }}
              onOpenInTester={onOpenInTester}
              onSearchInLibrary={onSearchInLibrary}
              onNavigateToPairing={onNavigateToPairing}
              targetSlot={targetSlot}
            />
          </div>
        </div>
      )}

      {/* Persistent global file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={e => {
          if (e.target.files && e.target.files[0]) {
            processImageFile(e.target.files[0]);
          }
          e.target.value = '';
        }}
        style={{ display: 'none' }}
      />
    </div>
  );
}
