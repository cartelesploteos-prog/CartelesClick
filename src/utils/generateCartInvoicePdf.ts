import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CartItem } from "../types";

export interface GenerateCartInvoicePdfOptions {
  items: CartItem[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingMethod: string;
  shippingFee: number;
  itemsTotal: number;
  grandTotal: number;
}

function formatARS(amount: number): string {
  return `$${Math.round(amount).toLocaleString("es-AR")} ARS`;
}

export function generateCartInvoicePdf(options: GenerateCartInvoicePdfOptions) {
  const {
    items,
    customerName,
    customerEmail,
    customerPhone,
    shippingMethod,
    shippingFee,
    itemsTotal,
    grandTotal,
  } = options;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const orderId = `OC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // 1. BRAND HEADER BAR (Dark Industrial Theme)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, "F");

  // Orange Accent Stripe (#FF5520)
  doc.setFillColor(255, 85, 32);
  doc.rect(0, 28, pageWidth, 2, "F");

  // Brand Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("CARTELES.CLICK", 14, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text("Taller de Manufactura Gráfica · Factura Técnica de Producción", 14, 20);

  // Metadata top right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 170, 0); // Gold
  doc.text("ORDEN DE COMPRA TÉCNICA", pageWidth - 14, 12, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Identificador: ${orderId}`, pageWidth - 14, 17, { align: "right" });
  doc.text(`Emisión: ${dateStr}`, pageWidth - 14, 22, { align: "right" });

  // 2. CLIENT & SHIPPING METADATA CARD
  let currentY = 36;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, currentY, pageWidth - 28, 22, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text("DATOS DE LA ORDEN & LOGÍSTICA", 18, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const phoneText = customerPhone ? ` · Tel: ${customerPhone}` : "";
  doc.text(`Cliente: ${customerName} · Email: ${customerEmail}${phoneText}`, 18, currentY + 12);
  
  const shippingLabels: Record<string, string> = {
    retiro_taller: "Retiro en Taller Central sin cargo",
    envio_caba: "Envío Moto/Cadetería express",
    envio_gba: "Despacho a Gran Buenos Aires",
    expreso_interior: "Despacho por encomienda (Flete pago en destino)",
    a_despacho: "A Despacho por Expreso (Flete a terminal pago)",
    instantaneo: "Envío Moto/Cadetería instantáneo",
    ronda_semanal: "Ronda Semanal Logística"
  };
  const logisticsLabel = shippingLabels[shippingMethod] || shippingMethod;
  doc.text(`Logística seleccionada: ${logisticsLabel} (Cargo: ${formatARS(shippingFee)})`, 18, currentY + 17);

  currentY += 28;

  // 3. TABLE OF ORDERED ITEMS
  const tableBody = items.map((item, idx) => {
    const dim = item.widthCm && item.heightCm ? `${item.widthCm}×${item.heightCm} cm` : "Estándar";
    const specs = [];
    if (item.printQualityLabel || item.printQuality) {
      specs.push(`Calidad: ${item.printQualityLabel || item.printQuality}`);
    }
    if (item.inkTypeLabel || item.inkType) {
      specs.push(`Tinta: ${item.inkTypeLabel || item.inkType}`);
    }
    if (item.finishings && item.finishings.length > 0) {
      specs.push(`Terminaciones: ${item.finishings.map(f => f.replace(/_/g, " ")).join(", ")}`);
    }
    if (item.fileAttachment) {
      specs.push(`Diseño: ${item.fileAttachment.name || "Archivo adjunto"}`);
    }

    const detailText = `${dim}\n${specs.join(" · ")}`;
    return [
      `${idx + 1}. ${item.materialName}`,
      detailText,
      `${item.quantity} u.`,
      formatARS(item.unitPriceARS || 0),
      formatARS(item.totalPriceARS || 0),
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["Ítem / Sustrato", "Especificaciones de Taller", "Cant.", "P. Unitario", "Subtotal"]],
    body: tableBody,
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 41, 59],
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: "bold" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 32, halign: "right", fontStyle: "bold" },
    },
    theme: "grid",
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 4. FINANCIAL SUMMARY BOX
  const summaryBoxWidth = 80;
  const summaryX = pageWidth - 14 - summaryBoxWidth;

  // Left Checklist / Sign-off Block for Workshop
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("CONTROL DE CALIDAD & FIRMAS DE TALLER", 14, currentY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);

  let checkY = currentY + 9;
  doc.rect(14, checkY - 2.5, 3, 3);
  doc.text("1. Pre-Prensa y Diseño (Firma aprobado): ______________________", 19, checkY);
  
  checkY += 5;
  doc.rect(14, checkY - 2.5, 3, 3);
  doc.text("2. Calibración de Color e Impresión: ______________________", 19, checkY);

  checkY += 5;
  doc.rect(14, checkY - 2.5, 3, 3);
  doc.text("3. Confección y Terminaciones: ______________________", 19, checkY);

  checkY += 5;
  doc.rect(14, checkY - 2.5, 3, 3);
  doc.text("4. Embalaje y Despacho Final: ______________________", 19, checkY);

  // Right financial summary box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(summaryX, currentY, summaryBoxWidth, 30, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Subtotal Configurado:", summaryX + 4, currentY + 7);
  doc.text(formatARS(itemsTotal), summaryX + summaryBoxWidth - 4, currentY + 7, { align: "right" });

  doc.text("Gastos de Logística:", summaryX + 4, currentY + 13);
  doc.text(formatARS(shippingFee), summaryX + summaryBoxWidth - 4, currentY + 13, { align: "right" });

  doc.setDrawColor(226, 232, 240);
  doc.line(summaryX + 4, currentY + 17, summaryX + summaryBoxWidth - 4, currentY + 17);

  // Total Final
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 85, 32); // Brand primary orange
  doc.text("TOTAL DE ORDEN:", summaryX + 4, currentY + 24);
  doc.text(formatARS(grandTotal), summaryX + summaryBoxWidth - 4, currentY + 24, { align: "right" });

  // 5. PRODUCTION TERMS & LEGAL FOOTER
  const footerY = 250;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text("PAUTAS DE FABRICACIÓN INDUSTRIAL & CONDICIONES DE TALLER", 14, footerY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("1. Tolerancia dimensional: Admisión de +/- 2mm en cortes perimetrales debido a re-refilado y comportamiento térmico de los sustratos.", 14, footerY + 10);
  doc.text("2. Colores y calibración: No se aceptan reclamos sobre divergencias de color si no se suministró un código de color Pantone o muestra testigo física.", 14, footerY + 14);
  doc.text("3. Calidad de archivo: El cliente asume total responsabilidad sobre pixelación de imágenes menores a 150 DPI y textos no convertidos a curvas.", 14, footerY + 18);
  doc.text("4. Este documento actúa como Hoja de Ruta Oficial en taller y Comprobante de Especificaciones de Diseño para la Orden.", 14, footerY + 22);

  // Bottom Branding Bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 285, pageWidth, 12, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("CARTELES.CLICK", 14, 292);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("Comprobante Digital Oficial de Producción · www.carteles.click", pageWidth - 14, 292, { align: "right" });

  // Save / Download
  const filename = `Technical_Invoice_CartelesClick_${orderId}.pdf`;
  doc.save(filename);
}
