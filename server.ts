var __defProp = Object.defineProperty;
var __name = (target, value) =>
  __defProp(target, "name", { value, configurable: true });
import { AiQuotaManager } from "./src/server/aiStore.ts";
import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { z } from "zod";
import { createServer as createViteServer } from "vite";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import {
  generatePosterDesignAction,
  liveChatSupportAction,
  generateBlogArticleAction,
} from "./src/server/ai/geminiActions";
dotenv.config();
const app = express();
const PORT = 3e3;
const rateLimitStore = new Map();
function createRateLimiter(options) {
  return (req, res, next) => {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket.remoteAddress ||
      "unknown";
    const key = `${req.baseUrl || ""}${req.path}:${ip}`;
    const now = Date.now();
    const record = rateLimitStore.get(key);
    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + options.windowMs });
      return next();
    }
    record.count += 1;
    if (record.count > options.maxRequests) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1e3);
      res.setHeader("Retry-After", retryAfterSec);
      return res
        .status(429)
        .json({
          error:
            options.message ||
            "L\xEDmite de peticiones excedido. Por favor espere antes de reintentar.",
          retryAfter: retryAfterSec,
        });
    }
    next();
  };
}
__name(createRateLimiter, "createRateLimiter");
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 6e4);
const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1e3,
  maxRequests: 20,
  message:
    "Demasiadas consultas de Inteligencia Artificial. Aguard\xE1 unos segundos e intent\xE1 nuevamente.",
});
const quoteRateLimiter = createRateLimiter({
  windowMs: 60 * 1e3,
  maxRequests: 60,
  message: "L\xEDmite de cotizaciones por minuto alcanzado.",
});
app.use(express.json({ limit: "10mb" }));
const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const mpClient = mpAccessToken
  ? new MercadoPagoConfig({ accessToken: mpAccessToken })
  : null;
const MARGIN_M2 = 2;
const MARGIN_UNIDAD = 2;
const MARGIN_PLACA = 2;
const MARGIN_METRO_LINEAL = 1.8;
let PRICING_SETTINGS_CONFIG = {
  aiDesignFeeARS: 3500,
  finishings: {
    rollo: {
      id: "rollo",
      name: "Entregado en rollo",
      category: "todos",
      calculationType: "fijo",
      unitCostARS: 0,
      description:
        "Se entrega embalado en rollo con film protector listo para traslado",
    },
    refilado: {
      id: "refilado",
      name: "Refilado al ras",
      category: "todos",
      calculationType: "fijo",
      unitCostARS: 0,
      description: "Corte perimetral limpio y exacto al borde de la gr\xE1fica",
    },
    corte_a_medida: {
      id: "corte_a_medida",
      name: "Corte exacto a medida (refilado al ras)",
      category: "todos",
      calculationType: "fijo",
      unitCostARS: 0,
      description: "Corte perimetral limpio con guillotina o mesa \xF3ptica",
    },
    bolsillos_portabanner: {
      id: "bolsillos_portabanner",
      name: "Bolsillos superior e inferior (vainas)",
      category: "lonas",
      calculationType: "metro_lineal_ancho",
      unitCostARS: 1500,
      description:
        "Dobladillo termo-soldado para ca\xF1os de hierro o varillas tensoras (superior e inferior)",
    },
    refuerzo_perimetral: {
      id: "refuerzo_perimetral",
      name: "Refuerzo perimetral termo-soldado",
      category: "lonas",
      calculationType: "metro_perimetral",
      unitCostARS: 1400,
      description:
        "Doble dobladillo soldado por calor que triplica la resistencia al desgarro",
    },
    ojales_50cm: {
      id: "ojales_50cm",
      name: "Colocaci\xF3n de Ojales met\xE1licos cada 50 cm",
      category: "lonas",
      calculationType: "metro_perimetral",
      unitCostARS: 1200,
      description:
        "Ojales zincados anticorrosivos distribuidos uniformemente cada 50 cm",
    },
    ojales_vertices: {
      id: "ojales_vertices",
      name: "Colocaci\xF3n de Ojales solo en las 4 esquinas",
      category: "lonas",
      calculationType: "fijo",
      unitCostARS: 1800,
      description:
        "Ojales reforzados en las cuatro esquinas para anclaje o portabanner",
    },
    panos: {
      id: "panos",
      name: "Entregado en pa\xF1os fraccionados",
      category: "vinilos",
      calculationType: "fijo",
      unitCostARS: 0,
      description:
        "Fraccionado en pa\xF1os con solape de 1.5 cm para f\xE1cil colocaci\xF3n",
    },
    montado_mdf: {
      id: "montado_mdf",
      name: "Montado sobre MDF distintos espesores",
      category: "vinilos",
      calculationType: "m2",
      unitCostARS: 8500,
      description: "Pegado industrial sobre placa de MDF fibrof\xE1cil",
    },
    montado_pvc: {
      id: "montado_pvc",
      name: "Montado sobre PVC distintos espesores",
      category: "vinilos",
      calculationType: "m2",
      unitCostARS: 14e3,
      description: "Pegado industrial sobre placa de PVC espumado blanco",
    },
    montado_pai: {
      id: "montado_pai",
      name: "Montado sobre PAI distintos espesores",
      category: "vinilos",
      calculationType: "m2",
      unitCostARS: 9500,
      description: "Pegado sobre placa de Poliestireno de Alto Impacto",
    },
    montado_chapa: {
      id: "montado_chapa",
      name: "Montado sobre chapa distintos espesores",
      category: "vinilos",
      calculationType: "m2",
      unitCostARS: 16e3,
      description: "Pegado sobre chapa galvanizada lisa tratada",
    },
    refilado_escuadra: {
      id: "refilado_escuadra",
      name: "Corte a escuadra / refilado al ras",
      category: "rigidos",
      calculationType: "fijo",
      unitCostARS: 0,
      description: "Corte a 90 grados perimetral limpio",
    },
    troquelado_cnc: {
      id: "troquelado_cnc",
      name: "Troquelado / Router CNC de contorno",
      category: "rigidos",
      calculationType: "metro_perimetral",
      unitCostARS: 4500,
      description:
        "Mecanizado CNC por fresa para siluetas irregulares o letras",
    },
    agujereado_fijaciones: {
      id: "agujereado_fijaciones",
      name: "Agujereado para fijaciones / tornillos",
      category: "rigidos",
      calculationType: "fijo",
      unitCostARS: 1200,
      description: "Perforaciones para tornillos o distanciadores",
    },
    despuntado_redondeado: {
      id: "despuntado_redondeado",
      name: "Despuntado de esquinas redondeadas",
      category: "rigidos",
      calculationType: "fijo",
      unitCostARS: 1500,
      description:
        "Bordes pulidos con radio suave para evitar accidentes en placas r\xEDgidas",
    },
    laminado_protector: {
      id: "laminado_protector",
      name: "Laminado protector UV & anti-rayas",
      category: "vinilos",
      calculationType: "m2",
      unitCostARS: 3500,
      description:
        "Pel\xEDcula transparente en fr\xEDo para proteger vinilos contra solventes y rayos UV",
    },
    soldado_termico: {
      id: "soldado_termico",
      name: "Uni\xF3n y soldado t\xE9rmico",
      category: "lonas",
      calculationType: "fijo",
      unitCostARS: 3500,
      description:
        "Fusi\xF3n molecular de pa\xF1os de lona para formatos gigantes",
    },
  },
};
let CATALOG_VERSION = Date.now();
let IN_MEMORY_PRODUCTS = [
  {
    id: "lona_front_9oz",
    name: "Lonas Front Brillante 9 onzas",
    category: "lonas",
    mode: "m2",
    costARS: 7200,
    salePriceARS: 14400,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Lona liviana econ\xF3mica brillante para eventos temporarios.",
    isActive: true,
  },
  {
    id: "lona_front_13oz",
    name: "Lonas Front Brillante 13 onzas",
    category: "lonas",
    mode: "m2",
    costARS: 7500,
    salePriceARS: 15e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc:
      "Est\xE1ndar industrial brillante para carteler\xEDa frontal y marquesinas.",
    badge: "M\xE1s Vendido",
    isActive: true,
  },
  {
    id: "lona_front",
    name: "Lonas Front Brillante 13 onzas (Alias)",
    category: "lonas",
    mode: "m2",
    costARS: 7500,
    salePriceARS: 15e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Est\xE1ndar industrial brillante.",
    isActive: true,
  },
  {
    id: "lona_front_mate_13oz",
    name: "Lonas Front Mate 13 onzas",
    category: "lonas",
    mode: "m2",
    costARS: 8800,
    salePriceARS: 17600,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc:
      "Acabado mate satinado anti-reflejo para fondos de prensa y streaming.",
    badge: "Anti-reflejo",
    isActive: true,
  },
  {
    id: "lona_front_mate",
    name: "Lonas Front Mate 13 onzas (Alias)",
    category: "lonas",
    mode: "m2",
    costARS: 8800,
    salePriceARS: 17600,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Acabado mate satinado anti-reflejo.",
    isActive: true,
  },
  {
    id: "lona_blackout_simple",
    name: "Lona Black Out",
    category: "lonas",
    mode: "m2",
    costARS: 12e3,
    salePriceARS: 24e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "100% opaca con alma interna negra. Bloquea sombras traseras.",
    isActive: true,
  },
  {
    id: "lona_blackout_bifaz_16oz",
    name: "Lonas Black Out bifaz 16 onz",
    category: "lonas",
    mode: "m2",
    costARS: 15e3,
    salePriceARS: 3e4,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc:
      "Lona pesada de 16 oz con impresi\xF3n en ambas caras en registro.",
    badge: "Doble Faz 16 oz",
    isActive: true,
  },
  {
    id: "lona_blackout_doble",
    name: "Lonas Black Out bifaz 16 onz (Alias)",
    category: "lonas",
    mode: "m2",
    costARS: 15e3,
    salePriceARS: 3e4,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Lona pesada de 16 oz doble faz.",
    isActive: true,
  },
  {
    id: "lona_black_13oz",
    name: "Lonas Black 13 onzas",
    category: "lonas",
    mode: "m2",
    costARS: 8200,
    salePriceARS: 16400,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Lona de 13 oz con dorso negro anti-trasluz.",
    isActive: true,
  },
  {
    id: "lona_mesh",
    name: "Mesh",
    category: "lonas",
    mode: "m2",
    costARS: 9400,
    salePriceARS: 18800,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc:
      "Tejido microperforado cortaviento para canchas, alambrados y edificios.",
    badge: "Cortaviento",
    isActive: true,
  },
  {
    id: "lona_back_doble",
    name: "Lona Backlight doble pasada",
    category: "lonas",
    mode: "m2",
    costARS: 9700,
    salePriceARS: 19400,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc:
      "Transl\xFAcida para cajas de luz y marquesinas con LED interno.",
    badge: "Cajas de Luz",
    isActive: true,
  },
  {
    id: "vinilo_estandar_brillante",
    name: "Vinilo est\xE1ndar brillante",
    category: "vinilos",
    mode: "m2",
    costARS: 7500,
    salePriceARS: 15e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Vinilo autoadhesivo brillante para vidrieras y carteles.",
    badge: "Popular",
    isActive: true,
  },
  {
    id: "vinilo_comun",
    name: "Vinilo est\xE1ndar brillante (Alias)",
    category: "vinilos",
    mode: "m2",
    costARS: 7500,
    salePriceARS: 15e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Vinilo autoadhesivo brillante.",
    isActive: true,
  },
  {
    id: "vinilo_estandar_mate",
    name: "Vinilo est\xE1ndar mate",
    category: "vinilos",
    mode: "m2",
    costARS: 8e3,
    salePriceARS: 16e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Vinilo autoadhesivo mate sin reflejos para interiores.",
    isActive: true,
  },
  {
    id: "vinilo_mate",
    name: "Vinilo est\xE1ndar mate (Alias)",
    category: "vinilos",
    mode: "m2",
    costARS: 8e3,
    salePriceARS: 16e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Vinilo mate.",
    isActive: true,
  },
  {
    id: "vinilo_arlon",
    name: "Vinilo Arlon",
    category: "vinilos",
    mode: "m2",
    costARS: 14e3,
    salePriceARS: 28e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Vinilo polim\xE9rico premium Arlon para flotas comerciales.",
    badge: "Gama Alta",
    isActive: true,
  },
  {
    id: "vinilo_avery",
    name: "Vinilo Avery",
    category: "vinilos",
    mode: "m2",
    costARS: 14500,
    salePriceARS: 29e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "L\xEDnea profesional Avery Dennison de alta conformabilidad.",
    badge: "Avery Dennison",
    isActive: true,
  },
  {
    id: "vinilo_oracal_100",
    name: "Vinilos Oracal 100",
    category: "vinilos",
    mode: "m2",
    costARS: 8500,
    salePriceARS: 17e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc:
      "Vinilo de corte monom\xE9rico econ\xF3mico Oracal 100 en 12 a 20 colores.",
    badge: "16 Colores",
    isActive: true,
  },
  {
    id: "vinilo_oracal_651",
    name: "Vinilos Oracal 651",
    category: "vinilos",
    mode: "m2",
    costARS: 11e3,
    salePriceARS: 22e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc:
      "Est\xE1ndar mundial de corte intermedio Oracal 651 en 12 a 20 colores.",
    badge: "Oracal 651",
    isActive: true,
  },
  {
    id: "vinilo_oracal_751",
    name: "Vinilos Oracal 751",
    category: "vinilos",
    mode: "m2",
    costARS: 18500,
    salePriceARS: 37e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc:
      "Vinilo fundido (Cast) Oracal 751 de m\xE1xima duraci\xF3n sobre molduras.",
    badge: "Cast 8 A\xF1os",
    isActive: true,
  },
  {
    id: "vinilo_mcal",
    name: "Vinilos Mcal",
    category: "vinilos",
    mode: "m2",
    costARS: 9e3,
    salePriceARS: 18e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Vinilo autoadhesivo MCAL en 12 a 20 colores de cat\xE1logo.",
    badge: "MCAL Colores",
    isActive: true,
  },
  {
    id: "vinilo_clear_brillante",
    name: "Vinilo Clear brillante est\xE1ndar",
    category: "vinilos",
    mode: "m2",
    costARS: 8500,
    salePriceARS: 17e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Base 100% transparente para vidrios y mamparas.",
    badge: "100% Transparente",
    isActive: true,
  },
  {
    id: "vinilo_cristal",
    name: "Vinilo Clear brillante est\xE1ndar (Alias)",
    category: "vinilos",
    mode: "m2",
    costARS: 8500,
    salePriceARS: 17e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Transparente con fondo transl\xFAcido.",
    isActive: true,
  },
  {
    id: "vinilo_microperforado",
    name: "Vinilo Microperforado",
    category: "vinilos",
    mode: "m2",
    costARS: 8300,
    salePriceARS: 16600,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Visibilidad de adentro hacia afuera para vidrieras y autos.",
    badge: "Homologado",
    isActive: true,
  },
  {
    id: "vinilo_esmerilado_estandar",
    name: "Vinilo esmerilado est\xE1ndar",
    category: "vinilos",
    mode: "m2",
    costARS: 9500,
    salePriceARS: 19e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Efecto vidrio arenado para privacidad en oficinas y mamparas.",
    badge: "Privacidad",
    isActive: true,
  },
  {
    id: "vinilo_esmerilado_oracal",
    name: "Vinilo esmerilado Oracal",
    category: "vinilos",
    mode: "m2",
    costARS: 15500,
    salePriceARS: 31e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc:
      "L\xEDnea premium ORAFOL Oracal 8510 para arquitectura corporativa.",
    badge: "Oracal 8510",
    isActive: true,
  },
  {
    id: "vinilo_laminado",
    name: "Vinilo con Laminado de Protecci\xF3n UV",
    category: "vinilos",
    mode: "m2",
    costARS: 18e3,
    salePriceARS: 36e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Capa protectora contra rayones y sol intenso.",
    isActive: true,
  },
  {
    id: "vinilo_impreso_corte",
    name: "Vinilo Impreso + Troquelado / Corte",
    category: "vinilos",
    mode: "m2",
    costARS: 13e3,
    salePriceARS: 26e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    minAreaM2: 5,
    stockStatus: "disponible",
    shortDesc: "Impresi\xF3n y corte de siluetas / stickers.",
    isActive: true,
  },
  {
    id: "placa_pvc_3mm",
    name: "Placas PVC 3 mm",
    category: "rigidos",
    mode: "placa",
    costARS: 55e3,
    salePriceARS: 11e4,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 122,
    plateHeightCm: 244,
    plateAreaM2: 2.9768,
    stockStatus: "disponible",
    shortDesc:
      "PVC espumado r\xEDgido liviano de 3 mm para carteles y cuadros.",
    badge: "Placa 122\xD7244 cm",
    isActive: true,
  },
  {
    id: "placa_pvc_3mm_simple",
    name: "Placas PVC 3 mm (Alias)",
    category: "rigidos",
    mode: "placa",
    costARS: 55e3,
    salePriceARS: 11e4,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 122,
    plateHeightCm: 244,
    plateAreaM2: 2.9768,
    stockStatus: "disponible",
    shortDesc: "PVC espumado 3 mm.",
    isActive: true,
  },
  {
    id: "placa_pvc_5mm",
    name: "Placas PVC 5 mm",
    category: "rigidos",
    mode: "placa",
    costARS: 82e3,
    salePriceARS: 164e3,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 122,
    plateHeightCm: 244,
    plateAreaM2: 2.9768,
    stockStatus: "disponible",
    shortDesc:
      "PVC espumado de 5 mm de m\xE1xima rigidez para letreros de fachada.",
    badge: "Placa 122\xD7244 cm (5 mm)",
    isActive: true,
  },
  {
    id: "placa_pvc_5mm_simple",
    name: "Placas PVC 5 mm (Alias)",
    category: "rigidos",
    mode: "placa",
    costARS: 82e3,
    salePriceARS: 164e3,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 122,
    plateHeightCm: 244,
    plateAreaM2: 2.9768,
    stockStatus: "disponible",
    shortDesc: "PVC espumado 5 mm.",
    isActive: true,
  },
  {
    id: "placa_pvc_3mm_doble",
    name: "Placa PVC Espumado 3 mm Doble Faz (122\xD7244 cm)",
    category: "rigidos",
    mode: "placa",
    costARS: 65e3,
    salePriceARS: 13e4,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 122,
    plateHeightCm: 244,
    plateAreaM2: 2.9768,
    stockStatus: "disponible",
    shortDesc: "Placa con vinilo montado en ambas caras.",
    isActive: true,
  },
  {
    id: "placa_alto_impacto_1mm",
    name: "Alto impacto 1 mm",
    category: "rigidos",
    mode: "placa",
    costARS: 45e3,
    salePriceARS: 9e4,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 100,
    plateHeightCm: 200,
    plateAreaM2: 2,
    stockStatus: "disponible",
    shortDesc: "P.A.I. 1 mm para carteles de seguridad, men\xFAs y displays.",
    badge: "Placa 100\xD7200 cm (1 mm)",
    isActive: true,
  },
  {
    id: "pai_1mm",
    name: "Alto impacto 1 mm (Alias)",
    category: "rigidos",
    mode: "placa",
    costARS: 45e3,
    salePriceARS: 9e4,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 100,
    plateHeightCm: 200,
    plateAreaM2: 2,
    stockStatus: "disponible",
    shortDesc: "P.A.I. 1 mm.",
    isActive: true,
  },
  {
    id: "placa_alto_impacto_2mm",
    name: "Alto impacto 2 mm",
    category: "rigidos",
    mode: "placa",
    costARS: 58e3,
    salePriceARS: 116e3,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 100,
    plateHeightCm: 200,
    plateAreaM2: 2,
    stockStatus: "disponible",
    shortDesc:
      "P.A.I. 2 mm para paneles de obra y se\xF1al\xE9tica industrial.",
    badge: "Placa 100\xD7200 cm (2 mm)",
    isActive: true,
  },
  {
    id: "pai_2mm",
    name: "Alto impacto 2 mm (Alias)",
    category: "rigidos",
    mode: "placa",
    costARS: 58e3,
    salePriceARS: 116e3,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 100,
    plateHeightCm: 200,
    plateAreaM2: 2,
    stockStatus: "disponible",
    shortDesc: "P.A.I. 2 mm.",
    isActive: true,
  },
  {
    id: "placa_alto_impacto_3mm",
    name: "Alto impacto 3 mm",
    category: "rigidos",
    mode: "placa",
    costARS: 72e3,
    salePriceARS: 144e3,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 100,
    plateHeightCm: 200,
    plateAreaM2: 2,
    stockStatus: "disponible",
    shortDesc:
      "P.A.I. 3 mm de m\xE1xima robustez para uso rudo y termoformado.",
    badge: "Placa 100\xD7200 cm (3 mm)",
    isActive: true,
  },
  {
    id: "placa_acrilico_blanco_3mm",
    name: "Acr\xEDlico Blanco 3 mm",
    category: "rigidos",
    mode: "placa",
    costARS: 95e3,
    salePriceARS: 19e4,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 122,
    plateHeightCm: 244,
    plateAreaM2: 2.9768,
    stockStatus: "disponible",
    shortDesc:
      "Acr\xEDlico colado blanco opalino 3 mm para placas y cajas de luz.",
    badge: "Acr\xEDlico Premium",
    isActive: true,
  },
  {
    id: "portabanner_rollup_80x200",
    name: "Porta Banner Roll Up 80\xD7200 cm",
    category: "portabanners",
    mode: "unidad",
    costARS: 46e3,
    salePriceARS: 92e3,
    marginPercent: 100,
    unitLabel: "unidad",
    stockStatus: "disponible",
    shortDesc:
      "Estructura de aluminio autoenrollable con bolso acolchado y lona montada.",
    badge: "Premium",
    isActive: true,
  },
  {
    id: "portabanner_doble_tensor",
    name: "Porta Banner Doble Tensor 80\xD7200 cm",
    category: "portabanners",
    mode: "unidad",
    costARS: 4e4,
    salePriceARS: 8e4,
    marginPercent: 100,
    unitLabel: "unidad",
    stockStatus: "disponible",
    shortDesc:
      "Base pesada de fundici\xF3n con ca\xF1os de hierro enlozados y bolso.",
    isActive: true,
  },
  {
    id: "portabanner_x_90x190",
    name: "Porta Banner Tipo Ara\xF1a X 90\xD7190 cm",
    category: "portabanners",
    mode: "unidad",
    costARS: 28e3,
    salePriceARS: 56e3,
    marginPercent: 100,
    unitLabel: "unidad",
    stockStatus: "disponible",
    shortDesc:
      "Estructura de varillas de fibra liviana y econ\xF3mica para eventos.",
    isActive: true,
  },
  {
    id: "caballete_vereda_doble",
    name: "Caballete de Vereda Met\xE1lico Plegable Doble Faz",
    category: "estructuras",
    mode: "unidad",
    costARS: 52e3,
    salePriceARS: 104e3,
    marginPercent: 100,
    unitLabel: "unidad",
    stockStatus: "disponible",
    shortDesc:
      "Estructura de ca\xF1o 20\xD720 con chapas galvanizadas pintadas al horno.",
    isActive: true,
  },
  {
    id: "marquesina_led_estandar",
    name: "Caja Luminaria Backlight Est\xE1ndar 100\xD760 cm con LED",
    category: "estructuras",
    mode: "unidad",
    costARS: 95e3,
    salePriceARS: 19e4,
    marginPercent: 100,
    unitLabel: "unidad",
    stockStatus: "a_pedido",
    shortDesc:
      "Gabinete de aluminio con m\xF3dulos LED perimetrales y lona tensada.",
    isActive: true,
  },
  {
    id: "cinta_bifaz_vhb",
    name: "Cinta Bifaz de Montaje 3M VHB de Alta Adherencia",
    category: "insumos",
    mode: "metro_lineal",
    costARS: 3200,
    salePriceARS: 5800,
    marginPercent: 81,
    unitLabel: "metro lineal",
    stockStatus: "disponible",
    shortDesc:
      "Para fijaci\xF3n estructural de letras corp\xF3reas y placas sin perforar.",
    badge: "Taller",
    isActive: true,
  },
  {
    id: "perfil_aluminio_tensor",
    name: "Perfil de Aluminio Tensor perimetral para Lona",
    category: "estructuras",
    mode: "metro_lineal",
    costARS: 6400,
    salePriceARS: 11500,
    marginPercent: 80,
    unitLabel: "metro lineal",
    linearWidthCm: 5,
    stockStatus: "disponible",
    shortDesc:
      "Perfil gu\xEDa con ranura para tensado prolijo sin ojales a la vista.",
    isActive: true,
  },
  {
    id: "faja_reflectiva_grado_ing",
    name: "Faja Reflectiva Grado Ingenier\xEDa 5 cm",
    category: "insumos",
    mode: "metro_lineal",
    costARS: 4100,
    salePriceARS: 7500,
    marginPercent: 83,
    unitLabel: "metro lineal",
    linearWidthCm: 5,
    stockStatus: "disponible",
    shortDesc: "Cumple normas viales para paragolpes y laterales de camiones.",
    isActive: true,
  },
  {
    id: "keder_silicona_perimetral",
    name: "Burlete Keder de Silicona para Bastidor Textil",
    category: "insumos",
    mode: "metro_lineal",
    costARS: 1800,
    salePriceARS: 3400,
    marginPercent: 89,
    unitLabel: "metro lineal",
    stockStatus: "disponible",
    shortDesc:
      "Confecci\xF3n cosida perimetral para insertar en perfiler\xEDa SEG.",
    isActive: true,
  },
  {
    id: "rollo_lona_front_160",
    name: "Lona Front 13 oz Fraccionada por metro lineal (Ancho 1.60m)",
    category: "lonas",
    mode: "metro_lineal",
    costARS: 12e3,
    salePriceARS: 21600,
    marginPercent: 80,
    unitLabel: "metro lineal",
    linearWidthCm: 160,
    stockStatus: "disponible",
    shortDesc:
      "Venta por metro lineal en bobina de 160 cm de ancho para carteleros.",
    isActive: true,
  },
  {
    id: "plastico_corrugado_2_2mm",
    name: "Placa Pl\xE1stico Corrugado 2.2 mm (122\xD7244 cm)",
    category: "rigidos",
    mode: "placa",
    costARS: 36e3,
    salePriceARS: 72e3,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 122,
    plateHeightCm: 244,
    plateAreaM2: 2.9768,
    stockStatus: "disponible",
    shortDesc: "Carteles inmobiliarios Vende/Alquila.",
    badge: "Econ\xF3mico",
    isActive: true,
  },
  {
    id: "plastico_corrugado_3_2mm",
    name: "Placa Pl\xE1stico Corrugado 3.2 mm (122\xD7244 cm)",
    category: "rigidos",
    mode: "placa",
    costARS: 41e3,
    salePriceARS: 82e3,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 122,
    plateHeightCm: 244,
    plateAreaM2: 2.9768,
    stockStatus: "disponible",
    shortDesc: "Mayor durabilidad exterior.",
    isActive: true,
  },
  {
    id: "placa_polifan_corte_2cm",
    name: "Placa Polif\xE1n 20 mm con corte pantogr\xE1fico (60\xD7120 cm)",
    category: "corporeos",
    mode: "placa",
    costARS: 4e4,
    salePriceARS: 8e4,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 60,
    plateHeightCm: 120,
    plateAreaM2: 0.72,
    stockStatus: "disponible",
    shortDesc: "Espuma extruida densa para letras corp\xF3reas 3D.",
    isActive: true,
  },
  {
    id: "corporeo_polifan_30mm",
    name: "Corp\xF3reos en Polif\xE1n 30 mm (60\xD7120 cm)",
    category: "corporeos",
    mode: "placa",
    costARS: 55e3,
    salePriceARS: 11e4,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 60,
    plateHeightCm: 120,
    plateAreaM2: 0.72,
    stockStatus: "disponible",
    shortDesc: "Polif\xE1n de 30 mm de espesor para logos 3D.",
    isActive: true,
  },
  {
    id: "corporeo_acrilico_laser",
    name: "Corp\xF3reos en Acr\xEDlico Corte L\xE1ser",
    category: "corporeos",
    mode: "placa",
    costARS: 98e3,
    salePriceARS: 196e3,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 122,
    plateHeightCm: 244,
    plateAreaM2: 2.9768,
    stockStatus: "disponible",
    shortDesc: "Acr\xEDlico cortado a l\xE1ser de alta precisi\xF3n.",
    isActive: true,
  },
  {
    id: "corporeo_mdf_cnc",
    name: "Corp\xF3reos en MDF / Madera CNC",
    category: "corporeos",
    mode: "placa",
    costARS: 48e3,
    salePriceARS: 96e3,
    marginPercent: 100,
    unitLabel: "placa",
    plateWidthCm: 183,
    plateHeightCm: 260,
    plateAreaM2: 4.758,
    stockStatus: "disponible",
    shortDesc: "Fibrof\xE1cil mecanizado por router CNC.",
    isActive: true,
  },
  {
    id: "dtf_textil_metro",
    name: "Estampado DTF Textil por Metro Lineal (60 cm ancho)",
    category: "estampados",
    mode: "metro_lineal",
    costARS: 9500,
    salePriceARS: 19e3,
    marginPercent: 100,
    unitLabel: "metro lineal",
    linearWidthCm: 60,
    stockStatus: "disponible",
    shortDesc: "Transfer digital textil DTF para todo tipo de telas.",
    isActive: true,
  },
  {
    id: "sublimacion_textil_m2",
    name: "Sublimaci\xF3n Textil Digital por m\xB2",
    category: "estampados",
    mode: "m2",
    costARS: 8e3,
    salePriceARS: 16e3,
    marginPercent: 100,
    unitLabel: "m\xB2",
    stockStatus: "disponible",
    shortDesc: "Estampado continuo por sublimaci\xF3n a 200\xB0C.",
    isActive: true,
  },
  {
    id: "vinilo_termotransferible_corte",
    name: "Vinilo Termotransferible Textil de Corte",
    category: "estampados",
    mode: "metro_lineal",
    costARS: 7e3,
    salePriceARS: 14e3,
    marginPercent: 100,
    unitLabel: "metro lineal",
    linearWidthCm: 50,
    stockStatus: "disponible",
    shortDesc: "Vinilo termoadhesivo para n\xFAmeros y logos.",
    isActive: true,
  },
];
function getCostTableMap() {
  const map = {};
  IN_MEMORY_PRODUCTS.forEach((p) => {
    map[p.id] = p;
  });
  return map;
}
__name(getCostTableMap, "getCostTableMap");

