# Pilares de Arquitectura — Carteles Click 3D

Este documento establece los principios de diseño arquitectónico y de ingeniería que rigen Carteles Click 3D. Toda decisión técnica y refactorización de código debe alinearse con estos pilares.

---

## 1. Determinismo Geométrico y Fabricabilidad
- **Prioridad:** P2 (Corrección geométrica) y P3 (Fabricabilidad).
- **Regla:** Los modelos 2D y 3D deben alimentarse de la misma fuente de parámetros matemáticos (ancho, alto, espesor, radio, kerf, tipo de fresa/láser).
- **Consistencia:** No pueden coexistir dos motores de cálculo geométrico con fórmulas divergentes.
- **Taller Real:** Ningún parámetro de corte o impresión es universal; las tolerancias dependen de la maquinaria y perfiles de sustrato configurados.

---

## 2. Separación Estricta entre UI/UX y Lógica de Dominio
- **Prioridad:** P5 (UX) y P6 (Rendimiento).
- **Regla (DEC-003):** La interfaz gráfica y la experiencia visual actual son la referencia estética invariante.
- **Desacoplamiento:** Los componentes visuales (vistas, modales, drawers) no deben ejecutar algoritmos de cotización ni mutaciones de datos directas. Deben delegar en stores desacoplados (`useCartStore`, `useMaterialsStore`) y servicios de dominio puros (`quoteEngine`, `catalogService`).

---

## 3. Seguridad y Confidencialidad de Costos
- **Prioridad:** P1 (Seguridad) — No negociable.
- **Regla:** Ningún dato de costo interno, margen de ganancia del taller ni fórmula de markup debe exponerse en el bundle de cliente ni enviarse por API a usuarios con rol cliente.
- **Autoridad de Precios:** El backend Express (`server.ts`) o funciones de servidor son la autoridad final para calcular y validar los precios de las órdenes de compra.
- **Claves y Credenciales:** Ninguna credencial secreta de Firebase Admin o servicios terceros debe residir en variables accesibles por el cliente (`VITE_`).

---

## 4. Integridad de la Orden de Compra (OC) y Trazabilidad
- **Prioridad:** P4 (Trazabilidad).
- **Validación Bloqueante:** Toda línea de pedido debe contar obligatoriamente con sus especificaciones completas:
  1. Medidas validadas (`widthCm` > 0 y `heightCm` > 0, o modo `unidad`).
  2. Tecnología de tinta seleccionada (`inkType`).
  3. Arreglo de terminaciones definido (`finishings`).
  4. Archivo de diseño vinculado o referencia de almacenamiento externo.
- **Inmutabilidad:** Una vez confirmada la Orden de Compra, los datos quedan congelados en Firestore para auditoría y fabricación.

---

## 5. Persistencia Híbrida y Resiliencia Offline-First
- **Prioridad:** P4 (Trazabilidad) y P5 (UX).
- **Carrito y Cotizaciones:** El estado del carrito se mantiene en almacenamiento local reactivo (Zustand `persist`) y se sincroniza bidireccionalmente con Firestore (`/carts/{uid}`) ante cambios y al iniciar sesión.
- **Archivos de Diseño:** Los archivos pesados se suben directamente a Firebase Storage (`designs/{itemId}/...`) o se enlazan mediante URL pública/Drive, guardando únicamente el puntero metadata en Firestore.

---

## 6. Preservación Estética Invariante (DEC-003)
- **Regla de Oro:** Se prohíbe reescribir o rediseñar la UI visual desde cero.
- **Alcance del Refactor:** La reestructuración abarca el ordenamiento modular de catálogo, productos, cotizador, bulk order, terminaciones, roles y persistencia, garantizando cero regresiones visuales.
