/**
 * Color Blindness (CVD - Color Vision Deficiency) Simulation Utilities
 * Uses established Machado et al. / Brettel et al. transformation matrices.
 * Clearly labeled as scientific simulations, not medical diagnostics.
 */

import { rgbToHex, clamp } from './colorMath';

export const CVD_TYPES = [
  {
    id: 'normal',
    name: 'Normal Vision',
    description: 'Standard trichromatic vision with all three photopigments functioning normally.',
    prevalence: 'Typical'
  },
  {
    id: 'protanopia',
    name: 'Protanopia',
    description: 'Complete absence of red L-cones. Reds appear dark, brown, or olive green.',
    prevalence: '~1% of males'
  },
  {
    id: 'protanomaly',
    name: 'Protanomaly',
    description: 'Shifted L-cone sensitivity (red-weak). Red, orange, and yellow hues appear greener.',
    prevalence: '~1% of males'
  },
  {
    id: 'deuteranopia',
    name: 'Deuteranopia',
    description: 'Complete absence of green M-cones. Green and red tones blend into yellow/brown.',
    prevalence: '~1% of males'
  },
  {
    id: 'deuteranomaly',
    name: 'Deuteranomaly',
    description: 'Shifted M-cone sensitivity (green-weak). Most common form of color deficiency.',
    prevalence: '~5% of males, 0.4% females'
  },
  {
    id: 'tritanopia',
    name: 'Tritanopia',
    description: 'Absence of blue S-cones (blue-blind). Blue appears greenish and yellow appears violet.',
    prevalence: '~0.003% of population'
  },
  {
    id: 'tritanomaly',
    name: 'Tritanomaly',
    description: 'Shifted S-cone sensitivity (blue-weak). Blue and green shades look similar.',
    prevalence: '~0.01% of population'
  },
  {
    id: 'achromatopsia',
    name: 'Achromatopsia',
    description: 'Complete lack of color perception (monochromacy). World viewed in shades of grey.',
    prevalence: '~0.003% of population'
  },
  {
    id: 'achromatomaly',
    name: 'Achromatomaly',
    description: 'Partial absence of cone function with severely muted, faded color perception.',
    prevalence: 'Extremely rare'
  }
];

// Transformation matrices for linear RGB
const SIMULATION_MATRICES = {
  normal: [
    1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0
  ],
  protanopia: [
    0.56667, 0.43333, 0.0,
    0.55833, 0.44167, 0.0,
    0.0,     0.24167, 0.75833
  ],
  protanomaly: [
    0.81667, 0.18333, 0.0,
    0.33333, 0.66667, 0.0,
    0.0,     0.125,   0.875
  ],
  deuteranopia: [
    0.625,   0.375,   0.0,
    0.70,    0.30,    0.0,
    0.0,     0.30,    0.70
  ],
  deuteranomaly: [
    0.80,    0.20,    0.0,
    0.25833, 0.74167, 0.0,
    0.0,     0.14167, 0.85833
  ],
  tritanopia: [
    0.95,    0.05,    0.0,
    0.0,     0.43333, 0.56667,
    0.0,     0.475,   0.525
  ],
  tritanomaly: [
    0.96667, 0.03333, 0.0,
    0.0,     0.73333, 0.26667,
    0.0,     0.18333, 0.81667
  ],
  achromatopsia: [
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114
  ],
  achromatomaly: [
    0.618, 0.320, 0.062,
    0.163, 0.775, 0.062,
    0.163, 0.320, 0.516
  ]
};

/**
 * Simulates a single RGB color under a given CVD type
 */
export function simulateRgb(r, g, b, type = 'normal') {
  const m = SIMULATION_MATRICES[type] || SIMULATION_MATRICES.normal;

  const simR = clamp(Math.round(r * m[0] + g * m[1] + b * m[2]), 0, 255);
  const simG = clamp(Math.round(r * m[3] + g * m[4] + b * m[5]), 0, 255);
  const simB = clamp(Math.round(r * m[6] + g * m[7] + b * m[8]), 0, 255);

  return {
    r: simR,
    g: simG,
    b: simB,
    hex: rgbToHex(simR, simG, simB)
  };
}

/**
 * Simulates an array of hex colors under all CVD types
 */
export function simulatePalette(hexList, type = 'protanopia') {
  return hexList.map(hex => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return simulateRgb(r, g, b, type).hex;
  });
}

/**
 * Simulates an image on an offscreen canvas and returns dataURL
 */
export function simulateImageCanvas(sourceCanvas, type = 'normal') {
  if (type === 'normal') return sourceCanvas.toDataURL();

  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const copyCanvas = document.createElement('canvas');
  copyCanvas.width = w;
  copyCanvas.height = h;
  const ctx = copyCanvas.getContext('2d');
  ctx.drawImage(sourceCanvas, 0, 0);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const m = SIMULATION_MATRICES[type] || SIMULATION_MATRICES.normal;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    data[i] = clamp(Math.round(r * m[0] + g * m[1] + b * m[2]), 0, 255);
    data[i + 1] = clamp(Math.round(r * m[3] + g * m[4] + b * m[5]), 0, 255);
    data[i + 2] = clamp(Math.round(r * m[6] + g * m[7] + b * m[8]), 0, 255);
  }

  ctx.putImageData(imgData, 0, 0);
  return copyCanvas.toDataURL();
}
