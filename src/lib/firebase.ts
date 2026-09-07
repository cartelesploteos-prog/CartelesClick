import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Configuración defensiva: si las credenciales en VITE_* no están presentes en producción,
// se inyecta una configuración sintácticamente válida para evitar que getAuth() o initializeApp()
// lancen excepciones fatales a nivel de módulo (auth/invalid-api-key) que dejen la aplicación en pantalla negra.
const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const isConfigured = typeof rawApiKey === "string" && rawApiKey.trim().length > 0;

const firebaseConfig = {
  apiKey: isConfigured ? rawApiKey : "AIzaSyDummyKeyForFallback123456789",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "carteles-click-3d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "carteles-click-3d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "carteles-click-3d.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const isFirebaseConfigured = isConfigured;

