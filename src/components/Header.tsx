import React, { useState } from 'react';
import { PageSpread, GuideVisibility, EventType } from '../types';
import { EVENT_BATCHES } from '../data/mockAlbumData';
import {
  BookOpen,
  Sparkles,
  Server,
  Printer,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  CheckCircle2,
  Calendar,
  ChevronDown,
  Wand2,
} from 'lucide-react';

interface HeaderProps {
  currentView: 'canvas' | 'solver' | 'architecture';
  onChangeView: (view: 'canvas' | 'solver' | 'architecture') => void;
  spreads: PageSpread[];
  currentSpreadIndex: number;
  onSelectSpreadIndex: (index: number) => void;
  onAddSpread: () => void;
  guides: GuideVisibility;
  onToggleGuide: (key: keyof GuideVisibility) => void;
  onOpenExportModal: () => void;
  preflightIssueCount: number;
  currentEventType: EventType;
  onChangeEventType: (type: EventType) => void;
  onOpenAiStudio: () => void;
  onOpenPrintPreview?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onChangeView,
  spreads,
  currentSpreadIndex,
  onSelectSpreadIndex,
  onAddSpread,
  guides,
  onToggleGuide,
  onOpenExportModal,
  preflightIssueCount,
  currentEventType,
  onChangeEventType,
  onOpenAiStudio,
  onOpenPrintPreview,
}) => {
  const [showGuidesMenu, setShowGuidesMenu] = useState(false);
  const [showEventMenu, setShowEventMenu] = useState(false);

  const currentEvent = EVENT_BATCHES[currentEventType] || EVENT_BATCHES.indian_wedding;

  return (
    <header
      id="app-main-header"
      className="bg-stone-950 border-b border-stone-800 text-stone-100 px-5 py-2.5 flex items-center justify-between shrink-0 z-30"
    >
      {/* Left: Brand Identity, Event Switcher & Navigation Tabs */}
      <div className="flex items-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 shadow-md">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-stone-100 flex items-center gap-1.5">
              <span>FolioCraft</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                PRO PRINT
              </span>
            </div>
            <div className="text-[10px] text-stone-400">Automated Photo Album SaaS</div>
          </div>
        </div>

        {/* Event Selector Dropdown */}
        <div className="relative">
          <button
            id="btn-event-selector"
            onClick={() => setShowEventMenu(!showEventMenu)}
            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <div className="text-left">
              <span className="font-semibold text-stone-200 block text-[11px] leading-tight">
                {currentEvent.tag}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-stone-400" />
          </button>

          {showEventMenu && (
            <div
              id="event-dropdown-menu"
              className="absolute left-0 mt-2 w-72 bg-stone-950 border border-stone-800 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1"
            >
              <div className="px-2 py-1 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                Select Album Event Template:
              </div>
              {Object.entries(EVENT_BATCHES).map(([key, ev]) => (
                <button
                  key={key}
                  onClick={() => {
                    onChangeEventType(key as EventType);
                    setShowEventMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg transition-colors cursor-pointer ${
                    currentEventType === key
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                      : 'hover:bg-stone-900 text-stone-300'
                  }`}
                >
                  <div className="font-semibold text-[11px] flex items-center justify-between">
                    <span>{ev.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-900 text-stone-400">
                      {ev.tag}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">{ev.subtitle}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Switcher */}
        <nav className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800 text-xs">
          <button
            id="nav-btn-canvas-editor"
            onClick={() => onChangeView('canvas')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentView === 'canvas'
                ? 'bg-stone-800 text-amber-400 font-semibold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Spread Canvas Editor</span>
          </button>

          <button
            id="nav-btn-layout-solver"
            onClick={() => onChangeView('solver')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentView === 'solver'
                ? 'bg-stone-800 text-amber-400 font-semibold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Layout Solver</span>
          </button>

          <button
            id="nav-btn-architecture-spec"
            onClick={() => onChangeView('architecture')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentView === 'architecture'
                ? 'bg-stone-800 text-amber-400 font-semibold shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Architecture Spec</span>
          </button>
        </nav>
      </div>

      {/* Center: Spread Navigation (when in Canvas mode) */}
      {currentView === 'canvas' && (
        <div className="flex items-center gap-2">
          <button
            title="Previous Spread"
            onClick={() => onSelectSpreadIndex(Math.max(0, currentSpreadIndex - 1))}
            disabled={currentSpreadIndex === 0}
            className="p-1.5 rounded-md bg-stone-900 hover:bg-stone-800 text-stone-300 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {spreads.map((spread, idx) => (
              <button
                key={spread.id}
                onClick={() => onSelectSpreadIndex(idx)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                  idx === currentSpreadIndex
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                }`}
              >
                Sp {spread.spreadNumber}
              </button>
            ))}

            <button
              title="Add New Spread"
              onClick={onAddSpread}
              className="p-1.5 rounded-md bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            title="Next Spread"
            onClick={() =>
              onSelectSpreadIndex(Math.min(spreads.length - 1, currentSpreadIndex + 1))
            }
            disabled={currentSpreadIndex === spreads.length - 1}
            className="p-1.5 rounded-md bg-stone-900 hover:bg-stone-800 text-stone-300 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Right: AI Photo Studio, Guidelines & Preflight Export */}
      <div className="flex items-center gap-2.5">
        {/* Gemini AI Photo Studio Button */}
        <button
          id="btn-header-ai-studio"
          onClick={onOpenAiStudio}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
          <span>AI Photo Studio</span>
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/30 text-amber-200">
            Gemini
          </span>
        </button>

        {/* Guides Popover Toggle */}
        <div className="relative">
          <button
            id="btn-toggle-guides-menu"
            onClick={() => setShowGuidesMenu(!showGuidesMenu)}
            className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-stone-400" />
            <span>Guides</span>
          </button>

          {showGuidesMenu && (
            <div
              id="guides-dropdown-menu"
              className="absolute right-0 mt-2 w-56 bg-stone-950 border border-stone-800 rounded-xl shadow-2xl p-3 z-50 text-xs space-y-2"
            >
              <div className="font-semibold text-stone-200 pb-1 border-b border-stone-800 text-[11px] uppercase tracking-wider">
                Overlay Print Guidelines
              </div>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-stone-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Bleed Line (+0.125&quot;)</span>
                </span>
                <input
                  type="checkbox"
                  checked={guides.bleed}
                  onChange={() => onToggleGuide('bleed')}
                  className="accent-amber-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-stone-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-stone-400" />
                  <span>Trim Cut Line</span>
                </span>
                <input
                  type="checkbox"
                  checked={guides.trim}
                  onChange={() => onToggleGuide('trim')}
                  className="accent-amber-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-stone-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Safe Zone Margin (0.5&quot;)</span>
                </span>
                <input
                  type="checkbox"
                  checked={guides.safeZone}
                  onChange={() => onToggleGuide('safeZone')}
                  className="accent-amber-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-stone-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Center Gutter Fold (0.75&quot;)</span>
                </span>
                <input
                  type="checkbox"
                  checked={guides.gutter}
                  onChange={() => onToggleGuide('gutter')}
                  className="accent-amber-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-stone-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>AI Saliency / Faces</span>
                </span>
                <input
                  type="checkbox"
                  checked={guides.saliencyFocal}
                  onChange={() => onToggleGuide('saliencyFocal')}
                  className="accent-amber-500 cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>

        {/* Physical Print Preview Button */}
        {onOpenPrintPreview && (
          <button
            id="btn-header-print-preview"
            onClick={onOpenPrintPreview}
            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 text-amber-400 border border-stone-800 hover:border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Simulate Physical Print & Paper Finishes (Bleed-to-Trim)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Preview</span>
          </button>
        )}

        {/* Preflight Status & 300 DPI Export Button */}
        <button
          id="btn-header-export-cmyk"
          onClick={onOpenExportModal}
          className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>300 DPI Preflight</span>
          {preflightIssueCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full bg-stone-950 text-amber-300 text-[10px] font-mono">
              {preflightIssueCount}
            </span>
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-stone-950" />
          )}
        </button>
      </div>
    </header>
  );
};
