import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
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
  updateItemSpecs: (id: string, specs: Partial<CartItem>) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setWholesaleTier: (tier?: "inicio" | "agencia" | "partner") => void;
  getItemsTotal: () => number;
  getShippingFee: () => number;
  getGrandTotal: () => number;
  isCartValid: () => boolean;
  loadCartFromFirestore: (userId: string) => Promise<void>;
}

const syncCartToFirestore = async (items: CartItem[]) => {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const cartRef = doc(db, "carts", user.uid);
    await setDoc(cartRef, {
      items,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn("[CartStore] Error syncing cart to Firestore:", e);
  }
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      shippingMethod: "retiro_taller",
      wholesaleTierRequested: undefined,
      addItem: (item) => {
        set((state) => {
          const nextItems = [...state.items, item];
          syncCartToFirestore(nextItems);
          return { items: nextItems, isOpen: true };
        });
      },
      addItems: (newItems) => {
        set((state) => {
          const nextItems = [...state.items, ...newItems];
          syncCartToFirestore(nextItems);
          return { items: nextItems, isOpen: true };
        });
      },
      removeItem: (id) => {
        set((state) => {
          const nextItems = state.items.filter((item) => item.id !== id);
          syncCartToFirestore(nextItems);
          return { items: nextItems };
        });
      },
      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => {
          const nextItems = state.items.map((item) => {
            if (item.id === id) {
              const unitPrice =
                item.unitPriceARS ||
                Math.round(item.totalPriceARS / (item.quantity || 1));
              return { ...item, quantity: qty, totalPriceARS: unitPrice * qty };
            }
            return item;
          });
          syncCartToFirestore(nextItems);
          return { items: nextItems };
        });
      },
      updateItemSpecs: (id, specs) => {
        set((state) => {
          const nextItems = state.items.map((item) => {
            if (item.id === id) {
              return { ...item, ...specs };
            }
            return item;
          });
          syncCartToFirestore(nextItems);
          return { items: nextItems };
        });
      },
      clearCart: () => {
        set({ items: [] });
        syncCartToFirestore([]);
      },
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
      isCartValid: () => {
        const { items } = get();
        if (items.length === 0) return false;
        return items.every((item) => {
          const hasMeasure = item.mode === "unidad" || (Number(item.widthCm) > 0 && Number(item.heightCm) > 0);
          const hasInk = !!item.inkType;
          const hasFinishings = Array.isArray(item.finishings);
          return hasMeasure && hasInk && hasFinishings;
        });
      },
      loadCartFromFirestore: async (userId: string) => {
        if (!userId) return;
        try {
          const cartRef = doc(db, "carts", userId);
          const snap = await getDoc(cartRef);
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data?.items)) {
              set({ items: data.items });
            }
          }
        } catch (error) {
          console.warn("[CartStore] Error loading cart from Firestore:", error);
        }
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
