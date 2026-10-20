import alpineLakeSrc from '../assets/alpine-lake.jpg';

/**
 * High-quality Bundled Sample Images for Chromapick
 * Encoded as high-fidelity SVG Data URIs and photographic assets with rich palettes.
 * Instant zero-network offline loading.
 */

// 1. Vintage Desert Highway Car (Inspired by reference screenshot)
const desertCarSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1479A4"/>
      <stop offset="35%" stop-color="#2596BE"/>
      <stop offset="70%" stop-color="#67BDD4"/>
      <stop offset="100%" stop-color="#BDECF8"/>
    </linearGradient>
    <linearGradient id="desertGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#DC985B"/>
      <stop offset="30%" stop-color="#D08846"/>
      <stop offset="75%" stop-color="#C27330"/>
      <stop offset="100%" stop-color="#9C5217"/>
    </linearGradient>
    <linearGradient id="carRust" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5C2E17"/>
      <stop offset="40%" stop-color="#844321"/>
      <stop offset="80%" stop-color="#A2572D"/>
      <stop offset="100%" stop-color="#3D1D0F"/>
    </linearGradient>
    <linearGradient id="metalChrome" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#CBD5E1"/>
      <stop offset="50%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#64748B"/>
    </linearGradient>
    <radialGradient id="sunGlow" cx="20%" cy="30%" r="40%">
      <stop offset="0%" stop-color="#FFFDFE" stop-opacity="0.8"/>
      <stop offset="60%" stop-color="#FFD5BE" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#2596BE" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Sky -->
  <rect width="800" height="320" fill="url(#skyGrad)"/>
  <rect width="800" height="320" fill="url(#sunGlow)"/>

  <!-- Clouds -->
  <path d="M 500,120 Q 530,90 570,105 Q 610,85 650,110 Q 690,100 710,130 Q 720,150 670,160 L 510,160 Z" fill="#FFFFFF" opacity="0.6"/>
  <path d="M 120,180 Q 150,160 190,170 Q 230,150 260,175 Q 290,165 310,190 L 130,190 Z" fill="#FFFFFF" opacity="0.45"/>

  <!-- Distant Desert Ridge -->
  <path d="M 0,310 Q 180,295 380,305 T 800,295 L 800,500 L 0,500 Z" fill="#BB7033"/>
  <!-- Desert Ground -->
  <path d="M 0,320 Q 200,315 450,330 T 800,315 L 800,500 L 0,500 Z" fill="url(#desertGrad)"/>

  <!-- Lone desert shrubs -->
  <ellipse cx="140" cy="335" rx="25" ry="14" fill="#3F4E29"/>
  <ellipse cx="180" cy="342" rx="18" ry="10" fill="#2D3A1B"/>
  <ellipse cx="680" cy="345" rx="32" ry="16" fill="#3F4E29"/>

  <!-- Vintage Car Body Shadow -->
  <ellipse cx="430" cy="445" rx="170" ry="22" fill="#2C160B" opacity="0.65"/>

  <!-- Vintage Car Body -->
  <path d="M 280,390 Q 290,340 340,320 Q 400,305 480,310 Q 540,320 570,360 L 580,410 Q 560,425 430,430 Q 300,430 280,390 Z" fill="url(#carRust)"/>
  
  <!-- Car Roof & Cabin -->
  <path d="M 360,320 Q 400,270 450,270 Q 510,270 540,320 Z" fill="#4A2413"/>
  <!-- Broken Windshield -->
  <path d="M 375,315 Q 405,282 445,282 Q 470,282 485,315 Z" fill="#A8F3FA" opacity="0.55"/>
  <path d="M 495,315 Q 515,288 530,315 Z" fill="#67BDD4" opacity="0.45"/>

  <!-- Car Hood and Grille -->
  <path d="M 290,390 Q 330,395 370,415 L 360,435 Q 310,425 285,405 Z" fill="#2C160B"/>
  <!-- Vintage Chrome Grille -->
  <rect x="365" y="380" width="12" height="42" rx="3" fill="url(#metalChrome)"/>
  <rect x="385" y="380" width="12" height="42" rx="3" fill="url(#metalChrome)"/>
  <rect x="405" y="380" width="12" height="42" rx="3" fill="url(#metalChrome)"/>
  <rect x="425" y="380" width="12" height="42" rx="3" fill="url(#metalChrome)"/>
  <rect x="445" y="380" width="12" height="42" rx="3" fill="url(#metalChrome)"/>
  <rect x="465" y="380" width="12" height="42" rx="3" fill="url(#metalChrome)"/>

  <!-- Vintage Headlights -->
  <circle cx="340" cy="385" r="16" fill="url(#metalChrome)"/>
  <circle cx="340" cy="385" r="11" fill="#FFFDFE" opacity="0.85"/>
  <circle cx="495" cy="385" r="16" fill="url(#metalChrome)"/>
  <circle cx="495" cy="385" r="11" fill="#FFE58F" opacity="0.75"/>

  <!-- Wheels -->
  <ellipse cx="330" cy="425" rx="26" ry="24" fill="#181310"/>
  <circle cx="330" cy="425" r="12" fill="url(#metalChrome)"/>
  <ellipse cx="535" cy="420" rx="26" ry="24" fill="#181310"/>
  <circle cx="535" cy="420" r="12" fill="url(#metalChrome)"/>

  <!-- Desert Sand Texture -->
  <circle cx="210" cy="460" r="2" fill="#F4E2C7"/>
  <circle cx="350" cy="480" r="3" fill="#DDBB90"/>
  <circle cx="620" cy="460" r="2.5" fill="#F4E2C7"/>
  <circle cx="710" cy="440" r="3" fill="#E6C8A0"/>
