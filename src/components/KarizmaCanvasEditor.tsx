import React, { useState, useRef, useEffect } from 'react';
import {
  AlbumSheet,
  AlbumObject,
  PhotoObject,
  TextObject,
  ShapeObject,
  DecorationObject,
  KarizmaPhoto,
  PrintDimensions,
  GuideVisibility,
} from '../types/karizma';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Lock,
  Unlock,
  Eye,
  Crop,
  Layers,
  Move,
  RotateCw,
} from 'lucide-react';

interface KarizmaCanvasEditorProps {
  currentSheet: AlbumSheet;
  photosMap: Map<string, KarizmaPhoto>;
  selectedObjectId: string | null;
  onSelectObject: (objectId: string | null) => void;
  onUpdateObject: (objectId: string, updates: Partial<AlbumObject>) => void;
  onDuplicateObject: (objectId: string) => void;
  onDeleteObject: (objectId: string) => void;
  onReorderObject: (objectId: string, direction: 'up' | 'down') => void;
  onOpenAiReplace: (slot: PhotoObject) => void;
  guides: GuideVisibility;
  onToggleGuide: (key: keyof GuideVisibility) => void;
}

export const KarizmaCanvasEditor: React.FC<KarizmaCanvasEditorProps> = ({
  currentSheet,
  photosMap,
  selectedObjectId,
  onSelectObject,
  onUpdateObject,
  onDuplicateObject,
  onDeleteObject,
  onReorderObject,
  onOpenAiReplace,
  guides,
  onToggleGuide,
}) => {
  const [zoomScale, setZoomScale] = useState(0.85);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialObjState, setInitialObjState] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedObject = currentSheet.objects.find((o) => o.id === selectedObjectId);

  // Keyboard navigation & deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingTextId) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
        onDeleteObject(selectedObjectId);
      } else if (e.key === 'Escape') {
        onSelectObject(null);
      } else if (e.key === 'd' && (e.ctrlKey || e.metaKey) && selectedObjectId) {
        e.preventDefault();
        onDuplicateObject(selectedObjectId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId, editingTextId, onDeleteObject, onDuplicateObject, onSelectObject]);

  // Object dragging handler
  const handleMouseDownObject = (e: React.MouseEvent, obj: AlbumObject) => {
    e.stopPropagation();
    onSelectObject(obj.id);
    if (obj.isLocked) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialObjState({ x: obj.x, y: obj.y, width: obj.width, height: obj.height });
  };

  // Resize handle dragging handler
  const handleMouseDownHandle = (e: React.MouseEvent, handleDirection: string) => {
    e.stopPropagation();
    if (!selectedObject || selectedObject.isLocked) return;

    setIsResizing(handleDirection);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialObjState({
      x: selectedObject.x,
      y: selectedObject.y,
      width: selectedObject.width,
      height: selectedObject.height,
    });
  };

  // Global mouse move & up
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current || !initialObjState || !selectedObjectId) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaXNorm = (e.clientX - dragStart.x) / rect.width;
      const deltaYNorm = (e.clientY - dragStart.y) / rect.height;

      if (isDragging) {
        const newX = Math.max(0, Math.min(1 - initialObjState.width, initialObjState.x + deltaXNorm));
        const newY = Math.max(0, Math.min(1 - initialObjState.height, initialObjState.y + deltaYNorm));
        onUpdateObject(selectedObjectId, { x: newX, y: newY });
      } else if (isResizing) {
        let newX = initialObjState.x;
        let newY = initialObjState.y;
        let newW = initialObjState.width;
        let newH = initialObjState.height;

        if (isResizing.includes('e')) newW = Math.max(0.04, initialObjState.width + deltaXNorm);
        if (isResizing.includes('s')) newH = Math.max(0.04, initialObjState.height + deltaYNorm);
        if (isResizing.includes('w')) {
          const diff = Math.min(initialObjState.width - 0.04, deltaXNorm);
          newX = initialObjState.x + diff;
          newW = initialObjState.width - diff;
        }
        if (isResizing.includes('n')) {
          const diff = Math.min(initialObjState.height - 0.04, deltaYNorm);
          newY = initialObjState.y + diff;
          newH = initialObjState.height - diff;
        }

        onUpdateObject(selectedObjectId, { x: newX, y: newY, width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, initialObjState, selectedObjectId, onUpdateObject]);

  return (
    <div
      ref={containerRef}
      onClick={() => onSelectObject(null)}
      className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden relative select-none"
    >
      {/* Top Canvas Controls Bar */}
      <div className="h-10 px-4 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between z-20 text-xs text-zinc-300">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-zinc-200">
            SPREAD {String(currentSheet.sheetNumber).padStart(2, '0')} : {currentSheet.title}
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-amber-400 font-mono">12" × 36" Karizma Spread</span>
        </div>

        {/* Guides Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleGuide('gutter')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              guides.gutter ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Center Spine
          </button>
          <button
            onClick={() => onToggleGuide('bleed')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              guides.bleed ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Bleed (0.125")
          </button>
          <button
            onClick={() => onToggleGuide('safeZone')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              guides.safeZone ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Safe Zone
          </button>

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-zinc-950 px-1 py-0.5 rounded border border-zinc-800">
            <button
              onClick={() => setZoomScale((z) => Math.max(0.4, z - 0.1))}
              className="p-1 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-12 text-center font-mono text-[11px]">{Math.round(zoomScale * 100)}%</span>
            <button
              onClick={() => setZoomScale((z) => Math.min(1.8, z + 0.1))}
              className="p-1 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomScale(0.85)}
              className="p-1 hover:text-white ml-1 border-l border-zinc-800"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8 relative">
        {/* Rulers Container */}
        <div
          className="relative shadow-2xl transition-transform duration-75"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Spread Canvas Box: 12" x 36" Aspect Ratio (3:1) */}
          <div
            ref={canvasRef}
            className="w-[1080px] h-[360px] relative rounded shadow-2xl overflow-hidden border border-zinc-700 select-none"
            style={{
              background:
                currentSheet.background.type === 'gradient'
                  ? currentSheet.background.value
                  : currentSheet.background.value || '#15060A',
            }}
          >
            {/* Bleed Guide (Red dashed boundary 0.125" from edge) */}
            {guides.bleed && (
              <div className="absolute inset-1.5 border border-dashed border-red-500/40 pointer-events-none z-10" />
            )}

            {/* Safe Zone (Green dashed boundary 0.5" from edge) */}
            {guides.safeZone && (
              <div className="absolute inset-5 border border-dashed border-emerald-500/40 pointer-events-none z-10" />
            )}

            {/* Center Gutter Fold Line (36" spread fold at 18" = 50%) */}
            {guides.gutter && (
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-10 flex items-center justify-center">
                <div className="h-full w-px bg-amber-400/50 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                <div className="absolute top-2 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-amber-300">
                  CENTER SPINE FOLD
                </div>
              </div>
            )}

            {/* Render Objects */}
            {currentSheet.objects
              .slice()
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((obj) => {
                const isSelected = selectedObjectId === obj.id;

                if (obj.type === 'photo') {
                  const photo = obj.photoId ? photosMap.get(obj.photoId) : null;
                  return (
                    <div
                      key={obj.id}
                      onMouseDown={(e) => handleMouseDownObject(e, obj)}
                      className={`absolute cursor-move transition-shadow ${
                        isSelected ? 'ring-2 ring-amber-400 z-30' : ''
                      }`}
                      style={{
                        left: `${obj.x * 100}%`,
                        top: `${obj.y * 100}%`,
                        width: `${obj.width * 100}%`,
                        height: `${obj.height * 100}%`,
                        borderWidth: `${obj.borderWidth}px`,
                        borderColor: obj.borderColor,
                        borderStyle: obj.borderStyle === 'none' ? 'none' : obj.borderStyle,
                        borderRadius: `${obj.borderRadius}px`,
                        boxShadow: `${obj.shadowOffsetX}px ${obj.shadowOffsetY}px ${obj.shadowBlur}px ${obj.shadowColor}`,
                        opacity: obj.opacity,
                        zIndex: isSelected ? 40 : obj.zIndex,
                        overflow: 'hidden',
                      }}
                    >
                      {photo ? (
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full object-cover pointer-events-none select-none"
                          style={{
                            transform: `scale(${obj.zoom}) translate(${obj.cropPanX}%, ${obj.cropPanY}%)`,
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800/80 flex flex-col items-center justify-center text-zinc-400 text-xs p-2 text-center">
                          <span className="font-semibold text-zinc-300">{obj.name}</span>
                          <span className="text-[10px] text-zinc-500">Drag photo or click AI Replace</span>
                        </div>
                      )}
                    </div>
                  );
                }

                if (obj.type === 'text') {
                  return (
                    <div
                      key={obj.id}
                      onMouseDown={(e) => handleMouseDownObject(e, obj)}
                      onDoubleClick={() => setEditingTextId(obj.id)}
                      className={`absolute cursor-move flex items-center justify-center ${
                        isSelected ? 'ring-2 ring-amber-400 z-30' : ''
                      }`}
                      style={{
                        left: `${obj.x * 100}%`,
                        top: `${obj.y * 100}%`,
                        width: `${obj.width * 100}%`,
                        height: `${obj.height * 100}%`,
                        opacity: obj.opacity,
                        zIndex: isSelected ? 40 : obj.zIndex,
                        textAlign: obj.textAlign,
                      }}
                    >
                      {editingTextId === obj.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={obj.text}
                          onChange={(e) => onUpdateObject(obj.id, { text: e.target.value })}
                          onBlur={() => setEditingTextId(null)}
                          className="w-full bg-black/80 border border-amber-400 rounded px-2 py-1 text-zinc-100 text-center focus:outline-none"
                          style={{
                            fontFamily: obj.fontFamily,
                            fontSize: `${obj.fontSize * 0.9}px`,
                            color: obj.color,
                          }}
                        />
                      ) : (
                        <span
                          className="select-none pointer-events-none"
                          style={{
                            fontFamily: obj.fontFamily,
                            fontSize: `${obj.fontSize * 0.9}px`,
                            fontWeight: obj.fontWeight,
                            color: obj.color,
                            letterSpacing: `${obj.letterSpacing}px`,
                            textTransform: obj.textTransform,
                          }}
                        >
                          {obj.text}
                        </span>
                      )}
                    </div>
                  );
                }

                if (obj.type === 'decoration') {
                  return (
                    <div
                      key={obj.id}
                      onMouseDown={(e) => handleMouseDownObject(e, obj)}
                      className={`absolute cursor-move flex items-center justify-center ${
                        isSelected ? 'ring-2 ring-amber-400 z-30' : ''
                      }`}
                      style={{
                        left: `${obj.x * 100}%`,
                        top: `${obj.y * 100}%`,
                        width: `${obj.width * 100}%`,
                        height: `${obj.height * 100}%`,
                        opacity: obj.opacity,
                        zIndex: isSelected ? 40 : obj.zIndex,
                      }}
                    >
                      {/* Stylized Indian Wedding Motif */}
                      <svg viewBox="0 0 100 100" className="w-full h-full" fill={obj.tintColor}>
                        <circle cx="50" cy="50" r="40" fill="none" stroke={obj.tintColor} strokeWidth="3" />
                        <path
                          d="M50 10 C55 30 70 45 90 50 C70 55 55 70 50 90 C45 70 30 55 10 50 C30 45 45 30 50 10 Z"
                          fill={obj.tintColor}
                          opacity="0.8"
                        />
                      </svg>
                    </div>
                  );
                }

                return null;
              })}

            {/* Transform Bounding Box Handles for Selected Object */}
            {selectedObject && (
              <div
                className="absolute pointer-events-none z-50 border-2 border-amber-400 shadow-xl"
                style={{
                  left: `${selectedObject.x * 100}%`,
                  top: `${selectedObject.y * 100}%`,
                  width: `${selectedObject.width * 100}%`,
                  height: `${selectedObject.height * 100}%`,
                }}
              >
                {/* 8 Resize Handles */}
                {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((dir) => {
                  let posClass = '';
                  if (dir === 'nw') posClass = '-top-1.5 -left-1.5 cursor-nwse-resize';
                  if (dir === 'n') posClass = '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize';
                  if (dir === 'ne') posClass = '-top-1.5 -right-1.5 cursor-nesw-resize';
                  if (dir === 'e') posClass = 'top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize';
                  if (dir === 'se') posClass = '-bottom-1.5 -right-1.5 cursor-nwse-resize';
                  if (dir === 's') posClass = '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize';
                  if (dir === 'sw') posClass = '-bottom-1.5 -left-1.5 cursor-nesw-resize';
                  if (dir === 'w') posClass = 'top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize';

                  return (
                    <div
                      key={dir}
                      onMouseDown={(e) => handleMouseDownHandle(e, dir)}
                      className={`absolute w-3 h-3 bg-amber-400 border border-black rounded-sm pointer-events-auto shadow ${posClass}`}
                    />
                  );
                })}

                {/* Floating Quick Action Toolbar above selection */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-950/95 border border-zinc-700 px-2 py-1 rounded-lg shadow-2xl pointer-events-auto backdrop-blur">
                  {selectedObject.type === 'photo' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAiReplace(selectedObject as PhotoObject);
                      }}
                      className="px-2 py-1 rounded bg-amber-500 text-black text-[11px] font-bold flex items-center gap-1 hover:bg-amber-400 shadow"
                    >
                      <Sparkles className="w-3 h-3" />
                      AI Replace
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateObject(selectedObject.id);
                    }}
                    className="p-1 rounded text-zinc-300 hover:text-white hover:bg-zinc-800"
                    title="Duplicate (Ctrl+D)"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderObject(selectedObject.id, 'up');
                    }}
                    className="p-1 rounded text-zinc-300 hover:text-white hover:bg-zinc-800"
                    title="Bring Forward"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderObject(selectedObject.id, 'down');
                    }}
                    className="p-1 rounded text-zinc-300 hover:text-white hover:bg-zinc-800"
                    title="Send Backward"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteObject(selectedObject.id);
                    }}
                    className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-zinc-800"
                    title="Delete (Del)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
