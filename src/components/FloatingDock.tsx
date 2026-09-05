import React, { useState, useRef, useEffect } from "react";
import {
  Home,
  Calculator,
  User,
  Settings,
  Activity,
  ShoppingBag,
  UserPlus,
  Search,
  Globe,
  Sun,
  Moon,
  ChevronDown,
  ShieldCheck,
  Clock,
  LogOut,
  LogIn
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { useCartStore } from "../store/useCartStore";
import { useTranslation } from "react-i18next";
import { useI18nStore } from "../store/useI18nStore";
import { motion, AnimatePresence } from "motion/react";

interface FloatingDockProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

// Reusable sub-action button component
const SubActionButton = ({ icon: Icon, label, onClick, badge }: { icon: any, label: string, onClick: () => void, badge?: number }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-lg hover:bg-[var(--border-subtle)] text-[var(--text-primary)] transition-all cursor-pointer"
  >
    <Icon className="w-4 h-4" />
    {badge !== undefined && badge > 0 && (
      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#C8380A] text-white text-[9px] font-bold flex items-center justify-center shadow-md">
        {badge}
      </span>
    )}
    <span className="absolute right-full mr-3 whitespace-nowrap bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] text-[10px] font-medium px-2 py-1 rounded-md shadow-md border border-[var(--border-subtle)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      {label}
    </span>
  </button>
);

export const FloatingDock = React.memo((props: FloatingDockProps) => {
  const { currentView, onNavigate } = props;
  const { t } = useTranslation();
  
  const { isAdmin, isAuthenticated, logout } = useAuthStore();
  const { theme, resolvedTheme, setTheme } = useThemeStore();
  const { items, setIsOpen: setCartOpen } = useCartStore();
  const { language, setLanguage } = useI18nStore();

  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [showWorkshopPopup, setShowWorkshopPopup] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  const totalCartItems = React.useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [items]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setExpandedMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (menu: string) => {
    setExpandedMenu(prev => prev === menu ? null : menu);
    setShowWorkshopPopup(false); // Close workshop if open
  };

  const handleNavClick = React.useCallback(
    (view: string, param?: string) => {
      setExpandedMenu(null);
      setShowWorkshopPopup(false);
      onNavigate(view, param);
    },
    [onNavigate]
  );

  return (
    <nav
      id="floating-dock-navigation"
      aria-label="Navegación principal del dock"
      className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none transform-gpu"
    >
      {/* EXPANDED WORKSHOP POPUP */}
      <AnimatePresence>
        {showWorkshopPopup && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 w-72 sm:w-80 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-xl p-4 shadow-2xl space-y-3 pointer-events-auto"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-heading text-xs font-bold text-[var(--text-primary)]">
                  Taller Central · Métricas en Vivo
                </span>
              </div>
              <button
                onClick={() => setShowWorkshopPopup(false)}
                className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1">
                <div className="text-[var(--text-secondary)] flex items-center gap-1.5 font-medium text-[11px]">
                  <Activity className="w-3.5 h-3.5 text-[#C8380A]" />
                  <span>En imprenta</span>
                </div>
                <p className="font-heading text-sm font-bold text-[var(--text-primary)]">14 trabajos</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1">
                <div className="text-[var(--text-secondary)] flex items-center gap-1.5 font-medium text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-[#C8380A]" />
                  <span>Despacho</span>
                </div>
                <p className="font-heading text-sm font-bold text-[var(--text-primary)]">24 a 48 hs</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-[var(--text-secondary)]">
                <span>Capacidad operativa</span>
                <span className="font-bold text-[var(--text-primary)]">82%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--bg-surface-subtle)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div className="h-full bg-[#C8380A] transition-all duration-500 rounded-full" style={{ width: "82%" }} />
              </div>
            </div>

            <button
              onClick={() => handleNavClick("pedidos")}
              className="w-full mt-1 py-2 px-3 rounded-xl text-xs font-bold text-[#C8380A] hover:bg-[#C8380A] hover:text-white transition-all border border-[var(--border-subtle)] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Seguimiento de pedidos</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DOCK CONTAINER */}
      <div
        ref={dockRef}
        className="flex items-end gap-2 p-1.5 rounded-full bg-[var(--bg-surface)]/90 backdrop-blur-xl border border-[var(--border-strong)] shadow-2xl pointer-events-auto ring-1 ring-black/5 dark:ring-white/10"
      >
        {/* INICIO */}
        <button
          onClick={() => handleNavClick("home")}
          aria-label="Ir al inicio"
          title="Inicio"
          className={`relative p-3 rounded-full transition-all cursor-pointer ${
            currentView === "home" ? "bg-[#C8380A] text-white shadow-md shadow-[#C8380A]/30" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
          }`}
        >
          <Home className="w-5 h-5" />
        </button>

        {/* CALCULADORA -> Taller, Carrito */}
        <div className="relative flex flex-col items-center">
          <AnimatePresence>
            {expandedMenu === "calc" && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-full mb-3 flex flex-col gap-2"
              >
                <SubActionButton icon={Activity} label="Taller" onClick={() => { setExpandedMenu(null); setShowWorkshopPopup(true); }} />
                <SubActionButton icon={ShoppingBag} label="Carrito" badge={totalCartItems} onClick={() => { setExpandedMenu(null); setCartOpen(true); }} />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            aria-label="Cotizador y Herramientas"
            title="Herramientas"
            onClick={() => {
              // Si ya estamos en cotizador y está cerrado el menú, lo abrimos.
              // Si no estamos en cotizador, navegamos y abrimos menú?
              // Mejor: un click navega a cotizador Y abre el menú de opciones rápidas.
              if (currentView !== "cotizador") handleNavClick("cotizador");
              toggleMenu("calc");
            }}
            className={`relative p-3 rounded-full transition-all cursor-pointer ${
              currentView === "cotizador" || expandedMenu === "calc" ? "bg-[#C8380A] text-white shadow-md shadow-[#C8380A]/30" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
            }`}
          >
            <Calculator className="w-5 h-5" />
          </button>
        </div>

        {/* LOGIN/CUENTA -> Crear Cuenta, Ingresar/Salir */}
        <div className="relative flex flex-col items-center">
          <AnimatePresence>
            {expandedMenu === "user" && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-full mb-3 flex flex-col gap-2"
              >
                {!isAuthenticated ? (
                  <>
                    <SubActionButton icon={UserPlus} label="Crear Cuenta" onClick={() => handleNavClick("cuenta", "register")} />
                    <SubActionButton icon={LogIn} label="Ingresar" onClick={() => handleNavClick("cuenta", "login")} />
                  </>
                ) : (
                  <>
                    <SubActionButton icon={User} label="Mi Perfil" onClick={() => handleNavClick(isAdmin ? "admin" : "cuenta")} />
                    <SubActionButton icon={LogOut} label="Cerrar Sesión" onClick={() => { logout(); setExpandedMenu(null); handleNavClick("home"); }} />
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            aria-label="Menú de Usuario"
            title="Cuenta"
            onClick={() => toggleMenu("user")}
            className={`relative p-3 rounded-full transition-all cursor-pointer ${
              expandedMenu === "user" ? "bg-[#C8380A] text-white shadow-md shadow-[#C8380A]/30" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
            }`}
          >
            <User className="w-5 h-5" />
          </button>
        </div>

        {/* MODOS (Settings) -> Idiomas, Buscador, Tema */}
        <div className="relative flex flex-col items-center">
          <AnimatePresence>
            {expandedMenu === "modes" && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-full mb-3 flex flex-col gap-2"
              >
                <SubActionButton icon={Search} label="Buscador" onClick={() => { setExpandedMenu(null); document.dispatchEvent(new CustomEvent('open-mobile-search')); }} />
                
                {/* Ciclar Idiomas */}
                <SubActionButton 
                  icon={Globe} 
                  label={`Idioma (${language.toUpperCase()})`} 
                  onClick={() => {
                    const langs: Array<"es" | "en" | "pt-BR"> = ["es", "en", "pt-BR"];
                    const currentIndex = langs.indexOf(language as any);
                    const nextLang = langs[(currentIndex === -1 ? 0 : currentIndex + 1) % langs.length];
                    setLanguage(nextLang);
                  }} 
                />
                
                {/* Cambiar Tema */}
                <SubActionButton 
                  icon={resolvedTheme === "dark" ? Sun : Moon} 
                  label={resolvedTheme === "dark" ? "Modo Claro" : "Modo Oscuro"} 
                  onClick={() => setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light")} 
                />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            aria-label="Configuración y Modos"
            title="Ajustes"
            onClick={() => toggleMenu("modes")}
            className={`relative p-3 rounded-full transition-all cursor-pointer ${
              expandedMenu === "modes" ? "bg-[#C8380A] text-white shadow-md shadow-[#C8380A]/30" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
});

FloatingDock.displayName = "FloatingDock";

