import React, { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Calculator, Maximize2, X, RefreshCw, FolderOpen, ExternalLink, Eye, ZoomIn, Info, Link2, Check } from "lucide-react";
import { PORTFOLIO_ITEMS } from "../../data/materials";
import { PortfolioSkeletonGrid } from "../ui/Skeleton";
import { OptimizedDriveImage } from "../portfolio/OptimizedDriveImage";

interface PortfolioViewProps {
  onNavigate: (view: string, param?: string) => void;
}

/**
 * Extrae el ID limpio de una carpeta de Google Drive a partir de una URL completa o de un ID directo.
 */
export function extractDriveFolderId(input: string): string {
  if (!input) return "16tym66aJOZSc2Ds9tRWazmE-se-GB88s";
  const trimmed = input.trim();
  const folderMatch = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) return folderMatch[1];
  const queryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (queryMatch && queryMatch[1]) return queryMatch[1];
  return trimmed;
}

/**
 * Recupera dinámicamente los enlaces públicos de las imágenes desde la carpeta de Drive proporcionada
 */
export async function fetchPublicDriveImages(folderIdOrUrl: string) {
  const folderId = extractDriveFolderId(folderIdOrUrl);
  try {
    // 1. Intentar endpoint de sincronización y catálogo dinámico
    const resp = await fetch("/api/portfolio?folderId=" + encodeURIComponent(folderId));
    if (resp.ok) {
      const data = await resp.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        const parsedItems = data.items.map((item: any, idx: number) => {
          const fileId = item.driveFileId || item.id;
          return {
            ...item,
            id: item.id || `drive-${fileId || idx}`,
            driveFileId: fileId,
            // Enlaces públicos optimizados para renderizado directo
            image: fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200` : item.image,
            thumbnailUrl: fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w400` : item.thumbnailUrl,
            publicViewUrl: fileId ? `https://drive.google.com/uc?export=view&id=${fileId}` : undefined,
            driveUrl: fileId ? `https://drive.google.com/file/d/${fileId}/view` : undefined,
          };
        });
        return {
          success: true,
          items: parsedItems,
          folderId: data.folderId || folderId,
          lastSync: data.lastSync || new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn("fetchPublicDriveImages warning:", err);
  }

  // Fallback con items base garantizados
  return {
    success: false,
    items: PORTFOLIO_ITEMS,
    folderId,
    lastSync: new Date().toISOString(),
  };
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<any[]>(PORTFOLIO_ITEMS);
  const [driveFolderInput, setDriveFolderInput] = useState<string>("16tym66aJOZSc2Ds9tRWazmE-se-GB88s");
  const [activeDriveFolderId, setActiveDriveFolderId] = useState<string>("16tym66aJOZSc2Ds9tRWazmE-se-GB88s");
  const [isSyncingDrive, setIsSyncingDrive] = useState<boolean>(false);
  const [lastSyncedText, setLastSyncedText] = useState<string>("Conectado a Google Drive");
  const [showFolderCustomizer, setShowFolderCustomizer] = useState<boolean>(false);

  // Carga inicial dinámica
  const handleLoadDriveImages = async (folderTarget: string) => {
    setIsLoading(true);
    const cleanId = extractDriveFolderId(folderTarget);
    setActiveDriveFolderId(cleanId);

    const result = await fetchPublicDriveImages(cleanId);
    if (result.items && result.items.length > 0) {
      // Unir items de Drive con base de portfolio
      const driveList = result.items;
      const merged = [
        ...driveList,
        ...PORTFOLIO_ITEMS.filter((pi) => !driveList.some((di: any) => di.title === pi.title)),
      ];
      setPortfolioItems(merged);
      if (result.lastSync) {
        setLastSyncedText(
          `Sincronizado: ${new Date(result.lastSync).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })} hs`
        );
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    handleLoadDriveImages(activeDriveFolderId);
  }, []);

  const handleManualDriveSync = async () => {
    setIsSyncingDrive(true);
    try {
      const resp = await fetch("/api/admin/drive/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: activeDriveFolderId }),
      });
      if (resp.ok) {
        await handleLoadDriveImages(activeDriveFolderId);
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
    }, 150);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  const categories = [
    { id: "all", label: "🔥 Todos los Trabajos" },
    { id: "lonas", label: "🏢 Lonas & Marquesinas" },
    { id: "vinilos", label: "🏪 Vidrieras & Vinilos" },
    { id: "rigidos", label: "📐 Rígidos & Placas PVC" },
    { id: "portabanners", label: "🎪 Stands & Eventos" },
  ];

  const filteredItems = portfolioItems.filter((item) => {
    if (selectedCategory === "all") return true;
    const cat = (item.category || "").toLowerCase();
    return cat.includes(selectedCategory) || selectedCategory.includes(cat);
  });

  return (
    <div className="container-safe pt-28 sm:pt-32 lg:pt-36 pb-36 sm:pb-44 space-y-10 sm:space-y-12 font-sans">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-brick)]/10 border border-[var(--brand-brick)]/25 text-[var(--brand-brick)] text-xs font-semibold">
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Sincronización en Vivo con Google Drive</span>
        </div>
        <h1 className="text-canonical-h1">
          Portfolio de Cartelería & Gigantografías
        </h1>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Fotos reales de producción y montaje de nuestro taller. Cada trabajo subido a la carpeta pública de Drive se recupera dinámicamente con lazy-loading optimizado.
        </p>

        {/* DRIVE STATUS BAR & SYNC TRIGGER */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="text-[var(--text-secondary)] bg-[var(--bg-surface)] px-3 py-1.5 rounded-[7px] border border-[var(--border-subtle)] flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Carpeta: <strong className="text-[var(--text-primary)] font-mono">{activeDriveFolderId}</strong>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold text-[11px]">
              {portfolioItems.length} fotos
            </span>
          </span>

          <button
            onClick={handleManualDriveSync}
            disabled={isSyncingDrive}
            className="px-3.5 py-1.5 rounded-[7px] bg-[var(--brand-brick)]/20 hover:bg-[var(--brand-brick)]/30 text-[var(--brand-brick)] border border-[var(--brand-brick)]/40 font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Refrescar fotos desde la carpeta de Google Drive"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDrive ? "animate-spin" : ""}`} />
            <span>{isSyncingDrive ? "Sincronizando..." : "Sincronizar Fotos"}</span>
          </button>

          <button
            onClick={() => setShowFolderCustomizer(!showFolderCustomizer)}
            className="px-3 py-1.5 rounded-[7px] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5 text-primary" />
            <span>Cambiar Carpeta Drive</span>
          </button>

          <a
            href={`https://drive.google.com/drive/folders/${activeDriveFolderId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-[7px] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center gap-1 transition-all"
          >
            <span>Ver en Drive</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* FOLDER ID INPUT CUSTOMIZER (TOGGLE) */}
        {showFolderCustomizer && (
          <div className="mt-4 p-4 max-w-xl mx-auto rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg space-y-3 text-left">
            <div className="flex items-center justify-between">
              <label htmlFor="drive-folder-input" className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-primary" />
                <span>Enlace o ID de Carpeta Pública de Drive</span>
              </label>
              <button
                onClick={() => setShowFolderCustomizer(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs"
              >
                Cerrar
              </button>
            </div>
            <div className="flex gap-2">
              <input
                id="drive-folder-input"
                type="text"
                value={driveFolderInput}
                onChange={(e) => setDriveFolderInput(e.target.value)}
                placeholder="ej: https://drive.google.com/drive/folders/... o 16tym66aJOZSc2Ds9tRWazmE-se-GB88s"
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
              <button
                onClick={() => {
                  handleLoadDriveImages(driveFolderInput);
                  setShowFolderCustomizer(false);
                }}
                className="px-3.5 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:brightness-105 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Cargar Fotos</span>
              </button>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              La carpeta debe estar configurada como pública ("Cualquier persona con el enlace puede ver"). Las fotos se recuperan dinámicamente con lazy-loading y esqueletos de precarga.
            </p>
          </div>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap justify-center gap-2" role="tablist">
        {categories.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={selectedCategory === cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`ideogram-pill text-xs px-4 py-2 cursor-pointer ${
              selectedCategory === cat.id ? "active" : ""
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* GALLERY GRID OR SKELETON */}
      {isLoading ? (
        <PortfolioSkeletonGrid count={8} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="ideogram-card overflow-hidden group flex flex-col justify-between border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--brand-brick)]/40 transition-all duration-300"
            >
              <div>
                <div 
                  className="h-64 overflow-hidden relative bg-[var(--bg-surface-subtle)] cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  {/* COMPONENTE OPTIMIZADO CON LAZY-LOADING Y ESQUELETOS DE CARGA */}
                  <OptimizedDriveImage
                    src={item.image}
                    alt={item.title}
                    driveFileId={item.driveFileId}
                    thumbnailUrl={item.thumbnailUrl}
                    className="group-hover:scale-105 transition-transform duration-500"
                  />

                  <span className="absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full bg-black/75 text-white font-mono border border-white/15 backdrop-blur-md z-20">
                    {item.tag || "Trabajo Taller"}
                  </span>

                  {/* HOVER OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 space-y-2 z-20">
                    <p className="text-xs text-white font-medium line-clamp-2">
                      {item.title} · {item.material}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="py-2 px-3 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center justify-center gap-1.5 backdrop-blur-md transition-all cursor-pointer border border-white/25 shadow-sm"
                        title="Ver foto completa en alta resolución"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Ver Foto</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate("poster", encodeURIComponent(item.title + " " + item.material));
                        }}
                        className="flex-1 py-2 rounded-full bg-[var(--brand-brick)] hover:bg-[#FF6B38] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Remix IA</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[10px] uppercase text-[var(--brand-brick)] tracking-wider block font-semibold">
                    {item.client}
                  </span>
                  <h3 className="text-canonical-h3">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    <span>Sustrato: </span>
                    <span className="text-[var(--text-primary)] font-medium">{item.material}</span>
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => onNavigate("cotizador", item.category || "lonas")}
                  className="w-full py-2.5 rounded-full bg-[var(--bg-surface-subtle)] hover:bg-[var(--brand-brick)] hover:text-white text-xs text-[var(--text-primary)] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Cotizar trabajo similar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULLSCREEN PREVIEW MODAL */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[var(--bg-surface)] rounded-2xl overflow-hidden border border-white/10 shadow-2xl space-y-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider font-mono">
                  {selectedItem.client}
                </span>
                <h2 className="text-canonical-h2">{selectedItem.title}</h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-full hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-[50vh] sm:h-[60vh] rounded-xl overflow-hidden bg-black/20 relative flex items-center justify-center">
              <OptimizedDriveImage
                src={selectedItem.image}
                alt={selectedItem.title}
                driveFileId={selectedItem.driveFileId}
                thumbnailUrl={selectedItem.thumbnailUrl}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-[var(--text-secondary)] space-y-1">
                <p>
                  <strong className="text-[var(--text-primary)]">Material:</strong> {selectedItem.material}
                </p>
                <p>
                  <strong className="text-[var(--text-primary)]">Categoría:</strong> {selectedItem.category}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {selectedItem.driveFileId && (
                  <a
                    href={`https://drive.google.com/file/d/${selectedItem.driveFileId}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-subtle)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir en Google Drive</span>
                  </a>
                )}
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    onNavigate("cotizador", selectedItem.category || "lonas");
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:brightness-105 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Cotizar este Formato</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
