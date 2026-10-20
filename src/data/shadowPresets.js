/**
 * Curated Box-Shadow and Text-Shadow Presets for Chromapick
 * Provides high-quality, production-ready elevation and text styling patterns.
 */

export const BOX_SHADOW_PRESETS = [
  {
    id: 'subtle-elevation',
    name: 'Soft Elevation',
    badge: 'Clean UI',
    description: 'Natural, soft card elevation for clean dashboard and web interfaces.',
    mode: 'box-shadow',
    layers: [
      { id: 'se_1', enabled: true, x: 0, y: 4, blur: 16, spread: -2, color: '#000000', opacity: 8, inset: false },
      { id: 'se_2', enabled: true, x: 0, y: 1, blur: 4, spread: -1, color: '#000000', opacity: 6, inset: false }
    ]
  },
  {
    id: 'floating-modal',
    name: 'Floating Elevation',
    badge: 'Modal',
    description: 'Pronounced depth ideal for popovers, modals, and hovering action cards.',
    mode: 'box-shadow',
    layers: [
      { id: 'fm_1', enabled: true, x: 0, y: 20, blur: 38, spread: -10, color: '#000000', opacity: 20, inset: false },
      { id: 'fm_2', enabled: true, x: 0, y: 8, blur: 16, spread: -4, color: '#000000', opacity: 12, inset: false }
    ]
  },
  {
    id: 'smooth-3d-stack',
    name: 'Multi-Layer 3D Depth',
    badge: 'Photorealistic',
    description: 'Smooth multi-octave layered ambient shadow simulating physical light dispersion.',
    mode: 'box-shadow',
    layers: [
      { id: 's3d_1', enabled: true, x: 0, y: 2, blur: 4, spread: 0, color: '#000000', opacity: 6, inset: false },
      { id: 's3d_2', enabled: true, x: 0, y: 8, blur: 16, spread: 0, color: '#000000', opacity: 8, inset: false },
      { id: 's3d_3', enabled: true, x: 0, y: 24, blur: 48, spread: -4, color: '#000000', opacity: 14, inset: false }
    ]
  },
  {
    id: 'hard-edge-neobrutal',
    name: 'Hard Edge (Neo-Brutalist)',
    badge: 'Graphic',
    description: 'Zero blur, bold offset shadow for modern retro and neo-brutalist styling.',
    mode: 'box-shadow',
    layers: [
      { id: 'hn_1', enabled: true, x: 6, y: 6, blur: 0, spread: 0, color: '#000000', opacity: 100, inset: false }
    ]
  },
  {
    id: 'neon-cyan-glow',
    name: 'Neon Cyan Glow',
    badge: 'Cyberpunk',
    description: 'Vibrant electric cyan aura for dark interfaces and highlighted elements.',
    mode: 'box-shadow',
    layers: [
      { id: 'ncg_1', enabled: true, x: 0, y: 0, blur: 15, spread: 2, color: '#06B6D4', opacity: 65, inset: false },
      { id: 'ncg_2', enabled: true, x: 0, y: 4, blur: 30, spread: 8, color: '#0284C7', opacity: 35, inset: false }
    ]
  },
  {
    id: 'cyber-magenta-glow',
    name: 'Cyber Magenta Glow',
    badge: 'Glow',
    description: 'Luminous pink-magenta backlighting effect for buttons and accent badges.',
    mode: 'box-shadow',
    layers: [
      { id: 'cmg_1', enabled: true, x: 0, y: 0, blur: 18, spread: 3, color: '#EC4899', opacity: 60, inset: false },
      { id: 'cmg_2', enabled: true, x: 0, y: 8, blur: 36, spread: 6, color: '#A855F7', opacity: 40, inset: false }
    ]
  },
  {
    id: 'inset-pressed',
    name: 'Inset Pressed / Debossed',
    badge: 'Neumorphic',
    description: 'Subtle inner shadow creating a carved, pressed, or sunken well effect.',
    mode: 'box-shadow',
    layers: [
      { id: 'ip_1', enabled: true, x: 2, y: 4, blur: 8, spread: 0, color: '#000000', opacity: 30, inset: true },
      { id: 'ip_2', enabled: true, x: -1, y: -1, blur: 4, spread: 0, color: '#FFFFFF', opacity: 15, inset: true }
    ]
  },
  {
    id: 'chromapick-brand-aura',
    name: 'Chromapick Signature Aura',
    badge: 'Signature',
    description: 'Tailored brand blue accent halo matching Chromapick identity.',
    mode: 'box-shadow',
    layers: [
      { id: 'cba_1', enabled: true, x: 0, y: 8, blur: 28, spread: -6, color: '#166A8A', opacity: 45, inset: false },
      { id: 'cba_2', enabled: true, x: 0, y: 2, blur: 8, spread: -2, color: '#A8F3FA', opacity: 35, inset: false }
    ]
  }
];

