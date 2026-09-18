import React, { useState, useRef, useEffect } from 'react';
import {
  PageSpread,
  FrameSlot,
  ImageAsset,
  PrintDimensions,
  GuideVisibility,
  SpreadTemplate,
  CulturalThemeConfig,
  CulturalColorPalette,
  FrameBorderStyle,
} from '../types';
import { calculateEffectiveDpi } from '../utils/printPreflight';
import { checkGutterIntersection, checkSaliencyInGutter } from '../utils/layoutSolver';
import {
  CornerMotif,
  SpreadCulturalWatermark,
  CenterGutterMedallion,
} from './CulturalMotifs';
import {
  ZoomIn,
  ZoomOut,
  Move,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Eye,
  Layers,
  Crosshair,
  Sliders,
  Scissors,
  Sparkles,
  Maximize2,
  Wand2,
  Palette,
  Printer,
} from 'lucide-react';

interface SpreadCanvasEditorProps {
  currentSpread: PageSpread;
  imageMap: Map<string, ImageAsset>;
  printDimensions: PrintDimensions;
  guides: GuideVisibility;
  templates: SpreadTemplate[];
  onUpdateSlot: (slotId: string, updates: Partial<FrameSlot>) => void;
  onSwapSlots: (sourceSlotId: string, targetSlotId: string) => void;
  onAssignImageToSlot: (slotId: string, imageId: string) => void;
  onChangeTemplate: (templateId: string) => void;
  onSelectPhotoToPreview?: (image: ImageAsset) => void;
  onOpenAiStudioForSlot?: (slotId: string, image?: ImageAsset | null) => void;
  culturalTheme?: CulturalThemeConfig;
  culturalPalettes?: CulturalColorPalette[];
  frameBorderStyles?: FrameBorderStyle[];
  onOpenPrintPreview?: () => void;
  onTriggerAutoTheme?: () => void;
}

