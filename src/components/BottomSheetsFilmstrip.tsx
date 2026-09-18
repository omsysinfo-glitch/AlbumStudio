import React from 'react';
import { AlbumSheet, KarizmaPhoto } from '../types/karizma';
import { Plus, Copy, Trash2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface BottomSheetsFilmstripProps {
  sheets: AlbumSheet[];
  activeSheetId: string;
  photosMap: Map<string, KarizmaPhoto>;
  onSelectSheet: (sheetId: string) => void;
  onAddSheet: () => void;
  onDuplicateSheet: (sheetId: string) => void;
  onDeleteSheet: (sheetId: string) => void;
  onMoveSheet: (sheetId: string, direction: 'left' | 'right') => void;
}

export const BottomSheetsFilmstrip: React.FC<BottomSheetsFilmstripProps> = ({
  sheets,
  activeSheetId,
  photosMap,
  onSelectSheet,
  onAddSheet,
  onDuplicateSheet,
  onDeleteSheet,
  onMoveSheet,
}) => {
  return (
    <div className="h-28 border-t border-zinc-800 bg-zinc-950 flex items-center px-4 gap-3 overflow-x-auto z-20 select-none no-scrollbar">
      <div className="flex items-center gap-1 text-xs text-zinc-400 shrink-0 pr-2 border-r border-zinc-800">
        <span className="font-bold text-zinc-200">{sheets.length}</span>
        <span>Spreads</span>
      </div>

      {sheets.map((sheet, index) => {
        const isActive = sheet.id === activeSheetId;
        const photoCount = sheet.objects.filter((o) => o.type === 'photo').length;
        const hasRecs = sheet.recommendations && sheet.recommendations.some((r) => !r.applied);

        return (
          <div
            key={sheet.id}
            onClick={() => onSelectSheet(sheet.id)}
            className={`group relative shrink-0 w-44 h-22 rounded-lg border cursor-pointer transition flex flex-col justify-between p-1.5 overflow-hidden ${
              isActive
                ? 'border-amber-400 bg-amber-500/10 shadow-lg ring-1 ring-amber-400/40'
                : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 hover:bg-zinc-800/80'
            }`}
          >
            {/* Top row: Spread number & Quick Actions */}
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-bold tracking-wider text-zinc-300 font-mono">
                SPREAD {String(sheet.sheetNumber).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                {index > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSheet(sheet.id, 'left');
                    }}
                    className="p-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-white"
                    title="Move Left"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                )}
                {index < sheets.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSheet(sheet.id, 'right');
                    }}
                    className="p-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-white"
                    title="Move Right"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateSheet(sheet.id);
                  }}
                  className="p-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-white"
                  title="Duplicate Spread"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {sheets.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSheet(sheet.id);
                    }}
                    className="p-0.5 rounded bg-zinc-800 text-red-400 hover:text-red-300"
                    title="Delete Spread"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Mini spread schematic thumbnail preview */}
            <div
              className="w-full h-10 rounded border border-zinc-800/80 relative overflow-hidden my-0.5"
              style={{
                background:
                  sheet.background.type === 'gradient'
                    ? sheet.background.value
                    : sheet.background.value || '#111',
              }}
            >
              {/* Center Gutter Line */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-zinc-700/60 z-10" />

              {/* Photo wireframe slots */}
              {sheet.objects
                .filter((o) => o.type === 'photo')
                .map((obj) => (
                  <div
                    key={obj.id}
                    className="absolute bg-amber-500/20 border border-amber-500/40 rounded-[1px]"
                    style={{
                      left: `${obj.x * 100}%`,
                      top: `${obj.y * 100}%`,
                      width: `${obj.width * 100}%`,
                      height: `${obj.height * 100}%`,
                    }}
                  />
                ))}
            </div>

            {/* Bottom row: Spread Title & Badge */}
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-400 truncate max-w-[90px]">{sheet.title}</span>
              <div className="flex items-center gap-1.5">
                {hasRecs && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="AI Suggestions Ready" />
                )}
                <span className="text-zinc-500 font-mono">{photoCount}p</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add New Spread Button */}
      <button
        onClick={onAddSheet}
        className="shrink-0 w-32 h-22 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/40 hover:border-amber-400 hover:bg-zinc-900 text-zinc-400 hover:text-amber-300 flex flex-col items-center justify-center gap-1.5 transition text-xs font-medium"
      >
        <Plus className="w-5 h-5" />
        <span>Add Spread</span>
      </button>
    </div>
  );
};
