import React, { useRef, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { hexToRgb } from '../../utils/colorMath';

/**
 * Advanced Circular Magnifier Loupe with Pixel Grid & Floating Color Card
 * Fully Responsive & Touch-Optimized:
 * - Adapts diameter (140px on mobile, 180px on desktop)
 * - Lifts above finger during touch-and-drag inspection
 * - Crisp pixel-grid rendering with visible individual pixels at high zoom
 * - Crosshair target on inspected center pixel
 * - Zoom badge inside circle (e.g. "12× Zoom")
 * - Connected floating color preview card with HEX, RGB, and Copy button
 * - Strict boundary collision detection preventing any viewport overflow
 */
export default function MagnifierLoupe({
  x = 0,
  y = 0,
  actualX = 0,
  actualY = 0,
  sourceCanvasRef,
  canvas,
  pixelColor = '#1A8EAC',
  visible = false,
  containerWidth = 600,
  containerHeight = 400,
  magnification = 12,
  loupeDiameter: propLoupeDiameter = 180,
  isTouch = false,
  onCopy
}) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  // Responsive diameter: adapt to user-selected prop with container safety clamp
  const isSmall = containerWidth < 460;
  const maxSafeDiameter = Math.max(70, Math.min(containerWidth - 12, containerHeight - 12));
  const loupeDiameter = Math.min(propLoupeDiameter || (isSmall ? 140 : 180), maxSafeDiameter);
  const loupeRadius = Math.round(loupeDiameter / 2);

  // Render zoomed pixel grid onto circular canvas
  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    const destCtx = canvasRef.current.getContext('2d');
    if (!destCtx) return;

    destCtx.clearRect(0, 0, loupeDiameter, loupeDiameter);

    // Circular clip
    destCtx.save();
    destCtx.beginPath();
    destCtx.arc(loupeRadius, loupeRadius, loupeRadius - 1, 0, Math.PI * 2);
    destCtx.clip();

    const sourceCanvas = (sourceCanvasRef && sourceCanvasRef.current) || canvas;
    const cellSize = Math.max(2, magnification);

    // Number of cells across diameter (ensure odd number for true center)
    let numCells = Math.ceil(loupeDiameter / cellSize);
    if (numCells % 2 === 0) numCells += 1;
    const cellRadius = Math.floor(numCells / 2);

    const startX = loupeRadius - (cellRadius * cellSize) - (cellSize / 2);
    const startY = loupeRadius - (cellRadius * cellSize) - (cellSize / 2);

    if (sourceCanvas) {
      try {
        const srcCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
        const imgWidth = sourceCanvas.width;
        const imgHeight = sourceCanvas.height;

        for (let dy = -cellRadius; dy <= cellRadius; dy++) {
          for (let dx = -cellRadius; dx <= cellRadius; dx++) {
            const sampleX = Math.min(Math.max(actualX + dx, 0), imgWidth - 1);
            const sampleY = Math.min(Math.max(actualY + dy, 0), imgHeight - 1);

            const p = srcCtx.getImageData(sampleX, sampleY, 1, 1).data;
            const r = p[0];
            const g = p[1];
            const b = p[2];
            const a = p[3] / 255;

            const cX = startX + (dx + cellRadius) * cellSize;
            const cY = startY + (dy + cellRadius) * cellSize;

            destCtx.fillStyle = a === 0 ? '#1F2937' : `rgba(${r}, ${g}, ${b}, ${a})`;
            destCtx.fillRect(cX, cY, cellSize, cellSize);

            // Subtle cell grid border lines
            if (cellSize >= 4) {
              destCtx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
              destCtx.lineWidth = 1;
              destCtx.strokeRect(cX + 0.5, cY + 0.5, cellSize - 1, cellSize - 1);
            }
          }
        }
      } catch {
        // Fallback solid fill if cross-origin canvas read fails
        destCtx.fillStyle = pixelColor || '#1E293B';
        destCtx.fillRect(0, 0, loupeDiameter, loupeDiameter);
      }
    } else {
      destCtx.fillStyle = pixelColor || '#1E293B';
      destCtx.fillRect(0, 0, loupeDiameter, loupeDiameter);
    }

    // Center pixel crosshair target matching Screenshot 1
    const centerCellX = startX + cellRadius * cellSize;
    const centerCellY = startY + cellRadius * cellSize;

    // Dark outer contrast border
    destCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    destCtx.lineWidth = 3;
    destCtx.strokeRect(centerCellX - 0.5, centerCellY - 0.5, cellSize + 1, cellSize + 1);

    // Crisp white square target
    destCtx.strokeStyle = '#FFFFFF';
    destCtx.lineWidth = 2;
    destCtx.strokeRect(centerCellX + 0.5, centerCellY + 0.5, cellSize - 1, cellSize - 1);

    // Center crosshair lines
    destCtx.strokeStyle = '#FFFFFF';
    destCtx.lineWidth = 1.5;
    destCtx.beginPath();
    // Horizontal tick
    destCtx.moveTo(centerCellX + 2, centerCellY + Math.floor(cellSize / 2) + 0.5);
    destCtx.lineTo(centerCellX + cellSize - 2, centerCellY + Math.floor(cellSize / 2) + 0.5);
    // Vertical tick
    destCtx.moveTo(centerCellX + Math.floor(cellSize / 2) + 0.5, centerCellY + 2);
    destCtx.lineTo(centerCellX + Math.floor(cellSize / 2) + 0.5, centerCellY + cellSize - 2);
    destCtx.stroke();

    destCtx.restore();
  }, [actualX, actualY, canvas, sourceCanvasRef, pixelColor, visible, magnification, loupeDiameter, loupeRadius]);

  if (!visible || !pixelColor) return null;

  // Format RGB string for floating card
  const rgb = hexToRgb(pixelColor);
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  // Smart boundary collision detection for circular loupe and floating card
  const CARD_WIDTH = isSmall ? 118 : 135;
  const CARD_HEIGHT = isSmall ? 44 : 48;

  // On touch, position loupe above finger so thumb does not obscure the loupe
  let loupeLeft = x - loupeRadius;
  let loupeTop = isTouch ? (y - loupeRadius - 48) : (y - loupeRadius);

  // If finger is near top boundary, flip loupe below finger
  if (isTouch && loupeTop < 8) {
    loupeTop = y + 24;
  }

  // Clamp loupe strictly within container boundaries
  if (loupeLeft < 6) loupeLeft = 6;
  if (loupeLeft + loupeDiameter > containerWidth - 6) {
    loupeLeft = Math.max(6, containerWidth - loupeDiameter - 6);
  }
  if (loupeTop < 6) loupeTop = 6;
  if (loupeTop + loupeDiameter > containerHeight - 6) {
    loupeTop = Math.max(6, containerHeight - loupeDiameter - 6);
  }

  // Floating card placement (attached to right by default, flips to left or centered if space is tight)
  let cardOnRight = true;
  let cardLeft = loupeLeft + loupeDiameter - 12;
  if (cardLeft + CARD_WIDTH > containerWidth - 6) {
    cardOnRight = false;
    cardLeft = loupeLeft - CARD_WIDTH + 12;
  }
  if (cardLeft < 6) {
    // Center card horizontally if neither left nor right has enough room
    cardLeft = Math.max(6, Math.min((containerWidth - CARD_WIDTH) / 2, containerWidth - CARD_WIDTH - 6));
  }

  let cardTop = loupeTop + Math.max(6, Math.round(loupeRadius - CARD_HEIGHT / 2));
  if (cardTop + CARD_HEIGHT > containerHeight - 6) {
    cardTop = Math.max(6, containerHeight - CARD_HEIGHT - 6);
  }
  if (cardTop < 6) cardTop = 6;

  const handleCopyClick = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(pixelColor);
    setCopied(true);
    if (onCopy) onCopy(pixelColor);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 40,
        overflow: 'hidden'
      }}
    >
      {/* SVG Connecting pointer line */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        {/* Line from touched pixel to loupe center when raised in touch mode */}
        {isTouch && (
          <line
            x1={x}
            y1={y}
            x2={loupeLeft + loupeRadius}
            y2={loupeTop + loupeRadius}
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="2"
            strokeDasharray="4 2"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
          />
        )}

        {/* Line connecting loupe center to floating card */}
        <line
          x1={loupeLeft + loupeRadius}
          y1={loupeTop + loupeRadius}
          x2={cardOnRight ? cardLeft + 2 : cardLeft + CARD_WIDTH - 2}
          y2={cardTop + CARD_HEIGHT / 2}
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
        />

        {/* White circle at inspected pixel */}
        <circle
          cx={x}
          cy={y}
          r={isTouch ? 5 : 4}
          fill="#FFFFFF"
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="1.5"
        />
      </svg>

      {/* Large Circular Magnifying Glass Loupe matching Screenshot 1 */}
      <div
        style={{
          position: 'absolute',
          left: loupeLeft,
          top: loupeTop,
          width: loupeDiameter,
          height: loupeDiameter,
          borderRadius: '50%',
          boxShadow: '0 16px 36px -4px rgba(0, 0, 0, 0.4), 0 0 0 3px var(--bg-card), 0 0 0 5px var(--border-color)',
          overflow: 'hidden',
          background: '#0F172A',
          transition: 'transform 0.05s ease-out'
        }}
      >
        <canvas
          ref={canvasRef}
          width={loupeDiameter}
          height={loupeDiameter}
          style={{
            width: '100%',
            height: '100%',
            display: 'block'
          }}
        />

        {/* Zoom badge at bottom of circle */}
        <div
          style={{
            position: 'absolute',
            bottom: Math.max(6, Math.round(loupeRadius * 0.12)),
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(6px)',
            color: '#FFFFFF',
            fontSize: loupeDiameter < 130 ? '0.62rem' : isSmall ? '0.68rem' : '0.74rem',
            fontWeight: 700,
            padding: loupeDiameter < 130 ? '1px 6px' : isSmall ? '2px 8px' : '3px 10px',
            borderRadius: 20,
            border: '1px solid rgba(255, 255, 255, 0.25)',
            letterSpacing: '0.02em',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}
        >
          {magnification}× Zoom
        </div>
      </div>

      {/* Floating Color Preview Card */}
      <div
        onClick={handleCopyClick}
        style={{
          position: 'absolute',
          left: cardLeft,
          top: cardTop,
          width: CARD_WIDTH,
          minHeight: CARD_HEIGHT,
          background: 'var(--bg-card)',
          borderRadius: 10,
          padding: isSmall ? '4px 8px' : '6px 10px',
          boxShadow: 'var(--shadow-lg), 0 0 0 1px var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: isSmall ? 6 : 8,
          pointerEvents: 'auto',
          cursor: 'pointer',
          transition: 'transform 0.1s ease',
          userSelect: 'none'
        }}
        title="Click to copy HEX code"
      >
        {/* Swatch square */}
        <div
          style={{
            width: isSmall ? 26 : 30,
            height: isSmall ? 26 : 30,
            borderRadius: 6,
            backgroundColor: pixelColor,
            border: '1px solid rgba(0, 0, 0, 0.1)',
            flexShrink: 0
          }}
        />

        {/* HEX and RGB labels */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: isSmall ? '0.74rem' : '0.82rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.15
            }}
          >
            {pixelColor}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: isSmall ? '0.58rem' : '0.62rem',
              color: 'var(--text-muted)',
              lineHeight: 1.15,
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {rgbString}
          </span>
        </div>

        {/* Copy button icon */}
        <div style={{ color: copied ? 'var(--badge-success-text)' : 'var(--text-muted)', flexShrink: 0 }}>
          {copied ? <Check size={14} /> : <Copy size={13} />}
        </div>
      </div>
    </div>
  );
}
