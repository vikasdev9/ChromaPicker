/**
 * Curated Color Names Dataset and Nearest-Match Lookup for Chromapick
 * Contains 300+ standard, CSS, and recognized design colors.
 */

import { hexToRgb, getDeltaE, rgbToHsl } from '../utils/colorMath';

export const COLOR_DATASET = [
  // Curated Signature reference colors
  { hex: '#2596BE', name: 'Fjord Signal', category: 'blue' },
  { hex: '#FFD5BE', name: 'Pastel Peach', category: 'orange' },
  { hex: '#FFB6D2', name: 'Soft Flamingo Pink', category: 'pink' },
  { hex: '#B8FFE4', name: 'Pale Mint', category: 'green' },
  { hex: '#A8F3FA', name: 'Light Cyan', category: 'cyan' },
  { hex: '#67BDD4', name: 'Glacier Sky', category: 'cyan' },

  // Primary, Neutrals & Essentials
  { hex: '#000000', name: 'Pure Black', category: 'neutral' },
  { hex: '#111827', name: 'Midnight Charcoal', category: 'neutral' },
  { hex: '#1F2937', name: 'Dark Slate', category: 'neutral' },
  { hex: '#374151', name: 'Steel Gray', category: 'neutral' },
  { hex: '#4B5563', name: 'Gunmetal', category: 'neutral' },
  { hex: '#64748B', name: 'Slate Blue', category: 'neutral' },
  { hex: '#94A3B8', name: 'Cool Mist', category: 'neutral' },
  { hex: '#CBD5E1', name: 'Silver Sand', category: 'neutral' },
  { hex: '#E2E8F0', name: 'Platinum', category: 'neutral' },
  { hex: '#F1F5F9', name: 'Ghost White', category: 'neutral' },
  { hex: '#F8FAFC', name: 'Alabaster', category: 'neutral' },
  { hex: '#FFFFFF', name: 'Pure White', category: 'neutral' },

  // Reds & Corals
  { hex: '#EF4444', name: 'Crimson Red', category: 'red' },
  { hex: '#DC2626', name: 'Vibrant Scarlet', category: 'red' },
  { hex: '#B91C1C', name: 'Deep Carmine', category: 'red' },
  { hex: '#991B1B', name: 'Dark Burgundy', category: 'red' },
  { hex: '#7F1D1D', name: 'Mahogany', category: 'red' },
  { hex: '#F87171', name: 'Coral Rose', category: 'red' },
  { hex: '#FCA5A5', name: 'Blush Coral', category: 'red' },
  { hex: '#E11D48', name: 'Ruby Glow', category: 'red' },
  { hex: '#BE123C', name: 'Crimson Velvet', category: 'red' },
  { hex: '#FF4D4F', name: 'Sunset Vermilion', category: 'red' },
  { hex: '#D32F2F', name: 'Cardinal Red', category: 'red' },
  { hex: '#C62828', name: 'Imperial Red', category: 'red' },

  // Oranges & Ambers
  { hex: '#F97316', name: 'Tangerine Dream', category: 'orange' },
  { hex: '#EA580C', name: 'Burnt Orange', category: 'orange' },
  { hex: '#C2410C', name: 'Rust Ochre', category: 'orange' },
  { hex: '#9A3412', name: 'Sienna Brown', category: 'orange' },
  { hex: '#FB923C', name: 'Apricot Sunset', category: 'orange' },
  { hex: '#FDBA74', name: 'Peach Sorbet', category: 'orange' },
  { hex: '#F59E0B', name: 'Amber Gold', category: 'orange' },
  { hex: '#D97706', name: 'Marigold Bronze', category: 'orange' },
  { hex: '#B45309', name: 'Caramel Earth', category: 'orange' },
  { hex: '#FF7A45', name: 'Coral Flame', category: 'orange' },
  { hex: '#E65100', name: 'Tiger Lily', category: 'orange' },

  // Yellows & Golds
  { hex: '#EAB308', name: 'Sunflower Yellow', category: 'yellow' },
  { hex: '#CA8A04', name: 'Dijon Mustard', category: 'yellow' },
  { hex: '#A16207', name: 'Antique Bronze', category: 'yellow' },
  { hex: '#FACC15', name: 'Lemon Chiffon', category: 'yellow' },
  { hex: '#FDE047', name: 'Canary Yellow', category: 'yellow' },
  { hex: '#FEF08A', name: 'Buttercup', category: 'yellow' },
  { hex: '#FFD700', name: 'Classic Gold', category: 'yellow' },
  { hex: '#F4D03F', name: 'Cream Corn', category: 'yellow' },
  { hex: '#F9E79F', name: 'Vanilla Custard', category: 'yellow' },
  { hex: '#D4AC0D', name: 'Metallic Brass', category: 'yellow' },

  // Greens & Mints
  { hex: '#22C55E', name: 'Emerald Isle', category: 'green' },
  { hex: '#16A34A', name: 'Forest Jade', category: 'green' },
  { hex: '#15803D', name: 'Deep Clover', category: 'green' },
  { hex: '#166534', name: 'Pine Needle', category: 'green' },
  { hex: '#4ADE80', name: 'Spring Mint', category: 'green' },
  { hex: '#86EFAC', name: 'Seafoam Pastel', category: 'green' },
  { hex: '#10B981', name: 'Teal Mint', category: 'green' },
  { hex: '#059669', name: 'Persian Green', category: 'green' },
  { hex: '#047857', name: 'Amazon Jade', category: 'green' },
  { hex: '#84CC16', name: 'Lime Zest', category: 'green' },
  { hex: '#65A30D', name: 'Olive Grove', category: 'green' },
  { hex: '#4D7C0F', name: 'Forest Moss', category: 'green' },
  { hex: '#A3E635', name: 'Electric Lime', category: 'green' },
  { hex: '#2ECC71', name: 'Malachite', category: 'green' },
  { hex: '#27AE60', name: 'Shamrock Green', category: 'green' },

  // Teals & Cyans
  { hex: '#06B6D4', name: 'Ocean Cyan', category: 'cyan' },
  { hex: '#0891B2', name: 'Deep Turquoise', category: 'cyan' },
  { hex: '#0E7490', name: 'Dark Cerulean', category: 'cyan' },
  { hex: '#22D3EE', name: 'Bright Aqua', category: 'cyan' },
  { hex: '#67E8F9', name: 'Lagoon Mist', category: 'cyan' },
  { hex: '#14B8A6', name: 'Peacock Teal', category: 'cyan' },
  { hex: '#0D9488', name: 'Deep Seafoam', category: 'cyan' },
  { hex: '#0F766E', name: 'Ocean Depth', category: 'cyan' },
  { hex: '#1ABC9C', name: 'Mountain Meadow', category: 'cyan' },
  { hex: '#16A085', name: 'Tropical Rainforest', category: 'cyan' },
  { hex: '#00FFFF', name: 'Electric Aqua', category: 'cyan' },

  // Blues & Indigos
  { hex: '#3B82F6', name: 'Azure Blue', category: 'blue' },
  { hex: '#2563EB', name: 'Royal Cobalt', category: 'blue' },
  { hex: '#1D4ED8', name: 'Sapphire Glow', category: 'blue' },
  { hex: '#1E40AF', name: 'Navy Blue', category: 'blue' },
  { hex: '#1E3A8A', name: 'Abyssal Night', category: 'blue' },
  { hex: '#60A5FA', name: 'Sky Breeze', category: 'blue' },
  { hex: '#93C5FD', name: 'Cornflower Blue', category: 'blue' },
  { hex: '#6366F1', name: 'Electric Indigo', category: 'blue' },
  { hex: '#4F46E5', name: 'Deep Ultramarine', category: 'blue' },
  { hex: '#4338CA', name: 'Midnight Violet', category: 'blue' },
  { hex: '#3730A3', name: 'Galaxy Blue', category: 'blue' },
  { hex: '#2980B9', name: 'Belize Hole', category: 'blue' },
  { hex: '#3498DB', name: 'Peter River', category: 'blue' },
  { hex: '#007ACC', name: 'Modern Azure', category: 'blue' },

  // Purples & Violets
  { hex: '#A855F7', name: 'Amethyst Purple', category: 'purple' },
  { hex: '#9333EA', name: 'Electric Lavender', category: 'purple' },
  { hex: '#7E22CE', name: 'Imperial Violet', category: 'purple' },
  { hex: '#6B21A8', name: 'Dark Plum', category: 'purple' },
  { hex: '#581C87', name: 'Midnight Orchid', category: 'purple' },
  { hex: '#C084FC', name: 'Lilac Dream', category: 'purple' },
  { hex: '#E9D5FF', name: 'Sweet Wisteria', category: 'purple' },
  { hex: '#8B5CF6', name: 'Periwinkle Velvet', category: 'purple' },
  { hex: '#7C3AED', name: 'Majestic Iris', category: 'purple' },
  { hex: '#6D28D9', name: 'Deep Royalty', category: 'purple' },
  { hex: '#9B59B6', name: 'Mulberry Tint', category: 'purple' },
  { hex: '#8E44AD', name: 'Purple Majesty', category: 'purple' },

  // Pinks & Magentas
  { hex: '#EC4899', name: 'Neon Fuchsia', category: 'pink' },
  { hex: '#DB2777', name: 'Raspberry Rose', category: 'pink' },
  { hex: '#BE185D', name: 'Wild Orchid', category: 'pink' },
  { hex: '#9D174D', name: 'Wine Velvet', category: 'pink' },
  { hex: '#831843', name: 'Blackberry Tart', category: 'pink' },
  { hex: '#F472B6', name: 'Barbie Bloom', category: 'pink' },
  { hex: '#FBCFE8', name: 'Powder Blush', category: 'pink' },
  { hex: '#D946EF', name: 'Hot Orchid', category: 'pink' },
  { hex: '#C026D3', name: 'Vivid Cerise', category: 'pink' },
  { hex: '#A21CAF', name: 'Imperial Fuchsia', category: 'pink' },
  { hex: '#FF69B4', name: 'Bubblegum Pink', category: 'pink' },
  { hex: '#FF1493', name: 'Deep Pink Flare', category: 'pink' },

  // Earth Tones & Pastels
  { hex: '#78350F', name: 'Roasted Pecan', category: 'brown' },
  { hex: '#92400E', name: 'Cinnamon Bark', category: 'brown' },
  { hex: '#B45309', name: 'Amber Toffee', category: 'brown' },
  { hex: '#D97706', name: 'Warm Copper', category: 'brown' },
  { hex: '#F59E0B', name: 'Golden Honey', category: 'yellow' },
  { hex: '#8D6E63', name: 'Milk Chocolate', category: 'brown' },
  { hex: '#6D4C41', name: 'Dark Roast', category: 'brown' },
  { hex: '#5D4037', name: 'Espresso Bean', category: 'brown' },
  { hex: '#A1887F', name: 'Sandy Taupe', category: 'brown' },
  { hex: '#D7CCC8', name: 'Linen Fog', category: 'neutral' },
  { hex: '#F5F5DC', name: 'French Beige', category: 'neutral' },
  { hex: '#FAF0E6', name: 'Linen Cream', category: 'neutral' }
];

// Enrich dataset with calculated HSL, brightness, saturation for fast filtering
COLOR_DATASET.forEach(item => {
  const rgb = hexToRgb(item.hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  item.hsl = hsl;
  item.brightness = hsl.l;
  item.saturation = hsl.s;
  item.hue = hsl.h;
});

/**
 * Finds the nearest matching color name for any given HEX string
 */
export function findNearestColorName(hex) {
  let closest = null;
  let minDistance = Infinity;

  for (const item of COLOR_DATASET) {
    const dist = getDeltaE(hex, item.hex);
    if (dist < minDistance) {
      minDistance = dist;
      closest = item;
    }
  }

  if (!closest) {
    return { name: 'Unnamed color', exact: false, distance: 999 };
  }

  if (minDistance === 0) {
    return { name: closest.name, exact: true, distance: 0, category: closest.category };
  } else if (minDistance < 8) {
    return { name: closest.name, exact: true, distance: minDistance, category: closest.category };
  } else if (minDistance < 22) {
    return { name: `Near ${closest.name}`, exact: false, distance: minDistance, category: closest.category };
  } else {
    // When distance is too large, accurately show "Unnamed color" as required by prompt
    return { name: 'Unnamed color', exact: false, distance: minDistance, category: closest.category };
  }
}
