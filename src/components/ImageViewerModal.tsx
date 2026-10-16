import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, RotateCcw } from 'lucide-react';

export interface ViewerImageItem {
  url: string;
  caption?: string;
  title?: string;
}

interface ImageViewerModalProps {
  images: ViewerImageItem[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentItem = images[currentIndex] || images[0];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setScale(1);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setScale(1);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.3, 0.5));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = currentItem.url;
    link.download = (currentItem.caption || currentItem.title || 'oc_artwork') + '.png';
    link.click();
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{ zIndex: 999999 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col justify-between p-2.5 sm:p-5 select-none animate-fadeIn"
    >
      {/* Top Header Bar */}
      <div 
        className="flex items-center justify-between z-10 w-full max-w-6xl mx-auto shrink-0" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 sm:gap-3 text-white text-xs">
          <span className="font-mono bg-zinc-800 px-2 sm:px-2.5 py-1 rounded-lg border border-zinc-700 font-bold">
            {currentIndex + 1} / {images.length}
          </span>
          <span className="text-zinc-200 font-medium truncate max-w-[140px] sm:max-w-md">
            {currentItem.caption || currentItem.title || '高清原图浏览'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={handleZoomIn}
            title="放大"
            className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="缩小"
            className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            title="重置"
            className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            title="下载原图"
            className="p-1.5 text-zinc-300 hover:text-sky-300 hover:bg-zinc-800 rounded-lg transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="关闭 (Esc)"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden my-2 w-full">
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            title="上一张"
            className="absolute left-1 sm:left-4 z-20 p-2 sm:p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700 shadow-xl cursor-pointer transition active:scale-90"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        <div 
          className="max-w-full max-h-[80vh] flex items-center justify-center cursor-default transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={currentItem.url}
            alt={currentItem.caption || '大图'}
            className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
          />
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            title="下一张"
            className="absolute right-1 sm:right-4 z-20 p-2 sm:p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700 shadow-xl cursor-pointer transition active:scale-90"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnails */}
      {images.length > 1 && (
        <div 
          className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto py-1 z-10 max-w-xl mx-auto w-full no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setScale(1);
              }}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                currentIndex === idx
                  ? 'border-white scale-105 shadow-md'
                  : 'border-zinc-700 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
};
