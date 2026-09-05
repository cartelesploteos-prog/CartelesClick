import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  Layers,
  BookOpen,
  FileText,
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft,
} from "lucide-react";
import { MATERIALS_CATALOG, DICTIONARY_TERMS } from "../../data/materials";
import { FALLBACK_ARTICLES } from "../../data/blog";
import { searchGlobalCatalog, FuzzySearchResult } from "../../utils/fuzzySearch";
import { IconBadge } from "./IconBadge";

interface GlobalSearchBarProps {
  onNavigate: (view: string, param?: string) => void;
  className?: string;
  variant?: "header" | "modal";
  onCloseModal?: () => void;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  onNavigate,
  className = "",
  variant = "header",
  onCloseModal,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<"all" | "material" | "dictionary" | "blog">("all");

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global Keyboard shortcut (Ctrl+K or ⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        if (onCloseModal) onCloseModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCloseModal]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute fuzzy search results
  const allResults = useMemo(() => {
    return searchGlobalCatalog(query, MATERIALS_CATALOG, DICTIONARY_TERMS, FALLBACK_ARTICLES, 16);
  }, [query]);

  const filteredResults = useMemo(() => {
    if (activeCategory === "all") return allResults;
    return allResults.filter((r) => r.type === activeCategory);
  }, [allResults, activeCategory]);

  // Category counts
  const counts = useMemo(() => {
    return {
      all: allResults.length,
      material: allResults.filter((r) => r.type === "material").length,
      dictionary: allResults.filter((r) => r.type === "dictionary").length,
      blog: allResults.filter((r) => r.type === "blog").length,
    };
  }, [allResults]);

  // Reset selected index when query or category changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  // Handle keyboard navigation inside the search results
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      setIsOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === "Enter" && filteredResults.length > 0) {
      e.preventDefault();
      const target = filteredResults[selectedIndex];
      if (target) {
        handleSelectResult(target);
      }
    }
  };

  const handleSelectResult = (result: FuzzySearchResult) => {
    onNavigate(result.targetView, result.targetParam);
    setIsOpen(false);
    setQuery("");
    if (onCloseModal) onCloseModal();
  };

  const getResultIconComponent = (type: string) => {
    switch (type) {
      case "material":
        return Layers;
      case "dictionary":
        return BookOpen;
      case "blog":
        return FileText;
      default:
        return Sparkles;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* SEARCH INPUT BAR */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-[var(--text-secondary)]">
          <Search className="w-4 h-4" strokeWidth={1.85} />
        </div>

        <input
          ref={inputRef}
          type="text"
          id="global-search-header-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder="Buscar materiales, glosario o guías..."
          className="w-full pl-9 pr-14 py-2 sm:py-2.5 rounded-full bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-primary text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none transition-all shadow-xs"
          autoComplete="off"
        />

        <div className="absolute right-2.5 flex items-center gap-1.5 pointer-events-auto">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer"
              title="Borrar búsqueda"
              aria-label="Borrar búsqueda"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.85} />
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <Command className="w-2.5 h-2.5" strokeWidth={1.85} />
              <span>K</span>
            </span>
          )}
        </div>
      </div>

      {/* SEARCH RESULTS DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden max-h-[80vh] sm:max-h-[480px] flex flex-col text-[var(--text-primary)]"
          >
            {/* CATEGORY FILTER CHIPS */}
            {query.trim().length > 0 && (
              <div className="p-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeCategory === "all"
                      ? "bg-primary text-white font-bold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]"
                  }`}
                >
                  Todos ({counts.all})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("material")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    activeCategory === "material"
                      ? "bg-primary text-white font-bold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]"
                  }`}
                >
                  <span>Materiales</span>
                  <span className="opacity-80">({counts.material})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("dictionary")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    activeCategory === "dictionary"
                      ? "bg-primary text-white font-bold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]"
                  }`}
                >
                  <span>Glosario Técnico</span>
                  <span className="opacity-80">({counts.dictionary})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("blog")}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    activeCategory === "blog"
                      ? "bg-primary text-white font-bold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]"
                  }`}
                >
                  <span>Blog & Guías</span>
                  <span className="opacity-80">({counts.blog})</span>
                </button>
              </div>
            )}

            {/* RESULTS LIST */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 overscroll-contain divide-y divide-[var(--border-subtle)]/30">
              {query.trim().length === 0 ? (
                /* SUGGESTIONS & POPULAR SEARCHES */
                <div className="p-4 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold block">
                    Búsquedas Rápidas del Taller
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "Lona Front 13oz", view: "cotizador", param: "lona_front_13oz" },
                      { label: "Vinilo Microperforado", view: "cotizador", param: "vinilo_microperforado" },
                      { label: "PVC Espumado", view: "cotizador", param: "pvc_espumado" },
                      { label: "¿Qué es CMYK?", view: "diccionario", param: "cmyk" },
                      { label: "Resolución 150 DPI", view: "blog", param: "guia-dpi-gran-formato" },
                      { label: "Demasía / Sangrado", view: "diccionario", param: "sangrado-demasia" },
                      { label: "Ojales y Refuerzo", view: "diccionario", param: "ojales-perimetrales" },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          onNavigate(item.view, item.param);
                          setIsOpen(false);
                          if (onCloseModal) onCloseModal();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface-subtle)] hover:bg-primary/10 hover:border-primary/30 border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] hover:text-primary transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Search className="w-3 h-3 text-[var(--text-secondary)]" strokeWidth={1.85} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : filteredResults.length === 0 ? (
                /* NO RESULTS */
                <div className="py-8 px-4 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-[var(--bg-surface-subtle)] flex items-center justify-center text-[var(--text-secondary)]">
                    <Search className="w-5 h-5" strokeWidth={1.85} />
                  </div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">
                    No encontramos resultados para "{query}"
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] max-w-xs mx-auto">
                    Probá con términos generales como "lona", "vinilo", "DPI", "ojales", "corte router" o "backlight".
                  </p>
                </div>
              ) : (
                /* RESULT ITEMS */
                filteredResults.map((result, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => handleSelectResult(result)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 border border-primary/30 shadow-xs"
                          : "hover:bg-[var(--bg-surface-subtle)] border border-transparent"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <IconBadge
                          icon={getResultIconComponent(result.type)}
                          size="sm"
                          variant={result.type === "material" ? "primary" : result.type === "dictionary" ? "accent" : "neutral"}
                          containerStyle="subtle"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                            {result.title}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] shrink-0">
                            {result.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                          {result.subtitle}
                        </p>
                      </div>

                      <div className="shrink-0 text-[var(--text-secondary)] self-center pl-1">
                        {isSelected ? (
                          <CornerDownLeft className="w-3.5 h-3.5 text-primary" strokeWidth={1.85} />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 opacity-40" strokeWidth={1.85} />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* KEYBOARD SHORTCUTS HINT FOOTER */}
            <div className="px-3 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-mono">
              <span className="flex items-center gap-2">
                <span>↑↓ para navegar</span>
                <span>•</span>
                <span>↵ para seleccionar</span>
              </span>
              <span>ESC para cerrar</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
