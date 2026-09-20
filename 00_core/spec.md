# Especificaciones Técnicas y Funcionales — Carteles Click 3D

Este documento define la especificación canónica del producto: catálogo, reglas de producto, terminaciones, cálculo, Bulk Order, Orden de Compra y roles.

---

## 1. Catálogo y Sustratos

### 1.1 Familias de Materiales
- **Rígidos:** Acrílico cristal / color (2mm, 3mm, 5mm, 8mm, 10mm), PVC espumado Sintra (3mm, 5mm, 10mm), Chapa galvanizada, Polifán de alta densidad (20mm, 30mm, 40mm, 50mm), MDF / Fibrofácil, Alto Impacto (Pai), Policarbonato alveolar y compacto.
- **Flexibles / Rollos:** Lona Frontlight 13oz, Lona Backlight traslúcida, Lona Blackout doble cara, Lona Mesh microperforada, Vinilo calandrado promocional (brillante/mate), Vinilo polimérico larga duración, Vinilo microperforado para vidrieras, Vinilo esmerilado de privacidad, Papel fotográfico pesado.
- **Letras Corpóreas:** Frente acrílico + lateral termoformado / aluminio, Polifán pintado con látex exterior, Chapa oxidada rústica, Neon LED sobre base acrílica ruteada.
- **Accesorios y Montaje:** Bastidores de hierro estructural 20x20, perfiles de aluminio para tensado, distanciadores de acero inoxidable, cintas de montaje VHB.

### 1.2 Modos de Cálculo (`CalculationMode`)
- `superficie`: Precio base por metro cuadrado (m² = Ancho [m] × Alto [m]). Aplica factor de aprovechamiento y merma según ancho de bobina o placa estándar.
- `lineal`: Precio base por metro lineal de corte, plegado o iluminación perimetral.
- `unidad`: Precio fijo unitario por pieza o paquete terminado.
- `volumetrico`: Cálculo por perímetro de corte y volumen cúbico de material para letras y figuras 3D.

---

## 2. Tecnologías de Tinta e Impresión

| Código | Denominación | Uso Recomendado | Tipo de Curado / Resistencia |
| :--- | :--- | :--- | :--- |
| `uv` | Impresión UV Directa | Rígidos y flexibles premium | Curado instantáneo LED-UV, alta durabilidad solar sin laminado obligatorio. |
| `latex` | Tintas HP Látex | Flexibles, vinilos vehiculares y papel | Tintas base agua ecológicas, sin olor, listas para instalar inmediatamente. |
| `solvente` | Tintas Solventes | Lonas de vía pública gran formato | Máxima agresividad y anclaje a la intemperie a bajo costo. |
| `eco-solvente` | Eco-Solvente HD | Vinilos de alta definición y cartelería interior | Gotas microscópicas (1200-1440 DPI), alta gama tonal sin toxicidad agresiva. |
| `sublimacion` | Sublimación Textil | Banderas, banners de tela y displays | Transferencia térmica sobre poliéster, lavable y plegable sin marcas. |

---

## 3. Terminaciones y Acabados

1. **Ojales Metálicos:**
   - Perimetrales cada 20cm, 30cm o 50cm, o solo en las 4 esquinas.
   - Cálculo por cantidad de unidades instaladas.
2. **Dobladillo Reforzado:**
   - Soldadura térmica perimetral para tensado de lonas. Cálculo por metro lineal perimetral (`2 * (W + H)`).
3. **Laminado Protector:**
   - Brillante, Mate o Antigraffiti UV. Cálculo por metro cuadrado de superficie.
4. **Ruteado CNC / Corte Contorno Láser:**
   - Corte perimetral según curvas vectoriales del archivo. Cálculo por metro lineal de corte según espesor y dureza del material.
5. **Bolsillo Pasacaño:**
   - Superior e inferior para colgado de banners y estandartes.
6. **Cinta Doble Faz de Montaje:**
   - Aplicación en reverso para montaje en seco sobre vidrio o pared lisa.

---

## 4. Motor de Cotización y Carga Masiva (Bulk Order)

### 4.1 Cotización Determinística
- Toda cotización evalúa:
  $$\text{Precio Subtotal} = (\text{Costo Material} \times \text{Factor Merma} + \text{Costo Impresión} + \sum \text{Terminaciones}) \times \text{Markup} \times (1 - \text{Descuento Mayorista})$$
- El backend (`/api/quote` y `/api/quote-batch`) es la autoridad matemática de confirmación.

### 4.2 Carga Masiva (Bulk Order)
- Permite pegar múltiples renglones desde planillas de cálculo (Excel / Google Sheets).
- **Formato admitido:** `[Sustrato] [Ancho x Alto] [Tinta] [Terminaciones] [Cantidad]`
- **Parser inteligente:** Expresiones regulares que identifican dimensiones numéricas (ej. `150x80`, `2.5x1.2`), normalizan a centímetros, emparejan el sustrato más cercano del catálogo y mapean las terminaciones reconocidas.

---

## 5. Orden de Compra (OC) y Facturación Técnica

### 5.1 Regla de Completitud Bloqueante (Validación Estricta)
Ninguna Orden de Compra puede proceder al pago o confirmación si algún ítem incumple:
- Medida válida (`widthCm > 0` y `heightCm > 0` o modo `unidad`).
- Tinta seleccionada explícitamente (`inkType` presente).
- Arreglo de terminaciones definido (`finishings`).
- Archivo adjunto o link externo documentado (`fileAttachment`).

### 5.2 Documento Técnico Generado
- Resumen interactivo desglosado por renglón.
- Generación de PDF oficial con cotas, sustratos, tintas, terminaciones y link al archivo de producción.
- Código QR único para trazabilidad física en el taller.

---

## 6. Modelo de Roles y Accesos

- **Cliente (`customer`):**
  - Acceso al Cotizador interactivo 3D.
  - Creación y edición de carritos y cotizaciones.
  - Carga masiva de pedidos.
  - Confirmación de Órdenes de Compra y seguimiento de estado.
  - Ocultamiento estricto de costos de fábrica, fórmulas de markup y márgenes de ganancia.
- **Administrador / Taller (`admin`):**
  - Gestión completa del catálogo de materiales y precios de insumos.
  - Visualización del desglose de costos y tiempos de máquina.
  - Actualización de estados de producción de la OC (`pending_review` $\to$ `in_production` $\to$ `ready` $\to$ `dispatched`).
  - Auditoría de órdenes y descarga directa de archivos de impresión originales.
