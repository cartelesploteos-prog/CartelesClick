import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { FloatingDock } from "./components/FloatingDock";
import { CartDrawer } from "./components/CartDrawer";
import { HomeView } from "./components/views/HomeView";
import { CotizadorView } from "./components/views/CotizadorView";
import { PosterCreatorView } from "./components/views/PosterCreatorView";
import { MaterialsCatalogView } from "./components/views/MaterialsCatalogView";
import { MaterialDetailView } from "./components/views/MaterialDetailView";
import { WholesaleView } from "./components/views/WholesaleView";
import { DictionaryView } from "./components/views/DictionaryView";
import { PortfolioView } from "./components/views/PortfolioView";
import { BlogView } from "./components/views/BlogView";
import { OrdersView } from "./components/views/OrdersView";
import { AdminPanelView } from "./components/views/AdminPanelView";
import { NotificationToast } from "./components/ui/NotificationToast";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { SEOProvider } from "./components/seo/SEOProvider";
import { useThemeStore } from "./store/useThemeStore";
import { useMaterialStore } from "./store/useMaterialStore";
import { useI18nStore } from "./store/useI18nStore";
import {
  initGA4,
  trackCotizacionIniciada,
  trackMaterialSeleccionado,
  trackPedidoExitoso,
} from "./utils/analytics";

export default function App() {
  const [currentView, setCurrentView] = useState<string>("home");
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);

  // Initialize theme, i18n, materials and GA4 on mount
  useEffect(() => {
    useThemeStore.getState().initTheme();
    useMaterialStore.getState().fetchMaterials();
    useI18nStore.getState().initI18n();
    initGA4();
  }, []);

  // Track navigation & key events in GA4
  useEffect(() => {
    if (currentView === "cotizador") {
      trackCotizacionIniciada({ materialId: viewParam });
    } else if (currentView === "material-detail" && viewParam) {
      trackMaterialSeleccionado(viewParam);
    }
  }, [currentView, viewParam]);

  // Memoize handleNavigate callback to prevent unnecessary re-renders of React.memo components
  const handleNavigate = useCallback((view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleOrderPlaced = useCallback((orderId: string, totalAmountARS: number = 0, count: number = 1) => {
    trackPedidoExitoso(orderId, totalAmountARS, count);
    handleNavigate("pedidos", orderId);
  }, [handleNavigate]);

  return (
    <SEOProvider currentView={currentView} viewParam={viewParam}>
      <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors selection:bg-primary selection:text-white antialiased w-full max-w-full overflow-x-hidden">
        {/* ACCESSIBILITY: SKIP LINK */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-primary text-white text-xs rounded-lg focus:outline-none focus:ring-2"
        >
          Saltar al contenido principal
        </a>

        {/* GLOBAL HEADER */}
      <Header currentView={currentView} onNavigate={handleNavigate} />

      {/* MAIN VIEW AREA WITH FRAMER MOTION TRANSITIONS */}
      <main
        id="main-content"
        role="main"
        className="flex-1 focus:outline-none w-full max-w-full overflow-x-hidden"
        tabIndex={-1}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex-1"
          >
            {currentView === "home" && <HomeView onNavigate={handleNavigate} />}
            {currentView === "cotizador" && (
              <CotizadorView
                initialMaterialId={viewParam}
                onNavigate={handleNavigate}
              />
            )}
            {currentView === "poster" && (
              <PosterCreatorView
                initialPrompt={viewParam}
                onNavigate={handleNavigate}
              />
            )}
            {currentView === "materiales" && (
              <MaterialsCatalogView onNavigate={handleNavigate} />
            )}
            {currentView === "material-detail" && (
              <MaterialDetailView
                materialId={viewParam}
                onNavigate={handleNavigate}
              />
            )}
            {currentView === "mayoristas" && (
              <WholesaleView onNavigate={handleNavigate} />
            )}
            {currentView === "diccionario" && (
              <DictionaryView
                initialSlug={viewParam}
                onNavigate={handleNavigate}
              />
            )}
            {currentView === "portfolio" && (
              <PortfolioView onNavigate={handleNavigate} />
            )}
            {currentView === "blog" && <BlogView onNavigate={handleNavigate} />}
            {currentView === "pedidos" && (
              <ProtectedRoute onNavigate={handleNavigate}>
                <OrdersView onNavigate={handleNavigate} />
              </ProtectedRoute>
            )}
            {currentView === "cuenta" && (
              <ProtectedRoute 
                onNavigate={handleNavigate} 
                defaultMode={viewParam === "register" ? "register" : "login"}
              >
                <OrdersView onNavigate={handleNavigate} />
              </ProtectedRoute>
            )}
            {currentView === "admin" && (
              <ProtectedRoute adminOnly onNavigate={handleNavigate}>
                <AdminPanelView onNavigate={handleNavigate} />
              </ProtectedRoute>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* SLIDE-OVER CART DRAWER */}
      <CartDrawer onOrderPlaced={handleOrderPlaced} onNavigate={handleNavigate} />

      {/* REAL-TIME NOTIFICATION TOAST POPUP */}
      <NotificationToast onNavigate={handleNavigate} />

      {/* FLOATING QUICK ACCESS DOCK */}
      <FloatingDock currentView={currentView} onNavigate={handleNavigate} />

      {/* GLOBAL FOOTER */}
      <Footer onNavigate={handleNavigate} />
    </div>
  </SEOProvider>
  );
}
