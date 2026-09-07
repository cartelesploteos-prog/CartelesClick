import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calculator,
  Layers,
  Scissors,
  Upload,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Info,
  ShieldCheck,
  FileCheck,
  Package,
  Eye,
  Palette,
  Printer,
  Sparkle,
  Check,
  Plus,
  Trash2,
  Copy,
  FileUp,
  FileText,
  ListPlus,
  AlertCircle,
  ExternalLink,
  Folder,
  FolderPlus,
  UploadCloud,
  X,
  RefreshCw,
  Shirt,
  Box,
  LayoutGrid,
  Building2,
  Download,
  FileSpreadsheet,
  Maximize2,
  Clock,
  Sun,
  Ruler,
  AlertTriangle,
  Paperclip,
} from "lucide-react";
import { IconBadge } from "../ui/IconBadge";
import {
  MATERIALS_CATALOG,
  FINISHING_OPTIONS,
  VINYL_COLOR_PALETTE,
  MOUNT_OPTIONS,
} from "../../data/materials";
import {
  MainFamilyType,
  MaterialCategory,
  FinishingType,
  QuoteResponsePayload,
  PrintQualityType,
  InkType,
  MountOption,
  CartItem,
} from "../../types";
import { validateQuoteParams } from "../../utils/validation";
import { generateQuotePdf } from "../../utils/generateQuotePdf";
import { useCartStore } from "../../store/useCartStore";
import { useCurrencyStore } from "../../store/useCurrencyStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useTranslation } from "react-i18next";
import { CurrencySelector } from "../ui/CurrencySelector";
import { GoogleDriveAttachment } from "../ui/GoogleDriveAttachment";
import {
  QuoteLiveSummarySkeleton,
  QuotePriceSkeleton,
  BulkCalculationSkeleton,
  QuoteTableSkeleton,
} from "../ui/Skeleton";
import { AiDesignDrawer, GeneratedDesignPayload } from "../AiDesignDrawer";
import { BorderBeam } from "../ui/BorderBeam";
import { CTAButton } from "../ui/CTAButton";
import { triggerBrindisCelebration } from "../ui/ToastCelebration";
import { RigidMaterialsSelector } from "../cotizador/RigidMaterialsSelector";
import { AddToCartButton } from "../ui/AddToCartButton";
import { PrintReadinessChecklist } from "../ui/PrintReadinessChecklist";

export interface BulkOrderItem {
  id: string;
  label: string;
  widthCm: number;
  heightCm: number;
  quantity: number;
  materialId?: string;
  printQuality?: PrintQualityType;
  inkType?: InkType;
  selectedColor?: string;
  mountOption?: MountOption;
  fileAttachment?: {
    name: string;
    sizeBytes?: number;
    type?: string;
    previewUrl?: string;
    driveUrl?: string;
    isDriveFolder?: boolean;
  };
  isAiDesign?: boolean;
  finishings?: FinishingType[];
  quoteData?: QuoteResponsePayload | null;
  isLoading?: boolean;
  error?: string | null;
}

