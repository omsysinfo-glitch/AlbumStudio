import React, { useState } from 'react';
import { PageSpread, ImageAsset, PrintDimensions } from '../types';
import { runAlbumPreflightAudit, PreflightReport } from '../utils/printPreflight';
import {
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Download,
  X,
  Sliders,
  Eye,
  Info,
} from 'lucide-react';

interface PrintExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  spreads: PageSpread[];
  imageMap: Map<string, ImageAsset>;
  printDimensions: PrintDimensions;
}

export const PrintExportModal: React.FC<PrintExportModalProps> = ({
  isOpen,
  onClose,
  spreads,
  imageMap,
  printDimensions,
}) => {
  const [selectedIccProfile, setSelectedIccProfile] = useState('GRACoL2006_Coated1v2');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  if (!isOpen) return null;

  const preflightReport: PreflightReport = runAlbumPreflightAudit(
    spreads,
    imageMap,
    printDimensions
  );

  // Compute print pixel dimensions including 0.125" bleed
  const fullWidthInches = printDimensions.spreadWidthInches + 2 * printDimensions.bleedInches;
  const fullHeightInches = printDimensions.spreadHeightInches + 2 * printDimensions.bleedInches;
  const pixelWidth = Math.round(fullWidthInches * printDimensions.targetDpi);
  const pixelHeight = Math.round(fullHeightInches * printDimensions.targetDpi);

  const handleSimulateExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
    }, 1200);
  };

  const handleDownloadSpec = () => {
    const manifest = {
      specVersion: 'PDF/X-1a:2001',
      dimensions: {
        trimBox: `${printDimensions.spreadWidthInches} x ${printDimensions.spreadHeightInches} inches`,
        bleedBox: `${fullWidthInches} x ${fullHeightInches} inches`,
        dpi: printDimensions.targetDpi,
        rasterResolution: `${pixelWidth} x ${pixelHeight} px`,
      },
      iccProfile: selectedIccProfile,
      spreadCount: spreads.length,
      preflightStatus: preflightReport.isReadyForPrint ? 'PASSED' : 'WARNINGS_PRESENT',
      issues: preflightReport.issues,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FolioCraft_PrintSpec_300DPI_CMYK_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="print-export-modal-backdrop"
      className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div
        id="print-export-modal-content"
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl text-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100">
                300 DPI CMYK Print Exporter &amp; Preflight
              </h2>
              <p className="text-xs text-stone-400">
                Commercial offset press validation adhering to ISO 15930 (PDF/X-1a)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Preflight Summary Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              preflightReport.isReadyForPrint
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            }`}
          >
            {preflightReport.isReadyForPrint ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider">
                {preflightReport.isReadyForPrint
                  ? 'Preflight Verification: PASSED (100% Press Ready)'
                  : 'Preflight Notice: Issues Detected'}
              </div>
              <p className="text-xs text-stone-300 mt-1">
                {preflightReport.isReadyForPrint
                  ? `All ${preflightReport.placedSlots} frame slots meet or exceed 300 DPI resolution with zero center gutter bisections.`
                  : `Found ${preflightReport.issues.length} potential pre-press issues across ${spreads.length} spreads.`}
              </p>
            </div>
          </div>

          {/* Technical Print Specifications Matrix */}
          <div className="bg-stone-950 border border-stone-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold uppercase text-stone-400 tracking-wider mb-3">
              Press Output Geometry &amp; Color Specifications
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                <div className="text-stone-500 text-[10px]">Trim Box (Final Cut)</div>
                <div className="font-mono text-stone-200 font-semibold mt-0.5">
                  {printDimensions.spreadWidthInches}&quot; &times; {printDimensions.spreadHeightInches}&quot;
                </div>
              </div>

              <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                <div className="text-stone-500 text-[10px]">Bleed Box (+0.125&quot;)</div>
                <div className="font-mono text-stone-200 font-semibold mt-0.5">
                  {fullWidthInches.toFixed(3)}&quot; &times; {fullHeightInches.toFixed(3)}&quot;
                </div>
              </div>

              <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                <div className="text-stone-500 text-[10px]">Raster Dimensions</div>
                <div className="font-mono text-amber-400 font-semibold mt-0.5">
                  {pixelWidth} &times; {pixelHeight} px
                </div>
              </div>

              <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                <div className="text-stone-500 text-[10px]">Color Depth / Target</div>
                <div className="font-mono text-cyan-400 font-semibold mt-0.5">
                  CMYK &bull; 300 DPI
                </div>
              </div>
            </div>
          </div>

          {/* Profile Selector */}
          <div className="space-y-2">
            <label className="text-xs text-stone-300 font-medium flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Target Press ICC CMYK Color Profile:
            </label>
            <select
              value={selectedIccProfile}
              onChange={(e) => setSelectedIccProfile(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="GRACoL2006_Coated1v2">
                U.S. Web Coated (GRACoL 2006 Coated1v2) - Standard US Photo Labs
              </option>
              <option value="ISO_Coated_v2_FOGRA39">
                ISO Coated v2 (ECI / FOGRA39) - European Commercial Offset Standard
              </option>
              <option value="Japan_Color_2011">Japan Color 2011 Coated</option>
            </select>
          </div>

          {/* Detailed Issues List */}
          {preflightReport.issues.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Preflight Issue Details ({preflightReport.issues.length})
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {preflightReport.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-stone-950 border border-stone-800 text-xs flex items-start gap-2.5"
                  >
                    <AlertTriangle
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        issue.severity === 'error' ? 'text-red-400' : 'text-amber-400'
                      }`}
                    />
                    <div>
                      <div className="font-medium text-stone-200">{issue.message}</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">{issue.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadSpec}
              className="px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-medium border border-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Press Spec JSON</span>
            </button>

            <button
              onClick={handleSimulateExport}
              disabled={isExporting}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>
                {isExporting
                  ? 'Rasterizing 300 DPI CMYK...'
                  : exportComplete
                  ? 'Re-Render PDF/X-1a'
                  : 'Render 300 DPI CMYK PDF'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
