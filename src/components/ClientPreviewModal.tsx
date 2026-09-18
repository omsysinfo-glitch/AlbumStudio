import React, { useState } from 'react';
import { AlbumSheet, KarizmaPhoto, ClientComment, KarizmaProject } from '../types/karizma';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Share2,
  CheckCircle2,
  MessageSquare,
  Send,
  Smartphone,
  Monitor,
  Check,
  Sparkles,
} from 'lucide-react';

interface ClientPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: KarizmaProject;
  sheets: AlbumSheet[];
  photosMap: Map<string, KarizmaPhoto>;
  onAddComment: (sheetId: string, text: string) => void;
  onApproveAlbum: () => void;
}

export const ClientPreviewModal: React.FC<ClientPreviewModalProps> = ({
  isOpen,
  onClose,
  project,
  sheets,
  photosMap,
  onAddComment,
  onApproveAlbum,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showComments, setShowComments] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || sheets.length === 0) return null;

  const currentSheet = sheets[currentIdx] || sheets[0];

  const handleNext = () => {
    if (currentIdx < sheets.length - 1) setCurrentIdx((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx((prev) => prev - 1);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(currentSheet.id, commentText.trim());
    setCommentText('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/preview?token=kz-share-${project.id}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-zinc-100 animate-in fade-in duration-200 select-none">
      {/* Top Navbar */}
      <div className="h-14 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <div className="font-serif tracking-widest text-amber-400 font-bold text-sm">
            KARIZMA CLIENT PREVIEW
          </div>
          <span className="text-zinc-600">•</span>
          <span className="text-xs text-zinc-300 font-medium">{project.name}</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {project.status.toUpperCase()}
          </span>
        </div>

        {/* Device Switcher & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition ${
                previewDevice === 'desktop' ? 'bg-zinc-800 text-zinc-100 shadow' : 'text-zinc-400'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop Spread
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition ${
                previewDevice === 'mobile' ? 'bg-zinc-800 text-zinc-100 shadow' : 'text-zinc-400'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile Swipe
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 flex items-center gap-1.5 transition"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            {copiedLink ? 'Link Copied' : 'Share Client Link'}
          </button>

          <button
            onClick={onApproveAlbum}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            Client Approve Album
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Presentation Stage */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Album Center Stage */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-zinc-950">
          {/* Spread Viewer Container */}
          <div
            className={`transition-all duration-300 relative shadow-2xl rounded-lg overflow-hidden border border-zinc-800 ${
              previewDevice === 'desktop'
                ? 'w-full max-w-5xl aspect-[36/12]'
                : 'w-80 aspect-[9/16] border-4 border-zinc-700 rounded-3xl'
            }`}
            style={{
              background:
                currentSheet.background.type === 'gradient'
                  ? currentSheet.background.value
                  : currentSheet.background.value || '#111',
            }}
          >
            {/* Center Gutter Line (Desktop mode) */}
            {previewDevice === 'desktop' && (
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-black/40 z-10 pointer-events-none shadow-[0_0_12px_rgba(0,0,0,0.8)]" />
            )}

            {/* Objects on Current Spread */}
            {currentSheet.objects.map((obj) => {
              if (obj.type === 'photo') {
                const photo = obj.photoId ? photosMap.get(obj.photoId) : null;
                return (
                  <div
                    key={obj.id}
                    className="absolute overflow-hidden transition-all duration-200"
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
                      zIndex: obj.zIndex,
                    }}
                  >
                    {photo ? (
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                        style={{
                          transform: `scale(${obj.zoom}) translate(${obj.cropPanX}%, ${obj.cropPanY}%)`,
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs">
                        Photo Placeholder
                      </div>
                    )}
                  </div>
                );
              }

              if (obj.type === 'text') {
                return (
                  <div
                    key={obj.id}
                    className="absolute flex items-center justify-center pointer-events-none"
                    style={{
                      left: `${obj.x * 100}%`,
                      top: `${obj.y * 100}%`,
                      width: `${obj.width * 100}%`,
                      height: `${obj.height * 100}%`,
                      zIndex: obj.zIndex,
                      textAlign: obj.textAlign,
                    }}
                  >
                    <span
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
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* Spread Navigator Controls */}
          <div className="flex items-center gap-6 mt-6">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="p-2.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="text-xs font-bold text-zinc-200 tracking-wider">
                SPREAD {String(currentSheet.sheetNumber).padStart(2, '0')} OF {String(sheets.length).padStart(2, '0')}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">{currentSheet.title}</div>
            </div>

            <button
              onClick={handleNext}
              disabled={currentIdx === sheets.length - 1}
              className="p-2.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Sidebar: Client Comments & Feedback */}
        <div
          className={`w-80 border-l border-zinc-800 bg-zinc-900/95 flex flex-col transition-all duration-300 ${
            showComments ? 'translate-x-0' : 'translate-x-full absolute right-0 bottom-0 top-0'
          }`}
        >
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Sheet Comments ({currentSheet.comments?.length || 0})
            </h4>
            <span className="text-[10px] text-zinc-400">Spread #{currentSheet.sheetNumber}</span>
          </div>

          {/* Comment Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {(!currentSheet.comments || currentSheet.comments.length === 0) ? (
              <div className="text-center py-12 text-zinc-500 space-y-1">
                <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs font-medium">No comments on this spread yet.</p>
                <p className="text-[11px]">Type feedback below to communicate directly with your album designer.</p>
              </div>
            ) : (
              currentSheet.comments.map((c) => (
                <div key={c.id} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200">{c.authorName}</span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">{c.commentText}</p>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <form onSubmit={handleSendComment} className="p-3 border-t border-zinc-800 bg-zinc-950 flex gap-2">
            <input
              type="text"
              placeholder="Add comment for designer..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="p-2 rounded-lg bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-40 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