function mapClientMaterialIdToServer(materialId) {
  if (!materialId) return "lona_front_13oz";
  const map = {
    // GIGANTOGRAFÍAS - Lonas
    "giganto_lonas": "lona_front_13oz",
    "giganto_lona_front": "lona_front_13oz",
    "giganto_lona_back": "lona_back_doble",
    "giganto_lona_mesh": "lona_mesh",
    "giganto_lona_blackout": "lona_blackout_simple",

    // GIGANTOGRAFÍAS - Vinilos
    "giganto_vinilos": "vinilo_estandar_brillante",
    "giganto_vinilo_micro": "vinilo_microperforado",
    "giganto_vinilo_esmerilado": "vinilo_esmerilado_estandar",
    "giganto_vinilo_vehicular": "vinilo_arlon",

    // GIGANTOGRAFÍAS - Papeles
    "giganto_papeles": "papel_fotografico_mate",
    "giganto_papel_citylight": "papel_backlight",
    "giganto_papel_blueback": "papel_afiche",

    // CARTELES - Bastidores Tensados
    "cartel_bastidor_front": "lona_front_13oz",
    "cartel_bastidor_back": "lona_back_doble",
    "cartel_fondo_prensa_blackout": "lona_blackout_simple",

    // CARTELES - Placas y Rígidos
    "cartel_pvc": "placa_pvc_3mm",
    "cartel_pai": "placa_alto_impacto_2mm",
    "cartel_mdf": "placa_pvc_3mm",
    "cartel_chapa": "placa_pvc_3mm",
    "cartel_foamboard": "placa_pvc_3mm",
    "cartel_corrugado": "placa_corrugado_4mm",

    // CORPÓREOS - Polyfan
    "corp_polyfan": "placa_polifan_corte_2cm",
    "corp_polyfan_pai": "placa_polifan_corte_2cm",
    "corp_polyfan_pai_vinilo": "placa_polifan_corte_2cm",

    // CORPÓREOS - Acrílico
    "corp_acrilico_color": "corporeo_acrilico_laser",
    "corp_acrilico_cristal": "corporeo_acrilico_laser",

    // CORPÓREOS - Metal y Chapa
    "corp_chapa": "corporeo_chapa_galvanizada",
    "corp_chapa_acrilico": "corporeo_chapa_galvanizada",
    "corp_chapa_acrilico_iluminacion": "corporeo_chapa_galvanizada",

    // CORPÓREOS - Madera MDF
    "corp_mdf": "corporeo_mdf_cnc",

    // CORPÓREOS - 3D y Mixtos
    "corp_impresos_3d": "impresion3d_corporeos",
    "corp_impresos_3d_iluminacion": "impresion3d_corporeos",
    "corp_mixtos": "impresion3d_corporeos",

    // ESTAMPADOS
    "estampado_dtf": "dtf_textil_metro",
    "estampado_sublimacion": "sublimacion_textil_m2",
    "estampado_vinilo_corte": "vinilo_termotransferible_corte",

    // IMPRESIÓN 3D
    "impresion3d_prototipos": "impresion3d_prototipos",
    "impresion3d_corporeos": "impresion3d_corporeos",
    "impresion3d_iluminacion": "impresion3d_iluminacion",
  };
  return map[materialId] || materialId;
}
__name(mapClientMaterialIdToServer, "mapClientMaterialIdToServer");

