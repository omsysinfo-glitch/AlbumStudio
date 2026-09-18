import React, { useState } from 'react';
import { ImageAsset, EventType } from '../types';
import { EVENT_BATCHES } from '../data/mockAlbumData';
import {
  Wand2,
  Sparkles,
  X,
  RefreshCw,
  Sliders,
  Check,
  AlertCircle,
  Image as ImageIcon,
  ArrowRight,
  Layers,
  Flame,
  Palette,
  Camera,
} from 'lucide-react';

interface AiImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEventType: EventType;
  onAddGeneratedPhoto: (newAsset: ImageAsset, placeInSlotId?: string) => void;
  onUpdateEditedPhoto: (updatedAsset: ImageAsset, targetSlotId?: string) => void;
  targetSlotId?: string | null;
  photoToEdit?: ImageAsset | null;
}

export const AiImageStudioModal: React.FC<AiImageStudioModalProps> = ({
  isOpen,
  onClose,
  currentEventType,
  onAddGeneratedPhoto,
  onUpdateEditedPhoto,
  targetSlotId,
  photoToEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit'>(
    photoToEdit ? 'edit' : 'generate'
  );

  const eventConfig = EVENT_BATCHES[currentEventType] || EVENT_BATCHES.indian_wedding;

  // Generation State
  const [prompt, setPrompt] = useState(
    eventConfig.aiPromptSuggestions[0] ||
      'Bride in royal crimson lehenga with intricate gold zardozi embroidery and emerald jewelry, warm palace ambient lighting'
  );
  const [aspectRatio, setAspectRatio] = useState<'3:2' | '2:3' | '1:1' | '16:9'>('3:2');
  const [eventCategory, setEventCategory] = useState(
    currentEventType === 'indian_wedding' ? 'Mandap Ceremony' : 'Highlight Moment'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState<ImageAsset | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  // Edit State
  const [editPrompt, setEditPrompt] = useState('Add warm golden hour lighting and soft ambient bokeh glow');
  const [isEditing, setIsEditing] = useState(false);
  const [editedAsset, setEditedAsset] = useState<ImageAsset | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  if (!isOpen) return null;

  // Handle Generate with Gemini 3.1 Flash Image
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGenError(null);
    setGeneratedAsset(null);

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          eventTag: eventCategory,
          title: `Gemini: ${prompt.slice(0, 30)}...`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Image generation failed');
      }

      setGeneratedAsset(data.asset);
    } catch (err: any) {
      console.error('Failed to generate image:', err);
      setGenError(err.message || 'Failed to generate image with Gemini');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to convert an image URL or img element to base64 for editing
  const getBase64FromUrl = async (url: string): Promise<string> => {
    // If it's already a data URI, return as is
    if (url.startsWith('data:')) return url;

    // Otherwise fetch and convert to base64
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Handle Edit with Gemini
  const handleEdit = async () => {
    if (!photoToEdit || !editPrompt.trim()) return;
    setIsEditing(true);
    setEditError(null);
    setEditedAsset(null);

    try {
      const base64Data = await getBase64FromUrl(photoToEdit.url);

      const res = await fetch('/api/gemini/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: 'image/jpeg',
          prompt: editPrompt,
          originalAsset: photoToEdit,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Image editing failed');
      }

      setEditedAsset(data.asset);
    } catch (err: any) {
      console.error('Failed to edit image:', err);
      setEditError(err.message || 'Failed to edit image with Gemini');
    } finally {
      setIsEditing(false);
    }
  };

  const handleApplyGenerated = () => {
    if (generatedAsset) {
      onAddGeneratedPhoto(generatedAsset, targetSlotId || undefined);
      onClose();
    }
  };

  const handleApplyEdited = () => {
    if (editedAsset) {
      onUpdateEditedPhoto(editedAsset, targetSlotId || undefined);
      onClose();
    }
  };

  const indianWeddingCeremonies = [
    'Mehendi Ritual',
    'Haldi Petals',
    'Sangeet Dance',
    'Baraat Entry',
    'Varmala Mandap',
    'Saat Phere Fire',
    'Palace Reception',
    'Jewelry & Kaleere',
  ];

  const quickEditPresets = [
    'Add warm golden hour lighting and soft ambient bokeh glow',
    'Enhance vibrant marigold flower garlands and traditional red-gold colors',
    'Add magical falling golden sparklers and fairy lights in background',
    'Render with rich Kodachrome vintage film grain and depth',
    'Soft focus dreamy bridal portrait with gentle window flare',
  ];

  return (
    <div
      id="ai-image-studio-modal-backdrop"
      className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="ai-image-studio-modal-card"
        className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full text-stone-100 shadow-2xl overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-stone-100 flex items-center gap-2">
                <span>AI Photo Studio</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  gemini-3.1-flash-image
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Generate high-resolution event photos or edit existing spread photos with natural language
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-stone-800 px-6 bg-stone-950/30">
          <button
            onClick={() => setActiveTab('generate')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'generate'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generate New Photo</span>
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'edit'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Edit Existing Photo</span>
            {photoToEdit && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: GENERATE NEW PHOTO */}
          {activeTab === 'generate' && (
            <div className="space-y-4">
              {/* Event Badge Context */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-stone-300 font-medium">{eventConfig.name}</span>
                  <span className="text-stone-500 font-mono text-[11px]">({eventConfig.tag})</span>
                </div>
                <span className="text-[10px] text-stone-400">300 DPI Print Ready Output</span>
              </div>

              {/* Ceremony / Category Tag Picker (if Indian Wedding) */}
              {currentEventType === 'indian_wedding' && (
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5 block">
                    Ceremony / Ritual
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {indianWeddingCeremonies.map((ceremony) => (
                      <button
                        key={ceremony}
                        onClick={() => setEventCategory(ceremony)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                          eventCategory === ceremony
                            ? 'bg-amber-500 text-stone-950 font-semibold'
                            : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                        }`}
                      >
                        {ceremony}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Prompt Input */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5 flex items-center justify-between">
                  <span>Photo Description Prompt</span>
                  <span className="text-stone-500 text-[10px] lowercase">be descriptive about attire &amp; lighting</span>
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Royal bride in crimson lehenga during varmala exchange under floral canopy with golden bokeh..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs placeholder:text-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Quick Prompt Suggestion Chips */}
              <div>
                <div className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mb-1.5">
                  Suggested Prompts for {eventConfig.tag}:
                </div>
                <div className="space-y-1.5">
                  {eventConfig.aiPromptSuggestions.slice(0, 3).map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(sug)}
                      className="w-full text-left p-2 rounded-lg bg-stone-950/60 hover:bg-stone-950 border border-stone-850 hover:border-stone-750 text-[11px] text-stone-300 transition-colors flex items-start gap-2"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{sug}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Selector */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5 block">
                  Spread Slot Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: '3:2', label: '3:2 Landscape', sub: 'Hero & Duo' },
                    { id: '2:3', label: '2:3 Portrait', sub: 'Full Page' },
                    { id: '1:1', label: '1:1 Square', sub: 'Instagram' },
                    { id: '16:9', label: '16:9 Panorama', sub: 'Double Spread' },
                  ].map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id as any)}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        aspectRatio === ratio.id
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-stone-800 bg-stone-950 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <div className="text-xs font-semibold">{ratio.label}</div>
                      <div className="text-[9px] text-stone-500">{ratio.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {genError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{genError}</span>
                </div>
              )}

              {/* Generated Result Preview */}
              {generatedAsset && (
                <div className="p-3.5 rounded-xl bg-stone-950 border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      Generated Successfully
                    </span>
                    <span className="text-stone-400 text-[10px] font-mono">
                      {generatedAsset.width} &times; {generatedAsset.height} px
                    </span>
                  </div>

                  <div className="relative aspect-[3/2] max-h-56 rounded-lg overflow-hidden border border-stone-800 bg-stone-900 mx-auto">
                    <img
                      src={generatedAsset.url}
                      alt={generatedAsset.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-medium flex items-center gap-1.5 border border-stone-800 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Regenerate</span>
                    </button>
                    <button
                      onClick={handleApplyGenerated}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {targetSlotId ? 'Place into Frame Slot' : 'Add to Album Tray'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Generate Trigger Button (when not yet generated) */}
              {!generatedAsset && (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Photo with Gemini 3.1 Flash Image...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Event Photo</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* TAB 2: EDIT EXISTING PHOTO */}
          {activeTab === 'edit' && (
            <div className="space-y-4">
              {!photoToEdit ? (
                <div className="text-center py-8 text-stone-400 text-xs space-y-2">
                  <ImageIcon className="w-8 h-8 mx-auto text-stone-600" />
                  <p>No photo currently selected for editing.</p>
                  <p className="text-stone-500 text-[11px]">
                    Select a frame slot on the canvas or click a photo in the sidebar tray, then click &quot;Edit with AI&quot;.
                  </p>
                </div>
              ) : (
                <>
                  {/* Photo Preview & Switcher */}
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <span className="text-[10px] text-stone-500 uppercase font-semibold mb-1 block">
                        Source Image
                      </span>
                      <div className="relative aspect-[3/2] rounded-lg overflow-hidden border border-stone-800 bg-stone-950">
                        <img
                          src={photoToEdit.url}
                          alt={photoToEdit.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-500 uppercase font-semibold mb-1 block">
                        {editedAsset ? 'Edited Result' : 'Target Transformation'}
                      </span>
                      <div className="relative aspect-[3/2] rounded-lg overflow-hidden border border-stone-800 bg-stone-950 flex items-center justify-center">
                        {editedAsset ? (
                          <img
                            src={editedAsset.url}
                            alt="Edited"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-stone-600 text-center text-xs p-3">
                            <Sparkles className="w-5 h-5 mx-auto mb-1 text-stone-600" />
                            <span>Preview will appear here</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Edit Prompt Input */}
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5 block">
                      Edit Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g. Add warm sunset glow, enhance marigold garland petals, add festive bokeh lights..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs placeholder:text-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  {/* Quick Edit Presets */}
                  <div>
                    <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mb-1.5 block">
                      Quick Visual Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickEditPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => setEditPrompt(preset)}
                          className="px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-stone-850 text-stone-300 border border-stone-800 hover:border-stone-700 text-[11px] text-left transition-colors"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error Message */}
                  {editError && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{editError}</span>
                    </div>
                  )}

                  {/* Edit Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    {editedAsset ? (
                      <>
                        <button
                          onClick={handleEdit}
                          disabled={isEditing}
                          className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-medium flex items-center gap-1.5 border border-stone-800 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Try Another Edit</span>
                        </button>
                        <button
                          onClick={handleApplyEdited}
                          className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save &amp; Update Spread</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEdit}
                        disabled={isEditing || !editPrompt.trim()}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isEditing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Editing Photo with Gemini 3.1 Flash Image...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            <span>Apply AI Edit to Photo</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
