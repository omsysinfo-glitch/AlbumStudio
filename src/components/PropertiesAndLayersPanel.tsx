import React, { useState } from 'react';
import {
  AlbumSheet,
  AlbumObject,
  PhotoObject,
  TextObject,
  KarizmaPhoto,
} from '../types/karizma';
import {
  Sliders,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Move,
  Crop,
  Palette,
  Type,
} from 'lucide-react';

interface PropertiesAndLayersPanelProps {
  currentSheet: AlbumSheet;
  selectedObjectId: string | null;
  photosMap: Map<string, KarizmaPhoto>;
  onSelectObject: (objectId: string | null) => void;
  onUpdateObject: (objectId: string, updates: Partial<AlbumObject>) => void;
  onDuplicateObject: (objectId: string) => void;
  onDeleteObject: (objectId: string) => void;
  onReorderObject: (objectId: string, direction: 'up' | 'down') => void;
  onOpenAiReplace: (slot: PhotoObject) => void;
  onSmartFaceCrop: (slot: PhotoObject) => void;
}

export const PropertiesAndLayersPanel: React.FC<PropertiesAndLayersPanelProps> = ({
  currentSheet,
  selectedObjectId,
  photosMap,
  onSelectObject,
  onUpdateObject,
  onDuplicateObject,
  onDeleteObject,
  onReorderObject,
  onOpenAiReplace,
  onSmartFaceCrop,
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'layers'>('properties');

  const selectedObject = currentSheet.objects.find((o) => o.id === selectedObjectId);

  return (
    <aside className="w-80 border-l border-zinc-800 bg-zinc-900 flex flex-col h-full overflow-hidden text-zinc-100 select-none">
      {/* Tab Switcher */}
      <div className="h-11 border-b border-zinc-800 bg-zinc-950/70 flex items-center px-3 gap-2">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'properties'
              ? 'bg-zinc-800 text-amber-300 shadow border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Properties
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'layers'
              ? 'bg-zinc-800 text-amber-300 shadow border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Layers ({currentSheet.objects.length})
        </button>
      </div>

      {/* Tab 1: Properties Inspector */}
      {activeTab === 'properties' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {!selectedObject ? (
            <div className="text-center py-16 text-zinc-500 space-y-2">
              <Move className="w-8 h-8 mx-auto opacity-30" />
              <p className="font-medium text-zinc-300">No Element Selected</p>
              <p className="text-[11px] leading-relaxed">
                Click any photo frame, title, or motif on the spread to adjust its geometry, borders, crop, or typography.
              </p>
            </div>
          ) : (
            <>
              {/* Common Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    {selectedObject.type} OBJECT
                  </span>
                  <input
                    type="text"
                    value={selectedObject.name}
                    onChange={(e) => onUpdateObject(selectedObject.id, { name: e.target.value })}
                    className="block w-full bg-transparent font-semibold text-zinc-100 text-sm focus:outline-none focus:border-b border-amber-400 mt-0.5"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateObject(selectedObject.id, { isLocked: !selectedObject.isLocked })}
                    className={`p-1.5 rounded hover:bg-zinc-800 ${
                      selectedObject.isLocked ? 'text-amber-400' : 'text-zinc-400'
                    }`}
                    title={selectedObject.isLocked ? 'Unlock element' : 'Lock element'}
                  >
                    {selectedObject.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onDeleteObject(selectedObject.id)}
                    className="p-1.5 rounded text-red-400 hover:bg-zinc-800"
                    title="Delete Element"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Geometry (Position & Dimensions in Inches) */}
              <div className="space-y-2">
                <h5 className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                  Spread Position & Size (36" × 12")
                </h5>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">X (INCHES)</span>
                    <span className="text-zinc-200">{(selectedObject.x * 36).toFixed(1)}"</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Y (INCHES)</span>
                    <span className="text-zinc-200">{(selectedObject.y * 12).toFixed(1)}"</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">WIDTH</span>
                    <span className="text-zinc-200">{(selectedObject.width * 36).toFixed(1)}"</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">HEIGHT</span>
                    <span className="text-zinc-200">{(selectedObject.height * 12).toFixed(1)}"</span>
                  </div>
                </div>
              </div>

              {/* PHOTO SPECIFIC PROPERTIES */}
              {selectedObject.type === 'photo' && (
                <>
                  {/* AI Quick Actions */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                    <h5 className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                      AI Karizma Tools
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onOpenAiReplace(selectedObject as PhotoObject)}
                        className="p-2 rounded-lg bg-amber-500 text-black font-semibold flex items-center justify-center gap-1.5 hover:bg-amber-400 shadow"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Replace
                      </button>
                      <button
                        onClick={() => onSmartFaceCrop(selectedObject as PhotoObject)}
                        className="p-2 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold flex items-center justify-center gap-1.5 hover:bg-zinc-700"
                      >
                        <Crop className="w-3.5 h-3.5 text-amber-400" />
                        Face-Safe Crop
                      </button>
                    </div>
                  </div>

                  {/* Crop, Zoom & Pan */}
                  <div className="space-y-3 pt-2 border-t border-zinc-800">
                    <h5 className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                      Frame Pan & Zoom
                    </h5>
                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Zoom Level:</span>
                        <span className="text-zinc-200 font-mono">{(selectedObject as PhotoObject).zoom.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="3.0"
                        step="0.05"
                        value={(selectedObject as PhotoObject).zoom}
                        onChange={(e) =>
                          onUpdateObject(selectedObject.id, { zoom: parseFloat(e.target.value) })
                        }
                        className="w-full accent-amber-400"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                        <span>Vertical Pan (Y):</span>
                        <span className="text-zinc-200 font-mono">{(selectedObject as PhotoObject).cropPanY}%</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={(selectedObject as PhotoObject).cropPanY}
                        onChange={(e) =>
                          onUpdateObject(selectedObject.id, { cropPanY: parseInt(e.target.value) })
                        }
                        className="w-full accent-amber-400"
                      />
                    </div>
                  </div>

                  {/* Borders & Styling */}
                  <div className="space-y-3 pt-2 border-t border-zinc-800">
                    <h5 className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                      Frame Borders & Shadow
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1">Border Width</label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={(selectedObject as PhotoObject).borderWidth}
                          onChange={(e) =>
                            onUpdateObject(selectedObject.id, { borderWidth: parseInt(e.target.value) || 0 })
                          }
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1">Border Style</label>
                        <select
                          value={(selectedObject as PhotoObject).borderStyle}
                          onChange={(e) =>
                            onUpdateObject(selectedObject.id, { borderStyle: e.target.value as any })
                          }
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-100"
                        >
                          <option value="solid">Solid</option>
                          <option value="double">Royal Double</option>
                          <option value="groove">Groove</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">Border Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(selectedObject as PhotoObject).borderColor}
                          onChange={(e) =>
                            onUpdateObject(selectedObject.id, { borderColor: e.target.value })
                          }
                          className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={(selectedObject as PhotoObject).borderColor}
                          onChange={(e) =>
                            onUpdateObject(selectedObject.id, { borderColor: e.target.value })
                          }
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* TEXT SPECIFIC PROPERTIES */}
              {selectedObject.type === 'text' && (
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <h5 className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                    Typography & Heading
                  </h5>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Text String</label>
                    <textarea
                      rows={2}
                      value={(selectedObject as TextObject).text}
                      onChange={(e) => onUpdateObject(selectedObject.id, { text: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-100 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Font Family</label>
                    <select
                      value={(selectedObject as TextObject).fontFamily}
                      onChange={(e) => onUpdateObject(selectedObject.id, { fontFamily: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-100"
                    >
                      <option value="Cinzel, serif">Cinzel (Royal Serif)</option>
                      <option value="Playfair Display, serif">Playfair Display (Luxury)</option>
                      <option value="Cormorant Garamond, serif">Cormorant Garamond</option>
                      <option value="Montserrat, sans-serif">Montserrat (Modern Clean)</option>
                      <option value="Great Vibes, cursive">Great Vibes (Script Calligraphy)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">Font Size (pt)</label>
                      <input
                        type="number"
                        min="10"
                        max="72"
                        value={(selectedObject as TextObject).fontSize}
                        onChange={(e) =>
                          onUpdateObject(selectedObject.id, { fontSize: parseInt(e.target.value) || 16 })
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">Letter Spacing (px)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={(selectedObject as TextObject).letterSpacing}
                        onChange={(e) =>
                          onUpdateObject(selectedObject.id, { letterSpacing: parseInt(e.target.value) || 0 })
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={(selectedObject as TextObject).color}
                        onChange={(e) => onUpdateObject(selectedObject.id, { color: e.target.value })}
                        className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={(selectedObject as TextObject).color}
                        onChange={(e) => onUpdateObject(selectedObject.id, { color: e.target.value })}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab 2: Photoshop-like Layers Stack */}
      {activeTab === 'layers' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="text-[11px] text-zinc-400 px-1 pb-1 flex justify-between">
            <span>Layers Stack (Z-Index)</span>
            <span>{currentSheet.objects.length} Elements</span>
          </div>

          {currentSheet.objects
            .slice()
            .sort((a, b) => b.zIndex - a.zIndex)
            .map((obj) => {
              const isSelected = selectedObjectId === obj.id;
              return (
                <div
                  key={obj.id}
                  onClick={() => onSelectObject(obj.id)}
                  className={`p-2 rounded-lg border transition flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/60 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {obj.type.slice(0, 3).toUpperCase()}
                    </span>
                    <span className="text-xs font-medium truncate">{obj.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onUpdateObject(obj.id, { isLocked: !obj.isLocked })}
                      className={`p-1 rounded hover:bg-zinc-800 ${obj.isLocked ? 'text-amber-400' : 'text-zinc-500'}`}
                      title="Toggle Lock"
                    >
                      {obj.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onReorderObject(obj.id, 'up')}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-[10px]"
                      title="Move Layer Up"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => onReorderObject(obj.id, 'down')}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-[10px]"
                      title="Move Layer Down"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => onDeleteObject(obj.id)}
                      className="p-1 rounded text-red-400 hover:bg-zinc-800"
                      title="Delete Layer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </aside>
  );
};