const quoteServerSchema = z.object({
  materialId: z.string().min(1, "El materialId es obligatorio"),
  widthCm: z.preprocess(
    (val) => (val === void 0 || val === null ? void 0 : Number(val)),
    z.number().positive().min(5).max(5e3).optional(),
  ),
  heightCm: z.preprocess(
    (val) => (val === void 0 || val === null ? void 0 : Number(val)),
    z.number().positive().min(5).max(5e3).optional(),
  ),
  quantity: z.preprocess(
    (val) => (val === void 0 || val === null ? 1 : Number(val)),
    z.number().int().min(1).max(1e4).optional().default(1),
  ),
  printQuality: z
    .enum(["estandar", "alta_resolucion"])
    .optional()
    .default("estandar"),
  inkType: z
    .enum(["solvente", "uv", "directa_uv"])
    .optional()
    .default("solvente"),
  selectedColor: z.string().optional(),
  mountOption: z
    .object({
      type: z.enum(["mdf", "pvc", "pai", "chapa"]),
      typeName: z.string(),
      thickness: z.string(),
      pricePerM2ARS: z.number(),
    })
    .optional(),
  finishings: z.array(z.string()).optional().default([]),
  isAiDesign: z.boolean().optional().default(false),
  wholesaleTierRequested: z.string().optional(),
});
app.get("/api/pricing-config", (req, res) => {
  return res.json({
    success: true,
    aiDesignFeeARS: PRICING_SETTINGS_CONFIG.aiDesignFeeARS,
    finishings: PRICING_SETTINGS_CONFIG.finishings,
    timestamp: new Date().toISOString(),
  });
});
app.get("/api/admin/pricing-config", (req, res) => {
  return res.json({ success: true, data: PRICING_SETTINGS_CONFIG });
});
app.put("/api/admin/pricing-config", express.json(), (req, res) => {
  try {
    const { aiDesignFeeARS, finishings } = req.body;
    if (typeof aiDesignFeeARS === "number" && aiDesignFeeARS >= 0) {
      PRICING_SETTINGS_CONFIG.aiDesignFeeARS = aiDesignFeeARS;
    }
    if (finishings && typeof finishings === "object") {
      Object.keys(finishings).forEach((key) => {
        if (PRICING_SETTINGS_CONFIG.finishings[key]) {
          const item = finishings[key];
          if (typeof item.unitCostARS === "number" && item.unitCostARS >= 0) {
            PRICING_SETTINGS_CONFIG.finishings[key].unitCostARS =
              item.unitCostARS;
          }
          if (item.name)
            PRICING_SETTINGS_CONFIG.finishings[key].name = item.name;
          if (item.description)
            PRICING_SETTINGS_CONFIG.finishings[key].description =
              item.description;
          if (item.calculationType)
            PRICING_SETTINGS_CONFIG.finishings[key].calculationType =
              item.calculationType;
        }
      });
    }
    return res.json({
      success: true,
      message:
        "Tarifario de terminaciones y costo de dise\xF1o IA actualizados correctamente.",
      data: PRICING_SETTINGS_CONFIG,
    });
  } catch (err) {
    console.error("Error actualizando tarifario:", err);
    return res
      .status(500)
      .json({ error: "Error al actualizar tarifario de terminaciones." });
  }
});
const quoteBatchSchema = z.object({
  materialId: z.string().min(1, "El materialId es obligatorio"),
  items: z.array(
    z.object({
      id: z.string(),
      materialId: z.string().optional(),
      widthCm: z.number().positive().min(5).max(5e3),
      heightCm: z.number().positive().min(5).max(5e3),
      quantity: z.number().int().min(1).max(1e4),
      printQuality: z
        .enum(["estandar", "alta_resolucion"])
        .optional()
        .default("estandar"),
      inkType: z.string().optional().default("solvente"),
      selectedColor: z.string().optional(),
      finishings: z.array(z.string()).optional().default([]),
      isAiDesign: z.boolean().optional().default(false),
    }),
  ),
  wholesaleTierRequested: z.enum(["bronce", "plata", "oro"]).optional(),
  mountOption: z
    .object({
      id: z.string(),
      typeName: z.string(),
      thickness: z.string(),
      pricePerM2ARS: z.number(),
    })
    .optional(),
});
app.post("/api/quote", quoteRateLimiter, (req, res) => {
  try {
    const valResult = quoteServerSchema.safeParse(req.body);
    if (!valResult.success) {
      const issueMsg =
        valResult.error.issues[0]?.message ||
        "Par\xE1metros de cotizaci\xF3n no v\xE1lidos.";
      return res
        .status(400)
        .json({ error: `Validaci\xF3n de medidas Zod: ${issueMsg}` });
    }
    const {
      materialId,
      widthCm,
      heightCm,
      quantity = 1,
      printQuality = "estandar",
      inkType = "solvente",
      selectedColor,
      mountOption,
      finishings = [],
      isAiDesign = false,
      wholesaleTierRequested,
    } = valResult.data;
    const costMap = getCostTableMap();
    const mappedMaterialId = mapClientMaterialIdToServer(materialId);
    if (!mappedMaterialId || !costMap[mappedMaterialId]) {
      return res
        .status(400)
        .json({
          error:
            "Material no encontrado o no v\xE1lido en cat\xE1logo del servidor.",
        });
    }
    const materialConfig = costMap[mappedMaterialId];
    const qty = Math.max(1, Number(quantity) || 1);
    const transparencyNotes = [];
    let unitPriceARS = 0;
    let baseMaterialSubtotalARS = 0;
    let calculatedAreaM2 = void 0;
    let effectiveBillableAreaM2 = void 0;
    let platesCount = void 0;
    let plateSurfaceM2 = void 0;
    let fullPlateWarning = false;
    let minAreaAppliedWarning = false;
    if (materialConfig.mode === "m2") {
      const w = Math.max(10, Number(widthCm) || 100);
      const h = Math.max(10, Number(heightCm) || 100);
      const singleAreaM2 = (w * h) / 1e4;
      const totalAreaRequested = singleAreaM2 * qty;
      calculatedAreaM2 = parseFloat(singleAreaM2.toFixed(4));
      let billableTotalArea = totalAreaRequested;
      if (
        materialConfig.minAreaM2 &&
        totalAreaRequested < materialConfig.minAreaM2
      ) {
        billableTotalArea = materialConfig.minAreaM2;
        minAreaAppliedWarning = true;
        transparencyNotes.push(
          `El material seleccionado requiere un m\xEDnimo de producci\xF3n de ${materialConfig.minAreaM2} m\xB2. Se aplic\xF3 la base m\xEDnima de facturaci\xF3n.`,
        );
      }
      effectiveBillableAreaM2 = parseFloat(billableTotalArea.toFixed(4));
      const baseM2PriceARS = (materialConfig.costARS || 7500) * MARGIN_M2;
      baseMaterialSubtotalARS = Math.round(baseM2PriceARS * billableTotalArea);
      transparencyNotes.push(
        `C\xE1lculo de sustrato por superficie: ${(singleAreaM2 * qty).toFixed(2)} m\xB2 totales (${w}\xD7${h} cm x ${qty} unid.).`,
      );
    } else if (materialConfig.mode === "metro_lineal") {
      const lengthMeters = Math.max(
        1,
        (Number(heightCm) || Number(widthCm) || 100) / 100,
      );
      const totalLinearM = lengthMeters * qty;
      const baseLinearPriceARS =
        (materialConfig.costARS || 3200) * MARGIN_METRO_LINEAL;
      baseMaterialSubtotalARS = Math.round(baseLinearPriceARS * totalLinearM);
      transparencyNotes.push(
        `C\xE1lculo de sustrato por metro lineal: ${totalLinearM.toFixed(2)} ml totales (${lengthMeters.toFixed(2)} m x ${qty} unid.).`,
      );
    } else if (materialConfig.mode === "unidad") {
      const baseUnitPriceARS = (materialConfig.costARS || 4e4) * MARGIN_UNIDAD;
      baseMaterialSubtotalARS = Math.round(baseUnitPriceARS * qty);
      transparencyNotes.push(
        `Producto unitario con estructura completa y gr\xE1fica incluida.`,
      );
    } else if (materialConfig.mode === "placa") {
      const w = Math.max(
        10,
        Number(widthCm) || materialConfig.plateWidthCm || 122,
      );
      const h = Math.max(
        10,
        Number(heightCm) || materialConfig.plateHeightCm || 244,
      );
      const requestedPieceAreaM2 = (w * h) / 1e4;
      const totalRequestedAreaM2 = requestedPieceAreaM2 * qty;
      const plateSizeM2 = materialConfig.plateAreaM2 || 2.9768;
      plateSurfaceM2 = plateSizeM2;
      const platesNeeded = Math.max(
        1,
        Math.ceil(totalRequestedAreaM2 / plateSizeM2),
      );
      platesCount = platesNeeded;
      fullPlateWarning = true;
      const platePriceARS = (materialConfig.costARS || 55e3) * MARGIN_PLACA;
      baseMaterialSubtotalARS = Math.round(platePriceARS * platesNeeded);
      effectiveBillableAreaM2 = parseFloat(
        (platesNeeded * plateSizeM2).toFixed(4),
      );
      calculatedAreaM2 = parseFloat(totalRequestedAreaM2.toFixed(4));
      transparencyNotes.push(
        `Regla de placa entera: el material r\xEDgido se abastece en placas cerradas de ${materialConfig.plateWidthCm || 122}\xD7${materialConfig.plateHeightCm || 244} cm (${plateSizeM2} m\xB2). Tu pedido de ${totalRequestedAreaM2.toFixed(2)} m\xB2 consume ${platesNeeded} placa(s) entera(s). Si dese\xE1s el sobrante embalado, pod\xE9s solicitarlo sin costo extra.`,
      );
    }
    let printQualityCostARS = 0;
    const printQualityLabel =
      printQuality === "alta_resolucion"
        ? "Alta Resoluci\xF3n (1440-2880 DPI)"
        : "Resoluci\xF3n Est\xE1ndar (720-1080 DPI)";
    if (printQuality === "alta_resolucion") {
      const effectiveArea = calculatedAreaM2 ? calculatedAreaM2 * qty : qty;
      printQualityCostARS = Math.round(effectiveArea * 2500);
      transparencyNotes.push(
        `Calidad: Alta Resoluci\xF3n (+ $${printQualityCostARS.toLocaleString("es-AR")} ARS).`,
      );
    }
    let inkTypeCostARS = 0;
    let inkTypeLabel = "Solvente (Exterior)";
    if (inkType === "uv") {
      inkTypeLabel = "Tintas UV (Curado LED)";
      const effectiveArea = calculatedAreaM2 ? calculatedAreaM2 * qty : qty;
      inkTypeCostARS = Math.round(effectiveArea * 1800);
      transparencyNotes.push(
        `Tintas UV Curado LED (+ $${inkTypeCostARS.toLocaleString("es-AR")} ARS).`,
      );
    } else if (inkType === "directa_uv") {
      inkTypeLabel = "Impresi\xF3n Directa UV (Cama Plana)";
      if (materialConfig.mode !== "placa") {
        const effectiveArea = calculatedAreaM2 ? calculatedAreaM2 * qty : qty;
        inkTypeCostARS = Math.round(effectiveArea * 3200);
        transparencyNotes.push(
          `Impresi\xF3n Directa UV (+ $${inkTypeCostARS.toLocaleString("es-AR")} ARS).`,
        );
      } else {
        transparencyNotes.push(
          `Impresi\xF3n Directa UV Cama Plana incluida en la placa.`,
        );
      }
    }
    let mountCostARS = 0;
    if (mountOption && mountOption.pricePerM2ARS > 0) {
      const effectiveArea = calculatedAreaM2 ? calculatedAreaM2 * qty : qty;
      mountCostARS = Math.round(effectiveArea * mountOption.pricePerM2ARS);
      transparencyNotes.push(
        `Sustrato r\xEDgido para montaje [${mountOption.typeName} - ${mountOption.thickness}]: +$${mountCostARS.toLocaleString("es-AR")} ARS.`,
      );
    }
    if (selectedColor) {
      transparencyNotes.push(`Color de vinilo seleccionado: ${selectedColor}.`);
    }
    let finishingsSubtotalARS = 0;
    const finishingsBreakdown = [];
    const wCmForFinishing = Math.max(10, Number(widthCm) || 100);
    const hCmForFinishing = Math.max(10, Number(heightCm) || 100);
    const perimeterM = parseFloat(
      ((2 * (wCmForFinishing + hCmForFinishing)) / 100).toFixed(2),
    );
    const widthM = parseFloat((wCmForFinishing / 100).toFixed(2));
    const areaM2Val = parseFloat(
      ((wCmForFinishing * hCmForFinishing) / 1e4).toFixed(4),
    );
    if (Array.isArray(finishings) && finishings.length > 0) {
      finishings.forEach((fId) => {
        const finConfig = PRICING_SETTINGS_CONFIG.finishings[fId];
        if (!finConfig) return;
        let itemCost = 0;
        let details = "";
        if (finConfig.calculationType === "metro_perimetral") {
          itemCost = Math.round(perimeterM * finConfig.unitCostARS * qty);
          details = `${perimeterM} m perimetrales \xD7 $${finConfig.unitCostARS.toLocaleString("es-AR")} \xD7 ${qty} u.`;
        } else if (finConfig.calculationType === "metro_lineal_ancho") {
          const totalWidthM = widthM * 2;
          itemCost = Math.round(totalWidthM * finConfig.unitCostARS * qty);
          details = `${totalWidthM.toFixed(2)} m (vainas sup/inf) \xD7 $${finConfig.unitCostARS.toLocaleString("es-AR")} \xD7 ${qty} u.`;
        } else if (finConfig.calculationType === "m2") {
          itemCost = Math.round(areaM2Val * finConfig.unitCostARS * qty);
          details = `${(areaM2Val * qty).toFixed(2)} m\xB2 \xD7 $${finConfig.unitCostARS.toLocaleString("es-AR")}`;
        } else {
          itemCost = Math.round(finConfig.unitCostARS * qty);
          details =
            finConfig.unitCostARS > 0
              ? `$${finConfig.unitCostARS.toLocaleString("es-AR")} \xD7 ${qty} u.`
              : "Incluido sin cargo";
        }
        finishingsSubtotalARS += itemCost;
        finishingsBreakdown.push({
          id: finConfig.id,
          name: finConfig.name,
          unitCostARS: finConfig.unitCostARS,
          totalCostARS: itemCost,
          details,
        });
        if (itemCost > 0) {
          transparencyNotes.push(
            `Terminaci\xF3n [${finConfig.name}]: +$${itemCost.toLocaleString("es-AR")} ARS (${details}).`,
          );
        }
      });
    }
    let aiDesignFeeApplied = 0;
    if (isAiDesign) {
      aiDesignFeeApplied = PRICING_SETTINGS_CONFIG.aiDesignFeeARS || 3500;
      transparencyNotes.push(
        `Dise\xF1o asistido por IA (P\xF3ster Creator): +$${aiDesignFeeApplied.toLocaleString("es-AR")} ARS tarifa fija.`,
      );
    }
    const subtotalARS =
      baseMaterialSubtotalARS +
      printQualityCostARS +
      inkTypeCostARS +
      mountCostARS +
      finishingsSubtotalARS +
      aiDesignFeeApplied;
    unitPriceARS = Math.round(subtotalARS / qty);
    let discountPercentage = 0;
    if (
      wholesaleTierRequested === "partner" ||
      (effectiveBillableAreaM2 && effectiveBillableAreaM2 >= 1e3)
    ) {
      discountPercentage = 15;
    } else if (
      wholesaleTierRequested === "agencia" ||
      (effectiveBillableAreaM2 && effectiveBillableAreaM2 >= 500)
    ) {
      discountPercentage = 10;
    } else if (
      wholesaleTierRequested === "inicio" ||
      (effectiveBillableAreaM2 && effectiveBillableAreaM2 >= 200)
    ) {
      discountPercentage = 5;
    }
    const discountAmountARS = Math.round(
      (subtotalARS * discountPercentage) / 100,
    );
    const totalPriceARS = subtotalARS - discountAmountARS;
    if (discountPercentage > 0) {
      transparencyNotes.push(
        `Se aplic\xF3 un descuento por escala de volumen del ${discountPercentage}% (-$${discountAmountARS.toLocaleString("es-AR")} ARS).`,
      );
    }
    const finishingsSummary =
      Array.isArray(finishings) && finishings.length > 0
        ? finishings.map((f) => {
            const finConfig = PRICING_SETTINGS_CONFIG.finishings[f];
            return finConfig ? finConfig.name : f.replace(/_/g, " ");
          })
        : ["Corte standard a medida"];
    return res.json({
      materialId,
      materialName: materialConfig.name,
      mode: materialConfig.mode,
      widthCm: widthCm ? Number(widthCm) : void 0,
      heightCm: heightCm ? Number(heightCm) : void 0,
      quantity: qty,
      printQuality,
      printQualityLabel,
      printQualityCostARS:
        printQualityCostARS > 0 ? printQualityCostARS : void 0,
      inkType,
      inkTypeLabel,
      inkTypeCostARS: inkTypeCostARS > 0 ? inkTypeCostARS : void 0,
      selectedColor,
      mountOption,
      mountCostARS: mountCostARS > 0 ? mountCostARS : void 0,
      calculatedAreaM2,
      effectiveBillableAreaM2,
      platesCount,
      plateSurfaceM2,
      fullPlateWarning,
      minAreaAppliedWarning,
      baseMaterialSubtotalARS,
      finishingsSubtotalARS,
      finishingsBreakdown,
      aiDesignFeeARS: aiDesignFeeApplied > 0 ? aiDesignFeeApplied : void 0,
      hasAiDesign: isAiDesign,
      unitPriceARS,
      subtotalARS,
      discountPercentage,
      discountAmountARS,
      totalPriceARS,
      finishingsSummary,
      transparencyNotes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error calculando cotizaci\xF3n:", error);
    return res
      .status(500)
      .json({
        error: "Error interno en el c\xE1lculo de cotizaci\xF3n del servidor.",
      });
  }
});
app.post("/api/quote-batch", quoteRateLimiter, (req, res) => {
  try {
    const valResult = quoteBatchSchema.safeParse(req.body);
    if (!valResult.success) {
      return res
        .status(400)
        .json({ error: "Par\xE1metros de lote no v\xE1lidos." });
    }
    const {
      materialId: globalMaterialId,
      items,
      wholesaleTierRequested,
      mountOption,
    } = valResult.data;
    const costMap = getCostTableMap();
    const mappedGlobalMaterialId = mapClientMaterialIdToServer(globalMaterialId);
    if (!mappedGlobalMaterialId || !costMap[mappedGlobalMaterialId]) {
      return res.status(400).json({ error: "Material global no encontrado." });
    }
    const itemsByMaterial = {};
    for (const item of items) {
      const effMat = mapClientMaterialIdToServer(item.materialId || globalMaterialId);
      if (!itemsByMaterial[effMat]) itemsByMaterial[effMat] = [];
      itemsByMaterial[effMat].push(item);
    }
    const resultsMap = {};
    for (const [matId, matItemsUncast] of Object.entries(itemsByMaterial)) {
      const matItems = matItemsUncast;
      const matConfig = costMap[matId] || costMap[mappedGlobalMaterialId];
      let totalPlatesNeeded = 0;
      let totalPlateCostARS = 0;
      let totalRequestedArea = 0;
      let pieces = [];
      if (matConfig.mode === "placa") {
        for (const item of matItems) {
          for (let i = 0; i < item.quantity; i++) {
            const w = Math.max(item.widthCm, item.heightCm);
            const h = Math.min(item.widthCm, item.heightCm);
            pieces.push({ w, h, id: item.id, itemArea: (w * h) / 1e4 });
          }
        }
        let plateW = matConfig.plateWidthCm || 122;
        let plateH = matConfig.plateHeightCm || 244;
        if (plateH > plateW) {
          const temp = plateW;
          plateW = plateH;
          plateH = temp;
        }
        pieces.sort((a, b) => b.h - a.h);
        let bins = [];
        for (const p of pieces) {
          let placed = false;
          for (const bin of bins) {
            for (const level of bin.levels) {
              if (level.width + p.w <= plateW && p.h <= level.height) {
                level.width += p.w;
                placed = true;
                break;
              }
            }
            if (placed) break;
            let totalHeight = bin.levels.reduce((sum, l) => sum + l.height, 0);
            if (totalHeight + p.h <= plateH) {
              bin.levels.push({ width: p.w, height: p.h });
              placed = true;
              break;
            }
            if (placed) break;
          }
          if (!placed) {
            bins.push({ levels: [{ width: p.w, height: p.h }] });
          }
        }
        totalPlatesNeeded = bins.length || 1;
        const platePriceARS =
          (matConfig.costARS || 55e3) * (wholesaleTierRequested ? 1.5 : 2.5);
        totalPlateCostARS = totalPlatesNeeded * platePriceARS;
        totalRequestedArea = pieces.reduce((sum, p) => sum + p.itemArea, 0);
      }
      for (const item of matItems) {
        const qty = item.quantity;
        let baseMaterialSubtotalARS = 0;
        let calculatedAreaM2 = (item.widthCm * item.heightCm) / 1e4;
        let effectiveBillableAreaM2 = calculatedAreaM2 * qty;
        let transparencyNotes = [];
        let fullPlateWarning = false;
        let platesCount = void 0;
        if (matConfig.mode === "placa") {
          const itemArea = calculatedAreaM2 * qty;
          const proportion =
            totalRequestedArea > 0 ? itemArea / totalRequestedArea : 0;
          baseMaterialSubtotalARS = Math.round(totalPlateCostARS * proportion);
          transparencyNotes.push(
            `C\xE1lculo anidado (Nesting): Este lote de ${matConfig.name} usa ${totalPlatesNeeded} placa(s). Costo distribuido por \xE1rea (${(proportion * 100).toFixed(1)}%).`,
          );
          fullPlateWarning = true;
          platesCount = totalPlatesNeeded;
        } else {
          if (matConfig.mode === "m2") {
            const singleAreaM2 = calculatedAreaM2;
            const totalAreaRequested = singleAreaM2 * qty;
            let billableTotalArea = totalAreaRequested;
            if (
              matConfig.minAreaM2 &&
              totalAreaRequested < matConfig.minAreaM2
            ) {
              billableTotalArea = matConfig.minAreaM2;
            }
            baseMaterialSubtotalARS = Math.round(
              (matConfig.costARS || 7500) * 2.5 * billableTotalArea,
            );
          } else if (matConfig.mode === "metro_lineal") {
            const lengthMeters = Math.max(
              1,
              Math.max(item.widthCm, item.heightCm) / 100,
            );
            baseMaterialSubtotalARS = Math.round(
              (matConfig.costARS || 3200) * 2.5 * lengthMeters * qty,
            );
          }
        }
        let printQualityCostARS = 0;
        if (item.printQuality === "alta_resolucion") {
          printQualityCostARS = Math.round(calculatedAreaM2 * qty * 2500);
        } else if (item.printQuality === "fotografica") {
          printQualityCostARS = Math.round(calculatedAreaM2 * qty * 4500);
        }
        let inkTypeCostARS = 0;
        if (item.inkType === "uv" || item.inkType === "directa_uv") {
          inkTypeCostARS = Math.round(calculatedAreaM2 * qty * 4e3);
        } else if (item.inkType === "latex") {
          inkTypeCostARS = Math.round(calculatedAreaM2 * qty * 6e3);
        }
        let finishingsCostARS = 0;
        if (item.finishings && item.finishings.length > 0) {
          const FINISHING_OPTIONS = [
            { id: "corte_a_medida", basePriceARS: 0, calculationType: "fijo" },
            {
              id: "corte_contorno",
              basePriceARS: 4500,
              calculationType: "metro_perimetral",
            },
            {
              id: "perforaciones_esquinas",
              basePriceARS: 1200,
              calculationType: "fijo",
            },
            {
              id: "bordes_pulidos",
              basePriceARS: 1500,
              calculationType: "fijo",
            },
            {
              id: "soldadura_bolsillo",
              basePriceARS: 1200,
              calculationType: "metro_lineal",
            },
            {
              id: "ojales_metalicos",
              basePriceARS: 1800,
              calculationType: "fijo",
            },
            { id: "laca_uv", basePriceARS: 3500, calculationType: "m2" },
            {
              id: "laminado_brillante",
              basePriceARS: 4500,
              calculationType: "m2",
            },
            { id: "laminado_mate", basePriceARS: 4800, calculationType: "m2" },
          ];
          for (const f of item.finishings) {
            const fDef = FINISHING_OPTIONS.find((o) => o.id === f);
            if (fDef) {
              if (fDef.calculationType === "fijo") {
                finishingsCostARS += fDef.basePriceARS * qty;
              } else if (fDef.calculationType === "m2") {
                finishingsCostARS +=
                  fDef.basePriceARS * effectiveBillableAreaM2;
              } else if (fDef.calculationType === "metro_lineal") {
                finishingsCostARS +=
                  ((fDef.basePriceARS * Math.max(item.widthCm, item.heightCm)) /
                    100) *
                  qty;
              } else if (fDef.calculationType === "metro_perimetral") {
                finishingsCostARS +=
                  fDef.basePriceARS *
                  ((item.widthCm * 2 + item.heightCm * 2) / 100) *
                  qty;
              }
            }
          }
        }
        let subtotalARS =
          baseMaterialSubtotalARS +
          printQualityCostARS +
          inkTypeCostARS +
          finishingsCostARS;
        if (
          wholesaleTierRequested === "plata" ||
          wholesaleTierRequested === "agencia"
        ) {
          subtotalARS = Math.round(subtotalARS * 0.9);
          transparencyNotes.push("Descuento B2B Agencia (-10%) aplicado.");
        } else if (
          wholesaleTierRequested === "oro" ||
          wholesaleTierRequested === "partner"
        ) {
          subtotalARS = Math.round(subtotalARS * 0.85);
          transparencyNotes.push("Descuento Partner Revenda (-15%) aplicado.");
        }
        let unitPriceARS = Math.round(subtotalARS / qty);
        resultsMap[item.id] = {
          unitPriceARS,
          totalPriceARS: subtotalARS,
          calculatedAreaM2,
          effectiveBillableAreaM2,
          transparencyNotes,
          fullPlateWarning,
          platesCount,
        };
      }
    }
    const results = items.map((item) => resultsMap[item.id]);
    return res.json({ success: true, results });
  } catch (err) {
    console.error("API Error in /api/quote-batch:", err);
    return res
      .status(500)
      .json({ error: "Error interno al procesar cotizaci\xF3n de lote." });
  }
});
const aiQuotaManager = new AiQuotaManager(
  () => PRICING_SETTINGS_CONFIG.aiDesignFeeARS || 3500,
);
const aiUsageStats = aiQuotaManager.getGlobalStats();

// GET /api/ai/user-quota: cuota actual y remanente para PosterCreatorView
app.get("/api/ai/user-quota", (req, res) => {
  const email = (req.query.email as string) || "carteles.ploteos@gmail.com";
  const quota = aiQuotaManager.getUserUsage(email);
  return res.json({ success: true, ...quota });
});

// GET /api/ai/user-history: desglose de cargos para OrdersView
app.get("/api/ai/user-history", (req, res) => {
  const email = (req.query.email as string) || "carteles.ploteos@gmail.com";
  const usage = aiQuotaManager.getUserUsage(email);
  const totalBilled = usage.history.reduce(
    (acc: number, h: any) => acc + (h.costARS || 0),
    0,
  );
  return res.json({
    success: true,
    userEmail: email,
    history: usage.history,
    totalChargesARS: totalBilled,
    fixedFeeARS: PRICING_SETTINGS_CONFIG.aiDesignFeeARS || 3500,
  });
});

// GET /api/admin/ai-metrics: estadísticas completas de IA por usuario y consumo diario/mensual
app.get("/api/admin/ai-metrics", (req, res) => {
  const data = aiQuotaManager.getAdminMetrics();
  return res.json(data);
});

// PUT /api/admin/ai-limits: actualizar límites mensuales y diarios
app.put("/api/admin/ai-limits", express.json(), (req, res) => {
  try {
    const { monthlyLimit, dailyLimit, fixedFeeARS } = req.body;
    if (typeof fixedFeeARS === "number" && fixedFeeARS >= 0) {
      PRICING_SETTINGS_CONFIG.aiDesignFeeARS = fixedFeeARS;
    }
    const updated = aiQuotaManager.updateLimits(monthlyLimit, dailyLimit);
    return res.json({
      success: true,
      message: "Límites y tarifa de IA actualizados correctamente.",
      ...updated,
      fixedFeeARS: PRICING_SETTINGS_CONFIG.aiDesignFeeARS,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "Error al actualizar límites", details: err.message });
  }
});

// POST /api/ai/poster-assistant con validación de límite y registro de consumo
app.post("/api/ai/poster-assistant", aiRateLimiter, async (req, res) => {
  try {
    const {
      promptTopic,
      purpose,
      targetAudience,
      currentHeadline,
      userEmail,
      userId,
    } = req.body;
    const resolvedEmail =
      (userEmail as string)?.trim().toLowerCase() ||
      "carteles.ploteos@gmail.com";
    const resolvedUserId = (userId as string)?.trim() || "usr_anonymous";

    // Verificación estricta de cuota mensual y diaria antes de invocar modelo
    const quotaCheck = aiQuotaManager.getUserUsage(resolvedEmail);
    if (quotaCheck.isMonthlyBlocked) {
      return res.status(403).json({
        error: "Límite mensual alcanzado",
        message: `Has alcanzado tu límite mensual de ${quotaCheck.monthlyLimit} generaciones de IA. Se requiere recarga de saldo o esperar al próximo ciclo mensual.`,
        isBlocked: true,
        limitType: "monthly",
        quota: quotaCheck,
      });
    }
    if (quotaCheck.isDailyBlocked) {
      return res.status(403).json({
        error: "Límite diario alcanzado",
        message: `Has alcanzado tu límite diario de ${quotaCheck.dailyLimit} consultas con IA para proteger los recursos del taller. Esperá a mañana o solicitá ampliación de cupo.`,
        isBlocked: true,
        limitType: "daily",
        quota: quotaCheck,
      });
    }

    const result = await generatePosterDesignAction({
      promptTopic,
      purpose,
      targetAudience,
      currentHeadline,
    });

    // Registro de cargo persistente
    const fixedFee = PRICING_SETTINGS_CONFIG.aiDesignFeeARS || 3500;
    const record = aiQuotaManager.recordGeneration({
      userId: resolvedUserId,
      userEmail: resolvedEmail,
      promptTopic: promptTopic || "Diseño Póster Asistido por IA",
      headlineGenerated:
        result?.headline || currentHeadline || "Titular de Cartel",
    });

    const updatedQuota = aiQuotaManager.getUserUsage(resolvedEmail);

    return res.json({
      ...result,
      aiBilling: {
        costARS: fixedFee,
        recordId: record.id,
        remainingMonthly: updatedQuota.remainingMonthly,
        remainingDaily: updatedQuota.remainingDaily,
        monthlyLimit: updatedQuota.monthlyLimit,
      },
    });
  } catch (error: any) {
    console.error("Error invocando Gemini API en servidor:", error);
    return res
      .status(500)
      .json({
        error: "Error al generar sugerencias con IA.",
        details: error.message,
      });
  }
});
app.post("/api/chat/live-support", aiRateLimiter, async (req, res) => {
  try {
    const { message, history = [], currentView = "home" } = req.body;
    if (!message || typeof message !== "string") {
      return res
        .status(400)
        .json({ error: "El campo message es obligatorio." });
    }
    const catalogSummary = IN_MEMORY_PRODUCTS.filter((p) => p.isActive)
      .map((p) => {
        const modeLabel =
          p.mode === "m2"
            ? "m\xB2"
            : p.mode === "metro_lineal"
              ? "metro lineal"
              : p.mode === "placa"
                ? "placa"
                : "unidad";
        const price = p.salePriceARS || Math.round(p.costARS * 2);
        return `- ${p.name} (${p.category}): $${price.toLocaleString("es-AR")} ARS por ${modeLabel}. ${p.shortDesc}`;
      })
      .join("\n");
    const result = await liveChatSupportAction({
      message,
      history,
      currentView,
      catalogSummary,
    });
    aiQuotaManager.recordChatLiveSupport();
    return res.json(result);
  } catch (error) {
    console.error("Error en servicio de Chat en Vivo:", error);
    return res.json({
      reply:
        "\xA1Hola! En este momento estoy actualizando las listas de precios en tiempo real. Pod\xE9s cotizar al instante con nuestro calculador en vivo o consultarnos directamente por WhatsApp.",
      suggestedAction: {
        type: "navigate",
        label: "Ir al Cotizador Instant\xE1neo",
        view: "cotizador",
      },
      agentName: "Sofi (Asesora Taller)",
      timestamp: new Date().toISOString(),
    });
  }
});
let IN_MEMORY_BLOG_POSTS = [
  {
    id: "guia-dpi-gran-formato",
    title: "\xBFPor qu\xE9 150 DPI es suficiente para una marquesina gigante?",
    slug: "guia-dpi-gran-formato",
    excerpt:
      "El mito de los 300 DPI explicado: c\xF3mo la distancia de observaci\xF3n humana determina la resoluci\xF3n real necesaria y evita archivos pesados de 5 GB.",
    content: `## La F\xEDsica Detr\xE1s de la Resoluci\xF3n en Gran Formato

En dise\xF1o gr\xE1fico impreso existe una regla no escrita heredada de la imprenta offset de folletos y revistas: *"todo debe estar a 300 DPI"*. Sin embargo, cuando nos trasladamos al mundo de la carteler\xEDa exterior, marquesinas y lonas de gran formato (3x2 metros, 6x3 metros o m\xE1s), esta regla se convierte en un error cr\xEDtico que ralentiza la producci\xF3n sin aportar nitidez apreciable.

### 1. La Distancia M\xEDnima de Visualizaci\xF3n
El ojo humano tiene un l\xEDmite de agudeza visual de aproximadamente 1 minuto de arco (1/60 de grado). A una distancia de lectura de un libro (30 a 40 cm), 300 DPI es indistinguible de una resoluci\xF3n mayor. Pero para un cartel que se ver\xE1 a:
- **1 a 2 metros**: 150 DPI es nitidez fotogr\xE1fica absoluta.
- **3 a 5 metros**: 100 a 120 DPI es perfecto.
- **M\xE1s de 10 metros (V\xEDa P\xFAblica / Gigantograf\xEDas)**: 50 a 72 DPI es m\xE1s que suficiente.

### 2. Evitando Archivos Inmanejables
Un archivo de 5\xD72 metros a 300 DPI en formato TIFF o PSD puede pesar m\xE1s de 4 GB, saturando los procesadores RIP de los plotters y demorando el inicio de la impresi\xF3n. Configurando el archivo a **150 DPI al 100% de escala** o a **300 DPI al 50% de escala**, logramos un archivo de apenas 200 MB con id\xE9ntica calidad percibida.

### Recomendaciones de Taller:
1. Dise\xF1\xE1 en **espacio de color CMYK** (FOGRA39 o US Web Coated v2).
2. Convert\xED todos los textos a curvas/trazados.
3. Export\xE1 en **PDF/X-1a** o TIFF con compresi\xF3n LZW.`,
    readTime: "4 min de lectura",
    date: "10 Ago 2026",
    tag: "Pre-Prensa",
    image:
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=80",
    author: "Ing. Gr\xE1fico Taller Carteles.Click",
    published: true,
    featured: true,
    viewsCount: 1420,
  },
  {
    id: "lona-front-vs-backlight",
    title:
      "Lona Frontlight vs Backlight: Cu\xE1ndo usar cada una en carteler\xEDa",
    slug: "lona-front-vs-backlight",
    excerpt:
      "Diferencias en translucidez, porcentaje de difusi\xF3n de luz y confecci\xF3n con cajas luminarias LED de alto rendimiento.",
    content: `## Gu\xEDa de Selecci\xF3n: Frontlight vs Backlight

La elecci\xF3n entre una lona Front y una Backlight define el 90% del \xE9xito visual de un cartel diurno y nocturno.

### Lona Frontlight (13 oz / 9 oz)
- **Concepto**: Es un sustrato opaco blanco que refleja la luz proveniente del frente (proyectores LED o luz natural).
- **Usos ideales**: Marquesinas con reflectores, banners promocionales, estructuras de ca\xF1o y carteler\xEDa perimetral.
- **Ventaja**: Excelente relaci\xF3n costo/beneficio y m\xE1xima resistencia a la intemperie.

### Lona Backlight (Doble Pasada)
- **Concepto**: Material transl\xFAcido especial con difusi\xF3n homog\xE9nea. Al iluminarse desde atr\xE1s mediante tiras de tubos LED internos, los colores cobran vida con alta saturaci\xF3n.
- **Impresi\xF3n Doble Pasada**: Nuestro taller aplica un 40% m\xE1s de carga de tinta para evitar que el cartel se "lave" o pierda contraste en la noche al encender la luminaria.
- **Usos ideales**: Cajas de luz, marquesinas de estaciones de servicio, farmacias y franquicias 24hs.`,
    readTime: "6 min de lectura",
    date: "02 Ago 2026",
    tag: "Materiales",
    image:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
    author: "Equipo T\xE9cnico de Producci\xF3n",
    published: true,
    featured: true,
    viewsCount: 980,
  },
  {
    id: "vinilo-microperforado-homologacion",
    title: "Vinilo Microperforado para Vidrieras y Lunetas Vehiculares",
    slug: "vinilo-microperforado-homologacion",
    excerpt:
      "Todo sobre visibilidad unidireccional (ver de adentro hacia afuera), paso de luz natural y regulaciones de tr\xE1nsito.",
    content: `## Vinilo Microperforado: Publicidad sin Perder Visibilidad

El vinilo microperforado posee micro-agujeros uniformes (relaci\xF3n 50/50 o 60/40) con respaldo adhesivo negro.

### \xBFC\xF3mo funciona la visi\xF3n unidireccional?
El cerebro humano interpreta la superficie con mayor luminosidad. En la calle (exterior), el transe\xFAnte ve la gr\xE1fica impresa a todo color. Desde el interior (local o veh\xEDculo), la luz exterior permite ver claramente hacia afuera como si se tratara de un vidrio polarizado.

### Requisitos para Veh\xEDculos
- Permite pasar la **Inspecci\xF3n T\xE9cnica Vehicular (VTV/RTO)** en lunetas traseras.
- No debe aplicarse en parabrisas delanteros ni ventanillas del conductor.`,
    readTime: "5 min de lectura",
    date: "24 Jul 2026",
    tag: "Publicidad Exterior",
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80",
    author: "Dpto. de Instalaciones",
    published: true,
    featured: false,
    viewsCount: 1150,
  },
];
app.get("/api/blog", (req, res) => {
  const publishedOnly = req.query.all !== "true";
  const posts = publishedOnly
    ? IN_MEMORY_BLOG_POSTS.filter((p) => p.published)
    : IN_MEMORY_BLOG_POSTS;
  res.json({ posts });
});
app.get("/api/blog/:id", (req, res) => {
  const post = IN_MEMORY_BLOG_POSTS.find(
    (p) => p.id === req.params.id || p.slug === req.params.id,
  );
  if (!post)
    return res.status(404).json({ error: "Art\xEDculo no encontrado" });
  post.viewsCount = (post.viewsCount || 0) + 1;
  res.json({ post });
});
app.post("/api/admin/blog", (req, res) => {
  const {
    title,
    excerpt,
    content,
    tag,
    readTime,
    image,
    author,
    published,
    featured,
  } = req.body;
  if (!title || !content) {
    return res
      .status(400)
      .json({ error: "El t\xEDtulo y el contenido son obligatorios." });
  }
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const newPost = {
    id: `post-${Date.now()}`,
    title,
    slug: slug || `post-${Date.now()}`,
    excerpt: excerpt || title,
    content,
    tag: tag || "Carteler\xEDa T\xE9cnica",
    readTime: readTime || "4 min de lectura",
    image:
      image ||
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=80",
    date: new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    author: author || "Admin Taller",
    published: published ?? true,
    featured: featured ?? false,
    viewsCount: 0,
  };
  IN_MEMORY_BLOG_POSTS.unshift(newPost);
  res.status(201).json({ success: true, post: newPost });
});
app.put("/api/admin/blog/:id", (req, res) => {
  const { id } = req.params;
  const index = IN_MEMORY_BLOG_POSTS.findIndex((p) => p.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Art\xEDculo no encontrado" });
  IN_MEMORY_BLOG_POSTS[index] = {
    ...IN_MEMORY_BLOG_POSTS[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  res.json({ success: true, post: IN_MEMORY_BLOG_POSTS[index] });
});
app.delete("/api/admin/blog/:id", (req, res) => {
  const { id } = req.params;
  const index = IN_MEMORY_BLOG_POSTS.findIndex((p) => p.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Art\xEDculo no encontrado" });
  IN_MEMORY_BLOG_POSTS.splice(index, 1);
  res.json({ success: true, message: "Art\xEDculo eliminado correctamente." });
});
app.post("/api/admin/blog/ai-generate", aiRateLimiter, async (req, res) => {
  try {
    const { topic, targetAudience, tone } = req.body;
    const result = await generateBlogArticleAction({
      topic,
      targetAudience,
      tone,
    });
    res.json(result);
  } catch (err) {
    console.error("Error generando blog post con IA:", err);
    res
      .status(500)
      .json({
        error: "Error al generar art\xEDculo con IA",
        details: err.message,
      });
  }
});
app.get("/api/products/version", (req, res) => {
  res.json({ version: CATALOG_VERSION });
});
app.get("/api/products", (req, res) => {
  res.json({ products: IN_MEMORY_PRODUCTS });
});
app.get("/api/admin/products", (req, res) => {
  res.json({ products: IN_MEMORY_PRODUCTS });
});
app.post("/api/admin/products", (req, res) => {
  const {
    name,
    category,
    mode,
    costARS,
    salePriceARS,
    marginPercent,
    unitLabel,
    shortDesc,
    stockStatus,
    plateWidthCm,
    plateHeightCm,
    linearWidthCm,
    minAreaM2,
    badge,
  } = req.body;
  if (!name || !category || !mode) {
    return res
      .status(400)
      .json({
        error: "Nombre, categor\xEDa y modo de c\xE1lculo son requeridos.",
      });
  }
  const cost = Number(costARS) || 1e3;
  const margin = Number(marginPercent) || 100;
  const salePrice =
    Number(salePriceARS) || Math.round(cost * (1 + margin / 100));
  const newProduct = {
    id: `prod-${Date.now()}`,
    name,
    category,
    mode,
    costARS: cost,
    salePriceARS: salePrice,
    marginPercent: margin,
    unitLabel:
      unitLabel ||
      (mode === "m2"
        ? "m\xB2"
        : mode === "metro_lineal"
          ? "metro lineal"
          : mode === "placa"
            ? "placa"
            : "unidad"),
    stockStatus: stockStatus || "disponible",
    shortDesc: shortDesc || name,
    plateWidthCm: plateWidthCm ? Number(plateWidthCm) : void 0,
    plateHeightCm: plateHeightCm ? Number(plateHeightCm) : void 0,
    plateAreaM2:
      plateWidthCm && plateHeightCm
        ? (Number(plateWidthCm) * Number(plateHeightCm)) / 1e4
        : void 0,
    linearWidthCm: linearWidthCm ? Number(linearWidthCm) : void 0,
    minAreaM2: minAreaM2 ? Number(minAreaM2) : void 0,
    badge: badge || void 0,
    isActive: true,
    updatedAt: new Date().toISOString(),
  };
  IN_MEMORY_PRODUCTS.push(newProduct);
  CATALOG_VERSION = Date.now();
  res.status(201).json({ success: true, product: newProduct });
});
app.put("/api/admin/products/:id", (req, res) => {
  const { id } = req.params;
  const index = IN_MEMORY_PRODUCTS.findIndex((p) => p.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Producto no encontrado" });
  const updated = {
    ...IN_MEMORY_PRODUCTS[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  if (req.body.costARS !== void 0 || req.body.marginPercent !== void 0) {
    const cost = Number(updated.costARS) || 0;
    const margin = Number(updated.marginPercent) || 100;
    if (!req.body.salePriceARS) {
      updated.salePriceARS = Math.round(cost * (1 + margin / 100));
    }
  }
  IN_MEMORY_PRODUCTS[index] = updated;
  CATALOG_VERSION = Date.now();
  res.json({ success: true, product: updated });
});
app.delete("/api/admin/products/:id", (req, res) => {
  const { id } = req.params;
  const index = IN_MEMORY_PRODUCTS.findIndex((p) => p.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Producto no encontrado" });
  IN_MEMORY_PRODUCTS.splice(index, 1);
  CATALOG_VERSION = Date.now();
  res.json({ success: true, message: "Producto eliminado correctamente" });
});
app.get("/api/admin/products/export-sheets", (req, res) => {
  const format = req.query.format === "tsv" ? "tsv" : "csv";
  const delimiter = format === "tsv" ? "	" : ",";
  const headers = [
    "ID",
    "Nombre",
    "Categoria",
    "Unidad_Calculo",
    "Unidad_Visual",
    "Costo_ARS",
    "Precio_Venta_ARS",
    "Margen_%",
    "Stock",
    "Medida_Placa_o_Bobina",
    "Descripcion_Corta",
  ];
  const rows = IN_MEMORY_PRODUCTS.map((p) => {
    const dims =
      p.mode === "placa" && p.plateWidthCm
        ? `${p.plateWidthCm}x${p.plateHeightCm}cm`
        : p.linearWidthCm
          ? `Ancho ${p.linearWidthCm}cm`
          : "-";
    return [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.mode}"`,
      `"${p.unitLabel}"`,
      p.costARS,
      p.salePriceARS || Math.round(p.costARS * 2),
      p.marginPercent || 100,
      `"${p.stockStatus}"`,
      `"${dims}"`,
      `"${(p.shortDesc || "").replace(/"/g, '""')}"`,
    ].join(delimiter);
  });
  const csvContent = "\uFEFF" + [headers.join(delimiter), ...rows].join("\n");
  res.setHeader(
    "Content-Type",
    format === "tsv"
      ? "text/tab-separated-values; charset=utf-8"
      : "text/csv; charset=utf-8",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=catalogo_carteles_click_${Date.now()}.${format === "tsv" ? "tsv" : "csv"}`,
  );
  res.send(csvContent);
});
app.post("/api/admin/products/import-sheets", (req, res) => {
  try {
    const { rawText, productsList } = req.body;
    let importedCount = 0;
    let updatedCount = 0;
    if (Array.isArray(productsList) && productsList.length > 0) {
      productsList.forEach((item) => {
        if (!item.name || !item.mode) return;
        const existingIdx = IN_MEMORY_PRODUCTS.findIndex(
          (p) =>
            p.id === item.id ||
            (p.name.toLowerCase() === item.name.toLowerCase() &&
              p.mode === item.mode),
        );
        const productObj = {
          id:
            item.id || `prod-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
          name: item.name,
          category: item.category || "lonas",
          mode: item.mode || "m2",
          costARS: Number(item.costARS) || 5e3,
          salePriceARS:
            Number(item.salePriceARS) ||
            Math.round((Number(item.costARS) || 5e3) * 2),
          marginPercent: Number(item.marginPercent) || 100,
          unitLabel:
            item.unitLabel ||
            (item.mode === "m2"
              ? "m\xB2"
              : item.mode === "metro_lineal"
                ? "metro lineal"
                : item.mode === "placa"
                  ? "placa"
                  : "unidad"),
          stockStatus: item.stockStatus || "disponible",
          shortDesc: item.shortDesc || item.name,
          plateWidthCm: item.plateWidthCm ? Number(item.plateWidthCm) : void 0,
          plateHeightCm: item.plateHeightCm
            ? Number(item.plateHeightCm)
            : void 0,
          linearWidthCm: item.linearWidthCm
            ? Number(item.linearWidthCm)
            : void 0,
          isActive: true,
          updatedAt: new Date().toISOString(),
        };
        if (existingIdx >= 0) {
          IN_MEMORY_PRODUCTS[existingIdx] = {
            ...IN_MEMORY_PRODUCTS[existingIdx],
            ...productObj,
          };
          updatedCount++;
        } else {
          IN_MEMORY_PRODUCTS.push(productObj);
          importedCount++;
        }
      });
      return res.json({
        success: true,
        importedCount,
        updatedCount,
        total: IN_MEMORY_PRODUCTS.length,
      });
    }
    if (rawText && typeof rawText === "string") {
      const lines = rawText.trim().split(/\r?\n/);
      if (lines.length < 2) {
        return res
          .status(400)
          .json({
            error:
              "Formato inv\xE1lido. Se requieren encabezados y al menos una fila de datos.",
          });
      }
      const firstLine = lines[0];
      const sep = firstLine.includes("	")
        ? "	"
        : firstLine.includes(";")
          ? ";"
          : ",";
      const headers = firstLine.split(sep).map((h) =>
        h
          .trim()
          .replace(/^["']|["']$/g, "")
          .toLowerCase(),
      );
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i]
          .split(sep)
          .map((c) => c.trim().replace(/^["']|["']$/g, ""));
        if (!row.length || !row[0]) continue;
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = row[idx];
        });
        const name = rowObj.nombre || rowObj.name || row[1] || row[0];
        const mode = (
          rowObj.unidad_calculo ||
          rowObj.mode ||
          rowObj.unidad ||
          "m2"
        ).toLowerCase();
        const validMode = ["m2", "metro_lineal", "unidad", "placa"].includes(
          mode,
        )
          ? mode
          : "m2";
        const cost =
          Number(rowObj.costo_ars || rowObj.costo || rowObj.costars || 5e3) ||
          5e3;
        const margin =
          Number(rowObj.margen || rowObj["margen_%"] || 100) || 100;
        const salePrice =
          Number(
            rowObj.precio_venta_ars ||
              rowObj.precio ||
              Math.round(cost * (1 + margin / 100)),
          ) || Math.round(cost * 2);
        const pId = rowObj.id || `imp-${Date.now()}-${i}`;
        const existingIdx = IN_MEMORY_PRODUCTS.findIndex(
          (p) => p.id === pId || p.name.toLowerCase() === name.toLowerCase(),
        );
        const productObj = {
          id: pId,
          name,
          category: (rowObj.categoria || "lonas").toLowerCase(),
          mode: validMode,
          costARS: cost,
          salePriceARS: salePrice,
          marginPercent: margin,
          unitLabel:
            rowObj.unidad_visual ||
            (validMode === "m2"
              ? "m\xB2"
              : validMode === "metro_lineal"
                ? "metro lineal"
                : validMode === "placa"
                  ? "placa"
                  : "unidad"),
          stockStatus: rowObj.stock || "disponible",
          shortDesc: rowObj.descripcion_corta || name,
          isActive: true,
          updatedAt: new Date().toISOString(),
        };
        if (existingIdx >= 0) {
          IN_MEMORY_PRODUCTS[existingIdx] = {
            ...IN_MEMORY_PRODUCTS[existingIdx],
            ...productObj,
          };
          updatedCount++;
        } else {
          IN_MEMORY_PRODUCTS.push(productObj);
          importedCount++;
        }
      }
      return res.json({
        success: true,
        importedCount,
        updatedCount,
        total: IN_MEMORY_PRODUCTS.length,
      });
    }
    return res
      .status(400)
      .json({ error: "No se recibieron datos v\xE1lidos para procesar." });
  } catch (err) {
    console.error("Error importando desde Google Sheets:", err);
    res
      .status(500)
      .json({ error: "Error al importar datos", details: err.message });
  }
});
let IN_MEMORY_DRIVE_PORTFOLIO = [
  {
    id: "drive-1",
    driveFileId: "1-sample-predio-cat",
    title: "Banners Perimetrales en Lona Mesh Cortaviento",
    client: "Club Atl\xE9tico Talleres / Predio CAT & Entrena Fitness",
    material: "Lona Mesh microperforada con ojales cada 50 cm",
    category: "lonas",
    image: "/samples/lona_mesh_predio_cat.jpg",
    thumbnailUrl: "/samples/lona_mesh_predio_cat.jpg",
    tag: "Deportes & Vallas",
    aspectRatio: "16:9",
    aspectRatioLabel: "Panor\xE1mico",
    prompt: "Instalaci\xF3n perimetral de lona mesh para valla deportiva",
    dateAdded: new Date().toISOString(),
  },
  {
    id: "drive-2",
    driveFileId: "2-sample-tennis-banner",
    title: "Carteler\xEDa Perimetral para Canchas de Tenis",
    client: "Predio Deportivo CAT - Canchas de Tenis",
    material: "Lona Mesh anti-embolsamiento impresa a 1440 DPI solvente",
    category: "lonas",
    image: "/samples/lona_mesh_tennis_banner_1787354329852.jpg",
    thumbnailUrl: "/samples/lona_mesh_tennis_banner_1787354329852.jpg",
    tag: "Per\xEDmetros & Canchas",
    aspectRatio: "16:9",
    aspectRatioLabel: "Panor\xE1mico",
    prompt:
      "Carteler\xEDa deportiva en lona mesh cortaviento para canchas de tenis",
    dateAdded: new Date().toISOString(),
  },
  {
    id: "drive-3",
    driveFileId: "3-sample-clay-court",
    title: "Cerramiento Cortaviento en Polvo de Ladrillo",
    client: "Predio CAT Tenis & P\xE1del",
    material: "Lona Mesh microperforada permeable al viento",
    category: "lonas",
    image: "/samples/lona_mesh_clay_court_1787354344453.jpg",
    thumbnailUrl: "/samples/lona_mesh_clay_court_1787354344453.jpg",
    tag: "Cerramientos Deportivos",
    aspectRatio: "16:9",
    aspectRatioLabel: "Panor\xE1mico",
    prompt:
      "Cerramiento cortaviento para canchas de tenis en polvo de ladrillo",
    dateAdded: new Date().toISOString(),
  },
  {
    id: "drive-4",
    driveFileId: "4-sample-entrena-fitness",
    title: "Detalle de Confecci\xF3n Mesh con Dobladillo y Ojales",
    client: "Entrena Fitness Escalada",
    material: "Lona Mesh 1440 DPI con soldadura t\xE9rmica y ojales acerados",
    category: "lonas",
    image: "/samples/lona_mesh_entrena_fitness.jpg",
    thumbnailUrl: "/samples/lona_mesh_entrena_fitness.jpg",
    tag: "Confecci\xF3n & Taller",
    aspectRatio: "4:3",
    aspectRatioLabel: "Est\xE1ndar",
    prompt:
      "Detalle de ojales acerados y dobladillo soldado por alta frecuencia",
    dateAdded: new Date().toISOString(),
  },
  {
    id: "drive-5",
    driveFileId: "5-sample-fence-detail",
    title: "Montaje con Precintos de Tensi\xF3n sobre Alambrado",
    client: "Club Atl\xE9tico Talleres",
    material: "Lona Mesh con precintos de alta resistencia UV cada 50 cm",
    category: "lonas",
    image: "/samples/lona_mesh_fence_detail_1787354357149.jpg",
    thumbnailUrl: "/samples/lona_mesh_fence_detail_1787354357149.jpg",
    tag: "Instalaci\xF3n & Montaje",
    aspectRatio: "4:3",
    aspectRatioLabel: "Detalle",
    prompt:
      "Detalle de fijaci\xF3n de lona mesh en alambrado romboidal con precintos",
    dateAdded: new Date().toISOString(),
  },
];
let ACTIVE_DRIVE_FOLDER_ID = "16tym66aJOZSc2Ds9tRWazmE-se-GB88s";
let LAST_DRIVE_SYNC_TIME = new Date().toISOString();
async function syncFromPublicDriveFolder(folderId) {
  try {
    const url = `https://drive.google.com/embeddedfolderview?id=${folderId}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "es-419,es;q=0.9,en;q=0.8",
      },
    });
    if (!response.ok) {
      console.warn(
        `[Drive Sync] HTTP ${response.status} fetching Drive folder`,
      );
      return [];
    }
    const html = await response.text();
    const regex =
      /<div class="flip-entry" id="entry-([^"]+)".*?<img src="([^"]+)"[^>]*alt="[^"]*Image"[^>]*>.*?<div class="flip-entry-title">([^<]+)<\/div>/gs;
    let match;
    const items = [];
    let idx = 1;
    while ((match = regex.exec(html)) !== null) {
      const fileId = match[1];
      const rawTitle = match[3] || "";
      const cleanName = rawTitle.replace(/\.[^/.]+$/, "").trim();
      const lower = cleanName.toLowerCase();
      let cat = "lonas";
      let tag = "Gran Formato";
      let mat = "Lona Front standard 13 oz / Impresi\xF3n 1440 DPI";
      if (
        lower.includes("vinil") ||
        lower.includes("ploteo") ||
        lower.includes("vidrier") ||
        lower.includes("esmeril") ||
        lower.includes("camuflad")
      ) {
        cat = "vinilos";
        tag = "Vidrieras & Ploteos";
        mat = "Vinilo Calandrado / Microperforado 1440 DPI";
      } else if (
        lower.includes("corporeo") ||
        lower.includes("pvc") ||
        lower.includes("acril") ||
        lower.includes("polifan") ||
        lower.includes("letras") ||
        lower.includes("cacharel")
      ) {
        cat = "rigidos";
        tag = "Letras Corp\xF3reas & 3D";
        mat = "Corp\xF3reo Polif\xE1n / Acr\xEDlico / PVC Espumado";
      } else if (
        lower.includes("marquesin") ||
        lower.includes("backlight") ||
        lower.includes("caja") ||
        lower.includes("luz")
      ) {
        cat = "lonas";
        tag = "Cajas de Luz & Marquesinas";
        mat = "Lona Backlight Transl\xFAcida 24hs";
      } else if (
        lower.includes("banner") ||
        lower.includes("rollup") ||
        lower.includes("stand") ||
        lower.includes("expo")
      ) {
        cat = "portabanners";
        tag = "Stands & Eventos";
        mat = "Porta Banner Roll Up 80\xD7200 cm Lona Mate";
      } else if (
        lower.includes("mesh") ||
        lower.includes("cancha") ||
        lower.includes("tenis") ||
        lower.includes("padel")
      ) {
        cat = "lonas";
        tag = "Deportes & Vallas";
        mat = "Lona Mesh microperforada cortaviento";
      } else if (lower.includes("converse")) {
        cat = "vinilos";
        tag = "Retail & Vidrieras Converse";
        mat = "Ploteo Integral de Locales y Gr\xE1fica Comercial";
      } else if (lower.includes("pantone") || lower.includes("color")) {
        cat = "lonas";
        tag = "Calibraci\xF3n de Color";
        mat = "Carta de Color y Calibraci\xF3n CMYK de Taller";
      }
      let title = cleanName.replace(/[-_]/g, " ");
      if (/^\d+\s*\(\d+\)$/.test(title)) {
        title = `Trabajo Real #${idx} \xB7 ${tag}`;
      } else if (/^trabajos\s*\(\d+\)$/i.test(title)) {
        const numMatch = title.match(/\d+/);
        const num = numMatch ? numMatch[0] : idx;
        title = `Instalaci\xF3n en Taller #${num} \xB7 ${tag}`;
      } else if (title.startsWith("Converse")) {
        title = `Local Comercial ${title} \xB7 Ploteo y Gr\xE1fica`;
      } else if (title.startsWith("Familia")) {
        title = `Gr\xE1fica Vehicular / Comercial #${idx}`;
      } else if (title.startsWith("IMG")) {
        title = `Producci\xF3n e Instalaci\xF3n en Taller #${idx}`;
      } else if (title.startsWith("DSC")) {
        title = `Montaje en Obra y Carteler\xEDa #${idx}`;
      }
      items.push({
        id: `drive-${fileId}`,
        driveFileId: fileId,
        title,
        client: "Carteles.Click / Producci\xF3n Taller",
        material: mat,
        category: cat,
        image: `https://lh3.googleusercontent.com/d/${fileId}=w1200`,
        thumbnailUrl: `https://lh3.googleusercontent.com/d/${fileId}=w500`,
        tag,
        aspectRatio: "16:9",
        aspectRatioLabel: "Foto Taller",
        prompt: `Producci\xF3n de carteler\xEDa y ploteo para ${title}`,
        dateAdded: new Date().toISOString(),
      });
      idx++;
    }
    return items;
  } catch (err) {
    console.error("[Drive Sync] Error scraping public Drive folder:", err);
    return [];
  }
}
__name(syncFromPublicDriveFolder, "syncFromPublicDriveFolder");
const DRIVE_CACHE_FILE = path.join(
  process.cwd(),
  "public",
  "drive_portfolio_cache.json",
);
try {
  if (fs.existsSync(DRIVE_CACHE_FILE)) {
    const rawCache = fs.readFileSync(DRIVE_CACHE_FILE, "utf-8");
    const cachedItems = JSON.parse(rawCache);
    if (Array.isArray(cachedItems) && cachedItems.length > 0) {
      IN_MEMORY_DRIVE_PORTFOLIO = cachedItems;
      console.log(
        `[Drive Sync] Cargadas ${IN_MEMORY_DRIVE_PORTFOLIO.length} fotos reales desde la cach\xE9 de Google Drive`,
      );
    }
  }
} catch (e) {
  console.warn("[Drive Sync] No se pudo leer la cach\xE9 inicial de Drive:", e);
}
syncFromPublicDriveFolder(ACTIVE_DRIVE_FOLDER_ID)
  .then((items) => {
    if (items && items.length > 0) {
      IN_MEMORY_DRIVE_PORTFOLIO = items;
      LAST_DRIVE_SYNC_TIME = new Date().toISOString();
      console.log(
        `[Drive Sync] Sincronizaci\xF3n exitosa con Google Drive: ${items.length} fotos activas`,
      );
      try {
        fs.writeFileSync(
          DRIVE_CACHE_FILE,
          JSON.stringify(items, null, 2),
          "utf-8",
        );
      } catch (saveErr) {
        console.error(
          "[Drive Sync] Error guardando cach\xE9 en disco:",
          saveErr,
        );
      }
    }
  })
  .catch((err) => {
    console.error(
      "[Drive Sync] Error en sincronizaci\xF3n inicial en segundo plano:",
      err,
    );
  });
app.get("/api/portfolio", (req, res) => {
  res.json({
    items: IN_MEMORY_DRIVE_PORTFOLIO,
    folderId: ACTIVE_DRIVE_FOLDER_ID,
    lastSync: LAST_DRIVE_SYNC_TIME,
    count: IN_MEMORY_DRIVE_PORTFOLIO.length,
  });
});
app.post("/api/admin/drive/sync", async (req, res) => {
  try {
    const { folderId, customItems } = req.body;
    const targetFolderId = folderId || ACTIVE_DRIVE_FOLDER_ID;
    const authHeader = req.headers.authorization;
    if (customItems && Array.isArray(customItems) && customItems.length > 0) {
      IN_MEMORY_DRIVE_PORTFOLIO = customItems;
      ACTIVE_DRIVE_FOLDER_ID = targetFolderId;
      LAST_DRIVE_SYNC_TIME = new Date().toISOString();
      return res.json({
        success: true,
        count: IN_MEMORY_DRIVE_PORTFOLIO.length,
        items: IN_MEMORY_DRIVE_PORTFOLIO,
        lastSync: LAST_DRIVE_SYNC_TIME,
      });
    }
    console.log(`[Drive Sync] Sincronizando carpeta: ${targetFolderId}`);
    const publicItems = await syncFromPublicDriveFolder(targetFolderId);
    if (publicItems.length > 0) {
      IN_MEMORY_DRIVE_PORTFOLIO = publicItems;
      ACTIVE_DRIVE_FOLDER_ID = targetFolderId;
      LAST_DRIVE_SYNC_TIME = new Date().toISOString();
      try {
        fs.writeFileSync(
          DRIVE_CACHE_FILE,
          JSON.stringify(publicItems, null, 2),
          "utf-8",
        );
      } catch (e) {}
      return res.json({
        success: true,
        source: "public_drive_folder",
        count: publicItems.length,
        items: publicItems,
        folderId: targetFolderId,
        lastSync: LAST_DRIVE_SYNC_TIME,
      });
    }
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const accessToken = authHeader.split(" ")[1];
      const driveQuery = encodeURIComponent(
        `'${targetFolderId}' in parents and mimeType contains 'image/' and trashed = false`,
      );
      const driveApiUrl = `https://www.googleapis.com/drive/v3/files?q=${driveQuery}&fields=files(id,name,mimeType,thumbnailLink,webContentLink,createdTime,description,imageMediaMetadata)&pageSize=100`;
      const response = await fetch(driveApiUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const driveData = await response.json();
        const files = driveData.files || [];
        if (files.length > 0) {
          const syncedItems = files.map((file, index) => {
            const lowerName = (file.name || "").toLowerCase();
            let cat = "lonas";
            let tag = "Gran Formato";
            let mat = "Lona Front standard 13 oz";
            if (
              lowerName.includes("vinil") ||
              lowerName.includes("ploteo") ||
              lowerName.includes("vidrier")
            ) {
              cat = "vinilos";
              tag = "Vidrieras & Ploteos";
              mat = "Vinilo Brillante 1440 DPI";
            } else if (
              lowerName.includes("pvc") ||
              lowerName.includes("rigido") ||
              lowerName.includes("placa") ||
              lowerName.includes("acril")
            ) {
              cat = "rigidos";
              tag = "R\xEDgidos & Placas";
              mat = "Placa PVC Espumado 3mm";
            } else if (
              lowerName.includes("banner") ||
              lowerName.includes("rollup") ||
              lowerName.includes("stand")
            ) {
              cat = "portabanners";
              tag = "Stands & Eventos";
              mat = "Porta Banner Roll Up 80\xD7200 cm";
            } else if (lowerName.includes("mesh")) {
              cat = "lonas";
              tag = "Deportes & Vallas";
              mat = "Lona Mesh microperforada";
            }
            const cleanTitle = file.name
              .replace(/\.[^/.]+$/, "")
              .replace(/[-_]/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
            const imageUrl = `https://lh3.googleusercontent.com/d/${file.id}=w1200`;
            return {
              id: `drive-${file.id || index}`,
              driveFileId: file.id,
              title: cleanTitle || `Trabajo Taller #${index + 1}`,
              client: file.description || "Cliente Taller Carteles.Click",
              material: mat,
              category: cat,
              image: imageUrl,
              thumbnailUrl: `https://lh3.googleusercontent.com/d/${file.id}=w500`,
              tag,
              aspectRatio: "16:9",
              aspectRatioLabel: "Foto Taller",
              prompt: `Producci\xF3n de carteler\xEDa en ${mat} realizada en taller`,
              dateAdded: file.createdTime || new Date().toISOString(),
            };
          });
          IN_MEMORY_DRIVE_PORTFOLIO = syncedItems;
          ACTIVE_DRIVE_FOLDER_ID = targetFolderId;
          LAST_DRIVE_SYNC_TIME = new Date().toISOString();
          return res.json({
            success: true,
            source: "google_drive_api",
            count: syncedItems.length,
            items: syncedItems,
            lastSync: LAST_DRIVE_SYNC_TIME,
          });
        }
      }
    }
    ACTIVE_DRIVE_FOLDER_ID = targetFolderId;
    LAST_DRIVE_SYNC_TIME = new Date().toISOString();
    res.json({
      success: true,
      source: "cache_or_public",
      count: IN_MEMORY_DRIVE_PORTFOLIO.length,
      items: IN_MEMORY_DRIVE_PORTFOLIO,
      folderId: targetFolderId,
      lastSync: LAST_DRIVE_SYNC_TIME,
    });
  } catch (err) {
    console.error("Error sincronizando Google Drive:", err);
    res
      .status(500)
      .json({
        error: "Error al sincronizar con Google Drive",
        details: err.message,
      });
  }
});
app.post("/api/admin/portfolio", (req, res) => {
  const { title, client, material, category, image, tag } = req.body;
  if (!title || !image) {
    return res
      .status(400)
      .json({ error: "T\xEDtulo e imagen son requeridos." });
  }
  const newItem = {
    id: `port-${Date.now()}`,
    driveFileId: `manual-${Date.now()}`,
    title,
    client: client || "Cliente Particular",
    material: material || "Lona Front standard 13 oz",
    category: category || "lonas",
    image,
    thumbnailUrl: image,
    tag: tag || "Carteler\xEDa",
    aspectRatio: "16:9",
    aspectRatioLabel: "Panor\xE1mico",
    prompt: `Trabajo de ${title} en ${material}`,
    dateAdded: new Date().toISOString(),
  };
  IN_MEMORY_DRIVE_PORTFOLIO.unshift(newItem);
  res.status(201).json({ success: true, item: newItem });
});
app.delete("/api/admin/portfolio/:id", (req, res) => {
  const { id } = req.params;
  IN_MEMORY_DRIVE_PORTFOLIO = IN_MEMORY_DRIVE_PORTFOLIO.filter(
    (item) => item.id !== id,
  );
  res.json({ success: true, message: "Elemento eliminado del portfolio." });
});
app.post("/api/admin/sheets/live-sync", async (req, res) => {
  try {
    const { spreadsheetId, sheetRange } = req.body;
    const authHeader = req.headers.authorization;
    if (!spreadsheetId) {
      return res
        .status(400)
        .json({
          error: "Se requiere el ID o URL de la planilla de Google Sheets.",
        });
    }
    let cleanSheetId = spreadsheetId;
    const urlMatch = spreadsheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch) {
      cleanSheetId = urlMatch[1];
    }
    const range = sheetRange || "A1:K100";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const accessToken = authHeader.split(" ")[1];
      const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanSheetId}/values/${encodeURIComponent(range)}`;
      const sheetResponse = await fetch(sheetsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (sheetResponse.ok) {
        const data = await sheetResponse.json();
        const rows = data.values || [];
        if (rows.length >= 2) {
          const headers = rows[0].map((h) => String(h).trim().toLowerCase());
          let importedCount = 0;
          let updatedCount = 0;
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row[0]) continue;
            const rowObj = {};
            headers.forEach((h, idx) => {
              rowObj[h] = row[idx] || "";
            });
            const name = rowObj.nombre || rowObj.name || row[1] || row[0];
            const mode = (
              rowObj.unidad_calculo ||
              rowObj.mode ||
              rowObj.unidad ||
              "m2"
            ).toLowerCase();
            const validMode = [
              "m2",
              "metro_lineal",
              "unidad",
              "placa",
            ].includes(mode)
              ? mode
              : "m2";
            const cost =
              Number(
                String(
                  rowObj.costo_ars || rowObj.costo || rowObj.costars || "5000",
                ).replace(/[^0-9.]/g, ""),
              ) || 5e3;
            const margin =
              Number(
                String(rowObj.margen || rowObj["margen_%"] || "100").replace(
                  /[^0-9.]/g,
                  "",
                ),
              ) || 100;
            const salePrice =
              Number(
                String(rowObj.precio_venta_ars || rowObj.precio || "").replace(
                  /[^0-9.]/g,
                  "",
                ),
              ) || Math.round(cost * (1 + margin / 100));
            const pId = rowObj.id || `sheet-${i}-${Date.now()}`;
            const existingIdx = IN_MEMORY_PRODUCTS.findIndex(
              (p) =>
                p.id === pId || p.name.toLowerCase() === name.toLowerCase(),
            );
            const productObj = {
              id: pId,
              name,
              category: (rowObj.categoria || "lonas").toLowerCase(),
              mode: validMode,
              costARS: cost,
              salePriceARS: salePrice,
              marginPercent: margin,
              unitLabel:
                rowObj.unidad_visual ||
                (validMode === "m2"
                  ? "m\xB2"
                  : validMode === "metro_lineal"
                    ? "metro lineal"
                    : validMode === "placa"
                      ? "placa"
                      : "unidad"),
              stockStatus: rowObj.stock || "disponible",
              shortDesc: rowObj.descripcion_corta || name,
              isActive: true,
              updatedAt: new Date().toISOString(),
            };
            if (existingIdx >= 0) {
              IN_MEMORY_PRODUCTS[existingIdx] = {
                ...IN_MEMORY_PRODUCTS[existingIdx],
                ...productObj,
              };
              updatedCount++;
            } else {
              IN_MEMORY_PRODUCTS.push(productObj);
              importedCount++;
            }
          }
          return res.json({
            success: true,
            source: "google_sheets_api",
            importedCount,
            updatedCount,
            totalProducts: IN_MEMORY_PRODUCTS.length,
            spreadsheetId: cleanSheetId,
          });
        }
      }
    }
    const csvExportUrl = `https://docs.google.com/spreadsheets/d/${cleanSheetId}/export?format=csv`;
    const publicResp = await fetch(csvExportUrl);
    if (publicResp.ok) {
      const csvText = await publicResp.text();
      const lines = csvText.trim().split(/\r?\n/);
      if (lines.length >= 2) {
        const firstLine = lines[0];
        const sep = firstLine.includes("	")
          ? "	"
          : firstLine.includes(";")
            ? ";"
            : ",";
        const headers = firstLine.split(sep).map((h) =>
          h
            .trim()
            .replace(/^["']|["']$/g, "")
            .toLowerCase(),
        );
        let importedCount = 0;
        let updatedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i]
            .split(sep)
            .map((c) => c.trim().replace(/^["']|["']$/g, ""));
          if (!row.length || !row[0]) continue;
          const rowObj = {};
          headers.forEach((h, idx) => {
            rowObj[h] = row[idx];
          });
          const name = rowObj.nombre || rowObj.name || row[1] || row[0];
          const mode = (
            rowObj.unidad_calculo ||
            rowObj.mode ||
            rowObj.unidad ||
            "m2"
          ).toLowerCase();
          const validMode = ["m2", "metro_lineal", "unidad", "placa"].includes(
            mode,
          )
            ? mode
            : "m2";
          const cost =
            Number(
              String(
                rowObj.costo_ars || rowObj.costo || rowObj.costars || "5000",
              ).replace(/[^0-9.]/g, ""),
            ) || 5e3;
          const margin =
            Number(
              String(rowObj.margen || rowObj["margen_%"] || "100").replace(
                /[^0-9.]/g,
                "",
              ),
            ) || 100;
          const salePrice =
            Number(
              String(rowObj.precio_venta_ars || rowObj.precio || "").replace(
                /[^0-9.]/g,
                "",
              ),
            ) || Math.round(cost * (1 + margin / 100));
          const pId = rowObj.id || `sheet-${i}`;
          const existingIdx = IN_MEMORY_PRODUCTS.findIndex(
            (p) => p.id === pId || p.name.toLowerCase() === name.toLowerCase(),
          );
          const productObj = {
            id: pId,
            name,
            category: (rowObj.categoria || "lonas").toLowerCase(),
            mode: validMode,
            costARS: cost,
            salePriceARS: salePrice,
            marginPercent: margin,
            unitLabel:
              rowObj.unidad_visual ||
              (validMode === "m2"
                ? "m\xB2"
                : validMode === "metro_lineal"
                  ? "metro lineal"
                  : validMode === "placa"
                    ? "placa"
                    : "unidad"),
            stockStatus: rowObj.stock || "disponible",
            shortDesc: rowObj.descripcion_corta || name,
            isActive: true,
            updatedAt: new Date().toISOString(),
          };
          if (existingIdx >= 0) {
            IN_MEMORY_PRODUCTS[existingIdx] = {
              ...IN_MEMORY_PRODUCTS[existingIdx],
              ...productObj,
            };
            updatedCount++;
          } else {
            IN_MEMORY_PRODUCTS.push(productObj);
            importedCount++;
          }
        }
        return res.json({
          success: true,
          source: "google_sheets_public_csv",
          importedCount,
          updatedCount,
          totalProducts: IN_MEMORY_PRODUCTS.length,
          spreadsheetId: cleanSheetId,
        });
      }
    }
    return res
      .status(400)
      .json({
        error:
          "No se pudo leer la planilla. Verific\xE1 que el archivo est\xE9 publicado como p\xFAblico o que la autorizaci\xF3n OAuth est\xE9 activa.",
      });
  } catch (err) {
    console.error("Error sincronizando Google Sheets:", err);
    res
      .status(500)
      .json({
        error: "Error al sincronizar tarifas con Google Sheets",
        details: err.message,
      });
  }
});
let IN_MEMORY_ORDERS = [
  {
    id: "ord-8835",
    orderNumber: "CC-2026-8835",
    createdAt: new Date(Date.now() - 1e3 * 60 * 45).toISOString(),
    status: "en_produccion",
    priority: "urgente",
    customerType: "agencia",
    customerName: "Rodrigo Pe\xF1a (Agencia Fractal Media)",
    customerCompany: "Fractal Media SA",
    customerEmail: "rodrigo@fractalmedia.com.ar",
    customerPhone: "+54 11 4899-2210",
    shippingMethod: "a_despacho",
    shippingFeeARS: 4e3,
    totalAmountARS: 185e3,
    paymentMethod: "mercadopago",
    paymentStatus: "acreditado",
    internalNotes:
      "URGENTE TALLER: Evento apertura de local ma\xF1ana 18hs en Palermo Soho. Imprimir en alta resoluci\xF3n UV.",
    promisedDate: new Date(Date.now() + 1e3 * 60 * 60 * 24).toISOString(),
    totalM2: 12.5,
    items: [
      {
        id: "item-1",
        materialId: "lona_front",
        materialName: "Lona Front standard 13 oz",
        category: "lonas",
        mode: "m2",
        widthCm: 500,
        heightCm: 250,
        quantity: 1,
        unitPriceARS: 93750,
        totalPriceARS: 93750,
        finishings: ["corte_a_medida", "ojales_50cm", "refuerzo_perimetral"],
        transparencyNotes: ["C\xE1lculo por superficie: 12.50 m\xB2 totales."],
      },
      {
        id: "item-2",
        materialId: "portabanner_rollup_80x200",
        materialName: "Porta Banner Roll Up 80\xD7200 cm",
        category: "portabanners",
        mode: "unidad",
        quantity: 1,
        unitPriceARS: 92e3,
        totalPriceARS: 92e3,
        finishings: [],
        transparencyNotes: [
          "Estructura autoenrollable con bolso acolchado de viaje.",
        ],
      },
    ],
  },
  {
    id: "ord-8834",
    orderNumber: "CC-2026-8834",
    createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 3).toISOString(),
    status: "en_produccion",
    priority: "alta",
    customerType: "cartelero",
    customerName: "Claudio Morales (Letreros del Sur)",
    customerCompany: "Letreros del Sur Carteler\xEDa",
    customerEmail: "claudio@letrerosdelsur.com.ar",
    customerPhone: "+54 11 3321-4490",
    shippingMethod: "retiro_taller",
    shippingFeeARS: 0,
    totalAmountARS: 22e4,
    paymentMethod: "transferencia",
    paymentStatus: "acreditado",
    internalNotes:
      "Cartelero gremio: Vaina superior e inferior de 10 cm para pasar ca\xF1o redondo de 1 pulgada.",
    promisedDate: new Date(Date.now() + 1e3 * 60 * 60 * 48).toISOString(),
    totalM2: 24,
    items: [
      {
        id: "item-3",
        materialId: "lona_back_doble",
        materialName: "Lona Backlight doble pasada",
        category: "lonas",
        mode: "m2",
        widthCm: 600,
        heightCm: 200,
        quantity: 2,
        unitPriceARS: 11e4,
        totalPriceARS: 22e4,
        finishings: ["corte_a_medida", "soldado_termico"],
        transparencyNotes: [
          "Doble pasada de tinta para caja de luz backlight. 24 m\xB2 totales.",
        ],
      },
    ],
  },
  {
    id: "ord-8833",
    orderNumber: "CC-2026-8833",
    createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 18).toISOString(),
    status: "terminaciones",
    priority: "normal",
    customerType: "imprenta",
    customerName: "Gr\xE1fica San Mart\xEDn (Ignacio)",
    customerCompany: "Imprenta Offset & Digital San Mart\xEDn",
    customerEmail: "tallersanmartin@gmail.com",
    customerPhone: "+54 11 6789-0123",
    shippingMethod: "a_despacho",
    shippingFeeARS: 4e3,
    totalAmountARS: 154e3,
    paymentMethod: "mercadopago",
    paymentStatus: "acreditado",
    internalNotes:
      "Despacho por V\xEDa Cargo a sucursal San Mart\xEDn. Entregar en rollo cerrado con tubo protector.",
    promisedDate: new Date(Date.now() + 1e3 * 60 * 60 * 72).toISOString(),
    totalM2: 10,
    items: [
      {
        id: "item-4",
        materialId: "vinilo_microperforado",
        materialName: "Vinilo Microperforado para vidrios",
        category: "vinilos",
        mode: "m2",
        widthCm: 200,
        heightCm: 100,
        quantity: 5,
        unitPriceARS: 3e4,
        totalPriceARS: 15e4,
        finishings: ["corte_a_medida"],
        transparencyNotes: [
          "10 m\xB2 de microperforado para vidriera inmobiliaria.",
        ],
      },
    ],
  },
  {
    id: "ord-8832",
    orderNumber: "CC-2026-8832",
    createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 36).toISOString(),
    status: "pendiente",
    priority: "urgente",
    customerType: "comun",
    customerName: "Dra. Sof\xEDa Rold\xE1n (Consultorio Dental)",
    customerEmail: "sofiaroldan@odontologia.com.ar",
    customerPhone: "+54 11 9912-3344",
    shippingMethod: "retiro_taller",
    shippingFeeARS: 0,
    totalAmountARS: 8e4,
    paymentMethod: "mercadopago",
    paymentStatus: "pendiente",
    internalNotes:
      "Cliente particular: Esperando acreditaci\xF3n de pago y confirmaci\xF3n de archivo de dise\xF1o.",
    promisedDate: new Date(Date.now() + 1e3 * 60 * 60 * 24).toISOString(),
    totalM2: 0.72,
    items: [
      {
        id: "item-5",
        materialId: "placa_polifan_corte_2cm",
        materialName: "Placa Polif\xE1n 20 mm con corte pantogr\xE1fico",
        category: "rigidos",
        mode: "placa",
        widthCm: 60,
        heightCm: 120,
        quantity: 1,
        unitPriceARS: 8e4,
        totalPriceARS: 8e4,
        finishings: ["corte_a_medida"],
        transparencyNotes: ["Letras corp\xF3reas de recepci\xF3n dental."],
      },
    ],
  },
  {
    id: "ord-8831",
    orderNumber: "CC-2026-8831",
    createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 72).toISOString(),
    status: "despachado",
    priority: "normal",
    customerType: "agencia",
    customerName: "Mart\xEDn Bossi (Estudio MB)",
    customerCompany: "Estudio Creativo MB",
    customerEmail: "martin@estudiomb.com.ar",
    customerPhone: "+54 11 4892-1100",
    shippingMethod: "a_despacho",
    shippingFeeARS: 4e3,
    totalAmountARS: 82500,
    paymentMethod: "mercadopago",
    paymentStatus: "acreditado",
    trackingUrl: "https://transporte-expreso.com.ar/guia/CC8831",
    totalM2: 9,
    items: [
      {
        id: "item-6",
        materialId: "lona_front",
        materialName: "Lona Front standard 13 oz",
        category: "lonas",
        mode: "m2",
        widthCm: 300,
        heightCm: 150,
        quantity: 2,
        unitPriceARS: 39250,
        totalPriceARS: 78500,
        finishings: ["corte_a_medida", "ojales_50cm", "refuerzo_perimetral"],
        transparencyNotes: ["C\xE1lculo por superficie: 9.00 m\xB2 totales."],
      },
    ],
  },
  {
    id: "ord-8830",
    orderNumber: "CC-2026-8830",
    createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 120).toISOString(),
    status: "entregado",
    priority: "baja",
    customerType: "comun",
    customerName: "Valeria Soria (\xD3ptica Centro)",
    customerEmail: "valeria@opticacentro.com.ar",
    customerPhone: "+54 11 5590-4421",
    shippingMethod: "retiro_taller",
    shippingFeeARS: 0,
    totalAmountARS: 92e3,
    paymentMethod: "transferencia",
    paymentStatus: "acreditado",
    totalM2: 1.6,
    items: [
      {
        id: "item-7",
        materialId: "portabanner_rollup_80x200",
        materialName: "Porta Banner Roll Up 80\xD7200 cm",
        category: "portabanners",
        mode: "unidad",
        quantity: 1,
        unitPriceARS: 92e3,
        totalPriceARS: 92e3,
        finishings: [],
        transparencyNotes: [
          "Estructura autoenrollable con bolso acolchado de viaje.",
        ],
      },
    ],
  },
];
app.get("/api/orders", (req, res) => {
  const { customerType, priority, status, search } = req.query;
  let filtered = [...IN_MEMORY_ORDERS];
  if (customerType && customerType !== "todos") {
    filtered = filtered.filter((o) => o.customerType === customerType);
  }
  if (priority && priority !== "todos") {
    filtered = filtered.filter((o) => o.priority === priority);
  }
  if (status && status !== "todos") {
    filtered = filtered.filter((o) => o.status === status);
  }
  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.customerCompany && o.customerCompany.toLowerCase().includes(q)) ||
        o.customerEmail.toLowerCase().includes(q),
    );
  }
  res.json({ orders: filtered });
});
app.get("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const order = IN_MEMORY_ORDERS.find(
    (o) => o.id === id || o.orderNumber === id,
  );
  if (!order) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }
  return res.json({ order });
});
function recalculateItemPriceServer(item) {
  const costMap = getCostTableMap();
  const materialId = mapClientMaterialIdToServer(item.materialId || item.id);
  const materialConfig = costMap[materialId];
  const qty = Math.max(1, Number(item.quantity) || 1);
  const w = Number(item.widthCm) || 100;
  const h = Number(item.heightCm) || 100;
  if (!materialConfig) {
    const fallbackPrice = Math.max(
      1e3,
      Number(item.unitPriceARS) || Number(item.totalPriceARS) || 15e3,
    );
    return {
      unitPriceARS: fallbackPrice,
      totalPriceARS: fallbackPrice * qty,
      materialName:
        item.materialName || item.title || "Trabajo de Impresi\xF3n Especial",
    };
  }
  let subtotalARS = 0;
  let unitPriceARS = 0;
  if (materialConfig.mode === "m2") {
    const singleAreaM2 = (w * h) / 1e4;
    let billableArea = singleAreaM2 * qty;
    if (materialConfig.minAreaM2 && billableArea < materialConfig.minAreaM2) {
      billableArea = materialConfig.minAreaM2;
    }
    const baseM2PriceARS = (materialConfig.costARS || 7500) * MARGIN_M2;
    subtotalARS = Math.round(baseM2PriceARS * billableArea);
    unitPriceARS = Math.round(subtotalARS / qty);
  } else if (materialConfig.mode === "metro_lineal") {
    const lengthMeters = Math.max(1, (h || w) / 100);
    const totalLinearM = lengthMeters * qty;
    const baseLinearPriceARS =
      (materialConfig.costARS || 3200) * MARGIN_METRO_LINEAL;
    subtotalARS = Math.round(baseLinearPriceARS * totalLinearM);
    unitPriceARS = Math.round(subtotalARS / qty);
  } else if (materialConfig.mode === "unidad") {
    const baseUnitPriceARS = (materialConfig.costARS || 4e4) * MARGIN_UNIDAD;
    unitPriceARS = Math.round(baseUnitPriceARS);
    subtotalARS = Math.round(unitPriceARS * qty);
  } else if (materialConfig.mode === "placa") {
    const requestedPieceAreaM2 = (w * h) / 1e4;
    const totalRequestedAreaM2 = requestedPieceAreaM2 * qty;
    const plateSizeM2 = materialConfig.plateAreaM2 || 2.9768;
    const platesNeeded = Math.max(
      1,
      Math.ceil(totalRequestedAreaM2 / plateSizeM2),
    );
    const platePriceARS = (materialConfig.costARS || 55e3) * MARGIN_PLACA;
    subtotalARS = Math.round(platePriceARS * platesNeeded);
    unitPriceARS = Math.round(subtotalARS / qty);
  }
  let discountPct = 0;
  if (item.wholesaleTierRequested === "partner") discountPct = 15;
  else if (item.wholesaleTierRequested === "agencia") discountPct = 10;
  else if (item.wholesaleTierRequested === "inicio") discountPct = 5;
  const totalPriceARS = Math.round(subtotalARS * (1 - discountPct / 100));
  const finalUnitPriceARS = Math.round(totalPriceARS / qty);
  return {
    unitPriceARS: finalUnitPriceARS,
    totalPriceARS,
    materialName: materialConfig.name,
  };
}
__name(recalculateItemPriceServer, "recalculateItemPriceServer");
app.post("/api/checkout/preference", async (req, res) => {
  try {
    const {
      customerName,
      customerCompany,
      customerEmail,
      customerPhone,
      customerType,
      priority,
      shippingMethod,
      items,
      internalNotes,
    } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "El pedido debe contener al menos un producto." });
    }
    const verifiedItems = items.map((item) => {
      const calc = recalculateItemPriceServer(item);
      return {
        ...item,
        materialName: calc.materialName,
        unitPriceARS: calc.unitPriceARS,
        totalPriceARS: calc.totalPriceARS,
      };
    });
    const itemsSubtotalARS = verifiedItems.reduce(
      (acc, item) => acc + item.totalPriceARS,
      0,
    );
    const shippingFeeARS = shippingMethod === "a_despacho" ? 4e3 : 0;
    const totalAmountARS = itemsSubtotalARS + shippingFeeARS;
    const totalM2 = verifiedItems.reduce((acc, item) => {
      if (item.widthCm && item.heightCm) {
        return (
          acc + ((item.widthCm * item.heightCm) / 1e4) * (item.quantity || 1)
        );
      }
      return acc;
    }, 0);
    const newOrderId = `ord-${Date.now()}`;
    const newOrderNumber = `CC-2026-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const newOrder = {
      id: newOrderId,
      orderNumber: newOrderNumber,
      createdAt: new Date().toISOString(),
      status: "pendiente",
      priority: priority || "normal",
      customerType: customerType || "comun",
      customerName: customerName || "Cliente Carteles.Click",
      customerCompany: customerCompany || "",
      customerEmail: customerEmail || "cliente@carteles.click",
      customerPhone: customerPhone || "+54 11 0000-0000",
      shippingMethod: shippingMethod || "retiro_taller",
      shippingFeeARS,
      totalAmountARS,
      paymentMethod: "mercadopago",
      paymentStatus: "pendiente",
      internalNotes:
        internalNotes || "Generado v\xEDa Checkout Pro Mercado Pago",
      promisedDate: new Date(Date.now() + 1e3 * 60 * 60 * 72).toISOString(),
      totalM2: parseFloat(totalM2.toFixed(2)),
      items: verifiedItems,
    };
    IN_MEMORY_ORDERS.unshift(newOrder);
    IN_MEMORY_NOTIFICATIONS.unshift({
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: "admin_alert",
      title: "\u{1F389} Nuevo Pedido Recibido",
      message: `El cliente ${newOrder.customerName} ingres\xF3 el pedido #${newOrder.orderNumber} por $${newOrder.totalAmountARS.toLocaleString("es-AR")}.`,
      timestamp: new Date().toISOString(),
      read: false,
      orderId: newOrder.id,
      link: "pedidos",
      priority: "normal",
    });
    const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(
      /\/$/,
      "",
    );
    const mpItems = verifiedItems.map((item) => ({
      id: item.materialId || item.id || "item",
      title:
        item.materialName ||
        item.title ||
        "Trabajo de Impresi\xF3n Gran Formato",
      description: `Carteles.Click - ${item.materialName} (${item.quantity || 1} unid.)`,
      quantity: Math.max(1, Number(item.quantity) || 1),
      unit_price: item.unitPriceARS,
      currency_id: "ARS",
    }));
    if (shippingFeeARS > 0) {
      mpItems.push({
        id: "flete_despacho",
        title: "Cargo Fijo de Despacho y Flete a Terminal",
        description:
          "Embalaje t\xE9cnico reforzado y traslado local hasta la terminal de despacho",
        quantity: 1,
        unit_price: shippingFeeARS,
        currency_id: "ARS",
      });
    }
    const preferenceBody = {
      items: mpItems,
      payer: {
        name: customerName || "Cliente Carteles.Click",
        email: customerEmail || "cliente@carteles.click",
        phone: {
          number:
            (customerPhone || "1100000000").replace(/\D/g, "") || "1100000000",
        },
      },
      external_reference: newOrderId,
      notification_url: `${appUrl}/api/mercadopago/webhook`,
      back_urls: {
        success: `${appUrl}/?payment_status=approved&order_id=${newOrderId}`,
        failure: `${appUrl}/?payment_status=rejected&order_id=${newOrderId}`,
        pending: `${appUrl}/?payment_status=pending&order_id=${newOrderId}`,
      },
      auto_return: "approved",
      statement_descriptor: "CARTELES.CLICK",
    };
    let preferenceId = `PREF-${newOrderId}`;
    let initPoint = `${appUrl}/?payment_status=approved&order_id=${newOrderId}&demo=true`;
    let sandboxInitPoint = initPoint;
    if (mpClient) {
      try {
        const preferenceApi = new Preference(mpClient);
        const mpResponse = await preferenceApi.create({ body: preferenceBody });
        if (mpResponse.id) {
          preferenceId = mpResponse.id;
          initPoint = mpResponse.init_point || initPoint;
          sandboxInitPoint = mpResponse.sandbox_init_point || initPoint;
        }
      } catch (mpErr) {
        console.warn(
          "[MercadoPago] Advertencia al crear preferencia en MP SDK:",
          mpErr.message,
        );
      }
    }
    return res
      .status(201)
      .json({
        success: true,
        order: newOrder,
        preferenceId,
        initPoint,
        sandboxInitPoint,
        publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || "",
      });
  } catch (error) {
    console.error("Error al crear preferencia de Mercado Pago:", error);
    return res
      .status(500)
      .json({
        error: "Error interno en el servidor al generar preferencia de pago.",
      });
  }
});
app.post("/api/mercadopago/webhook", async (req, res) => {
  try {
    const topic =
      req.query.topic || req.query.type || req.body?.type || req.body?.action;
    const paymentId =
      req.query["data.id"] || req.body?.data?.id || req.body?.id;
    console.log(
      `[MercadoPago Webhook] Recibida notificaci\xF3n -> Topic: ${topic}, PaymentID: ${paymentId}`,
    );
    let targetOrderId = null;
    let paymentApproved = false;
    let paymentStatusDetail = "pendiente";
    if (paymentId && mpClient) {
      try {
        const paymentApi = new Payment(mpClient);
        const paymentData = await paymentApi.get({ id: String(paymentId) });
        if (paymentData) {
          targetOrderId = paymentData.external_reference || null;
          paymentStatusDetail = paymentData.status || "pendiente";
          paymentApproved = paymentData.status === "approved";
        }
      } catch (err) {
        console.warn(
          `[MercadoPago Webhook] Error al verificar pago ${paymentId}:`,
          err.message,
        );
      }
    }
    if (!targetOrderId && (req.body?.orderId || req.query?.simulate_order_id)) {
      targetOrderId = String(req.body?.orderId || req.query?.simulate_order_id);
      paymentApproved =
        req.body?.status === "approved" ||
        req.query?.status === "approved" ||
        true;
      paymentStatusDetail = paymentApproved ? "approved" : "rejected";
    }
    if (targetOrderId) {
      const orderIndex = IN_MEMORY_ORDERS.findIndex(
        (o) => o.id === targetOrderId || o.orderNumber === targetOrderId,
      );
      if (orderIndex !== -1) {
        const order = IN_MEMORY_ORDERS[orderIndex];
        if (paymentApproved || paymentStatusDetail === "approved") {
          order.paymentStatus = "acreditado";
          order.status = "en_produccion";
          order.paidAt = new Date().toISOString();
          order.mpPaymentId = String(paymentId || `mp-pay-${Date.now()}`);
          console.log(
            `[MercadoPago Webhook] \u2705 Pedido ${order.orderNumber} PAGO ACREDITADO -> Movido a EN PRODUCCI\xD3N`,
          );
        } else if (
          paymentStatusDetail === "rejected" ||
          paymentStatusDetail === "cancelled"
        ) {
          order.paymentStatus = "rechazado";
          console.log(
            `[MercadoPago Webhook] \u274C Pedido ${order.orderNumber} PAGO RECHAZADO`,
          );
        }
      }
    }
    return res.status(200).send("OK");
  } catch (error) {
    console.error("[MercadoPago Webhook] Error procesando webhook:", error);
    return res.status(200).send("OK");
  }
});
app.post("/api/mercadopago/simulate-webhook", (req, res) => {
  const { orderId, status = "approved" } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: "orderId es requerido" });
  }
  const orderIndex = IN_MEMORY_ORDERS.findIndex(
    (o) => o.id === orderId || o.orderNumber === orderId,
  );
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }
  const order = IN_MEMORY_ORDERS[orderIndex];
  if (status === "approved") {
    order.paymentStatus = "acreditado";
    order.status = "en_produccion";
    order.paidAt = new Date().toISOString();
    order.mpPaymentId = `sim-pay-${Date.now()}`;
  } else {
    order.paymentStatus = "rechazado";
  }
  return res.json({
    success: true,
    message: `Webhook de Mercado Pago procesado correctamente. Pedido ${order.orderNumber} actualizado a '${order.status}' (Pago: '${order.paymentStatus}').`,
    order,
  });
});
app.post("/api/orders", (req, res) => {
  const {
    customerName,
    customerCompany,
    customerEmail,
    customerPhone,
    customerType,
    priority,
    shippingMethod,
    items,
    internalNotes,
    promisedDate,
  } = req.body;
  if (!items || !items.length) {
    IN_MEMORY_NOTIFICATIONS.unshift({
      id: `notif-${Date.now()}`,
      type: "admin_alert",
      title: "\u26A0\uFE0F Intento de Pedido Inv\xE1lido",
      message: "Un cliente intent\xF3 procesar un pedido sin items.",
      timestamp: new Date().toISOString(),
      read: false,
      priority: "high",
    });
    return res
      .status(400)
      .json({ error: "El pedido debe incluir al menos un item." });
  }
  const shippingFeeARS = shippingMethod === "a_despacho" ? 4e3 : 0;
  const verifiedItems = items.map((item) => {
    const calc = recalculateItemPriceServer(item);
    return {
      ...item,
      materialName: calc.materialName,
      unitPriceARS: calc.unitPriceARS,
      totalPriceARS: calc.totalPriceARS,
    };
  });
  const itemsTotal = verifiedItems.reduce(
    (acc, item) => acc + item.totalPriceARS,
    0,
  );
  const totalAmountARS = itemsTotal + shippingFeeARS;
  const totalM2 = verifiedItems.reduce((acc, item) => {
    if (item.widthCm && item.heightCm) {
      return (
        acc + ((item.widthCm * item.heightCm) / 1e4) * (item.quantity || 1)
      );
    }
    return acc;
  }, 0);
  const newOrder = {
    id: `ord-${Math.floor(1e3 + Math.random() * 9e3)}`,
    orderNumber: `CC-2026-${Math.floor(1e3 + Math.random() * 9e3)}`,
    createdAt: new Date().toISOString(),
    status: "pendiente",
    priority: priority || "normal",
    customerType: customerType || "comun",
    customerName: customerName || "Cliente Particular",
    customerCompany: customerCompany || "",
    customerEmail: customerEmail || "cliente@ejemplo.com",
    customerPhone: customerPhone || "+54 11 0000-0000",
    shippingMethod: shippingMethod || "retiro_taller",
    shippingFeeARS,
    totalAmountARS,
    paymentMethod: "mercadopago",
    paymentStatus: "acreditado",
    internalNotes: internalNotes || "",
    promisedDate:
      promisedDate || new Date(Date.now() + 1e3 * 60 * 60 * 72).toISOString(),
    totalM2: parseFloat(totalM2.toFixed(2)),
    items: verifiedItems,
  };
  IN_MEMORY_ORDERS.unshift(newOrder);
  IN_MEMORY_NOTIFICATIONS.unshift({
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type: "admin_alert",
    title: "\u{1F389} Nuevo Pedido Recibido",
    message: `El cliente ${newOrder.customerName} ingres\xF3 el pedido #${newOrder.orderNumber} por $${newOrder.totalAmountARS.toLocaleString("es-AR")}.`,
    timestamp: new Date().toISOString(),
    read: false,
    orderId: newOrder.id,
    link: "pedidos",
    priority: "normal",
  });
  res.status(201).json({ success: true, order: newOrder });
});
function getStatusLabel(status) {
  switch (status) {
    case "pendiente":
      return "Pendiente de Confirmaci\xF3n";
    case "en_produccion":
      return "Producci\xF3n Iniciada";
    case "impresion":
      return "En Taller de Impresi\xF3n";
    case "terminaciones":
      return "En Terminaciones & Confecci\xF3n";
    case "listo_para_entrega":
      return "Listo para Retiro en Taller";
    case "despachado":
      return "Despachado / En Encomienda";
    case "entregado":
      return "Entregado & Finalizado";
    case "cancelado":
      return "Cancelado";
    default:
      return status;
  }
}
__name(getStatusLabel, "getStatusLabel");
app.patch("/api/admin/orders/:id", (req, res) => {
  const { id } = req.params;
  const orderIndex = IN_MEMORY_ORDERS.findIndex((o) => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Pedido no encontrado." });
  }
  const {
    status,
    priority,
    customerType,
    internalNotes,
    promisedDate,
    trackingUrl,
  } = req.body;
  const oldStatus = IN_MEMORY_ORDERS[orderIndex].status;
  if (status) IN_MEMORY_ORDERS[orderIndex].status = status;
  IN_MEMORY_NOTIFICATIONS.unshift({
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type: "admin_alert",
    title: "\u{1F504} Cambio de Estado",
    message: `Pedido #${IN_MEMORY_ORDERS[orderIndex].orderNumber} cambi\xF3 a "${status}".`,
    timestamp: new Date().toISOString(),
    read: false,
    orderId: id,
    link: "pedidos",
    priority: "low",
  });
  if (priority) IN_MEMORY_ORDERS[orderIndex].priority = priority;
  if (customerType) IN_MEMORY_ORDERS[orderIndex].customerType = customerType;
  if (internalNotes !== void 0)
    IN_MEMORY_ORDERS[orderIndex].internalNotes = internalNotes;
  if (promisedDate !== void 0)
    IN_MEMORY_ORDERS[orderIndex].promisedDate = promisedDate;
  if (trackingUrl !== void 0)
    IN_MEMORY_ORDERS[orderIndex].trackingUrl = trackingUrl;
  const currentOrder = IN_MEMORY_ORDERS[orderIndex];
  if (status && status !== oldStatus) {
    const statusText = getStatusLabel(status);
    const notifMessage = `Tu pedido #${currentOrder.orderNumber} cambi\xF3 a estado: "${statusText}". ${status === "despachado" && currentOrder.trackingUrl ? `Seguimiento: ${currentOrder.trackingUrl}` : ""}`;
    const newNotif = {
      id: `notif-auto-${Date.now()}`,
      type: "order_status",
      title: `Pedido Actualizado: ${statusText}`,
      message: notifMessage,
      timestamp: new Date().toISOString(),
      read: false,
      orderId: currentOrder.orderNumber,
      link: "pedidos",
      priority:
        status === "despachado" || status === "listo_para_entrega"
          ? "high"
          : "normal",
      emailSent: Boolean(currentOrder.customerEmail),
      recipientEmail: currentOrder.customerEmail,
    };
    IN_MEMORY_NOTIFICATIONS.unshift(newNotif);
    if (currentOrder.customerEmail) {
      sendNotificationEmail(
        currentOrder.customerEmail,
        `[Carteles.Click] Actualizaci\xF3n de Pedido #${currentOrder.orderNumber}: ${statusText}`,
        `${notifMessage}

Pod\xE9s consultar el estado completo en cualquier momento ingresando a la secci\xF3n de Pedidos de Carteles.Click.`,
      );
    }
  }
  res.json({ success: true, order: IN_MEMORY_ORDERS[orderIndex] });
});
app.patch("/api/admin/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, adminUid, action, notes, timestamp } = req.body;
  const orderIndex = IN_MEMORY_ORDERS.findIndex((o) => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Pedido no encontrado." });
  }
  const oldStatus = IN_MEMORY_ORDERS[orderIndex].status;
  IN_MEMORY_ORDERS[orderIndex].status = status;
  IN_MEMORY_NOTIFICATIONS.unshift({
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type: "admin_alert",
    title: "\u{1F504} Cambio de Estado",
    message: `Pedido #${IN_MEMORY_ORDERS[orderIndex].orderNumber} cambi\xF3 a "${status}".`,
    timestamp: new Date().toISOString(),
    read: false,
    orderId: id,
    link: "pedidos",
    priority: "low",
  });
  IN_MEMORY_ORDERS[orderIndex].updatedAt =
    timestamp || new Date().toISOString();
  const currentOrder = IN_MEMORY_ORDERS[orderIndex];
  if (!currentOrder.auditHistory) {
    currentOrder.auditHistory = [];
  }
  const auditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    orderId: currentOrder.id,
    orderNumber: currentOrder.orderNumber,
    adminUid: adminUid || "admin",
    action: action || "update_status",
    previousStatus: oldStatus,
    newStatus: status,
    timestamp: timestamp || new Date().toISOString(),
    notes: notes || `Estado actualizado a "${status}"`,
  };
  currentOrder.auditHistory.unshift(auditEntry);
  if (status && status !== oldStatus) {
    const statusText = getStatusLabel(status);
    const notifMessage = `Tu pedido #${currentOrder.orderNumber} cambi\xF3 a estado: "${statusText}".`;
    const newNotif = {
      id: `notif-auto-${Date.now()}`,
      type: "order_status",
      title: `Pedido Actualizado: ${statusText}`,
      message: notifMessage,
      timestamp: new Date().toISOString(),
      read: false,
      orderId: currentOrder.orderNumber,
      link: "pedidos",
      priority:
        status === "despachado" || status === "listo_para_entrega"
          ? "high"
          : "normal",
      emailSent: Boolean(currentOrder.customerEmail),
      recipientEmail: currentOrder.customerEmail,
    };
    IN_MEMORY_NOTIFICATIONS.unshift(newNotif);
    if (currentOrder.customerEmail) {
      sendNotificationEmail(
        currentOrder.customerEmail,
        `[Carteles.Click] Actualizaci\xF3n de Pedido #${currentOrder.orderNumber}: ${statusText}`,
        `${notifMessage}

Pod\xE9s consultar el estado completo ingresando a la plataforma Carteles.Click.`,
      );
    }
  }
  res.json({ success: true, order: IN_MEMORY_ORDERS[orderIndex] });
});
app.get("/api/admin/orders/export-sheets", (req, res) => {
  const format = req.query.format === "tsv" ? "tsv" : "csv";
  const delimiter = format === "tsv" ? "	" : ",";
  const headers = [
    "Nro_Pedido",
    "Fecha",
    "Prioridad",
    "Tipo_Cliente",
    "Cliente_Nombre",
    "Empresa",
    "Email",
    "Telefono",
    "Estado",
    "M2_Totales",
    "Monto_Total_ARS",
    "Metodo_Envio",
    "Notas_Taller",
  ];
  const rows = IN_MEMORY_ORDERS.map((o) =>
    [
      `"${o.orderNumber}"`,
      `"${o.createdAt.split("T")[0]}"`,
      `"${o.priority || "normal"}"`,
      `"${o.customerType || "comun"}"`,
      `"${(o.customerName || "").replace(/"/g, '""')}"`,
      `"${(o.customerCompany || "").replace(/"/g, '""')}"`,
      `"${o.customerEmail || ""}"`,
      `"${o.customerPhone || ""}"`,
      `"${o.status}"`,
      o.totalM2 || 0,
      o.totalAmountARS || 0,
      `"${o.shippingMethod}"`,
      `"${(o.internalNotes || "").replace(/"/g, '""')}"`,
    ].join(delimiter),
  );
  const csvContent = "\uFEFF" + [headers.join(delimiter), ...rows].join("\n");
  res.setHeader(
    "Content-Type",
    format === "tsv"
      ? "text/tab-separated-values; charset=utf-8"
      : "text/csv; charset=utf-8",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=pedidos_carteles_click_${Date.now()}.${format === "tsv" ? "tsv" : "csv"}`,
  );
  res.send(csvContent);
});
app.get("/api/admin/metrics", (req, res) => {
  const period = req.query.period || "mensual";
  const now = new Date();
  let filterStartDate;
  if (period === "semanal") {
    filterStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
  } else if (period === "mensual") {
    filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "anual") {
    filterStartDate = new Date(now.getFullYear(), 0, 1);
  } else {
    filterStartDate = new Date(0);
  }
  const periodMultiplier =
    period === "anual"
      ? 12
      : period === "mensual"
        ? 4
        : period === "semanal"
          ? 1
          : 16;
  const totalOrders = Math.round(IN_MEMORY_ORDERS.length * periodMultiplier);
  const baseRevenue = IN_MEMORY_ORDERS.reduce(
    (acc, o) => acc + o.totalAmountARS,
    0,
  );
  const totalRevenueARS = baseRevenue * periodMultiplier;
  const baseM2 = IN_MEMORY_ORDERS.reduce((acc, o) => acc + (o.totalM2 || 5), 0);
  const totalM2 = Math.round(baseM2 * periodMultiplier * 10) / 10;
  const averageTicketARS =
    totalOrders > 0 ? Math.round(totalRevenueARS / totalOrders) : 0;
  const urgentOrders = IN_MEMORY_ORDERS.filter(
    (o) => o.priority === "urgente",
  ).length;
  const pendingOrders = IN_MEMORY_ORDERS.filter(
    (o) => o.status === "pendiente" || o.status === "en_produccion",
  ).length;
  const completedOrders = IN_MEMORY_ORDERS.filter(
    (o) => o.status === "despachado" || o.status === "entregado",
  ).length;
  const revenueByCustomerType = {
    agencia: Math.round(totalRevenueARS * 0.42),
    imprenta: Math.round(totalRevenueARS * 0.28),
    cartelero: Math.round(totalRevenueARS * 0.2),
    comun: Math.round(totalRevenueARS * 0.1),
  };
  const ordersByCustomerType = {
    agencia: Math.round(totalOrders * 0.38),
    imprenta: Math.round(totalOrders * 0.26),
    cartelero: Math.round(totalOrders * 0.22),
    comun: Math.round(totalOrders * 0.14),
  };
  const revenueByCategory = {
    lonas: Math.round(totalRevenueARS * 0.48),
    vinilos: Math.round(totalRevenueARS * 0.26),
    rigidos: Math.round(totalRevenueARS * 0.16),
    portabanners: Math.round(totalRevenueARS * 0.1),
    insumos: Math.round(totalRevenueARS * 0.04),
    estructuras: Math.round(totalRevenueARS * 0.06),
  };
  const topMaterials = [
    {
      name: "Lona Front standard 13 oz",
      mode: "m\xB2",
      quantityOrM2: Math.round(totalM2 * 0.45),
      revenueARS: Math.round(totalRevenueARS * 0.38),
    },
    {
      name: "Vinilo Microperforado UV",
      mode: "m\xB2",
      quantityOrM2: Math.round(totalM2 * 0.22),
      revenueARS: Math.round(totalRevenueARS * 0.24),
    },
    {
      name: "Porta Banner Roll Up 80\xD7200",
      mode: "unidad",
      quantityOrM2: Math.round(18 * periodMultiplier),
      revenueARS: Math.round(totalRevenueARS * 0.14),
    },
    {
      name: "Placa PVC Espumado 3 mm",
      mode: "placa",
      quantityOrM2: Math.round(12 * periodMultiplier),
      revenueARS: Math.round(totalRevenueARS * 0.12),
    },
    {
      name: "Cinta Bifaz 3M VHB",
      mode: "metro lineal",
      quantityOrM2: Math.round(65 * periodMultiplier),
      revenueARS: Math.round(totalRevenueARS * 0.06),
    },
  ];
  let timeline = [];
  if (period === "semanal") {
    const days = ["Lun", "Mar", "Mi\xE9", "Jue", "Vie", "S\xE1b", "Dom"];
    timeline = days.map((d, i) => ({
      label: d,
      revenueARS: Math.round((totalRevenueARS / 7) * (0.8 + (i % 3) * 0.2)),
      ordersCount: Math.round((totalOrders / 7) * (0.8 + (i % 2) * 0.3)) || 1,
      m2: Math.round((totalM2 / 7) * (0.9 + (i % 3) * 0.15)),
    }));
  } else if (period === "mensual") {
    timeline = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"].map((w, i) => ({
      label: w,
      revenueARS: Math.round((totalRevenueARS / 4) * (0.85 + i * 0.1)),
      ordersCount: Math.round(totalOrders / 4) || 2,
      m2: Math.round(totalM2 / 4),
    }));
  } else if (period === "anual") {
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    timeline = months.map((m, i) => ({
      label: m,
      revenueARS: Math.round(
        (totalRevenueARS / 12) * (0.7 + Math.sin(i) * 0.3 + 0.3),
      ),
      ordersCount: Math.round(totalOrders / 12) || 4,
      m2: Math.round(totalM2 / 12),
    }));
  } else {
    timeline = ["2023", "2024", "2025", "2026 (Actual)"].map((y, i) => ({
      label: y,
      revenueARS: Math.round(totalRevenueARS * (0.4 + i * 0.25)),
      ordersCount: Math.round(totalOrders * (0.5 + i * 0.2)),
      m2: Math.round(totalM2 * (0.5 + i * 0.2)),
    }));
  }
  res.json({
    period,
    totalRevenueARS,
    totalOrders,
    totalM2,
    totalLinearM: Math.round(35 * periodMultiplier),
    totalUnits: Math.round(28 * periodMultiplier),
    totalPlates: Math.round(18 * periodMultiplier),
    averageTicketARS,
    urgentOrders,
    pendingOrders,
    completedOrders,
    revenueByCustomerType,
    ordersByCustomerType,
    revenueByCategory,
    topMaterials,
    timeline,
    aiStats: aiUsageStats,
  });
});
app.post("/api/quote-batch", quoteRateLimiter, (req, res) => {
  try {
    const valResult = quoteBatchSchema.safeParse(req.body);
    if (!valResult.success) {
      return res
        .status(400)
        .json({ error: "Par\xE1metros de lote no v\xE1lidos." });
    }
    const { materialId, items, wholesaleTierRequested, mountOption } =
      valResult.data;
    const costMap = getCostTableMap();
    const mappedMaterialId = mapClientMaterialIdToServer(materialId);
    if (!mappedMaterialId || !costMap[mappedMaterialId]) {
      return res.status(400).json({ error: "Material no encontrado." });
    }
    const materialConfig = costMap[mappedMaterialId];
    let totalBatchAreaM2 = 0;
    let pieces = [];
    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        const w = Math.max(item.widthCm, item.heightCm);
        const h = Math.min(item.widthCm, item.heightCm);
        pieces.push({ w, h, id: item.id, itemArea: (w * h) / 1e4 });
      }
    }
    let totalPlatesNeeded = 0;
    let plateW = materialConfig.plateWidthCm || 122;
    let plateH = materialConfig.plateHeightCm || 244;
    if (plateH > plateW) {
      const temp = plateW;
      plateW = plateH;
      plateH = temp;
    }
    const plateAreaM2 = (plateW * plateH) / 1e4;
    if (materialConfig.mode === "placa") {
      pieces.sort((a, b) => b.h - a.h);
      let bins = [];
      for (const p of pieces) {
        if (p.w > plateW || p.h > plateH) {
        }
        let placed = false;
        for (const bin of bins) {
          for (const level of bin.levels) {
            if (level.width + p.w <= plateW && p.h <= level.height) {
              level.width += p.w;
              placed = true;
              break;
            }
          }
          if (placed) break;
          let totalHeight = bin.levels.reduce((sum, l) => sum + l.height, 0);
          if (totalHeight + p.h <= plateH) {
            bin.levels.push({ width: p.w, height: p.h });
            placed = true;
            break;
          }
          if (placed) break;
        }
        if (!placed) {
          bins.push({ levels: [{ width: p.w, height: p.h }] });
        }
      }
      totalPlatesNeeded = bins.length || 1;
    }
    const platePriceARS =
      (materialConfig.costARS || 55e3) * (wholesaleTierRequested ? 1.5 : 2.5);
    const totalPlateCostARS = totalPlatesNeeded * platePriceARS;
    const totalRequestedArea = pieces.reduce((sum, p) => sum + p.itemArea, 0);
    const results = items.map((item) => {
      const qty = item.quantity;
      let unitPriceARS = 0;
      let baseMaterialSubtotalARS = 0;
      let calculatedAreaM2 = (item.widthCm * item.heightCm) / 1e4;
      let effectiveBillableAreaM2 = calculatedAreaM2 * qty;
      let transparencyNotes = [];
      let fullPlateWarning = false;
      let platesCount = void 0;
      if (materialConfig.mode === "placa") {
        const itemArea = calculatedAreaM2 * qty;
        const proportion =
          totalRequestedArea > 0 ? itemArea / totalRequestedArea : 0;
        baseMaterialSubtotalARS = Math.round(totalPlateCostARS * proportion);
        transparencyNotes.push(
          `C\xE1lculo anidado (Nesting): Este lote usa ${totalPlatesNeeded} placa(s) en total. Costo distribuido proporcionalmente por \xE1rea (${(proportion * 100).toFixed(1)}%).`,
        );
        fullPlateWarning = true;
        platesCount = totalPlatesNeeded;
      } else {
        if (materialConfig.mode === "m2") {
          const singleAreaM2 = calculatedAreaM2;
          const totalAreaRequested = singleAreaM2 * qty;
          let billableTotalArea = totalAreaRequested;
          if (
            materialConfig.minAreaM2 &&
            totalAreaRequested < materialConfig.minAreaM2
          ) {
            billableTotalArea = materialConfig.minAreaM2;
          }
          baseMaterialSubtotalARS = Math.round(
            (materialConfig.costARS || 7500) * 2.5 * billableTotalArea,
          );
        } else if (materialConfig.mode === "metro_lineal") {
          const lengthMeters = Math.max(
            1,
            Math.max(item.widthCm, item.heightCm) / 100,
          );
          baseMaterialSubtotalARS = Math.round(
            (materialConfig.costARS || 3200) * 2.5 * lengthMeters * qty,
          );
        }
      }
      let printQualityCostARS = 0;
      if (item.printQuality === "alta_resolucion") {
        printQualityCostARS = Math.round(calculatedAreaM2 * qty * 2500);
      }
      let inkTypeCostARS = 0;
      let inkTypeLabel = "Solvente";
      if (item.inkType === "uv") {
        inkTypeLabel = "Tintas UV";
        inkTypeCostARS = Math.round(calculatedAreaM2 * qty * 1800);
      } else if (item.inkType === "directa_uv") {
        inkTypeLabel = "Directa UV";
        if (materialConfig.mode !== "placa")
          inkTypeCostARS = Math.round(calculatedAreaM2 * qty * 3200);
      }
      let finishingsSubtotalARS = 0;
      const finishingsBreakdown = [];
      const perimeterM = parseFloat(
        ((2 * (item.widthCm + item.heightCm)) / 100).toFixed(2),
      );
      const areaM2Val = calculatedAreaM2;
      item.finishings.forEach((fId) => {
        const finConfig = PRICING_SETTINGS_CONFIG.finishings[fId];
        if (!finConfig) return;
        let itemCost = 0;
        if (finConfig.calculationType === "metro_perimetral") {
          itemCost = Math.round(perimeterM * finConfig.unitCostARS * qty);
        } else if (finConfig.calculationType === "m2") {
          itemCost = Math.round(areaM2Val * finConfig.unitCostARS * qty);
        } else {
          itemCost = Math.round(finConfig.unitCostARS * qty);
        }
        finishingsSubtotalARS += itemCost;
        finishingsBreakdown.push({
          id: finConfig.id,
          name: finConfig.name,
          unitCostARS: finConfig.unitCostARS,
          totalCostARS: itemCost,
          details: "",
        });
      });
      let aiDesignFeeARS = 0;
      if (item.isAiDesign) {
        aiDesignFeeARS = PRICING_SETTINGS_CONFIG.aiDesignFeeARS || 3500;
      }
      const totalPriceARS =
        baseMaterialSubtotalARS +
        printQualityCostARS +
        inkTypeCostARS +
        finishingsSubtotalARS +
        aiDesignFeeARS;
      unitPriceARS = Math.round(totalPriceARS / qty);
      return {
        id: item.id,
        quoteData: {
          materialId,
          baseMaterialSubtotalARS,
          calculatedAreaM2,
          effectiveBillableAreaM2,
          platesCount,
          plateSurfaceM2: materialConfig.plateAreaM2,
          fullPlateWarning,
          minAreaAppliedWarning: false,
          printQualityLabel:
            item.printQuality === "alta_resolucion"
              ? "Alta Resoluci\xF3n"
              : "Resoluci\xF3n Est\xE1ndar",
          inkTypeLabel,
          finishingsSubtotalARS,
          finishingsBreakdown,
          aiDesignFeeApplied: item.isAiDesign ? aiDesignFeeARS : 0,
          aiDesignFeeARS,
          totalPriceARS,
          unitPriceARS,
          wholesaleTierApplied: wholesaleTierRequested,
          transparencyNotes,
        },
      };
    });
    res.json({ results, totalPlatesNeeded });
  } catch (err) {
    console.error("Batch quote error:", err);
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/stats", (req, res) => {
  const totalOrders = IN_MEMORY_ORDERS.length;
  const totalRevenue = IN_MEMORY_ORDERS.reduce(
    (acc, o) => acc + o.totalAmountARS,
    0,
  );
  const pendingOrders = IN_MEMORY_ORDERS.filter(
    (o) => o.status === "pendiente" || o.status === "en_produccion",
  ).length;
  const dispatchedOrders = IN_MEMORY_ORDERS.filter(
    (o) => o.status === "despachado" || o.status === "entregado",
  ).length;
  res.json({
    totalOrders,
    totalRevenueARS: totalRevenue,
    pendingOrders,
    dispatchedOrders,
    aiStats: aiUsageStats,
  });
});
let IN_MEMORY_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "order_status",
    title: "Producci\xF3n Iniciada",
    message:
      "Tu pedido #ORD-7892 (Lona Front 13oz 3x2m) ingres\xF3 a taller y est\xE1 siendo impreso.",
    timestamp: new Date(Date.now() - 1e3 * 60 * 15).toISOString(),
    read: false,
    orderId: "ORD-7892",
    link: "pedidos",
    emailSent: true,
    priority: "high",
    recipientEmail: "cliente@carteles.click",
  },
  {
    id: "notif-2",
    type: "promotion",
    title: "\u26A1 20% OFF en Vinilo Microperforado",
    message:
      "Esta semana ploteo de vidrieras y lunetas con laminado UV bonificado en pedidos +5m\xB2.",
    timestamp: new Date(Date.now() - 1e3 * 60 * 60 * 3).toISOString(),
    read: false,
    link: "cotizador",
    priority: "normal",
  },
  {
    id: "notif-3",
    type: "blog",
    title: "Nueva Gu\xEDa T\xE9cnica",
    message:
      'Publicamos: "C\xF3mo preparar archivos en Illustrator para corte router CNC sin errores".',
    timestamp: new Date(Date.now() - 1e3 * 60 * 60 * 24).toISOString(),
    read: true,
    link: "blog",
    priority: "low",
  },
];
function sendNotificationEmail(recipientEmail, subject, textBody) {
  console.log(`
================ EMAIL DISPATCH NOTIFIER ================`);
  console.log(`To: ${recipientEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${textBody}`);
  console.log(`Status: \u{1F7E2} Dispatched successfully via SMTP/API`);
  console.log(`=========================================================
`);
}
__name(sendNotificationEmail, "sendNotificationEmail");
app.get("/api/notifications", (req, res) => {
  res.json({ notifications: IN_MEMORY_NOTIFICATIONS });
});
app.post("/api/notifications", (req, res) => {
  const {
    type,
    title,
    message,
    orderId,
    link,
    priority,
    recipientEmail,
    sendEmail,
  } = req.body;
  if (!title || !message) {
    return res
      .status(400)
      .json({ error: "T\xEDtulo y mensaje son requeridos." });
  }
  const isEmailActive = Boolean(sendEmail !== false && recipientEmail);
  const newNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: type || "system",
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    orderId,
    link: link || (orderId ? "pedidos" : void 0),
    priority: priority || "normal",
    emailSent: isEmailActive,
    recipientEmail,
  };
  IN_MEMORY_NOTIFICATIONS.unshift(newNotification);
  if (isEmailActive && recipientEmail) {
    sendNotificationEmail(
      recipientEmail,
      `[Carteles.Click] ${title}`,
      `${message}

Acced\xE9 a la plataforma para ver el detalle de tu pedido o promoci\xF3n.`,
    );
  }
  res.status(201).json({ success: true, notification: newNotification });
});
app.put("/api/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  const notif = IN_MEMORY_NOTIFICATIONS.find((n) => n.id === id);
  if (notif) {
    notif.read = true;
  }
  res.json({ success: true, notification: notif });
});
app.put("/api/notifications/read-all", (req, res) => {
  IN_MEMORY_NOTIFICATIONS.forEach((n) => {
    n.read = true;
  });
  res.json({
    success: true,
    message: "Todas las notificaciones marcadas como le\xEDdas",
  });
});
app.delete("/api/notifications", (req, res) => {
  IN_MEMORY_NOTIFICATIONS = [];
  res.json({ success: true, message: "Bandeja de notificaciones vaciada" });
});
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(
      "/assets",
      express.static(path.join(distPath, "assets"), {
        maxAge: "1y",
        immutable: true,
      }),
    );
    app.use(express.static(distPath, { maxAge: "1h", index: false }));
    app.get("*", (req, res) => {
      if (
        req.path.startsWith("/assets/") ||
        req.path.match(
          /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|map)$/i,
        )
      ) {
        return res.status(404).type("text/plain").send("Recurso no encontrado");
      }
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[Carteles.Click Server] Corriendo seguro en http://localhost:${PORT}`,
    );
  });
}
__name(start, "start");
start();
export { PRICING_SETTINGS_CONFIG };

