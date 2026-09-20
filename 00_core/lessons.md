# Lecciones Aprendidas y Registro de Soluciones — Carteles Click 3D

Este documento registra los aprendizajes técnicos, fallos resueltos, causas raíz y directivas preventivas derivadas del desarrollo y mantenimiento del proyecto.

---

## LE-001: Cotización Bloqueada para Usuarios No Autenticados (Invitados)
- **Problema:** Los usuarios sin sesión iniciada no recibían precios ni cotizaciones en el cotizador o el catálogo ("Anon firS o sin login no arroja precios").
- **Causa Raíz:** En `server.ts` existían rutas duplicadas de `/api/quote-batch` con una colisión en el mapeo de IDs entre el formato de cliente (ej. `acrilico-cristal-3mm`) y el formato interno del servidor (`acrilico_cristal_3mm`), sumado a una verificación prematura de autenticación.
- **Solución:** Se unificó el middleware y la ruta en `server.ts`, introduciendo la función `mapClientMaterialIdToServer()` que normaliza guiones y nombres de materiales, permitiendo el cálculo determinístico para usuarios anónimos sin exigir login hasta la confirmación de la Orden de Compra.
- **Regla Preventiva:** La cotización exploratoria y simulación 3D debe ser 100% accesible para visitantes. El login solo se exige al emitir la Orden de Compra.

---

## LE-002: Contaminación de Pesos Tipográficos en Encabezados H1-H6
- **Problema:** Múltiples componentes y la capa base de Tailwind introducían pesos Bold (700) y Black (900), resultando en una estética pesada y poco técnica.
- **Causa Raíz:** Herencia de plantillas genéricas de SaaS y clases dispersas como `font-bold` en encabezados.
- **Solución:** Se formalizó la directiva DEC-002 en `design_system.md` y `src/index.css`, fijando `Sansation` estrictamente en `font-weight: 400` para todos los `h1` a `h6` tanto en pantalla como en medios de impresión `@media print`.
- **Regla Preventiva:** Ningún nuevo componente o refactor puede usar `font-bold` o `font-black` en títulos.

---

## LE-003: Errores de Fabricación por Órdenes de Compra Incompletas
- **Problema:** Se podían enviar ítems al carrito y avanzar al pago sin que el usuario hubiera seleccionado tinta o terminaciones críticas para producción.
- **Causa Raíz:** El carrito trataba ciertos campos de personalización como opcionales sin validación bloqueante a nivel de estado global.
- **Solución:** Se implementó `isCartValid()` en `useCartStore` y se colocó una guardia estricta tanto en el botón de checkout de `CartDrawer.tsx` como en la función `handleCheckout()`, impidiendo cualquier transacción si un solo ítem tiene medidas, tinta o terminaciones vacías.
- **Regla Preventiva:** Las restricciones de integridad de datos deben validarse a nivel de Store de Zustand, no únicamente con deshabilitado cosmético en el DOM.

---

## LE-004: Trazabilidad de Archivos de Diseño en Ítems de Carrito
- **Problema:** Al agregar productos mediante bulk order o cotizador, el archivo o vector del cliente se perdía o no quedaba vinculado al ítem del carrito.
- **Causa Raíz:** Falta de un controlador interactivo por renglón con soporte para almacenamiento persistente.
- **Solución:** Se creó `ItemFileAttachmentController.tsx`, permitiendo subir archivos directamente al bucket de Firebase Storage (`/designs/{itemId}/...`) con barra de progreso en vivo o enlazar URLs de Google Drive/Dropbox.
- **Regla Preventiva:** Los archivos de diseño deben enlazarse por ID de renglón y persistir en la metadata del documento de Firestore de la OC.

---

## LE-005: Preservación de UI Validada y Prevención de Reescrituras Innecesarias
- **Problema:** Riesgo de alterar componentes visuales que funcionan correctamente al intentar refactorizar la lógica interna.
- **Causa Raíz:** Confundir la reestructuración de modelos de datos y arquitectura con rediseños visuales.
- **Solución (DEC-003):** Se declaró la UI/UX actual como fuente de verdad estética invariante. Toda reestructuración debe concentrarse en el desacoplamiento interno, catálogo, cotizador y persistencia sin alterar jerarquías ni microinteracciones.
