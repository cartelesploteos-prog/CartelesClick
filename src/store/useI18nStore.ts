import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import i18n from "../i18n";
import { Language, TranslationDictionary, translations } from "../i18n/translations";

export type SupportedLanguage = "es" | "en" | "pt-BR";

interface I18nState {
  language: SupportedLanguage;
  setLanguage: (lang: string) => void;
  initI18n: () => SupportedLanguage;
  t: (key: keyof TranslationDictionary, fallback?: string) => string;
}

export const I18N_STORAGE_KEY = "cartelesclick_language";

export const normalizeLanguage = (langStr?: string | null): SupportedLanguage => {
  if (!langStr) return "es";
  const normalized = langStr.trim().toLowerCase();
  if (normalized === "pt" || normalized.startsWith("pt-") || normalized.startsWith("pt_") || normalized.includes("brazil") || normalized.includes("portug")) {
    return "pt-BR";
  }
  if (normalized === "en" || normalized.startsWith("en-") || normalized.startsWith("en_") || normalized.includes("eng")) {
    return "en";
  }
  if (normalized === "es" || normalized.startsWith("es-") || normalized.startsWith("es_") || normalized.includes("span")) {
    return "es";
  }
  return "es";
};

const applyToDom = (lang: SupportedLanguage) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
  }
};

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      language: "es", // Default fallback, persist will override if stored
      setLanguage: (lang: string) => {
        const norm = normalizeLanguage(lang);
        set({ language: norm });
        if (i18n.language !== norm) {
          i18n.changeLanguage(norm);
        }
        applyToDom(norm);
      },
      initI18n: () => {
        const current = get().language;
        if (i18n.language !== current) {
          i18n.changeLanguage(current);
        }
        applyToDom(current);
        return current;
      },
      t: (key: keyof TranslationDictionary, fallback?: string) => {
        const currentLang = get().language;
        const dict = translations[currentLang] || translations.es;
        const directValue = dict[key];
        if (directValue) return directValue;
        return i18n.t(key as string, { defaultValue: fallback || translations.es[key] || String(key) });
      },
    }),
    {
      name: I18N_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const norm = normalizeLanguage(state.language);
          if (state.language !== norm) {
            state.setLanguage(norm);
          } else {
            state.initI18n();
          }
        }
      },
    }
  )
);

// Subscribe to direct i18n changes if needed (e.g., initialized elsewhere)
if (i18n && typeof i18n.on === "function") {
  i18n.on("languageChanged", (lng) => {
    const norm = normalizeLanguage(lng);
    if (useI18nStore.getState().language !== norm) {
      useI18nStore.getState().setLanguage(norm);
    }
  });
}
