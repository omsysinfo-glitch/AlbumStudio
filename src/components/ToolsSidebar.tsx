import React, { useState } from 'react';
import {
  KarizmaPhoto,
  KarizmaTemplate,
  DesignStyle,
  TemplateCategory,
  EventClassificationType,
  QualityTier,
  AlbumObject,
} from '../types/karizma';
import { KARIZMA_TEMPLATES } from '../data/karizmaTemplates';
import { KARIZMA_DESIGN_STYLES } from '../data/karizmaStyles';
import { searchPhotosWithAi } from '../utils/photoQualityEngine';
import {
  Image as ImageIcon,
  LayoutTemplate,
  Palette,
  Shapes,
  Type,
  Sparkles,
  Search,
  Upload,
  Filter,
  Check,
  Plus,
  Wand2,
  Layers,
} from 'lucide-react';

interface ToolsSidebarProps {
  photos: KarizmaPhoto[];
  onUploadPhotos: (newPhotos: KarizmaPhoto[]) => void;
  onApplyTemplate: (template: KarizmaTemplate) => void;
  onApplyStyle: (style: DesignStyle) => void;
  onAddObjectToSheet: (obj: Partial<AlbumObject>) => void;
  onSelectPhotoToInspect: (photo: KarizmaPhoto) => void;
  onTriggerAiAlbumGenerate: () => void;
}

