# Decision Log — Carteles Click 3D

## DEC-001: Supresión de pesos Bold (700) y Black (900) en Tipografía de Encabezados (H)

- **Fecha:** 2026-09-17
- **Estado:** CERRADA / APROBADA
- **Solicitante:** Mariano
- **Ámbito:** `design_system.md`, `src/index.css`, componentes React (`<h1` a `<h6`, `.font-heading`)

### Contexto y Problema
Los encabezados globales y varias vistas utilizaban pesos pesados (`font-bold` / 700 y `font-black` / 900) tanto por herencia en la capa base de CSS como por clases utilitarias locales. Esto generaba un impacto visual sobrecargado, tosco y genérico que restaba nitidez técnica y elegancia a la interfaz del cotizador y visualizador 3D.

### Decisión
1. Prohibir de manera estricta el uso de pesos Bold (700 / 800) y Black (900 / 950) en todos los encabezados (`h1` a `h6`), clases canónicas (`.text-canonical-h1` a `.text-canonical-h6`) y selectores `.font-heading`.
2. Establecer como peso estándar en la capa base `font-weight: 500` (Medium) para H2 a H6 y `.font-heading`.
3. Establecer como peso máximo `font-weight: 600` (SemiBold) para H1 y llamadas numéricas destacadas.
4. Documentar e integrar esta regla como principio invariante en `design_system.md`.

### Alternativas Descartadas y Motivos
- **Alternativa A: Regular / Normal (400) en todos los encabezados:**
  - *Descarte:* En jerarquías intermedias (H4-H6) sobre fondos Zinc oscuros, el peso 400 puede perder contraste visual respecto al texto de cuerpo (`p`).
- **Alternativa B: Mantener Bold (700) solo en H1:**
  - *Descarte:* Rechazada explícitamente por el usuario ("No uses en los H Bold ni black"). SemiBold (600) otorga suficiente jerarquía estructural sin la pesadez de los 700+.

### Validación
- Verificado en `src/index.css` (capa `@layer base` y estilos de impresión).
- Verificado en todos los componentes (`AiDesignDrawer.tsx`, `AiUsageChargesTable.tsx`, `OrderQRCodeModal.tsx`, `CotizadorView.tsx`, `MaterialsCatalogView.tsx`, `AdminAiUsageView.tsx`, `WholesaleView.tsx`, `FloatingDock.tsx`, `PosterCreatorView.tsx`).
- Total de etiquetas `<h[1-6]>` con Bold/Black en el codebase: 0.
