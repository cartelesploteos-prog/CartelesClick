import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Server,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Package,
  FileText,
  Layers,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  Sparkles,
  Calendar,
  Filter,
  Search,
  Eye,
  AlertTriangle,
  Clock,
  Truck,
  Building2,
  Scissors,
  Users,
  Copy,
  ExternalLink,
  ChevronDown,
  Check,
  RefreshCw,
  BarChart3,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  Maximize2,
  FileSpreadsheet,
  Bell,
  Mail,
  Send,
  History,
  ArrowUpDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Table as TableIcon,
  LayoutList
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { exportProductsToCsv, exportOrdersToCsv } from "../../utils/exportCsv";
import { OrdersListSkeleton, Skeleton } from "../ui/Skeleton";
import { DashboardMetrics } from "../admin/DashboardMetrics";
import { AdminMetricsWidgets } from "../admin/AdminMetricsWidgets";
import { OrderAuditLogModal } from "../admin/OrderAuditLogModal";
import { ProductionVerificationModal } from "../admin/ProductionVerificationModal";
import { OrderDetailModal } from "../admin/OrderDetailModal";
import { recordOrderAuditLog, recordBulkOrderAuditLogs, logOrderStatusAudit } from "../../lib/firestore";
import { validateOrderCriticalFields, validateOrderForProduction } from "../../utils/orderValidation";
import {
  AdminProduct,
  AdminPeriodMetrics,
  BlogPost,
  CustomerType,
  OrderPriority,
  CalculationMode,
  Order
} from "../../types";

interface AdminPanelViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({ onNavigate }) => {
  const { isAdmin, user } = useAuthStore();
  const { addNotification, notifications, markAsRead, clearAll } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<"metricas" | "productos" | "blog_cms" | "pedidos" | "notificaciones" | "seguridad" | "usuarios">("metricas");

