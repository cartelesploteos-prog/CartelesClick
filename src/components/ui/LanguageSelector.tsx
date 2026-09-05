import React from "react";
import { useTranslation } from "react-i18next";
import { useI18nStore } from "../../store/useI18nStore";
import { useCurrencyStore, Currency } from "../../store/useCurrencyStore";
import { Language } from "../../i18n/translations";
import { Check } from "lucide-react";

interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: "es",
    label: "Español",
    nativeName: "Español (AR)",
    flag: "🇦🇷",
  },
  {
    code: "en",
    label: "English",
    nativeName: "English (US)",
    flag: "🇺🇸",
  },
  {
    code: "pt-BR",
    label: "Português",
    nativeName: "Português (BR)",
    flag: "🇧🇷",
  },
];

interface LanguageSelectorProps {
  variant?: "drawer" | "compact";
}

const normalizeLangCode = (code?: string): Language => {
  if (!code) return "es";
  const c = code.toLowerCase();
  if (c.startsWith("pt")) return "pt-BR";
  if (c.startsWith("en")) return "en";
  return "es";
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = "drawer" }) => {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useI18nStore();
  const { setCurrency } = useCurrencyStore();

  const handleSelectLanguage = (langCode: Language) => {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
    
    // Currency mapping
    const currencyMap: Record<string, Currency> = {
      es: "ARS",
      en: "USD",
      "pt-BR": "BRL",
    };
    setCurrency(currencyMap[langCode] || "ARS");
  };

  const activeLang = normalizeLangCode(i18n.language || language);

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1 p-1 bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] rounded-xl text-xs">
        {LANGUAGES.map((lang) => {
          const isActive = activeLang === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                isActive
                  ? "bg-[var(--brand-brick)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
              }`}
              title={lang.nativeName}
            >
              <span>{lang.code.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-primary)]">
            {t("language_label")}
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-bold uppercase">
          {activeLang}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {LANGUAGES.map((lang) => {
          const isActive = activeLang === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleSelectLanguage(lang.code)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer relative ${
                isActive
                  ? "bg-[var(--brand-brick)]/10 border-[var(--brand-brick)] text-[var(--brand-brick)] font-bold shadow-sm"
                  : "bg-[var(--bg-surface)] hover:bg-[var(--border-subtle)] border-[var(--border-subtle)] text-[var(--text-primary)]"
              }`}
            >
              {isActive && (
                <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[var(--brand-brick)] text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
              <span className="text-[11px] font-bold leading-none">{lang.label}</span>
              <span className="text-[9px] text-[var(--text-muted)] mt-0.5">
                {lang.code === "es" ? "Argentina" : lang.code === "en" ? "US / Int" : "Brasil"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

