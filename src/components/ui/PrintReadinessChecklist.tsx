import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  FileCheck,
  Palette,
  Crop,
  Type,
  Maximize2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { IconBadge } from "./IconBadge";

export interface PrintCheckItem {
  id: string;
  title: string;
  shortDesc: string;
  category: "bleed" | "color" | "typography" | "resolution" | "safety" | "format";
  recommendedValue: string;
  guideText: string;
  softwareTips: {
    illustrator?: string;
    photoshop?: string;
    canva?: string;
  };
  isRequired: boolean;
}

const DEFAULT_PRINT_STEPS: PrintCheckItem[] = [
  {
    id: "bleed-check",
    title: "1. Sangrado & Demasías (Bleed)",
    shortDesc: "3 a 5 mm perimétricos para corte limpio, o 25 mm para dobladillo en lonas.",
    category: "bleed",
    recommendedValue: "3-5 mm (rígidos/vinilos) · 25 mm (lonas con dobladillo)",
    guideText:
      "La demasía o sangrado extiende el fondo más allá de la línea de corte final. De esta forma, cualquier leve desplazamiento milimétrico de la guillotina o mesa de corte no dejará filos blancos indeseados.",
    softwareTips: {
      illustrator: "Archivo > Ajustar documento > Sangrado: 5 mm en los 4 lados.",
      photoshop: "Imagen > Tamaño de lienzo > Agregar 1 cm (0.5 cm por lado).",
      canva: "Archivo > Configuración de vista > Mostrar sangría para impresión.",
    },
    isRequired: true,
  },
  {
    id: "color-profile-check",
    title: "2. Espacio de Color CMYK",
    shortDesc: "Modo CMYK (FOGRA39 o US Web Coated) para evitar desvíos con respecto a RGB.",
    category: "color",
    recommendedValue: "CMYK FOGRA39 (ISO 12647-2)",
    guideText:
      "Los monitores emiten luz en RGB, pero los plotters de impresión mezclan tintas físicas Cian, Magenta, Amarillo y Negro (CMYK). Diseñar en CMYK garantiza que los colores impresos coincidan fielmente con lo que ves en pantalla.",
    softwareTips: {
      illustrator: "Archivo > Modo de color del documento > Color CMYK.",
      photoshop: "Imagen > Modo > Color CMYK.",
      canva: "Al descargar: Seleccionar PDF para impresión > Perfil de color CMYK.",
    },
    isRequired: true,
  },
  {
    id: "fonts-curves-check",
    title: "3. Textos Convertidos a Curvas",
    shortDesc: "Tipografías vectorizadas para evitar sustitución accidental de fuentes.",
    category: "typography",
    recommendedValue: "Todos los textos como trazados vectoriales",
    guideText:
      "Si el archivo contiene fuentes editables y nuestro RIP no tiene instalada tu tipografía particular, el sistema la reemplazará por una genérica alterando el diseño. Al crear contornos, las letras se convierten en vectores seguros.",
    softwareTips: {
      illustrator: "Seleccionar todo (Ctrl+A) > Texto > Crear contornos (Ctrl+Shift+O).",
      photoshop: "Capa > Texto > Convertir en forma, o exportar como PDF acoplado.",
    },
    isRequired: true,
  },
  {
    id: "resolution-dpi-check",
    title: "4. Resolución a Escala Real",
    shortDesc: "150 DPI al 100% de tamaño real (o 300 DPI al 50% de escala).",
    category: "resolution",
    recommendedValue: "150 DPI reales a distancia de calle",
    guideText:
      "Para carteles de gran formato observados a más de 1 metro, 150 DPI proporciona una nitidez fotográfica impecable sin generar archivos gigantes de varios gigabytes que traban el flujo de pre-prensa.",
    softwareTips: {
      photoshop: "Imagen > Tamaño de imagen > Resolución: 150 píxeles por pulgada al tamaño métrico final.",
    },
    isRequired: false,
  },
  {
    id: "safety-margins-check",
    title: "5. Zona de Seguridad & Ojales",
    shortDesc: "Textos y logos separados a 50 mm del borde si lleva ojales o refuerzo.",
    category: "safety",
    recommendedValue: "Mínimo 5 cm libre de información importante en bordes",
    guideText:
      "Los ojales metálicos se colocan perforando la lona a 2-3 cm del borde perimetral. Mantené teléfonos, logos y textos fuera de esta franja de seguridad para evitar que queden perforados.",
    softwareTips: {
      illustrator: "Crear guías internas a 50 mm de los límites del lienzo.",
    },
    isRequired: false,
  },
  {
    id: "format-export-check",
    title: "6. Formato de Archivo Pre-Prensa",
    shortDesc: "Exportar en PDF/X-1a, TIFF LZW o Illustrator vectorial (.AI).",
    category: "format",
    recommendedValue: "PDF/X-1a:2001 estándar de imprenta",
    guideText:
      "El formato PDF/X-1a acopla transparencias complejas y garantiza que los degradados, sombras y cortes no sufran incompatibilidades al enviarse al procesador RIP de los plotters.",
    softwareTips: {
      illustrator: "Guardar como > Adobe PDF > Ajuste preestablecido: PDF/X-1a:2001.",
    },
    isRequired: true,
  },
];

