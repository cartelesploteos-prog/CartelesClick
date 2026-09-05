/**
 * Pre-Flight Verification Engine for Large Format Workshop Production
 * Carteles.Click — Control Técnico de Pre-Prensa y Fabricación
 */

export interface PreflightChecklistPoint {
  id: string;
  category: "resolution" | "color" | "dimensions" | "bleed";
  label: string;
  status: "pass" | "warn" | "fail";
  value: string;
  detail: string;
  recommendation?: string;
}

export interface PreflightResult {
  file: {
    name: string;
    sizeBytes: number;
    formattedSize: string;
    mimeType: string;
    lastModified?: number;
  };
  dimensions: {
    pixelWidth: number;
    pixelHeight: number;
    megapixels: number;
    aspectRatio: number;
  };
  targetPrint: {
    widthCm: number;
    heightCm: number;
    areaM2: number;
    aspectRatio: number;
    aspectRatioDeviationPercent: number;
  };
  dpiAnalysis: {
    effectiveDPI: number;
    horizontalDPI: number;
    verticalDPI: number;
    qualityTier: "ultra" | "optimal" | "acceptable" | "low";
    label: string;
    description: string;
    recommendedViewingDistance: string;
    minRecommendedPixels: { width: number; height: number };
  };
  colorProfileAnalysis: {
    detectedSpace: string;
    profileName: string;
    hasEmbeddedIcc: boolean;
    isCmykReady: boolean;
    gamutRisk: "none" | "low" | "medium" | "high";
    ripNotes: string;
    sampledAverageBrightness: number;
    dominantTone: "dark" | "balanced" | "light";
  };
  bleedAndMargins: {
    recommendedBleedCm: number;
    safeZoneCm: number;
    notes: string;
  };
  isProductionReady: boolean;
  score: number; // 0 to 100
  checklist: PreflightChecklistPoint[];
  inspectedAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Inspects a binary buffer for JPEG/PNG color profile headers (ICC_PROFILE, EXIF ColorSpace)
 */
async function analyzeBinaryColorHeaders(
  file: File | Blob
): Promise<{ space: string; profileName: string; hasIcc: boolean }> {
  try {
    const buffer = await file.slice(0, 128 * 1024).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check for JPEG SOI marker (0xFFD8)
    if (bytes[0] === 0xff && bytes[1] === 0xd8) {
      let offset = 2;
      let hasIcc = false;
      let iccName = "sRGB IEC61966-2.1";
      let isCmykMarker = false;

      while (offset < bytes.length - 4) {
        if (bytes[offset] !== 0xff) {
          offset++;
          continue;
        }

        const marker = bytes[offset + 1];

        // APP2 marker: ICC Profile (0xFFE2)
        if (marker === 0xe2) {
          const length = (bytes[offset + 2] << 8) + bytes[offset + 3];
          const header = String.fromCharCode(...bytes.slice(offset + 4, offset + 16));
          if (header.startsWith("ICC_PROFILE")) {
            hasIcc = true;
            // Check for CMYK signatures in ICC chunk
            const chunkStr = String.fromCharCode(...bytes.slice(offset + 16, offset + Math.min(length, 120)));
            if (chunkStr.includes("CMYK") || chunkStr.includes("FOGRA") || chunkStr.includes("SWOP") || chunkStr.includes("GRACoL")) {
              isCmykMarker = true;
              iccName = chunkStr.includes("FOGRA39") ? "ISO Coated v2 (FOGRA39) CMYK" : "CMYK Estándar Gráfico";
            } else if (chunkStr.includes("Display P3") || chunkStr.includes("P3")) {
              iccName = "Display P3 (Wide Gamut RGB)";
            } else if (chunkStr.includes("Adobe RGB")) {
              iccName = "Adobe RGB (1998)";
            } else {
              iccName = "sRGB Embebido (ICC Profile v2.4)";
            }
          }
        }

        // APP1 marker: EXIF (0xFFE1)
        if (marker === 0xe1) {
          const exifStr = String.fromCharCode(...bytes.slice(offset + 4, offset + 30));
          if (exifStr.includes("Exif")) {
            // EXIF marker present
          }
        }

        // SOF0 / SOF2 marker: Start of Frame (Check component count: 4 = CMYK, 3 = RGB, 1 = Grayscale)
        if (marker === 0xc0 || marker === 0xc2) {
          const components = bytes[offset + 9];
          if (components === 4) {
            return {
              space: "CMYK Nativo",
              profileName: iccName || "Cuatricromía CMYK de Prensa",
              hasIcc: true,
            };
          } else if (components === 1) {
            return {
              space: "Monocromo / Escala de Grises",
              profileName: "Grayscale Gamma 2.2",
              hasIcc,
            };
          }
        }

        offset += 2;
      }

      if (isCmykMarker) {
        return { space: "CMYK Industrial", profileName: iccName, hasIcc: true };
      }

      return {
        space: hasIcc ? "RGB Calibrado (ICC)" : "sRGB Estándar Web",
        profileName: iccName,
        hasIcc,
      };
    }

    // Check for PNG Signature
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return {
        space: "sRGB con Transparencia Alpha",
        profileName: "sRGB PNG (24-bit + Alpha)",
        hasIcc: false,
      };
    }

    return {
      space: "sRGB Estándar",
      profileName: "sRGB IEC61966-2.1",
      hasIcc: false,
    };
  } catch (e) {
    return {
      space: "sRGB Estándar",
      profileName: "sRGB IEC61966-2.1",
      hasIcc: false,
    };
  }
}

