import {
  KarizmaPhoto,
  PhotoAnalysisData,
  EventClassificationType,
  QualityTier,
  QualityWeights,
  DEFAULT_QUALITY_WEIGHTS,
  DuplicateGroup,
} from '../types/karizma';

/**
 * Calculates a comprehensive composite quality score based on configurable weights
 */
export function calculateWeightedQualityScore(
  analysis: PhotoAnalysisData,
  weights: QualityWeights = DEFAULT_QUALITY_WEIGHTS
): { score: number; tier: QualityTier } {
  const baseSharpness = (analysis.sharpness || 80) * weights.qualityScore;
  const compScore = (analysis.compositionScore || 75) * weights.compositionScore;
  const faceScore =
    (analysis.faceCount > 0 ? (analysis.faces[0]?.smileConfidence || 0.8) * 100 : 70) *
    weights.faceQualityScore;
  const storyScore = (analysis.emotionalImportance || 70) * weights.storyImportanceScore;
  const emotionalScore = (analysis.emotionalImportance || 70) * weights.emotionalScore;

  const blurPenalty = (analysis.blurScore > 30 ? (analysis.blurScore - 30) * 1.5 : 0) * weights.blurPenalty;
  const dupPenalty = (analysis.duplicateGroupId && !analysis.isDuplicateRecommended ? 25 : 0) * weights.duplicatePenalty;

  const totalPositiveWeights =
    weights.qualityScore +
    weights.compositionScore +
    weights.faceQualityScore +
    weights.storyImportanceScore +
    weights.emotionalScore;

  const rawSum = baseSharpness + compScore + faceScore + storyScore + emotionalScore;
  const normalizedBase = rawSum / totalPositiveWeights;
  const finalScore = Math.max(10, Math.min(100, Math.round(normalizedBase - blurPenalty - dupPenalty)));

  let tier: QualityTier = 'Good';
  if (finalScore >= 90) tier = 'Excellent';
  else if (finalScore >= 75) tier = 'Good';
  else if (finalScore >= 60) tier = 'Average';
  else tier = 'Poor';

  return { score: finalScore, tier };
}

/**
 * Groups burst or perceptually similar photographs into duplicate groups
 * and recommends the highest scoring frame
 */
export function detectDuplicateGroups(photos: KarizmaPhoto[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const processed = new Set<string>();

  // Group photos with close timestamps (< 15 seconds) or identical tags and similar composition
  for (let i = 0; i < photos.length; i++) {
    const p1 = photos[i];
    if (processed.has(p1.id)) continue;

    const cluster: KarizmaPhoto[] = [p1];
    processed.add(p1.id);

    const t1 = new Date(p1.timestamp).getTime();

    for (let j = i + 1; j < photos.length; j++) {
      const p2 = photos[j];
      if (processed.has(p2.id)) continue;

      const t2 = new Date(p2.timestamp).getTime();
      const diffSec = Math.abs(t1 - t2) / 1000;

      // Burst condition or explicit match
      if (
        (p1.eventTag === p2.eventTag && diffSec < 20) ||
        (p1.title.slice(0, 8) === p2.title.slice(0, 8) && diffSec < 60)
      ) {
        cluster.push(p2);
        processed.add(p2.id);
      }
    }

    if (cluster.length > 1) {
      // Find best photo by quality score & smile confidence
      let bestPhoto = cluster[0];
      let maxScore = -1;

      for (const item of cluster) {
        const score = item.analysis.qualityScore + (item.analysis.faces[0]?.smileConfidence || 0) * 10;
        if (score > maxScore) {
          maxScore = score;
          bestPhoto = item;
        }
      }

      const groupId = `dup-group-${groups.length + 1}`;
      cluster.forEach((item) => {
        item.analysis.duplicateGroupId = groupId;
        item.analysis.isDuplicateRecommended = item.id === bestPhoto.id;
      });

      groups.push({
        id: groupId,
        name: `Group ${groups.length + 1} (${p1.eventTag})`,
        event: p1.eventTag,
        similarityScore: 92,
        photoIds: cluster.map((c) => c.id),
        recommendedPhotoId: bestPhoto.id,
      });
    }
  }

  return groups;
}

/**
 * Intelligent semantic AI Photo Search using metadata, scene classifications, face attributes & events
 */
export function searchPhotosWithAi(
  photos: KarizmaPhoto[],
  query: string
): KarizmaPhoto[] {
  if (!query || query.trim() === '') return photos;

  const q = query.toLowerCase().trim();
  const scored = photos.map((photo) => {
    let relevance = 0;
    const a = photo.analysis;

    // Direct event tag match
    if (photo.eventTag.toLowerCase().includes(q)) relevance += 50;
    if (photo.title.toLowerCase().includes(q)) relevance += 40;
    if (a.sceneClassification.toLowerCase().includes(q)) relevance += 35;

    // Face / Person queries
    if (q.includes('bride')) {
      if (photo.eventTag === 'Bride Portrait' || photo.tags?.includes('bride')) relevance += 45;
      if (a.faces.some((f) => f.label === 'bride')) relevance += 50;
    }
    if (q.includes('groom')) {
      if (photo.eventTag === 'Groom Portrait' || photo.tags?.includes('groom')) relevance += 45;
      if (a.faces.some((f) => f.label === 'groom')) relevance += 50;
    }
    if (q.includes('couple')) {
      if (photo.eventTag === 'Couple Portrait' || a.faceCount === 2) relevance += 50;
    }
    if (q.includes('family') || q.includes('parents') || q.includes('group')) {
      if (a.faceCount >= 3 || photo.eventTag === 'Family') relevance += 55;
    }
    if (q.includes('smile') || q.includes('smiling') || q.includes('laugh')) {
      const bestSmile = Math.max(...a.faces.map((f) => f.smileConfidence || 0), 0);
      if (bestSmile > 0.7) relevance += 40 * bestSmile;
    }
    if (q.includes('ring') || q.includes('jewelry') || q.includes('detail') || q.includes('mehendi')) {
      if (photo.eventTag === 'Detail Shot' || photo.eventTag === 'Mehendi') relevance += 45;
      if (a.sceneClassification.includes('jewelry') || a.sceneClassification.includes('hands')) relevance += 40;
    }
    if (q.includes('ceremony') || q.includes('mandap') || q.includes('phera') || q.includes('fire')) {
      if (['Wedding', 'Mandap', 'Garland Exchange', 'Sindoor'].includes(photo.eventTag)) relevance += 45;
    }

    // Quality boost for top tier
    if (a.qualityScore >= 95) relevance += 10;

    return { photo, relevance };
  });

  return scored
    .filter((s) => s.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .map((s) => s.photo);
}
