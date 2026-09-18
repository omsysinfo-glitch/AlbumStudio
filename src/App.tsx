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
} from './types';
import {
  DEFAULT_PRINT_DIMENSIONS,
  SPREAD_TEMPLATES,
  SAMPLE_EVENT_PHOTOS,
  INITIAL_SPREADS,
} from './data/mockAlbumData';
import { solveAlbumSpreads } from './utils/layoutSolver';
import { runAlbumPreflightAudit } from './utils/printPreflight';
import { Header } from './components/Header';
import { SpreadCanvasEditor } from './components/SpreadCanvasEditor';
import { PhotoPoolSidebar } from './components/PhotoPoolSidebar';
import { ArchitectureHub } from './components/ArchitectureHub';
import { SolverInspector } from './components/SolverInspector';
import { PrintExportModal } from './components/PrintExportModal';
import { X, User, Calendar, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'canvas' | 'solver' | 'architecture'>('canvas');
  const [photos, setPhotos] = useState<ImageAsset[]>(SAMPLE_EVENT_PHOTOS);
  const [spreads, setSpreads] = useState<PageSpread[]>(INITIAL_SPREADS);
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [inspectingPhoto, setInspectingPhoto] = useState<ImageAsset | null>(null);

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

  // Assign photo to slot directly from sidebar pool or drop
  const handleAssignImageToSlot = (slotId: string, imageId: string) => {
    setSpreads((prev) =>
      prev.map((spread, sIdx) => {
        if (sIdx !== currentSpreadIndex) return spread;
        return {
          ...spread,
          slots: spread.slots.map((slot) =>
            slot.id === slotId
              ? {
                  ...slot,
                  assignedImageId: imageId,
                  cropPanX: 0,
                  cropPanY: 0,
                  zoom: 1.0,
                }
              : slot
          ),
        };
      })
    );
  };

  // Change Template for the current spread
  const handleChangeTemplate = (templateId: string) => {
    const template = SPREAD_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    setSpreads((prev) =>
      prev.map((spread, sIdx) => {
        if (sIdx !== currentSpreadIndex) return spread;

        // Preserve currently assigned photos as much as possible
        const existingImageIds = spread.slots
          .map((s) => s.assignedImageId)
          .filter(Boolean) as string[];

        const newSlots: FrameSlot[] = template.slots.map((slotTpl, idx) => ({
          ...slotTpl,
          assignedImageId: existingImageIds[idx] || null,
          cropPanX: 0,
          cropPanY: 0,
          zoom: 1.0,
        }));

        return {
          ...spread,
          templateId,
          slots: newSlots,
        };
      })
    );
  };

  // Add a new blank spread
  const handleAddSpread = () => {
    const newSpreadNumber = spreads.length + 1;
    const defaultTemplate = SPREAD_TEMPLATES[1]; // 2-photo split template
    const newSpread: PageSpread = {
      id: `spread-${Date.now()}`,
      spreadNumber: newSpreadNumber,
      title: `Double-Page Spread #${newSpreadNumber}`,
      templateId: defaultTemplate.id,
      background: '#FFFFFF',
      slots: defaultTemplate.slots.map((s) => ({
        ...s,
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
                className="p-1 rounded text-stone-400 hover:text-stone-200"
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

            <div className="text-[11px] text-stone-400 flex items-center gap-1.5 pt-1">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span>Timestamp: {new Date(inspectingPhoto.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
