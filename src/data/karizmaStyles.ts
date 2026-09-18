import { DesignStyle, TemplateCategory } from '../types/karizma';

export const KARIZMA_DESIGN_STYLES: DesignStyle[] = [
  {
    id: 'style-royal-red-gold',
    name: 'Royal Red & 24K Gold',
    category: 'Royal',
    description: 'Deep ceremonial Sindoor crimson and antique metallic gold with ornate Sanskrit motifs and luxury serifs',
    colors: {
      primary: '#7B1E25', // Sindoor Crimson
      secondary: '#D4AF37', // Imperial Gold
      accent: '#FFBF00', // Marigold Amber
      background: '#1A070B', // Dark Royal Wine
      surface: '#2B0E14',
      text: '#FBF5EE',
      border: '#D4AF37',
    },
    typography: {
      headingFont: 'Cinzel, serif',
      bodyFont: 'Playfair Display, serif',
      scriptFont: 'Great Vibes, cursive',
    },
    borderStyle: {
      width: 4,
      color: '#D4AF37',
      style: 'double',
      radius: 4,
    },
    decorations: ['mandala', 'corner_lattice', 'arch'],
    defaultBackground: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #1C080D 0%, #2A0E15 50%, #15060A 100%)',
      overlayOpacity: 0.15,
    },
  },
  {
    id: 'style-luxury-obsidian-gold',
    name: 'Midnight Obsidian & Gilded Foil',
    category: 'Luxury',
    description: 'Ultra-dark luxury velvet with 24-karat gold foil borders, museum lighting, and high-fashion typography',
    colors: {
      primary: '#0D0D11',
      secondary: '#E6C687',
      accent: '#C5A059',
      background: '#08080A',
      surface: '#141418',
      text: '#F5EFE6',
      border: '#E6C687',
    },
    typography: {
      headingFont: 'Cinzel, serif',
      bodyFont: 'Cormorant Garamond, serif',
      scriptFont: 'Great Vibes, cursive',
    },
    borderStyle: {
      width: 3,
      color: '#E6C687',
      style: 'solid',
      radius: 0,
    },
    decorations: ['mandala', 'arch', 'flourish'],
    defaultBackground: {
      type: 'solid',
      value: '#0A0A0D',
    },
  },
  {
    id: 'style-traditional-ivory-saffron',
    name: 'Vedic Ivory & Saffron Temple',
    category: 'Traditional',
    description: 'Sacred wedding aesthetic with warm parchment ivory, sacred saffron borders, kalash motifs, and Vedic mantras',
    colors: {
      primary: '#B83A14',
      secondary: '#D97706',
      accent: '#F59E0B',
      background: '#FAF6EE',
      surface: '#FFFFFF',
      text: '#29180E',
      border: '#B83A14',
    },
    typography: {
      headingFont: 'Cinzel, serif',
      bodyFont: 'Playfair Display, serif',
      scriptFont: 'Great Vibes, cursive',
    },
    borderStyle: {
      width: 3,
      color: '#B83A14',
      style: 'solid',
      radius: 2,
    },
    decorations: ['kalash', 'garland', 'mandala'],
    defaultBackground: {
      type: 'solid',
      value: '#FAF5EA',
    },
  },
  {
    id: 'style-modern-editorial-minimal',
    name: 'Modern Vogue Editorial',
    category: 'Modern',
    description: 'Clean high-fashion contemporary white space with crisp geometric lines and minimalist typography',
    colors: {
      primary: '#111827',
      secondary: '#4B5563',
      accent: '#9CA3AF',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827',
      border: '#E5E7EB',
    },
    typography: {
      headingFont: 'Montserrat, sans-serif',
      bodyFont: 'Inter, sans-serif',
      scriptFont: 'Playfair Display, serif',
    },
    borderStyle: {
      width: 1,
      color: '#E5E7EB',
      style: 'solid',
      radius: 0,
    },
    decorations: ['flourish'],
    defaultBackground: {
      type: 'solid',
      value: '#FFFFFF',
    },
  },
  {
    id: 'style-floral-marigold-haldi',
    name: 'Marigold & Haldi Festive',
    category: 'Floral',
    description: 'Joyful sun-drenched saffron and lemon marigold with festive floral jaali flourishes for Haldi and Sangeet',
    colors: {
      primary: '#D97706',
      secondary: '#F59E0B',
      accent: '#FBBF24',
      background: '#FFFDF5',
      surface: '#FFFFFF',
      text: '#451A03',
      border: '#F59E0B',
    },
    typography: {
      headingFont: 'Playfair Display, serif',
      bodyFont: 'Montserrat, sans-serif',
      scriptFont: 'Great Vibes, cursive',
    },
    borderStyle: {
      width: 3,
      color: '#F59E0B',
      style: 'solid',
      radius: 6,
    },
    decorations: ['garland', 'paisley', 'corner_lattice'],
    defaultBackground: {
      type: 'solid',
      value: '#FFFBEB',
    },
  },
  {
    id: 'style-cinematic-anamorphic-dark',
    name: 'Cinematic Golden Hour Noir',
    category: 'Cinematic',
    description: '2.39:1 widescreen mood with deep atmospheric shadows, golden amber highlights, and dramatic film titles',
    colors: {
      primary: '#0B0C0E',
      secondary: '#D97706',
      accent: '#F59E0B',
      background: '#08080A',
      surface: '#111215',
      text: '#F3F4F6',
      border: '#27272A',
    },
    typography: {
      headingFont: 'Cinzel, serif',
      bodyFont: 'Montserrat, sans-serif',
      scriptFont: 'Playfair Display, serif',
    },
    borderStyle: {
      width: 1,
      color: '#3F3F46',
      style: 'solid',
      radius: 0,
    },
    decorations: ['arch'],
    defaultBackground: {
      type: 'solid',
      value: '#090A0C',
    },
  },
];