export const TEXT_SHADOW_PRESETS = [
  {
    id: 'subtle-letterpress',
    name: 'Letterpress / Engraved',
    badge: 'Typography',
    description: 'Crisp bottom highlight giving text an engraved, tactile feel.',
    mode: 'text-shadow',
    layers: [
      { id: 'sl_1', enabled: true, x: 0, y: 2, blur: 3, color: '#000000', opacity: 50 },
      { id: 'sl_2', enabled: true, x: 0, y: -1, blur: 1, color: '#FFFFFF', opacity: 20 }
    ]
  },
  {
    id: 'retro-3d-stack',
    name: 'Retro 3D Isometric Stack',
    badge: 'Display',
    description: 'Layered solid color offsets creating an extruded 3D typeface.',
    mode: 'text-shadow',
    layers: [
      { id: 'r3d_1', enabled: true, x: 2, y: 2, blur: 0, color: '#EC4899', opacity: 90 },
      { id: 'r3d_2', enabled: true, x: 4, y: 4, blur: 0, color: '#8B5CF6', opacity: 90 },
      { id: 'r3d_3', enabled: true, x: 6, y: 6, blur: 0, color: '#06B6D4', opacity: 90 },
      { id: 'r3d_4', enabled: true, x: 8, y: 8, blur: 0, color: '#0F172A', opacity: 90 }
    ]
  },
  {
    id: 'neon-sign-glow',
    name: 'Neon Sign Glow',
    badge: 'Vibrant',
    description: 'Multi-layer diffused radial luminescence resembling a glowing neon sign.',
    mode: 'text-shadow',
    layers: [
      { id: 'nsg_1', enabled: true, x: 0, y: 0, blur: 5, color: '#38BDF8', opacity: 90 },
      { id: 'nsg_2', enabled: true, x: 0, y: 0, blur: 15, color: '#0284C7', opacity: 80 },
      { id: 'nsg_3', enabled: true, x: 0, y: 0, blur: 30, color: '#0369A1', opacity: 60 }
    ]
  },
  {
    id: 'soft-readable-drop',
    name: 'Readable Headline Drop',
    badge: 'Editorial',
    description: 'Soft vertical drop shadow enhancing legibility over complex background images.',
    mode: 'text-shadow',
    layers: [
      { id: 'srd_1', enabled: true, x: 0, y: 4, blur: 12, color: '#000000', opacity: 45 },
      { id: 'srd_2', enabled: true, x: 0, y: 1, blur: 3, color: '#000000', opacity: 30 }
    ]
  },
  {
    id: 'hard-sticker-outline',
    name: 'Hard Graphic Sticker',
    badge: 'Pop',
    description: 'Offset solid pop shadow creating high contrast and punchy separation.',
    mode: 'text-shadow',
    layers: [
      { id: 'hso_1', enabled: true, x: 3, y: 3, blur: 0, color: '#0F172A', opacity: 95 }
    ]
  }
];
