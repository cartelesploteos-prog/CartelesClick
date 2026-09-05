/**
 * PDF Export Utility for Carteles.Click
 * Generates branded, industrial-grade quotation PDFs and manufacturing sheets
 * using jsPDF & jspdf-autotable.
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { QuoteResponsePayload, Order, CartItem } from "../types";

export interface GenerateQuotePdfOptions {
  quote: QuoteResponsePayload;
  clientName?: string;
  clientEmail?: string;
  clientCompany?: string;
  bulkItems?: {
    label: string;
    widthCm?: number;
    heightCm?: number;
    quantity: number;
    materialName?: string;
    unitPriceARS: number;
    totalPriceARS: number;
    finishingsSummary?: string[];
  }[];
  customNotes?: string;
}

/**
 * Formats currency in Argentine Pesos (ARS).
 */
function formatARS(amount: number): string {
  return `$${Math.round(amount).toLocaleString("es-AR")} ARS`;
}

/**
 * Generates and triggers download of a formal Quotation PDF.
 */
export function generateQuotePdf(options: GenerateQuotePdfOptions) {
  const { quote, clientName, clientEmail, clientCompany, bulkItems, customNotes } = options;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const quoteId = `COT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // 1. BRAND HEADER BAR (Dark Industrial Theme)
  doc.setFillColor(15, 23, 42); // #0F172A slate-900
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
  doc.text("Manufactura Gráfica · Ploteo & Gran Formato · Cama Plana UV", 14, 20);

  // Quote Metadata on top right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 170, 0); // Gold/Orange
  doc.text("PRESUPUESTO FORMAL", pageWidth - 14, 12, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`N° ${quoteId}`, pageWidth - 14, 17, { align: "right" });
  doc.text(`Fecha: ${dateStr}`, pageWidth - 14, 22, { align: "right" });

  // 2. CLIENT & PROJECT METADATA CARD
  let currentY = 36;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, currentY, pageWidth - 28, 22, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text("DATOS DEL CLIENTE / PROYECTO", 18, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const cName = clientName ? clientName : "Consumidor Final / Cliente Web";
  const cComp = clientCompany ? ` · Empresa: ${clientCompany}` : "";
  const cMail = clientEmail ? ` · Email: ${clientEmail}` : "";
  doc.text(`Titular: ${cName}${cComp}${cMail}`, 18, currentY + 12);
  doc.text(`Validez de la cotización: 7 días corridos desde la emisión · Sujeto a stock y cambios arancelarios.`, 18, currentY + 17);

  currentY += 28;

  // 3. TABLE OF QUOTED ITEMS
  if (bulkItems && bulkItems.length > 0) {
    // Multi-item / Bulk Table
    const tableBody = bulkItems.map((item, idx) => {
      const dim = item.widthCm && item.heightCm ? `${item.widthCm}×${item.heightCm} cm` : "Medida estándar";
      const finishes = item.finishingsSummary && item.finishingsSummary.length > 0
        ? `\nTerminaciones: ${item.finishingsSummary.join(", ")}`
        : "";
      return [
        `${idx + 1}. ${item.label || item.materialName || quote.materialName}`,
        `${dim}${finishes}`,
        `${item.quantity} u.`,
        formatARS(item.unitPriceARS),
        formatARS(item.totalPriceARS),
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Ítem / Descripción", "Detalles Técnicos & Medidas", "Cant.", "P. Unitario", "Subtotal"]],
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
        0: { cellWidth: 50 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 16, halign: "center" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 32, halign: "right", fontStyle: "bold" },
      },
      theme: "grid",
    });
  } else {
    // Single Item Breakdown Table
    const dim = quote.widthCm && quote.heightCm
      ? `${quote.widthCm} × ${quote.heightCm} cm (${quote.calculatedAreaM2 || ((quote.widthCm * quote.heightCm) / 10000).toFixed(2)} m²)`
      : quote.mode === "placa"
      ? `${quote.platesCount || 1} Placa(s) Matriz (${quote.plateSurfaceM2 || 2.98} m²)`
      : "Unidad con estructura";

    const techSpecs = [
      `Resolución: ${quote.printQualityLabel || (quote.printQuality === "alta_resolucion" ? "Alta Resolución 1440-2880 DPI" : "Resolución Estándar")}`,
      `Tecnología: ${quote.inkTypeLabel || (quote.inkType === "directa_uv" ? "Directa Cama Plana UV" : quote.inkType === "uv" ? "Tintas UV LED" : "Solvente Industrial")}`,
    ];
    if (quote.mountOption) {
      techSpecs.push(`Montaje: ${quote.mountOption.typeName} (${quote.mountOption.thickness})`);
    }
    if (quote.finishingsSummary && quote.finishingsSummary.length > 0) {
      techSpecs.push(`Terminaciones: ${quote.finishingsSummary.join(" · ")}`);
    }

    const tableBody = [
      [
        `1. ${quote.materialName}`,
        `Dimensiones: ${dim}\n${techSpecs.join("\n")}`,
        `${quote.quantity} u.`,
        formatARS(quote.unitPriceARS),
        formatARS(quote.totalPriceARS),
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [["Material / Producto", "Especificaciones de Taller", "Cant.", "P. Unitario", "Total"]],
      body: tableBody,
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      styles: {
        fontSize: 8,
        cellPadding: 3.5,
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
  }

  // Get final Y from table
  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 4. FINANCIAL SUMMARY BOX & TRANSPARENCY NOTES
  const summaryBoxWidth = 80;
  const summaryX = pageWidth - 14 - summaryBoxWidth;

  // Left Notes block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text("NOTAS TÉCNICAS & DESGLOSE:", 14, currentY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);

  let noteY = currentY + 9;
  if (quote.transparencyNotes && quote.transparencyNotes.length > 0) {
    quote.transparencyNotes.forEach((n) => {
      doc.text(`• ${n}`, 14, noteY);
      noteY += 4;
    });
  } else {
    doc.text("• Impresión garantizada bajo normas de calibración colorimétrica Fogra/ISO.", 14, noteY);
    noteY += 4;
    doc.text("• Sustratos originales de primera calidad aptos intemperie / interiores.", 14, noteY);
    noteY += 4;
  }

  if (customNotes) {
    doc.text(`• Observaciones: ${customNotes}`, 14, noteY);
    noteY += 4;
  }

  // Right summary financial box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(summaryX, currentY, summaryBoxWidth, 34, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Subtotal Bruto:", summaryX + 4, currentY + 7);
  doc.text(formatARS(quote.subtotalARS || quote.totalPriceARS), summaryX + summaryBoxWidth - 4, currentY + 7, { align: "right" });

  if (quote.discountAmountARS && quote.discountAmountARS > 0) {
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(`Descuento (${quote.discountPercentage}%):`, summaryX + 4, currentY + 13);
    doc.text(`-${formatARS(quote.discountAmountARS)}`, summaryX + summaryBoxWidth - 4, currentY + 13, { align: "right" });
  } else {
    doc.text("Descuento Comercial:", summaryX + 4, currentY + 13);
    doc.text("$0 ARS", summaryX + summaryBoxWidth - 4, currentY + 13, { align: "right" });
  }

  // Divider inside summary box
  doc.setDrawColor(226, 232, 240);
  doc.line(summaryX + 4, currentY + 17, summaryX + summaryBoxWidth - 4, currentY + 17);

  // Total Final
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 85, 32); // Brand primary #FF5520
  doc.text("TOTAL FINAL:", summaryX + 4, currentY + 25);
  doc.text(formatARS(quote.totalPriceARS), summaryX + summaryBoxWidth - 4, currentY + 25, { align: "right" });

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`P. Unitario prom: ${formatARS(quote.unitPriceARS)}`, summaryX + summaryBoxWidth - 4, currentY + 30, { align: "right" });

  // 5. PRODUCTION & PAYMENT TERMS (FOOTER)
  const footerY = 250;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text("CONDICIONES DE PRODUCCIÓN & FORMAS DE PAGO", 14, footerY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("1. Acreditación: Los tiempos de producción comienzan una vez confirmado el pago (Mercado Pago / Transferencia) y aprobado el archivo de diseño.", 14, footerY + 10);
  doc.text("2. Archivos admitidos: PDF vector (curvas), TIFF, AI, Corel o JPG alta resolución a escala 1:1 (mínimo 150 DPI).", 14, footerY + 14);
  doc.text("3. Retiro / Despacho: Retiro sin cargo en Taller Central o envíos por cadetería instantánea y encomiendas a todo el país.", 14, footerY + 18);
  doc.text("4. Este documento es un presupuesto estimativo generado mediante el motor de cotización algorítmica de Carteles.Click.", 14, footerY + 22);

  // Bottom Branding Bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 285, pageWidth, 12, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("CARTELES.CLICK", 14, 292);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("www.carteles.click · WhatsApp Taller: +54 9 11 0000-0000 · contacto@carteles.click", pageWidth - 14, 292, { align: "right" });

  // Save / Download
  const filename = `Presupuesto_CartelesClick_${quote.materialId}_${quoteId}.pdf`;
  doc.save(filename);
}

/**
 * Generates and downloads a manufacturing job sheet / work order PDF.
 */
export function generateOrderSheetPdf(order: Order) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const dateStr = new Date(order.createdAt).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Header Bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setFillColor(255, 85, 32);
  doc.rect(0, 28, pageWidth, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("CARTELES.CLICK", 14, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text("Hoja de Producción & Comprobante de Taller", 14, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 170, 0);
  doc.text(`ORDEN #${order.orderNumber || order.id}`, pageWidth - 14, 13, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Emisión: ${dateStr}`, pageWidth - 14, 18, { align: "right" });
  doc.text(`Estado: ${order.status.toUpperCase()} · Pago: ${order.paymentStatus.toUpperCase()}`, pageWidth - 14, 23, { align: "right" });

  let currentY = 36;

  // Customer Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 20, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text("INFORMACIÓN DEL CLIENTE & DESPACHO", 18, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Cliente: ${order.customerName} (${order.customerEmail}) · Tel: ${order.customerPhone || "N/D"}`, 18, currentY + 11);
  doc.text(`Logística: ${order.shippingMethod === "a_despacho" ? "A Despacho (Expreso/Interior)" : order.shippingMethod === "instantaneo" ? "Envío Moto/Cadetería" : "Retiro en Taller Central"}`, 18, currentY + 16);

  currentY += 26;

  // Items Table
  const tableBody = order.items.map((item, idx) => {
    const dim = item.widthCm && item.heightCm ? `${item.widthCm}×${item.heightCm} cm` : "Estándar";
    const specs = [];
    if (item.printQuality) specs.push(`Calidad: ${item.printQuality}`);
    if (item.inkType) specs.push(`Tinta: ${item.inkType}`);
    if (item.finishings && item.finishings.length > 0) specs.push(`Terminaciones: ${item.finishings.join(", ")}`);

    return [
      `${idx + 1}. ${item.materialName}`,
      `${dim}\n${specs.join(" · ")}`,
      `${item.quantity} u.`,
      formatARS(item.unitPriceARS || 0),
      formatARS(item.totalPriceARS || 0),
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["Material / Producto", "Especificaciones de Fabricación", "Cant.", "P. Unitario", "Total"]],
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

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Total summary
  const summaryBoxWidth = 75;
  const summaryX = pageWidth - 14 - summaryBoxWidth;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(summaryX, currentY, summaryBoxWidth, 24, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 85, 32);
  doc.text("IMPORTE TOTAL:", summaryX + 4, currentY + 10);
  doc.text(formatARS(order.totalAmountARS), summaryX + summaryBoxWidth - 4, currentY + 10, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Forma de pago: ${order.paymentMethod === "mercadopago" ? "Mercado Pago Webhook" : "Transferencia Bancaria"}`, summaryX + 4, currentY + 17);

  // Footer
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 285, pageWidth, 12, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("CARTELES.CLICK", 14, 292);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("Comprobante Digital Oficial · www.carteles.click", pageWidth - 14, 292, { align: "right" });

  const filename = `Orden_CartelesClick_${order.orderNumber || order.id}.pdf`;
  doc.save(filename);
}
