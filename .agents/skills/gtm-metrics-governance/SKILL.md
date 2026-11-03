---
name: gtm-metrics-governance
description: Framework de Go-To-Market (GTM), definición de OKRs, métricas AARRR (Pirate Metrics), control de calidad de lanzamiento y gobernanza de crecimiento para posicionar a LC Tech como marca líder.
---

# GTM & Metrics Governance - LC Tech

## Propósito
Este skill establece las directrices para que los productos de LC Tech no solo se construyan bien técnicamente, sino que se lancen al mercado con impacto, ganen tracción sostenida, midan lo que realmente importa y posicionen el nombre de **LC Tech** con reputación de alta calidad y confiabilidad.

---

## 1. El Embudo de Crecimiento (Pirate Metrics - AARRR)

Para cada producto (*Salva*, *Bike Tracker*, etc.), definir objetivos e instrumentar telemetría en las 5 etapas:

1. **Adquisición (Acquisition):**
   - ¿Cómo nos descubren los usuarios? (Canales orgánicos, alianzas con tiendas ciclistas, publicidad dirigida, boca a boca).
   - Métrica: Costo de Adquisición de Clientes (CAC), visitas web, descargas de app.
2. **Activación (Activation):**
   - El momento "¡Ajá!": el primer instante en que el usuario percibe el valor del producto (ej: primera alerta de pánico enviada en prueba en *Salva*, o primer recorrido registrado en *Bike Tracker*).
   - Métrica: Tasa de activación en los primeros 10 minutos post-instalación (% usuarios que completan onboarding).
3. **Retención (Retention):**
   - El corazón de una compañía sólida. Sin retención, no hay crecimiento sostenible.
   - Métrica: DAU/MAU (Active Users diarios vs mensuales), retención a día 1, 7 y 30.
4. **Ingresos (Revenue):**
   - Conversión a planes pagos, suscripciones anuales/mensuales, comisiones o venta de servicios.
   - Métrica: MRR (Ingresos Recurrentes Mensuales), LTV (Valor de Vida del Cliente), ratio LTV/CAC (> 3x ideal).
5. **Referidos (Referral):**
   - Usuarios evangelizadores que invitan a su red de contactos o compañeros de ruta.
   - Métrica: Coeficiente viral $K$, NPS (Net Promoter Score).

---

## 2. Framework de OKRs (Objectives and Key Results)

Estructura trimestral para la alineación estratégica entre el CEO y el PM:

- **Objetivo (O):** Inspiracional, cualitativo y enfocado en consolidar la presencia de LC Tech.
  - *Ejemplo:* "Hacer de Bike Tracker la solución de seguridad y rastreo preferida por la comunidad ciclista urbana en nuestra fase de lanzamiento".
- **Resultados Clave (KRs):** Cuantitativos, medibles y con fechas límite.
  - *KR 1:* Alcanzar 500 usuarios activos mensuales (MAU) en los primeros 60 días.
  - *KR 2:* Lograr una tasa de retención a 30 días superior al 40%.
  - *KR 3:* Mantener un tiempo de disponibilidad (uptime) del sistema superior al 99.8% reportado por LC-Tech-Core.

---

## 3. Checklist de Preparación para Lanzamiento (Launch Gates)

Antes de cualquier lanzamiento público bajo la marca LC Tech:

- [ ] **Alpha Interno:** Pruebas controladas con el equipo y círculo cercano (cero fallas críticas de seguridad).
- [ ] **Beta Cerrado:** 20 a 50 usuarios reales en campo recopilando telemetría y feedback directo.
- [ ] **Políticas de Privacidad y Términos de Servicio:** Cumplimiento normativo de geolocalización y datos de usuarios.
- [ ] **Infraestructura y Monitoreo:** Logs en tiempo real, alertas de error automatizadas y base de datos con respaldos.
- [ ] **Kit de Prensa y Material de Soporte:** Preguntas frecuentes (FAQ), canales de soporte claros y documentación pública con la marca corporativa LC Tech.
