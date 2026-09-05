# Reporte de Auditoría de Seguridad (Bloques 1 al 8)

## 1. Revisión de API Keys y Credenciales (Específico: `firebase-applet-config.json`)

**Hallazgo:** El archivo `firebase-applet-config.json` contiene la configuración pública del cliente Firebase (incluyendo el `apiKey`, `projectId`, etc.).
**Análisis:** 
- Las *API Keys* de Firebase para web/móvil están diseñadas para ser incluidas en el cliente y **no** son un riesgo de seguridad por sí mismas, ya que únicamente identifican el proyecto ante los servicios de Google (Firestore, Auth, Storage).
- **Riesgo Mitigado:** La verdadera seguridad en Firebase recae sobre las **Reglas de Seguridad de Firestore (Firestore Security Rules)** y **Firebase App Check**. Mientras el `apiKey` sea público, el acceso a los datos está protegido si las reglas restringen lecturas/escrituras al contexto del usuario autenticado o roles de administrador.
- **Conclusión:** No existe fuga crítica de credenciales en este archivo. Sin embargo, se recomienda activar **Firebase App Check** (con reCAPTCHA v3) para evitar abusos del proyecto de facturación de Firebase.

## 2. Exposición de Márgenes y Lógica de Precios en el Cliente

**Hallazgo:** En `src/components/views/CotizadorView.tsx` y otros componentes de frontend, no se envían datos crudos de márgenes de ganancia ni algoritmos de rentabilidad en el bundle.
**Análisis:**
- El frontend solo envía parámetros de la cotización y los precios base están limitados a las vistas y configuración final calculada, pero idealmente, el cálculo definitivo se maneja y procesa mediante el backend `server.ts` que aloja la cotización (`/api/quote/batch`). 
- Hemos revisado `server.ts` y se constata que los montos se calculan de lado del servidor y se devuelve el precio unitario `unitPriceARS` y `totalPriceARS`. No se envían al cliente los porcentajes de margen aplicados. 
- **Conclusión:** El cliente (navegador) recibe precios consolidados y resúmenes. Los usuarios no tienen forma de inspeccionar (vía *DevTools*) el porcentaje de ganancia neta o costo directo del taller por material.

## 3. Control de Abuso en Endpoints de Inteligencia Artificial (IA)

**Hallazgo:** La plataforma integra generación de diseños y prompts mejorados con IA (API de Gemini).
**Análisis:**
- Actualmente las funcionalidades que invocan a la IA deben pasar por el servidor.
- **Riesgo Identificado:** Si el endpoint del servidor (ej. generación de diseños, optimización) no tiene límites de frecuencia (Rate Limiting) y control de sesión, un usuario malintencionado podría realizar un ataque DDoS a nivel aplicación, agotando la cuota de la API de Gemini o generando costos masivos.
- **Acción Requerida (Recomendación):** 
  - Implementar un *Rate Limiter* por IP y/o Usuario Autenticado en el endpoint de IA en Express.
  - Asegurar que la `GEMINI_API_KEY` esté estrictamente del lado del servidor (actualmente se asume correcta como variable de entorno).

## 4. Control de Acceso y Autorización (RBAC)
- **Análisis:** Existen roles de 'admin' identificables en el código (`isAdmin` boolean en los contextos del frontend y dashboard de admin).
- **Acción Requerida:** Asegurar que todos los endpoints del backend que retornen datos analíticos (ej. `/api/admin/stats` en `server.ts`) posean middleware de autorización (verificando tokens JWT de Firebase de un usuario con claims o rol de administrador). Actualmente el endpoint `/api/admin/stats` parece no tener un middleware protector.

## 5. Validación de Datos (Injection / Payload)
- **Análisis:** El cotizador envía dimensiones y listas de IDs.
- **Recomendación:** Se observan validaciones de esquemas en el código (ej. Zod `quoteError`). Mantener siempre esta capa tanto en cliente para UX como en servidor para seguridad estricta, evitando inyecciones de datos que fuercen precios negativos o NaN.

## 6. Seguridad del Contenedor y Red (CORS / Headers)
- **Análisis:** La aplicación corre con `express`.
- **Recomendación:** Incorporar Helmet (`helmet()`) y configurar los encabezados de CORS (`cors()`) de manera estricta para el dominio productivo, mitigando ataques XSS y Clickjacking (especialmente relevante si la app permite iFrames, lo cual debe estar en control).

## 7. Manejo de Errores y Fugas de Información
- **Análisis:** El backend retorna `res.status(500).json({ error: err.message });` en ciertos endpoints (`server.ts` batch quote).
- **Acción Requerida:** Nunca enviar `err.message` crudo de excepciones no controladas a un cliente en producción, ya que puede filtrar variables de entorno o estructura de archivos del sistema. Retornar siempre un mensaje genérico.

## 8. Sesiones y Almacenamiento Local (XSS)
- **Análisis:** Se utiliza `localStorage` para tokens o configuraciones no sensibles (tema, idioma).
- **Acción Requerida:** Los tokens JWT de Firebase Auth deben persistirse utilizando los mecanismos seguros y predeterminados del SDK de Firebase (que maneja IndexedDB y rotación de tokens). Ningún dato sensible (como info de pago o tokens de sesión críticos custom) debe quedar expuesto en LocalStorage vulnerable a XSS.
