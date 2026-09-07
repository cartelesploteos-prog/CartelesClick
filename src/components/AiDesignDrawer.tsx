import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Type,
  Palette,
  Layers,
  Box,
  Image as ImageIcon,
  Check,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sliders,
  Sparkle,
  Eye,
  CheckCircle2,
  ArrowRight,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { useCurrencyStore } from "../store/useCurrencyStore";
import { AiDesignPanelSkeleton } from "./ui/Skeleton";

export interface GeneratedDesignPayload {
  id: string;
  title: string;
  prompt: string;
  headline: string;
  subheadline?: string;
  themePalette: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  previewMode: "2d" | "3d";
  widthCm: number;
  heightCm: number;
}

interface AiDesignDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentMaterialName?: string;
  currentWidthCm?: number;
  currentHeightCm?: number;
  onApplyDesign: (design: GeneratedDesignPayload) => void;
  initialPrompt?: string;
}

const DESIGN_PRESETS = [
  {
    id: "gastro-burger",
    title: "Hamburguesería & Gastro",
    prompt: "Cartel Neón 3D 'BURGER CRAFT', fondo ladrillo oscuro, tipografía bold retro, iluminación ámbar cálida",
    headline: "BURGER CRAFT",
    subheadline: "Auténticas Hamburguesas a la Parrilla",
    themePalette: "brand-brick",
    primaryColor: "[var(--brand-brick)]",
    backgroundColor: "#121316",
    textColor: "#FAF8F5",
  },
  {
    id: "cafe-specialty",
    title: "Cafetería de Especialidad",
    prompt: "Marquesina industrial para Cafetería 'ESPRESSO LAB', tipografía sans serif limpia, fondo lona mate negra",
    headline: "ESPRESSO LAB",
    subheadline: "Specialty Coffee & Bakery",
    themePalette: "craft",
    primaryColor: "#E09F3E",
    backgroundColor: "#1E1A17",
    textColor: "#FDFBF7",
  },
  {
    id: "store-sneakers",
    title: "Vidriera Urbana / Calzado",
    prompt: "Vinilo microperforado para Vidriera de 'URBAN SNEAKERS', siluetas dinámicas, degrades cyan y naranja",
    headline: "URBAN SNEAKERS",
    subheadline: "Nueva Colección Streetwear",
    themePalette: "cyan-orange",
    primaryColor: "#00E5FF",
    backgroundColor: "#0A0B10",
    textColor: "#FFFFFF",
  },
  {
    id: "dtf-textil",
    title: "Estampado Textil DTF",
    prompt: "DTF Textil alta definición 'VINTAGE MOTORS CO.', vectores nítidos, estética garage personalizada",
    headline: "VINTAGE MOTORS",
    subheadline: "Custom Garage & Apparel",
    themePalette: "brand-brick",
    primaryColor: "[var(--brand-brick)]",
    backgroundColor: "#222222",
    textColor: "#FFFFFF",
  },
  {
    id: "corporeo-office",
    title: "Corpóreo Estudio / Oficina",
    prompt: "Letras 3D Polifán y Acrílico para 'STUDIO ARCHITECTURE', dorado mate sobre relieve negro",
    headline: "STUDIO ARCHITECTURE",
    subheadline: "Arquitectura & Diseño Integral",
    themePalette: "gold-black",
    primaryColor: "#D4AF37",
    backgroundColor: "#181818",
    textColor: "#F5F5F5",
  },
];

