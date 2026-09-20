import React from "react";
import { motion } from "framer-motion";
import { X, Printer, Download, CheckSquare, Square, FileText, Settings, ShieldCheck, ExternalLink } from "lucide-react";
import { CartItem } from "../types";
import { generateCartInvoicePdf } from "../utils/generateCartInvoicePdf";
import { useCurrencyStore } from "../store/useCurrencyStore";

interface ResumenOrdenCompraProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingMethod: string;
  shippingFee: number;
  itemsTotal: number;
  grandTotal: number;
}

export const ResumenOrdenCompra: React.FC<ResumenOrdenCompraProps> = ({
  isOpen,
  onClose,
  items,
  customerName,
  customerEmail,
  customerPhone,
  shippingMethod,
  shippingFee,
  itemsTotal,
  grandTotal,
}) => {
  const { formatPrice } = useCurrencyStore();
  const dateStr = new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    generateCartInvoicePdf({
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingMethod,
      shippingFee,
      itemsTotal,
      grandTotal,
    });
  };

  const handleDirectPrint = () => {
    window.print();
  };

  const shippingLabels: Record<string, string> = {
    retiro_taller: "Retiro en Taller Central sin cargo",
    envio_caba: "Envío Moto/Cadetería express",
    envio_gba: "Despacho a Gran Buenos Aires",
    expreso_interior: "Despacho por encomienda (Flete pago en destino)",
    a_despacho: "A Despacho por Expreso (Flete a terminal pago)",
    instantaneo: "Envío Moto/Cadetería instantáneo",
    ronda_semanal: "Ronda Semanal Logística"
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      {/* Container with entrance transition */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col my-8 max-h-[90vh] border border-slate-200 overflow-hidden hide-on-print"
      >
        {/* ACTION BAR (Controls - Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-heading font-semibold text-sm sm:text-base text-slate-900 leading-tight">
                Resumen de Orden de Compra (Factura Técnica)
              </h2>
              <p className="text-xs text-slate-500">
                Documento de especificaciones industriales para el taller
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDirectPrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir Directo</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-[var(--color-primary-hover)] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE AREA CONTAINER */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {/* THE PHYSICAL A4 PAGE REPRESENTATION */}
          <div
            id="printable-technical-invoice"
            className="w-full max-w-[210mm] mx-auto bg-white p-8 sm:p-12 border border-slate-300 rounded-sm shadow-md text-slate-900 print:border-0 print:shadow-none print:p-0"
          >
            {/* Header section with brand colors */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-6 border-b-2 border-slate-900 gap-4">
              <div>
                <h1 className="font-heading font-black text-xl text-slate-900 tracking-wider">
                  CARTELES.CLICK
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                  Taller de Manufactura Gráfica & Ploteados
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Gran Formato · Ploteo & Cama Plana UV · Corpóreos & Letras 3D · carteles.ploteos@gmail.com
                </p>
              </div>
              <div className="sm:text-right text-xs">
                <span className="inline-block px-3 py-1 bg-slate-900 text-white font-mono font-bold rounded-sm mb-1">
                  ORDEN DE COMPRA TÉCNICA
                </span>
                <p className="font-mono text-slate-600">Fecha de Emisión: {dateStr}</p>
                <p className="font-mono text-slate-600">ID Borrador: OC-TEMP-{Math.floor(100000 + Math.random() * 900000)}</p>
              </div>
            </div>

            {/* Document metadata info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
              <div className="space-y-1">
                <strong className="text-slate-900 uppercase font-bold text-[10px] tracking-wider block mb-1 text-slate-500">
                  INFORMACIÓN DEL CLIENTE
                </strong>
                <p><span className="text-slate-500">Titular:</span> <span className="font-semibold">{customerName}</span></p>
                <p><span className="text-slate-500">Email:</span> <span className="font-mono">{customerEmail}</span></p>
                {customerPhone && <p><span className="text-slate-500">Teléfono:</span> <span>{customerPhone}</span></p>}
              </div>
              <div className="space-y-1">
                <strong className="text-slate-900 uppercase font-bold text-[10px] tracking-wider block mb-1 text-slate-500">
                  MÉTODO DE LOGÍSTICA & ENTREGA
                </strong>
                <p><span className="text-slate-500">Modo de Despacho:</span> <span className="font-semibold">{shippingLabels[shippingMethod] || shippingMethod}</span></p>
                <p><span className="text-slate-500">Gastos de Flete:</span> <span className="font-mono">{formatPrice(shippingFee)}</span></p>
              </div>
            </div>

            {/* Detailed technical table of items */}
            <div className="py-6">
              <strong className="text-slate-900 uppercase font-bold text-[10px] tracking-wider block mb-3 text-slate-500">
                ESPECIFICACIONES DE DISEÑO Y FABRICACIÓN POR PRODUCTO
              </strong>
              <div className="overflow-x-auto border border-slate-200 rounded-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-mono uppercase text-[10px]">
                      <th className="py-3 px-4">Ítem / Sustrato</th>
                      <th className="py-3 px-4">Especificación Técnica de Taller</th>
                      <th className="py-3 px-3 text-center">Cant.</th>
                      <th className="py-3 px-4 text-right">Unitario</th>
                      <th className="py-3 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {items.map((item, idx) => {
                      const areaM2 = item.widthCm && item.heightCm
                        ? ((item.widthCm * item.heightCm) / 10000) * item.quantity
                        : null;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            #{idx + 1} {item.materialName}
                            {item.customLabel && (
                              <span className="block text-[10px] text-primary font-mono mt-0.5">
                                [Id: {item.customLabel}]
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 space-y-1">
                            <p className="font-medium">
                              Medidas:{" "}
                              <span className="font-mono font-semibold">
                                {item.widthCm && item.heightCm
                                  ? `${item.widthCm} × ${item.heightCm} cm`
                                  : "Medida Estándar"}
                              </span>
                              {areaM2 && (
                                <span className="text-[10px] text-slate-500 ml-1.5">
                                  ({areaM2.toFixed(2)} m² totales)
                                </span>
                              )}
                            </p>
                            <div className="text-[10px] text-slate-600 space-y-0.5 leading-tight">
                              <p>
                                • <span className="text-slate-500">Tinta:</span>{" "}
                                <span className="font-medium text-slate-800">
                                  {item.inkTypeLabel || item.inkType || "Solvente estándar"}
                                </span>
                              </p>
                              {item.printQualityLabel && (
                                <p>
                                  • <span className="text-slate-500">Resolución:</span>{" "}
                                  <span className="font-medium text-slate-800">{item.printQualityLabel}</span>
                                </p>
                              )}
                              {item.finishings && item.finishings.length > 0 && (
                                <p>
                                  • <span className="text-slate-500">Terminaciones:</span>{" "}
                                  <span className="font-medium text-slate-800">
                                    {item.finishings.map((f) => f.replace(/_/g, " ")).join(" · ")}
                                  </span>
                                </p>
                              )}
                              {item.fileAttachment && (
                                <p className="text-primary font-mono text-[10px] flex items-baseline gap-1 mt-1">
                                  • <span className="text-slate-500">Diseño Adjunto:</span>{" "}
                                  <a
                                    href={item.fileAttachment.driveUrl || item.fileAttachment.previewUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline font-bold hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                                  >
                                    {item.fileAttachment.name || "Ver archivo de impresión"}
                                    <ExternalLink className="w-2.5 h-2.5 inline" />
                                  </a>
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-medium">
                            {item.quantity} u.
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-600">
                            {formatPrice(item.unitPriceARS || 0)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            {formatPrice(item.totalPriceARS || 0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* QA and Checklist Block for physical taller print */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-t border-b border-slate-200">
              {/* Operators physical checkboxes sign-off */}
              <div className="space-y-3">
                <strong className="text-slate-900 uppercase font-bold text-[10px] tracking-wider block mb-1 text-slate-500">
                  HOJA DE RUTA & SEGUIMIENTO EN TALLER
                </strong>
                <div className="space-y-2 text-[11px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    <span><strong>1. Pre-Prensa:</strong> Medidas y resoluciones verificadas en curvas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    <span><strong>2. Colorimetría:</strong> Perfil ICC cargado para el sustrato</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    <span><strong>3. Impresión:</strong> Libre de banding e impurezas físicas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    <span><strong>4. Confección:</strong> Ojales/vainas alineadas y soldadas térmicamente</span>
                  </div>
                </div>
              </div>

              {/* Order total math summary box */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal de Pedido:</span>
                    <span className="font-mono text-slate-800">{formatPrice(itemsTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Gastos de Logística:</span>
                    <span className="font-mono text-slate-800">{formatPrice(shippingFee)}</span>
                  </div>
                  <div className="border-t border-slate-200 my-1.5" />
                  <div className="flex justify-between text-slate-900 text-sm font-bold">
                    <span>TOTAL DE ORDEN:</span>
                    <span className="font-mono text-primary">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 italic mt-4 text-right">
                  * Precios estimados sujetos a variación según arancel aduanero.
                </div>
              </div>
            </div>

            {/* Industrial disclaimer details */}
            <div className="pt-6 text-[9px] text-slate-400 space-y-1 leading-relaxed">
              <p><strong>Cláusula de Tolerancia Industrial:</strong> Admisión de +/- 2mm en cortes debido a re-refilado térmico bajo normas de taller de Carteles.Click.</p>
              <p><strong>Aprobación Digital:</strong> Este presupuesto y factura técnica asume la conformidad del titular sobre los originales de diseño y archivos adjuntos provistos.</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FULL PREVIEW PRINT PORTAL (Hidden during UI view, fully visible during window.print()) */}
      <div className="hidden print:block absolute inset-0 bg-white text-black p-0 m-0 w-full font-sans">
        {/* DUPLICATE THE A4 CONTENT SECURELY FOR CLEAN PRINTING */}
        <div className="w-full bg-white text-black p-4">
          <div className="flex items-start justify-between pb-4 border-b-2 border-black">
            <div>
              <h1 className="font-heading font-black text-lg text-black tracking-wider">
                CARTELES.CLICK
              </h1>
              <p className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold">
                Taller de Manufactura Gráfica & Ploteados
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Gran Formato · Ploteo & Cama Plana UV · Corpóreos & Letras 3D · carteles.ploteos@gmail.com
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="inline-block px-2.5 py-0.5 bg-black text-white font-mono font-bold rounded-sm mb-1">
                ORDEN DE COMPRA TÉCNICA
              </span>
              <p className="font-mono text-slate-600">Fecha de Emisión: {dateStr}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-b border-black text-xs">
            <div>
              <strong className="text-black uppercase font-bold text-[9px] tracking-wider block mb-1">
                INFORMACIÓN DEL CLIENTE
              </strong>
              <p>Titular: <span className="font-semibold">{customerName}</span></p>
              <p>Email: <span className="font-mono">{customerEmail}</span></p>
              {customerPhone && <p>Teléfono: <span>{customerPhone}</span></p>}
            </div>
            <div>
              <strong className="text-black uppercase font-bold text-[9px] tracking-wider block mb-1">
                LOGÍSTICA & DESPACHO
              </strong>
              <p>Modo: <span>{shippingLabels[shippingMethod] || shippingMethod}</span></p>
              <p>Cargo flete: <span className="font-mono">{formatPrice(shippingFee)}</span></p>
            </div>
          </div>

          <div className="py-4">
            <strong className="text-black uppercase font-bold text-[9px] tracking-wider block mb-2">
              DETALLE DE PRODUCTOS & ESPECIFICACIONES TÉCNICAS
            </strong>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-black text-black font-mono uppercase text-[9px]">
                  <th className="py-2 px-2">Ítem / Sustrato</th>
                  <th className="py-2 px-2">Detalles Técnicos</th>
                  <th className="py-2 px-1 text-center">Cant.</th>
                  <th className="py-2 px-2 text-right">Unitario</th>
                  <th className="py-2 px-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {items.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="py-2 px-2 font-bold">
                      #{idx + 1} {item.materialName}
                    </td>
                    <td className="py-2 px-2 text-[10px]">
                      Medidas: {item.widthCm && item.heightCm ? `${item.widthCm}×${item.heightCm} cm` : "Estándar"}
                      {item.inkTypeLabel && ` · Tinta: ${item.inkTypeLabel}`}
                      {item.printQualityLabel && ` · Res: ${item.printQualityLabel}`}
                      {item.finishings && item.finishings.length > 0 && ` · Confección: ${item.finishings.map(f => f.replace(/_/g, " ")).join(", ")}`}
                      {item.fileAttachment && ` · Diseño: ${item.fileAttachment.name || "Adjunto"}`}
                    </td>
                    <td className="py-2 px-1 text-center font-mono">{item.quantity} u.</td>
                    <td className="py-2 px-2 text-right font-mono">{formatPrice(item.unitPriceARS || 0)}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold">{formatPrice(item.totalPriceARS || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-black">
            <div className="text-[10px]">
              <strong className="text-black uppercase font-bold text-[9px] tracking-wider block mb-1">
                SEGUIMIENTO DE TALLER (FISICO)
              </strong>
              <p>[ ] 1. Pre-Prensa y Diseño verificado</p>
              <p>[ ] 2. Calibración de Color e Impresión</p>
              <p>[ ] 3. Confección y Terminaciones</p>
              <p>[ ] 4. Control de Calidad y Despacho</p>
            </div>
            <div className="text-right text-xs font-mono space-y-1">
              <p>Subtotal: {formatPrice(itemsTotal)}</p>
              <p>Flete: {formatPrice(shippingFee)}</p>
              <p className="text-sm font-bold">TOTAL FINAL: {formatPrice(grandTotal)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
