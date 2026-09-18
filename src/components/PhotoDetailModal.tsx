import React from 'react';
import { KarizmaPhoto } from '../types/karizma';
import { X, Sparkles, Check, AlertTriangle, Eye, Award } from 'lucide-react';

interface PhotoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: KarizmaPhoto | null;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  isOpen,
  onClose,
  photo,
}) => {
  if (!isOpen || !photo) return null;

  const { analysis } = photo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100">AI Photograph Quality Analysis</h3>
              <p className="text-xs text-zinc-400">{photo.title} • {photo.filename}</p>
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Photo Preview & Key Metrics */}
          <div className="flex gap-4 items-start">
            <div className="w-48 aspect-[3/4] rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 shrink-0 relative">
              <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
              {/* Face Box Overlay */}
              {analysis.faces.map((f) => (
                <div
                  key={f.id}
                  className="absolute border-2 border-amber-400/80 bg-amber-400/10 rounded"
                  style={{
                    left: `${f.box.x * 100}%`,
                    top: `${f.box.y * 100}%`,
                    width: `${f.box.width * 100}%`,
                    height: `${f.box.height * 100}%`,
                  }}
                >
                  <span className="absolute -top-4 left-0 bg-amber-500 text-black font-bold text-[9px] px-1 rounded">
                    {f.label} ({Math.round(f.confidence * 100)}%)
                  </span>
                </div>
              ))}
            </div>

            {/* Overall Scores */}
            <div className="flex-1 space-y-3">
              <div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                  Composite Quality Score
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold font-serif text-amber-400">
                    {analysis.qualityScore}
                  </span>
                  <span className="text-xs text-zinc-500">/ 100</span>
                  <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {analysis.qualityTier} Quality
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">CEREMONY EVENT</span>
                  <span className="font-semibold text-zinc-200">{photo.eventTag}</span>
                </div>
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">FACE COUNT</span>
                  <span className="font-semibold text-zinc-200">{analysis.faceCount} Detected</span>
                </div>
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">ASPECT RATIO</span>
                  <span className="font-semibold text-zinc-200 capitalize">{photo.orientation} ({photo.width}x{photo.height})</span>
                </div>
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">EMOTION RATING</span>
                  <span className="font-semibold text-amber-300">{analysis.emotionalImportance}% High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metric Progress Bars */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <h4 className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
              Mathematical Sensor Analysis
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Sharpness / Detail Retention</span>
                  <span className="font-mono text-zinc-200">{analysis.sharpness}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${analysis.sharpness}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Composition & Golden Ratio Alignment</span>
                  <span className="font-mono text-zinc-200">{analysis.compositionScore}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${analysis.compositionScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Contrast & Dynamic Range</span>
                  <span className="font-mono text-zinc-200">{analysis.contrast}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-indigo-400" style={{ width: `${analysis.contrast}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Dominant Palette Swatches */}
          <div className="pt-2">
            <span className="text-xs text-zinc-400 block mb-2">Extracted Dominant Color Palette:</span>
            <div className="flex items-center gap-2">
              {analysis.dominantColors.map((color, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                  <div className="w-4 h-4 rounded-full border border-zinc-700" style={{ backgroundColor: color }} />
                  <span className="text-[11px] font-mono text-zinc-400">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
