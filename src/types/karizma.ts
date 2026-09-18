export type AlbumSize = '12x36' | '12x30' | '10x30' | 'custom';

export type TemplateCategory =
  | 'Royal'
  | 'Luxury'
  | 'Traditional'
  | 'Modern'
  | 'Minimal'
  | 'Floral'
  | 'Cinematic'
  | 'Romantic'
  | 'Elegant'
  | 'Dark Luxury';

export type EventClassificationType =
  | 'Pre Wedding'
  | 'Engagement'
  | 'Haldi'
  | 'Mehendi'
  | 'Sangeet'
  | 'Wedding'
  | 'Mandap'
  | 'Garland Exchange'
  | 'Sindoor'
  | 'Family'
  | 'Bride Portrait'
  | 'Groom Portrait'
  | 'Couple Portrait'
  | 'Reception'
  | 'Departure'
  | 'Detail Shot'
  | 'Unknown';

export type QualityTier = 'Excellent' | 'Good' | 'Average' | 'Poor';

export type ObjectType =
  | 'photo'
  | 'text'
  | 'shape'
  | 'frame'
  | 'decoration'
  | 'mask';

export interface BoundingBox {
  x: number; // normalized 0..1 relative to spread
  y: number; // normalized 0..1 relative to spread
  width: number; // normalized 0..1
  height: number; // normalized 0..1
}

export interface FaceDetection {
  id: string;
  box: BoundingBox;
  confidence: number;
  label?: 'bride' | 'groom' | 'family' | 'guest' | 'person';
  smileConfidence?: number;
  eyesOpenConfidence?: number;
}

export interface PhotoAnalysisData {
  sharpness: number; // 0..100
  blurScore: number; // 0..100 (lower is better)
  exposure: number; // -100..+100 (0 is optimal)
  brightness: number; // 0..100
  contrast: number; // 0..100
  qualityScore: number; // calculated 0..100
  qualityTier: QualityTier;
  compositionScore: number; // 0..100
  emotionalImportance: number; // 0..100
  faceCount: number;
  faces: FaceDetection[];
  dominantColors: string[]; // hex codes
  sceneClassification: string;
  eventClassification: {
    event: EventClassificationType;
    confidence: number;
  };
  duplicateGroupId?: string;
  isDuplicateRecommended?: boolean;
}

export interface KarizmaPhoto {
  id: string;
  url: string;
  thumbUrl: string;
  originalUrl?: string;
  title: string;
  filename: string;
  fileSize?: number;
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'landscape' | 'portrait' | 'square';
  timestamp: string;
  eventTag: EventClassificationType;
  analysis: PhotoAnalysisData;
  isAiGenerated?: boolean;
  isAiEdited?: boolean;
  tags?: string[];
  userRankOverride?: QualityTier;
}

export interface DuplicateGroup {
  id: string;
  name: string;
  event: EventClassificationType;
  similarityScore: number;
  photoIds: string[];
  recommendedPhotoId: string;
}

export interface BaseAlbumObject {
  id: string;
  type: ObjectType;
  name: string;
  // Normalized spread coordinates (0 to 1)
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees 0..360
  opacity: number; // 0..1
  zIndex: number;
  isLocked?: boolean;
  isVisible?: boolean;
}

export interface PhotoObject extends BaseAlbumObject {
  type: 'photo';
  photoId: string | null;
  cropPanX: number; // -100% to +100%
  cropPanY: number; // -100% to +100%
  zoom: number; // 1.0 to 3.5
  fitMode: 'cover' | 'contain' | 'smart_face';
  borderWidth: number;
  borderColor: string;
  borderStyle: 'solid' | 'double' | 'groove' | 'none';
  borderRadius: number; // px
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  hasGlow?: boolean;
  role?: 'hero' | 'support' | 'detail' | 'couple';
}

export interface TextObject extends BaseAlbumObject {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number; // pt or relative px
  fontWeight: 'normal' | 'medium' | 'bold' | '300' | '600' | '700' | '800';
  fontStyle: 'normal' | 'italic';
  color: string;
  letterSpacing: number; // px
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right';
  textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  shadowColor?: string;
  shadowBlur?: number;
}

export interface ShapeObject extends BaseAlbumObject {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line' | 'frame_border' | 'arch';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  strokeDasharray?: string;
  cornerRadius?: number;
}

