import React, { useState, useMemo } from 'react';
import {
  ImageAsset,
  Orientation,
  EventType,
  CulturalThemeConfig,
  CulturalColorPalette,
  FrameBorderStyle,
  AutoThemeAnalysis,
  PaperFinish,
} from '../types';
import {
  TimestampCluster,
  OrientationFilter,
  PlacementFilter,
  QualityTierFilter,
  SortOption,
  PhotoFilterState,
  DEFAULT_FILTER_STATE,
  buildTimestampClusters,
  applyPhotoFilters,
  formatTime,
  formatDate,
} from '../utils/photoFilters';
import { DraggablePhotoCard } from './DraggablePhotoCard';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Filter,
  Sparkles,
  Layers,
  Clock,
  User,
  Plus,
  Wand2,
  Tag,
  Palette,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkle,
  Sliders,
  Maximize2,
  Printer,
  FileCheck,
  Star,
  RotateCcw,
  Search,
  X,
  ArrowUpDown,
  ArrowLeftRight,
  Calendar,
  Grid,
  SlidersHorizontal,
} from 'lucide-react';

interface PhotoPoolSidebarProps {
  photos: ImageAsset[];
  assignedImageIds: Set<string>;
  onUploadPhotos: (newPhotos: ImageAsset[]) => void;
  onSelectPhotoPreview: (photo: ImageAsset) => void;
  onTriggerAutoSolver: () => void;
  onOpenAiStudio: (photoToEdit?: ImageAsset) => void;
  currentEventType?: EventType;
  culturalTheme: CulturalThemeConfig;
  onUpdateCulturalTheme: (updates: Partial<CulturalThemeConfig>) => void;
  culturalPalettes: CulturalColorPalette[];
  frameBorderStyles: FrameBorderStyle[];
  onTriggerAutoTheme?: () => void;
  autoThemeAnalysis?: AutoThemeAnalysis | null;
  onOpenPrintPreview?: () => void;
}

