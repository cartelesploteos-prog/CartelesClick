import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { MATERIALS_CATALOG } from "../../data/materials";
import { getLocalBusinessSchema } from "../../utils/schema";

export interface SEOData {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogUrl?: string;
  ogImage?: string;
  ogSiteName?: string;
  twitterCard?: "summary" | "summary_large_image";
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  keywords?: string;
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
}

interface SEOContextType {
  setSEO: (data: Partial<SEOData>) => void;
  resetSEO: () => void;
  currentSEO: SEOData;
}

const DEFAULT_BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://carteles.click";
const DEFAULT_IMAGE = `${DEFAULT_BASE_URL}/icon-512.png`;

const DEFAULT_SEO: SEOData = {
  title: "Carteles.Click | Producción Gráfica & Cartelería 3D",
  description: "Plataforma de cotización instantánea, cálculo industrial en tiempo real y producción de cartelería, gigantografías, rígidos y corpóreos 3D.",
  ogTitle: "Carteles.Click | Producción Gráfica & Cartelería 3D",
  ogDescription: "Plataforma de cotización instantánea, cálculo industrial en tiempo real y producción de cartelería en gran formato.",
  ogType: "website",
  ogUrl: DEFAULT_BASE_URL,
  ogImage: DEFAULT_IMAGE,
  ogSiteName: "Carteles.Click",
  twitterCard: "summary_large_image",
  twitterTitle: "Carteles.Click | Producción Gráfica & Cartelería 3D",
  twitterDescription: "Cotizá carteles, lonas, vinilos y corpóreos 3D con cálculo de taller en tiempo real.",
  twitterImage: DEFAULT_IMAGE,
  canonical: DEFAULT_BASE_URL,
  keywords: "carteleria, impresion digital, corpóreos, cotizador carteles, lonas frontlight, vinilos, acrilico, polifan, mdf, corte cnc",
};

export const SEOContext = createContext<SEOContextType>({
  setSEO: () => {},
  resetSEO: () => {},
  currentSEO: DEFAULT_SEO,
});

interface SEOProviderProps {
  children: React.ReactNode;
  currentView?: string;
  viewParam?: string;
}

/**
 * Calcula metadatos inteligentes y canónicos basados en la vista y parámetros actuales
 */
