import React, { useState } from "react";
import { Activity, Clock, ChevronUp, ChevronDown, Wrench, ShieldCheck } from "lucide-react";

interface FloatingDashboardProps {
  activeJobsCount?: number;
  workshopCapacityPercent?: number;
  deliveryEtaDays?: number;
  className?: string;
  onNavigate?: (view: string) => void;
}

export const FloatingDashboard: React.FC<FloatingDashboardProps> = ({
  activeJobsCount = 14,
  workshopCapacityPercent = 82,
  deliveryEtaDays = 1,
  className = "",
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      aria-label="Estado operativo del taller"
      className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-30 font-sans ${className}`}
    >
      {isOpen ? (
        <div className="w-76 sm:w-80 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xl space-y-3 transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="font-heading text-xs font-bold text-[var(--text-primary)]">
                Taller en Vivo · Métricas
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Minimizar panel de taller"
              className="p-1 rounded-[5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1">
              <div className="text-[var(--text-secondary)] flex items-center gap-1.5 font-medium">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span>En imprenta</span>
              </div>
              <p className="font-heading text-sm font-bold text-[var(--text-primary)]">
                {activeJobsCount} trabajos
              </p>
            </div>
            <div className="p-2.5 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1">
              <div className="text-[var(--text-secondary)] flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Despacho</span>
              </div>
              <p className="font-heading text-sm font-bold text-[var(--text-primary)]">
                {deliveryEtaDays} a {deliveryEtaDays + 1} días
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] text-[var(--text-secondary)]">
              <span>Capacidad operativa (Plotters Roland/Mimaki)</span>
              <span className="font-bold text-[var(--text-primary)]">{workshopCapacityPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--bg-surface-subtle)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${workshopCapacityPercent}%` }}
              />
            </div>
          </div>

          {onNavigate && (
            <button
              onClick={() => {
                onNavigate("pedidos");
                setIsOpen(false);
              }}
              className="w-full mt-2 py-1.5 px-2.5 rounded-[5px] text-xs font-medium text-center text-primary bg-[var(--bg-surface-subtle)] hover:bg-primary hover:text-white transition-colors border border-[var(--border-subtle)] flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ver seguimiento de pedidos</span>
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir estado operativo del taller"
          className="flex items-center gap-2 px-3 py-2 rounded-[7px] bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-subtle)] text-[var(--text-primary)] shadow-md hover:border-primary transition-all text-xs font-medium group focus-visible:ring-2 focus-visible:ring-primary cursor-pointer active:scale-95"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span className="font-heading font-semibold">Taller: {workshopCapacityPercent}%</span>
          <ChevronUp className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-primary transition-colors" />
        </button>
      )}
    </aside>
  );
};
