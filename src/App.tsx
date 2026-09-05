import React, { useState, useEffect } from "react";
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
import { useThemeStore } from "./store/useThemeStore";
import { useI18nStore } from "./store/useI18nStore";
import { getLocalBusinessSchema } from "./utils/schema";

export default function App() {
  const [currentView, setCurrentView] = useState<string>("home");
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const { initTheme } = useThemeStore();
  const { initI18n } = useI18nStore();

  // Initialize theme and i18n language persistence on mount
  useEffect(() => {
    initTheme();
    initI18n();
  }, [initTheme, initI18n]);

  // Inject JSON-LD Schema for Local SEO
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(getLocalBusinessSchema());
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Memoize handleNavigate callback to prevent unnecessary re-renders of React.memo components
  const handleNavigate = React.useCallback((view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleOrderPlaced = React.useCallback((orderId: string) => {
    handleNavigate("pedidos", orderId);
  }, [handleNavigate]);

  return (
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

      {/* MAIN VIEW AREA */}
      <main
        id="main-content"
        role="main"
        className="flex-1 focus:outline-none w-full max-w-full overflow-x-hidden"
        tabIndex={-1}
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
          <OrdersView onNavigate={handleNavigate} />
        )}
        {currentView === "cuenta" && (
          <OrdersView onNavigate={handleNavigate} />
        )}
        {currentView === "admin" && (
          <AdminPanelView onNavigate={handleNavigate} />
        )}
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
  );
}
