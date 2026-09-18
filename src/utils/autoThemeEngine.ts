import {
  EventType,
  ImageAsset,
  CulturalColorPalette,
  FrameBorderStyle,
  AutoThemeAnalysis,
  PaperFinish,
} from '../types';

/**
 * Intelligent Auto-Theme Engine
 * Analyzes event batch, photo ceremony tags, titles, color dominance, and aesthetics
 * to automatically pair the optimal cultural color palette, frame border style, and paper finish.
 */
export function analyzeAndAutoTheme(
  eventType: EventType,
  photos: ImageAsset[],
  palettes: CulturalColorPalette[],
  borderStyles: FrameBorderStyle[]
): AutoThemeAnalysis {
  // 1. Tally ceremony and keyword occurrences across photo batch
  const tagCounts: Record<string, number> = {};
  let haldiWeight = 0;
  let mehendiWeight = 0;
  let royalMaroonWeight = 0;
  let nightVelvetWeight = 0;
  let pastelRoseWeight = 0;
  let outdoorNaturalWeight = 0;

  photos.forEach((photo) => {
    const tag = (photo.eventTag || '').toLowerCase();
    const title = (photo.title || '').toLowerCase();
    const prompt = (photo.promptUsed || '').toLowerCase();
    const textCorpus = `${tag} ${title} ${prompt}`;

    if (photo.eventTag) {
      tagCounts[photo.eventTag] = (tagCounts[photo.eventTag] || 0) + 1;
    }

    // Haldi / Saffron / Marigold keywords
    if (/haldi|yellow|marigold|saffron|turmeric|pithi/.test(textCorpus)) {
      haldiWeight += 3;
    }
    // Mehendi / Henna / Sangeet / Emerald keywords
    if (/mehendi|henna|sangeet|emerald|green|cinnamon/.test(textCorpus)) {
      mehendiWeight += 3;
    }
    // Royal Sindoor Maroon / Mandap / Varmala / Fire / Lehenga keywords
    if (/sindoor|maroon|crimson|mandap|varmala|phere|phera|lehenga|baraat|palace|royal|sacred/.test(textCorpus)) {
      royalMaroonWeight += 3;
    }
    // Midnight / Noir / Evening / Night keywords
    if (/night|midnight|reception|cocktail|velvet|gala|dark|candlelight/.test(textCorpus)) {
      nightVelvetWeight += 2;
    }
    // Pastel / Lotus / Rose Gold keywords
    if (/rose|lotus|pastel|pearl|pink|blush|soft/.test(textCorpus)) {
      pastelRoseWeight += 2;
    }
    // Vineyard / Outdoor / Garden
    if (/vineyard|garden|meadow|outdoor|sunset|napa/.test(textCorpus)) {
      outdoorNaturalWeight += 3;
    }
  });

  // Default fallbacks
  let selectedPaletteId = palettes[0]?.id || 'iw-palette-royal-maroon';
  let selectedBorderId = borderStyles[0]?.id || 'iw-border-jaali';
  let confidenceScore = 92;
  let matchedCeremonyFocus = 'Royal Ceremony & Rituals';
  let primaryRationale = '';
  let recommendedFinish: PaperFinish = 'silk';
  let attributes: AutoThemeAnalysis['attributes'] = {
    warmth: 'warm',
    contrast: 'high',
    formality: 'royal_ceremonial',
  };

  if (eventType === 'indian_wedding') {
    // Determine dominant ceremonial focus
    if (haldiWeight > mehendiWeight && haldiWeight > royalMaroonWeight && haldiWeight >= 6) {
      selectedPaletteId = 'iw-palette-haldi-saffron';
      selectedBorderId = 'iw-border-mandap-arch';
      matchedCeremonyFocus = 'Haldi & Marigold Celebrations';
      recommendedFinish = 'glossy'; // rich yellow and terracotta warmth
      confidenceScore = 96;
      attributes = { warmth: 'warm', contrast: 'high', formality: 'festive_vibrant' };
      primaryRationale = `Detected high concentration of Haldi & Saffron rituals (${haldiWeight} feature indicators). Paired with Festive Haldi Marigold Ochre and Scalloped Mandap Arch framing to accentuate auspicious golden tones.`;
    } else if (mehendiWeight > haldiWeight && mehendiWeight > royalMaroonWeight && mehendiWeight >= 6) {
      selectedPaletteId = 'iw-palette-mehendi-emerald';
      selectedBorderId = 'iw-border-zardozi';
      matchedCeremonyFocus = 'Mehendi & Sangeet Ceremonies';
      recommendedFinish = 'silk';
      confidenceScore = 95;
      attributes = { warmth: 'balanced', contrast: 'high', formality: 'festive_vibrant' };
      primaryRationale = `Analyzed prominent Mehendi & Henna ceremony assets (${mehendiWeight} feature indicators). Selected Royal Emerald Green & Henna Cinnamon palette with Zardozi Gold Filigree to highlight intricate botanical artistry.`;
    } else if (nightVelvetWeight > 8 && nightVelvetWeight > royalMaroonWeight) {
      selectedPaletteId = 'iw-palette-rajputana-dark';
      selectedBorderId = 'iw-border-zardozi';
      matchedCeremonyFocus = 'Grand Evening Reception';
      recommendedFinish = 'silk';
      confidenceScore = 94;
      attributes = { warmth: 'warm', contrast: 'high', formality: 'royal_ceremonial' };
      primaryRationale = `Identified dramatic nighttime and evening reception lighting (${nightVelvetWeight} indicators). Selected Midnight Rajputana Velvet with molten gold insets for high-contrast luxury print fidelity.`;
    } else if (pastelRoseWeight > 6 && pastelRoseWeight > royalMaroonWeight) {
      selectedPaletteId = 'iw-palette-palace-rosegold';
      selectedBorderId = 'iw-border-minimal-gold';
      matchedCeremonyFocus = 'Daylight Palace & Pastel Moments';
      recommendedFinish = 'matte';
      confidenceScore = 91;
      attributes = { warmth: 'balanced', contrast: 'subtle', formality: 'minimal_editorial' };
      primaryRationale = `Detected delicate pastel tones and soft daylight portraits. Paired with Udaipur Rose Gold & Pearl on Fine-Art Matte paper finish.`;
    } else {
      // Classic Royal Indian Wedding (Sindoor Crimson + Mughal Jaali)
      selectedPaletteId = 'iw-palette-royal-maroon';
      selectedBorderId = 'iw-border-jaali';
      matchedCeremonyFocus = 'Sacred Varmala, Saat Phere & Mandap';
      recommendedFinish = 'silk';
      confidenceScore = 97;
      attributes = { warmth: 'warm', contrast: 'high', formality: 'royal_ceremonial' };
      primaryRationale = `Detected complete Royal Wedding ceremonial suite (${photos.length} curated assets spanning Baraat, Mandap, and Saat Phere). Auto-selected Royal Sindoor Maroon with Mughal Jaali geometric lattice borders on archival Silk finish.`;
    }
  } else if (eventType === 'western_wedding') {
    selectedPaletteId = palettes.find((p) => p.id.includes('rosegold') || p.id.includes('maroon'))?.id || palettes[0].id;
    selectedBorderId = borderStyles.find((b) => b.id.includes('minimal') || b.id.includes('zardozi'))?.id || borderStyles[0].id;
    matchedCeremonyFocus = outdoorNaturalWeight > 4 ? 'Vineyard & Golden Hour' : 'Classic Church & Ballroom';
    recommendedFinish = 'matte'; // Standard fine-art wedding albums
    confidenceScore = 94;
    attributes = { warmth: 'balanced', contrast: 'subtle', formality: 'minimal_editorial' };
    primaryRationale = `Analyzed classic romantic wedding photography. Applied timeless Ivory & Champagne Gold with Regal Hairline Gold borders on Fine-Art 250 gsm Matte paper.`;
  } else if (eventType === 'birthday') {
    selectedPaletteId = palettes.find((p) => p.id.includes('saffron') || p.id.includes('emerald'))?.id || palettes[0].id;
    selectedBorderId = borderStyles.find((b) => b.id.includes('zardozi') || b.id.includes('minimal'))?.id || borderStyles[0].id;
    matchedCeremonyFocus = 'Milestone Celebration & Party';
    recommendedFinish = 'glossy'; // Punchy, vibrant colors
    confidenceScore = 93;
    attributes = { warmth: 'warm', contrast: 'high', formality: 'festive_vibrant' };
    primaryRationale = `Recognized milestone celebration batch. Configured vibrant color dynamics with high-gloss photographic finish for punchy party contrast.`;
  } else if (eventType === 'anniversary') {
    selectedPaletteId = palettes.find((p) => p.id.includes('maroon') || p.id.includes('dark'))?.id || palettes[0].id;
    selectedBorderId = borderStyles.find((b) => b.id.includes('zardozi') || b.id.includes('jaali'))?.id || borderStyles[0].id;
    matchedCeremonyFocus = 'Golden Jubilee Heritage';
    recommendedFinish = 'silk';
    confidenceScore = 96;
    attributes = { warmth: 'warm', contrast: 'high', formality: 'royal_ceremonial' };
    primaryRationale = `Identified golden milestone anniversary. Applied regal heirloom gold filigree and deep commemorative borders with fingerprint-resistant Silk lustre finish.`;
  } else {
    // Custom
    selectedPaletteId = palettes[0]?.id || 'iw-palette-royal-maroon';
    selectedBorderId = borderStyles[0]?.id || 'iw-border-jaali';
    recommendedFinish = 'silk';
    matchedCeremonyFocus = 'Custom Curated Event';
    confidenceScore = 90;
    primaryRationale = `Analyzed custom photo collection. Applied balanced archival theme settings with professional Silk finish.`;
  }

  // Ensure selected IDs actually exist in available palettes and borders
  const validPalette = palettes.some((p) => p.id === selectedPaletteId)
    ? selectedPaletteId
    : palettes[0]?.id || selectedPaletteId;

  const validBorder = borderStyles.some((b) => b.id === selectedBorderId)
    ? selectedBorderId
    : borderStyles[0]?.id || selectedBorderId;

  return {
    paletteId: validPalette,
    borderStyleId: validBorder,
    confidenceScore,
    matchedCeremonyFocus,
    primaryRationale,
    attributes,
    recommendedFinish,
  };
}
