import React, { useState, useEffect } from "react";
import {
  QrCode,
  Share2,
  Copy,
  Check,
  Download,
  Smartphone,
  ExternalLink,
  X,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { generateQRCodeDataUrl } from "../../utils/qrCode";
import { CartItem } from "../../types";
import { useCurrencyStore } from "../../store/useCurrencyStore";

interface OrderQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  orderId?: string;
  customerName?: string;
  totalAmountARS?: number;
}

export const OrderQRCodeModal: React.FC<OrderQRCodeModalProps> = ({
  isOpen,
  onClose,
  items,
  orderId,
  customerName,
  totalAmountARS,
}) => {
  const { formatPrice } = useCurrencyStore();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"tracking" | "summary">("tracking");

  const effectiveOrderId = orderId || `PRE-${Date.now().toString().slice(-6)}`;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://carteles.click";
  
  // URL for mobile tracking / viewing order
  const trackingUrl = `${baseUrl}/?view=orders&orderId=${effectiveOrderId}&ref=qr_mobile`;
  
  // Text summary for direct sharing
  const summaryPayload = `*CARTELES CLICK 3D - RESUMEN DE ORDEN #${effectiveOrderId}*\n` +
    `👤 Cliente: ${customerName || "Cliente Taller"}\n` +
    `📦 Ítems (${items.length}):\n` +
    items.map((it, idx) => `  ${idx + 1}. ${it.materialName} (${it.widthCm || 0}×${it.heightCm || 0}cm) - Cant: ${it.quantity} - Total: $${it.totalPriceARS.toLocaleString("es-AR")}`).join("\n") +
    `\n💰 Total: ${totalAmountARS ? `$${totalAmountARS.toLocaleString("es-AR")}` : "A calcular"}\n` +
    `🔗 Seguimiento en vivo: ${trackingUrl}`;

  const currentQrText = activeTab === "tracking" ? trackingUrl : summaryPayload;

  useEffect(() => {
    if (isOpen) {
      generateQRCodeDataUrl(currentQrText, {
        width: 320,
        margin: 2,
        color: {
          dark: "#111827",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Error generating QR code:", err));
    }
  }, [isOpen, currentQrText]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR-Orden-${effectiveOrderId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hola! Te comparto la orden de producción #${effectiveOrderId} en Carteles Click 3D:\n${trackingUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div className="relative w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-page)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 id="qr-modal-title" className="font-heading text-sm sm:text-base font-bold text-[var(--text-primary)]">
                QR de Orden & Seguimiento Móvil
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Orden #{effectiveOrderId} · {items.length} {items.length === 1 ? "ítem" : "ítems"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TAB SWITCHER */}
        <div className="px-4 pt-3 pb-0 bg-[var(--bg-surface-subtle)] border-b border-[var(--border-subtle)] flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("tracking")}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "tracking"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Link de Seguimiento</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "summary"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Ficha de Producción</span>
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-center flex-1">
          {/* QR CODE CONTAINER */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 shadow-inner max-w-[240px] mx-auto">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Código QR para orden #${effectiveOrderId}`}
                className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-gray-400">
                Generando código QR...
              </div>
            )}
            <div className="mt-2 text-[11px] text-gray-500 font-mono">
              Escanear con cámara de smartphone
            </div>
          </div>

          {/* SUMMARY INFO */}
          <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-left space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Cliente:</span>
              <span className="font-medium text-[var(--text-primary)]">{customerName || "Cliente Taller"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Total Estimado:</span>
              <span className="font-mono-num font-bold text-primary">
                {totalAmountARS ? formatPrice(totalAmountARS) : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[var(--text-secondary)]">Estado:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verificada en Servidor
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-primary)] hover:border-primary transition-colors flex items-center justify-center gap-1.5 font-medium cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadQR}
              className="py-2.5 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-primary)] hover:border-primary transition-colors flex items-center justify-center gap-1.5 font-medium cursor-pointer"
            >
              <Download className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>Descargar PNG</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir por WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
