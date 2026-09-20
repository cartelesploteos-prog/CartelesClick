# Blueprint del Sistema — Carteles Click 3D

Este documento esquematiza la topología de componentes, capas arquitectónicas, servicios de backend y flujos de datos de la plataforma.

---

## 1. Arquitectura en Capas

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CAPA DE PRESENTACIÓN (UI/UX)                   │
│  React 18 · Vite · Tailwind CSS · Motion · Three.js · Lucide Icons     │
│  [Header / Nav] · [CotizadorView 3D] · [MaterialsCatalog] · [Cart]     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                        ESTADO GLOBAL REACTIVO (ZUSTAND)                 │
│  - useCartStore: Ítems, validación estricta isCartValid, persistencia │
│  - useAuthStore: Sesión de usuario, rol, carga automática de carrito   │
│  - useCurrencyStore: Conversión de divisas, formateo de precios         │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                        SERVICIOS DE DOMINIO Y UTILIDADES               │
│  - quoteEngine / quoteService: Algoritmos de cálculo de m² y acabados   │
│  - bulkParser: Normalización de texto masivo y detección dimensional    │
│  - ItemFileAttachmentController: Carga a Storage y validación de links │
│  - generateCartInvoicePdf: Motor de renderizado de factura técnica     │
└───────────────────┬─────────────────────────────────┬──────────────────┘
                    │                                 │
┌───────────────────▼───────────────┐ ┌───────────────▼──────────────────┐
│      BACKEND API (EXPRESS / TS)   │ │    PERSISTENCIA Y NUBE FIREBASE  │
│  - Puerto 3000 / server.ts        │ │  - Auth: Autenticación de cliente│
│  - POST /api/quote                │ │  - Firestore: /users, /carts,    │
│  - POST /api/quote-batch          │ │    /orders, /materials           │
│  - GET /api/health                │ │  - Storage: /designs/{itemId}/   │
└───────────────────────────────────┘ └──────────────────────────────────┘
```

---

## 2. Mapa de Directorios y Responsabilidades

```
/
├── 00_core/                       # Corpus documental canónico (Fuente de verdad)
│   ├── decision_log.md            # Registro inmutable de decisiones (DEC-001, 002, 003)
│   ├── architecture_pillars.md    # Pilares arquitectónicos y prioridades
│   ├── spec.md                    # Especificaciones funcionales y técnicas
│   ├── blueprint.md               # Este mapa estructural
│   ├── lessons.md                 # Registro de lecciones y resoluciones técnicas
│   └── execution_protocol.md      # Protocolo de ejecución y control de cambios
├── design_system.md               # Capa invariante de diseño (tipografía, neutros, H1-H6)
├── identity_carteles_click.md     # Capa de identidad visual (paleta, radios, voz)
├── server.ts                      # Servidor Express, endpoints de cotización y middleware Vite
├── index.html                     # Punto de entrada HTML y carga tipográfica
└── src/
    ├── components/                # Componentes de presentación visual
    │   ├── ui/                    # Primitivas de interfaz (Botones, badges, uploaders)
    │   │   ├── ItemFileAttachmentController.tsx # Gestión de archivos y Firebase Storage
    │   │   └── ...
    │   ├── views/                 # Vistas principales del sistema
    │   │   ├── CotizadorView.tsx  # Vista de cotización interactiva y visualizador 3D
    │   │   ├── MaterialsCatalogView.tsx # Catálogo de sustratos y acabados
    │   │   └── ...
    │   ├── CartDrawer.tsx         # Drawer lateral de carrito, bulk order y checkout
    │   ├── ResumenOrdenCompra.tsx # Modal de factura técnica y preview de OC
    │   └── ...
    ├── store/                     # Stores globales (Zustand)
    │   ├── useCartStore.ts        # Carrito, validación isCartValid y sync Firestore
    │   ├── useAuthStore.ts        # Estado de autenticación y roles
    │   └── useCurrencyStore.ts    # Formateo y moneda
    ├── lib/                       # Clientes de integración externa
    │   ├── firebase.ts            # Inicialización de Auth, Firestore y Storage
    │   └── firestore.ts           # Consultas y modelos de datos tipados
    ├── utils/                     # Funciones auxiliares puras
    │   ├── generateCartInvoicePdf.ts # Generador de PDF de orden de compra
    │   └── ...
    └── types/                     # Definiciones de tipos TypeScript compartidos
        └── index.ts               # Interfaces centrales (CartItem, Material, Order, etc.)
```

---

## 3. Flujo de Datos Principal (Ciclo de Vida de Pedido)

1. **Configuración de Producto:** El usuario configura medidas, tintas y terminaciones en `CotizadorView` o mediante importación masiva en `CartDrawer` (`handleImportBulkText`).
2. **Cotización:** Se despachan las especificaciones al backend (`/api/quote` o `/api/quote-batch`) asegurando determinismo de precios sin exponer costos internos.
3. **Persistencia en Carrito:** `useCartStore` almacena el ítem con su identificación única, medidas, tinta, terminaciones y archivo adjunto en `localStorage`, sincronizando en paralelo con `/carts/{uid}` en Firestore.
4. **Validación Bloqueante:** Al intentar avanzar a la Orden de Compra, `storeIsCartValid()` valida que ningún ítem tenga medidas en 0, tinta vacía o terminaciones indefinidas.
5. **Generación de OC:** Al confirmar, se emite la Orden de Compra en `/orders/{orderId}`, se genera el PDF técnico con cotas y link a diseño (`generateCartInvoicePdf`), y se resetea el carrito activo.
