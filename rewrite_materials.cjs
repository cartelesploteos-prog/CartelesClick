const fs = require('fs');

const code = fs.readFileSync('src/data/materials.ts', 'utf8');

const regex = /export const MATERIALS_CATALOG: MaterialOption\[\] = \[[\s\S]*?\];\n\n\/\/ ==========================================/m;

const newCatalog = `export const MATERIALS_CATALOG: MaterialOption[] = [
  // ----------------------------------------------------
  // CARTELES
  // ----------------------------------------------------
  {
    id: "cartel_bastidor_front",
    name: "Bastidores con Lonas Front",
    category: "carteles",
    mode: "m2",
    shortDesc: "Cartel tensado en bastidor metálico o de madera con lona front.",
    description: "Ideal para fachadas comerciales y cartelería promocional exterior. Alta resistencia y bajo costo.",
    defaultFinishings: [],
  },
  {
    id: "cartel_bastidor_back",
    name: "Bastidores con Lonas Back",
    category: "carteles",
    mode: "m2",
    shortDesc: "Cartel tensado para retroiluminar (caja de luz) con lona translúcida.",
    description: "La opción perfecta para frentes de locales que requieren iluminación interna.",
    defaultFinishings: [],
  },
  {
    id: "cartel_fondo_prensa_blackout",
    name: "Fondos de Prensa en Black Out",
    category: "carteles",
    mode: "m2",
    shortDesc: "Estructuras auto-portantes o tensadas con lona opaca anti-reflejo.",
    description: "Ideal para eventos, alfombras rojas y backstages, ya que bloquea el paso de luz trasera.",
    defaultFinishings: [],
  },
  {
    id: "cartel_pvc",
    name: "Carteles sobre PVC",
    category: "carteles",
    mode: "m2",
    shortDesc: "Placa de PVC rígido espumado con vinilo montado o impresión directa.",
    description: "Muy liviano e impermeable, perfecto para interiores y exteriores protegidos.",
    defaultFinishings: [],
  },
  {
    id: "cartel_pai",
    name: "Carteles sobre PAI",
    category: "carteles",
    mode: "m2",
    shortDesc: "Impresión sobre poliestireno de alto impacto.",
    description: "Alta durabilidad ante golpes. Ideal para señalética industrial y seguridad.",
    defaultFinishings: [],
  },
  {
    id: "cartel_mdf",
    name: "Carteles sobre MDF",
    category: "carteles",
    mode: "m2",
    shortDesc: "Montado sobre fibrofácil rígido.",
    description: "Ideal para decoración de interiores y exhibidores. No apto intemperie.",
    defaultFinishings: [],
  },
  {
    id: "cartel_chapa",
    name: "Carteles sobre Chapa",
    category: "carteles",
    mode: "m2",
    shortDesc: "Cartel de alta resistencia sobre chapa galvanizada.",
    description: "Máxima durabilidad en exterior, apto para vialidad e industria.",
    defaultFinishings: [],
  },
  {
    id: "cartel_foamboard",
    name: "Carteles sobre Foamboard",
    category: "carteles",
    mode: "m2",
    shortDesc: "Extremadamente liviano, para interiores y exposiciones temporales.",
    description: "Cartón con alma de espuma rígida, para cuadros o paneles de presentación.",
    defaultFinishings: [],
  },
  {
    id: "cartel_corrugado",
    name: "Carteles sobre Corrugado",
    category: "carteles",
    mode: "m2",
    shortDesc: "Plástico corrugado económico para carteles inmobiliarios.",
    description: "Inmobiliarias, campañas políticas y eventos efímeros al exterior.",
    defaultFinishings: [],
  },

  // ----------------------------------------------------
  // GIGANTOGRAFÍAS
  // ----------------------------------------------------
  {
    id: "giganto_lonas",
    name: "Lonas",
    category: "gigantografias",
    mode: "m2",
    shortDesc: "Impresión de lonas en gran formato (Front, Blackout, Mesh).",
    description: "Impresión solvente o UV sobre rollos de lona para cubrir grandes superficies.",
    defaultFinishings: [],
  },
  {
    id: "giganto_vinilos",
    name: "Vinilos",
    category: "gigantografias",
    mode: "m2",
    shortDesc: "Ploteos integrales de vidrieras, vehículos y murales.",
    description: "Vinilos adhesivos brillantes, mates, microperforados o esmerilados.",
    defaultFinishings: [],
  },
  {
    id: "giganto_papeles",
    name: "Papeles",
    category: "gigantografias",
    mode: "m2",
    shortDesc: "Afiches, posters y papel fotográfico en gran escala.",
    description: "Papeles citylight y fotográficos para campañas publicitarias de alta resolución.",
    defaultFinishings: [],
  },

  // ----------------------------------------------------
  // CORPÓREOS
  // ----------------------------------------------------
  {
    id: "corp_polyfan",
    name: "Polyfan",
    category: "corporeos",
    mode: "placa",
    shortDesc: "Letras 3D económicas y livianas talladas en Polyfan.",
    description: "Solución de impacto y bajo costo. Se puede pintar o dejar al natural.",
    defaultFinishings: [],
  },
  {
    id: "corp_polyfan_pai",
    name: "Polyfan y PAI",
    category: "corporeos",
    mode: "placa",
    shortDesc: "Volumen de Polyfan con frente rígido y brillante de PAI.",
    description: "Mayor durabilidad y terminación premium respecto al Polyfan pintado.",
    defaultFinishings: [],
  },
  {
    id: "corp_polyfan_pai_vinilo",
    name: "Polyfan y PAI más vinilo",
    category: "corporeos",
    mode: "placa",
    shortDesc: "Polyfan + PAI fondeado con vinilo de color impreso o de corte.",
    description: "Permite igualar colores exactos corporativos o aplicar texturas impresas.",
    defaultFinishings: [],
  },
  {
    id: "corp_mdf",
    name: "MDF",
    category: "corporeos",
    mode: "placa",
    shortDesc: "Corpóreos en madera MDF calada.",
    description: "Firmeza estructural y estilo cálido, para interiores o exteriores protegidos.",
    defaultFinishings: [],
  },
  {
    id: "corp_acrilico_color",
    name: "Acrílico Color",
    category: "corporeos",
    mode: "placa",
    shortDesc: "Corpóreos macizos cortados por láser en acrílico de colores.",
    description: "Terminación perfecta con bordes pulidos y brillosos.",
    defaultFinishings: [],
  },
  {
    id: "corp_acrilico_cristal",
    name: "Acrílico Cristal",
    category: "corporeos",
    mode: "placa",
    shortDesc: "Acrílico transparente o translúcido, ideal para rotular por detrás.",
    description: "Genera efecto de profundidad (glass) muy moderno y premium.",
    defaultFinishings: [],
  },
  {
    id: "corp_impresos_3d",
    name: "Impresos 3D",
    category: "corporeos",
    mode: "placa",
    shortDesc: "Letras volumétricas complejas o isologos modelados en 3D (PLA/PETG).",
    description: "Formas que no se pueden lograr con corte plano, curvas orgánicas y perfiles especiales.",
    defaultFinishings: [],
  },
  {
    id: "corp_impresos_3d_iluminacion",
    name: "Impresos 3D con iluminación interna y frente de acrílico",
    category: "corporeos",
    mode: "placa",
    shortDesc: "Letras bloque impresas en 3D preparadas para LEDs.",
    description: "Tapas acrílicas difusoras para máxima luminosidad nocturna.",
    defaultFinishings: [],
  },
  {
    id: "corp_chapa",
    name: "Chapa",
    category: "corporeos",
    mode: "placa",
    shortDesc: "Letras de acero galvanizado, pintado o acero inoxidable.",
    description: "Imponentes, robustas y eternas.",
    defaultFinishings: [],
  },
  {
    id: "corp_chapa_acrilico",
    name: "Chapa y acrílico",
    category: "corporeos",
    mode: "placa",
    shortDesc: "Estructura metálica con frente o bordes en acrílico.",
    description: "Combinación de durabilidad estructural con acabados acrílicos impecables.",
    defaultFinishings: [],
  },
  {
    id: "corp_chapa_acrilico_iluminacion",
    name: "Chapa y acrílico con iluminación interna",
    category: "corporeos",
    mode: "placa",
    shortDesc: "Letras block de chapa preparadas para backlight LED frontal o halo.",
    description: "Máxima gama en cartelería. Alto contraste y durabilidad total.",
    defaultFinishings: [],
  },
  {
    id: "corp_mixtos",
    name: "Intersecciones Mixtas",
    category: "corporeos",
    mode: "placa",
    shortDesc: "Combinación libre de los materiales anteriores.",
    description: "Diseños donde intervienen acrílico, MDF, Polyfan y chapa simultáneamente.",
    defaultFinishings: [],
  },

  // ----------------------------------------------------
  // IMPRESIÓN 3D
  // ----------------------------------------------------
  {
    id: "impresion3d_prototipos",
    name: "Prototipos y Piezas a Medida",
    category: "impresion_3d",
    mode: "unidad",
    shortDesc: "Diseño e impresión de piezas únicas en PLA, PETG o ABS.",
    description: "Para modelado, reparación de repuestos o prototipado rápido.",
    defaultFinishings: [],
  },
  
  // ----------------------------------------------------
  // ESTAMPADOS
  // ----------------------------------------------------
  {
    id: "estampado_dtf",
    name: "Estampado DTF Textil",
    category: "estampados",
    mode: "metro_lineal",
    shortDesc: "Direct to Film para cualquier tipo de tela.",
    description: "Alta durabilidad y colores vivos en prendas de algodón, poliéster, etc.",
    defaultFinishings: [],
  },
  {
    id: "estampado_sublimacion",
    name: "Sublimación Textil",
    category: "estampados",
    mode: "m2",
    shortDesc: "Transferencia térmica sobre poliéster.",
    description: "Tacto cero, ideal para indumentaria deportiva y banderas.",
    defaultFinishings: [],
  },
  {
    id: "estampado_vinilo_corte",
    name: "Vinilo Termotransferible",
    category: "estampados",
    mode: "metro_lineal",
    shortDesc: "Colores planos cortados para transferir por calor.",
    description: "Perfecto para dorsales, nombres y logos monocromáticos.",
    defaultFinishings: [],
  }
];

// ==========================================`;

const updatedCode = code.replace(regex, newCatalog);
fs.writeFileSync('src/data/materials.ts', updatedCode);
