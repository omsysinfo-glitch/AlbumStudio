/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ImageAsset,
  PageSpread,
  PrintDimensions,
  GuideVisibility,
  FrameSlot,
  EventType,
} from './types';
import {
  DEFAULT_PRINT_DIMENSIONS,
  SPREAD_TEMPLATES,
  EVENT_BATCHES,
} from './data/mockAlbumData';
import { solveAlbumSpreads } from './utils/layoutSolver';
import { runAlbumPreflightAudit } from './utils/printPreflight';
import { Header } from './components/Header';
import { SpreadCanvasEditor } from './components/SpreadCanvasEditor';
import { PhotoPoolSidebar } from './components/PhotoPoolSidebar';
import { ArchitectureHub } from './components/ArchitectureHub';
import { SolverInspector } from './components/SolverInspector';
import { PrintExportModal } from './components/PrintExportModal';
import { AiImageStudioModal } from './components/AiImageStudioModal';
import { X, Calendar, Sparkles, Wand2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'canvas' | 'solver' | 'architecture'>('canvas');

  // Event Batch Selection (Default: Indian Wedding)
  const [currentEventType, setCurrentEventType] = useState<EventType>('indian_wedding');

  const initialEventBatch = EVENT_BATCHES[currentEventType];
  const [photos, setPhotos] = useState<ImageAsset[]>(initialEventBatch.photos);
  const [spreads, setSpreads] = useState<PageSpread[]>(initialEventBatch.defaultSpreads);
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [inspectingPhoto, setInspectingPhoto] = useState<ImageAsset | null>(null);

  // AI Photo Studio State (Gemini 3.1 Flash Image)
  const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);
  const [aiStudioPhotoToEdit, setAiStudioPhotoToEdit] = useState<ImageAsset | null>(null);
  const [aiStudioTargetSlotId, setAiStudioTargetSlotId] = useState<string | null>(null);

  // Guide Visibilities
  const [guides, setGuides] = useState<GuideVisibility>({
    bleed: true,
    trim: true,
    safeZone: true,
    gutter: true,
    saliencyFocal: true,
    dimensionsOverlay: false,
  });

  const printDimensions: PrintDimensions = DEFAULT_PRINT_DIMENSIONS;

  // Switch Event Batch (Indian Wedding, Birthday, Anniversary, etc.)
  const handleChangeEventType = (newType: EventType) => {
    setCurrentEventType(newType);
    const batch = EVENT_BATCHES[newType] || EVENT_BATCHES.indian_wedding;
    setPhotos(batch.photos);
    setSpreads(batch.defaultSpreads);
    setCurrentSpreadIndex(0);
  };

  // Build O(1) image lookup map
  const imageMap = useMemo(() => {
    const map = new Map<string, ImageAsset>();
    photos.forEach((p) => map.set(p.id, p));
    return map;
  }, [photos]);

  // Set of all currently assigned image IDs across all spreads
  const assignedImageIds = useMemo(() => {
    const set = new Set<string>();
    spreads.forEach((spread) => {
      spread.slots.forEach((slot) => {
        if (slot.assignedImageId) {
          set.add(slot.assignedImageId);
        }
      });
    });
    return set;
  }, [spreads]);

  // Preflight issue count for header badge
  const preflightAudit = useMemo(() => {
    return runAlbumPreflightAudit(spreads, imageMap, printDimensions);
  }, [spreads, imageMap, printDimensions]);

  const currentSpread = spreads[currentSpreadIndex] || spreads[0];

  // Update specific frame slot properties (e.g. pan, zoom, crop)
  const handleUpdateSlot = (slotId: string, updates: Partial<FrameSlot>) => {
    setSpreads((prev) =>
      prev.map((spread, sIdx) => {
        if (sIdx !== currentSpreadIndex) return spread;
        return {
          ...spread,
          slots: spread.slots.map((slot) =>
            slot.id === slotId ? { ...slot, ...updates } : slot
          ),
        };
      })
    );
  };

  // Swap photos between two slots with drag and drop
  const handleSwapSlots = (sourceSlotId: string, targetSlotId: string) => {
    setSpreads((prev) =>
      prev.map((spread, sIdx) => {
        if (sIdx !== currentSpreadIndex) return spread;
        const sourceSlot = spread.slots.find((s) => s.id === sourceSlotId);
        const targetSlot = spread.slots.find((s) => s.id === targetSlotId);
        if (!sourceSlot || !targetSlot) return spread;

        const sourceImageId = sourceSlot.assignedImageId;
        const targetImageId = targetSlot.assignedImageId;

        return {
          ...spread,
          slots: spread.slots.map((slot) => {
            if (slot.id === sourceSlotId) {
              return {
                ...slot,
                assignedImageId: targetImageId,
                cropPanX: 0,
                cropPanY: 0,
                zoom: 1.0,
              };
            }
            if (slot.id === targetSlotId) {
              return {
                ...slot,
                assignedImageId: sourceImageId,
                cropPanX: 0,
                cropPanY: 0,
                zoom: 1.0,
              };
            }
            return slot;
          }),
        };
      })
    );
  };

  // Assign image to a frame slot from photo pool
  const handleAssignImageToSlot = (slotId: string, imageId: string) => {
    setSpreads((prev) =>
      prev.map((spread, sIdx) => {
        if (sIdx !== currentSpreadIndex) return spread;
        return {
          ...spread,
          slots: spread.slots.map((slot) => {
            if (slot.id === slotId) {
              return {
                ...slot,
                assignedImageId: imageId,
                cropPanX: 0,
                cropPanY: 0,
                zoom: 1.0,
                rotation: 0,
              };
            }
            return slot;
          }),
        };
      })
    );
  };

  // Change current spread layout template
  const handleChangeTemplate = (templateId: string) => {
    const template = SPREAD_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    // Collect currently placed image IDs
    const assignedIds = currentSpread.slots
      .map((s) => s.assignedImageId)
      .filter(Boolean) as string[];

    // Map existing assigned images to new template slots
    const newSlots: FrameSlot[] = template.slots.map((tplSlot, idx) => ({
      ...tplSlot,
      id: `slot-${currentSpread.id}-${idx + 1}`,
      assignedImageId: assignedIds[idx] || null,
      cropPanX: 0,
      cropPanY: 0,
      zoom: 1.0,
      rotation: 0,
    }));

    setSpreads((prev) =>
      prev.map((spread, sIdx) => {
        if (sIdx !== currentSpreadIndex) return spread;
        return {
          ...spread,
          templateId: template.id,
          slots: newSlots,
        };
      })
    );
  };

  // Add a blank new spread to the album
  const handleAddSpread = () => {
    const template = SPREAD_TEMPLATES[1]; // default balanced duo
    const newSpread: PageSpread = {
      id: `spread-custom-${Date.now()}`,
      spreadNumber: spreads.length + 1,
      title: `Spread ${spreads.length + 1}`,
      templateId: template.id,
      background: '#FFFFFF',
      slots: template.slots.map((s, idx) => ({
        ...s,
        id: `slot-new-${Date.now()}-${idx + 1}`,
        assignedImageId: null,
        cropPanX: 0,
        cropPanY: 0,
        zoom: 1.0,
      })),
    };

    setSpreads((prev) => [...prev, newSpread]);
    setCurrentSpreadIndex(spreads.length);
  };

  // Upload custom photos
  const handleUploadPhotos = (newPhotos: ImageAsset[]) => {
    setPhotos((prev) => [...newPhotos, ...prev]);
  };

  // Execute AI auto-solver and apply spreads
  const handleApplySolvedSpreads = (newSpreads: PageSpread[]) => {
    setSpreads(newSpreads);
    setCurrentSpreadIndex(0);
    setCurrentView('canvas');
  };

  const handleTriggerAutoSolver = () => {
    const result = solveAlbumSpreads(photos, SPREAD_TEMPLATES);
    handleApplySolvedSpreads(result.spreads);
  };

  const handleToggleGuide = (key: keyof GuideVisibility) => {
    setGuides((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // AI Studio Handlers
  const handleOpenAiStudio = (photoToEdit?: ImageAsset | null, targetSlotId?: string | null) => {
    setAiStudioPhotoToEdit(photoToEdit || null);
    setAiStudioTargetSlotId(targetSlotId || null);
    setIsAiStudioOpen(true);
  };

  const handleAddGeneratedPhoto = (newAsset: ImageAsset, placeInSlotId?: string) => {
    setPhotos((prev) => [newAsset, ...prev]);
    if (placeInSlotId) {
      handleAssignImageToSlot(placeInSlotId, newAsset.id);
    }
  };

  const handleUpdateEditedPhoto = (updatedAsset: ImageAsset, targetSlotId?: string) => {
    setPhotos((prev) => [updatedAsset, ...prev]);
    if (targetSlotId) {
      handleAssignImageToSlot(targetSlotId, updatedAsset.id);
    } else if (aiStudioPhotoToEdit) {
      // If the edited photo was assigned to any slots, update them
      setSpreads((prev) =>
        prev.map((spread) => ({
          ...spread,
          slots: spread.slots.map((slot) =>
            slot.assignedImageId === aiStudioPhotoToEdit.id
              ? { ...slot, assignedImageId: updatedAsset.id }
              : slot
          ),
        }))
      );
    }
  };

  return (
    <div id="foliocraft-app-root" className="flex flex-col h-screen w-screen overflow-hidden bg-stone-900 text-stone-100 font-sans">
      {/* Primary Top Header */}
      <Header
        currentView={currentView}
        onChangeView={setCurrentView}
        spreads={spreads}
        currentSpreadIndex={currentSpreadIndex}
        onSelectSpreadIndex={setCurrentSpreadIndex}
        onAddSpread={handleAddSpread}
        guides={guides}
        onToggleGuide={handleToggleGuide}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        preflightIssueCount={preflightAudit.issues.length}
        currentEventType={currentEventType}
        onChangeEventType={handleChangeEventType}
        onOpenAiStudio={() => handleOpenAiStudio(null, null)}
      />

      {/* Main App Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        {currentView === 'canvas' && (
          <>
            {/* Left Photo Pool Sidebar */}
            <PhotoPoolSidebar
              photos={photos}
              assignedImageIds={assignedImageIds}
              onUploadPhotos={handleUploadPhotos}
              onSelectPhotoPreview={(p) => setInspectingPhoto(p)}
              onTriggerAutoSolver={handleTriggerAutoSolver}
              onOpenAiStudio={(p) => handleOpenAiStudio(p || null, null)}
              currentEventType={currentEventType}
            />

            {/* Center Spread Canvas Workspace */}
            <div className="flex-1 h-full overflow-hidden flex flex-col">
              <SpreadCanvasEditor
                currentSpread={currentSpread}
                imageMap={imageMap}
                printDimensions={printDimensions}
                guides={guides}
                templates={SPREAD_TEMPLATES}
                onUpdateSlot={handleUpdateSlot}
                onSwapSlots={handleSwapSlots}
                onAssignImageToSlot={handleAssignImageToSlot}
                onChangeTemplate={handleChangeTemplate}
                onSelectPhotoToPreview={(img) => setInspectingPhoto(img)}
                onOpenAiStudioForSlot={(slotId, img) => handleOpenAiStudio(img || null, slotId)}
              />
            </div>
          </>
        )}

        {currentView === 'solver' && (
          <SolverInspector
            photos={photos}
            templates={SPREAD_TEMPLATES}
            onApplySpreads={handleApplySolvedSpreads}
          />
        )}

        {currentView === 'architecture' && <ArchitectureHub />}
      </main>

      {/* AI Photo Studio Modal (Gemini 3.1 Flash Image preview) */}
      <AiImageStudioModal
        isOpen={isAiStudioOpen}
        onClose={() => setIsAiStudioOpen(false)}
        currentEventType={currentEventType}
        onAddGeneratedPhoto={handleAddGeneratedPhoto}
        onUpdateEditedPhoto={handleUpdateEditedPhoto}
        targetSlotId={aiStudioTargetSlotId}
        photoToEdit={aiStudioPhotoToEdit}
      />

      {/* 300 DPI CMYK Print Exporter Modal */}
      <PrintExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        spreads={spreads}
        imageMap={imageMap}
        printDimensions={printDimensions}
      />

      {/* Photo Saliency & Metadata Detail Modal */}
      {inspectingPhoto && (
        <div
          id="photo-inspect-modal-backdrop"
          className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setInspectingPhoto(null)}
        >
          <div
            id="photo-inspect-modal-card"
            className="bg-stone-900 border border-stone-800 rounded-2xl max-w-xl w-full text-stone-200 overflow-hidden shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-sm text-stone-100">{inspectingPhoto.title}</h3>
              </div>
              <button
                onClick={() => setInspectingPhoto(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[3/2] bg-stone-950 rounded-lg overflow-hidden border border-stone-800">
              <img
                src={inspectingPhoto.url}
                alt={inspectingPhoto.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
              {inspectingPhoto.saliency?.map((sal, idx) => (
                <div
                  key={idx}
                  className="absolute border-2 border-amber-400 bg-amber-400/20 rounded-xs"
                  style={{
                    left: `${sal.x * 100}%`,
                    top: `${sal.y * 100}%`,
                    width: `${sal.width * 100}%`,
                    height: `${sal.height * 100}%`,
                  }}
                >
                  <span className="absolute -top-4 left-0 text-[9px] font-mono uppercase bg-stone-950 px-1 py-0.2 rounded text-amber-300">
                    {sal.label || 'subject'}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded bg-stone-950 border border-stone-800">
                <span className="text-stone-500 text-[10px] block">Dimensions</span>
                <span className="font-mono text-stone-200 font-medium">
                  {inspectingPhoto.width} &times; {inspectingPhoto.height} px
                </span>
              </div>
              <div className="p-2.5 rounded bg-stone-950 border border-stone-800">
                <span className="text-stone-500 text-[10px] block">Orientation</span>
                <span className="font-mono text-amber-400 font-medium capitalize">
                  {inspectingPhoto.orientation}
                </span>
              </div>
              <div className="p-2.5 rounded bg-stone-950 border border-stone-800">
                <span className="text-stone-500 text-[10px] block">Aesthetic Score</span>
                <span className="font-mono text-emerald-400 font-medium">
                  {inspectingPhoto.qualityScore}/100
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>Timestamp: {new Date(inspectingPhoto.timestamp).toLocaleString()}</span>
              </div>

              <button
                onClick={() => {
                  const photo = inspectingPhoto;
                  setInspectingPhoto(null);
                  handleOpenAiStudio(photo, null);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Edit with AI</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
