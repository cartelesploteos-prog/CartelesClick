import React, { useState, useRef, useCallback } from "react";
import { ZoomIn } from "lucide-react";

export interface TextureMagnifierProps {
  image: string;
  name: string;
  category?: string;
  materialId?: string;
  zoomLevel?: number;
  onInspectMacro?: () => void;
  className?: string;
}

export const TextureMagnifier: React.FC<TextureMagnifierProps> = ({
  image,
  name,
  zoomLevel = 2.5,
  onInspectMacro,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setLensPos({ x, y });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className={`relative w-full h-44 sm:h-48 overflow-hidden bg-[var(--bg-surface-subtle)] cursor-crosshair select-none ${className}`}
    >
      {/* BASE IMAGE */}
      <img
        src={image}
        alt={`Textura de ${name}`}
        className="w-full h-full object-cover transition-transform duration-300"
        loading="lazy"
      />

      {/* GRADIENT SHADOW FOR TITLE OVERLAY READABILITY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

      {/* MAGNIFIER LOUPE (HOVER-ACTIVATED) */}
      {isHovered && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute w-28 h-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/90 shadow-2xl overflow-hidden z-20"
          style={{
            left: `${lensPos.x}%`,
            top: `${lensPos.y}%`,
            backgroundImage: `url(${image})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${zoomLevel * 100}%`,
            backgroundPosition: `${lensPos.x}% ${lensPos.y}%`,
            boxShadow: "0 10px 25px rgba(0,0,0,0.5), inset 0 0 12px rgba(0,0,0,0.25)",
          }}
        >
          {/* LOUPE CROSSHAIR INDICATOR */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div className="w-2 h-2 border border-white rounded-full" />
          </div>
        </div>
      )}

      {/* INSPECT MACRO ACTION BUTTON */}
      {onInspectMacro && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInspectMacro();
          }}
          className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full bg-black/60 hover:bg-primary backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          title="Inspeccionar textura en alta resolución"
          aria-label={`Ver textura macro de ${name}`}
        >
          <ZoomIn className="w-3 h-3 text-white" strokeWidth={2} />
          <span>Macro HD</span>
        </button>
      )}
    </div>
  );
};

export default TextureMagnifier;
