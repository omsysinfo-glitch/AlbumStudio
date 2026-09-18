import React, { useState } from 'react';
import { ImageAsset, Orientation, EventType } from '../types';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Filter,
  Sparkles,
  Layers,
  Clock,
  User,
  Plus,
  Wand2,
  Tag,
  Palette,
} from 'lucide-react';

interface PhotoPoolSidebarProps {
  photos: ImageAsset[];
  assignedImageIds: Set<string>;
  onUploadPhotos: (newPhotos: ImageAsset[]) => void;
  onSelectPhotoPreview: (photo: ImageAsset) => void;
  onTriggerAutoSolver: () => void;
  onOpenAiStudio: (photoToEdit?: ImageAsset) => void;
  currentEventType?: EventType;
}

export const PhotoPoolSidebar: React.FC<PhotoPoolSidebarProps> = ({
  photos,
  assignedImageIds,
  onUploadPhotos,
  onSelectPhotoPreview,
  onTriggerAutoSolver,
  onOpenAiStudio,
  currentEventType = 'indian_wedding',
}) => {
  const [filter, setFilter] = useState<'all' | 'unassigned' | 'placed' | 'portrait' | 'landscape'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isDragOverUpload, setIsDragOverUpload] = useState(false);

  // Extract unique ceremony/event tags from current photos
  const availableTags = Array.from(
    new Set(photos.map((p) => p.eventTag).filter(Boolean) as string[])
  );

  const filteredPhotos = photos.filter((p) => {
    const isAssigned = assignedImageIds.has(p.id);
    if (filter === 'unassigned' && isAssigned) return false;
    if (filter === 'placed' && !isAssigned) return false;
    if (filter === 'portrait' && p.orientation !== 'portrait') return false;
    if (filter === 'landscape' && p.orientation !== 'landscape') return false;
    if (selectedTag && p.eventTag !== selectedTag) return false;
    return true;
  });

  const handleDragStart = (e: React.DragEvent, photo: ImageAsset) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'photo-pool-drop',
        imageId: photo.id,
      })
    );
    e.dataTransfer.setData('text/plain', photo.id);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newAssets: ImageAsset[] = [];
    Array.from(files).forEach((file, idx) => {
      const url = URL.createObjectURL(file);
      const isPortrait = idx % 2 === 0;
      newAssets.push({
        id: `custom-photo-${Date.now()}-${idx}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        filename: file.name,
        url,
        thumbUrl: url,
        width: isPortrait ? 4000 : 6000,
        height: isPortrait ? 6000 : 4000,
        aspectRatio: isPortrait ? 0.667 : 1.5,
        orientation: isPortrait ? 'portrait' : 'landscape',
        timestamp: new Date().toISOString(),
        qualityScore: 94,
        eventTag: 'Uploaded',
        saliency: [
          { x: 0.35, y: 0.25, width: 0.3, height: 0.3, label: 'subject' },
        ],
      });
    });

    onUploadPhotos(newAssets);
  };

  return (
    <div
      id="photo-pool-sidebar"
      className="w-80 h-full bg-stone-950 border-r border-stone-800 flex flex-col shrink-0 text-stone-200"
    >
      {/* Sidebar Header & Action CTAs */}
      <div className="p-3.5 border-b border-stone-800 bg-stone-950 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
              Event Photo Pool
            </h2>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 font-mono">
            {assignedImageIds.size}/{photos.length} Placed
          </span>
        </div>

        {/* Action Buttons: Auto-Solve & AI Studio */}
        <div className="grid grid-cols-2 gap-2">
          <button
            id="btn-sidebar-auto-solve"
            onClick={onTriggerAutoSolver}
            className="py-2 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-950" />
            <span>AI Auto-Solve</span>
          </button>

          <button
            id="btn-sidebar-ai-generate"
            onClick={() => onOpenAiStudio()}
            className="py-2 px-2.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Generate</span>
          </button>
        </div>

        {/* Drag & Drop Upload Dropzone */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOverUpload(true);
          }}
          onDragLeave={() => setIsDragOverUpload(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOverUpload(false);
            handleFileUpload(e.dataTransfer.files);
          }}
          className={`flex items-center justify-center gap-2 py-1.5 px-3 border border-dashed rounded-lg text-xs cursor-pointer transition-colors ${
            isDragOverUpload
              ? 'border-amber-400 bg-amber-500/10 text-amber-300'
              : 'border-stone-800 hover:border-stone-700 bg-stone-900/60 text-stone-400 hover:text-stone-300'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Photos (or drop files)</span>
          <input
            id="file-upload-input"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
        </label>
      </div>

      {/* Ceremony / Category Tag Filter (especially helpful for Indian weddings with multi-day events) */}
      {availableTags.length > 0 && (
        <div className="px-3 py-1.5 border-b border-stone-850 bg-stone-950/80 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
          <button
            onClick={() => setSelectedTag(null)}
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedTag === null
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200'
            }`}
          >
            All Rituals
          </button>
          {availableTags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(selectedTag === t ? null : t)}
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedTag === t
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-900 text-stone-400 hover:text-stone-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="px-3 py-1.5 border-b border-stone-800 bg-stone-950 flex items-center gap-1 overflow-x-auto text-[11px]">
        {(
          [
            { id: 'all', label: `All (${photos.length})` },
            { id: 'unassigned', label: `Unplaced (${photos.length - assignedImageIds.size})` },
            { id: 'placed', label: `Placed (${assignedImageIds.size})` },
            { id: 'portrait', label: 'Portraits' },
            { id: 'landscape', label: 'Landscapes' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
              filter === tab.id
                ? 'bg-stone-800 text-stone-100 font-medium'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Photo Grid List */}
      <div
        id="photos-draggable-grid"
        className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 content-start"
      >
        {filteredPhotos.map((photo) => {
          const isPlaced = assignedImageIds.has(photo.id);

          return (
            <div
              key={photo.id}
              id={`photo-card-${photo.id}`}
              draggable
              onDragStart={(e) => handleDragStart(e, photo)}
              onClick={() => onSelectPhotoPreview(photo)}
              className={`group relative rounded-lg overflow-hidden border transition-all cursor-grab active:cursor-grabbing ${
                isPlaced
                  ? 'border-stone-800/80 opacity-70 hover:opacity-100'
                  : 'border-stone-800 hover:border-amber-500/80 shadow-xs'
              }`}
            >
              {/* Image Preview Container */}
              <div className="aspect-[4/3] bg-stone-900 relative overflow-hidden">
                <img
                  src={photo.thumbUrl || photo.url}
                  alt={photo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Status Badges */}
                {isPlaced && (
                  <div className="absolute top-1 right-1 bg-amber-500 text-stone-950 text-[10px] font-bold px-1.5 py-0.2 rounded-md shadow-xs flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Placed</span>
                  </div>
                )}

                {/* AI Generated / AI Edited Badge */}
                {photo.isAiGenerated && (
                  <div className="absolute top-1 left-1 bg-stone-950/80 text-amber-300 text-[9px] font-mono px-1.5 py-0.2 rounded border border-amber-500/40">
                    AI Gen
                  </div>
                )}
                {photo.isAiEdited && (
                  <div className="absolute top-1 left-1 bg-stone-950/80 text-cyan-300 text-[9px] font-mono px-1.5 py-0.2 rounded border border-cyan-500/40">
                    AI Edit
                  </div>
                )}

                {/* Orientation & Quality Badge */}
                <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between text-[10px] text-white/90 drop-shadow-sm px-1 font-mono">
                  <span className="capitalize">{photo.orientation}</span>
                  <span className="text-amber-300">{photo.qualityScore}pt</span>
                </div>

                {/* Hover overlay with AI Edit quick button */}
                <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    title="Edit with AI"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAiStudio(photo);
                    }}
                    className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-[10px] flex items-center gap-1 shadow-md transition-transform active:scale-95"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>AI Edit</span>
                  </button>
                </div>
              </div>

              {/* Title & Tag */}
              <div className="p-1.5 bg-stone-950/90 text-left">
                <p className="text-[11px] font-medium text-stone-200 truncate" title={photo.title}>
                  {photo.title}
                </p>
                {photo.eventTag && (
                  <span className="text-[9px] text-stone-500 block truncate">
                    {photo.eventTag}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
