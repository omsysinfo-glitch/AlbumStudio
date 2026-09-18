import React, { useState } from 'react';
import { ImageAsset, Orientation } from '../types';
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
} from 'lucide-react';

interface PhotoPoolSidebarProps {
  photos: ImageAsset[];
  assignedImageIds: Set<string>;
  onUploadPhotos: (newPhotos: ImageAsset[]) => void;
  onSelectPhotoPreview: (photo: ImageAsset) => void;
  onTriggerAutoSolver: () => void;
}

export const PhotoPoolSidebar: React.FC<PhotoPoolSidebarProps> = ({
  photos,
  assignedImageIds,
  onUploadPhotos,
  onSelectPhotoPreview,
  onTriggerAutoSolver,
}) => {
  const [filter, setFilter] = useState<'all' | 'unassigned' | 'placed' | 'portrait' | 'landscape'>('all');
  const [isDragOverUpload, setIsDragOverUpload] = useState(false);

  const filteredPhotos = photos.filter((p) => {
    const isAssigned = assignedImageIds.has(p.id);
    if (filter === 'unassigned') return !isAssigned;
    if (filter === 'placed') return isAssigned;
    if (filter === 'portrait') return p.orientation === 'portrait';
    if (filter === 'landscape') return p.orientation === 'landscape';
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
        tags: ['uploaded', 'event'],
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
      {/* Sidebar Header & Solver CTA */}
      <div className="p-4 border-b border-stone-800 bg-stone-950">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
              Event Photo Batch
            </h2>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 font-mono">
            {assignedImageIds.size}/{photos.length} Placed
          </span>
        </div>

        {/* 1-Click AI Auto-Solver Button */}
        <button
          id="btn-sidebar-auto-solve"
          onClick={onTriggerAutoSolver}
          className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-stone-950" />
          <span>Auto-Curate &amp; Solve Spreads</span>
        </button>

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
          className={`mt-3 flex items-center justify-center gap-2 py-2 px-3 border border-dashed rounded-lg text-xs cursor-pointer transition-colors ${
            isDragOverUpload
              ? 'border-amber-400 bg-amber-500/10 text-amber-300'
              : 'border-stone-800 hover:border-stone-700 bg-stone-900/60 text-stone-400 hover:text-stone-300'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Event Photos (or Drag files)</span>
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

      {/* Filter Tabs */}
      <div className="px-4 py-2 border-b border-stone-800 bg-stone-950 flex items-center gap-1 overflow-x-auto text-[11px]">
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
            className={`px-2 py-1 rounded whitespace-nowrap transition-colors ${
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
          const hasFace = photo.saliency.some((s) => s.label === 'face');

          return (
            <div
              key={photo.id}
              id={`photo-card-${photo.id}`}
              draggable
              onDragStart={(e) => handleDragStart(e, photo)}
              onClick={() => onSelectPhotoPreview(photo)}
              className={`group relative rounded-md overflow-hidden border transition-all cursor-grab active:cursor-grabbing ${
                isPlaced
                  ? 'border-stone-800/80 opacity-60 hover:opacity-100'
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
                <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
                  {isPlaced && (
                    <span className="bg-emerald-950/90 text-emerald-300 text-[9px] px-1 py-0.5 rounded font-mono flex items-center gap-0.5 shadow-xs">
                      <CheckCircle className="w-2.5 h-2.5" /> Placed
                    </span>
                  )}
                  {hasFace && (
                    <span className="bg-amber-950/80 text-amber-300 text-[9px] px-1 py-0.5 rounded font-mono flex items-center gap-0.5">
                      <User className="w-2.5 h-2.5" /> Face
                    </span>
                  )}
                </div>

                {/* Orientation & Quality Tag */}
                <div className="absolute bottom-1 right-1 bg-stone-950/80 text-stone-400 text-[9px] px-1 py-0.2 rounded font-mono">
                  {photo.orientation === 'portrait' ? 'PORT' : 'LAND'}
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="p-1.5 bg-stone-900/90 text-left">
                <div className="text-[11px] font-medium text-stone-300 truncate" title={photo.title}>
                  {photo.title}
                </div>
                <div className="text-[9px] text-stone-500 font-mono flex items-center justify-between mt-0.5">
                  <span>{new Date(photo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-amber-400/90">{photo.qualityScore}% Q</span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredPhotos.length === 0 && (
          <div className="col-span-2 py-8 text-center text-xs text-stone-500">
            No photos match current filter.
          </div>
        )}
      </div>
    </div>
  );
};
