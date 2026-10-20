/**
 * Curated Gradient Presets for Chromapick Gradient Studio
 * Organized by category, preserving all original Chromapick gradients
 * and featuring Linear, Radial, and Conic styles.
 */

export const GRADIENT_CATEGORIES = [
  { id: 'all', label: 'All Gradients' },
  { id: 'modern-ui', label: 'Modern UI' },
  { id: 'sunset-nature', label: 'Sunset & Nature' },
  { id: 'neon-cyberpunk', label: 'Neon & Cyberpunk' },
  { id: 'dark-premium', label: 'Dark & Premium' },
  { id: 'pastel-minimal', label: 'Pastel & Minimal' },
  { id: 'mesh-inspired', label: 'Mesh-Inspired' }
];

export const GRADIENT_PRESETS = [
  // ================= MODERN UI =================
  {
    id: 'chromapick-signature',
    name: 'Chromapick Signature',
    category: 'modern-ui',
    type: 'linear',
    angle: 90,
    repeating: false,
    stops: [
      { id: 'cs_1', color: '#FFD5BE', pos: 0, opacity: 100 },
      { id: 'cs_2', color: '#FFB6D2', pos: 35, opacity: 100 },
      { id: 'cs_3', color: '#B8FFE4', pos: 75, opacity: 100 },
      { id: 'cs_4', color: '#2596BE', pos: 100, opacity: 100 }
    ]
  },
  {
    id: 'glacier-sky',
    name: 'Glacier Sky',
    category: 'modern-ui',
    type: 'linear',
    angle: 45,
    repeating: false,
    stops: [
      { id: 'gs_1', color: '#2596BE', pos: 0, opacity: 100 },
      { id: 'gs_2', color: '#A8F3FA', pos: 100, opacity: 100 }
    ]
  },
  {
    id: 'electric-violet',
    name: 'Electric Violet',
    category: 'modern-ui',
    type: 'linear',
    angle: 135,
    repeating: false,
    stops: [
      { id: 'ev_1', color: '#4F46E5', pos: 0, opacity: 100 },
      { id: 'ev_2', color: '#7C3AED', pos: 50, opacity: 100 },
      { id: 'ev_3', color: '#C026D3', pos: 100, opacity: 100 }
    ]
  },
  {
    id: 'hyper-blue',
    name: 'Hyper Blue',
    category: 'modern-ui',
    type: 'linear',
    angle: 135,
    repeating: false,
    stops: [
      { id: 'hb_1', color: '#0EA5E9', pos: 0, opacity: 100 },
      { id: 'hb_2', color: '#2563EB', pos: 100, opacity: 100 }
    ]
  },

  // ================= SUNSET & NATURE =================
  {
    id: 'sunset-ocean',
    name: 'Sunset Ocean',
    category: 'sunset-nature',
    type: 'linear',
    angle: 135,
    repeating: false,
    stops: [
      { id: 'so_1', color: '#F97316', pos: 0, opacity: 100 },
      { id: 'so_2', color: '#EC4899', pos: 50, opacity: 100 },
      { id: 'so_3', color: '#3B82F6', pos: 100, opacity: 100 }
    ]
  },
  {
    id: 'northern-lights',
    name: 'Northern Lights',
    category: 'sunset-nature',
    type: 'linear',
    angle: 180,
    repeating: false,
    stops: [
      { id: 'nl_1', color: '#0F172A', pos: 0, opacity: 100 },
      { id: 'nl_2', color: '#10B981', pos: 50, opacity: 100 },
      { id: 'nl_3', color: '#06B6D4', pos: 100, opacity: 100 }
    ]
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    category: 'sunset-nature',
    type: 'linear',
    angle: 45,
    repeating: false,
    stops: [
      { id: 'gh_1', color: '#F59E0B', pos: 0, opacity: 100 },
      { id: 'gh_2', color: '#EF4444', pos: 60, opacity: 100 },
      { id: 'gh_3', color: '#831843', pos: 100, opacity: 100 }
    ]
  },
  {
    id: 'emerald-lagoon',
    name: 'Emerald Lagoon',
    category: 'sunset-nature',
    type: 'radial',
    radialShape: 'circle',
    radialExtent: 'farthest-corner',
    radialPositionX: 50,
    radialPositionY: 50,
    repeating: false,
    stops: [
      { id: 'el_1', color: '#34D399', pos: 0, opacity: 100 },
      { id: 'el_2', color: '#059669', pos: 50, opacity: 100 },
      { id: 'el_3', color: '#064E3B', pos: 100, opacity: 100 }
    ]
  },

  // ================= NEON & CYBERPUNK =================
  {
    id: 'neon-cyberpunk',
    name: 'Neon Cyberpunk',
    category: 'neon-cyberpunk',
    type: 'linear',
    angle: 135,
    repeating: false,
    stops: [
      { id: 'nc_1', color: '#3B82F6', pos: 0, opacity: 100 },
      { id: 'nc_2', color: '#EC4899', pos: 100, opacity: 100 }
    ]
  },
  {
    id: 'synthwave-haze',
    name: 'Synthwave Haze',
    category: 'neon-cyberpunk',
    type: 'linear',
    angle: 120,
    repeating: false,
    stops: [
      { id: 'sh_1', color: '#F43F5E', pos: 0, opacity: 100 },
      { id: 'sh_2', color: '#A855F7', pos: 50, opacity: 100 },
      { id: 'sh_3', color: '#06B6D4', pos: 100, opacity: 100 }
    ]
  },
  {
    id: 'cyber-conic-radar',
    name: 'Cyber Conic Radar',
    category: 'neon-cyberpunk',
    type: 'conic',
    conicAngle: 45,
    conicPositionX: 50,
    conicPositionY: 50,
    repeating: false,
    stops: [
      { id: 'ccr_1', color: '#06B6D4', pos: 0, opacity: 100 },
      { id: 'ccr_2', color: '#EC4899', pos: 50, opacity: 100 },
      { id: 'ccr_3', color: '#3B82F6', pos: 100, opacity: 100 }
    ]
  },

  // ================= DARK & PREMIUM =================
  {
    id: 'midnight-obsidian',
    name: 'Midnight Obsidian',
    category: 'dark-premium',
    type: 'linear',
    angle: 145,
    repeating: false,
    stops: [
      { id: 'mo_1', color: '#0F172A', pos: 0, opacity: 100 },
      { id: 'mo_2', color: '#1E293B', pos: 50, opacity: 100 },
      { id: 'mo_3', color: '#334155', pos: 100, opacity: 100 }
    ]
  },
  {
    id: 'liquid-gold',
    name: 'Liquid Gold',
    category: 'dark-premium',
    type: 'linear',
    angle: 60,
    repeating: false,
    stops: [
      { id: 'lg_1', color: '#78350F', pos: 0, opacity: 100 },
      { id: 'lg_2', color: '#D97706', pos: 45, opacity: 100 },
      { id: 'lg_3', color: '#FDE68A', pos: 100, opacity: 100 }
    ]
  },
  {
    id: 'deep-space-radial',
    name: 'Deep Space Orbit',
    category: 'dark-premium',
    type: 'radial',
    radialShape: 'circle',
    radialExtent: 'farthest-corner',
    radialPositionX: 50,
    radialPositionY: 50,
    repeating: false,
    stops: [
      { id: 'dso_1', color: '#312E81', pos: 0, opacity: 100 },
      { id: 'dso_2', color: '#0F172A', pos: 70, opacity: 100 },
      { id: 'dso_3', color: '#020617', pos: 100, opacity: 100 }
    ]
  },

  // ================= PASTEL & MINIMAL =================
  {
    id: 'pastel-sorbet',
    name: 'Pastel Sorbet',
    category: 'pastel-minimal',
    type: 'linear',
    angle: 90,
    repeating: false,
    stops: [
      { id: 'ps_1', color: '#FFB6D2', pos: 0, opacity: 100 },
      { id: 'ps_2', color: '#FFE4E6', pos: 100, opacity: 100 }
    ]
  },
  {
    id: 'soft-peach-mint',
    name: 'Soft Peach & Mint',
    category: 'pastel-minimal',
    type: 'linear',
    angle: 135,
    repeating: false,
    stops: [
      { id: 'spm_1', color: '#FFEDD5', pos: 0, opacity: 100 },
      { id: 'spm_2', color: '#FED7AA', pos: 50, opacity: 100 },
      { id: 'spm_3', color: '#CCFBF1', pos: 100, opacity: 100 }
    ]
  },
  {
    id: 'lavender-breeze',
    name: 'Lavender Breeze',
    category: 'pastel-minimal',
    type: 'linear',
    angle: 90,
    repeating: false,
    stops: [
      { id: 'lb_1', color: '#E0E7FF', pos: 0, opacity: 100 },
      { id: 'lb_2', color: '#F3E8FF', pos: 100, opacity: 100 }
    ]
  },

  // ================= MESH-INSPIRED =================
  {
    id: 'mesh-aurora-glow',
    name: 'Mesh Aurora (Approximation)',
    category: 'mesh-inspired',
    type: 'radial',
    radialShape: 'ellipse',
    radialExtent: 'farthest-corner',
    radialPositionX: 30,
    radialPositionY: 30,
    repeating: false,
    stops: [
      { id: 'mag_1', color: '#F472B6', pos: 0, opacity: 90 },
      { id: 'mag_2', color: '#60A5FA', pos: 45, opacity: 80 },
      { id: 'mag_3', color: '#34D399', pos: 85, opacity: 60 },
      { id: 'mag_4', color: '#1E1B4B', pos: 100, opacity: 100 }
    ]
  },
  {
    id: 'mesh-sunset-bloom',
    name: 'Mesh Sunset Bloom (Approximation)',
    category: 'mesh-inspired',
    type: 'conic',
    conicAngle: 120,
    conicPositionX: 50,
    conicPositionY: 50,
    repeating: false,
    stops: [
      { id: 'msb_1', color: '#F43F5E', pos: 0, opacity: 100 },
      { id: 'msb_2', color: '#FBBF24', pos: 33, opacity: 100 },
      { id: 'msb_3', color: '#818CF8', pos: 66, opacity: 100 },
      { id: 'msb_4', color: '#F43F5E', pos: 100, opacity: 100 }
    ]
  }
];
