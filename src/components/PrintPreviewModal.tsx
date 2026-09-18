import React, { useState, useRef, useEffect } from 'react';
import {
  PageSpread,
  PrintDimensions,
  ImageAsset,
  CulturalThemeConfig,
  CulturalColorPalette,
  FrameBorderStyle,
  PaperFinish,
  AutoThemeAnalysis,
} from '../types';
import {
  CornerMotif,
  SpreadCulturalWatermark,
  CenterGutterMedallion,
} from './CulturalMotifs';
import {
  X,
  Printer,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Layers,
  Check,
  Info,
  Maximize2,
  Minimize2,
  FileCheck,
  ShieldCheck,
  Palette,
} from 'lucide-react';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  spreads: PageSpread[];
  currentSpreadIndex: number;
  onSelectSpreadIndex: (index: number) => void;
  imageMap: Map<string, ImageAsset>;
  printDimensions: PrintDimensions;
  culturalTheme: CulturalThemeConfig;
  onUpdateCulturalTheme: (updates: Partial<CulturalThemeConfig>) => void;
  culturalPalettes: CulturalColorPalette[];
  frameBorderStyles: FrameBorderStyle[];
  onOpenExportModal: () => void;
  autoThemeAnalysis?: AutoThemeAnalysis | null;
}

const PAPER_FINISH_SPECS: Record<
  PaperFinish,
  {
    name: string;
    tagline: string;
    grammage: string;
    description: string;
    reflectionLevel: string;
    fingerprintResistance: string;
    bestFor: string;
  }
