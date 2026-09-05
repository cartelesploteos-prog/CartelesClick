import React, { useState, useRef } from "react";
import { ZoomIn, Sparkles, Layers, Eye } from "lucide-react";

interface TextureMagnifierProps {
  image: string;
  name: string;
  category: string;
  materialId: string;
  zoomLevel?: number;
  onInspectMacro?: () => void;
}

// Specific texture descriptions for each material type
const getTextureInfo = (category: string, id: string) => {
  if (id.includes("pvc")) {
    return {
      type: "PVC Espumado (Sintra)",
      finish: "Mate Sedoso / Celda Cerrada",
      detail: "Micro-estructura alveolar cerrada, sin poros visibles. Superficie mate anti-reflejo suave al tacto.",
      macroPattern: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
    };
  }
  if (id.includes("acrilico")) {
    return {
      type: "Acrílico Colado (PMMA)",
      finish: "Brillante Espejo Óptico",
      detail: "Superficie 100% lisa reflectiva con brillo cristalino y cantos pulidos a fuego.",
      macroPattern: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.1) 100%)",
    };
  }
  if (id.includes("alto_impacto") || id.includes("pai")) {
    return {
      type: "P.A.I. (Poliestireno Alto Impacto)",
      finish: "Semibrillante No Poroso",
      detail: "Termoplástico compacto semibrillante, lavable con alcohol y detergentes sin absorber humedad.",
      macroPattern: "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
    };
  }
  if (id.includes("mesh")) {
    return {
      type: "Lona Microperforada (Mesh)",
      finish: "Trama Cortaviento 50/50",
      detail: "Tejido de poliéster 1000D recubierto con microperforaciones regulares que dejan pasar el viento.",
      macroPattern: "radial-gradient(circle, rgba(0,0,0,0.4) 2px, transparent 2px)",
    };
  }
  if (category === "lonas") {
    return {
      type: "Lona Front / Blackout",
      finish: id.includes("mate") ? "Mate Satinado" : "Brillante 13 oz",
      detail: "Tejido tramado de poliéster de alta tenacidad con recubrimiento vinílico impermeable.",
      macroPattern: "repeating-linear-gradient(0deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 1px, transparent 1px, transparent 3px)",
    };
  }
  if (id.includes("esmerilado")) {
    return {
      type: "Vinilo Esmerilado",
      finish: "Efecto Arenado al Ácido",
      detail: "Micro-partículas translúcidas que difuminan la luz brindando privacidad sin oscurecer.",
      macroPattern: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
    };
  }
  if (id.includes("microperforado")) {
    return {
      type: "Vinilo Microperforado",
      finish: "Perforación One-Way Vision 50/50",
      detail: "Micro-agujeros de 1.5mm con dorso negro que permite visión unidireccional desde el interior.",
      macroPattern: "radial-gradient(circle, rgba(0,0,0,0.6) 2px, transparent 2px)",
    };
  }
  return {
    type: "Vinilo Autoadhesivo",
    finish: id.includes("mate") ? "Mate Anti-Reflejo" : "Brillante Alta Reflexión",
    detail: "Película monomérica/polimérica con adhesivo acrílico permanente de alta estabilidad.",
    macroPattern: "linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%)",
  };
};

export const TextureMagnifier: React.FC<TextureMagnifierProps> = ({
  image,
  name,
  category,
  materialId,
  zoomLevel = 2.8,
  onInspectMacro,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [pixelCoords, setPixelCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const textureInfo = getTextureInfo(category, materialId);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    
    setCoords({ x, y });
    setPixelCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const lensSize = 130; // Lens diameter in px

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="relative w-full h-48 sm:h-52 overflow-hidden bg-gray-900 select-none group cursor-crosshair"
    >
      {/* BASE IMAGE */}
      <img
        src={image}
        alt={name}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover transition-all duration-300 ${
          isHovered ? "scale-105 filter brightness-90" : "scale-100"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

      {/* DEFAULT HINT BADGE (WHEN NOT HOVERED) */}
      <div
        className={`absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] flex items-center gap-1.5 transition-opacity duration-200 pointer-events-none ${
          isHovered ? "opacity-0" : "opacity-90"
        }`}
      >
        <ZoomIn className="w-3 h-3 text-primary animate-pulse" />
        <span>Pase el cursor para ver textura 2.8×</span>
      </div>

      {/* INTERACTIVE MAGNIFYING LENS (WHEN HOVERED) */}
      {isHovered && (
        <>
          {/* LOUPE / MAGNIFYING GLASS */}
          <div
            className="absolute pointer-events-none rounded-full border-2 border-primary shadow-[0_0_25px_rgba(255,85,32,0.6),inset_0_0_15px_rgba(0,0,0,0.5)] overflow-hidden z-20 transition-transform duration-75"
            style={{
              width: `${lensSize}px`,
              height: `${lensSize}px`,
              left: `${pixelCoords.x - lensSize / 2}px`,
              top: `${pixelCoords.y - lensSize / 2}px`,
            }}
          >
            {/* ZOOMED BACKGROUND IMAGE */}
            <div
              className="absolute inset-0 bg-no-repeat"
              style={{
                backgroundImage: `url(${image})`,
                backgroundPosition: `${coords.x}% ${coords.y}%`,
                backgroundSize: `${zoomLevel * 100}%`,
              }}
            />

            {/* SYNTHETIC MICRO-TEXTURE GRAIN OVERLAY */}
            <div
              className="absolute inset-0 mix-blend-overlay opacity-40 pointer-events-none"
              style={{
                backgroundImage: textureInfo.macroPattern,
                backgroundSize: "6px 6px",
              }}
            />

            {/* LOUPE GLASS REFLECTION & CROSSHAIR */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-black/30 pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3 h-3 border border-white/60 rounded-full" />
              <div className="w-[1px] h-6 bg-white/40 absolute" />
              <div className="h-[1px] w-6 bg-white/40 absolute" />
            </div>

            {/* ZOOM FACTOR BADGE ON LOUPE */}
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono font-bold text-white shadow">
              {zoomLevel}× Zoom
            </span>
          </div>

          {/* FLOATING TEXTURE DESCRIPTION BADGE */}
          <div className="absolute top-3 left-3 right-3 p-2 rounded-lg bg-black/85 backdrop-blur-md border border-primary/40 text-white text-left z-10 transition-all pointer-events-none shadow-lg animate-fadeIn">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-primary flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {textureInfo.type}
              </span>
              <span className="text-amber-400 font-mono text-[9px] px-1.5 py-0.2 rounded bg-amber-400/10">
                {textureInfo.finish}
              </span>
            </div>
            <p className="text-[10px] text-gray-300 leading-tight mt-0.5 line-clamp-1">
              {textureInfo.detail}
            </p>
          </div>
        </>
      )}

      {/* QUICK BUTTON TO OPEN MACRO INSPECTOR MODAL */}
      {onInspectMacro && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInspectMacro();
          }}
          className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/70 hover:bg-primary text-white text-[11px] transition-all flex items-center gap-1 shadow-md z-10 cursor-pointer"
          title="Abrir lupa macro de alta definición"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="text-[10px] font-medium hidden sm:inline">Lupa Macro</span>
        </button>
      )}
    </div>
  );
};
