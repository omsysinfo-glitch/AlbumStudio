import React, { useState } from 'react';
import { KarizmaProject, KarizmaPhoto } from '../types/karizma';
import { X, Sparkles, Image as ImageIcon, Book, Check, Download } from 'lucide-react';

interface CoverDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: KarizmaProject;
  photos: KarizmaPhoto[];
  onUpdateCoverConfig: (coverConfig: KarizmaProject['coverConfig']) => void;
}

export const CoverDesignerModal: React.FC<CoverDesignerModalProps> = ({
  isOpen,
  onClose,
  project,
  photos,
  onUpdateCoverConfig,
}) => {
  const [config, setConfig] = useState(project.coverConfig);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(config.coverPhotoId);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateCoverConfig({
      ...config,
      coverPhotoId: selectedPhotoId,
    });
    onClose();
  };

  const coverPhoto = photos.find((p) => p.id === selectedPhotoId);

  const foilColorStyle =
    config.foilColor === 'gold'
      ? 'linear-gradient(135deg, #FFE259 0%, #D4AF37 50%, #B8860B 100%)'
      : config.foilColor === 'rose_gold'
      ? 'linear-gradient(135deg, #F8CDDA 0%, #E0A899 50%, #C08081 100%)'
      : config.foilColor === 'silver'
      ? 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 50%, #9E9E9E 100%)'
      : 'linear-gradient(135deg, #E67E22 0%, #BA4A00 100%)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Book className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                Deluxe Karizma Cover Designer
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-normal">
                  Front • Spine • Back
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Spine Thickness: <strong className="text-zinc-200">{config.spineWidthInches}"</strong> (Calculated for {project.sheetCount} sheets)
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

        {/* Workspace Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
          {/* Left 2 Cols: Interactive Cover Preview */}
          <div className="lg:col-span-2 p-6 flex flex-col items-center justify-center bg-zinc-950/60 overflow-hidden">
            <div className="w-full max-w-2xl bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 shadow-2xl">
              <div className="flex justify-between text-xs text-zinc-400 mb-2 font-mono">
                <span>[ BACK COVER 12x12" ]</span>
                <span>[ SPINE {config.spineWidthInches}" ]</span>
                <span>[ FRONT COVER 12x12" ]</span>
              </div>

              {/* 3-Section Cover Mockup */}
              <div className="relative aspect-[26/12] w-full rounded-lg overflow-hidden flex shadow-2xl border-2 border-zinc-800 bg-zinc-950">
                {/* 1. Back Cover */}
                <div
                  className="flex-1 p-6 flex flex-col items-center justify-center text-center relative border-r border-zinc-800/50"
                  style={{
                    backgroundColor:
                      config.material === 'velvet'
                        ? '#1A070B'
                        : config.material === 'silk_brocade'
                        ? '#141A14'
                        : '#0D0D11',
                  }}
                >
                  <div className="text-[11px] font-mono tracking-widest text-zinc-400/80 uppercase mb-2">
                    {project.name}
                  </div>
                  <p className="text-xs italic text-zinc-400 max-w-xs">{config.backText}</p>
                  <div className="mt-8 text-[10px] text-zinc-400">KARIZMA PRESTIGE ALBUM • ARCHIVAL QUALITY</div>
                </div>

                {/* 2. Spine */}
                <div
                  className="w-12 border-x border-amber-500/20 flex flex-col items-center justify-center relative select-none shadow-inner"
                  style={{
                    backgroundColor:
                      config.material === 'velvet'
                        ? '#150509'
                        : config.material === 'silk_brocade'
                        ? '#0E140E'
                        : '#09090C',
                  }}
                >
                  <div className="rotate-90 whitespace-nowrap text-[11px] font-serif tracking-widest text-amber-300 uppercase font-semibold">
                    {config.spineText}
                  </div>
                </div>

                {/* 3. Front Cover */}
                <div
                  className="flex-1 p-6 flex flex-col items-center justify-between text-center relative"
                  style={{
                    backgroundColor:
                      config.material === 'velvet'
                        ? '#1A070B'
                        : config.material === 'silk_brocade'
                        ? '#141A14'
                        : '#0D0D11',
                  }}
                >
                  {/* Embossed Floral Top */}
                  <div className="w-10 h-10 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-400 mt-2">
                    ❖
                  </div>

                  {/* Front Cover Photo Cameo Window */}
                  <div className="w-36 h-48 rounded-lg overflow-hidden border-2 border-amber-400/60 shadow-xl bg-zinc-900 relative my-2">
                    {coverPhoto ? (
                      <img
                        src={coverPhoto.thumbUrl}
                        alt="Front Cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 p-2">
                        <ImageIcon className="w-6 h-6 mb-1" />
                        <span className="text-[10px]">Select Cameo Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Embossed Title & Names */}
                  <div className="mb-2">
                    <h2
                      className="text-lg font-serif font-bold tracking-wider mb-1"
                      style={{
                        background: foilColorStyle,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {config.frontSubtitle}
                    </h2>
                    <div className="text-[11px] font-mono tracking-widest text-zinc-400">
                      {config.frontTitle}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Customization Form */}
          <div className="p-6 space-y-5 text-sm overflow-y-auto">
            <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider">
              Cover Materials & Foil Embossing
            </h4>

            {/* Material */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Cover Fabric / Material</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'velvet', label: 'Royal Velvet (Crimson)' },
                  { id: 'leatherette', label: 'Black Leatherette' },
                  { id: 'matte_laminate', label: 'Matte Luxe Laminate' },
                  { id: 'silk_brocade', label: 'Emerald Silk Brocade' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setConfig({ ...config, material: m.id as any })}
                    className={`p-2.5 rounded-lg border text-xs text-left transition ${
                      config.material === m.id
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-semibold'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Foil Color */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Hot Foil Stamping Color</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'gold', label: '24K Gold' },
                  { id: 'rose_gold', label: 'Rose Gold' },
                  { id: 'silver', label: 'Silver Chrome' },
                  { id: 'copper', label: 'Antique Copper' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setConfig({ ...config, foilColor: f.id as any })}
                    className={`p-2 rounded-lg border text-xs text-center transition ${
                      config.foilColor === f.id
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-semibold'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Texts */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Front Cover Couple Names</label>
                <input
                  type="text"
                  value={config.frontSubtitle}
                  onChange={(e) => setConfig({ ...config, frontSubtitle: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 text-xs focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Front Album Subtitle</label>
                <input
                  type="text"
                  value={config.frontTitle}
                  onChange={(e) => setConfig({ ...config, frontTitle: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 text-xs focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Spine Stamped Text</label>
                <input
                  type="text"
                  value={config.spineText}
                  onChange={(e) => setConfig({ ...config, spineText: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 text-xs focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Back Inscription Quote</label>
                <input
                  type="text"
                  value={config.backText}
                  onChange={(e) => setConfig({ ...config, backText: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 text-xs focus:border-amber-500"
                />
              </div>
            </div>

            {/* Cameo Photo Selector */}
            <div className="pt-2 border-t border-zinc-800">
              <label className="block text-xs text-zinc-400 mb-2 font-medium">Front Cameo Window Photo</label>
              <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-zinc-950 rounded-lg border border-zinc-800">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPhotoId(p.id)}
                    className={`cursor-pointer relative aspect-square rounded overflow-hidden border ${
                      selectedPhotoId === p.id ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-zinc-800'
                    }`}
                  >
                    <img src={p.thumbUrl} alt={p.title} className="w-full h-full object-cover" />
                    {selectedPhotoId === p.id && (
                      <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-amber-300 stroke-[3]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-amber-500 text-black hover:bg-amber-400 transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Check className="w-4 h-4" />
            Save Cover Design
          </button>
        </div>
      </div>
    </div>
  );
};