export const SpreadCanvasEditor: React.FC<SpreadCanvasEditorProps> = ({
  currentSpread,
  imageMap,
  printDimensions,
  guides,
  templates,
  onUpdateSlot,
  onSwapSlots,
  onAssignImageToSlot,
  onChangeTemplate,
  onSelectPhotoToPreview,
  onOpenAiStudioForSlot,
  culturalTheme,
  culturalPalettes = [],
  frameBorderStyles = [],
  onOpenPrintPreview,
  onTriggerAutoTheme,
}) => {
  const isCultural = !!culturalTheme?.enabled;
  const activePalette = culturalPalettes.find((p) => p.id === culturalTheme?.activePaletteId) || culturalPalettes[0];
  const activeBorder = frameBorderStyles.find((b) => b.id === culturalTheme?.activeBorderStyleId) || frameBorderStyles[0];

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(
    currentSpread.slots[0]?.id || null
  );
  const [draggingSlotId, setDraggingSlotId] = useState<string | null>(null);
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; initialPanX: number; initialPanY: number } | null>(
    null
  );

  const selectedSlot = currentSpread.slots.find((s) => s.id === selectedSlotId) || null;
  const selectedImage = selectedSlot?.assignedImageId
    ? imageMap.get(selectedSlot.assignedImageId)
    : null;

  // Sync selected slot if current spread changes
  useEffect(() => {
    if (!currentSpread.slots.some((s) => s.id === selectedSlotId)) {
      setSelectedSlotId(currentSpread.slots[0]?.id || null);
    }
  }, [currentSpread.id, currentSpread.slots, selectedSlotId]);

  // Handle Pan Dragging inside the frame
  const handlePanMouseDown = (e: React.MouseEvent, slot: FrameSlot) => {
    e.stopPropagation();
    if (!slot.assignedImageId) return;
    setSelectedSlotId(slot.id);
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: slot.cropPanX,
      initialPanY: slot.cropPanY,
    };
  };

  const handlePanMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !panStartRef.current || !selectedSlot) return;

    const deltaX = e.clientX - panStartRef.current.x;
    const deltaY = e.clientY - panStartRef.current.y;

    // Convert pixel drag to percentage pan (-100 to +100)
    // Scale sensitivity by zoom level
    const sensitivity = 0.25 / Math.max(1, selectedSlot.zoom);
    const newPanX = Math.max(
      -100,
      Math.min(100, panStartRef.current.initialPanX + deltaX * sensitivity)
    );
    const newPanY = Math.max(
      -100,
      Math.min(100, panStartRef.current.initialPanY + deltaY * sensitivity)
    );

    onUpdateSlot(selectedSlot.id, { cropPanX: newPanX, cropPanY: newPanY });
  };

  const handlePanMouseUp = () => {
    setIsPanning(false);
    panStartRef.current = null;
  };

  // Center on Primary Face / Subject Saliency
  const handleAutoCenterSaliency = () => {
    if (!selectedSlot || !selectedImage || !selectedImage.saliency?.length) return;
    const primaryFace =
      selectedImage.saliency.find((s) => s.label === 'face') || selectedImage.saliency[0];

    // Saliency center normalized 0..1
    const focalCenterX = primaryFace.x + primaryFace.width / 2;
    const focalCenterY = primaryFace.y + primaryFace.height / 2;

    // Center focal point relative to frame center (0.5)
    // Pan offset is in % (-100 to +100)
    const panX = (0.5 - focalCenterX) * 100;
    const panY = (0.5 - focalCenterY) * 100;

    onUpdateSlot(selectedSlot.id, {
      cropPanX: Math.max(-100, Math.min(100, panX)),
      cropPanY: Math.max(-100, Math.min(100, panY)),
      zoom: Math.max(1.15, selectedSlot.zoom),
    });
  };

  // Drag and drop handlers for frame swapping and sidebar photo drops
  const handleSlotDragStart = (e: React.DragEvent, slot: FrameSlot) => {
    e.stopPropagation();
    if (!slot.assignedImageId) return;
    setDraggingSlotId(slot.id);
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'slot-swap',
        sourceSlotId: slot.id,
        imageId: slot.assignedImageId,
      })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSlotDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlotId !== slotId) {
      setDragOverSlotId(slotId);
    }
  };

  const handleSlotDragLeave = (e: React.DragEvent, slotId: string) => {
    e.stopPropagation();
    if (dragOverSlotId === slotId) {
      setDragOverSlotId(null);
    }
  };

  const handleSlotDrop = (e: React.DragEvent, targetSlotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlotId(null);
    setDraggingSlotId(null);

    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;

    try {
      const data = JSON.parse(rawData);
      if (data.type === 'slot-swap' && data.sourceSlotId) {
        // Swap photos between the two slots
        if (data.sourceSlotId !== targetSlotId) {
          onSwapSlots(data.sourceSlotId, targetSlotId);
        }
      } else if (data.type === 'photo-pool-drop' && data.imageId) {
        // Dropped photo from sidebar tray into slot
        onAssignImageToSlot(targetSlotId, data.imageId);
      }
    } catch {
      // Fallback plain text image ID
      const plainImageId = e.dataTransfer.getData('text/plain');
      if (plainImageId && imageMap.has(plainImageId)) {
        onAssignImageToSlot(targetSlotId, plainImageId);
      }
    }
  };

  // Dimensions & Guidelines Calculations
  const bleedPctX = (printDimensions.bleedInches / printDimensions.spreadWidthInches) * 100;
  const bleedPctY = (printDimensions.bleedInches / printDimensions.spreadHeightInches) * 100;
  const safeMarginPctX =
    (printDimensions.safeMarginInches / printDimensions.spreadWidthInches) * 100;
  const safeMarginPctY =
    (printDimensions.safeMarginInches / printDimensions.spreadHeightInches) * 100;
  const gutterWidthPct =
    (printDimensions.gutterWidthInches / printDimensions.spreadWidthInches) * 100;

  return (
    <div
      id="spread-editor-canvas-container"
      className="flex flex-col h-full bg-stone-900 text-stone-100 select-none overflow-hidden"
      onMouseMove={handlePanMouseMove}
      onMouseUp={handlePanMouseUp}
    >
      {/* Spread Toolbar & Template Bar */}
      <div
        id="canvas-top-toolbar"
        className="flex items-center justify-between px-6 py-3 bg-stone-950/90 border-b border-stone-800 shrink-0"
      >
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs font-semibold tracking-wider text-stone-400 uppercase">
              Double-Page Spread #{currentSpread.spreadNumber}
            </div>
            <div className="text-sm font-medium text-stone-100 flex items-center gap-2">
              <span>{currentSpread.title}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-400 font-mono">
                {printDimensions.spreadWidthInches}&quot; &times; {printDimensions.spreadHeightInches}&quot; (300 DPI)
              </span>
              {isCultural && activePalette && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1.5 shadow-xs"
                  style={{
                    backgroundColor: `${activePalette.primary}20`,
                    borderColor: `${activePalette.secondary}80`,
                    color: activePalette.secondary,
                  }}
                >
                  <Palette className="w-3 h-3" />
                  <span>{activePalette.name}</span>
                  <span className="opacity-60">&bull;</span>
                  <span>{activeBorder?.name}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Template Quick Selector & Print Preview Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-stone-400 font-medium">Layout Template:</label>
            <select
              id="template-select-dropdown"
              value={currentSpread.templateId}
              onChange={(e) => onChangeTemplate(e.target.value)}
              className="bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.photoCount} {t.photoCount === 1 ? 'photo' : 'photos'})
                </option>
              ))}
            </select>
          </div>

          {onOpenPrintPreview && (
            <button
              id="btn-canvas-open-print-preview"
              onClick={onOpenPrintPreview}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Preview Bleed-to-Trim Physical Print with Matte, Glossy, or Silk finishes"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print Preview</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 capitalize">
                {culturalTheme?.paperFinish || 'Silk'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Workspace with 2-page spread aspect ratio */}
      <div
        id="spread-canvas-viewport"
        className="flex-1 relative flex items-center justify-center p-8 overflow-auto bg-stone-900/95"
      >
        {/* The 2-Page Physical Spread Container (2:1 aspect ratio for 24x12" album spread) */}
        <div
          id="two-page-print-spread"
          className="relative w-full max-w-5xl aspect-[2/1] shadow-2xl rounded-sm transition-all duration-200"
          style={{
            backgroundColor: isCultural && activePalette ? activePalette.background : (currentSpread.background || '#FFFFFF'),
            boxShadow: isCultural && activePalette
              ? `0 25px 60px -12px ${activePalette.primary}30, 0 0 25px ${activePalette.secondary}20`
              : '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
          }}
        >
          {/* Cultural Background Watermark & Spine Gutter Medallions */}
          {isCultural && activePalette && activeBorder && culturalTheme?.showBackgroundTexture && (
            <SpreadCulturalWatermark palette={activePalette} borderStyle={activeBorder} />
          )}

          {isCultural && activePalette && (
            <>
              <CenterGutterMedallion palette={activePalette} position="top" />
              <CenterGutterMedallion palette={activePalette} position="bottom" />
            </>
          )}

          {/* ================= PRINT OVERLAY GUIDELINES ================= */}

          {/* 1. Bleed Area Guideline (Outside trim line) */}
          {guides.bleed && (
            <div
              id="guide-bleed-box"
              className="absolute pointer-events-none border-2 border-dashed border-red-500/80 z-20"
              style={{
                top: `-${bleedPctY}%`,
                left: `-${bleedPctX}%`,
                right: `-${bleedPctX}%`,
                bottom: `-${bleedPctY}%`,
              }}
            >
              <div className="absolute top-1 left-2 text-[10px] tracking-wider text-red-400 font-mono font-semibold bg-stone-950/80 px-1.5 py-0.5 rounded">
                BLEED LINE +0.125&quot;
              </div>
            </div>
          )}

          {/* 2. Trim Line (Cut Line / Edge of Spread) */}
          {guides.trim && (
            <div
              id="guide-trim-box"
              className="absolute inset-0 pointer-events-none border border-stone-400/60 z-20"
            >
              <div className="absolute top-1 left-2 text-[10px] tracking-wider text-stone-600 font-mono font-semibold bg-white/90 px-1.5 py-0.5 rounded shadow-xs">
                TRIM CUT LINE (24.0&quot; &times; 12.0&quot;)
              </div>
            </div>
          )}

          {/* 3. Safe Zone Margin (Inside Margins) */}
          {guides.safeZone && (
            <div
              id="guide-safe-zone"
              className="absolute pointer-events-none border border-dashed border-emerald-500/70 z-20"
              style={{
                top: `${safeMarginPctY}%`,
                left: `${safeMarginPctX}%`,
                right: `${safeMarginPctX}%`,
                bottom: `${safeMarginPctY}%`,
              }}
            >
              <div className="absolute top-1 left-2 text-[10px] tracking-wider text-emerald-600 font-mono font-semibold bg-emerald-50/90 px-1.5 py-0.5 rounded">
                SAFE ZONE (0.5&quot; MARGIN)
              </div>
            </div>
          )}

          {/* 4. Center Gutter / Spine Fold Guideline */}
          {guides.gutter && (
            <div
              id="guide-center-gutter-zone"
              className="absolute inset-y-0 pointer-events-none z-20 flex flex-col items-center justify-between"
              style={{
                left: `${50 - gutterWidthPct / 2}%`,
                width: `${gutterWidthPct}%`,
                backgroundColor: 'rgba(147, 51, 234, 0.08)',
                borderLeft: '1px dashed rgba(147, 51, 234, 0.6)',
                borderRight: '1px dashed rgba(147, 51, 234, 0.6)',
              }}
            >
              {/* Center Fold Line */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-purple-500/80" />

              <div className="text-[9px] font-mono text-purple-700 bg-purple-100/90 px-1 py-0.5 rounded-b font-medium mt-0.5 tracking-tighter">
                CENTER GUTTER 0.75&quot; FOLD
              </div>

              <div className="text-[8px] font-mono text-purple-700 bg-purple-100/90 px-1 py-0.5 rounded-t mb-0.5">
                NO CRITICAL FACES
              </div>
            </div>
          )}

          {/* Page Labels (Left Page: 12x12" | Right Page: 12x12") */}
          <div className="absolute bottom-2 left-4 text-[11px] font-medium text-stone-400 font-mono pointer-events-none">
            LEFT PAGE (12&quot; &times; 12&quot;)
          </div>
          <div className="absolute bottom-2 right-4 text-[11px] font-medium text-stone-400 font-mono pointer-events-none">
            RIGHT PAGE (12&quot; &times; 12&quot;)
          </div>

          {/* ================= FRAME SLOTS RENDERING ================= */}
          {currentSpread.slots.map((slot, index) => {
            const image = slot.assignedImageId ? imageMap.get(slot.assignedImageId) : null;
            const isSelected = selectedSlotId === slot.id;
            const isDragOver = dragOverSlotId === slot.id;
            const isCrossingGutter = checkGutterIntersection(slot.x, slot.width);
            const hasFaceInGutter = image ? checkSaliencyInGutter(slot, image) : false;
            const dpiInfo = image
              ? calculateEffectiveDpi(slot, image, printDimensions)
              : null;

            const frameBorderStylesObj: React.CSSProperties = isCultural && activeBorder && activePalette
              ? {
                  border: `${activeBorder.borderWidth}px ${activeBorder.borderStyle} ${activeBorder.borderColor}`,
                  padding: `${activeBorder.innerPadding}px`,
                  backgroundColor: activePalette.surface,
                  boxShadow: activeBorder.hasGlow && culturalTheme?.showGoldFoilAccent
                    ? `0 10px 25px -5px ${activePalette.secondary}35, 0 0 14px ${activePalette.secondary}45, 0 4px 6px -2px rgba(0, 0, 0, 0.25)`
                    : '0 8px 24px -4px rgba(0, 0, 0, 0.35)',
                }
              : {
                  backgroundColor: '#F5F5F4',
                };

            return (
              <div
                key={slot.id}
                id={`frame-slot-${slot.id}`}
                draggable={!!image}
                onDragStart={(e) => handleSlotDragStart(e, slot)}
                onDragOver={(e) => handleSlotDragOver(e, slot.id)}
                onDragLeave={(e) => handleSlotDragLeave(e, slot.id)}
                onDrop={(e) => handleSlotDrop(e, slot.id)}
                onClick={() => setSelectedSlotId(slot.id)}
                className={`absolute transition-all duration-150 rounded-xs cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-amber-500 shadow-lg z-10'
                    : 'hover:ring-1 hover:ring-stone-400'
                } ${
                  isDragOver
                    ? 'ring-4 ring-emerald-500 bg-emerald-500/20 scale-[1.01] z-30'
                    : ''
                }`}
                style={{
                  left: `${slot.x * 100}%`,
                  top: `${slot.y * 100}%`,
                  width: `${slot.width * 100}%`,
                  height: `${slot.height * 100}%`,
                  ...frameBorderStylesObj,
                }}
              >
                {/* Cultural Corner Motifs */}
                {isCultural && activeBorder && culturalTheme?.showCornerMotifs && (
                  <>
                    <CornerMotif position="top-left" type={activeBorder.cornerMotif} color={activeBorder.borderColor} accentColor={activeBorder.accentColor} size={28} />
                    <CornerMotif position="top-right" type={activeBorder.cornerMotif} color={activeBorder.borderColor} accentColor={activeBorder.accentColor} size={28} />
                    <CornerMotif position="bottom-left" type={activeBorder.cornerMotif} color={activeBorder.borderColor} accentColor={activeBorder.accentColor} size={28} />
                    <CornerMotif position="bottom-right" type={activeBorder.cornerMotif} color={activeBorder.borderColor} accentColor={activeBorder.accentColor} size={28} />
                  </>
                )}

                {image ? (
                  <div
                    className="relative w-full h-full overflow-hidden rounded-xs"
                    onMouseDown={(e) => handlePanMouseDown(e, slot)}
                  >
                    {/* Clipped and Panned/Zoomed Image */}
                    <img
                      src={image.url}
                      alt={image.title}
                      referrerPolicy="no-referrer"
                      className="absolute max-w-none transition-transform select-none pointer-events-none"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transformOrigin: 'center center',
                        transform: `scale(${slot.zoom}) translate(${slot.cropPanX}%, ${slot.cropPanY}%) rotate(${slot.rotation || 0}deg)`,
                      }}
                    />

                    {/* Saliency / Focal Points Guides */}
                    {guides.saliencyFocal && image.saliency && (
                      <div className="absolute inset-0 pointer-events-none">
                        {image.saliency.map((sal, sIdx) => (
                          <div
                            key={sIdx}
                            className={`absolute border-2 rounded-xs transition-opacity ${
                              sal.label === 'face'
                                ? 'border-amber-400/90 bg-amber-400/10'
                                : 'border-cyan-400/80 bg-cyan-400/10'
                            }`}
                            style={{
                              left: `${sal.x * 100}%`,
                              top: `${sal.y * 100}%`,
                              width: `${sal.width * 100}%`,
                              height: `${sal.height * 100}%`,
                            }}
                          >
                            <span className="absolute -top-4 left-0 text-[8px] font-mono uppercase px-1 py-0.2 rounded bg-stone-900/80 text-white">
                              {sal.label || 'subject'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* In-Frame Status Badges (DPI + Gutter Warning) */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none z-10">
                      {dpiInfo && (
                        <div
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1 font-medium ${
                            dpiInfo.isAcceptable
                              ? 'bg-emerald-950/80 text-emerald-300'
                              : 'bg-red-950/85 text-red-200 border border-red-500/50'
                          }`}
                        >
                          {dpiInfo.isAcceptable ? (
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          ) : (
                            <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                          )}
                          <span>{dpiInfo.dpi} DPI</span>
                        </div>
                      )}

                      {isCrossingGutter && (
                        <div
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1 font-medium ${
                            hasFaceInGutter
                              ? 'bg-purple-950/90 text-purple-200 border border-purple-400 animate-pulse'
                              : 'bg-purple-950/80 text-purple-300'
                          }`}
                        >
                          <AlertTriangle className="w-2.5 h-2.5 text-purple-400" />
                          <span>{hasFaceInGutter ? 'Face in Gutter!' : 'Spans Gutter'}</span>
                        </div>
                      )}
                    </div>

                    {/* Drag Handle Indicator */}
                    <div className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity bg-stone-950/80 text-stone-200 text-[9px] px-1.5 py-0.5 rounded font-mono pointer-events-none flex items-center gap-1">
                      <Move className="w-2.5 h-2.5" /> Drag to pan / swap
                    </div>
                  </div>
                ) : (
                  /* Empty Slot State */
                  <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-amber-400 text-stone-400 hover:text-stone-700 transition-colors p-4 text-center">
                    <Scissors className="w-6 h-6 mb-2 opacity-60 text-stone-400" />
                    <div className="text-xs font-semibold text-stone-700">Slot #{index + 1}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      Drop photo here or drag from sidebar
                    </div>
                    <div className="text-[9px] font-mono text-stone-400 mt-1">
                      {(slot.width * printDimensions.spreadWidthInches).toFixed(1)}&quot; &times;{' '}
                      {(slot.height * printDimensions.spreadHeightInches).toFixed(1)}&quot;
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Context Panel: In-Frame Pan/Zoom/Crop Controls for Selected Slot */}
      {selectedSlot && (
        <div
          id="slot-controls-footer"
          className="bg-stone-950 border-t border-stone-800 px-6 py-3 shrink-0 flex items-center justify-between gap-6"
        >
          {/* Selected Slot Metadata */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-400 font-semibold text-xs">
              #{currentSpread.slots.findIndex((s) => s.id === selectedSlot.id) + 1}
            </div>
            <div>
              <div className="text-xs font-medium text-stone-200 flex items-center gap-2">
                <span>{selectedImage ? selectedImage.title : 'Empty Slot'}</span>
                {selectedImage && (
                  <span className="text-[10px] font-mono bg-stone-900 text-stone-400 px-1.5 py-0.5 rounded border border-stone-800">
                    {selectedImage.width}&times;{selectedImage.height}px &bull; {selectedImage.orientation}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-400 font-mono">
                Frame Size: {(selectedSlot.width * printDimensions.spreadWidthInches).toFixed(2)}&quot; &times;{' '}
                {(selectedSlot.height * printDimensions.spreadHeightInches).toFixed(2)}&quot; &bull;{' '}
                {selectedImage
                  ? calculateEffectiveDpi(selectedSlot, selectedImage, printDimensions).statusText
                  : 'Awaiting photo assignment'}
              </div>
            </div>
          </div>

          {/* Pan & Zoom Controls */}
          {selectedImage && (
            <div className="flex items-center gap-6">
              {/* Zoom Slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
                  <Maximize2 className="w-3 h-3" /> Zoom:
                </span>
                <button
                  id="btn-zoom-out"
                  title="Zoom Out"
                  onClick={() =>
                    onUpdateSlot(selectedSlot.id, {
                      zoom: Math.max(1.0, selectedSlot.zoom - 0.1),
                    })
                  }
                  className="p-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  id="slider-slot-zoom"
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.05"
                  value={selectedSlot.zoom}
                  onChange={(e) =>
                    onUpdateSlot(selectedSlot.id, {
                      zoom: parseFloat(e.target.value),
                    })
                  }
                  className="w-28 accent-amber-500 cursor-pointer"
                />
                <button
                  id="btn-zoom-in"
                  title="Zoom In"
                  onClick={() =>
                    onUpdateSlot(selectedSlot.id, {
                      zoom: Math.min(3.0, selectedSlot.zoom + 0.1),
                    })
                  }
                  className="p-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono text-amber-400 w-10">
                  {selectedSlot.zoom.toFixed(2)}&times;
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 border-l border-stone-800 pl-4">
                {/* AI Edit Action */}
                {onOpenAiStudioForSlot && (
                  <button
                    id="btn-slot-ai-edit"
                    onClick={() => onOpenAiStudioForSlot(selectedSlot.id, selectedImage)}
                    className="px-2.5 py-1.5 rounded text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Edit this photo with Gemini 3.1 Flash Image"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Edit</span>
                  </button>
                )}

                <button
                  id="btn-auto-center-face"
                  onClick={handleAutoCenterSaliency}
                  disabled={!selectedImage.saliency?.length}
                  className="px-2.5 py-1.5 rounded text-xs font-medium bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 flex items-center gap-1.5 disabled:opacity-40 transition-colors"
                  title="Align frame crop to primary human face or salient subject"
                >
                  <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                  <span>Center on Subject</span>
                </button>

                <button
                  id="btn-rotate-frame"
                  onClick={() =>
                    onUpdateSlot(selectedSlot.id, {
                      rotation: ((selectedSlot.rotation || 0) + 90) % 360,
                    })
                  }
                  className="p-1.5 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors"
                  title="Rotate Image 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                <button
                  id="btn-reset-framing"
                  onClick={() =>
                    onUpdateSlot(selectedSlot.id, {
                      cropPanX: 0,
                      cropPanY: 0,
                      zoom: 1.0,
                    })
                  }
                  className="px-2 py-1.5 rounded bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs border border-stone-800 transition-colors"
                  title="Reset Pan & Zoom"
                >
                  Reset
                </button>

                <button
                  id="btn-remove-photo-from-slot"
                  onClick={() => onUpdateSlot(selectedSlot.id, { assignedImageId: null })}
                  className="p-1.5 rounded bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-900/50 transition-colors"
                  title="Remove Photo from Frame"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
