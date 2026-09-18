import React, { useState, useMemo } from 'react';
import {
  KarizmaProject,
  AlbumSheet,
  AlbumObject,
  PhotoObject,
  TextObject,
  KarizmaPhoto,
  GuideVisibility,
  KarizmaTemplate,
  DesignStyle,
  SheetRecommendation,
} from './types/karizma';
import { SAMPLE_PROJECT, SAMPLE_PHOTOS, INITIAL_ALBUM_SHEETS } from './data/sampleKarizmaData';
import { KARIZMA_TEMPLATES } from './data/karizmaTemplates';
import { KARIZMA_DESIGN_STYLES } from './data/karizmaStyles';
import { generateAiAlbumSheets } from './utils/aiAlbumGenerator';
import {
  analyzeSheetForImprovements,
  applyRecommendationToSheet,
} from './utils/aiImproveEngine';
import { KarizmaHeader } from './components/KarizmaHeader';
import { ToolsSidebar } from './components/ToolsSidebar';
import { KarizmaCanvasEditor } from './components/KarizmaCanvasEditor';
import { PropertiesAndLayersPanel } from './components/PropertiesAndLayersPanel';
import { BottomSheetsFilmstrip } from './components/BottomSheetsFilmstrip';
import { ProjectWizardModal } from './components/ProjectWizardModal';
import { CoverDesignerModal } from './components/CoverDesignerModal';
import { ClientPreviewModal } from './components/ClientPreviewModal';
import { KarizmaExportModal } from './components/KarizmaExportModal';
import { AiReplacePhotoModal } from './components/AiReplacePhotoModal';
import { AiImproveSheetModal } from './components/AiImproveSheetModal';
import { PhotoDetailModal } from './components/PhotoDetailModal';

