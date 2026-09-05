import React, { useState } from "react";
import { 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Maximize2, 
  Scissors, 
  Check, 
  Package, 
  HelpCircle,
  TrendingDown,
  Info
} from "lucide-react";
import { MATERIALS_CATALOG } from "../../data/materials";
import { MaterialOption } from "../../types";

export interface RigidMaterialsSelectorProps {
  selectedMaterialId: string;
  onSelectMaterial: (materialId: string) => void;
  onExplicitMaterialSelect?: (materialId: string) => void;
  widthCm: number;
  heightCm: number;
  quantity: number;
  onDimensionsChange?: (w: number, h: number) => void;
  includeScrapPacked?: boolean;
  onIncludeScrapChange?: (include: boolean) => void;
}

export type RigidFamily = "pvc" | "pai" | "acrilico";

interface RigidGroup {
  id: RigidFamily;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  materialIds: string[];
}

const RIGID_GROUPS: RigidGroup[] = [
  {
    id: "pvc",
    title: "PVC Espumado (Sintra)",
    subtitle: "Rígido, liviano, autoextinguible y de textura satinada premium.",
    icon: "📐",
    badge: "Más Vendido",
    materialIds: ["placa_pvc_3mm", "placa_pvc_5mm"],
  },
  {
    id: "pai",
    title: "Alto Impacto (P.A.I.)",
    subtitle: "Poliestireno termoplástico resistente a golpes y químicos.",
    icon: "🛡️",
    badge: "Uso Industrial",
    materialIds: ["placa_alto_impacto_1mm", "placa_alto_impacto_2mm", "placa_alto_impacto_3mm"],
  },
  {
    id: "acrilico",
    title: "Acrílico & PMMA",
    subtitle: "Brillo óptico de cristal, máxima elegancia y durabilidad de 10 años.",
    icon: "💎",
    badge: "Alta Gama",
    materialIds: ["placa_acrilico_blanco_3mm", "corporeo_acrilico_laser"],
  },
];

