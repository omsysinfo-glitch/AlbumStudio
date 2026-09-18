import React from 'react';
import { SheetRecommendation, AlbumSheet } from '../types/karizma';
import { X, Sparkles, Check, CheckCheck, AlertCircle, ArrowRight } from 'lucide-react';

interface AiImproveSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSheet: AlbumSheet;
  recommendations: SheetRecommendation[];
  onApplyAll: () => void;
  onApplySingle: (recId: string) => void;
}

export const AiImproveSheetModal: React.FC<AiImproveSheetModalProps> = ({
  isOpen,
  onClose,
  currentSheet,
  recommendations,
  onApplyAll,
  onApplySingle,
}) => {
  if (!isOpen) return null;

  const pendingCount = recommendations.filter((r) => !r.applied).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100">AI Sheet Improvement Assistant</h3>
              <p className="text-xs text-zinc-400">
                Sheet {currentSheet.sheetNumber}: {currentSheet.title}
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

        {/* List of Recommendations */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
            <span>
              Found <strong className="text-zinc-200">{recommendations.length}</strong> suggestions ({pendingCount} pending)
            </span>
            <span className="text-emerald-400">No silent changes applied</span>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 space-y-2">
              <CheckCheck className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-medium text-zinc-300">Spread is Visually Optimized</p>
              <p className="text-xs">No gutter collisions, duplicate photos, or crop issues detected.</p>
            </div>
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-lg border transition ${
                  rec.applied
                    ? 'bg-emerald-950/20 border-emerald-900/50 text-zinc-400'
                    : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {rec.category}
                      </span>
                      <h4 className="text-sm font-semibold text-zinc-200">{rec.title}</h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{rec.description}</p>
                  </div>

                  {rec.applied ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 shrink-0 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800">
                      <Check className="w-3.5 h-3.5" />
                      Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => onApplySingle(rec.id)}
                      className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white border border-zinc-700 transition flex items-center gap-1"
                    >
                      Apply
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            Close
          </button>
          {pendingCount > 0 && (
            <button
              onClick={() => {
                onApplyAll();
              }}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 font-semibold"
            >
              <CheckCheck className="w-4 h-4" />
              Apply All Recommendations ({pendingCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
