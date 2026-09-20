import { useContext, useEffect } from "react";
import { SEOContext, SEOData } from "../components/seo/SEOProvider";

/**
 * Hook declarativo para gestionar el SEO de una vista o componente.
 * Al desmontarse, restablece el SEO por defecto de la vista.
 */
export function useSEO(overrideSEO?: Partial<SEOData>) {
  const context = useContext(SEOContext);

  if (!context) {
    throw new Error("useSEO debe ser utilizado dentro de un SEOProvider");
  }

  const { setSEO, resetSEO, currentSEO } = context;

  useEffect(() => {
    if (overrideSEO && Object.keys(overrideSEO).length > 0) {
      setSEO(overrideSEO);
    }

    return () => {
      if (overrideSEO) {
        resetSEO();
      }
    };
  }, [
    overrideSEO?.title,
    overrideSEO?.description,
    overrideSEO?.ogImage,
    overrideSEO?.ogTitle,
    overrideSEO?.canonical,
    setSEO,
    resetSEO,
  ]);

  return { currentSEO, setSEO, resetSEO };
}