function getDefaultSEOForView(view: string = "home", param?: string): SEOData {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://carteles.click";
  const path = param ? `/?view=${view}&id=${param}` : `/?view=${view}`;
  const fullUrl = `${baseUrl}${path}`;

  switch (view) {
    case "cotizador":
      return {
        title: "Cotizador Instantáneo de Cartelería 3D | Carteles.Click",
        description: "Calculá costos exactos de impresión digital, UV cama plana, corpóreos y corte CNC en tiempo real con cotas paramétricas.",
        ogTitle: "Cotizador Online de Carteles y Corpóreos 3D",
        ogDescription: "Cálculo técnico y cotización instantánea con parámetros reales de taller e impresión digital.",
        ogType: "website",
        ogUrl: fullUrl,
        ogImage: `${baseUrl}/icon-512.png`,
        canonical: fullUrl,
        schema: {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Cotizador Carteles.Click",
          applicationCategory: "BusinessApplication",
          operatingSystem: "All",
          description: "Calculador paramétrico para cartelería e impresiones industriales en gran formato.",
        },
      };

    case "materiales":
      return {
        title: "Catálogo de Materiales y Sustratos Industriales | Carteles.Click",
        description: "Catálogo técnico de lonas frontlight y backlight, vinilos de rotulación, acrílicos, PVC espumado, polifan y placas para cartelería.",
        ogTitle: "Catálogo de Materiales y Sustratos Gráficos",
        ogDescription: "Guía técnica de sustratos, espesores, resistencia a la intemperie y aplicaciones recomendadas.",
        ogType: "website",
        ogUrl: fullUrl,
        ogImage: `${baseUrl}/icon-512.png`,
        canonical: fullUrl,
      };

    case "material-detail": {
      const mat = MATERIALS_CATALOG.find((m) => m.id === param);
      if (mat) {
        return {
          title: `${mat.name} - Especificaciones y Cotización | Carteles.Click`,
          description: `${mat.shortDesc} Usos recomendados: ${mat.recommendedUses.slice(0, 3).join(", ")}. Cotizá por ${mat.mode} al mejor costo de taller.`,
          ogTitle: `${mat.name} | Especificaciones y Usos Técnicos`,
          ogDescription: mat.shortDesc,
          ogType: "product",
          ogUrl: fullUrl,
          ogImage: mat.image.startsWith("http") ? mat.image : `${baseUrl}${mat.image}`,
          canonical: fullUrl,
          schema: {
            "@context": "https://schema.org",
            "@type": "Product",
            name: mat.name,
            description: mat.shortDesc,
            category: mat.category,
            image: mat.image,
            offers: {
              "@type": "Offer",
              priceCurrency: "ARS",
              price: mat.costARS || "0",
              availability: "https://schema.org/InStock",
            },
          },
        };
      }
      return {
        ...DEFAULT_SEO,
        title: "Detalle de Sustrato | Carteles.Click",
        ogUrl: fullUrl,
      };
    }

    case "mayoristas":
      return {
        title: "Tarifas Especiales para Agencias y Gremios Gráficos | Carteles.Click",
        description: "Accedé a listas de precios por volumen para agencias de publicidad, diseñadores y talleres instaladores de todo el país.",
        ogTitle: "Canal Exclusivo para Gremios y Mayoristas",
        ogDescription: "Precios de fábrica en impresión gran formato, ploteos y corpóreos.",
        ogUrl: fullUrl,
        canonical: fullUrl,
      };

    case "portfolio":
      return {
        title: "Galería de Trabajos Realizados y Carteles 3D | Carteles.Click",
        description: "Explorá proyectos reales instalados: marquesinas comerciales, letras corpóreas LED, ploteos vehiculares y señalética corporativa.",
        ogTitle: "Galería de Obras y Proyectos Gráficos",
        ogDescription: "Fotos reales de carteles corpóreos, luminosos e impresiones de gran escala.",
        ogUrl: fullUrl,
        canonical: fullUrl,
      };

    case "diccionario":
      return {
        title: "Diccionario Técnico de Producción Gráfica | Carteles.Click",
        description: "Glosario técnico sobre materiales, tintas UV, solventes, calandrado, corte CNC, perfiles ICC y estándares de calidad gráfica.",
        ogTitle: "Glosario Técnico de Impresión y Cartelería",
        ogDescription: "Aprende conceptos fundamentales de sustratos, tintas y procesos de acabado.",
        ogUrl: fullUrl,
        canonical: fullUrl,
      };

    case "blog":
      return {
        title: "Blog de Innovación Gráfica y Cartelería | Carteles.Click",
        description: "Artículos técnicos, comparativas de materiales, guías de preparación de archivos para imprenta y novedades en cartelería 3D.",
        ogTitle: "Blog Oficial de Carteles.Click",
        ogDescription: "Guías, consejos y tendencias para potenciar la comunicación visual de tu marca.",
        ogUrl: fullUrl,
        canonical: fullUrl,
      };

    case "pedidos":
      return {
        title: "Seguimiento de Órdenes y Producción | Carteles.Click",
        description: "Consultá en tiempo real el estado de tus carteles en taller: verificación técnica, impresión, terminaciones y despacho.",
        ogTitle: "Tracking de Pedidos | Carteles.Click",
        ogDescription: "Monitoreo en vivo del avance de tu orden de compra.",
        ogUrl: fullUrl,
        canonical: fullUrl,
      };

    case "admin":
      return {
        title: "Panel de Producción y Control | Carteles.Click",
        description: "Gestión interna y trazabilidad de órdenes de producción.",
        ogTitle: "Panel de Administración",
        ogDescription: "Módulo interno de producción y control.",
        ogUrl: fullUrl,
        canonical: fullUrl,
      };

    case "home":
    default:
      return {
        ...DEFAULT_SEO,
        ogUrl: fullUrl,
        canonical: fullUrl,
        schema: [
          getLocalBusinessSchema(),
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Carteles.Click",
            applicationCategory: "DesignApplication",
            operatingSystem: "All",
            description: "Plataforma de cotización instantánea, diseño asistido por IA y producción de cartelería en gran formato.",
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "ARS",
              priceRange: "$$",
            },
          },
        ],
      };
  }
}

