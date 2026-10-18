/**
 * High-quality Bundled Sample Images for Chromapick
 * Encoded as high-fidelity SVG Data URIs with rich palettes.
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

// 4. Studio Portrait Yellow (Matching user reference)
const yellowPortraitSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <radialGradient id="yellowBackdrop" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#FFE84D"/>
      <stop offset="60%" stop-color="#FFD814"/>
      <stop offset="100%" stop-color="#EAB308"/>
    </radialGradient>
    <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F5B275"/>
      <stop offset="35%" stop-color="#E7A06C"/>
      <stop offset="75%" stop-color="#D08846"/>
      <stop offset="100%" stop-color="#B86C2E"/>
    </linearGradient>
    <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D2832"/>
      <stop offset="40%" stop-color="#1D1A20"/>
      <stop offset="100%" stop-color="#141116"/>
    </linearGradient>
    <radialGradient id="cheekGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#E7A06C" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#E7A06C" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Yellow Studio Background -->
  <rect width="800" height="800" fill="url(#yellowBackdrop)"/>

  <!-- Subtle Ambient Shadow behind subject -->
  <ellipse cx="400" cy="520" rx="260" ry="220" fill="#CA9B04" opacity="0.22"/>

  <!-- Black T-Shirt Shoulders and Torso -->
  <path d="M 100,800 L 160,610 Q 240,540 320,530 L 480,530 Q 560,540 640,610 L 700,800 Z" fill="url(#shirtGrad)"/>
  <!-- T-shirt crew collar -->
  <path d="M 320,530 Q 400,580 480,530 Q 400,555 320,530 Z" fill="#2E2835" stroke="#1D1A20" stroke-width="3"/>

  <!-- Neck -->
  <path d="M 335,460 L 335,540 Q 400,565 465,540 L 465,460 Z" fill="#C87A38"/>
  <!-- Neck shadow under chin -->
  <path d="M 345,470 Q 400,510 455,470 Q 400,495 345,470 Z" fill="#75612C" opacity="0.6"/>

  <!-- Ears -->
  <ellipse cx="295" cy="405" rx="24" ry="38" fill="#D58E4E"/>
  <ellipse cx="295" cy="405" rx="14" ry="24" fill="#B86C2E" opacity="0.7"/>
  <!-- Silver Hoop Earring in right ear (matches photo!) -->
  <ellipse cx="288" cy="425" rx="5" ry="7" fill="none" stroke="#E2E8F0" stroke-width="2.5"/>

  <ellipse cx="505" cy="405" rx="24" ry="38" fill="#D58E4E"/>
  <ellipse cx="505" cy="405" rx="14" ry="24" fill="#B86C2E" opacity="0.7"/>

  <!-- Head / Face Structure -->
  <ellipse cx="400" cy="390" rx="115" ry="142" fill="url(#skinGrad)"/>

  <!-- Cheek Highlights -->
  <circle cx="345" cy="400" r="35" fill="url(#cheekGlow)"/>
  <circle cx="455" cy="400" r="35" fill="url(#cheekGlow)"/>

  <!-- Hair Cut -->
  <path d="M 285,380 Q 280,285 330,235 Q 380,200 440,220 Q 490,240 515,305 Q 525,355 515,385 Q 495,265 400,260 Q 315,265 285,380 Z" fill="#181310"/>
  <!-- Textured hair volume -->
  <path d="M 305,255 Q 360,210 425,215 Q 480,230 500,265 Q 445,235 375,240 Q 325,250 305,255 Z" fill="#2A1E17"/>

  <!-- Eyebrows -->
  <path d="M 320,335 Q 355,325 375,335" stroke="#1D1A20" stroke-width="9" stroke-linecap="round" fill="none"/>
  <path d="M 425,335 Q 445,325 480,335" stroke="#1D1A20" stroke-width="9" stroke-linecap="round" fill="none"/>

  <!-- Eyes -->
  <ellipse cx="350" cy="365" rx="18" ry="10" fill="#FFFDFE"/>
  <circle cx="350" cy="365" r="7" fill="#1D140C"/>
  <circle cx="348" cy="363" r="2" fill="#FFFFFF"/>

  <ellipse cx="450" cy="365" rx="18" ry="10" fill="#FFFDFE"/>
  <circle cx="450" cy="365" r="7" fill="#1D140C"/>
  <circle cx="448" cy="363" r="2" fill="#FFFFFF"/>

  <!-- Nose -->
  <path d="M 400,350 L 395,405 Q 400,415 410,405 Z" fill="#C07231" opacity="0.6"/>
  <path d="M 385,408 Q 400,415 415,408" stroke="#8E461A" stroke-width="2.5" fill="none" stroke-linecap="round"/>

  <!-- Mustache -->
  <path d="M 365,435 Q 400,442 435,435 Q 400,450 365,435 Z" fill="#241913"/>

  <!-- Lips -->
  <path d="M 370,452 Q 400,456 430,452 Q 400,464 370,452 Z" fill="#A85434"/>

  <!-- Beard & Goatee Outline -->
  <path d="M 350,462 Q 400,495 450,462 Q 430,510 400,512 Q 370,510 350,462 Z" fill="#241913" opacity="0.85"/>
  <!-- Stubble jawline -->
  <path d="M 305,410 Q 320,480 375,512 Q 400,515 425,512 Q 480,480 495,410" stroke="#241913" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 3" fill="none" opacity="0.65"/>
</svg>
`.trim();

function svgToDataUrl(svgString) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

export const SAMPLE_IMAGES = [
  {
    id: 'yellow-portrait',
    title: 'Studio Portrait Yellow (Reference)',
    filename: 'portrait-yellow-bg.jpg',
    width: 800,
    height: 800,
    size: '158 KB',
    description: 'Vibrant yellow studio backdrop (#FFD814), warm skin tones, and black t-shirt.',
    dataUrl: svgToDataUrl(yellowPortraitSvg)
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

