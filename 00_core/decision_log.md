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

---

## DEC-002: Tipografía de Encabezados (H1-H6) en Sansation Regular (400)

- **Fecha:** 2026-09-18
- **Estado:** CERRADA / APROBADA
- **Solicitante:** Mariano ("La tipografía de los H es Sansation en un peso regular")
- **Ámbito:** `src/index.css`, `index.html`, `design_system.md`, todos los encabezados `<h1>` a `<h6>` y clases `.text-canonical-h1` a `.text-canonical-h6`.

### Decisión
1. Definir `--font-heading: "Sansation", sans-serif;` como la tipografía para todos los encabezados del sistema.
2. Fijar de manera estricta `font-weight: 400` (Regular / Normal) para todos los niveles de encabezados (`h1` a `h6`), clases canónicas `.text-canonical-h*` y selectores `.font-heading`.
3. Cargar la familia `Sansation` desde Google Fonts en `index.html`.

### Validación
- `index.html` carga Google Fonts con la familia Sansation.
- `src/index.css` aplica `font-family: var(--font-heading), 'Sansation', sans-serif;` y `font-weight: 400;` en `h1-h6`.
- Compilación y linting validados.

---

## DEC-003: UI/UX Actual como Referencia Estética Invariante y Enfoque de Reconstrucción de Dominio

- **Fecha:** 2026-09-19
- **Estado:** CERRADA / APROBADA
- **Solicitante:** Mariano
- **Ámbito:** Toda la aplicación (Frontend, Dominio, Catálogo, Cotizador, Bulk Order, OC, Roles, Base de datos)

### Contexto y Problema
Se requería clarificar el alcance de la reestructuración del proyecto para evitar rediseños innecesarios de interfaces que ya están visual y funcionalmente validadas, concentrando el esfuerzo técnico en la robustez interna y la consistencia de datos.

### Decisión
1. **Fuente de Verdad Estética:** La UI/UX visual actual de CartelesClick es la referencia y fuente de verdad estética definitiva. Queda terminantemente prohibido rediseñarla desde cero.
2. **Preservación Invariante:** Se preserva intacto el lenguaje visual, composición, jerarquías tipográficas, componentes UI, diseño responsivo, navegación, microinteracciones y comportamientos operativos existentes.
3. **Foco Exclusivo de Reconstrucción:** Todo el trabajo de reestructuración debe concentrarse en ordenar y desacoplar:
   - Arquitectura y separación de responsabilidades.
   - Catálogo de materiales, sustratos y tecnologías.
   - Modelo de Producto y reglas de compatibilidad.
   - Terminaciones y acabados (cálculo, costos y compatibilidad).
   - Motor de Cotización (determinístico, sincronizado entre cliente y backend).
   - Módulo de Carga Masiva (Bulk Order).
   - Orden de Compra (OC), especificaciones técnicas y trazabilidad de archivos de diseño.
   - Modelo de Roles (Cliente, Taller, Administrador) y permisos de visualización.
   - Modelo de datos y esquemas de persistencia en Firestore.

### Alternativas Descartadas y Motivos
- **Rediseño completo de vistas (Re-skinning / nuevo layout):** Descartado taxativamente por Mariano. Introduce riesgo de regresión en flujos que ya funcionan, desaprovecha el trabajo consolidado de UX y diluye el foco técnico.

### Validación
- Registrado como principio rector en el corpus documental.
- Cualquier propuesta que altere la estética o experiencia visual consolidada será clasificada y rechazada como fuera de alcance.

