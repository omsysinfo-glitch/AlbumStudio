import {
  KarizmaPhoto,
  AlbumSheet,
  KarizmaTemplate,
  DesignStyle,
  AlbumObject,
  PhotoObject,
  TextObject,
  DecorationObject,
  EventClassificationType,
} from '../types/karizma';
import { KARIZMA_TEMPLATES } from '../data/karizmaTemplates';
import { KARIZMA_DESIGN_STYLES } from '../data/karizmaStyles';

export interface StoryChapter {
  title: string;
  ceremonyTag: EventClassificationType;
  suggestedTemplateCategory: string;
  description: string;
}

export const WEDDING_STORY_SEQUENCE: StoryChapter[] = [
  {
    title: 'The Royal Union • Couple Opening',
    ceremonyTag: 'Couple Portrait',
    suggestedTemplateCategory: 'Royal',
    description: 'Grand opening statement featuring couple portraits',
  },
  {
    title: 'Haldi Sunshine & Sacred Turmeric',
    ceremonyTag: 'Haldi',
    suggestedTemplateCategory: 'Floral',
    description: 'Joyful candid moments and turmeric blessing laughter',
  },
  {
    title: 'Henna Whispers • Mehendi Elegance',
    ceremonyTag: 'Mehendi',
    suggestedTemplateCategory: 'Floral',
    description: 'Intricate bridal henna patterns and close family bonds',
  },
  {
    title: 'Sangeet Symphony • Rhythm & Celebration',
    ceremonyTag: 'Sangeet',
    suggestedTemplateCategory: 'Romantic',
    description: 'Energetic stage dances, laughter, and musical celebration',
  },
  {
    title: 'The Regal Bride & Groom Portraits',
    ceremonyTag: 'Bride Portrait',
    suggestedTemplateCategory: 'Luxury',
    description: 'Stately individual portraits showcasing lehenga and sherwani splendor',
  },
  {
    title: 'Vedic Mandap & Holy Vows',
    ceremonyTag: 'Mandap',
    suggestedTemplateCategory: 'Traditional',
    description: 'Sacred fire rituals, Saat Phere, and solemn promises',
  },
  {
    title: 'Varmala • The Garland Exchange',
    ceremonyTag: 'Garland Exchange',
    suggestedTemplateCategory: 'Royal',
    description: 'Floral garland exchange on the stage with flower showers',
  },
  {
    title: 'Pillars of Love • Family Blessings',
    ceremonyTag: 'Family',
    suggestedTemplateCategory: 'Elegant',
    description: 'Heirloom family group portraits with parents and elders',
  },
  {
    title: 'Grand Reception & Twilight Gala',
    ceremonyTag: 'Reception',
    suggestedTemplateCategory: 'Dark Luxury',
    description: 'Evening black-tie celebration, cake cutting, and golden toasts',
  },
];

/**
 * Automatically generates a complete multi-sheet album based on AI story sequencing
 */
