import { create } from "zustand";
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "cliente";
  companyName?: string;
  phone?: string;
  wholesaleTier?: "inicio" | "agencia" | "partner";
}
interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginAsClient: () => void;
  loginAsAdmin: () => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}
export const useAuthStore = create<AuthStore>((set) => ({
  user: {
    id: "usr-1092",
    name: "Martín Bossi",
    email: "carteles.ploteos@gmail.com",
    role: "cliente",
    companyName: "Estudio Gráfico MB",
    phone: "+54 11 4892-1100",
    wholesaleTier: "inicio",
  },
  isAuthenticated: true,
  isAdmin: false,
  loginAsClient: () => {
    set({
      user: {
        id: "usr-1092",
        name: "Martín Bossi",
        email: "carteles.ploteos@gmail.com",
        role: "cliente",
        companyName: "Estudio Gráfico MB",
        phone: "+54 11 4892-1100",
        wholesaleTier: "inicio",
      },
      isAuthenticated: true,
      isAdmin: false,
    });
  },
  loginAsAdmin: () => {
    set({
      user: {
        id: "usr-admin-01",
        name: "Administrador de Taller",
        email: "admin@carteles.click",
        role: "admin",
        companyName: "Carteles.Click Central",
        phone: "+54 11 9988-7766",
      },
      isAuthenticated: true,
      isAdmin: true,
    });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false, isAdmin: false });
  },
  updateProfile: (data) => {
    set((state) => ({ user: state.user ? { ...state.user, ...data } : null }));
  },
}));
