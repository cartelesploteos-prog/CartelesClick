import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, FileImage, Calendar, User, Package, Download, History, ExternalLink, FileText } from "lucide-react";

interface OrderDetailModalProps {
  order: any;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const formatARS = (val: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const statusColors: Record<string, string> = {
    pendiente: "bg-amber-100 text-amber-700 border-amber-200",
    en_produccion: "bg-blue-100 text-blue-700 border-blue-200",
    terminaciones: "bg-purple-100 text-purple-700 border-purple-200",
    impresion: "bg-indigo-100 text-indigo-700 border-indigo-200",
    para_retirar: "bg-emerald-100 text-emerald-700 border-emerald-200",
    entregado: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const getStatusColor = (status: string) => statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <AnimatePresence>
      {order && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-surface)] w-full max-w-4xl max-h-[90vh] rounded-[var(--radius-lg)] shadow-xl flex flex-col border border-[var(--border-subtle)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]">
          <div>
            <h2 className="text-xl font-heading font-semibold text-[var(--text-primary)]">
              Detalle del Pedido #{order.orderNumber}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                {String(order.status).replace("_", " ").toUpperCase()}
              </span>
              <span className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details & Customer */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Info */}
            <div className="p-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-[var(--brand-brick)]" />
                Información del Cliente
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[var(--text-secondary)] mb-1">Nombre</p>
                  <p className="font-medium">{order.customerName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[var(--text-secondary)] mb-1">Email</p>
                  <p className="font-medium break-all">{order.customerEmail || "N/A"}</p>
                </div>
                {order.customerPhone && (
                  <div>
                    <p className="text-[var(--text-secondary)] mb-1">Teléfono</p>
                    <p className="font-medium">{order.customerPhone}</p>
                  </div>
                )}
                {order.customerCompany && (
                  <div>
                    <p className="text-[var(--text-secondary)] mb-1">Empresa</p>
                    <p className="font-medium">{order.customerCompany}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="p-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-[var(--brand-brick)]" />
                Detalles de Producción
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[var(--text-secondary)] mb-1">Material</p>
                  <p className="font-medium">{order.material || "No especificado"}</p>
                </div>
                <div>
                  <p className="text-[var(--text-secondary)] mb-1">Medidas (cm)</p>
                  <p className="font-medium">
                    {order.width && order.height ? `${order.width}x${order.height} cm` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--text-secondary)] mb-1">Cantidad</p>
                  <p className="font-medium">{order.quantity || 1}</p>
                </div>
                <div>
                  <p className="text-[var(--text-secondary)] mb-1">Valor Total</p>
                  <p className="font-medium text-emerald-600">
                    {formatARS(order.totalAmountARS || order.totalPriceARS)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[var(--text-secondary)] mb-1">Terminaciones Adicionales</p>
                  <p className="font-medium">{order.finishingOptions?.join(", ") || "Ninguna"}</p>
                </div>
                {order.notes && (
                  <div className="col-span-2">
                    <p className="text-[var(--text-secondary)] mb-1">Notas del Pedido</p>
                    <div className="p-3 bg-white rounded-md text-sm border border-gray-100 whitespace-pre-wrap">
                      {order.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Files & Thumbnails */}
            <div className="p-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-3">
                <FileImage className="w-4 h-4 text-[var(--brand-brick)]" />
                Archivos Adjuntos
              </h3>
              {order.files && order.files.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {order.files.map((file: any, idx: number) => {
                    const isImage = file.type?.startsWith("image/");
                    return (
                      <div key={idx} className="group relative rounded-md border border-[var(--border-subtle)] bg-white overflow-hidden aspect-square flex flex-col items-center justify-center">
                        {isImage && file.url ? (
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-8 h-8 text-gray-400 mb-2" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                          <p className="text-white text-xs truncate w-full mb-2">{file.name}</p>
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white text-black rounded-md hover:bg-gray-100">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : order.designUrl ? (
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-md">
                  <ExternalLink className="w-5 h-5 text-blue-500" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">Enlace a Archivo Externo</p>
                    <a href={order.designUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                      {order.designUrl}
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)] italic">No hay archivos adjuntos en este pedido.</p>
              )}
            </div>
          </div>

          {/* Right Column: Audit History */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-1">
              <History className="w-4 h-4 text-[var(--brand-brick)]" />
              Historial de Auditoría
            </h3>
            <div className="border border-[var(--border-subtle)] rounded-[var(--radius-md)] bg-white overflow-hidden">
              {order.auditHistory && order.auditHistory.length > 0 ? (
                <ul className="divide-y divide-[var(--border-subtle)] max-h-[500px] overflow-y-auto">
                  {order.auditHistory.map((log: any, idx: number) => (
                    <li key={log.id || idx} className="p-3 hover:bg-gray-50/50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold text-gray-800">
                          {log.adminName || log.adminUid || "Sistema"}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-1.5">
                        <span className="px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-600 line-through opacity-70">
                          {String(log.previousStatus || "").replace("_", " ")}
                        </span>
                        <span>→</span>
                        <span className={`px-1.5 py-0.5 rounded-sm font-medium ${getStatusColor(log.newStatus)}`}>
                          {String(log.newStatus || "").replace("_", " ")}
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-xs text-gray-500 mt-2 italic border-l-2 border-gray-200 pl-2">
                          "{log.notes}"
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-[var(--text-secondary)]">
                  <p>No hay registros de auditoría para este pedido.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
    )}
    </AnimatePresence>
  );
};
