/**
 * Zod Validation Schemas for Carteles.Click
 * Validates special measurements (width, height), quantities, and material parameters
 * before submitting to the quote calculation engine.
 */

import { z } from "zod";

export const quoteDimensionsSchema = z.object({
  materialId: z.string().min(1, "Seleccioná un material válido o sustrato."),
  
  widthCm: z.preprocess(
    (val) => (val === undefined || val === null || val === "" ? undefined : Number(val)),
    z.number()
      .positive("El ancho debe ser mayor a 0 cm.")
      .min(5, "El ancho mínimo para confección es 5 cm.")
      .max(5000, "El ancho máximo por paño continuo es 5.000 cm (50 metros).")
  ),

  heightCm: z.preprocess(
    (val) => (val === undefined || val === null || val === "" ? undefined : Number(val)),
    z.number()
      .positive("El alto debe ser mayor a 0 cm.")
      .min(5, "El alto mínimo para confección es 5 cm.")
      .max(5000, "El alto máximo es 5.000 cm (50 metros).")
  ),

  quantity: z.preprocess(
    (val) => (val === undefined || val === null || val === "" ? 1 : Number(val)),
    z.number()
      .int("La cantidad debe ser un número entero.")
      .min(1, "La cantidad mínima de fabricación es 1 unidad.")
      .max(10000, "Para tiradas mayores a 10.000 unidades, contactar al sector de venta mayorista/gremio.")
  ),

  finishings: z.array(z.string()).optional().default([]),
  printQuality: z.enum(["estandar", "alta_resolucion"]).optional().default("estandar"),
  inkType: z.enum(["solvente", "uv", "directa_uv"]).optional().default("solvente"),
  selectedColor: z.string().optional(),
  mountOption: z.object({
    type: z.enum(["mdf", "pvc", "pai", "chapa"]),
    typeName: z.string(),
    thickness: z.string(),
    pricePerM2ARS: z.number()
  }).optional(),
  
  customerType: z.enum(["comun", "agencia", "imprenta", "cartelero"]).optional().default("comun")
});

export type QuoteInput = z.infer<typeof quoteDimensionsSchema>;

export interface ValidationResult {
  success: boolean;
  data?: QuoteInput;
  errors?: Record<string, string>;
  firstError?: string;
}

/**
 * Validates quote input parameters against the Zod schema.
 */
export function validateQuoteParams(input: unknown): ValidationResult {
  const result = quoteDimensionsSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  let firstError = "Ocurrió un error en los datos ingresados.";

  result.error.issues.forEach((issue, index) => {
    const fieldName = (issue.path[0] as string) || "general";
    if (!errors[fieldName]) {
      errors[fieldName] = issue.message;
    }
    if (index === 0) {
      firstError = issue.message;
    }
  });

  return { success: false, errors, firstError };
}
