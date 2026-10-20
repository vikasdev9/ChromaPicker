import React from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Layers
} from 'lucide-react';
import { formatShadowColor } from '../../utils/shadowUtils';

export default function ShadowLayerList({
  layers,
  activeLayerIndex,
  mode,
  onSelectLayer,
  onAddLayer,
  onDuplicateLayer,
  onRemoveLayer,
  onToggleLayerEnabled,
  onMoveLayerUp,
  onMoveLayerDown
}) {
  const isBox = mode === 'box-shadow';
  const maxLayers = 8;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* List Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={16} color="var(--color-accent-blue)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Shadow Layers</span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-input)',
              color: 'var(--text-muted)'
            }}
          >
            {layers.length} / {maxLayers}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddLayer}
          disabled={layers.length >= maxLayers}
          style={{
            background: 'none',
            border: 'none',
            color: layers.length >= maxLayers ? 'var(--text-muted)' : 'var(--color-accent-blue)',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: layers.length >= maxLayers ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
          title={layers.length >= maxLayers ? 'Maximum layers reached' : 'Add a new shadow layer'}
        >
          <Plus size={14} />
          <span>Add Layer</span>
        </button>
      </div>

      {/* Layers Stack Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {layers.map((layer, idx) => {
          const isSelected = activeLayerIndex === idx;
          const isEnabled = layer.enabled !== false;
          const colorString = formatShadowColor(layer.color, layer.opacity);

          return (
            <div
              key={layer.id || idx}
              onClick={() => onSelectLayer(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card-subtle)',
                border: isSelected ? '1.5px solid var(--color-accent-blue)' : '1px solid var(--border-color)',
                opacity: isEnabled ? 1 : 0.55,
                cursor: 'pointer',
                transition: 'var(--transition-normal)'
              }}
            >
              {/* Left Details: Visibility Toggle, Color Swatch, Layer Name/Offsets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLayerEnabled(idx);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isEnabled ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label={isEnabled ? `Disable layer ${idx + 1}` : `Enable layer ${idx + 1}`}
                  title={isEnabled ? 'Hide this layer' : 'Show this layer'}
                >
                  {isEnabled ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>

                {/* Color Swatch */}
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    backgroundColor: layer.color,
                    opacity: (layer.opacity !== undefined ? layer.opacity : 100) / 100,
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)',
                    flexShrink: 0
                  }}
                />

                {/* Layer Specs Readout */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Layer #{idx + 1}
                    </span>
                    {isBox && layer.inset && (
                      <span
                        style={{
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          background: 'rgba(168, 85, 247, 0.14)',
                          color: '#A855F7',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        INSET
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    X:{layer.x} Y:{layer.y} B:{layer.blur} {isBox && `S:${layer.spread || 0}`}
                  </div>
                </div>
              </div>

              {/* Right Action Tools: Reorder, Duplicate, Delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* Move Up */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveLayerUp(idx);
                  }}
                  disabled={idx === 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: idx === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
                    opacity: idx === 0 ? 0.3 : 1,
                    cursor: idx === 0 ? 'not-allowed' : 'pointer',
                    padding: 3
                  }}
                  title="Move layer up"
                >
                  <ChevronUp size={15} />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveLayerDown(idx);
                  }}
                  disabled={idx === layers.length - 1}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: idx === layers.length - 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                    opacity: idx === layers.length - 1 ? 0.3 : 1,
                    cursor: idx === layers.length - 1 ? 'not-allowed' : 'pointer',
                    padding: 3
                  }}
                  title="Move layer down"
                >
                  <ChevronDown size={15} />
                </button>

                {/* Duplicate */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateLayer(idx);
                  }}
                  disabled={layers.length >= maxLayers}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: layers.length >= maxLayers ? 'var(--text-muted)' : 'var(--text-secondary)',
                    cursor: layers.length >= maxLayers ? 'not-allowed' : 'pointer',
                    padding: 3
                  }}
                  title="Duplicate layer"
                >
                  <Copy size={13} />
                </button>

                {/* Remove */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveLayer(idx);
                  }}
                  disabled={layers.length <= 1}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: layers.length <= 1 ? 'var(--text-muted)' : 'var(--badge-error-text)',
                    opacity: layers.length <= 1 ? 0.3 : 1,
                    cursor: layers.length <= 1 ? 'not-allowed' : 'pointer',
                    padding: 3
                  }}
                  title={layers.length <= 1 ? 'Minimum 1 layer required' : 'Delete layer'}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
