export type Orientation = 'landscape' | 'portrait' | 'square';

export type EventType = 'indian_wedding' | 'western_wedding' | 'birthday' | 'anniversary' | 'custom';

export interface EventBatch {
  id: EventType;
  name: string;
  subtitle: string;
  description: string;
  tag: string;
  photos: ImageAsset[];
  defaultSpreads: PageSpread[];
  aiPromptSuggestions: string[];
}

export interface SaliencyRegion {
  x: number; // normalized 0..1
  y: number; // normalized 0..1
  width: number; // normalized 0..1
  height: number; // normalized 0..1
  label?: string; // 'face' | 'subject' | 'focal_point'
  confidence?: number;
}

export interface ImageAsset {
  id: string;
  url: string;
  thumbUrl: string;
  title: string;
  filename: string;
  width: number; // in pixels
  height: number; // in pixels
  aspectRatio: number; // width / height
  orientation: Orientation;
  timestamp: string; // ISO 8601
  clusterId?: string;
  saliency: SaliencyRegion[];
  qualityScore: number; // 0..100 (sharpness, exposure, aesthetic)
  tags?: string[];
  eventTag?: string;
  isAiGenerated?: boolean;
  isAiEdited?: boolean;
  promptUsed?: string;
  editPromptUsed?: string;
  modelUsed?: string;
}

export interface FrameSlot {
  id: string;
  // Normalized spread coordinates (0 to 1, where 0,0 is top-left of entire 2-page spread)
  x: number;
  y: number;
  width: number;
  height: number;
  // Image placement & pan/zoom state inside frame
  assignedImageId: string | null;
  cropPanX: number; // -100% to +100% pan offset within frame bounds
  cropPanY: number; // -100% to +100% pan offset within frame bounds
  zoom: number; // 1.0 = fit/fill baseline, up to 3.5x
  rotation?: number; // 0, 90, 180, 270
}

export interface SpreadTemplate {
  id: string;
  name: string;
  description: string;
  photoCount: number;
  slots: Omit<FrameSlot, 'assignedImageId' | 'cropPanX' | 'cropPanY' | 'zoom'>[];
  category: 'minimal' | 'balanced' | 'editorial' | 'hero-grid' | 'storyboard';
}

export interface PageSpread {
  id: string;
  spreadNumber: number; // 1, 2, 3...
  title: string;
  templateId: string;
  slots: FrameSlot[];
  background: string; // hex or color
}

export interface PrintDimensions {
  spreadWidthInches: number; // e.g. 24.0 or 36.0
  spreadHeightInches: number; // e.g. 12.0
  bleedInches: number; // standard 0.125" (1/8 inch)
  safeMarginInches: number; // standard 0.5"
  gutterWidthInches: number; // standard 0.75" fold zone
  targetDpi: number; // standard 300 DPI
}

export interface GuideVisibility {
  bleed: boolean;
  trim: boolean;
  safeZone: boolean;
  gutter: boolean;
  saliencyFocal: boolean;
  dimensionsOverlay: boolean;
}

export interface PreflightIssue {
  slotId: string;
  imageId?: string;
  type: 'low_dpi' | 'gutter_collision' | 'excessive_crop' | 'aspect_mismatch';
  severity: 'warning' | 'error';
  message: string;
  details?: string;
}

export interface LayoutSolverWeights {
  chronologyWeight: number;
  gutterAvoidanceWeight: number;
  orientationBalanceWeight: number;
  qualityPrioritizationWeight: number;
}
