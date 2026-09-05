import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { translations } from "./i18n/translations";

export const defaultNS = "translation";

export const resources = {
  es: {
    translation: translations.es,
  },
  en: {
    translation: translations.en,
  },
  "pt-BR": {
    translation: translations["pt-BR"],
  },
  pt: {
    translation: translations["pt-BR"],
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "cartelesclick_language",
      caches: ["localStorage"],
    },
  });

export default i18n;
