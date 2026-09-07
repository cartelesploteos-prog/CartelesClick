import React from "react";

export interface CurrencySelectorProps {
  className?: string;
  variant?: "pill" | "select" | "minimal";
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-xs font-sans text-[#949BA4] select-none ${className}`}
      aria-label="Moneda: Pesos Argentinos"
    >
      <span className="w-2 h-2 rounded-full bg-[var(--brand-brick)]" />
      <span className="text-white font-medium">$ ARS</span>
      <span className="text-[10px] text-[#949BA4]">(Pesos Argentinos)</span>
    </div>
  );
};

