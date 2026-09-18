import { FrameSlot, ImageAsset, PageSpread, PrintDimensions, PreflightIssue } from '../types';
import { checkGutterIntersection, checkSaliencyInGutter } from './layoutSolver';

export interface PreflightReport {
  timestamp: string;
  spreadCount: number;
  totalSlots: number;
  placedSlots: number;
  emptySlots: number;
  dpiIssuesCount: number;
  gutterCollisionsCount: number;
  isReadyForPrint: boolean;
  issues: PreflightIssue[];
}

/**
 * Calculates effective print DPI for a photo placed inside a frame slot.
 * Returns both the number and warning status.
 */
export function calculateEffectiveDpi(
  slot: FrameSlot,
  image: ImageAsset,
  dimensions: PrintDimensions
): { dpi: number; isAcceptable: boolean; statusText: string } {
  // Physical dimensions of the frame in inches
  const slotWidthInches = slot.width * dimensions.spreadWidthInches;
  const slotHeightInches = slot.height * dimensions.spreadHeightInches;

  // Effective pixels covering the slot width
  // When zoomed, fewer native pixels cover the physical inches
  const effectivePixelsW = image.width / Math.max(1.0, slot.zoom);
  const effectivePixelsH = image.height / Math.max(1.0, slot.zoom);

  const dpiW = Math.round(effectivePixelsW / slotWidthInches);
  const dpiH = Math.round(effectivePixelsH / slotHeightInches);
  const effectiveDpi = Math.min(dpiW, dpiH);

  const isAcceptable = effectiveDpi >= dimensions.targetDpi;
  let statusText = `${effectiveDpi} DPI (Optimal for 300 DPI print)`;
  if (effectiveDpi < 200) {
    statusText = `${effectiveDpi} DPI (Severe Pixelation Warning)`;
  } else if (effectiveDpi < dimensions.targetDpi) {
    statusText = `${effectiveDpi} DPI (Sub-optimal, recommended >= 300)`;
  }

  return { dpi: effectiveDpi, isAcceptable, statusText };
}

/**
 * Performs a comprehensive preflight audit across all spreads in the album.
 */
export function runAlbumPreflightAudit(
  spreads: PageSpread[],
  imageMap: Map<string, ImageAsset>,
  dimensions: PrintDimensions
): PreflightReport {
  const issues: PreflightIssue[] = [];
  let totalSlots = 0;
  let placedSlots = 0;
  let emptySlots = 0;
  let dpiIssuesCount = 0;
  let gutterCollisionsCount = 0;

  spreads.forEach((spread) => {
    spread.slots.forEach((slot) => {
      totalSlots++;
      if (!slot.assignedImageId) {
        emptySlots++;
        issues.push({
          slotId: slot.id,
          type: 'aspect_mismatch',
          severity: 'warning',
          message: `Spread ${spread.spreadNumber}: Unassigned frame slot`,
          details: 'Frame slot is empty. Please drop a photo or choose a different template.',
        });
        return;
      }

      placedSlots++;
      const image = imageMap.get(slot.assignedImageId);
      if (!image) return;

      // 1. Check DPI
      const dpiInfo = calculateEffectiveDpi(slot, image, dimensions);
      if (!dpiInfo.isAcceptable) {
        dpiIssuesCount++;
        issues.push({
          slotId: slot.id,
          imageId: image.id,
          type: 'low_dpi',
          severity: dpiInfo.dpi < 200 ? 'error' : 'warning',
          message: `Spread ${spread.spreadNumber} (${image.title}): Low resolution (${dpiInfo.dpi} DPI)`,
          details: `Physical frame requires at least 300 DPI for press quality. Native resolution is ${image.width}x${image.height}px at ${slot.zoom}x zoom.`,
        });
      }

      // 2. Check Gutter Fold Line Overlap
      if (checkGutterIntersection(slot.x, slot.width)) {
        const faceInGutter = checkSaliencyInGutter(slot, image);
        gutterCollisionsCount++;
        issues.push({
          slotId: slot.id,
          imageId: image.id,
          type: 'gutter_collision',
          severity: faceInGutter ? 'error' : 'warning',
          message: `Spread ${spread.spreadNumber}: Frame crosses the 0.75" Center Spine Gutter`,
          details: faceInGutter
            ? 'CRITICAL: A detected subject or face falls directly in the center book fold.'
            : 'Frame crosses the binding fold line. Image will be split across two bound pages.',
        });
      }

      // 3. Check Extreme Crop Zoom
      if (slot.zoom > 2.5) {
        issues.push({
          slotId: slot.id,
          imageId: image.id,
          type: 'excessive_crop',
          severity: 'warning',
          message: `Spread ${spread.spreadNumber}: High crop zoom factor (${slot.zoom.toFixed(1)}x)`,
          details: 'High magnification inside frame may accentuate compression artifacts in CMYK offset printing.',
        });
      }
    });
  });

  const isReadyForPrint = issues.filter((i) => i.severity === 'error').length === 0 && emptySlots === 0;

  return {
    timestamp: new Date().toISOString(),
    spreadCount: spreads.length,
    totalSlots,
    placedSlots,
    emptySlots,
    dpiIssuesCount,
    gutterCollisionsCount,
    isReadyForPrint,
    issues,
  };
}
