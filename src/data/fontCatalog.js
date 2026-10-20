/**
 * Chromapick Curated Font Catalog & Pairing Presets
 * 
 * Curated collection of high-quality, popular, free Google Fonts and system fonts
 * across Sans-Serif, Serif, Monospace, Display, and Handwriting categories.
 */

export const FONT_CATEGORIES = [
  { id: 'all', label: 'All Fonts' },
  { id: 'sans-serif', label: 'Sans Serif' },
  { id: 'serif', label: 'Serif' },
  { id: 'monospace', label: 'Monospace' },
  { id: 'display', label: 'Display' },
  { id: 'handwriting', label: 'Handwriting' }
];

export const FONT_CATALOG = [
  // ================= SANS SERIF =================
  {
    family: 'Inter',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800, 900],
    hasItalic: true,
    popularity: 99,
    description: 'Carefully crafted for user interfaces and high screen legibility.',
    fallback: 'sans-serif'
  },
  {
    family: 'Roboto',
    category: 'sans-serif',
    weights: [300, 400, 500, 700, 900],
    hasItalic: true,
    popularity: 98,
    description: 'Modern geometric neo-grotesque sans-serif with natural reading rhythm.',
    fallback: 'sans-serif'
  },
  {
    family: 'Open Sans',
    category: 'sans-serif',
    weights: [300, 400, 600, 700, 800],
    hasItalic: true,
    popularity: 97,
    description: 'Humanist sans-serif with open apertures and neutral, friendly look.',
    fallback: 'sans-serif'
  },
  {
    family: 'Montserrat',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800, 900],
    hasItalic: true,
    popularity: 96,
    description: 'Geometric sans-serif inspired by early 20th-century Buenos Aires posters.',
    fallback: 'sans-serif'
  },
  {
    family: 'Poppins',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800],
    hasItalic: true,
    popularity: 95,
    description: 'Geometric sans-serif with circular letterforms and contemporary aesthetic.',
    fallback: 'sans-serif'
  },
  {
    family: 'Lato',
    category: 'sans-serif',
    weights: [300, 400, 700, 900],
    hasItalic: true,
    popularity: 94,
    description: 'Warm, semi-rounded details that convey friendly professionalism.',
    fallback: 'sans-serif'
  },
  {
    family: 'Plus Jakarta Sans',
    category: 'sans-serif',
    weights: [400, 500, 600, 700, 800],
    hasItalic: true,
    popularity: 92,
    description: 'Trendy, geometric sans-serif designed for modern web applications.',
    fallback: 'sans-serif'
  },
  {
    family: 'DM Sans',
    category: 'sans-serif',
    weights: [400, 500, 700],
    hasItalic: true,
    popularity: 91,
    description: 'Low-contrast geometric sans-serif suited for crisp UI rendering.',
    fallback: 'sans-serif'
  },
  {
    family: 'Space Grotesk',
    category: 'sans-serif',
    weights: [400, 500, 600, 700],
    hasItalic: false,
    popularity: 88,
    description: 'Proportional sans-serif with idiosyncratic retro-futuristic details.',
    fallback: 'sans-serif'
  },
  {
    family: 'Work Sans',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800],
    hasItalic: true,
    popularity: 89,
    description: 'Based on early grotesques, optimized for on-screen text.',
    fallback: 'sans-serif'
  },
  {
    family: 'Nunito',
    category: 'sans-serif',
    weights: [300, 400, 600, 700, 800],
    hasItalic: true,
    popularity: 90,
    description: 'Well-balanced rounded terminal sans-serif with cheerful appeal.',
    fallback: 'sans-serif'
  },
  {
    family: 'Raleway',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800],
    hasItalic: true,
    popularity: 89,
    description: 'Elegant neo-grotesque with an iconic display "W" and refined proportions.',
    fallback: 'sans-serif'
  },

  // ================= SERIF =================
  {
    family: 'Playfair Display',
    category: 'serif',
    weights: [400, 500, 600, 700, 800, 900],
    hasItalic: true,
    popularity: 96,
    description: 'High-contrast transitional serif influenced by John Baskerville.',
    fallback: 'serif'
  },
  {
    family: 'Merriweather',
    category: 'serif',
    weights: [300, 400, 700, 900],
    hasItalic: true,
    popularity: 95,
    description: 'Engineered specifically for pleasant on-screen long-form reading.',
    fallback: 'serif'
  },
  {
    family: 'Lora',
    category: 'serif',
    weights: [400, 500, 600, 700],
    hasItalic: true,
    popularity: 94,
    description: 'Well-balanced contemporary serif with brushed calligraphic warmth.',
    fallback: 'serif'
  },
  {
    family: 'Cormorant Garamond',
    category: 'serif',
    weights: [300, 400, 500, 600, 700],
    hasItalic: true,
    popularity: 91,
    description: 'Stunning traditional Garamond revival with slender, sharp serifs.',
    fallback: 'serif'
  },
  {
    family: 'Cinzel',
    category: 'serif',
    weights: [400, 600, 700, 800],
    hasItalic: false,
    popularity: 88,
    description: 'Classical Roman proportions with a modern, monumental authority.',
    fallback: 'serif'
  },
  {
    family: 'EB Garamond',
    category: 'serif',
    weights: [400, 500, 600, 700, 800],
    hasItalic: true,
    popularity: 89,
    description: 'Classic humanist book typeface with timeless historical elegance.',
    fallback: 'serif'
  },
  {
    family: 'Bitter',
    category: 'serif',
    weights: [300, 400, 500, 700, 800],
    hasItalic: true,
    popularity: 87,
    description: 'Slab serif created for comfortable reading on digital screens.',
    fallback: 'serif'
  },
  {
    family: 'Libre Baskerville',
    category: 'serif',
    weights: [400, 700],
    hasItalic: true,
    popularity: 90,
    description: 'Web-optimized revival of American Type Founders 1941 Baskerville.',
    fallback: 'serif'
  },

  // ================= MONOSPACE =================
  {
    family: 'JetBrains Mono',
    category: 'monospace',
    weights: [300, 400, 500, 700, 800],
    hasItalic: true,
    popularity: 95,
    description: 'Designed for developers with code readability and ligature clarity.',
    fallback: 'monospace'
  },
  {
    family: 'Fira Code',
    category: 'monospace',
    weights: [300, 400, 500, 600, 700],
    hasItalic: false,
    popularity: 94,
    description: 'Monospaced font with programming ligatures for clean code reading.',
    fallback: 'monospace'
  },
  {
    family: 'Source Code Pro',
    category: 'monospace',
    weights: [300, 400, 500, 600, 700, 900],
    hasItalic: true,
    popularity: 92,
    description: 'Clean monospaced suite designed by Paul D. Hunt for coding UI.',
    fallback: 'monospace'
  },
  {
    family: 'Space Mono',
    category: 'monospace',
    weights: [400, 700],
    hasItalic: true,
    popularity: 88,
    description: 'Original fixed-width type inspired by 1960s sci-fi headlines.',
    fallback: 'monospace'
  },
  {
    family: 'Roboto Mono',
    category: 'monospace',
    weights: [300, 400, 500, 600, 700],
    hasItalic: true,
    popularity: 90,
    description: 'Monospace variation of the Roboto family, crisp and organized.',
    fallback: 'monospace'
  },

  // ================= DISPLAY =================
  {
    family: 'Bebas Neue',
    category: 'display',
    weights: [400],
    hasItalic: false,
    popularity: 95,
    description: 'Bold condensed all-caps display font with punchy visual impact.',
    fallback: 'sans-serif'
  },
  {
    family: 'Abril Fatface',
    category: 'display',
    weights: [400],
    hasItalic: false,
    popularity: 91,
    description: 'Dramatic Didone display typeface with high contrast and dark presence.',
    fallback: 'serif'
  },
  {
    family: 'Righteous',
    category: 'display',
    weights: [400],
    hasItalic: false,
    popularity: 88,
    description: 'Art Deco geometric display font with 1930s futuristic curves.',
    fallback: 'sans-serif'
  },
  {
    family: 'Comfortaa',
    category: 'display',
    weights: [300, 400, 500, 600, 700],
    hasItalic: false,
    popularity: 89,
    description: 'Rounded geometric sans-serif display font, soft and inviting.',
    fallback: 'sans-serif'
  },
  {
    family: 'Alfa Slab One',
    category: 'display',
    weights: [400],
    hasItalic: false,
    popularity: 86,
    description: 'Heavy slab serif with immense stems and extreme visual weight.',
    fallback: 'serif'
  },

  // ================= HANDWRITING =================
  {
    family: 'Dancing Script',
    category: 'handwriting',
    weights: [400, 500, 600, 700],
    hasItalic: false,
    popularity: 93,
    description: 'Lively casual script where letters bounce and change size naturally.',
    fallback: 'cursive'
  },
  {
    family: 'Pacifico',
    category: 'handwriting',
    weights: [400],
    hasItalic: false,
    popularity: 92,
    description: 'Original brush script inspired by 1950s American surf culture.',
    fallback: 'cursive'
  },
  {
    family: 'Caveat',
    category: 'handwriting',
    weights: [400, 500, 600, 700],
    hasItalic: false,
    popularity: 91,
    description: 'Handwritten brush script designed for cozy notes and titles.',
    fallback: 'cursive'
  },
  {
    family: 'Satisfy',
    category: 'handwriting',
    weights: [400],
    hasItalic: false,
    popularity: 87,
    description: 'Fluid brush script with classic craftsmanship and timeless charm.',
    fallback: 'cursive'
  }
];

