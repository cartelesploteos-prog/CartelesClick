import { create } from "zustand";

export type Currency = "ARS" | "USD" | "BRL";

interface CurrencyStore {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountARS: number) => string;
  convertToCurrency: (amountARS: number) => { amount: number; symbol: string };
}

export const useCurrencyStore = create<CurrencyStore>((set) => ({
  currency: "ARS",
  setCurrency: (currency: Currency) => set({ currency }),
  convertToCurrency: (amountARS: number) => {
    // Basic conversion logic (example)
    const rates = { ARS: 1, USD: 0.001, BRL: 0.005 };
    const symbols = { ARS: "$", USD: "U$S", BRL: "R$" };
    const amount = amountARS * rates[useCurrencyStore.getState().currency];
    return {
      amount: Math.round(amount * 100) / 100,
      symbol: symbols[useCurrencyStore.getState().currency],
    };
  },
  formatPrice: (amountARS: number) => {
    const { amount, symbol } = useCurrencyStore.getState().convertToCurrency(amountARS);
    const locale = { ARS: "es-AR", USD: "en-US", BRL: "pt-BR" };
    return `${symbol}${amount.toLocaleString(locale[useCurrencyStore.getState().currency])}`;
  },
}));

