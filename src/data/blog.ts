import { BlogPost } from "../types";

export const FALLBACK_ARTICLES: BlogPost[] = [
  {
    id: "guia-dpi-gran-formato",
    title: "¿Por qué 150 DPI es suficiente para una marquesina gigante?",
    slug: "guia-dpi-gran-formato",
    excerpt:
      "El mito de los 300 DPI explicado: cómo la distancia de observación humana determina la resolución real necesaria y evita archivos pesados de 5 GB.",
    content: `## La Física Detrás de la Resolución en Gran Formato

En diseño gráfico impreso existe una regla no escrita heredada de la imprenta offset de folletos y revistas: *"todo debe estar a 300 DPI"*. Sin embargo, cuando nos trasladamos al mundo de la cartelería exterior, marquesinas y lonas de gran formato (3x2 metros, 6x3 metros o más), esta regla se convierte en un error crítico que ralentiza la producción sin aportar nitidez apreciable.

### 1. La Distancia Mínima de Visualización
El ojo humano tiene un límite de agudeza visual de aproximadamente 1 minuto de arco (1/60 de grado). A una distancia de lectura de un libro (30 a 40 cm), 300 DPI es indistinguible de una resolución mayor. Pero para un cartel que se verá a:
- **1 a 2 metros**: 150 DPI es nitidez fotográfica absoluta.
- **3 a 5 metros**: 100 a 120 DPI es perfecto.
- **Más de 10 metros (Vía Pública / Gigantografías)**: 50 a 72 DPI es más que suficiente.

### 2. Evitando Archivos Inmanejables
Un archivo de 5×2 metros a 300 DPI en formato TIFF o PSD puede pesar más de 4 GB, saturando los procesadores RIP de los plotters y demorando el inicio de la impresión. Configurando el archivo a **150 DPI al 100% de escala** o a **300 DPI al 50% de escala**, logramos un archivo de apenas 200 MB con idéntica calidad percibida.

### Recomendaciones de Taller:
1. Diseñá en **espacio de color CMYK** (FOGRA39 o US Web Coated v2).
2. Convertí todos los textos a curvas/trazados.
3. Exportá en **PDF/X-1a** o TIFF con compresión LZW.`,
    readTime: "4 min de lectura",
    date: "10 Ago 2026",
    tag: "Pre-Prensa",
    image:
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=80",
    author: "Ing. Gráfico Taller Carteles.Click",
    published: true,
    viewsCount: 1420
  },
  {
    id: "lona-front-vs-backlight",
    title: "Lona Frontlight vs Backlight: Cuándo usar cada una en cartelería",
    slug: "lona-front-vs-backlight",
    excerpt:
      "Diferencias en translucidez, porcentaje de difusión de luz y confección con cajas luminarias LED de alto rendimiento.",
    content: `## Guía de Selección: Frontlight vs Backlight

La elección entre una lona Front y una Backlight define el 90% del éxito visual de un cartel diurno y nocturno.

### Lona Frontlight (13 oz / 9 oz)
- **Concepto**: Es un sustrato opaco blanco que refleja la luz proveniente del frente (proyectores LED o luz natural).
- **Usos ideales**: Marquesinas con reflectores, banners promocionales, estructuras de caño y cartelería perimetral.
- **Ventaja**: Excelente relación costo/beneficio y máxima resistencia a la intemperie.

### Lona Backlight (Doble Pasada)
- **Concepto**: Material translúcido especial con difusión homogénea. Al iluminarse desde atrás mediante tiras de tubos LED internos, los colores cobran vida con alta saturación.
- **Impresión Doble Pasada**: Nuestro taller aplica un 40% más de carga de tinta para evitar que el cartel se "lave" o pierda contraste en la noche al encender la luminaria.
- **Usos ideales**: Cajas de luz, marquesinas de estaciones de servicio, farmacias y franquicias 24hs.`,
    readTime: "6 min de lectura",
    date: "02 Ago 2026",
    tag: "Materiales",
    image:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
    author: "Equipo Técnico de Producción",
    published: true,
    viewsCount: 980
  },
  {
    id: "vinilo-microperforado-homologacion",
    title: "Vinilo Microperforado para Vidrieras y Lunetas Vehiculares",
    slug: "vinilo-microperforado-homologacion",
    excerpt:
      "Todo sobre visibilidad unidireccional (ver de adentro hacia afuera), paso de luz natural y regulaciones de tránsito.",
    content: `## Vinilo Microperforado: Publicidad sin Perder Visibilidad

El vinilo microperforado posee micro-agujeros uniformes (relación 50/50 o 60/40) con respaldo adhesivo negro.

### ¿Cómo funciona la visión unidireccional?
El cerebro humano interpreta la superficie con mayor luminosidad. En la calle (exterior), el transeúnte ve la gráfica impresa a todo color. Desde el interior (local o vehículo), la luz exterior permite ver claramente hacia afuera como si se tratara de un vidrio polarizado.

### Requisitos para Vehículos
- Permite pasar la **Inspección Técnica Vehicular (VTV/RTO)** en lunetas traseras.
- No debe aplicarse en parabrisas delanteros ni ventanillas del conductor.`,
    readTime: "5 min de lectura",
    date: "24 Jul 2026",
    tag: "Publicidad Exterior",
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80",
    author: "Dpto. de Instalaciones",
    published: true,
    viewsCount: 1150
  }
];
