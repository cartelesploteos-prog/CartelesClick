# Carteles.Click — Identidad Visual y de Producto

Este documento define la capa de identidad del producto (paleta, tipografía, radios, densidad, motion y voz). Ninguna regla de este documento puede contradecir ni sobrescribir la capa de arquitectura invariante o las reglas de negocio.

## 1. Paleta de Colores

- **Primario (Acción/Conversión)**: Naranja Industrial `#FF5520` (Hover: `#FF6B38`).
  - *Propósito*: Representa velocidad, manufactura, energía y procesos industriales. Utilizado exclusivamente para el CTA principal y acciones que avanzan en el flujo de compra.
- **Secundario (Acento/Resaltado)**: Amarillo Láser `#FCD34D`.
  - *Propósito*: Utilizado para efectos lumínicos de recorrido (ej. *BorderBeam* perimetral), insignias de "Mejor Opción" y elementos que requieren atención sin opacar al primario.
- **Neutros y Superficies**:
  - *Dark Mode (Default)*: Fondos basados en `#111111` (reducción de fatiga visual, alto contraste técnico).
  - *Superficies*: Modulación mediante opacidades (ej. `bg-white/10` o `bg-black/10` con `backdrop-blur`) para generar jerarquía sin añadir matices de color innecesarios.

## 2. Par Tipográfico

- **Títulos y Encabezados (Display)**: `Outfit` (o geométrica similar).
  - *Propósito*: Transmite solidez estructural y precisión técnica; características indispensables para una fábrica de cartelería.
- **Cuerpo de Texto y Datos (Body)**: `Plus Jakarta Sans`.
  - *Propósito*: Máxima legibilidad en cuerpos de texto pequeños y números; crítico para las tablas densas de cotización, desgloses de precios y medidas técnicas.

## 3. Radios y Geometría UI

- **Elementos de Acción (CTAs)**: Radios máximos (Píldora / `rounded-full`). Denotan botones listos para clics rápidos, reduciendo la fricción visual.
- **Contenedores, Paneles y Tarjetas**: Radios controlados estructuralmente (`rounded-xl` / 12px a `rounded-2xl` / 16px). Mantienen una geometría limpia que no compite con las esquinas redondeadas de los componentes interiores ni con las proporciones de los carteles diseñados.

## 4. Motion Design y Transiciones

- **Física del Movimiento (Microinteracciones)**:
  - Transiciones basadas en tensión/resorte (Spring animations) para las interacciones táctiles: `scale: 1.03` en hover, `scale: 0.97` en tap. Brindan una sensación física, de botón de "maquinaria" que responde inmediatamente.
- **Efectos de Foco Contínuo**:
  - Haces de luz dinámicos que recorren de forma continua y lineal el perímetro de un contenedor (BorderBeam rotativo de 4s). Llama la atención sobre el flujo ideal sin utilizar animaciones que parpadeen o cansen la vista.
- **Tiempos de Respuesta**:
  - Tiempos asimétricos rápidos. Toda la interfaz debe responder en menos de 200ms a la interacción del usuario para sostener la premisa de "Ágil en unos pasos".

## 5. Voz y Tono

- **Personalidad**: Directa, profesional, ágil y experta.
- **Aplicación**: Textos cortos y orientados a resultados (ej. "Cotizá en Vivo", "Compra Bulk Order", "Ágil en unos pasos"). Evita jergas abstractas de software; prefiere términos industriales claros o beneficios transaccionales directos.
