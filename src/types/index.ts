export type MainFamilyType = "carteles" | "estampados" | "corporeos";
export type MaterialCategory = "lonas" | "vinilos" | "rigidos" | "portabanners" | "insumos" | "estructuras" | "estampados" | "corporeos" | "carteles";
export type CalculationMode = "m2" | "unidad" | "placa" | "metro_lineal";

export type CustomerType = "agencia" | "imprenta" | "cartelero" | "comun";
export type OrderPriority = "urgente" | "alta" | "normal" | "baja";

export type PrintQualityType = "estandar" | "alta_resolucion";
export type InkType = "solvente" | "uv" | "directa_uv";

export interface VinylColorOption {
  id: string;
  name: string;
  hex: string;
  textColor?: string;
  family: "blanco_negro" | "rojos" | "azules" | "amarillos_naranjas" | "verdes" | "metalizados_especiales";
}

export interface MountOption {
  type: "mdf" | "pvc" | "pai" | "chapa";
  typeName: string;
  thickness: string;
  pricePerM2ARS: number;
}

export interface MaterialOption {
  id: string;
  name: string;
  category: MaterialCategory;
  mode: CalculationMode;
  description: string;
  shortDesc: string;
  recommendedUses: string[];
  minAreaM2?: number;
  hasColorPalette?: boolean;
  plateDimensions?: { widthCm: number; heightCm: number; areaM2: number };
  linearDimensions?: { rollWidthCm: number; maxRollLengthM: number };
  hasDoubleSidedOption?: boolean;
  defaultFinishings?: string[];
  badge?: string;
  image: string;
  durability: string;
  resistance: string;
  printTechnology: string;
  lightingType: string;
  sampleImages?: string[];
}
export type FinishingType =
  | "rollo"
  | "refilado"
  | "bolsillos_portabanner"
  | "refuerzo_perimetral"
  | "ojales_50cm"
  | "ojales_vertices"
  | "panos"
  | "montado_mdf"
  | "montado_pvc"
  | "montado_pai"
  | "montado_chapa"
  | "refilado_escuadra"
  | "troquelado_cnc"
  | "agujereado_fijaciones"
  | "despuntado_redondeado"
  | "corte_a_medida"
  | "soldado_termico"
  | "laminado_protector"
  | string;

export type FinishingCalculationType =
  | "fijo"
  | "metro_perimetral"
  | "metro_lineal_ancho"
  | "m2"
  | "por_unidad";

export interface FinishingOption {
  id: FinishingType;
  name: string;
  description: string;
  applicableCategories: MaterialCategory[];
  basePriceARS?: number;
  calculationType?: FinishingCalculationType;
  priceDescription?: string;
}

export interface FinishingBreakdownItem {
  id: string;
  name: string;
  priceARS?: number;
  unitCostARS?: number;
  totalCostARS?: number;
  details: string;
  // Aliases for compatibility
  finishingId?: string;
  subtotalARS?: number;
  description?: string;
}

export interface PricingSettingsConfig {
  aiDesignFeeARS: number;
  finishings: Record<
    string,
    {
      id: string;
      name: string;
      category: string;
      calculationType: FinishingCalculationType;
      unitCostARS: number;
      description: string;
    }
  >;
}

export interface QuoteRequestPayload {
  materialId: string;
  widthCm?: number;
  heightCm?: number;
  quantity: number;
  printQuality?: PrintQualityType;
  inkType?: InkType;
  selectedColor?: string;
  mountOption?: MountOption;
  finishings?: FinishingType[];
  isAiDesign?: boolean;
  wholesaleTierRequested?: "inicio" | "agencia" | "partner";
  customNotes?: string;
}

