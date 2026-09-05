import React, { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Calculator, Maximize2, X, Check, Copy, RefreshCw, FolderOpen, ExternalLink } from "lucide-react";
import { PORTFOLIO_ITEMS } from "../../data/materials";
import { PortfolioSkeletonGrid } from "../ui/Skeleton";

interface PortfolioViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<any[]>(PORTFOLIO_ITEMS);
  const [driveFolderId, setDriveFolderId] = useState<string>("16tym66aJOZSc2Ds9tRWazmE-se-GB88s");
  const [isSyncingDrive, setIsSyncingDrive] = useState<boolean>(false);
  const [lastSyncedText, setLastSyncedText] = useState<string>("Conectado a Google Drive");

  // Fetch portfolio items from server (which merges Google Drive folder items)
  const loadPortfolioFromApi = async () => {
    try {
      const resp = await fetch("/api/portfolio");
      if (resp.ok) {
        const data = await resp.json();
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          // Merge drive items with curated base items
          const driveList = data.items;
          const merged = [...driveList, ...PORTFOLIO_ITEMS.filter(pi => !driveList.some((di: any) => di.title === pi.title))];
          setPortfolioItems(merged);
          if (data.folderId) setDriveFolderId(data.folderId);
          if (data.lastSync) {
            setLastSyncedText(`Sincronizado: ${new Date(data.lastSync).toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' })} hs`);
          }
        }
      }
    } catch (err) {
      console.error("Error loading portfolio items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolioFromApi();
  }, []);

  const handleManualDriveSync = async () => {
    setIsSyncingDrive(true);
    try {
      const resp = await fetch("/api/admin/drive/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: driveFolderId })
      });
      if (resp.ok) {
        await loadPortfolioFromApi();
      }
    } catch (err) {
      console.error("Error syncing Drive:", err);
    } finally {
      setIsSyncingDrive(false);
    }
  };

  // Transition loading state for category filter
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  const categories = [
    { id: "all", label: "🔥 Todos los Trabajos" },
    { id: "lonas", label: "🏢 Lonas & Marquesinas" },
    { id: "vinilos", label: "🏪 Vidrieras & Vinilos" },
    { id: "rigidos", label: "📐 Rígidos & Placas PVC" },
    { id: "portabanners", label: "🎪 Stands & Eventos" },
  ];

  const filteredItems = portfolioItems.filter(
    (item) => {
      if (selectedCategory === "all") return true;
      const cat = (item.category || "").toLowerCase();
      return cat.includes(selectedCategory) || selectedCategory.includes(cat);
    }
  );

  return (
    <div className="section-container pt-28 sm:pt-32 lg:pt-36 pb-36 sm:pb-44 space-y-12 sm:space-y-16 max-w-7xl font-sans">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5520]/10 border border-[#FF5520]/20 text-[#FF5520] text-xs font-semibold">
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Sincronización en Vivo con Google Drive</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Portfolio de Cartelería & Gigantografías
        </h1>
        <p className="text-sm text-[#949BA4] leading-relaxed">
          Fotos reales de producción y montaje de nuestro taller. Cada trabajo que subimos a nuestra carpeta de Drive se actualiza en este catálogo automáticamente.
        </p>

        {/* DRIVE STATUS BAR & SYNC TRIGGER */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="text-[#949BA4] bg-[#181A22] px-3 py-1.5 rounded-[7px] border border-white/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Carpeta: <strong className="text-white font-mono">{driveFolderId}</strong></span>
          </span>
          <button
            onClick={handleManualDriveSync}
            disabled={isSyncingDrive}
            className="px-3.5 py-1.5 rounded-[7px] bg-[#FF5520]/20 hover:bg-[#FF5520]/30 text-[#FF5520] border border-[#FF5520]/40 font-medium flex items-center gap-1.5 transition-all"
            title="Refrescar fotos desde la carpeta de Google Drive"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDrive ? "animate-spin" : ""}`} />
            <span>{isSyncingDrive ? "Sincronizando..." : "Sincronizar Fotos Ahora"}</span>
          </button>
          <a
            href={`https://drive.google.com/drive/folders/${driveFolderId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-[7px] bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 flex items-center gap-1 transition-all"
          >
            <span>Ver Carpeta Drive</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap justify-center gap-2" role="tablist">
        {categories.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={selectedCategory === cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`ideogram-pill text-xs px-4 py-2 ${
              selectedCategory === cat.id ? "active" : ""
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* GALLERY GRID OR SKELETON */}
      {isLoading ? (
        <PortfolioSkeletonGrid count={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="ideogram-card overflow-hidden group flex flex-col justify-between"
            >
              <div>
                <div className="h-64 overflow-hidden relative bg-[#181A22]">
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full bg-black/80 text-white font-mono border border-white/10 backdrop-blur-md">
                    {item.tag}
                  </span>

                  {/* HOVER OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D11] via-[#0C0D11]/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 space-y-2">
                    <p className="text-xs text-white font-medium line-clamp-2">
                      {item.title} · {item.material}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate("poster", encodeURIComponent(item.title + " " + item.material))}
                        className="flex-1 py-2 rounded-full bg-[#FF5520] hover:bg-[#FF6B38] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Remix con IA</span>
                      </button>
                      <button
                        onClick={() => onNavigate("cotizador")}
                        className="py-2 px-3 rounded-full bg-white/[0.15] hover:bg-white/[0.25] text-white text-xs font-medium flex items-center justify-center gap-1 backdrop-blur-md transition-all active:scale-95"
                        title="Cotizar en vivo"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[10px] uppercase text-[#FF5520] tracking-wider block font-semibold">
                    {item.client}
                  </span>
                  <h3 className="text-base font-bold text-white line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#949BA4]">
                    <span>Sustrato: </span>
                    <span className="text-white font-medium">{item.material}</span>
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => onNavigate("cotizador")}
                  className="w-full py-2.5 rounded-full bg-white/[0.06] hover:bg-[#FF5520] text-xs text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Cotizar medida personalizada</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
