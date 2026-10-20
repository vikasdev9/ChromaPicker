import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Copy,
  Trash2,
  Download,
  Undo2,
  Redo2,
  ArrowLeftRight,
  Shuffle,
  Heart,
  Sliders,
  Code,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { triggerFileDownload } from '../utils/downloadUtils';
import {
  generateCssGradient,
  generateFullCss,
  generateGradientSvg,
  reverseGradient,
  randomizeGradient,
  sanitizeGradientState
} from '../utils/gradientUtils';
import { GRADIENT_PRESETS, GRADIENT_CATEGORIES } from '../data/gradientPresets';
import ColorStopTrack from '../components/gradient/ColorStopTrack';
import StopControls from '../components/gradient/StopControls';
import GradientExportModal from '../components/gradient/GradientExportModal';
import GradientComparison from '../components/gradient/GradientComparison';
import GradientComponentPreviews from '../components/gradient/GradientComponentPreviews';

const LOCAL_STORAGE_KEY = 'chromapick_saved_gradients';

export default function GradientGeneratorPage() {
  const { showToast } = useToast();

  // Core Gradient State
  const [gradientState, setGradientState] = useState({
    type: 'linear', // 'linear' | 'radial' | 'conic'
    angle: 135,
    repeating: false,
    radialShape: 'circle', // 'circle' | 'ellipse'
    radialExtent: 'farthest-corner', // 'closest-side' | 'closest-corner' | 'farthest-side' | 'farthest-corner'
    radialPositionX: 50,
    radialPositionY: 50,
    conicAngle: 0,
    conicPositionX: 50,
    conicPositionY: 50,
    stops: [
      { id: 'stop_1', color: '#2596BE', pos: 0, opacity: 100 },
      { id: 'stop_2', color: '#B8FFE4', pos: 100, opacity: 100 }
    ]
  });

  const [activeStopIndex, setActiveStopIndex] = useState(0);

  // Undo & Redo History
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const isDraggingRef = useRef(false);
  const dragStartStateRef = useRef(null);

  // Export Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Presets Category Filter
  const [selectedPresetCategory, setSelectedPresetCategory] = useState('all');

  // Local Favorites & Saved Gradients
  const [savedGradients, setSavedGradients] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map(item => ({
            ...item,
            state: sanitizeGradientState(item.state)
          }));
        }
      }
    } catch (e) {
      console.error('Failed to load saved gradients from localStorage', e);
    }
    return [];
  });

  const [saveNameInput, setSaveNameInput] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  // Active Sub-Tab / View Mode: 'editor' | 'comparison' | 'previews'
  const [activeViewMode, setActiveViewMode] = useState('editor');

  // Save favorites to localStorage
  const persistSavedGradients = useCallback((list) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to persist gradients', e);
    }
  }, []);

  // Commit state change to history
  const updateGradientStateWithHistory = useCallback((updater) => {
    setGradientState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setUndoStack(u => [...u, prev]);
      setRedoStack([]); // Clear redo on new action
      return next;
    });
  }, []);

  // Drag interaction tracking for undo history
  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
    dragStartStateRef.current = gradientState;
  }, [gradientState]);

  const handleDragEnd = useCallback(() => {
    if (isDraggingRef.current && dragStartStateRef.current) {
      setUndoStack(u => [...u, dragStartStateRef.current]);
      setRedoStack([]);
      dragStartStateRef.current = null;
      isDraggingRef.current = false;
    }
  }, []);

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(u => u.slice(0, u.length - 1));
    setRedoStack(r => [...r, gradientState]);
    setGradientState(previous);
    setActiveStopIndex(0);
    showToast('Undo gradient change', 'info');
  }, [undoStack, gradientState, showToast]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(r => r.slice(0, r.length - 1));
    setUndoStack(u => [...u, gradientState]);
    setGradientState(next);
    setActiveStopIndex(0);
    showToast('Redo gradient change', 'info');
  }, [redoStack, gradientState, showToast]);

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y / Ctrl+Shift+Z
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Calculated CSS string for active gradient
  const cssGradient = generateCssGradient(gradientState);
  const fullCssOutput = generateFullCss(gradientState, 'declaration');

  // Quick Copy CSS
  const handleCopyCss = () => {
    navigator.clipboard.writeText(fullCssOutput);
    showToast('Copied CSS gradient declaration!', 'success');
  };

  // Add Color Stop
  const handleAddStop = () => {
    if (gradientState.stops.length >= 10) {
      showToast('Maximum of 10 color stops supported', 'info');
      return;
    }

    const sorted = [...gradientState.stops].sort((a, b) => a.pos - b.pos);
    const newPos = Math.round((sorted[sorted.length - 1].pos + sorted[0].pos) / 2);
    const newStop = {
      id: `stop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      color: '#FFB6D2',
      pos: newPos,
      opacity: 100
    };

    updateGradientStateWithHistory(prev => ({
      ...prev,
      stops: [...prev.stops, newStop]
    }));
    setActiveStopIndex(gradientState.stops.length);
  };

  // Add stop at exact clicked track percentage
  const handleAddStopAtPos = (pos) => {
    if (gradientState.stops.length >= 10) {
      showToast('Maximum of 10 color stops supported', 'info');
      return;
    }

    // Inherit color from nearby active stop or nice default
    const baseColor = gradientState.stops[activeStopIndex] ? gradientState.stops[activeStopIndex].color : '#FFB6D2';
    const newStop = {
      id: `stop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      color: baseColor,
      pos,
      opacity: 100
    };

    updateGradientStateWithHistory(prev => ({
      ...prev,
      stops: [...prev.stops, newStop]
    }));
    setActiveStopIndex(gradientState.stops.length);
  };

  // Duplicate current stop
  const handleDuplicateStop = () => {
    if (gradientState.stops.length >= 10) {
      showToast('Maximum of 10 color stops supported', 'info');
      return;
    }

    const curr = gradientState.stops[activeStopIndex] || gradientState.stops[0];
    const newPos = Math.min(100, curr.pos + 5);
    const newStop = {
      id: `stop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      color: curr.color,
      pos: newPos,
      opacity: curr.opacity !== undefined ? curr.opacity : 100
    };

    updateGradientStateWithHistory(prev => ({
      ...prev,
      stops: [...prev.stops, newStop]
    }));
    setActiveStopIndex(gradientState.stops.length);
    showToast('Duplicated color stop', 'success');
  };

  // Remove Color Stop
  const handleRemoveStop = (idx) => {
    if (gradientState.stops.length <= 2) {
      showToast('A gradient requires at least 2 color stops', 'error');
      return;
    }

    updateGradientStateWithHistory(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== idx)
    }));
    setActiveStopIndex(0);
    showToast('Removed color stop', 'info');
  };

  // Update Stop Color
  const handleUpdateActiveColor = (newHex) => {
    setGradientState(prev => ({
      ...prev,
      stops: prev.stops.map((s, i) => i === activeStopIndex ? { ...s, color: newHex } : s)
    }));
  };

  // Update Stop Position
  const handleUpdateActivePos = (pos) => {
    const clamped = Math.min(100, Math.max(0, pos));
    setGradientState(prev => ({
      ...prev,
      stops: prev.stops.map((s, i) => i === activeStopIndex ? { ...s, pos: clamped } : s)
    }));
  };

  // Update Stop Opacity
  const handleUpdateActiveOpacity = (opacity) => {
    const clamped = Math.min(100, Math.max(0, opacity));
    setGradientState(prev => ({
      ...prev,
      stops: prev.stops.map((s, i) => i === activeStopIndex ? { ...s, opacity: clamped } : s)
    }));
  };

  // Update Specific Stop Position by index (from track)
  const handleUpdateStopPosByIndex = (index, pos) => {
    const clamped = Math.min(100, Math.max(0, pos));
    setGradientState(prev => ({
      ...prev,
      stops: prev.stops.map((s, i) => i === index ? { ...s, pos: clamped } : s)
    }));
  };

  // Reverse Gradient
  const handleReverse = () => {
    updateGradientStateWithHistory(prev => reverseGradient(prev));
    showToast('Reversed gradient direction & stops', 'info');
  };

  // Randomize Gradient
  const handleRandomize = () => {
    const randomized = randomizeGradient(gradientState.type);
    updateGradientStateWithHistory(randomized);
    setActiveStopIndex(0);
    showToast('Generated randomized harmonic gradient!', 'info');
  };

  // Reset to Default
  const handleReset = () => {
    const defaultState = {
      type: 'linear',
      angle: 135,
      repeating: false,
      radialShape: 'circle',
      radialExtent: 'farthest-corner',
      radialPositionX: 50,
      radialPositionY: 50,
      conicAngle: 0,
      conicPositionX: 50,
      conicPositionY: 50,
      stops: [
        { id: 'stop_1', color: '#2596BE', pos: 0, opacity: 100 },
        { id: 'stop_2', color: '#B8FFE4', pos: 100, opacity: 100 }
      ]
    };
    updateGradientStateWithHistory(defaultState);
    setActiveStopIndex(0);
    showToast('Reset gradient to default settings', 'info');
  };

  // Apply Preset
  const handleApplyPreset = (preset) => {
    const sanitized = sanitizeGradientState(preset);
    updateGradientStateWithHistory(sanitized);
    setActiveStopIndex(0);
    showToast(`Applied preset: ${preset.name}`, 'info');
  };

  // Download SVG
  const handleDownloadSvg = () => {
    const svg = generateGradientSvg(gradientState, 1200, 800);
    triggerFileDownload(svg, 'gradient-background.svg', 'image/svg+xml');
    showToast('Downloaded SVG gradient!', 'success');
  };

  // Save Gradient to Favorites
  const handleSaveToFavorites = (e) => {
    e.preventDefault();
    const name = saveNameInput.trim() || `Gradient #${savedGradients.length + 1}`;
    const newEntry = {
      id: `saved_${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      state: { ...gradientState }
    };

    const nextList = [newEntry, ...savedGradients];
    setSavedGradients(nextList);
    persistSavedGradients(nextList);
    setSaveNameInput('');
    setIsSaveDialogOpen(false);
    showToast(`Saved "${name}" to your library!`, 'success');
  };

  // Delete saved gradient
  const handleDeleteSaved = (id) => {
    const nextList = savedGradients.filter(g => g.id !== id);
    setSavedGradients(nextList);
    persistSavedGradients(nextList);
    showToast('Removed gradient from library', 'info');
  };

  // Clear all saved gradients with confirmation
  const handleClearAllSaved = () => {
    if (window.confirm('Are you sure you want to delete all saved gradients from your library?')) {
      setSavedGradients([]);
      persistSavedGradients([]);
      showToast('Cleared all saved gradients', 'info');
    }
  };

  // Filter presets by selected category
  const filteredPresets = selectedPresetCategory === 'all'
    ? GRADIENT_PRESETS
    : GRADIENT_PRESETS.filter(p => p.category === selectedPresetCategory);

  return (
    <div style={{ paddingBottom: 80 }} className="content-container">
      {/* Hero Header */}
      <div style={{ textAlign: 'center', padding: '36px 16px 24px 16px', maxWidth: 840, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>
          CSS Gradient Studio
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          Craft linear, radial, and conic CSS gradients with real-time draggable color stops, opacity controls, undo/redo history, presets, and production-ready code export.
        </p>

        {/* Global Action Bar: Undo, Redo, Reverse, Randomize, Save, Reset */}
        <div
          style={{
            marginTop: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            style={{
              padding: '7px 12px',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              opacity: undoStack.length === 0 ? 0.5 : 1,
              cursor: undoStack.length === 0 ? 'not-allowed' : 'pointer'
            }}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
            <span>Undo</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            style={{
              padding: '7px 12px',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              opacity: redoStack.length === 0 ? 0.5 : 1,
              cursor: redoStack.length === 0 ? 'not-allowed' : 'pointer'
            }}
            title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
          >
            <Redo2 size={14} />
            <span>Redo</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleReverse}
            style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Reverse gradient stop positions"
          >
            <ArrowLeftRight size={14} />
            <span>Reverse</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleRandomize}
            style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Generate a randomized harmonic gradient"
          >
            <Shuffle size={14} color="#A855F7" />
            <span>Randomize</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsSaveDialogOpen(true)}
            style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Save current gradient to browser library"
          >
            <Heart size={14} color="#EC4899" />
            <span>Save</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleReset}
            style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Reset to default gradient"
          >
            <RefreshCw size={14} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsExportModalOpen(true)}
            style={{ padding: '7px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Code size={14} />
            <span>Export Studio</span>
          </button>
        </div>
      </div>

      {/* Main Studio View Mode Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          borderBottom: '1px solid var(--border-color)',
          marginBottom: 24,
          paddingLeft: 4
        }}
      >
        <button
          type="button"
          onClick={() => setActiveViewMode('editor')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeViewMode === 'editor' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
            borderBottom: activeViewMode === 'editor' ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Sliders size={16} />
          <span>Gradient Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewMode('comparison')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeViewMode === 'comparison' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
            borderBottom: activeViewMode === 'comparison' ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <ArrowLeftRight size={16} />
          <span>Comparison Mode</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewMode('previews')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 16px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeViewMode === 'previews' ? 'var(--color-accent-blue)' : 'var(--text-secondary)',
            borderBottom: activeViewMode === 'previews' ? '2px solid var(--color-accent-blue)' : '2px solid transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Eye size={16} />
          <span>Component Previews</span>
        </button>
      </div>

      {/* ================= VIEW MODE 1: GRADIENT STUDIO ================= */}
      {activeViewMode === 'editor' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: 28,
            alignItems: 'start'
          }}
          className="gradient-grid"
        >
          {/* Left Column: Live Canvas, Draggable Track, CSS Output & Presets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Huge Gradient Canvas */}
            <div
              className="chroma-card"
              style={{
                height: 380,
                background: cssGradient,
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: 24,
                boxShadow: 'var(--shadow-float)',
                position: 'relative',
                transition: 'background 0.15s ease'
              }}
            >
              {/* Type & Angle Specs Pill */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.78)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <span>{gradientState.type.toUpperCase()}</span>
                <span>•</span>
                <span>
                  {gradientState.type === 'linear' && `${gradientState.angle}°`}
                  {gradientState.type === 'radial' && `${gradientState.radialShape}`}
                  {gradientState.type === 'conic' && `${gradientState.conicAngle}°`}
                </span>
                <span>•</span>
                <span>{gradientState.stops.length} Stops</span>
                {gradientState.repeating && <span style={{ color: '#38BDF8' }}>(Repeating)</span>}
              </div>

              {/* Action Buttons on Canvas */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  style={{
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    padding: '8px 14px',
                    borderRadius: 20,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: 'var(--shadow-md)'
                  }}
                  title="Download SVG vector"
                >
                  <Download size={14} />
                  <span>SVG</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  style={{
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    padding: '8px 14px',
                    borderRadius: 20,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: 'var(--shadow-md)'
                  }}
                  title="Open full export studio (CSS, SVG, PNG)"
                >
                  <Code size={14} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Visual Color Stop Track */}
            <div
              className="chroma-card"
              style={{
                padding: '20px 22px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-card)'
              }}
            >
              <ColorStopTrack
                stops={gradientState.stops}
                activeStopIndex={activeStopIndex}
                onSelectStop={setActiveStopIndex}
                onUpdateStopPos={handleUpdateStopPosByIndex}
                onAddStopAtPos={handleAddStopAtPos}
                onRemoveStop={handleRemoveStop}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            </div>

            {/* CSS Code Output Card */}
            <div className="chroma-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Generated CSS
                </span>
                <button
                  type="button"
                  onClick={handleCopyCss}
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  <Copy size={13} />
                  <span>Copy CSS</span>
                </button>
              </div>
              <pre
                style={{
                  background: 'var(--bg-input)',
                  padding: 14,
                  borderRadius: 10,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  overflowX: 'auto',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  margin: 0
                }}
              >
                {fullCssOutput}
              </pre>
            </div>

            {/* Curated Presets Library */}
            <div className="chroma-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                  Preset Library
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {filteredPresets.length} presets
                </span>
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {GRADIENT_CATEGORIES.map(cat => {
                  const isSelected = selectedPresetCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedPresetCategory(cat.id)}
                      style={{
                        border: isSelected ? '1px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                        background: isSelected ? 'var(--color-accent-blue)' : 'var(--bg-input)',
                        color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Grid of Preset Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                {filteredPresets.map((p) => {
                  const presetCss = generateCssGradient(p);
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleApplyPreset(p)}
                      style={{
                        height: 56,
                        borderRadius: 10,
                        background: presetCss,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: '6px 8px',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        transition: 'transform 0.15s ease'
                      }}
                      title={`${p.name} (${p.type})`}
                    >
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          textShadow: '0 1px 3px rgba(0,0,0,0.85)',
                          lineHeight: 1.1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {p.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Local Favorites & Saved Gradients Section */}
            {savedGradients.length > 0 && (
              <div className="chroma-card" style={{ padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Heart size={16} color="#EC4899" fill="#EC4899" />
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                      My Saved Gradients ({savedGradients.length})
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearAllSaved}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.74rem', cursor: 'pointer' }}
                  >
                    Clear All
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                  {savedGradients.map((item) => {
                    const savedCss = generateCssGradient(item.state);
                    return (
                      <div
                        key={item.id}
                        style={{
                          borderRadius: 10,
                          border: '1px solid var(--border-color)',
                          overflow: 'hidden',
                          background: 'var(--bg-card-subtle)'
                        }}
                      >
                        <div
                          onClick={() => {
                            updateGradientStateWithHistory(item.state);
                            showToast(`Loaded "${item.name}"`, 'info');
                          }}
                          style={{
                            height: 48,
                            background: savedCss,
                            cursor: 'pointer'
                          }}
                          title={`Click to load "${item.name}"`}
                        />
                        <div
                          style={{
                            padding: '6px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 4
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {item.name}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeleteSaved(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: 0
                            }}
                            title="Delete this gradient"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Controls */}
          <div className="chroma-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Gradient Settings</h3>

            {/* Type Selector (Linear / Radial / Conic) */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 8 }}>
                Gradient Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {['linear', 'radial', 'conic'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      updateGradientStateWithHistory(prev => ({ ...prev, type: mode }));
                    }}
                    style={{
                      padding: '8px 0',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      textTransform: 'capitalize',
                      border: '1px solid',
                      borderColor: gradientState.type === mode ? 'var(--color-accent-blue)' : 'var(--border-color)',
                      background: gradientState.type === mode ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card-subtle)',
                      color: gradientState.type === mode ? 'var(--color-accent-blue)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'var(--transition-normal)'
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Repeating Gradient Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
              <label htmlFor="repeating-toggle" style={{ fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                Repeating Gradient
              </label>
              <input
                id="repeating-toggle"
                type="checkbox"
                checked={gradientState.repeating}
                onChange={e => {
                  updateGradientStateWithHistory(prev => ({ ...prev, repeating: e.target.checked }));
                }}
                style={{ width: 18, height: 18, accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
              />
            </div>

            {/* MODE-SPECIFIC CONTROLS */}

            {/* 1. Linear Controls: Angle slider & presets */}
            {gradientState.type === 'linear' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="angle-input" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Angle</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      id="angle-input"
                      type="number"
                      min="0"
                      max="360"
                      value={gradientState.angle}
                      onChange={e => {
                        const deg = parseInt(e.target.value, 10);
                        if (!isNaN(deg)) {
                          setGradientState(prev => ({ ...prev, angle: ((deg % 360) + 360) % 360 }));
                        }
                      }}
                      className="input-text"
                      style={{ width: 64, padding: '2px 6px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
                    />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>°</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="360"
                  value={gradientState.angle}
                  onPointerDown={handleDragStart}
                  onPointerUp={handleDragEnd}
                  onChange={e => {
                    const deg = parseInt(e.target.value, 10);
                    setGradientState(prev => ({ ...prev, angle: deg }));
                  }}
                  style={{ width: '100%', accentColor: 'var(--color-accent-blue)', cursor: 'pointer' }}
                  aria-label="Linear gradient angle degrees"
                />

                {/* Quick Angle Presets */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                  {[0, 45, 90, 135, 180, 270].map(deg => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => {
                        updateGradientStateWithHistory(prev => ({ ...prev, angle: deg }));
                      }}
                      style={{
                        padding: '4px 0',
                        borderRadius: 6,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: gradientState.angle === deg ? 'var(--color-accent-blue)' : 'var(--bg-card-subtle)',
                        color: gradientState.angle === deg ? '#FFFFFF' : 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer'
                      }}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Radial Controls: Shape, Extent & Position */}
            {gradientState.type === 'radial' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Shape Selector */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Radial Shape
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {['circle', 'ellipse'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateGradientStateWithHistory(prev => ({ ...prev, radialShape: s }))}
                        style={{
                          padding: '6px 0',
                          borderRadius: 6,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          border: '1px solid',
                          borderColor: gradientState.radialShape === s ? 'var(--color-accent-blue)' : 'var(--border-color)',
                          background: gradientState.radialShape === s ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card-subtle)',
                          color: gradientState.radialShape === s ? 'var(--color-accent-blue)' : 'var(--text-primary)',
                          cursor: 'pointer'
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extent Selector */}
                <div>
                  <label htmlFor="radial-extent-select" style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Size / Extent
                  </label>
                  <select
                    id="radial-extent-select"
                    value={gradientState.radialExtent}
                    onChange={e => updateGradientStateWithHistory(prev => ({ ...prev, radialExtent: e.target.value }))}
                    className="input-text"
                    style={{ width: '100%', appearance: 'auto' }}
                  >
                    <option value="farthest-corner">farthest-corner (Default)</option>
                    <option value="closest-side">closest-side</option>
                    <option value="closest-corner">closest-corner</option>
                    <option value="farthest-side">farthest-side</option>
                  </select>
                </div>

                {/* Center Position Presets */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Center Position Presets
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                    {[
                      { label: 'Center', x: 50, y: 50 },
                      { label: 'Top', x: 50, y: 0 },
                      { label: 'Bottom', x: 50, y: 100 },
                      { label: 'Left', x: 0, y: 50 },
                      { label: 'Right', x: 100, y: 50 }
                    ].map(p => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => updateGradientStateWithHistory(prev => ({ ...prev, radialPositionX: p.x, radialPositionY: p.y }))}
                        style={{
                          padding: '4px 0',
                          borderRadius: 6,
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background: gradientState.radialPositionX === p.x && gradientState.radialPositionY === p.y
                            ? 'var(--color-accent-blue)'
                            : 'var(--bg-card-subtle)',
                          color: gradientState.radialPositionX === p.x && gradientState.radialPositionY === p.y
                            ? '#FFFFFF'
                            : 'var(--text-primary)',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer'
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom X/Y Sliders */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4 }}>
                      <span>X: {gradientState.radialPositionX}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={gradientState.radialPositionX}
                      onPointerDown={handleDragStart}
                      onPointerUp={handleDragEnd}
                      onChange={e => setGradientState(prev => ({ ...prev, radialPositionX: parseInt(e.target.value, 10) }))}
                      style={{ width: '100%', accentColor: 'var(--color-accent-blue)' }}
                      aria-label="Radial center position X percentage"
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4 }}>
                      <span>Y: {gradientState.radialPositionY}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={gradientState.radialPositionY}
                      onPointerDown={handleDragStart}
                      onPointerUp={handleDragEnd}
                      onChange={e => setGradientState(prev => ({ ...prev, radialPositionY: parseInt(e.target.value, 10) }))}
                      style={{ width: '100%', accentColor: 'var(--color-accent-blue)' }}
                      aria-label="Radial center position Y percentage"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Conic Controls: Start angle & Center Position */}
            {gradientState.type === 'conic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Conic Start Angle */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label htmlFor="conic-angle-input" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                      Start Angle
                    </label>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {gradientState.conicAngle}°
                    </span>
                  </div>
                  <input
                    id="conic-angle-input"
                    type="range"
                    min="0"
                    max="360"
                    value={gradientState.conicAngle}
                    onPointerDown={handleDragStart}
                    onPointerUp={handleDragEnd}
                    onChange={e => setGradientState(prev => ({ ...prev, conicAngle: parseInt(e.target.value, 10) }))}
                    style={{ width: '100%', accentColor: 'var(--color-accent-blue)' }}
                    aria-label="Conic start angle degrees"
                  />
                </div>

                {/* Conic Center Position Presets */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Center Position Presets
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                    {[
                      { label: 'Center', x: 50, y: 50 },
                      { label: 'Top', x: 50, y: 0 },
                      { label: 'Bottom', x: 50, y: 100 },
                      { label: 'Left', x: 0, y: 50 },
                      { label: 'Right', x: 100, y: 50 }
                    ].map(p => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => updateGradientStateWithHistory(prev => ({ ...prev, conicPositionX: p.x, conicPositionY: p.y }))}
                        style={{
                          padding: '4px 0',
                          borderRadius: 6,
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background: gradientState.conicPositionX === p.x && gradientState.conicPositionY === p.y
                            ? 'var(--color-accent-blue)'
                            : 'var(--bg-card-subtle)',
                          color: gradientState.conicPositionX === p.x && gradientState.conicPositionY === p.y
                            ? '#FFFFFF'
                            : 'var(--text-primary)',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer'
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom X/Y Sliders for Conic */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4 }}>
                      <span>X: {gradientState.conicPositionX}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={gradientState.conicPositionX}
                      onPointerDown={handleDragStart}
                      onPointerUp={handleDragEnd}
                      onChange={e => setGradientState(prev => ({ ...prev, conicPositionX: parseInt(e.target.value, 10) }))}
                      style={{ width: '100%', accentColor: 'var(--color-accent-blue)' }}
                      aria-label="Conic center position X percentage"
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700, marginBottom: 4 }}>
                      <span>Y: {gradientState.conicPositionY}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={gradientState.conicPositionY}
                      onPointerDown={handleDragStart}
                      onPointerUp={handleDragEnd}
                      onChange={e => setGradientState(prev => ({ ...prev, conicPositionY: parseInt(e.target.value, 10) }))}
                      style={{ width: '100%', accentColor: 'var(--color-accent-blue)' }}
                      aria-label="Conic center position Y percentage"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* COLOR STOPS DETAILED CONTROLLER */}
            <StopControls
              stops={gradientState.stops}
              activeStopIndex={activeStopIndex}
              onSelectStop={setActiveStopIndex}
              onAddStop={handleAddStop}
              onDuplicateStop={handleDuplicateStop}
              onRemoveStop={handleRemoveStop}
              onUpdateColor={handleUpdateActiveColor}
              onUpdatePos={handleUpdateActivePos}
              onUpdateOpacity={handleUpdateActiveOpacity}
            />
          </div>
        </div>
      )}

      {/* ================= VIEW MODE 2: COMPARISON MODE ================= */}
      {activeViewMode === 'comparison' && (
        <GradientComparison
          activeGradient={gradientState}
          onApplyGradient={(newState) => {
            updateGradientStateWithHistory(newState);
            showToast('Applied gradient from comparison slot to editor', 'success');
          }}
        />
      )}

      {/* ================= VIEW MODE 3: COMPONENT PREVIEWS ================= */}
      {activeViewMode === 'previews' && (
        <GradientComponentPreviews
          gradientState={gradientState}
        />
      )}

      {/* Save Gradient Dialog */}
      {isSaveDialogOpen && (
        <div className="modal-overlay" onClick={() => setIsSaveDialogOpen(false)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-gradient-title"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 440 }}
          >
            <h3 id="save-gradient-title" style={{ margin: '0 0 10px', fontSize: '1.15rem', fontWeight: 800 }}>
              Save Gradient to Library
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Give your gradient a name to save it to your local browser library.
            </p>

            <form onSubmit={handleSaveToFavorites}>
              <input
                type="text"
                value={saveNameInput}
                onChange={e => setSaveNameInput(e.target.value)}
                placeholder="e.g. Electric Cyber Sunset"
                className="input-text"
                autoFocus
                style={{ width: '100%', marginBottom: 16 }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsSaveDialogOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Gradient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Export Studio Modal */}
      <GradientExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        gradientState={gradientState}
      />
    </div>
  );
}
