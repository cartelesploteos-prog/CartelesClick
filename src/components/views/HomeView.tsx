import React, { useState, useRef } from "react";
import {
  Calculator,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Copy,
  Check,
  Maximize2,
  Compass,
  X,
  Mail,
  Layers,
  Package,
  ShieldCheck,
  Truck,
  Clock,
  Printer,
  FileCheck,
  BadgeDollarSign,
  Tag,
  Building2,
  Store,
  Utensils,
  PartyPopper,
  Send,
  Zap,
  FileText,
  MessageSquare,
} from "lucide-react";
import {
  MATERIALS_CATALOG,
  PORTFOLIO_ITEMS,
  FAQ_LIST,
  WHOLESALE_TIERS,
} from "../../data/materials";
import heroLuminousSign from "../../assets/images/hero_luminous_signage_1787222580744.jpg";
import heroWindowGraphics from "../../assets/images/hero_window_graphics_1787222592025.jpg";
import heroPrinterWorkshop from "../../assets/images/hero_large_format_printer_1787222604243.jpg";
import hero3dAcroSign from "../../assets/images/hero_3d_acrylic_sign_1787222615631.jpg";
import { useTranslation } from "react-i18next";
import { useCurrencyStore } from "../../store/useCurrencyStore";
import { motion } from "motion/react";
import { BentoGridSkeleton } from "../ui/Skeleton";
import { useParallaxScroll } from "../../hooks/useParallaxScroll";
import { BorderBeam } from "../ui/BorderBeam";
import { CTAButton } from "../ui/CTAButton";
import { triggerBrindisCelebration } from "../ui/ToastCelebration";
import { IconBadge } from "../ui/IconBadge";

interface HomeViewProps {
  onNavigate: (view: string, param?: string) => void;
}

interface ExploreItem {
  id: string;
  title: string;
  category: "trending" | "gastronomia" | "vidrieras" | "marquesinas" | "eventos" | "neon";
  prompt: string;
  aspectRatio: string;
  aspectRatioLabel: string;
  material: string;
  materialId: string;
  image: string;
  author: string;
  likes: number;
  featuredText: string;
}

