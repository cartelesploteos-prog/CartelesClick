import QRCode from "qrcode";

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generates a Data URL (base64 image/png) for a given text or URL.
 */
export async function generateQRCodeDataUrl(
  text: string,
  options?: QRCodeOptions
): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: options?.width || 256,
      margin: options?.margin || 2,
      color: {
        dark: options?.color?.dark || "#000000",
        light: options?.color?.light || "#ffffff",
      },
      errorCorrectionLevel: "M",
    });
    return dataUrl;
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw err;
  }
}

/**
 * Generates an SVG string for a given text or URL.
 */
export async function generateQRCodeSvg(
  text: string,
  options?: QRCodeOptions
): Promise<string> {
  try {
    const svgString = await QRCode.toString(text, {
      type: "svg",
      width: options?.width || 256,
      margin: options?.margin || 2,
      color: {
        dark: options?.color?.dark || "#000000",
        light: options?.color?.light || "#ffffff",
      },
      errorCorrectionLevel: "M",
    });
    return svgString;
  } catch (err) {
    console.error("Error generating QR SVG code:", err);
    throw err;
  }
}