export interface QuoteResponsePayload {
  materialId: string;
  materialName: string;
  mode: CalculationMode;
  widthCm?: number;
  heightCm?: number;
  quantity: number;
  printQuality?: PrintQualityType;
  printQualityLabel?: string;
  printQualityCostARS?: number;
  inkType?: InkType;
  inkTypeLabel?: string;
  inkTypeCostARS?: number;
  selectedColor?: string;
  mountOption?: MountOption;
  mountCostARS?: number;
  calculatedAreaM2?: number;
  effectiveBillableAreaM2?: number;
  platesCount?: number;
  plateSurfaceM2?: number;
  fullPlateWarning?: boolean;
  minAreaAppliedWarning?: boolean;
  baseMaterialSubtotalARS?: number;
  finishingsSubtotalARS?: number;
  finishingsBreakdown?: FinishingBreakdownItem[];
  aiDesignFeeARS?: number;
  hasAiDesign?: boolean;
  unitPriceARS: number;
  subtotalARS: number;
  discountPercentage: number;
  discountAmountARS: number;
  totalPriceARS: number;
  finishingsSummary: string[];
  transparencyNotes: string[];
  timestamp: string;
}

export type OrderStatus =
  "pendiente" | "en_produccion" | "terminaciones" | "despachado" | "entregado";

export interface CartItem {
  id: string;
  materialId: string;
  materialName: string;
  category: MaterialCategory;
  mode: CalculationMode;
  widthCm?: number;
  heightCm?: number;
  quantity: number;
  unitPriceARS: number;
  totalPriceARS: number;
  baseMaterialSubtotalARS?: number;
  finishingsSubtotalARS?: number;
  finishingsBreakdown?: FinishingBreakdownItem[];
  aiDesignFeeARS?: number;
  hasAiDesign?: boolean;
  printQuality?: PrintQualityType;
  printQualityLabel?: string;
  inkType?: InkType;
  inkTypeLabel?: string;
  selectedColor?: string;
  mountOption?: MountOption;
  finishings: FinishingType[];
  customLabel?: string;
  batchGroupId?: string;
  fileAttachment?: {
    name: string;
    sizeBytes?: number;
    type?: string;
    previewUrl?: string;
    driveUrl?: string;
    isDriveFolder?: boolean;
  };
  posterDesignData?: PosterDesignState;
  transparencyNotes?: string[];
  createdAt: string;
}

export type ShippingMethod =
  "retiro_taller" | "instantaneo" | "ronda_semanal" | "a_despacho";
export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  priority?: OrderPriority;
  customerType?: CustomerType;
  customerName: string;
  customerCompany?: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  shippingMethod: ShippingMethod;
  shippingFeeARS: number;
  totalAmountARS: number;
  paymentMethod: "mercadopago" | "transferencia";
  paymentStatus: "acreditado" | "pendiente";
  trackingUrl?: string;
  estimatedDelivery?: string;
  internalNotes?: string;
  promisedDate?: string;
  totalM2?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  readTime: string;
  date: string;
  tag: string;
  image: string;
  author: string;
  published: boolean;
  featured?: boolean;
  viewsCount?: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  category: MaterialCategory;
  mode: CalculationMode;
  costARS: number;
  salePriceARS: number;
  marginPercent: number; // e.g. 100%
  unitLabel: string; // "m²", "metro lineal", "unidad", "placa"
  minAreaM2?: number;
  plateWidthCm?: number;
  plateHeightCm?: number;
  linearWidthCm?: number;
  stockStatus: "disponible" | "stock_bajo" | "sin_stock" | "a_pedido";
  shortDesc: string;
  badge?: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface AdminPeriodMetrics {
  period: "semanal" | "mensual" | "anual" | "historico";
  totalRevenueARS: number;
  totalOrders: number;
  totalM2: number;
  totalLinearM: number;
  totalUnits: number;
  totalPlates: number;
  averageTicketARS: number;
  completedOrders: number;
  pendingOrders: number;
  urgentOrders: number;
  revenueByCustomerType: {
    agencia: number;
    imprenta: number;
    cartelero: number;
    comun: number;
  };
  ordersByCustomerType: {
    agencia: number;
    imprenta: number;
    cartelero: number;
    comun: number;
  };
  revenueByCategory: {
    lonas: number;
    vinilos: number;
    rigidos: number;
    portabanners: number;
    insumos?: number;
    estructuras?: number;
  };
  topMaterials: { name: string; mode: string; quantityOrM2: number; revenueARS: number }[];
  timeline: { label: string; revenueARS: number; ordersCount: number; m2: number }[];
}
export type PosterBackgroundMode = "solid" | "gradient" | "image";
export type PosterPatternType =
  | "none"
  | "dots"
  | "grid"
  | "diagonal"
  | "crosshatch"
  | "halftone"
  | "blueprint"
  | "stripes"
  | "canvas";

