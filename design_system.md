# Design System — Carteles Click 3D
## Capa Invariante de Diseño y Tipografía

Este documento define la capa invariante del sistema de diseño para Carteles Click 3D. Todo componente, vista o estilo debe alinearse estrictamente a estas definiciones.

---

### 1. Tipografía y Jerarquía de Encabezados (H1 - H6)

#### 1.1 Familias Tipográficas
- **Encabezados (`--font-heading`):** `Sansation`, sans-serif (definida por Mariano según DEC-002; limpia, geométrica con curvas distintivas).
- **Cuerpo y UI (`--font-sans`):** `Plus Jakarta Sans`, system-ui, -apple-system, BlinkMacSystemFont, sans-serif.
- **Monospaciado y Cotas (`--font-mono` / `--font-tech`):** `Space Grotesk`, monospace.

#### 1.2 Regla Invariante de Pesos Tipográficos en Encabezados (H)
> **REGLA ESTRICTA (DEC-002):** Todos los encabezados (`h1` a `h6`), clases de encabezados canónicos (`.text-canonical-h1` a `.text-canonical-h6`) y selectores `.font-heading` se configuran estrictamente en peso **Regular (400)**.

- **Motivo de Diseño:** Directiva explícita de Mariano ("La tipografía de los H es Sansation en un peso regular"). Evita sobrecargas visuales, manteniendo una lectura limpia y ligera.
- **Peso Permitido:**
  - `font-normal` / Regular (400) para H1 a H6 y `.font-heading`.

#### 1.3 Escala Canónica de Encabezados

| Nivel | Selector | Tamaño (Fluid Clamp) | Line Height | Letter Spacing | Peso (`font-weight`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1** | `h1`, `.text-canonical-h1` | `clamp(2rem, 1.642rem + 1.59vw, 3rem)` | 1.15 | `-0.015em` | **400 (Regular)** |
| **H2** | `h2`, `.text-canonical-h2` | `clamp(1.5rem, 1.232rem + 1.19vw, 2.25rem)` | 1.20 | `-0.01em` | **400 (Regular)** |
| **H3** | `h3`, `.text-canonical-h3` | `clamp(1.25rem, 1.071rem + 0.80vw, 1.75rem)` | 1.25 | `-0.01em` | **400 (Regular)** |
| **H4** | `h4`, `.text-canonical-h4` | `clamp(1.09375rem, 0.993rem + 0.45vw, 1.375rem)` | 1.30 | `0` | **400 (Regular)** |
| **H5** | `h5`, `.text-canonical-h5` | `clamp(0.9375rem, 0.87rem + 0.30vw, 1.125rem)` | 1.35 | `0` | **400 (Regular)** |
| **H6** | `h6`, `.text-canonical-h6` | `clamp(0.75rem, 0.705rem + 0.20vw, 0.875rem)` | 1.40 | `+0.04em` (uppercase) | **400 (Regular)** |
| **Base** | `.font-heading` | Heredado / Variable | Variable | Variable | **400 (Regular)** |

---

### 2. Paleta de Neutros y Modo Oscuro Refinado
 
- **Filosofía:** Modo oscuro Slate/Midnight de alta nitidez técnica y elegancia industrial.
- **Fondo de Página (`--bg-page`):** `#0B0F19` en modo oscuro; `#F8FAFC` en modo claro.
- **Superficie de Tarjetas (`--bg-surface`):** `#111827` en oscuro; `#FFFFFF` en claro.
- **Superficie Sutil (`--bg-surface-subtle`):** `#1F2937` en oscuro; `#F1F5F9` en claro.
- **Bordes Sutiles (`--border-subtle`):** `rgba(255, 255, 255, 0.08)`.
- **Acento Primario:** Azul industrial y de marca (`#1D4ED8` / `#2563EB`).
- **Acento Taller / Material:** Terracota / Ladrillo (`var(--brand-brick)`: `#1D4ED8` / `#2563EB`).

---

### 3. Espaciado y Relleno

- **Relleno Lateral Estándar:** `px-6` (24px) en vistas principales y contenedores modales, asegurando aire y respiración visual sin aglutinamiento en bordes.
- **Radios de Borde:** Máximo de 12px a 16px para tarjetas estructurales (`rounded-xl` o `rounded-2xl`).
