/**
 * =======================================================================
 * 🛡️ MOTOR DE PRECIOS DE TERMINACIONES Y DISEÑO IA (SERVER-SIDE ONLY)
 * =======================================================================
 * Fuente única de verdad para el cálculo de terminaciones de taller
 * (ojales, bolsillos, refuerzos termo-soldados, cortes y laminados)
 * y la tarifa fija por diseño asistido por IA.
 *
 * REGLA DE SEGURIDAD ABSOLUTA:
 * Toda la estructura de costos internos, márgenes de ganancia y fórmulas
 * unitarias permanece estrictamente encapsulada en el backend.
 * El cliente recibe únicamente los precios finales calculados.
 */

export interface InternalFinishingDefinition {
  id: string;
  name: string;
  category: 'lonas' | 'vinilos' | 'rigidos' | 'todos' | 'estampados';
  calculationType: 'fijo' | 'metro_perimetral' | 'metro_lineal_ancho' | 'metro_lineal_alto' | 'm2' | 'por_unidad';
  /**
   * Costo base interno en ARS (NO EXPUESTO AL CLIENTE).
   * Contempla insumo + mano de obra de taller.
   */
  internalBaseCostARS: number;
  /**
   * Margen comercial aplicado al cliente final.
   */
  markupMultiplier: number;
  /**
   * Precio de venta al público por unidad de medida (ARS).
   */
  salePricePerUnitARS: number;
  description: string;
  clientDetailFormatter: (params: {
    widthM: number;
    heightM: number;
    perimeterM: number;
    areaM2: number;
    qty: number;
    priceARS: number;
  }) => string;
}

export interface ClientFinishingCalculatedItem {
  id: string;
  name: string;
  priceARS: number;
  /** Compatibilidad hacia atrás para componentes que leen totalCostARS */
  totalCostARS: number;
  details: string;
}

export interface CalculateFinishingsInput {
  widthCm?: number;
  heightCm?: number;
  quantity?: number;
  finishings?: string[];
  isAiDesign?: boolean;
}

export interface CalculateFinishingsResult {
  finishingsSubtotalARS: number;
  breakdown: ClientFinishingCalculatedItem[];
  summary: string[];
  aiDesignFeeARS: number;
  hasAiDesign: boolean;
  totalCalculatedARS: number;
}

export interface ClientFinishingCatalogItem {
  id: string;
  name: string;
  category: string;
  description: string;
}

// Mapeo de alias para compatibilidad retroactiva total
const FINISHING_ID_ALIASES: Record<string, string> = {
  ojales_perimetrales: "ojales_50cm",
  ojales_esquinas: "ojales_vertices",
  bolsillos_pasacaño: "bolsillos_portabanner",
  bolsillo_sup_inf: "bolsillos_portabanner",
  corte_al_ras: "refilado",
  laminado_proteccion_uv: "laminado_protector",
  troquelado_digital_placa: "troquelado_cnc",
  perforaciones_esquinas_4: "agujereado_fijaciones",
};

// =======================================================================
// 🔒 CATÁLOGO INTERNO DE COSTOS Y FÓRMULAS DE TALLER (PRIVADO)
// =======================================================================