const BentoGridCell = React.memo(({
  item,
  onNavigate,
  setSelectedItemDetail,
  handleCopyPrompt,
  copiedPromptId
}: any) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="ideogram-card overflow-hidden group relative flex flex-col justify-between rounded-[7px]"
    >
      <div className="relative aspect-video @sm:aspect-square overflow-hidden bg-[var(--bg-surface-subtle)]">
        <img
          src={item.image}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-[7px] bg-black/75 backdrop-blur-md text-white text-[10px] font-mono border border-white/10 shadow-sm">
            {item.aspectRatio} · {item.aspectRatioLabel}
          </span>
          <span className="px-2.5 py-1 rounded-[7px] bg-primary/90 backdrop-blur-md text-white text-[10px] font-semibold shadow-sm">
            {item.material}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFC] dark:from-[#0C0D11] via-[#FAFAFC]/60 dark:via-[#0C0D11]/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 space-y-3">
          <p className="text-xs text-white line-clamp-2 leading-relaxed">
            "{item.prompt}"
          </p>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate("poster", encodeURIComponent(item.prompt))}
              className="flex-1 min-h-[2.75rem] py-2 rounded-[7px] bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.85} />
              <span>Remix</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate("cotizador", item.materialId)}
              className="min-h-[2.75rem] py-2 px-3 rounded-[7px] bg-black/[0.15] dark:bg-white/[0.15] hover:bg-white/[0.25] text-white text-xs font-medium flex items-center justify-center gap-1 backdrop-blur-md transition-all"
              title="Cotizar m² en vivo"
            >
              <Calculator className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedItemDetail(item)}
              className="min-h-[2.75rem] py-2 px-3 rounded-[7px] bg-black/[0.15] dark:bg-white/[0.15] hover:bg-white/[0.25] text-white text-xs font-medium flex items-center justify-center gap-1 backdrop-blur-md transition-all"
              title="Ver Detalle"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--text-primary)] truncate max-w-[200px]">
            {item.title}
          </span>
          <span className="text-[11px] text-[var(--text-secondary)]">{item.author}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
          <span>{item.material}</span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCopyPrompt(item.prompt, item.id)}
            className="hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors min-h-[2.75rem] px-2 rounded-[7px]"
          >
            {copiedPromptId === item.id ? (
              <>
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copiar</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrencyStore();

  // Prompt Generator State
  const [heroPrompt, setHeroPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("✨ Typography");
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [magicPromptEnabled, setMagicPromptEnabled] = useState(true);

  // Carousel category filter for materials
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<string>("all");

  // Explore Gallery Feed State
  const [activeFeedTab, setActiveFeedTab] = useState<string>("trending");
  const [selectedItemDetail, setSelectedItemDetail] = useState<ExploreItem | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [isFeedLoading, setIsFeedLoading] = useState<boolean>(true);

  React.useEffect(() => {
    setIsFeedLoading(true);
    const timer = setTimeout(() => {
      setIsFeedLoading(false);
    }, 1200); // simulate network fetch
    return () => clearTimeout(timer);
  }, [activeFeedTab]);

  // Live Simulator State
  const [simMaterial, setSimMaterial] = useState<
    | "lona-front"
    | "lona-back"
    | "vinilo-comun"
    | "vinilo-micro"
    | "pvc-3mm"
    | "pai-acrilico"
    | "rollup-83x200"
    | "portabanner-2velas"
    | "banner-90x190"
  >("lona-front");
  const [simWidth, setSimWidth] = useState<number>(300);
  const [simHeight, setSimHeight] = useState<number>(100);

  // Guided Finder State
  const [finderPlace, setFinderPlace] = useState<"exterior" | "vidriera" | "interior" | "evento">("exterior");

  // 6 Steps Modal State
  const [is6StepsModalOpen, setIs6StepsModalOpen] = useState(false);

  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState("");

  // Refs for smooth carousels scrolling
  const materialsCarouselRef = useRef<HTMLDivElement>(null);
  const portfolioCarouselRef = useRef<HTMLDivElement>(null);
  const solutionsCarouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -380 : 380;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const promptPresets = [
    "Cartel Neón 3D para Hamburguesería 'BULL BURGER', fondo ladrillo oscuro, tipografía bold retro, iluminación ámbar cálida",
    "Marquesina industrial para Cafetería 'ESPRESSO LAB', tipografía sans serif limpia, fondo lona mate negra con letras doradas",
    "Vinilo microperforado para Vidriera de Gimnasio 'TITAN FIT', siluetas dinámicas, degrades cyan y naranja neón",
    "Placa PVC 5mm para Estudio Jurídico 'VALENZUELA & ASOC', grabado dorado sutil sobre fondo negro mate premium",
    "Roll-Up 80x200 para Congreso de Medicina 'BIO-CONGRESS 2026', gráficos 3D moleculares y jerarquía tipográfica limpia",
  ];

  // Doble carrousel con fotos enteras de trabajos reales
  const heroPhotosRow1 = [
    {
      id: "p1",
      title: "Marquesina Backlight 'BURGER CRAFT'",
      material: "Lona Backlight 24hs",
      materialId: "lona_back_doble",
      tag: "Cajas de Luz",
      image: heroLuminousSign,
    },
    {
      id: "p2",
      title: "Vidriera Microperforada 'URBAN SNEAKERS'",
      material: "Vinilo Microperforado 140mic",
      materialId: "vinilo_microperforado",
      tag: "Vidrieras 50/50",
      image: heroWindowGraphics,
    },
    {
      id: "p3",
      title: "Impresión UV Gran Formato 1440 DPI",
      material: "Lona Frontlight Reforzada 13oz",
      materialId: "lona_front",
      tag: "Taller & Producción",
      image: heroPrinterWorkshop,
    },
    {
      id: "p4",
      title: "Placa Corpórea 'STUDIO ARCHITECTURE'",
      material: "Acrílico & Corpóreo 3D",
      materialId: "placa_pvc_3mm_simple",
      tag: "Letras 3D & Corpóreos",
      image: hero3dAcroSign,
    },
    {
      id: "p5",
      title: "Portabanner Roll-Up 'TECH EXPO LATAM'",
      material: "Roll-Up 80x200cm + Lona Mate",
      materialId: "portabanner_rollup_80x200",
      tag: "Eventos & Stands",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&fit=crop&q=80",
    },
    {
      id: "p6",
      title: "Cartel Neón 3D 'COFFEE ROASTERS'",
      material: "Lona Backlight Translúcida",
      materialId: "lona_back_doble",
      tag: "Neón Gastro",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop&q=80",
    },
  ];

  const heroPhotosRow2 = [
    {
      id: "p7",
      title: "Caja de Luz con Perfil Tensor",
      material: "Perfil Tensor + Lona Back",
      materialId: "lona_back_doble",
      tag: "Marquesinas",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80",
    },
    {
      id: "p8",
      title: "Ploteo Vehicular Integral 'LOGÍSTICA EXPRES'",
      material: "Vinilo Laminado Protección UV",
      materialId: "vinilo_laminado",
      tag: "Flotas & Vehículos",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=900&auto=format&fit=crop&q=80",
    },
    {
      id: "p9",
      title: "Corpóreo Polifán 3D Recepción Palermo",
      material: "Polifán 20mm + Corte Pantográfico",
      materialId: "placa_polifan_corte_2cm",
      tag: "Letras 3D",
      image: hero3dAcroSign,
    },
    {
      id: "p10",
      title: "Banners Mesh Microperforada en Predio Deportivo",
      material: "Lona Mesh Cortaviento con Ojales",
      materialId: "lona_mesh",
      tag: "Deportes & Vallas",
      image: "/samples/lona_mesh_predio_cat.jpg",
    },
    {
      id: "p11",
      title: "Ploteo de Vidriera y Vinilo Esmerilado",
      material: "Vinilo Microperforado & Esmerilado",
      materialId: "vinilo_microperforado",
      tag: "Comercial & Vidrieras",
      image: heroWindowGraphics,
    },
    {
      id: "p12",
      title: "Calibración CMYK en Taller Central",
      material: "Plotter Roland / Mimaki 1440 DPI",
      materialId: "lona_front",
      tag: "Impresión Industrial",
      image: heroPrinterWorkshop,
    },
  ];

  // Pasos de Compra Ágil
  const buySteps = [
    {
      step: "01",
      title: "Cotización Instantánea 24/7",
      desc: "Ingresás material (lonas, vinilos, rígidos), medidas exactas en cm y cantidad. El motor calcula el precio m² o placa cerrada en tiempo real.",
      icon: Calculator,
      badge: "100% Transparente",
    },
    {
      step: "02",
      title: "Carga de Arte o Generación IA",
      desc: "Subís tu archivo listo en PDF/TIFF/AI a 1440 DPI o utilizás nuestro Creador de Anuncios con Inteligencia Artificial para componer el diseño.",
      icon: Sparkles,
      badge: "IA Asistida",
    },
    {
      step: "03",
      title: "Control Pre-Prensa Gratis",
      desc: "Nuestro taller revisa demasías de confección, perfil de color CMYK, legibilidad y resolución antes de pasar a producción sin costo adicional.",
      icon: FileCheck,
      badge: "Sin Errores",
    },
    {
      step: "04",
      title: "Pago Seguro en Pesos ($ ARS)",
      desc: "Abonás al instante mediante Mercado Pago (todas las tarjetas y cuotas) o Transferencia Bancaria con emisión de Factura A o B.",
      icon: BadgeDollarSign,
      badge: "Mercado Pago / Transf.",
    },
    {
      step: "05",
      title: "Impresión & Confección Express",
      desc: "Impresión en plotters UV & Eco-Solvente de 1440 DPI, soldado térmico perimetral, ojales metálicos o pegado de placas en 24 a 48hs.",
      icon: Printer,
      badge: "24 / 48hs Taller",
    },
    {
      step: "06",
      title: "Despacho Federal o Retiro",
      desc: "Despachamos de inmediato por encomienda express a todo el país o podés retirar gratis por nuestro taller de producción en Palermo.",
      icon: Truck,
      badge: "Envíos Federales",
    },
  ];

  const aspectRatios = [
    { id: "16:9", label: "16:9 Marquesina", icon: "▭" },
    { id: "1:1", label: "1:1 Cuadrado", icon: "□" },
    { id: "9:16", label: "9:16 Roll-Up", icon: "▯" },
    { id: "3:1", label: "3:1 Cartelera", icon: "▬" },
    { id: "4:3", label: "4:3 Cartel", icon: "▭" },
  ];

  const styleTags = [
    "✨ Typography",
    "🔥 3D Render",
    "⚡ Neón",
    "🏢 Marquesina",
    "🏪 Vidriera",
    "🎨 Vintage",
    "📐 Rígido PVC",
    "🎪 Roll-Up",
  ];

  const exploreItems: ExploreItem[] = [
    {
      id: "exp-1",
      title: "Cartel Neón Gastro 'BURGER CRAFT'",
      category: "gastronomia",
      prompt: "3D illuminated neon sign for 'BURGER CRAFT', retro vintage style, dark raw brick wall background, vibrant warm orange and crimson glow, crisp metallic bevel typography, 1440 DPI print quality",
      aspectRatio: "16:9",
      aspectRatioLabel: "300 x 170 cm",
      material: "Lona Backlight 24hs",
      materialId: "lona_back_doble",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop&q=80",
      author: "Taller Palermo",
      likes: 342,
      featuredText: "BURGER CRAFT",
    },
    {
      id: "exp-2",
      title: "Vidriera Microperforada 'URBAN SNEAKERS'",
      category: "vidrieras",
      prompt: "Storefront window perforated vinyl design for 'URBAN SNEAKERS', street art typography, high contrast dynamic gradients, sharp cutout vectors, one-way vision 140 microns",
      aspectRatio: "1:1",
      aspectRatioLabel: "200 x 200 cm",
      material: "Vinilo Microperforado 140 mic",
      materialId: "vinilo_microperforado",
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=900&auto=format&fit=crop&q=80",
      author: "Design Studio BA",
      likes: 219,
      featuredText: "URBAN SNEAKERS",
    },
    {
      id: "exp-3",
      title: "Marquesina Frontlight 'FARMACIA CENTRAL'",
      category: "marquesinas",
      prompt: "Huge commercial highway billboard sign for 'FARMACIA CENTRAL 24HS', ultra bold high-legibility sans serif type, medical green cross with subtle glossy reflection, heavy duty 13oz frontlight canvas",
      aspectRatio: "3:1",
      aspectRatioLabel: "600 x 200 cm",
      material: "Lona Frontlight 13 oz Reforzada",
      materialId: "lona_front",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=900&auto=format&fit=crop&q=80",
      author: "Carteles Vía Pública",
      likes: 184,
      featuredText: "FARMACIA CENTRAL 24HS",
    },
    {
      id: "exp-4",
      title: "Placa Rígida 'STUDIO ARCHITECTURE'",
      category: "trending",
      prompt: "Minimalist matte black architectural office signage 'STUDIO ARCHITECTURE', embossed gold foil typography, clean geometric grid layout, foamed PVC 5mm board, gallery finish",
      aspectRatio: "4:3",
      aspectRatioLabel: "120 x 90 cm",
      material: "Placa Rígida PVC 3mm",
      materialId: "placa_pvc_3mm_simple",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&auto=format&fit=crop&q=80",
      author: "Arquitectura & Co",
      likes: 412,
      featuredText: "STUDIO ARCHITECTURE",
    },
    {
      id: "exp-5",
      title: "Roll-Up Stand 'TECH EXPO LATAM 2026'",
      category: "eventos",
      prompt: "Vertical roll-up banner 80x200cm for 'TECH EXPO LATAM 2026', futuristic clean UI wireframe aesthetics, matte canvas finish anti-reflection for event photography",
      aspectRatio: "9:16",
      aspectRatioLabel: "80 x 200 cm",
      material: "Portabanner Roll-Up + Lona Mate",
      materialId: "portabanner_rollup_80x200",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&fit=crop&q=80",
      author: "Expo Eventos",
      likes: 295,
      featuredText: "TECH EXPO LATAM",
    },
    {
      id: "exp-6",
      title: "Cartel Neón 'COFFEE ROASTERS'",
      category: "neon",
      prompt: "Specialty coffee bar neon sign 'COFFEE ROASTERS', steaming cup minimal outline with warm neon tubing, dark wood texture background, premium cafe atmosphere",
      aspectRatio: "1:1",
      aspectRatioLabel: "150 x 150 cm",
      material: "Lona Backlight Translúcida",
      materialId: "lona_back_doble",
      image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&auto=format&fit=crop&q=80",
      author: "Roast Bar",
      likes: 388,
      featuredText: "COFFEE ROASTERS",
    },
  ];

  const filteredExplore = exploreItems.filter(
    (item) => activeFeedTab === "trending" || item.category === activeFeedTab
  );

  const filteredMaterials = MATERIALS_CATALOG.filter(
    (m) => selectedMaterialCategory === "all" || m.category === selectedMaterialCategory
  );

  const handleGenerateClick = () => {
    const promptToSend = heroPrompt.trim() || promptPresets[0];
    onNavigate("poster", encodeURIComponent(promptToSend));
  };

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  // Approximate reference prices in ARS for materials display
  const materialBasePriceMap: Record<string, { price: number; unit: string }> = {
    lona_front: { price: 15000, unit: "m²" },
    lona_front_9oz: { price: 14400, unit: "m²" },
    lona_front_mate: { price: 17600, unit: "m²" },
    lona_back_doble: { price: 19400, unit: "m²" },
    lona_mesh: { price: 18800, unit: "m²" },
    lona_blackout_simple: { price: 24000, unit: "m²" },
    lona_blackout_doble: { price: 30000, unit: "m²" },
    vinilo_comun: { price: 15000, unit: "m²" },
    vinilo_mate: { price: 16000, unit: "m²" },
    vinilo_cristal: { price: 17000, unit: "m²" },
    vinilo_microperforado: { price: 16600, unit: "m²" },
    vinilo_laminado: { price: 36000, unit: "m²" },
    vinilo_impreso_corte: { price: 26000, unit: "m²" },
    portabanner_rollup_80x200: { price: 92000, unit: "unidad" },
    portabanner_doble_tensor: { price: 80000, unit: "unidad" },
    placa_pvc_3mm_simple: { price: 110000, unit: "placa 122x244" },
    placa_pvc_3mm_doble: { price: 130000, unit: "placa 122x244" },
    pai_1mm: { price: 90000, unit: "placa 100x200" },
    plastico_corrugado_2_2mm: { price: 72000, unit: "placa 122x244" },
    placa_polifan_corte_2cm: { price: 80000, unit: "placa 60x120" },
  };

  // Solutions / Categories
  const solutionsCategories = [
    {
      id: "gastronomia",
      title: "Gastronomía & Bares",
      icon: Utensils,
      desc: "Menús rígidos, marquesinas backlight y pizarras acrílicas",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
      materialId: "lona_back_doble",
    },
    {
      id: "vidrieras",
      title: "Comercios & Vidrieras",
      icon: Store,
      desc: "Microperforados visibilidad 50/50, vinilos de corte y promos",
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80",
      materialId: "vinilo_microperforado",
    },
    {
      id: "corporativo",
      title: "Oficinas & Corporativo",
      icon: Building2,
      desc: "Señalética en PVC 3mm, placas PAI y acrílico con distanciadores",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
      materialId: "placa_pvc_3mm_simple",
    },
    {
      id: "eventos",
      title: "Eventos & Stands",
      icon: PartyPopper,
      desc: "Roll-Ups autoenrollables, fondos de prensa mate y pasacalles",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
      materialId: "portabanner_rollup_80x200",
    },
    {
      id: "via_publica",
      title: "Vía Pública & Obras",
      icon: Layers,
      desc: "Lonas Front 13oz reforzadas con ojales y malla Mesh cortaviento",
      image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop&q=80",
      materialId: "lona_front",
    },
  ];

  // Live Simulator Calculations
  const simM2 = (simWidth * simHeight) / 10000;
  const simPrices: Record<string, { price: number; isUnit?: boolean; label: string }> = {
    "lona-front": { price: 15000, label: "Lona Frontlight 13oz" },
    "lona-back": { price: 19400, label: "Lona Backlight Doble Pasada" },
    "vinilo-comun": { price: 15000, label: "Vinilo Impreso Brillante/Mate" },
    "vinilo-micro": { price: 16600, label: "Vinilo Microperforado Vidrieras" },
    "pvc-3mm": { price: 38000, label: "PVC Espumado 3mm (por m² aprox)" },
    "pai-acrilico": { price: 45000, label: "PAI / Acrílico Cristal" },
    "rollup-83x200": { price: 92000, isUnit: true, label: "Roll-Up Aluminio 83x200 cm" },
    "portabanner-2velas": { price: 52000, isUnit: true, label: "Portabanner 2 Velas Fibra" },
    "banner-90x190": { price: 42000, isUnit: true, label: "Banner 90x190 Doble Tensor" },
  };

  const currentSim = simPrices[simMaterial];
  const simEstimatedCost = currentSim.isUnit
    ? currentSim.price
    : Math.round(simM2 * currentSim.price);

  // Custom Hook useParallaxScroll for smooth lerp parallax transforms across main sections
  const {
    heroY,
    heroOpacity,
    heroScale,
    heroRotateX,
    heroGlowY,
    catalogY,
    catalogScale,
    catalogRotateX,
  } = useParallaxScroll();

  return (
    <div className="w-full max-w-full min-h-screen space-y-[var(--space-2xl)] lg:space-y-[var(--space-3xl)] pb-44 sm:pb-52 font-sans text-[var(--text-primary)] overflow-x-hidden [perspective:1200px]">
      {/* =========================================================================
          1. IDEOGRAM HERO & FLOATING MAGIC PROMPT STUDIO BAR
         ========================================================================= */}
      <motion.section 
        id="hero"
        style={{ opacity: heroOpacity, y: heroY, scale: heroScale, rotateX: heroRotateX }}
        className="relative w-full max-w-full overflow-x-hidden min-h-[80svh] sm:min-h-svh flex flex-col justify-center pt-[calc(var(--header-height,80px)+2rem)] sm:pt-[calc(var(--header-height,80px)+3rem)] pb-12 sm:pb-16 px-[5svw] max-w-7xl mx-auto origin-top"
      >
        <motion.div 
          style={{ y: heroGlowY }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] sm:w-[500px] max-w-[500px] h-[260px] bg-primary/10 blur-[100px] pointer-events-none rounded-full"
        />

        <div className="relative text-center max-w-4xl mx-auto space-y-4 mb-6 mt-6 sm:mt-10 lg:mt-12">
          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.12]">
            {t("hero_heading_1")}{" "}
            <span className="text-primary">
              {t("hero_heading_highlight")}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            {t("hero_description")}
          </p>
        </div>

        {/* BOTONES PRINCIPALES DE ACCIÓN DIRECTA (CTA) */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 mb-10 sm:mb-14">
          <CTAButton
            onClick={() => {
              onNavigate("cotizador");
            }}
            celebrationMessage="¡Cotización Express 24/7 iniciada! 🥂✨"
          >
            <Calculator className="w-5 h-5" strokeWidth={1.85} />
            <span>{t("hero_btn_quote_live")}</span>
          </CTAButton>
        </div>

        {/* HIGHLIGHTS / SELLING POINTS */}
        <div className="text-center text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
          Compra rápida · Bulk order · Envíos a todo el país
        </div>

        {/* DOBLE CARROUSEL CON FOTOS ENTERAS MINIMALISTAS Y TRANSPARENCIA EN LATERALES */}
        <div className="relative w-full overflow-hidden space-y-3.5 my-6 sm:my-8 py-3 sm:py-5">
          {/* DEGRADADOS DE TRANSPARENCIA EN AMBOS LATERALES */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-36 bg-gradient-to-r from-[var(--bg-page)] via-[var(--bg-page)]/70 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-36 bg-gradient-to-l from-[var(--bg-page)] via-[var(--bg-page)]/70 to-transparent z-10 pointer-events-none" />

          {/* FILA 1: DERECHA A IZQUIERDA (animate-marquee) */}
          <div className="flex gap-4 animate-marquee whitespace-nowrap">
            {heroPhotosRow1.concat(heroPhotosRow1).map((item, idx) => (
              <div
                key={`r1-${idx}`}
                className="group relative w-60 sm:w-80 h-36 sm:h-48 rounded-2xl overflow-hidden shrink-0 border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-md transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
                onClick={() => onNavigate("cotizador", item.materialId)}
              >
                {/* Foto Entera HD Minimalista */}
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>

          {/* FILA 2: IZQUIERDA A DERECHA (animate-marquee-reverse) */}
          <div className="flex gap-4 animate-marquee-reverse whitespace-nowrap">
            {heroPhotosRow2.concat(heroPhotosRow2).map((item, idx) => (
              <div
                key={`r2-${idx}`}
                className="group relative w-60 sm:w-80 h-36 sm:h-48 rounded-2xl overflow-hidden shrink-0 border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-md transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
                onClick={() => onNavigate("cotizador", item.materialId)}
              >
                {/* Foto Entera HD Minimalista */}
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* =========================================================================
          2. COTIZADOR INSTANTÁNEO EN VIVO (CALCULADOR DIRECTO)
         ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl max-w-full overflow-x-hidden mx-auto px-4 sm:px-[5vw] py-[var(--space-md)] sm:py-[var(--space-lg)]"
      >
        <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-surface-elevated)] border border-primary/25 shadow-xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono uppercase font-bold text-primary tracking-wider">
                  Cálculo Instantáneo 24/7 en Pesos ($ ARS)
                </span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                Cotizador Instantáneo de Taller
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Seleccioná el producto, ingresá tus medidas y obtené el costo directo de fábrica.
              </p>
            </div>

            <CTAButton
              onClick={() => onNavigate("cotizador")}
              className="!px-5 !py-2.5 !text-xs shrink-0"
            >
              <Calculator className="w-4 h-4" strokeWidth={1.85} />
              <span>Abrir Cotizador Avanzado</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.85} />
            </CTAButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* SELECTOR DE PRODUCTO Y MEDIDAS */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">
                  1. Seleccionar Producto / Material
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(simPrices).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSimMaterial(key as any)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        simMaterial === key
                          ? "bg-primary/15 border-primary text-[var(--text-primary)] shadow-sm"
                          : "bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      <span className="text-xs font-bold leading-tight line-clamp-2">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-primary font-bold pt-2">
                        {item.isUnit
                          ? `$${item.price.toLocaleString("es-AR")} un.`
                          : `$${item.price.toLocaleString("es-AR")}/m²`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {!currentSim.isUnit && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">
                      Ancho (cm)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={1000}
                      value={simWidth}
                      onChange={(e) => setSimWidth(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-sm font-bold text-[var(--text-primary)] focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">
                      Alto (cm)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={1000}
                      value={simHeight}
                      onChange={(e) => setSimHeight(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-sm font-bold text-[var(--text-primary)] focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* PANEL RESULTADO Y BANDEROLA DE PRECIO */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-black/20 dark:bg-white/5 border border-[var(--border-subtle)] space-y-4 text-center sm:text-left flex flex-col justify-between h-full">
              <div>
                <span className="text-[10px] uppercase font-mono text-primary tracking-wider font-extrabold">
                  Presupuesto Estimado Instantáneo
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] pt-1">
                  ${simEstimatedCost.toLocaleString("es-AR")}{" "}
                  <span className="text-sm font-bold text-[var(--text-secondary)]">
                    ARS
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] pt-1">
                  {currentSim.isUnit
                    ? "Incluye estructura completa e impresión en alta resolución."
                    : `Superficie: ${simM2.toFixed(2)} m² (${simWidth}×${simHeight} cm).`}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Demoras de producción: 24/48hs hábiles</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Revisión de archivos pre-prensa sin cargo</span>
                </div>

                <CTAButton
                  onClick={() => {
                    onNavigate("cotizador", simMaterial);
                  }}
                  className="w-full !py-3 !text-xs mt-2"
                  celebrationMessage="¡Configuración cargada en el cotizador! 🥂✨"
                >
                  <span>Pedir Este Trabajo Ahora</span>
                  <ArrowRight className="w-4 h-4" />
                </CTAButton>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* =========================================================================
          3. SECCIÓN IMPRESIÓN DE LONAS
         ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl max-w-full overflow-x-hidden mx-auto px-4 sm:px-[5vw] py-[var(--space-md)] sm:py-[var(--space-lg)] space-y-[var(--space-md)] sm:space-y-[var(--space-lg)]"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase text-primary tracking-wider">
              Lonas Publicitarias & Cartelería
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Impresión de Lonas de Gran Formato
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Lonas Frontlight 13oz de alta tenacidad, Backlight para letreros luminosos, Malla Mesh cortaviento y Front Mate anti-reflejo para sets y televisión.
            </p>
          </div>
          <button
            onClick={() => onNavigate("cotizador", "lona_front")}
            className="px-4 py-2 rounded-full border border-[var(--border-strong)] hover:border-primary text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <span>Ver Todas las Lonas</span>
            <ChevronRight className="w-4 h-4" strokeWidth={1.85} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="ideogram-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-[var(--bg-surface-subtle)]">
                <img
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
                  alt="Lona Frontlight 13oz"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
                  Lona Frontlight 13 oz
                </h3>
                <span className="text-xs font-bold text-primary bg-primary/10 dark:bg-primary/15 border border-primary/20 px-2.5 py-0.5 rounded-full">
                  $15.000/m²
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                El sustrato estándar más resistente para frentes de local, marquesinas y carteles de ruta. Tratamiento anti-UV para intemperie prolongada.
              </p>
            </div>
            <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3">
              <div className="text-[11px] text-[var(--text-muted)]">
                Confección: Dobladillo térmico + Ojales inoxidables cada 50cm
              </div>
              <button
                onClick={() => onNavigate("cotizador", "lona_front")}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Cotizar Lona Front
              </button>
            </div>
          </div>

          <div className="ideogram-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-[var(--bg-surface-subtle)]">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80"
                  alt="Lona Backlight Doble Pasada"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
                  Lona Backlight 24hs
                </h3>
                <span className="text-xs font-bold text-primary bg-primary/10 dark:bg-primary/15 border border-primary/20 px-2.5 py-0.5 rounded-full">
                  $19.400/m²
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Lona translúcida con doble pasada de tinta para cajas de luz y marquesinas retroiluminadas con LED. Colores encendidos noche y día.
              </p>
            </div>
            <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3">
              <div className="text-[11px] text-[var(--text-muted)]">
                Confección: Pestañas de tensión o vainas para perfil de aluminio
              </div>
              <button
                onClick={() => onNavigate("cotizador", "lona_back_doble")}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Cotizar Lona Backlight
              </button>
            </div>
          </div>

          <div className="ideogram-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-[var(--bg-surface-subtle)]">
                <img
                  src="/samples/lona_mesh_canchas_tenis.jpg"
                  alt="Lona Mesh Microperforada en Canchas de Tenis"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
                  Lona Mesh Cortaviento
                </h3>
                <span className="text-xs font-bold text-primary bg-primary/10 dark:bg-primary/15 border border-primary/20 px-2.5 py-0.5 rounded-full">
                  $18.800/m²
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Tejido microperforado que permite el paso del viento sin flamear ni embolsarse. Ideal para canchas deportivas, alambrados perimetrales, andamios de obra y fachadas.
              </p>
            </div>
            <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3">
              <div className="text-[11px] text-[var(--text-muted)]">
                Confección: Refuerzo perimetral soldado y ojales metálicos cada 50 cm
              </div>
              <button
                onClick={() => onNavigate("cotizador", "lona_mesh")}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Cotizar Lona Mesh
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* =========================================================================
          4. SECCIÓN VINILOS PLOTEADOS Y MICROPERFORADOS
         ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl max-w-full overflow-x-hidden mx-auto px-4 sm:px-[5vw] py-[var(--space-md)] sm:py-[var(--space-lg)] space-y-[var(--space-md)] sm:space-y-[var(--space-lg)]"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase text-primary tracking-wider">
              Ploteos & Adhesivos
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Vinilos Ploteados & Microperforados
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Impresión en vinilo brillante/mate para carteles, vinilo microperforado de visión 50/50 para vidrieras y vinilos laminados con protección UV para flotas.
            </p>
          </div>
          <button
            onClick={() => onNavigate("cotizador", "vinilo_microperforado")}
            className="px-4 py-2 rounded-full border border-[var(--border-strong)] hover:border-primary text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <span>Ver Todos los Vinilos</span>
            <ChevronRight className="w-4 h-4" strokeWidth={1.85} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="ideogram-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-[var(--bg-surface-subtle)]">
                <img
                  src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80"
                  alt="Vinilo Microperforado Vidrieras"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
                  Vinilo Microperforado
                </h3>
                <span className="text-xs font-bold text-primary bg-primary/10 dark:bg-primary/15 border border-primary/20 px-2.5 py-0.5 rounded-full">
                  $16.600/m²
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Visión unidireccional (50/50). Muestra tu marca hacia afuera sin tapar la luz ni la visibilidad desde el interior de vidrieras o lunetas.
              </p>
            </div>
            <button
              onClick={() => onNavigate("cotizador", "vinilo_microperforado")}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Cotizar Microperforado
            </button>
          </div>

          <div className="ideogram-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-[var(--bg-surface-subtle)]">
                <img
                  src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80"
                  alt="Vinilo Impreso Brillante/Mate"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
                  Vinilo Brillante / Mate
                </h3>
                <span className="text-xs font-bold text-primary bg-primary/10 dark:bg-primary/15 border border-primary/20 px-2.5 py-0.5 rounded-full">
                  $15.000/m²
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Película adhesiva monomérica de 80 micrones. Colores intensos en 1440 DPI para pegar sobre placas rígidas, vidrios o paredes lisas.
              </p>
            </div>
            <button
              onClick={() => onNavigate("cotizador", "vinilo_comun")}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Cotizar Vinilo Impreso
            </button>
          </div>

          <div className="ideogram-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-[var(--bg-surface-subtle)]">
                <img
                  src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"
                  alt="Vinilo Laminado UV Vehicular"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
                  Vinilo Laminado UV (Vehicular)
                </h3>
                <span className="text-xs font-bold text-primary bg-primary/10 dark:bg-primary/15 border border-primary/20 px-2.5 py-0.5 rounded-full">
                  $36.000/m²
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Vinilo impreso con sobre-laminado cristal transparente de protección. A prueba de roces, lavados a presión y decoloración solar extrema.
              </p>
            </div>
            <button
              onClick={() => onNavigate("cotizador", "vinilo_laminado")}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Cotizar Ploteo Vehicular
            </button>
          </div>
        </div>
      </motion.section>

      {/* =========================================================================
          5. SECCIÓN RÍGIDOS: PVC ESPUMADO, PAI Y ACRÍLICO
         ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl max-w-full overflow-x-hidden mx-auto px-4 sm:px-[5vw] py-[var(--space-md)] sm:py-[var(--space-lg)] space-y-[var(--space-md)] sm:space-y-[var(--space-lg)]"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase text-primary tracking-wider">
              Materiales Rígidos & Placas
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              PVC Espumado, PAI & Acrílico Cristal
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Placas rígidas de alto impacto comercializadas en placa entera (122×244 cm o 100×200 cm) con opción de corte a medida para señalética, cuadros y marquesinas.
            </p>
          </div>
          <button
            onClick={() => onNavigate("cotizador", "placa_pvc_3mm_simple")}
            className="px-4 py-2 rounded-full border border-[var(--border-strong)] hover:border-primary text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <span>Ver Placas Rígidas</span>
            <ChevronRight className="w-4 h-4" strokeWidth={1.85} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="ideogram-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-[var(--bg-surface-subtle)]">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                  alt="Placa PVC Espumado 3mm y 5mm"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
                  PVC Espumado 3mm / 5mm
                </h3>
                <span className="text-xs font-bold text-primary bg-primary/10 dark:bg-primary/15 border border-primary/20 px-2.5 py-0.5 rounded-full">
                  $110.000 / placa
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Sustrato rígido liviano e irrompible. Se imprime de forma directa o emplacado con vinilo. Ideal para carteles de oficina, cuadros y exhibidores.
              </p>
            </div>
            <button
              onClick={() => onNavigate("cotizador", "placa_pvc_3mm_simple")}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Cotizar PVC Espumado
            </button>
          </div>

          <div className="ideogram-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-[var(--bg-surface-subtle)]">
                <img
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
                  alt="PAI Plástico Alto Impacto"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
                  PAI (Alto Impacto) 1mm/2mm
                </h3>
                <span className="text-xs font-bold text-primary bg-primary/10 dark:bg-primary/15 border border-primary/20 px-2.5 py-0.5 rounded-full">
                  $90.000 / placa
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Plástico flexible y resistente de superficie blanca brillante. Termoformable, excelente para señalética industrial y stoppers de góndola.
              </p>
            </div>
            <button
              onClick={() => onNavigate("cotizador", "pai_1mm")}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Cotizar Placa PAI
            </button>
          </div>

          <div className="ideogram-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-[var(--bg-surface-subtle)]">
                <img
                  src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80"
                  alt="Acrílico Cristal y Corpóreos"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
                  Acrílico Cristal Prémium
                </h3>
                <span className="text-xs font-bold text-primary bg-primary/10 dark:bg-primary/15 border border-primary/20 px-2.5 py-0.5 rounded-full">
                  Cotización a Medida
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Acrílico transparente o de color con brillo tipo vidrio. Perfecto para letras corpóreas con LED, frentes de recepciones y placas con distanciadores.
              </p>
            </div>
            <button
              onClick={() => onNavigate("cotizador", "placa_pvc_3mm_simple")}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Consultar Acrílico
            </button>
          </div>
        </div>
      </motion.section>

      {/* =========================================================================
          6. SECCIÓN PORTABANNERS & EXPOSITORES (ROLL-UP 83X200, 2 VELAS, BANNERS 90X190)
         ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl max-w-full overflow-x-hidden mx-auto px-4 sm:px-[5vw] py-[var(--space-md)] sm:py-[var(--space-lg)] space-y-[var(--space-md)] sm:space-y-[var(--space-lg)]"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase text-primary tracking-wider">
              Expositores Portátiles
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Portabanners, Roll-Up 83x200 y Banners Económicos
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Sistemas de exhibición de armado ultra rápido para eventos, ferias, locales y stands comerciales. Estructura + impresión en Lona Mate anti-reflejo.
            </p>
          </div>
          <button
            onClick={() => onNavigate("cotizador", "portabanner_rollup_80x200")}
            className="px-4 py-2 rounded-full border border-[var(--border-strong)] hover:border-primary text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <span>Ver Expositores</span>
            <ChevronRight className="w-4 h-4" strokeWidth={1.85} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* ROLL UP 83X200 */}
          <div className="ideogram-card p-6 flex flex-col justify-between space-y-4 border border-primary/30 relative">
            <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
              El Más Pedido
            </span>

            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-[var(--bg-surface-subtle)]">
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                  alt="Roll-Up Aluminio 83x200 cm"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
                  Roll-Up Aluminio 83 × 200 cm
                </h3>
                <p className="text-xs text-primary font-bold mt-0.5">
                  $92.000 ARS (Estructura + Impresión + Bolso)
                </p>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Mecanismo autorrollable de aluminio reforzado con patas estabilizadoras. Incluye funda de transporte acolchada e impresión en Lona Front Mate sin reflejos.
              </p>
            </div>
            <button
              onClick={() => onNavigate("cotizador", "portabanner_rollup_80x200")}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Pedir Roll-Up 83x200
            </button>
          </div>

          {/* PORTABANNER 2 VELAS */}
          <div className="ideogram-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-[var(--bg-surface-subtle)]">
                <img
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
                  alt="Portabanner 2 Velas"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
                  Portabanner 2 Velas (Fibra)
                </h3>
                <p className="text-xs text-primary font-bold mt-0.5">
                  $52.000 ARS (Completo armado)
                </p>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Estructura liviana de fibra de vidrio y aluminio desarmable en bolso. Compatible con lonas de 80×190 cm o 90×190 cm con bolsillos superiores e inferiores.
              </p>
            </div>
            <button
              onClick={() => onNavigate("cotizador", "portabanner_doble_tensor")}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Pedir Portabanner 2 Velas
            </button>
          </div>

          {/* BANNER ECONÓMICO 90X190 DOBLE TENSOR */}
          <div className="ideogram-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-[var(--bg-surface-subtle)]">
                <img
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80"
                  alt="Banner Económico 90x190 Doble Tensor"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
                  Banner Económico 90×190 Doble Tensor
                </h3>
                <p className="text-xs text-primary font-bold mt-0.5">
                  $42.000 ARS (Opción Promocional)
                </p>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Sistema en "X" con tensor doble de máxima estabilidad para ferias y comercios. La solución más económica y rendidora para campañas masivas.
              </p>
            </div>
            <button
              onClick={() => onNavigate("cotizador", "portabanner_doble_tensor")}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Pedir Banner 90x190
            </button>
          </div>
        </div>
      </motion.section>

      {/* =========================================================================
          7. SECCIÓN SEÑALÉTICA INSTITUCIONAL E INDUSTRIAL
         ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl max-w-full overflow-x-hidden mx-auto px-4 sm:px-[5vw] py-[var(--space-md)] sm:py-[var(--space-lg)] space-y-[var(--space-md)] sm:space-y-[var(--space-lg)]"
      >
        <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 space-y-4">
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase text-primary tracking-wider">
              Seguridad & Arquitectura
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Señalética Institucional, Industrial & Fotoluminiscente
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Carteles de salida de emergencia (fotoluminiscentes que brillan en la oscuridad), extintores, riesgo eléctrico, evacuación y señalización interna de oficinas en PVC Espumado 3mm y PAI.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs text-[var(--text-primary)] font-medium pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={1.85} />
                <span>Normas IRAM 10005</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={1.85} />
                <span>Fotoluminiscente UV</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={1.85} />
                <span>Directorio Oficinas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={1.85} />
                <span>Tótems Vereda</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate("cotizador", "placa_pvc_3mm_simple")}
              className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
            >
              <span>Cotizar Carteles de Señalética</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.85} />
            </button>
          </div>

          <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-black/10">
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
              alt="Señalética de Oficinas y Planta"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </motion.section>

      {/* =========================================================================
          8. SECCIÓN CARTELERÍA DE GRAN FORMATO & MARQUESINAS
         ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl max-w-full overflow-x-hidden mx-auto px-4 sm:px-[5vw] py-[var(--space-md)] sm:py-[var(--space-lg)] space-y-[var(--space-md)] sm:space-y-[var(--space-lg)]"
      >
        <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] space-y-6 border border-[var(--border-subtle)] shadow-xl">
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase text-primary tracking-wider">
              Estructuras & Frentes de Local
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Cartelería de Gran Formato & Marquesinas Comerciales
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Diseño, soldadura de caño estructural, tensado de lona Frontlight o Backlight, letras corpóreas 3D en Polifán y colocación profesional en altura para locales comerciales y empresas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2">
              <h4 className="font-heading font-bold text-sm text-primary">Marquesinas con Bastidor</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Estructura de caño estructural 20x20 ó 30x30 con lona Frontlight tensada e iluminación por reflectores LED.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2">
              <h4 className="font-heading font-bold text-sm text-primary">Cajas de Luz Backlight</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Cajas de aluminio y acrílico o lona translúcida con módulos LED impermeables IP67 para brillo parejo 24hs.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2">
              <h4 className="font-heading font-bold text-sm text-primary">Corpóreos 3D Polifán / Acrílico</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Letras con volumen ahuecadas o retroiluminadas para frentes de marcas, recepciones y locales.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--border-subtle)]">
            <span className="text-xs text-[var(--text-secondary)]">
              🛠️ Servicio de colocación e instalación técnica disponible en CABA y GBA
            </span>
            <button
              onClick={() => onNavigate("cotizador")}
              className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Calculator className="w-4 h-4" strokeWidth={1.85} />
              <span>Cotizar Proyecto de Cartelería</span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* =========================================================================
          SECCIÓN CUENTAS MAYORISTAS Y AGENCIAS DE PUBLICIDAD
         ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl max-w-full overflow-x-hidden mx-auto px-4 sm:px-[5vw] py-6 sm:py-10 space-y-6 sm:space-y-8"
      >
        <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-[var(--brand-brick)] tracking-wider">
              Canal B2B & Gremio Taller
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              Cuentas Mayoristas y Agencias de Publicidad
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Potenciamos a imprentas, rotulistas y diseñadores con capacidad industrial 1440 DPI, despachos prioritarios y escalas por volumen mensual acumulado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHOLESALE_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                  tier.highlight
                    ? "border-[var(--brand-brick)] bg-[var(--bg-surface-elevated)] shadow-lg shadow-[var(--brand-brick)]/10"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-[var(--text-primary)]">
                      {tier.name}
                    </h3>
                    {tier.highlight && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--brand-brick)] text-white font-bold">
                        Más elegido
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold text-[var(--brand-brick)] font-mono">
                      {tier.discountPercent}% OFF
                    </span>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      A partir de {tier.minMonthlyM2} m² mensuales
                    </p>
                  </div>
                  <ul className="space-y-2 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                    {tier.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[var(--brand-brick)] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
              <Building2 className="w-5 h-5 text-[var(--brand-brick)] shrink-0" />
              <span>Verificación de CUIT y alta comercial de cuenta en 24hs hábiles.</span>
            </div>
            <button
              onClick={() => onNavigate("mayoristas")}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[var(--brand-brick)] hover:bg-[var(--brand-brick-hover)] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <span>Solicitar Cuenta Mayorista B2B</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.section>
      <motion.section 
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl max-w-full overflow-x-hidden mx-auto px-4 sm:px-[5vw] py-[var(--space-lg)] sm:py-[var(--space-xl)]"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {[
            { icon: Calculator, title: "Calcula y cotiza", desc: "Obtené precios al instante ingresando medidas y material." },
            { icon: Printer, title: "Encarga e imprimi", desc: "Envía tu diseño o utiliza nuestras herramientas." },
            { icon: BadgeDollarSign, title: "Pago seguro", desc: "Paga cómodamente con Mercado Pago." },
            { icon: Truck, title: "Recibí en tu domicilio", desc: "Envíos rápidos a todo el país." },
          ].map((step, i) => (
            <div key={i} className="ideogram-card p-6 flex flex-col items-center text-center space-y-4 group">
              <IconBadge
                icon={step.icon}
                size="lg"
                variant="primary"
                containerStyle="subtle"
                className="group-hover:scale-105 transition-transform"
              />
              <h3 className="font-heading font-bold text-sm text-[var(--text-primary)]">{step.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* =========================================================================
          1.2. DISEÑO CON IA
         ========================================================================= */}
      <motion.section 
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="section-container py-[var(--space-md)] sm:py-[var(--space-lg)]"
      >
        <div className="ideogram-card p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-[var(--bg-surface)] to-[var(--bg-surface-elevated)] border border-primary/20">
          <div className="flex-1 space-y-3">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase text-primary tracking-wider">
              <Sparkles className="w-4 h-4 text-primary shrink-0" strokeWidth={1.85} />
              <span>Generador Creativo Asistido</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Diseñá con Inteligencia Artificial
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
              Creá carteles y vinilos únicos usando nuestra herramienta asistida por IA. 
              Componé tu diseño en segundos con prompts inteligentes y exportá directo a cotizador con 1440 DPI.
            </p>
          </div>
          <CTAButton
            onClick={() => onNavigate("poster")}
            className="!px-8 !py-4 !text-sm shrink-0"
            celebrationMessage="¡Modo Creador de Diseños con IA activado! 🥂✨"
          >
            <Sparkles className="w-4 h-4" strokeWidth={1.85} />
            <span>Probar Generador IA</span>
          </CTAButton>
        </div>
      </motion.section>

      {/* =========================================================================
          11. MODAL COMPRA ÁGIL EN 6 PASOS
         ========================================================================= */}
      {is6StepsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl text-[var(--text-primary)]"
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-3">
                <IconBadge
                  icon={ShieldCheck}
                  size="md"
                  variant="primary"
                  containerStyle="subtle"
                  className="shrink-0"
                />
                <div>
                  <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">Compra Ágil en 6 Pasos</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Proceso transparente de fabricación y despacho directo de taller</p>
                </div>
              </div>
              <button
                onClick={() => setIs6StepsModalOpen(false)}
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" strokeWidth={1.85} />
              </button>
            </div>

            {/* Grid de los 6 Pasos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {buySteps.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.step} className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2 hover:border-primary/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-extrabold text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/25">
                        Paso {s.step}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">
                        {s.badge}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Icon className="w-4 h-4 text-primary shrink-0" strokeWidth={1.85} />
                      <h4 className="font-heading text-sm font-bold text-[var(--text-primary)]">{s.title}</h4>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Botón CTA dentro del Modal */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-secondary)]">
                ⚡ Taller activo con entregas express en 24/48hs
              </span>
              <button
                onClick={() => {
                  setIs6StepsModalOpen(false);
                  onNavigate("cotizador");
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
              >
                <span>Cotizar Mi Cartel Ahora</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.85} />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* =========================================================================
          7. DETAIL MODAL (IDEOGRAM STYLE INSPECT)
         ========================================================================= */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
            <div className="md:w-1/2 bg-[var(--bg-page)] flex items-center justify-center p-4 relative">
              <img
                src={selectedItemDetail.image}
                alt={selectedItemDetail.title}
                referrerPolicy="no-referrer"
                className="max-h-[50vh] md:max-h-[80vh] w-full object-contain rounded-xl"
              />
              <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-black/80 text-white text-xs font-mono border border-white/10">
                1440 DPI Industrial
              </span>
            </div>

            <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-primary tracking-wider font-bold">
                      Detalles de Generación
                    </span>
                    <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">
                      {selectedItemDetail.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedItemDetail(null)}
                    className="w-8 h-8 rounded-full bg-black/[0.08] dark:bg-white/[0.08] hover:bg-black/[0.15] dark:bg-white/[0.15] text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Cerrar detalle"
                  >
                    <X className="w-4 h-4" strokeWidth={1.85} />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>Prompt</span>
                    <button
                      onClick={() =>
                        handleCopyPrompt(selectedItemDetail.prompt, "modal")
                      }
                      className="hover:text-[var(--text-primary)] flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      {copiedPromptId === "modal" ? (
                        <span className="text-emerald-500 font-bold">¡Copiado!</span>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" strokeWidth={1.85} /> Copiar
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed font-mono">
                    {selectedItemDetail.prompt}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-secondary)] block text-[10px]">Relación de Aspecto</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {selectedItemDetail.aspectRatio} ({selectedItemDetail.aspectRatioLabel})
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-secondary)] block text-[10px]">Sustrato Recomendado</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {selectedItemDetail.material}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-secondary)] block text-[10px]">Plazo Fabricación</span>
                    <span className="font-semibold text-[var(--text-primary)]">24 a 48 hs hábiles</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-secondary)] block text-[10px]">Resolución</span>
                    <span className="font-semibold text-[var(--text-primary)]">1440 DPI CMYK</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => {
                    const p = selectedItemDetail.prompt;
                    setSelectedItemDetail(null);
                    onNavigate("poster", encodeURIComponent(p));
                  }}
                  className="w-full py-3 rounded-full ideogram-btn-glow text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" strokeWidth={1.85} />
                  <span>Remix & Editar en Creator</span>
                </button>
                <button
                  onClick={() => {
                    const mat = selectedItemDetail.materialId;
                    setSelectedItemDetail(null);
                    onNavigate("cotizador", mat);
                  }}
                  className="w-full py-2.5 rounded-full bg-black/[0.08] dark:bg-white/[0.08] hover:bg-black/[0.15] dark:bg-white/[0.15] text-[var(--text-primary)] text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Calculator className="w-4 h-4 text-primary" strokeWidth={1.85} />
                  <span>Calcular Costo en Cotizador</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          9. FAQ & PRE-PRENSA ACORDION
         ========================================================================= */}
      <motion.section 
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="section-container max-w-full overflow-x-hidden py-[var(--space-lg)] sm:py-[var(--space-xl)] space-y-[var(--space-md)] sm:space-y-[var(--space-lg)] max-w-4xl"
      >
        <div className="text-center space-y-2">
          <span className="text-[11px] sm:text-xs font-mono font-bold uppercase text-primary tracking-wider">
            Soporte & Pre-prensa
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Preguntas Frecuentes de Taller
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Resolución de dudas sobre archivos, demasías y entregas.</p>
        </div>

        <div className="space-y-2.5">
          {FAQ_LIST.map((faq) => (
            <div
              key={faq.id}
              className="ideogram-card overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                className="w-full p-4 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-[var(--text-primary)] cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronRight
                  strokeWidth={1.85}
                  className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${
                    openFaqId === faq.id ? "rotate-90 text-primary" : ""
                  }`}
                />
              </button>
              {openFaqId === faq.id && (
                <div className="px-4 pb-4 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      {/* =========================================================================
          10. MODERN FLUID PRE-FOOTER SECTION (FLUID DESIGN & FLEX-AUTO)
         ========================================================================= */}
      <motion.section 
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl max-w-full overflow-x-hidden mx-auto px-4 sm:px-6 lg:px-8 py-[var(--space-lg)] sm:py-[var(--space-xl)] lg:py-[var(--space-2xl)]"
      >
        <div className="relative rounded-2xl sm:rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-surface-elevated)] to-[var(--bg-surface)] p-6 sm:p-10 lg:p-14 shadow-lg overflow-hidden">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20 opacity-70" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full filter blur-3xl pointer-events-none -ml-20 -mb-20 opacity-50" />

          {/* Technical Dot Pattern Backdrop */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* FLUID FLEX WRAPPER WITH FLEX-AUTO */}
          <div className="relative z-10 flex flex-wrap items-stretch gap-[var(--space-md)] lg:gap-[var(--space-lg)] w-full">
            
            {/* PRIMARY FLUID COLUMN (Left Block) */}
            <div className="flex-auto min-w-[300px] lg:flex-[1.3] flex flex-col justify-between space-y-6 sm:space-y-8">
              
              <div className="space-y-4 sm:space-y-5">
                {/* Live Status Pill */}
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold tracking-wide w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span>Taller Activo & Despacho Federal Express</span>
                </div>

                {/* Fluid Heading */}
                <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-[2.5rem] font-bold text-[var(--text-primary)] leading-[1.18] tracking-tight">
                  Impulsá tu marca con cartelería de alta precisión y entrega ágil
                </h2>

                {/* Fluid Description */}
                <p className="text-xs sm:text-sm lg:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                  Cotizá en vivo por m², enviá tus archivos listos para imprimir o creá tus piezas con IA. Fabricamos con tintas UV industriales, terminaciones técnicas y despacho garantizado a todo el país en 24 a 48 hs.
                </p>
              </div>

              {/* NEWSLETTER & GREMIAL FORM */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-primary" strokeWidth={1.85} />
                    <span>Boletín Gremial & Listas de Precios Mayoristas</span>
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">Sin spam · $ ARS</span>
                </div>

                {emailSubscribed ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm font-semibold flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-primary" strokeWidth={1.85} />
                    <span>¡Excelente! Te sumamos al canal prioritario con tablas de descuento mayorista.</span>
                  </motion.div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (subscriberEmail.trim()) {
                        setEmailSubscribed(true);
                        triggerBrindisCelebration({
                          title: "¡Suscripción Confirmada! 🥂✨",
                          message: "Te enviaremos los tarifarios gremiales y avisos de stock de bobinas.",
                        });
                      }
                    }}
                    className="flex flex-wrap sm:flex-nowrap items-stretch gap-3 w-full"
                  >
                    <input
                      type="email"
                      required
                      placeholder="Ingresá tu email comercial (ej: taller@empresa.com)"
                      value={subscriberEmail}
                      onChange={(e) => setSubscriberEmail(e.target.value)}
                      className="flex-auto min-w-[220px] px-4 sm:px-5 py-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    />
                    <button
                      type="submit"
                      className="flex-auto sm:flex-initial px-6 sm:px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-primary/25 cursor-pointer whitespace-nowrap"
                    >
                      <Send className="w-4 h-4" strokeWidth={1.85} />
                      <span>Suscribirme</span>
                    </button>
                  </form>
                )}

                {/* Fluid Badges Strip */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-[11px] sm:text-xs text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" strokeWidth={1.85} />
                    <span>Sin costos ocultos</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" strokeWidth={1.85} />
                    <span>Producción express 24/48hs</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-primary" strokeWidth={1.85} />
                    <span>Envíos con embalaje técnico</span>
                  </span>
                </div>
              </div>
            </div>

            {/* SECONDARY FLUID COLUMN: ACTION TILES (Right Block) */}
            <div className="flex-auto min-w-[280px] lg:flex-1 flex flex-col justify-between gap-3.5">
              
              {/* Tile 1: Cotizador Instantáneo */}
              <button
                type="button"
                onClick={() => onNavigate("cotizador")}
                className="flex-auto p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] hover:border-primary/50 transition-all group cursor-pointer flex items-center justify-between gap-4 text-left shadow-xs"
              >
                <div className="flex items-start gap-3.5">
                  <IconBadge
                    icon={Calculator}
                    size="lg"
                    variant="primary"
                    containerStyle="subtle"
                    className="shrink-0 group-hover:bg-primary group-hover:text-white transition-colors"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-primary transition-colors">
                        Cotizador Online en Tiempo Real
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent/20 text-accent-foreground font-mono font-semibold">
                        m²
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed">
                      Calculá medidas exactas, lona, vinilo o rígidos con precio oficial.
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[var(--bg-page)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-primary group-hover:border-primary shrink-0 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.85} />
                </div>
              </button>

              {/* Tile 2: Creador IA */}
              <button
                type="button"
                onClick={() => onNavigate("poster")}
                className="flex-auto p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] hover:border-primary/50 transition-all group cursor-pointer flex items-center justify-between gap-4 text-left shadow-xs"
              >
                <div className="flex items-start gap-3.5">
                  <IconBadge
                    icon={Sparkles}
                    size="lg"
                    variant="accent"
                    containerStyle="subtle"
                    className="shrink-0 group-hover:bg-accent group-hover:text-black transition-colors"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-primary transition-colors">
                        Diseñador Asistido por IA
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/20 text-primary font-mono font-semibold">
                        Nuevo
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed">
                      Generá composiciones gráficas y artes vectoriales en segundos.
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[var(--bg-page)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-primary group-hover:border-primary shrink-0 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.85} />
                </div>
              </button>

              {/* Tile 3: Canal Mayoristas B2B */}
              <button
                type="button"
                onClick={() => onNavigate("mayoristas")}
                className="flex-auto p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] hover:border-primary/50 transition-all group cursor-pointer flex items-center justify-between gap-4 text-left shadow-xs"
              >
                <div className="flex items-start gap-3.5">
                  <IconBadge
                    icon={Building2}
                    size="lg"
                    variant="primary"
                    containerStyle="subtle"
                    className="shrink-0 group-hover:bg-primary group-hover:text-white transition-colors"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-primary transition-colors">
                        Canal Mayorista & Revendedores
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono font-semibold">
                        Gremio
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed">
                      Escalas de descuento por volumen y facturación comercial con CUIT.
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[var(--bg-page)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-primary group-hover:border-primary shrink-0 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.85} />
                </div>
              </button>

            </div>

          </div>
        </div>
      </motion.section>
    </div>
  );
};
