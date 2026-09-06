import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  History, 
  X, 
  Clock, 
  UserCheck, 
  ArrowRight, 
  ShieldCheck, 
  MessageSquare, 
  Send,
  Loader2,
  FileText
} from "lucide-react";
import { Order } from "../../types";
import { OrderAuditLog, getOrderAuditLogs, recordOrderAuditLog } from "../../lib/firestore";
import { useAuthStore } from "../../store/useAuthStore";
import { useNotificationStore } from "../../store/useNotificationStore";

interface OrderAuditLogModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderAuditLogModal: React.FC<OrderAuditLogModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [logs, setLogs] = useState<OrderAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  useEffect(() => {
    if (order && isOpen) {
      loadLogs();
    }
  }, [order, isOpen]);

  const loadLogs = async () => {
    if (!order) return;
    setLoading(true);
    try {
      // 1. Fetch from Firestore subcollection
      const firestoreLogs = await getOrderAuditLogs(order.id);
      
      // 2. Also merge with any in-memory/embedded auditHistory if available
      const embeddedLogs = (order as any).auditHistory || [];
      
      const allLogs = [...firestoreLogs];
      embeddedLogs.forEach((emb: OrderAuditLog) => {
        if (!allLogs.some(l => l.timestamp === emb.timestamp && l.newStatus === emb.newStatus)) {
          allLogs.push(emb);
        }
      });

      // Sort descending by timestamp
      allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(allLogs);
    } catch (e) {
      console.warn("Error cargando audit logs:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAuditNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !noteText.trim() || !user) return;

    setIsSubmittingNote(true);
    try {
      const newEntry = await recordOrderAuditLog({
        orderId: order.id,
        orderNumber: order.orderNumber,
        previousStatus: order.status || "pendiente",
        newStatus: order.status || "pendiente",
        adminUser: {
          uid: user.uid,
          email: user.email || "admin@carteles.click",
          displayName: user.displayName || user.email?.split("@")[0] || "Administrador",
        },
        notes: `Nota de Auditoría: ${noteText.trim()}`,
      });

      setLogs((prev) => [newEntry, ...prev]);
      setNoteText("");
      addNotification({
        type: "system",
        title: "Nota de Auditoría Registrada",
        message: "Se ha anexado la observación al historial operativo del pedido.",
        priority: "normal",
      });
    } catch (err: any) {
      addNotification({
        type: "system",
        title: "Error al registrar nota",
        message: err.message || "No se pudo guardar la nota de auditoría.",
        priority: "high",
      });
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(d);
    } catch {
      return iso;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    let bg = "bg-zinc-800 text-zinc-300 border-zinc-700";
    if (s.includes("produccion") || s.includes("impresion")) {
      bg = "bg-blue-950/60 text-blue-300 border-blue-800";
    } else if (s.includes("terminaciones")) {
      bg = "bg-amber-950/60 text-amber-300 border-amber-800";
    } else if (s.includes("despachado") || s.includes("listo")) {
      bg = "bg-purple-950/60 text-purple-300 border-purple-800";
    } else if (s.includes("entregado")) {
      bg = "bg-emerald-950/60 text-emerald-300 border-emerald-800";
    } else if (s.includes("cancelado")) {
      bg = "bg-red-950/60 text-red-300 border-red-800";
    }

    return (
      <span className={`px-2 py-0.5 rounded-[4px] text-[11px] font-mono border ${bg}`}>
        {status}
      </span>
    );
  };

  if (!isOpen || !order) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[7px] shadow-2xl p-6 text-[var(--text-primary)] max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[7px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
                  Historial de Auditoría (Audit Log)
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Pedido #{order.orderNumber} · Cliente: <strong>{order.customerName}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[7px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* TIMELINE LIST */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
            {loading ? (
              <div className="p-8 text-center flex flex-col items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span>Consultando registros de trazabilidad en Firestore...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center rounded-[7px] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]">
                <FileText className="w-8 h-8 text-[var(--text-secondary)] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium text-[var(--text-primary)]">
                  No hay cambios de estado registrados aún para este pedido.
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                  Cualquier actualización de estado o nota administrativa quedará documentada con firma de administrador.
                </p>
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={log.id || `${log.timestamp}-${index}`}
                  className="p-3.5 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-medium text-[var(--text-primary)]">
                        {log.adminName || log.adminEmail}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        ({log.adminEmail})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </div>

                  {/* STATUS TRANSITION */}
                  {log.previousStatus !== log.newStatus ? (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[var(--text-secondary)] text-[11px]">Transición:</span>
                      {getStatusBadge(log.previousStatus)}
                      <ArrowRight className="w-3 h-3 text-[var(--text-secondary)]" />
                      {getStatusBadge(log.newStatus)}
                    </div>
                  ) : null}

                  {/* NOTES */}
                  {log.notes && (
                    <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] p-2 rounded-[5px] border border-[var(--border-subtle)] leading-relaxed">
                      {log.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* ADD AUDIT NOTE FORM */}
          <form onSubmit={handleAddAuditNote} className="pt-3 border-t border-[var(--border-subtle)] flex gap-2">
            <div className="relative flex-1">
              <MessageSquare className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Escribir una anotación de auditoría o control de calidad..."
                className="w-full pl-9 pr-3 py-2 rounded-[7px] text-xs bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmittingNote || !noteText.trim()}
              className="px-4 py-2 rounded-[7px] bg-primary text-white text-xs font-medium hover:brightness-105 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {isSubmittingNote ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Registrar Nota</span>
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