const INTERNAL_FINISHINGS_CATALOG: Record<string, InternalFinishingDefinition> = {
  // --- LONAS Y BANNERS ---
  rollo: {
    id: "rollo",
    name: "Entregado en rollo",
    category: "todos",
    calculationType: "fijo",
    internalBaseCostARS: 0,
    markupMultiplier: 1.0,
    salePricePerUnitARS: 0,
    description: "Embalado en rollo con film protector listo para traslado",
    clientDetailFormatter: () => "Embalaje en rollo protector sin cargo",
  },
  refilado: {
    id: "refilado",
    name: "Refilado al ras",
    category: "todos",
    calculationType: "fijo",
    internalBaseCostARS: 0,
    markupMultiplier: 1.0,
    salePricePerUnitARS: 0,
    description: "Corte perimetral limpio y exacto al borde de la gráfica",
    clientDetailFormatter: () => "Corte perimetral exacto al ras incluido",
  },
  corte_a_medida: {
    id: "corte_a_medida",
    name: "Corte exacto a medida",
    category: "todos",
    calculationType: "fijo",
    internalBaseCostARS: 0,
    markupMultiplier: 1.0,
    salePricePerUnitARS: 0,
    description: "Corte perimetral limpio con guillotina o mesa óptica",
    clientDetailFormatter: () => "Corte a medida exacto incluido",
  },
  bolsillos_portabanner: {
    id: "bolsillos_portabanner",
    name: "Bolsillos superior e inferior (vainas)",
    category: "lonas",
    calculationType: "metro_lineal_ancho",
    internalBaseCostARS: 850,
    markupMultiplier: 1.76,
    salePricePerUnitARS: 1500, // $1.500 por metro de ancho (arriba y abajo)
    description: "Dobladillo termo-soldado para caños de hierro o varillas tensoras (superior e inferior)",
    clientDetailFormatter: ({ widthM }) =>
      `Vainas dobles sup/inf (${(widthM * 2).toFixed(2)} m lineales)`,
  },
  bolsillo_sup_inf: {
    id: "bolsillo_sup_inf",
    name: "Bolsillos superior e inferior (vainas)",
    category: "lonas",
    calculationType: "metro_lineal_ancho",
    internalBaseCostARS: 850,
    markupMultiplier: 1.76,
    salePricePerUnitARS: 1500,
    description: "Dobladillo termo-soldado para caños de hierro o varillas tensoras",
    clientDetailFormatter: ({ widthM }) =>
      `Vainas dobles sup/inf (${(widthM * 2).toFixed(2)} m lineales)`,
  },
  bolsillo_lateral: {
    id: "bolsillo_lateral",
    name: "Bolsillos laterales (vainas)",
    category: "lonas",
    calculationType: "metro_lineal_alto",
    internalBaseCostARS: 850,
    markupMultiplier: 1.76,
    salePricePerUnitARS: 1500,
    description: "Dobladillo termo-soldado para varillas laterales",
    clientDetailFormatter: ({ heightM }) =>
      `Vainas laterales (${(heightM * 2).toFixed(2)} m lineales)`,
  },
  refuerzo_perimetral: {
    id: "refuerzo_perimetral",
    name: "Refuerzo perimetral termo-soldado",
    category: "lonas",
    calculationType: "metro_perimetral",
    internalBaseCostARS: 780,
    markupMultiplier: 1.79,
    salePricePerUnitARS: 1400, // $1.400 por metro perimetral
    description: "Doble dobladillo soldado por calor que triplica la resistencia al desgarro por viento",
    clientDetailFormatter: ({ perimeterM }) =>
      `Refuerzo perimetral termo-soldado (${perimeterM.toFixed(2)} m de contorno)`,
  },
  ojales_50cm: {
    id: "ojales_50cm",
    name: "Colocación de Ojales metálicos cada 50 cm",
    category: "lonas",
    calculationType: "metro_perimetral",
    internalBaseCostARS: 650,
    markupMultiplier: 1.84,
    salePricePerUnitARS: 1200, // $1.200 por metro de perímetro
    description: "Ojales zincados anticorrosivos distribuidos uniformemente cada 50 cm para tensado seguro",
    clientDetailFormatter: ({ perimeterM }) =>
      `Ojales zincados cada 50 cm en perímetro (${perimeterM.toFixed(2)} m)`,
  },
  ojales_vertices: {
    id: "ojales_vertices",
    name: "Colocación de Ojales en las 4 esquinas",
    category: "lonas",
    calculationType: "fijo",
    internalBaseCostARS: 950,
    markupMultiplier: 1.89,
    salePricePerUnitARS: 1800, // $1.800 fijo (4 esquinas)
    description: "Ojales reforzados en las cuatro esquinas para anclaje en araña o portabanner",
    clientDetailFormatter: () => "4 ojales metálicos reforzados en esquinas",
  },
  ojales_esquinas: {
    id: "ojales_esquinas",
    name: "Colocación de Ojales en las 4 esquinas",
    category: "lonas",
    calculationType: "fijo",
    internalBaseCostARS: 950,
    markupMultiplier: 1.89,
    salePricePerUnitARS: 1800,
    description: "Ojales reforzados en las cuatro esquinas para anclaje",
    clientDetailFormatter: () => "4 ojales metálicos reforzados en esquinas",
  },
  soldado_termico: {
    id: "soldado_termico",
    name: "Unión y soldado térmico",
    category: "lonas",
    calculationType: "fijo",
    internalBaseCostARS: 1800,
    markupMultiplier: 1.94,
    salePricePerUnitARS: 3500,
    description: "Fusión molecular de paños de lona para formatos gigantes",
    clientDetailFormatter: () => "Soldadura térmica molecular de alta resistencia",
  },

  // --- VINILOS ---
  panos: {
    id: "panos",
    name: "Entregado en paños fraccionados",
    category: "vinilos",
    calculationType: "fijo",
    internalBaseCostARS: 0,
    markupMultiplier: 1.0,
    salePricePerUnitARS: 0,
    description: "Fraccionado en paños con solape de 1.5 cm para fácil colocación",
    clientDetailFormatter: () => "Paños con solape de 1.5 cm incluidos",
  },
  laminado_protector: {
    id: "laminado_protector",
    name: "Laminado protector UV & anti-rayas",
    category: "vinilos",
    calculationType: "m2",
    internalBaseCostARS: 1900,
    markupMultiplier: 1.84,
    salePricePerUnitARS: 3500,
    description: "Película transparente en frío para proteger vinilos contra solventes, sol y rayaduras",
    clientDetailFormatter: ({ areaM2 }) =>
      `Laminado UV de alta durabilidad (${areaM2.toFixed(2)} m²)`,
  },
  montado_mdf: {
    id: "montado_mdf",
    name: "Montado sobre MDF",
    category: "vinilos",
    calculationType: "m2",
    internalBaseCostARS: 4600,
    markupMultiplier: 1.84,
    salePricePerUnitARS: 8500,
    description: "Pegado industrial sobre placa de MDF fibrofácil",
    clientDetailFormatter: ({ areaM2 }) =>
      `Montaje industrial en placa MDF (${areaM2.toFixed(2)} m²)`,
  },
  montado_pvc: {
    id: "montado_pvc",
    name: "Montado sobre PVC Espumado",
    category: "vinilos",
    calculationType: "m2",
    internalBaseCostARS: 7500,
    markupMultiplier: 1.86,
    salePricePerUnitARS: 14000,
    description: "Pegado industrial sobre placa de PVC espumado blanco",
    clientDetailFormatter: ({ areaM2 }) =>
      `Montaje en PVC espumado blanco (${areaM2.toFixed(2)} m²)`,
  },
  montado_pai: {
    id: "montado_pai",
    name: "Montado sobre PAI",
    category: "vinilos",
    calculationType: "m2",
    internalBaseCostARS: 5100,
    markupMultiplier: 1.86,
    salePricePerUnitARS: 9500,
    description: "Pegado sobre placa de Poliestireno de Alto Impacto",
    clientDetailFormatter: ({ areaM2 }) =>
      `Montaje en PAI alto impacto (${areaM2.toFixed(2)} m²)`,
  },
  montado_chapa: {
    id: "montado_chapa",
    name: "Montado sobre chapa galvanizada",
    category: "vinilos",
    calculationType: "m2",
    internalBaseCostARS: 8700,
    markupMultiplier: 1.84,
    salePricePerUnitARS: 16000,
    description: "Pegado sobre chapa galvanizada lisa tratada",
    clientDetailFormatter: ({ areaM2 }) =>
      `Montaje en chapa galvanizada (${areaM2.toFixed(2)} m²)`,
  },

  // --- RÍGIDOS ---
  refilado_escuadra: {
    id: "refilado_escuadra",
    name: "Corte a escuadra / refilado al ras",
    category: "rigidos",
    calculationType: "fijo",
    internalBaseCostARS: 0,
    markupMultiplier: 1.0,
    salePricePerUnitARS: 0,
    description: "Corte perimetral a 90 grados limpio",
    clientDetailFormatter: () => "Corte a escuadra a 90° incluido",
  },
  troquelado_cnc: {
    id: "troquelado_cnc",
    name: "Troquelado / Router CNC de contorno",
    category: "rigidos",
    calculationType: "metro_perimetral",
    internalBaseCostARS: 2400,
    markupMultiplier: 1.875,
    salePricePerUnitARS: 4500,
    description: "Mecanizado CNC por fresa para siluetas irregulares o letras",
    clientDetailFormatter: ({ perimeterM }) =>
      `Ruteado CNC computarizado (${perimeterM.toFixed(2)} m de corte)`,
  },
  agujereado_fijaciones: {
    id: "agujereado_fijaciones",
    name: "Agujereado para fijaciones / tornillos",
    category: "rigidos",
    calculationType: "fijo",
    internalBaseCostARS: 600,
    markupMultiplier: 2.0,
    salePricePerUnitARS: 1200,
    description: "Perforaciones para tornillos o distanciadores",
    clientDetailFormatter: () => "Perforaciones para fijaciones y distanciadores",
  },
  despuntado_redondeado: {
    id: "despuntado_redondeado",
    name: "Despuntado de esquinas redondeadas",
    category: "rigidos",
    calculationType: "fijo",
    internalBaseCostARS: 750,
    markupMultiplier: 2.0,
    salePricePerUnitARS: 1500,
    description: "Bordes pulidos con radio suave para evitar accidentes en placas rígidas",
    clientDetailFormatter: () => "Esquinas redondeadas pulidas anti-corte",
  },
};