  // Broadcast Notification Form State
  const [notifType, setNotifType] = useState<"order_status" | "promotion" | "blog" | "system">("promotion");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifRecipientEmail, setNotifRecipientEmail] = useState("");
  const [notifSendEmail, setNotifSendEmail] = useState(true);
  const [notifSuccessMsg, setNotifSuccessMsg] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    setIsBroadcasting(true);
    setNotifSuccessMsg("");

    try {
      await addNotification({
        type: notifType,
        title: notifTitle,
        message: notifMessage,
        link: notifType === "promotion" ? "cotizador" : notifType === "blog" ? "blog" : "pedidos",
        priority: notifType === "order_status" ? "high" : "normal"
      });

      setNotifSuccessMsg("¡Notificación emitida en tiempo real y despachada por correo exitosamente!");
      setNotifTitle("");
      setNotifMessage("");
      setTimeout(() => setNotifSuccessMsg(""), 3500);
    } catch (err: any) {
      console.error("Error broadcast notif:", err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // ==========================================
  // 📊 METRICS STATE
  // ==========================================
  const [metricsPeriod, setMetricsPeriod] = useState<"semanal" | "mensual" | "anual" | "historico">("mensual");
  const [metricsData, setMetricsData] = useState<AdminPeriodMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  const fetchMetrics = async (period = metricsPeriod) => {
    setLoadingMetrics(true);
    try {
      const res = await fetch(`/api/admin/metrics?period=${period}`);
      const data = await res.json();
      setMetricsData(data);
    } catch (e) {
      console.error("Error cargando métricas:", e);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    fetchMetrics(metricsPeriod);
  }, [metricsPeriod]);

  // ==========================================
  // 👥 USERS STATE
  // ==========================================
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data && data.users) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error("Error cargando usuarios:", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productModeFilter, setProductModeFilter] = useState<"todos" | CalculationMode>("todos");
  const [productSearch, setProductSearch] = useState("");
  
  // Product Edit/Add Modal
  const [editingProduct, setEditingProduct] = useState<Partial<AdminProduct> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Google Sheets Import Modal
  const [isSheetsImportOpen, setIsSheetsImportOpen] = useState(false);
  const [sheetsSyncMode, setSheetsSyncMode] = useState<"paste" | "url">("url");
  const [sheetsSpreadsheetUrl, setSheetsSpreadsheetUrl] = useState("https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit");
  const [sheetsRawInput, setSheetsRawInput] = useState("");
  const [importStatusMsg, setImportStatusMsg] = useState("");
  const [isSyncingSheetsLive, setIsSyncingSheetsLive] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data && data.products) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error("Error al cargar productos:", e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLiveSheetsSync = async () => {
    if (!sheetsSpreadsheetUrl.trim()) return;
    setIsSyncingSheetsLive(true);
    setImportStatusMsg("Conectando con Google Sheets y recalculando tarifas...");
    try {
      const res = await fetch("/api/admin/sheets/live-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spreadsheetId: sheetsSpreadsheetUrl })
      });
      const data = await res.json();
      if (data.success) {
        setImportStatusMsg(`¡Sincronización Exitosa! ${data.importedCount || 0} nuevos agregados, ${data.updatedCount || 0} actualizados.`);
        fetchProducts();
        setTimeout(() => {
          setIsSheetsImportOpen(false);
          setImportStatusMsg("");
        }, 1800);
      } else {
        setImportStatusMsg(data.error || "No se pudo sincronizar con la planilla.");
      }
    } catch (e: any) {
      setImportStatusMsg(e.message || "Error al conectar con el servidor.");
    } finally {
      setIsSyncingSheetsLive(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.mode) return;

    try {
      const isNew = !editingProduct.id || editingProduct.id.startsWith("temp-");
      const url = isNew ? "/api/admin/products" : `/api/admin/products/${editingProduct.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct)
      });
      const data = await res.json();

      if (data.success) {
        fetchProducts();
        setIsProductModalOpen(false);
        setEditingProduct(null);
      }
    } catch (e) {
      console.error("Error guardando producto:", e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este producto del catálogo?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (e) {
      console.error("Error eliminando producto:", e);
    }
  };

  const handleImportSheets = async () => {
    if (!sheetsRawInput.trim()) return;
    setImportStatusMsg("Procesando datos de Google Sheets...");
    try {
      const res = await fetch("/api/admin/products/import-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: sheetsRawInput })
      });
      const data = await res.json();
      if (data.success) {
        setImportStatusMsg(`¡Éxito! ${data.importedCount} importados, ${data.updatedCount} actualizados.`);
        fetchProducts();
        setTimeout(() => {
          setIsSheetsImportOpen(false);
          setSheetsRawInput("");
          setImportStatusMsg("");
        }, 1500);
      } else {
        setImportStatusMsg(data.error || "Error al procesar filas");
      }
    } catch (e: any) {
      setImportStatusMsg(e.message || "Error al conectar con el servidor");
    }
  };

  // ==========================================
  // 📰 BLOG CMS STATE
  // ==========================================
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingBlog, setLoadingBlog] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isAiGeneratingBlog, setIsAiGeneratingBlog] = useState(false);
  const [aiBlogTopic, setAiBlogTopic] = useState("");

  const fetchBlogPosts = async () => {
    setLoadingBlog(true);
    try {
      const res = await fetch("/api/blog?all=true");
      const data = await res.json();
      if (data && data.posts) {
        setBlogPosts(data.posts);
      }
    } catch (e) {
      console.error("Error cargando blog:", e);
    } finally {
      setLoadingBlog(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editingPost.title || !editingPost.content) return;

    try {
      const isNew = !editingPost.id || editingPost.id.startsWith("temp-");
      const url = isNew ? "/api/admin/blog" : `/api/admin/blog/${editingPost.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPost)
      });
      const data = await res.json();

      if (data.success) {
        fetchBlogPosts();
        setIsBlogModalOpen(false);
        setEditingPost(null);
      }
    } catch (e) {
      console.error("Error guardando post:", e);
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    if (!confirm("¿Eliminar artículo del blog?")) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchBlogPosts();
    } catch (e) {
      console.error("Error eliminando post:", e);
    }
  };

  const handleAiDraftBlogPost = async () => {
    if (!aiBlogTopic.trim()) return;
    setIsAiGeneratingBlog(true);
    try {
      const res = await fetch("/api/admin/blog/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiBlogTopic })
      });
      const data = await res.json();
      if (data && data.title) {
        setEditingPost({
          ...(editingPost || {}),
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          tag: data.tag || "Técnica",
          readTime: data.readTime || "5 min de lectura",
          published: true
        });
      }
    } catch (e) {
      console.error("Error generando artículo con IA:", e);
    } finally {
      setIsAiGeneratingBlog(false);
    }
  };

  // ==========================================
  // 📦 ORDERS WITH PRIORITY & CUSTOMER TYPE STATE
  // ==========================================
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderCustomerFilter, setOrderCustomerFilter] = useState<"todos" | CustomerType>("todos");
  const [orderPriorityFilter, setOrderPriorityFilter] = useState<"todos" | OrderPriority>("todos");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("todos");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      let url = `/api/orders?customerType=${orderCustomerFilter}&priority=${orderPriorityFilter}&status=${orderStatusFilter}`;
      if (orderSearchQuery) url += `&search=${encodeURIComponent(orderSearchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.orders) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error("Error cargando pedidos:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [orderCustomerFilter, orderPriorityFilter, orderStatusFilter]);

  // Bulk Order Management
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Audit Log & Production Verification Modal States
  const [auditLogOrder, setAuditLogOrder] = useState<Order | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);
  const [verificationOrder, setVerificationOrder] = useState<Order | null>(null);
  const [pendingTargetStatus, setPendingTargetStatus] = useState<string>("en_produccion");

  // Sorting, View Mode & Pagination States
  type OrderSortField = "createdAt" | "orderNumber" | "customerName" | "totalAmountARS" | "priority" | "status";
  const [sortField, setSortField] = useState<OrderSortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [ordersViewMode, setOrdersViewMode] = useState<"table" | "cards">("table");

  const handleSort = (field: OrderSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (!orderSearchQuery) return true;
    const q = orderSearchQuery.toLowerCase().trim();
    return (
      (o.id && o.id.toLowerCase().includes(q)) ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
      (o.customerCompany && o.customerCompany.toLowerCase().includes(q))
    );
  });

  // Sorted Orders
  const sortedOrders = React.useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === "totalAmountARS") {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else if (sortField === "createdAt") {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else {
        valA = String(valA || "").toLowerCase();
        valB = String(valB || "").toLowerCase();
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredOrders, sortField, sortDirection]);

  // Paginated Orders
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / ordersPerPage));
  const paginatedOrders = React.useMemo(() => {
    const start = (currentPage - 1) * ordersPerPage;
    return sortedOrders.slice(start, start + ordersPerPage);
  }, [sortedOrders, currentPage, ordersPerPage]);

  const handleExportSelected = () => {
    const selectedOrdersData = orders.filter((o) => selectedOrders.includes(o.id));
    const targetData = selectedOrdersData.length > 0 ? selectedOrdersData : filteredOrders;
    const filename =
      selectedOrdersData.length > 0
        ? `pedidos_seleccionados_${new Date().toISOString().slice(0, 10)}.csv`
        : `reporte_pedidos_taller_${new Date().toISOString().slice(0, 10)}.csv`;
    exportOrdersToCsv(targetData, filename);
  };

  const handleUpdateOrderStatus = async (
    ord: Order,
    status: string,
    bypassValidation = false
  ) => {
    // Validar la existencia y formato de campos críticos ('medidas', 'material', 'archivos') antes de procesar cambios de estado
    if (!bypassValidation && (status === "en_produccion" || status === "impresion" || status === "terminaciones")) {
      const validation = validateOrderCriticalFields(ord);
      if (!validation.isValid) {
        setVerificationOrder(ord);
        setPendingTargetStatus(status);
        addNotification({
          type: "system",
          title: "Validación de Campos Críticos Requerida",
          message: `El pedido #${ord.orderNumber} requiere verificar medidas, material o archivos gráficos antes de cambiar a ${status}.`,
          priority: "high",
        });
        return;
      }
    }

    try {
      const previousStatus = ord.status || "pendiente";
      const timestamp = new Date().toISOString();
      const adminUid = user?.uid || "admin";
      const action = "update_status";

      await fetch(`/api/admin/orders/${ord.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status,
          adminUid,
          action,
          timestamp,
          previousStatus,
          notes: `Estado actualizado a "${status}" por control administrativo`
        }),
      });

      // Registra automáticamente un nuevo documento en la subcolección 'auditLogs' de Firestore
      await logOrderStatusAudit({
        adminUid,
        action,
        orderId: ord.id,
        orderNumber: ord.orderNumber,
        timestamp,
        previousStatus,
        newStatus: status,
        adminEmail: user?.email || "carteles.ploteos@gmail.com",
        adminName: user?.displayName || user?.email?.split("@")[0] || "Administrador",
        notes: `Estado actualizado a "${status}" desde AdminPanelView`,
      });

      addNotification({
        type: "system",
        title: "Estado Actualizado & Auditado",
        message: `Pedido #${ord.orderNumber} pasó a ${status}. Registrado en subcolección auditLogs de Firestore.`,
        priority: "normal",
      });

      fetchOrders();
    } catch (e) {
      console.error("Error update status:", e);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (newStatus === "en_produccion" || newStatus === "impresion" || newStatus === "terminaciones") {
      const targetOrders = orders.filter((o) => selectedOrders.includes(o.id));
      const invalid = targetOrders.filter((o) => !validateOrderCriticalFields(o).isValid);
      if (invalid.length > 0) {
        addNotification({
          type: "system",
          title: "Validación de Campos Críticos Requerida",
          message: `${invalid.length} pedido(s) tienen datos críticos incompletos (medidas, material o archivos). Corrige los datos antes de enviarlos a producción.`,
          priority: "high",
        });
        setVerificationOrder(invalid[0]);
        setPendingTargetStatus(newStatus);
        return;
      }
    }

    try {
      // 1. Ejecutar actualización de estado en endpoint API
      await Promise.all(
        selectedOrders.map(async (id) => {
          await fetch(`/api/admin/orders/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          });
        })
      );

      // 2. Construir mapa de datos de órdenes seleccionadas para trazabilidad
      const ordersMap: Record<string, { status?: string; orderNumber?: string }> = {};
      selectedOrders.forEach((id) => {
        const ord = orders.find((o) => o.id === id);
        if (ord) {
          ordersMap[id] = { status: ord.status, orderNumber: ord.orderNumber };
        }
      });

      // 3. Registrar en Firestore subcolección 'auditLogs' de cada pedido
      // Registra automáticamente: quién (admin UID), qué acción realizó ('update_status') y en qué objeto (order ID)
      await recordBulkOrderAuditLogs({
        orderIds: selectedOrders,
        ordersMap,
        action: "update_status",
        newStatus,
        adminUser: {
          uid: user?.uid || "admin",
          email: user?.email || "carteles.ploteos@gmail.com",
          displayName: user?.displayName || "Administrador",
        },
        notes: `Actualización masiva de estado a "${newStatus}" desde AdminPanelView`,
      });

      setSelectedOrders([]);
      addNotification({
        type: "system",
        title: "Actualización Masiva Auditada en Firestore",
        message: `Se actualizaron ${selectedOrders.length} pedido(s) a ${newStatus} y se registró en la subcolección auditLogs.`,
        priority: "normal",
      });
      fetchOrders();
    } catch (e) {
      console.error("Error bulk update:", e);
    }
  };


  const handleSaveOrderDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${editingOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priority: editingOrder.priority,
          customerType: editingOrder.customerType,
          internalNotes: editingOrder.internalNotes,
          promisedDate: editingOrder.promisedDate,
          status: editingOrder.status
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingOrder(null);
        fetchOrders();
      }
    } catch (e) {
      console.error("Error guardando detalles de pedido:", e);
    }
  };

  // Helper labels
  const getCustomerTypeLabel = (type?: CustomerType) => {
    switch (type) {
      case "agencia":
        return { label: "Agencia Publicidad", color: "bg-blue-900/40 text-blue-300 border-blue-700/50" };
      case "imprenta":
        return { label: "Imprenta Colega", color: "bg-purple-900/40 text-purple-300 border-purple-700/50" };
      case "cartelero":
        return { label: "Gremio Cartelero", color: "bg-amber-900/40 text-amber-300 border-amber-700/50" };
      default:
        return { label: "Cliente Común", color: "bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]" };
    }
  };

  const getPriorityBadge = (priority?: OrderPriority) => {
    switch (priority) {
      case "urgente":
        return (
          <span className="px-2.5 py-1 rounded-[7px] text-[11px] font-mono-num font-bold bg-red-950 text-red-400 border border-red-800 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            URGENTE (Prioridad 1)
          </span>
        );
      case "alta":
        return (
          <span className="px-2 py-0.5 rounded-[7px] text-[11px] font-sans font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60">
            Alta
          </span>
        );
      case "normal":
        return (
          <span className="px-2 py-0.5 rounded-[7px] text-[11px] font-sans font-medium bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            Normal
          </span>
        );
      case "baja":
        return (
          <span className="px-2 py-0.5 rounded-[7px] text-[11px] font-sans font-medium bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)] opacity-70">
            Baja
          </span>
        );
      default:
        return null;
    }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesMode = productModeFilter === "todos" || p.mode === productModeFilter;
    const matchesSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase());
    return matchesMode && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-36 sm:pb-44 space-y-10 sm:space-y-14 font-sans">
      
      {/* 🚀 ADMIN TOP HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-[7px] bg-primary text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[var(--border-subtle)] shadow-none">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-accent" />
            <span className="text-xs uppercase tracking-widest text-accent font-heading font-medium">
              Panel de Administración Taller Carteles.Click
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-medium tracking-tight">
            Control de Producción, Catálogo & CMS
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-2xl font-sans font-normal">
            Gestión centralizada de sustratos (m², metro lineal, unidad, placa), import/export a Google Sheets, métricas periódicas y prioridad gremial de pedidos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className={`px-4 py-2.5 rounded-[7px] text-xs font-sans font-medium transition-all flex items-center gap-2 ${
              isAdmin
                ? "bg-accent text-black font-semibold shadow-sm"
                : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{isAdmin ? "Admin Activo" : "Usuario sin privilegios"}</span>
          </button>
        </div>
      </div>

      {/* 🧭 NAVIGATION TABS */}
      <div className="flex border-b border-[var(--border-subtle)] gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("metricas")}
          className={`px-4 py-2.5 rounded-t-[7px] text-xs font-sans font-medium transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "metricas"
              ? "border-primary text-primary bg-[var(--bg-surface)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Métricas & Rentabilidad</span>
        </button>

        <button
          onClick={() => setActiveTab("productos")}
          className={`px-4 py-2.5 rounded-t-[7px] text-xs font-sans font-medium transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "productos"
              ? "border-primary text-primary bg-[var(--bg-surface)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catálogo & Google Sheets</span>
        </button>

        <button
          onClick={() => setActiveTab("pedidos")}
          className={`px-4 py-2.5 rounded-t-[7px] text-xs font-sans font-medium transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "pedidos"
              ? "border-primary text-primary bg-[var(--bg-surface)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Prioridad de Pedidos</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-red-900/60 text-red-200 border border-red-700/50">
            {orders.filter(o => o.priority === 'urgente').length} urgentes
          </span>
        </button>

        <button
          onClick={() => setActiveTab("blog_cms")}
          className={`px-4 py-2.5 rounded-t-[7px] text-xs font-sans font-medium transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "blog_cms"
              ? "border-primary text-primary bg-[var(--bg-surface)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>CMS Blog Técnico</span>
        </button>

        <button
          onClick={() => setActiveTab("notificaciones")}
          className={`px-4 py-2.5 rounded-t-[7px] text-xs font-sans font-medium transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "notificaciones"
              ? "border-primary text-primary bg-[var(--bg-surface)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Difusión & Notificaciones</span>
        </button>

        <button
          onClick={() => setActiveTab("seguridad")}
          className={`px-4 py-2.5 rounded-t-[7px] text-xs font-sans font-medium transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "seguridad"
              ? "border-primary text-primary bg-[var(--bg-surface)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Auditoría & Servidor</span>
        </button>

        <button
          onClick={() => setActiveTab("usuarios")}
          className={`px-4 py-2.5 rounded-t-[7px] text-xs font-sans font-medium transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "usuarios"
              ? "border-primary text-primary bg-[var(--bg-surface)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 📊 TAB 1: METRICS & WORKSHOP ANALYTICS                                    */}
      {/* ========================================================================= */}
      {activeTab === "metricas" && (
        <div className="space-y-6">
          {/* PERIOD SELECTOR HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="space-y-0.5">
              <h2 className="font-heading text-lg text-[var(--text-primary)] font-medium">
                Resumen Ejecutivo de Producción
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Seguimiento de facturación, consumo de insumos y segmentación de clientes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)] mr-1">Período:</span>
              {(["semanal", "mensual", "anual", "historico"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setMetricsPeriod(period)}
                  className={`px-3 py-1.5 rounded-[7px] text-xs font-sans font-medium capitalize transition-all ${
                    metricsPeriod === period
                      ? "bg-primary text-white shadow-xs"
                      : "bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  }`}
                >
                  {period}
                </button>
              ))}
              <button
                onClick={() => fetchMetrics(metricsPeriod)}
                className="p-2 rounded-[7px] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] ml-1"
                title="Refrescar métricas"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingMetrics ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* TOP KPI CARDS */}
          {metricsData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-none space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)] uppercase font-heading font-medium">
                      Facturación Total
                    </span>
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-heading font-mono-num font-medium text-[var(--text-primary)]">
                    ${metricsData.totalRevenueARS.toLocaleString("es-AR")}
                  </p>
                  <span className="text-[11px] text-emerald-500 font-sans flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Ticket promedio: ${metricsData.averageTicketARS.toLocaleString("es-AR")}
                  </span>
                </div>

                <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-none space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)] uppercase font-heading font-medium">
                      Superficie Impresa (m²)
                    </span>
                    <Maximize2 className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-heading font-mono-num font-medium text-[var(--text-primary)]">
                    {metricsData.totalM2.toLocaleString("es-AR")} m²
                  </p>
                  <span className="text-[11px] text-[var(--text-secondary)] font-sans">
                    En lonas, vinilos y microperforados
                  </span>
                </div>

                <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-none space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)] uppercase font-heading font-medium">
                      Placas & Unidades
                    </span>
                    <Layers className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-heading font-mono-num font-medium text-[var(--text-primary)]">
                    {metricsData.totalPlates} placas / {metricsData.totalUnits} unid.
                  </p>
                  <span className="text-[11px] text-[var(--text-secondary)] font-sans">
                    PVC, PAI, Polifán & Portabanners
                  </span>
                </div>

                <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-none space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)] uppercase font-heading font-medium">
                      Total Pedidos
                    </span>
                    <Package className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-2xl font-heading font-mono-num font-medium text-[var(--text-primary)]">
                    {metricsData.totalOrders} órdenes
                  </p>
                  <span className="text-[11px] text-red-400 font-sans font-medium">
                    {metricsData.urgentOrders} pedidos urgentes activos
                  </span>
                </div>
              </div>

              {/* GRIDS: SEGMENTATION & TIMELINE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CUSTOMER TYPE REVENUE BREAKDOWN */}
                <div className="p-6 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-sm text-[var(--text-primary)] font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" /> Ventas por Tipo de Cliente
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--text-primary)] font-medium">Agencias de Publicidad (42%)</span>
                        <span className="font-mono-num font-medium text-blue-400">${metricsData.revenueByCustomerType.agencia.toLocaleString("es-AR")}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg-surface-subtle)] overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "42%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--text-primary)] font-medium">Imprentas Colegas (28%)</span>
                        <span className="font-mono-num font-medium text-purple-400">${metricsData.revenueByCustomerType.imprenta.toLocaleString("es-AR")}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg-surface-subtle)] overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: "28%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--text-primary)] font-medium">Carteleros & Gremio (20%)</span>
                        <span className="font-mono-num font-medium text-amber-400">${metricsData.revenueByCustomerType.cartelero.toLocaleString("es-AR")}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg-surface-subtle)] overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: "20%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--text-primary)] font-medium">Clientes Particulares (10%)</span>
                        <span className="font-mono-num font-medium text-[var(--text-secondary)]">${metricsData.revenueByCustomerType.comun.toLocaleString("es-AR")}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg-surface-subtle)] overflow-hidden">
                        <div className="h-full bg-zinc-500 rounded-full" style={{ width: "10%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* TIMELINE PROGRESSION BAR CHART */}
                <div className="lg:col-span-2 p-6 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-sm text-[var(--text-primary)] font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" /> Evolución del Período ({metricsPeriod})
                    </h3>
                    <span className="text-xs text-[var(--text-secondary)]">Facturación ($ ARS)</span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 items-end h-44 pt-6">
                    {metricsData.timeline.map((point, idx) => {
                      const maxVal = Math.max(...metricsData.timeline.map(t => t.revenueARS)) || 1;
                      const heightPercent = Math.round((point.revenueARS / maxVal) * 100);

                      return (
                        <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                          <span className="text-[10px] font-mono-num text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity">
                            ${Math.round(point.revenueARS / 1000)}k
                          </span>
                          <div
                            className="w-full max-w-[36px] bg-primary/80 hover:bg-primary rounded-t-[4px] transition-all relative"
                            style={{ height: `${Math.max(12, heightPercent)}%` }}
                          />
                          <span className="text-[11px] font-sans font-medium text-[var(--text-secondary)] truncate w-full text-center">
                            {point.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* TOP SELLING MATERIALS */}
              <div className="p-6 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
                <h3 className="font-heading text-sm text-[var(--text-primary)] font-medium">
                  Materiales con Mayor Demanda y Rotación
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)] uppercase text-[10px] font-heading font-medium">
                      <tr>
                        <th className="py-2.5 px-3">Material / Producto</th>
                        <th className="py-2.5 px-3">Modalidad</th>
                        <th className="py-2.5 px-3">Volumen Total</th>
                        <th className="py-2.5 px-3">Facturación Estimada</th>
                        <th className="py-2.5 px-3 text-right">% de Ventas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {metricsData.topMaterials.map((mat, i) => (
                        <tr key={i} className="hover:bg-[var(--bg-surface-subtle)]">
                          <td className="py-2.5 px-3 font-medium text-[var(--text-primary)]">{mat.name}</td>
                          <td className="py-2.5 px-3 uppercase text-primary font-mono-num">{mat.mode}</td>
                          <td className="py-2.5 px-3 font-mono-num">{mat.quantityOrM2} {mat.mode}</td>
                          <td className="py-2.5 px-3 font-mono-num font-medium text-[var(--text-primary)]">
                            ${mat.revenueARS.toLocaleString("es-AR")}
                          </td>
                          <td className="py-2.5 px-3 font-mono-num text-right text-emerald-500">
                            {Math.round((mat.revenueARS / metricsData.totalRevenueARS) * 100)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🛠️ TAB 2: PRODUCT MANAGEMENT & GOOGLE SHEETS INTEGRATION                 */}
      {/* ========================================================================= */}
      {activeTab === "productos" && (
        <div className="space-y-6">
          {/* ACTIONS & FILTERS HEADER */}
          <div className="p-4 sm:p-6 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-heading text-lg text-[var(--text-primary)] font-medium">
                Catálogo Maestro de Precios & Sustratos
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Listado por <strong>m²</strong>, <strong>metro lineal</strong>, <strong>unidad</strong> y <strong>placa</strong> con sincronización a Google Sheets.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => exportProductsToCsv(products)}
                className="px-3.5 py-2 rounded-[7px] text-xs font-sans font-medium bg-[var(--bg-surface-subtle)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center gap-1.5 transition-colors"
                title="Exportar productos en formato CSV compatible con Google Sheets"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Exportar CSV (Sheets)</span>
              </button>

              <button
                onClick={() => setIsSheetsImportOpen(true)}
                className="px-3.5 py-2 rounded-[7px] text-xs font-sans font-medium bg-[var(--bg-surface-subtle)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                <span>Importar desde Sheets</span>
              </button>

              <button
                onClick={() => {
                  setEditingProduct({
                    name: "",
                    category: "lonas",
                    mode: "m2",
                    costARS: 5000,
                    marginPercent: 100,
                    salePriceARS: 10000,
                    unitLabel: "m²",
                    stockStatus: "disponible",
                    shortDesc: ""
                  });
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2 rounded-[7px] text-xs font-sans font-medium bg-primary text-white hover:bg-primary/90 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Producto</span>
              </button>
            </div>
          </div>

          {/* CALCULATION MODE TABS */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: "todos", label: "Todos los productos" },
                { id: "m2", label: "📏 Por m²" },
                { id: "metro_lineal", label: "📐 Por Metro Lineal" },
                { id: "unidad", label: "📦 Por Unidad" },
                { id: "placa", label: "🪵 Por Placa Entera" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setProductModeFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-[7px] text-xs font-sans font-medium transition-all ${
                    productModeFilter === tab.id
                      ? "bg-primary text-white"
                      : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar sustrato..."
                className="w-full pl-8 pr-3 py-1.5 rounded-[7px] text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* PRODUCTS TABLE */}
          <div className="rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] uppercase text-[10px] font-heading font-medium">
                  <tr>
                    <th className="py-3 px-3">Producto / Sustrato</th>
                    <th className="py-3 px-3">Cálculo</th>
                    <th className="py-3 px-3">Medidas Especiales</th>
                    <th className="py-3 px-3">Costo Base ARS</th>
                    <th className="py-3 px-3">Margen %</th>
                    <th className="py-3 px-3">Precio Venta ARS</th>
                    <th className="py-3 px-3">Estado Stock</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {loadingProducts ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[var(--text-secondary)]">
                        Cargando catálogo maestro...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[var(--text-secondary)]">
                        No se encontraron productos con el filtro aplicado.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const dims = p.mode === "placa" && p.plateWidthCm
                        ? `Placa ${p.plateWidthCm}×${p.plateHeightCm} cm`
                        : p.linearWidthCm
                        ? `Bobina ${p.linearWidthCm} cm`
                        : p.minAreaM2
                        ? `Mín. ${p.minAreaM2} m²`
                        : "-";

                      return (
                        <tr key={p.id} className="hover:bg-[var(--bg-surface-subtle)]">
                          <td className="py-3 px-3">
                            <div className="font-medium text-[var(--text-primary)]">{p.name}</div>
                            <div className="text-[11px] text-[var(--text-secondary)] capitalize">{p.category}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-[7px] text-[10px] font-mono-num uppercase font-medium bg-primary/10 text-primary border border-primary/20">
                              {p.mode}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono-num text-[var(--text-secondary)]">
                            {dims}
                          </td>
                          <td className="py-3 px-3 font-mono-num text-[var(--text-secondary)]">
                            ${p.costARS.toLocaleString("es-AR")}
                          </td>
                          <td className="py-3 px-3 font-mono-num text-emerald-500">
                            +{p.marginPercent || 100}%
                          </td>
                          <td className="py-3 px-3 font-mono-num font-medium text-[var(--text-primary)]">
                            ${(p.salePriceARS || Math.round(p.costARS * 2)).toLocaleString("es-AR")} <span className="text-[10px] text-[var(--text-secondary)]">/{p.unitLabel || p.mode}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-[7px] text-[10px] font-medium ${
                              p.stockStatus === "disponible"
                                ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800"
                                : p.stockStatus === "stock_bajo"
                                ? "bg-amber-950/60 text-amber-300 border border-amber-800"
                                : "bg-red-950/60 text-red-300 border border-red-800"
                            }`}>
                              {p.stockStatus || "disponible"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1.5 rounded-[7px] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-primary transition-colors"
                                title="Editar producto"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 rounded-[7px] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                                title="Eliminar producto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📦 TAB 3: ORDER PRIORITY & CUSTOMER TYPE MANAGEMENT                       */}
      {/* ========================================================================= */}
      {activeTab === "pedidos" && (
        <div className="space-y-6">
          {/* 📊 KPI DASHBOARD WIDGETS CON RECHARTS: VOLUMEN MENSUAL Y TASA DE CONVERSIÓN */}
          <DashboardMetrics orders={orders} />

          {/* ORDERS FILTERS */}
          <div className="p-4 sm:p-6 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg text-[var(--text-primary)] font-medium">
                  Gestión de Cola de Impresión & Despachos
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Clasificación de pedidos por <strong>Agencia</strong>, <strong>Imprenta</strong>, <strong>Cartelero</strong> y <strong>Cliente Común</strong> con semáforo de urgencia.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedOrders.length > 0 && (
                  <div className="flex items-center gap-2 mr-1 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-[7px]">
                    <span className="text-xs font-medium text-primary">{selectedOrders.length} sel.</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleBulkStatusUpdate(e.target.value);
                      }}
                      defaultValue=""
                      className="px-2 py-1 rounded-[7px] text-xs bg-primary text-white border-0 focus:outline-none cursor-pointer"
                    >
                      <option value="" disabled>Cambiar estado masivo...</option>
                      <option value="pendiente">A: Pendiente</option>
                      <option value="en_produccion">A: En Producción</option>
                      <option value="terminaciones">A: Terminaciones</option>
                      <option value="despachado">A: Despachado</option>
                      <option value="entregado">A: Entregado</option>
                    </select>
                    <button
                      onClick={handleExportSelected}
                      className="px-2 py-1 rounded-[7px] text-xs font-medium bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1 transition-colors"
                      title="Descargar pedidos seleccionados a CSV"
                    >
                      <Download className="w-3 h-3" />
                      <span>Exportar CSV</span>
                    </button>
                    <button 
                      onClick={() => setSelectedOrders([])} 
                      className="text-xs text-[var(--text-secondary)] hover:text-red-400 p-0.5"
                      title="Limpiar selección"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <button
                  onClick={() => exportOrdersToCsv(filteredOrders, `pedidos_taller_${new Date().toISOString().slice(0, 10)}.csv`)}
                  className="px-3.5 py-2 rounded-[7px] text-xs font-sans font-medium bg-[var(--bg-surface-subtle)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center gap-1.5 transition-colors"
                  title="Exportar pedidos actuales en formato CSV compatible con Google Sheets / Excel"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span>Exportar a CSV ({filteredOrders.length})</span>
                </button>

                <button
                  onClick={fetchOrders}
                  className="p-2 rounded-[7px] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-primary)]"
                  title="Actualizar pedidos"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* FILTER CHIPS & SEARCH */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-[var(--border-subtle)]">
              <div>
                <label className="text-[11px] text-[var(--text-secondary)] uppercase font-medium block mb-1">
                  Buscar por N° / UID / Cliente
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Ej: ORD- o Nombre..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-[7px] text-xs bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {orderSearchQuery && (
                    <button
                      onClick={() => setOrderSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[var(--text-secondary)] uppercase font-medium block mb-1">
                  Tipo de Cliente
                </label>
                <select
                  value={orderCustomerFilter}
                  onChange={(e) => setOrderCustomerFilter(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-[7px] text-xs bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                >
                  <option value="todos">Todos los clientes</option>
                  <option value="agencia">🏢 Agencias de Publicidad</option>
                  <option value="imprenta">🖨️ Imprentas Colegas</option>
                  <option value="cartelero">🪵 Carteleros del Gremio</option>
                  <option value="comun">👤 Clientes Comunes</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[var(--text-secondary)] uppercase font-medium block mb-1">
                  Nivel de Prioridad
                </label>
                <select
                  value={orderPriorityFilter}
                  onChange={(e) => setOrderPriorityFilter(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-[7px] text-xs bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                >
                  <option value="todos">Todas las prioridades</option>
                  <option value="urgente">🔴 URGENTE (Prioridad 1)</option>
                  <option value="alta">🟠 Alta</option>
                  <option value="normal">⚪ Normal</option>
                  <option value="baja">🔵 Baja</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[var(--text-secondary)] uppercase font-medium block mb-1">
                  Estado de Taller
                </label>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-[7px] text-xs bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_produccion">En Producción</option>
                  <option value="terminaciones">Terminaciones</option>
                  <option value="despachado">Despachado</option>
                  <option value="entregado">Entregado</option>
                </select>
              </div>
            </div>

            {/* SELECTION & SORTING TOOLBAR */}
            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider mr-1 flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3" />
                    <span>Ordenar por:</span>
                  </span>

                  {(
                    [
                      { id: "createdAt", label: "Fecha" },
                      { id: "orderNumber", label: "N° Pedido" },
                      { id: "customerName", label: "Cliente" },
                      { id: "totalAmountARS", label: "Total ARS" },
                      { id: "priority", label: "Prioridad" },
                      { id: "status", label: "Estado" },
                    ] as const
                  ).map((col) => {
                    const isActive = sortField === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleSort(col.id)}
                        className={`px-2.5 py-1 rounded-[5px] text-[11px] font-medium border flex items-center gap-1 transition-colors ${
                          isActive
                            ? "bg-primary/15 border-primary text-primary"
                            : "bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        <span>{col.label}</span>
                        {isActive ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )
                        ) : (
                          <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 border border-[var(--border-subtle)] rounded-[5px] p-0.5 bg-[var(--bg-surface-subtle)]">
                    <button
                      type="button"
                      onClick={() => setOrdersViewMode("table")}
                      className={`px-2 py-1 rounded-[4px] text-xs font-medium flex items-center gap-1 transition-colors ${
                        ordersViewMode === "table"
                          ? "bg-[var(--bg-surface)] text-primary shadow-xs font-semibold"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                      title="Vista tabla compacta para grandes volúmenes"
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Tabla</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrdersViewMode("cards")}
                      className={`px-2 py-1 rounded-[4px] text-xs font-medium flex items-center gap-1 transition-colors ${
                        ordersViewMode === "cards"
                          ? "bg-[var(--bg-surface)] text-primary shadow-xs font-semibold"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                      title="Vista detallada en tarjetas"
                    >
                      <LayoutList className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Tarjetas</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <span>Por pág:</span>
                    <select
                      value={ordersPerPage}
                      onChange={(e) => {
                        setOrdersPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-0.5 rounded-[5px] text-xs bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      if (selectedOrders.length === sortedOrders.length) {
                        setSelectedOrders([]);
                      } else {
                        setSelectedOrders(sortedOrders.map((o) => o.id));
                      }
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    {selectedOrders.length === sortedOrders.length
                      ? "Deseleccionar todos"
                      : `Seleccionar todos (${sortedOrders.length})`}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ORDERS LIST / TABLE */}
          <div className="space-y-4">
            {loadingOrders ? (
              <OrdersListSkeleton count={3} />
            ) : sortedOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] rounded-[7px] border border-[var(--border-subtle)]">
                No hay pedidos que coincidan con los filtros seleccionados o la búsqueda &quot;{orderSearchQuery}&quot;.
              </div>
            ) : ordersViewMode === "table" ? (
              /* TABLA DE PEDIDOS OPTIMIZADA CON CABECERAS ORDENABLES */
              <div className="overflow-x-auto rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={paginatedOrders.length > 0 && paginatedOrders.every(o => selectedOrders.includes(o.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newSelected = Array.from(new Set([...selectedOrders, ...paginatedOrders.map(o => o.id)]));
                              setSelectedOrders(newSelected);
                            } else {
                              setSelectedOrders(selectedOrders.filter(id => !paginatedOrders.some(o => o.id === id)));
                            }
                          }}
                          aria-label="Seleccionar página"
                        />
                      </th>
                      <th
                        onClick={() => handleSort("orderNumber")}
                        className="p-3 cursor-pointer hover:text-primary transition-colors select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>N° Pedido</span>
                          {sortField === "orderNumber" ? (
                            sortDirection === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                          ) : (
                            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("createdAt")}
                        className="p-3 cursor-pointer hover:text-primary transition-colors select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>Fecha</span>
                          {sortField === "createdAt" ? (
                            sortDirection === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                          ) : (
                            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("customerName")}
                        className="p-3 cursor-pointer hover:text-primary transition-colors select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>Cliente</span>
                          {sortField === "customerName" ? (
                            sortDirection === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                          ) : (
                            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
                          )}
                        </div>
                      </th>
                      <th className="p-3">Segmento</th>
                      <th className="p-3">Ítems & Medidas</th>
                      <th
                        onClick={() => handleSort("totalAmountARS")}
                        className="p-3 text-right cursor-pointer hover:text-primary transition-colors select-none"
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Total ARS</span>
                          {sortField === "totalAmountARS" ? (
                            sortDirection === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                          ) : (
                            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("priority")}
                        className="p-3 text-center cursor-pointer hover:text-primary transition-colors select-none"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Prioridad</span>
                          {sortField === "priority" ? (
                            sortDirection === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                          ) : (
                            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("status")}
                        className="p-3 cursor-pointer hover:text-primary transition-colors select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>Estado</span>
                          {sortField === "status" ? (
                            sortDirection === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                          ) : (
                            <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
                          )}
                        </div>
                      </th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {paginatedOrders.map((ord) => {
                      const custInfo = getCustomerTypeLabel(ord.customerType);
                      const isSelected = selectedOrders.includes(ord.id);
                      const isUrgent = ord.priority === "urgente";

                      return (
                        <tr
                          key={ord.id}
                          className={`hover:bg-[var(--bg-surface-subtle)] transition-colors ${
                            isSelected ? "bg-primary/5" : isUrgent ? "bg-red-950/10" : ""
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) =>
                                setSelectedOrders(
                                  e.target.checked
                                    ? [...selectedOrders, ord.id]
                                    : selectedOrders.filter((id) => id !== ord.id)
                                )
                              }
                            />
                          </td>
                          <td className="p-3">
                            <span className="font-mono-num font-bold text-xs text-primary">
                              {ord.orderNumber || ord.id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap text-[var(--text-secondary)]">
                            {new Date(ord.createdAt).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-[var(--text-primary)]">
                              {ord.customerName}
                            </div>
                            {ord.customerCompany && (
                              <div className="text-[10px] text-primary font-medium truncate max-w-[140px]">
                                {ord.customerCompany}
                              </div>
                            )}
                            <div className="text-[10px] text-[var(--text-secondary)] truncate max-w-[160px]">
                              {ord.customerEmail}
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-[5px] text-[10px] font-medium border ${custInfo.color}`}
                            >
                              {custInfo.label}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="text-[var(--text-primary)] font-medium">
                              {ord.items?.length || 0} prod. {ord.totalM2 ? `(${ord.totalM2} m²)` : ""}
                            </div>
                            <div className="text-[10px] text-[var(--text-secondary)] truncate max-w-[180px]">
                              {ord.items?.map((i) => `${i.quantity}x ${i.materialName || 'Ítem'}`).join(", ")}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-mono-num font-semibold text-xs text-[var(--text-primary)]">
                              ${(ord.totalAmountARS || (ord as any).totalPriceARS || 0).toLocaleString("es-AR")}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {getPriorityBadge(ord.priority)}
                          </td>
                          <td className="p-3">
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord, e.target.value)}
                              className="px-2 py-1 rounded-[5px] text-[11px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium cursor-pointer"
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="en_produccion">En Producción</option>
                              <option value="terminaciones">Terminaciones</option>
                              <option value="despachado">Despachado</option>
                              <option value="entregado">Entregado</option>
                            </select>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedOrderDetail(ord)}
                                className="p-1 rounded-[5px] bg-[var(--bg-surface-subtle)] hover:bg-sky-500/10 hover:text-sky-500 border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors"
                                title="Ver detalles del pedido"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAuditLogOrder(ord);
                                  setIsAuditModalOpen(true);
                                }}
                                className="p-1 rounded-[5px] bg-[var(--bg-surface-subtle)] hover:bg-primary/10 hover:text-primary border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors"
                                title="Ver historial de auditoría (auditLogs)"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingOrder(ord)}
                                className="p-1 rounded-[5px] bg-[var(--bg-surface-subtle)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                title="Editar notas y prioridad"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* VISTA DETALLADA EN TARJETAS */
              paginatedOrders.map((ord) => {
                const custInfo = getCustomerTypeLabel(ord.customerType);

                return (
                  <div
                    key={ord.id}
                    className={`p-5 rounded-[7px] bg-[var(--bg-surface)] border shadow-none space-y-4 transition-all ${
                      ord.priority === "urgente"
                        ? "border-red-600/70 bg-red-950/10"
                        : "border-[var(--border-subtle)]"
                    }`}
                  >
                    {/* TOP HEADER ROW */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(ord.id)}
                          onChange={(e) => setSelectedOrders(e.target.checked ? [...selectedOrders, ord.id] : selectedOrders.filter(id => id !== ord.id))}
                        />
                        <span className="font-mono-num font-bold text-xs text-primary">
                          {ord.orderNumber || ord.id}
                        </span>
                        {getPriorityBadge(ord.priority)}
                        <span className={`px-2.5 py-0.5 rounded-[7px] text-[11px] font-medium border ${custInfo.color}`}>
                          {custInfo.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[var(--text-secondary)]">
                          {new Date(ord.createdAt).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                        <span className="font-heading font-mono-num font-medium text-sm text-[var(--text-primary)]">
                          ${(ord.totalAmountARS || (ord as any).totalPriceARS || 0).toLocaleString("es-AR")}
                        </span>
                      </div>
                    </div>

                    {/* DETAILS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                      <div>
                        <span className="text-[11px] text-[var(--text-secondary)] block font-medium">Cliente & Contacto</span>
                        <p className="font-medium text-[var(--text-primary)]">{ord.customerName}</p>
                        {ord.customerCompany && (
                          <p className="text-[11px] text-primary">{ord.customerCompany}</p>
                        )}
                        <p className="text-[11px] text-[var(--text-secondary)]">{ord.customerEmail} • {ord.customerPhone}</p>
                      </div>

                      <div>
                        <span className="text-[11px] text-[var(--text-secondary)] block font-medium">Ítems & Superficie</span>
                        <p className="text-[var(--text-primary)] font-medium">
                          {ord.items?.length || 0} producto(s) {ord.totalM2 ? `(${ord.totalM2} m²)` : ""}
                        </p>
                        <p className="text-[11px] text-[var(--text-secondary)] truncate">
                          {ord.items?.map(i => `${i.quantity}x ${i.materialName}`).join(", ")}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] text-[var(--text-secondary)] block font-medium">Despacho & Estado</span>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord, e.target.value)}
                            className="px-2 py-1 rounded-[7px] text-[11px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium cursor-pointer"
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_produccion">En Producción</option>
                            <option value="terminaciones">Terminaciones</option>
                            <option value="despachado">Despachado</option>
                            <option value="entregado">Entregado</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetail(ord)}
                            className="px-2.5 py-1 rounded-[7px] bg-[var(--bg-surface-subtle)] hover:bg-sky-500/10 hover:text-sky-500 border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-primary)] flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Detalles
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingOrder(ord)}
                            className="px-2.5 py-1 rounded-[7px] bg-[var(--bg-surface-subtle)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-primary)]"
                          >
                            Editar Prioridad/Notas
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setAuditLogOrder(ord);
                              setIsAuditModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-[7px] bg-[var(--bg-surface-subtle)] hover:bg-primary/10 hover:text-primary border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-primary)] flex items-center gap-1 transition-colors"
                            title="Ver trazabilidad de auditoría en Firestore"
                          >
                            <History className="w-3.5 h-3.5 text-primary" />
                            <span>Auditoría</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* WORKSHOP INTERNAL NOTES */}
                    {ord.internalNotes && (
                      <div className="p-3 rounded-[7px] bg-amber-950/20 border border-amber-800/40 text-amber-200 text-xs font-sans flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-300 font-medium">Instrucciones de Taller:</strong> {ord.internalNotes}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* PAGINATION CONTROLS BAR */}
            {sortedOrders.length > 0 && (
              <div className="p-4 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-[var(--text-secondary)]">
                  Mostrando <strong>{(currentPage - 1) * ordersPerPage + 1}</strong> -{" "}
                  <strong>{Math.min(currentPage * ordersPerPage, sortedOrders.length)}</strong> de{" "}
                  <strong>{sortedOrders.length}</strong> pedidos
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    className="p-1.5 rounded-[5px] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-subtle)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Primera página"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-[5px] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-subtle)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="px-3 py-1 font-mono text-xs font-semibold text-[var(--text-primary)]">
                    Página {currentPage} de {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-[5px] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-subtle)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Página siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className="p-1.5 rounded-[5px] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-subtle)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Última página"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📰 TAB 4: BLOG CMS & AI WRITER                                            */}
      {/* ========================================================================= */}
      {activeTab === "blog_cms" && (
        <div className="space-y-6">
          {/* CMS HEADER */}
          <div className="p-4 sm:p-6 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-heading text-lg text-[var(--text-primary)] font-medium">
                CMS de Publicaciones Técnicas & Guías de Diseño
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Redacta, edita y alimenta el blog público para educar clientes en pre-prensa, sustratos y resolución.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingPost({
                    title: "",
                    excerpt: "",
                    content: "",
                    tag: "Pre-Prensa",
                    readTime: "4 min de lectura",
                    image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=80",
                    published: true,
                    featured: false
                  });
                  setIsBlogModalOpen(true);
                }}
                className="px-4 py-2 rounded-[7px] text-xs font-sans font-medium bg-primary text-white hover:bg-primary/90 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Artículo</span>
              </button>
            </div>
          </div>

          {/* AI POST DRAFTER CARD */}
          <div className="p-5 rounded-[7px] bg-gradient-to-r from-primary/10 via-[var(--bg-surface)] to-[var(--bg-surface)] border border-primary/20 space-y-3">
            <div className="flex items-center gap-2 text-primary font-heading font-medium text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Asistente IA para Generar Artículos de Cartelería</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={aiBlogTopic}
                onChange={(e) => setAiBlogTopic(e.target.value)}
                placeholder="Ej: Cómo calcular la distancia de lectura para marquesinas de vía pública..."
                className="flex-1 px-3 py-2 rounded-[7px] text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleAiDraftBlogPost}
                disabled={isAiGeneratingBlog || !aiBlogTopic.trim()}
                className="px-4 py-2 rounded-[7px] text-xs font-medium bg-primary text-white disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isAiGeneratingBlog ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Generar Borrador con IA</span>
              </button>
            </div>
          </div>

          {/* BLOG POSTS LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden shadow-none flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 overflow-hidden relative bg-[var(--bg-surface-subtle)]">
                    <img
                      src={post.image}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-[7px] bg-black/80 text-white font-sans">
                      {post.tag}
                    </span>
                    <span className={`absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-[7px] font-sans ${
                      post.published ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                    }`}>
                      {post.published ? "Publicado" : "Borrador"}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] font-sans">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                      <span>•</span>
                      <span>{post.viewsCount || 0} vistas</span>
                    </div>

                    <h3 className="font-heading text-sm text-[var(--text-primary)] font-medium line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-3 font-sans font-normal">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-[var(--border-subtle)] flex items-center justify-between mt-3">
                  <span className="text-[11px] text-[var(--text-secondary)] font-mono-num truncate max-w-[140px]">
                    /{post.slug}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingPost(post);
                        setIsBlogModalOpen(true);
                      }}
                      className="p-1.5 rounded-[7px] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-primary transition-colors"
                      title="Editar post"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlogPost(post.id)}
                      className="p-1.5 rounded-[7px] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                      title="Eliminar post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔔 TAB 5: BROADCAST & NOTIFICATIONS CENTER                                */}
      {/* ========================================================================= */}
      {activeTab === "notificaciones" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="space-y-0.5">
              <h2 className="font-heading text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span>Centro de Difusión & Notificaciones en Tiempo Real</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-sans">
                Emite avisos en vivo a clientes de la plataforma (toasts emergentes, centro de campana y despacho de emails).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* BROADCAST FORM */}
            <div className="lg:col-span-2 p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
              <h3 className="font-heading text-sm font-medium text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
                <Send className="w-4 h-4 text-primary" />
                <span>Emitir Notificación / Promoción Gremial</span>
              </h3>

              {notifSuccessMsg && (
                <div className="p-3 rounded-[7px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{notifSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleBroadcastNotification} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-[var(--text-secondary)] mb-1 font-medium">
                      Tipo de Notificación
                    </label>
                    <select
                      value={notifType}
                      onChange={(e) => setNotifType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                    >
                      <option value="promotion">🎁 Promoción / Descuento Gremio</option>
                      <option value="order_status">📦 Actualización de Producción</option>
                      <option value="blog">📰 Noticia / Novedad del Blog</option>
                      <option value="system">⚠️ Aviso de Sistema / Taller</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[var(--text-secondary)] mb-1 font-medium">
                      Título del Mensaje
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 20% OFF en Lona Frontlight 13oz este viernes"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1 font-medium">
                    Cuerpo del Mensaje
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describí los detalles de la oferta, plazos de entrega o aviso importante para talleres..."
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="w-full p-2.5 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>Despacha copia a clientes suscriptos por correo electrónico</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isBroadcasting}
                    className="px-4 py-2.5 rounded-[7px] bg-primary hover:bg-primary/90 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isBroadcasting ? "Emitiendo..." : "Difundir Notificación"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* NOTIFICATION CHANNELS & SYSTEM STATS */}
            <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
              <h3 className="font-heading text-sm font-medium text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Canales Activos</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-start gap-2.5">
                  <Bell className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">In-App Live Toast & Bell</p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Banners en tiempo real y contador de no leídos en barra superior con persistencia local y backend.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Despacho por Email</p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Actualizaciones automáticas de cambio de estado en taller enviadas al cliente del pedido.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Preferencias de Usuario</p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Filtro granular configurable por cada cliente desde la campana de notificaciones.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* BANDEJA DE ENTRADA ADMIN */}
          <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 mt-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <h3 className="font-heading text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Bandeja de Alertas del Sistema</span>
              </h3>
              <button
                onClick={() => clearAll()}
                className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline"
              >
                Limpiar todo
              </button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {notifications.filter(n => n.type === 'admin_alert' || n.type === 'system').length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--text-secondary)]">
                  No hay alertas del sistema recientes.
                </div>
              ) : (
                notifications.filter(n => n.type === 'admin_alert' || n.type === 'system').map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-3 rounded-[7px] border transition-colors ${
                      notif.read ? 'bg-[var(--bg-surface-subtle)] border-transparent' : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] border-l-4 border-l-amber-500'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs font-medium ${notif.read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                            {notif.title}
                          </h4>
                          {notif.priority === 'high' && (
                            <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-bold rounded-sm uppercase tracking-wider">
                              Urgente
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-[var(--text-tertiary)] pt-1">
                          {new Date(notif.timestamp).toLocaleString('es-AR')}
                        </p>
                      </div>
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-[10px] bg-[var(--bg-surface-subtle)] hover:bg-[var(--border-subtle)] px-2 py-1 rounded-sm text-[var(--text-primary)] transition-colors shrink-0"
                        >
                          Marcar leída
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔒 TAB 6: SECURITY AUDIT & ARCHITECTURE                                  */}
      {/* ========================================================================= */}
      {activeTab === "seguridad" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-none space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)] uppercase font-heading font-medium">
                  Gemini API Key
                </span>
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-sans font-medium text-[var(--text-primary)]">
                100% Server-Only
              </p>
              <span className="text-[11px] text-[var(--text-secondary)] block font-sans">
                Aislada de navegadores y DevTools
              </span>
            </div>

            <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-none space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)] uppercase font-heading font-medium">
                  Cálculo de Precios
                </span>
                <Server className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-primary font-sans font-medium">
                Route /api/quote
              </p>
              <span className="text-[11px] text-[var(--text-secondary)] block font-sans">
                Costos brutos y márgenes autoritativos
              </span>
            </div>

            <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-none space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)] uppercase font-heading font-medium">
                  Integración Sheets
                </span>
                <ExternalLink className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-sans font-medium text-[var(--text-primary)]">
                CSV & TSV UTF-8
              </p>
              <span className="text-[11px] text-[var(--text-secondary)] block font-sans">
                Compatible con Excel & Google Sheets
              </span>
            </div>

            <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-none space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)] uppercase font-heading font-medium">
                  Flete & Despachos
                </span>
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-primary font-sans font-medium">
                $4.000 ARS fijo
              </p>
              <span className="text-[11px] text-[var(--text-secondary)] block font-sans">
                Retiro taller $0 gratuito
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📦 MODAL: PRODUCT EDIT / CREATE                                           */}
      {/* ========================================================================= */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[7px] max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-heading text-base text-[var(--text-primary)] font-medium">
                {editingProduct.id ? "Editar Sustrato / Producto" : "Nuevo Sustrato en Catálogo"}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-[var(--text-secondary)] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Nombre del Material</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                    placeholder="Ej: Lona Frontlight 13 oz Blackout"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Categoría</label>
                  <select
                    value={editingProduct.category || "lonas"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <option value="lonas">Lonas</option>
                    <option value="vinilos">Vinilos</option>
                    <option value="rigidos">Rígidos / Placas</option>
                    <option value="portabanners">Portabanners</option>
                    <option value="insumos">Insumos & Cintas</option>
                    <option value="estructuras">Estructuras</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Modalidad de Cálculo</label>
                  <select
                    value={editingProduct.mode || "m2"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, mode: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <option value="m2">m² (Superficie)</option>
                    <option value="metro_lineal">Metro Lineal</option>
                    <option value="unidad">Por Unidad</option>
                    <option value="placa">Por Placa Entera</option>
                  </select>
                </div>

                {editingProduct.mode === "placa" && (
                  <>
                    <div>
                      <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Ancho Placa (cm)</label>
                      <input
                        type="number"
                        value={editingProduct.plateWidthCm || 122}
                        onChange={(e) => setEditingProduct({ ...editingProduct, plateWidthCm: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono-num"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Alto Placa (cm)</label>
                      <input
                        type="number"
                        value={editingProduct.plateHeightCm || 244}
                        onChange={(e) => setEditingProduct({ ...editingProduct, plateHeightCm: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono-num"
                      />
                    </div>
                  </>
                )}

                {editingProduct.mode === "metro_lineal" && (
                  <div>
                    <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Ancho Bobina (cm)</label>
                    <input
                      type="number"
                      value={editingProduct.linearWidthCm || 150}
                      onChange={(e) => setEditingProduct({ ...editingProduct, linearWidthCm: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono-num"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Costo Base ARS</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.costARS || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, costARS: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono-num"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Margen Comercial (%)</label>
                  <input
                    type="number"
                    value={editingProduct.marginPercent || 100}
                    onChange={(e) => setEditingProduct({ ...editingProduct, marginPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono-num"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Descripción Breve</label>
                  <input
                    type="text"
                    value={editingProduct.shortDesc || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, shortDesc: e.target.value })}
                    className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                    placeholder="Ej: Apta intemperie, soldable con alta resistencia al viento"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-[7px] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[7px] bg-primary text-white font-medium"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📥 MODAL: GOOGLE SHEETS IMPORT & LIVE SYNC                                 */}
      {/* ========================================================================= */}
      {isSheetsImportOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[7px] max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                <h3 className="font-heading text-base text-[var(--text-primary)] font-medium">
                  Sincronizar Precios con Google Sheets
                </h3>
              </div>
              <button onClick={() => setIsSheetsImportOpen(false)} className="text-[var(--text-secondary)] hover:text-white">✕</button>
            </div>

            {/* TAB SELECTOR: URL / COPIAR Y PEGAR */}
            <div className="flex rounded-[7px] bg-[var(--bg-surface-subtle)] p-1 border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setSheetsSyncMode("url")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-[5px] transition-all ${
                  sheetsSyncMode === "url"
                    ? "bg-primary text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Conexión en Vivo por Link / ID
              </button>
              <button
                type="button"
                onClick={() => setSheetsSyncMode("paste")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-[5px] transition-all ${
                  sheetsSyncMode === "paste"
                    ? "bg-primary text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Copiar y Pegar Celdas
              </button>
            </div>

            {sheetsSyncMode === "url" ? (
              <div className="space-y-3">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Ingresá el enlace completo o ID de tu <strong>Google Sheet</strong> de costos. El sistema leerá automáticamente las columnas <em>(Nombre, Categoria, Unidad_Calculo, Costo_ARS, Margen_%)</em> y actualizará todo el catálogo en vivo.
                </p>
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1 font-medium">
                    Link de Google Sheets o Spreadsheet ID
                  </label>
                  <input
                    type="text"
                    value={sheetsSpreadsheetUrl}
                    onChange={(e) => setSheetsSpreadsheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                    className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="p-2.5 rounded-[7px] bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
                  ✓ Compatible con planillas privadas (vía OAuth) o planillas compartidas / publicadas como enlace.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Seleccioná tus celdas en <strong>Google Sheets</strong> o Excel y pegalas aquí:
                </p>
                <textarea
                  rows={6}
                  value={sheetsRawInput}
                  onChange={(e) => setSheetsRawInput(e.target.value)}
                  placeholder="Nombre	Categoria	Unidad_Calculo	Costo_ARS	Margen_%
Lona Front 13oz	lonas	m2	7500	100
Placa PVC 3mm	rigidos	placa	42000	100"
                  className="w-full p-3 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {importStatusMsg && (
              <p className="text-xs text-primary font-medium">{importStatusMsg}</p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setIsSheetsImportOpen(false)}
                className="px-4 py-2 rounded-[7px] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs"
              >
                Cancelar
              </button>
              {sheetsSyncMode === "url" ? (
                <button
                  type="button"
                  disabled={isSyncingSheetsLive}
                  onClick={handleLiveSheetsSync}
                  className="px-4 py-2 rounded-[7px] bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheetsLive ? "animate-spin" : ""}`} />
                  <span>{isSyncingSheetsLive ? "Sincronizando..." : "Sincronizar desde Sheet"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleImportSheets}
                  className="px-4 py-2 rounded-[7px] bg-primary text-white font-medium text-xs flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Procesar & Sincronizar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ✏️ MODAL: BLOG POST EDIT / CREATE                                         */}
      {/* ========================================================================= */}
      {isBlogModalOpen && editingPost && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[7px] max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-heading text-base text-[var(--text-primary)] font-medium">
                {editingPost.id ? "Editar Artículo del Blog" : "Nuevo Artículo Técnico"}
              </h3>
              <button onClick={() => setIsBlogModalOpen(false)} className="text-[var(--text-secondary)] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveBlogPost} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Título del Artículo</label>
                <input
                  type="text"
                  required
                  value={editingPost.title || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  placeholder="Ej: Guía de confección para marquesinas de alto impacto"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Etiqueta / Tag</label>
                  <input
                    type="text"
                    value={editingPost.tag || "Pre-Prensa"}
                    onChange={(e) => setEditingPost({ ...editingPost, tag: e.target.value })}
                    className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Tiempo de Lectura</label>
                  <input
                    type="text"
                    value={editingPost.readTime || "4 min de lectura"}
                    onChange={(e) => setEditingPost({ ...editingPost, readTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Resumen / Bajada</label>
                <textarea
                  rows={2}
                  value={editingPost.excerpt || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  className="w-full p-2.5 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  placeholder="Breve introducción para el feed del blog..."
                />
              </div>

              <div>
                <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Contenido Markdown</label>
                <textarea
                  rows={9}
                  required
                  value={editingPost.content || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="w-full p-3 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-xs"
                  placeholder="## Título de sección&#10;&#10;Contenido detallado en markdown..."
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPost.published ?? true}
                    onChange={(e) => setEditingPost({ ...editingPost, published: e.target.checked })}
                    className="rounded text-primary"
                  />
                  <span>Publicar inmediatamente</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPost.featured ?? false}
                    onChange={(e) => setEditingPost({ ...editingPost, featured: e.target.checked })}
                    className="rounded text-primary"
                  />
                  <span>Destacar en portada</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-4 py-2 rounded-[7px] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[7px] bg-primary text-white font-medium"
                >
                  Guardar Artículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📝 MODAL: ORDER DETAILS & PRIORITY EDIT                                   */}
      {/* ========================================================================= */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[7px] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-heading text-base text-[var(--text-primary)] font-medium">
                Editar Prioridad & Notas de Taller ({editingOrder.orderNumber || editingOrder.id})
              </h3>
              <button onClick={() => setEditingOrder(null)} className="text-[var(--text-secondary)] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveOrderDetails} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Nivel de Prioridad</label>
                <select
                  value={editingOrder.priority || "normal"}
                  onChange={(e) => setEditingOrder({ ...editingOrder, priority: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                >
                  <option value="urgente">🔴 URGENTE (Prioridad 1 Taller)</option>
                  <option value="alta">🟠 Alta</option>
                  <option value="normal">⚪ Normal</option>
                  <option value="baja">🔵 Baja</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Tipo de Cliente</label>
                <select
                  value={editingOrder.customerType || "comun"}
                  onChange={(e) => setEditingOrder({ ...editingOrder, customerType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                >
                  <option value="agencia">🏢 Agencia de Publicidad</option>
                  <option value="imprenta">🖨️ Imprenta Colega</option>
                  <option value="cartelero">🪵 Cartelero del Gremio</option>
                  <option value="comun">👤 Cliente Común</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Estado de Producción</label>
                <select
                  value={editingOrder.status}
                  onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                >
                  <option value="pendiente">Pendiente de Acreditación</option>
                  <option value="en_produccion">En Producción (Plotter)</option>
                  <option value="terminaciones">Terminaciones & Ojales</option>
                  <option value="despachado">Despachado</option>
                  <option value="entregado">Entregado</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[var(--text-secondary)] mb-1">Notas Internas de Taller</label>
                <textarea
                  rows={3}
                  value={editingOrder.internalNotes || ""}
                  onChange={(e) => setEditingOrder({ ...editingOrder, internalNotes: e.target.value })}
                  className="w-full p-2.5 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  placeholder="Ej: Refuerzo perimetral con vaina termosellada de 10 cm..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-[7px] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[7px] bg-primary text-white font-medium"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 👤 TAB 7: USERS MANAGEMENT                                               */}
      {/* ========================================================================= */}
      {activeTab === "usuarios" && (
        <div className="p-6 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
          <h2 className="font-heading text-lg text-[var(--text-primary)] font-medium">Usuarios Registrados</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] uppercase text-[10px] font-heading font-medium">
                <tr>
                  <th className="py-2.5 px-3">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {users.map((u, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-3">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 📜 HISTORIAL DE CAMBIOS & AUDIT LOG MODAL (FIRESTORE) */}
      <OrderAuditLogModal
        order={auditLogOrder}
        isOpen={isAuditModalOpen}
        onClose={() => {
          setIsAuditModalOpen(false);
          setAuditLogOrder(null);
        }}
      />

      {/* 🛡️ VERIFICACIÓN DE DATOS PRE-PRODUCCIÓN MODAL (MEDIDAS Y MATERIAL) */}
      <ProductionVerificationModal
        order={verificationOrder}
        targetStatus={pendingTargetStatus}
        isOpen={Boolean(verificationOrder)}
        onClose={() => {
          setVerificationOrder(null);
          setPendingTargetStatus("");
        }}
        onConfirm={() => {
          if (verificationOrder && pendingTargetStatus) {
            handleUpdateOrderStatus(verificationOrder, pendingTargetStatus, true);
            setVerificationOrder(null);
            setPendingTargetStatus("");
          }
        }}
      />

      {/* 🔍 DETALLE COMPLETO DEL PEDIDO (VISTA) */}
      <OrderDetailModal
        order={selectedOrderDetail}
        onClose={() => setSelectedOrderDetail(null)}
      />
    </div>
  );
};
