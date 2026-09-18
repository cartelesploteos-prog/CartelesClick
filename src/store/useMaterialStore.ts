import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SubMaterial {
  id: string;
  name: string;
  subCategory: string;
  subCategoryLabel: string;
  mode: string;
  costARS: number;
  salePriceARS: number;
  marginPercent: number;
  unitLabel: string;
  stockStatus: string;
  shortDesc: string;
  badge?: string;
  image?: string;
  hasColorPalette?: boolean;
}

export interface ProductCategoryHierarchy {
  id: string;
  name: string;
  slug: string;
  description: string;
  badge?: string;
  iconName: string;
  subCategories: {
    id: string;
    label: string;
    description: string;
    materialIds: string[];
  }[];
}

export interface MaterialData {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  subCategoryLabel?: string;
  mode: string;
  costARS: number;
  salePriceARS: number;
  marginPercent: number;
  unitLabel: string;
  stockStatus: string;
  shortDesc: string;
  description?: string;
  isActive: boolean;
  badge?: string;
  image?: string;
  hasColorPalette?: boolean;
  minAreaM2?: number;
  plateWidthCm?: number;
  plateHeightCm?: number;
  plateAreaM2?: number;
  defaultFinishings?: string[];
  durability?: string;
  lightingType?: string;
  maxWidthCm?: number;
}