export const ToolsSidebar: React.FC<ToolsSidebarProps> = ({
  photos,
  onUploadPhotos,
  onApplyTemplate,
  onApplyStyle,
  onAddObjectToSheet,
  onSelectPhotoToInspect,
  onTriggerAiAlbumGenerate,
}) => {
  const [activeTab, setActiveTab] = useState<
    'photos' | 'templates' | 'styles' | 'elements' | 'text' | 'background' | 'ai'
  >('photos');

  // Photo Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCeremony, setSelectedCeremony] = useState<string>('all');
  const [selectedQuality, setSelectedQuality] = useState<string>('all');

  // Template Filter Category
  const [templateCategory, setTemplateCategory] = useState<string>('all');

  // AI Style Prompt
  const [aiStylePrompt, setAiStylePrompt] = useState('');
  const [isGeneratingStyle, setIsGeneratingStyle] = useState(false);

  // Filtered Photos
  const filteredPhotos = React.useMemo(() => {
    let result = searchPhotosWithAi(photos, searchQuery);
    if (selectedCeremony !== 'all') {
      result = result.filter((p) => p.eventTag === selectedCeremony);
    }
    if (selectedQuality !== 'all') {
      result = result.filter((p) => p.analysis.qualityTier === selectedQuality);
    }
    return result;
  }, [photos, searchQuery, selectedCeremony, selectedQuality]);

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUploaded: KarizmaPhoto[] = Array.from(files).map((file, idx) => {
      const url = URL.createObjectURL(file);
      return {
        id: `uploaded-${Date.now()}-${idx}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        filename: file.name,
        fileSize: file.size,
        url,
        thumbUrl: url,
        width: 4000,
        height: 6000,
        aspectRatio: 0.67,
        orientation: 'portrait',
        timestamp: new Date().toISOString(),
        eventTag: 'Wedding',
        analysis: {
          sharpness: 94,
          blurScore: 6,
          exposure: 2,
          brightness: 78,
          contrast: 85,
          qualityScore: 94,
          qualityTier: 'Excellent',
          compositionScore: 92,
          emotionalImportance: 90,
          faceCount: 1,
          faces: [
            {
              id: `face-${idx}`,
              box: { x: 0.35, y: 0.2, width: 0.2, height: 0.3 },
              confidence: 0.95,
              label: 'bride',
            },
          ],
          dominantColors: ['#7B1E25', '#D4AF37'],
          sceneClassification: 'Uploaded Wedding Photograph',
          eventClassification: { event: 'Wedding', confidence: 0.95 },
        },
      };
    });

    onUploadPhotos(newUploaded);
  };

  // AI Style Generation Simulation
  const handleGenerateAiStyle = () => {
    if (!aiStylePrompt.trim()) return;
    setIsGeneratingStyle(true);
    setTimeout(() => {
      const generatedStyle: DesignStyle = {
        id: `custom-ai-${Date.now()}`,
        name: 'AI Generated Royal Theme',
        category: 'Royal',
        description: aiStylePrompt,
        colors: {
          primary: '#800020',
          secondary: '#D4AF37',
          accent: '#FFD700',
          background: '#120508',
          surface: '#20080E',
          text: '#FAF5EE',
          border: '#D4AF37',
        },
        typography: {
          headingFont: 'Cinzel, serif',
          bodyFont: 'Playfair Display, serif',
          scriptFont: 'Great Vibes, cursive',
        },
        borderStyle: {
          width: 3,
          color: '#D4AF37',
          style: 'double',
          radius: 4,
        },
        decorations: ['mandala', 'arch'],
        defaultBackground: {
          type: 'gradient',
          value: 'linear-gradient(135deg, #18060B 0%, #290A13 100%)',
        },
      };
      onApplyStyle(generatedStyle);
      setIsGeneratingStyle(false);
      setAiStylePrompt('');
    }, 1000);
  };

  return (
    <aside className="w-84 border-r border-zinc-800 bg-zinc-900 flex h-full select-none text-zinc-100">
      {/* Mini Icon Strip (Leftmost) */}
      <div className="w-14 border-r border-zinc-800 bg-zinc-950 flex flex-col items-center py-3 gap-2 shrink-0">
        {[
          { id: 'photos', icon: ImageIcon, label: 'Photos' },
          { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
          { id: 'styles', icon: Palette, label: 'Styles' },
          { id: 'elements', icon: Shapes, label: 'Elements' },
          { id: 'text', icon: Type, label: 'Text' },
          { id: 'background', icon: Layers, label: 'Backdrop' },
          { id: 'ai', icon: Sparkles, label: 'AI Tools' },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-medium tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Expanded Tools Drawer */}
      <div className="flex-1 flex flex-col overflow-hidden bg-zinc-900">
        {/* 1. PHOTOS TAB */}
        {activeTab === 'photos' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header & Upload */}
            <div className="p-3 border-b border-zinc-800 space-y-2 bg-zinc-950/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Photo Pool ({filteredPhotos.length}/{photos.length})
                </span>
                <label className="cursor-pointer px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold flex items-center gap-1 shadow">
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Natural Language AI Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder='AI Search: "bride smiling", "ring"...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Ceremony Filter Badges */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                {['all', 'Couple Portrait', 'Bride Portrait', 'Mandap', 'Haldi', 'Mehendi', 'Sangeet', 'Family'].map(
                  (c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCeremony(c)}
                      className={`px-2 py-0.5 rounded-full whitespace-nowrap transition ${
                        selectedCeremony === c
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold'
                          : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {c === 'all' ? 'All' : c}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Photos Grid */}
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => onSelectPhotoToInspect(photo)}
                  className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 cursor-pointer hover:border-amber-400/60 transition"
                >
                  <img
                    src={photo.thumbUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                  />
                  {/* Quality Badge */}
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur text-[10px] font-bold text-amber-300 border border-amber-500/20">
                    {photo.analysis.qualityScore}%
                  </div>
                  {/* Ceremony Tag */}
                  <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <p className="text-[10px] font-medium text-zinc-200 truncate">{photo.title}</p>
                    <span className="text-[9px] text-amber-400 font-mono">{photo.eventTag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. TEMPLATES TAB (20+ Starter Templates) */}
        {activeTab === 'templates' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-zinc-800 space-y-2 bg-zinc-950/40">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                20+ Starter Templates
              </span>
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                {['all', 'Royal', 'Luxury', 'Traditional', 'Modern', 'Minimal', 'Floral', 'Cinematic', 'Romantic', 'Elegant', 'Dark Luxury'].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setTemplateCategory(cat)}
                      className={`px-2 py-0.5 rounded-full whitespace-nowrap transition ${
                        templateCategory === cat
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold'
                          : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {KARIZMA_TEMPLATES.filter(
                (t) => templateCategory === 'all' || t.category === templateCategory
              ).map((template) => (
                <div
                  key={template.id}
                  onClick={() => onApplyTemplate(template)}
                  className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:border-amber-400/80 hover:bg-zinc-900 cursor-pointer transition space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-zinc-200 group-hover:text-amber-300 truncate">
                      {template.name}
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                      {template.photoCount} Photos
                    </span>
                  </div>
                  {/* Schematic spread wireframe */}
                  <div className="w-full aspect-[36/12] bg-zinc-900 rounded border border-zinc-800/80 relative p-1">
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-zinc-700/50" />
                    {template.photoSlots.map((slot, i) => (
                      <div
                        key={i}
                        className="absolute bg-amber-500/20 border border-amber-500/40 rounded-sm"
                        style={{
                          left: `${slot.x * 100}%`,
                          top: `${slot.y * 100}%`,
                          width: `${slot.width * 100}%`,
                          height: `${slot.height * 100}%`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. STYLES TAB */}
        {activeTab === 'styles' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
            {/* AI Style Prompt Generator */}
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-amber-500/30 space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                AI Style Generator
              </div>
              <textarea
                rows={2}
                placeholder="e.g. Luxury royal emerald and gold Indian palace theme with floral mandalas..."
                value={aiStylePrompt}
                onChange={(e) => setAiStylePrompt(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
              />
              <button
                onClick={handleGenerateAiStyle}
                disabled={isGeneratingStyle || !aiStylePrompt.trim()}
                className="w-full py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center justify-center gap-1 shadow disabled:opacity-50"
              >
                <Wand2 className="w-3.5 h-3.5" />
                {isGeneratingStyle ? 'Generating Style...' : 'Generate Style JSON'}
              </button>
            </div>

            {/* Preset Styles */}
            <div className="space-y-3">
              <span className="font-bold uppercase tracking-wider text-zinc-400 text-[10px] block">
                Karizma Preset Palettes & Typographies
              </span>
              {KARIZMA_DESIGN_STYLES.map((style) => (
                <div
                  key={style.id}
                  onClick={() => onApplyStyle(style)}
                  className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:border-amber-400 hover:bg-zinc-900 cursor-pointer transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-zinc-200">{style.name}</h5>
                    <div className="flex items-center gap-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-zinc-700"
                        style={{ backgroundColor: style.colors.primary }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-zinc-700"
                        style={{ backgroundColor: style.colors.secondary }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-zinc-700"
                        style={{ backgroundColor: style.colors.background }}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {style.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. ELEMENTS TAB */}
        {activeTab === 'elements' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            <span className="font-bold uppercase tracking-wider text-zinc-400 text-[10px] block">
              Indian Wedding Motifs & Shapes
            </span>

            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'decoration', motif: 'mandala', label: 'Sacred Mandala' },
                { type: 'decoration', motif: 'paisley', label: 'Bridal Paisley' },
                { type: 'decoration', motif: 'kalash', label: 'Vedic Kalash' },
                { type: 'decoration', motif: 'arch', label: 'Royal Arch' },
                { type: 'decoration', motif: 'garland', label: 'Marigold Garland' },
                { type: 'decoration', motif: 'flourish', label: 'Gilded Flourish' },
              ].map((elem, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    onAddObjectToSheet({
                      id: `dec-${Date.now()}-${idx}`,
                      type: 'decoration',
                      name: elem.label,
                      x: 0.45,
                      y: 0.4,
                      width: 0.1,
                      height: 0.2,
                      rotation: 0,
                      opacity: 0.9,
                      zIndex: 3,
                      motifType: elem.motif as any,
                      tintColor: '#D4AF37',
                    })
                  }
                  className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:border-amber-400 hover:bg-zinc-900 cursor-pointer flex flex-col items-center justify-center text-center gap-2 transition"
                >
                  <div className="w-10 h-10 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-400">
                    ❖
                  </div>
                  <span className="text-[11px] font-medium text-zinc-300">{elem.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. TEXT TAB */}
        {activeTab === 'text' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            <span className="font-bold uppercase tracking-wider text-zinc-400 text-[10px] block">
              Pre-Styled Wedding Typography
            </span>

            <div className="space-y-2">
              {[
                { title: 'Add Main Ceremony Title', font: 'Cinzel', size: 24, text: 'SHUBH VIVAH' },
                { title: 'Couple Names', font: 'Great Vibes', size: 28, text: 'Rahul ♡ Priya' },
                { title: 'Vedic Sanskrit Mantra', font: 'Cinzel', size: 18, text: '॥ मंगलम् भगवान विष्णुः ॥' },
                { title: 'Romantic Subtitle Quote', font: 'Playfair Display', size: 16, text: 'Two Hearts • One Destiny' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    onAddObjectToSheet({
                      id: `txt-${Date.now()}-${idx}`,
                      type: 'text',
                      name: item.title,
                      x: 0.35,
                      y: 0.1,
                      width: 0.3,
                      height: 0.1,
                      rotation: 0,
                      opacity: 1,
                      zIndex: 4,
                      text: item.text,
                      fontFamily: item.font,
                      fontSize: item.size,
                      fontWeight: 'bold',
                      fontStyle: 'normal',
                      color: '#D4AF37',
                      letterSpacing: 2,
                      lineHeight: 1.2,
                      textAlign: 'center',
                    })
                  }
                  className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:border-amber-400 hover:bg-zinc-900 cursor-pointer transition"
                >
                  <div className="text-[10px] text-zinc-500">{item.title}</div>
                  <div className="text-sm font-semibold text-amber-300 mt-0.5">{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. AI TOOLS TAB */}
        {activeTab === 'ai' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-zinc-950 to-zinc-950 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                AI Full Album Auto-Generator
              </div>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                Automatically sequences the entire wedding narrative from Cover to Reception, pairs each ceremony with the optimal template, performs face-safe smart cropping, and builds 10–30 ready-to-edit spreads.
              </p>
              <button
                onClick={onTriggerAiAlbumGenerate}
                className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Sparkles className="w-4 h-4" />
                Generate Full Album Spreads
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
