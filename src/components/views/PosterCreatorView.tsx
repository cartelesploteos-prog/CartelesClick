import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Type,
  Palette,
  Sliders,
  ShoppingBag,
  Upload,
  Phone,
  MapPin,
  Instagram,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RefreshCw,
  Box,
  Layout,
  Image as ImageIcon,
  Plus,
  Trash2,
  RotateCw,
  Move,
  Layers,
  Sparkle,
  Tag,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  Compass,
  Check,
  X,
  FileImage,
  Copy,
  Maximize2,
  Ruler,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Info,
  Gauge,
  Mic,
  MicOff,
  Volume2,
} from "lucide-react";
import {
  PosterDesignState,
  PosterForegroundElement,
  PosterPatternType,
  PosterBackgroundMode,
} from "../../types";
import { useCartStore } from "../../store/useCartStore";
import { useCurrencyStore } from "../../store/useCurrencyStore";
import { useTranslation } from "react-i18next";
import { PosterWallR3F } from "../PosterWallR3F";
import { runPreflightInspection, PreflightResult } from "../../utils/preflightCheck";
import { BorderBeam } from "../ui/BorderBeam";
import { useVoiceRecognition } from "../../hooks/useVoiceRecognition";
import { AddToCartButton } from "../ui/AddToCartButton";
import { PrintReadinessChecklist } from "../ui/PrintReadinessChecklist";

interface PosterCreatorViewProps {
  initialPrompt?: string;
  onNavigate: (view: string, param?: string) => void;
}

// Background image curated presets for workshop signage
const backgroundPresets = [
  {
    id: "none",
    name: "Sin imagen (Color/Degradé)",
    url: "",
  },
  {
    id: "concrete-wall",
    name: "Muro de Concreto Urbano",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "workshop-dark",
    name: "Taller Industrial / Metal",
    url: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "brick-facade",
    name: "Pared Ladrillo a la Vista",
    url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "canvas-texture",
    name: "Textura Lona Gráfica Mate",
    url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "minimal-studio",
    name: "Estudio Neutro Cálido",
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
  },
];

// Pre-made commercial badge stickers ready to drop onto the poster
const badgeLibrary = [
  { text: "★ 50% OFF ★", style: "brick" as const, title: "Descuento 50%" },
  { text: "PROMO EXCLUSIVA", style: "graphite" as const, title: "Promo Exclusiva" },
  { text: "CALIDAD PREMIUM", style: "craft" as const, title: "Sello de Calidad" },
  { text: "ENVÍOS A TODO EL PAÍS", style: "concrete" as const, title: "Envíos Nacionales" },
  { text: "NUEVA TEMPORADA", style: "brick" as const, title: "Novedad" },
  { text: "3 Y 6 CUOTAS SIN INTERÉS", style: "graphite" as const, title: "Cuotas" },
  { text: "STOCK LIMITADO", style: "craft" as const, title: "Urgencia" },
  { text: "★ CARTELES.CLICK ★", style: "brick" as const, title: "Marca Oficial" },
];