</svg>
`.trim();

// 2. Vibrant Tropical Sunset Paradise
const tropicalSunsetSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="tropicSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4C1D95"/>
      <stop offset="25%" stop-color="#9333EA"/>
      <stop offset="50%" stop-color="#E11D48"/>
      <stop offset="75%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#FACC15"/>
    </linearGradient>
    <linearGradient id="seaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FB923C"/>
      <stop offset="20%" stop-color="#BE185D"/>
      <stop offset="60%" stop-color="#0F766E"/>
      <stop offset="100%" stop-color="#042F2E"/>
    </linearGradient>
  </defs>
  <rect width="800" height="340" fill="url(#tropicSky)"/>
  <!-- Setting Sun -->
  <circle cx="400" cy="270" r="70" fill="#FFFBEB"/>
  <circle cx="400" cy="270" r="85" fill="#FEF08A" opacity="0.4"/>
  <!-- Mountain Silhouette -->
  <polygon points="0,340 120,280 260,330 380,260 520,325 680,275 800,340" fill="#2E1065"/>
  <!-- Ocean -->
  <rect y="340" width="800" height="160" fill="url(#seaGrad)"/>
  <!-- Sun Reflection on water -->
  <ellipse cx="400" cy="355" rx="90" ry="6" fill="#FEF08A" opacity="0.6"/>
  <ellipse cx="400" cy="375" rx="70" ry="4" fill="#FDE047" opacity="0.5"/>
  <ellipse cx="400" cy="405" rx="45" ry="3" fill="#F97316" opacity="0.4"/>
  <!-- Palm Trees -->
  <path d="M 680,500 Q 700,380 660,260" stroke="#0F172A" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M 660,260 Q 610,230 570,250" stroke="#064E3B" stroke-width="6" fill="none"/>
  <path d="M 660,260 Q 640,200 610,190" stroke="#047857" stroke-width="6" fill="none"/>
  <path d="M 660,260 Q 680,190 730,200" stroke="#059669" stroke-width="6" fill="none"/>
  <path d="M 660,260 Q 720,240 760,270" stroke="#065F46" stroke-width="6" fill="none"/>
</svg>
`.trim();