export const PRODUCT_CATEGORIES_HIERARCHY: ProductCategoryHierarchy[] = [
  {
    id: "gigantografias",
    name: "Gigantografías",
    slug: "gigantografias",
    description: "Lonas, vinilos y papeles impresos en gran formato para interior y exterior.",
    badge: "Gran Formato",
    iconName: "Maximize2",
    subCategories: [
      {
        id: "lonas",
        label: "Lonas",
        description: "Lonas frontlight, backlight, mesh y blackout resistentes a intemperie.",
        materialIds: ["giganto_lonas", "giganto_lona_front", "giganto_lona_back", "giganto_lona_mesh", "giganto_lona_blackout"],
      },
      {
        id: "vinilos",
        label: "Vinilos",
        description: "Vinilos autoadhesivos calandrados, microperforados, esmerilados y vehiculares.",
        materialIds: ["giganto_vinilos", "giganto_vinilo_micro", "giganto_vinilo_esmerilado", "giganto_vinilo_vehicular"],
      },
      {
        id: "papeles",
        label: "Papeles",
        description: "Papeles fotográficos de alta resolución, citylight para marquesinas y afiches.",
        materialIds: ["giganto_papeles", "giganto_papel_citylight", "giganto_papel_blueback"],
      },
    ],
  },
  {
    id: "carteles",
    name: "Carteles",
    slug: "carteles",
    description: "Bastidores tensados, fondos de prensa y montajes sobre placas rígidas.",
    iconName: "Layers",
    subCategories: [
      {
        id: "bastidores",
        label: "Bastidores Tensados",
        description: "Estructuras metálicas y de madera con lona front, back o blackout.",
        materialIds: ["cartel_bastidor_front", "cartel_bastidor_back", "cartel_fondo_prensa_blackout"],
      },
      {
        id: "rigidos",
        label: "Placas y Rígidos",
        description: "Impresión y montaje sobre PVC espumado, PAI, MDF, Chapa, Foamboard y Corrugado.",
        materialIds: ["cartel_pvc", "cartel_pai", "cartel_mdf", "cartel_chapa", "cartel_foamboard", "cartel_corrugado"],
      },
    ],
  },
  {
    id: "corporeos",
    name: "Corpóreos",
    slug: "corporeos",
    description: "Letras volumétricas y logotipos en relieve tallados en Polyfan, acrílico, MDF, chapa e impresión 3D.",
    badge: "Relieve 3D & Láser",
    iconName: "Box",
    subCategories: [
      {
        id: "polyfan",
        label: "Polyfan",
        description: "Volúmenes livianos y económicos de poliestireno extruido, solos o combinados con PAI y vinilo.",
        materialIds: ["corp_polyfan", "corp_polyfan_pai", "corp_polyfan_pai_vinilo"],
      },
      {
        id: "acrilico",
        label: "Acrílico",
        description: "Acrílicos de color y cristal cortados por láser con terminación de cantos pulidos al fuego.",
        materialIds: ["corp_acrilico_color", "corp_acrilico_cristal"],
      },
      {
        id: "chapa",
        label: "Metal y Chapa",
        description: "Letras block de chapa galvanizada y acero, con frentes de acrílico e iluminación LED opcional.",
        materialIds: ["corp_chapa", "corp_chapa_acrilico", "corp_chapa_acrilico_iluminacion"],
      },
      {
        id: "mdf",
        label: "Madera MDF",
        description: "Corpóreos calados en fibrofácil pulido, ideales para estética cálida interior.",
        materialIds: ["corp_mdf"],
      },
      {
        id: "3d",
        label: "3D y Mixtos",
        description: "Letras y bloques impresos en 3D volumétricos con o sin iluminación interna.",
        materialIds: ["corp_impresos_3d", "corp_impresos_3d_iluminacion", "corp_mixtos"],
      },
    ],
  },
  {
    id: "estampados",
    name: "Estampados",
    slug: "estampados",
    description: "Estampado textil por DTF digital, sublimación de alta penetración y vinilos termotransferibles.",
    iconName: "Shirt",
    subCategories: [
      {
        id: "dtf",
        label: "DTF Textil",
        description: "Direct to Film de ultra alta resolución apto para algodón, poliéster y mezclas.",
        materialIds: ["estampado_dtf"],
      },
      {
        id: "sublimacion",
        label: "Sublimación",
        description: "Transferencia por calor sobre telas de poliéster, tacto cero y máxima solidez al lavado.",
        materialIds: ["estampado_sublimacion"],
      },
      {
        id: "vinilo_termico",
        label: "Vinilo Termotransferible",
        description: "Vinilos térmicos cortados por plotter para dorsales, números y logotipos planos.",
        materialIds: ["estampado_vinilo_corte"],
      },
    ],
  },
  {
    id: "impresion_3d",
    name: "Impresión 3D",
    slug: "impresion_3d",
    description: "Fabricación aditiva de piezas a medida, prototipos industriales y cartelería técnica.",
    badge: "Manufactura Aditiva",
    iconName: "Printer",
    subCategories: [
      {
        id: "piezas",
        label: "Prototipos y Piezas",
        description: "Modelado e impresión de piezas funcionales, repuestos y prototipos en PLA, PETG o ABS.",
        materialIds: ["impresion3d_prototipos"],
      },
      {
        id: "corporeos_3d",
        label: "Corpóreos 3D",
        description: "Logotipos tridimensionales con geometrías complejas, curvas orgánicas y encastres.",
        materialIds: ["impresion3d_corporeos"],
      },
      {
        id: "iluminacion_3d",
        label: "Cuerpos para Iluminación",
        description: "Módulos y letras huecas preparados para alojar circuitos y módulos LED difusores.",
        materialIds: ["impresion3d_iluminacion"],
      },
    ],
  },
];