// Curated typography presets for common design use cases
export const TYPOGRAPHY_PRESETS = [
  {
    id: 'modern-saas',
    name: 'Modern SaaS',
    badge: 'Popular',
    description: 'Crisp, contemporary tech aesthetic with maximum legibility across viewports.',
    heading: {
      family: 'Plus Jakarta Sans',
      weight: 700,
      style: 'normal',
      size: 40,
      lineHeight: 1.2,
      letterSpacing: -0.8
    },
    body: {
      family: 'Inter',
      weight: 400,
      style: 'normal',
      size: 16,
      lineHeight: 1.65,
      letterSpacing: -0.1
    }
  },
  {
    id: 'editorial',
    name: 'Editorial & Publishing',
    badge: 'Classic',
    description: 'Literary sophistication combining high-contrast serif headlines with comfortable reading prose.',
    heading: {
      family: 'Playfair Display',
      weight: 700,
      style: 'normal',
      size: 44,
      lineHeight: 1.15,
      letterSpacing: -0.5
    },
    body: {
      family: 'Lora',
      weight: 400,
      style: 'normal',
      size: 17,
      lineHeight: 1.75,
      letterSpacing: 0
    }
  },
  {
    id: 'portfolio',
    name: 'Creative Portfolio',
    badge: 'Design',
    description: 'Bold expressive titles paired with utilitarian, clean geometric paragraph text.',
    heading: {
      family: 'Space Grotesk',
      weight: 700,
      style: 'normal',
      size: 42,
      lineHeight: 1.18,
      letterSpacing: -1
    },
    body: {
      family: 'DM Sans',
      weight: 400,
      style: 'normal',
      size: 16,
      lineHeight: 1.6,
      letterSpacing: 0
    }
  },
  {
    id: 'e-commerce',
    name: 'E-Commerce & Retail',
    badge: 'Commercial',
    description: 'High-impact geometric headline presence balanced with warm, approachable customer-facing text.',
    heading: {
      family: 'Montserrat',
      weight: 800,
      style: 'normal',
      size: 38,
      lineHeight: 1.2,
      letterSpacing: -0.5
    },
    body: {
      family: 'Open Sans',
      weight: 400,
      style: 'normal',
      size: 15,
      lineHeight: 1.6,
      letterSpacing: 0
    }
  },
  {
    id: 'dashboard',
    name: 'Developer & Dashboard',
    badge: 'Technical',
    description: 'Structured, data-dense interface layout with precise monospaced accents.',
    heading: {
      family: 'Poppins',
      weight: 600,
      style: 'normal',
      size: 36,
      lineHeight: 1.25,
      letterSpacing: -0.4
    },
    body: {
      family: 'JetBrains Mono',
      weight: 400,
      style: 'normal',
      size: 14,
      lineHeight: 1.6,
      letterSpacing: -0.2
    }
  },
  {
    id: 'minimalist',
    name: 'Minimalist & Clean',
    badge: 'Zen',
    description: 'Stripped-back Nordic aesthetic prioritizing whitespace, subtle contrast, and refined rhythm.',
    heading: {
      family: 'Work Sans',
      weight: 600,
      style: 'normal',
      size: 38,
      lineHeight: 1.22,
      letterSpacing: -0.6
    },
    body: {
      family: 'Merriweather',
      weight: 300,
      style: 'normal',
      size: 16,
      lineHeight: 1.8,
      letterSpacing: 0.1
    }
  }
];

// Suggested pairing templates for the "Suggest Pairing" randomizer
export const SUGGESTED_PAIRINGS = [
  { heading: 'Plus Jakarta Sans', body: 'Inter' },
  { heading: 'Playfair Display', body: 'Lora' },
  { heading: 'Space Grotesk', body: 'DM Sans' },
  { heading: 'Montserrat', body: 'Open Sans' },
  { heading: 'Bebas Neue', body: 'Roboto' },
  { heading: 'Cinzel', body: 'EB Garamond' },
  { heading: 'Poppins', body: 'JetBrains Mono' },
  { heading: 'Work Sans', body: 'Merriweather' },
  { heading: 'Abril Fatface', body: 'Lato' },
  { heading: 'Bitter', body: 'Raleway' },
  { heading: 'Comfortaa', body: 'Nunito' }
];