export const PosterCreatorView: React.FC<PosterCreatorViewProps> = ({
  initialPrompt,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const { addItem } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const posterRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<
    "texts" | "background" | "images" | "stickers" | "canvas"
  >("texts");
  const [previewMode, setPreviewMode] = useState<"3d" | "2d">("2d");

  // Selected foreground object for dragging / scaling / rotating
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragOverCanvas, setDragOverCanvas] = useState(false);
  const [preflightModal, setPreflightModal] = useState<{
    result: PreflightResult;
    fileUrl: string;
    targetType: "foreground" | "background" | "ask";
  } | null>(null);
  const [isInspectingFile, setIsInspectingFile] = useState(false);

  // Thickness selectors for PVC and PAI
  const [pvcThickness, setPvcThickness] = useState<"3 mm" | "5 mm">("3 mm");
  const [paiThickness, setPaiThickness] = useState<"1 mm" | "2 mm" | "3 mm">("2 mm");

  // Special custom size inputs (in cm)
  const [customWidth, setCustomWidth] = useState<number>(200);
  const [customHeight, setCustomHeight] = useState<number>(100);

  // Pricing configuration from server
  const [pricingConfig, setPricingConfig] = useState<{
    aiDesignFeeARS: number;
    finishingPrices: Record<string, { basePriceARS: number; calculationType: string }>;
  }>({
    aiDesignFeeARS: 3500,
    finishingPrices: {
      ojales_50cm: { basePriceARS: 600, calculationType: "per_perimeter_meter" },
      ojales_esquinas: { basePriceARS: 1800, calculationType: "fixed" },
      bolsillo_sup_inf: { basePriceARS: 1200, calculationType: "per_width_meter" },
      bolsillo_lateral: { basePriceARS: 1200, calculationType: "per_height_meter" },
      refuerzo_perimetral: { basePriceARS: 800, calculationType: "per_perimeter_meter" },
      soldado_termico: { basePriceARS: 1500, calculationType: "per_perimeter_meter" },
      dobladillo_simple: { basePriceARS: 500, calculationType: "per_perimeter_meter" },
      corte_a_medida: { basePriceARS: 0, calculationType: "fixed" },
    },
  });

  useEffect(() => {
    fetch("/api/pricing-config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.aiDesignFeeARS !== undefined) {
          setPricingConfig(data);
        }
      })
      .catch((err) => console.log("Usando configuración de precios por defecto:", err));
  }, []);

  // Initial Design State with interactive, movable, and scalable text layers
  const [design, setDesign] = useState<PosterDesignState>(() => {
    const decodedPrompt = initialPrompt ? decodeURIComponent(initialPrompt) : "";
    return {
      headline: decodedPrompt ? decodedPrompt.toUpperCase() : "GRAN LIQUIDACIÓN DE TEMPORADA",
      subheadline: "Hasta 50% de descuento en artículos seleccionados",
      bodyText:
        "Aprovechá ofertas imperdibles por tiempo limitado. Calidad garantizada y cuotas sin interés.",
      contactAddress: "Av. Corrientes 1450, CABA",
      contactPhone: "+54 11 4892-1100",
      contactWhatsapp: "+54 9 11 5590-4421",
      contactInstagram: "@mitienda.oficial",
      fontHeading: "display",
      alignment: "center",
      themePalette: "brand-brick",
      primaryColor: "[var(--brand-brick)]",
      accentColor: "#C5BAAA",
      backgroundColor: "#18191E",
      textColor: "#FAF8F5",
      outputFormat: "portabanner_80x200",
      customWidthCm: 200,
      customHeightCm: 100,
      selectedThickness: "3 mm",
      backgroundMode: "solid",
      gradientConfig: {
        type: "linear",
        color1: "[var(--brand-brick)]",
        color2: "#18191E",
        angle: 135,
        presetId: "brick-graphite",
      },
      texture: "none",
      textureOpacity: 0.12,
      backgroundImageUrl: undefined,
      backgroundImageOpacity: 0.35,
      backgroundImageFilter: "darken",
      foregroundElements: [
        {
          id: "text-headline",
          type: "text",
          textRole: "headline",
          text: decodedPrompt ? decodedPrompt.toUpperCase() : "GRAN LIQUIDACIÓN DE TEMPORADA",
          x: 50,
          y: 22,
          scale: 1.0,
          rotation: 0,
          fontSize: 22,
          fontWeight: "bold",
          fontFamily: "display",
          color: "[var(--brand-brick)]",
          align: "center",
        },
        {
          id: "text-subheadline",
          type: "text",
          textRole: "subheadline",
          text: "Hasta 50% de descuento en artículos seleccionados",
          x: 50,
          y: 35,
          scale: 1.0,
          rotation: 0,
          fontSize: 14,
          fontWeight: "medium",
          fontFamily: "sans",
          color: "#C5BAAA",
          align: "center",
        },
        {
          id: "text-body",
          type: "text",
          textRole: "body",
          text: "Aprovechá ofertas imperdibles por tiempo limitado. Calidad garantizada y cuotas sin interés.",
          x: 50,
          y: 52,
          scale: 1.0,
          rotation: 0,
          fontSize: 12,
          fontWeight: "normal",
          fontFamily: "sans",
          color: "#FAF8F5",
          align: "center",
        },
        {
          id: "badge-initial",
          type: "badge",
          text: "★ 50% OFF ★",
          title: "Descuento",
          x: 80,
          y: 12,
          scale: 1.0,
          rotation: 10,
          badgeStyle: "brick",
        },
        {
          id: "text-contact",
          type: "text",
          textRole: "contact",
          text: "Av. Corrientes 1450, CABA · WhatsApp: +54 9 11 5590-4421 · @mitienda.oficial",
          x: 50,
          y: 88,
          scale: 1.0,
          rotation: 0,
          fontSize: 10,
          fontWeight: "normal",
          fontFamily: "sans",
          color: "#FAF8F5",
          align: "center",
        },
      ],
    };
  });

  // AI Assistant state
  const [aiTopic, setAiTopic] = useState(() => (initialPrompt ? decodeURIComponent(initialPrompt) : ""));
  const [aiPurpose, setAiPurpose] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  // Browser-based Voice Recognition for hands-free design description
  const {
    isListening: isVoiceListening,
    isSupported: isVoiceSupported,
    startListening: startVoiceListening,
    stopListening: stopVoiceListening,
    error: voiceError,
  } = useVoiceRecognition({
    lang: "es-AR",
    onResult: (spokenText) => {
      setAiTopic((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
    },
  });

  // Predefined color presets (Strict palette: Brick, Graphite, Concrete, Craft)
  const colorPresets = [
    {
      id: "brand-brick",
      name: "Estudio Brick & Graphite",
      bg: "#2C2C2C",
      text: "#FAF8F5",
      primary: "#EE7828",
      accent: "#C5BAAA",
    },
    {
      id: "craft-concrete",
      name: "Craft Taller & Concrete",
      bg: "#FAF8F5",
      text: "#2C2C2C",
      primary: "#806D61",
      accent: "#EE7828",
    },
    {
      id: "pure-graphite",
      name: "Graphite & Bright Brick",
      bg: "#1E1E1E",
      text: "#FFFFFF",
      primary: "#EE7828",
      accent: "#806D61",
    },
    {
      id: "clean-concrete",
      name: "Concrete Claro & Brick",
      bg: "#F2EFE9",
      text: "#2C2C2C",
      primary: "#EE7828",
      accent: "#806D61",
    },
  ];

  // Gradient presets
  const gradientPresets = [
    {
      id: "brick-graphite",
      name: "Brick a Graphite (Diagonal)",
      color1: "#EE7828",
      color2: "#2C2C2C",
      type: "linear" as const,
      angle: 135,
    },
    {
      id: "graphite-deep",
      name: "Graphite Profundo a Negro",
      color1: "#2C2C2C",
      color2: "#121212",
      type: "linear" as const,
      angle: 180,
    },
    {
      id: "craft-warm",
      name: "Craft Madera a Concrete",
      color1: "#806D61",
      color2: "#C5BAAA",
      type: "linear" as const,
      angle: 90,
    },
    {
      id: "brick-flare",
      name: "Destello Solar Brick",
      color1: "#EE7828",
      color2: "#806D61",
      type: "linear" as const,
      angle: 45,
    },
    {
      id: "radial-brick",
      name: "Radial Foco Central Brick",
      color1: "#EE7828",
      color2: "#1E1E1E",
      type: "radial" as const,
      angle: 0,
    },
    {
      id: "concrete-soft",
      name: "Concrete Suave a Blanco",
      color1: "#F2EFE9",
      color2: "#C5BAAA",
      type: "linear" as const,
      angle: 180,
    },
  ];

  // Pattern choices
  const patternChoices: { id: PosterPatternType; name: string; desc: string }[] = [
    { id: "none", name: "Liso", desc: "Sin trama" },
    { id: "dots", name: "Puntos", desc: "Puntos offset" },
    { id: "grid", name: "Cuadrícula", desc: "Grilla técnica" },
    { id: "diagonal", name: "Diagonales", desc: "Líneas de taller" },
    { id: "crosshatch", name: "Cruzado", desc: "Trama intersectada" },
    { id: "halftone", name: "Imprenta", desc: "Efecto Offset / Halftone" },
    { id: "blueprint", name: "Milimetrado", desc: "Plano de arquitectura" },
    { id: "stripes", name: "Franjas", desc: "Rayas dinámicas" },
  ];

  const handleApplyColorPreset = (preset: (typeof colorPresets)[0]) => {
    setDesign((prev) => ({
      ...prev,
      themePalette: preset.id,
      backgroundColor: preset.bg,
      textColor: preset.text,
      primaryColor: preset.primary,
      accentColor: preset.accent,
      backgroundMode: "solid",
      foregroundElements: (prev.foregroundElements || []).map((el) => {
        if (el.type === "text") {
          if (el.textRole === "headline") return { ...el, color: preset.primary };
          if (el.textRole === "subheadline") return { ...el, color: preset.accent };
          return { ...el, color: preset.text };
        }
        return el;
      }),
    }));
  };

  const handleApplyGradientPreset = (preset: (typeof gradientPresets)[0]) => {
    setDesign((prev) => ({
      ...prev,
      backgroundMode: "gradient",
      gradientConfig: {
        type: preset.type,
        color1: preset.color1,
        color2: preset.color2,
        angle: preset.angle,
        presetId: preset.id,
      },
    }));
  };

  // Add a new foreground element (badge, uploaded image, or custom text)
  const addForegroundElement = (
    elem: Omit<PosterForegroundElement, "id">
  ) => {
    const newId = `elem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newElem: PosterForegroundElement = {
      ...elem,
      id: newId,
    };
    setDesign((prev) => ({
      ...prev,
      foregroundElements: [...(prev.foregroundElements || []), newElem],
    }));
    setSelectedElementId(newId);
  };

  // Add a new custom movable text layer
  const handleAddNewTextLayer = () => {
    addForegroundElement({
      type: "text",
      textRole: "custom",
      text: "NUEVO TEXTO EDITABLE",
      x: 50,
      y: 50,
      scale: 1.0,
      rotation: 0,
      fontSize: 16,
      fontWeight: "bold",
      fontFamily: design.fontHeading || "display",
      color: design.primaryColor || "#EE7828",
      align: design.alignment || "center",
    });
  };

  // Remove a foreground element
  const removeForegroundElement = (id: string) => {
    setDesign((prev) => ({
      ...prev,
      foregroundElements: (prev.foregroundElements || []).filter((e) => e.id !== id),
    }));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  // Duplicate a foreground element
  const duplicateForegroundElement = (id: string) => {
    const original = design.foregroundElements?.find((e) => e.id === id);
    if (!original) return;
    const newId = `elem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const copyElem: PosterForegroundElement = {
      ...original,
      id: newId,
      x: Math.min(90, (original.x || 50) + 4),
      y: Math.min(90, (original.y || 50) + 4),
    };
    setDesign((prev) => ({
      ...prev,
      foregroundElements: [...(prev.foregroundElements || []), copyElem],
    }));
    setSelectedElementId(newId);
  };

  // Update a specific foreground element property
  const updateForegroundElement = (
    id: string,
    updates: Partial<PosterForegroundElement>
  ) => {
    setDesign((prev) => ({
      ...prev,
      foregroundElements: (prev.foregroundElements || []).map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  };

  // Drag-and-drop file onto canvas handler
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCanvas(true);
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCanvas(false);
  };

  const handleInspectAndOpenPreflight = async (
    file: File,
    fileUrl: string,
    targetType: "foreground" | "background" | "ask"
  ) => {
    setIsInspectingFile(true);
    try {
      const result = await runPreflightInspection(
        file,
        design.customWidthCm || customWidth || 100,
        design.customHeightCm || customHeight || 100,
        file.name
      );
      setPreflightModal({
        result,
        fileUrl,
        targetType,
      });
    } catch (err) {
      console.error("Error inspecting file for preflight:", err);
      // Fallback: direct insert if preflight fails
      if (targetType === "foreground" || targetType === "ask") {
        addForegroundElement({
          type: "image",
          url: fileUrl,
          title: file.name,
          x: 50,
          y: 50,
          scale: 1.0,
          rotation: 0,
        });
      } else if (targetType === "background") {
        setDesign((prev) => ({ ...prev, backgroundImageUrl: fileUrl }));
      }
    } finally {
      setIsInspectingFile(false);
    }
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCanvas(false);

    // Check if dropped a file from desktop
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        handleInspectAndOpenPreflight(file, url, "ask");
        return;
      }
    }

    // Check if dropped a badge or sticker from library
    const stickerData = e.dataTransfer.getData("application/json");
    if (stickerData) {
      try {
        const parsed = JSON.parse(stickerData);
        const poster = posterRef.current;
        if (poster) {
          const rect = poster.getBoundingClientRect();
          const dropX = Math.max(5, Math.min(95, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
          const dropY = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
          addForegroundElement({
            ...parsed,
            x: dropX,
            y: dropY,
          });
        }
      } catch (err) {
        console.error("Error parsing dropped sticker:", err);
      }
    }
  };

  // On-canvas interactive object dragging with live pointer events
  const handlePointerDownElement = (
    e: React.PointerEvent,
    elemId: string
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedElementId(elemId);
    setIsDraggingCanvas(true);

    const poster = posterRef.current;
    if (!poster) return;

    const rect = poster.getBoundingClientRect();
    const elem = design.foregroundElements?.find((el) => el.id === elemId);
    if (!elem) return;

    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    const startElemX = elem.x;
    const startElemY = elem.y;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startPointerX;
      const deltaY = moveEvent.clientY - startPointerY;
      const deltaXPercent = (deltaX / rect.width) * 100;
      const deltaYPercent = (deltaY / rect.height) * 100;

      const newX = Math.max(2, Math.min(98, Math.round(startElemX + deltaXPercent)));
      const newY = Math.max(2, Math.min(98, Math.round(startElemY + deltaYPercent)));

      updateForegroundElement(elemId, { x: newX, y: newY });
    };

    const onPointerUp = () => {
      setIsDraggingCanvas(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // On-canvas interactive scaling via corner handle
  const handlePointerDownScale = (
    e: React.PointerEvent,
    elemId: string
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const elem = design.foregroundElements?.find((el) => el.id === elemId);
    if (!elem) return;

    const startPointerY = e.clientY;
    const startScale = elem.scale || 1.0;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaY = startPointerY - moveEvent.clientY;
      const scaleDelta = deltaY * 0.01;
      const newScale = Math.max(0.3, Math.min(3.0, +(startScale + scaleDelta).toFixed(2)));
      updateForegroundElement(elemId, { scale: newScale });
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    setAiAdvice(null);
    try {
      const response = await fetch("/api/ai/poster-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptTopic: aiTopic || "Comercio local / Promoción",
          purpose: aiPurpose || "Atracción peatonal y venta directa",
          currentHeadline: design.headline,
        }),
      });
      const data = await response.json();
      if (data && data.headline) {
        setDesign((prev) => {
          const newHeadline = data.headline || prev.headline;
          const newSubheadline = data.subheadline || prev.subheadline;
          const newBody = data.bodyText || prev.bodyText;
          const newPrimary = data.primaryColorHex || prev.primaryColor;
          const newAccent = data.accentColorHex || prev.accentColor;

          // Update text layers synchronised
          const updatedElements = (prev.foregroundElements || []).map((el) => {
            if (el.type === "text") {
              if (el.textRole === "headline") return { ...el, text: newHeadline, color: newPrimary };
              if (el.textRole === "subheadline") return { ...el, text: newSubheadline, color: newAccent };
              if (el.textRole === "body") return { ...el, text: newBody };
            }
            return el;
          });

          return {
            ...prev,
            headline: newHeadline,
            subheadline: newSubheadline,
            bodyText: newBody,
            primaryColor: newPrimary,
            accentColor: newAccent,
            fontHeading: data.fontHeadingRecommendation || prev.fontHeading,
            aiGeneratedPrompt: aiTopic,
            foregroundElements: updatedElements,
          };
        });

        if (data.compositionAdvice) {
          setAiAdvice(data.compositionAdvice);
        }
      }
    } catch (error) {
      console.error("Error generando póster con IA:", error);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Helper for computing format title, dimensions, category, and standard prices
  const getFormatDetails = () => {
    const aiFee = pricingConfig.aiDesignFeeARS || 3500;

    switch (design.outputFormat) {
      // Portabanners
      case "portabanner_80x200": {
        const baseMaterial = 76500;
        return {
          title: "Portabanner Roll-Up / Doble Tensor",
          materialId: "portabanner_doble_tensor",
          category: "portabanners" as const,
          widthCm: 80,
          heightCm: 200,
          basePriceARS: baseMaterial,
          finishingsPriceARS: 0,
          aiDesignFeeARS: aiFee,
          priceARS: baseMaterial + aiFee,
          desc: "Estructura desarmable + Lona 13 oz mate impresa en 1440 DPI",
        };
      }
      case "portabanner_90x190": {
        const baseMaterial = 68500;
        return {
          title: "Portabanner Araña / X 90×190 cm",
          materialId: "portabanner_x",
          category: "portabanners" as const,
          widthCm: 90,
          heightCm: 190,
          basePriceARS: baseMaterial,
          finishingsPriceARS: 0,
          aiDesignFeeARS: aiFee,
          priceARS: baseMaterial + aiFee,
          desc: "Estructura liviana en X con 4 ojales metálicos",
        };
      }
      case "portabanner_100x200": {
        const baseMaterial = 91500;
        return {
          title: "Portabanner Doble Tensor 100×200 cm",
          materialId: "portabanner_doble_tensor",
          category: "portabanners" as const,
          widthCm: 100,
          heightCm: 200,
          basePriceARS: baseMaterial,
          finishingsPriceARS: 0,
          aiDesignFeeARS: aiFee,
          priceARS: baseMaterial + aiFee,
          desc: "Formato ancho de máxima presencia comercial",
        };
      }

      // Placas de PVC Espumado (Placa base 122 x 244 cm)
      case "pvc_122x244_entera": {
        const base = pvcThickness === "5 mm" ? 216500 : 161500;
        return {
          title: `Placa PVC Espumado ${pvcThickness} (Entera 122×244 cm)`,
          materialId: pvcThickness === "5 mm" ? "pvc_5mm_entera" : "pvc_3mm_entera",
          category: "rigidos" as const,
          widthCm: 122,
          heightCm: 244,
          basePriceARS: base,
          finishingsPriceARS: 0,
          aiDesignFeeARS: aiFee,
          priceARS: base + aiFee,
          desc: `Placa entera 122×244 cm montada con vinilo fotográfico (${pvcThickness})`,
        };
      }
      case "pvc_122x122_media": {
        const base = pvcThickness === "5 mm" ? 114500 : 84500;
        return {
          title: `1/2 Placa PVC Espumado ${pvcThickness} (Cuadrada 122×122 cm)`,
          materialId: "pvc_media_placa",
          category: "rigidos" as const,
          widthCm: 122,
          heightCm: 122,
          basePriceARS: base,
          finishingsPriceARS: 0,
          aiDesignFeeARS: aiFee,
          priceARS: base + aiFee,
          desc: `Medio pliego cuadrado 122×122 cm en PVC ${pvcThickness}`,
        };
      }
      case "pvc_61x244_media": {
        const base = pvcThickness === "5 mm" ? 114500 : 84500;
        return {
          title: `1/2 Placa PVC Espumado ${pvcThickness} (Faja Tira 61×244 cm)`,
          materialId: "pvc_media_faja",
          category: "rigidos" as const,
          widthCm: 61,
          heightCm: 244,
          basePriceARS: base,
          finishingsPriceARS: 0,
          aiDesignFeeARS: aiFee,
          priceARS: base + aiFee,
          desc: `Medio pliego tira panorámica 61×244 cm en PVC ${pvcThickness}`,
        };
      }
      case "pvc_61x122_cuarto": {
        const base = pvcThickness === "5 mm" ? 60500 : 44500;
        return {
          title: `1/4 Placa PVC Espumado ${pvcThickness} (61×122 cm)`,
          materialId: "pvc_cuarto_placa",
          category: "rigidos" as const,
          widthCm: 61,
          heightCm: 122,
          basePriceARS: base,
          finishingsPriceARS: 0,
          aiDesignFeeARS: aiFee,
          priceARS: base + aiFee,
          desc: `Cuarto de pliego estándar 61×122 cm en PVC ${pvcThickness}`,
        };
      }

      // Placas de PAI - Poliestireno de Alto Impacto (Placa base 100 x 200 cm)
      case "pai_100x200_entera": {
        const base = paiThickness === "3 mm" ? 141500 : paiThickness === "2 mm" ? 111500 : 88500;
        return {
          title: `Placa PAI Alto Impacto ${paiThickness} (Entera 100×200 cm)`,
          materialId: "pai_entera",
          category: "rigidos" as const,
          widthCm: 100,
          heightCm: 200,
          basePriceARS: base,
          finishingsPriceARS: 0,
          aiDesignFeeARS: aiFee,
          priceARS: base + aiFee,
          desc: `Placa entera 100×200 cm rígida lavable (${paiThickness})`,
        };
      }
      case "pai_100x100_media": {
        const base = paiThickness === "3 mm" ? 74500 : paiThickness === "2 mm" ? 58500 : 45500;
        return {
          title: `1/2 Placa PAI ${paiThickness} (Cuadrada 100×100 cm)`,
          materialId: "pai_media_placa",
          category: "rigidos" as const,
          widthCm: 100,
          heightCm: 100,
          basePriceARS: base,
          finishingsPriceARS: 0,
          aiDesignFeeARS: aiFee,
          priceARS: base + aiFee,
          desc: `Medio pliego 100×100 cm en PAI ${paiThickness}`,
        };
      }
      case "pai_50x200_media": {
        const base = paiThickness === "3 mm" ? 74500 : paiThickness === "2 mm" ? 58500 : 45500;
        return {
          title: `1/2 Placa PAI ${paiThickness} (Faja Tira 50×200 cm)`,
          materialId: "pai_media_faja",
          category: "rigidos" as const,
          widthCm: 50,
          heightCm: 200,
          basePriceARS: base,
          finishingsPriceARS: 0,
          aiDesignFeeARS: aiFee,
          priceARS: base + aiFee,
          desc: `Medio pliego tira vertical 50×200 cm en PAI ${paiThickness}`,
        };
      }
      case "pai_50x100_cuarto": {
        const base = paiThickness === "3 mm" ? 38500 : paiThickness === "2 mm" ? 30500 : 23500;
        return {
          title: `1/4 Placa PAI ${paiThickness} (50×100 cm)`,
          materialId: "pai_cuarto_placa",
          category: "rigidos" as const,
          widthCm: 50,
          heightCm: 100,
          basePriceARS: base,
          finishingsPriceARS: 0,
          aiDesignFeeARS: aiFee,
          priceARS: base + aiFee,
          desc: `Cuarto de pliego 50×100 cm en PAI ${paiThickness}`,
        };
      }

      // Lonas Frontales (incluyen Refuerzo Perimetral + Ojales cada 50cm)
      case "lona_200x100":
      case "lona_frontal_200x100": {
        const w = 200, h = 100;
        const areaM2 = (w * h) / 10000;
        const perimeterM = (2 * (w + h)) / 100;
        const baseMaterial = Math.round(areaM2 * 10500); // $21.000
        const finishings = Math.round(perimeterM * 800) + Math.round(perimeterM * 600); // 6m * 1400 = $8.400
        return {
          title: "Lona Frontal 200×100 cm (2×1 m)",
          materialId: "lona_front",
          category: "lonas" as const,
          widthCm: w,
          heightCm: h,
          basePriceARS: baseMaterial,
          finishingsPriceARS: finishings,
          aiDesignFeeARS: aiFee,
          priceARS: baseMaterial + finishings + aiFee,
          desc: "Lona Front 13 oz con refuerzo perimetral soldado y ojales cada 50 cm",
        };
      }
      case "lona_300x100": {
        const w = 300, h = 100;
        const areaM2 = (w * h) / 10000;
        const perimeterM = (2 * (w + h)) / 100;
        const baseMaterial = Math.round(areaM2 * 10500); // $31.500
        const finishings = Math.round(perimeterM * 800) + Math.round(perimeterM * 600); // 8m * 1400 = $11.200
        return {
          title: "Lona Frontal 300×100 cm (3×1 m)",
          materialId: "lona_front",
          category: "lonas" as const,
          widthCm: w,
          heightCm: h,
          basePriceARS: baseMaterial,
          finishingsPriceARS: finishings,
          aiDesignFeeARS: aiFee,
          priceARS: baseMaterial + finishings + aiFee,
          desc: "Lona Front 13 oz para marquesinas horizontales con refuerzo y ojales",
        };
      }
      case "lona_200x150": {
        const w = 200, h = 150;
        const areaM2 = (w * h) / 10000;
        const perimeterM = (2 * (w + h)) / 100;
        const baseMaterial = Math.round(areaM2 * 10500); // $31.500
        const finishings = Math.round(perimeterM * 800) + Math.round(perimeterM * 600); // 7m * 1400 = $9.800
        return {
          title: "Lona Frontal 200×150 cm (2×1.5 m)",
          materialId: "lona_front",
          category: "lonas" as const,
          widthCm: w,
          heightCm: h,
          basePriceARS: baseMaterial,
          finishingsPriceARS: finishings,
          aiDesignFeeARS: aiFee,
          priceARS: baseMaterial + finishings + aiFee,
          desc: "Lona Front 13 oz formato cartel medio con refuerzo y ojales",
        };
      }
      case "lona_300x150": {
        const w = 300, h = 150;
        const areaM2 = (w * h) / 10000;
        const perimeterM = (2 * (w + h)) / 100;
        const baseMaterial = Math.round(areaM2 * 10500); // $47.250
        const finishings = Math.round(perimeterM * 800) + Math.round(perimeterM * 600); // 9m * 1400 = $12.600
        return {
          title: "Lona Frontal 300×150 cm (3×1.5 m)",
          materialId: "lona_front",
          category: "lonas" as const,
          widthCm: w,
          heightCm: h,
          basePriceARS: baseMaterial,
          finishingsPriceARS: finishings,
          aiDesignFeeARS: aiFee,
          priceARS: baseMaterial + finishings + aiFee,
          desc: "Lona Front 13 oz formato gran cartel con refuerzo y ojales",
        };
      }

      // Medida Especial
      case "especial_personalizada": {
        const w = customWidth || 200;
        const h = customHeight || 100;
        const areaM2 = (w * h) / 10000;
        const perimeterM = (2 * (w + h)) / 100;
        const baseMaterial = Math.round(Math.max(1, areaM2) * 10500);
        const finishings = Math.round(perimeterM * 800) + Math.round(perimeterM * 600);
        return {
          title: `Cartel Especial a Medida (${w}×${h} cm)`,
          materialId: "lona_front_custom",
          category: "lonas" as const,
          widthCm: w,
          heightCm: h,
          basePriceARS: baseMaterial,
          finishingsPriceARS: finishings,
          aiDesignFeeARS: aiFee,
          priceARS: baseMaterial + finishings + aiFee,
          desc: `Dimensiones personalizadas (${areaM2.toFixed(2)} m²) con refuerzo y ojales`,
        };
      }

      default: {
        const w = 100, h = 100;
        const perimeterM = (2 * (w + h)) / 100;
        const baseMaterial = 10500;
        const finishings = Math.round(perimeterM * 800) + Math.round(perimeterM * 600);
        return {
          title: "Cartel Cuadrado 100×100 cm",
          materialId: "lona_front",
          category: "lonas" as const,
          widthCm: w,
          heightCm: h,
          basePriceARS: baseMaterial,
          finishingsPriceARS: finishings,
          aiDesignFeeARS: aiFee,
          priceARS: baseMaterial + finishings + aiFee,
          desc: "Lona Frontal 100×100 cm 13 oz con refuerzo y ojales",
        };
      }
    }
  };

  const handleAddToCart = () => {
    const details = getFormatDetails();
    const perimeterM = (2 * (details.widthCm + details.heightCm)) / 100;

    const finishingsBreakdown = details.category === "lonas"
      ? [
          {
            id: "refuerzo_perimetral",
            finishingId: "refuerzo_perimetral",
            name: "Refuerzo Perimetral Termo-Soldado",
            unitCostARS: 800,
            totalCostARS: Math.round(perimeterM * 800),
            details: `${perimeterM.toFixed(2)} m de perímetro × $800`,
            subtotalARS: Math.round(perimeterM * 800),
            description: `${perimeterM.toFixed(2)} m de perímetro × $800`,
          },
          {
            id: "ojales_50cm",
            finishingId: "ojales_50cm",
            name: "Ojales Metálicos cada 50 cm",
            unitCostARS: 600,
            totalCostARS: Math.round(perimeterM * 600),
            details: `${perimeterM.toFixed(2)} m de perímetro × $600`,
            subtotalARS: Math.round(perimeterM * 600),
            description: `${perimeterM.toFixed(2)} m de perímetro × $600`,
          },
        ]
      : [];

    addItem({
      id: `poster-${Date.now()}`,
      materialId: details.materialId,
      materialName: `${details.title} (Diseño Taller Digital)`,
      category: details.category,
      mode: details.category === "rigidos" ? "placa" : details.category === "portabanners" ? "unidad" : "m2",
      widthCm: details.widthCm,
      heightCm: details.heightCm,
      quantity: 1,
      unitPriceARS: details.priceARS,
      totalPriceARS: details.priceARS,
      baseMaterialSubtotalARS: details.basePriceARS,
      finishingsSubtotalARS: details.finishingsPriceARS,
      finishingsBreakdown,
      aiDesignFeeARS: details.aiDesignFeeARS,
      hasAiDesign: true,
      finishings: details.category === "lonas" ? ["corte_a_medida", "ojales_50cm", "refuerzo_perimetral"] : ["corte_a_medida"],
      posterDesignData: {
        ...design,
        customWidthCm: details.widthCm,
        customHeightCm: details.heightCm,
        selectedThickness: design.outputFormat.startsWith("pvc") ? pvcThickness : design.outputFormat.startsWith("pai") ? paiThickness : undefined,
      },
      transparencyNotes: [
        `Diseño en lienzo gráfico (${details.widthCm}×${details.heightCm} cm) listo para corte y terminación en taller.`,
        `Desglose: Material base: $${details.basePriceARS.toLocaleString("es-AR")} ARS | Terminaciones: +$${details.finishingsPriceARS.toLocaleString("es-AR")} ARS | Tarifa fija Diseño IA: +$${details.aiDesignFeeARS.toLocaleString("es-AR")} ARS.`,
      ],
      createdAt: new Date().toISOString(),
    });
  };

  // Dynamic canvas aspect ratio calculation
  const getCanvasDimensionsConfig = () => {
    if (design.outputFormat === "especial_personalizada" && customWidth && customHeight) {
      const ratio = customWidth / customHeight;
      return {
        aspectRatioStyle: `${customWidth} / ${customHeight}`,
        containerClass: ratio >= 1.6 ? "w-full max-w-[520px]" : ratio <= 0.6 ? "w-full max-w-[280px]" : "w-full max-w-[360px]",
        ratioLabel: `${ratio >= 1 ? ratio.toFixed(2) + ":1" : "1:" + (1 / ratio).toFixed(2)}`,
      };
    }

    switch (design.outputFormat) {
      case "portabanner_80x200":
        return { aspectRatioStyle: "80 / 200", containerClass: "w-full max-w-[270px] sm:max-w-[290px]", ratioLabel: "1:2.5" };
      case "portabanner_90x190":
        return { aspectRatioStyle: "90 / 190", containerClass: "w-full max-w-[280px] sm:max-w-[300px]", ratioLabel: "1:2.11" };
      case "portabanner_100x200":
        return { aspectRatioStyle: "100 / 200", containerClass: "w-full max-w-[290px] sm:max-w-[310px]", ratioLabel: "1:2" };

      // PVC
      case "pvc_122x244_entera":
        return { aspectRatioStyle: "122 / 244", containerClass: "w-full max-w-[280px] sm:max-w-[300px]", ratioLabel: "1:2" };
      case "pvc_122x122_media":
        return { aspectRatioStyle: "122 / 122", containerClass: "w-full max-w-[360px]", ratioLabel: "1:1" };
      case "pvc_61x244_media":
        return { aspectRatioStyle: "61 / 244", containerClass: "w-full max-w-[220px] sm:max-w-[240px]", ratioLabel: "1:4" };
      case "pvc_61x122_cuarto":
        return { aspectRatioStyle: "61 / 122", containerClass: "w-full max-w-[280px] sm:max-w-[300px]", ratioLabel: "1:2" };

      // PAI
      case "pai_100x200_entera":
        return { aspectRatioStyle: "100 / 200", containerClass: "w-full max-w-[280px] sm:max-w-[300px]", ratioLabel: "1:2" };
      case "pai_100x100_media":
        return { aspectRatioStyle: "100 / 100", containerClass: "w-full max-w-[360px]", ratioLabel: "1:1" };
      case "pai_50x200_media":
        return { aspectRatioStyle: "50 / 200", containerClass: "w-full max-w-[220px] sm:max-w-[240px]", ratioLabel: "1:4" };
      case "pai_50x100_cuarto":
        return { aspectRatioStyle: "50 / 100", containerClass: "w-full max-w-[280px] sm:max-w-[300px]", ratioLabel: "1:2" };

      // Lonas
      case "lona_200x100":
      case "lona_frontal_200x100":
        return { aspectRatioStyle: "200 / 100", containerClass: "w-full max-w-[480px]", ratioLabel: "2:1" };
      case "lona_300x100":
        return { aspectRatioStyle: "300 / 100", containerClass: "w-full max-w-[530px]", ratioLabel: "3:1" };
      case "lona_200x150":
        return { aspectRatioStyle: "200 / 150", containerClass: "w-full max-w-[430px]", ratioLabel: "4:3" };
      case "lona_300x150":
        return { aspectRatioStyle: "300 / 150", containerClass: "w-full max-w-[490px]", ratioLabel: "2:1" };
      case "cartel_100x70":
        return { aspectRatioStyle: "100 / 70", containerClass: "w-full max-w-[420px]", ratioLabel: "10:7" };
      case "cuadrado_100x100":
      default:
        return { aspectRatioStyle: "100 / 100", containerClass: "w-full max-w-[360px]", ratioLabel: "1:1" };
    }
  };

  // Compute CSS background style for 2D container
  const get2DBackgroundStyle = (): React.CSSProperties => {
    if (design.backgroundMode === "gradient" && design.gradientConfig) {
      const { type, color1, color2, angle } = design.gradientConfig;
      if (type === "radial") {
        return {
          background: `radial-gradient(circle at center, ${color1 || "#EE7828"} 0%, ${color2 || "#2C2C2C"} 100%)`,
        };
      }
      return {
        background: `linear-gradient(${angle ?? 135}deg, ${color1 || "#EE7828"} 0%, ${color2 || "#2C2C2C"} 100%)`,
      };
    }
    return {
      backgroundColor: design.backgroundColor || "#2C2C2C",
    };
  };

  // Render SVG / CSS pattern for 2D view
  const render2DPattern = () => {
    const opacity = design.textureOpacity ?? 0.12;
    const color = design.textColor || "#FAF8F5";

    switch (design.texture) {
      case "dots":
        return (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity,
              backgroundImage: `radial-gradient(${color} 1.5px, transparent 1.5px)`,
              backgroundSize: "20px 20px",
            }}
          />
        );
      case "grid":
        return (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity,
              backgroundImage: `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />
        );
      case "diagonal":
        return (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity,
              backgroundImage: `repeating-linear-gradient(45deg, ${color}, ${color} 1px, transparent 1px, transparent 16px)`,
            }}
          />
        );
      case "crosshatch":
        return (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: opacity * 0.8,
              backgroundImage: `repeating-linear-gradient(45deg, ${color} 0, ${color} 1px, transparent 0, transparent 20px), repeating-linear-gradient(-45deg, ${color} 0, ${color} 1px, transparent 0, transparent 20px)`,
            }}
          />
        );
      case "halftone":
        return (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: opacity * 1.3,
              backgroundImage: `radial-gradient(${color} 2px, transparent 2px)`,
              backgroundSize: "12px 12px",
              backgroundPosition: "0 0, 6px 6px",
            }}
          />
        );
      case "blueprint":
        return (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: opacity * 1.2,
              backgroundImage: `linear-gradient(${design.primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${design.primaryColor} 1px, transparent 1px)`,
              backgroundSize: "16px 16px",
            }}
          />
        );
      case "stripes":
        return (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: opacity * 0.9,
              backgroundImage: `repeating-linear-gradient(90deg, ${color}, ${color} 8px, transparent 8px, transparent 24px)`,
            }}
          />
        );
      case "none":
      default:
        return null;
    }
  };

  const selectedElement = design.foregroundElements?.find(
    (e) => e.id === selectedElementId
  );

  const canvasDim = getCanvasDimensionsConfig();
  const formatDetails = getFormatDetails();

  return (
    <div className="section-container pt-28 sm:pt-32 lg:pt-36 pb-36 sm:pb-44 space-y-10 sm:space-y-12 font-sans">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl text-[var(--text-primary)] font-bold">
              Póster & Cartel Creator
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-[7px] bg-primary text-white font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-white" /> Drag & Drop Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Textos 100% móviles y escalables, medidas de taller estándar (Portabanners, PVC, PAI, Lonas) y formatos a medida.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <span className="text-[10px] uppercase text-[var(--text-secondary)] block">Precio del diseño:</span>
            <span className="font-mono text-base font-bold text-primary">{formatPrice(formatDetails.priceARS)}</span>
          </div>
          <AddToCartButton
            id="btn-add-poster-to-cart"
            onAddToCart={handleAddToCart}
            label={`Imprimir este diseño (${formatDetails.widthCm}×${formatDetails.heightCm} cm)`}
            successLabel="¡Diseño Añadido al Carrito!"
            itemDetails={{
              name: `Póster Cartel (${formatDetails.title})`,
              quantity: 1,
              dimensions: `${formatDetails.widthCm}×${formatDetails.heightCm} cm`,
              priceARS: formatDetails.priceARS,
            }}
            priceARS={formatDetails.priceARS}
            icon={<ShoppingBag className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* AI ASSISTANT PROMPT BAR WITH HANDS-FREE VOICE-TO-TEXT */}
      <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-primary/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" /> Asistente Creativo de Mensajes
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] font-mono">
            Optimizado para visión a distancia y legibilidad en calle
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-8 relative flex items-center">
            <input
              type="text"
              placeholder="Ej: Hamburguesería gourmet, Taller de ploteo, Feria de ropa, Inmobiliaria..."
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="w-full pl-4 pr-12 py-2.5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-page)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary min-h-[2.75rem]"
            />
            {isVoiceSupported && (
              <button
                type="button"
                id="btn-voice-prompt-poster"
                onClick={isVoiceListening ? stopVoiceListening : startVoiceListening}
                title={isVoiceListening ? "Detener dictado por voz" : "Dictar con tu voz (manos libres)"}
                className={`absolute right-2 p-2 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                  isVoiceListening
                    ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30 ring-2 ring-red-300"
                    : "text-[var(--text-secondary)] hover:text-primary hover:bg-[var(--border-subtle)]"
                }`}
                aria-label={isVoiceListening ? "Detener micrófono" : "Activar micrófono para dictar"}
              >
                {isVoiceListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
          <button
            onClick={handleGenerateAi}
            disabled={isGeneratingAi}
            className="sm:col-span-4 px-4 py-2.5 rounded-[7px] bg-primary text-white text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 min-h-[2.75rem] cursor-pointer"
          >
            {isGeneratingAi ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isGeneratingAi ? "Redactando diseño..." : "Generar Textos con IA"}</span>
          </button>
        </div>

        {/* VOICE ACTIVE INDICATOR & TIPS */}
        {isVoiceListening && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs font-medium animate-in fade-in">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="flex-1">
              🎙️ <strong>Escuchando...</strong> Describí tu rubro, ofertas o mensaje de cartel. Al hablar se agregará automáticamente al texto.
            </span>
            <button
              type="button"
              onClick={stopVoiceListening}
              className="text-[11px] font-bold underline cursor-pointer"
            >
              Listo
            </button>
          </div>
        )}

        {voiceError && (
          <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-[5px] border border-amber-500/20">
            Nota de voz: {voiceError}
          </p>
        )}

        {aiAdvice && (
          <p className="text-xs text-primary/90 bg-primary/10 p-2.5 rounded-[5px] border border-primary/20">
            <strong>Recomendación del Taller:</strong> {aiAdvice}
          </p>
        )}
      </div>

      {/* INTERACTIVE PRINT READINESS CHECKLIST */}
      <PrintReadinessChecklist
        title="Checklist Pre-Producción y Salida a Impresión"
        description="Verificá estos 6 parámetros esenciales de taller antes de enviar a plotear o confirmar la impresión de tu cartel."
      />

      {/* MAIN STUDIO GRID: CONTROLS & CANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: EDITING WORKBENCH TABS */}
        <div className="lg:col-span-6 space-y-6">
          {/* TAB BAR NAVIGATION */}
          <div className="flex border-b border-[var(--border-subtle)] overflow-x-auto no-scrollbar gap-1">
            {[
              { id: "texts", label: "Textos Móviles", icon: Type },
              { id: "canvas", label: "Formato & Medidas", icon: Ruler },
              { id: "background", label: "Fondos & Color", icon: Palette },
              { id: "images", label: "Fotos & Logo", icon: ImageIcon },
              { id: "stickers", label: "Stickers & Sellos", icon: Tag },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 px-3.5 text-xs font-medium flex items-center gap-2 border-b-2 transition-all whitespace-nowrap min-h-[2.75rem] ${
                    activeTab === tab.id
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: TEXTOS MÓVILES Y ESCALABLES */}
          {activeTab === "texts" && (
            <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium block">
                    Capas de Texto en el Diseño
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Arrastrá y escalá cualquier texto directamente en el lienzo.
                  </span>
                </div>
                <button
                  onClick={handleAddNewTextLayer}
                  className="px-3 py-1.5 rounded-[7px] bg-primary text-white text-xs font-medium flex items-center gap-1.5 hover:brightness-105 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Texto</span>
                </button>
              </div>

              {/* LIST OF TEXT LAYERS */}
              <div className="space-y-3">
                {(design.foregroundElements || [])
                  .filter((el) => el.type === "text")
                  .map((textElem) => {
                    const isSelected = selectedElementId === textElem.id;
                    return (
                      <div
                        key={textElem.id}
                        onClick={() => setSelectedElementId(textElem.id)}
                        className={`p-3.5 rounded-[7px] border transition-all cursor-pointer space-y-2.5 ${
                          isSelected
                            ? "border-primary bg-[var(--bg-surface-subtle)] shadow-xs"
                            : "border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                            <Move className="w-3 h-3 text-primary" />
                            {textElem.textRole === "headline"
                              ? "Título Principal (Headline)"
                              : textElem.textRole === "subheadline"
                              ? "Subtítulo / Bajada"
                              : textElem.textRole === "body"
                              ? "Cuerpo / Oferta"
                              : textElem.textRole === "contact"
                              ? "Datos de Contacto"
                              : "Texto Personalizado"}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                              {Math.round((textElem.scale || 1) * 100)}%
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateForegroundElement(textElem.id);
                              }}
                              className="p-1 rounded text-[var(--text-secondary)] hover:text-primary transition-colors"
                              title="Duplicar texto"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeForegroundElement(textElem.id);
                              }}
                              className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Eliminar capa"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Text input area */}
                        {textElem.textRole === "body" ? (
                          <textarea
                            rows={2}
                            value={textElem.text || ""}
                            onChange={(e) => {
                              updateForegroundElement(textElem.id, { text: e.target.value });
                              if (textElem.textRole === "body") {
                                setDesign((prev) => ({ ...prev, bodyText: e.target.value }));
                              }
                            }}
                            className="w-full px-3 py-1.5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        ) : (
                          <input
                            type="text"
                            value={textElem.text || ""}
                            onChange={(e) => {
                              updateForegroundElement(textElem.id, { text: e.target.value });
                              if (textElem.textRole === "headline") setDesign((prev) => ({ ...prev, headline: e.target.value }));
                              if (textElem.textRole === "subheadline") setDesign((prev) => ({ ...prev, subheadline: e.target.value }));
                              if (textElem.textRole === "contact") setDesign((prev) => ({ ...prev, contactAddress: e.target.value }));
                            }}
                            className="w-full px-3 py-1.5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                          />
                        )}

                        {/* Per-element fine-tuning sliders (Scale, Color, Font) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                          <div>
                            <span className="text-[10px] text-[var(--text-secondary)] block mb-0.5">Escala ({textElem.scale}x)</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateForegroundElement(textElem.id, {
                                    scale: Math.max(0.4, +((textElem.scale || 1) - 0.1).toFixed(1)),
                                  });
                                }}
                                className="px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] hover:border-primary"
                              >
                                -
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateForegroundElement(textElem.id, {
                                    scale: Math.min(3.0, +((textElem.scale || 1) + 0.1).toFixed(1)),
                                  });
                                }}
                                className="px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] hover:border-primary"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-[var(--text-secondary)] block mb-0.5">Color</span>
                            <input
                              type="color"
                              value={textElem.color || design.textColor || "#FAF8F5"}
                              onChange={(e) => updateForegroundElement(textElem.id, { color: e.target.value })}
                              className="w-full h-7 rounded cursor-pointer border border-[var(--border-subtle)]"
                            />
                          </div>

                          <div>
                            <span className="text-[10px] text-[var(--text-secondary)] block mb-0.5">Tipografía</span>
                            <select
                              value={textElem.fontFamily || "display"}
                              onChange={(e) => updateForegroundElement(textElem.id, { fontFamily: e.target.value as any })}
                              className="w-full px-1.5 py-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[10px]"
                            >
                              <option value="display">Display</option>
                              <option value="sans">Sans Serif</option>
                              <option value="serif">Serif</option>
                              <option value="mono">Mono Técnica</option>
                            </select>
                          </div>

                          <div>
                            <span className="text-[10px] text-[var(--text-secondary)] block mb-0.5">Alineación</span>
                            <div className="flex rounded border border-[var(--border-subtle)] overflow-hidden">
                              {(["left", "center", "right"] as const).map((al) => (
                                <button
                                  key={al}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateForegroundElement(textElem.id, { align: al });
                                  }}
                                  className={`flex-1 py-1 flex items-center justify-center ${
                                    (textElem.align || "center") === al ? "bg-primary text-white" : "bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                                  }`}
                                >
                                  {al === "left" && <AlignLeft className="w-3 h-3" />}
                                  {al === "center" && <AlignCenter className="w-3 h-3" />}
                                  {al === "right" && <AlignRight className="w-3 h-3" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 2: FORMATO Y MEDIDAS ESTANDARIZADAS & ESPECIALES */}
          {activeTab === "canvas" && (
            <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium block">
                  Formatos de Taller y Medidas de Pliego
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Seleccioná la estructura o material base para adaptar las proporciones del diseño.
                </span>
              </div>

              {/* 1. PORTABANNERS */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-primary" /> Portabanners (Estructura + Gráfica)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "portabanner_80x200", name: "Roll-Up / Doble Tensor", size: "80×200 cm", ratio: "1:2.5" },
                    { id: "portabanner_90x190", name: "Araña / En X", size: "90×190 cm", ratio: "1:2.11" },
                    { id: "portabanner_100x200", name: "Doble Tensor Ancho", size: "100×200 cm", ratio: "1:2" },
                  ].map((pb) => (
                    <button
                      key={pb.id}
                      onClick={() => setDesign({ ...design, outputFormat: pb.id })}
                      className={`p-3 rounded-[7px] border text-left transition-all ${
                        design.outputFormat === pb.id
                          ? "border-primary bg-[var(--bg-surface-subtle)] shadow-xs"
                          : "border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-primary/50"
                      }`}
                    >
                      <span className="block text-xs font-bold text-[var(--text-primary)]">{pb.size}</span>
                      <span className="text-[11px] text-[var(--text-secondary)] block">{pb.name}</span>
                      <span className="text-[10px] font-mono text-primary mt-1 block">Proporción {pb.ratio}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. PLACAS DE PVC ESPUMADO (PLACA BASE 122 x 244 cm) */}
              <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-primary" /> Placas de PVC Espumado (Medida de Placa Base 122×244 cm)
                  </span>
                  {/* Selector de espesor de PVC */}
                  <div className="inline-flex rounded-[7px] bg-[var(--bg-surface-subtle)] p-0.5 border border-[var(--border-subtle)]">
                    {(["3 mm", "5 mm"] as const).map((th) => (
                      <button
                        key={th}
                        onClick={() => {
                          setPvcThickness(th);
                          setDesign((prev) => ({ ...prev, selectedThickness: th }));
                        }}
                        className={`px-2.5 py-1 text-[10px] rounded-[5px] font-medium transition-all ${
                          pvcThickness === th ? "bg-primary text-white" : "text-[var(--text-secondary)]"
                        }`}
                      >
                        PVC {th}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "pvc_122x244_entera", label: "Placa Entera", size: "122×244 cm", sub: "Placa Completa" },
                    { id: "pvc_122x122_media", label: "1/2 Placa", size: "122×122 cm", sub: "Medio Pliego Cuadrado" },
                    { id: "pvc_61x244_media", label: "1/2 Placa Faja", size: "61×244 cm", sub: "Faja Tira Larga" },
                    { id: "pvc_61x122_cuarto", label: "1/4 Placa", size: "61×122 cm", sub: "Cuarto de Pliego" },
                  ].map((pvc) => (
                    <button
                      key={pvc.id}
                      onClick={() => setDesign({ ...design, outputFormat: pvc.id })}
                      className={`p-2.5 rounded-[7px] border text-left transition-all ${
                        design.outputFormat === pvc.id
                          ? "border-primary bg-[var(--bg-surface-subtle)] shadow-xs"
                          : "border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-primary/50"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-[var(--text-primary)] block">{pvc.label}</span>
                      <span className="text-[10px] font-mono text-primary block">{pvc.size}</span>
                      <span className="text-[9px] text-[var(--text-secondary)] truncate block">{pvc.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. PLACAS DE PAI (POLIESTIRENO DE ALTO IMPACTO - PLACA BASE 100 x 200 cm) */}
              <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" /> Placas de PAI Alto Impacto (Placa Base 100×200 cm)
                  </span>
                  {/* Selector de espesor de PAI */}
                  <div className="inline-flex rounded-[7px] bg-[var(--bg-surface-subtle)] p-0.5 border border-[var(--border-subtle)]">
                    {(["1 mm", "2 mm", "3 mm"] as const).map((th) => (
                      <button
                        key={th}
                        onClick={() => {
                          setPaiThickness(th);
                          setDesign((prev) => ({ ...prev, selectedThickness: th }));
                        }}
                        className={`px-2 py-1 text-[10px] rounded-[5px] font-medium transition-all ${
                          paiThickness === th ? "bg-primary text-white" : "text-[var(--text-secondary)]"
                        }`}
                      >
                        PAI {th}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "pai_100x200_entera", label: "Placa Entera", size: "100×200 cm", sub: "Placa Completa" },
                    { id: "pai_100x100_media", label: "1/2 Placa", size: "100×100 cm", sub: "Medio Pliego Cuadrado" },
                    { id: "pai_50x200_media", label: "1/2 Placa Faja", size: "50×200 cm", sub: "Faja Tira Vertical" },
                    { id: "pai_50x100_cuarto", label: "1/4 Placa", size: "50×100 cm", sub: "Cuarto de Pliego" },
                  ].map((pai) => (
                    <button
                      key={pai.id}
                      onClick={() => setDesign({ ...design, outputFormat: pai.id })}
                      className={`p-2.5 rounded-[7px] border text-left transition-all ${
                        design.outputFormat === pai.id
                          ? "border-primary bg-[var(--bg-surface-subtle)] shadow-xs"
                          : "border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-primary/50"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-[var(--text-primary)] block">{pai.label}</span>
                      <span className="text-[10px] font-mono text-primary block">{pai.size}</span>
                      <span className="text-[9px] text-[var(--text-secondary)] truncate block">{pai.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. LONAS FRONT & BACKLIGHT */}
              <div className="space-y-2 pt-3 border-t border-[var(--border-subtle)]">
                <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" /> Lonas Frontal de Gran Formato
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "lona_200x100", name: "200×100 cm", ratio: "2:1" },
                    { id: "lona_300x100", name: "300×100 cm", ratio: "3:1" },
                    { id: "lona_200x150", name: "200×150 cm", ratio: "4:3" },
                    { id: "lona_300x150", name: "300×150 cm", ratio: "2:1" },
                  ].map((ln) => (
                    <button
                      key={ln.id}
                      onClick={() => setDesign({ ...design, outputFormat: ln.id })}
                      className={`p-2.5 rounded-[7px] border text-left transition-all ${
                        design.outputFormat === ln.id
                          ? "border-primary bg-[var(--bg-surface-subtle)] shadow-xs"
                          : "border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-primary/50"
                      }`}
                    >
                      <span className="text-xs font-bold text-[var(--text-primary)] block">{ln.name}</span>
                      <span className="text-[10px] font-mono text-primary block">Proporción {ln.ratio}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. MEDIDAS ESPECIALES / A MEDIDA */}
              <div className="p-4 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-primary" /> Medidas Especiales / A Medida
                  </span>
                  <button
                    onClick={() => {
                      setDesign({
                        ...design,
                        outputFormat: "especial_personalizada",
                        customWidthCm: customWidth,
                        customHeightCm: customHeight,
                      });
                    }}
                    className={`px-3 py-1 text-xs rounded-[5px] font-medium transition-all ${
                      design.outputFormat === "especial_personalizada"
                        ? "bg-primary text-white shadow-xs"
                        : "border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Activar Medida Especial
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[var(--text-secondary)]">Ancho (cm)</span>
                    <input
                      type="number"
                      min="20"
                      max="1000"
                      value={customWidth}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 100;
                        setCustomWidth(val);
                        if (design.outputFormat === "especial_personalizada") {
                          setDesign((prev) => ({ ...prev, customWidthCm: val }));
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-[var(--text-secondary)]">Alto (cm)</span>
                    <input
                      type="number"
                      min="20"
                      max="1000"
                      value={customHeight}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 100;
                        setCustomHeight(val);
                        if (design.outputFormat === "especial_personalizada") {
                          setDesign((prev) => ({ ...prev, customHeightCm: val }));
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono"
                    />
                  </div>

                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-[var(--text-secondary)]">Superficie Total</span>
                    <div className="p-2 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[11px] font-mono text-[var(--text-primary)]">
                      {((customWidth * customHeight) / 10000).toFixed(2)} m²
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FONDOS, DEGRADÉS Y COLOR */}
          {activeTab === "background" && (
            <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
              {/* MODO DE FONDO (Sólido vs Degradé) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium block">
                    Modo de Fondo Base
                  </span>
                  <div className="inline-flex rounded-[7px] bg-[var(--bg-surface-subtle)] p-0.5 border border-[var(--border-subtle)]">
                    <button
                      onClick={() => setDesign({ ...design, backgroundMode: "solid" })}
                      className={`px-3 py-1 text-xs rounded-[5px] transition-all ${
                        design.backgroundMode === "solid"
                          ? "bg-primary text-white font-medium"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      Color Sólido
                    </button>
                    <button
                      onClick={() => setDesign({ ...design, backgroundMode: "gradient" })}
                      className={`px-3 py-1 text-xs rounded-[5px] transition-all ${
                        design.backgroundMode === "gradient"
                          ? "bg-primary text-white font-medium"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      Degradé Dinámico
                    </button>
                  </div>
                </div>

                {design.backgroundMode === "gradient" ? (
                  <div className="space-y-3 pt-2">
                    <span className="text-[11px] text-[var(--text-secondary)] block">
                      Presets de Degradé de Taller:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {gradientPresets.map((gp) => (
                        <button
                          key={gp.id}
                          onClick={() => handleApplyGradientPreset(gp)}
                          className={`p-2.5 rounded-[7px] border text-left transition-all flex items-center justify-between ${
                            design.gradientConfig?.presetId === gp.id
                              ? "border-primary bg-[var(--bg-surface-subtle)]"
                              : "border-[var(--border-subtle)] bg-[var(--bg-page)]"
                          }`}
                        >
                          <span className="text-xs text-[var(--text-primary)] font-medium">
                            {gp.name}
                          </span>
                          <div
                            className="w-8 h-4 rounded-[4px] border border-white/20"
                            style={{
                              background:
                                gp.type === "radial"
                                  ? `radial-gradient(circle, ${gp.color1}, ${gp.color2})`
                                  : `linear-gradient(${gp.angle}deg, ${gp.color1}, ${gp.color2})`,
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <span className="text-[11px] text-[var(--text-secondary)] block">
                      Paletas Armónicas de Contraste:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {colorPresets.map((cp) => (
                        <button
                          key={cp.id}
                          onClick={() => handleApplyColorPreset(cp)}
                          className={`p-2.5 rounded-[7px] border text-left transition-all flex items-center justify-between ${
                            design.themePalette === cp.id
                              ? "border-primary bg-[var(--bg-surface-subtle)]"
                              : "border-[var(--border-subtle)] bg-[var(--bg-page)]"
                          }`}
                        >
                          <span className="text-xs text-[var(--text-primary)] font-medium">
                            {cp.name}
                          </span>
                          <div className="flex gap-1">
                            <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: cp.bg }} />
                            <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: cp.primary }} />
                            <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: cp.accent }} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* TRAMAS Y PATRONES */}
              <div className="space-y-2 pt-3 border-t border-[var(--border-subtle)]">
                <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium block">
                  Trama Gráfica de Impresión
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {patternChoices.map((pc) => (
                    <button
                      key={pc.id}
                      onClick={() => setDesign({ ...design, texture: pc.id })}
                      className={`p-2 rounded-[7px] border text-left text-xs transition-all ${
                        design.texture === pc.id
                          ? "border-primary bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] font-medium"
                          : "border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <span className="block text-[11px]">{pc.name}</span>
                      <span className="text-[9px] text-[var(--text-secondary)]">{pc.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FOTOS Y LOGO */}
          {activeTab === "images" && (
            <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium block">
                  Fotos de Fondo y Gráficos Flotantes
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Subí o seleccioná imágenes para el cartel. Podés arrastrar archivos directamente al lienzo.
                </span>
              </div>

              {/* Presets de imagen de fondo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-primary)] block">Fotos de Fondo Curadas:</span>
                  <label className="text-[11px] text-primary hover:underline cursor-pointer flex items-center gap-1 font-medium">
                    <Upload className="w-3 h-3" />
                    <span>Subir Fondo Propio</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          handleInspectAndOpenPreflight(file, url, "background");
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {backgroundPresets.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setDesign({ ...design, backgroundImageUrl: bg.url ? bg.url : undefined })}
                      className={`p-2 rounded-[7px] border text-left text-xs transition-all flex items-center gap-2 ${
                        (design.backgroundImageUrl === bg.url && bg.url) || (!design.backgroundImageUrl && !bg.url)
                          ? "border-primary bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] font-medium"
                          : "border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {bg.url ? (
                        <img src={bg.url} alt={bg.name} className="w-7 h-7 rounded object-cover border border-white/20 shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] shrink-0" />
                      )}
                      <span className="truncate text-[11px]">{bg.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subir foto al frente como objeto arrastrable */}
              <div className="p-4 rounded-[7px] bg-[var(--bg-page)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[var(--text-primary)] font-semibold block">
                      Agregar Foto o Gráfico al Frente
                    </span>
                    <p className="text-[10px] text-[var(--text-secondary)]">
                      Control técnico pre-flight automático de DPI, perfil ICC y gamut
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    1440 DPI Ready
                  </span>
                </div>

                <label className="flex items-center justify-center gap-2 p-3 rounded-[7px] bg-primary text-white text-xs font-medium cursor-pointer transition-all hover:brightness-105">
                  {isInspectingFile ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Inspeccionando Cabeceras & DPI...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Subir Foto Flotante (PNG / JPG con Pre-Flight)</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isInspectingFile}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        handleInspectAndOpenPreflight(file, url, "foreground");
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: STICKERS Y SELLOS */}
          {activeTab === "stickers" && (
            <div className="p-5 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5">
              <div>
                <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium block">
                  Sellos Comerciales y Stickers
                </span>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Hacé clic o arrastrá cualquier sello para colocarlo en la posición deseada.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {badgeLibrary.map((badge, idx) => (
                  <button
                    key={idx}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({
                          type: "badge",
                          text: badge.text,
                          title: badge.title,
                          badgeStyle: badge.style,
                          scale: 1.0,
                          rotation: 0,
                        })
                      );
                    }}
                    onClick={() =>
                      addForegroundElement({
                        type: "badge",
                        text: badge.text,
                        title: badge.title,
                        badgeStyle: badge.style,
                        x: 50 + (idx % 2 === 0 ? -12 : 12),
                        y: 30 + (idx * 6) % 35,
                        scale: 1.0,
                        rotation: (idx % 3 - 1) * 8,
                      })
                    }
                    className="p-3 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-page)] text-left hover:border-primary transition-all flex items-center justify-between group cursor-grab active:cursor-grabbing"
                  >
                    <span className="text-xs text-[var(--text-primary)] font-medium">{badge.text}</span>
                    <Plus className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INSPECTOR DE ELEMENTO SELECCIONADO */}
          {selectedElement && (
            <div className="p-4 rounded-[7px] bg-primary/5 border border-primary/30 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-primary font-bold flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5" /> Ajustes del Elemento Seleccionado
                </span>
                <button
                  onClick={() => setSelectedElementId(null)}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-[var(--text-secondary)]">Escala ({selectedElement.scale}x)</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateForegroundElement(selectedElement.id, {
                          scale: Math.max(0.3, +(selectedElement.scale - 0.1).toFixed(1)),
                        })
                      }
                      className="p-1 rounded bg-[var(--bg-page)] border border-[var(--border-subtle)]"
                      title="Reducir escala"
                    >
                      <ZoomOut className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() =>
                        updateForegroundElement(selectedElement.id, {
                          scale: Math.min(3.0, +(selectedElement.scale + 0.1).toFixed(1)),
                        })
                      }
                      className="p-1 rounded bg-[var(--bg-page)] border border-[var(--border-subtle)]"
                      title="Aumentar escala"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-[var(--text-secondary)]">Rotar ({selectedElement.rotation || 0}°)</span>
                  <button
                    onClick={() =>
                      updateForegroundElement(selectedElement.id, {
                        rotation: ((selectedElement.rotation || 0) + 15) % 360,
                      })
                    }
                    className="px-2 py-1 rounded bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[11px] flex items-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" /> +15°
                  </button>
                </div>

                <div className="space-y-1 col-span-2 flex items-end justify-end gap-2">
                  <button
                    onClick={() => duplicateForegroundElement(selectedElement.id)}
                    className="px-2.5 py-1.5 rounded-[5px] bg-[var(--bg-page)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] hover:border-primary flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Duplicar
                  </button>
                  <button
                    onClick={() => removeForegroundElement(selectedElement.id)}
                    className="px-2.5 py-1.5 rounded-[5px] bg-red-500/10 text-red-600 text-xs hover:bg-red-500/20 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INTERACTIVE LIVE CANVAS & 3D MOCKUP */}
        <div className="lg:col-span-6 flex flex-col items-center justify-between p-4 sm:p-6 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] min-h-[600px] space-y-4">
          {/* TOP CONTROLS: 2D FLAT VIEW VS 3D SCENE MOCKUP TOGGLE */}
          <div className="w-full flex items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium block">
                Lienzo de Diseño Activo
              </span>
              <span className="text-[11px] font-mono text-primary font-bold">
                {formatDetails.title} ({formatDetails.widthCm}×{formatDetails.heightCm} cm)
              </span>
            </div>

            {/* Segmented 2D / 3D control */}
            <div className="inline-flex p-1 rounded-[7px] bg-[var(--bg-page)] border border-[var(--border-subtle)]">
              <button
                onClick={() => setPreviewMode("2d")}
                className={`px-3 py-1.5 rounded-[7px] text-xs flex items-center gap-1.5 transition-all min-h-[2.25rem] ${
                  previewMode === "2d"
                    ? "bg-primary text-white font-medium shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Lienzo Interactivo (2D)</span>
              </button>
              <button
                onClick={() => setPreviewMode("3d")}
                className={`px-3 py-1.5 rounded-[7px] text-xs flex items-center gap-1.5 transition-all min-h-[2.25rem] ${
                  previewMode === "3d"
                    ? "bg-primary text-white font-medium shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Pared 3D (R3F)</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: THREE-FIBER 3D SCENE VISUALIZER */}
          {previewMode === "3d" ? (
            <div className="w-full flex-1 flex flex-col justify-center">
              <PosterWallR3F design={design} />
            </div>
          ) : (
            /* VIEW MODE 2: INTERACTIVE 2D CANVAS WITH DRAG-AND-DROP */
            <div className="w-full flex-1 flex flex-col items-center justify-center py-2 select-none relative">
              <div
                ref={posterRef}
                onDragOver={handleCanvasDragOver}
                onDragLeave={handleCanvasDragLeave}
                onDrop={handleCanvasDrop}
                onClick={() => setSelectedElementId(null)}
                className={`${canvasDim.containerClass} rounded-[7px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-200 border ${
                  dragOverCanvas
                    ? "ring-4 ring-primary ring-offset-4 ring-offset-[var(--bg-page)] scale-[1.02]"
                    : "border-[var(--border-subtle)] shadow-lg"
                }`}
                style={{
                  ...get2DBackgroundStyle(),
                  aspectRatio: canvasDim.aspectRatioStyle,
                  color: design.textColor,
                  textAlign: design.alignment,
                }}
              >
                {/* 1. BACKGROUND IMAGE OVERLAY */}
                {design.backgroundImageUrl && (
                  <div
                    className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity"
                    style={{
                      backgroundImage: `url(${design.backgroundImageUrl})`,
                      opacity: design.backgroundImageOpacity ?? 0.35,
                      filter:
                        design.backgroundImageFilter === "darken"
                          ? "brightness(0.7) contrast(1.1)"
                          : "none",
                    }}
                  />
                )}

                {/* 2. PATTERN / TEXTURE OVERLAY */}
                {render2DPattern()}

                {/* 3. DROPZONE HIGHLIGHT OVERLAY */}
                {dragOverCanvas && (
                  <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-primary">
                    <Upload className="w-10 h-10 text-white animate-bounce mb-2" />
                    <span className="text-sm text-white font-bold bg-primary px-3 py-1 rounded-[5px]">
                      ¡Soltá tu foto o sticker aquí!
                    </span>
                  </div>
                )}

                {/* 4. DRAGGABLE & SCALABLE FOREGROUND ELEMENTS (TEXTS, STICKERS, BADGES, PHOTOS) */}
                {design.foregroundElements?.map((elem) => {
                  const isSelected = selectedElementId === elem.id;

                  // Styling for badges
                  let badgeBg = "#EE7828";
                  let badgeText = "#FFFFFF";
                  let badgeBorder = "#FFFFFF";

                  if (elem.badgeStyle === "graphite" || elem.badgeStyle === "dark") {
                    badgeBg = "#2C2C2C";
                    badgeText = "#FAF8F5";
                    badgeBorder = "#EE7828";
                  } else if (elem.badgeStyle === "concrete" || elem.badgeStyle === "light") {
                    badgeBg = "#C5BAAA";
                    badgeText = "#2C2C2C";
                    badgeBorder = "#2C2C2C";
                  } else if (elem.badgeStyle === "craft") {
                    badgeBg = "#806D61";
                    badgeText = "#FAF8F5";
                    badgeBorder = "#C5BAAA";
                  }

                  return (
                    <div
                      key={elem.id}
                      onPointerDown={(e) => handlePointerDownElement(e, elem.id)}
                      className={`absolute z-30 cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 transition-shadow touch-none ${
                        isSelected
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-transparent shadow-2xl z-40"
                          : "hover:outline-dashed hover:outline-1 hover:outline-primary/60"
                      }`}
                      style={{
                        left: `${elem.x}%`,
                        top: `${elem.y}%`,
                        transform: `translate(-50%, -50%) rotate(${elem.rotation || 0}deg) scale(${
                          elem.scale || 1.0
                        })`,
                      }}
                    >
                      {/* RENDER TEXT ELEMENT */}
                      {elem.type === "text" ? (
                        <div
                          className={`px-2 py-1 select-none leading-snug ${
                            elem.fontFamily === "display"
                              ? "font-heading uppercase font-bold"
                              : elem.fontFamily === "serif"
                              ? "font-serif"
                              : elem.fontFamily === "mono"
                              ? "font-mono"
                              : "font-sans"
                          }`}
                          style={{
                            color: elem.color || design.textColor,
                            fontSize: `${elem.fontSize || 16}px`,
                            textAlign: elem.align || design.alignment || "center",
                            fontWeight: elem.fontWeight || (elem.textRole === "headline" ? "bold" : "normal"),
                          }}
                        >
                          {elem.text || "Texto"}
                        </div>
                      ) : elem.type === "image" && elem.url ? (
                        /* RENDER IMAGE ELEMENT */
                        <div className="relative group">
                          <img
                            src={elem.url}
                            alt="Foto arrastrable"
                            className="max-w-[120px] sm:max-w-[150px] max-h-[120px] object-contain drop-shadow-md rounded-[5px] pointer-events-none"
                          />
                        </div>
                      ) : (
                        /* RENDER BADGE / STAMP */
                        <div
                          className="px-3.5 py-1.5 rounded-[7px] text-[11px] font-bold font-heading uppercase tracking-wide border-2 shadow-lg flex items-center gap-1.5 whitespace-nowrap"
                          style={{
                            backgroundColor: badgeBg,
                            color: badgeText,
                            borderColor: badgeBorder,
                          }}
                        >
                          <span>{elem.text || elem.title || "★ PROMO ★"}</span>
                        </div>
                      )}

                      {/* CORNER RESIZE HANDLE (WHEN SELECTED) */}
                      {isSelected && (
                        <>
                          <div
                            onPointerDown={(e) => handlePointerDownScale(e, elem.id)}
                            className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-primary border-2 border-white shadow-md cursor-nwse-resize z-50 flex items-center justify-center hover:scale-125 transition-transform"
                            title="Arrastrá para escalar"
                          />
                          <div
                            onPointerDown={(e) => handlePointerDownScale(e, elem.id)}
                            className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-primary border-2 border-white shadow-md cursor-nwse-resize z-50 flex items-center justify-center hover:scale-125 transition-transform"
                            title="Arrastrá para escalar"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HELPER FOOTER BAR */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[11px] text-[var(--text-secondary)] border-t border-[var(--border-subtle)]">
            <span className="flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-primary" />
              Podés mover y escalar cualquier texto o foto directamente desde el lienzo con el mouse o táctil.
            </span>
            <span className="font-mono text-[10px] text-primary">
              1440 DPI Vector Ready
            </span>
          </div>
        </div>
      </div>

      {/* PRE-FLIGHT TECHNICAL VERIFICATION MODAL */}
      {preflightModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[12px] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-[8px] flex items-center justify-center shrink-0 ${
                  preflightModal.result.isProductionReady
                    ? "bg-emerald-950/40 border border-emerald-600/40 text-emerald-400"
                    : "bg-amber-950/40 border border-amber-600/40 text-amber-400"
                }`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-heading font-bold text-[var(--text-primary)]">
                      Control Técnico Pre-Flight (1440 DPI)
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                      preflightModal.result.isProductionReady
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                      {preflightModal.result.isProductionReady ? "Apto para Producción" : "Revisar Resolución"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] truncate max-w-md">
                    {preflightModal.result.file.name} · {preflightModal.result.file.formattedSize} · {preflightModal.result.dimensions.pixelWidth}×{preflightModal.result.dimensions.pixelHeight} px ({preflightModal.result.dimensions.megapixels} MP)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold font-mono text-primary">
                  {preflightModal.result.score}/100
                </div>
                <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block">
                  Score Calidad
                </span>
              </div>
            </div>

            {/* TECHNICAL METRICS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* DPI CARD */}
              <div className="p-3 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] uppercase">
                  <span>Densidad</span>
                  <Gauge className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="text-sm font-bold font-mono text-[var(--text-primary)]">
                  {preflightModal.result.dpiAnalysis.effectiveDPI} DPI
                </div>
                <span className={`text-[10px] block font-medium ${
                  preflightModal.result.dpiAnalysis.qualityTier === "ultra" || preflightModal.result.dpiAnalysis.qualityTier === "optimal"
                    ? "text-emerald-400"
                    : preflightModal.result.dpiAnalysis.qualityTier === "acceptable"
                    ? "text-amber-400"
                    : "text-red-400"
                }`}>
                  {preflightModal.result.dpiAnalysis.label}
                </span>
              </div>

              {/* COLOR PROFILE CARD */}
              <div className="p-3 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] uppercase">
                  <span>Espacio Color</span>
                  <Palette className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {preflightModal.result.colorProfileAnalysis.detectedSpace}
                </div>
                <span className="text-[10px] text-[var(--text-secondary)] truncate block">
                  {preflightModal.result.colorProfileAnalysis.isCmykReady ? "CMYK Nativo" : "RIP Fogra39 Auto"}
                </span>
              </div>

              {/* GAMUT RISK CARD */}
              <div className="p-3 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] uppercase">
                  <span>Gamut Tintas</span>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className={`text-xs font-bold ${
                  preflightModal.result.colorProfileAnalysis.gamutRisk === "high"
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}>
                  {preflightModal.result.colorProfileAnalysis.gamutRisk === "high"
                    ? "Riesgo Medio (Neón)"
                    : "Rango Óptimo"}
                </div>
                <span className="text-[10px] text-[var(--text-secondary)] block">
                  Tono {preflightModal.result.colorProfileAnalysis.dominantTone}
                </span>
              </div>

              {/* TARGET PROPORTION CARD */}
              <div className="p-3 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] uppercase">
                  <span>Tamaño Físico</span>
                  <Ruler className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="text-xs font-bold font-mono text-[var(--text-primary)]">
                  {preflightModal.result.targetPrint.widthCm}×{preflightModal.result.targetPrint.heightCm} cm
                </div>
                <span className="text-[10px] text-[var(--text-secondary)] block">
                  {preflightModal.result.targetPrint.areaM2} m²
                </span>
              </div>
            </div>

            {/* CHECKLIST TABLE */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-medium block">
                Puntos de Inspección de Taller
              </span>
              <div className="border border-[var(--border-subtle)] rounded-[7px] divide-y divide-[var(--border-subtle)] text-xs font-sans">
                {preflightModal.result.checklist.map((pt) => (
                  <div key={pt.id} className="p-3 flex items-start gap-3 bg-[var(--bg-page)]">
                    <div className="mt-0.5 shrink-0">
                      {pt.status === "pass" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : pt.status === "warn" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {pt.label}
                        </span>
                        <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                          {pt.value}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        {pt.detail}
                      </p>
                      {pt.recommendation && (
                        <p className="text-[10px] text-amber-300 font-medium pt-0.5">
                          💡 {pt.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WORKSHOP RIP NOTES */}
            <div className="p-3 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs flex items-center gap-2.5 text-[var(--text-secondary)]">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <span>
                {preflightModal.result.colorProfileAnalysis.ripNotes} Demasía de sangría (2.0 cm) calculada automáticamente.
              </span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setPreflightModal(null)}
                className="px-4 py-2.5 rounded-[7px] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancelar y descartar
              </button>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                {preflightModal.targetType === "ask" ? (
                  <>
                    <button
                      onClick={() => {
                        setDesign({
                          ...design,
                          backgroundImageUrl: preflightModal.fileUrl,
                        });
                        setPreflightModal(null);
                        setActiveTab("images");
                      }}
                      className="px-4 py-2.5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-page)] hover:border-primary text-xs font-medium text-[var(--text-primary)] transition-all"
                    >
                      1. Establecer como Fondo
                    </button>
                    <button
                      onClick={() => {
                        addForegroundElement({
                          type: "image",
                          url: preflightModal.fileUrl,
                          title: preflightModal.result.file.name,
                          x: 50,
                          y: 50,
                          scale: 1.0,
                          rotation: 0,
                        });
                        setPreflightModal(null);
                        setActiveTab("images");
                      }}
                      className="px-4 py-2.5 rounded-[7px] bg-primary hover:brightness-105 text-white text-xs font-medium transition-all"
                    >
                      2. Insertar Foto Flotante
                    </button>
                  </>
                ) : preflightModal.targetType === "background" ? (
                  <button
                    onClick={() => {
                      setDesign({
                        ...design,
                        backgroundImageUrl: preflightModal.fileUrl,
                      });
                      setPreflightModal(null);
                      setActiveTab("images");
                    }}
                    className="px-5 py-2.5 rounded-[7px] bg-primary hover:brightness-105 text-white text-xs font-medium transition-all"
                  >
                    Confirmar e Insertar como Fondo
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      addForegroundElement({
                        type: "image",
                        url: preflightModal.fileUrl,
                        title: preflightModal.result.file.name,
                        x: 50,
                        y: 50,
                        scale: 1.0,
                        rotation: 0,
                      });
                      setPreflightModal(null);
                      setActiveTab("images");
                    }}
                    className="px-5 py-2.5 rounded-[7px] bg-primary hover:brightness-105 text-white text-xs font-medium transition-all"
                  >
                    Confirmar e Insertar Foto Flotante
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for formatting cm strings
function detailsFormatCm(height: number) {
  return `${height} cm`;
}