export const INITIAL_CATEGORIZED_MATERIALS: MaterialData[] = [
  // GIGANTOGRAFÍAS
  {
    id: "giganto_lonas",
    name: "Lonas Front & Backlight",
    category: "gigantografias",
    subCategory: "lonas",
    subCategoryLabel: "Lonas",
    mode: "m2",
    costARS: 9500,
    salePriceARS: 14500,
    marginPercent: 52,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Lonas de 13oz para cartelería tensada y marquesinas.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=400&q=80",
    badge: "Más Vendido",
  },
  {
    id: "giganto_lona_front",
    name: "Lona Frontlight 13oz",
    category: "gigantografias",
    subCategory: "lonas",
    subCategoryLabel: "Lonas",
    mode: "m2",
    costARS: 8800,
    salePriceARS: 13900,
    marginPercent: 58,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Acabado mate o brillante para iluminación frontal.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "giganto_lona_back",
    name: "Lona Backlight Translúcida",
    category: "gigantografias",
    subCategory: "lonas",
    subCategoryLabel: "Lonas",
    mode: "m2",
    costARS: 12000,
    salePriceARS: 18500,
    marginPercent: 54,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Especial para cajas de luz y marquesinas con luz trasera.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80",
    badge: "Retroiluminable",
  },
  {
    id: "giganto_lona_mesh",
    name: "Lona Mesh Microperforada",
    category: "gigantografias",
    subCategory: "lonas",
    subCategoryLabel: "Lonas",
    mode: "m2",
    costARS: 11000,
    salePriceARS: 17200,
    marginPercent: 56,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Permeable al viento para fachadas y obras en altura.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80",
    badge: "Anti-viento",
  },
  {
    id: "giganto_lona_blackout",
    name: "Lona Blackout Doble Faz",
    category: "gigantografias",
    subCategory: "lonas",
    subCategoryLabel: "Lonas",
    mode: "m2",
    costARS: 13500,
    salePriceARS: 21000,
    marginPercent: 55,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Cero paso de luz con núcleo opaco, apta bifaz.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "giganto_vinilos",
    name: "Vinilos Autoadhesivos",
    category: "gigantografias",
    subCategory: "vinilos",
    subCategoryLabel: "Vinilos",
    mode: "m2",
    costARS: 7500,
    salePriceARS: 12500,
    marginPercent: 66,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Ploteos promocionales en acabado brillante o mate.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1572945550740-0156ff18942a?auto=format&fit=crop&w=400&q=80",
    hasColorPalette: true,
  },
  {
    id: "giganto_vinilo_micro",
    name: "Vinilo Microperforado",
    category: "gigantografias",
    subCategory: "vinilos",
    subCategoryLabel: "Vinilos",
    mode: "m2",
    costARS: 10500,
    salePriceARS: 16800,
    marginPercent: 60,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "One-way vision para vidrieras de locales y vehículos.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "giganto_vinilo_esmerilado",
    name: "Vinilo Esmerilado Decorativo",
    category: "gigantografias",
    subCategory: "vinilos",
    subCategoryLabel: "Vinilos",
    mode: "m2",
    costARS: 11000,
    salePriceARS: 17500,
    marginPercent: 59,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Efecto arenado / arenado frosted para privacidad y oficinas.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "giganto_vinilo_vehicular",
    name: "Vinilo Vehicular Fundido (Wrap)",
    category: "gigantografias",
    subCategory: "vinilos",
    subCategoryLabel: "Vinilos",
    mode: "m2",
    costARS: 17000,
    salePriceARS: 26000,
    marginPercent: 53,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Película de alta conformabilidad para rotulación integral.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=400&q=80",
    badge: "Premium Wrap",
  },
  {
    id: "giganto_papeles",
    name: "Papeles Fotográficos & Citylight",
    category: "gigantografias",
    subCategory: "papeles",
    subCategoryLabel: "Papeles",
    mode: "m2",
    costARS: 8000,
    salePriceARS: 13800,
    marginPercent: 72,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Posters, afiches y material publicitario en alta definición.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "giganto_papel_citylight",
    name: "Papel Citylight para Marquesinas",
    category: "gigantografias",
    subCategory: "papeles",
    subCategoryLabel: "Papeles",
    mode: "m2",
    costARS: 9500,
    salePriceARS: 15200,
    marginPercent: 60,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Papel difusor para paneles de vía pública e interiores iluminados.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "giganto_papel_blueback",
    name: "Papel Afiche Blueback",
    category: "gigantografias",
    subCategory: "papeles",
    subCategoryLabel: "Papeles",
    mode: "m2",
    costARS: 5200,
    salePriceARS: 8900,
    marginPercent: 71,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Papel resistente al encolado exterior con reverso opaco.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80",
  },

  // CARTELES
  {
    id: "cartel_bastidor_front",
    name: "Bastidores con Lonas Front",
    category: "carteles",
    subCategory: "bastidores",
    subCategoryLabel: "Bastidores Tensados",
    mode: "m2",
    costARS: 15000,
    salePriceARS: 24500,
    marginPercent: 63,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Estructura metálica o de madera con lona exterior tensada.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80",
    badge: "Estructura Incluida",
  },
  {
    id: "cartel_bastidor_back",
    name: "Bastidores con Lonas Back (Caja de Luz)",
    category: "carteles",
    subCategory: "bastidores",
    subCategoryLabel: "Bastidores Tensados",
    mode: "m2",
    costARS: 20000,
    salePriceARS: 32000,
    marginPercent: 60,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Cartel tensado translúcido para iluminación interna.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cartel_fondo_prensa_blackout",
    name: "Fondos de Prensa en Black Out",
    category: "carteles",
    subCategory: "bastidores",
    subCategoryLabel: "Bastidores Tensados",
    mode: "m2",
    costARS: 18000,
    salePriceARS: 28000,
    marginPercent: 55,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Estructura autoportante anti-reflejo para eventos y sets.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cartel_pvc",
    name: "Carteles sobre PVC Espumado (Sintra)",
    category: "carteles",
    subCategory: "rigidos",
    subCategoryLabel: "Placas y Rígidos",
    mode: "m2",
    costARS: 14000,
    salePriceARS: 22000,
    marginPercent: 57,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Placa rígida liviana e impermeable con vinilo montado.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=400&q=80",
    badge: "Líder en Calidad",
  },
  {
    id: "cartel_pai",
    name: "Carteles sobre PAI (Alto Impacto)",
    category: "carteles",
    subCategory: "rigidos",
    subCategoryLabel: "Placas y Rígidos",
    mode: "m2",
    costARS: 12500,
    salePriceARS: 19500,
    marginPercent: 56,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Resistente a golpes y roturas, ideal para señalética industrial.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cartel_mdf",
    name: "Carteles sobre MDF (Fibrofácil)",
    category: "carteles",
    subCategory: "rigidos",
    subCategoryLabel: "Placas y Rígidos",
    mode: "m2",
    costARS: 10500,
    salePriceARS: 16500,
    marginPercent: 57,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Montado sobre madera compacta para ambientación interior.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cartel_chapa",
    name: "Carteles sobre Chapa Galvanizada",
    category: "carteles",
    subCategory: "rigidos",
    subCategoryLabel: "Placas y Rígidos",
    mode: "m2",
    costARS: 19500,
    salePriceARS: 31000,
    marginPercent: 59,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Chapa lisa galvanizada anticorrosiva para exterior definitivo.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80",
    badge: "Máxima Resistencia",
  },
  {
    id: "cartel_foamboard",
    name: "Carteles sobre Foamboard",
    category: "carteles",
    subCategory: "rigidos",
    subCategoryLabel: "Placas y Rígidos",
    mode: "m2",
    costARS: 11500,
    salePriceARS: 18000,
    marginPercent: 56,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Alma de espuma de poliestireno ultra liviana para exposiciones.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cartel_corrugado",
    name: "Carteles sobre Plástico Corrugado",
    category: "carteles",
    subCategory: "rigidos",
    subCategoryLabel: "Placas y Rígidos",
    mode: "m2",
    costARS: 7200,
    salePriceARS: 11500,
    marginPercent: 60,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Polipropileno alveolar liviano y económico para inmobiliarias.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=400&q=80",
    badge: "Económico",
  },

  // CORPÓREOS
  {
    id: "corp_polyfan",
    name: "Polyfan 3D",
    category: "corporeos",
    subCategory: "polyfan",
    subCategoryLabel: "Polyfan",
    mode: "placa",
    costARS: 22000,
    salePriceARS: 38000,
    marginPercent: 73,
    unitLabel: "placa (125x60cm)",
    stockStatus: "disponible",
    shortDesc: "Poliestireno extruido de alta densidad para letras y logos 3D.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80",
    badge: "Más Solicitado",
  },
  {
    id: "corp_polyfan_pai",
    name: "Polyfan con Frente de PAI",
    category: "corporeos",
    subCategory: "polyfan",
    subCategoryLabel: "Polyfan",
    mode: "placa",
    costARS: 29000,
    salePriceARS: 49000,
    marginPercent: 69,
    unitLabel: "placa",
    stockStatus: "disponible",
    shortDesc: "Volumen de Polyfan con frente rígido de alto impacto brillante.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "corp_polyfan_pai_vinilo",
    name: "Polyfan + PAI más Vinilo",
    category: "corporeos",
    subCategory: "polyfan",
    subCategoryLabel: "Polyfan",
    mode: "placa",
    costARS: 34000,
    salePriceARS: 56000,
    marginPercent: 65,
    unitLabel: "placa",
    stockStatus: "disponible",
    shortDesc: "Polyfan con frente PAI fondeado en vinilo impreso o de color.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "corp_acrilico_color",
    name: "Acrílico Color Corte Láser",
    category: "corporeos",
    subCategory: "acrilico",
    subCategoryLabel: "Acrílico",
    mode: "placa",
    costARS: 52000,
    salePriceARS: 85000,
    marginPercent: 63,
    unitLabel: "placa",
    stockStatus: "disponible",
    shortDesc: "Acrílico macizo de color con bordes pulidos al láser.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80",
    badge: "Láser Óptico",
  },
  {
    id: "corp_acrilico_cristal",
    name: "Acrílico Cristal Transparente",
    category: "corporeos",
    subCategory: "acrilico",
    subCategoryLabel: "Acrílico",
    mode: "placa",
    costARS: 48000,
    salePriceARS: 78000,
    marginPercent: 62,
    unitLabel: "placa",
    stockStatus: "disponible",
    shortDesc: "Transparencia absoluta con efecto vidrio flotante.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "corp_chapa",
    name: "Chapa Galvanizada / Acero Block",
    category: "corporeos",
    subCategory: "chapa",
    subCategoryLabel: "Metal y Chapa",
    mode: "placa",
    costARS: 58000,
    salePriceARS: 95000,
    marginPercent: 64,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Letras block metálicas huecas o macizas de máxima durabilidad.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80",
    badge: "Industria Pesada",
  },
  {
    id: "corp_chapa_acrilico",
    name: "Chapa y Acrílico",
    category: "corporeos",
    subCategory: "chapa",
    subCategoryLabel: "Metal y Chapa",
    mode: "placa",
    costARS: 69000,
    salePriceARS: 115000,
    marginPercent: 67,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Cuerpo de chapa estructurado con frente translúcido de acrílico.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "corp_chapa_acrilico_iluminacion",
    name: "Chapa y Acrílico con Iluminación LED",
    category: "corporeos",
    subCategory: "chapa",
    subCategoryLabel: "Metal y Chapa",
    mode: "placa",
    costARS: 88000,
    salePriceARS: 145000,
    marginPercent: 65,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Iluminación interna LED frontal o contraluz halo.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80",
    badge: "LED Integrado",
  },
  {
    id: "corp_mdf",
    name: "MDF Calado Router / Láser",
    category: "corporeos",
    subCategory: "mdf",
    subCategoryLabel: "Madera MDF",
    mode: "placa",
    costARS: 19000,
    salePriceARS: 32000,
    marginPercent: 68,
    unitLabel: "placa",
    stockStatus: "disponible",
    shortDesc: "Fibrofácil calado con bordes definidos para ambientación.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "corp_impresos_3d",
    name: "Corpóreos Impresos en 3D",
    category: "corporeos",
    subCategory: "3d",
    subCategoryLabel: "3D y Mixtos",
    mode: "placa",
    costARS: 32000,
    salePriceARS: 55000,
    marginPercent: 72,
    unitLabel: "placa / juego",
    stockStatus: "disponible",
    shortDesc: "Letras 3D personalizadas en PLA/PETG de alta definición.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "corp_impresos_3d_iluminacion",
    name: "Impresos 3D con Iluminación LED",
    category: "corporeos",
    subCategory: "3d",
    subCategoryLabel: "3D y Mixtos",
    mode: "placa",
    costARS: 48000,
    salePriceARS: 79000,
    marginPercent: 65,
    unitLabel: "placa / juego",
    stockStatus: "disponible",
    shortDesc: "Cajas 3D con frente acrílico y alojamiento de módulos LED.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80",
    badge: "LED Integrado",
  },
  {
    id: "corp_mixtos",
    name: "Intersecciones Mixtas",
    category: "corporeos",
    subCategory: "3d",
    subCategoryLabel: "3D y Mixtos",
    mode: "placa",
    costARS: 55000,
    salePriceARS: 92000,
    marginPercent: 67,
    unitLabel: "proyecto",
    stockStatus: "disponible",
    shortDesc: "Combinación de acrílico, MDF, chapa y polyfan a medida.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80",
  },

  // ESTAMPADOS
  {
    id: "estampado_dtf",
    name: "Estampado DTF Textil",
    category: "estampados",
    subCategory: "dtf",
    subCategoryLabel: "DTF Textil",
    mode: "metro_lineal",
    costARS: 9800,
    salePriceARS: 16000,
    marginPercent: 63,
    unitLabel: "metro lineal (58cm ancho)",
    stockStatus: "disponible",
    shortDesc: "Direct to Film full color ultra elástico para algodón y sintético.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
    badge: "Tacto Suave",
  },
  {
    id: "estampado_sublimacion",
    name: "Sublimación Textil",
    category: "estampados",
    subCategory: "sublimacion",
    subCategoryLabel: "Sublimación",
    mode: "m2",
    costARS: 8500,
    salePriceARS: 14000,
    marginPercent: 65,
    unitLabel: "m²",
    stockStatus: "disponible",
    shortDesc: "Transferencia térmica permanente para prendas de poliéster y banderas.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "estampado_vinilo_corte",
    name: "Vinilo Termotransferible Textil",
    category: "estampados",
    subCategory: "vinilo_termico",
    subCategoryLabel: "Vinilo Térmico",
    mode: "metro_lineal",
    costARS: 11000,
    salePriceARS: 18500,
    marginPercent: 68,
    unitLabel: "metro lineal",
    stockStatus: "disponible",
    shortDesc: "Vinilo de corte por calor para dorsales, números y logos planos.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80",
  },

  // IMPRESIÓN 3D
  {
    id: "impresion3d_prototipos",
    name: "Prototipos y Piezas a Medida",
    category: "impresion_3d",
    subCategory: "piezas",
    subCategoryLabel: "Prototipos y Piezas",
    mode: "unidad",
    costARS: 6800,
    salePriceARS: 12000,
    marginPercent: 76,
    unitLabel: "unidad / pieza",
    stockStatus: "disponible",
    shortDesc: "Fabricación aditiva en PLA, PETG o ABS para piezas funcionales y repuestos.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
    badge: "Tolerancia ±0.15mm",
  },
  {
    id: "impresion3d_corporeos",
    name: "Letras y Logos Volumétricos 3D",
    category: "impresion_3d",
    subCategory: "corporeos_3d",
    subCategoryLabel: "Corpóreos 3D",
    mode: "unidad",
    costARS: 11500,
    salePriceARS: 19500,
    marginPercent: 70,
    unitLabel: "unidad / letra",
    stockStatus: "disponible",
    shortDesc: "Isotipos tridimensionales con curvaturas compuestas y encastres.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "impresion3d_iluminacion",
    name: "Cajas y Módulos 3D para LED",
    category: "impresion_3d",
    subCategory: "iluminacion_3d",
    subCategoryLabel: "Cuerpos para Iluminación",
    mode: "unidad",
    costARS: 14000,
    salePriceARS: 24000,
    marginPercent: 71,
    unitLabel: "unidad",
    stockStatus: "disponible",
    shortDesc: "Chasis 3D diseñados para fijación directa de tiras y placas LED.",
    isActive: true,
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80",
    badge: "LED Ready",
  },
];

