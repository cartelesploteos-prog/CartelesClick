import { LocalBusinessConfig } from "../types";

/*
 * CONFIGURACIÓN DE DATOS ESTRUCTURADOS LOCALBUSINESS (Schema.org / GEO SEO)
 *
 * Regla de negocio: No se inventan datos del taller físico.
 * Los campos sin definición se marcan explícitamente como PENDIENTE.
 */
export const localBusinessConfig: LocalBusinessConfig = {
  businessName: "Carteles.Click",
  legalName: "PENDIENTE",
  telephone: null /* PENDIENTE: Ej. '+54 11 XXXX-XXXX' */,
  email: "carteles.ploteos@gmail.com",
  url: "https://carteles.click",
  logo: "https://carteles.click/icon-512.png",
  image: ["https://carteles.click/og-image.jpg"],
  priceRange: "$$",
  currenciesAccepted: "ARS",
  paymentAccepted: ["Mercado Pago", "Transferencia Bancaria"],

  /* DATOS FÍSICOS Y GEO (PENDIENTE DE DEFINICIÓN POR EL TALLER) */
  address: {
    streetAddress: "PENDIENTE" /* Ej: 'Av. Corrientes 1234' */,
    addressLocality: "PENDIENTE" /* Ej: 'Ciudad Autónoma de Buenos Aires' */,
    addressRegion: "CABA" /* PENDIENTE */,
    postalCode: "PENDIENTE" /* Ej: 'C1043' */,
    addressCountry: "AR",
  },
  geo: {
    latitude: null /* PENDIENTE: Ej. -34.6037 */,
    longitude: null /* PENDIENTE: Ej. -58.3816 */,
  },

  /* HORARIOS DE ATENCIÓN Y PRODUCCIÓN */
  openingHours: [
    {
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00" /* PENDIENTE de confirmación */,
      closes: "18:00" /* PENDIENTE de confirmación */,
    },
  ],

  /* ÁREA DE SERVICIO / COBERTURA GEO */
  areaServed: {
    geoRadiusKm: 50 /* PENDIENTE: Radio de entrega local / instalación */,
    citiesOrNeighborhoods: [
      "CABA",
      "Gran Buenos Aires",
      "PENDIENTE: Envíos a todo el país",
    ],
    country: "Argentina",
  },

  hasOfferCatalog: {
    name: "Servicios de Impresión Gran Formato y Cartelería",
    itemListElement: [
      {
        name: "Impresión en Lonas (Frontlight, Blackout, Mesh)",
        description:
          "Impresión digital de alta durabilidad para carteles, vía pública y eventos.",
      },
      {
        name: "Vinilos Impresos y de Corte",
        description:
          "Vinilos promocionales, vehiculares, microperforados y esmerilados.",
      },
      {
        name: "Placas Rígidas (Corrugado Plástico, PVC Espumado, Alto Impacto)",
        description:
          "Impresión y montaje sobre materiales rígidos para señalética y puntos de venta.",
      },
      {
        name: "Portabanners y Estructuras",
        description:
          "Displays roll-up, araña y estructuras autoportantes para ferias y exposiciones.",
      },
    ],
  },
};

/*
 * Generador de JSON-LD Schema.org para inyección o validación en Google Rich Results.
 */
export function getLocalBusinessJsonLd(
  config: LocalBusinessConfig = localBusinessConfig,
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type":
      "PrintShop" /* Subtipo específico de LocalBusiness más preciso para imprentas/cartelerías */,
    additionalType: "https://schema.org/LocalBusiness",
    name: config.businessName,
    url: config.url,
    logo: config.logo,
    image: config.image,
    email: config.email,
    priceRange: config.priceRange,
    currenciesAccepted: config.currenciesAccepted,
    paymentAccepted: config.paymentAccepted.join(", "),
    areaServed: {
      "@type": "AdministrativeArea",
      name:
        config.areaServed.citiesOrNeighborhoods
          .filter((c) => !c.startsWith("PENDIENTE"))
          .join(", ") || config.areaServed.country,
    },
  };

  if (config.telephone) {
    schema.telephone = config.telephone;
  }

  if (config.address.streetAddress !== "PENDIENTE") {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: config.address.streetAddress,
      addressLocality: config.address.addressLocality,
      addressRegion: config.address.addressRegion,
      postalCode: config.address.postalCode,
      addressCountry: config.address.addressCountry,
    };
  }

  if (config.geo.latitude !== null && config.geo.longitude !== null) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: config.geo.latitude,
      longitude: config.geo.longitude,
    };
  }

  if (config.openingHours.length > 0) {
    schema.openingHoursSpecification = config.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.dayOfWeek,
      opens: h.opens,
      closes: h.closes,
    }));
  }

  if (config.hasOfferCatalog) {
    schema.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: config.hasOfferCatalog.name,
      itemListElement: config.hasOfferCatalog.itemListElement.map((item) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: item.name,
          description: item.description,
        },
      })),
    };
  }

  return schema;
}