export interface DecorationObject extends BaseAlbumObject {
  type: 'decoration';
  motifType:
    | 'mandala'
    | 'paisley'
    | 'jaali'
    | 'arch'
    | 'flourish'
    | 'garland'
    | 'kalash'
    | 'corner_lattice';
  tintColor: string;
  secondaryTintColor?: string;
  flipX?: boolean;
  flipY?: boolean;
}

export type AlbumObject =
  | PhotoObject
  | TextObject
  | ShapeObject
  | DecorationObject;

export interface SheetBackground {
  type: 'solid' | 'gradient' | 'texture' | 'image';
  value: string; // hex, CSS gradient string, or texture URL
  overlayColor?: string;
  overlayOpacity?: number;
}

export interface SheetRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'crop' | 'balance' | 'typography' | 'duplicate' | 'spacing';
  applied: boolean;
  actionType:
    | 'smart_crop'
    | 'replace_photo'
    | 'adjust_balance'
    | 'enhance_typography'
    | 'fix_gutter';
  targetObjectId?: string;
  suggestedPhotoId?: string;
}

export interface ClientComment {
  id: string;
  sheetId: string;
  authorName: string;
  authorRole: 'client' | 'photographer' | 'designer';
  commentText: string;
  timestamp: string;
  status: 'open' | 'resolved';
  resolvedAt?: string;
}

export interface AlbumSheet {
  id: string;
  sheetNumber: number;
  title: string;
  ceremonyTag: EventClassificationType;
  templateId: string;
  objects: AlbumObject[];
  background: SheetBackground;
  comments: ClientComment[];
  recommendations: SheetRecommendation[];
  isLocked?: boolean;
  history?: {
    past: AlbumObject[][];
    future: AlbumObject[][];
  };
}

export interface KarizmaProject {
  id: string;
  name: string;
  clientName: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  albumSize: AlbumSize;
  customWidthInches?: number;
  customHeightInches?: number;
  sheetCount: number;
  designStyleId: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'in_review' | 'approved' | 'exported';
  coverConfig: {
    frontTitle: string;
    frontSubtitle: string;
    coverPhotoId: string | null;
    spineText: string;
    spineWidthInches: number;
    backText: string;
    material: 'velvet' | 'leatherette' | 'matte_laminate' | 'silk_brocade';
    foilColor: 'gold' | 'rose_gold' | 'silver' | 'copper';
  };
}

export interface TemplateSlotDef {
  id: string;
  x: number; // 0..1
  y: number; // 0..1
  width: number; // 0..1
  height: number; // 0..1
  role: 'hero' | 'support' | 'detail' | 'couple';
  suggestedOrientation?: 'landscape' | 'portrait' | 'square';
}

export interface TemplateTextDef {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  defaultText: string;
  fontSize: number;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  role: 'title' | 'subtitle' | 'mantra' | 'date';
}

export interface TemplateDecorationDef {
  id: string;
  motifType: DecorationObject['motifType'];
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface KarizmaTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  photoCount: number;
  canvas: {
    spreadWidthInches: number;
    spreadHeightInches: number;
  };
  background: SheetBackground;
  photoSlots: TemplateSlotDef[];
  textSlots: TemplateTextDef[];
  decorations?: TemplateDecorationDef[];
  safeZoneMargin: number; // normalized
  gutterZoneWidth: number; // normalized
}

export interface DesignStyle {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    scriptFont: string;
  };
  borderStyle: {
    width: number;
    color: string;
    style: 'solid' | 'double' | 'groove';
    radius: number;
  };
  decorations: DecorationObject['motifType'][];
  defaultBackground: SheetBackground;
}

export interface QualityWeights {
  qualityScore: number; // weight multiplier
  compositionScore: number;
  faceQualityScore: number;
  storyImportanceScore: number;
  emotionalScore: number;
  duplicatePenalty: number;
  blurPenalty: number;
}

export const DEFAULT_QUALITY_WEIGHTS: QualityWeights = {
  qualityScore: 1.0,
  compositionScore: 0.8,
  faceQualityScore: 1.2,
  storyImportanceScore: 1.0,
  emotionalScore: 1.1,
  duplicatePenalty: 1.5,
  blurPenalty: 2.0,
};

export interface GuideVisibility {
  bleed: boolean;
  trim: boolean;
  safeZone: boolean;
  gutter: boolean;
  saliencyFocal: boolean;
  dimensionsOverlay: boolean;
}

export interface PrintDimensions {
  pageWidthInches: number;
  pageHeightInches: number;
  spreadWidthInches: number;
  spreadHeightInches: number;
  bleedInches: number;
  safeZoneInches: number;
  spineGutterInches: number;
  dpi: number;
}

