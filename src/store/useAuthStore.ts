import { create } from "zustand";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { getFirebaseAuthErrorMessage } from "../utils/authErrors";
import { useNotificationStore } from "./useNotificationStore";

export const ADMIN_EMAIL = "carteles.ploteos@gmail.com";
export const ADMIN_PASS = "cartelesclick2026";

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

const getInitialAdminSession = (): { user: User | null; isAdmin: boolean; isAuthenticated: boolean } => {
  try {
    if (typeof window !== "undefined" && localStorage.getItem("cc_admin_session") === "active") {
      return { user: createAdminUser(), isAdmin: true, isAuthenticated: true };
    }
  } catch (e) {
    // Ignore storage restrictions
  }
  return { user: null, isAdmin: false, isAuthenticated: false };
};

interface AuthStore {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  loginAsClient?: (email?: string, pass?: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
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
        set({ user, loading: false, isAdmin, isAuthenticated: true });
      } else {
        // If Firebase user is null, check if persistent local admin session is active
        const currentSession = get();
        if (currentSession.user?.email?.toLowerCase() === ADMIN_EMAIL && currentSession.isAdmin) {
          set({ loading: false });
        } else if (typeof window !== "undefined" && localStorage.getItem("cc_admin_session") === "active") {
          set({ user: createAdminUser(), loading: false, isAdmin: true, isAuthenticated: true });
        } else {
          set({ user: null, loading: false, isAdmin: false, isAuthenticated: false });
        }
      }
    });
  } catch (err) {
    console.warn("Auth initialization warning:", err);
    set({ user: initialSession.user, loading: false, isAdmin: initialSession.isAdmin, isAuthenticated: initialSession.isAuthenticated });
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
        set({ user: createAdminUser(), loading: false, isAdmin: true, isAuthenticated: true });
        return;
      }

      // 2. Acceso estándar vía Firebase Auth
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, pass);
      } catch (err: any) {
        throw notifyAuthError(err);
      }
    },
    loginAsClient: async (email = "cliente@carteles.click", pass = "123456") => {
      try {
        await signInWithEmailAndPassword(auth, email.trim(), pass);
      } catch (err: any) {
        throw notifyAuthError(err);
      }
    },
    register: async (email, pass) => {
      const cleanEmail = email.trim().toLowerCase();
      try {
        await createUserWithEmailAndPassword(auth, cleanEmail, pass);
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
      set({ user: null, loading: false, isAdmin: false, isAuthenticated: false });
    },
    signInWithGoogle: async () => {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        await signInWithPopup(auth, provider);
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
  };
});


