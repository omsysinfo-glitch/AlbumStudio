import React from 'react';
import { KarizmaProject, AlbumSheet, GuideVisibility } from '../types/karizma';
import {
  BookOpen,
  Sparkles,
  Printer,
  Eye,
  Plus,
  Share2,
  CheckCircle2,
  Layers,
  Wand2,
  FolderOpen,
  FileText,
  Sliders,
} from 'lucide-react';

interface KarizmaHeaderProps {
  project: KarizmaProject;
  currentSheet: AlbumSheet;
  sheetCount: number;
  onOpenProjectWizard: () => void;
  onOpenCoverDesigner: () => void;
  onOpenClientPreview: () => void;
  onOpenExportModal: () => void;
  onOpenAiImprove: () => void;
  onAutoGenerateAlbum: () => void;
  activeView: 'editor' | 'cover' | 'preview';
  onChangeView: (view: 'editor' | 'cover' | 'preview') => void;
}

export const KarizmaHeader: React.FC<KarizmaHeaderProps> = ({
  project,
  currentSheet,
  sheetCount,
  onOpenProjectWizard,
  onOpenCoverDesigner,
  onOpenClientPreview,
  onOpenExportModal,
  onOpenAiImprove,
  onAutoGenerateAlbum,
  activeView,
  onChangeView,
}) => {
  const pendingRecs = currentSheet?.recommendations?.filter((r) => !r.applied).length || 0;

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between z-30 shrink-0 select-none text-zinc-100">
      {/* Left: Brand & Active Project */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 font-bold shadow-md shadow-amber-500/20">
            ❖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-zinc-100 tracking-wide text-sm">
                KARIZMA AI
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                12×36" STUDIO
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 truncate max-w-[200px]">
              {project.name}
            </div>
          </div>
        </div>

        {/* Project Switcher / Wizard Button */}
        <button
          onClick={onOpenProjectWizard}
          className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 flex items-center gap-1.5 transition"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>New / Switch Project</span>
        </button>

        {/* View Switcher Tabs */}
        <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 ml-2">
          <button
            onClick={() => onChangeView('editor')}
            className={`px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 ${
              activeView === 'editor'
                ? 'bg-zinc-800 text-amber-300 shadow font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Spread Canvas
          </button>
          <button
            onClick={onOpenCoverDesigner}
            className="px-3 py-1 rounded text-xs font-medium text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            Cover Designer
          </button>
          <button
            onClick={onOpenClientPreview}
            className="px-3 py-1 rounded text-xs font-medium text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            Client Approval
          </button>
        </div>
      </div>

      {/* Right: AI Actions, Auto-Gen & Hi-Res Export */}
      <div className="flex items-center gap-2.5">
        {/* AI Sheet Doctor / Improve Button */}
        <button
          onClick={onOpenAiImprove}
          className="relative px-3 py-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 shadow transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>AI Sheet Doctor</span>
          {pendingRecs > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-400 text-black font-bold text-[10px] flex items-center justify-center">
              {pendingRecs}
            </span>
          )}
        </button>

        {/* AI Auto-Generate Full Album */}
        <button
          onClick={onAutoGenerateAlbum}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Auto-Gen Album</span>
        </button>

        {/* High-Resolution Export Button */}
        <button
          onClick={onOpenExportModal}
          className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
        >
          <Printer className="w-4 h-4" />
          <span>Export 300 DPI</span>
        </button>
      </div>
    </header>
  );
};
