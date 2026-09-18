/**
 * Google Analytics 4 (GA4) Utility for CartelesClick2026
 * Tracks key production and commerce events:
 * - cotización_iniciada
 * - material_seleccionado
 * - pedido_exitoso
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_GA4_MEASUREMENT_ID) || "G-CARTELES3D";

/**
 * Initializes GA4 dataLayer and gtag handler.
 * If GA_MEASUREMENT_ID is configured or scripts exist, hooks into the official gtag endpoint.
 */
export function initGA4(measurementId: string = GA_MEASUREMENT_ID) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: true,
  });

  // Inject gtag.js script if not present and if a valid measurement ID is set
  if (measurementId && measurementId.startsWith("G-") && !document.getElementById("ga4-script")) {
    const script = document.createElement("script");
    script.id = "ga4-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  }

  console.log(`[GA4] Initialized measurement container: ${measurementId}`);
}

/**
 * Dispatches an event to GA4
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...params });
  }

  console.log(`[GA4 Event] ${eventName}`, params);
}

/**
 * Track: 'cotización_iniciada'
 */
export function trackCotizacionIniciada(params?: { materialId?: string; mode?: string }) {
  trackEvent("cotización_iniciada", {
    material_id: params?.materialId || "default",
    mode: params?.mode || "individual",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track: 'material_seleccionado'
 */
export function trackMaterialSeleccionado(materialId: string, materialName?: string, category?: string) {
  trackEvent("material_seleccionado", {
    material_id: materialId,
    material_name: materialName || materialId,
    category: category || "general",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track: 'pedido_exitoso'
 */
export function trackPedidoExitoso(orderId: string, totalAmountARS: number, itemsCount: number = 1) {
  trackEvent("pedido_exitoso", {
    transaction_id: orderId,
    value: totalAmountARS,
    currency: "ARS",
    items_count: itemsCount,
    timestamp: new Date().toISOString(),
  });
}
