/**
 * Curated Border Radius Presets for Chromapick
 * Includes standard geometric, asymmetric, pill, circle, and organic shapes.
 */

export const BORDER_RADIUS_PRESETS = [
  {
    id: 'subtle',
    name: 'Subtle',
    badge: 'Standard',
    description: 'Clean, slight rounding for modern cards and buttons.',
    unit: 'px',
    isLinked: true,
    tl: 6,
    tr: 6,
    br: 6,
    bl: 6,
    isElliptical: false
  },
  {
    id: 'rounded',
    name: 'Rounded',
    badge: 'Popular',
    description: 'Generous modern curvature for cards, dialogs, and panels.',
    unit: 'px',
    isLinked: true,
    tl: 16,
    tr: 16,
    br: 16,
    bl: 16,
    isElliptical: false
  },
  {
    id: 'smooth-modern',
    name: 'Smooth Modern',
    badge: 'Modern',
    description: 'iOS / macOS style pronounced smooth squircle-like radius.',
    unit: 'px',
    isLinked: true,
    tl: 28,
    tr: 28,
    br: 28,
    bl: 28,
    isElliptical: false
  },
  {
    id: 'pill',
    name: 'Pill / Capsule',
    badge: 'Component',
    type: 'pill',
    description: 'Capsule shape with completely rounded ends for chips and tags.',
    unit: 'px',
    isLinked: true,
    tl: 9999,
    tr: 9999,
    br: 9999,
    bl: 9999,
    isElliptical: false
  },
  {
    id: 'circle',
    name: 'Circle',
    badge: 'Geometric',
    type: 'circle',
    description: 'Perfect 50% circle for avatars, icon buttons, and badges.',
    unit: '%',
    isLinked: true,
    tl: 50,
    tr: 50,
    br: 50,
    bl: 50,
    isElliptical: false
  },
  {
    id: 'asymmetric-leaf',
    name: 'Asymmetric Leaf',
    badge: 'Creative',
    description: 'Opposing diagonal corners rounded creating an organic leaf motif.',
    unit: 'px',
    isLinked: false,
    tl: 50,
    tr: 0,
    br: 50,
    bl: 0,
    isElliptical: false
  },
  {
    id: 'ticket-tab',
    name: 'Ticket / Tab',
    badge: 'UI Style',
    description: 'Rounded top corners with crisp flat bottom for tabs and vouchers.',
    unit: 'px',
    isLinked: false,
    tl: 24,
    tr: 24,
    br: 0,
    bl: 0,
    isElliptical: false
  },
  {
    id: 'speech-bubble',
    name: 'Speech Bubble',
    badge: 'Novelty',
    description: 'Three rounded corners with one sharp anchor corner.',
    unit: 'px',
    isLinked: false,
    tl: 24,
    tr: 24,
    br: 0,
    bl: 24,
    isElliptical: false
  },
  {
    id: 'organic-blob',
    name: 'Organic Blob',
    badge: '8-Point',
    description: 'Full 8-point asymmetric elliptical radii for fluid branding.',
    unit: '%',
    isLinked: false,
    isElliptical: true,
    tl: 60,
    tr: 40,
    br: 30,
    bl: 70,
    vtl: 60,
    vtr: 30,
    vbr: 70,
    vbl: 40
  },
  {
    id: 'sharp-square',
    name: 'Sharp Square',
    badge: 'Zero',
    description: 'Zero radius for brutalist, strict grid, and square elements.',
    unit: 'px',
    isLinked: true,
    tl: 0,
    tr: 0,
    br: 0,
    bl: 0,
    isElliptical: false
  }
];