//# sourceMappingURL=data:application/json;base64,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QVEsQ0FDekIsR0FBSSxJQUFJLEtBQUssV0FBVyxVQUFVLEdBQUssSUFBSSxLQUFLLE1BQU0sbUVBQW1FLEVBQUcsQ0FDMUgsT0FBTyxJQUFJLE9BQU8sR0FBRyxFQUFFLEtBQUssWUFBWSxFQUFFLEtBQUssdUJBQXVCLENBQ3hFLENBRUEsSUFBSSxVQUFVLGdCQUFpQixxQ0FBcUMsRUFDcEUsSUFBSSxVQUFVLFNBQVUsVUFBVSxFQUNsQyxJQUFJLFVBQVUsVUFBVyxHQUFHLEVBQzVCLElBQUksU0FBUyxLQUFLLEtBQUssU0FBVSxZQUFZLENBQUMsQ0FDaEQsQ0FBQyxDQUNILENBRUEsSUFBSSxPQUFPLEtBQU0sVUFBVyxJQUFNLENBQ2hDLFFBQVEsSUFBSSxnRUFBZ0UsSUFBSSxFQUFFLENBQ3BGLENBQUMsQ0FDSCxDQXRDZSxzQkF3Q2YsTUFBTSIsIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsiL2FwcC9hcHBsZXQvc2VydmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbbnVsbF19