// 3. Neon Cyberpunk Metropolis
const cyberpunkSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="cyberSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/>
      <stop offset="50%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#311042"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#cyberSky)"/>
  <!-- Neon grid on floor -->
  <polygon points="0,500 800,500 520,380 280,380" fill="#180D2B"/>
  <line x1="280" y1="380" x2="0" y2="500" stroke="#06B6D4" stroke-width="2"/>
  <line x1="520" y1="380" x2="800" y2="500" stroke="#EC4899" stroke-width="2"/>
  <line x1="400" y1="380" x2="400" y2="500" stroke="#A855F7" stroke-width="1.5"/>

  <!-- Skyscrapers -->
  <rect x="50" y="160" width="80" height="230" fill="#0F172A" stroke="#22D3EE" stroke-width="1.5"/>
  <rect x="150" y="110" width="100" height="280" fill="#1E1B4B" stroke="#D946EF" stroke-width="2"/>
  <rect x="270" y="200" width="70" height="190" fill="#0B0F19" stroke="#38BDF8" stroke-width="1"/>
  <rect x="470" y="140" width="90" height="250" fill="#1E293B" stroke="#F43F5E" stroke-width="2"/>
  <rect x="580" y="90" width="110" height="300" fill="#111827" stroke="#06B6D4" stroke-width="2"/>
  <rect x="710" y="170" width="70" height="220" fill="#1E1B4B" stroke="#A855F7" stroke-width="1.5"/>

  <!-- Glowing signs -->
  <rect x="170" y="140" width="60" height="18" fill="#EC4899" rx="4"/>
  <rect x="170" y="180" width="60" height="14" fill="#06B6D4" rx="3"/>
  <rect x="600" y="130" width="70" height="24" fill="#FACC15" rx="4"/>
  <rect x="600" y="170" width="70" height="16" fill="#F43F5E" rx="3"/>

  <!-- Giant Holographic Moon -->
  <circle cx="400" cy="180" r="65" fill="none" stroke="#22D3EE" stroke-width="3" stroke-dasharray="10 4"/>
  <circle cx="400" cy="180" r="50" fill="#EC4899" opacity="0.3"/>
</svg>
`.trim();

function svgToDataUrl(svgString) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

export const SAMPLE_IMAGES = [
  {
    id: 'alpine-lake',
    title: 'Turquoise Alpine Lake & Wildflower Valley',
    filename: 'alpine-lake.jpg',
    width: 1024,
    height: 1024,
    size: '286 KB',
    description: 'Glacial turquoise lake (#1A8EAC), golden granite peaks (#E5A158), purple lupines (#6D5EA6), and alpine wildflowers.',
    dataUrl: alpineLakeSrc
  },
  {
    id: 'desert-car',
    title: 'Vintage Desert Highway',
    filename: 'vintage-desert-car.jpg',
    width: 800,
    height: 500,
    size: '142 KB',
    description: 'Pastel azure sky (#2596BE), warm desert sand (#D08846), rusted classic car (#844321).',
    dataUrl: svgToDataUrl(desertCarSvg)
  },
  {
    id: 'tropical-sunset',
    title: 'Tropical Sunset Coast',
    filename: 'tropical-sunset-ocean.jpg',
    width: 800,
    height: 500,
    size: '168 KB',
    description: 'Vivid violet-to-gold sky (#9333EA, #F97316), emerald palm silhouettes (#047857).',
    dataUrl: svgToDataUrl(tropicalSunsetSvg)
  },
  {
    id: 'cyberpunk-neon',
    title: 'Cyberpunk Neon Metropolis',
    filename: 'cyberpunk-night-city.jpg',
    width: 800,
    height: 500,
    size: '184 KB',
    description: 'Electric cyan (#22D3EE), hot magenta (#EC4899), deep midnight blue (#0B0F19).',
    dataUrl: svgToDataUrl(cyberpunkSvg)
  }
];

