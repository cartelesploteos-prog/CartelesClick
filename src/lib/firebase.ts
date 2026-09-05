import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyATR0oCwrNYMbv43cnStsvdo35VisIi4nM",
  authDomain: "gen-lang-client-0920652613.firebaseapp.com",
  projectId: "gen-lang-client-0920652613",
  storageBucket: "gen-lang-client-0920652613.firebasestorage.app",
  messagingSenderId: "657585120584",
  appId: "1:657585120584:web:da64487dbde2c922c6bf7d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
