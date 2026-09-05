export const getLocalBusinessSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Carteles.Click",
    image: "PENDIENTE",
    "@id": "https://carteles.click",
    url: "https://carteles.click",
    telephone: "PENDIENTE",
    address: {
      "@type": "PostalAddress",
      streetAddress: "PENDIENTE",
      addressLocality: "PENDIENTE",
      addressRegion: "PENDIENTE",
      postalCode: "PENDIENTE",
      addressCountry: "AR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "PENDIENTE",
      longitude: "PENDIENTE",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "PENDIENTE",
      closes: "PENDIENTE",
    },
    sameAs: ["PENDIENTE"],
  };
};
