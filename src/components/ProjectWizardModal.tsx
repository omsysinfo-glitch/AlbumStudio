import React, { useState } from 'react';
import { KarizmaProject, AlbumSize } from '../types/karizma';
import { KARIZMA_DESIGN_STYLES } from '../data/karizmaStyles';
import { X, Sparkles, Calendar, BookOpen, Layers, Check, Palette } from 'lucide-react';

interface ProjectWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: Partial<KarizmaProject>) => void;
}

export const ProjectWizardModal: React.FC<ProjectWizardModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('Rahul & Priya Wedding');
  const [clientName, setClientName] = useState('Sharma & Verma Family');
  const [brideName, setBrideName] = useState('Priya Sharma');
  const [groomName, setGroomName] = useState('Rahul Verma');
  const [weddingDate, setWeddingDate] = useState('2026-02-12');
  const [albumSize, setAlbumSize] = useState<AlbumSize>('12x36');
  const [customWidth, setCustomWidth] = useState(36);
  const [customHeight, setCustomHeight] = useState(12);
  const [sheetCount, setSheetCount] = useState(20);
  const [selectedStyleId, setSelectedStyleId] = useState('style-royal-red-gold');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject({
      id: `proj-${Date.now()}`,
      name,
      clientName,
      brideName,
      groomName,
      weddingDate,
      albumSize,
      customWidthInches: albumSize === 'custom' ? customWidth : undefined,
      customHeightInches: albumSize === 'custom' ? customHeight : undefined,
      sheetCount,
      designStyleId: selectedStyleId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      coverConfig: {
        frontTitle: 'OUR WEDDING STORY',
        frontSubtitle: `${groomName.split(' ')[0]} ♡ ${brideName.split(' ')[0]}`,
        coverPhotoId: null,
        spineText: `${groomName.split(' ')[0]} & ${brideName.split(' ')[0]} • 2026`,
        spineWidthInches: Math.max(0.8, sheetCount * 0.05),
        backText: 'Two Souls • One Heart',
        material: 'velvet',
        foilColor: 'gold',
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100">Create Karizma Wedding Album Project</h3>
              <p className="text-xs text-zinc-400">Configure client details, spread dimensions & design style</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Section 1: Couple & Project */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold text-amber-400/90 tracking-wider">
              1. Couple & Project Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Client / Family Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Groom's Name</label>
                <input
                  type="text"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Bride's Name</label>
                <input
                  type="text"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Wedding Date</label>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Album Spread Dimensions */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold text-amber-400/90 tracking-wider">
              2. Album Spread Size & Sheets
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: '12x36', label: '12 × 36"', desc: 'Standard Karizma Spread' },
                { id: '12x30', label: '12 × 30"', desc: 'Studio Compact Spread' },
                { id: '10x30', label: '10 × 30"', desc: 'Slim Panorama' },
                { id: 'custom', label: 'Custom', desc: 'Specify dimensions' },
              ].map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setAlbumSize(size.id as AlbumSize)}
                  className={`p-3 rounded-lg border text-left transition ${
                    albumSize === size.id
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-bold text-sm">{size.label}</div>
                  <div className="text-[11px] text-zinc-400">{size.desc}</div>
                </button>
              ))}
            </div>

            {albumSize === 'custom' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Width (Inches)</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    min={10}
                    max={60}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Height (Inches)</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    min={8}
                    max={24}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-zinc-100"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Number of Double-Page Sheets:</span>
                <span className="font-bold text-zinc-200">{sheetCount} Sheets ({sheetCount * 2} Pages)</span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                value={sheetCount}
                onChange={(e) => setSheetCount(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>
          </div>

          {/* Section 3: Design Style Engine */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold text-amber-400/90 tracking-wider">
              3. Initial Design Style
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {KARIZMA_DESIGN_STYLES.map((style) => (
                <div
                  key={style.id}
                  onClick={() => setSelectedStyleId(style.id)}
                  className={`cursor-pointer p-3 rounded-lg border transition flex items-start gap-3 ${
                    selectedStyleId === style.id
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-full border border-zinc-700 shrink-0 shadow"
                    style={{ backgroundColor: style.colors.primary, borderColor: style.colors.secondary }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-zinc-100 truncate">{style.name}</div>
                    <div className="text-[11px] text-zinc-400 line-clamp-2">{style.description}</div>
                  </div>
                  {selectedStyleId === style.id && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-amber-500 text-black hover:bg-amber-400 transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Create Project & Initialize Album
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
