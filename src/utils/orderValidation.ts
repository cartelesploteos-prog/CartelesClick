import { Order, CartItem } from "../types";

export interface OrderValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  criticalChecks: {
    hasValidMaterials: boolean;
    hasValidDimensions: boolean;
    hasValidFiles: boolean;
  };
}

/**
 * Helper que verifica si un ítem individual o el pedido cuenta con archivos gráficos listos para producción.
 */
function checkItemHasFileOrDesign(item: CartItem, order: Partial<Order>): boolean {
  // 1. Archivo adjunto directo en el ítem (Upload / Google Drive / URL)
  if (item.fileAttachment) {
    if (item.fileAttachment.name && item.fileAttachment.name.trim() !== "") return true;
    if (item.fileAttachment.previewUrl && item.fileAttachment.previewUrl.trim() !== "") return true;
    if (item.fileAttachment.driveUrl && item.fileAttachment.driveUrl.trim() !== "") return true;
  }

  // 2. Propiedades genéricas de archivo en el ítem
  const itemAny = item as any;
  if (itemAny.fileUrl || itemAny.fileName || itemAny.attachmentUrl || itemAny.artworkUrl) return true;

  // 3. Diseño interactivo creado en el editor de póster
  if (
    item.posterDesignData &&
    (item.posterDesignData.headline ||
      item.posterDesignData.bodyText ||
      item.posterDesignData.heroImageUrl ||
      (item.posterDesignData.foregroundElements && item.posterDesignData.foregroundElements.length > 0))
  ) {
    return true;
  }

  // 4. Servicio de diseño asistido por IA activo
  if (item.hasAiDesign || item.aiDesignFeeARS) return true;

  // 5. Archivos o enlaces a nivel de pedido
  const orderAny = order as any;
  if (orderAny.fileUrl || (orderAny.files && Array.isArray(orderAny.files) && orderAny.files.length > 0)) {
    return true;
  }
  if (orderAny.trackingUrl && (orderAny.trackingUrl.includes("drive.google.com") || orderAny.trackingUrl.includes("dropbox.com") || orderAny.trackingUrl.includes("wetransfer.com"))) {
    return true;
  }

  // 6. Enlace a almacenamiento en notas internas
  if (order.internalNotes && (order.internalNotes.includes("drive.google.com") || order.internalNotes.includes("dropbox.com") || order.internalNotes.includes("wetransfer.com") || order.internalNotes.includes("http"))) {
    return true;
  }

  return false;
}

/**
 * Valida la existencia y formato de campos críticos ('medidas', 'material', 'archivos')
 * de un pedido antes de procesar cambios de estado en AdminPanelView.
 */
export function validateOrderCriticalFields(order: Partial<Order>): OrderValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const checks = {
    hasValidMaterials: true,
    hasValidDimensions: true,
    hasValidFiles: true,
  };

  if (!order) {
    return {
      isValid: false,
      errors: ["No se ha proporcionado la información del pedido."],
      warnings: [],
      criticalChecks: {
        hasValidMaterials: false,
        hasValidDimensions: false,
        hasValidFiles: false,
      },
    };
  }

  const items = order.items || [];
  if (items.length === 0) {
    errors.push("El pedido no contiene ningún producto o ítem para fabricar.");
    checks.hasValidMaterials = false;
    checks.hasValidDimensions = false;
    checks.hasValidFiles = false;
  } else {
    items.forEach((item, index) => {
      const itemNum = index + 1;
      const itemName = item.materialName || `Ítem #${itemNum}`;

      // 1. VERIFICACIÓN DE MATERIAL
      const hasMaterial = Boolean(
        (item.materialName && item.materialName.trim() !== "" && item.materialName !== "Sin especificar") ||
        (item.materialId && item.materialId.trim() !== "")
      );

      if (!hasMaterial) {
        checks.hasValidMaterials = false;
        errors.push(`Ítem #${itemNum}: Debe especificarse el material gráfico (ej: Lona Frontlight, Vinilo Promocional, etc.).`);
      }

      // 2. VERIFICACIÓN DE MEDIDAS
      const width = Number(item.widthCm);
      const height = Number(item.heightCm);
      const isUnitMode = item.mode === "unidad";

      const hasValidDimensions = isUnitMode || (!isNaN(width) && width > 0 && !isNaN(height) && height > 0);

      if (!hasValidDimensions) {
        checks.hasValidDimensions = false;
        errors.push(
          `Ítem #${itemNum} (${itemName}): Medidas incompletas. Ancho (${width || 0} cm) y Alto (${height || 0} cm) deben ser mayores a 0.`
        );
      } else if (!isUnitMode) {
        if (width > 320 && height > 320) {
          warnings.push(`Ítem #${itemNum}: Ambas dimensiones superan los 3.20m (requerirá soldadura por termosellado).`);
        }
      }

      // 3. VERIFICACIÓN DE ARCHIVOS / DISEÑO
      const hasFile = checkItemHasFileOrDesign(item, order);
      if (!hasFile) {
        checks.hasValidFiles = false;
        errors.push(
          `Ítem #${itemNum} (${itemName}): Falta el archivo gráfico o diseño para impresión (PDF, TIFF, Drive o diseño vectorial).`
        );
      }

      // 4. Cantidad
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Ítem #${itemNum}: La cantidad a producir debe ser al menos 1.`);
      }
    });
  }

  // 5. Advertencias de contacto del cliente
  if (!order.customerPhone && !order.customerEmail) {
    warnings.push("El pedido no tiene teléfono ni email de contacto para coordinar retiro o entrega.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    criticalChecks: checks,
  };
}

export const validateOrderForProduction = validateOrderCriticalFields;
export const validateOrderIntegrity = validateOrderCriticalFields;
