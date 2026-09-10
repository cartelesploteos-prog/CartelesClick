import React, { useState, useEffect } from "react";
import {
  Calculator,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { MATERIALS_CATALOG } from "../../data/materials";
import { MaterialDetailSkeleton } from "../ui/Skeleton";

interface MaterialDetailViewProps {
  materialId?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const MaterialDetailView: React.FC<MaterialDetailViewProps> = ({
  materialId,
  onNavigate,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const material =
    MATERIALS_CATALOG.find((m) => m.id === materialId) || MATERIALS_CATALOG[0];
  const [activeImage, setActiveImage] = useState<string>(material?.image || "");

  useEffect(() => {
    setIsLoading(true);
    if (material) {
      setActiveImage(material.image);
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 320);
    return () => clearTimeout(timer);
  }, [materialId, material]);

  if (isLoading) {
    return <MaterialDetailSkeleton />;
  }

  if (!material) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-36 sm:pb-44 text-center space-y-6 font-sans">
        <h2 className="font-heading text-xl text-[var(--text-primary)] font-medium">Material no encontrado</h2>
        <button
          onClick={() => onNavigate("materiales")}
          className="px-4 py-2 rounded-[7px] bg-primary text-white text-xs font-sans font-medium"
        >
          Volver al catálogo de materiales
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-36 sm:pb-44 space-y-8 sm:space-y-10 max-w-5xl font-sans">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-sans">
        <button
          onClick={() => onNavigate("home")}
          className="hover:text-[var(--text-primary)] transition-colors"
        >
          Inicio
        </button>
        <ChevronRight className="w-3 h-3" />
        <button
          onClick={() => onNavigate("materiales")}
          className="hover:text-[var(--text-primary)] transition-colors"
        >
          Materiales
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[var(--text-primary)] font-medium">
          {material.name}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: IMAGE & HIGHLIGHTS */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 overflow-hidden relative aspect-[4/3] shadow-none">
            <img
              src={activeImage || material.image}
              alt={material.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-[7px] transition-all duration-300"
            />
            {material.badge && (
              <span className="absolute top-4 right-4 text-[10px] px-2.5 py-1 rounded-[7px] bg-accent text-black font-sans font-medium">
                {material.badge}
              </span>
            )}
          </div>

          {material.sampleImages && material.sampleImages.length > 1 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-heading font-medium block">
                Muestras Reales Instaladas ({material.sampleImages.length})
              </span>
              <div className="grid grid-cols-3 gap-2">
                {material.sampleImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`aspect-video rounded-[7px] overflow-hidden border-2 transition-all p-0.5 ${
                      activeImage === img
                        ? "border-primary shadow-sm"
                        : "border-[var(--border-subtle)] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Muestra ${idx + 1} de ${material.name}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-[4px]"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-none flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-heading font-medium">
                Modalidad de Cotización
              </span>
              <p className="text-xs text-[var(--text-primary)] capitalize font-sans font-medium">
                Cálculo por{" "}
                {material.mode === "m2"
                  ? "Metro Cuadrado (m²)"
                  : material.mode === "placa"
                    ? "Placa Entera Indivisible"
                    : "Unidad Completa"}
              </p>
            </div>
            <button
              onClick={() => onNavigate("cotizador", material.id)}
              className="px-4 py-2 rounded-[7px] bg-primary hover:bg-[var(--color-primary-hover)] text-white text-xs transition-colors flex items-center gap-1.5 shrink-0 font-sans font-medium"
            >
              <Calculator className="w-4 h-4" /> <span>Cotizar Ahora</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: TECHNICAL SHEET */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-1.5">
            <span className="text-xs uppercase tracking-widest text-primary font-heading font-medium">
              Ficha Técnica Oficial
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl text-[var(--text-primary)] font-medium">
              {material.name}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans font-normal">
              {material.description}
            </p>
          </div>

          {/* SPECS GRID */}
          <div className="p-5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-none space-y-3 text-xs">
            <h3 className="font-heading text-xs uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 font-medium">
              Especificaciones de Laboratorio
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">
                  Durabilidad exterior:
                </span>
                <span className="text-[var(--text-primary)] font-medium">
                  {material.durability}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">
                  Tipo de iluminación:
                </span>
                <span className="text-[var(--text-primary)] font-medium">
                  {material.lightingType}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">
                  Tecnología de Impresión:
                </span>
                <span className="text-[var(--text-primary)] font-medium">
                  {material.printTechnology}
                </span>
              </div>
              {material.plateDimensions && (
                <div>
                  <span className="text-[var(--text-secondary)] block text-[10px]">
                    Medida de placa matriz:
                  </span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {material.plateDimensions.widthCm / 100} ×{" "}
                    {material.plateDimensions.heightCm / 100} m (
                    {material.plateDimensions.areaM2} m²)
                  </span>
                </div>
              )}
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">
                  Resolución recomendada:
                </span>
                <span className="text-[var(--text-primary)] font-medium">
                  100 - 150 DPI a escala 1:1
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">
                  Espacio de color:
                </span>
                <span className="text-[var(--text-primary)] font-medium">
                  CMYK Fogra39
                </span>
              </div>
            </div>
          </div>

          {/* APPLICATIONS */}
          <div className="space-y-3">
            <h3 className="font-heading text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium">
              Aplicaciones Frecuentes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {material.recommendedUses.map((app, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] flex items-center gap-2 font-sans"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>{app}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
