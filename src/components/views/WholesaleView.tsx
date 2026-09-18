import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Percent,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Truck,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { WHOLESALE_TIERS } from "../../data/materials";
import { useCartStore } from "../../store/useCartStore";
import { useCurrencyStore } from "../../store/useCurrencyStore";
import { BorderBeam } from "../ui/BorderBeam";
import { CTAButton } from "../ui/CTAButton";

interface WholesaleViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const WholesaleView: React.FC<WholesaleViewProps> = ({ onNavigate }) => {
  const { wholesaleTierRequested, setWholesaleTier } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const [estimatedMonthlyM2, setEstimatedMonthlyM2] = useState<number>(350);
  const [applicationSuccess, setApplicationSuccess] = useState<string | null>(null);

  // Average reference price per m2 in ARS for simulation
  const AVG_M2_PRICE_ARS = 9500;

  // Determine active tier based on slider volume
  const getSimulatedTier = (m2: number) => {
    if (m2 >= 1000) return WHOLESALE_TIERS.find((t) => t.id === "partner");
    if (m2 >= 500) return WHOLESALE_TIERS.find((t) => t.id === "agencia");
    if (m2 >= 200) return WHOLESALE_TIERS.find((t) => t.id === "inicio");
    return null;
  };

  const activeSimulatedTier = getSimulatedTier(estimatedMonthlyM2);
  const rawMonthlyTotal = estimatedMonthlyM2 * AVG_M2_PRICE_ARS;
  const discountPercent = activeSimulatedTier ? activeSimulatedTier.discountPercent : 0;
  const simulatedSavings = rawMonthlyTotal * (discountPercent / 100);

  const handleSelectTier = (tierId: "inicio" | "agencia" | "partner") => {
    setWholesaleTier(tierId);
    setApplicationSuccess(tierId);
    setTimeout(() => {
      setApplicationSuccess(null);
    }, 4000);
  };

  return (
    <div className="container-safe py-8 sm:py-12 space-y-12">
      {/* HEADER SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Canal Exclusivo para Gremios y Agencias</span>
        </div>
        <h1 className="text-canonical-h1">
          Precios Mayoristas y Producción B2B
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          Optimiza la rentabilidad de tus proyectos de gran formato. Ofrecemos producción express en 24/48h, embalaje neutro listo para despachar y bonificaciones escalonadas por volumen mensual.
        </p>
      </div>

      {/* TIER CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {WHOLESALE_TIERS.map((tier) => {
          const isSelected = wholesaleTierRequested === tier.id;
          const isAgencia = tier.id === "agencia";

          return (
            <div
              key={tier.id}
              className={`relative rounded-2xl border p-6 sm:p-7 flex flex-col justify-between transition-all ${
                isAgencia
                  ? "border-primary bg-[var(--bg-surface)] shadow-lg"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-primary/40 shadow-xs"
              }`}
            >
              {isAgencia && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Más Elegido</span>
                </div>
              )}

              {isSelected && (
                <BorderBeam size={48} borderWidth={2} duration={3.5} />
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Mínimo {tier.minMonthlyM2} m² / mes
                  </span>
                  <h3 className="text-canonical-h3">
                    {tier.name}
                  </h3>
                </div>

                <div className="flex items-baseline gap-1 py-2 border-y border-[var(--border-subtle)]">
                  <span className="text-3xl sm:text-4xl font-semibold font-heading text-[var(--text-primary)]">
                    {tier.discountPercent}%
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
                    descuento directo en m²
                  </span>
                </div>

                {/* BENEFIT LIST */}
                <ul className="space-y-2.5 pt-2">
                  {tier.benefits.map((b, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-[var(--text-secondary)] flex items-start gap-2 leading-snug"
                    >
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                        strokeWidth={2}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => handleSelectTier(tier.id as "inicio" | "agencia" | "partner")}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-800 text-white shadow-sm"
                      : isAgencia
                      ? "bg-primary hover:bg-primary-hover text-white shadow-sm"
                      : "bg-[var(--bg-surface-subtle)] hover:bg-primary hover:text-white text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Nivel Activo en Carrito</span>
                    </>
                  ) : (
                    <>
                      <span>Activar Nivel {tier.name.split(" ")[1]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* INTERACTIVE VOLUME & SAVINGS SIMULATOR */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-canonical-h2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Simulador de Ahorro por Volumen</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Desliza para calcular tu escala de descuento según la cantidad estimada de m² que imprimes al mes.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-right">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)] block uppercase tracking-wider">
              Volumen Estimado
            </span>
            <span className="text-xl sm:text-2xl font-semibold font-heading text-primary">
              {estimatedMonthlyM2} m²
            </span>
          </div>
        </div>

        {/* RANGE SLIDER */}
        <div className="space-y-2">
          <input
            type="range"
            min="50"
            max="1500"
            step="25"
            value={estimatedMonthlyM2}
            onChange={(e) => setEstimatedMonthlyM2(Number(e.target.value))}
            className="w-full h-2 bg-[var(--bg-surface-subtle)] rounded-lg appearance-none cursor-pointer accent-primary"
            aria-label="Volumen mensual en metros cuadrados"
          />
          <div className="flex justify-between text-[11px] font-semibold text-[var(--text-secondary)]">
            <span>50 m² (Minorista)</span>
            <span>200 m² (Inicio 5%)</span>
            <span>500 m² (Agencia 10%)</span>
            <span>1000+ m² (Partner 15%)</span>
          </div>
        </div>

        {/* SIMULATOR METRICS BREAKDOWN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
            <span className="text-[11px] text-[var(--text-secondary)] block">Nivel Asignado:</span>
            <strong className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 mt-1">
              <Building2 className="w-4 h-4 text-primary" />
              {activeSimulatedTier ? activeSimulatedTier.name : "Nivel Base (Minorista)"}
            </strong>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
            <span className="text-[11px] text-[var(--text-secondary)] block">Descuento Obtenido:</span>
            <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
              <Percent className="w-4 h-4" />
              {discountPercent}% OFF en tus pedidos
            </strong>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium block">
              Ahorro Mensual Proyectado:
            </span>
            <strong className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              ~ {formatPrice(simulatedSavings)}
            </strong>
          </div>
        </div>
      </div>

      {/* VALUE PILLARS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <h4 className="text-canonical-h4">
            Despacho Neutro y Blindado
          </h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Embalamos tus lonas y rígidos sin etiquetas ni marcas nuestras. Tu cliente recibe el material como si hubiera salido directo de tu taller.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-canonical-h4">
            Garantía de Reposición Técnica
          </h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Si ocurre cualquier desvío en colorimetría o falla mecánica en el sustrato, reimprimimos sin demoras ni trámites burocráticos.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h4 className="text-canonical-h4">
            Mesa de Ayuda WhatsApp Taller
          </h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Contacto directo con los operarios de máquinas y preprensa para resolver urgencias de archivos, troqueles o perfiles ICC en tiempo real.
          </p>
        </div>
      </div>

      {/* CALL TO ACTION FOOTER */}
      <div className="p-8 rounded-3xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-canonical-h3">
            ¿Listo para cotizar tus trabajos con tarifa de gremio?
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Accede ahora al cotizador en vivo. Si seleccionaste un nivel mayorista, el descuento se aplicará de forma automática al cerrar tu pedido.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <CTAButton
            onClick={() => onNavigate("cotizador")}
            className="text-xs sm:text-sm px-6 py-3"
            celebrationMessage="¡Tarifa gremio lista para cotizar!"
          >
            <span>Ir al Cotizador en Vivo</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </CTAButton>
        </div>
      </div>
    </div>
  );
};

export default WholesaleView;
