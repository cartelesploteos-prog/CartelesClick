import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Store,
  RefreshCw,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Zap,
  Calendar,
  Radio,
  Search,
  CheckCircle,
  Activity,
  Layers,
  Flame,
  Bell,
  ChevronRight,
  Play,
  ArrowUpRight,
  Volume2,
  Download,
  FileText,
  ExternalLink,
  Folder,
  FileUp,
  History,
  Check,
  Eye,
  Filter,
  Printer,
} from "lucide-react";
import { collection, onSnapshot, query, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Order } from "../../types";
import { OrderProgressBar } from "../ui/OrderProgressBar";
import { OrdersListSkeleton } from "../ui/Skeleton";
import { generateOrderSheetPdf } from "../../utils/generateQuotePdf";

interface OrdersViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export interface LiveStatusEvent {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName?: string;
  oldStatus?: string;
  newStatus: string;
  timestamp: string;
  isSimulated?: boolean;
}

// Gentle Web Audio API synthesizer chime for real-time order updates
function playStatusChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch (e) {
    // Audio autoplay restrictions or headless environment
  }
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [paymentBanner, setPaymentBanner] = useState<{ status: string; orderId: string } | null>(null);
  const [simulatingWebhookFor, setSimulatingWebhookFor] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [lastLiveSyncTime, setLastLiveSyncTime] = useState<string | null>(null);

  // Live status change tracking & notifications
  const [liveEvents, setLiveEvents] = useState<LiveStatusEvent[]>([]);
  const [activeToast, setActiveToast] = useState<LiveStatusEvent | null>(null);
  const [isAdvancingStatus, setIsAdvancingStatus] = useState<string | null>(null);
  const [historyFilterTab, setHistoryFilterTab] = useState<"all" | "in_production" | "delivered" | "pending">("all");
  const [isGeneratingPdfForOrder, setIsGeneratingPdfForOrder] = useState<string | null>(null);
  const previousOrdersMap = useRef<Map<string, Order>>(new Map());
  const isFirstLoad = useRef<boolean>(true);

  // Helper to download Order Sheet PDF
  const handleDownloadOrderSheet = (order: Order) => {
    setIsGeneratingPdfForOrder(order.id);
    try {
      generateOrderSheetPdf(order);
    } catch (e) {
      console.error("Error generating order sheet PDF:", e);
    } finally {
      setIsGeneratingPdfForOrder(null);
    }
  };

  // Filtered orders list based on search and selected tab
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Tab filter
      if (historyFilterTab === "in_production") {
        if (
          order.status !== "en_produccion" &&
          order.status !== "terminaciones" &&
          order.status !== "despachado"
        ) {
          return false;
        }
      } else if (historyFilterTab === "delivered") {
        if (order.status !== "entregado") {
          return false;
        }
      } else if (historyFilterTab === "pending") {
        if (order.paymentStatus !== "pendiente" && order.status !== "pendiente") {
          return false;
        }
      }

      // 2. Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchNumber = (order.orderNumber || order.id).toLowerCase().includes(q);
      const matchCustomer = (order.customerName || "").toLowerCase().includes(q);
      const matchEmail = (order.customerEmail || "").toLowerCase().includes(q);
      const matchItems = order.items?.some((it) =>
        (it.materialName || "").toLowerCase().includes(q)
      );
      return matchNumber || matchCustomer || matchEmail || matchItems;
    });
  }, [orders, historyFilterTab, searchQuery]);

  // Helper to format human-readable status in Spanish
  const getStatusLabelSpanish = (status: Order["status"] | string, paymentStatus?: string): string => {
    if (paymentStatus === "pendiente" || status === "pendiente") return "Pendiente de Pago";
    switch (status) {
      case "en_produccion":
        return "En Impresión / Cama Plana UV";
      case "terminaciones":
        return "Confección & Terminaciones";
      case "despachado":
        return "Despachado / En Encomienda";
      case "entregado":
        return "Entregado & Finalizado";
      default:
        return String(status);
    }
  };

  // Fallback REST fetch to ensure all backend orders are seeded
  const fetchOrdersRest = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        if (data && data.orders && data.orders.length > 0) {
          setOrders((prev) => {
            const map = new Map<string, Order>();
            prev.forEach((o) => map.set(o.id, o));
            data.orders.forEach((o: Order) => {
              if (!map.has(o.id)) map.set(o.id, o);
            });
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        }
      }
    } catch (e) {
      console.warn("Fetch REST fallback notification:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time Firestore Listener with state change detection & notification trigger
  useEffect(() => {
    setIsLoading(true);
    let unsubscribe: (() => void) | undefined;

    try {
      const ordersCol = collection(db, "orders");
      unsubscribe = onSnapshot(
        ordersCol,
        (snapshot) => {
          setIsLiveConnected(true);
          const nowStr = new Date().toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          setLastLiveSyncTime(nowStr);

          if (!snapshot.empty) {
            const firestoreOrders: Order[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Order;
              const orderObj: Order = {
                ...data,
                id: docSnap.id || data.id,
              };
              firestoreOrders.push(orderObj);

              // Detect status transition if not first load
              if (!isFirstLoad.current) {
                const prev = previousOrdersMap.current.get(orderObj.id);
                if (prev && prev.status !== orderObj.status) {
                  const event: LiveStatusEvent = {
                    id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                    orderId: orderObj.id,
                    orderNumber: orderObj.orderNumber,
                    customerName: orderObj.customerName,
                    oldStatus: prev.status,
                    newStatus: orderObj.status,
                    timestamp: nowStr,
                  };
                  setLiveEvents((prevEvts) => [event, ...prevEvts.slice(0, 19)]);
                  setActiveToast(event);
                  playStatusChime();
                }
              }
            });

            // Update ref
            const newMap = new Map<string, Order>();
            firestoreOrders.forEach((o) => newMap.set(o.id, o));
            previousOrdersMap.current = newMap;
            isFirstLoad.current = false;

            // Sort descending by creation date
            firestoreOrders.sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            setOrders(firestoreOrders);
          } else {
            fetchOrdersRest();
          }
          setIsLoading(false);
        },
        (error) => {
          console.warn("Firestore real-time listener error, fallback to REST:", error);
          setIsLiveConnected(false);
          fetchOrdersRest();
        }
      );
    } catch (err) {
      console.warn("Error initializing Firestore onSnapshot listener:", err);
      setIsLiveConnected(false);
      fetchOrdersRest();
    }

    // Catch URL query parameters from Mercado Pago redirect back_urls
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment_status");
    const orderId = urlParams.get("order_id");

    if (paymentStatus && orderId) {
      setPaymentBanner({ status: paymentStatus, orderId });
      if (paymentStatus === "approved") {
        fetch("/api/mercadopago/simulate-webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, status: "approved" }),
        }).then(() => fetchOrdersRest());
      }
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Advance order status (for real-time workshop demonstration)
  const handleAdvanceOrderStatus = async (order: Order) => {
    setIsAdvancingStatus(order.id);
    let nextStatus: Order["status"] = "en_produccion";
    if (order.status === "pendiente") nextStatus = "en_produccion";
    else if (order.status === "en_produccion") nextStatus = "terminaciones";
    else if (order.status === "terminaciones") nextStatus = "despachado";
    else if (order.status === "despachado") nextStatus = "entregado";
    else if (order.status === "entregado") nextStatus = "en_produccion";

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const nowStr = new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // Update local state and trigger live notification
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus, paymentStatus: "acreditado" } : o))
      );

      if (trackedOrder && trackedOrder.id === order.id) {
        setTrackedOrder((prev) => (prev ? { ...prev, status: nextStatus, paymentStatus: "acreditado" } : null));
      }

      const event: LiveStatusEvent = {
        id: `event-${Date.now()}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        oldStatus: order.status,
        newStatus: nextStatus,
        timestamp: nowStr,
        isSimulated: true,
      };

      setLiveEvents((prevEvts) => [event, ...prevEvts.slice(0, 19)]);
      setActiveToast(event);
      playStatusChime();
    } catch (e) {
      console.error("Error advancing order status:", e);
    } finally {
      setIsAdvancingStatus(null);
    }
  };

  const handleTrackOrder = async () => {
    const queryTerm = searchQuery.trim().toLowerCase();
    if (!queryTerm) return;
    setIsTracking(true);
    setTrackError(null);
    setTrackedOrder(null);

    // 1. Try finding in current real-time state first
    const foundLocal = orders.find(
      (o) =>
        o.id.toLowerCase() === queryTerm ||
        o.orderNumber.toLowerCase() === queryTerm ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(queryTerm))
    );

    if (foundLocal) {
      setTrackedOrder(foundLocal);
      setIsTracking(false);
      return;
    }

    // 2. Query Firestore directly by Document ID
    try {
      const docRef = doc(db, "orders", searchQuery.trim());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const orderData = { ...docSnap.data(), id: docSnap.id } as Order;
        setTrackedOrder(orderData);
        setIsTracking(false);
        return;
      }
    } catch (e) {
      console.warn("Firestore direct lookup error:", e);
    }

    // 3. Fallback to REST API
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(searchQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setTrackedOrder(data.order);
      } else {
        setTrackError(`No se encontró ningún pedido para "${searchQuery}". Verificá el código o email ingresado.`);
      }
    } catch (e) {
      setTrackError("Error de conexión al consultar el estado del pedido.");
    } finally {
      setIsTracking(false);
    }
  };

  const handleSimulateWebhook = async (orderId: string) => {
    setSimulatingWebhookFor(orderId);
    try {
      const res = await fetch("/api/mercadopago/simulate-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: "approved" }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrdersRest();
      }
    } catch (err) {
      console.error("Error al simular webhook:", err);
    } finally {
      setSimulatingWebhookFor(null);
    }
  };

  const getProductionStepPercent = (status: Order["status"], paymentStatus?: string) => {
    if (paymentStatus === "pendiente" || status === "pendiente") return 15;
    switch (status) {
      case "en_produccion":
        return 45;
      case "terminaciones":
        return 75;
      case "despachado":
        return 90;
      case "entregado":
        return 100;
      default:
        return 20;
    }
  };

  const getStatusBadge = (status: Order["status"], paymentStatus?: string) => {
    if (paymentStatus === "pendiente" || status === "pendiente") {
      return (
        <span className="px-2.5 py-1 rounded-[7px] text-xs font-sans font-medium bg-amber-500/10 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" strokeWidth={1.85} />
          Pendiente de Pago
        </span>
      );
    }
    switch (status) {
      case "en_produccion":
        return (
          <span className="px-2.5 py-1 rounded-[7px] text-xs font-sans font-medium bg-primary text-white flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
            En Impresión / Taller
          </span>
        );
      case "terminaciones":
        return (
          <span className="px-2.5 py-1 rounded-[7px] text-xs font-sans font-medium bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" strokeWidth={1.85} />
            Confección & Refuerzos
          </span>
        );
      case "despachado":
        return (
          <span className="px-2.5 py-1 rounded-[7px] text-xs font-sans font-semibold bg-accent text-black flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" strokeWidth={1.85} />
            Despachado / En Viaje
          </span>
        );
      case "entregado":
        return (
          <span className="px-2.5 py-1 rounded-[7px] text-xs font-sans font-medium bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.85} />
            Entregado con Éxito
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-[7px] text-xs font-sans font-medium bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
            Recibido en Taller
          </span>
        );
    }
  };

  return (
    <div className="section-container pt-28 sm:pt-32 lg:pt-36 pb-36 sm:pb-44 space-y-10 sm:space-y-14 max-w-5xl font-sans">
      {/* LIVE EVENT TOAST NOTIFICATION */}
      {activeToast && (
        <div className="fixed bottom-24 right-4 sm:right-8 z-50 max-w-sm p-4 rounded-xl bg-[var(--bg-surface)] border-2 border-primary shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-primary uppercase">
                  Actualización en Vivo
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                  {activeToast.timestamp}
                </span>
              </div>
              <p className="text-xs font-bold text-[var(--text-primary)]">
                Orden #{activeToast.orderNumber}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Avanzó a: <strong className="text-primary">{getStatusLabelSpanish(activeToast.newStatus as any)}</strong>
              </p>
              <div className="flex items-center gap-2 pt-1.5">
                <button
                  onClick={() => {
                    setSearchQuery(activeToast.orderNumber);
                    handleTrackOrder();
                    setActiveToast(null);
                  }}
                  className="px-2.5 py-1 rounded bg-primary text-white text-[11px] font-medium flex items-center gap-1 hover:brightness-105"
                >
                  <Search className="w-3 h-3" />
                  <span>Ver en Rastreador</span>
                </button>
                <button
                  onClick={() => setActiveToast(null)}
                  className="px-2 py-1 rounded bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] text-[11px] hover:text-[var(--text-primary)]"
                >
                  Descartar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MERCADO PAGO RETURN BANNER NOTIFICATION */}
      {paymentBanner && (
        <div
          className={`p-4 rounded-[7px] border flex items-center justify-between text-xs sm:text-sm font-medium ${
            paymentBanner.status === "approved"
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/50"
              : "bg-red-950/40 text-red-300 border-red-800/50"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {paymentBanner.status === "approved" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <div>
              <p className="font-bold">
                {paymentBanner.status === "approved"
                  ? "¡Pago acreditado por Mercado Pago!"
                  : "Pago no completado o rechazado"}
              </p>
              <p className="text-xs opacity-90">
                {paymentBanner.status === "approved"
                  ? `El pedido #${paymentBanner.orderId} fue verificado vía Webhook y pasó inmediatamente a cola de producción.`
                  : `El pago para el pedido #${paymentBanner.orderId} no fue procesado. Podés intentar nuevamente.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setPaymentBanner(null)}
            className="text-xs px-2.5 py-1 rounded bg-black/30 hover:bg-black/50"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* HEADER WITH REAL-TIME FIRESTORE STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-heading text-2xl sm:text-3xl text-[var(--text-primary)] font-medium">
              {t("orders_title")}
            </h1>
            {/* Real-time sync badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>{isLiveConnected ? "Firestore Live Tracking" : "Sincronizado"}</span>
              {lastLiveSyncTime && (
                <span className="text-[10px] text-emerald-400/70 font-mono">({lastLiveSyncTime})</span>
              )}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-sans font-normal">
            Monitoreo en tiempo real de cola de impresión, confección y despacho en taller.
          </p>
        </div>
        <button
          onClick={fetchOrdersRest}
          className="px-4 py-2 rounded-[7px] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] flex items-center gap-1.5 transition-colors font-sans font-medium"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          <span>Actualizar</span>
        </button>
      </div>

      {/* LIVE WORKSHOP RADAR FEED (IF EVENTS OCCURRED) */}
      {liveEvents.length > 0 && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-[var(--bg-surface)] to-[var(--bg-surface-subtle)] border border-primary/30 space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-primary" />
                Historial de Cambios en Vivo del Taller ({liveEvents.length})
              </h3>
            </div>
            <button
              onClick={() => setLiveEvents([])}
              className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Limpiar radar
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {liveEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => {
                  setSearchQuery(evt.orderNumber);
                  handleTrackOrder();
                }}
                className="p-2.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border-subtle)] hover:border-primary cursor-pointer transition-all flex items-center justify-between text-xs group"
              >
                <div className="space-y-0.5 truncate mr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-primary text-[11px]">
                      #{evt.orderNumber}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">({evt.timestamp})</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-primary)] font-medium truncate">
                    {getStatusLabelSpanish(evt.newStatus as any)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRACK MY ORDER SEARCH BOX */}
      <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-primary" />
            <span>Rastreador de Producción en Vivo</span>
          </label>
          <span className="text-[11px] text-[var(--text-secondary)]">Búsqueda por ID, número o email</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTrackOrder()}
            placeholder="Ej: CC-2026-12345 o tu@email.com"
            className="flex-1 px-4 py-2.5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-page)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary font-mono"
          />
          <button 
            onClick={handleTrackOrder}
            disabled={isTracking}
            className="px-5 py-2.5 rounded-[7px] bg-primary text-white text-xs font-medium hover:brightness-105 disabled:opacity-50 flex items-center gap-1.5 transition-all"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isTracking ? "Rastreando..." : "Rastrear"}</span>
          </button>
        </div>
        {trackError && (
          <div className="p-3 rounded-[5px] bg-red-950/30 border border-red-800/40 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{trackError}</span>
          </div>
        )}
      </div>

      {/* DETAILED TRACKED ORDER SPOTLIGHT CARD */}
      {trackedOrder && (
        <div className="p-6 rounded-[7px] bg-[var(--bg-surface)] border-2 border-primary/50 space-y-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
          {/* PRINT-ONLY OFFICIAL HEADER */}
          <div className="print-only-header">
            <div className="flex items-center justify-between pb-3 border-b-2 border-primary">
              <div>
                <h1 className="text-xl font-bold font-heading text-black tracking-tight">
                  CARTELES.CLICK · FICHA TÉCNICA Y REMITO DE TALLER
                </h1>
                <p className="text-xs text-gray-600">
                  Gran Formato · Ploteo & Cama Plana UV · carteles.ploteos@gmail.com
                </p>
              </div>
              <div className="text-right text-xs">
                <span className="font-bold block text-primary font-mono">
                  ORDEN #{trackedOrder.orderNumber || trackedOrder.id}
                </span>
                <span className="text-gray-500 font-mono">
                  {new Date(trackedOrder.createdAt).toLocaleDateString("es-AR")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-primary font-bold">
                  Seguimiento Activo de Taller
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-mono font-bold no-print">
                  LIVE FIRESTORE
                </span>
              </div>
              <h3 className="font-heading text-lg text-[var(--text-primary)] font-bold mt-0.5">
                Orden #{trackedOrder.orderNumber || trackedOrder.id}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Cliente: {trackedOrder.customerName} ({trackedOrder.customerEmail}) · Creado el{" "}
                {new Date(trackedOrder.createdAt).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(trackedOrder.status, trackedOrder.paymentStatus)}
              <button
                type="button"
                onClick={() => window.print()}
                className="text-xs px-3 py-1.5 rounded-[5px] bg-primary/10 border border-primary/30 text-primary font-bold hover:bg-primary/20 flex items-center gap-1.5 cursor-pointer no-print"
                title="Imprimir ficha de producción o remito de entrega"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ficha</span>
              </button>
              <button
                onClick={() => setTrackedOrder(null)}
                className="text-xs px-3 py-1.5 rounded-[5px] bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer no-print"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* REAL-TIME PROGRESS BAR GAUGE */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[var(--text-primary)] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" />
                Avance en Línea de Producción
              </span>
              <span className="text-primary font-mono">
                {getProductionStepPercent(trackedOrder.status, trackedOrder.paymentStatus)}% completado
              </span>
            </div>
            <OrderProgressBar status={trackedOrder.status} />
          </div>

          {/* 4 PRODUCTION MILESTONES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div
              className={`p-3 rounded-[7px] border flex flex-col gap-1 ${
                trackedOrder.paymentStatus === "acreditado"
                  ? "bg-accent/15 border-accent text-black dark:text-accent font-medium"
                  : "bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/30 text-amber-800 dark:text-amber-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider opacity-80">Paso 1</span>
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.85} />
              </div>
              <span className="font-semibold text-xs">Acreditación MP</span>
              <span className="text-[10px] opacity-80">
                {trackedOrder.paymentStatus === "acreditado" ? "Confirmado" : "Pendiente"}
              </span>
            </div>

            <div
              className={`p-3 rounded-[7px] border flex flex-col gap-1 ${
                trackedOrder.status === "en_produccion" ||
                trackedOrder.status === "terminaciones" ||
                trackedOrder.status === "despachado" ||
                trackedOrder.status === "entregado"
                  ? "bg-primary text-white border-primary"
                  : "bg-[var(--bg-page)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider opacity-80">Paso 2</span>
                <Clock className="w-3.5 h-3.5" strokeWidth={1.85} />
              </div>
              <span className="font-semibold text-xs">Impresión UV 1440 DPI</span>
              <span className="text-[10px] opacity-80">
                {trackedOrder.status === "en_produccion" ? "En Ploter Activo" : "Cola completada"}
              </span>
            </div>

            <div
              className={`p-3 rounded-[7px] border flex flex-col gap-1 ${
                trackedOrder.status === "terminaciones" ||
                trackedOrder.status === "despachado" ||
                trackedOrder.status === "entregado"
                  ? "bg-primary text-white border-primary"
                  : "bg-[var(--bg-page)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider opacity-80">Paso 3</span>
                <Flame className="w-3.5 h-3.5" strokeWidth={1.85} />
              </div>
              <span className="font-semibold text-xs">Confección & Ojales</span>
              <span className="text-[10px] opacity-80">Termosellado perimetral</span>
            </div>

            <div
              className={`p-3 rounded-[7px] border flex flex-col gap-1 ${
                trackedOrder.status === "despachado" || trackedOrder.status === "entregado"
                  ? "bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-semibold"
                  : "bg-[var(--bg-page)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider opacity-80">Paso 4</span>
                <Truck className="w-3.5 h-3.5" strokeWidth={1.85} />
              </div>
              <span className="font-semibold text-xs">Despacho / Retiro</span>
              <span className="text-[10px] opacity-80">Listo para entrega</span>
            </div>
          </div>
        </div>
      )}

      {/* HISTORIAL DE PEDIDOS HEADER & FILTER TABS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-lg sm:text-xl font-medium text-[var(--text-primary)]">
              Historial de Pedidos & Archivos de Trabajos
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] font-mono font-medium">
              {filteredOrders.length} {filteredOrders.length === 1 ? "trabajo" : "trabajos"}
            </span>
          </div>

          {/* STATUS FILTER PILLS */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] overflow-x-auto">
            <button
              type="button"
              onClick={() => setHistoryFilterTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                historyFilterTab === "all"
                  ? "bg-primary text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilterTab("in_production")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                historyFilterTab === "in_production"
                  ? "bg-primary text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>En Producción ({orders.filter((o) => o.status === "en_produccion" || o.status === "terminaciones" || o.status === "despachado").length})</span>
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilterTab("delivered")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                historyFilterTab === "delivered"
                  ? "bg-primary text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Entregados ({orders.filter((o) => o.status === "entregado").length})</span>
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilterTab("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                historyFilterTab === "pending"
                  ? "bg-primary text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Pendientes ({orders.filter((o) => o.paymentStatus === "pendiente" || o.status === "pendiente").length})
            </button>
          </div>
        </div>
      </div>

      {/* ORDERS LIST */}
      {isLoading ? (
        <OrdersListSkeleton count={3} />
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-none p-8 space-y-4 font-sans">
          <div className="w-16 h-16 rounded-[7px] bg-[var(--bg-surface-subtle)] mx-auto flex items-center justify-center text-[var(--text-secondary)]">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-heading text-base text-[var(--text-primary)] font-medium">
            {orders.length === 0
              ? "No tenés pedidos registrados aún"
              : "No se encontraron trabajos con el filtro seleccionado"}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto font-normal">
            {orders.length === 0
              ? "Configurá tu primer cartel en el cotizador o diseñalo en el creador asistido."
              : "Probá cambiando el filtro o limpiando el texto de búsqueda para ver más órdenes."}
          </p>
          <button
            onClick={() => {
              if (orders.length === 0) {
                onNavigate("cotizador");
              } else {
                setHistoryFilterTab("all");
                setSearchQuery("");
              }
            }}
            className="px-6 py-3 rounded-[7px] bg-primary text-white text-xs transition-colors font-medium cursor-pointer"
          >
            {orders.length === 0 ? "Iniciar Cotización" : "Ver Todos los Pedidos"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-6 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-none space-y-6"
            >
              {/* TOP ROW */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono-num text-xs text-primary font-medium">
                      ORDEN #{order.orderNumber || order.id}
                    </span>
                    {order.priority === "urgente" && (
                      <span className="px-2 py-0.5 rounded-[7px] text-[10px] font-bold bg-red-950 text-red-400 border border-red-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" /> URGENTE
                      </span>
                    )}
                    {order.customerType && (
                      <span className="px-2 py-0.5 rounded-[7px] text-[10px] font-medium bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] capitalize">
                        {order.customerType === "agencia"
                          ? "Agencia"
                          : order.customerType === "imprenta"
                          ? "Imprenta"
                          : order.customerType === "cartelero"
                          ? "Cartelero"
                          : "Cliente Particular"}
                      </span>
                    )}
                    {getStatusBadge(order.status, order.paymentStatus)}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-sans">
                    Fecha:{" "}
                    {new Date(order.createdAt).toLocaleDateString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[var(--text-secondary)] block font-sans">
                    Total Acreditado
                  </span>
                  <span className="font-heading text-xl text-[var(--text-primary)] font-mono-num font-medium">
                    $
                    {(
                      order.totalAmountARS ??
                      (order as any).totalPriceARS ??
                      0
                    ).toLocaleString("es-AR")}{" "}
                    ARS
                  </span>
                </div>
              </div>

              {/* TIMELINE STAGES WITH PROGRESS BAR */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="uppercase tracking-wider text-[var(--text-secondary)] font-heading font-medium">
                    Etapa de Fabricación
                  </span>
                  <span className="font-mono text-[11px] text-primary">
                    {getProductionStepPercent(order.status, order.paymentStatus)}% en línea de montaje
                  </span>
                </div>
                <OrderProgressBar status={order.status} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-sans pt-1">
                  <div
                    className={`p-2.5 rounded-[7px] flex items-center gap-2 font-medium ${
                      order.paymentStatus === "acreditado"
                        ? "bg-accent text-black"
                        : "bg-amber-950/30 text-amber-300 border border-amber-800/40"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      {order.paymentStatus === "acreditado"
                        ? "Mercado Pago OK"
                        : "Pendiente Pago"}
                    </span>
                  </div>
                  <div
                    className={`p-2.5 rounded-[7px] flex items-center gap-2 font-medium ${
                      order.status === "en_produccion" ||
                      order.status === "terminaciones" ||
                      order.status === "despachado" ||
                      order.status === "entregado"
                        ? "bg-primary text-white"
                        : "bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>En Producción</span>
                  </div>
                  <div
                    className={`p-2.5 rounded-[7px] flex items-center gap-2 ${
                      order.status === "terminaciones" ||
                      order.status === "despachado" ||
                      order.status === "entregado"
                        ? "bg-primary text-white font-medium"
                        : "bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                    }`}
                  >
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Confección & Refuerzos</span>
                  </div>
                  <div
                    className={`p-2.5 rounded-[7px] flex items-center gap-2 ${
                      order.status === "despachado" || order.status === "entregado"
                        ? "bg-accent text-black font-medium"
                        : "bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                    }`}
                  >
                    <Truck className="w-4 h-4 shrink-0" />
                    <span>Despacho / Retiro</span>
                  </div>
                </div>
              </div>

              {/* MERCADO PAGO WEBHOOK SIMULATION CARD FOR PENDING ORDERS */}
              {order.paymentStatus === "pendiente" && (
                <div className="p-4 rounded-[7px] bg-amber-950/20 border border-amber-800/40 space-y-3 font-sans">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-xs font-semibold text-amber-200">
                        Acreditación segura con Mercado Pago
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                      Webhook Activo
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    El cálculo del importe ($
                    {order.totalAmountARS.toLocaleString("es-AR")} ARS) fue
                    ejecutado en el servidor. La orden avanzará automáticamente
                    a producción al recibir la confirmación webhook.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => handleSimulateWebhook(order.id)}
                      disabled={simulatingWebhookFor === order.id}
                      className="px-3.5 py-2 rounded-[7px] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {simulatingWebhookFor === order.id
                          ? "Procesando Webhook..."
                          : "Simular Webhook de Pago Acreditado (MP)"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* ITEMS BREAKDOWN & ATTACHED FILES MANAGER */}
              <div className="space-y-3 pt-2">
                <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] block font-heading font-medium">
                  Productos & Archivos de Trabajo ({order.items.length})
                </span>
                <div className="divide-y divide-[var(--border-subtle)]">
                  {order.items.map((item, idx) => {
                    const isAiPoster = Boolean(item.hasAiDesign || (item as any).isAiDesign);
                    const hasAttachment = Boolean(
                      item.fileAttachment ||
                      (item as any).fileUrl ||
                      (item as any).attachedDriveUrl ||
                      isAiPoster
                    );
                    const attachmentName =
                      item.fileAttachment?.name ||
                      (item as any).fileName ||
                      (isAiPoster ? "Póster Asistido por IA (Vector)" : "Archivo de Trabajo");

                    return (
                      <div
                        key={idx}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--text-primary)] font-bold">
                              {item.materialName}
                            </span>
                            {isAiPoster && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-black font-semibold">
                                ✨ Diseño IA
                              </span>
                            )}
                          </div>
                          <p className="text-[var(--text-secondary)]">
                            {item.widthCm && item.heightCm
                              ? `${item.widthCm}×${item.heightCm} cm`
                              : "Unidad estándar"}{" "}
                            · {item.quantity}{" "}
                            {item.quantity === 1 ? "unidad" : "unidades"}
                            {item.finishings && item.finishings.length > 0 && (
                              <span> · Terminaciones: {item.finishings.join(", ")}</span>
                            )}
                          </p>

                          {/* File badge & download link */}
                          <div className="pt-1 flex flex-wrap items-center gap-2">
                            {hasAttachment ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-primary)]">
                                <FileText className="w-3.5 h-3.5 text-primary" />
                                <span className="font-mono truncate max-w-[180px]">
                                  {attachmentName}
                                </span>
                                {(item as any).fileUrl ? (
                                  <a
                                    href={(item as any).fileUrl}
                                    download={attachmentName}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ml-1 p-1 rounded hover:bg-primary/10 text-primary"
                                    title="Descargar archivo original"
                                  >
                                    <Download className="w-3 h-3" />
                                  </a>
                                ) : (item as any).attachedDriveUrl ? (
                                  <a
                                    href={(item as any).attachedDriveUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ml-1 p-1 rounded hover:bg-primary/10 text-primary flex items-center gap-0.5"
                                    title="Abrir en Google Drive"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-emerald-400 font-mono">
                                    ✓ Aprobado
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[var(--text-muted)] italic">
                                Archivo coordinado por Taller Central
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono-num text-[var(--text-primary)] font-bold text-sm block">
                            ${(item.totalPriceARS ?? 0).toLocaleString("es-AR")} ARS
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LOGISTICS DETAILS & QUICK ACTION BAR */}
              <div className="space-y-3">
                <div className="p-4 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
                  <div className="flex items-center gap-3">
                    {order.shippingMethod === "a_despacho" ? (
                      <Truck className="w-5 h-5 text-primary shrink-0" />
                    ) : order.shippingMethod === "instantaneo" ? (
                      <Zap className="w-5 h-5 text-primary shrink-0" />
                    ) : order.shippingMethod === "ronda_semanal" ? (
                      <Calendar className="w-5 h-5 text-primary shrink-0" />
                    ) : (
                      <Store className="w-5 h-5 text-primary shrink-0" />
                    )}
                    <div>
                      <span className="text-[var(--text-primary)] font-medium block">
                        {order.shippingMethod === "a_despacho"
                          ? "A Despacho (Expreso / Interior)"
                          : order.shippingMethod === "instantaneo"
                          ? "Envío Instantáneo (Cadetería/Moto)"
                          : order.shippingMethod === "ronda_semanal"
                          ? "Ronda Semanal Programada"
                          : "Retiro en Taller Central"}
                      </span>
                      <p className="text-[var(--text-secondary)]">
                        Cliente: {order.customerName} ({order.customerEmail})
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[var(--text-primary)] font-mono-num font-medium block">
                      {order.shippingMethod === "a_despacho"
                        ? `Despacho Taller: +$${(order.shippingFeeARS || 4000).toLocaleString("es-AR")} ARS`
                        : order.shippingMethod === "instantaneo"
                        ? "A coordinar al recibir"
                        : "Sin cargo de despacho"}
                    </span>
                    <div className="flex items-center sm:justify-end gap-1 text-[10px] text-emerald-400 mt-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Mercado Pago Webhook</span>
                    </div>
                  </div>
                </div>

                {/* WORKSHOP HISTORIC ACTIONS & WORK ORDER PDF */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--border-subtle)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setSearchQuery(order.orderNumber || order.id);
                        handleTrackOrder();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-3 py-1.5 rounded-[6px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] hover:border-primary text-[11px] font-medium text-[var(--text-primary)] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5 text-primary" />
                      <span>Rastrear en Tiempo Real</span>
                    </button>

                    <button
                      type="button"
                      id={`btn-download-ordersheet-${order.id}`}
                      onClick={() => handleDownloadOrderSheet(order)}
                      disabled={isGeneratingPdfForOrder === order.id}
                      className="px-3 py-1.5 rounded-[6px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      title="Descargar comprobante oficial y ficha técnica de taller en formato PDF"
                    >
                      {isGeneratingPdfForOrder === order.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-primary" />
                      )}
                      <span>
                        {isGeneratingPdfForOrder === order.id
                          ? "Generando PDF..."
                          : "Descargar Ficha / Comprobante PDF"}
                      </span>
                    </button>

                    <button
                      type="button"
                      id={`btn-print-order-${order.id}`}
                      onClick={() => {
                        setTrackedOrder(order);
                        setTimeout(() => {
                          window.print();
                        }, 150);
                      }}
                      className="px-3 py-1.5 rounded-[6px] bg-[var(--bg-surface-subtle)] hover:bg-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center gap-1.5 transition-all cursor-pointer no-print"
                      title="Abrir vista de impresión y remito de trabajo"
                    >
                      <Printer className="w-3.5 h-3.5 text-primary" />
                      <span>Imprimir Remito</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate("cotizador")}
                      className="px-3 py-1.5 rounded-[6px] bg-[var(--bg-surface-subtle)] hover:bg-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Re-Cotizar / Repetir</span>
                    </button>

                    <button
                      onClick={() => handleAdvanceOrderStatus(order)}
                      disabled={isAdvancingStatus === order.id}
                      className="px-3 py-1.5 rounded-[6px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-[11px] font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                      title="Simular avance de fase en taller para verificar WebSocket/Firestore en vivo"
                    >
                      <Play className={`w-3 h-3 ${isAdvancingStatus === order.id ? "animate-spin" : ""}`} />
                      <span>
                        {isAdvancingStatus === order.id
                          ? "Actualizando..."
                          : `Avanzar Fase: ${
                              order.status === "pendiente"
                                ? "Impresión UV"
                                : order.status === "en_produccion"
                                ? "Confección"
                                : order.status === "terminaciones"
                                ? "Despachado"
                                : order.status === "despachado"
                                ? "Entregado"
                                : "Reiniciar a Impresión"
                            }`}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
