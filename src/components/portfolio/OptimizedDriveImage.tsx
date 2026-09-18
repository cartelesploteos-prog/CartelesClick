import React, { useState } from "react";
import { Image as ImageIcon, RefreshCw, AlertCircle } from "lucide-react";

interface OptimizedDriveImageProps {
  src: string;
  alt: string;
  driveFileId?: string;
  thumbnailUrl?: string;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
}

export const OptimizedDriveImage: React.FC<OptimizedDriveImageProps> = ({
  src,
  alt,
  driveFileId,
  thumbnailUrl,
  className = "",
  containerClassName = "",
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);

  // Generate cascaded fallback candidates for Google Drive public files
  const sourceCandidates = React.useMemo(() => {
    const list: string[] = [];
    if (src) list.push(src);

    if (driveFileId) {
      // 1. Google Drive direct high-res thumbnail
      list.push(`https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1200`);
      // 2. Google usercontent proxy
      list.push(`https://lh3.googleusercontent.com/d/${driveFileId}`);
      // 3. UC Export View link
      list.push(`https://drive.google.com/uc?export=view&id=${driveFileId}`);
    }

    if (thumbnailUrl && !list.includes(thumbnailUrl)) {
      list.push(thumbnailUrl);
    }

    // High quality industrial fallback image if all Drive links fail
    list.push("https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80");

    return Array.from(new Set(list));
  }, [src, driveFileId, thumbnailUrl]);

  const activeSrc = sourceCandidates[currentSrcIndex] || sourceCandidates[0];

  const handleImageError = () => {
    if (currentSrcIndex < sourceCandidates.length - 1) {
      setCurrentSrcIndex((prev) => prev + 1);
    } else {
      setHasError(true);
      setIsLoaded(true);
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[var(--bg-surface-subtle)] ${containerClassName}`}
      onClick={onClick}
    >
      {/* SKELETON PLACEHOLDER DURING LOADING */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--bg-surface-subtle)] animate-pulse">
          <div className="w-10 h-10 rounded-full bg-[var(--border-subtle)]/60 flex items-center justify-center text-[var(--text-secondary)]/50 mb-2">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div className="w-24 h-2 rounded bg-[var(--border-subtle)]/50" />
          <div className="w-16 h-1.5 rounded bg-[var(--border-subtle)]/40 mt-1.5" />
          {/* Subtle shimmer bar */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.6s_infinite]" />
        </div>
      )}

      {/* RENDERED OPTIMIZED IMAGE */}
      <img
        src={activeSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={handleImageError}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${className}`}
      />

      {/* ERROR FALLBACK INDICATOR */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-3 text-center bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)]">
          <AlertCircle className="w-6 h-6 text-amber-500 mb-1" />
          <p className="text-[11px] font-medium text-[var(--text-primary)]">Vista previa no disponible</p>
          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Enlace público de Drive en actualización</p>
        </div>
      )}
    </div>
  );
};
