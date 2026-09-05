import React from "react";
import {
  Layers,
  ShieldCheck,
  DollarSign,
  Sparkles,
  ArrowRight,
  Sun,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface RigidsComparisonTableProps {
  onQuoteMaterial: (materialId: string) => void;
}

export const RigidsComparisonTable: React.FC<RigidsComparisonTableProps> = ({
  onQuoteMaterial,
}) => {
  const materials = [
    {
      id: "placa_pvc_3mm",
      name: "PVC Espumado (Sintra)",
      thicknesses: "3 mm · 5 mm",
      durabilityScore: 4.5,
      durabilityText: "5+ años interior / 3 años exterior",
      durabilityDetails: "Autoextinguible, celda cerrada hidrófuga, no se deforma con humedad ambiental.",
      costScore: "$$",
      costLevel: "Costo Medio",
      costExplanation: "Excelente relación costo/rigidez. El sustrato rígido más versátil y vendido.",
      finishType: "Mate Satinado Sedoso",
      finishGlaze: "Mate",
      finishDetails: "Superficie blanca mate uniforme sin reflejos. Tacto suave y textura no porosa.",
      printCompatibility: "Impresión directa UV plana o vinilo laminado montado.",
      plateSizes: "120 × 240 cm (ó 122 × 244 cm)",
      bestFor: ["Cartelería de pared", "Cuadros decorativos", "Exhibidores POS", "Señalética interior"],
      recommendedBadge: "Más Versátil",
      colorBadge: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800",
    },
    {
      id: "placa_alto_impacto_1mm",
      name: "Poliestireno Alto Impacto (P.A.I.)",
      thicknesses: "1 mm · 2 mm · 3 mm",
      durabilityScore: 4.0,
      durabilityText: "3 a 5 años interior / 2 años exterior",
      durabilityDetails: "Gran elasticidad al impacto sin quebrar. Lavable con alcohol al 70% y desinfectantes.",
      costScore: "$",
      costLevel: "Más Económico",
      costExplanation: "Costo muy accesible. Ideal para grandes tiradas de señalización y termoformado.",
      finishType: "Semibrillante No Poroso",
      finishGlaze: "Semibrillante",
      finishDetails: "Acabado compacto semibrillante muy higiénico. No absorbe grasas ni solventes.",
      printCompatibility: "Impresión directa UV plana alta resolución o serigrafía.",
      plateSizes: "100 × 200 cm",
      bestFor: ["Carteles de seguridad", "Menús gastronómicos", "Bandejas termoformadas", "Carteles de obra"],
      recommendedBadge: "Más Económico",
      colorBadge: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800",
    },
    {
      id: "placa_acrilico_blanco_3mm",
      name: "Acrílico Premium (PMMA)",
      thicknesses: "3 mm · 4 mm · 5 mm",
      durabilityScore: 5.0,
      durabilityText: "10+ años exterior e interior",
      durabilityDetails: "Inmune a rayos UV y clima severo. Máxima pureza óptica, nunca se torna amarillento.",
      costScore: "$$$$",
      costLevel: "Alta Gama / Premium",
      costExplanation: "Inversión corporativa premium. Máxima presencia estética y durabilidad insuperable.",
      finishType: "Brillante Espejo Óptico",
      finishGlaze: "Brillante",
      finishDetails: "Brillo cristalino profundo con cantos pulidos a fuego mediante corte láser CO2.",
      printCompatibility: "Impresión directa UV con respaldo blanco fondeado o cajas de luz LED backlight.",
      plateSizes: "122 × 244 cm",
      bestFor: ["Placas profesionales", "Logos corpóreos de lujo", "Cajas de luz LED", "Fachadas corporativas"],
      recommendedBadge: "Máxima Elegancia",
      colorBadge: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800",
    },
  ];

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 space-y-8 font-sans">
      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
          <Layers className="w-3.5 h-3.5" />
          <span>GUÍA COMPARATIVA DE SUSTRATOS RÍGIDOS</span>
        </div>
        <h2 className="font-heading text-2xl sm:text-3xl text-[var(--text-primary)] font-bold tracking-tight">
          PVC Espumado vs. Alto Impacto vs. Acrílico
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          Compará durabilidad, nivel de costo y acabado superficial (mate vs. brillante) para seleccionar la placa que mejor se adapta a los requerimientos técnicos de tu obra.
        </p>
      </div>

      {/* SIDE-BY-SIDE CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {materials.map((mat) => (
          <div
            key={mat.id}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-5 sm:p-6 flex flex-col justify-between space-y-6 hover:border-primary/50 transition-all shadow-xs"
          >
            <div className="space-y-4">
              {/* TOP HEADER */}
              <div className="flex items-start justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${mat.colorBadge}`}>
                    {mat.recommendedBadge}
                  </span>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-[var(--text-primary)] mt-1.5 leading-tight">
                    {mat.name}
                  </h3>
                  <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                    Espesores: {mat.thicknesses}
                  </span>
                </div>
              </div>

              {/* CRITERIA 1: DURABILIDAD */}
              <div className="space-y-1.5 p-3 rounded-lg bg-[var(--bg-page)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Durabilidad & Intemperie
                  </span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ★ {mat.durabilityScore} / 5
                  </span>
                </div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  {mat.durabilityText}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {mat.durabilityDetails}
                </p>
              </div>

              {/* CRITERIA 2: ACABADO SUPERFICIAL (MATE VS GLOSS) */}
              <div className="space-y-1.5 p-3 rounded-lg bg-[var(--bg-page)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Acabado Superficial
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {mat.finishGlaze}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  {mat.finishType}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {mat.finishDetails}
                </p>
              </div>

              {/* CRITERIA 3: COSTO RELATIVO */}
              <div className="space-y-1.5 p-3 rounded-lg bg-[var(--bg-page)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Nivel de Costo
                  </span>
                  <span className="font-mono font-bold text-primary text-sm">
                    {mat.costScore}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  {mat.costLevel}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {mat.costExplanation}
                </p>
              </div>

              {/* TECH & SIZES */}
              <div className="text-[11px] space-y-1.5 pt-2 border-t border-[var(--border-subtle)] text-[var(--text-secondary)]">
                <div>
                  <strong className="text-[var(--text-primary)]">Placa Estándar:</strong> {mat.plateSizes}
                </div>
                <div>
                  <strong className="text-[var(--text-primary)]">Tecnología:</strong> {mat.printCompatibility}
                </div>
              </div>

              {/* BEST FOR APPLICATIONS */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-secondary)] block">
                  Usos Recomendados:
                </span>
                <div className="flex flex-wrap gap-1">
                  {mat.bestFor.map((app, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              type="button"
              onClick={() => onQuoteMaterial(mat.id)}
              className="w-full mt-4 py-2.5 px-4 rounded-xl bg-primary hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Cotizar {mat.name.split(" ")[0]}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