export const AiDesignDrawer: React.FC<AiDesignDrawerProps> = ({
  isOpen,
  onClose,
  currentMaterialName = "Lona Frontlight",
  currentWidthCm = 200,
  currentHeightCm = 100,
  onApplyDesign,
  initialPrompt = "",
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrencyStore();

  const [prompt, setPrompt] = useState(initialPrompt);
  const [headline, setHeadline] = useState("GRAN LIQUIDACIÓN DE TEMPORADA");
  const [subheadline, setSubheadline] = useState("Hasta 50% de descuento · Calidad garantizada");
  const [selectedStyle, setSelectedStyle] = useState("✨ Tipografía Neón");
  const [themePalette, setThemePalette] = useState("brand-brick");
  const [primaryColor, setPrimaryColor] = useState("[var(--brand-brick)]");
  const [backgroundColor, setBackgroundColor] = useState("#121316");
  const [textColor, setTextColor] = useState("#FAF8F5");
  const [previewMode, setPreviewMode] = useState<"2d" | "3d">("2d");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  // Sync initialPrompt
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(decodeURIComponent(initialPrompt));
    }
  }, [initialPrompt]);

  const handleGenerateWithAi = async () => {
    setIsGenerating(true);
    setIsApplied(false);
    try {
      // Simulate/call Gemini API assisted layout generation
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      if (prompt.trim()) {
        const words = prompt.trim().split(" ");
        if (words.length > 2) {
          setHeadline(words.slice(0, 3).join(" ").toUpperCase());
          setSubheadline(words.slice(3).join(" "));
        } else {
          setHeadline(prompt.toUpperCase());
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyPreset = (preset: typeof DESIGN_PRESETS[0]) => {
    setPrompt(preset.prompt);
    setHeadline(preset.headline);
    setSubheadline(preset.subheadline);
    setThemePalette(preset.themePalette);
    setPrimaryColor(preset.primaryColor);
    setBackgroundColor(preset.backgroundColor);
    setTextColor(preset.textColor);
    setIsApplied(false);
  };

  const handleConfirmApply = () => {
    onApplyDesign({
      id: `ai-design-${Date.now()}`,
      title: headline,
      prompt,
      headline,
      subheadline,
      themePalette,
      primaryColor,
      backgroundColor,
      textColor,
      previewMode,
      widthCm: currentWidthCm,
      heightCm: currentHeightCm,
    });
    setIsApplied(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="ai-design-drawer-container"
        className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/50 backdrop-blur-xs transition-opacity"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />

        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="relative w-full max-w-2xl sm:max-w-3xl bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] h-full shadow-2xl flex flex-col z-10 overflow-hidden"
          role="dialog"
          aria-label="Panel Asistente de Diseño IA y Mockup"
        >
          {/* HEADER */}
          <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-subtle)]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--brand-brick)] to-[#FFA048] flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span>Asistente de Diseño & Mockup IA</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-semibold">
                    En Vivo
                  </span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Configuración directa para: <strong>{currentMaterialName}</strong> ({currentWidthCm}×{currentHeightCm} cm)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-subtle)] transition-all cursor-pointer"
                title="Cerrar panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MAIN BODY - SCROLLABLE */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* LIVE PREVIEW CANVAS / MOCKUP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  Previsualización de Gráfica & Espacio
                </span>
                <div className="flex items-center gap-1 bg-[var(--bg-surface-subtle)] p-1 rounded-lg border border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("2d")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      previewMode === "2d"
                        ? "bg-primary text-white shadow-xs"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    2D Gráfica
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("3d")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      previewMode === "3d"
                        ? "bg-primary text-white shadow-xs"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    3D en Muro
                  </button>
                </div>
              </div>

              {isGenerating ? (
                <AiDesignPanelSkeleton />
              ) : (
                <div
                  className="relative w-full rounded-2xl overflow-hidden border border-[var(--border-subtle)] flex items-center justify-center p-6 sm:p-8 min-h-[220px] transition-all shadow-inner"
                  style={{
                    backgroundColor: previewMode === "3d" ? "#1b1c20" : backgroundColor,
                    backgroundImage:
                      previewMode === "3d"
                        ? `radial-gradient(circle at 50% 30%, rgba(255,85,32,0.15), transparent 70%), url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80')`
                        : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Aspect-Ratio Box Representing the Sign */}
                  <div
                    className={`relative w-full max-w-lg p-6 sm:p-8 rounded-xl shadow-2xl flex flex-col items-center justify-center text-center transition-all ${
                      previewMode === "3d"
                        ? "border-2 border-white/20 ring-4 ring-black/40 scale-95"
                        : "border border-white/10"
                    }`}
                    style={{
                      backgroundColor: backgroundColor,
                      boxShadow:
                        previewMode === "3d"
                          ? "0 25px 50px -12px rgba(0,0,0,0.8), 0 0 30px rgba(255,85,32,0.3)"
                          : "0 10px 30px rgba(0,0,0,0.3)",
                    }}
                  >
                    {/* Badge / Tag */}
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider mb-3 border shadow-xs font-bold"
                      style={{
                        backgroundColor: `${primaryColor}25`,
                        color: primaryColor,
                        borderColor: `${primaryColor}50`,
                      }}
                    >
                      {currentMaterialName} · {currentWidthCm}×{currentHeightCm} cm
                    </span>

                    {/* Headline */}
                    <h4
                      className="text-xl sm:text-2xl lg:text-3xl font-extrabold uppercase tracking-tight leading-tight transition-all font-heading"
                      style={{
                        color: primaryColor,
                        textShadow: `0 0 20px ${primaryColor}60`,
                      }}
                    >
                      {headline}
                    </h4>

                    {/* Subheadline */}
                    {subheadline && (
                      <p
                        className="text-xs sm:text-sm mt-2 max-w-md font-medium leading-snug"
                        style={{ color: textColor }}
                      >
                        {subheadline}
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-between text-[10px] text-white/60 font-mono">
                      <span>1440 DPI Ultra HD</span>
                      <span>Taller Central · Carteles.Click</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI GENERATOR INPUT & QUICK PRESETS */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Generar o Personalizar con Inteligencia Artificial
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describí tu negocio, oferta o texto deseado..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-[var(--text-muted)]"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateWithAi}
                    disabled={isGenerating}
                    className="px-4 py-2.5 rounded-xl bg-primary hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGenerating ? "Generando..." : "Componer"}</span>
                  </button>
                </div>
              </div>

              {/* QUICK PRESETS CARDS */}
              <div className="space-y-2">
                <span className="text-[11px] text-[var(--text-muted)] uppercase font-mono block">
                  Plantillas Rápidas por Rubro:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DESIGN_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-primary/50 text-left transition-all flex items-start gap-2.5 cursor-pointer"
                    >
                      <div
                        className="w-4 h-4 rounded-full shrink-0 mt-0.5 border border-white/20"
                        style={{ backgroundColor: p.primaryColor }}
                      />
                      <div className="min-w-0 flex-1">
                        <strong className="text-xs text-[var(--text-primary)] block truncate">
                          {p.title}
                        </strong>
                        <p className="text-[10px] text-[var(--text-secondary)] truncate">
                          "{p.headline}"
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* DIRECT TEXT EDITORS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-[var(--text-secondary)] font-bold block">
                    Título Principal
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-[var(--text-secondary)] font-bold block">
                    Subtítulo / Bajada
                  </label>
                  <input
                    type="text"
                    value={subheadline}
                    onChange={(e) => setSubheadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)]"
                  />
                </div>
              </div>

              {/* COLOR SELECTION */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--text-secondary)] font-bold">Color Principal:</span>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--text-secondary)] font-bold">Fondo:</span>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              id="btn-apply-ai-design-to-quote"
              onClick={handleConfirmApply}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-primary hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {isApplied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>¡Diseño Aplicado a tu Cotización!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Aplicar este Diseño a la Cotización</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
};
