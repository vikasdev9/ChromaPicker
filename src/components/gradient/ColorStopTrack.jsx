import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { formatCssStop } from '../../utils/gradientUtils';

export default function ColorStopTrack({
  stops,
  activeStopIndex,
  onSelectStop,
  onUpdateStopPos,
  onAddStopAtPos,
  onRemoveStop,
  onDragStart,
  onDragEnd
}) {
  const trackRef = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);

  // Background CSS for the visual preview track (always rendered as horizontal linear-gradient)
  const sortedStops = [...stops].sort((a, b) => a.pos - b.pos);
  const trackGradientCss = `linear-gradient(to right, ${sortedStops.map(formatCssStop).join(', ')})`;

  // Calculate percentage from pointer event relative to track
  const getPercentageFromEvent = useCallback((e) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const rawPos = ((clientX - rect.left) / rect.width) * 100;
    return Math.min(100, Math.max(0, Math.round(rawPos)));
  }, []);

  // Handle pointer down on a stop handle
  const handlePointerDown = (e, index) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectStop(index);
    setDraggingIndex(index);
    if (onDragStart) onDragStart();

    const handlePointerMove = (moveEvent) => {
      const newPos = getPercentageFromEvent(moveEvent);
      onUpdateStopPos(index, newPos);
    };

    const handlePointerUp = () => {
      setDraggingIndex(null);
      if (onDragEnd) onDragEnd();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  // Handle clicking on the track itself to add a new stop at that position
  const handleTrackClick = (e) => {
    if (e.target.closest('[data-stop-handle]')) {
      return; // Handled by stop pointer down
    }
    const clickedPos = getPercentageFromEvent(e);
    if (onAddStopAtPos) {
      onAddStopAtPos(clickedPos);
    }
  };

  // Keyboard accessibility for handles
  const handleKeyDown = (e, index) => {
    const step = e.shiftKey ? 5 : 1;
    const currentPos = stops[index].pos;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onUpdateStopPos(index, Math.max(0, currentPos - step));
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onUpdateStopPos(index, Math.min(100, currentPos + step));
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && stops.length > 2) {
      e.preventDefault();
      onRemoveStop(index);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', userSelect: 'none' }}>
      {/* Track Label and Hint */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Gradient Stop Track
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Click track to add stop • Drag handle to position
        </span>
      </div>

      {/* Main Track Container */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        style={{
          position: 'relative',
          height: 38,
          borderRadius: 'var(--radius-md)',
          background: trackGradientCss,
          border: '2px solid var(--border-color)',
          cursor: 'crosshair',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
          margin: '12px 14px' // margin to allow handle overflowing left and right
        }}
        title="Click anywhere along the track to add a color stop"
      >
        {/* Subtle checkered pattern backdrop behind transparent gradients */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'calc(var(--radius-md) - 2px)',
            zIndex: 0,
            backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.06) 25%, transparent 25%),
                              linear-gradient(-45deg, rgba(0,0,0,0.06) 25%, transparent 25%),
                              linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.06) 75%),
                              linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.06) 75%)`,
            backgroundSize: '12px 12px',
            backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
            pointerEvents: 'none',
            opacity: 0.5
          }}
        />

        {/* Draggable Stop Handles */}
        {stops.map((stop, idx) => {
          const isSelected = activeStopIndex === idx;
          const isDragging = draggingIndex === idx;

          return (
            <div
              key={stop.id || idx}
              data-stop-handle="true"
              tabIndex={0}
              role="slider"
              aria-label={`Color stop ${idx + 1} at ${stop.pos}% (${stop.color})`}
              aria-valuenow={stop.pos}
              aria-valuemin={0}
              aria-valuemax={100}
              onPointerDown={(e) => handlePointerDown(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              style={{
                position: 'absolute',
                left: `${stop.pos}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: isSelected ? 26 : 22,
                height: isSelected ? 48 : 42,
                borderRadius: '8px',
                background: 'var(--bg-card)',
                border: isSelected ? '2.5px solid var(--color-accent-blue)' : '2px solid #FFFFFF',
                boxShadow: isSelected
                  ? '0 0 0 3px rgba(56, 189, 248, 0.4), 0 4px 10px rgba(0,0,0,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.25)',
                cursor: isDragging ? 'grabbing' : 'grab',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '3px 2px',
                zIndex: isSelected ? 10 : 2,
                transition: isDragging ? 'none' : 'transform 0.15s ease, box-shadow 0.15s ease',
                touchAction: 'none'
              }}
            >
              {/* Top Handle Arrow Notch */}
              <div
                style={{
                  width: 6,
                  height: 3,
                  borderRadius: 2,
                  background: isSelected ? 'var(--color-accent-blue)' : 'var(--text-muted)'
                }}
              />

              {/* Color Swatch in Handle Center */}
              <div
                style={{
                  width: 14,
                  height: 18,
                  borderRadius: 4,
                  backgroundColor: stop.color,
                  opacity: typeof stop.opacity === 'number' ? stop.opacity / 100 : 1,
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)'
                }}
              />

              {/* Position Pill / Value */}
              <div
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: isSelected ? 'var(--color-accent-blue)' : 'var(--text-primary)',
                  lineHeight: 1
                }}
              >
                {stop.pos}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