export default function App() {
  // 1. Core State: Project, Sheets, Photos
  const [project, setProject] = useState<KarizmaProject>(SAMPLE_PROJECT);
  const [photos, setPhotos] = useState<KarizmaPhoto[]>(SAMPLE_PHOTOS);
  const [sheets, setSheets] = useState<AlbumSheet[]>(INITIAL_ALBUM_SHEETS);
  const [activeSheetId, setActiveSheetId] = useState<string>(
    INITIAL_ALBUM_SHEETS[0]?.id || 'sheet-1'
  );

  // 2. Selection State
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // 3. Canvas Guides State
  const [guides, setGuides] = useState<GuideVisibility>({
    bleed: true,
    trim: true,
    safeZone: true,
    gutter: true,
    saliencyFocal: false,
    dimensionsOverlay: false,
  });

  const handleToggleGuide = (key: keyof GuideVisibility) => {
    setGuides((prev: GuideVisibility) => ({ ...prev, [key]: !prev[key] }));
  };

  // 4. Modals State
  const [isProjectWizardOpen, setIsProjectWizardOpen] = useState(false);
  const [isCoverDesignerOpen, setIsCoverDesignerOpen] = useState(false);
  const [isClientPreviewOpen, setIsClientPreviewOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAiImproveOpen, setIsAiImproveOpen] = useState(false);
  const [isAiReplaceOpen, setIsAiReplaceOpen] = useState(false);
  const [aiReplaceTargetSlot, setAiReplaceTargetSlot] = useState<PhotoObject | null>(null);
  const [inspectedPhoto, setInspectedPhoto] = useState<KarizmaPhoto | null>(null);

  // Photos Map for O(1) Lookups
  const photosMap = useMemo(() => {
    const map = new Map<string, KarizmaPhoto>();
    photos.forEach((p) => map.set(p.id, p));
    return map;
  }, [photos]);

  // Current Active Sheet
  const currentSheet = useMemo(() => {
    return sheets.find((s) => s.id === activeSheetId) || sheets[0];
  }, [sheets, activeSheetId]);

  // Active Sheet AI Recommendations
  const currentSheetRecs = useMemo(() => {
    if (!currentSheet) return [];
    return analyzeSheetForImprovements(currentSheet, photosMap);
  }, [currentSheet, photosMap]);

  // --------------------------------------------------------------------------
  // SHEET & OBJECT MUTATION HANDLERS
  // --------------------------------------------------------------------------

  const handleUpdateObject = (objectId: string, updates: Partial<AlbumObject>) => {
    setSheets((prevSheets) =>
      prevSheets.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        return {
          ...sheet,
          objects: sheet.objects.map((obj) =>
            obj.id === objectId ? ({ ...obj, ...updates } as AlbumObject) : obj
          ),
        };
      })
    );
  };

  const handleDuplicateObject = (objectId: string) => {
    setSheets((prevSheets) =>
      prevSheets.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        const target = sheet.objects.find((o) => o.id === objectId);
        if (!target) return sheet;

        const duplicated: AlbumObject = {
          ...target,
          id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: `${target.name} Copy`,
          x: Math.min(0.8, target.x + 0.03),
          y: Math.min(0.8, target.y + 0.03),
          zIndex: sheet.objects.length + 1,
        };

        return {
          ...sheet,
          objects: [...sheet.objects, duplicated],
        };
      })
    );
  };

  const handleDeleteObject = (objectId: string) => {
    setSheets((prevSheets) =>
      prevSheets.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        return {
          ...sheet,
          objects: sheet.objects.filter((o) => o.id !== objectId),
        };
      })
    );
    if (selectedObjectId === objectId) setSelectedObjectId(null);
  };

  const handleReorderObject = (objectId: string, direction: 'up' | 'down') => {
    setSheets((prevSheets) =>
      prevSheets.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        const objIndex = sheet.objects.findIndex((o) => o.id === objectId);
        if (objIndex === -1) return sheet;

        const newObjects = [...sheet.objects];
        const targetIndex = direction === 'up' ? objIndex + 1 : objIndex - 1;
        if (targetIndex < 0 || targetIndex >= newObjects.length) return sheet;

        const temp = newObjects[objIndex];
        newObjects[objIndex] = newObjects[targetIndex];
        newObjects[targetIndex] = temp;

        // Reassign zIndexes
        newObjects.forEach((o, i) => {
          o.zIndex = i + 1;
        });

        return { ...sheet, objects: newObjects };
      })
    );
  };

  const handleAddObjectToSheet = (obj: Partial<AlbumObject>) => {
    setSheets((prevSheets) =>
      prevSheets.map((sheet) => {
        if (sheet.id !== activeSheetId) return sheet;
        const newObj: AlbumObject = {
          id: obj.id || `obj-${Date.now()}`,
          type: obj.type || 'text',
          name: obj.name || 'New Element',
          x: obj.x ?? 0.4,
          y: obj.y ?? 0.4,
          width: obj.width ?? 0.2,
          height: obj.height ?? 0.2,
          rotation: 0,
          opacity: 1,
          zIndex: sheet.objects.length + 1,
          isLocked: false,
          ...obj,
        } as AlbumObject;

        return {
          ...sheet,
          objects: [...sheet.objects, newObj],
        };
      })
    );
    if (obj.id) setSelectedObjectId(obj.id);
  };

  // --------------------------------------------------------------------------
  // AI TOOLS & ACTIONS
  // --------------------------------------------------------------------------

  const handleOpenAiReplace = (slot: PhotoObject) => {
    setAiReplaceTargetSlot(slot);
    setIsAiReplaceOpen(true);
  };

  const handleSelectReplacementPhoto = (newPhotoId: string) => {
    if (aiReplaceTargetSlot) {
      handleUpdateObject(aiReplaceTargetSlot.id, {
        photoId: newPhotoId,
      });
    }
  };

  const handleSmartFaceCrop = (slot: PhotoObject) => {
    if (!slot.photoId) return;
    const photo = photosMap.get(slot.photoId);
    if (!photo || photo.analysis.faceCount === 0) return;

    const primaryFace = photo.analysis.faces[0];
    // Pan toward face safe center
    const targetPanY = Math.round((0.5 - (primaryFace.box.y + primaryFace.box.height / 2)) * 50);
    handleUpdateObject(slot.id, {
      cropPanY: targetPanY,
      zoom: 1.1,
    });
  };

  const handleApplySingleRecommendation = (recId: string) => {
    const updated = applyRecommendationToSheet(currentSheet, recId, photos);
    setSheets((prev) => prev.map((s) => (s.id === currentSheet.id ? updated : s)));
  };

  const handleApplyAllRecommendations = () => {
    let updated = currentSheet;
    currentSheetRecs.forEach((r) => {
      if (!r.applied) {
        updated = applyRecommendationToSheet(updated, r.id, photos);
      }
    });
    setSheets((prev) => prev.map((s) => (s.id === currentSheet.id ? updated : s)));
    setIsAiImproveOpen(false);
  };

  const handleTriggerAiAlbumGenerate = () => {
    const generated = generateAiAlbumSheets(photos, project.albumSize, project.sheetCount);
    setSheets(generated);
    if (generated.length > 0) setActiveSheetId(generated[0].id);
  };

  // --------------------------------------------------------------------------
  // TEMPLATES & DESIGN STYLES APPLICATION
  // --------------------------------------------------------------------------

  const handleApplyTemplate = (template: KarizmaTemplate) => {
    // Convert template slots to AlbumObjects, retaining any existing photos where possible
    const existingPhotoIds = currentSheet.objects
      .filter((o): o is PhotoObject => o.type === 'photo')
      .map((p) => p.photoId)
      .filter(Boolean) as string[];

    let photoIdx = 0;
    const newObjects: AlbumObject[] = template.photoSlots.map((slot, i) => {
      const assignedId =
        existingPhotoIds[photoIdx++] ||
        photos[i % photos.length]?.id ||
        null;

      return {
        id: `slot-${Date.now()}-${i}`,
        type: 'photo',
        name: `Photo Slot ${i + 1}`,
        x: slot.x,
        y: slot.y,
        width: slot.width,
        height: slot.height,
        rotation: 0,
        opacity: 1,
        zIndex: i + 1,
        photoId: assignedId,
        cropPanX: 0,
        cropPanY: 0,
        zoom: 1.0,
        fitMode: 'cover',
        borderWidth: 3,
        borderColor: '#D4AF37',
        borderStyle: 'double',
        borderRadius: 2,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowBlur: 12,
        shadowColor: 'rgba(0,0,0,0.5)',
      };
    });

    // Add template decorative and text elements
    if (template.textSlots) {
      template.textSlots.forEach((t, i) => {
        newObjects.push({
          id: `txt-${Date.now()}-${i}`,
          type: 'text',
          name: 'Ceremony Title',
          x: t.x,
          y: t.y,
          width: t.width,
          height: t.height,
          rotation: 0,
          opacity: 1,
          zIndex: 10 + i,
          text: t.defaultText,
          fontFamily: t.fontFamily,
          fontSize: t.fontSize,
          fontWeight: 'bold',
          fontStyle: 'normal',
          color: '#D4AF37',
          letterSpacing: 2,
          lineHeight: 1.2,
          textAlign: t.textAlign,
        });
      });
    }

    setSheets((prev) =>
      prev.map((s) => {
        if (s.id !== activeSheetId) return s;
        return {
          ...s,
          title: template.name,
          templateId: template.id,
          background: template.background,
          objects: newObjects,
        };
      })
    );
  };

  const handleApplyStyle = (style: DesignStyle) => {
    setSheets((prev) =>
      prev.map((s) => {
        const updatedObjects = s.objects.map((obj) => {
          if (obj.type === 'photo') {
            return {
              ...obj,
              borderColor: style.borderStyle.color,
              borderWidth: style.borderStyle.width,
              borderStyle: style.borderStyle.style as any,
              borderRadius: style.borderStyle.radius,
            };
          }
          if (obj.type === 'text') {
            return {
              ...obj,
              color: style.colors.secondary,
              fontFamily: style.typography.headingFont,
            };
          }
          return obj;
        });

        return {
          ...s,
          background: style.defaultBackground,
          objects: updatedObjects,
        };
      })
    );
  };

  // --------------------------------------------------------------------------
  // SPREAD / FILMSTRIP MANAGEMENT
  // --------------------------------------------------------------------------

  const handleAddSheet = () => {
    const newSheetNum = sheets.length + 1;
    const newSheet: AlbumSheet = {
      id: `sheet-${Date.now()}`,
      sheetNumber: newSheetNum,
      title: `Spread ${String(newSheetNum).padStart(2, '0')} • Wedding Ceremony`,
      ceremonyTag: 'Wedding',
      templateId: 'tpl-royal-darbar-01',
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #1A070B 0%, #290A13 100%)',
      },
      objects: [
        {
          id: `slot-init-1`,
          type: 'photo',
          name: 'Hero Showcase Portrait',
          x: 0.08,
          y: 0.1,
          width: 0.38,
          height: 0.8,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          photoId: photos[newSheetNum % photos.length]?.id || null,
          cropPanX: 0,
          cropPanY: 0,
          zoom: 1.0,
          fitMode: 'cover',
          borderWidth: 3,
          borderColor: '#D4AF37',
          borderStyle: 'double',
          borderRadius: 4,
          shadowOffsetX: 0,
          shadowOffsetY: 6,
          shadowBlur: 16,
          shadowColor: 'rgba(0,0,0,0.6)',
        },
      ],
      recommendations: [],
      comments: [],
    };

    setSheets((prev) => [...prev, newSheet]);
    setActiveSheetId(newSheet.id);
  };

  const handleDuplicateSheet = (sheetId: string) => {
    const target = sheets.find((s) => s.id === sheetId);
    if (!target) return;

    const dup: AlbumSheet = {
      ...target,
      id: `sheet-${Date.now()}`,
      sheetNumber: sheets.length + 1,
      title: `${target.title} (Copy)`,
      objects: target.objects.map((o) => ({
        ...o,
        id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      })),
    };

    setSheets((prev) => [...prev, dup]);
    setActiveSheetId(dup.id);
  };

  const handleDeleteSheet = (sheetId: string) => {
    if (sheets.length <= 1) return;
    const remaining = sheets.filter((s) => s.id !== sheetId);
    // Renumber sheets
    const renumbered = remaining.map((s, idx) => ({ ...s, sheetNumber: idx + 1 }));
    setSheets(renumbered);
    if (activeSheetId === sheetId) {
      setActiveSheetId(renumbered[0]?.id || '');
    }
  };

  const handleMoveSheet = (sheetId: string, direction: 'left' | 'right') => {
    const idx = sheets.findIndex((s) => s.id === sheetId);
    if (idx === -1) return;

    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sheets.length) return;

    const newSheets = [...sheets];
    const temp = newSheets[idx];
    newSheets[idx] = newSheets[targetIdx];
    newSheets[targetIdx] = temp;

    // Renumber
    newSheets.forEach((s, i) => {
      s.sheetNumber = i + 1;
    });

    setSheets(newSheets);
  };

  // Client Comments & Approval
  const handleAddComment = (sheetId: string, text: string) => {
    setSheets((prev) =>
      prev.map((s) => {
        if (s.id !== sheetId) return s;
        const newComment = {
          id: `comment-${Date.now()}`,
          sheetId,
          authorName: 'Client (Priya Sharma)',
          authorRole: 'client' as const,
          timestamp: new Date().toISOString(),
          commentText: text,
          status: 'open' as const,
        };
        return {
          ...s,
          comments: [...(s.comments || []), newComment],
        };
      })
    );
  };

  const handleApproveAlbum = () => {
    setProject((prev) => ({ ...prev, status: 'approved' }));
    setIsClientPreviewOpen(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 font-sans text-zinc-100">
      {/* 1. TOP HEADER */}
      <KarizmaHeader
        project={project}
        currentSheet={currentSheet}
        sheetCount={sheets.length}
        activeView="editor"
        onChangeView={(view) => {
          if (view === 'cover') setIsCoverDesignerOpen(true);
          if (view === 'preview') setIsClientPreviewOpen(true);
        }}
        onOpenProjectWizard={() => setIsProjectWizardOpen(true)}
        onOpenCoverDesigner={() => setIsCoverDesignerOpen(true)}
        onOpenClientPreview={() => setIsClientPreviewOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenAiImprove={() => setIsAiImproveOpen(true)}
        onAutoGenerateAlbum={handleTriggerAiAlbumGenerate}
      />

      {/* 2. MAIN 3-COLUMN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Tools, Photos, Templates, Motifs */}
        <ToolsSidebar
          photos={photos}
          onUploadPhotos={(newPhotos) => setPhotos((prev) => [...newPhotos, ...prev])}
          onApplyTemplate={handleApplyTemplate}
          onApplyStyle={handleApplyStyle}
          onAddObjectToSheet={handleAddObjectToSheet}
          onSelectPhotoToInspect={(photo) => setInspectedPhoto(photo)}
          onTriggerAiAlbumGenerate={handleTriggerAiAlbumGenerate}
        />

        {/* Center: 12x36 Spread Canvas Editor with Interactive Guides & Transform Handles */}
        <KarizmaCanvasEditor
          currentSheet={currentSheet}
          photosMap={photosMap}
          selectedObjectId={selectedObjectId}
          onSelectObject={setSelectedObjectId}
          onUpdateObject={handleUpdateObject}
          onDuplicateObject={handleDuplicateObject}
          onDeleteObject={handleDeleteObject}
          onReorderObject={handleReorderObject}
          onOpenAiReplace={handleOpenAiReplace}
          guides={guides}
          onToggleGuide={handleToggleGuide}
        />

        {/* Right: Photoshop-like Properties & Layers Inspector */}
        <PropertiesAndLayersPanel
          currentSheet={currentSheet}
          selectedObjectId={selectedObjectId}
          photosMap={photosMap}
          onSelectObject={setSelectedObjectId}
          onUpdateObject={handleUpdateObject}
          onDuplicateObject={handleDuplicateObject}
          onDeleteObject={handleDeleteObject}
          onReorderObject={handleReorderObject}
          onOpenAiReplace={handleOpenAiReplace}
          onSmartFaceCrop={handleSmartFaceCrop}
        />
      </div>

      {/* 3. BOTTOM SHEETS FILMSTRIP */}
      <BottomSheetsFilmstrip
        sheets={sheets}
        activeSheetId={activeSheetId}
        photosMap={photosMap}
        onSelectSheet={setActiveSheetId}
        onAddSheet={handleAddSheet}
        onDuplicateSheet={handleDuplicateSheet}
        onDeleteSheet={handleDeleteSheet}
        onMoveSheet={handleMoveSheet}
      />

      {/* 4. MODALS & ASSISTANTS */}
      {/* Project Creation Wizard */}
      <ProjectWizardModal
        isOpen={isProjectWizardOpen}
        onClose={() => setIsProjectWizardOpen(false)}
        onCreateProject={(newProj) => {
          setProject(newProj as KarizmaProject);
          handleTriggerAiAlbumGenerate();
        }}
      />

      {/* Deluxe Cover Designer (Front • Spine • Back hot-foil velvet) */}
      <CoverDesignerModal
        isOpen={isCoverDesignerOpen}
        onClose={() => setIsCoverDesignerOpen(false)}
        project={project}
        photos={photos}
        onUpdateCoverConfig={(coverConfig) =>
          setProject((prev) => ({ ...prev, coverConfig }))
        }
      />

      {/* Client Preview & Approval Mode (Flipbook & Comments) */}
      <ClientPreviewModal
        isOpen={isClientPreviewOpen}
        onClose={() => setIsClientPreviewOpen(false)}
        project={project}
        sheets={sheets}
        photosMap={photosMap}
        onAddComment={handleAddComment}
        onApproveAlbum={handleApproveAlbum}
      />

      {/* High-Resolution Export Engine (300 DPI / jsPDF Multi-page Spread) */}
      <KarizmaExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        sheets={sheets}
        photosMap={photosMap}
      />

      {/* AI Photo Replacement Assistant */}
      <AiReplacePhotoModal
        isOpen={isAiReplaceOpen}
        onClose={() => {
          setIsAiReplaceOpen(false);
          setAiReplaceTargetSlot(null);
        }}
        targetSlot={aiReplaceTargetSlot}
        currentPhoto={aiReplaceTargetSlot?.photoId ? photosMap.get(aiReplaceTargetSlot.photoId) || null : null}
        allPhotos={photos}
        onSelectReplacement={handleSelectReplacementPhoto}
      />

      {/* AI Sheet Doctor / Improvement Assistant */}
      <AiImproveSheetModal
        isOpen={isAiImproveOpen}
        onClose={() => setIsAiImproveOpen(false)}
        currentSheet={currentSheet}
        recommendations={currentSheetRecs}
        onApplyAll={handleApplyAllRecommendations}
        onApplySingle={handleApplySingleRecommendation}
      />

      {/* AI Photo Sensor & Quality Detail Modal */}
      <PhotoDetailModal
        isOpen={!!inspectedPhoto}
        onClose={() => setInspectedPhoto(null)}
        photo={inspectedPhoto}
      />
    </div>
  );
}
