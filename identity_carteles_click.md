# Identidad Visual y Experiencia — Carteles Click 3D

Este documento define la capa de identidad de producto para Carteles Click 3D.
Conforme a §3 del protocolo, este documento especifica únicamente: paleta, tipografía, radios, densidad, motion y voz.
Conforme a DEC-003, la UI/UX visual actual es la referencia y fuente de verdad estética definitiva.

---

## 1. Paleta Cromática

### 1.1 Colores Principales de Marca
- **Azul Industrial (Primario):** `#1D4ED8` (Hover: `#2563EB` / Active: `#1E40AF`). Otorga precisión técnica, confianza y presencia de software CAD/industrial.
- **Naranja Taller (Acento Operativo):** `#F97316` / `#EA580C`. Utilizado en llamadas a la acción clave de taller y elementos de fabricación física.

### 1.2 Neutros Técnicos (Tema Oscuro Midnight / Slate)
- **Fondo de Página (`--bg-page`):** `#0B0F19` (profundidad oscura, descanso visual en sesiones prolongadas de diseño 3D).
- **Superficie de Tarjetas (`--bg-surface`):** `#111827` (elevación de contraste moderado $\le 12\%$).
- **Superficie Sutil (`--bg-surface-subtle`):** `#1F2937` (fondos de inputs, selectores y contenedores secundarios).
- **Líneas y Divisores (`--border-subtle`):** `rgba(255, 255, 255, 0.08)`. Bordes nítidos sin sombras excesivas.

### 1.3 Semántica de Estado
- **Éxito / Fabricable:** `#10B981` (Emerald).
- **Advertencia / Incompleto:** `#F59E0B` (Amber).
- **Error / Bloqueante:** `#EF4444` (Rose/Red).
- **Informativo / Técnico:** `#3B82F6` (Blue Sky).

---

## 2. Tipografía

- **Encabezados (`H1-H6` y `.font-heading`):** `Sansation`, sans-serif. Configurado estrictamente en **peso Regular (400)** según DEC-002.
- **Cuerpo y Controles (`--font-sans`):** `Plus Jakarta Sans`, sans-serif. Pesos permitidos: 400 (regular), 500 (medium) y 600 (semibold).
- **Datos Numéricos, Cotas y Moneda (`--font-mono` / `--font-tech`):** `Space Grotesk`, monospace. Alta legibilidad tabular para medidas, dimensiones y precios.

---

## 3. Radios de Borde y Geometría de Componentes

- **Contenedores y Tarjetas Principales:** `rounded-xl` (12px) a `rounded-2xl` (16px).
- **Contenedores Anidados / Inputs:** `rounded-lg` (8px). Sigue la fórmula matemática $R_{\text{interior}} = R_{\text{exterior}} - \text{Padding}$.
- **Badges, Etiquetas y Botones de Acción Rápida:** `rounded-full` (pills) para elementos unitarios de una sola línea.

---

## 4. Densidad y Espaciado

- **Relleno de Vistas Principales:** `px-6` (24px) a `px-8` (32px) para permitir respiración y orden en monitores de escritorio.
- **Densidad Técnica en Paneles y Drawers:** Espaciados controlados de 10px a 16px (`p-2.5` a `p-4`) que maximizan la visualización de listas de productos sin scroll innecesario.

---

## 5. Motion y Microinteracciones

- **Biblioteca:** `motion/react` (Framer Motion).
- **Transiciones de Paneles (Drawers):** Entrada deslizante suave desde el lateral derecho (`x: '100%'` $\to$ `x: 0`, duración 250ms, curva `easeOut`).
- **Modales y Diálogos:** Aparición sutil con escala (`scale: 0.96` $\to$ `1.0`, `opacity: 0` $\to$ `1.0`, duración 180ms).
- **Interacciones de Botón:** Escala sutil al presionar (`whileTap={{ scale: 0.98 }}`) y realce cromático en hover.

---

## 6. Voz y Tono

- **Personalidad:** Profesional, directo, técnico y conservador.
- **Vocabulario:** Propio de taller de cartelería, rotulación y producción gráfica: sustratos, gramajes, micrones, curvado, vectorizado, sangría, demasía, dobladillo, remaches, ojales.
- **Claridad de Errores:** Explicar siempre **QUÉ** falta, **POR QUÉ** es necesario y **CÓMO** corregirlo, sin tecnicismos crípticos ni jerga genérica.
