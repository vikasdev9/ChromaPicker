import { describe, it, expect } from 'vitest';
import {
  generateCssGradient,
  generateFullCss,
  generateGradientSvg,
  formatCssStop,
  normalizeStop,
  reverseGradient,
  randomizeGradient,
  sanitizeGradientState,
  angleToSvgCoordinates
} from '../utils/gradientUtils';
import { GRADIENT_PRESETS } from '../data/gradientPresets';

describe('Gradient Studio Utilities & Serialization Tests', () => {
  const baseLinearState = {
    type: 'linear',
    angle: 90,
    repeating: false,
    stops: [
      { id: '1', color: '#FF0000', pos: 0, opacity: 100 },
      { id: '2', color: '#0000FF', pos: 100, opacity: 100 }
    ]
  };

  // 1. Valid Linear CSS generation
  it('generates valid standard linear gradient CSS', () => {
    const css = generateCssGradient(baseLinearState);
    expect(css).toBe('linear-gradient(90deg, #FF0000 0%, #0000FF 100%)');
  });

  // 2. Valid Radial CSS generation
  it('generates valid radial gradient CSS with shape, extent, and position', () => {
    const radialState = {
      type: 'radial',
      radialShape: 'ellipse',
      radialExtent: 'farthest-corner',
      radialPositionX: 30,
      radialPositionY: 40,
      repeating: false,
      stops: [
        { id: '1', color: '#2596BE', pos: 0, opacity: 100 },
        { id: '2', color: '#B8FFE4', pos: 100, opacity: 100 }
      ]
    };
    const css = generateCssGradient(radialState);
    expect(css).toBe('radial-gradient(ellipse farthest-corner at 30% 40%, #2596BE 0%, #B8FFE4 100%)');
  });

  // 3. Valid Conic CSS generation
  it('generates valid conic gradient CSS with from angle and at center position', () => {
    const conicState = {
      type: 'conic',
      conicAngle: 45,
      conicPositionX: 50,
      conicPositionY: 50,
      repeating: false,
      stops: [
        { id: '1', color: '#FF0000', pos: 0, opacity: 100 },
        { id: '2', color: '#00FF00', pos: 50, opacity: 100 },
        { id: '3', color: '#0000FF', pos: 100, opacity: 100 }
      ]
    };
    const css = generateCssGradient(conicState);
    expect(css).toBe('conic-gradient(from 45deg at 50% 50%, #FF0000 0%, #00FF00 50%, #0000FF 100%)');
  });

  // 4. Repeating gradient CSS generation
  it('generates repeating gradients for linear, radial, and conic', () => {
    const repLinear = generateCssGradient({ ...baseLinearState, repeating: true });
    expect(repLinear).toContain('repeating-linear-gradient');

    const repRadial = generateCssGradient({ ...baseLinearState, type: 'radial', repeating: true });
    expect(repRadial).toContain('repeating-radial-gradient');

    const repConic = generateCssGradient({ ...baseLinearState, type: 'conic', repeating: true });
    expect(repConic).toContain('repeating-conic-gradient');
  });

  // 5. Color-stop position formatting
  it('formats color stops with percentage position correctly', () => {
    expect(formatCssStop({ color: '#123456', pos: 25, opacity: 100 })).toBe('#123456 25%');
    expect(formatCssStop({ color: '#123456', pos: 0, opacity: 100 })).toBe('#123456 0%');
    expect(formatCssStop({ color: '#123456', pos: 100, opacity: 100 })).toBe('#123456 100%');
  });

  // 6. Multiple color stops & auto-sorting
  it('sorts multiple color stops in ascending order by position', () => {
    const multiStopState = {
      type: 'linear',
      angle: 180,
      stops: [
        { id: '1', color: '#0000FF', pos: 100, opacity: 100 },
        { id: '2', color: '#FF0000', pos: 0, opacity: 100 },
        { id: '3', color: '#00FF00', pos: 50, opacity: 100 }
      ]
    };
    const css = generateCssGradient(multiStopState);
    expect(css).toBe('linear-gradient(180deg, #FF0000 0%, #00FF00 50%, #0000FF 100%)');
  });

  // 7. Opacity and transparent colors
  it('serializes rgba colors correctly when opacity is below 100%', () => {
    const stop50 = formatCssStop({ color: '#FF0000', pos: 20, opacity: 50 });
    expect(stop50).toBe('rgba(255, 0, 0, 0.5) 20%');

    const stop0 = formatCssStop({ color: '#000000', pos: 80, opacity: 0 });
    expect(stop0).toBe('rgba(0, 0, 0, 0) 80%');
  });

  // 8. Invalid HEX input normalization
  it('safely handles and recovers from invalid hex inputs', () => {
    const normalized = normalizeStop({ color: 'invalid-hex', pos: 30, opacity: 100 });
    expect(normalized.color).toBe('#2596BE'); // fallback
    expect(normalized.pos).toBe(30);
  });

  // 9. Position boundary values: clamps to 0% and 100%
  it('clamps out-of-bound positions between 0 and 100', () => {
    const under = normalizeStop({ color: '#FFFFFF', pos: -25 });
    expect(under.pos).toBe(0);

    const over = normalizeStop({ color: '#FFFFFF', pos: 150 });
    expect(over.pos).toBe(100);
  });

  // 10. Adding and removing stops
  it('handles stops array modification and preserves identity', () => {
    const original = [...baseLinearState.stops];
    const newStop = normalizeStop({ color: '#00FF00', pos: 50 });
    const added = [...original, newStop];
    expect(added).toHaveLength(3);

    const removed = added.filter(s => s.pos !== 50);
    expect(removed).toHaveLength(2);
    expect(removed[0].color).toBe('#FF0000');
  });

  // 11. Minimum-stop validation
  it('sanitizes state to enforce minimum 2 stops', () => {
    const singleStopState = {
      type: 'linear',
      stops: [{ color: '#FF0000', pos: 50 }]
    };
    const sanitized = sanitizeGradientState(singleStopState);
    expect(sanitized.stops.length).toBeGreaterThanOrEqual(2);
  });

  // 12. Reverse operation
  it('reverses visual direction by inverting stop positions (100 - pos)', () => {
    const state = {
      type: 'linear',
      angle: 90,
      stops: [
        { id: '1', color: '#111111', pos: 10, opacity: 100 },
        { id: '2', color: '#999999', pos: 90, opacity: 100 }
      ]
    };
    const reversed = reverseGradient(state);
    expect(reversed.stops[0].pos).toBe(10);
    expect(reversed.stops[0].color).toBe('#999999');
    expect(reversed.stops[1].pos).toBe(90);
    expect(reversed.stops[1].color).toBe('#111111');
  });

  // 13. Randomized gradient validity
  it('generates valid, well-formed randomized gradients with 2-4 stops', () => {
    const rand = randomizeGradient('linear');
    expect(['linear', 'radial', 'conic']).toContain(rand.type);
    expect(rand.stops.length).toBeGreaterThanOrEqual(2);
    expect(rand.stops.length).toBeLessThanOrEqual(4);
    const css = generateCssGradient(rand);
    expect(css).toContain('linear-gradient');
  });

  // 14. CSS class and custom property serialization
  it('generates full CSS class and variable declarations with custom names', () => {
    const classCss = generateFullCss(baseLinearState, 'class', 'hero-bg');
    expect(classCss).toContain('.hero-bg {');
    expect(classCss).toContain('background: linear-gradient(90deg, #FF0000 0%, #0000FF 100%);');

    const varCss = generateFullCss(baseLinearState, 'variable', 'main-gradient');
    expect(varCss).toContain(':root {');
    expect(varCss).toContain('--main-gradient: linear-gradient(90deg, #FF0000 0%, #0000FF 100%);');
  });

  // 15. Valid handling of corrupted saved-gradient data
  it('gracefully sanitizes corrupted or invalid localStorage gradient objects', () => {
    expect(sanitizeGradientState(null)).toBeDefined();
    expect(sanitizeGradientState('string-data')).toBeDefined();
    expect(sanitizeGradientState({ stops: 'corrupted' }).stops.length).toBe(2);
    expect(sanitizeGradientState({ type: 'unknown_type' }).type).toBe('linear');
  });

  // 16. Angle to SVG coordinates mapping
  it('calculates proper 0-100% SVG coordinates from degrees', () => {
    const c0 = angleToSvgCoordinates(0); // pointing up
    expect(c0.y1).toBe('100%');
    expect(c0.y2).toBe('0%');

    const c90 = angleToSvgCoordinates(90); // pointing right
    expect(c90.x1).toBe('0%');
    expect(c90.x2).toBe('100%');
  });

  // 17. Preserves all 6 original presets
  it('preserves all 6 original presets in the expanded library', () => {
    const names = GRADIENT_PRESETS.map(p => p.name);
    expect(names).toContain('Chromapick Signature');
    expect(names).toContain('Sunset Ocean');
    expect(names).toContain('Northern Lights');
    expect(names).toContain('Neon Cyberpunk');
    expect(names).toContain('Glacier Sky');
    expect(names).toContain('Pastel Sorbet');
  });

  // 18. Detailed SVG XML structure and stop properties validation
  it('generates mathematically accurate and well-formed SVG for linear gradients', () => {
    const svg = generateGradientSvg(baseLinearState, 1200, 800);
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"');
    expect(svg).toContain('<linearGradient id="chromaGradient"');
    expect(svg).toContain('stop-color="#FF0000" stop-opacity="1"');
    expect(svg).toContain('stop-color="#0000FF" stop-opacity="1"');
    expect(svg).toContain('<rect width="100%" height="100%" fill="url(#chromaGradient)" />');
  });

  // 19. Detailed Radial SVG structure validation
  it('generates mathematically accurate radial SVG with center coordinates', () => {
    const radial = {
      type: 'radial',
      radialPositionX: 70,
      radialPositionY: 30,
      stops: [
        { id: '1', color: '#10B981', pos: 0, opacity: 80 },
        { id: '2', color: '#064E3B', pos: 100, opacity: 100 }
      ]
    };
    const svg = generateGradientSvg(radial, 1000, 1000);
    expect(svg).toContain('<radialGradient id="chromaGradient" cx="70%" cy="30%" r="50%" fx="70%" fy="30%">');
    expect(svg).toContain('stop-color="#10B981" stop-opacity="0.8"');
    expect(svg).toContain('stop-color="#064E3B" stop-opacity="1"');
  });

  // 20. Conic SVG export fallback validation
  it('generates valid foreignObject SVG containing conic-gradient for conic mode', () => {
    const conic = {
      type: 'conic',
      conicAngle: 90,
      conicPositionX: 50,
      conicPositionY: 50,
      stops: [
        { id: '1', color: '#FF0000', pos: 0, opacity: 100 },
        { id: '2', color: '#0000FF', pos: 100, opacity: 100 }
      ]
    };
    const svg = generateGradientSvg(conic, 800, 800);
    expect(svg).toContain('<foreignObject width="100%" height="100%">');
    expect(svg).toContain('background:conic-gradient(from 90deg at 50% 50%, #FF0000 0%, #0000FF 100%)');
  });
});
