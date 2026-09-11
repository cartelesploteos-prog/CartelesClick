import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
  ShieldCheck,
  Clock,
  LogOut,
  LogIn,
  Package,
  Wrench,
  X,
  ChevronRight
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

interface DropdownItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel?: string;
  badge?: number | string;
  badgeColor?: string;
  onClick: () => void;
  danger?: boolean;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  icon: Icon,
  label,
  sublabel,
  badge,
  badgeColor = "bg-[var(--brand-brick)] text-white",
  onClick,
  danger = false,
}) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left transition-all cursor-pointer group select-none ${
      danger
        ? "text-rose-600 hover:bg-rose-500/10 active:scale-[0.98]"
        : "text-[var(--text-primary)] hover:bg-[var(--brand-brick)]/10 hover:text-[var(--brand-brick)] active:scale-[0.98]"
    }`}
  >
    <div className="flex items-center gap-3 min-w-0 pr-2">
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
          danger
            ? "bg-rose-500/10 text-rose-600"
            : "bg-black/5 dark:bg-white/10 text-[var(--brand-brick)]"
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="truncate">
        <div className="text-xs font-semibold leading-tight">{label}</div>
        {sublabel && (
          <div className="text-[11px] text-[var(--text-secondary)] leading-tight mt-0.5 group-hover:text-[var(--text-primary)]/80">
            {sublabel}
          </div>
        )}
      </div>
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      {badge !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>
          {badge}
        </span>
      )}
      <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
    </div>
  </button>
);

export const FloatingDock = React.memo((props: FloatingDockProps) => {
  const { currentView, onNavigate } = props;
  const { t } = useTranslation();

  const { isAdmin, isAuthenticated, logout } = useAuthStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const { items, setIsOpen: setCartOpen } = useCartStore();
  const { language, setLanguage } = useI18nStore();

  const [expandedMenu, setExpandedMenu] = useState<"tools" | "user" | "modes" | null>(null);
  const [showWorkshopPopup, setShowWorkshopPopup] = useState(false);
  const dockRef = useRef<HTMLElement>(null);

  const totalCartItems = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [items]);

  // Cierre limpio al hacer clic fuera de todo el componente de navegación
  useEffect(() => {
    const handleOutsideInteraction = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target || !dockRef.current) return;
      if (!dockRef.current.contains(target)) {
        setExpandedMenu(null);
        setShowWorkshopPopup(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideInteraction);
    document.addEventListener("touchstart", handleOutsideInteraction, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutsideInteraction);
      document.removeEventListener("touchstart", handleOutsideInteraction);
    };
  }, []);

  const closeAll = useCallback(() => {
    setExpandedMenu(null);
    setShowWorkshopPopup(false);
  }, []);

  const toggleMenu = useCallback((menu: "tools" | "user" | "modes") => {
    setShowWorkshopPopup(false);
    setExpandedMenu((prev) => (prev === menu ? null : menu));
  }, []);

  const handleNavClick = useCallback(
    (view: string, param?: string) => {
      closeAll();
      onNavigate(view, param);
    },
    [closeAll, onNavigate]
  );

  // Tab activo actual (uno solo a la vez para evitar conflictos de renderizado)
  const activeTab = useMemo(() => {
    if (expandedMenu) return expandedMenu;
    if (showWorkshopPopup) return "tools";
    if (currentView === "home") return "home";
    if (currentView === "cotizador") return "tools";
    if (currentView === "cuenta" || currentView === "admin") return "user";
    return null;
  }, [expandedMenu, showWorkshopPopup, currentView]);

  // Popup activo a mostrar (tools, user, modes o workshop)
  const activePopup = showWorkshopPopup ? "workshop" : expandedMenu;

  return (
    <nav
      id="floating-dock-navigation"
      ref={dockRef}
      aria-label="Navegación principal del dock"
      className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none select-none"
    >
      {/* PANEL FLOTANTE DESPLEGABLE (CENTRADO SOBRE EL DOCK, SIN DESBORDES) */}
      <AnimatePresence>
        {activePopup && (
          <motion.div
            key={activePopup}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="mb-2.5 w-[calc(100vw-1.5rem)] max-w-[340px] sm:max-w-[380px] rounded-3xl liquid-glass-dropdown p-3.5 shadow-2xl pointer-events-auto max-h-[min(480px,calc(100vh-6.5rem))] overflow-y-auto overscroll-contain custom-scrollbar"
          >
            {/* CABECERA DEL DESPLEGABLE */}
            <div className="flex items-center justify-between px-1.5 py-1 border-b border-[var(--border-subtle)] mb-1.5">
              <div className="flex items-center gap-2">
                {activePopup === "tools" && (
                  <>
                    <Wrench className="w-4 h-4 text-[var(--brand-brick)]" />
                    <span className="font-heading text-xs font-bold text-[var(--text-primary)]">
                      Herramientas y Cotizador
                    </span>
                  </>
                )}
                {activePopup === "user" && (
                  <>
                    <User className="w-4 h-4 text-[var(--brand-brick)]" />
                    <span className="font-heading text-xs font-bold text-[var(--text-primary)]">
                      {isAuthenticated ? "Mi Cuenta" : "Acceso de Clientes"}
                    </span>
                  </>
                )}
                {activePopup === "modes" && (
                  <>
                    <Settings className="w-4 h-4 text-[var(--brand-brick)]" />
                    <span className="font-heading text-xs font-bold text-[var(--text-primary)]">
                      Preferencias y Visualización
                    </span>
                  </>
                )}
                {activePopup === "workshop" && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-heading text-xs font-bold text-[var(--text-primary)]">
                      Taller Central · Métricas en Vivo
                    </span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closeAll();
                }}
                className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Cerrar menú"
                aria-label="Cerrar panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CONTENIDO 1: HERRAMIENTAS */}
            {activePopup === "tools" && (
              <div className="flex flex-col gap-0.5">
                <DropdownItem
                  icon={Calculator}
                  label="Cotizador 3D"
                  sublabel="Letras corporeas y marquesinas"
                  onClick={() => handleNavClick("cotizador")}
                />
                <DropdownItem
                  icon={Activity}
                  label="Taller en Vivo"
                  sublabel="Capacidad y tiempos de imprenta"
                  onClick={() => {
                    setExpandedMenu(null);
                    setShowWorkshopPopup(true);
                  }}
                />
                <DropdownItem
                  icon={ShoppingBag}
                  label="Carrito de Compras"
                  sublabel={totalCartItems > 0 ? `${totalCartItems} productos listos` : "Revisar presupuesto"}
                  badge={totalCartItems > 0 ? totalCartItems : undefined}
                  onClick={() => {
                    closeAll();
                    setCartOpen(true);
                  }}
                />
              </div>
            )}

            {/* CONTENIDO 2: USUARIO / CUENTA */}
            {activePopup === "user" && (
              <div className="flex flex-col gap-0.5">
                {!isAuthenticated ? (
                  <>
                    <DropdownItem
                      icon={LogIn}
                      label="Iniciar Sesión"
                      sublabel="Acceder a tu cuenta de cliente"
                      onClick={() => handleNavClick("cuenta", "login")}
                    />
                    <DropdownItem
                      icon={UserPlus}
                      label="Crear Cuenta"
                      sublabel="Nuevo cliente, comercio o agencia"
                      onClick={() => handleNavClick("cuenta", "register")}
                    />
                    <DropdownItem
                      icon={Package}
                      label="Seguimiento de Pedidos"
                      sublabel="Consultar estado con DNI o código"
                      onClick={() => handleNavClick("pedidos")}
                    />
                  </>
                ) : (
                  <>
                    <DropdownItem
                      icon={User}
                      label={isAdmin ? "Panel Administrador" : "Mi Perfil"}
                      sublabel={isAdmin ? "Gestión de órdenes y catálogo" : "Mis datos y configuración"}
                      onClick={() => handleNavClick(isAdmin ? "admin" : "cuenta")}
                    />
                    <DropdownItem
                      icon={Package}
                      label="Mis Pedidos"
                      sublabel="Historial y comprobantes"
                      onClick={() => handleNavClick("pedidos")}
                    />
                    <DropdownItem
                      icon={LogOut}
                      label="Cerrar Sesión"
                      sublabel="Salir de la cuenta de forma segura"
                      onClick={() => {
                        logout();
                        handleNavClick("home");
                      }}
                      danger
                    />
                  </>
                )}
              </div>
            )}

            {/* CONTENIDO 3: PREFERENCIAS / MODOS */}
            {activePopup === "modes" && (
              <div className="flex flex-col gap-0.5">
                <DropdownItem
                  icon={resolvedTheme === "dark" ? Sun : Moon}
                  label={resolvedTheme === "dark" ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
                  sublabel={`Actualmente: Modo ${resolvedTheme === "dark" ? "Oscuro" : "Claro"}`}
                  onClick={() => {
                    toggleTheme();
                  }}
                />
                <DropdownItem
                  icon={Globe}
                  label={
                    language === "es"
                      ? "Idioma: Español"
                      : language === "en"
                      ? "Language: English"
                      : "Idioma: Português"
                  }
                  sublabel="Tocar para rotar idioma"
                  badge={language.toUpperCase()}
                  onClick={() => {
                    const langs: Array<"es" | "en" | "pt-BR"> = ["es", "en", "pt-BR"];
                    const currentIndex = langs.indexOf(language as any);
                    const nextLang = langs[(currentIndex === -1 ? 0 : currentIndex + 1) % langs.length];
                    setLanguage(nextLang);
                  }}
                />
                <DropdownItem
                  icon={Search}
                  label="Búsqueda Rápida"
                  sublabel="Materiales, blog o glosario"
                  badge="⌘K"
                  badgeColor="bg-black/10 dark:bg-white/15 text-[var(--text-primary)]"
                  onClick={() => {
                    closeAll();
                    document.dispatchEvent(new CustomEvent("open-mobile-search"));
                  }}
                />
              </div>
            )}

            {/* CONTENIDO 4: TALLER EN VIVO */}
            {activePopup === "workshop" && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
                    <div className="text-[var(--text-secondary)] flex items-center gap-1.5 font-medium text-[11px]">
                      <Activity className="w-3.5 h-3.5 text-[var(--brand-brick)]" />
                      <span>En imprenta</span>
                    </div>
                    <p className="font-heading text-sm font-bold text-[var(--text-primary)]">14 trabajos</p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
                    <div className="text-[var(--text-secondary)] flex items-center gap-1.5 font-medium text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-[var(--brand-brick)]" />
                      <span>Despacho</span>
                    </div>
                    <p className="font-heading text-sm font-bold text-[var(--text-primary)]">24 a 48 hs</p>
                  </div>
                </div>

                <div className="space-y-1.5 px-0.5">
                  <div className="flex justify-between text-[11px] text-[var(--text-secondary)]">
                    <span>Capacidad productiva en taller</span>
                    <span className="font-bold text-[var(--brand-brick)]">82%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--brand-brick)] transition-all duration-500 rounded-full"
                      style={{ width: "82%" }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavClick("pedidos")}
                  className="w-full mt-1 py-2 px-3 rounded-xl text-xs font-bold text-[var(--brand-brick)] hover:bg-[var(--brand-brick)] hover:text-white transition-all border border-[var(--brand-brick)]/25 bg-[var(--brand-brick)]/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Seguimiento de pedidos</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DOCK PRINCIPAL DE BOTONES */}
      <div
        className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-full liquid-glass shadow-2xl pointer-events-auto"
      >
        {/* 1. INICIO */}
        <button
          type="button"
          onClick={() => handleNavClick("home")}
          aria-label="Ir al inicio"
          title="Inicio"
          className={`relative p-2.5 sm:p-3 rounded-full transition-all active:scale-95 cursor-pointer ${
            activeTab === "home"
              ? "bg-[var(--brand-brick)] text-white shadow-md shadow-[var(--brand-brick)]/30 ring-1 ring-white/25"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/[0.05] dark:hover:bg-white/[0.12]"
          }`}
        >
          <Home className="w-5 h-5" />
          {activeTab === "home" && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
          )}
        </button>

        {/* 2. HERRAMIENTAS (COTIZADOR, TALLER, CARRITO) */}
        <button
          type="button"
          aria-label="Menú de herramientas"
          aria-expanded={expandedMenu === "tools"}
          title="Herramientas y Cotizador"
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu("tools");
          }}
          className={`relative p-2.5 sm:p-3 rounded-full transition-all active:scale-95 cursor-pointer ${
            activeTab === "tools"
              ? "bg-[var(--brand-brick)] text-white shadow-md shadow-[var(--brand-brick)]/30 ring-1 ring-white/25"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/[0.05] dark:hover:bg-white/[0.12]"
          }`}
        >
          <Calculator className="w-5 h-5" />
          {totalCartItems > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--brand-brick)] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
              {totalCartItems}
            </span>
          )}
          {activeTab === "tools" && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
          )}
        </button>

        {/* 3. USUARIO / CUENTA (INGRESO, REGISTRO, PERFIL, PEDIDOS) */}
        <button
          type="button"
          aria-label="Menú de usuario"
          aria-expanded={expandedMenu === "user"}
          title="Cuenta y Pedidos"
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu("user");
          }}
          className={`relative p-2.5 sm:p-3 rounded-full transition-all active:scale-95 cursor-pointer ${
            activeTab === "user"
              ? "bg-[var(--brand-brick)] text-white shadow-md shadow-[var(--brand-brick)]/30 ring-1 ring-white/25"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/[0.05] dark:hover:bg-white/[0.12]"
          }`}
        >
          <User className="w-5 h-5" />
          {activeTab === "user" && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
          )}
        </button>

        {/* 4. AJUSTES / MODOS (TEMA, IDIOMA, BUSCADOR) */}
        <button
          type="button"
          aria-label="Configuración y Preferencias"
          aria-expanded={expandedMenu === "modes"}
          title="Ajustes y Modos"
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu("modes");
          }}
          className={`relative p-2.5 sm:p-3 rounded-full transition-all active:scale-95 cursor-pointer ${
            activeTab === "modes"
              ? "bg-[var(--brand-brick)] text-white shadow-md shadow-[var(--brand-brick)]/30 ring-1 ring-white/25"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/[0.05] dark:hover:bg-white/[0.12]"
          }`}
        >
          <Settings className="w-5 h-5" />
          {activeTab === "modes" && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
          )}
        </button>
      </div>
    </nav>
  );
});

FloatingDock.displayName = "FloatingDock";
