import React from "react";
import { Zap, Calendar, Truck, Store, Info, ShieldCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ShippingMethod } from "../../types";
import { useCartStore } from "../../store/useCartStore";
import { useTranslation } from "react-i18next";

interface ShippingOption {
  id: ShippingMethod;
  title: string;
  badge: string;
  badgeType: "neutral" | "warning" | "success" | "highlight";
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  shortDescription: string;
  details: string[];
  extraFeeARS: number;
}

interface ShippingSelectorProps {
  value?: ShippingMethod;
  onChange?: (method: ShippingMethod) => void;
  showPickupOption?: boolean;
  className?: string;
}

export const ShippingSelector: React.FC<ShippingSelectorProps> = ({
  value,
  onChange,
  showPickupOption = true,
  className = "",
}) => {
  const { t } = useTranslation();
  const storeShippingMethod = useCartStore((state) => state.shippingMethod);
  const setStoreShippingMethod = useCartStore((state) => state.setShippingMethod);

  const currentMethod = value ?? storeShippingMethod;
  const handleSelect = (method: ShippingMethod) => {
    if (onChange) {
      onChange(method);
    } else {
      setStoreShippingMethod(method);
    }
  };

  const options: ShippingOption[] = [
    {
      id: "instantaneo",
      title: "Envío Instantáneo",
      badge: "Moto / Flete Express",
      badgeType: "highlight",
      icon: Zap,
      shortDescription: "Despacho inmediato apenas finaliza la producción y control de calidad.",
      details: [
        "Coordinación vía WhatsApp en tiempo real.",
        "El costo del viaje lo abona el cliente directamente al cadete/chofer al recibir.",
        "Cargo por despacho en taller: $0 (Sin cargo extra de Carteles.Click).",
      ],
      extraFeeARS: 0,
    },
    {
      id: "ronda_semanal",
      title: "Ronda Semanal Programada",
      badge: "Reparto Consolidado",
      badgeType: "neutral",
      icon: Calendar,
      shortDescription: "Entrega agrupada en días y franjas horarias fijas según la zona.",
      details: [
        "Ideal para optimizar costos de logística corporativa.",
        "Días de reparto coordinados previamente con el taller.",
        "Cargo por despacho en taller: $0 (Sin cargo extra de Carteles.Click).",
      ],
      extraFeeARS: 0,
    },
    {
      id: "a_despacho",
      title: "A Despacho (Expreso / Interior)",
      badge: "+$4.000 ARS Fijo",
      badgeType: "warning",
      icon: Truck,
      shortDescription: "Envío interurbano y nacional hacia terminal o receptoría de encomiendas.",
      details: [
        "Carteles.Click cobra un cargo fijo de $4.000 ARS por embalaje técnico reforzado y flete local hasta la terminal de despacho.",
        "El cliente paga el costo del transporte de larga distancia directamente al expreso o empresa transportista en destino.",
        "Se envía número de guía y remito digital de despacho.",
      ],
      extraFeeARS: 4000,
    },
  ];

  if (showPickupOption) {
    options.push({
      id: "retiro_taller",
      title: "Retiro en Taller Central",
      badge: "Sin Cargo",
      badgeType: "success",
      icon: Store,
      shortDescription: "Retiro personal en nuestra planta una vez finalizado el trabajo.",
      details: [
        "Aviso automático cuando el pedido supera el control de calidad.",
        "Horario de entrega: Lunes a Viernes de 09:00 a 18:00 hs.",
        "Cargo de logística: $0.",
      ],
      extraFeeARS: 0,
    });
  }

  const selectedOption = options.find((opt) => opt.id === currentMethod) || options[0];

  return (
    <div className={`space-y-3 font-sans ${className}`} id="shipping-selector-container">
      <div className="flex items-center justify-between">
        <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium">
          Modalidad de Envío y Logística
        </label>
        <span className="text-[11px] font-mono-num text-primary font-medium">
          {selectedOption.extraFeeARS > 0
            ? `Logística Taller: +$${selectedOption.extraFeeARS.toLocaleString("es-AR")} ARS`
            : "Logística Taller: $0"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5" role="radiogroup" aria-label="Modalidad de envío">
        {options.map((option) => {
          const isSelected = currentMethod === option.id;
          const Icon = option.icon;

          return (
            <div
              key={option.id}
              id={`shipping-option-${option.id}`}
              onClick={() => handleSelect(option.id)}
              className={`p-3.5 rounded-[9px] border transition-all cursor-pointer select-none relative ${
                isSelected
                  ? "border-primary bg-[var(--bg-surface-subtle)] ring-1 ring-primary/40 shadow-sm"
                  : "border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-subtle)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="pt-0.5">
                  <input
                    type="radio"
                    id={`radio-${option.id}`}
                    name="shipping_method_selection"
                    value={option.id}
                    checked={isSelected}
                    onChange={() => handleSelect(option.id)}
                    className="accent-primary w-4 h-4 cursor-pointer mt-0.5"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label
                      htmlFor={`radio-${option.id}`}
                      className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                      <span>{option.title}</span>
                    </label>

                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        option.badgeType === "warning"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          : option.badgeType === "success"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : option.badgeType === "highlight"
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                      }`}
                    >
                      {option.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {option.shortDescription}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CLARIFICATION CALLOUTS WITH SMOOTH FADE-IN / SLIDE-UP */}
      <AnimatePresence mode="wait">
        {currentMethod === "a_despacho" && (
          <motion.div
            key="shipping-a-despacho-notice"
            id="shipping-a-despacho-notice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="p-3.5 rounded-[9px] bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5"
          >
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Condiciones para Envíos al Interior (A Despacho):</span>
            </div>
            <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
              <strong>1. Cargo de Carteles.Click:</strong> Cobramos un costo fijo de{" "}
              <span className="font-mono-num font-bold">$4.000 ARS</span> en la factura/pago por embalaje industrial rígido y traslado (flete local) hasta la terminal de la empresa de transporte.
            </p>
            <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
              <strong>2. Pago al Transportista:</strong> El costo del flete de larga distancia lo abona el cliente directamente a la empresa de encomienda o expreso al retirar en la sucursal/terminal de destino.
            </p>
          </motion.div>
        )}

        {currentMethod === "instantaneo" && (
          <motion.div
            key="shipping-instantaneo-notice"
            id="shipping-instantaneo-notice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="p-3 rounded-[8px] bg-primary/10 border border-primary/20 text-xs space-y-1"
          >
            <div className="flex items-center gap-1.5 text-primary font-medium">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Cadetería y Fletes Directos:</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Apenas el trabajo esté listo, coordinamos el envío inmediato por moto o utilitario según volumen. El costo del viaje se paga contra entrega al chofer/cadete.
            </p>
          </motion.div>
        )}

        {currentMethod === "ronda_semanal" && (
          <motion.div
            key="shipping-ronda-notice"
            id="shipping-ronda-notice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="p-3 rounded-[8px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs space-y-1"
          >
            <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-medium">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span>Reparto en Días Fijos:</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Consolidamos entregas en circuitos semanales para clientes de la zona. Se coordina la franja horaria previamente sin costo adicional de despacho.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
