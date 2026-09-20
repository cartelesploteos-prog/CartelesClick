# Protocolo de Ejecución Técnica — Carteles Click 3D

Este documento establece el método de trabajo obligatorio para cualquier intervención en el repositorio de Carteles Click 3D.

---

## 1. Orden de Prioridades Invariante (Ante trade-offs, gana el número menor)

1. **Seguridad:** Protección de claves, autenticación, aislamiento de costos y márgenes.
2. **Corrección Geométrica:** Determinismo en dimensiones, fórmulas de superficie y tolerancia 2D/3D.
3. **Fabricabilidad:** Parámetros acordes a taller real y máquinas disponibles.
4. **Trazabilidad:** Integridad de datos, vinculación de archivos a la OC y persistencia.
5. **UX:** Preservación de flujos, microinteracciones y retroalimentación inmediata.
6. **Rendimiento:** Optimización de renders, bundles ligeros y llamadas eficientes a APIs.
7. **Estética:** Preservación fiel del lenguaje visual consolidado (DEC-003).

---

## 2. Ciclo de Ejecución

### 2.1 Antes de Implementar
1. **Analizar:** Comprender el requerimiento e identificar su trazabilidad con el corpus documental.
2. **Planificar:** Definir el alcance exacto (máximo 3 pasos concretos).
3. **Validar Arquitectura:** Confirmar que no viola los pilares de `architecture_pillars.md` ni introduce componentes visuales no solicitados.
4. **Definir DoD (Definition of Done):** Criterios de aceptación funcionales y técnicos.

### 2.2 Después de Implementar
1. **Probar:** Ejecutar validación de tipos (`lint_applet`) y compilación limpia (`compile_applet`).
2. **Documentar:** Registrar decisiones en `decision_log.md`, datos en `spec.md` o aprendizajes en `lessons.md`.
3. **Verificar Regresión:** Asegurar que la UI actual no haya sufrido alteraciones estéticas ni funcionales.

---

## 3. Formato de Comunicación de Cambios

Para cambios estructurales o de dominio, documentar e informar:
- **PROBLEMA:** Qué fallo o necesidad existe.
- **CAUSA:** Origen técnico verificado.
- **CAMBIO:** Qué se modifica puntualmente.
- **IMPACTO:** Qué módulos o flujos se ven afectados.
- **RIESGO:** Qué posibles efectos colaterales existen y cómo se mitigan.
- **VALIDACIÓN:** Cómo se probó y verificó.

---

## 4. Taxonomía de Clasificación de Afirmaciones

En toda respuesta técnica:
- `HECHO`: Verificable en el corpus o en el código, con referencia precisa.
- `INFERENCIA`: Deducido a partir de hechos concretos del sistema.
- `PROPUESTA`: Sugerencia de ingeniería no decidida aún.
- `PENDIENTE`: Falta definición o aprobación de Mariano.
- `CONFLICTO`: Dos fuentes documentales o de código se contradicen.