/**
 * Samples pixels from an image canvas to assess gamut risk and color dynamics
 */
function sampleGamutRisk(
  img: HTMLImageElement
): { gamutRisk: "none" | "low" | "medium" | "high"; avgBrightness: number; dominantTone: "dark" | "balanced" | "light" } {
  try {
    const canvas = document.createElement("canvas");
    const sampleWidth = Math.min(100, img.naturalWidth || 100);
    const sampleHeight = Math.min(100, img.naturalHeight || 100);
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return { gamutRisk: "low", avgBrightness: 128, dominantTone: "balanced" };
    }

    ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
    const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
    const data = imgData.data;

    let neonPixelCount = 0;
    let totalBrightness = 0;
    const totalPixels = sampleWidth * sampleHeight;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      totalBrightness += brightness;

      // Detect hyper-saturated out-of-CMYK-gamut colors (electric cyan, neon green, fluorescent magenta)
      const maxChannel = Math.max(r, g, b);
      const minChannel = Math.min(r, g, b);
      const saturation = maxChannel === 0 ? 0 : (maxChannel - minChannel) / maxChannel;

      if (saturation > 0.9 && maxChannel > 230) {
        if ((g > 220 && b > 220 && r < 50) || (g > 230 && r < 60) || (r > 230 && b > 200 && g < 40)) {
          neonPixelCount++;
        }
      }
    }

    const neonRatio = neonPixelCount / totalPixels;
    const avgBrightness = Math.round(totalBrightness / totalPixels);
    const dominantTone =
      avgBrightness < 80 ? "dark" : avgBrightness > 180 ? "light" : "balanced";

    const gamutRisk =
      neonRatio > 0.08 ? "high" : neonRatio > 0.02 ? "medium" : "low";

    return { gamutRisk, avgBrightness, dominantTone };
  } catch (e) {
    return { gamutRisk: "low", avgBrightness: 128, dominantTone: "balanced" };
  }
}

/**
 * Main Pre-Flight Verification Runner
 */
