import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Sparkles,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { DICTIONARY_TERMS } from "../../data/materials";

interface DictionaryViewProps {
  initialSlug?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  initialSlug,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialSlug || DICTIONARY_TERMS[0].slug,
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (initialSlug) {
      setSelectedSlug(initialSlug);
    }
  }, [initialSlug]);

  const filteredTerms = DICTIONARY_TERMS.filter(
    (t) =>
      t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shortDefinition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeTerm =
    DICTIONARY_TERMS.find((t) => t.slug === selectedSlug) ||
    DICTIONARY_TERMS[0];

  return (
    <div className="section-container pt-28 sm:pt-32 lg:pt-36 pb-36 sm:pb-44 space-y-12 sm:space-y-16 max-w-7xl font-sans">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest text-primary font-heading font-medium">
          Glosario Técnico de Imprenta & Pre-Prensa
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight font-medium">
          {t("dictionary_title")}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-sans font-normal">
          {t("dictionary_subtitle")}
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-md mx-auto relative">
        <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Buscar concepto (ej: sangría, cmyk, dpi, ojales)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-page)] text-xs text-[var(--text-primary)] font-sans focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: LIST OF TERMS */}
        <div className="lg:col-span-5 space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {filteredTerms.map((t) => {
            const isSelected = selectedSlug === t.slug;
            return (
              <button
                key={t.slug}
                onClick={() => setSelectedSlug(t.slug)}
                className={`w-full p-4 rounded-[7px] border text-left transition-all flex items-center justify-between gap-3 shadow-none ${
                  isSelected
                    ? "border-primary bg-[var(--bg-surface-subtle)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-primary/60 text-[var(--text-secondary)]"
                }`}
              >
                <div>
                  <h4 className="font-heading text-xs sm:text-sm text-[var(--text-primary)] font-medium">
                    {t.term}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5 font-sans font-normal">
                    {t.shortDefinition}
                  </p>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 ${
                    isSelected ? "text-primary" : "text-[var(--text-secondary)]"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN: ACTIVE TERM CARD */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-none space-y-6">
            <div className="space-y-2 border-b border-[var(--border-subtle)] pb-4">
              <span className="font-mono-num text-xs uppercase text-primary font-sans font-medium">
                Término #{activeTerm.slug}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl text-[var(--text-primary)] font-medium">
                {activeTerm.term}
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] font-sans font-normal">
              <div className="p-4 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-sans font-medium">
                {activeTerm.shortDefinition}
              </div>
              <p>{activeTerm.fullExplanation}</p>

              {activeTerm.goodPractice && (
                <div className="p-4 rounded-[7px] bg-accent/20 border border-accent/40 text-xs space-y-1 text-[var(--text-primary)]">
                  <div className="flex items-center gap-1.5 font-sans font-medium text-black dark:text-accent">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Consejo de Taller para Diseñadores:</span>
                  </div>
                  <p className="text-[var(--text-secondary)]">
                    {activeTerm.goodPractice}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)] font-sans font-normal">
                ¿Listo para probar este material?
              </span>
              <button
                onClick={() => onNavigate("cotizador")}
                className="px-5 py-2.5 rounded-[7px] bg-primary text-white text-xs font-sans font-medium transition-colors flex items-center gap-1.5"
              >
                <span>Ir al Cotizador</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
