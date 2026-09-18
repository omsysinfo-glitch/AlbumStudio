import { ImageAsset, Orientation } from '../types';

export interface TimestampCluster {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  displayTimeRange: string;
  dateLabel: string;
  photos: ImageAsset[];
  photoIds: string[];
  totalPhotos: number;
  unplacedCount: number;
  placedCount: number;
  averageQuality: number;
  orientations: {
    portrait: number;
    landscape: number;
    square: number;
  };
  dominantEventTag?: string;
}

export type OrientationFilter = 'all' | 'portrait' | 'landscape' | 'square';
export type PlacementFilter = 'all' | 'unassigned' | 'placed';
export type QualityTierFilter = 'all' | '90plus' | '95plus' | 'custom';
export type SortOption = 'timestamp-asc' | 'timestamp-desc' | 'quality-desc' | 'orientation';

export interface PhotoFilterState {
  placement: PlacementFilter;
  orientation: OrientationFilter;
  minQualityScore: number;
  qualityTier: QualityTierFilter;
  selectedClusterId: string | 'all';
  selectedTag: string | null;
  searchQuery: string;
  sortBy: SortOption;
  groupByCluster: boolean;
}

export const DEFAULT_FILTER_STATE: PhotoFilterState = {
  placement: 'all',
  orientation: 'all',
  minQualityScore: 0,
  qualityTier: 'all',
  selectedClusterId: 'all',
  selectedTag: null,
  searchQuery: '',
  sortBy: 'timestamp-asc',
  groupByCluster: false,
};

/**
 * Format ISO string to localized time (e.g. "11:15 AM")
 */
export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

/**
 * Format ISO string to localized date (e.g. "Feb 14" or "Jun 14")
 */
export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

/**
 * Derives descriptive human-friendly cluster name from photo tags / clusterId / time
 */
function deriveClusterName(photos: ImageAsset[], startTimeStr: string): string {
  // Check common clusterIds
  const clusterId = photos[0]?.clusterId?.toLowerCase();
  if (clusterId === 'prep') return 'Morning Prep & Details';
  if (clusterId === 'ceremony') return 'Ceremony & Sacred Vows';
  if (clusterId === 'golden_hour') return 'Golden Hour & Portraits';
  if (clusterId === 'reception') return 'Reception & Celebrations';

  // Count dominant eventTag
  const tagCounts: Record<string, number> = {};
  photos.forEach((p) => {
    if (p.eventTag) {
      tagCounts[p.eventTag] = (tagCounts[p.eventTag] || 0) + 1;
    }
  });

  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  if (sortedTags.length > 0 && sortedTags[0][1] >= 1) {
    return sortedTags[0][0];
  }

  // Fallback to time of day
  const d = new Date(startTimeStr);
  if (!isNaN(d.getTime())) {
    const hour = d.getHours();
    if (hour < 12) return 'Morning Moments';
    if (hour < 17) return 'Afternoon Highlights';
    if (hour < 20) return 'Sunset & Twilight';
    return 'Evening Celebrations';
  }

  return 'Event Moments';
}

/**
 * Automatically clusters photos by timestamp gaps (or clusterId)
 */
export function buildTimestampClusters(
  photos: ImageAsset[],
  assignedImageIds: Set<string>
): TimestampCluster[] {
  if (!photos || photos.length === 0) return [];

  // 1. Chronological sort
  const sorted = [...photos].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const rawGroups: ImageAsset[][] = [];
  let currentGroup: ImageAsset[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const photo = sorted[i];
    if (currentGroup.length === 0) {
      currentGroup.push(photo);
      continue;
    }

    const prevPhoto = currentGroup[currentGroup.length - 1];
    const prevTime = new Date(prevPhoto.timestamp).getTime();
    const currTime = new Date(photo.timestamp).getTime();
    const timeDiffMinutes = (currTime - prevTime) / (1000 * 60);

    // Split if explicit clusterId differs, or time gap > 90 minutes, or group exceeds 8 photos
    const clusterIdMismatch =
      photo.clusterId && prevPhoto.clusterId && photo.clusterId !== prevPhoto.clusterId;

    // Check calendar day difference
    const dayMismatch =
      new Date(prevPhoto.timestamp).toDateString() !== new Date(photo.timestamp).toDateString();

    if (clusterIdMismatch || dayMismatch || timeDiffMinutes > 90 || currentGroup.length >= 8) {
      rawGroups.push(currentGroup);
      currentGroup = [photo];
    } else {
      currentGroup.push(photo);
    }
  }

  if (currentGroup.length > 0) {
    rawGroups.push(currentGroup);
  }

  // 2. Transform into rich TimestampCluster objects
  return rawGroups.map((group, idx) => {
    const startTime = group[0].timestamp;
    const endTime = group[group.length - 1].timestamp;
    const startFormatted = formatTime(startTime);
    const endFormatted = formatTime(endTime);
    const dateLabel = formatDate(startTime);

    const displayTimeRange =
      startFormatted === endFormatted
        ? `${dateLabel} • ${startFormatted}`
        : `${dateLabel} • ${startFormatted} – ${endFormatted}`;

    const clusterName = deriveClusterName(group, startTime);

    const orientations = {
      portrait: group.filter((p) => p.orientation === 'portrait').length,
      landscape: group.filter((p) => p.orientation === 'landscape').length,
      square: group.filter((p) => p.orientation === 'square').length,
    };

    const unplacedCount = group.filter((p) => !assignedImageIds.has(p.id)).length;
    const placedCount = group.length - unplacedCount;
    const totalQuality = group.reduce((acc, p) => acc + (p.qualityScore || 90), 0);
    const averageQuality = Math.round(totalQuality / group.length);

    // Dominant tag
    const tags = group.map((p) => p.eventTag).filter(Boolean) as string[];
    const dominantEventTag = tags[0] || undefined;

    return {
      id: group[0].clusterId ? `cluster-${group[0].clusterId}-${idx}` : `cluster-${idx}`,
      name: clusterName,
      startTime,
      endTime,
      displayTimeRange,
      dateLabel,
      photos: group,
      photoIds: group.map((p) => p.id),
      totalPhotos: group.length,
      unplacedCount,
      placedCount,
      averageQuality,
      orientations,
      dominantEventTag,
    };
  });
}