/**
 * Función auxiliar para actualizar o crear tags de tipo <meta> en <head>
 */
function setMetaTag(attrName: "name" | "property", attrValue: string, content?: string) {
  if (!content) {
    const existing = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (existing) existing.remove();
    return;
  }
  let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

/**
 * Función auxiliar para actualizar o crear links canónicos en <head>
 */
function setCanonicalLink(href?: string) {
  if (!href) {
    const existing = document.head.querySelector('link[rel="canonical"]');
    if (existing) existing.remove();
    return;
  }
  let element = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

/**
 * Función auxiliar para inyectar Schema.org JSON-LD
 */
function setJsonLdSchema(schemaData?: Record<string, unknown> | Array<Record<string, unknown>>) {
  const SCRIPT_ID = "applet-seo-jsonld";
  const existing = document.getElementById(SCRIPT_ID);
  if (!schemaData) {
    if (existing) existing.remove();
    return;
  }
  let script = existing as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(schemaData);
}

/**
 * Provider declarativo de SEO para Carteles.Click
 */
export const SEOProvider: React.FC<SEOProviderProps> = ({
  children,
  currentView = "home",
  viewParam,
}) => {
  const viewDefaultSEO = useMemo(
    () => getDefaultSEOForView(currentView, viewParam),
    [currentView, viewParam]
  );

  const [customSEO, setCustomSEO] = useState<Partial<SEOData> | null>(null);

  // Limpiar overrides cuando cambia la vista principal
  useEffect(() => {
    setCustomSEO(null);
  }, [currentView, viewParam]);

  const activeSEO: SEOData = useMemo(() => {
    return {
      ...viewDefaultSEO,
      ...(customSEO || {}),
    };
  }, [viewDefaultSEO, customSEO]);

  // Sincronización reactiva con document.head (sin manipular el DOM manualmente en los componentes)
  useEffect(() => {
    if (typeof document === "undefined") return;

    // 1. Title
    document.title = activeSEO.title;

    // 2. Meta description & keywords
    setMetaTag("name", "description", activeSEO.description);
    if (activeSEO.keywords) {
      setMetaTag("name", "keywords", activeSEO.keywords);
    }

    // 3. OpenGraph
    setMetaTag("property", "og:title", activeSEO.ogTitle || activeSEO.title);
    setMetaTag("property", "og:description", activeSEO.ogDescription || activeSEO.description);
    setMetaTag("property", "og:type", activeSEO.ogType || "website");
    setMetaTag("property", "og:url", activeSEO.ogUrl || window.location.href);
    setMetaTag("property", "og:image", activeSEO.ogImage || DEFAULT_IMAGE);
    setMetaTag("property", "og:site_name", activeSEO.ogSiteName || "Carteles.Click");

    // 4. Twitter Cards
    setMetaTag("name", "twitter:card", activeSEO.twitterCard || "summary_large_image");
    setMetaTag("name", "twitter:title", activeSEO.twitterTitle || activeSEO.ogTitle || activeSEO.title);
    setMetaTag("name", "twitter:description", activeSEO.twitterDescription || activeSEO.ogDescription || activeSEO.description);
    setMetaTag("name", "twitter:image", activeSEO.twitterImage || activeSEO.ogImage || DEFAULT_IMAGE);

    // 5. Canonical link
    setCanonicalLink(activeSEO.canonical || window.location.href);

    // 6. JSON-LD Schema
    setJsonLdSchema(activeSEO.schema);
  }, [activeSEO]);

  const setSEO = useCallback((data: Partial<SEOData>) => {
    setCustomSEO((prev) => ({ ...(prev || {}), ...data }));
  }, []);

  const resetSEO = useCallback(() => {
    setCustomSEO(null);
  }, []);

  return (
    <SEOContext.Provider value={{ setSEO, resetSEO, currentSEO: activeSEO }}>
      {children}
    </SEOContext.Provider>
  );
};
