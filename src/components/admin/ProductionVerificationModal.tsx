import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Ruler, 
  Layers, 
  ShieldAlert,
  Printer,
  ChevronRight
} from "lucide-react";
import { Order } from "../../types";
import { validateOrderForProduction } from "../../utils/orderValidation";

interface ProductionVerificationModalProps {
  order: Order | null;
  targetStatus: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ProductionVerificationModal: React.FC<ProductionVerificationModalProps> = ({
  order,
  targetStatus,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !order) return null;

  const validation = validateOrderForProduction(order);
  const isTransitioningToProduction = targetStatus === "en_produccion" || targetStatus === "impresion";

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
          className="relative w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[7px] shadow-2xl p-6 text-[var(--text-primary)] flex flex-col space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-start justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-[7px] flex items-center justify-center ${
                  validation.isValid
                    ? "bg-blue-950/50 border border-blue-800 text-blue-400"
                    : "bg-red-950/50 border border-red-800 text-red-400"
                }`}
              >
                {validation.isValid ? (
                  <Printer className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
                  {validation.isValid
                    ? "Confirmar Envío a Taller de Producción"
                    : "Verificación de Datos Requerida"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Pedido #{order.orderNumber} · {order.customerName}
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

          {/* CRITICAL VERIFICATION CHECKLIST */}
          <div className="space-y-3">
            <div className="p-3 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs space-y-2">
              <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                Control de Calidad Pre-Impresión (Checklist)
              </div>

              {/* VALIDATION ERRORS (BLOCKERS) */}
              {!validation.isValid && (
                <div className="p-3 rounded-[6px] bg-red-950/40 border border-red-800 text-red-300 space-y-1.5">
                  <div className="flex items-center gap-2 font-medium text-red-200">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Bloqueo Operativo: Faltan especificaciones técnicas críticas</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                    {validation.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ITEMS TECHNICAL OVERVIEW */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] text-[var(--text-secondary)] block font-medium">
                  Detalle técnico de los ítems a producir:
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((it, idx) => {
                      const hasDimensions = Boolean(
                        it.mode === "unidad" || (it.widthCm && it.heightCm && it.widthCm > 0 && it.heightCm > 0)
                      );
                      const hasMaterial = Boolean(it.materialName && it.materialName.trim() !== "");
                      const hasFiles = Boolean(
                        it.fileAttachment?.name ||
                        it.fileAttachment?.previewUrl ||
                        it.fileAttachment?.driveUrl ||
                        (it as any).fileUrl ||
                        (it.posterDesignData && (it.posterDesignData.headline || it.posterDesignData.bodyText || it.posterDesignData.heroImageUrl)) ||
                        it.hasAiDesign ||
                        order.internalNotes?.includes("drive.google.com")
                      );

                      const isItemValid = hasDimensions && hasMaterial && hasFiles;

                      return (
                        <div
                          key={it.id || idx}
                          className="flex items-center justify-between p-2 rounded-[5px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
                            <div>
                              <span className="font-medium text-[var(--text-primary)]">
                                {it.materialName || "Material no definido"}
                              </span>
                              <div className="text-[10px] text-[var(--text-secondary)] flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Ruler className="w-3 h-3" />
                                  {it.mode === "unidad" ? "Modo Unidad" : `${it.widthCm || 0} × ${it.heightCm || 0} cm`}
                                </span>
                                <span>· Cant: {it.quantity || 1}</span>
                                <span className={hasFiles ? "text-emerald-400" : "text-amber-400 font-medium"}>
                                  · {hasFiles ? "Archivo adjunto" : "Falta archivo"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isItemValid ? (
                              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Apto</span>
                              </span>
                            ) : (
                              <span className="text-red-400 text-[11px] font-medium">
                                Incompleto
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-red-400 p-2">Sin ítems cargados</div>
                  )}
                </div>
              </div>

              {/* WARNINGS */}
              {validation.warnings.length > 0 && (
                <div className="p-2.5 rounded-[5px] bg-amber-950/30 border border-amber-800 text-amber-300 text-[11px] space-y-1">
                  <span className="font-medium block text-amber-200">Avisos del taller:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {validation.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-[7px] text-xs font-medium border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={!validation.isValid}
              onClick={onConfirm}
              className="px-4 py-2 rounded-[7px] text-xs font-medium bg-primary text-white hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {validation.isValid
                  ? "Autorizar & Pasar a Producción"
                  : "Corregir Datos para Autorizar"}
              </span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
