import {
  AlbumSheet,
  SheetRecommendation,
  KarizmaPhoto,
  PhotoObject,
  TextObject,
  AlbumObject,
} from '../types/karizma';

/**
 * Analyzes an album sheet and returns a detailed set of recommendations
 */
export function analyzeSheetForImprovements(
  sheet: AlbumSheet,
  photosMap: Map<string, KarizmaPhoto>
): SheetRecommendation[] {
  const recommendations: SheetRecommendation[] = [];
  const photoObjects = sheet.objects.filter((o): o is PhotoObject => o.type === 'photo');
  const textObjects = sheet.objects.filter((o): o is TextObject => o.type === 'text');

  // 1. Check for Gutter Collision (Center fold zone: 0.48 to 0.52)
  photoObjects.forEach((slot) => {
    const slotRight = slot.x + slot.width;
    const crossesGutter = slot.x < 0.52 && slotRight > 0.48;

    if (crossesGutter && slot.width < 0.8) {
      // If it's not an intentional panoramic full spread, flag it
      recommendations.push({
        id: `rec-gutter-${slot.id}`,
        title: 'Spine Gutter Collision',
        description: `Photo "${slot.name}" spans directly across the center album fold (x: ${Math.round(
          slot.x * 100
        )}% to ${Math.round(slotRight * 100)}%). Shift left or right to prevent binding crease cuts.`,
        category: 'spacing',
        applied: false,
        actionType: 'fix_gutter',
        targetObjectId: slot.id,
      });
    }
  });

  // 2. Check for Face Cutting / Crop Hazards
  photoObjects.forEach((slot) => {
    if (!slot.photoId) return;
    const photo = photosMap.get(slot.photoId);
    if (!photo || photo.analysis.faceCount === 0) return;

    const primaryFace = photo.analysis.faces[0];
    // If zoom is high and face is high up, or pan is not adjusted
    if (slot.zoom > 1.2 && Math.abs(slot.cropPanY) < 5 && primaryFace.box.y < 0.25) {
      recommendations.push({
        id: `rec-face-crop-${slot.id}`,
        title: 'Protect Bridal/Groom Face Safe Margin',
        description: `Detected face near top boundary for "${slot.name}". AI recommends panning down by 8% to maintain head-room and prevent accidental trimming.`,
        category: 'crop',
        applied: false,
        actionType: 'smart_crop',
        targetObjectId: slot.id,
      });
    }
  });

  // 3. Check for Duplicate Photos on Same Sheet
  const assignedIds = photoObjects.map((p) => p.photoId).filter(Boolean) as string[];
  const seen = new Set<string>();
  assignedIds.forEach((id) => {
    if (seen.has(id)) {
      const dupSlot = photoObjects.find((p) => p.photoId === id);
      recommendations.push({
        id: `rec-dup-${id}`,
        title: 'Duplicate Photo on Same Spread',
        description: 'The same photograph is assigned to multiple slots on this spread. AI recommends swapping with an alternate ceremony highlight.',
        category: 'duplicate',
        applied: false,
        actionType: 'replace_photo',
        targetObjectId: dupSlot?.id,
      });
    }
    seen.add(id);
  });

  // 4. Check Typography Contrast & Hierarchy
  if (textObjects.length === 0 && photoObjects.length > 2) {
    recommendations.push({
      id: 'rec-typo-title',
      title: 'Add Royal Ceremony Headline',
      description: 'Spread lacks a storytelling title. Adding an elegant gold serif ceremony title enhances narrative pacing.',
      category: 'typography',
      applied: false,
      actionType: 'enhance_typography',
    });
  }

  // 5. Visual Balance & Spacing Check
  const leftSlots = photoObjects.filter((p) => p.x < 0.5);
  const rightSlots = photoObjects.filter((p) => p.x >= 0.5);
  if (leftSlots.length > 3 && rightSlots.length === 0) {
    recommendations.push({
      id: 'rec-balance-spread',
      title: 'Spread Weight Imbalance',
      description: 'All photographs are clustered on the left page. Distribute a showcase portrait onto the right page for symmetry.',
      category: 'balance',
      applied: false,
      actionType: 'adjust_balance',
    });
  }

  // If no issues found, provide proactive polish suggestion
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-polish-borders',
      title: 'Apply 24K Imperial Gold Borders',
      description: 'Upgrade photo borders with subtle gold double-lines to complement the Royal Karizma album styling.',
      category: 'spacing',
      applied: false,
      actionType: 'enhance_typography',
    });
  }

  return recommendations;
}

/**
 * Applies a specific recommendation to the sheet
 */
export function applyRecommendationToSheet(
  sheet: AlbumSheet,
  recommendationId: string,
  photos: KarizmaPhoto[]
): AlbumSheet {
  const updatedObjects = sheet.objects.map((obj) => {
    // 1. Smart Crop fix
    if (
      recommendationId.startsWith('rec-face-crop') &&
      obj.type === 'photo' &&
      recommendationId.includes(obj.id)
    ) {
      return {
        ...obj,
        cropPanY: -8,
        zoom: Math.min(obj.zoom, 1.15),
      };
    }

    // 2. Gutter Shift fix
    if (
      recommendationId.startsWith('rec-gutter') &&
      obj.type === 'photo' &&
      recommendationId.includes(obj.id)
    ) {
      // Shift out of gutter (e.g. to right page or left page)
      const newX = obj.x < 0.5 ? 0.06 : 0.54;
      return {
        ...obj,
        x: newX,
      };
    }

    // 3. Duplicate replacement
    if (
      recommendationId.startsWith('rec-dup') &&
      obj.type === 'photo' &&
      recommendationId.includes(obj.photoId || '')
    ) {
      // Pick an unused alternate photo
      const altPhoto = photos.find((p) => p.id !== obj.photoId);
      if (altPhoto) {
        return {
          ...obj,
          photoId: altPhoto.id,
        };
      }
    }

    return obj;
  });

  const updatedRecs = sheet.recommendations.map((r) =>
    r.id === recommendationId ? { ...r, applied: true } : r
  );

  return {
    ...sheet,
    objects: updatedObjects,
    recommendations: updatedRecs,
  };
}