// =======================================================================
// 🎨 CONFIGURACIÓN DE TARIFA FIJA DE DISEÑO IA (PRIVADA)
// =======================================================================

let CURRENT_AI_DESIGN_FEE_ARS = 3500;

// =======================================================================
// 🧠 FUNCIONES DEL MOTOR DE CÁLCULO
// =======================================================================

/**
 * Calcula el subtotal y desglose seguro de terminaciones para el cliente.
 * Garantiza que NINGÚN dato de costo interno o margen salga del backend.
 */
export function calculateFinishings(input: CalculateFinishingsInput): CalculateFinishingsResult {
  const {
    widthCm = 100,
    heightCm = 100,
    quantity = 1,
    finishings = [],
    isAiDesign = false,
  } = input;

  const wCm = Math.max(5, Number(widthCm) || 100);
  const hCm = Math.max(5, Number(heightCm) || 100);
  const qty = Math.max(1, Number(quantity) || 1);

  const widthM = parseFloat((wCm / 100).toFixed(2));
  const heightM = parseFloat((hCm / 100).toFixed(2));
  const perimeterM = parseFloat(((2 * (wCm + hCm)) / 100).toFixed(2));
  const areaM2 = parseFloat(((wCm * hCm) / 10000).toFixed(4));

  let finishingsSubtotalARS = 0;
  const breakdown: ClientFinishingCalculatedItem[] = [];
  const summary: string[] = [];

  const uniqueFinishings = Array.from(new Set(finishings));

  for (const fId of uniqueFinishings) {
    const canonicalId = FINISHING_ID_ALIASES[fId] || fId;
    const itemDef = INTERNAL_FINISHINGS_CATALOG[canonicalId];
    if (!itemDef) continue;

    let itemFinalPriceARS = 0;

    switch (itemDef.calculationType) {
      case 'metro_perimetral': {
        itemFinalPriceARS = Math.round(perimeterM * itemDef.salePricePerUnitARS * qty);
        break;
      }
      case 'metro_lineal_ancho': {
        // Vainas sup/inf = 2 x ancho
        const totalWidthM = widthM * 2;
        itemFinalPriceARS = Math.round(totalWidthM * itemDef.salePricePerUnitARS * qty);
        break;
      }
      case 'metro_lineal_alto': {
        // Vainas laterales = 2 x alto
        const totalHeightM = heightM * 2;
        itemFinalPriceARS = Math.round(totalHeightM * itemDef.salePricePerUnitARS * qty);
        break;
      }
      case 'm2': {
        itemFinalPriceARS = Math.round(areaM2 * itemDef.salePricePerUnitARS * qty);
        break;
      }
      case 'fijo':
      case 'por_unidad':
      default: {
        itemFinalPriceARS = Math.round(itemDef.salePricePerUnitARS * qty);
        break;
      }
    }

    finishingsSubtotalARS += itemFinalPriceARS;

    const friendlyDetail = itemDef.clientDetailFormatter({
      widthM,
      heightM,
      perimeterM,
      areaM2,
      qty,
      priceARS: itemFinalPriceARS,
    });

    breakdown.push({
      id: itemDef.id,
      name: itemDef.name,
      priceARS: itemFinalPriceARS,
      totalCostARS: itemFinalPriceARS,
      details: friendlyDetail,
    });

    summary.push(itemDef.name);
  }

  // Tarifa fija de diseño IA
  const aiDesignFeeARS = isAiDesign ? CURRENT_AI_DESIGN_FEE_ARS : 0;
  const totalCalculatedARS = finishingsSubtotalARS + aiDesignFeeARS;

  return {
    finishingsSubtotalARS,
    breakdown,
    summary: summary.length > 0 ? summary : ['Corte estándar a medida'],
    aiDesignFeeARS,
    hasAiDesign: Boolean(isAiDesign),
    totalCalculatedARS,
  };
}