export interface PosterGradientConfig {
  type: "linear" | "radial";
  color1: string;
  color2: string;
  angle: number; // 0, 45, 90, 135, 180, 270
  presetId?: string;
}

export interface PosterForegroundElement {
  id: string;
  type: "image" | "badge" | "sticker" | "text";
  url?: string;
  title?: string;
  text?: string;
  x: number; // percentage 0 to 100
  y: number; // percentage 0 to 100
  scale: number; // 0.3 to 3.0
  rotation: number; // -180 to 180
  badgeStyle?: "brick" | "graphite" | "concrete" | "craft" | "dark" | "light";
  shape?: "pill" | "circle" | "badge" | "ribbon";
  // Custom text attributes when type === "text"
  fontSize?: number; // base font size in px/rem
  color?: string;
  fontFamily?: "sans" | "serif" | "display" | "mono";
  fontWeight?: "normal" | "medium" | "bold" | "black";
  align?: "left" | "center" | "right";
  textRole?: "headline" | "subheadline" | "body" | "contact" | "custom";
}

export interface PosterDesignState {
  headline: string;
  subheadline: string;
  bodyText: string;
  contactAddress: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactInstagram: string;
  fontHeading: "sans" | "serif" | "display" | "mono";
  alignment: "left" | "center" | "right";
  themePalette: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  outputFormat: string;
  // Medidas especiales y espesores
  customWidthCm?: number;
  customHeightCm?: number;
  selectedThickness?: string; // "3 mm" | "5 mm" | "1 mm" | "2 mm"
  // Fondos avanzados, degradé y patrones
  backgroundMode?: PosterBackgroundMode;
  gradientConfig?: PosterGradientConfig;
  texture: PosterPatternType;
  textureOpacity?: number;
  // Imágenes de fondo
  backgroundImageUrl?: string;
  backgroundImageOpacity?: number;
  backgroundImageBlur?: number;
  backgroundImageFilter?: "none" | "darken" | "grayscale" | "warm" | "cool";
  // Imágenes y objetos en el frente (arrastrables)
  foregroundElements?: PosterForegroundElement[];
  logoUrl?: string;
  heroImageUrl?: string;
  aiGeneratedPrompt?: string;
}
export interface DictionaryTerm {
  slug: string;
  term: string;
  shortDefinition: string;
  fullExplanation: string;
  technicalImpact: string;
  goodPractice: string;
  relatedMaterials: string[];
}
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "cotizacion" | "archivos" | "produccion" | "envios" | "garantia";
}
export interface WholesaleTier {
  id: string;
  name: string;
  minMonthlyM2: number;
  discountPercent: number;
  benefits: string[];
  highlight?: boolean;
}
export interface GeoCoordinatesConfig {
  latitude: number | null;
  longitude: number | null;
}
export interface PostalAddressConfig {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}
export interface OpeningHoursConfig {
  dayOfWeek: (
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday"
  )[];
  opens: string;
  closes: string;
}
export interface LocalBusinessConfig {
  businessName: string;
  legalName?: string;
  telephone: string | null;
  email: string;
  url: string;
  logo: string;
  image: string[];
  priceRange: string;
  currenciesAccepted: string;
  paymentAccepted: string[];
  address: PostalAddressConfig;
  geo: GeoCoordinatesConfig;
  openingHours: OpeningHoursConfig[];
  areaServed: {
    geoMidpoint?: GeoCoordinatesConfig;
    geoRadiusKm?: number;
    citiesOrNeighborhoods: string[];
    country: string;
  };
  hasOfferCatalog?: {
    name: string;
    itemListElement: { name: string; description: string }[];
  };
}
