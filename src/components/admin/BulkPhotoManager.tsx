import React, { useState, useRef } from 'react';
import {
  Upload,
  Star,
  Trash2,
  MoveLeft,
  MoveRight,
  Image as ImageIcon,
  Plus,
  Loader2,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

interface BulkPhotoManagerProps {
  images: string[];
  thumbnail: string;
  onChangeImages: (newImages: string[]) => void;
  onSelectPrimary: (primaryUrl: string) => void;
}

// Client-side canvas compression: scales down large images to max 1200px and exports as clean JPEG data URL
export const optimizeImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const SAMPLE_LUGGAGE_PHOTOS = [
  { label: 'Cabin Front', url: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?q=80&w=1000&auto=format&fit=crop' },
  { label: 'Wheels & TSA', url: 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?q=80&w=1000&auto=format&fit=crop' },
  { label: 'Open Interior', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop' },
  { label: 'Full Duffle', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop' },
  { label: 'Leather Detail', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop' }
];

export const BulkPhotoManager: React.FC<BulkPhotoManagerProps> = ({
  images,
  thumbnail,
  onChangeImages,
  onSelectPrimary
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const safeImages = Array.isArray(images) ? images : [];
  const currentPrimary = thumbnail || safeImages[0] || '';

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;
    const validFiles = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      showToast('Please select valid image files (JPG, PNG, WebP).');
      return;
    }

    setIsProcessing(true);
    try {
      const optimizedUrls = await Promise.all(validFiles.map(optimizeImageFile));
      const nextImages = [...safeImages, ...optimizedUrls];
      onChangeImages(nextImages);

      // If no primary photo is set, default to first uploaded
      if (!currentPrimary || !nextImages.includes(currentPrimary)) {
        onSelectPrimary(nextImages[0]);
      }

      showToast(`Uploaded and optimized ${validFiles.length} photo${validFiles.length > 1 ? 's' : ''}!`);
    } catch (err) {
      console.error('Photo optimization error:', err);
      showToast('Error processing photos. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const splitUrls = urlInput
      .split(',')
      .map((u) => u.trim())
      .filter((u) => u.length > 5);

    if (splitUrls.length === 0) return;

    const nextImages = [...safeImages, ...splitUrls];
    onChangeImages(nextImages);

    if (!currentPrimary || !nextImages.includes(currentPrimary)) {
      onSelectPrimary(splitUrls[0]);
    }

    setUrlInput('');
    showToast(`Added ${splitUrls.length} photo URL${splitUrls.length > 1 ? 's' : ''}!`);
  };

  const handleAddPreset = (url: string) => {
    if (safeImages.includes(url)) {
      showToast('This sample photo is already in the gallery.');
      return;
    }
    const nextImages = [...safeImages, url];
    onChangeImages(nextImages);
    if (!currentPrimary) {
      onSelectPrimary(url);
    }
    showToast('Added sample luggage photo!');
  };

  const handleRemove = (indexToRemove: number) => {
    const photoToRemove = safeImages[indexToRemove];
    const nextImages = safeImages.filter((_, idx) => idx !== indexToRemove);
    onChangeImages(nextImages);

    if (photoToRemove === currentPrimary) {
      onSelectPrimary(nextImages[0] || '');
    }
    showToast('Photo removed.');
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= safeImages.length) return;

    const nextImages = [...safeImages];
    const [moved] = nextImages.splice(index, 1);
    nextImages.splice(targetIndex, 0, moved);
    onChangeImages(nextImages);
  };

  return (
    <div className="space-y-3.5 bg-stone-950/80 p-4 rounded-xl border border-stone-800 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <label className="font-bold text-stone-100 text-sm flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>Product Photos & Bulk Upload</span>
            </label>
            <span className="bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full font-mono text-[10px]">
              {safeImages.length} {safeImages.length === 1 ? 'photo' : 'photos'}
            </span>
          </div>
          <p className="text-stone-400 text-[11px] mt-0.5">
            Drop multiple high-resolution photos or paste URLs. Click <span className="text-amber-400 font-semibold">★ Make Primary</span> to choose the storefront cover piece.
          </p>
        </div>

        {statusMessage && (
          <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-lg text-[11px] animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Drag and drop upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer border-2 border-dashed rounded-xl p-5 text-center transition-all ${
          isDragging
            ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
            : 'border-stone-700 hover:border-amber-500/60 bg-stone-900/50 hover:bg-stone-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-2 text-amber-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-semibold text-xs">Optimizing and compressing photos...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-stone-200 text-xs">
                Drag & drop product photos here, or <span className="text-amber-400 underline decoration-amber-500/40">browse files</span>
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Supports bulk selection of JPG, PNG, WEBP, and AVIF. Automatically resized & optimized for luxury catalog display.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Paste URL row */}
      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <div className="relative flex-1">
          <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="url"
            placeholder="Paste image link (e.g. https://images.unsplash.com/...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            className="w-full pl-8 pr-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-white placeholder:text-stone-500 text-xs focus:border-amber-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 border border-stone-700 transition"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>Add Photo URL</span>
        </button>
      </div>

      {/* Quick luggage presets */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-stone-400">
        <span className="flex items-center gap-1 text-stone-400 font-medium">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Quick Luggage Angles:</span>
        </span>
        {SAMPLE_LUGGAGE_PHOTOS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handleAddPreset(preset.url)}
            className="px-2 py-0.5 bg-stone-900 hover:bg-amber-950/60 hover:text-amber-300 text-stone-300 border border-stone-800 hover:border-amber-800 rounded text-[10px] transition"
          >
            + {preset.label}
          </button>
        ))}
      </div>

      {/* Interactive Photo Gallery with Primary Selector */}
      {safeImages.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-stone-300 text-[11px] uppercase tracking-wider">
              Photo Gallery ({safeImages.length})
            </span>
            <span className="text-[10px] text-amber-400">
              Primary Cover: {safeImages.findIndex((img) => img === currentPrimary) + 1} of {safeImages.length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {safeImages.map((imgUrl, index) => {
              const isPrimary = imgUrl === currentPrimary;

              return (
                <div
                  key={`${imgUrl}-${index}`}
                  className={`group relative rounded-xl overflow-hidden border bg-stone-900 transition-all flex flex-col ${
                    isPrimary
                      ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'border-stone-800 hover:border-stone-700'
                  }`}
                >
                  {/* Photo square */}
                  <div className="relative aspect-square w-full bg-stone-950 overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={`Product photo ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Primary Badge */}
                    {isPrimary ? (
                      <div className="absolute top-2 left-2 z-10 bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 shadow-md">
                        <Star className="w-3 h-3 fill-stone-950" />
                        <span>PRIMARY COVER</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectPrimary(imgUrl)}
                        className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 bg-stone-900/90 hover:bg-amber-500 text-stone-200 hover:text-stone-950 font-semibold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 shadow transition"
                      >
                        <Star className="w-3 h-3" />
                        <span>Make Primary</span>
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-stone-950/80 hover:bg-rose-950 hover:text-rose-400 text-stone-400 shadow transition"
                      title="Remove this photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom bar with reordering and primary button */}
                  <div className="p-2 flex items-center justify-between bg-stone-950/90 border-t border-stone-800 text-[10px]">
                    <div className="flex items-center gap-1 text-stone-400">
                      <span>#{index + 1}</span>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'left')}
                        className="p-1 text-stone-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move left"
                      >
                        <MoveLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={index === safeImages.length - 1}
                        onClick={() => handleMove(index, 'right')}
                        className="p-1 text-stone-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move right"
                      >
                        <MoveRight className="w-3 h-3" />
                      </button>
                    </div>

                    {isPrimary ? (
                      <span className="text-amber-400 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Cover Photo</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectPrimary(imgUrl)}
                        className="text-stone-300 hover:text-amber-400 font-medium hover:underline text-[10px]"
                      >
                        Set Primary
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
