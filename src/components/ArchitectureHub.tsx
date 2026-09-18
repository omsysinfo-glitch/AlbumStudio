import React, { useState } from 'react';
import {
  Server,
  Database,
  Cpu,
  Layers,
  FileCode,
  Printer,
  Boxes,
  Workflow,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

export const ArchitectureHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'topology' | 'data-models' | 'api-endpoints' | 'worker-dag' | 'cmyk-pipeline' | 'libraries'
  >('topology');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div id="architecture-hub-container" className="flex-1 flex flex-col h-full bg-stone-900 text-stone-200 overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" /> Technical Specification &amp; System Architecture
          </div>
          <h1 className="text-lg font-bold text-stone-100 mt-0.5">
            Automated Photo Album Creation SaaS (Print-Ready 300 DPI CMYK)
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800 text-xs">
          {[
            { id: 'topology', label: 'Microservice Topology', icon: Boxes },
            { id: 'data-models', label: 'Data Models', icon: Database },
            { id: 'api-endpoints', label: 'API Endpoints', icon: FileCode },
            { id: 'worker-dag', label: 'Background Worker DAG', icon: Workflow },
            { id: 'cmyk-pipeline', label: '300 DPI CMYK Engine', icon: Printer },
            { id: 'libraries', label: 'Tech Stack & Libraries', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-stone-800 text-amber-400 font-medium shadow-xs'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* ================= 1. MICROSERVICE TOPOLOGY ================= */}
        {activeTab === 'topology' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-6">
              <h2 className="text-base font-semibold text-stone-100 mb-2 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" /> High-Level Microservice Boundaries
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed">
                The platform is decoupled into 5 specialized microservices partitioned along I/O, compute-heavy AI/CV,
                constraint satisfaction layout generation, and high-memory raster graphics rendering.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {/* Service 1 */}
                <div className="p-4 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="text-xs font-mono text-amber-400 font-semibold mb-1">01 / INGESTION SERVICE</div>
                  <h3 className="text-sm font-semibold text-stone-200">Asset Ingestion &amp; Transcoder</h3>
                  <p className="text-xs text-stone-400 mt-2 leading-normal">
                    Direct multipart presigned uploads to S3/GCS. Strips EXIF GPS for privacy, reads capture timestamps,
                    and generates multi-resolution WebP pyramids and thumbnails using <code>libvips</code>.
                  </p>
                  <div className="mt-3 text-[11px] font-mono text-stone-400 bg-stone-950 p-2 rounded">
                    Stack: Node.js / Rust, libvips, S3 Presigned URLs
                  </div>
                </div>

                {/* Service 2 */}
                <div className="p-4 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="text-xs font-mono text-cyan-400 font-semibold mb-1">02 / CV WORKER SERVICE</div>
                  <h3 className="text-sm font-semibold text-stone-200">Computer Vision &amp; Saliency Worker</h3>
                  <p className="text-xs text-stone-400 mt-2 leading-normal">
                    Extracts facial bounding boxes, subject saliency coordinates, blur detection (Laplacian variance), and
                    aesthetic quality scores. Computes perceptual image embeddings for deduplicating burst shots.
                  </p>
                  <div className="mt-3 text-[11px] font-mono text-stone-400 bg-stone-950 p-2 rounded">
                    Stack: Python, MediaPipe, OpenCV, CLIP, Redis Queue
                  </div>
                </div>

                {/* Service 3 */}
                <div className="p-4 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="text-xs font-mono text-purple-400 font-semibold mb-1">03 / LAYOUT SOLVER</div>
                  <h3 className="text-sm font-semibold text-stone-200">AI Layout Optimization Engine</h3>
                  <p className="text-xs text-stone-400 mt-2 leading-normal">
                    Clusters photos chronologically (DBSCAN), maps portrait/landscape ratios onto multi-page templates,
                    and minimizes gutter fold penalties to ensure key faces never cross the center spine.
                  </p>
                  <div className="mt-3 text-[11px] font-mono text-stone-400 bg-stone-950 p-2 rounded">
                    Stack: Python / NumPy, Scipy (Linear Sum Assignment)
                  </div>
                </div>

                {/* Service 4 */}
                <div className="p-4 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="text-xs font-mono text-emerald-400 font-semibold mb-1">04 / CANVAS &amp; STATE API</div>
                  <h3 className="text-sm font-semibold text-stone-200">Spread Collaboration &amp; State API</h3>
                  <p className="text-xs text-stone-400 mt-2 leading-normal">
                    Web editor state synchronization, optimistic frame swaps, user pan/crop offsets, and undo/redo history.
                    Provides live preflight validation for DPI and print safe zones.
                  </p>
                  <div className="mt-3 text-[11px] font-mono text-stone-400 bg-stone-950 p-2 rounded">
                    Stack: Express / FastAPI, PostgreSQL (JSONB), WebSockets
                  </div>
                </div>

                {/* Service 5 */}
                <div className="p-4 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="text-xs font-mono text-rose-400 font-semibold mb-1">05 / PRINT RENDERER</div>
                  <h3 className="text-sm font-semibold text-stone-200">300 DPI CMYK Print Exporter</h3>
                  <p className="text-xs text-stone-400 mt-2 leading-normal">
                    Headless high-resolution rasterizer. Fetches original RAW/lossless assets, applies ICC CMYK profiles
                    (e.g. GRACoL 2006), generates PDF/X-1a compliant files with embedded BleedBox and TrimBox.
                  </p>
                  <div className="mt-3 text-[11px] font-mono text-stone-400 bg-stone-950 p-2 rounded">
                    Stack: C++ / libvips / Skia / LittleCMS2 / PDFlib
                  </div>
                </div>

                {/* Storage & Queue Backbone */}
                <div className="p-4 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="text-xs font-mono text-stone-400 font-semibold mb-1">06 / INFRASTRUCTURE BACKBONE</div>
                  <h3 className="text-sm font-semibold text-stone-200">Storage, Message Bus &amp; Cache</h3>
                  <p className="text-xs text-stone-400 mt-2 leading-normal">
                    Event-driven choreography. High-durability object storage for high-res photo archives, Redis for fast
                    preflight cache and job queue orchestration, and relational DB for spread graphs.
                  </p>
                  <div className="mt-3 text-[11px] font-mono text-stone-400 bg-stone-950 p-2 rounded">
                    Stack: AWS S3 / Cloud Storage, Celery / BullMQ, PostgreSQL
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. DATA MODELS ================= */}
        {activeTab === 'data-models' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-stone-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" /> Core Relational &amp; Document Schemas
                </h2>
                <button
                  onClick={() =>
                    handleCopy(
                      `// Album JSON Schema
interface Album {
  id: string;
  userId: string;
  title: string;
  dimensions: {
    spreadWidthInches: 24.0;
    spreadHeightInches: 12.0;
    bleedInches: 0.125;
    safeMarginInches: 0.5;
    gutterWidthInches: 0.75;
    targetDpi: 300;
  };
  spreads: PageSpread[];
}`,
                      'schema'
                    )
                  }
                  className="px-2.5 py-1 text-xs rounded bg-stone-900 hover:bg-stone-800 text-stone-300 flex items-center gap-1 border border-stone-800"
                >
                  {copiedKey === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Schema</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-900 border border-stone-800 p-4 rounded-lg font-mono text-xs text-stone-300">
                  <div className="text-amber-400 font-bold mb-2">// 1. PageSpread Schema (Normalized Coordinates)</div>
                  <pre className="overflow-x-auto text-[11px] text-stone-300 leading-relaxed">{`{
  "id": "spread-uuid-001",
  "albumId": "album-uuid-101",
  "spreadNumber": 1,
  "templateId": "tpl-3-golden-trio",
  "background": "#FFFFFF",
  "slots": [
    {
      "id": "slot-1",
      "x": 0.06,          // 0..1 spread relative
      "y": 0.08,
      "width": 0.40,
      "height": 0.84,
      "assignedImageId": "img-uuid-501",
      "cropPanX": 0.0,    // % pan offset inside slot
      "cropPanY": 0.0,
      "zoom": 1.05,       // scale factor >= 1.0
      "rotation": 0
    }
  ]
}`}</pre>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-4 rounded-lg font-mono text-xs text-stone-300">
                  <div className="text-cyan-400 font-bold mb-2">// 2. ImageAsset &amp; Saliency Schema</div>
                  <pre className="overflow-x-auto text-[11px] text-stone-300 leading-relaxed">{`{
  "id": "img-uuid-501",
  "originalUrl": "s3://albums-raw/wedding_01.cr3",
  "previewUrl": "https://cdn/albums/wedding_01_w1200.webp",
  "width": 6000,
  "height": 4000,
  "aspectRatio": 1.5,
  "orientation": "landscape",
  "timestamp": "2026-06-14T14:15:00Z",
  "qualityScore": 98.2,
  "saliency": [
    {
      "x": 0.35, "y": 0.30,
      "width": 0.15, "height": 0.22,
      "label": "face"
    }
  ],
  "colorProfile": "sRGB",
  "exif": {
    "iso": 200,
    "focalLength": 85,
    "aperture": 1.4
  }
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. API ENDPOINTS ================= */}
        {activeTab === 'api-endpoints' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-6">
              <h2 className="text-base font-semibold text-stone-100 mb-2 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" /> REST &amp; WebSocket API Specifications (OpenAPI 3.1)
              </h2>
              <p className="text-xs text-stone-400">
                Stateless REST endpoints for batch uploads, layout solving, and render requests, with WebSocket channels
                for multi-photo upload progress and real-time canvas locking.
              </p>

              <div className="space-y-3 mt-4">
                {[
                  {
                    method: 'POST',
                    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
                    path: '/v1/albums/{albumId}/photos/batch-upload',
                    desc: 'Generates S3 presigned multipart upload URLs and queues CV ingestion tasks.',
                  },
                  {
                    method: 'POST',
                    color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
                    path: '/v1/albums/{albumId}/auto-curate',
                    desc: 'Executes the layout solver algorithm to generate optimal multi-page spreads with gutter avoidance.',
                  },
                  {
                    method: 'GET',
                    color: 'text-blue-400 border-blue-500/40 bg-blue-950/20',
                    path: '/v1/albums/{albumId}/spreads',
                    desc: 'Retrieves all spreads, slot dimensions, assigned image transforms, and preflight status.',
                  },
                  {
                    method: 'PUT',
                    color: 'text-purple-400 border-purple-500/40 bg-purple-950/20',
                    path: '/v1/albums/{albumId}/spreads/{spreadId}/slots/{slotId}',
                    desc: 'Updates frame slot pan, zoom, image assignment, or triggers atomic slot-to-slot swap.',
                  },
                  {
                    method: 'POST',
                    color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
                    path: '/v1/albums/{albumId}/preflight-check',
                    desc: 'Runs mathematical preflight audit: flags DPI < 300, center spine gutter collisions, and bleed cutoffs.',
                  },
                  {
                    method: 'POST',
                    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
                    path: '/v1/albums/{albumId}/render/cmyk-pdf',
                    desc: 'Dispatches high-priority rendering job to generate 300 DPI CMYK PDF/X-1a print files.',
                  },
                ].map((ep, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-stone-900 border border-stone-800 flex items-start gap-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold border ${ep.color}`}>
                      {ep.method}
                    </span>
                    <div className="flex-1">
                      <div className="font-mono text-xs text-stone-200">{ep.path}</div>
                      <div className="text-xs text-stone-400 mt-1">{ep.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. BACKGROUND WORKER DAG ================= */}
        {activeTab === 'worker-dag' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-6">
              <h2 className="text-base font-semibold text-stone-100 mb-2 flex items-center gap-2">
                <Workflow className="w-4 h-4 text-amber-400" /> Asynchronous Worker Pipeline &amp; DAG
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed">
                Photo batches (typically 300-1500 images per wedding or event) follow an event-driven DAG queue orchestrated
                by Celery or BullMQ with automatic backpressure and retry policies.
              </p>

              <div className="mt-6 space-y-4">
                {/* Step 1 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-200">Client Direct Upload &amp; Webhook Trigger</h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Browser uploads raw images directly to S3 via pre-signed multipart URLs. S3 ObjectCreated event pushes
                      job payload to RabbitMQ/Redis queue: <code>queue.photo.ingest</code>.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-200">Parallel Feature Extraction (Fan-Out)</h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Worker pool processes images concurrently:
                      <br />• <strong>Worker A (libvips):</strong> Generates 2048px preview WebP &amp; 300px thumbnail.
                      <br />• <strong>Worker B (MediaPipe/OpenCV):</strong> Detects human faces, landmarks, and visual saliency map.
                      <br />• <strong>Worker C (CLIP/pHash):</strong> Generates 512-dim embedding to flag near-duplicate burst shots.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-200">Layout Optimization &amp; Spread Mapping</h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Once all features in the batch are aggregated, the Layout Solver worker executes chronological DBSCAN
                      clustering, pairs portrait/landscape orientations, and solves the constraint matrix with gutter penalties.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-200">Interactive User Canvas Editing</h3>
                    <p className="text-xs text-stone-400 mt-1">
                      User receives generated album in browser editor. Real-time preflight engine evaluates zoom levels and
                      warns if effective DPI drops below 300 or if an image crosses the 0.75&quot; center fold.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-stone-900 border border-stone-800">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    5
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-200">Print Engine Rasterization &amp; PDF/X Assembly</h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Render workers retrieve master high-resolution photos, apply pan/crop transforms via Skia/libvips, convert
                      color space with LittleCMS2 to CMYK, and assemble multi-page PDF/X-1a files ready for press.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. 300 DPI CMYK RENDERING ENGINE ================= */}
        {activeTab === 'cmyk-pipeline' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-6">
              <h2 className="text-base font-semibold text-stone-100 mb-2 flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-400" /> 300 DPI CMYK Print Pipeline Deep-Dive
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed">
                Commercial printing requires rigorous pre-press standards that browser canvases cannot directly output.
                The server-side render worker performs hardware-accelerated processing adhering to ISO 15930 (PDF/X).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-stone-900 border border-stone-800">
                  <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Pixel Resolution &amp; Bleed Geometry
                  </h3>
                  <div className="mt-2 text-xs text-stone-300 space-y-2">
                    <p>
                      For a <strong>12&quot; &times; 24&quot; double-page spread</strong> with <strong>0.125&quot; bleed</strong>:
                    </p>
                    <div className="bg-stone-950 p-2.5 rounded font-mono text-[11px] text-stone-400 space-y-1">
                      <div>Spread Width: 24.0&quot; + (2 &times; 0.125&quot;) = 24.25&quot;</div>
                      <div>Spread Height: 12.0&quot; + (2 &times; 0.125&quot;) = 12.25&quot;</div>
                      <div className="text-amber-300 font-bold">
                        Pixel Canvas: 7,275 &times; 3,675 pixels @ 300 DPI
                      </div>
                    </div>
                    <p className="text-stone-400 text-[11px]">
                      Memory footprint: ~107 MB uncompressed RGBA per spread. Render workers allocate 2GB RAM per worker process.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-stone-900 border border-stone-800">
                  <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                    Color Space &amp; ICC Profiles
                  </h3>
                  <div className="mt-2 text-xs text-stone-300 space-y-2">
                    <p>
                      All client editing happens in <strong>sRGB</strong> or <strong>Display P3</strong>. Print rendering converts
                      via <code>LittleCMS2 (lcms2)</code> into press CMYK:
                    </p>
                    <div className="bg-stone-950 p-2.5 rounded font-mono text-[11px] text-stone-400 space-y-1">
                      <div>Target Standard: GRACoL 2006 Coated1v2 (USA)</div>
                      <div>EU Alternative: ISO Coated v2 (FOGRA39)</div>
                      <div>Intent: Relative Colorimetric with BPC (Black Point Comp)</div>
                      <div className="text-cyan-300 font-bold">Total Area Coverage (TAC): Max 320%</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-stone-900 border border-stone-800">
                  <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                    PDF/X-1a Conformance &amp; Boxes
                  </h3>
                  <div className="mt-2 text-xs text-stone-300 space-y-2">
                    <p className="text-[11px] text-stone-400">
                      Standard PDF files lack strict press geometry. The exporter embeds standardized PDF Page Boxes:
                    </p>
                    <ul className="list-disc list-inside text-xs text-stone-300 space-y-1">
                      <li><strong>MediaBox:</strong> Physical sheet boundary including slug &amp; registration marks.</li>
                      <li><strong>BleedBox:</strong> Extended graphics area (24.25&quot; &times; 12.25&quot;).</li>
                      <li><strong>TrimBox:</strong> Final cut boundary (24.00&quot; &times; 12.00&quot;).</li>
                      <li><strong>Gutter Fold Line:</strong> Embedded as non-printing metadata registration guides.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-stone-900 border border-stone-800">
                  <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Font &amp; Vector Text Shaping
                  </h3>
                  <div className="mt-2 text-xs text-stone-300 space-y-2">
                    <p className="text-[11px] text-stone-400">
                      Spine titles, cover lettering, and captions must never be rasterized at 300 DPI bitmap to prevent blurry letter edges:
                    </p>
                    <ul className="list-disc list-inside text-xs text-stone-300 space-y-1">
                      <li>Rendered as pure vector Bezier paths (Type 1 / TrueType / OpenType).</li>
                      <li>Glyphs shaped via <strong>HarfBuzz</strong> and <strong>FreeType</strong>.</li>
                      <li>Guaranteed 2400 DPI vector plate sharpness.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 6. THIRD-PARTY LIBRARIES & BENCHMARKS ================= */}
        {activeTab === 'libraries' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-6">
              <h2 className="text-base font-semibold text-stone-100 mb-2 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" /> Third-Party Library Evaluation &amp; Recommendation Matrix
              </h2>
              <p className="text-xs text-stone-400">
                Architectural comparison of industry-standard libraries for Computer Vision, Browser Canvas manipulation,
                and Print Rendering.
              </p>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs border border-stone-800">
                  <thead className="bg-stone-900 text-stone-300 font-semibold border-b border-stone-800">
                    <tr>
                      <th className="p-3">Domain</th>
                      <th className="p-3">Selected Tool</th>
                      <th className="p-3">Alternatives Considered</th>
                      <th className="p-3">Key Architectural Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-400">
                    <tr>
                      <td className="p-3 font-semibold text-stone-200">Face &amp; Saliency CV</td>
                      <td className="p-3 font-mono text-amber-400 font-bold">Google MediaPipe + OpenCV</td>
                      <td className="p-3">Dlib, YOLOv8, AWS Rekognition</td>
                      <td className="p-3">Sub-30ms CPU-friendly face mesh &amp; bounding box, zero cloud API recurring cost.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-stone-200">Image Deduplication</td>
                      <td className="p-3 font-mono text-amber-400 font-bold">OpenAI CLIP + pHash</td>
                      <td className="p-3">SSIM, dHash, SIFT</td>
                      <td className="p-3">Semantic clustering handles varying exposures and burst shots with high cosine accuracy.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-stone-200">Browser Canvas Editor</td>
                      <td className="p-3 font-mono text-amber-400 font-bold">Konva.js / Fabric.js</td>
                      <td className="p-3">PixiJS, Paper.js, SVG-only</td>
                      <td className="p-3">Robust clipping masks, transformation matrix, hit detection, and active React bindings.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-stone-200">Image Transcoding</td>
                      <td className="p-3 font-mono text-amber-400 font-bold">libvips (sharp)</td>
                      <td className="p-3">ImageMagick, GraphicsMagick</td>
                      <td className="p-3">4x-8x faster than ImageMagick, sequential streaming memory model prevents OOM crashes.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-stone-200">Color Management (CMYK)</td>
                      <td className="p-3 font-mono text-amber-400 font-bold">LittleCMS2 (lcms2)</td>
                      <td className="p-3">ColorSync (macOS only), Skia CMS</td>
                      <td className="p-3">Industry-standard open-source C library for accurate ICC profile transformations.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-stone-200">PDF/X-1a Generation</td>
                      <td className="p-3 font-mono text-amber-400 font-bold">PDFlib / Cairo Graphics</td>
                      <td className="p-3">Puppeteer / Chromium, pdfkit</td>
                      <td className="p-3">Strict PDF/X-1a:2001 compliance, exact BleedBox &amp; TrimBox metadata, native CMYK.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
