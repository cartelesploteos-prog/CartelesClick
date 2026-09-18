import React from "react";
import { DollarSign, ChevronDown } from "lucide-react";
import { useCurrencyStore, type Currency } from "../../store/useCurrencyStore";

interface CurrencySelectorProps {
  variant?: "default" | "pill" | "dropdown";
  className?: string;
}

const CURRENCIES: { code: Currency; label: string; symbol: string }[] = [
  { code: "ARS", label: "Pesos Argentinos", symbol: "$" },
  { code: "USD", label: "Dólares USA", symbol: "U$S" },
  { code: "BRL", label: "Reales Brasil", symbol: "R$" },
];

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  variant = "pill",
  className = "",
}) => {
  const { currency, setCurrency } = useCurrencyStore();

  if (variant === "pill") {
    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs font-medium ${className}`}
        role="group"
        aria-label="Seleccionar moneda"
      >
        {CURRENCIES.map((c) => {
          const isSelected = currency === c.code;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => setCurrency(c.code)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "bg-primary text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
              }`}
              title={c.label}
              aria-pressed={isSelected}
            >
              {c.code}
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown / Default select
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="appearance-none text-xs font-semibold py-1.5 pl-7 pr-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-colors"
        aria-label="Seleccionar divisa"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} ({c.symbol})
          </option>
        ))}
      </select>
      <DollarSign
        className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-2 pointer-events-none"
        strokeWidth={1.85}
      />
      <ChevronDown
        className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute right-2 pointer-events-none"
        strokeWidth={1.85}
      />
    </div>
  );
};

export default CurrencySelector;