interface CotizadorViewProps {
  initialMaterialId?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const CotizadorView: React.FC<CotizadorViewProps> = ({
  initialMaterialId,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const { addItem, addItems } = useCartStore();
  const { formatPrice, currency } = useCurrencyStore();

  // Wizard state: 1 to 7
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Main Family selection (Paso 1: Estampados, Carteles, Corpóreos)
  const [selectedMainFamily, setSelectedMainFamily] = useState<MainFamilyType>("carteles");

  // Category selection (Subcategoría)
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory>("lonas");

  // Material selection
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    initialMaterialId || "lona_front_13oz"
  );

  // Color selection for vinyls with palettes
  const [selectedColor, setSelectedColor] = useState<string>("010 Blanco Brillante");

  // MODE: 'individual' vs 'bulk' (Pedido por lotes)
  const [orderMode, setOrderMode] = useState<"individual" | "bulk">("individual");

  // Individual mode: Dimensions and quantity
  const [widthCm, setWidthCm] = useState<number>(200);
  const [heightCm, setHeightCm] = useState<number>(100);
  const [quantity, setQuantity] = useState<number>(1);

  // Bulk mode: List of multiple measures, quantities and attachments with persistent draft
  const [bulkItems, setBulkItems] = useState<BulkOrderItem[]>(() => {
    try {
      const saved = localStorage.getItem("cartelesclick_bulk_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: "item-1",
        label: "Medida 1",
        widthCm: 200,
        heightCm: 100,
        quantity: 1,
      },
    ];
  });

  // Save bulkItems changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cartelesclick_bulk_draft", JSON.stringify(bulkItems));
    } catch (e) {}
  }, [bulkItems]);

  // Modal state for attaching design to a specific bulk item
  const [activeAttachItem, setActiveAttachItem] = useState<BulkOrderItem | null>(null);
  const [attachTab, setAttachTab] = useState<"file" | "drive" | "ai">("file");
  const [tempDriveUrl, setTempDriveUrl] = useState<string>("");
  const [tempDriveName, setTempDriveName] = useState<string>("");
  const [isDriveFolder, setIsDriveFolder] = useState<boolean>(false);

  // Quality & Inks
  const [printQuality, setPrintQuality] = useState<PrintQualityType>("estandar");
  const [inkType, setInkType] = useState<InkType>("solvente");
  const [includeScrapPacked, setIncludeScrapPacked] = useState<boolean>(false);

  // Finishings & Mounting
  const [selectedFinishings, setSelectedFinishings] = useState<FinishingType[]>([
    "rollo",
    "refilado",
  ]);
  const [selectedMount, setSelectedMount] = useState<MountOption | undefined>(undefined);
  const [enableMounting, setEnableMounting] = useState<boolean>(false);

  // Single mode: File upload & Google Drive state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null);
  const [driveAttachment, setDriveAttachment] = useState<{
    driveUrl: string;
    name: string;
    isDriveFolder: boolean;
  } | null>(null);

  // Single mode server quote response & loading
  const [quoteData, setQuoteData] = useState<QuoteResponsePayload | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const handleDownloadQuotePdf = () => {
    setIsGeneratingPdf(true);
    try {
      if (orderMode === "bulk") {
        generateQuotePdf({
          quote: quoteData || {
            materialId: selectedMaterialId,
            materialName: currentMaterial?.name || "Lote de Producción Mayorista",
            mode: currentMaterial?.mode || "m2",
            quantity: bulkSummary.totalUnits,
            unitPriceARS: Math.round(bulkSummary.totalPriceARS / (bulkSummary.totalUnits || 1)),
            subtotalARS: bulkSummary.totalPriceARS,
            totalPriceARS: bulkSummary.totalPriceARS,
            discountPercentage: 0,
            discountAmountARS: 0,
            finishingsSummary: [],
            transparencyNotes: [
              `Lote consolidado de ${bulkItems.length} cortes independientes.`,
              `Superficie total acumulada: ${bulkSummary.totalM2} m².`,
              `Total de piezas: ${bulkSummary.totalUnits} unidades.`,
            ],
            timestamp: new Date().toISOString(),
          },
          bulkItems: bulkItems.map((b) => ({
            label: b.label,
            widthCm: b.widthCm,
            heightCm: b.heightCm,
            quantity: b.quantity,
            materialName: b.materialId
              ? MATERIALS_CATALOG.find((m) => m.id === b.materialId)?.name || currentMaterial?.name
              : currentMaterial?.name,
            unitPriceARS: b.quoteData?.unitPriceARS || 0,
            totalPriceARS: b.quoteData?.totalPriceARS || 0,
            finishingsSummary: b.finishings?.map((f) => f.replace(/_/g, " ")),
          })),
        });
      } else if (quoteData) {
        generateQuotePdf({
          quote: quoteData,
        });
      }
      triggerBrindisCelebration({
        title: "¡Presupuesto PDF Descargado!",
        message: "Se generó y descargó tu cotización oficial de taller con validez por 15 días.",
      });
    } catch (err) {
      console.error("Error al generar PDF de cotización:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // AI Design Drawer & Attachment State
  const [isAiDesignDrawerOpen, setIsAiDesignDrawerOpen] = useState<boolean>(false);
  const [attachedAiDesign, setAttachedAiDesign] = useState<GeneratedDesignPayload | null>(null);

  const handleApplyAiDesign = (design: GeneratedDesignPayload) => {
    setAttachedAiDesign(design);
    if (activeAttachItem) {
      setBulkItems((prev) =>
        prev.map((it) =>
          it.id === activeAttachItem.id
            ? { ...it, isAiDesign: true, fileAttachment: { name: `Póster IA: ${design.headline}` } }
            : it
        )
      );
      setActiveAttachItem(null);
    }
  };

  // If initialMaterialId is passed, match main family, category and material
  useEffect(() => {
    if (initialMaterialId) {
      const found = MATERIALS_CATALOG.find((m) => m.id === initialMaterialId);
      if (found) {
        if (found.category === "estampados") {
          setSelectedMainFamily("estampados");
        } else if (found.category === "corporeos") {
          setSelectedMainFamily("corporeos");
        } else {
          setSelectedMainFamily("carteles");
        }
        setSelectedCategory(found.category);
        setSelectedMaterialId(found.id);
        if (found.defaultFinishings) {
          setSelectedFinishings(found.defaultFinishings as FinishingType[]);
        }
      }
    }
  }, [initialMaterialId]);

  const currentMaterial =
    MATERIALS_CATALOG.find((m) => m.id === selectedMaterialId) || MATERIALS_CATALOG[0];

  // Adjust default ink based on category
  useEffect(() => {
    if (selectedCategory === "rigidos") {
      setInkType("directa_uv");
    } else if (inkType === "directa_uv") {
      setInkType("uv");
    }
  }, [selectedCategory]);

  // Sync single mode inputs with first bulk item when switching
  const handleSwitchToBulk = () => {
    setOrderMode("bulk");
    if (bulkItems.length === 0) {
      setBulkItems([
        {
          id: `item-${Date.now()}`,
          label: "Medida 1",
          widthCm,
          heightCm,
          quantity,
          fileAttachment: uploadedFileName
            ? { name: uploadedFileName, sizeBytes: uploadedFileSize || 0 }
            : driveAttachment
            ? { ...driveAttachment }
            : undefined,
        },
      ]);
    }
  };

  const handleSwitchToIndividual = () => {
    setOrderMode("individual");
    if (bulkItems.length > 0) {
      setWidthCm(bulkItems[0].widthCm);
      setHeightCm(bulkItems[0].heightCm);
      setQuantity(bulkItems[0].quantity);
    }
  };

  // Bulk items management
  const handleAddBulkRow = () => {
    const nextIdx = bulkItems.length + 1;
    const lastItem = bulkItems[bulkItems.length - 1];
    const newItem: BulkOrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      label: `Medida ${nextIdx}`,
      widthCm: lastItem ? lastItem.widthCm : 200,
      heightCm: lastItem ? lastItem.heightCm : 100,
      quantity: 1,
    };
    setBulkItems((prev) => [...prev, newItem]);
  };

  const handleDuplicateBulkRow = (id: string) => {
    const itemToDup = bulkItems.find((i) => i.id === id);
    if (!itemToDup) return;
    const newItem: BulkOrderItem = {
      ...itemToDup,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      label: `${itemToDup.label} (Copia)`,
    };
    setBulkItems((prev) => [...prev, newItem]);
  };

  const handleRemoveBulkRow = (id: string) => {
    if (bulkItems.length <= 1) return;
    setBulkItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateBulkRow = (id: string, field: keyof BulkOrderItem, value: any) => {
    setBulkItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Open modal to attach file/drive/IA to a specific bulk row
  const openAttachModal = (item: BulkOrderItem) => {
    setActiveAttachItem(item);
    if (item.fileAttachment?.driveUrl) {
      setTempDriveUrl(item.fileAttachment.driveUrl);
      setTempDriveName(item.fileAttachment.name || "Carpeta Google Drive");
      setIsDriveFolder(!!item.fileAttachment.isDriveFolder);
      setAttachTab("drive");
    } else if (item.isAiDesign) {
      setAttachTab("ai");
    } else {
      setAttachTab("file");
      setTempDriveUrl("");
      setTempDriveName("");
    }
  };

  const handleSaveAttachment = (itemAttachment?: BulkOrderItem["fileAttachment"], isAi = false) => {
    if (!activeAttachItem) return;
    setBulkItems((prev) =>
      prev.map((item) => {
        if (item.id === activeAttachItem.id) {
          return {
            ...item,
            fileAttachment: itemAttachment,
            isAiDesign: isAi,
          };
        }
        return item;
      })
    );
    setActiveAttachItem(null);
  };

  const handleRemoveAttachment = (itemId: string) => {
    setBulkItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            fileAttachment: undefined,
            isAiDesign: false,
          };
        }
        return item;
      })
    );
  };

  const handleFileUploadForActiveItem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeAttachItem) {
      handleSaveAttachment({
        name: file.name,
        sizeBytes: file.size,
        type: file.type || "application/octet-stream",
      });
    }
  };

  // Quick direct file input per row
  const handleDirectRowFileUpload = (
    itemId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setBulkItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              fileAttachment: {
                name: file.name,
                sizeBytes: file.size,
                type: file.type || "application/octet-stream",
              },
              isAiDesign: false,
            };
          }
          return item;
        })
      );
    }
  };

  // Apply single file/Drive URL to all bulk items in 1-click
  const handleApplyFileToAll = (attachment: BulkOrderItem["fileAttachment"]) => {
    if (!attachment) return;
    setBulkItems((prev) =>
      prev.map((item) => ({
        ...item,
        fileAttachment: { ...attachment },
        isAiDesign: false,
      }))
    );
  };

  // Fetch quotes from SERVER for individual mode
  useEffect(() => {
    if (orderMode !== "individual") return;
    let isMounted = true;

    const fetchServerQuote = async () => {
      const valResult = validateQuoteParams({
        materialId: selectedMaterialId,
        widthCm: currentMaterial?.mode !== "unidad" ? widthCm : 100,
        heightCm: currentMaterial?.mode !== "unidad" ? heightCm : 100,
        quantity,
        printQuality,
        inkType,
        selectedColor: currentMaterial?.hasColorPalette ? selectedColor : undefined,
        mountOption: enableMounting ? selectedMount : undefined,
        finishings: selectedFinishings,
      });

      if (!valResult.success) {
        if (isMounted) {
          setQuoteError(valResult.firstError || "Parámetros de cotización fuera de rango.");
          setIsLoadingQuote(false);
        }
        return;
      }

      setIsLoadingQuote(true);
      setQuoteError(null);
      try {
        const response = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            materialId: selectedMaterialId,
            widthCm: currentMaterial?.mode !== "unidad" ? widthCm : undefined,
            heightCm: currentMaterial?.mode !== "unidad" ? heightCm : undefined,
            quantity,
            printQuality,
            inkType,
            selectedColor: currentMaterial?.hasColorPalette ? selectedColor : undefined,
            mountOption: enableMounting ? selectedMount : undefined,
            finishings: selectedFinishings,
          }),
        });

        if (!response.ok) {
          throw new Error("Error al computar precio en servidor.");
        }

        const data: QuoteResponsePayload = await response.json();
        if (isMounted) {
          setQuoteData(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setQuoteError(err.message || "Fallo de conexión al servidor de cotización.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingQuote(false);
        }
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchServerQuote();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [
    orderMode,
    selectedMaterialId,
    widthCm,
    heightCm,
    quantity,
    printQuality,
    inkType,
    selectedColor,
    enableMounting,
    selectedMount,
    selectedFinishings,
    currentMaterial?.mode,
    currentMaterial?.hasColorPalette,
  ]);

  // Fetch quotes for ALL bulk items in parallel
  useEffect(() => {
    if (orderMode !== "bulk") return;
    let isMounted = true;

    const fetchBulkQuotes = async () => {
      setIsLoadingQuote(true);
      setQuoteError(null);

      try {
        const batchItems = bulkItems.map(item => ({
          id: item.id,
          materialId: item.materialId || selectedMaterialId,
          widthCm: currentMaterial?.mode !== "unidad" ? item.widthCm : 100,
          heightCm: currentMaterial?.mode !== "unidad" ? item.heightCm : 100,
          quantity: item.quantity,
          printQuality: item.printQuality || printQuality,
          inkType: item.inkType || inkType,
          selectedColor: currentMaterial?.hasColorPalette ? selectedColor : undefined,
          finishings: item.finishings || selectedFinishings,
          isAiDesign: item.isAiDesign
        }));
        
        const resp = await fetch("/api/quote-batch", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             materialId: selectedMaterialId,
             items: batchItems,
             wholesaleTierRequested: undefined,
             mountOption: enableMounting ? selectedMount : undefined
           })
        });
        
        if (!resp.ok) {
          throw new Error("Error en servidor al computar lote");
        }
        const data = await resp.json();
        
        const updated = bulkItems.map(item => {
           const result = data.results.find((r: any) => r.id === item.id);
           return {
             ...item,
             quoteData: result ? result.quoteData : null,
             error: null,
             isLoading: false
           };
        });

        if (isMounted) {
          setBulkItems(updated);
        }
      } catch (err: any) {
        if (isMounted) {
          setQuoteError("Error al computar precios del lote.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingQuote(false);
        }
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchBulkQuotes();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [
    orderMode,
    bulkItems.length,
    bulkItems.map((i) => `${i.materialId || "def"}-${i.widthCm}-${i.heightCm}-${i.quantity}-${i.printQuality || "def"}-${i.inkType || "def"}-${(i.finishings || []).join(",")}`).join("|"),
    selectedMaterialId,
    printQuality,
    inkType,
    selectedColor,
    enableMounting,
    selectedMount,
    selectedFinishings,
  ]);

  // Aggregate stats for Bulk Order
  const bulkSummary = useMemo(() => {
    let totalUnits = 0;
    let totalM2 = 0;
    let totalPriceARS = 0;
    let totalBaseARS = 0;
    let totalFinishingsARS = 0;
    let validCount = 0;

    bulkItems.forEach((item) => {
      totalUnits += item.quantity || 1;
      const m2PerUnit = (item.widthCm * item.heightCm) / 10000;
      totalM2 += m2PerUnit * item.quantity;

      if (item.quoteData) {
        totalPriceARS += item.quoteData.totalPriceARS || 0;
        totalBaseARS += item.quoteData.baseMaterialSubtotalARS || 0;
        totalFinishingsARS += item.quoteData.finishingsSubtotalARS || 0;
        validCount++;
      }
    });

    return {
      totalItems: bulkItems.length,
      totalUnits,
      totalM2: parseFloat(totalM2.toFixed(2)),
      totalPriceARS,
      totalBaseARS,
      totalFinishingsARS,
      isFullyCalculated: validCount === bulkItems.length,
    };
  }, [bulkItems]);

  const [lastVolumeNotified, setLastVolumeNotified] = useState<number>(0);

  // Volume notification trigger when user scales up order quantity or bulk area
  const effectiveTotalUnits = orderMode === "bulk" ? bulkSummary.totalUnits : quantity;
  const effectiveTotalM2 = orderMode === "bulk" ? bulkSummary.totalM2 : ((widthCm * heightCm) / 10000) * quantity;
  const isVolumeScaleEligible = effectiveTotalUnits >= 5 || effectiveTotalM2 >= 10;

  useEffect(() => {
    if (isVolumeScaleEligible && effectiveTotalUnits >= 5 && effectiveTotalUnits !== lastVolumeNotified) {
      setLastVolumeNotified(effectiveTotalUnits);
      useNotificationStore.getState().addNotification({
        type: "promotion",
        title: "💼 Beneficios Mayoristas Disponibles",
        message: `Detectamos un volumen de ${effectiveTotalUnits} unidades (${effectiveTotalM2.toFixed(1)} m²). ¿Sabías que podés acceder a tarifas gremio y hasta 15% OFF en el Canal Mayorista?`,
        link: "mayoristas",
        priority: "normal",
      });
    }
  }, [effectiveTotalUnits, effectiveTotalM2, isVolumeScaleEligible, lastVolumeNotified]);

  // Familias principales para el Paso 1 simplificado
  const mainFamilies: { id: MainFamilyType; label: string; icon: any; desc: string; badge?: string }[] = [
    {
      id: "estampados",
      label: "Estampados",
      icon: Shirt,
      desc: "DTF Textil por metro, Sublimación y Vinilo Termotransferible.",
      badge: "Textil & Merchandising",
    },
    {
      id: "carteles",
      label: "Carteles",
      icon: Layers,
      desc: "Lonas frontlight/blackout, Vinilos adhesivos y Portabanners.",
      badge: "Gran Formato",
    },
    {
      id: "corporeos",
      label: "Corpóreos",
      icon: Box,
      desc: "Letras y logos 3D en Polifán 20/30mm, Acrílico láser y Madera MDF.",
      badge: "Relieve 3D & Láser",
    },
  ];

  // Subcategorías según la familia seleccionada
  const subcategoriesByFamily: Record<
    MainFamilyType,
    { id: MaterialCategory; label: string; icon: any; desc: string }[]
  > = {
    estampados: [
      {
        id: "estampados",
        label: "Estampados Textiles",
        icon: Shirt,
        desc: "DTF Textil 60cm continuo, Sublimación digital y Vinilo textil de corte.",
      },
    ],
    carteles: [
      {
        id: "lonas",
        label: "Lonas Publicitarias",
        icon: Layers,
        desc: "Front 9/13 oz, Blackout bifaz y Mesh microperforada.",
      },
      {
        id: "vinilos",
        label: "Vinilos Adhesivos",
        icon: Scissors,
        desc: "Estándar, Arlon, Avery, Oracal 100/651/751, Mcal y Microperforado.",
      },
      {
        id: "rigidos",
        label: "Placas Rígidas",
        icon: Package,
        desc: "PVC espumado 3/5mm, Alto Impacto PAI 1/2/3mm y Acrílico 3mm.",
      },
      {
        id: "portabanners",
        label: "Portabanners & Displays",
        icon: Calculator,
        desc: "Roll-up 80×200cm, Doble tensor y Araña con lona incluida.",
      },
    ],
    corporeos: [
      {
        id: "corporeos",
        label: "Letras y Logos 3D",
        icon: Box,
        desc: "Polifán alta densidad 20/30mm, Acrílico corte láser y Madera MDF CNC.",
      },
    ],
  };

  const currentSubcategories = subcategoriesByFamily[selectedMainFamily] || subcategoriesByFamily.carteles;

  const availableMaterials = MATERIALS_CATALOG.filter((m) => m.category === selectedCategory);

  const applicableFinishings = FINISHING_OPTIONS.filter((f) =>
    f.applicableCategories.includes(selectedCategory)
  );

  const toggleFinishing = (id: FinishingType) => {
    setSelectedFinishings((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setUploadedFileSize(file.size);
    }
  };

  // Add items to cart (Single or Bulk)
  const handleAddToCart = () => {
    if (!currentMaterial) return;

    if (orderMode === "individual") {
      if (!quoteData) return;
      addItem({
        id: `cart-${Date.now()}`,
        materialId: selectedMaterialId,
        materialName: currentMaterial.name,
        category: selectedCategory,
        mode: currentMaterial.mode,
        widthCm: currentMaterial.mode !== "unidad" ? widthCm : undefined,
        heightCm: currentMaterial.mode !== "unidad" ? heightCm : undefined,
        quantity,
        unitPriceARS: quoteData.unitPriceARS,
        totalPriceARS: quoteData.totalPriceARS,
        baseMaterialSubtotalARS: quoteData.baseMaterialSubtotalARS,
        finishingsSubtotalARS: quoteData.finishingsSubtotalARS,
        finishingsBreakdown: quoteData.finishingsBreakdown,
        aiDesignFeeARS: quoteData.aiDesignFeeARS,
        hasAiDesign: false,
        printQuality,
        printQualityLabel: quoteData.printQualityLabel,
        inkType,
        inkTypeLabel: quoteData.inkTypeLabel,
        selectedColor: currentMaterial.hasColorPalette ? selectedColor : undefined,
        mountOption: enableMounting ? selectedMount : undefined,
        finishings: selectedFinishings,
        fileAttachment: driveAttachment
          ? {
              name: driveAttachment.name,
              driveUrl: driveAttachment.driveUrl,
              isDriveFolder: driveAttachment.isDriveFolder,
              type: "google_drive",
            }
          : uploadedFileName
          ? {
              name: uploadedFileName,
              sizeBytes: uploadedFileSize || 0,
              type: "archivo_cliente",
            }
          : undefined,
        transparencyNotes: quoteData.transparencyNotes || [],
        createdAt: new Date().toISOString(),
      });
    } else {
      // BULK ORDER ADDITION
      const batchGroupId = `batch-${Date.now()}`;
      const newCartItems: CartItem[] = bulkItems.map((item, idx) => {
        const itemQuote = item.quoteData;
        const itemMat = item.materialId ? (MATERIALS_CATALOG.find((m) => m.id === item.materialId) || currentMaterial) : currentMaterial;
        const unitPrice = itemQuote?.unitPriceARS || (itemQuote?.totalPriceARS ? Math.round(itemQuote.totalPriceARS / item.quantity) : 0);
        const totalPrice = itemQuote?.totalPriceARS || unitPrice * item.quantity;

        return {
          id: `cart-bulk-${Date.now()}-${idx}`,
          batchGroupId,
          customLabel: item.label || `Medida ${idx + 1}`,
          materialId: itemMat.id,
          materialName: itemMat.name,
          category: itemMat.category,
          mode: itemMat.mode,
          widthCm: itemMat.mode !== "unidad" ? item.widthCm : undefined,
          heightCm: itemMat.mode !== "unidad" ? item.heightCm : undefined,
          quantity: item.quantity,
          unitPriceARS: unitPrice,
          totalPriceARS: totalPrice,
          baseMaterialSubtotalARS: itemQuote?.baseMaterialSubtotalARS,
          finishingsSubtotalARS: itemQuote?.finishingsSubtotalARS,
          finishingsBreakdown: itemQuote?.finishingsBreakdown,
          aiDesignFeeARS: itemQuote?.aiDesignFeeARS,
          hasAiDesign: !!item.isAiDesign,
          printQuality: item.printQuality || printQuality,
          printQualityLabel: itemQuote?.printQualityLabel,
          inkType: (item.inkType || inkType) as InkType,
          inkTypeLabel: itemQuote?.inkTypeLabel,
          selectedColor: itemMat.hasColorPalette ? selectedColor : undefined,
          mountOption: enableMounting ? selectedMount : undefined,
          finishings: item.finishings || selectedFinishings,
          fileAttachment: item.fileAttachment,
          transparencyNotes: itemQuote?.transparencyNotes || [],
          createdAt: new Date().toISOString(),
        };
      });

      addItems(newCartItems);
    }

    setAddedSuccess(true);
    triggerBrindisCelebration(
      orderMode === "bulk"
        ? `¡Lote de ${bulkItems.length} cortes añadido al carrito de producción! 🥂🎉`
        : "¡Trabajo añadido al carrito de producción! 🥂🎉"
    );
    setTimeout(() => {
      setAddedSuccess(false);
    }, 4000);
  };

  const totalSteps = 9;
  const stepTitles = [
    "Línea de Producto",
    "Categoría",
    "Material y Sustrato",
    "Medidas y Cantidad",
    "Calidad de Impresión",
    "Tintas y Tecnología",
    "Terminaciones y Montaje",
    "Archivo o Diseño IA",
    "Resumen Final",
  ];

  return (
    <div className="section-container pt-28 sm:pt-32 lg:pt-36 pb-36 sm:pb-44 space-y-10 sm:space-y-12">
      {/* WIZARD PROGRESS BAR & STEP INDICATOR */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-wider font-semibold text-[var(--text-primary)]">
              Paso {currentStep} de {totalSteps}:
            </span>
            <span className="text-primary font-bold">
              {stepTitles[currentStep - 1]}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-primary font-bold">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
        </div>
        <div className="w-full h-2.5 bg-[var(--border-subtle)] rounded-full overflow-hidden flex gap-1 p-0.5 bg-black/5 dark:bg-white/5">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const stepNum = i + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentStep(stepNum)}
                title={`Paso ${stepNum}: ${stepTitles[i]}`}
                className={`h-full flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                  isCurrent
                    ? "bg-primary ring-2 ring-primary/40 shadow-xs"
                    : isCompleted
                    ? "bg-primary/80 hover:bg-primary"
                    : "bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* MAIN TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: WIZARD STEP CONTENT */}
        <div className="lg:col-span-8 space-y-8">
          {/* ================= STEP 1: LÍNEA PRINCIPAL DE PRODUCTO ================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="font-heading text-2xl text-[var(--text-primary)] font-medium">
                  ¿Qué tipo de producto necesitás cotizar?
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
                  Seleccioná la línea principal de producción. En cada paso configurarás detalles específicos de forma intuitiva.
                </p>
              </div>

              {/* 3 TARJETAS DE FAMILIA PRINCIPAL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {mainFamilies.map((fam) => {
                  const isFamSelected = selectedMainFamily === fam.id;
                  return (
                    <button
                      key={fam.id}
                      type="button"
                      id={`btn-family-${fam.id}`}
                      onClick={() => {
                        setSelectedMainFamily(fam.id);
                        const availableSubs = subcategoriesByFamily[fam.id];
                        if (availableSubs && availableSubs.length > 0) {
                          const firstSub = availableSubs[0];
                          setSelectedCategory(firstSub.id);
                          const firstMat = MATERIALS_CATALOG.find((m) => m.category === firstSub.id);
                          if (firstMat) {
                            setSelectedMaterialId(firstMat.id);
                            if (firstMat.defaultFinishings) {
                              setSelectedFinishings(firstMat.defaultFinishings as FinishingType[]);
                            }
                          }
                        }
                        setCurrentStep(2);
                      }}
                      className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-4 cursor-pointer relative group ${
                        isFamSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                          : "border-[var(--border-subtle)] bg-white dark:bg-black hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <IconBadge
                          icon={fam.icon}
                          size="md"
                          variant={isFamSelected ? "primary" : "neutral"}
                          containerStyle={isFamSelected ? "solid" : "subtle"}
                        />
                        {fam.badge && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] font-mono font-medium">
                            {fam.badge}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center justify-between">
                          <span>{fam.label}</span>
                          {isFamSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {fam.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* WE REMOVED THE CONTINUAR BUTTON HERE */}
            </div>
          )}

          {/* ================= STEP 2: CATEGORÍA / SUBCATEGORÍA ================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Línea: {mainFamilies.find((f) => f.id === selectedMainFamily)?.label}</span>
                  </button>
                  <span className="text-[var(--text-muted)]">/</span>
                  <span className="text-[var(--text-primary)] font-medium">Categorías</span>
                </div>
                <h2 className="font-heading text-2xl text-[var(--text-primary)] font-medium">
                  Categoría en {mainFamilies.find((f) => f.id === selectedMainFamily)?.label}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
                  Elegí el tipo de producto o aplicación que necesitás.
                </p>
              </div>

              {/* TARJETAS DE SUBCATEGORÍAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentSubcategories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      id={`btn-cat-${cat.id}`}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id as MaterialCategory);
                        const firstMat = MATERIALS_CATALOG.find((m) => m.category === cat.id);
                        if (firstMat) {
                          setSelectedMaterialId(firstMat.id);
                          if (firstMat.defaultFinishings) {
                            setSelectedFinishings(firstMat.defaultFinishings as FinishingType[]);
                          }
                        }
                        setCurrentStep(3);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                          : "border-[var(--border-subtle)] bg-white dark:bg-black hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <IconBadge
                          icon={cat.icon}
                          size="md"
                          variant={isSelected ? "primary" : "neutral"}
                          containerStyle={isSelected ? "solid" : "subtle"}
                        />
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{cat.label}</h4>
                        <p className="text-xs text-[var(--text-secondary)] leading-snug mt-1">
                          {cat.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* WE REMOVED THE CONTINUAR BUTTON HERE */}
            </div>
          )}

          {/* ================= STEP 3: MATERIAL Y SUSTRATO ESPECÍFICO ================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    {mainFamilies.find((f) => f.id === selectedMainFamily)?.label}
                  </button>
                  <span className="text-[var(--text-muted)]">/</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    {currentSubcategories.find((c) => c.id === selectedCategory)?.label || selectedCategory}
                  </button>
                  <span className="text-[var(--text-muted)]">/</span>
                  <span className="text-[var(--text-primary)] font-medium">Sustratos</span>
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-2xl text-[var(--text-primary)] font-medium">
                    Sustrato para {currentSubcategories.find((c) => c.id === selectedCategory)?.label || selectedCategory}
                  </h2>
                  <span className="text-xs font-mono text-primary font-bold">
                    {availableMaterials.length} opciones disponibles
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
                  Seleccioná la variante de material específica para tu trabajo.
                </p>
              </div>

              {/* LISTADO DE MATERIALES O SELECTOR DE RÍGIDOS */}
              <div className="grid grid-cols-1 gap-3">
                {selectedCategory === "rigidos" ? (
                  <RigidMaterialsSelector
                    selectedMaterialId={selectedMaterialId}
                    onSelectMaterial={(matId) => {
                      setSelectedMaterialId(matId);
                      const mat = MATERIALS_CATALOG.find((m) => m.id === matId);
                      if (mat?.defaultFinishings) {
                        setSelectedFinishings(mat.defaultFinishings as FinishingType[]);
                      }
                    }}
                    onExplicitMaterialSelect={(matId) => {
                      setCurrentStep(4);
                    }}
                    widthCm={widthCm}
                    heightCm={heightCm}
                    quantity={quantity}
                    onDimensionsChange={(w, h) => {
                      setWidthCm(w);
                      setHeightCm(h);
                    }}
                    includeScrapPacked={includeScrapPacked}
                    onIncludeScrapChange={(inc) => setIncludeScrapPacked(inc)}
                  />
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedCategory}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-1 gap-3"
                    >
                      {availableMaterials.map((mat) => {
                        const isSelected = selectedMaterialId === mat.id;
                        return (
                          <motion.button
                            key={mat.id}
                            id={`mat-option-${mat.id}`}
                            whileHover={{ scale: 1.005, y: -1 }}
                            whileTap={{ scale: 0.99 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => {
                              setSelectedMaterialId(mat.id);
                              if (mat.defaultFinishings) {
                                setSelectedFinishings(mat.defaultFinishings as FinishingType[]);
                              }
                              setCurrentStep(4);
                            }}
                            className={`p-4 rounded-xl border text-left transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer relative overflow-hidden ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-sm"
                                : "border-[var(--border-subtle)] bg-white dark:bg-black hover:border-primary/50"
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="activeMaterialGlow"
                                className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                              />
                            )}
                            <div className="flex items-start gap-3.5 pl-1">
                              <img
                                src={mat.image}
                                alt={mat.name}
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[var(--border-subtle)] shadow-xs"
                              />
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                                    {mat.name}
                                  </h4>
                                  {mat.badge && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-black font-semibold">
                                      {mat.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                  {mat.shortDesc}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)] pt-0.5">
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-primary" strokeWidth={1.85} />
                                    {mat.durability.split(".")[0]}
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <Sun className="w-3 h-3 text-primary" strokeWidth={1.85} />
                                    {mat.lightingType}
                                  </span>
                                  {(mat as any).maxWidthCm && (
                                    <span className="inline-flex items-center gap-1">
                                      <Ruler className="w-3 h-3 text-primary" strokeWidth={1.85} />
                                      Ancho máx: {(mat as any).maxWidthCm} cm
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="shrink-0 flex items-center gap-2 self-end sm:self-center pr-1">
                              {isSelected ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                  <CheckCircle2 className="w-5 h-5 text-primary" />
                                </motion.div>
                              ) : (
                                <span className="text-[11px] font-mono text-[var(--text-muted)] group-hover:text-primary">
                                  Seleccionar
                                </span>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {/* VINYL COLOR PALETTE SELECTOR (FOR ORACAL 100/651/751 & MCAL) */}
              {currentMaterial?.hasColorPalette && (
                <div className="p-5 rounded-2xl bg-[var(--bg-surface-subtle)] border border-primary/20 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-primary" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        Seleccionar Color de Vinilo ({currentMaterial.name})
                      </h4>
                    </div>
                    <span className="text-xs text-primary font-bold">{selectedColor}</span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)]">
                    Elegí entre los 20 colores oficiales de la carta para corte computarizado:
                  </p>

                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2">
                    {VINYL_COLOR_PALETTE.map((color) => {
                      const isColSelected = selectedColor === color.name;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setSelectedColor(color.name)}
                          className={`group relative flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all cursor-pointer ${
                            isColSelected
                              ? "border-primary ring-2 ring-primary scale-105"
                              : "border-[var(--border-subtle)] hover:border-primary/50"
                          }`}
                          title={color.name}
                        >
                          <div
                            className="w-8 h-8 rounded-lg shadow-inner flex items-center justify-center border border-black/10"
                            style={{ backgroundColor: color.hex }}
                          >
                            {isColSelected && (
                              <Check
                                className="w-4 h-4 drop-shadow"
                                style={{ color: color.textColor || "#000" }}
                              />
                            )}
                          </div>
                          <span className="text-[9px] font-mono text-[var(--text-secondary)] truncate max-w-[50px] text-center">
                            {color.name.split(" ")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* WE REMOVED THE CONTINUAR BUTTON HERE */}
            </div>
          )}

          {/* ================= STEP 4: MEDIDAS Y CANTIDAD (CON MODO BULK ORDER) ================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    {mainFamilies.find((f) => f.id === selectedMainFamily)?.label}
                  </button>
                  <span className="text-[var(--text-muted)]">/</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    {currentSubcategories.find((c) => c.id === selectedCategory)?.label || selectedCategory}
                  </button>
                  <span className="text-[var(--text-muted)]">/</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    {currentMaterial?.name?.split("(")[0]}
                  </button>
                  <span className="text-[var(--text-muted)]">/</span>
                  <span className="text-[var(--text-primary)] font-medium">Medidas y Cantidad</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="font-heading text-2xl text-[var(--text-primary)] font-medium">
                    Medidas y Cantidad
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
                    Ingresá las dimensiones en centímetros o configurá un pedido por lote de múltiples cortes.
                  </p>
                </div>

                {/* MODE TOGGLE: INDIVIDUAL VS BULK ORDER */}
                {currentMaterial?.mode !== "unidad" && (
                  <div className="flex items-center p-1 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] self-start shrink-0">
                    <button
                      type="button"
                      onClick={handleSwitchToIndividual}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        orderMode === "individual"
                          ? "bg-primary text-white shadow-sm"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      Medida Única
                    </button>
                    <button
                      type="button"
                      id="btn-switch-bulk-order"
                      onClick={handleSwitchToBulk}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        orderMode === "bulk"
                          ? "bg-primary text-white shadow-sm"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <ListPlus className="w-3.5 h-3.5" />
                      <span>Pedido por Lotes (Bulk)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* INDIVIDUAL ORDER MODE */}
              {orderMode === "individual" ? (
                <div className="p-6 rounded-2xl bg-white dark:bg-black border border-[var(--border-subtle)] space-y-6">
                  {currentMaterial?.mode !== "unidad" ? (
                    <div className="space-y-4">
                      {/* PRESETS DE MEDIDAS ESTÁNDAR PARA RÍGIDOS / PLACAS */}
                      {(selectedCategory === "rigidos" || currentMaterial?.mode === "placa") && (
                        <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[var(--text-primary)]">Medidas Estándar de Placas & Carteles:</span>
                            <span className="text-[11px] text-[var(--text-secondary)]">Optimización de cortes y consumo</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: "Placa Entera (120×240 cm)", w: 120, h: 240 },
                              { label: "Media Placa (120×120 cm)", w: 120, h: 120 },
                              { label: "Placa PAI (100×200 cm)", w: 100, h: 200 },
                              { label: "Cuadro Grande (70×100 cm)", w: 70, h: 100 },
                              { label: "Cartel 60×40 cm", w: 60, h: 40 },
                              { label: "Placa A3 (30×42 cm)", w: 30, h: 42 },
                              { label: "Consultorio A4 (21×30 cm)", w: 21, h: 30 },
                            ].map((preset) => {
                              const isPresetActive = widthCm === preset.w && heightCm === preset.h;
                              return (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => {
                                    setWidthCm(preset.w);
                                    setHeightCm(preset.h);
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all cursor-pointer ${
                                    isPresetActive
                                      ? "bg-primary text-white border-primary shadow-sm"
                                      : "bg-white dark:bg-black/40 border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-primary/50"
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium">
                            Ancho (centímetros)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="10"
                              max="5000"
                              value={widthCm}
                              onChange={(e) => setWidthCm(Math.max(10, parseFloat(e.target.value) || 10))}
                              className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] font-mono-num text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <span className="absolute right-4 top-3 text-xs text-[var(--text-muted)]">cm</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium">
                            Alto (centímetros)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="10"
                              max="5000"
                              value={heightCm}
                              onChange={(e) => setHeightCm(Math.max(10, parseFloat(e.target.value) || 10))}
                              className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] font-mono-num text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <span className="absolute right-4 top-3 text-xs text-[var(--text-muted)]">cm</span>
                          </div>
                        </div>
                      </div>

                      {/* INTERACTIVE 2D BLUEPRINT ASPECT-RATIO VISUALIZER */}
                      <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                            <Maximize2 className="w-3.5 h-3.5 text-primary" />
                            <span>Visualizador de Proporción & Escala Geométrica</span>
                          </div>
                          <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                            {widthCm > heightCm * 1.2
                              ? "Horizontal / Paisaje"
                              : heightCm > widthCm * 1.2
                              ? "Vertical / Tótem"
                              : "Formato Cuadrado"}
                          </span>
                        </div>

                        {/* Animated Stage */}
                        <div className="h-32 bg-[var(--bg-page)] rounded-lg border border-dashed border-[var(--border-subtle)] flex items-center justify-center p-3 relative overflow-hidden">
                          {/* Technical grid backdrop */}
                          <div
                            className="absolute inset-0 opacity-15 pointer-events-none"
                            style={{
                              backgroundImage: `linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)`,
                              backgroundSize: "16px 16px",
                            }}
                          />

                          <motion.div
                            layout
                            initial={false}
                            animate={{
                              width: `${Math.min(
                                260,
                                Math.max(70, (widthCm / Math.max(widthCm, heightCm)) * 240)
                              )}px`,
                              height: `${Math.min(
                                100,
                                Math.max(36, (heightCm / Math.max(widthCm, heightCm)) * 95)
                              )}px`,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="rounded-md border-2 border-primary bg-primary/10 shadow-sm flex flex-col items-center justify-center relative p-1 text-center"
                          >
                            <span className="text-[10px] font-mono font-bold text-primary truncate px-1">
                              {widthCm} × {heightCm} cm
                            </span>
                            <span className="text-[9px] font-mono text-[var(--text-muted)]">
                              {((widthCm * heightCm) / 10000).toFixed(2)} m²
                            </span>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1">
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        Producto unitario pre-armado ({currentMaterial.name})
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Incluye la estructura completa de exhibición y la gráfica impresa lista para montar.
                      </p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium">
                      Cantidad de unidades
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] hover:border-primary font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-24 text-center py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] font-mono-num text-sm font-bold"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] hover:border-primary font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* ZOD VALIDATION FEEDBACK */}
                  {quoteError ? (
                    <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-800/40 text-red-400 text-xs flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{quoteError}</span>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-950/10 border border-emerald-800/30 text-emerald-500 text-xs flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>
                        Superficie calculada: {((widthCm * heightCm) / 10000).toFixed(2)} m² por paño (
                        {(((widthCm * heightCm) / 10000) * quantity).toFixed(2)} m² totales).
                      </span>
                    </div>
                  )}

                  {/* WHOLESALE VOLUME DISCOUNT BANNER (SINGLE MODE) */}
                  {isVolumeScaleEligible && (
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-5 h-5 text-primary shrink-0 animate-bounce" />
                        <div>
                          <span className="font-bold text-[var(--text-primary)] block">
                            Escala de Volumen Detectada ({quantity} u · {(((widthCm * heightCm) / 10000) * quantity).toFixed(1)} m²)
                          </span>
                          <span className="text-[11px] text-[var(--text-secondary)]">
                            Accedé a precios preferenciales para talleres y agencias en el Canal Mayorista.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate("mayoristas")}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-[var(--color-primary-hover)] shrink-0 transition-colors cursor-pointer"
                      >
                        Ver Beneficios
                      </button>
                    </div>
                  )}

                  {/* PROMPT TO SWITCH TO BULK FOR MULTIPLE ITEMS */}
                  <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <ListPlus className="w-4 h-4 text-primary shrink-0" />
                      <span>¿Tenés varias medidas o paños con distintos tamaños para este material?</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSwitchToBulk}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-[var(--color-primary-hover)] shrink-0 transition-colors"
                    >
                      Activar Bulk Order
                    </button>
                  </div>
                </div>
              ) : (
                /* ================= BULK ORDER MODE (PEDIDO POR LOTES) ================= */
                <div className="space-y-4">
                  {/* WHOLESALE VOLUME DISCOUNT BANNER (BULK MODE) */}
                  {isVolumeScaleEligible && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-5 h-5 text-primary shrink-0 animate-bounce" />
                        <div>
                          <span className="font-bold text-[var(--text-primary)] block">
                            ¡Lote con Escala Mayorista ({bulkSummary.totalUnits} u · {bulkSummary.totalM2} m²)!
                          </span>
                          <span className="text-[11px] text-[var(--text-secondary)]">
                            Podés solicitar cuenta gremio o cotización por volumen para obtener hasta 15% OFF.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate("mayoristas")}
                        className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[var(--color-primary-hover)] shrink-0 transition-colors cursor-pointer"
                      >
                        Canal Mayorista
                      </button>
                    </div>
                  )}

                  {/* BULK HEADER SUMMARY BAR */}
                  <div className="p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-[var(--text-secondary)] block text-[10px] uppercase font-mono">
                          Total Medidas
                        </span>
                        <strong className="text-[var(--text-primary)] font-mono-num font-bold text-sm">
                          {bulkSummary.totalItems} cortes
                        </strong>
                      </div>
                      <div className="h-6 w-px bg-[var(--border-subtle)]" />
                      <div>
                        <span className="text-[var(--text-secondary)] block text-[10px] uppercase font-mono">
                          Total Unidades
                        </span>
                        <strong className="text-[var(--text-primary)] font-mono-num font-bold text-sm">
                          {bulkSummary.totalUnits} u.
                        </strong>
                      </div>
                      <div className="h-6 w-px bg-[var(--border-subtle)]" />
                      <div>
                        <span className="text-[var(--text-secondary)] block text-[10px] uppercase font-mono">
                          Superficie Lote
                        </span>
                        <strong className="text-primary font-mono-num font-bold text-sm">
                          {bulkSummary.totalM2} m²
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      id="btn-add-bulk-row-top"
                      onClick={handleAddBulkRow}
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Añadir otra medida</span>
                    </button>
                  </div>

                  {/* BULK ITEMS LIST */}
                  <div className="space-y-3">
                    {bulkItems.map((item, index) => {
                      const itemAreaM2 = ((item.widthCm * item.heightCm) / 10000) * item.quantity;
                      const hasFile = !!item.fileAttachment;
                      const hasAi = !!item.isAiDesign;

                      return (
                        <div
                          key={item.id}
                          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-black border border-[var(--border-subtle)] hover:border-primary/40 transition-all space-y-4 shadow-sm"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold flex items-center justify-center shrink-0">
                                #{index + 1}
                              </span>
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) => handleUpdateBulkRow(item.id, "label", e.target.value)}
                                placeholder={`Medida ${index + 1} (ej. Fachada)`}
                                className="px-2.5 py-1 rounded-lg border border-transparent hover:border-[var(--border-subtle)] focus:border-primary focus:bg-[var(--bg-surface-subtle)] text-xs font-bold text-[var(--text-primary)] focus:outline-none"
                              />

                              {/* ROW-LEVEL FILE UPLOAD STATUS INDICATOR */}
                              {hasFile ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                                  <FileCheck className="w-3 h-3 text-emerald-500" />
                                  <span className="truncate max-w-[120px]">{item.fileAttachment?.name}</span>
                                </span>
                              ) : hasAi ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  <span>Arte IA Adjunto</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                                  <AlertCircle className="w-3 h-3 text-amber-500" />
                                  <span>Archivo pendiente</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              {/* DUPLICATE BUTTON */}
                              <button
                                type="button"
                                onClick={() => handleDuplicateBulkRow(item.id)}
                                title="Duplicar esta medida"
                                className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:border-primary/50 text-[var(--text-secondary)] hover:text-primary transition-colors cursor-pointer text-xs flex items-center gap-1"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Duplicar</span>
                              </button>

                              {/* REMOVE BUTTON */}
                              {bulkItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBulkRow(item.id)}
                                  title="Eliminar fila"
                                  className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* MEASURES & QUANTITY INPUTS */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="block text-[11px] uppercase font-mono text-[var(--text-secondary)]">
                                Ancho (cm)
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="10"
                                  max="5000"
                                  value={item.widthCm}
                                  onChange={(e) =>
                                    handleUpdateBulkRow(
                                      item.id,
                                      "widthCm",
                                      Math.max(10, parseFloat(e.target.value) || 10)
                                    )
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] font-mono-num text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <span className="absolute right-3 top-2 text-[10px] text-[var(--text-muted)] font-mono">
                                  cm
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[11px] uppercase font-mono text-[var(--text-secondary)]">
                                Alto (cm)
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="10"
                                  max="5000"
                                  value={item.heightCm}
                                  onChange={(e) =>
                                    handleUpdateBulkRow(
                                      item.id,
                                      "heightCm",
                                      Math.max(10, parseFloat(e.target.value) || 10)
                                    )
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] font-mono-num text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <span className="absolute right-3 top-2 text-[10px] text-[var(--text-muted)] font-mono">
                                  cm
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[11px] uppercase font-mono text-[var(--text-secondary)]">
                                Cantidad
                              </label>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateBulkRow(item.id, "quantity", Math.max(1, item.quantity - 1))
                                  }
                                  className="px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] text-xs font-bold"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleUpdateBulkRow(
                                      item.id,
                                      "quantity",
                                      Math.max(1, parseInt(e.target.value, 10) || 1)
                                    )
                                  }
                                  className="w-full text-center py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] font-mono-num text-xs font-bold"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateBulkRow(item.id, "quantity", item.quantity + 1)}
                                  className="px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] text-xs font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* PER-ITEM OPTIONS (Material, Quality, Ink & Finishings) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                            <div className="space-y-1">
                              <label className="block text-[11px] uppercase font-mono text-[var(--text-secondary)]">
                                Material / Sustrato
                              </label>
                              <select
                                value={item.materialId || "default"}
                                onChange={(e) =>
                                  handleUpdateBulkRow(
                                    item.id,
                                    "materialId",
                                    e.target.value === "default" ? undefined : e.target.value
                                  )
                                }
                                className="w-full px-3 py-1.5 min-h-[36px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-primary truncate"
                              >
                                <option value="default">Global ({currentMaterial?.name})</option>
                                {availableMaterials.map((mat) => (
                                  <option key={mat.id} value={mat.id}>
                                    {mat.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[11px] uppercase font-mono text-[var(--text-secondary)]">
                                Calidad de Impresión
                              </label>
                              <select
                                value={item.printQuality || "default"}
                                onChange={(e) => handleUpdateBulkRow(item.id, "printQuality", e.target.value === "default" ? undefined : e.target.value)}
                                className="w-full px-3 py-1.5 min-h-[36px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="default">Global ({printQuality})</option>
                                <option value="borrador">Borrador</option>
                                <option value="estandar">Estándar</option>
                                <option value="alta_resolucion">Alta Res</option>
                                <option value="fotografica">Fotográfica</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[11px] uppercase font-mono text-[var(--text-secondary)]">
                                Tipo de Impresión
                              </label>
                              <select
                                value={item.inkType || "default"}
                                onChange={(e) => handleUpdateBulkRow(item.id, "inkType", e.target.value === "default" ? undefined : e.target.value)}
                                className="w-full px-3 py-1.5 min-h-[36px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="default">Global ({inkType})</option>
                                <option value="solvente">Solvente</option>
                                <option value="uv">Impresión UV</option>
                                <option value="directa_uv">Directa UV (Cama Plana)</option>
                                <option value="latex">Látex</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[11px] uppercase font-mono text-[var(--text-secondary)]">
                                Terminaciones Específicas
                              </label>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {applicableFinishings.length > 0 ? applicableFinishings.map(f => {
                                  const isSelected = (item.finishings || []).includes(f.id);
                                  return (
                                    <button
                                      key={f.id}
                                      type="button"
                                      onClick={() => {
                                        const current = item.finishings || [];
                                        const next = isSelected ? current.filter(x => x !== f.id) : [...current, f.id];
                                        handleUpdateBulkRow(item.id, "finishings", next.length ? next : undefined);
                                      }}
                                      className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-colors ${isSelected ? "bg-primary/10 border-primary/40 text-primary" : "bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)]"}`}
                                    >
                                      {f.name}
                                    </button>
                                  );
                                }) : (
                                  <span className="text-[10px] text-[var(--text-muted)] py-1">Sin opciones para este material</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* PER-ITEM DESIGN ATTACHMENT & PRICE BAR */}
                          <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                            {/* ATTACHMENT STATUS / BUTTON */}
                            <div className="flex items-center gap-2">
                              {hasFile ? (
                                <div className="flex items-center gap-2">
                                  <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-1.5">
                                    <FileCheck className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate max-w-[150px] font-mono">
                                      {item.fileAttachment?.name}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAttachment(item.id)}
                                    title="Quitar archivo"
                                    className="text-[10px] text-red-400 hover:underline"
                                  >
                                    Quitar
                                  </button>
                                </div>
                              ) : hasAi ? (
                                <div className="flex items-center gap-2">
                                  <div className="px-2.5 py-1 rounded-lg bg-accent text-black text-xs font-bold flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Diseñar con IA</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAttachment(item.id)}
                                    className="text-[10px] text-red-400 hover:underline"
                                  >
                                    Quitar
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {/* Quick inline upload button */}
                                  <label className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:border-primary bg-white dark:bg-black text-[var(--text-primary)] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                                    <Upload className="w-3.5 h-3.5 text-primary" />
                                    <span>Adjuntar Diseño</span>
                                    <input
                                      type="file"
                                      accept=".pdf,.tif,.tiff,.jpg,.jpeg,.png"
                                      onChange={(e) => handleDirectRowFileUpload(item.id, e)}
                                      className="sr-only"
                                    />
                                  </label>

                                  <button
                                    type="button"
                                    onClick={() => openAttachModal(item)}
                                    className="px-2.5 py-1.5 rounded-lg text-[11px] text-[var(--text-secondary)] hover:text-primary transition-colors flex items-center gap-1"
                                  >
                                    <Folder className="w-3.5 h-3.5" />
                                    <span>Drive / IA...</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* ITEM PRICE & M2 PREVIEW */}
                            <div className="flex items-center gap-4 text-xs font-mono text-right">
                              <span className="text-[var(--text-muted)] text-[11px]">
                                {itemAreaM2.toFixed(2)} m²
                              </span>
                              {item.quoteData?.totalPriceARS ? (
                                <strong className="text-primary font-bold text-sm">
                                  {formatPrice(item.quoteData.totalPriceARS)}
                                </strong>
                              ) : item.isLoading ? (
                                <span className="text-[11px] text-[var(--text-muted)] animate-pulse">
                                  Cotizando...
                                </span>
                              ) : (
                                <span className="text-[11px] text-[var(--text-muted)]">—</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* BOTTOM ADD ROW BUTTON */}
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      id="btn-add-bulk-row-bottom"
                      onClick={handleAddBulkRow}
                      className="w-full py-3.5 rounded-2xl border-2 border-dashed border-[var(--border-subtle)] hover:border-primary bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] hover:text-primary text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Añadir otra fila de medida y cantidad a este lote</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CONTINUAR DESDE MEDIDAS */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-2.5 rounded-[7px] bg-primary hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Confirmar Medidas y Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 5: CALIDAD DE IMPRESIÓN ================= */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Medidas: {orderMode === "bulk" ? `${bulkItems.length} cortes` : `${widthCm}×${heightCm} cm`}</span>
                  </button>
                  <span className="text-[var(--text-muted)]">/</span>
                  <span className="text-[var(--text-primary)] font-medium">Calidad de Impresión</span>
                </div>
                <h2 className="font-heading text-2xl text-[var(--text-primary)] font-medium">
                  Elegir Calidad de Impresión
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
                  Seleccioná la resolución adecuada según la distancia de visualización.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* RESOLUCIÓN ESTÁNDAR */}
                <button
                  type="button"
                  onClick={() => {
                    setPrintQuality("estandar");
                    setCurrentStep(6);
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-4 ${
                    printQuality === "estandar"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-[var(--border-subtle)] bg-white dark:bg-black hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] font-mono">
                        720 - 1080 DPI
                      </span>
                      {printQuality === "estandar" && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">Resolución Estándar</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Ideal para vía pública, carteles de fachada, marquesinas y banners visibles a más de 1.5 metros.
                    </p>
                  </div>
                  <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    Sin recargo adicional (Tarifa base)
                  </div>
                </button>

                {/* ALTA RESOLUCIÓN */}
                <button
                  type="button"
                  onClick={() => {
                    setPrintQuality("alta_resolucion");
                    setCurrentStep(6);
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-4 ${
                    printQuality === "alta_resolucion"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-[var(--border-subtle)] bg-white dark:bg-black hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-accent text-black font-semibold font-mono">
                        1440 - 2880 DPI
                      </span>
                      {printQuality === "alta_resolucion" && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">Alta Resolución</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Detalle fotográfico con pasadas ultra finas. Recomendado para vidrieras, cuadros, stands y visualización cercana.
                    </p>
                  </div>
                  <div className="text-xs font-mono text-primary font-bold">
                    + $2.500 ARS / m²
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 6: TINTAS ================= */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Calidad: {printQuality === "alta_resolucion" ? "Alta Resolución" : "Estándar"}</span>
                  </button>
                  <span className="text-[var(--text-muted)]">/</span>
                  <span className="text-[var(--text-primary)] font-medium">Tintas</span>
                </div>
                <h2 className="font-heading text-2xl text-[var(--text-primary)] font-medium">
                  Elegir Tipo de Tintas
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
                  Tecnología de polimerización y curado para máxima adherencia y resistencia química.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* SOLVENTE */}
                <button
                  type="button"
                  onClick={() => {
                    setInkType("solvente");
                    setCurrentStep(7);
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-4 ${
                    inkType === "solvente"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-[var(--border-subtle)] bg-white dark:bg-black hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Printer className="w-5 h-5 text-primary" />
                      {inkType === "solvente" && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Solvente / Eco-Solvente</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Excelente penetración en PVC y lonas. Alta durabilidad en intemperie y resistencia a lluvias.
                    </p>
                  </div>
                  <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    Incluido estándar
                  </div>
                </button>

                {/* UV LED */}
                <button
                  type="button"
                  onClick={() => {
                    setInkType("uv");
                    setCurrentStep(7);
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-4 ${
                    inkType === "uv"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-[var(--border-subtle)] bg-white dark:bg-black hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Sparkles className="w-5 h-5 text-primary" />
                      {inkType === "uv" && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Tintas UV (Curado LED)</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Secado instantáneo sin olor. Máxima resistencia a solventes, alcoholes y rayos ultravioletas.
                    </p>
                  </div>
                  <div className="text-xs font-mono text-primary font-bold">
                    + $1.800 ARS / m²
                  </div>
                </button>

                {/* IMPRESIÓN DIRECTA UV */}
                <button
                  type="button"
                  onClick={() => {
                    setInkType("directa_uv");
                    setCurrentStep(7);
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-4 ${
                    inkType === "directa_uv"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "border-[var(--border-subtle)] bg-white dark:bg-black hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Package className="w-5 h-5 text-primary" />
                      {inkType === "directa_uv" && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Impresión Directa UV</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Cama plana industrial directamente sobre placas rígidas, acrílico, PAI o PVC sin vinilo intermedio.
                    </p>
                  </div>
                  <div className="text-xs font-mono text-primary font-bold">
                    {selectedCategory === "rigidos" ? "Incluido en placa" : "+ $3.200 ARS / m²"}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 7: TERMINACIONES & MONTAJE ================= */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(6)}
                    className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Tintas: {inkType === "uv" ? "UV LED" : inkType === "directa_uv" ? "Directa UV" : "Solvente"}</span>
                  </button>
                  <span className="text-[var(--text-muted)]">/</span>
                  <span className="text-[var(--text-primary)] font-medium">Terminaciones</span>
                </div>
                <h2 className="font-heading text-2xl text-[var(--text-primary)] font-medium">
                  Terminaciones y Acabados
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
                  Opciones de confección específicas para {selectedCategory.toUpperCase()}.
                  {orderMode === "bulk" && " (Se aplican a todas las piezas del lote)."}
                </p>
              </div>

              {/* CONDITIONAL FINISHING OPTIONS BY CATEGORY */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium">
                  Terminaciones de taller:
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {applicableFinishings.map((finish) => {
                    const isChecked = selectedFinishings.includes(finish.id);
                    const breakdownItem = quoteData?.finishingsBreakdown?.find(
                      (b) => b.id === finish.id || b.finishingId === finish.id
                    );
                    const itemCost = breakdownItem?.totalCostARS ?? breakdownItem?.subtotalARS;
                    return (
                      <label
                        key={finish.id}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3.5 ${
                          isChecked
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-[var(--border-subtle)] bg-white dark:bg-black hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFinishing(finish.id)}
                            className="mt-1 w-4 h-4 rounded accent-primary text-primary"
                          />
                          <div className="space-y-0.5">
                            <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                              {finish.name}
                            </h4>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                              {finish.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {itemCost !== undefined && orderMode === "individual" ? (
                            <span className="text-xs font-mono font-bold text-primary block">
                              {itemCost > 0 ? `+${formatPrice(itemCost)}` : "Sin cargo"}
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono text-[var(--text-secondary)] block">
                              {finish.priceDescription || "Sin cargo"}
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* VINYL MOUNTING ON RIGID SUBSTRATES (MDF, PVC, PAI, CHAPA) */}
                {selectedCategory === "vinilos" && (
                  <div className="pt-4 space-y-4 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                          Montado sobre Sustrato Rígido (Opcional)
                        </h4>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableMounting}
                          onChange={(e) => {
                            setEnableMounting(e.target.checked);
                            if (e.target.checked && !selectedMount) {
                              setSelectedMount({
                                type: "mdf",
                                typeName: "MDF Fibrofácil",
                                thickness: "3 mm",
                                pricePerM2ARS: 8500,
                              });
                            }
                          }}
                          className="w-4 h-4 rounded accent-primary"
                        />
                        <span className="text-xs font-bold text-primary">Activar Montaje</span>
                      </label>
                    </div>

                    {enableMounting && (
                      <div className="p-5 rounded-2xl bg-[var(--bg-surface-subtle)] border border-primary/20 space-y-4 animate-in fade-in duration-200">
                        <p className="text-xs text-[var(--text-secondary)]">
                          Seleccioná el material rígido y el espesor sobre el que montaremos tu vinilo:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(MOUNT_OPTIONS).map(([key, opt]) => (
                            <div
                              key={key}
                              className={`p-3.5 rounded-xl border space-y-2 bg-white dark:bg-black ${
                                selectedMount?.type === opt.type
                                  ? "border-primary ring-1 ring-primary/40"
                                  : "border-[var(--border-subtle)]"
                              }`}
                            >
                              <h5 className="text-xs font-bold text-[var(--text-primary)]">{opt.typeName}</h5>
                              <div className="space-y-1.5">
                                {opt.thicknesses.map((th) => {
                                  const isSelectedThickness =
                                    selectedMount?.type === opt.type && selectedMount?.thickness === th.thickness;
                                  return (
                                    <button
                                      key={th.thickness}
                                      type="button"
                                      onClick={() => {
                                        setSelectedMount({
                                          type: opt.type,
                                          typeName: opt.typeName,
                                          thickness: th.thickness,
                                          pricePerM2ARS: th.pricePerM2ARS,
                                        });
                                      }}
                                      className={`w-full px-3 py-1.5 rounded-lg text-xs flex items-center justify-between border transition-all ${
                                        isSelectedThickness
                                          ? "bg-primary text-white border-primary"
                                          : "bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-primary/40"
                                      }`}
                                    >
                                      <span>{th.label}</span>
                                      <span className="font-mono font-bold">
                                        +${th.pricePerM2ARS.toLocaleString("es-AR")}/m²
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CONTINUAR DESDE TERMINACIONES */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(8)}
                  className="px-6 py-2.5 rounded-[7px] bg-primary hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Confirmar Terminaciones y Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 8: ARCHIVO O DISEÑO IA ================= */}
          {currentStep === 8 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(7)}
                    className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Terminaciones</span>
                  </button>
                  <span className="text-[var(--text-muted)]">/</span>
                  <span className="text-[var(--text-primary)] font-medium">Archivos & Diseño</span>
                </div>
                <h2 className="font-heading text-2xl text-[var(--text-primary)] font-medium">
                  {orderMode === "bulk" ? "Diseños y Archivos del Lote" : "¿Cómo vas a preparar el diseño?"}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
                  {orderMode === "bulk"
                    ? "Podés adjuntar un diseño individual para cada corte o vincular una carpeta general de Google Drive."
                    : "Podés subir tu archivo listo para imprenta, adjuntar Google Drive o diseñar con IA."}
                </p>
              </div>

              {orderMode === "individual" ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* SUBIR ARCHIVO LOCAL */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-black border border-[var(--border-subtle)] space-y-4 text-center">
                      <IconBadge icon={Upload} size="lg" variant="primary" containerStyle="solid" className="mx-auto" />
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">Subir Archivo Local</h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          PDF en curvas, TIFF o JPG a 150 DPI en CMYK.
                        </p>
                      </div>
                      <label className="block">
                        <span className="sr-only">Elegir archivo</span>
                        <input
                          type="file"
                          accept=".pdf,.tif,.tiff,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          className="block w-full text-xs text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:bg-primary file:text-white hover:file:bg-[var(--color-primary-hover)] cursor-pointer"
                        />
                      </label>
                      {uploadedFileName && (
                        <div className="p-2.5 rounded-lg bg-accent text-black border border-accent text-xs flex items-center justify-center gap-1.5">
                          <FileCheck className="w-4 h-4" />
                          <span>{uploadedFileName}</span>
                        </div>
                      )}
                    </div>

                    {/* DISEÑAR CON IA */}
                    <div className="p-6 rounded-2xl bg-[var(--bg-surface-subtle)] border border-primary/20 space-y-4 text-center flex flex-col justify-between">
                      <div className="space-y-4">
                        <IconBadge icon={Sparkles} size="lg" variant="accent" containerStyle="solid" className="mx-auto" />
                        <div>
                          <h3 className="text-sm font-bold text-[var(--text-primary)]">Diseñar Gráfica con IA</h3>
                          <p className="text-xs text-[var(--text-secondary)] mt-1">
                            Generá textos de impacto, colores contrastados y visualizá el mockup 3D en tiempo real sin salir del cotizador.
                          </p>
                        </div>
                      </div>

                      {attachedAiDesign ? (
                        <div className="space-y-2">
                          <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-xs flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-left">
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                              <div>
                                <span className="font-bold text-[var(--text-primary)] block truncate max-w-[170px]">
                                  {attachedAiDesign.headline}
                                </span>
                                <span className="text-[10px] text-[var(--text-secondary)]">Diseño IA Vinculado</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsAiDesignDrawerOpen(true)}
                              className="px-2.5 py-1 rounded-lg bg-primary text-white text-[11px] font-bold"
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <CTAButton
                          type="button"
                          id="btn-open-ai-drawer-step6"
                          onClick={() => setIsAiDesignDrawerOpen(true)}
                          className="w-full !py-3 !text-xs !bg-primary hover:!bg-[var(--color-primary-hover)] !rounded-xl"
                          celebrationMessage="¡Asistente de Diseño IA Listo! 🥂✨"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Abrir Asistente de Diseño IA</span>
                        </CTAButton>
                      )}
                    </div>
                  </div>

                  {/* GOOGLE DRIVE CARPETA / ARCHIVO */}
                  <div className="pt-2">
                    <GoogleDriveAttachment
                      initialDriveUrl={driveAttachment?.driveUrl}
                      onAttachDriveUrl={(data) => setDriveAttachment(data)}
                      onClearDriveUrl={() => setDriveAttachment(null)}
                    />
                  </div>
                </div>
              ) : (
                /* BULK MODE FILE ATTACHMENTS OVERVIEW */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-black border border-[var(--border-subtle)] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        Estado de Archivos por Corte ({bulkItems.filter((i) => i.fileAttachment || i.isAiDesign).length} de {bulkItems.length} listos)
                      </h4>
                      {uploadedFileName && (
                        <button
                          type="button"
                          onClick={() =>
                            handleApplyFileToAll({
                              name: uploadedFileName,
                              sizeBytes: uploadedFileSize || 0,
                            })
                          }
                          className="text-xs text-primary font-bold hover:underline"
                        >
                          Aplicar archivo principal a todos
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {bulkItems.map((item, idx) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-bold text-primary">#{idx + 1}</span>
                            <div>
                              <strong className="text-[var(--text-primary)] block">{item.label}</strong>
                              <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                                {item.widthCm}×{item.heightCm} cm ({item.quantity} u.)
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.fileAttachment ? (
                              <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-[11px] flex items-center gap-1">
                                <FileCheck className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[140px]">{item.fileAttachment.name}</span>
                              </div>
                            ) : item.isAiDesign ? (
                              <div className="px-2.5 py-1 rounded-lg bg-accent text-black font-bold text-[11px] flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Póster IA</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium inline-flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.85} />
                                Sin archivo asignado
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => openAttachModal(item)}
                              className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-bold hover:bg-[var(--color-primary-hover)] transition-colors"
                            >
                              {item.fileAttachment || item.isAiDesign ? "Cambiar" : "Adjuntar"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GLOBAL GOOGLE DRIVE FOLDER FOR THE BULK ORDER */}
                  <div className="pt-2">
                    <GoogleDriveAttachment
                      initialDriveUrl={driveAttachment?.driveUrl}
                      onAttachDriveUrl={(data) => {
                        setDriveAttachment(data);
                        handleApplyFileToAll({
                          name: data.name,
                          driveUrl: data.driveUrl,
                          isDriveFolder: data.isDriveFolder,
                          type: "google_drive",
                        });
                      }}
                      onClearDriveUrl={() => setDriveAttachment(null)}
                    />
                  </div>
                </div>
              )}

              {/* CONTINUAR DESDE ARCHIVOS */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(9)}
                  className="px-6 py-2.5 rounded-[7px] bg-primary hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Ver Resumen Final</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 9: RESUMEN Y AGREGAR AL CARRITO ================= */}
          {currentStep === 9 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(8)}
                    className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Archivo y diseño</span>
                  </button>
                  <span className="text-[var(--text-muted)]">/</span>
                  <span className="text-[var(--text-primary)] font-medium">Resumen Final</span>
                </div>
                <h2 className="font-heading text-2xl text-[var(--text-primary)] font-medium">
                  {orderMode === "bulk" ? "Resumen de Pedido por Lotes" : "Resumen de tu Cotización"}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
                  Verificá las especificaciones técnicas completas antes de confirmar tu pedido.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-black border border-[var(--border-subtle)] space-y-6">
                {/* PRINT-ONLY OFFICIAL HEADER */}
                <div className="print-only-header">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-primary">
                    <div>
                      <h1 className="text-xl font-bold font-heading text-black tracking-tight">
                        CARTELES.CLICK · TALLER DE MANUFACTURA GRÁFICA
                      </h1>
                      <p className="text-xs text-gray-600">
                        Gran Formato · Ploteo & Cama Plana UV · Corpóreos & Letras 3D · carteles.ploteos@gmail.com
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <span className="font-bold block text-primary">PRESUPUESTO ESTIMADO</span>
                      <span className="text-gray-500 font-mono">
                        {new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BULK BREAKDOWN TABLE OR SINGLE BREAKDOWN */}
                {orderMode === "bulk" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        Detalle de Ítems en el Lote ({bulkItems.length} cortes):
                      </h4>
                      <span className="text-xs font-mono font-bold text-primary">
                        Total {bulkSummary.totalUnits} unidades · {bulkSummary.totalM2} m²
                      </span>
                    </div>

                    {isLoadingQuote ? (
                      <QuoteTableSkeleton rows={bulkItems.length} />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)] font-mono text-[11px]">
                              <th className="py-2.5 px-3">Corte / Identificador</th>
                              <th className="py-2.5 px-3">Medidas</th>
                              <th className="py-2.5 px-3 text-center">Cant.</th>
                              <th className="py-2.5 px-3">Superficie</th>
                              <th className="py-2.5 px-3">Diseño</th>
                              <th className="py-2.5 px-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border-subtle)]">
                            {bulkItems.map((item, idx) => {
                              const m2 = ((item.widthCm * item.heightCm) / 10000) * item.quantity;
                              return (
                                <tr key={item.id} className="hover:bg-[var(--bg-surface-subtle)]">
                                  <td className="py-2.5 px-3 font-medium text-[var(--text-primary)]">
                                    #{idx + 1} {item.label}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono">
                                    {item.widthCm} × {item.heightCm} cm
                                  </td>
                                  <td className="py-2.5 px-3 font-mono-num text-center">
                                    {item.quantity} u.
                                  </td>
                                  <td className="py-2.5 px-3 font-mono">
                                    {m2.toFixed(2)} m²
                                  </td>
                                  <td className="py-2.5 px-3">
                                    {item.fileAttachment ? (
                                      <span className="text-emerald-500 font-mono truncate max-w-[120px] inline-flex items-center gap-1" title={item.fileAttachment.name}>
                                        <Paperclip className="w-3 h-3 shrink-0" strokeWidth={1.85} />
                                        <span className="truncate">{item.fileAttachment.name}</span>
                                      </span>
                                    ) : item.isAiDesign ? (
                                      <span className="text-accent font-bold inline-flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 shrink-0" strokeWidth={1.85} />
                                        Póster IA
                                      </span>
                                    ) : (
                                      <span className="text-[var(--text-muted)]">Pendiente</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono-num font-bold text-primary">
                                    {item.isLoading ? (
                                      <span className="animate-pulse text-xs text-[var(--text-muted)]">Calculando...</span>
                                    ) : item.quoteData?.totalPriceARS ? (
                                      formatPrice(item.quoteData.totalPriceARS)
                                    ) : (
                                      "—"
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--text-secondary)] block text-[11px]">Material</span>
                      <strong className="text-[var(--text-primary)]">{currentMaterial?.name || "—"}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--text-secondary)] block text-[11px]">Medidas</span>
                      <strong className="text-[var(--text-primary)]">
                        {currentMaterial?.mode !== "unidad" ? `${widthCm}×${heightCm} cm` : "Unidad estándar"}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--text-secondary)] block text-[11px]">Cantidad</span>
                      <strong className="text-[var(--text-primary)] font-mono-num">{quantity} u.</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--text-secondary)] block text-[11px]">Superficie total</span>
                      <strong className="text-[var(--text-primary)] font-mono-num">
                        {quoteData?.calculatedAreaM2 ? `${(quoteData.calculatedAreaM2 * quantity).toFixed(2)} m²` : "—"}
                      </strong>
                    </div>
                  </div>
                )}

                {/* QUALITY & INKS SUMMARY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <span className="text-[var(--text-secondary)] block text-[11px]">Calidad</span>
                      <strong className="text-[var(--text-primary)]">
                        {printQuality === "alta_resolucion" ? "Alta Resolución (1440-2880 DPI)" : "Resolución Estándar"}
                      </strong>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <span className="text-[var(--text-secondary)] block text-[11px]">Tintas</span>
                      <strong className="text-[var(--text-primary)]">
                        {inkType === "uv" ? "UV LED" : inkType === "directa_uv" ? "Directa UV Cama Plana" : "Solvente"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* FINISHINGS LIST */}
                <div className="pt-2">
                  <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] block mb-2 font-medium">
                    Terminaciones de confección aplicadas:
                  </span>
                  {selectedFinishings.length === 0 ? (
                    <span className="text-xs text-[var(--text-secondary)]">Sin terminaciones adicionales</span>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedFinishings.map((f) => (
                        <div
                          key={f}
                          className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]"
                        >
                          <span className="text-[var(--text-primary)] font-medium capitalize">
                            {f.replace(/_/g, " ")}
                          </span>
                          <span className="font-mono text-primary font-bold">
                            Confección incluida
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* PRE-PRODUCTION PRINT READINESS CHECKLIST */}
                <div className="pt-2">
                  <PrintReadinessChecklist
                    title="Checklist Pre-Producción (Print Readiness)"
                    description="Validá los parámetros clave de taller antes de autorizar la impresión o corte."
                    defaultCollapsed={true}
                  />
                </div>

                {addedSuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-500 text-white text-center font-bold text-sm flex items-center justify-center gap-2 animate-in zoom-in-95">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {orderMode === "bulk"
                        ? `¡Lote de ${bulkItems.length} cortes agregado al carrito exitosamente!`
                        : "¡Agregado al carrito exitosamente!"}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <AddToCartButton
                      id="btn-confirm-add-cart"
                      onAddToCart={handleAddToCart}
                      label={
                        orderMode === "bulk"
                          ? `Agregar Lote Completo al Carrito (${bulkSummary.totalUnits} piezas · ${formatPrice(bulkSummary.totalPriceARS)})`
                          : "Agregar al Carrito de Impresión"
                      }
                      successLabel={
                        orderMode === "bulk"
                          ? `¡Lote de ${bulkItems.length} cortes agregado!`
                          : "¡Agregado al Carrito!"
                      }
                      itemDetails={{
                        name: orderMode === "bulk" ? `Lote de ${bulkItems.length} cortes` : (currentMaterial?.name || "Corte a medida"),
                        quantity: orderMode === "bulk" ? bulkSummary.totalUnits : quantity,
                        dimensions: orderMode === "bulk" ? undefined : `${widthCm}×${heightCm} cm`,
                        priceARS: orderMode === "bulk" ? bulkSummary.totalPriceARS : (quoteData?.totalPriceARS || 0),
                      }}
                      priceARS={orderMode === "bulk" ? bulkSummary.totalPriceARS : (quoteData?.totalPriceARS || 0)}
                      icon={<Package className="w-5 h-5" />}
                      className="w-full"
                    />

                    <button
                      type="button"
                      id="btn-download-quote-pdf-step7"
                      onClick={handleDownloadQuotePdf}
                      disabled={isGeneratingPdf}
                      className="w-full py-3 px-4 rounded-xl border border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingPdf ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                      ) : (
                        <Download className="w-4 h-4 text-primary" />
                      )}
                      <span>
                        {isGeneratingPdf ? "Generando Presupuesto..." : "Descargar Presupuesto en PDF (Validez 15 días)"}
                      </span>
                    </button>

                    <button
                      type="button"
                      id="btn-print-quote-step9"
                      onClick={() => window.print()}
                      className="w-full py-2.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      title="Imprimir o guardar como PDF desde el navegador"
                    >
                      <Printer className="w-4 h-4 text-primary" />
                      <span>Imprimir Presupuesto (Vista de Impresión)</span>
                    </button>
                  </div>
                )}
                <div className="text-center mt-3 text-xs font-medium text-[var(--text-secondary)] no-print">
                  Compra rápida · Bulk order · Envíos a todo el país
                </div>

                {/* PRINT-ONLY FOOTER */}
                <div className="print-only-footer">
                  <p>Carteles.Click · Taller Central de Manufactura Gráfica · Presupuesto con validez por 15 días corridos · Precios en ARS sujetos a variación cambiaria · carteles.ploteos@gmail.com</p>
                </div>
              </div>
            </div>
          )}

          {/* WIZARD NAVIGATION CONTROLS */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-5 py-2.5 rounded-[7px] border border-[var(--border-subtle)] bg-white dark:bg-black text-xs font-medium text-[var(--text-primary)] hover:border-primary flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.85} />
                <span>Ir atrás</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-[7px] bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Ir a inicio</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY LIVE SERVER PRICE PANEL */}
        <div className="lg:col-span-4 sticky top-20">
          <div className="p-5 sm:p-6 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider font-heading font-medium text-[var(--text-secondary)] block">
                  Cotización en Vivo
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-sans">
                  {orderMode === "bulk" ? "Pedido por Lote (Bulk Order)" : "Taller Central · Gran Formato"}
                </span>
              </div>
              <CurrencySelector variant="pill" />
            </div>

            {/* PROGRESS SKELETON WHILE FETCHING */}
            {isLoadingQuote ? (
              <div className="space-y-4 py-2">
                <QuoteLiveSummarySkeleton />
              </div>
            ) : (
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Material:</span>
                  <strong className="text-[var(--text-primary)] truncate max-w-[160px] text-right font-medium">
                    {currentMaterial?.name ? currentMaterial.name.split("(")[0] : "—"}
                  </strong>
                </div>

                {orderMode === "individual" ? (
                  <>
                    {currentMaterial?.mode !== "unidad" && (
                      <div className="flex justify-between text-[var(--text-secondary)]">
                        <span>Dimensiones:</span>
                        <span className="font-mono-num text-[var(--text-primary)] font-medium">
                          {widthCm} × {heightCm} cm
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-[var(--text-secondary)]">
                      <span>Cantidad:</span>
                      <span className="font-mono-num text-[var(--text-primary)] font-medium">
                        {quantity} unid.
                      </span>
                    </div>

                    {quoteData?.effectiveBillableAreaM2 && (
                      <div className="flex justify-between text-[var(--text-secondary)]">
                        <span>Superficie facturada:</span>
                        <span className="font-mono-num text-[var(--text-primary)] font-medium">
                          {quoteData.effectiveBillableAreaM2} m²
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-[var(--text-secondary)]">
                      <span>Cortes configurados:</span>
                      <span className="font-mono-num text-[var(--text-primary)] font-medium">
                        {bulkSummary.totalItems} medidas distintas
                      </span>
                    </div>
                    <div className="flex justify-between text-[var(--text-secondary)]">
                      <span>Total piezas:</span>
                      <span className="font-mono-num text-[var(--text-primary)] font-medium">
                        {bulkSummary.totalUnits} unidades
                      </span>
                    </div>
                    <div className="flex justify-between text-[var(--text-secondary)]">
                      <span>Superficie acumulada:</span>
                      <span className="font-mono-num text-primary font-bold">
                        {bulkSummary.totalM2} m²
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Calidad:</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {printQuality === "alta_resolucion" ? "Alta Res." : "Estándar"}
                  </span>
                </div>

                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Tintas:</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {inkType === "uv" ? "UV LED" : inkType === "directa_uv" ? "Directa UV" : "Solvente"}
                  </span>
                </div>
              </div>
            )}

            {/* TOTAL PRICE BOX */}
            <div className="p-4 rounded-[7px] bg-primary text-white space-y-1">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/90">
                <span>Total Final Cotizado:</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-[5px] bg-white/20 font-medium">
                  {currency}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="font-heading text-2xl sm:text-3xl text-white font-mono-num font-bold">
                  {isLoadingQuote ? (
                    <QuotePriceSkeleton />
                  ) : orderMode === "bulk" ? (
                    formatPrice(bulkSummary.totalPriceARS)
                  ) : quoteData ? (
                    formatPrice(quoteData.totalPriceARS ?? 0)
                  ) : (
                    <span className="text-sm text-white/80">—</span>
                  )}
                </span>
              </div>
              {!isLoadingQuote && orderMode === "individual" && quantity > 1 && quoteData?.unitPriceARS ? (
                <p className="text-[10px] text-white/85 font-mono-num pt-0.5">
                  ({formatPrice(quoteData.unitPriceARS)} por unidad)
                </p>
              ) : !isLoadingQuote && orderMode === "bulk" && bulkSummary.totalUnits > 0 ? (
                <p className="text-[10px] text-white/85 font-mono-num pt-0.5">
                  ({bulkSummary.totalUnits} piezas en el pedido)
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] font-sans">
              <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Precio definitivo oficial · Sin recargos al retirar</span>
            </div>

            <button
              type="button"
              id="btn-download-quote-pdf-live"
              onClick={handleDownloadQuotePdf}
              disabled={isGeneratingPdf || (orderMode === "individual" && !quoteData) || (orderMode === "bulk" && bulkItems.length === 0)}
              className="w-full py-2.5 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:bg-[var(--border-subtle)]/40 text-[var(--text-primary)] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
            >
              {isGeneratingPdf ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-primary" />
              )}
              <span>{isGeneratingPdf ? "Descargando..." : "Descargar Presupuesto PDF"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: ATTACH DESIGN / DRIVE / AI TO A SPECIFIC BULK ROW */}
      {activeAttachItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Adjuntar Diseño a "{activeAttachItem.label}"
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Medida: {activeAttachItem.widthCm} × {activeAttachItem.heightCm} cm ({activeAttachItem.quantity} unid.)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveAttachItem(null)}
                className="p-1.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ATTACH TABS */}
            <div className="flex p-1 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setAttachTab("file")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  attachTab === "file"
                    ? "bg-primary text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Archivo Local</span>
              </button>
              <button
                type="button"
                onClick={() => setAttachTab("drive")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  attachTab === "drive"
                    ? "bg-primary text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Google Drive</span>
              </button>
              <button
                type="button"
                onClick={() => setAttachTab("ai")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  attachTab === "ai"
                    ? "bg-accent text-black shadow-sm font-bold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Póster IA</span>
              </button>
            </div>

            {/* TAB CONTENT: FILE UPLOAD */}
            {attachTab === "file" && (
              <div className="space-y-4 text-center">
                <div className="border-2 border-dashed border-[var(--border-subtle)] hover:border-primary p-8 rounded-2xl transition-colors space-y-3">
                  <UploadCloud className="w-10 h-10 text-primary mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">
                      Seleccioná o arrastrá el archivo para este corte
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                      PDF en curvas, TIFF, JPG o PNG a 150 DPI
                    </p>
                  </div>
                  <label className="inline-block px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[var(--color-primary-hover)] transition-colors cursor-pointer">
                    <span>Examinar Archivos</span>
                    <input
                      type="file"
                      accept=".pdf,.tif,.tiff,.jpg,.jpeg,.png"
                      onChange={handleFileUploadForActiveItem}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB CONTENT: GOOGLE DRIVE LINK */}
            {attachTab === "drive" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase font-mono text-[var(--text-secondary)]">
                    Enlace compartido de Google Drive
                  </label>
                  <input
                    type="url"
                    value={tempDriveUrl}
                    onChange={(e) => setTempDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase font-mono text-[var(--text-secondary)]">
                    Nombre o descripción del archivo / carpeta
                  </label>
                  <input
                    type="text"
                    value={tempDriveName}
                    onChange={(e) => setTempDriveName(e.target.value)}
                    placeholder="ej. Vidriera Principal (Drive)"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={isDriveFolder}
                    onChange={(e) => setIsDriveFolder(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span>Es un enlace a una carpeta compartida</span>
                </label>

                <button
                  type="button"
                  disabled={!tempDriveUrl.trim()}
                  onClick={() =>
                    handleSaveAttachment({
                      name: tempDriveName.trim() || "Archivo Google Drive",
                      driveUrl: tempDriveUrl.trim(),
                      isDriveFolder,
                      type: "google_drive",
                    })
                  }
                  className="w-full py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors"
                >
                  Guardar Enlace de Drive
                </button>
              </div>
            )}

            {/* TAB CONTENT: DESIGN WITH AI */}
            {attachTab === "ai" && (
              <div className="space-y-4 text-center">
                <div className="p-6 rounded-2xl bg-[var(--bg-surface-subtle)] border border-primary/20 space-y-3">
                  <Sparkles className="w-8 h-8 text-primary mx-auto" />
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    Marcar para Diseñar con IA
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Este corte se marcará para diagramación con IA o podés abrir el Póster Creator ahora.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSaveAttachment(undefined, true)}
                      className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[var(--color-primary-hover)] transition-colors cursor-pointer"
                    >
                      Asignar diseño IA a este corte
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveAttachment(undefined, true);
                        setIsAiDesignDrawerOpen(true);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-accent text-black text-xs font-bold hover:bg-[var(--color-accent-hover)] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Abrir Asistente IA</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COLLAPSIBLE SIDE DRAWER FOR AI DESIGN & MOCKUP PREVIEW */}
      <AiDesignDrawer
        isOpen={isAiDesignDrawerOpen}
        onClose={() => setIsAiDesignDrawerOpen(false)}
        currentMaterialName={currentMaterial?.name || "Lona Frontlight"}
        currentWidthCm={orderMode === "individual" ? widthCm : activeAttachItem?.widthCm || 200}
        currentHeightCm={orderMode === "individual" ? heightCm : activeAttachItem?.heightCm || 100}
        onApplyDesign={handleApplyAiDesign}
      />
    </div>
  );
};