/**
 * Filter and sort photos according to the active PhotoFilterState
 */
export function applyPhotoFilters(
  photos: ImageAsset[],
  assignedImageIds: Set<string>,
  filterState: PhotoFilterState,
  clusters: TimestampCluster[]
): {
  filteredPhotos: ImageAsset[];
  activeCluster: TimestampCluster | null;
  activeFilterCount: number;
} {
  let activeFilterCount = 0;

  if (filterState.placement !== 'all') activeFilterCount++;
  if (filterState.orientation !== 'all') activeFilterCount++;
  if (filterState.minQualityScore > 0 || filterState.qualityTier !== 'all') activeFilterCount++;
  if (filterState.selectedClusterId !== 'all') activeFilterCount++;
  if (filterState.selectedTag !== null) activeFilterCount++;
  if (filterState.searchQuery.trim().length > 0) activeFilterCount++;

  // Find active cluster if single cluster selected
  const activeCluster =
    filterState.selectedClusterId !== 'all'
      ? clusters.find((c) => c.id === filterState.selectedClusterId) || null
      : null;

  const clusterPhotoIdSet = activeCluster ? new Set(activeCluster.photoIds) : null;

  // Determine effective min quality score
  let effectiveMinQuality = filterState.minQualityScore;
  if (filterState.qualityTier === '90plus' && effectiveMinQuality < 90) {
    effectiveMinQuality = 90;
  } else if (filterState.qualityTier === '95plus' && effectiveMinQuality < 95) {
    effectiveMinQuality = 95;
  }

  const query = filterState.searchQuery.trim().toLowerCase();

  const filtered = photos.filter((photo) => {
    const isAssigned = assignedImageIds.has(photo.id);

    // 1. Placement Filter
    if (filterState.placement === 'unassigned' && isAssigned) return false;
    if (filterState.placement === 'placed' && !isAssigned) return false;

    // 2. Orientation Filter
    if (filterState.orientation !== 'all' && photo.orientation !== filterState.orientation) {
      return false;
    }

    // 3. Quality Score Filter
    if (effectiveMinQuality > 0 && photo.qualityScore < effectiveMinQuality) {
      return false;
    }

    // 4. Timestamp Cluster Filter
    if (clusterPhotoIdSet && !clusterPhotoIdSet.has(photo.id)) {
      return false;
    }

    // 5. Ceremony / Event Tag Filter
    if (filterState.selectedTag && photo.eventTag !== filterState.selectedTag) {
      return false;
    }

    // 6. Search Query Filter
    if (query) {
      const matchTitle = photo.title.toLowerCase().includes(query);
      const matchFile = photo.filename.toLowerCase().includes(query);
      const matchTag = photo.eventTag?.toLowerCase().includes(query);
      const matchSubTags = photo.tags?.some((t) => t.toLowerCase().includes(query));
      if (!matchTitle && !matchFile && !matchTag && !matchSubTags) {
        return false;
      }
    }

    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (filterState.sortBy) {
      case 'timestamp-asc':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case 'timestamp-desc':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'quality-desc':
        return b.qualityScore - a.qualityScore;
      case 'orientation':
        return a.orientation.localeCompare(b.orientation);
      default:
        return 0;
    }
  });

  return {
    filteredPhotos: sorted,
    activeCluster,
    activeFilterCount,
  };
}