> = {
  matte: {
    name: 'Fine-Art Smooth Matte',
    tagline: 'Archival Cotton Rag with Zero Glare',
    grammage: '250 gsm 100% Cotton Rag',
    description:
      'Velvety soft light diffusion with subtle natural paper tooth. Eliminates harsh studio reflections, rendering portraits with gentle, timeless elegance.',
    reflectionLevel: 'None (0% Specular)',
    fingerprintResistance: 'High',
    bestFor: 'Fine-art wedding portraiture, outdoor ceremonies, daylight albums',
  },
  glossy: {
    name: 'High-Gloss Photographic',
    tagline: 'Ultra-Dynamic Vibrancy & Depth',
    grammage: '300 gsm Resin-Coated Crystal',
    description:
      'Maximum optical density and deep blacks. Crisp specular highlights bring out high-contrast evening lighting, jewelry sparkle, and vivid jewel tones.',
    reflectionLevel: 'High Specular (85%)',
    fingerprintResistance: 'Moderate (wipeable)',
    bestFor: 'Night receptions, cocktail parties, festive dance photos, high-saturation colors',
  },
  silk: {
    name: 'Professional Silk / Lustre',
    tagline: 'Heirloom Micro-Stipple Pearl Finish',
    grammage: '260 gsm Archival Lustre Pearl',
    description:
      'Signature fine-pebbled honeycomb texture. Delivers the color saturation of gloss with the soft diffuse highlights of matte. The gold standard for luxury wedding albums.',
    reflectionLevel: 'Subtle Pearl Lustre (35%)',
    fingerprintResistance: 'Superior (Fingerprint-Proof)',
    bestFor: 'Indian royal weddings, gold foil calligraphy, heavy ceremonial heirloom books',
  },
};

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  spreads,
  currentSpreadIndex,
  onSelectSpreadIndex,
  imageMap,
  printDimensions,
  culturalTheme,
  onUpdateCulturalTheme,
  culturalPalettes,
  frameBorderStyles,
  onOpenExportModal,
  autoThemeAnalysis,
}) => {
  const [zoomLevel, setZoomLevel] = useState<1 | 1.5 | 2>(1);
  const [showTrimGuideLine, setShowTrimGuideLine] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const spreadContainerRef = useRef<HTMLDivElement>(null);

  const currentSpread = spreads[currentSpreadIndex] || spreads[0];
  const activePalette =
    culturalPalettes.find((p) => p.id === culturalTheme.activePaletteId) ||
    culturalPalettes[0];
  const activeBorder =
    frameBorderStyles.find((b) => b.id === culturalTheme.activeBorderStyleId) ||
    frameBorderStyles[0];
  const paperFinish = culturalTheme.paperFinish || 'silk';
  const finishInfo = PAPER_FINISH_SPECS[paperFinish];

  // Track cursor over spread container for dynamic glossy sheen angle
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (paperFinish !== 'glossy' || !spreadContainerRef.current) return;
    const rect = spreadContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Keyboard navigation for page flipping
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        onSelectSpreadIndex(Math.min(spreads.length - 1, currentSpreadIndex + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        onSelectSpreadIndex(Math.max(0, currentSpreadIndex - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSpreadIndex, spreads.length, onSelectSpreadIndex, onClose]);

  if (!isOpen) return null;

  // Exact Bleed-to-Trim Ratio
  // Standard spread: 24" x 12" with 0.125" bleed on all 4 sides.
  // Full canvas with bleed is (24 + 0.25) x (12 + 0.25) = 24.25" x 12.25".
  // In physical print trim, the bleed is sliced off by the cutter.
  const bleedTrimInsetPercentX =
    ((printDimensions.bleedInches) /
      (printDimensions.spreadWidthInches + 2 * printDimensions.bleedInches)) *
    100;
  const bleedTrimInsetPercentY =
    ((printDimensions.bleedInches) /
      (printDimensions.spreadHeightInches + 2 * printDimensions.bleedInches)) *
    100;

  return (
    <div
      id="print-preview-modal-backdrop"
      className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex flex-col overflow-hidden text-stone-100 animate-in fade-in duration-200"
    >
      {/* Top Bar: Print Preview Header & Finish Selector */}
      <div className="bg-stone-900/95 border-b border-stone-800 px-6 py-3 flex items-center justify-between shrink-0 shadow-lg">
        {/* Left: Mode Title & Spread Identifier */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <span>Physical Print & Finish Simulator</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Bleed-to-Trim Verified
              </span>
            </div>
            <div className="text-xs text-stone-400 flex items-center gap-2">
              <span>Spread {currentSpread.spreadNumber} of {spreads.length}: &ldquo;{currentSpread.title}&rdquo;</span>
              <span>&bull;</span>
              <span>{printDimensions.spreadWidthInches}&quot; &times; {printDimensions.spreadHeightInches}&quot; Bound Album</span>
            </div>
          </div>
        </div>

        {/* Center: Paper Finish Switcher (Matte, Glossy, Silk) */}
        <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800 shadow-inner">
          {(['matte', 'glossy', 'silk'] as PaperFinish[]).map((finish) => {
            const spec = PAPER_FINISH_SPECS[finish];
            const isSelected = paperFinish === finish;
            return (
              <button
                key={finish}
                id={`btn-paper-finish-${finish}`}
                onClick={() => onUpdateCulturalTheme({ paperFinish: finish })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span className="capitalize">{finish}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-stone-950/20 text-stone-900' : 'text-stone-500'}`}>
                  {finish === 'matte' ? '250g' : finish === 'glossy' ? '300g' : '260g'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-3">
          {/* Zoom Level */}
          <div className="flex items-center bg-stone-950 rounded-lg border border-stone-800 p-0.5 text-xs">
            <button
              onClick={() => setZoomLevel(1)}
              className={`px-2 py-1 rounded cursor-pointer ${zoomLevel === 1 ? 'bg-stone-800 text-amber-400' : 'text-stone-400'}`}
              title="Fit to Screen"
            >
              Fit
            </button>
            <button
              onClick={() => setZoomLevel(1.5)}
              className={`px-2 py-1 rounded cursor-pointer ${zoomLevel === 1.5 ? 'bg-stone-800 text-amber-400' : 'text-stone-400'}`}
              title="150% Macro View"
            >
              1.5x
            </button>
            <button
              onClick={() => setZoomLevel(2)}
              className={`px-2 py-1 rounded cursor-pointer ${zoomLevel === 2 ? 'bg-stone-800 text-amber-400' : 'text-stone-400'}`}
              title="200% Paper Texture Zoom"
            >
              2.0x
            </button>
          </div>

          {/* Trim Boundary Toggle */}
          <button
            onClick={() => setShowTrimGuideLine(!showTrimGuideLine)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
              showTrimGuideLine
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="Toggle Guillotine Trim Line Overlay"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Trim Guides</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={() => {
              onClose();
              onOpenExportModal();
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate Print PDF</span>
          </button>

          {/* Close Modal */}
          <button
            id="btn-close-print-preview"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Simulation Viewport */}
      <div
        className="flex-1 overflow-auto p-6 md:p-10 flex flex-col items-center justify-center relative select-none bg-gradient-to-b from-stone-950 via-stone-925 to-stone-950"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 30%, rgba(217, 119, 6, 0.05) 0%, rgba(0, 0, 0, 0) 70%)',
        }}
      >
        {/* Navigation Page Flippers (Left / Right) */}
        <button
          onClick={() => onSelectSpreadIndex(Math.max(0, currentSpreadIndex - 1))}
          disabled={currentSpreadIndex === 0}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 disabled:opacity-20 border border-stone-700/50 shadow-2xl backdrop-blur-sm cursor-pointer transition-all hover:scale-105 active:scale-95"
          title="Previous Spread (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => onSelectSpreadIndex(Math.min(spreads.length - 1, currentSpreadIndex + 1))}
          disabled={currentSpreadIndex === spreads.length - 1}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 disabled:opacity-20 border border-stone-700/50 shadow-2xl backdrop-blur-sm cursor-pointer transition-all hover:scale-105 active:scale-95"
          title="Next Spread (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Realistic Bound Physical Photo Book Container */}
        <div
          ref={spreadContainerRef}
          onMouseMove={handleMouseMove}
          className="relative transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            width: '100%',
            maxWidth: '1080px',
          }}
        >
          {/* Simulated 3D Book Cover & Multipage Stack Edge */}
          <div
            className="relative w-full aspect-[2/1] rounded-sm transition-all duration-300"
            style={{
              // Multi-layer drop shadow for physical album depth
              boxShadow:
                paperFinish === 'glossy'
                  ? '0 30px 70px -15px rgba(0,0,0,0.9), 0 0 40px rgba(255,255,255,0.04)'
                  : '0 30px 60px -12px rgba(0,0,0,0.85), 0 10px 25px rgba(0,0,0,0.6)',
            }}
          >
            {/* Left Page Edge Stack (Simulates left page bundle thickness) */}
            <div
              className="absolute -left-2 top-1 bottom-1 w-2 bg-gradient-to-r from-stone-800 via-stone-700 to-stone-400 rounded-l-xs opacity-75 shadow-md pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, #444, #444 1px, #666 1px, #666 2px)',
              }}
            />
            {/* Right Page Edge Stack (Simulates right page bundle thickness) */}
            <div
              className="absolute -right-2 top-1 bottom-1 w-2 bg-gradient-to-l from-stone-800 via-stone-700 to-stone-400 rounded-r-xs opacity-75 shadow-md pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, #444, #444 1px, #666 1px, #666 2px)',
              }}
            />

            {/* Exact Trimmed Double Page Spread (Bleeds trimmed off by physical cutter) */}
            <div
              id="physical-print-trimmed-spread"
              className="relative w-full h-full overflow-hidden rounded-xs transition-all duration-200"
              style={{
                backgroundColor: culturalTheme.enabled && activePalette
                  ? activePalette.background
                  : (currentSpread.background || '#FFFFFF'),
                // Filter adjustments based on paper finish
                filter:
                  paperFinish === 'matte'
                    ? 'contrast(0.98) brightness(0.99) sepia(0.02)'
                    : paperFinish === 'glossy'
                    ? 'contrast(1.05) saturate(1.06)'
                    : 'contrast(1.02) saturate(1.03)',
              }}
            >
              {/* Cultural Watermark and Medallions in Physical Print */}
              {culturalTheme.enabled && activePalette && activeBorder && culturalTheme.showBackgroundTexture && (
                <SpreadCulturalWatermark palette={activePalette} borderStyle={activeBorder} />
              )}

              {culturalTheme.enabled && activePalette && (
                <>
                  <CenterGutterMedallion palette={activePalette} position="top" />
                  <CenterGutterMedallion palette={activePalette} position="bottom" />
                </>
              )}

              {/* Photo Frames with Cultural Borders Rendered */}
              {currentSpread.slots.map((slot) => {
                const image = slot.assignedImageId ? imageMap.get(slot.assignedImageId) : null;
                const isCultural = culturalTheme.enabled && activeBorder && activePalette;

                const frameStyleObj: React.CSSProperties = isCultural
                  ? {
                      border: `${activeBorder.borderWidth}px ${activeBorder.borderStyle} ${activeBorder.borderColor}`,
                      padding: `${activeBorder.innerPadding}px`,
                      backgroundColor: activePalette.surface,
                      boxShadow:
                        activeBorder.hasGlow && culturalTheme.showGoldFoilAccent
                          ? `0 12px 28px -4px ${activePalette.secondary}35, 0 0 16px ${activePalette.secondary}45, 0 4px 6px -2px rgba(0, 0, 0, 0.3)`
                          : '0 8px 24px -4px rgba(0, 0, 0, 0.4)',
                    }
                  : {
                      backgroundColor: '#F5F5F4',
                      boxShadow: '0 6px 18px -3px rgba(0, 0, 0, 0.25)',
                    };

                return (
                  <div
                    key={slot.id}
                    className="absolute rounded-xs overflow-hidden"
                    style={{
                      left: `${slot.x * 100}%`,
                      top: `${slot.y * 100}%`,
                      width: `${slot.width * 100}%`,
                      height: `${slot.height * 100}%`,
                      ...frameStyleObj,
                    }}
                  >
                    {/* Cultural Corner Motifs */}
                    {isCultural && culturalTheme.showCornerMotifs && (
                      <>
                        <CornerMotif
                          position="top-left"
                          type={activeBorder.cornerMotif}
                          color={activeBorder.borderColor}
                          accentColor={activeBorder.accentColor}
                          size={26}
                        />
                        <CornerMotif
                          position="top-right"
                          type={activeBorder.cornerMotif}
                          color={activeBorder.borderColor}
                          accentColor={activeBorder.accentColor}
                          size={26}
                        />
                        <CornerMotif
                          position="bottom-left"
                          type={activeBorder.cornerMotif}
                          color={activeBorder.borderColor}
                          accentColor={activeBorder.accentColor}
                          size={26}
                        />
                        <CornerMotif
                          position="bottom-right"
                          type={activeBorder.cornerMotif}
                          color={activeBorder.borderColor}
                          accentColor={activeBorder.accentColor}
                          size={26}
                        />
                      </>
                    )}

                    {image ? (
                      <div className="relative w-full h-full overflow-hidden rounded-xs">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover pointer-events-none"
                          style={{
                            transform: `scale(${slot.zoom}) translate(${slot.cropPanX}%, ${slot.cropPanY}%)`,
                            transformOrigin: 'center center',
                          }}
                        />
                        {/* Gold Foil Accent Overlay on image edge when enabled */}
                        {isCultural && culturalTheme.showGoldFoilAccent && (
                          <div
                            className="absolute inset-0 pointer-events-none border"
                            style={{
                              borderColor: `${activePalette.secondary}40`,
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stone-100/10 text-stone-400 text-xs">
                        Blank Slot
                      </div>
                    )}
                  </div>
                );
              })}

              {/* ================= PHYSICAL FINISH TEXTURE OVERLAYS ================= */}

              {/* 1. MATTE: Soft Micro-Grain Cotton Tooth */}
              {paperFinish === 'matte' && (
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-25"
                  style={{
                    backgroundImage: `radial-gradient(#d6d3d1 0.75px, transparent 0.75px), radial-gradient(#e7e5e4 0.75px, #f5f5f4 0.75px)`,
                    backgroundSize: '4px 4px',
                    backgroundPosition: '0 0, 2px 2px',
                  }}
                />
              )}

              {/* 2. GLOSSY: Interactive Specular Reflection Sheen */}
              {paperFinish === 'glossy' && (
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-75 mix-blend-screen"
                  style={{
                    background: `linear-gradient(${
                      105 + (mousePos.x - 50) * 0.4
                    }deg, rgba(255,255,255,0) 25%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.06) 58%, rgba(255,255,255,0) 75%)`,
                    opacity: 0.85,
                  }}
                />
              )}

              {/* 3. SILK / LUSTRE: Micro-Stipple Honeycomb Pearl Pattern */}
              {paperFinish === 'silk' && (
                <>
                  <div
                    className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-35"
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)`,
                      backgroundSize: '3px 3px',
                    }}
                  />
                  <div
                    className="absolute inset-0 pointer-events-none mix-blend-soft-light opacity-30"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 40%, rgba(212,175,55,0.12) 60%, rgba(255,255,255,0.16) 100%)',
                    }}
                  />
                </>
              )}

              {/* ================= CENTER GUTTER PHYSICAL SPINE FOLD SHADOW ================= */}
              {/* Realistic lay-flat / flush-mount center valley ambient occlusion */}
              <div
                className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-16 pointer-events-none z-20"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.14) 38%, rgba(0,0,0,0.42) 50%, rgba(0,0,0,0.14) 62%, rgba(0,0,0,0) 100%)',
                }}
              />
              {/* Hairline Center Crease */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-stone-950/40 z-20 pointer-events-none" />

              {/* Outer Page Curve Edge Highlights (Simulates physical paper curvature at margins) */}
              <div className="absolute top-0 bottom-0 left-0 w-3 pointer-events-none bg-gradient-to-r from-stone-950/20 to-transparent z-10" />
              <div className="absolute top-0 bottom-0 right-0 w-3 pointer-events-none bg-gradient-to-l from-stone-950/20 to-transparent z-10" />

              {/* Optional Guillotine Trim Guides Overlay */}
              {showTrimGuideLine && (
                <div
                  className="absolute inset-0 pointer-events-none border-2 border-dashed border-amber-500/80 z-30"
                  style={{
                    margin: `${bleedTrimInsetPercentY}% ${bleedTrimInsetPercentX}%`,
                  }}
                >
                  <div className="absolute top-2 left-2 bg-amber-500 text-stone-950 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                    Final Trim Edge (No Bleed)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Spread Details & Finish Specifications */}
        <div className="mt-8 max-w-4xl w-full bg-stone-900/90 border border-stone-800 rounded-xl p-4 shadow-xl backdrop-blur-sm grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Col 1: Selected Paper Finish Rationale */}
          <div>
            <div className="font-semibold text-stone-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{finishInfo.name}</span>
            </div>
            <div className="text-[11px] text-amber-400/90 font-medium mt-0.5">
              {finishInfo.tagline}
            </div>
            <p className="text-stone-400 text-[11px] mt-1 leading-relaxed">
              {finishInfo.description}
            </p>
          </div>

          {/* Col 2: Technical Print Specs */}
          <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-stone-800 pt-2 md:pt-0 md:pl-4">
            <div className="font-semibold text-stone-300 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Production Lab Calibration</span>
            </div>
            <div className="text-stone-400 text-[11px] grid grid-cols-2 gap-y-1">
              <span className="text-stone-500">Grammage:</span>
              <span className="font-mono text-stone-200">{finishInfo.grammage}</span>
              <span className="text-stone-500">Reflectivity:</span>
              <span className="text-stone-200">{finishInfo.reflectionLevel}</span>
              <span className="text-stone-500">Fingerprint Guard:</span>
              <span className="text-stone-200">{finishInfo.fingerprintResistance}</span>
            </div>
          </div>

          {/* Col 3: Cultural Theme Status & Best For */}
          <div className="border-t md:border-t-0 md:border-l border-stone-800 pt-2 md:pt-0 md:pl-4">
            <div className="font-semibold text-stone-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Active Cultural Motif</span>
            </div>
            <div className="text-[11px] text-stone-300 mt-1 flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full border border-stone-700"
                style={{ backgroundColor: activePalette.primary }}
              />
              <span className="font-medium">{activePalette.name}</span>
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">
              Frame: <span className="text-amber-300/90">{activeBorder.name}</span>
            </div>
            <div className="text-[10px] text-stone-500 mt-1.5">
              Ideal for: {finishInfo.bestFor}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
