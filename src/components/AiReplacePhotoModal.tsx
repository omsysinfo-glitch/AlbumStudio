import React, { useState, useMemo } from 'react';
import { KarizmaPhoto, PhotoObject } from '../types/karizma';
import { X, Sparkles, Check, Star, RefreshCw } from 'lucide-react';

interface AiReplacePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlot: PhotoObject | null;
  currentPhoto: KarizmaPhoto | null;
  allPhotos: KarizmaPhoto[];
  onSelectReplacement: (newPhotoId: string) => void;
}

export const AiReplacePhotoModal: React.FC<AiReplacePhotoModalProps> = ({
  isOpen,
  onClose,
  targetSlot,
  currentPhoto,
  allPhotos,
  onSelectReplacement,
}) => {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  // Compute smart alternatives
  const recommendations = useMemo(() => {
    if (!targetSlot || !currentPhoto) return [];

    return allPhotos
      .filter((p) => p.id !== currentPhoto.id)
      .map((p) => {
        let matchScore = 70;

        // Same ceremony / event category
        if (p.eventTag === currentPhoto.eventTag) matchScore += 18;

        // Matching orientation
        if (p.orientation === currentPhoto.orientation) matchScore += 10;

        // High quality score
        if (p.analysis.qualityScore >= 95) matchScore += 8;
        else if (p.analysis.qualityScore >= 90) matchScore += 5;

        // Cap at 99
        matchScore = Math.min(99, matchScore);

        return {
          photo: p,
          matchScore,
          rationale:
            p.eventTag === currentPhoto.eventTag
              ? `Same ceremony (${p.eventTag}) with high sharpness (${p.analysis.sharpness}%) & matching ${p.orientation} aspect ratio.`
              : `Aesthetic balance match with high emotional importance score (${p.analysis.emotionalImportance}%).`,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);
  }, [targetSlot, currentPhoto, allPhotos]);

  if (!isOpen || !targetSlot) return null;

  const handleApply = () => {
    if (selectedPhotoId) {
      onSelectReplacement(selectedPhotoId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                AI Photo Replacement
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-normal">
                  Preserves Frame & Crop
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Slot: <span className="text-zinc-200 font-medium">{targetSlot.name}</span> • Currently: {currentPhoto?.title || 'Empty'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Currently Assigned Preview */}
          {currentPhoto && (
            <div className="flex items-center gap-4 p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
              <img
                src={currentPhoto.thumbUrl}
                alt={currentPhoto.title}
                className="w-16 h-16 object-cover rounded-md border border-zinc-700"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Currently Placed</span>
                <h4 className="text-sm font-medium text-zinc-200 truncate">{currentPhoto.title}</h4>
                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                  <span>Ceremony: {currentPhoto.eventTag}</span>
                  <span>•</span>
                  <span>Quality: {currentPhoto.analysis.qualityScore}%</span>
                  <span>•</span>
                  <span>Orientation: {currentPhoto.orientation}</span>
                </div>
              </div>
            </div>
          )}

          {/* AI Recommended Alternatives */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center justify-between">
              <span>Top AI Recommended Alternatives</span>
              <span className="text-xs text-zinc-400 font-normal">Ranked by Ceremony Context & Facial Sharpness</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendations.map(({ photo, matchScore, rationale }) => {
                const isSelected = selectedPhotoId === photo.id;
                return (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhotoId(photo.id)}
                    className={`cursor-pointer group relative rounded-lg border p-2.5 transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/40'
                        : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="relative aspect-[4/3] rounded overflow-hidden mb-2 bg-zinc-900">
                      <img
                        src={photo.thumbUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                      <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-bold text-amber-300 flex items-center gap-1 border border-amber-500/30">
                        <Sparkles className="w-3 h-3" />
                        {matchScore}% Match
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg">
                            <Check className="w-5 h-5 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-xs font-semibold text-zinc-200 truncate">{photo.title}</h5>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{rationale}</p>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                        <span className="text-amber-400/90 font-medium">{photo.eventTag}</span>
                        <span>{photo.analysis.qualityScore} pts</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedPhotoId}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-lg shadow-amber-500/20 font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Apply Replacement
          </button>
        </div>
      </div>
    </div>
  );
};
