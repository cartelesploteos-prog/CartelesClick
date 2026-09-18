// Core Type Definitions for Carteles Click 3D

export type MaterialCategory =
  | "gigantografias"
  | "carteles"
  | "corporeos"
  | "estampados"
  | "impresion_3d"
  | "todos";

export type CalculationMode = "m2" | "metro_lineal" | "placa" | "unidad";

export type MainFamilyType = MaterialCategory;

export type FinishingType = string;

export type CustomerType =
  | "consumidor_final"
  | "gremio"
  | "agencia"
  | "corporativo"
  | "imprenta"
  | "cartelero";

export type OrderPriority = "baja" | "normal" | "alta" | "urgente" | "express";

export type OrderStatus =
  | "recibido"
  | "diseno"
  | "preprensa"
  | "impresion"
  | "terminacion"
  | "control_calidad"
  | "empaquetado"
  | "listo_entrega"
  | "en_viaje"
  | "entregado"
  | "cancelado"
  | "despachado"
  | "en_produccion"
  | "terminaciones"
  | "pendiente";

export type ShippingMethod =
  | "retiro_taller"
  | "envio_caba"
  | "envio_gba"
  | "expreso_interior"
  | "a_despacho"
  | "instantaneo"
  | "ronda_semanal";

export type PrintQualityType = "estandar" | "alta_resolucion" | "fotografica";

export type InkType = "solvente" | "uv" | "directa_uv" | "latex";

export interface MaterialOption {
  id: string;
  name: string;
  category: MaterialCategory;
  subCategory?: string;
  mode: CalculationMode;
  shortDesc: string;
  description?: string;
  costARS?: number;
  salePriceARS?: number;
  marginPercent?: number;
  recommendedUses: string[];
  durability?: string;
  resistance?: string;
  printTechnology?: string;
  lightingType?: string;
  image?: string;
  badge?: string;
  defaultFinishings?: string[];
  unitLabel?: string;
  minAreaM2?: number;
  plateWidthCm?: number;
  plateHeightCm?: number;
  plateAreaM2?: number;
  plateDimensions?: { widthCm: number; heightCm: number; areaM2: number };
  linearWidthCm?: number;
  linearDimensions?: { widthCm?: number; rollWidthCm?: number; maxRollLengthM?: number };
  hasDoubleSidedOption?: boolean;
  sampleImages?: string[];
  hasColorPalette?: boolean;
  stockStatus?: "disponible" | "a_pedido" | "agotado" | "stock_bajo";
  isActive?: boolean;
}

export interface ProductCategorySubCategory {
  id: string;
  name?: string;
  label: string;
  description: string;
  materialIds: string[];
}

export interface ProductCategoryHierarchy {
  id: MaterialCategory;
  name: string;
  slug: string;
  description: string;
  badge?: string;
  iconName: string;
  subCategories: ProductCategorySubCategory[];
}

export interface FinishingOption {
  id: string;
  name: string;
  category?: MaterialCategory | "todos";
  applicableCategories?: (MaterialCategory | "todos")[];
  calculationType: "fijo" | "metro_lineal_ancho" | "metro_perimetral" | "m2";
  unitCostARS?: number;
  description: string;
  priceDescription?: string;
  basePriceARS?: number;
}