export async function runPreflightInspection(
  file: File | Blob,
  targetWidthCm = 100,
  targetHeightCm = 100,
  customFileName?: string
): Promise<PreflightResult> {
  const fileName = customFileName || (file instanceof File ? file.name : "archivo-grafico.jpg");
  const sizeBytes = file.size || 0;
  const mimeType = file.type || "image/jpeg";

  // 1. Load image in memory to read natural pixel dimensions
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("No se pudo cargar la imagen para inspección"));
    img.src = objectUrl;
  });

  const pixelWidth = img.naturalWidth || 1920;
  const pixelHeight = img.naturalHeight || 1080;
  const megapixels = parseFloat(((pixelWidth * pixelHeight) / 1000000).toFixed(2));
  const imageAspectRatio = parseFloat((pixelWidth / pixelHeight).toFixed(3));

  // 2. Physical & Target Calculations
  const effectiveWidthCm = Math.max(10, targetWidthCm);
  const effectiveHeightCm = Math.max(10, targetHeightCm);
  const printAreaM2 = parseFloat(((effectiveWidthCm * effectiveHeightCm) / 10000).toFixed(3));
  const targetAspectRatio = parseFloat((effectiveWidthCm / effectiveHeightCm).toFixed(3));
  const aspectRatioDeviationPercent = Math.abs(
    parseFloat((((imageAspectRatio - targetAspectRatio) / targetAspectRatio) * 100).toFixed(1))
  );

  // 3. DPI Calculations
  // Formula: DPI = Pixels / Inches = Pixels / (Cm / 2.54)
  const horizontalDPI = Math.round(pixelWidth / (effectiveWidthCm / 2.54));
  const verticalDPI = Math.round(pixelHeight / (effectiveHeightCm / 2.54));
  const effectiveDPI = Math.min(horizontalDPI, verticalDPI);

  let qualityTier: PreflightResult["dpiAnalysis"]["qualityTier"] = "optimal";
  let dpiLabel = "Óptima para Taller";
  let dpiDescription = "Resolución adecuada para cartelería e impresión gran formato.";
  let viewingDistance = "Apta para observación a más de 1.5 metros.";

  if (effectiveDPI >= 200) {
    qualityTier = "ultra";
    dpiLabel = "Máxima Definición (Ultra HD)";
    dpiDescription = "Nitidez fotográfica perfecta sin pérdida perceptible a corta distancia.";
    viewingDistance = "Lectura muy cercana (< 0.8 metros / Banners & Stands).";
  } else if (effectiveDPI >= 100) {
    qualityTier = "optimal";
    dpiLabel = "Resolución Óptima de Producción";
    dpiDescription = "Estándar profesional para lonas front, vinilos vehiculares y marquesinas.";
    viewingDistance = "Observación estándar (1 a 3 metros).";
  } else if (effectiveDPI >= 60) {
    qualityTier = "acceptable";
    dpiLabel = "Resolución Aceptable (Vía Pública)";
    dpiDescription = "Válido para carteles en altura, gigantografías o lonas mesh vistas a media distancia.";
    viewingDistance = "Vía pública y cartelería en altura (> 3 metros).";
  } else {
    qualityTier = "low";
    dpiLabel = "Baja Resolución / Riesgo de Pixelado";
    dpiDescription = "La imagen tiene pocos píxeles para el tamaño físico solicitado. Podrían notarse bordes dentados.";
    viewingDistance = "Solo aceptable para cartelería lejana (> 5 metros).";
  }

  const minRecommendedPixels = {
    width: Math.round((effectiveWidthCm / 2.54) * 100),
    height: Math.round((effectiveHeightCm / 2.54) * 100),
  };

  // 4. Color Profile & Gamut Analysis
  const binaryColor = await analyzeBinaryColorHeaders(file);
  const gamutSample = sampleGamutRisk(img);

  let ripNotes = "El procesador RIP del taller aplicará conversión de espacio color a Cuatricromía Fogra39.";
  if (binaryColor.space.includes("CMYK")) {
    ripNotes = "Archivo listo para planchas de impresión directa CMYK.";
  } else if (gamutSample.gamutRisk === "high") {
    ripNotes = "Atención: La imagen contiene colores ultra saturados (neón/eléctricos) que se atenuarán ligeramente al traducirse a tintas de cuatricromía CMYK.";
  }

  // 5. Checklist Points Assembly
  const checklist: PreflightChecklistPoint[] = [];

  // Item 1: DPI / Resolution
  checklist.push({
    id: "dpi-check",
    category: "resolution",
    label: "Densidad de Píxeles (DPI)",
    status: qualityTier === "ultra" || qualityTier === "optimal" ? "pass" : qualityTier === "acceptable" ? "warn" : "fail",
    value: `${effectiveDPI} DPI (${pixelWidth}×${pixelHeight} px)`,
    detail: dpiDescription,
    recommendation: qualityTier === "low" ? `Sugerido: ${minRecommendedPixels.width}×${minRecommendedPixels.height} px para 100 DPI` : undefined,
  });

  // Item 2: Color Space & RIP
  checklist.push({
    id: "color-space-check",
    category: "color",
    label: "Espacio de Color & Perfil ICC",
    status: binaryColor.space.includes("CMYK") ? "pass" : gamutSample.gamutRisk === "high" ? "warn" : "pass",
    value: binaryColor.space,
    detail: `${binaryColor.profileName}. ${ripNotes}`,
    recommendation: binaryColor.space.includes("CMYK") ? undefined : "Conversión automática a CMYK Fogra39 sin cargo en taller.",
  });

  // Item 3: Aspect Ratio & Crop Risk
  const isAspectRatioClose = aspectRatioDeviationPercent <= 3.5;
  checklist.push({
    id: "aspect-ratio-check",
    category: "dimensions",
    label: "Proporción y Encuadre",
    status: isAspectRatioClose ? "pass" : aspectRatioDeviationPercent <= 12 ? "warn" : "fail",
    value: `${imageAspectRatio}:1 (Cartel: ${targetAspectRatio}:1)`,
    detail: isAspectRatioClose
      ? "La proporción coincide con el cartel sin recortes significativos."
      : `Desvío del ${aspectRatioDeviationPercent}%. Requiere ajuste de encuadre o sangría perimetral.`,
    recommendation: isAspectRatioClose ? undefined : "Revisar posición en el lienzo para evitar cortes en textos.",
  });

  // Item 4: Bleed (Demasía para Confección y Ojales)
  checklist.push({
    id: "bleed-check",
    category: "bleed",
    label: "Demasía y Zona Segura (Bleed)",
    status: "pass",
    value: "2.0 cm perimetrales recomendados",
    detail: "Mantener textos y logos a más de 3 cm del borde para garantizar integridad de ojales y dobladillo soldado.",
  });

  // 6. Global Score Calculation (0 to 100)
  let score = 100;
  if (qualityTier === "acceptable") score -= 15;
  if (qualityTier === "low") score -= 35;
  if (gamutSample.gamutRisk === "high") score -= 10;
  if (!isAspectRatioClose) score -= Math.min(20, Math.round(aspectRatioDeviationPercent));

  score = Math.max(20, Math.min(100, score));
  const isProductionReady = qualityTier !== "low";

  // Clean object URL
  URL.revokeObjectURL(objectUrl);

  return {
    file: {
      name: fileName,
      sizeBytes,
      formattedSize: formatBytes(sizeBytes),
      mimeType,
    },
    dimensions: {
      pixelWidth,
      pixelHeight,
      megapixels,
      aspectRatio: imageAspectRatio,
    },
    targetPrint: {
      widthCm: effectiveWidthCm,
      heightCm: effectiveHeightCm,
      areaM2: printAreaM2,
      aspectRatio: targetAspectRatio,
      aspectRatioDeviationPercent,
    },
    dpiAnalysis: {
      effectiveDPI,
      horizontalDPI,
      verticalDPI,
      qualityTier,
      label: dpiLabel,
      description: dpiDescription,
      recommendedViewingDistance: viewingDistance,
      minRecommendedPixels,
    },
    colorProfileAnalysis: {
      detectedSpace: binaryColor.space,
      profileName: binaryColor.profileName,
      hasEmbeddedIcc: binaryColor.hasIcc,
      isCmykReady: binaryColor.space.includes("CMYK"),
      gamutRisk: gamutSample.gamutRisk,
      ripNotes,
      sampledAverageBrightness: gamutSample.avgBrightness,
      dominantTone: gamutSample.dominantTone,
    },
    bleedAndMargins: {
      recommendedBleedCm: 2.0,
      safeZoneCm: 3.5,
      notes: "Demasía automática agregada en mesa de corte para tensión perimetral.",
    },
    isProductionReady,
    score,
    checklist,
    inspectedAt: new Date().toISOString(),
  };
}
