import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Menu,
  X,
  Sparkles,
  Calculator,
  Layers,
  Briefcase,
  Image,
  Package,
  User,
  ShieldCheck,
  ChevronRight,
  Zap,
  Search,
  BookOpen,
  FileText,
  Settings,
  MessageCircle,
  Clock,
  Truck,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";
import { Logo } from "./Logo";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { CurrencySelector } from "./ui/CurrencySelector";
import { BorderBeam } from "./ui/BorderBeam";
import { triggerBrindisCelebration } from "./ui/ToastCelebration";

import { ThemeSelector } from "./ui/ThemeSelector";
import { NotificationBell } from "./ui/NotificationBell";
import { CTAButton } from "./ui/CTAButton";
import { useTranslation } from "react-i18next";
import { useI18nStore } from "../store/useI18nStore";
import { LanguageSelector } from "./ui/LanguageSelector";
import { GlobalSearchBar } from "./ui/GlobalSearchBar";

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ currentView, onNavigate }) => {
  const { t, i18n } = useTranslation();
  const { language } = useI18nStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const { items, setIsOpen: setCartOpen } = useCartStore();
  const headerContainerRef = React.useRef<HTMLDivElement>(null);

  const totalCartItems = React.useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [items]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const updateHeight = () => {
        if (headerContainerRef.current) {
          const rect = headerContainerRef.current.getBoundingClientRect();
          document.documentElement.style.setProperty("--header-height", `${rect.height + 16}px`);
        }
      };
      updateHeight();
      const observer = new ResizeObserver(updateHeight);
      if (headerContainerRef.current) {
        observer.observe(headerContainerRef.current);
      }
      return () => observer.disconnect();
    }
  }, []);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    const handleOpenSearch = () => {
      setIsMobileSearchOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("open-mobile-search", handleOpenSearch);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("open-mobile-search", handleOpenSearch);
    };
  }, []);

  // Lock body scroll without layout shift when drawer is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  const handleNavClick = React.useCallback((viewId: string, param?: string) => {
    onNavigate(viewId, param);
    setIsOpen(false);
    setSearchQuery("");
  }, [onNavigate]);

  const allNavigationItems = React.useMemo(() => [
    {
      group: t("group_design_tools"),
      items: [
        {
          id: "poster",
          label: t("nav_poster"),
          desc: t("nav_poster_desc"),
          icon: Sparkles,
          highlight: true,
        },
        {
          id: "cotizador",
          label: t("nav_cotizador"),
          desc: t("nav_cotizador_desc"),
          icon: Calculator,
        },
        {
          id: "materiales",
          label: t("nav_materiales"),
          desc: t("nav_materiales_desc"),
          icon: Layers,
        },
      ],
    },
    {
      group: t("group_commercial_services"),
      items: [
        {
          id: "mayoristas",
          label: t("nav_mayoristas"),
          desc: t("nav_mayoristas_desc"),
          icon: Briefcase,
        },
        {
          id: "portfolio",
          label: t("nav_portfolio"),
          desc: t("nav_portfolio_desc"),
          icon: Image,
        },
        {
          id: "pedidos",
          label: t("nav_pedidos"),
          desc: t("nav_pedidos_desc"),
          icon: Package,
        },
        {
          id: "cuenta",
          label: t("nav_cuenta"),
          desc: t("nav_cuenta_desc"),
          icon: User,
        },
      ],
    },
    {
      group: t("group_technical_resources"),
      items: [
        {
          id: "diccionario",
          label: t("nav_diccionario"),
          desc: t("nav_diccionario_desc"),
          icon: BookOpen,
        },
        {
          id: "blog",
          label: t("nav_blog"),
          desc: t("nav_blog_desc"),
          icon: FileText,
        },
        {
          id: "admin",
          label: t("nav_admin"),
          desc: t("nav_admin_desc"),
          icon: Settings,
        },
      ],
    },
  ], [language, i18n.language, t]);

  const filteredItems = React.useMemo(() => allNavigationItems
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (i) =>
          i.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.desc.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0), [allNavigationItems, searchQuery]);

  return (
    <header
      role="banner"
      className="fixed top-3 sm:top-4 left-0 right-0 z-50 w-full px-3 sm:px-6 pointer-events-none transition-all"
    >
      <div ref={headerContainerRef} className="max-w-5xl mx-auto pointer-events-auto rounded-full glass-panel px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 transition-all shadow-sm">
        {/* LOGO */}
        <motion.button
          id="btn-logo-header"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNavClick("home")}
          className="flex items-center gap-2.5 sm:gap-3 text-left rounded-full focus-visible:ring-2 focus-visible:ring-[var(--brand-brick)] group pl-0.5 cursor-pointer"
          aria-label="Carteles.Click - Inicio"
        >
          <div className="w-11 h-11 rounded-full bg-[var(--brand-brick)] hover:bg-[var(--brand-brick-hover)] flex items-center justify-center text-white shrink-0 shadow-md shadow-[var(--brand-brick)]/25 transition-all">
            <Zap className="w-5 h-5 fill-current text-white" aria-hidden="true" />
          </div>
          <div className="font-heading">
            <Logo size="md" />
          </div>
        </motion.button>

        {/* RIGHT CONTROLS: Just Hamburger Menu for minimalism */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* BURGER MENU BUTTON WITH ANIMATEPRESENCE */}
          <motion.button
            id="btn-burger-menu"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isOpen
                ? "bg-[var(--brand-brick)] dark:bg-[var(--brand-brick)] text-white shadow-md shadow-[var(--brand-brick)]/25 dark:shadow-[var(--brand-brick)]/30"
                : "bg-[var(--bg-surface-subtle)] text-[var(--text-primary)]"
            }`}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú de navegación"}
            title={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.div
                  key="close-icon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu-icon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="w-5 h-5" strokeWidth={2} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* SMOOTH RIGHT SLIDING DRAWER MENU WITH BACKDROP */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* BACKDROP OVERLAY */}
              <motion.div
                key="drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm cursor-pointer"
                aria-hidden="true"
              />

              {/* SLIDING DRAWER PANEL (FROM RIGHT) */}
              <motion.div
                key="drawer-panel"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 320, mass: 0.8 }}
                className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md sm:max-w-lg bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] flex flex-col justify-between shadow-2xl overflow-hidden transform-gpu overscroll-contain"
              >
                {/* DRAWER TOP BAR */}
                <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between shrink-0 bg-[var(--bg-surface)]/95 backdrop-blur-md">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--brand-brick)] flex items-center justify-center text-white shrink-0">
                      <Zap className="w-4.5 h-4.5 fill-current text-white" />
                    </div>
                    <Logo size="md" />
                  </div>
                  <div className="flex items-center gap-2">
                    <NotificationBell onNavigate={(v, p) => { setIsOpen(false); onNavigate(v, p); }} />
                    <ThemeSelector />
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-9 h-9 rounded-full bg-[var(--bg-surface-subtle)] hover:bg-[var(--border-subtle)] flex items-center justify-center transition-colors cursor-pointer text-[var(--text-primary)]"
                      aria-label="Cerrar menú"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* DRAWER SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 w-full -webkit-overflow-scrolling-touch">
                  {/* HERO CTA IN DRAWER */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--brand-brick)]/15 via-[var(--brand-brick)]/5 to-transparent border border-[var(--brand-brick)]/25 flex flex-col items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--brand-brick)] font-bold">
                        {t("ai_engine_badge")}
                      </span>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        {t("ai_engine_title")}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {t("ai_engine_desc")}
                      </p>
                    </div>
                    <CTAButton
                      onClick={() => handleNavClick("poster")}
                      className="ideogram-btn-glow w-full !py-2.5 !text-xs !rounded-xl"
                      celebrationMessage="¡Modo Creador de Diseños con IA activado! 🥂✨"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{t("design_with_ai")}</span>
                    </CTAButton>
                  </div>

                  {/* GLOBAL SEARCH BAR INSIDE DRAWER MENU */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold block">
                      Buscador Global del Taller
                    </span>
                    <GlobalSearchBar
                      onNavigate={(v, p) => {
                        setIsOpen(false);
                        handleNavClick(v, p);
                      }}
                    />
                  </div>

                  {/* LANGUAGE SELECTOR IN BURGER MENU */}
                  <LanguageSelector variant="drawer" />

                  {/* NAVIGATION GROUPS */}
                  <div className="space-y-5">
                    {filteredItems.map((group, gIdx) => (
                      <div key={gIdx} className="space-y-2">
                        <h4 className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold px-1">
                          {group.group}
                        </h4>
                        <div className="grid grid-cols-1 gap-1.5">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const isCurrent = currentView === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  isCurrent
                                    ? "bg-[var(--brand-brick)]/10 border-[var(--brand-brick)]/40 text-[var(--brand-brick)] font-bold"
                                    : "bg-[var(--bg-surface-subtle)] text-[var(--text-primary)]"
                                }`}
                              >
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                    isCurrent || (item as any).highlight
                                      ? "bg-[var(--brand-brick)] text-white"
                                      : "bg-[var(--bg-surface)] text-[var(--brand-brick)]"
                                  }`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                                      {item.label}
                                    </span>
                                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                                  </div>
                                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                                    {item.desc}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* QUICK CONTACT & WORKSHOP BADGES */}
                  <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] flex flex-col gap-2.5 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[var(--brand-brick)] shrink-0" />
                      <div>
                        <span className="text-[var(--text-primary)] block font-medium text-[11px]">Producción 24 Horas</span>
                        <span className="text-[10px]">Despacho express a todo el país</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-[var(--brand-brick)] shrink-0" />
                      <div>
                        <span className="text-[var(--text-primary)] block font-medium text-[11px]">Envíos Federales</span>
                        <span className="text-[10px]">Retiro en taller o flete a expreso</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                      <a
                        href="https://wa.me/5491148921100?text=Hola%20Carteles.Click,%20quiero%20hacer%20una%20consulta"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[var(--text-primary)] transition-colors"
                      >
                        <span className="text-[var(--text-primary)] block font-medium text-[11px]">WhatsApp Taller</span>
                        <span className="text-[10px] text-[#25D366] font-medium">+54 9 11 4892-1100</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* DRAWER FOOTER */}
                <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-[var(--bg-surface-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)] w-full shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--brand-brick)]" />
                    <span className="text-[var(--text-primary)] font-medium text-[11px]">Moneda: ARS ($)</span>
                  </div>
                  <button
                    onClick={() => handleNavClick("home")}
                    className="text-xs text-[var(--brand-brick)] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <span>Inicio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* MOBILE SEARCH OVERLAY MODAL */}
      {mounted && createPortal(
        <AnimatePresence>
          {isMobileSearchOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-20">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileSearchOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
                aria-hidden="true"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative z-50 w-full max-w-lg bg-[var(--bg-surface-elevated)] rounded-2xl shadow-2xl overflow-hidden p-4 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary" strokeWidth={1.85} />
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      Búsqueda Rápida del Taller
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileSearchOpen(false)}
                    className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" strokeWidth={1.85} />
                  </button>
                </div>
                <GlobalSearchBar
                  onNavigate={handleNavClick}
                  onCloseModal={() => setIsMobileSearchOpen(false)}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
});

Header.displayName = "Header";
