import { KarizmaTemplate, TemplateCategory } from '../types/karizma';

export const KARIZMA_TEMPLATES: KarizmaTemplate[] = [
  // ==================== 1. ROYAL ====================
  {
    id: 'royal-01-palace-grandeur',
    name: 'Royal Palace Grandeur',
    category: 'Royal',
    description: 'Imposing full-height left hero portrait with dual ornate right ceremony panels and sacred Sanskrit mantra banner',
    photoCount: 3,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #1C0A0E 0%, #2A0812 50%, #15060A 100%)',
      overlayOpacity: 0.1,
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-hero', x: 0.05, y: 0.08, width: 0.41, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
      { id: 'slot-right-top', x: 0.53, y: 0.14, width: 0.42, height: 0.36, role: 'support', suggestedOrientation: 'landscape' },
      { id: 'slot-right-bottom', x: 0.53, y: 0.54, width: 0.42, height: 0.36, role: 'support', suggestedOrientation: 'landscape' },
    ],
    textSlots: [
      { id: 'txt-title', x: 0.53, y: 0.04, width: 0.42, height: 0.08, defaultText: 'Shubh Vivah • Sacred Union', fontSize: 22, fontFamily: 'Cinzel', textAlign: 'center', role: 'title' },
    ],
    decorations: [
      { id: 'dec-corner-tl', motifType: 'mandala', x: 0.02, y: 0.02, width: 0.08, height: 0.12 },
      { id: 'dec-corner-br', motifType: 'corner_lattice', x: 0.90, y: 0.88, width: 0.08, height: 0.10 },
    ],
  },
  {
    id: 'royal-02-durbar-panorama',
    name: 'Royal Durbar Panorama',
    category: 'Royal',
    description: 'Panoramic grand stage feature photo across left page and quad celebration portraits on the right',
    photoCount: 5,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#26060F',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-pano', x: 0.05, y: 0.08, width: 0.41, height: 0.68, role: 'hero', suggestedOrientation: 'landscape' },
      { id: 'slot-q1', x: 0.53, y: 0.08, width: 0.20, height: 0.38, role: 'support', suggestedOrientation: 'portrait' },
      { id: 'slot-q2', x: 0.75, y: 0.08, width: 0.20, height: 0.38, role: 'support', suggestedOrientation: 'portrait' },
      { id: 'slot-q3', x: 0.53, y: 0.50, width: 0.20, height: 0.38, role: 'support', suggestedOrientation: 'portrait' },
      { id: 'slot-q4', x: 0.75, y: 0.50, width: 0.20, height: 0.38, role: 'support', suggestedOrientation: 'portrait' },
    ],
    textSlots: [
      { id: 'txt-caption', x: 0.05, y: 0.80, width: 0.41, height: 0.10, defaultText: 'Under the Golden Canopies of the Mandap', fontSize: 18, fontFamily: 'Cinzel', textAlign: 'center', role: 'subtitle' },
    ],
  },

  // ==================== 2. LUXURY ====================
  {
    id: 'luxury-01-sabyasachi-gold',
    name: 'Imperial Gold & Velvet',
    category: 'Luxury',
    description: 'Ultra-high contrast luxury design featuring heavy gold borders, center medallion, and symmetrical couple portraits',
    photoCount: 2,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#151214',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-left-arch', x: 0.06, y: 0.08, width: 0.39, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
      { id: 'slot-right-arch', x: 0.55, y: 0.08, width: 0.39, height: 0.84, role: 'couple', suggestedOrientation: 'portrait' },
    ],
    textSlots: [
      { id: 'txt-names', x: 0.44, y: 0.02, width: 0.12, height: 0.06, defaultText: 'Rahul & Priya', fontSize: 20, fontFamily: 'Playfair Display', textAlign: 'center', role: 'title' },
    ],
    decorations: [
      { id: 'dec-arch-center', motifType: 'arch', x: 0.45, y: 0.40, width: 0.10, height: 0.20 },
    ],
  },
  {
    id: 'luxury-02-regal-triptych',
    name: 'Gilded Velvet Triptych',
    category: 'Luxury',
    description: 'Central hero jewel photograph flanked by two slender editorial vertical framing shots',
    photoCount: 3,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'gradient',
      value: 'linear-gradient(90deg, #1A1208 0%, #291D0E 50%, #1A1208 100%)',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-left-wing', x: 0.06, y: 0.12, width: 0.22, height: 0.76, role: 'support', suggestedOrientation: 'portrait' },
      { id: 'slot-center-jewel', x: 0.32, y: 0.08, width: 0.36, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
      { id: 'slot-right-wing', x: 0.72, y: 0.12, width: 0.22, height: 0.76, role: 'support', suggestedOrientation: 'portrait' },
    ],
    textSlots: [
      { id: 'txt-tag', x: 0.32, y: 0.02, width: 0.36, height: 0.05, defaultText: 'A Legacy of Eternal Splendor', fontSize: 16, fontFamily: 'Cinzel', textAlign: 'center', role: 'subtitle' },
    ],
  },

  // ==================== 3. TRADITIONAL ====================
  {
    id: 'traditional-01-mandap-rituals',
    name: 'Vedic Mandap & Saat Phere',
    category: 'Traditional',
    description: 'Designed specifically for sacred fire rituals, Sindoor Daan, and Mangalsutra sacred ceremony progression',
    photoCount: 4,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#FAF6EE',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-phera-hero', x: 0.05, y: 0.08, width: 0.41, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
      { id: 'slot-sindoor', x: 0.53, y: 0.08, width: 0.42, height: 0.26, role: 'detail', suggestedOrientation: 'landscape' },
      { id: 'slot-hawan', x: 0.53, y: 0.37, width: 0.42, height: 0.26, role: 'support', suggestedOrientation: 'landscape' },
      { id: 'slot-vows', x: 0.53, y: 0.66, width: 0.42, height: 0.26, role: 'support', suggestedOrientation: 'landscape' },
    ],
    textSlots: [
      { id: 'txt-mantra', x: 0.05, y: 0.02, width: 0.41, height: 0.05, defaultText: '॥ मंगलम् भगवान विष्णुः मंगलम् गरुड़ध्वजः ॥', fontSize: 18, fontFamily: 'Cinzel', textAlign: 'center', role: 'mantra' },
    ],
    decorations: [
      { id: 'dec-kalash', motifType: 'kalash', x: 0.47, y: 0.04, width: 0.06, height: 0.08 },
    ],
  },
  {
    id: 'traditional-02-baraat-celebration',
    name: 'Baraat & Dhol Symphony',
    category: 'Traditional',
    description: 'Dynamic celebratory spread with rhythmically staggered photo blocks capturing dancing family and groom entry',
    photoCount: 5,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#FDF7E7',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-groom-entry', x: 0.05, y: 0.08, width: 0.25, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
      { id: 'slot-dhol', x: 0.32, y: 0.08, width: 0.15, height: 0.39, role: 'support', suggestedOrientation: 'portrait' },
      { id: 'slot-dance-1', x: 0.32, y: 0.53, width: 0.15, height: 0.39, role: 'support', suggestedOrientation: 'portrait' },
      { id: 'slot-family', x: 0.54, y: 0.08, width: 0.41, height: 0.44, role: 'support', suggestedOrientation: 'landscape' },
      { id: 'slot-welcome', x: 0.54, y: 0.56, width: 0.41, height: 0.36, role: 'support', suggestedOrientation: 'landscape' },
    ],
    textSlots: [
      { id: 'txt-tag', x: 0.54, y: 0.02, width: 0.41, height: 0.05, defaultText: 'The Grand Baraat & Royal Welcome', fontSize: 18, fontFamily: 'Playfair Display', textAlign: 'center', role: 'title' },
    ],
  },

  // ==================== 4. MODERN ====================
  {
    id: 'modern-01-asymmetric-vogue',
    name: 'Vogue Edge Asymmetry',
    category: 'Modern',
    description: 'Modern editorial magazine layout with bold negative space, left bleeding border, and clean sans-serif accents',
    photoCount: 3,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#FFFFFF',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-hero', x: 0.05, y: 0.06, width: 0.43, height: 0.88, role: 'hero', suggestedOrientation: 'portrait' },
      { id: 'slot-top-right', x: 0.54, y: 0.06, width: 0.41, height: 0.48, role: 'support', suggestedOrientation: 'landscape' },
      { id: 'slot-bottom-right', x: 0.65, y: 0.58, width: 0.30, height: 0.36, role: 'detail', suggestedOrientation: 'portrait' },
    ],
    textSlots: [
      { id: 'txt-date', x: 0.54, y: 0.58, width: 0.09, height: 0.36, defaultText: 'FEBRUARY 2026', fontSize: 14, fontFamily: 'Montserrat', textAlign: 'center', role: 'date' },
    ],
  },
  {
    id: 'modern-02-geometric-diptych',
    name: 'Clean Geometric Diptych',
    category: 'Modern',
    description: 'Two identical oversized portraits aligned with precision mathematical padding and ultra-thin hairline borders',
    photoCount: 2,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#F8F9FA',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-left', x: 0.08, y: 0.10, width: 0.36, height: 0.80, role: 'hero', suggestedOrientation: 'portrait' },
      { id: 'slot-right', x: 0.56, y: 0.10, width: 0.36, height: 0.80, role: 'couple', suggestedOrientation: 'portrait' },
    ],
    textSlots: [
      { id: 'txt-quote', x: 0.20, y: 0.03, width: 0.60, height: 0.05, defaultText: 'LOVE • DEVOTION • SERENITY', fontSize: 16, fontFamily: 'Montserrat', textAlign: 'center', role: 'title' },
    ],
  },

  // ==================== 5. MINIMAL ====================
  {
    id: 'minimal-01-monolith-hero',
    name: 'Zen Monolith Hero',
    category: 'Minimal',
    description: 'A single breathtaking hero shot commanding the left spread, leaving the right spread with vast poetic whitespace',
    photoCount: 1,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#F7F6F2',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-solo', x: 0.06, y: 0.08, width: 0.40, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
    ],
    textSlots: [
      { id: 'txt-poem', x: 0.58, y: 0.42, width: 0.32, height: 0.16, defaultText: 'Two lives, two souls, one heartbeat across eternity.', fontSize: 24, fontFamily: 'Playfair Display', textAlign: 'center', role: 'subtitle' },
    ],
  },
  {
    id: 'minimal-02-floating-pair',
    name: 'Floating Horizon Duo',
    category: 'Minimal',
    description: 'Two floating landscape horizons suspended with generous whitespace margins for a museum gallery feel',
    photoCount: 2,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#FAFAFA',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-1', x: 0.06, y: 0.20, width: 0.39, height: 0.60, role: 'hero', suggestedOrientation: 'landscape' },
      { id: 'slot-2', x: 0.55, y: 0.20, width: 0.39, height: 0.60, role: 'support', suggestedOrientation: 'landscape' },
    ],
    textSlots: [
      { id: 'txt-title', x: 0.30, y: 0.06, width: 0.40, height: 0.08, defaultText: 'THE PROMISE', fontSize: 18, fontFamily: 'Montserrat', textAlign: 'center', role: 'title' },
    ],
  },

  // ==================== 6. FLORAL ====================
  {
    id: 'floral-01-marigold-haldi',
    name: 'Marigold Haldi Bloom',
    category: 'Floral',
    description: 'Vibrant yellow & saffron themed spread with marigold floral flourish borders and candid splashing photo frames',
    photoCount: 4,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#FFF9E6',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-haldi-hero', x: 0.05, y: 0.08, width: 0.41, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
      { id: 'slot-h1', x: 0.53, y: 0.08, width: 0.42, height: 0.26, role: 'support', suggestedOrientation: 'landscape' },
      { id: 'slot-h2', x: 0.53, y: 0.37, width: 0.20, height: 0.55, role: 'detail', suggestedOrientation: 'portrait' },
      { id: 'slot-h3', x: 0.75, y: 0.37, width: 0.20, height: 0.55, role: 'detail', suggestedOrientation: 'portrait' },
    ],
    textSlots: [
      { id: 'txt-haldi', x: 0.53, y: 0.02, width: 0.42, height: 0.05, defaultText: 'Shades of Sunshine • Haldi Celebrations', fontSize: 18, fontFamily: 'Playfair Display', textAlign: 'center', role: 'title' },
    ],
    decorations: [
      { id: 'dec-marigold-1', motifType: 'garland', x: 0.02, y: 0.02, width: 0.08, height: 0.08 },
    ],
  },
  {
    id: 'floral-02-mehendi-botanical',
    name: 'Henna & Jasmine Cascade',
    category: 'Floral',
    description: 'Delicate paisley motifs and organic greenery framing intricate bridal Mehendi and joyful laughter portraits',
    photoCount: 3,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#F4F7F2',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-henna-hands', x: 0.06, y: 0.08, width: 0.40, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
      { id: 'slot-bride-smile', x: 0.54, y: 0.12, width: 0.40, height: 0.42, role: 'support', suggestedOrientation: 'landscape' },
      { id: 'slot-friends', x: 0.54, y: 0.58, width: 0.40, height: 0.34, role: 'detail', suggestedOrientation: 'landscape' },
    ],
    textSlots: [
      { id: 'txt-title', x: 0.54, y: 0.04, width: 0.40, height: 0.06, defaultText: 'Mehendi Hai Rachne Wali', fontSize: 20, fontFamily: 'Cinzel', textAlign: 'center', role: 'title' },
    ],
    decorations: [
      { id: 'dec-paisley', motifType: 'paisley', x: 0.47, y: 0.45, width: 0.06, height: 0.10 },
    ],
  },

  // ==================== 7. CINEMATIC ====================
  {
    id: 'cinematic-01-anamorphic-widescreen',
    name: 'Anamorphic Twilight Vows',
    category: 'Cinematic',
    description: 'Full-bleed 2.39:1 widescreen cinema aspect ratios with deep rich black letterboxes and film subtitles',
    photoCount: 2,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#0C0D0E',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-wide-1', x: 0.04, y: 0.15, width: 0.43, height: 0.70, role: 'hero', suggestedOrientation: 'landscape' },
      { id: 'slot-wide-2', x: 0.53, y: 0.15, width: 0.43, height: 0.70, role: 'couple', suggestedOrientation: 'landscape' },
    ],
    textSlots: [
      { id: 'txt-sub', x: 0.04, y: 0.88, width: 0.92, height: 0.08, defaultText: '“I promise to love you across every lifetime that follows.”', fontSize: 18, fontFamily: 'Playfair Display', textAlign: 'center', role: 'subtitle' },
    ],
  },
  {
    id: 'cinematic-02-golden-hour-split',
    name: 'Golden Hour Silhouette',
    category: 'Cinematic',
    description: 'Dramatic sunset couple silhouette with warm amber backlight, side-car detail vignette and film stills',
    photoCount: 4,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'gradient',
      value: 'linear-gradient(180deg, #180D09 0%, #0F0805 100%)',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-hero-sunset', x: 0.05, y: 0.08, width: 0.41, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
      { id: 'slot-c1', x: 0.53, y: 0.08, width: 0.42, height: 0.26, role: 'support', suggestedOrientation: 'landscape' },
      { id: 'slot-c2', x: 0.53, y: 0.37, width: 0.42, height: 0.26, role: 'detail', suggestedOrientation: 'landscape' },
      { id: 'slot-c3', x: 0.53, y: 0.66, width: 0.42, height: 0.26, role: 'detail', suggestedOrientation: 'landscape' },
    ],
    textSlots: [
      { id: 'txt-title', x: 0.05, y: 0.02, width: 0.41, height: 0.05, defaultText: 'GOLDEN HOUR CHRONICLES', fontSize: 16, fontFamily: 'Montserrat', textAlign: 'center', role: 'title' },
    ],
  },

  // ==================== 8. ROMANTIC ====================
  {
    id: 'romantic-01-sunset-embrace',
    name: 'Whimsical Sunset Embrace',
    category: 'Romantic',
    description: 'Soft rose blush undertones with interlocking oval and rounded photo windows capturing intimate eye contact',
    photoCount: 3,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#FAF4F3',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-r1', x: 0.06, y: 0.08, width: 0.40, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
      { id: 'slot-r2', x: 0.54, y: 0.08, width: 0.40, height: 0.42, role: 'support', suggestedOrientation: 'landscape' },
      { id: 'slot-r3', x: 0.54, y: 0.54, width: 0.40, height: 0.38, role: 'detail', suggestedOrientation: 'landscape' },
    ],
    textSlots: [
      { id: 'txt-vow', x: 0.54, y: 0.02, width: 0.40, height: 0.05, defaultText: 'In Your Eyes, I Found My Forever', fontSize: 20, fontFamily: 'Playfair Display', textAlign: 'center', role: 'title' },
    ],
  },
  {
    id: 'romantic-02-candlelight-vignette',
    name: 'Candlelight & Sangeet Nights',
    category: 'Romantic',
    description: 'Mood lighting with fairy light bokeh frames, couple slow dance showcase, and calligraphy verses',
    photoCount: 4,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#1A0E18',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-dance-hero', x: 0.05, y: 0.08, width: 0.41, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
      { id: 'slot-v1', x: 0.53, y: 0.08, width: 0.20, height: 0.38, role: 'support', suggestedOrientation: 'portrait' },
      { id: 'slot-v2', x: 0.75, y: 0.08, width: 0.20, height: 0.38, role: 'support', suggestedOrientation: 'portrait' },
      { id: 'slot-v3', x: 0.53, y: 0.52, width: 0.42, height: 0.40, role: 'support', suggestedOrientation: 'landscape' },
    ],
    textSlots: [
      { id: 'txt-night', x: 0.53, y: 0.47, width: 0.42, height: 0.04, defaultText: 'Sangeet Symphony • Dancing Under the Stars', fontSize: 16, fontFamily: 'Cinzel', textAlign: 'center', role: 'subtitle' },
    ],
  },

  // ==================== 9. ELEGANT ====================
  {
    id: 'elegant-01-ivory-champagne',
    name: 'Champagne & Ivory Classic',
    category: 'Elegant',
    description: 'Subtle ivory silk tones, double-line metallic gold frames, balanced diptych layout with stately presence',
    photoCount: 3,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#F8F6F0',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-el-left', x: 0.06, y: 0.08, width: 0.40, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
      { id: 'slot-el-rt-1', x: 0.54, y: 0.08, width: 0.40, height: 0.39, role: 'support', suggestedOrientation: 'landscape' },
      { id: 'slot-el-rt-2', x: 0.54, y: 0.53, width: 0.40, height: 0.39, role: 'support', suggestedOrientation: 'landscape' },
    ],
    textSlots: [
      { id: 'txt-title', x: 0.54, y: 0.02, width: 0.40, height: 0.05, defaultText: 'The Elegance of Commitment', fontSize: 18, fontFamily: 'Cinzel', textAlign: 'center', role: 'title' },
    ],
    decorations: [
      { id: 'dec-medallion', motifType: 'flourish', x: 0.47, y: 0.48, width: 0.06, height: 0.06 },
    ],
  },
  {
    id: 'elegant-02-high-society-quad',
    name: 'High Society Formal Quad',
    category: 'Elegant',
    description: 'Four proportional high-fashion portrait rectangles separated by golden hairline rules and monogram emblem',
    photoCount: 4,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#FDFBF7',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-q1', x: 0.06, y: 0.08, width: 0.19, height: 0.84, role: 'support', suggestedOrientation: 'portrait' },
      { id: 'slot-q2', x: 0.27, y: 0.08, width: 0.19, height: 0.84, role: 'support', suggestedOrientation: 'portrait' },
      { id: 'slot-q3', x: 0.54, y: 0.08, width: 0.19, height: 0.84, role: 'support', suggestedOrientation: 'portrait' },
      { id: 'slot-q4', x: 0.75, y: 0.08, width: 0.19, height: 0.84, role: 'support', suggestedOrientation: 'portrait' },
    ],
    textSlots: [
      { id: 'txt-title', x: 0.30, y: 0.02, width: 0.40, height: 0.05, defaultText: 'A PORTRAIT OF MAJESTY', fontSize: 16, fontFamily: 'Cinzel', textAlign: 'center', role: 'title' },
    ],
  },

  // ==================== 10. DARK LUXURY ====================
  {
    id: 'dark-luxury-01-midnight-obsidian',
    name: 'Midnight Obsidian & 24K Gold',
    category: 'Dark Luxury',
    description: 'Deep black obsidian backdrop accented with shimmering 24-karat gold foil trims and jewel-toned hero portraits',
    photoCount: 3,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#0A0A0C',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-hero', x: 0.05, y: 0.08, width: 0.41, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
      { id: 'slot-top', x: 0.53, y: 0.12, width: 0.42, height: 0.38, role: 'support', suggestedOrientation: 'landscape' },
      { id: 'slot-bottom', x: 0.53, y: 0.54, width: 0.42, height: 0.38, role: 'support', suggestedOrientation: 'landscape' },
    ],
    textSlots: [
      { id: 'txt-gold-heading', x: 0.53, y: 0.04, width: 0.42, height: 0.06, defaultText: 'TIMELESS LUXURY • FOREVER', fontSize: 20, fontFamily: 'Cinzel', textAlign: 'center', role: 'title' },
    ],
    decorations: [
      { id: 'dec-gold-mandala', motifType: 'mandala', x: 0.47, y: 0.44, width: 0.06, height: 0.12 },
    ],
  },
  {
    id: 'dark-luxury-02-emerald-nocturne',
    name: 'Emerald Velvet Nocturne',
    category: 'Dark Luxury',
    description: 'Deep emerald velvet backdrop evoking royal Rajputana palaces with warm golden backlight illumination',
    photoCount: 4,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #051A10 0%, #0A2619 50%, #03120B 100%)',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-em-1', x: 0.05, y: 0.08, width: 0.41, height: 0.40, role: 'support', suggestedOrientation: 'landscape' },
      { id: 'slot-em-2', x: 0.05, y: 0.52, width: 0.41, height: 0.40, role: 'support', suggestedOrientation: 'landscape' },
      { id: 'slot-em-hero', x: 0.53, y: 0.08, width: 0.42, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
    ],
    textSlots: [
      { id: 'txt-emerald-title', x: 0.05, y: 0.02, width: 0.41, height: 0.05, defaultText: 'THE EMERALD RECEPTION', fontSize: 18, fontFamily: 'Cinzel', textAlign: 'center', role: 'title' },
    ],
  },
  {
    id: 'royal-03-sheesh-mahal',
    name: 'Sheesh Mahal Mosaic',
    category: 'Royal',
    description: 'Mirror palace inspired symmetry with central arch framing bride and groom with 4 flanking ceremony vignettes',
    photoCount: 5,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #18090C 0%, #2A0E14 50%, #15060A 100%)',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-left-1', x: 0.05, y: 0.08, width: 0.19, height: 0.39, role: 'support', suggestedOrientation: 'portrait' },
      { id: 'slot-left-2', x: 0.05, y: 0.53, width: 0.19, height: 0.39, role: 'support', suggestedOrientation: 'portrait' },
      { id: 'slot-center-hero', x: 0.28, y: 0.08, width: 0.44, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
      { id: 'slot-right-1', x: 0.76, y: 0.08, width: 0.19, height: 0.39, role: 'support', suggestedOrientation: 'portrait' },
      { id: 'slot-right-2', x: 0.76, y: 0.53, width: 0.19, height: 0.39, role: 'support', suggestedOrientation: 'portrait' },
    ],
    textSlots: [
      { id: 'txt-sheesh', x: 0.28, y: 0.02, width: 0.44, height: 0.05, defaultText: 'Reflections of Eternal Grace', fontSize: 18, fontFamily: 'Cinzel', textAlign: 'center', role: 'title' },
    ],
  },
  {
    id: 'luxury-03-gold-foil-editorial',
    name: '24K Foil Heritage Story',
    category: 'Luxury',
    description: 'Six-photo celebratory spread with gold foil inner borders, perfect for sangeet dance and family portraits',
    photoCount: 6,
    canvas: { spreadWidthInches: 36, spreadHeightInches: 12 },
    background: {
      type: 'solid',
      value: '#131113',
    },
    safeZoneMargin: 0.03,
    gutterZoneWidth: 0.04,
    photoSlots: [
      { id: 'slot-1', x: 0.05, y: 0.08, width: 0.22, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
      { id: 'slot-2', x: 0.29, y: 0.08, width: 0.18, height: 0.39, role: 'support', suggestedOrientation: 'landscape' },
      { id: 'slot-3', x: 0.29, y: 0.53, width: 0.18, height: 0.39, role: 'support', suggestedOrientation: 'landscape' },
      { id: 'slot-4', x: 0.53, y: 0.08, width: 0.18, height: 0.39, role: 'support', suggestedOrientation: 'landscape' },
      { id: 'slot-5', x: 0.53, y: 0.53, width: 0.18, height: 0.39, role: 'support', suggestedOrientation: 'landscape' },
      { id: 'slot-6', x: 0.73, y: 0.08, width: 0.22, height: 0.84, role: 'hero', suggestedOrientation: 'portrait' },
    ],
    textSlots: [
      { id: 'txt-heading', x: 0.30, y: 0.02, width: 0.40, height: 0.05, defaultText: 'CELEBRATING WITH LOVED ONES', fontSize: 16, fontFamily: 'Cinzel', textAlign: 'center', role: 'title' },
    ],
  },
];
