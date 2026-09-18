import React, { useState } from 'react';
import { ImageAsset } from '../types';
import { formatTime } from '../utils/photoFilters';
import {
  CheckCircle,
  Wand2,
  Star,
  Sparkles,
  ArrowUpDown,
  ArrowLeftRight,
  Square,
  GripVertical,
  Clock,
} from 'lucide-react';

interface DraggablePhotoCardProps {
  photo: ImageAsset;
  isPlaced: boolean;
  onDragStart: (e: React.DragEvent, photo: ImageAsset) => void;
  onSelectPreview: (photo: ImageAsset) => void;
  onOpenAiStudio: (photo?: ImageAsset) => void;
}

export const DraggablePhotoCard: React.FC<DraggablePhotoCardProps> = ({
  photo,
  isPlaced,
  onDragStart,
  onSelectPreview,
  onOpenAiStudio,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const timeFormatted = formatTime(photo.timestamp);
  const isHighQuality = photo.qualityScore >= 95;
  const isGoodQuality = photo.qualityScore >= 90;

  const handleDragStartInternal = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, photo);
  };

  const handleDragEndInternal = () => {
    setIsDragging(false);
  };

  return (
    <div
      id={`photo-card-${photo.id}`}
      draggable
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEndInternal}
      onClick={() => onSelectPreview(photo)}
      className={`group relative rounded-xl overflow-hidden border transition-all cursor-grab active:cursor-grabbing select-none ${
        isDragging
          ? 'opacity-40 scale-95 border-amber-400 ring-2 ring-amber-400/50'
          : isPlaced
          ? 'border-stone-800/80 bg-stone-900/60 opacity-80 hover:opacity-100 hover:border-stone-700'
          : 'border-stone-800 bg-stone-900 hover:border-amber-500/80 shadow-sm hover:shadow-amber-500/10'
      }`}
      title={`Drag onto any spread frame slot (${photo.orientation} • ${photo.qualityScore}pt • ${photo.title})`}
    >
      {/* Thumbnail Container */}
      <div className="aspect-[4/3] bg-stone-950 relative overflow-hidden">
        <img
          src={photo.thumbUrl || photo.url}
          alt={photo.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 pointer-events-none"
          loading="lazy"
        />

        {/* Top-Right: Placed Status Indicator */}
        {isPlaced ? (
          <div className="absolute top-1.5 right-1.5 bg-amber-500 text-stone-950 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Placed</span>
          </div>
        ) : (
          <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-950/80 text-amber-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
            <GripVertical className="w-2.5 h-2.5 text-amber-400" />
            <span>Drag</span>
          </div>
        )}

        {/* Top-Left: AI badges or Ceremony Tag */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 items-start">
          {photo.isAiGenerated && (
            <span className="bg-stone-950/90 text-amber-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-amber-500/40">
              AI Gen
            </span>
          )}
          {photo.isAiEdited && (
            <span className="bg-stone-950/90 text-cyan-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-cyan-500/40">
              AI Edit
            </span>
          )}
        </div>

        {/* Bottom Overlay Bar: Orientation, Quality Score & Timestamp */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/95 via-stone-950/60 to-transparent pt-4 pb-1 px-1.5 flex items-center justify-between text-[10px] text-white">
          {/* Orientation Pill */}
          <div className="flex items-center gap-0.5 text-stone-300 font-mono text-[9px] bg-stone-950/60 px-1 py-0.2 rounded border border-stone-800">
            {photo.orientation === 'portrait' ? (
              <>
                <ArrowUpDown className="w-2.5 h-2.5 text-amber-400" />
                <span>Port</span>
              </>
            ) : photo.orientation === 'landscape' ? (
              <>
                <ArrowLeftRight className="w-2.5 h-2.5 text-cyan-400" />
                <span>Land</span>
              </>
            ) : (
              <>
                <Square className="w-2.5 h-2.5 text-purple-400" />
                <span>Sq</span>
              </>
            )}
          </div>

          {/* Quality Badge */}
          <div
            className={`flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-mono font-bold ${
              isHighQuality
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : isGoodQuality
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-stone-800 text-stone-300'
            }`}
          >
            {isHighQuality ? (
              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
            ) : (
              <Star className="w-2.5 h-2.5 text-amber-400" />
            )}
            <span>{photo.qualityScore}pt</span>
          </div>
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
          <button
            title="Edit with AI"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAiStudio(photo);
            }}
            className="py-1 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-[10px] flex items-center gap-1 shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <Wand2 className="w-3 h-3" />
            <span>AI Edit</span>
          </button>
        </div>
      </div>

      {/* Card Footer info */}
      <div className="p-2 bg-stone-950/90 text-left space-y-0.5">
        <p className="text-[11px] font-medium text-stone-200 truncate" title={photo.title}>
          {photo.title}
        </p>
        <div className="flex items-center justify-between text-[9px] text-stone-400 font-mono">
          <span className="truncate max-w-[95px] text-stone-400">
            {photo.eventTag || photo.filename}
          </span>
          {timeFormatted && (
            <span className="text-stone-500 flex items-center gap-0.5 shrink-0">
              <Clock className="w-2.5 h-2.5 text-stone-500" />
              <span>{timeFormatted}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
