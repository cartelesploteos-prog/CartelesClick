import { create } from "zustand";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider,
  GithubAuthProvider,
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
  signInWithGithub: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => {
  // Listen for auth state changes
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

  const notifyAuthError = (err: any) => {
    const message = getFirebaseAuthErrorMessage(err);
    useNotificationStore.getState().addNotification({
      type: "system",
      title: "Error de autenticación",
      message,
      priority: "high"
    });
    return new Error(message);
  };

  return {
    user: null,
    loading: true,
    isAdmin: false,
    isAuthenticated: false,
    login: async (email, pass) => {
      try {
        await signInWithEmailAndPassword(auth, email, pass);
      } catch (err: any) {
        throw notifyAuthError(err);
      }
    },
    loginAsClient: async (email = "cliente@carteles.click", pass = "123456") => {
      try {
        await signInWithEmailAndPassword(auth, email, pass);
      } catch (err: any) {
        throw notifyAuthError(err);
      }
    },
    register: async (email, pass) => {
      try {
        await createUserWithEmailAndPassword(auth, email, pass);
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
        await signInWithPopup(auth, provider);
      } catch (err: any) {
        throw notifyAuthError(err);
      }
    },
    signInWithGithub: async () => {
      try {
        const provider = new GithubAuthProvider();
        await signInWithPopup(auth, provider);
      } catch (err: any) {
        throw notifyAuthError(err);
      }
    },
    forgotPassword: async (email: string) => {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (err: any) {
        throw notifyAuthError(err);
      }
    },
  };
});

