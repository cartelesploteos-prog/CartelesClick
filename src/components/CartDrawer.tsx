import React, { useState, useEffect } from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  Store,
  Clock,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  ArrowRight,
  Sparkles,
  HardDrive,
  ExternalLink,
  QrCode,
  Building2,
  Share2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { useCartStore } from "../store/useCartStore";
import { sendHighValueOrderNotification } from "../utils/notifications";
import { useAuthStore } from "../store/useAuthStore";
import { useCurrencyStore } from "../store/useCurrencyStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { triggerOrderCelebration } from "./ui/ToastCelebration";
import { ShippingSelector } from "./ui/ShippingSelector";
import { BorderBeam } from "./ui/BorderBeam";
import { OrderQRCodeModal } from "./ui/OrderQRCodeModal";
import { IconBadge } from "./ui/IconBadge";
import { PrintReadinessChecklist } from "./ui/PrintReadinessChecklist";

interface CartDrawerProps {
  onOrderPlaced: (orderId: string) => void;
  onNavigate?: (view: string, param?: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderPlaced, onNavigate }) => {
  const { t } = useTranslation();
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
    shippingMethod,
    setShippingMethod,
    getItemsTotal,
    getShippingFee,
    getGrandTotal,
    clearCart,
  } = useCartStore();
  const { user } = useAuthStore();
  const { formatPrice } = useCurrencyStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [lastNotifiedVolume, setLastNotifiedVolume] = useState<number>(0);
  const [customerName, setCustomerName] = useState(
    (user as any)?.name || user?.displayName || "Cliente Taller"
  );
  const [customerEmail, setCustomerEmail] = useState(
    user?.email || "cliente@carteles.click"
  );
  const [customerPhone, setCustomerPhone] = useState(
    (user as any)?.phone || user?.phoneNumber || "+54 11 4892-1100"
  );

  // Volume metrics
  const totalUnits = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
  const totalAreaM2 = items.reduce((acc, it) => {
    const w = it.widthCm || 100;
    const h = it.heightCm || 100;
    return acc + ((w * h) / 10000) * (it.quantity || 1);
  }, 0);

  const isHighVolume = totalUnits >= 5 || totalAreaM2 >= 10;

  // Trigger volume update notification when order volume expands significantly
  useEffect(() => {
    if (isHighVolume && totalUnits !== lastNotifiedVolume && totalUnits >= 5) {
      setLastNotifiedVolume(totalUnits);
      useNotificationStore.getState().addNotification({
        type: "promotion",
        title: "💼 Escala de Descuento por Volumen",
        message: `Tenés ${totalUnits} unidades en el carrito (${totalAreaM2.toFixed(1)} m²). Accedé a beneficios de gremio y hasta 15% OFF en el Canal Mayorista.`,
        link: "mayoristas",
        priority: "normal",
      });
    }
  }, [totalUnits, totalAreaM2, isHighVolume, lastNotifiedVolume]);

  const drawerRef = React.useRef<HTMLDivElement>(null);
  const triggerElementRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      // Focus close button or first focusable element inside drawer
      const timer = setTimeout(() => {
        const closeBtn = document.getElementById("btn-close-cart");
        if (closeBtn) {
          closeBtn.focus();
        } else {
          drawerRef.current?.focus();
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
          return;
        }

        if (e.key === "Tab" && drawerRef.current) {
          const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
        if (triggerElementRef.current) {
          triggerElementRef.current.focus();
        }
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, setIsOpen]);

  const itemsTotal = getItemsTotal();
  const shippingFee = getShippingFee();
  const grandTotal = getGrandTotal();

  const totalFinishings = items.reduce(
    (sum, item) => sum + (item.finishingsSubtotalARS ?? 0) * item.quantity,
    0
  );
  const totalAiFees = items.reduce(
    (sum, item) => sum + (item.aiDesignFeeARS ?? 0) * item.quantity,
    0
  );
  const totalBaseMaterials = items.reduce((sum, item) => {
    const base =
      item.baseMaterialSubtotalARS !== undefined
        ? item.baseMaterialSubtotalARS
        : (item.unitPriceARS ?? 0) - (item.finishingsSubtotalARS ?? 0) - (item.aiDesignFeeARS ?? 0);
    return sum + Math.max(0, base) * item.quantity;
  }, 0);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    try {
      const response = await fetch("/api/checkout/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          shippingMethod,
          items,
        }),
      });
      const data = await response.json();
      if (data.success && data.order) {
        triggerOrderCelebration();
        
        // Dispara notificación push de alto valor (silencioso para no bloquear el flujo)
        sendHighValueOrderNotification(data.order);

        clearCart();
        setIsOpen(false);
        
        // If Mercado Pago initPoint is returned and we are not in iframe or user clicks proceed
        if (data.initPoint && !data.initPoint.includes("&demo=true")) {
          window.location.href = data.initPoint;
        } else {
          onOrderPlaced(data.order.id);
        }
      } else if (data.error) {
        alert(`Error al generar preferencia: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al procesar el pedido con Mercado Pago:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
        >
          {/* BACKDROP WITH SMOOTH FADE ANIMATION */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* SLIDE-OVER DRAWER WITH SMOOTH SPRING SLIDE */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10 pointer-events-none">
            <motion.div
              ref={drawerRef}
              tabIndex={-1}
              initial={{ x: "100%", opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.8 }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 340,
                mass: 0.9,
              }}
              className="w-full max-w-md bg-[var(--bg-page)] flex flex-col border-l border-[var(--border-subtle)] h-[100dvh] max-h-[100dvh] shadow-2xl pointer-events-auto outline-none"
            >
              {/* HEADER */}
          <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-page)] shrink-0">
            <div className="flex items-center gap-2.5">
              <IconBadge
                icon={ShoppingBag}
                size="md"
                variant="primary"
                containerStyle="solid"
              />
              <div>
                <h3
                  id="cart-drawer-title"
                  className="font-heading text-[var(--text-primary)] text-base font-medium"
                >
                  {t("cart_title")}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {items.length} {t("cart_configured")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="p-2 rounded-[7px] text-[var(--text-secondary)] hover:text-primary hover:bg-[var(--bg-surface-subtle)] transition-colors border border-[var(--border-subtle)] flex items-center gap-1 text-xs cursor-pointer"
                  title="Generar QR para Móvil"
                  aria-label="Generar código QR para seguimiento en móvil"
                >
                  <QrCode className="w-4 h-4 text-primary" />
                  <span className="text-[11px] font-medium hidden sm:inline">QR Móvil</span>
                </button>
              )}
              <button
                id="btn-close-cart"
                onClick={() => setIsOpen(false)}
                className="min-h-[2.75rem] min-w-[2.75rem] p-2.5 rounded-[7px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors flex items-center justify-center border border-[var(--border-subtle)] focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                aria-label="Cerrar carrito"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* HIGH VOLUME / WHOLESALE SUGGESTION BANNER */}
          {items.length > 0 && isHighVolume && (
            <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/10 border-b border-amber-500/30 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary shrink-0 animate-bounce" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-[var(--text-primary)] block">
                    ¡Volumen mayorista alcanzado ({totalUnits} u · {totalAreaM2.toFixed(1)} m²)!
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    Podés calificar para cuenta gremio y hasta 15% OFF directo.
                  </span>
                </div>
              </div>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate("mayoristas");
                  }}
                  className="px-2.5 py-1 rounded-md bg-primary text-white text-[10px] font-bold shrink-0 hover:bg-[var(--color-primary-hover)] transition-colors cursor-pointer"
                >
                  Ver Gremio
                </button>
              )}
            </div>
          )}

          {/* ITEM LIST */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <IconBadge
                  icon={ShoppingBag}
                  size="xl"
                  variant="neutral"
                  containerStyle="subtle"
                  className="mx-auto"
                />
                <h4 className="font-heading text-[var(--text-primary)] text-sm font-medium">
                  {t("cart_empty_title")}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
                  {t("cart_empty_desc")}
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.customLabel && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono font-bold">
                            {item.customLabel}
                          </span>
                        )}
                        <h4 className="text-xs font-heading font-medium text-[var(--text-primary)]">
                          {item.materialName}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        {item.widthCm && item.heightCm
                          ? `${item.widthCm}×${item.heightCm} cm`
                          : "Unidad estándar"}{" "}
                        · <span className="capitalize">{item.category}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="min-h-[2.25rem] min-w-[2.25rem] flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 transition-colors p-1.5 rounded-[7px] hover:bg-red-50 dark:hover:bg-red-950/40 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                      title="Eliminar producto"
                      aria-label={`Eliminar ${item.materialName} del carrito`}
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.85} aria-hidden="true" />
                    </button>
                  </div>

                  {/* TRANSPARENCY NOTICES */}
                  {item.transparencyNotes && item.transparencyNotes.length > 0 && (
                    <div className="p-2.5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
                        <IconBadge
                          icon={AlertCircle}
                          size="compact"
                          variant="primary"
                          containerStyle="subtle"
                        />
                        <span className="font-medium">Desglose de cálculo:</span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-[var(--text-secondary)]">
                        {item.transparencyNotes[0]}
                      </p>
                    </div>
                  )}

                  {/* GOOGLE DRIVE O ATTACHMENT BADGE IF PRESENT */}
                  {item.fileAttachment && (
                    <div className="p-2 rounded-[7px] bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-[11px] gap-2">
                      <span className="flex items-center gap-1.5 text-[var(--text-primary)] font-medium truncate">
                        <IconBadge
                          icon={HardDrive}
                          size="compact"
                          variant="info"
                          containerStyle="subtle"
                        />
                        <span className="truncate">{item.fileAttachment.name}</span>
                      </span>
                      {item.fileAttachment.driveUrl ? (
                        <a
                          href={item.fileAttachment.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5 shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded"
                        >
                          <span>Ver</span>
                          <ExternalLink className="w-3 h-3" strokeWidth={1.85} />
                        </a>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-mono shrink-0">
                          Adjunto
                        </span>
                      )}
                    </div>
                  )}

                  {/* AI POSTER BADGE IF ATTACHED */}
                  {item.posterDesignData && (
                    <div className="p-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-primary/20 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 text-[var(--text-primary)] font-medium">
                        <IconBadge
                          icon={Sparkles}
                          size="compact"
                          variant="accent"
                          containerStyle="subtle"
                        />
                        Póster Diseñado con IA
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-[7px] bg-accent text-black font-medium">
                        {item.posterDesignData.outputFormat}
                      </span>
                    </div>
                  )}

                  {/* PRINT QUALITY & INK */}
                  {(item.printQualityLabel || item.inkTypeLabel) && (
                    <div className="p-2 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
                      <div className="flex flex-col gap-0.5">
                        {item.printQualityLabel && <span className="text-[var(--text-secondary)]">Calidad: <strong className="text-[var(--text-primary)]">{item.printQualityLabel}</strong></span>}
                        {item.inkTypeLabel && <span className="text-[var(--text-secondary)]">Tintas: <strong className="text-[var(--text-primary)]">{item.inkTypeLabel}</strong></span>}
                      </div>
                    </div>
                  )}
                  {/* FINISHINGS & AI FEE DETAILED BREAKDOWN */}
                  {((item.finishingsBreakdown && item.finishingsBreakdown.length > 0) || item.aiDesignFeeARS) && (
                    <div className="p-2.5 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1.5 text-[11px]">
                      {item.baseMaterialSubtotalARS !== undefined && (
                        <div className="flex justify-between text-[var(--text-secondary)]">
                          <span>Sustrato e impresión:</span>
                          <span className="font-mono-num text-[var(--text-primary)] font-medium">
                            {formatPrice(item.baseMaterialSubtotalARS)}
                          </span>
                        </div>
                      )}

                      {item.finishingsBreakdown && item.finishingsBreakdown.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-[var(--border-subtle)]">
                          <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-medium block">
                            Terminaciones:
                          </span>
                          {item.finishingsBreakdown.map((f, idx) => (
                            <div key={idx} className="flex justify-between text-[var(--text-secondary)] pl-1.5">
                              <span className="truncate max-w-[200px]">{f.name}:</span>
                              <span className="font-mono-num text-primary font-medium">
                                +{formatPrice(f.totalCostARS ?? f.subtotalARS ?? 0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {item.aiDesignFeeARS !== undefined && item.aiDesignFeeARS > 0 && (
                        <div className="flex justify-between text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-primary" />
                            Costo Fijo Diseño IA:
                          </span>
                          <span className="font-mono-num text-primary font-medium">
                            +{formatPrice(item.aiDesignFeeARS)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PRICE & QUANTITY CONTROLS */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center border border-[var(--border-subtle)] rounded-[7px] overflow-hidden bg-[var(--bg-page)]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="min-h-[2.25rem] min-w-[2.25rem] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        title="Restar cantidad"
                        aria-label="Restar una unidad"
                      >
                        <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <span
                        className="px-3 text-xs text-[var(--text-primary)] font-mono-num font-medium"
                        aria-label={`Cantidad ${item.quantity}`}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="min-h-[2.25rem] min-w-[2.25rem] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        title="Sumar cantidad"
                        aria-label="Sumar una unidad"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="text-right">
                      <span className="font-mono-num text-sm text-[var(--text-primary)] font-medium">
                        {formatPrice(item.totalPriceARS ?? 0)}
                      </span>
                      {item.quantity > 1 && item.unitPriceARS !== undefined && (
                        <p className="text-[10px] text-[var(--text-secondary)]">
                          ({formatPrice(item.unitPriceARS)} c/u)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* SHIPPING METHOD SELECTION */}
            {items.length > 0 && (
              <div className="pt-3 border-t border-[var(--border-subtle)]">
                <ShippingSelector
                  value={shippingMethod}
                  onChange={setShippingMethod}
                  showPickupOption={true}
                />
              </div>
            )}

            {/* CUSTOMER QUICK DATA */}
            {items.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium">
                  2. Datos del Titular
                </label>
                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <div>
                    <label htmlFor="customer-name-input" className="sr-only">Nombre completo</label>
                    <input
                      id="customer-name-input"
                      type="text"
                      placeholder="Nombre completo"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full min-h-[2.75rem] px-3.5 py-2.5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="customer-email-input" className="sr-only">Email de contacto</label>
                    <input
                      id="customer-email-input"
                      type="email"
                      placeholder="Email de contacto"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full min-h-[2.75rem] px-3.5 py-2.5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                {/* PRE-PRODUCTION PRINT READINESS CHECKLIST */}
                <div className="pt-2">
                  <PrintReadinessChecklist
                    title="Control de Pre-Prensa (Print Readiness)"
                    description="Pautas de taller para asegurar máxima fidelidad antes de confirmar tu pedido."
                    defaultCollapsed={true}
                  />
                </div>
              </div>
            )}
          </div>

          {/* FOOTER TOTALS & CHECKOUT PROMPT */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-page)] space-y-3 shrink-0">
              <div className="space-y-1.5 text-xs" id="cart-summary-breakdown">
                {(totalFinishings > 0 || totalAiFees > 0) && (
                  <div className="space-y-1 pb-1.5 border-b border-[var(--border-subtle)] text-[11px]">
                    <div className="flex justify-between text-[var(--text-secondary)]">
                      <span>Sustratos e impresión:</span>
                      <span className="font-mono-num text-[var(--text-primary)] font-medium">
                        {formatPrice(totalBaseMaterials)}
                      </span>
                    </div>

                    {totalFinishings > 0 && (
                      <div className="flex justify-between text-[var(--text-secondary)]">
                        <span>Terminaciones y confección:</span>
                        <span className="font-mono-num text-primary font-medium">
                          +{formatPrice(totalFinishings)}
                        </span>
                      </div>
                    )}

                    {totalAiFees > 0 && (
                      <div className="flex justify-between text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-primary" />
                          Servicio Diseño Asistido IA:
                        </span>
                        <span className="font-mono-num text-primary font-medium">
                          +{formatPrice(totalAiFees)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>{t("cart_subtotal")}:</span>
                  <span className="font-mono-num text-[var(--text-primary)] font-medium">
                    {formatPrice(itemsTotal ?? 0)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[var(--text-secondary)] min-h-[1.5rem]">
                  <span>{t("cart_shipping")}:</span>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`shipping-row-${shippingMethod}-${shippingFee}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                      className="font-mono-num text-[var(--text-primary)] font-medium text-right"
                    >
                      {shippingMethod === "a_despacho" ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-1">
                          +{formatPrice(shippingFee ?? 4000)} <span className="text-[10px] font-normal opacity-80">(Flete a terminal)</span>
                        </span>
                      ) : shippingMethod === "instantaneo" ? (
                        <span className="text-[var(--text-secondary)] text-[11px]">
                          $0 (A coordinar al recibir)
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Sin cargo
                        </span>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex justify-between items-center text-sm text-[var(--text-primary)] pt-2 border-t border-[var(--border-subtle)] font-medium">
                  <span>{t("cart_total")}:</span>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={`grand-total-${grandTotal}-${shippingMethod}`}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                      className="font-mono-num text-base text-primary font-bold inline-block"
                    >
                      {formatPrice(grandTotal ?? 0)}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
              <button
                id="btn-checkout-mercadopago"
                onClick={handleCheckout}
                disabled={isProcessing}
                className="relative overflow-hidden w-full min-h-[2.75rem] py-3 px-4 rounded-[7px] bg-primary text-white text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary font-medium shadow-md"
              >
                {isProcessing ? (
                  <span>Procesando pedido seguro...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" strokeWidth={1.85} aria-hidden="true" />
                    <span>Confirmar y Pagar</span>
                    <ArrowRight className="w-4 h-4 ml-1" strokeWidth={1.85} aria-hidden="true" />
                    <BorderBeam
                      size={48}
                      initialOffset={20}
                      
                    />
                  </>
                )}
              </button>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="py-2 px-3 rounded-[7px] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-primary transition-colors flex items-center justify-center gap-1.5 font-medium cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-primary" strokeWidth={1.85} />
                  <span>Código QR Móvil</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent(
                      `Hola! Te comparto mi pedido en Carteles Click 3D:\n${items.map(it => `• ${it.materialName} (${it.quantity}u)`).join('\n')}\nTotal: ${formatPrice(grandTotal ?? 0)}`
                    );
                    window.open(`https://wa.me/?text=${text}`, "_blank");
                  }}
                  className="py-2 px-3 rounded-[7px] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] hover:text-emerald-500 hover:border-emerald-500 transition-colors flex items-center justify-center gap-1.5 font-medium cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.85} />
                  <span>Compartir Orden</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--text-secondary)]">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" strokeWidth={1.85} aria-hidden="true" />
                <span>Pago protegido · Producción inicia con acreditación</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )}
</AnimatePresence>

{/* ORDER QR CODE MODAL FOR MOBILE SCAN & TRACKING */}
<OrderQRCodeModal
  isOpen={isQrModalOpen}
  onClose={() => setIsQrModalOpen(false)}
  items={items}
  customerName={customerName}
  totalAmountARS={grandTotal ?? 0}
/>
</>
);
};