interface PrintReadinessChecklistProps {
  onAllVerified?: (isReady: boolean) => void;
  className?: string;
  compact?: boolean;
  title?: string;
  description?: string;
  defaultCollapsed?: boolean;
}

export const PrintReadinessChecklist: React.FC<PrintReadinessChecklistProps> = ({
  onAllVerified,
  className = "",
  compact = false,
  title = "Control de Pre-Prensa (Print Readiness)",
  description = "Chequeo técnico de archivos para garantizar una producción libre de errores y cortes perfectos.",
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed);
  const [checkedIds, setCheckedIds] = useState<string[]>(["color-profile-check", "resolution-dpi-check"]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assistedReviewRequested, setAssistedReviewRequested] = useState<boolean>(false);

  const totalSteps = DEFAULT_PRINT_STEPS.length;
  const verifiedCount = checkedIds.length;
  const progressPercent = Math.round((verifiedCount / totalSteps) * 100);
  const isAllVerified = verifiedCount === totalSteps;

  const toggleCheck = (id: string) => {
    const updated = checkedIds.includes(id)
      ? checkedIds.filter((item) => item !== id)
      : [...checkedIds, id];
    setCheckedIds(updated);
    if (onAllVerified) {
      onAllVerified(updated.length === totalSteps || assistedReviewRequested);
    }
  };

  const handleVerifyAll = () => {
    const allIds = DEFAULT_PRINT_STEPS.map((s) => s.id);
    setCheckedIds(allIds);
    if (onAllVerified) {
      onAllVerified(true);
    }
  };

  const getStepIcon = (category: string) => {
    switch (category) {
      case "bleed":
        return <Crop className="w-4 h-4 text-primary" strokeWidth={1.85} />;
      case "color":
        return <Palette className="w-4 h-4 text-amber-500" strokeWidth={1.85} />;
      case "typography":
        return <Type className="w-4 h-4 text-blue-500" strokeWidth={1.85} />;
      case "resolution":
        return <Maximize2 className="w-4 h-4 text-emerald-500" strokeWidth={1.85} />;
      case "safety":
        return <AlertTriangle className="w-4 h-4 text-purple-500" strokeWidth={1.85} />;
      default:
        return <FileCheck className="w-4 h-4 text-primary" strokeWidth={1.85} />;
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4 ${className}`}>
      {/* HEADER WITH STATUS BADGE & PROGRESS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <div className="flex items-center gap-2">
            <IconBadge icon={FileCheck} size="sm" variant="primary" containerStyle="subtle" />
            <h3 className="font-heading text-sm sm:text-base font-bold text-[var(--text-primary)]">
              {title}
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {description}
          </p>
        </div>

        {/* READINESS BADGE & COLLAPSE TOGGLE */}
        <div className="flex items-center gap-2">
          {isAllVerified ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
              <span>100% Listo</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-1.5 shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.85} />
              <span>{verifiedCount} de {totalSteps} validados</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label={isCollapsed ? "Expandir checklist" : "Colapsar checklist"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >

      {/* PROGRESS BAR */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono text-[var(--text-secondary)]">
          <span>Progreso de validación</span>
          <span className="font-bold text-[var(--text-primary)]">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[var(--bg-surface-subtle)] overflow-hidden border border-[var(--border-subtle)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`h-full rounded-full transition-colors ${
              isAllVerified ? "bg-emerald-500" : "bg-primary"
            }`}
          />
        </div>
      </div>

      {/* STEP BY STEP INTERACTIVE ACCORDION / CHECKLIST */}
      <div className="space-y-2 pt-1">
        {DEFAULT_PRINT_STEPS.map((step) => {
          const isChecked = checkedIds.includes(step.id);
          const isExpanded = expandedId === step.id;

          return (
            <div
              key={step.id}
              className={`rounded-xl border transition-all ${
                isChecked
                  ? "bg-[var(--bg-surface-subtle)] border-emerald-500/30"
                  : "bg-[var(--bg-surface-subtle)]/60 border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
              }`}
            >
              <div className="p-3 sm:p-3.5 flex items-start sm:items-center justify-between gap-3">
                {/* CHECKBOX & TITLE */}
                <div
                  onClick={() => toggleCheck(step.id)}
                  className="flex items-start sm:items-center gap-3 flex-1 min-w-0 cursor-pointer select-none"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCheck(step.id);
                    }}
                    className="mt-0.5 sm:mt-0 text-[var(--text-secondary)] hover:text-primary transition-colors cursor-pointer shrink-0"
                    aria-label={`Marcar ${step.title}`}
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" strokeWidth={2} />
                    ) : (
                      <Circle className="w-5 h-5 text-[var(--text-secondary)] hover:text-primary" strokeWidth={1.85} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className={`text-xs sm:text-sm font-bold truncate ${
                        isChecked ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"
                      }`}>
                        {step.title}
                      </span>
                      {step.isRequired && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold">
                          Requerido
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                      {step.shortDesc}
                    </p>
                  </div>
                </div>

                {/* EXPAND GUIDE TOGGLE BUTTON */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : step.id)}
                  className="p-1.5 rounded-lg hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-[11px]"
                  title="Ver guía paso a paso"
                >
                  <span className="hidden sm:inline">Guía</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" strokeWidth={1.85} />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.85} />
                  )}
                </button>
              </div>

              {/* EXPANDABLE INSTRUCTIONS & SOFTWARE TIPS */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-[var(--border-subtle)] p-3.5 sm:p-4 bg-[var(--bg-surface)] space-y-3 text-xs"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-primary font-bold">
                        Valor Recomendado de Taller:
                      </span>
                      <p className="text-xs font-semibold text-[var(--text-primary)]">
                        {step.recommendedValue}
                      </p>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {step.guideText}
                    </p>

                    {/* SOFTWARE SHORTCUTS */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)] font-bold block">
                        Cómo configurarlo en tu programa de diseño:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {step.softwareTips.illustrator && (
                          <div className="p-2 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                            <span className="font-bold text-amber-500 block">Adobe Illustrator:</span>
                            <span className="text-[var(--text-secondary)]">{step.softwareTips.illustrator}</span>
                          </div>
                        )}
                        {step.softwareTips.photoshop && (
                          <div className="p-2 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                            <span className="font-bold text-blue-500 block">Adobe Photoshop:</span>
                            <span className="text-[var(--text-secondary)]">{step.softwareTips.photoshop}</span>
                          </div>
                        )}
                        {step.softwareTips.canva && (
                          <div className="p-2 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                            <span className="font-bold text-teal-500 block">Canva:</span>
                            <span className="text-[var(--text-secondary)]">{step.softwareTips.canva}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!isChecked) toggleCheck(step.id);
                          setExpandedId(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium cursor-pointer hover:bg-primary-hover transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Confirmar este paso</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* QUICK ACTIONS & PREFLIGHT ASSISTANCE OPTION */}
      <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={handleVerifyAll}
          className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" strokeWidth={1.85} />
          <span>Marcar todos como verificados</span>
        </button>

        <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={assistedReviewRequested}
            onChange={(e) => {
              setAssistedReviewRequested(e.target.checked);
              if (onAllVerified) {
                onAllVerified(isAllVerified || e.target.checked);
              }
            }}
            className="rounded border-[var(--border-subtle)] text-primary focus:ring-primary h-4 w-4"
          />
          <span className="text-[11px]">
            Solicitar revisión asistida por el equipo de pre-prensa
          </span>
        </label>
      </div>

      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-[11px] text-[var(--text-secondary)]">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0" strokeWidth={1.85} />
        <span>
          Garantía de Producción: Si detectamos desvíos críticos en tu archivo, te contactaremos por WhatsApp antes de lanzar la impresión.
        </span>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
