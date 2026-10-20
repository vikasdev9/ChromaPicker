/**
 * Curated CSS Image Filter Presets for Chromapick
 * Defined as maintainable data representing CSS filter combinations.
 */

export const IMAGE_FILTER_PRESETS = [
  {
    id: 'original',
    name: 'Original',
    badge: 'Reset',
    description: 'Clean, unfiltered image with all default values.',
    values: {
      brightness: 100,
      contrast: 100,
      saturate: 100,
      grayscale: 0,
      sepia: 0,
      blur: 0,
      hueRotate: 0,
      invert: 0,
      opacity: 100
    }
  },
  {
    id: 'vivid',
    name: 'Vivid',
    badge: 'Enhance',
    description: 'Enhanced color punch and deeper contrast for vibrant photography.',
    values: {
      brightness: 108,
      contrast: 118,
      saturate: 145,
      grayscale: 0,
      sepia: 0,
      blur: 0,
      hueRotate: 0,
      invert: 0,
      opacity: 100
    }
  },
  {
    id: 'warm',
    name: 'Warm Sunset',
    badge: 'Golden',
    description: 'Gentle golden hour warmth with subtle sepia and amber tone.',
    values: {
      brightness: 104,
      contrast: 106,
      saturate: 120,
      grayscale: 0,
      sepia: 28,
      blur: 0,
      hueRotate: 350,
      invert: 0,
      opacity: 100
    }
  },
  {
    id: 'cool',
    name: 'Cool Breeze',
    badge: 'Crisp',
    description: 'Cool blue-shifted tone with crisp contrast.',
    values: {
      brightness: 102,
      contrast: 110,
      saturate: 112,
      grayscale: 0,
      sepia: 0,
      blur: 0,
      hueRotate: 25,
      invert: 0,
      opacity: 100
    }
  },
  {
    id: 'vintage',
    name: 'Vintage Film',
    badge: 'Retro',
    description: 'Nostalgic analog film look with reduced saturation and rich sepia.',
    values: {
      brightness: 108,
      contrast: 92,
      saturate: 78,
      grayscale: 0,
      sepia: 48,
      blur: 0,
      hueRotate: 0,
      invert: 0,
      opacity: 100
    }
  },
  {
    id: 'grayscale',
    name: 'Classic B&W',
    badge: 'Monochrome',
    description: 'Timeless balanced black and white conversion.',
    values: {
      brightness: 104,
      contrast: 112,
      saturate: 100,
      grayscale: 100,
      sepia: 0,
      blur: 0,
      hueRotate: 0,
      invert: 0,
      opacity: 100
    }
  },
  {
    id: 'noir',
    name: 'Cinema Noir',
    badge: 'High Contrast',
    description: 'Moody, high-contrast black and white with deep shadows.',
    values: {
      brightness: 88,
      contrast: 155,
      saturate: 100,
      grayscale: 100,
      sepia: 0,
      blur: 0,
      hueRotate: 0,
      invert: 0,
      opacity: 100
    }
  },
  {
    id: 'soft',
    name: 'Soft Glow',
    badge: 'Dreamy',
    description: 'Dreamy soft-focus look with mild 1px blur and muted contrast.',
    values: {
      brightness: 105,
      contrast: 92,
      saturate: 90,
      grayscale: 0,
      sepia: 0,
      blur: 1,
      hueRotate: 0,
      invert: 0,
      opacity: 100
    }
  },
  {
    id: 'dramatic',
    name: 'Dramatic Punch',
    badge: 'Intense',
    description: 'Heavy contrast and saturated shadows for editorial depth.',
    values: {
      brightness: 94,
      contrast: 145,
      saturate: 135,
      grayscale: 0,
      sepia: 0,
      blur: 0,
      hueRotate: 0,
      invert: 0,
      opacity: 100
    }
  },
  {
    id: 'faded',
    name: 'Faded Matte',
    badge: 'Matte',
    description: 'Crushed blacks, lifted midtones, and subtle washed-out palette.',
    values: {
      brightness: 114,
      contrast: 84,
      saturate: 78,
      grayscale: 0,
      sepia: 18,
      blur: 0,
      hueRotate: 0,
      invert: 0,
      opacity: 100
    }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    badge: 'Electric',
    description: 'Electric futuristic palette with rotated hue and neon saturation.',
    values: {
      brightness: 102,
      contrast: 130,
      saturate: 175,
      grayscale: 0,
      sepia: 0,
      blur: 0,
      hueRotate: 55,
      invert: 0,
      opacity: 100
    }
  },
  {
    id: 'inverted-art',
    name: 'Invert Pop',
    badge: 'Abstract',
    description: 'Artistic negative inversion with hue shift.',
    values: {
      brightness: 100,
      contrast: 115,
      saturate: 120,
      grayscale: 0,
      sepia: 0,
      blur: 0,
      hueRotate: 180,
      invert: 100,
      opacity: 100
    }
  }
];