export interface DictionaryTerm {
  slug: string;
  title?: string;
  term?: string;
  category?: string;
  shortDef?: string;
  shortDefinition?: string;
  fullDef?: string;
  fullExplanation?: string;
  technicalImpact?: string;
  goodPractice?: string;
  tips?: string[];
  relatedMaterials?: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface WholesaleTier {
  id: string;
  name: string;
  minMonthlyM2: number;
  discountPercent: number;
  benefits: string[];
  badge?: string;
  highlight?: boolean;
}

export interface VinylColorOption {
  id: string;
  name: string;
  hex: string;
  textColor: string;
  family: string;
}

export interface MountOption {
  type: "mdf" | "pvc" | "pai" | "chapa";
  typeName: string;
  thickness: string;
  pricePerM2ARS: number;
  thicknesses?: { label: string; thickness: string; pricePerM2ARS: number }[];
}

export interface CartItem {
  id: string;
  materialId: string;
  materialName: string;
  mode?: CalculationMode;
  widthCm?: number;
  heightCm?: number;
  quantity: number;
  printQuality?: PrintQualityType;
  printQualityLabel?: string;
  inkType?: InkType;
  inkTypeLabel?: string;
  selectedColor?: string;
  mountOption?: MountOption;
  finishings?: string[];
  finishingsSummary?: string[];
  finishingsBreakdown?: any[];
  baseMaterialSubtotalARS?: number;
  unitPriceARS: number;
  totalPriceARS: number;
  hasAiDesign?: boolean;
  aiDesignFeeARS?: number;
  fileAttachment?: {
    name?: string;
    size?: number;
    sizeBytes?: number;
    previewUrl?: string;
    driveUrl?: string;
    isDriveFolder?: boolean;
    type?: string;
  };
  posterDesignData?: {
    headline?: string;
    subheadline?: string;
    bodyText?: string;
    ctaText?: string;
    templateId?: string;
    heroImageUrl?: string;
    backgroundColor?: string;
    accentColor?: string;
    foregroundElements?: any[];
    customWidthCm?: number;
    customHeightCm?: number;
    [key: string]: any;
  };
  transparencyNotes?: string[];
  [key: string]: any;
}

export interface OrderItem extends CartItem {}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  userEmail?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCompany?: string;
  customerType?: CustomerType;
  items: CartItem[];
  subtotalARS: number;
  totalM2?: number;
  shippingMethod: ShippingMethod;
  shippingFeeARS: number;
  discountARS?: number;
  totalPriceARS: number;
  totalAmountARS?: number;
  status: OrderStatus;
  priority: OrderPriority;
  promisedDate?: string;
  createdAt: string;
  updatedAt?: string;
  paymentMethod?: "mercadopago" | "transferencia" | "efectivo";
  paymentStatus?: "pendiente" | "aprobado" | "rechazado" | "acreditado";
  trackingCode?: string;
  notes?: string;
  internalNotes?: string;
  files?: string[];
  driveFolderUrl?: string;
  auditLog?: {
    date: string;
    action: string;
    user: string;
    details?: string;
  }[];
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
  finishingsBreakdown?: {
    id: string;
    name: string;
    unitCostARS?: number;
    totalCostARS?: number;
    subtotalARS?: number;
    finishingId?: string;
    details?: string;
    [key: string]: any;
  }[];
  aiDesignFeeARS?: number;
  hasAiDesign?: boolean;
  unitPriceARS: number;
  subtotalARS: number;
  discountPercentage?: number;
  discountAmountARS?: number;
  totalPriceARS: number;
  finishingsSummary: string[];
  transparencyNotes: string[];
  timestamp: string;
}

export type PosterPatternType = string;
export type PosterBackgroundMode = string;
export interface PosterForegroundElement {
  id: string;
  type?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  content?: string;
  [key: string]: any;
}

export interface PosterDesignState {
  headline: string;
  subheadline: string;
  bodyText: string;
  ctaText?: string;
  themeStyle?: string;
  aspectRatio?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  heroImageUrl?: string;
  themePalette?: string;
  texture?: string;
  backgroundImageUrl?: string;
  backgroundImageOpacity?: number;
  backgroundImageFilter?: string;
  alignment?: any;
  outputFormat?: string;
  backgroundMode?: string;
  gradientConfig?: any;
  foregroundElements?: any[];
  [key: string]: any;
}

export interface AdminProduct extends MaterialOption {
  marginPercent: number;
  costARS: number;
  salePriceARS: number;
}

export interface AdminPeriodMetrics {
  totalOrders: number;
  totalRevenueARS: number;
  averageTicketARS: number;
  topMaterials: { name: string; count: number; revenueARS: number; mode?: any; quantityOrM2?: any; [key: string]: any }[];
  statusBreakdown: Record<string, number>;
  totalM2?: number;
  totalPlates?: number;
  totalUnits?: number;
  urgentOrders?: number;
  revenueByCustomerType?: Record<string, number>;
  timeline?: any[];
  [key: string]: any;
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
