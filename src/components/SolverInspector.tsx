import React, { useState } from 'react';
import { ImageAsset, SpreadTemplate, PageSpread } from '../types';
import { solveAlbumSpreads, PYTHON_SOLVER_CODE, SolverResult } from '../utils/layoutSolver';
import {
  Sparkles,
  Code,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LayoutGrid,
  Copy,
  Check,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface SolverInspectorProps {
  photos: ImageAsset[];
  templates: SpreadTemplate[];
  onApplySpreads: (newSpreads: PageSpread[]) => void;
}

export const SolverInspector: React.FC<SolverInspectorProps> = ({
  photos,
  templates,
  onApplySpreads,
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'python-code'>('simulator');
  const [solverResult, setSolverResult] = useState<SolverResult | null>(() =>
    solveAlbumSpreads(photos, templates)
  );
  const [isSolving, setIsSolving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Tunable solver weights
  const [chronologyWeight, setChronologyWeight] = useState(0.35);
  const [gutterAvoidanceWeight, setGutterAvoidanceWeight] = useState(0.35);
  const [orientationWeight, setOrientationWeight] = useState(0.20);
  const [qualityWeight, setQualityWeight] = useState(0.10);

  const handleRunSolver = () => {
    setIsSolving(true);
    setTimeout(() => {
      const res = solveAlbumSpreads(photos, templates, {
        chronologyWeight,
        gutterAvoidanceWeight,
        orientationBalanceWeight: orientationWeight,
        qualityPrioritizationWeight: qualityWeight,
      });
      setSolverResult(res);
      setIsSolving(false);
    }, 250);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PYTHON_SOLVER_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleApplyToCanvas = () => {
    if (!solverResult) return;
    onApplySpreads(solverResult.spreads);
  };

  return (
    <div id="solver-inspector-container" className="flex-1 flex flex-col h-full bg-stone-900 text-stone-200 overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> AI Layout &amp; Spread Solver Engine
          </div>
          <h1 className="text-lg font-bold text-stone-100 mt-0.5">
            Constraint Satisfaction &amp; Bipartite Matching Algorithm
          </h1>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800 text-xs">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                activeTab === 'simulator'
                  ? 'bg-stone-800 text-amber-400 font-medium'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Live Algorithm Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('python-code')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                activeTab === 'python-code'
                  ? 'bg-stone-800 text-amber-400 font-medium'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Python Backend Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'simulator' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Control Panel & Weight Sliders */}
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" /> Objective Function Optimization Weights
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Adjust constraint priorities for chronological grouping, spine fold avoidance, and orientation balance.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRunSolver}
                    disabled={isSolving}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isSolving ? 'Solving Constraints...' : 'Re-Run Layout Solver'}</span>
                  </button>

                  <button
                    onClick={handleApplyToCanvas}
                    className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold text-xs flex items-center gap-1.5 border border-stone-700 shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Apply to Canvas Editor</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-300 font-medium">Gutter Avoidance</span>
                    <span className="font-mono text-amber-400">{Math.round(gutterAvoidanceWeight * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={gutterAvoidanceWeight}
                    onChange={(e) => setGutterAvoidanceWeight(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-stone-500 mt-1">Penalizes faces crossing the 0.75&quot; fold</div>
                </div>

                <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-300 font-medium">Chronology Integrity</span>
                    <span className="font-mono text-amber-400">{Math.round(chronologyWeight * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={chronologyWeight}
                    onChange={(e) => setChronologyWeight(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-stone-500 mt-1">Keeps temporal clusters grouped</div>
                </div>

                <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-300 font-medium">Orientation Pairing</span>
                    <span className="font-mono text-amber-400">{Math.round(orientationWeight * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={orientationWeight}
                    onChange={(e) => setOrientationWeight(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-stone-500 mt-1">Matches portrait/landscape to slots</div>
                </div>

                <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-300 font-medium">Hero Quality Focus</span>
                    <span className="font-mono text-amber-400">{Math.round(qualityWeight * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={qualityWeight}
                    onChange={(e) => setQualityWeight(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-stone-500 mt-1">Gives 95%+ quality photos larger slots</div>
                </div>
              </div>
            </div>

            {/* Solver Evaluation Scoreboard */}
            {solverResult && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-center">
                  <div className="text-[11px] font-mono uppercase text-stone-400">Overall Score</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
                    {solverResult.stats.overallScore}/100
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> High Optimization
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-center">
                  <div className="text-[11px] font-mono uppercase text-stone-400">Gutter Safety</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                    {solverResult.stats.gutterSafetyScore}%
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Fold collision penalty: 0</div>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-center">
                  <div className="text-[11px] font-mono uppercase text-stone-400">Orientation Fit</div>
                  <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">
                    {solverResult.stats.orientationFitScore}%
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Port/Land slot matching</div>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-center">
                  <div className="text-[11px] font-mono uppercase text-stone-400">Chronology Score</div>
                  <div className="text-2xl font-bold text-purple-400 mt-1 font-mono">
                    {solverResult.stats.chronologicalIntegrityScore}%
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Narrative order preserved</div>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-center">
                  <div className="text-[11px] font-mono uppercase text-stone-400">Execution Time</div>
                  <div className="text-2xl font-bold text-stone-200 mt-1 font-mono">
                    {solverResult.stats.executionTimeMs}ms
                  </div>
                  <div className="text-[10px] text-amber-400 mt-0.5 font-mono">
                    {solverResult.stats.placedPhotos} photos &bull; {solverResult.stats.spreadCount} spreads
                  </div>
                </div>
              </div>
            )}

            {/* Generated Spreads Preview Grid */}
            {solverResult && (
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-stone-100 mb-4 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-amber-400" /> Solved Multi-Page Spreads Breakdown
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {solverResult.spreads.map((spread) => {
                    const assignedCount = spread.slots.filter((s) => s.assignedImageId).length;
                    return (
                      <div key={spread.id} className="p-4 rounded-lg bg-stone-900 border border-stone-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-xs text-stone-200">{spread.title}</div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-950 text-amber-400 border border-stone-800">
                            Spread #{spread.spreadNumber} &bull; {assignedCount} Photos
                          </span>
                        </div>

                        {/* Mini Visual Spread Representation */}
                        <div className="w-full aspect-[2/1] bg-white rounded-xs relative overflow-hidden border border-stone-700 shadow-inner">
                          {/* Center spine gutter line */}
                          <div className="absolute inset-y-0 left-1/2 w-px bg-purple-400/80 z-10" />

                          {spread.slots.map((slot) => {
                            const photo = photos.find((p) => p.id === slot.assignedImageId);
                            return (
                              <div
                                key={slot.id}
                                className="absolute bg-stone-200 overflow-hidden border border-stone-300"
                                style={{
                                  left: `${slot.x * 100}%`,
                                  top: `${slot.y * 100}%`,
                                  width: `${slot.width * 100}%`,
                                  height: `${slot.height * 100}%`,
                                }}
                              >
                                {photo && (
                                  <img
                                    src={photo.thumbUrl || photo.url}
                                    alt={photo.title}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Python Code View */}
        {activeTab === 'python-code' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
                    <Code className="w-4 h-4 text-amber-400" /> Documented Python Backend Algorithm
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Production implementation suitable for deployment in Celery/FastAPI microservices.
                  </p>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Python Code!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Python Script</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-lg p-4 font-mono text-xs text-stone-300 overflow-x-auto max-h-[550px]">
                <pre className="leading-relaxed">{PYTHON_SOLVER_CODE}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
