import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Package,
  ArrowRight,
  Search,
  ZoomIn,
  Sparkles,
  Layers,
  X,
  Sun,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import { MATERIALS_CATALOG } from "../../data/materials";
import { MaterialOption } from "../../types";
import { CatalogSkeletonGrid } from "../ui/Skeleton";
import { TextureMagnifier } from "../ui/TextureMagnifier";
import { RigidsComparisonTable } from "../ui/RigidsComparisonTable";

interface MaterialsCatalogViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const MaterialsCatalogView: React.FC<MaterialsCatalogViewProps> = ({
  onNavigate,
}) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inspectingMaterial, setInspectingMaterial] = useState<MaterialOption | null>(null);
  const [macroZoom, setMacroZoom] = useState<number>(3.0);
  const [lightMode, setLightMode] = useState<"direct" | "grazing">("direct");

  // Initial and transition loading state for smooth data transitions
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  const categories = [
    { id: "all", label: "Todos los Materiales" },
    { id: "lonas", label: "Lonas Front & Back" },
    { id: "vinilos", label: "Vinilos & Ploteos" },
    { id: "rigidos", label: "Rígidos (Placas)" },
    { id: "corporeos", label: "Corpóreos 3D" },
    { id: "estampados", label: "Textil & DTF" },
  ];

  const filteredMaterials = MATERIALS_CATALOG.filter((mat) => {
    const matchesCat =
      selectedCategory === "all" || mat.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      mat.name.toLowerCase().includes(query) ||
      mat.shortDesc.toLowerCase().includes(query) ||
      mat.recommendedUses.some((app) => app.toLowerCase().includes(query));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="section-container pt-28 sm:pt-32 lg:pt-36 pb-36 sm:pb-44 space-y-12 sm:space-y-16 font-sans">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-widest text-primary font-heading font-medium">
          Sustratos Industriales Certificados
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight font-medium">
          {t("materials_title")}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-sans font-normal">
          {t("materials_subtitle")}
        </p>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        {/* CATEGORY TABS */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs transition-colors font-sans font-medium cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-primary text-white font-bold shadow-xs"
                  : "bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* SEARCH INPUT */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar material, uso o textura..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] font-sans focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* SKELETON LOADING OR MATERIALS BENTO GRID */}
      {isLoading ? (
        <CatalogSkeletonGrid count={6} />
      ) : filteredMaterials.length === 0 ? (
        <div className="p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-none text-center space-y-3 max-w-md mx-auto font-sans">
          <Package className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
          <h3 className="font-heading text-base text-[var(--text-primary)] font-medium">
            No se encontraron sustratos
          </h3>
          <p className="text-xs text-[var(--text-secondary)] font-normal">
            Probá ajustando los términos de búsqueda o seleccionando otra categoría.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="px-4 py-2 bg-primary text-white text-xs rounded-xl font-medium cursor-pointer"
          >
            Ver todos los materiales
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-none overflow-hidden flex flex-col justify-between group transition-all hover:border-primary/40"
            >
              <div>
                {/* HOVER-ACTIVATED TEXTURE MAGNIFIER */}
                <div className="relative">
                  <TextureMagnifier
                    image={mat.image}
                    name={mat.name}
                    category={mat.category}
                    materialId={mat.id}
                    zoomLevel={2.8}
                    onInspectMacro={() => setInspectingMaterial(mat)}
                  />
                  {mat.badge && (
                    <span className="absolute top-3 right-3 text-[10px] px-2.5 py-0.5 rounded-full bg-accent text-black font-sans font-bold shadow-md z-10">
                      {mat.badge}
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none z-10">
                    <span className="text-[10px] uppercase tracking-wider text-white/80 block font-heading font-semibold">
                      {mat.category} · {mat.mode.toUpperCase()}
                    </span>
                    <h3 className="text-sm text-white font-heading font-bold leading-tight mt-0.5">
                      {mat.name}
                    </h3>
                  </div>
                </div>

                {/* BODY DETAILS */}
                <div className="p-5 space-y-3.5">
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans font-normal">
                    {mat.shortDesc}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] font-sans">
                    <div className="space-y-0.5">
                      <span className="text-[var(--text-muted)] block text-[10px]">
                        Durabilidad:
                      </span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {mat.durability}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[var(--text-muted)] block text-[10px]">
                        Iluminación:
                      </span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {mat.lightingType}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 font-sans">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block font-medium">
                      Aplicaciones recomendadas:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {mat.recommendedUses.slice(0, 3).map((app, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2 font-sans">
                <button
                  type="button"
                  onClick={() => onNavigate("material-detail", mat.id)}
                  className="py-2.5 px-3 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] hover:border-primary transition-colors text-center font-medium cursor-pointer"
                >
                  Ficha Técnica
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("cotizador", mat.id)}
                  className="py-2.5 px-3 rounded-xl bg-primary hover:bg-[var(--color-primary-hover)] text-white text-xs transition-colors flex items-center justify-center gap-1 font-bold cursor-pointer shadow-xs"
                >
                  <span>Cotizar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SIDE-BY-SIDE RIGIDS COMPARISON TABLE */}
      <div className="pt-6">
        <RigidsComparisonTable
          onQuoteMaterial={(matId) => onNavigate("cotizador", matId)}
        />
      </div>

      {/* MACRO TEXTURE INSPECTOR MODAL */}
      {inspectingMaterial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md font-sans"
          role="dialog"
          aria-modal="true"
          aria-labelledby="macro-modal-title"
        >
          <div className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* MODAL HEADER */}
            <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-page)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <ZoomIn className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="macro-modal-title" className="font-heading text-sm sm:text-base font-bold text-[var(--text-primary)]">
                    Inspección Macro de Textura: {inspectingMaterial.name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {inspectingMaterial.category.toUpperCase()} · Fiel a producción física
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingMaterial(null)}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              {/* INTERACTIVE MACRO CANVAS */}
              <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-black shadow-inner">
                <img
                  src={inspectingMaterial.image}
                  alt={inspectingMaterial.name}
                  className="w-full h-full object-cover transition-transform duration-300"
                  style={{
                    transform: `scale(${macroZoom})`,
                    filter: lightMode === "grazing" ? "contrast(1.3) brightness(0.95)" : "none",
                  }}
                />
                <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-xl" />
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm text-white font-mono text-[11px]">
                  Ampliación Óptica: {macroZoom.toFixed(1)}×
                </div>
              </div>

              {/* CONTROLS (ZOOM & LIGHTING) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="font-medium text-[var(--text-primary)]">Nivel de Aumento Macro:</span>
                    <span className="font-mono text-primary font-bold">{macroZoom.toFixed(1)}×</span>
                  </div>
                  <input
                    type="range"
                    min="1.5"
                    max="5.0"
                    step="0.5"
                    value={macroZoom}
                    onChange={(e) => setMacroZoom(parseFloat(e.target.value))}
                    className="w-full h-2 rounded accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-mono">
                    <span>1.5×</span>
                    <span>3.0× (Estándar)</span>
                    <span>5.0× (Micro-grano)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-medium text-[var(--text-primary)] block">Ángulo de Iluminación:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLightMode("direct")}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        lightMode === "direct"
                          ? "bg-primary text-white border-primary"
                          : "bg-[var(--bg-page)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Luz Frontal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLightMode("grazing")}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        lightMode === "grazing"
                          ? "bg-primary text-white border-primary"
                          : "bg-[var(--bg-page)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Luz Rasante</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* TECHNICAL SPEC SUMMARY */}
              <div className="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] space-y-2 text-xs">
                <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Propiedades de Superficie y Tacto
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {inspectingMaterial.description}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] border-t border-[var(--border-subtle)]">
                  <span className="text-[var(--text-secondary)]">Tecnología de Impresión:</span>
                  <strong className="text-[var(--text-primary)]">{inspectingMaterial.printTechnology}</strong>
                </div>
              </div>

              {/* MODAL ACTION */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectingMaterial(null)}
                  className="py-2.5 px-4 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = inspectingMaterial.id;
                    setInspectingMaterial(null);
                    onNavigate("cotizador", id);
                  }}
                  className="py-2.5 px-5 rounded-xl bg-primary text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Cotizar este material</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

