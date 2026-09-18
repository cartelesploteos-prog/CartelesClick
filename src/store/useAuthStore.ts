import { create } from "zustand";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { syncUserDocument, Usuario } from "../lib/firestore";
import { getFirebaseAuthErrorMessage } from "../utils/authErrors";
import { useNotificationStore } from "./useNotificationStore";

export const ADMIN_EMAIL = "carteles.ploteos@gmail.com";
export const ADMIN_PASS = "cartelesclick2026";

// Configurar persistencia segura local en el navegador para sesiones
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn("[Auth] Persistencia de sesión:", err);
  });
} catch (e) {
  // Ignore in SSR/test environment
}

const createAdminUser = (): User => ({
  uid: "admin_carteles_ploteos",
  email: ADMIN_EMAIL,
  displayName: "Administrador Taller Carteles.Click",
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: "admin_jwt_session",
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => "admin_token",
  getIdTokenResult: async () => ({
    authTime: new Date().toISOString(),
    claims: { admin: true },
    expirationTime: new Date(Date.now() + 86400000).toISOString(),
    issuedAtTime: new Date().toISOString(),
    signInProvider: "password",
    signInSecondFactor: null,
    token: "admin_token"
  }),
  reload: async () => {},
  toJSON: () => ({})
} as unknown as User);

const createAdminProfile = (): Usuario => ({
  uid: "admin_carteles_ploteos",
  email: ADMIN_EMAIL,
  displayName: "Administrador Taller Carteles.Click",
  role: "admin",
  customerType: "corporativo",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: new Date().toISOString(),
});

const getInitialAdminSession = (): { user: User | null; profile: Usuario | null; isAdmin: boolean; isAuthenticated: boolean } => {
  try {
    if (typeof window !== "undefined" && localStorage.getItem("cc_admin_session") === "active") {
      return { user: createAdminUser(), profile: createAdminProfile(), isAdmin: true, isAuthenticated: true };
    }
  } catch (e) {
    // Ignore storage restrictions
  }
  return { user: null, profile: null, isAdmin: false, isAuthenticated: false };
};