export function generateAiAlbumSheets(
  photos: KarizmaPhoto[],
  styleId: string = 'style-royal-red-gold',
  targetSheetCount: number = 8
): AlbumSheet[] {
  const style =
    KARIZMA_DESIGN_STYLES.find((s) => s.id === styleId) || KARIZMA_DESIGN_STYLES[0];

  const sheets: AlbumSheet[] = [];
  const usedPhotoIds = new Set<string>();

  const chapters = WEDDING_STORY_SEQUENCE.slice(0, targetSheetCount);

  chapters.forEach((chapter, index) => {
    // 1. Find suitable template
    const templateCandidates = KARIZMA_TEMPLATES.filter(
      (t) => t.category.toLowerCase() === chapter.suggestedTemplateCategory.toLowerCase()
    );
    const template =
      templateCandidates.length > 0
        ? templateCandidates[index % templateCandidates.length]
        : KARIZMA_TEMPLATES[index % KARIZMA_TEMPLATES.length];

    // 2. Select matching photos for this chapter
    const matchingPhotos = photos
      .filter((p) => p.eventTag === chapter.ceremonyTag && !usedPhotoIds.has(p.id))
      .sort((a, b) => b.analysis.qualityScore - a.analysis.qualityScore);

    // Fallback if not enough tagged photos: grab highest unused photos
    const fallbackPhotos = photos
      .filter((p) => !usedPhotoIds.has(p.id))
      .sort((a, b) => b.analysis.qualityScore - a.analysis.qualityScore);

    const pool = matchingPhotos.length > 0 ? [...matchingPhotos, ...fallbackPhotos] : fallbackPhotos;

    // 3. Build album objects for this sheet
    const objects: AlbumObject[] = [];

    // Photo Slots
    template.photoSlots.forEach((slotDef, sIdx) => {
      const selectedPhoto = pool[sIdx % pool.length] || photos[0];
      if (selectedPhoto) {
        usedPhotoIds.add(selectedPhoto.id);
      }

      // Smart face pan calculation: if face is detected, calculate offset to keep face safe
      let smartPanY = 0;
      if (selectedPhoto && selectedPhoto.analysis.faceCount > 0) {
        const primaryFace = selectedPhoto.analysis.faces[0];
        // If face is in upper 20% or lower 20%, compensate
        if (primaryFace.box.y < 0.2) smartPanY = 5;
        if (primaryFace.box.y > 0.6) smartPanY = -10;
      }

      const photoObj: PhotoObject = {
        id: `obj-sh${index + 1}-photo-${sIdx + 1}`,
        type: 'photo',
        name: `${slotDef.role.toUpperCase()} Photo Slot ${sIdx + 1}`,
        x: slotDef.x,
        y: slotDef.y,
        width: slotDef.width,
        height: slotDef.height,
        rotation: 0,
        opacity: 1,
        zIndex: 2,
        photoId: selectedPhoto ? selectedPhoto.id : null,
        cropPanX: 0,
        cropPanY: smartPanY,
        zoom: 1.0,
        fitMode: 'cover',
        borderWidth: style.borderStyle.width,
        borderColor: style.borderStyle.color,
        borderStyle: style.borderStyle.style,
        borderRadius: style.borderStyle.radius,
        shadowColor: 'rgba(0,0,0,0.4)',
        shadowBlur: 12,
        shadowOffsetX: 0,
        shadowOffsetY: 6,
        role: slotDef.role,
      };
      objects.push(photoObj);
    });

    // Text Slots
    template.textSlots.forEach((textDef, tIdx) => {
      const textObj: TextObject = {
        id: `obj-sh${index + 1}-text-${tIdx + 1}`,
        type: 'text',
        name: `Text ${textDef.role}`,
        x: textDef.x,
        y: textDef.y,
        width: textDef.width,
        height: textDef.height,
        rotation: 0,
        opacity: 1,
        zIndex: 3,
        text: textDef.defaultText || chapter.title,
        fontFamily: style.typography.headingFont,
        fontSize: textDef.fontSize || 20,
        fontWeight: 'bold',
        fontStyle: 'normal',
        color: style.colors.secondary,
        letterSpacing: 2,
        lineHeight: 1.2,
        textAlign: textDef.textAlign || 'center',
        textTransform: 'uppercase',
      };
      objects.push(textObj);
    });

    // Decoration Slots
    if (template.decorations) {
      template.decorations.forEach((decDef, dIdx) => {
        const decObj: DecorationObject = {
          id: `obj-sh${index + 1}-dec-${dIdx + 1}`,
          type: 'decoration',
          name: `Motif ${decDef.motifType}`,
          x: decDef.x,
          y: decDef.y,
          width: decDef.width,
          height: decDef.height,
          rotation: decDef.rotation || 0,
          opacity: 0.8,
          zIndex: 1,
          motifType: decDef.motifType,
          tintColor: style.colors.secondary,
        };
        objects.push(decObj);
      });
    }

    sheets.push({
      id: `sheet-gen-${index + 1}`,
      sheetNumber: index + 1,
      title: chapter.title,
      ceremonyTag: chapter.ceremonyTag,
      templateId: template.id,
      background: template.background || style.defaultBackground,
      objects,
      comments: [],
      recommendations: [],
    });
  });

  return sheets;
}
