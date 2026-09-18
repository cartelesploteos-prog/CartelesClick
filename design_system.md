# Design System — Carteles Click 3D
## Capa Invariante de Diseño y Tipografía

Este documento define la capa invariante del sistema de diseño para Carteles Click 3D. Todo componente, vista o estilo debe alinearse estrictamente a estas definiciones.

---

### 1. Tipografía y Jerarquía de Encabezados (H1 - H6)

#### 1.1 Familias Tipográficas
- **Encabezados (`--font-heading`):** `Outfit`, sans-serif (geométrica, moderna, técnica).
- **Cuerpo y UI (`--font-sans`):** `Inter`, -apple-system, BlinkMacSystemFont, sans-serif.
- **Monospaciado y Cotas (`--font-mono`):** `JetBrains Mono`, monospace.

#### 1.2 Regla Invariante de Pesos Tipográficos en Encabezados (H)
> **REGLA ESTRICTA:** En ningún encabezado (`h1` a `h6`), clase de encabezado canónico (`.text-canonical-h1` a `.text-canonical-h6`) ni elemento con clase `.font-heading` se permite el uso de pesos **Bold** (`font-bold`, 700 / 800) ni **Black** (`font-black`, 900 / 950).

- **Motivo de Diseño:** Evitar la pesadez visual tosca y el cliché de interfaces genéricas. Proporcionar un carácter técnico, de ingeniería y manufactura con alta legibilidad, elegancia contemporánea y balance óptico.
- **Pesos Permitidos:**
  - `font-medium` (500): Peso estándar para H2 a H6 y `.font-heading`.
  - `font-semibold` (600): Peso máximo permitido para H1 o destacados de alta jerarquía.
  - `font-normal` (400): Permitido en subtítulos o elementos subordinados.

#### 1.3 Escala Canónica de Encabezados

| Nivel | Selector | Tamaño (Fluid Clamp) | Line Height | Letter Spacing | Peso (`font-weight`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1** | `h1`, `.text-canonical-h1` | `clamp(2rem, 1.642rem + 1.59vw, 3rem)` | 1.15 | `-0.025em` | **600 (SemiBold)** |
| **H2** | `h2`, `.text-canonical-h2` | `clamp(1.5rem, 1.232rem + 1.19vw, 2.25rem)` | 1.20 | `-0.02em` | **500 (Medium)** |
| **H3** | `h3`, `.text-canonical-h3` | `clamp(1.25rem, 1.071rem + 0.80vw, 1.75rem)` | 1.25 | `-0.015em` | **500 (Medium)** |
| **H4** | `h4`, `.text-canonical-h4` | `clamp(1.09375rem, 0.993rem + 0.45vw, 1.375rem)` | 1.30 | `-0.01em` | **500 (Medium)** |
| **H5** | `h5`, `.text-canonical-h5` | `clamp(0.9375rem, 0.87rem + 0.30vw, 1.125rem)` | 1.35 | `-0.005em` | **500 (Medium)** |
| **H6** | `h6`, `.text-canonical-h6` | `clamp(0.75rem, 0.705rem + 0.20vw, 0.875rem)` | 1.40 | `+0.04em` (uppercase) | **500 (Medium)** |
| **Base** | `.font-heading` | Heredado / Variable | Variable | Variable | **500 (Medium)** |

---

### 2. Paleta de Neutros y Modo Oscuro Refinado

- **Filosofía:** Modo oscuro suave basado en escala `zinc` neutra cálida, evitando fondos negros puros (`#000000`) o contrastes agresivos.
- **Fondo de Página (`--bg-page`):** `#18181B` (Zinc-900).
- **Superficie de Tarjetas (`--bg-surface`):** `#27272A` (Zinc-800).
- **Superficie Sutil (`--bg-surface-subtle`):** `#3F3F46` (Zinc-700).
- **Bordes Sutiles (`--border-subtle`):** `rgba(255, 255, 255, 0.08)`.
- **Acento Primario:** Azul industrial (`#0055FF`).
- **Acento Taller / Material:** Terracota / Ladrillo (`var(--brand-brick)`: `#E05A47`).

---

### 3. Espaciado y Relleno

- **Relleno Lateral Estándar:** `px-6` (24px) en vistas principales y contenedores modales, asegurando aire y respiración visual sin aglutinamiento en bordes.
- **Radios de Borde:** Máximo de 12px a 16px para tarjetas estructurales (`rounded-xl` o `rounded-2xl`).