/**
 * Calcula únicamente la tarifa de diseño IA
 */
export function calculateAiDesignFee(isAiDesign?: boolean): {
  feeARS: number;
  isApplied: boolean;
  label: string;
} {
  if (!isAiDesign) {
    return { feeARS: 0, isApplied: false, label: '' };
  }
  return {
    feeARS: CURRENT_AI_DESIGN_FEE_ARS,
    isApplied: true,
    label: 'Tarifa fija por diseño asistido con IA (Póster Creator)',
  };
}

/**
 * Retorna el catálogo público para el frontend, libre de costos y márgenes.
 */
export function getClientFinishingCatalog(category?: string): ClientFinishingCatalogItem[] {
  return Object.values(INTERNAL_FINISHINGS_CATALOG)
    .filter((f) => !category || f.category === 'todos' || f.category === category)
    .map((f) => ({
      id: f.id,
      name: f.name,
      category: f.category,
      description: f.description,
    }));
}

/**
 * Retorna la configuración pública sin exponer la estructura de costos.
 */
export function getClientPricingConfig() {
  return {
    success: true,
    aiDesignFeeARS: CURRENT_AI_DESIGN_FEE_ARS,
    finishings: getClientFinishingCatalog(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Acceso administrativo interno para consultar o ajustar precios de venta
 */
export function adminUpdateFinishingPrices(updates: {
  aiDesignFeeARS?: number;
  finishings?: Record<string, { salePricePerUnitARS?: number; internalBaseCostARS?: number }>;
}) {
  if (typeof updates.aiDesignFeeARS === 'number' && updates.aiDesignFeeARS >= 0) {
    CURRENT_AI_DESIGN_FEE_ARS = updates.aiDesignFeeARS;
  }

  if (updates.finishings && typeof updates.finishings === 'object') {
    for (const [key, val] of Object.entries(updates.finishings)) {
      if (INTERNAL_FINISHINGS_CATALOG[key]) {
        if (typeof val.salePricePerUnitARS === 'number' && val.salePricePerUnitARS >= 0) {
          INTERNAL_FINISHINGS_CATALOG[key].salePricePerUnitARS = val.salePricePerUnitARS;
        }
        if (typeof val.internalBaseCostARS === 'number' && val.internalBaseCostARS >= 0) {
          INTERNAL_FINISHINGS_CATALOG[key].internalBaseCostARS = val.internalBaseCostARS;
        }
      }
    }
  }

  return {
    success: true,
    aiDesignFeeARS: CURRENT_AI_DESIGN_FEE_ARS,
  };
}
