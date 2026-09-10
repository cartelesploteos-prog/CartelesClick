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

export const useAuthStore = create<AuthStore>((set) => {
  // Listen for auth state changes defensively
  try {
    onAuthStateChanged(auth, async (user) => {
      let isAdmin = false;
      if (user) {
        try {
          const token = await user.getIdTokenResult();
          isAdmin = !!token.claims.admin || user.email?.toLowerCase() === "carteles.ploteos@gmail.com";
        } catch (e) {
          isAdmin = user.email?.toLowerCase() === "carteles.ploteos@gmail.com";
        }
      }
      set({ user, loading: false, isAdmin, isAuthenticated: !!user });
    });
  } catch (err) {
    console.warn("Auth initialization warning:", err);
    set({ user: null, loading: false, isAdmin: false, isAuthenticated: false });
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
    user: null,
    loading: true,
    isAdmin: false,
    isAuthenticated: false,
    login: async (email, pass) => {
      try {
        await signInWithEmailAndPassword(auth, email.trim(), pass);
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
      try {
        await createUserWithEmailAndPassword(auth, email.trim(), pass);
      } catch (err: any) {
        throw notifyAuthError(err);
      }
    },
    logout: async () => {
      try {
        await signOut(auth);
      } catch (err: any) {
        throw notifyAuthError(err);
      }
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

