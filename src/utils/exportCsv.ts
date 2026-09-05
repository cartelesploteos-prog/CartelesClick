/**
 * CSV Export Utility for Carteles.Click
 * Formats product, order, and inventory data into Google Sheets / Excel compatible CSVs
 * with UTF-8 Byte Order Mark (BOM) for correct encoding of special characters (m², ó, ñ, $).
 */

import { AdminProduct, Order } from "../types";

/**
 * Escapes a field value for CSV compliance (Google Sheets & Excel friendly).
 */
function escapeCsvField(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes(';') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates and downloads a CSV file from an array of objects.
 */
export function downloadCsv(filename: string, headers: string[], rows: (string | number | boolean)[][]) {
  const headerRow = headers.map(escapeCsvField).join(",");
  const dataRows = rows.map(row => row.map(escapeCsvField).join(","));
  
  // \uFEFF is the UTF-8 Byte Order Mark (BOM) required by Google Sheets & Excel for UTF-8 accent support
  const csvContent = "\uFEFF" + [headerRow, ...dataRows].join("\r\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports products list to Google Sheets compatible CSV.
 */
export function exportProductsToCsv(products: AdminProduct[], filename = "carteles_click_productos.csv") {
  const headers = [
    "ID",
    "Nombre del Material",
    "Descripción Corta",
    "Categoría",
    "Modo de Cálculo",
    "Costo Proveedor ARS",
    "Precio Venta ARS",
    "Margen (%)",
    "Unidad de Medida",
    "Mínimo m² Taller",
    "Ancho Placa (cm)",
    "Alto Placa (cm)",
    "Ancho Bobina (cm)",
    "Estado Stock",
    "Activo"
  ];

  const rows = products.map(p => [
    p.id || "",
    p.name || "",
    p.shortDesc || "",
    p.category || "",
    p.mode || "m2",
    p.costARS || 0,
    p.salePriceARS || 0,
    p.marginPercent || 100,
    p.unitLabel || "m²",
    p.minAreaM2 || 0,
    p.plateWidthCm || "",
    p.plateHeightCm || "",
    p.linearWidthCm || "",
    p.stockStatus || "disponible",
    p.isActive ? "Sí" : "No"
  ]);

  downloadCsv(filename, headers, rows);
}

/**
 * Exports orders list to Google Sheets compatible CSV.
 */
export function exportOrdersToCsv(orders: Order[], filename = "carteles_click_pedidos.csv") {
  const headers = [
    "ID Pedido",
    "N° Orden",
    "Cliente",
    "Empresa / Razón Social",
    "Email",
    "Teléfono",
    "Tipo Cliente",
    "Resumen Ítems",
    "Total m²",
    "Método Envío",
    "Prioridad",
    "Estado Pedido",
    "Estado Pago",
    "Monto Total ($ ARS)",
    "Fecha Creación"
  ];

  const rows = orders.map(o => {
    const itemsSummary = Array.isArray(o.items)
      ? o.items.map(i => `${i.materialName} (${i.widthCm && i.heightCm ? `${i.widthCm}x${i.heightCm}cm` : '1 unid'} x${i.quantity})`).join(" | ")
      : "1 ítem";

    return [
      o.id || "",
      o.orderNumber || "",
      o.customerName || "Cliente",
      o.customerCompany || "",
      o.customerEmail || "",
      o.customerPhone || "",
      o.customerType || "comun",
      itemsSummary,
      o.totalM2 || 0,
      o.shippingMethod || "retiro_taller",
      o.priority || "normal",
      o.status || "pendiente",
      o.paymentStatus || "pendiente",
      o.totalAmountARS || 0,
      o.createdAt ? new Date(o.createdAt).toLocaleDateString("es-AR") : new Date().toLocaleDateString("es-AR")
    ];
  });

  downloadCsv(filename, headers, rows);
}
