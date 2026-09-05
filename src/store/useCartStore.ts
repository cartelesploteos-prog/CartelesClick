import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, ShippingMethod } from "../types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  shippingMethod: ShippingMethod;
  wholesaleTierRequested?: "inicio" | "agencia" | "partner";
  addItem: (item: CartItem) => void;
  addItems: (items: CartItem[]) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setWholesaleTier: (tier?: "inicio" | "agencia" | "partner") => void;
  getItemsTotal: () => number;
  getShippingFee: () => number;
  getGrandTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      shippingMethod: "retiro_taller",
      wholesaleTierRequested: undefined,
      addItem: (item) => {
        set((state) => ({ items: [...state.items, item], isOpen: true }));
      },
      addItems: (newItems) => {
        set((state) => ({ items: [...state.items, ...newItems], isOpen: true }));
      },
      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
      },
      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id) {
              const unitPrice =
                item.unitPriceARS ||
                Math.round(item.totalPriceARS / (item.quantity || 1));
              return { ...item, quantity: qty, totalPriceARS: unitPrice * qty };
            }
            return item;
          }),
        }));
      },
      clearCart: () => set({ items: [] }),
      setIsOpen: (isOpen) => set({ isOpen }),
      setShippingMethod: (shippingMethod) => set({ shippingMethod }),
      setWholesaleTier: (wholesaleTierRequested) => set({ wholesaleTierRequested }),
      getItemsTotal: () => {
        return get().items.reduce(
          (acc, item) => acc + (item.totalPriceARS || 0),
          0,
        );
      },
      getShippingFee: () => {
        const { shippingMethod } = get();
        if (shippingMethod === "a_despacho") return 4000;
        return 0;
      },
      getGrandTotal: () => {
        return get().getItemsTotal() + get().getShippingFee();
      },
    }),
    {
      name: "cartelesclick_cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        shippingMethod: state.shippingMethod,
        wholesaleTierRequested: state.wholesaleTierRequested,
      }),
    }
  )
);