export const PhotoPoolSidebar: React.FC<PhotoPoolSidebarProps> = ({
  photos,
  assignedImageIds,
  onUploadPhotos,
  onSelectPhotoPreview,
  onTriggerAutoSolver,
  onOpenAiStudio,
  currentEventType = 'indian_wedding',
  culturalTheme,
  onUpdateCulturalTheme,
  culturalPalettes,
  frameBorderStyles,
  onTriggerAutoTheme,
  autoThemeAnalysis,
  onOpenPrintPreview,
}) => {
  const [sidebarTab, setSidebarTab] = useState<'photos' | 'cultural'>('photos');
  const [filterState, setFilterState] = useState<PhotoFilterState>(DEFAULT_FILTER_STATE);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [collapsedClusters, setCollapsedClusters] = useState<Set<string>>(new Set());
  const [isDragOverUpload, setIsDragOverUpload] = useState(false);

  // 1. Build Timestamp Clusters from photos pool
  const timestampClusters = useMemo(() => {
    return buildTimestampClusters(photos, assignedImageIds);
  }, [photos, assignedImageIds]);

  // 2. Filter & Sort Photos
  const { filteredPhotos, activeCluster, activeFilterCount } = useMemo(() => {
    return applyPhotoFilters(photos, assignedImageIds, filterState, timestampClusters);
  }, [photos, assignedImageIds, filterState, timestampClusters]);

  // 3. Fast Stats & Counts for filter chips
  const orientationCounts = useMemo(() => {
    return {
      all: photos.length,
      portrait: photos.filter((p) => p.orientation === 'portrait').length,
      landscape: photos.filter((p) => p.orientation === 'landscape').length,
      square: photos.filter((p) => p.orientation === 'square').length,
    };
  }, [photos]);

  const qualityCounts = useMemo(() => {
    return {
      tier95: photos.filter((p) => p.qualityScore >= 95).length,
      tier90: photos.filter((p) => p.qualityScore >= 90).length,
    };
  }, [photos]);

  const placementCounts = useMemo(() => {
    const placed = photos.filter((p) => assignedImageIds.has(p.id)).length;
    return {
      all: photos.length,
      unassigned: photos.length - placed,
      placed,
    };
  }, [photos, assignedImageIds]);

  // Filter actions
  const handleToggleOrientation = (ori: OrientationFilter) => {
    setFilterState((prev) => ({
      ...prev,
      orientation: prev.orientation === ori ? 'all' : ori,
    }));
  };

  const handleToggleQualityTier = (tier: QualityTierFilter) => {
    setFilterState((prev) => {
      if (prev.qualityTier === tier) {
        return { ...prev, qualityTier: 'all', minQualityScore: 0 };
      }
      const minScore = tier === '95plus' ? 95 : tier === '90plus' ? 90 : 0;
      return { ...prev, qualityTier: tier, minQualityScore: minScore };
    });
  };

  const handleToggleCluster = (clusterId: string) => {
    setFilterState((prev) => ({
      ...prev,
      selectedClusterId: prev.selectedClusterId === clusterId ? 'all' : clusterId,
    }));
  };

  const handleResetFilters = () => {
    setFilterState(DEFAULT_FILTER_STATE);
  };

  const handleToggleClusterCollapse = (clusterId: string) => {
    setCollapsedClusters((prev) => {
      const next = new Set(prev);
      if (next.has(clusterId)) {
        next.delete(clusterId);
      } else {
        next.add(clusterId);
      }
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, photo: ImageAsset) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'photo-pool-drop',
        imageId: photo.id,
      })
    );
    e.dataTransfer.setData('text/plain', photo.id);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newAssets: ImageAsset[] = [];
    Array.from(files).forEach((file, idx) => {
      const url = URL.createObjectURL(file);
      const isPortrait = idx % 2 === 0;
      newAssets.push({
        id: `custom-photo-${Date.now()}-${idx}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        filename: file.name,
        url,
        thumbUrl: url,
        width: isPortrait ? 4000 : 6000,
        height: isPortrait ? 6000 : 4000,
        aspectRatio: isPortrait ? 0.667 : 1.5,
        orientation: isPortrait ? 'portrait' : 'landscape',
        timestamp: new Date().toISOString(),
        qualityScore: 94,
        eventTag: 'Uploaded',
        saliency: [
          { x: 0.35, y: 0.25, width: 0.3, height: 0.3, label: 'subject' },
        ],
      });
    });

    onUploadPhotos(newAssets);
  };

  const activePalette = culturalPalettes.find((p) => p.id === culturalTheme.activePaletteId) || culturalPalettes[0];
  const activeBorder = frameBorderStyles.find((b) => b.id === culturalTheme.activeBorderStyleId) || frameBorderStyles[0];

  return (
    <div
      id="photo-pool-sidebar"
      className="w-84 h-full bg-stone-950 border-r border-stone-800 flex flex-col shrink-0 text-stone-200"
    >
      {/* Primary Sidebar Mode Tabs: Photo Tray vs Cultural Elements */}
      <div className="flex items-center border-b border-stone-800 bg-stone-950/90 shrink-0">
        <button
          id="tab-sidebar-photos"
          onClick={() => setSidebarTab('photos')}
          className={`flex-1 py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
            sidebarTab === 'photos'
              ? 'border-amber-400 text-amber-400 bg-stone-900/40'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Photos ({photos.length})</span>
        </button>

        <button
          id="tab-sidebar-cultural"
          onClick={() => setSidebarTab('cultural')}
          className={`flex-1 py-2.5 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 cursor-pointer relative ${
            sidebarTab === 'cultural'
              ? 'border-amber-400 text-amber-400 bg-stone-900/40'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span>Cultural Elements</span>
          {culturalTheme.enabled && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Quick Cultural Toggle Pill (Always visible across both tabs) */}
      <div className="px-3.5 py-2 border-b border-stone-850 bg-stone-900/40 flex items-center justify-between shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-stone-300">Cultural Styling:</span>
          {culturalTheme.enabled ? (
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 rounded-full">
              {activePalette?.name.split('&')[0].trim()} &bull; {activeBorder?.name.split(' ')[1]}
            </span>
          ) : (
            <span className="text-[10px] text-stone-500 font-mono">Standard Clean</span>
          )}
        </div>

        <button
          id="btn-quick-toggle-cultural"
          onClick={() => onUpdateCulturalTheme({ enabled: !culturalTheme.enabled })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
            culturalTheme.enabled ? 'bg-amber-500' : 'bg-stone-800'
          }`}
          title="Toggle Cultural Theme Overlays on Album Spreads"
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-stone-950 transition-transform ${
              culturalTheme.enabled ? 'translate-x-4.5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* ================= TAB 1: PHOTOS & CEREMONY TRAY ================= */}
      {sidebarTab === 'photos' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Action CTAs */}
          <div className="p-3 border-b border-stone-800 bg-stone-950 space-y-2 shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-sidebar-auto-solve"
                onClick={onTriggerAutoSolver}
                className="py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                <span>AI Auto-Solve</span>
              </button>

              <button
                id="btn-sidebar-ai-generate"
                onClick={() => onOpenAiStudio()}
                className="py-1.5 px-2.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Generate</span>
              </button>
            </div>

            {/* Drag & Drop Upload Dropzone */}
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverUpload(true);
              }}
              onDragLeave={() => setIsDragOverUpload(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverUpload(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              className={`flex items-center justify-center gap-2 py-1 px-3 border border-dashed rounded-lg text-xs cursor-pointer transition-colors ${
                isDragOverUpload
                  ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                  : 'border-stone-800 hover:border-stone-700 bg-stone-900/60 text-stone-400 hover:text-stone-300'
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>Upload Photos (or drag files)</span>
              <input
                id="file-upload-input"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </label>
          </div>

          {/* ================= FILTER & CLUSTERING SYSTEM ================= */}
          <div className="border-b border-stone-800 bg-stone-950 shrink-0">
            {/* Row 1: Search & Filter Drawer Header */}
            <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  id="photo-filter-search-input"
                  type="text"
                  placeholder="Search photo titles, ceremonies..."
                  value={filterState.searchQuery}
                  onChange={(e) =>
                    setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))
                  }
                  className="w-full pl-8 pr-7 py-1 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/60 transition-colors"
                />
                {filterState.searchQuery && (
                  <button
                    onClick={() =>
                      setFilterState((prev) => ({ ...prev, searchQuery: '' }))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Advanced Filter Drawer Toggle */}
              <button
                id="btn-toggle-filter-panel"
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  isFilterPanelOpen || activeFilterCount > 0
                    ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                    : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                }`}
                title="Toggle Advanced Quality Slider & Filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Reset Button (only if active filters) */}
              {activeFilterCount > 0 && (
                <button
                  id="btn-reset-all-filters"
                  onClick={handleResetFilters}
                  className="p-1.5 rounded-lg border border-stone-800 bg-stone-900 text-stone-400 hover:text-amber-400 transition-colors cursor-pointer"
                  title="Reset all filters to show all photos"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Row 2: Placement Status Pills (All / Unplaced / Placed) */}
            <div className="px-3 py-1 flex items-center gap-1 text-[11px] overflow-x-auto no-scrollbar">
              {(
                [
                  { id: 'all', label: `All (${placementCounts.all})` },
                  { id: 'unassigned', label: `Unplaced (${placementCounts.unassigned})` },
                  { id: 'placed', label: `Placed (${placementCounts.placed})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  id={`filter-placement-${tab.id}`}
                  onClick={() =>
                    setFilterState((prev) => ({ ...prev, placement: tab.id }))
                  }
                  className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-colors cursor-pointer font-medium ${
                    filterState.placement === tab.id
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <div className="h-3 w-px bg-stone-800 mx-1 shrink-0" />

              {/* Group By Cluster Switch */}
              <button
                id="btn-toggle-group-clusters"
                onClick={() =>
                  setFilterState((prev) => ({
                    ...prev,
                    groupByCluster: !prev.groupByCluster,
                  }))
                }
                className={`ml-auto px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                  filterState.groupByCluster
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200 bg-stone-900'
                }`}
                title="Group photos into chronological ceremony/moment blocks"
              >
                <Layers className="w-3 h-3" />
                <span>Group Moments</span>
              </button>
            </div>

            {/* Row 3: Orientation Filter (Toggle Portrait vs Landscape vs All) */}
            <div className="px-3 py-1.5 border-t border-stone-850 flex items-center justify-between text-[11px]">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 flex items-center gap-1">
                <ArrowUpDown className="w-2.5 h-2.5 text-stone-400" />
                <span>Ratio:</span>
              </span>

              <div className="flex items-center gap-1">
                <button
                  id="filter-orientation-all"
                  onClick={() => handleToggleOrientation('all')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    filterState.orientation === 'all'
                      ? 'bg-stone-800 text-stone-100 font-bold'
                      : 'text-stone-500 hover:text-stone-300'
                  }`}
                >
                  All
                </button>

                <button
                  id="filter-orientation-portrait"
                  onClick={() => handleToggleOrientation('portrait')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    filterState.orientation === 'portrait'
                      ? 'bg-amber-500/25 border border-amber-500/50 text-amber-300 font-bold'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                  title="Filter portraits (ideal for vertical 2:3 slots)"
                >
                  <ArrowUpDown className="w-2.5 h-2.5 text-amber-400" />
                  <span>Portrait ({orientationCounts.portrait})</span>
                </button>

                <button
                  id="filter-orientation-landscape"
                  onClick={() => handleToggleOrientation('landscape')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    filterState.orientation === 'landscape'
                      ? 'bg-amber-500/25 border border-amber-500/50 text-amber-300 font-bold'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                  title="Filter landscapes (ideal for horizontal 3:2 slots)"
                >
                  <ArrowLeftRight className="w-2.5 h-2.5 text-cyan-400" />
                  <span>Landscape ({orientationCounts.landscape})</span>
                </button>
              </div>
            </div>

            {/* Row 4: Quality Score Filter (Toggle All / 90+ / 95+ Top Picks) */}
            <div className="px-3 py-1.5 border-t border-stone-850 flex items-center justify-between text-[11px]">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 flex items-center gap-1">
                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400/50" />
                <span>Quality:</span>
              </span>

              <div className="flex items-center gap-1">
                <button
                  id="filter-quality-all"
                  onClick={() => handleToggleQualityTier('all')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    filterState.qualityTier === 'all' && filterState.minQualityScore === 0
                      ? 'bg-stone-800 text-stone-100 font-bold'
                      : 'text-stone-500 hover:text-stone-300'
                  }`}
                >
                  All
                </button>

                <button
                  id="filter-quality-90"
                  onClick={() => handleToggleQualityTier('90plus')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    filterState.qualityTier === '90plus'
                      ? 'bg-amber-500/25 border border-amber-500/50 text-amber-300 font-bold'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                  title="Filter high-quality photos (score ≥ 90 pt)"
                >
                  <Star className="w-2.5 h-2.5 text-amber-400" />
                  <span>≥90 pt ({qualityCounts.tier90})</span>
                </button>

                <button
                  id="filter-quality-95"
                  onClick={() => handleToggleQualityTier('95plus')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    filterState.qualityTier === '95plus'
                      ? 'bg-emerald-500/25 border border-emerald-500/50 text-emerald-300 font-bold'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                  title="Filter curated masterpiece shots (score ≥ 95 pt)"
                >
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Top 95+ ({qualityCounts.tier95})</span>
                </button>
              </div>
            </div>

            {/* Row 5: Timestamp Clusters (Horizontal Scroll Pills) */}
            <div className="px-3 py-1.5 border-t border-stone-850 bg-stone-950/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-amber-400" />
                  <span>Timestamp Clusters ({timestampClusters.length})</span>
                </span>
                {filterState.selectedClusterId !== 'all' && (
                  <button
                    onClick={() =>
                      setFilterState((prev) => ({ ...prev, selectedClusterId: 'all' }))
                    }
                    className="text-[9px] text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    Show All
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  id="cluster-chip-all"
                  onClick={() =>
                    setFilterState((prev) => ({ ...prev, selectedClusterId: 'all' }))
                  }
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    filterState.selectedClusterId === 'all'
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  All Moments ({photos.length})
                </button>

                {timestampClusters.map((cluster) => {
                  const isSelected = filterState.selectedClusterId === cluster.id;
                  const timeShort = cluster.displayTimeRange.split('•')[1]?.trim() || cluster.displayTimeRange;

                  return (
                    <button
                      key={cluster.id}
                      id={`cluster-chip-${cluster.id}`}
                      onClick={() => handleToggleCluster(cluster.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'bg-stone-900 hover:bg-stone-850 text-stone-300 border border-stone-800'
                      }`}
                      title={`${cluster.name} • ${cluster.displayTimeRange} (${cluster.totalPhotos} photos, avg quality ${cluster.averageQuality}pt)`}
                    >
                      <span>{cluster.name.length > 18 ? cluster.name.slice(0, 16) + '…' : cluster.name}</span>
                      <span
                        className={`text-[9px] px-1 rounded-full ${
                          isSelected
                            ? 'bg-stone-950/30 text-stone-900 font-bold'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {cluster.totalPhotos}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Collapsible Filter Drawer: Fine-Grained Quality Slider & Sort */}
            {isFilterPanelOpen && (
              <div className="px-3 py-2 border-t border-stone-800 bg-stone-900/60 space-y-2">
                {/* Min Quality Slider */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-stone-300 mb-1">
                    <span className="font-semibold flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-amber-400" />
                      <span>Custom Min Quality Threshold:</span>
                    </span>
                    <span className="font-mono text-amber-300 font-bold">
                      {filterState.minQualityScore > 0 ? `${filterState.minQualityScore} pt` : 'Off (0)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={98}
                    step={2}
                    value={filterState.minQualityScore}
                    onChange={(e) =>
                      setFilterState((prev) => ({
                        ...prev,
                        minQualityScore: Number(e.target.value),
                        qualityTier: 'custom',
                      }))
                    }
                    className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[9px] text-stone-500 font-mono mt-0.5">
                    <span>Any (0)</span>
                    <span>88pt</span>
                    <span>92pt</span>
                    <span>96pt</span>
                    <span>98pt+</span>
                  </div>
                </div>

                {/* Sort Order Selector */}
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-stone-800">
                  <span className="text-stone-400 font-medium">Sort Order:</span>
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { id: 'timestamp-asc', label: 'Time ↑' },
                        { id: 'timestamp-desc', label: 'Time ↓' },
                        { id: 'quality-desc', label: 'Quality ⭐' },
                        { id: 'orientation', label: 'Ratio' },
                      ] as const
                    ).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setFilterState((prev) => ({ ...prev, sortBy: s.id }))}
                        className={`px-1.5 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                          filterState.sortBy === s.id
                            ? 'bg-stone-800 text-amber-300 font-bold'
                            : 'text-stone-500 hover:text-stone-300'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters Summary Strip */}
            {activeFilterCount > 0 && (
              <div className="px-3 py-1.5 bg-stone-900/40 border-t border-stone-850 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-stone-400 font-medium">
                    Showing <strong className="text-amber-300">{filteredPhotos.length}</strong> of {photos.length}:
                  </span>

                  {filterState.placement !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {filterState.placement}
                      <X
                        className="w-2.5 h-2.5 cursor-pointer hover:text-white"
                        onClick={() =>
                          setFilterState((prev) => ({ ...prev, placement: 'all' }))
                        }
                      />
                    </span>
                  )}

                  {filterState.orientation !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {filterState.orientation}
                      <X
                        className="w-2.5 h-2.5 cursor-pointer hover:text-white"
                        onClick={() => handleToggleOrientation('all')}
                      />
                    </span>
                  )}

                  {(filterState.qualityTier !== 'all' || filterState.minQualityScore > 0) && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {filterState.qualityTier === '95plus'
                        ? '≥95 pt'
                        : filterState.qualityTier === '90plus'
                        ? '≥90 pt'
                        : `≥${filterState.minQualityScore} pt`}
                      <X
                        className="w-2.5 h-2.5 cursor-pointer hover:text-white"
                        onClick={() =>
                          setFilterState((prev) => ({
                            ...prev,
                            qualityTier: 'all',
                            minQualityScore: 0,
                          }))
                        }
                      />
                    </span>
                  )}

                  {filterState.selectedClusterId !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 truncate max-w-[120px]">
                      {activeCluster?.name || 'Cluster'}
                      <X
                        className="w-2.5 h-2.5 cursor-pointer hover:text-white shrink-0"
                        onClick={() =>
                          setFilterState((prev) => ({ ...prev, selectedClusterId: 'all' }))
                        }
                      />
                    </span>
                  )}

                  {filterState.searchQuery && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-stone-800 text-stone-300">
                      "{filterState.searchQuery}"
                      <X
                        className="w-2.5 h-2.5 cursor-pointer hover:text-white"
                        onClick={() =>
                          setFilterState((prev) => ({ ...prev, searchQuery: '' }))
                        }
                      />
                    </span>
                  )}
                </div>

                <button
                  onClick={handleResetFilters}
                  className="text-stone-400 hover:text-amber-300 underline font-medium cursor-pointer shrink-0 ml-1"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* ================= DRAGGABLE PHOTO GRID / MOMENTS ACCORDION ================= */}
          <div
            id="photos-draggable-grid"
            className="flex-1 overflow-y-auto p-3 content-start space-y-3"
          >
            {/* Case A: Grouped By Timestamp Cluster */}
            {filterState.groupByCluster ? (
              <div className="space-y-3">
                {timestampClusters.map((cluster) => {
                  // Filter cluster photos according to active orientation & quality filters
                  const clusterMatchingPhotos = cluster.photos.filter((p) =>
                    filteredPhotos.some((fp) => fp.id === p.id)
                  );

                  if (clusterMatchingPhotos.length === 0) return null;

                  const isCollapsed = collapsedClusters.has(cluster.id);

                  return (
                    <div
                      key={cluster.id}
                      className="rounded-xl border border-stone-800 bg-stone-900/40 overflow-hidden"
                    >
                      {/* Cluster Header Bar */}
                      <button
                        onClick={() => handleToggleClusterCollapse(cluster.id)}
                        className="w-full px-2.5 py-2 flex items-center justify-between bg-stone-900/80 hover:bg-stone-850 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <div className="truncate">
                            <h4 className="text-xs font-semibold text-stone-100 truncate">
                              {cluster.name}
                            </h4>
                            <p className="text-[10px] text-stone-400 font-mono">
                              {cluster.displayTimeRange}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">
                            {clusterMatchingPhotos.length} photos
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono">
                            ⭐ {cluster.averageQuality}pt
                          </span>
                          {isCollapsed ? (
                            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                          ) : (
                            <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                          )}
                        </div>
                      </button>

                      {/* Cluster Photo Grid */}
                      {!isCollapsed && (
                        <div className="p-2.5 grid grid-cols-2 gap-2 bg-stone-950/40">
                          {clusterMatchingPhotos.map((photo) => {
                            const isPlaced = assignedImageIds.has(photo.id);

                            return (
                              <DraggablePhotoCard
                                key={photo.id}
                                photo={photo}
                                isPlaced={isPlaced}
                                onDragStart={handleDragStart}
                                onSelectPreview={onSelectPhotoPreview}
                                onOpenAiStudio={onOpenAiStudio}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Case B: Flat Filtered Grid */
              <div className="grid grid-cols-2 gap-2.5">
                {filteredPhotos.map((photo) => {
                  const isPlaced = assignedImageIds.has(photo.id);

                  return (
                    <DraggablePhotoCard
                      key={photo.id}
                      photo={photo}
                      isPlaced={isPlaced}
                      onDragStart={handleDragStart}
                      onSelectPreview={onSelectPhotoPreview}
                      onOpenAiStudio={onOpenAiStudio}
                    />
                  );
                })}
              </div>
            )}

            {/* Empty State when 0 photos match */}
            {filteredPhotos.length === 0 && (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-stone-500">
                  <Filter className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-stone-200">
                    No matching photos found
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1 max-w-[200px] mx-auto">
                    Try relaxing your orientation or quality score filters to view more photos.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: CULTURAL ELEMENTS & THEME OVERLAYS ================= */}
      {sidebarTab === 'cultural' && (
        <div
          id="sidebar-cultural-elements-panel"
          className="flex-1 overflow-y-auto p-4 space-y-5"
        >
          {/* Master Cultural Toggle Card */}
          <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-100">Cultural Elements</h3>
                  <p className="text-[10px] text-stone-400">Theme-specific styling overlays</p>
                </div>
              </div>

              {/* Master Switch */}
              <button
                id="btn-master-cultural-toggle"
                onClick={() => onUpdateCulturalTheme({ enabled: !culturalTheme.enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  culturalTheme.enabled ? 'bg-amber-500' : 'bg-stone-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-stone-950 transition-transform ${
                    culturalTheme.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed">
              Applies traditional color palettes (e.g. Sindoor Maroon, Imperial Gold, Marigold Saffron) and geometric jaali / zardozi filigree frame borders to album spreads.
            </p>
          </div>

          {/* Intelligent Auto-Theme Card */}
          <div
            id="sidebar-auto-theme-card"
            className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 via-stone-900 to-stone-900 border border-amber-500/30 space-y-2.5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Wand2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-300">Intelligent Auto-Theme</h4>
                  <p className="text-[10px] text-stone-400">Batch-aware styling analysis</p>
                </div>
              </div>

              {autoThemeAnalysis && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {autoThemeAnalysis.confidenceScore}% Match
                </span>
              )}
            </div>

            {autoThemeAnalysis ? (
              <div className="space-y-1.5 text-[11px] bg-stone-950/60 p-2.5 rounded-lg border border-stone-850">
                <div className="text-stone-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{autoThemeAnalysis.matchedCeremonyFocus}</span>
                </div>
                <p className="text-[10px] text-stone-400 leading-relaxed">
                  {autoThemeAnalysis.primaryRationale}
                </p>
                <div className="flex items-center gap-2 pt-1 border-t border-stone-800 text-[10px] text-stone-400">
                  <span>Paper Finish:</span>
                  <span className="font-semibold text-amber-300 capitalize">
                    {autoThemeAnalysis.recommendedFinish}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-stone-400 leading-snug">
                Automatically scans the event photo pool to evaluate ceremonies, colors, and lighting, applying the optimal palette and border motifs.
              </p>
            )}

            <button
              id="btn-sidebar-trigger-auto-theme"
              onClick={onTriggerAutoTheme}
              className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Re-Analyze Batch & Auto-Theme</span>
            </button>
          </div>

          {/* Physical Print Finish Selector */}
          <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-stone-200">Paper Finish</span>
              </div>
              {onOpenPrintPreview && (
                <button
                  id="btn-sidebar-open-print-preview"
                  onClick={onOpenPrintPreview}
                  className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Preview Print</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(['matte', 'glossy', 'silk'] as PaperFinish[]).map((finish) => {
                const isSelected = culturalTheme.paperFinish === finish;
                return (
                  <button
                    key={finish}
                    id={`sidebar-finish-${finish}`}
                    onClick={() => onUpdateCulturalTheme({ paperFinish: finish })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold shadow-xs'
                        : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                    }`}
                  >
                    <div className="capitalize">{finish}</div>
                    <div className="text-[9px] text-stone-500 font-mono mt-0.5">
                      {finish === 'matte' ? '250g' : finish === 'glossy' ? '300g' : '260g'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Indian Wedding Color Palettes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Cultural Color Palettes
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {culturalPalettes.length} Palettes
              </span>
            </div>

            <div className="space-y-2">
              {culturalPalettes.map((palette) => {
                const isActive = culturalTheme.activePaletteId === palette.id;

                return (
                  <button
                    key={palette.id}
                    id={`palette-btn-${palette.id}`}
                    onClick={() => {
                      onUpdateCulturalTheme({
                        activePaletteId: palette.id,
                        enabled: true, // auto-enable when user chooses a palette
                      });
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'border-amber-400/90 bg-stone-900 shadow-md ring-1 ring-amber-400/50'
                        : 'border-stone-850 hover:border-stone-750 bg-stone-950/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {/* Swatch dots */}
                        <div className="flex items-center -space-x-1">
                          {palette.swatchColors.map((color, cIdx) => (
                            <div
                              key={cIdx}
                              className="w-3.5 h-3.5 rounded-full border border-stone-950 shadow-xs"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-stone-200">
                          {palette.name}
                        </span>
                      </div>

                      {isActive && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </div>

                    <p className="text-[10px] text-stone-400 leading-snug">
                      {palette.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Frame Border Styles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Frame Border Styles
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {frameBorderStyles.length} Styles
              </span>
            </div>

            <div className="space-y-2">
              {frameBorderStyles.map((style) => {
                const isActive = culturalTheme.activeBorderStyleId === style.id;

                return (
                  <button
                    key={style.id}
                    id={`border-btn-${style.id}`}
                    onClick={() => {
                      onUpdateCulturalTheme({
                        activeBorderStyleId: style.id,
                        enabled: true, // auto-enable when user chooses a style
                      });
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'border-amber-400/90 bg-stone-900 shadow-md ring-1 ring-amber-400/50'
                        : 'border-stone-850 hover:border-stone-750 bg-stone-950/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {/* Mini border preview badge */}
                        <div
                          className="w-5 h-5 rounded-xs flex items-center justify-center bg-stone-950"
                          style={{
                            border: `${style.borderWidth}px ${style.borderStyle} ${style.borderColor}`,
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: style.accentColor }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-stone-200">
                          {style.name}
                        </span>
                      </div>

                      {isActive && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </div>

                    <p className="text-[10px] text-stone-400 leading-snug">
                      {style.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Fine-Tuning Overlay Options */}
          <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-850 space-y-2.5 text-xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block pb-1 border-b border-stone-800">
              Ornamental Detail Options
            </span>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-stone-300 text-[11px]">
                Intricate Corner Jaali / Motifs
              </span>
              <input
                type="checkbox"
                checked={culturalTheme.showCornerMotifs}
                onChange={(e) => onUpdateCulturalTheme({ showCornerMotifs: e.target.checked })}
                className="accent-amber-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-stone-300 text-[11px]">
                Spread Jaali Lattice Watermark
              </span>
              <input
                type="checkbox"
                checked={culturalTheme.showBackgroundTexture}
                onChange={(e) => onUpdateCulturalTheme({ showBackgroundTexture: e.target.checked })}
                className="accent-amber-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-stone-300 text-[11px]">
                Gold Foil Ambient Border Glow
              </span>
              <input
                type="checkbox"
                checked={culturalTheme.showGoldFoilAccent}
                onChange={(e) => onUpdateCulturalTheme({ showGoldFoilAccent: e.target.checked })}
                className="accent-amber-500 cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