interface MaterialState {
  categories: ProductCategoryHierarchy[];
  materials: MaterialData[];
  lastFetched: number | null;
  catalogVersion: number | null;
  isLoading: boolean;
  error: string | null;
  fetchMaterials: (forceRefresh?: boolean) => Promise<void>;
  getMaterialsByCategory: (category: string) => MaterialData[];
  getSubMaterials: (category: string, subCategory?: string) => MaterialData[];
  getMaterialById: (id: string) => MaterialData | undefined;
  invalidateCache: () => void;
}

const CACHE_DURATION_MS = 1000 * 60 * 60 * 24; // 24 hours

export const useMaterialStore = create<MaterialState>()(
  persist(
    (set, get) => ({
      categories: PRODUCT_CATEGORIES_HIERARCHY,
      materials: INITIAL_CATEGORIZED_MATERIALS,
      lastFetched: null,
      catalogVersion: null,
      isLoading: false,
      error: null,

      fetchMaterials: async (forceRefresh = false) => {
        const { lastFetched, materials, catalogVersion } = get();
        const now = Date.now();

        set({ isLoading: true, error: null });

        try {
          // Check version first
          const versionRes = await fetch('/api/products/version');
          let serverVersion = null;
          if (versionRes.ok) {
            const versionData = await versionRes.json();
            serverVersion = versionData.version;
          }

          // Use cache if not forced, version matches, and within cache duration
          if (!forceRefresh && lastFetched && (now - lastFetched < CACHE_DURATION_MS) && materials.length > 0 && serverVersion === catalogVersion) {
            set({ isLoading: false });
            return;
          }

          const res = await fetch('/api/products');
          if (!res.ok) throw new Error('Error fetching materials');
          const data = await res.json();
          
          // Merge server products with categorized metadata if present
          const serverProducts: MaterialData[] = data.products || [];
          const mergedMaterials = INITIAL_CATEGORIZED_MATERIALS.map(initial => {
            const serverMatch = serverProducts.find(p => p.id === initial.id);
            return serverMatch ? { ...initial, ...serverMatch } : initial;
          });

          // Add any new products from server not in initial list
          serverProducts.forEach(sp => {
            if (!mergedMaterials.some(m => m.id === sp.id)) {
              mergedMaterials.push(sp);
            }
          });

          set({ 
            materials: mergedMaterials, 
            lastFetched: now,
            catalogVersion: serverVersion,
            isLoading: false 
          });
        } catch (err: any) {
          // Keep initial categorized materials on error
          set({ error: err.message, isLoading: false });
        }
      },

      getMaterialsByCategory: (category: string) => {
        const { materials } = get();
        return materials.filter(m => m.category === category);
      },

      getSubMaterials: (category: string, subCategory?: string) => {
        const { materials } = get();
        return materials.filter(m => {
          if (m.category !== category) return false;
          if (!subCategory || subCategory === "all") return true;
          return m.subCategory === subCategory;
        });
      },

      getMaterialById: (id: string) => {
        const { materials } = get();
        return materials.find(m => m.id === id);
      },

      invalidateCache: () => {
        set({ lastFetched: null });
      }
    }),
    {
      name: 'carteles-material-cache-v2',
    }
  )
);