export const RigidMaterialsSelector: React.FC<RigidMaterialsSelectorProps> = ({
  selectedMaterialId,
  onSelectMaterial,
  onExplicitMaterialSelect,
  widthCm,
  heightCm,
  quantity,
  onDimensionsChange,
  includeScrapPacked = false,
  onIncludeScrapChange,
}) => {
  // Find which family the currently selected material belongs to
  const initialGroup = RIGID_GROUPS.find((g) => g.materialIds.includes(selectedMaterialId))?.id || "pvc";
  const [activeFamily, setActiveFamily] = useState<RigidFamily>(initialGroup);

  const currentMaterial = MATERIALS_CATALOG.find((m) => m.id === selectedMaterialId);

  // Standard sheet dimensions for the selected material (default to 120x240 if not found)
  const plateWidth = currentMaterial?.plateDimensions?.widthCm || 120;
  const plateHeight = currentMaterial?.plateDimensions?.heightCm || 240;
  const plateAreaM2 = currentMaterial?.plateDimensions?.areaM2 || ((plateWidth * plateHeight) / 10000);

  // Consumption & Waste Calculation
  const pieceAreaM2 = (widthCm * heightCm) / 10000;
  const totalPieceAreaM2 = pieceAreaM2 * quantity;
  
  // Rigid sheets are sold by whole plates
  const platesNeeded = Math.max(1, Math.ceil(totalPieceAreaM2 / plateAreaM2));
  const totalPlateAreaM2 = platesNeeded * plateAreaM2;
  const scrapAreaM2 = Math.max(0, totalPlateAreaM2 - totalPieceAreaM2);
  const wastePercentage = Math.round((scrapAreaM2 / totalPlateAreaM2) * 100);
  const efficiencyPercentage = Math.max(0, 100 - wastePercentage);

  // Standard cut presets for standard rigid sheet (120x240 or 100x200)
  const standardPresets = [
    { label: `Placa Completa (${plateWidth}×${plateHeight} cm)`, w: plateWidth, h: plateHeight, desc: "100% de la placa" },
    { label: `Media Placa (${plateWidth}×${Math.round(plateHeight / 2)} cm)`, w: plateWidth, h: Math.round(plateHeight / 2), desc: "50% de la placa" },
    { label: `Cuarto de Placa (${Math.round(plateWidth / 2)}×${Math.round(plateHeight / 2)} cm)`, w: Math.round(plateWidth / 2), h: Math.round(plateHeight / 2), desc: "25% de la placa" },
    { label: "Cartel 60×40 cm", w: 60, h: 40, desc: "Señalética" },
    { label: "Cuadro A3 (30×42 cm)", w: 30, h: 42, desc: "Decorativo" },
    { label: "Consultorio A4 (21×30 cm)", w: 21, h: 30, desc: "Placa Puerta" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. HIERARCHICAL FAMILY TABS (PVC / ALTO IMPACTO / ACRÍLICO) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase font-mono font-bold tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>1. Familia de Materiales Rígidos</span>
          </label>
          <span className="text-[11px] text-[var(--text-muted)]">
            Elegí la base estructural según el destino del cartel
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {RIGID_GROUPS.map((group) => {
            const isGroupActive = activeFamily === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  setActiveFamily(group.id);
                  // Select first material in group if current is not in group
                  if (!group.materialIds.includes(selectedMaterialId)) {
                    onSelectMaterial(group.materialIds[0]);
                  }
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                  isGroupActive
                    ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary"
                    : "bg-white dark:bg-black/40 border-[var(--border-subtle)] hover:border-primary/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-2xl">{group.icon}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isGroupActive ? "bg-primary text-white" : "bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {group.badge}
                  </span>
                </div>
                <h4 className="font-heading font-bold text-sm text-[var(--text-primary)] mb-1">
                  {group.title}
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {group.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SPECIFIC THICKNESS & VARIANT SELECTOR */}
      <div className="space-y-3 p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase font-mono font-bold tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-primary" />
            <span>2. Espesor y Variante Disponible</span>
          </label>
          <span className="text-[11px] font-mono text-primary font-bold">
            Medida matriz: {plateWidth}×{plateHeight} cm ({plateAreaM2.toFixed(2)} m²)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {RIGID_GROUPS.find((g) => g.id === activeFamily)?.materialIds.map((matId) => {
            const mat = MATERIALS_CATALOG.find((m) => m.id === matId);
            if (!mat) return null;
            const isSelected = selectedMaterialId === mat.id;

            return (
              <button
                key={mat.id}
                type="button"
                onClick={() => {
                  onSelectMaterial(mat.id);
                  if (onExplicitMaterialSelect) onExplicitMaterialSelect(mat.id);
                }}
                className={`p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white dark:bg-black/40 border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-primary/40"
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs truncate">{mat.name}</span>
                    {mat.badge && !isSelected && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold shrink-0">
                        {mat.badge}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[10px] truncate leading-tight ${
                      isSelected ? "text-white/80" : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {mat.shortDesc}
                  </p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. STANDARD SHEET CUT PRESETS */}
      {onDimensionsChange && (
        <div className="space-y-2 p-4 rounded-2xl bg-white dark:bg-black/30 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-primary" />
              <span>3. Medidas Estándar para Optimizar Placa Matrix ({plateWidth}×{plateHeight} cm)</span>
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">Cortes sin desperdicio</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {standardPresets.map((preset) => {
              const isPresetActive = widthCm === preset.w && heightCm === preset.h;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onDimensionsChange(preset.w, preset.h)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isPresetActive
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-primary/50 hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. WASTE & CONSUMPTION ANALYTICS (CONSUMO Y DESPERDICIO) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--bg-surface-subtle)] to-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                Cálculo de Consumo de Placa & Aprovechamiento
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Las placas rígidas se abastecen y procesan por paño matriz completo ({plateWidth}×{plateHeight} cm).
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
              efficiencyPercentage >= 80
                ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                : efficiencyPercentage >= 50
                ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
            }`}
          >
            {efficiencyPercentage}% Aprovechado
          </span>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/60 dark:bg-black/40 border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">
              Superficie Pieza
            </span>
            <strong className="text-sm font-mono-num font-bold text-[var(--text-primary)]">
              {pieceAreaM2.toFixed(2)} m²
            </strong>
            <span className="text-[10px] text-[var(--text-secondary)] block">
              {widthCm} × {heightCm} cm
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/60 dark:bg-black/40 border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">
              Placas Matriz
            </span>
            <strong className="text-sm font-mono-num font-bold text-primary">
              {platesNeeded} {platesNeeded === 1 ? "placa" : "placas"}
            </strong>
            <span className="text-[10px] text-[var(--text-secondary)] block">
              {totalPlateAreaM2.toFixed(2)} m² totales
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/60 dark:bg-black/40 border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">
              Área Neta Pedido
            </span>
            <strong className="text-sm font-mono-num font-bold text-[var(--text-primary)]">
              {totalPieceAreaM2.toFixed(2)} m²
            </strong>
            <span className="text-[10px] text-[var(--text-secondary)] block">
              {quantity} {quantity === 1 ? "unidad" : "unidades"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/60 dark:bg-black/40 border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">
              Sobrante / Recorte
            </span>
            <strong className="text-sm font-mono-num font-bold text-amber-500">
              {scrapAreaM2.toFixed(2)} m²
            </strong>
            <span className="text-[10px] text-[var(--text-secondary)] block">
              {wastePercentage}% de descarte
            </span>
          </div>
        </div>

        {/* VISUAL PLATE NESTING GRAPHIC BAR */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-[var(--text-secondary)] flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />
              Impresión neta: {totalPieceAreaM2.toFixed(2)} m²
            </span>
            <span className="text-[var(--text-muted)] flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 inline-block" />
              Sobrante matriz: {scrapAreaM2.toFixed(2)} m²
            </span>
          </div>

          <div className="w-full h-3.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden flex p-0.5 border border-[var(--border-subtle)]">
            <div
              className="h-full bg-gradient-to-r from-primary to-[#FF7744] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, efficiencyPercentage)}%` }}
            />
            <div
              className="h-full bg-amber-500/30 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(0, wastePercentage)}%` }}
            />
          </div>
        </div>

        {/* SCRAP PACKED AND SHIPPED OPTION */}
        {onIncludeScrapChange && (
          <label className="p-3 rounded-xl bg-white dark:bg-black/40 border border-[var(--border-subtle)] hover:border-primary/40 flex items-center justify-between gap-3 cursor-pointer transition-colors">
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-primary shrink-0" />
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  Embalar y enviar los sobrantes de placa
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  Te enviamos los recortes limpios del corte sin cargo adicional junto a tu pedido.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={includeScrapPacked}
              onChange={(e) => onIncludeScrapChange(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-[var(--border-subtle)] cursor-pointer"
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default RigidMaterialsSelector;