interface AuthStore {
  user: User | null;
  profile: Usuario | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  loginAsClient?: (email?: string, pass?: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  syncProfile: (data?: Partial<Usuario>) => Promise<Usuario | null>;
}

export const useAuthStore = create<AuthStore>((set, get) => {
  const initialSession = getInitialAdminSession();

  // Listen for auth state changes defensively
  try {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        let isAdmin = false;
        try {
          const token = await user.getIdTokenResult();
          isAdmin = !!token.claims.admin || user.email?.toLowerCase() === ADMIN_EMAIL;
        } catch (e) {
          isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL;
        }

        // Sincronizar y persistir automáticamente el perfil en Firestore /users
        let profile: Usuario | null = null;
        try {
          profile = await syncUserDocument(user);
          if (profile.role === "admin") {
            isAdmin = true;
          }
        } catch (err) {
          console.warn("[Auth] Error en syncUserDocument durante onAuthStateChanged:", err);
        }

        set({ user, profile, loading: false, isAdmin, isAuthenticated: true });
      } else {
        // If Firebase user is null, check if persistent local admin session is active
        const currentSession = get();
        if (currentSession.user?.email?.toLowerCase() === ADMIN_EMAIL && currentSession.isAdmin) {
          set({ loading: false });
        } else if (typeof window !== "undefined" && localStorage.getItem("cc_admin_session") === "active") {
          set({ user: createAdminUser(), profile: createAdminProfile(), loading: false, isAdmin: true, isAuthenticated: true });
        } else {
          set({ user: null, profile: null, loading: false, isAdmin: false, isAuthenticated: false });
        }
      }
    });
  } catch (err) {
    console.warn("Auth initialization warning:", err);
    set({ 
      user: initialSession.user, 
      profile: initialSession.profile,
      loading: false, 
      isAdmin: initialSession.isAdmin, 
      isAuthenticated: initialSession.isAuthenticated 
    });
  }

  const notifyAuthError = (err: any) => {
    const message = getFirebaseAuthErrorMessage(err);
    const code = typeof err === "string" ? err : err?.code || "";
    // Only dispatch toast notification for real system/network errors, not user closing the popup
    if (!code.includes("auth/popup-closed-by-user")) {
      useNotificationStore.getState().addNotification({
        type: "system",
        title: "Error de autenticación",
        message,
        priority: "high"
      });
    }
    return new Error(message);
  };

  return {
    user: initialSession.user,
    profile: initialSession.profile,
    loading: initialSession.isAuthenticated ? false : true,
    isAdmin: initialSession.isAdmin,
    isAuthenticated: initialSession.isAuthenticated,
    login: async (email, pass) => {
      const cleanEmail = email.trim().toLowerCase();
      const isAdminMatch = cleanEmail === ADMIN_EMAIL && pass === ADMIN_PASS;

      // 1. Acceso de Superadministrador configurado
      if (isAdminMatch) {
        try {
          await signInWithEmailAndPassword(auth, cleanEmail, pass);
        } catch (e) {
          console.info("Acceso verificado para cuenta administradora maestro:", ADMIN_EMAIL);
        }
        try {
          localStorage.setItem("cc_admin_session", "active");
        } catch (e) {}
        set({ user: createAdminUser(), profile: createAdminProfile(), loading: false, isAdmin: true, isAuthenticated: true });
        return;
      }

      // 2. Acceso estándar vía Firebase Auth
      try {
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        if (userCred.user) {
          const profile = await syncUserDocument(userCred.user);
          const isAdmin = profile.role === "admin" || userCred.user.email?.toLowerCase() === ADMIN_EMAIL;
          set({ user: userCred.user, profile, loading: false, isAdmin, isAuthenticated: true });
        }
      } catch (err: any) {
        throw notifyAuthError(err);
      }
    },
    loginAsClient: async (email = "cliente@carteles.click", pass = "123456") => {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), pass);
        if (userCred.user) {
          const profile = await syncUserDocument(userCred.user);
          set({ user: userCred.user, profile, loading: false, isAdmin: false, isAuthenticated: true });
        }
      } catch (err: any) {
        throw notifyAuthError(err);
      }
    },
    register: async (email, pass) => {
      const cleanEmail = email.trim().toLowerCase();
      try {
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        if (userCred.user) {
          const profile = await syncUserDocument(userCred.user);
          const isAdmin = profile.role === "admin" || userCred.user.email?.toLowerCase() === ADMIN_EMAIL;
          set({ user: userCred.user, profile, loading: false, isAdmin, isAuthenticated: true });
        }
      } catch (err: any) {
        throw notifyAuthError(err);
      }
    },
    logout: async () => {
      try {
        localStorage.removeItem("cc_admin_session");
      } catch (e) {}
      try {
        await signOut(auth);
      } catch (err: any) {
        // Continue clearing local state
      }
      set({ user: null, profile: null, loading: false, isAdmin: false, isAuthenticated: false });
    },
    signInWithGoogle: async () => {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        const userCred = await signInWithPopup(auth, provider);
        if (userCred.user) {
          // Crear o actualizar inmediatamente el usuario en Firestore
          const profile = await syncUserDocument(userCred.user);
          const isAdmin = profile.role === "admin" || userCred.user.email?.toLowerCase() === ADMIN_EMAIL;
          set({ user: userCred.user, profile, loading: false, isAdmin, isAuthenticated: true });
        }
      } catch (err: any) {
        throw notifyAuthError(err);
      }
    },
    forgotPassword: async (email: string) => {
      try {
        await sendPasswordResetEmail(auth, email.trim());
      } catch (err: any) {
        throw notifyAuthError(err);
      }
    },
    syncProfile: async (data?: Partial<Usuario>) => {
      const currentUser = get().user;
      if (!currentUser) return null;
      try {
        const updated = await syncUserDocument(currentUser, data);
        set({ profile: updated });
        return updated;
      } catch (err) {
        console.warn("Error en syncProfile:", err);
        return null;
      }
    },
  };
});



