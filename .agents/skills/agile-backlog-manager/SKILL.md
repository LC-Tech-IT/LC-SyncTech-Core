---
name: agile-backlog-manager
description: Framework para gestión ágil del Product Backlog, descomposición de epics en historias de usuario verticales, mapeo de dependencias técnicas y control de entregas para LC Tech.
---

# Agile Backlog Manager - LC Tech

## Propósito
Este skill organiza la ejecución ágil del portafolio de productos de LC Tech. Evita cuellos de botella técnicos entre equipos y componentes, gestiona dependencias entre frontend, backend y hardware, y asegura que cada sprint aporte valor tangible y comprobable.

---

## 1. Jerarquía de Trabajo

```
[Visión de Empresa LC Tech]
  └── [Iniciativa Estratégica] (ej: Plataforma Integral de Movilidad Segura)
        └── [Epic] (ej: Módulo de Telemetría y Alertas en Tiempo Real de Bike Tracker)
              └── [User Story] (ej: Como ciclista, quiero recibir una notificación si mi bici se mueve del punto de parqueo)
                    └── [Tareas Técnicas para Claude] (ej: Endpoint WebSocket, worker de verificación de geocerca, push notification trigger)
```

---

## 2. Estructura de Epics e Historias de Usuario

### Formato de Epic
- **Título de la Epic:**
- **Producto / Área:** (*Salva*, *Bike Tracker*, *LC-Tech-Core*)
- **Objetivo de Negocio:**
- **Historias de Usuario Asociadas:**
- **Dependencias Externas / Técnicas:** (ej. proveedor de SMS/WhatsApp, módulo GPS, servidor MQTT).

### Formato de Historia de Usuario (INVEST)
Toda historia debe cumplir los principios INVEST (*Independent, Negotiable, Valuable, Estimable, Small, Testable*):
- **ID:** `US-01`
- **Título:**
- **Narrativa:** *Como [tipo de usuario], quiero [acción] para poder [beneficio].*
- **Condiciones Previas:** Estado del sistema antes de iniciar la acción.
- **Flujo Principal y Flujos Alternos:**
- **Criterios de Aceptación (Gherkin):**
  - *Dado que* el usuario activó el modo guardia.
  - *Cuando* las coordenadas GPS reporten un desplazamiento mayor a 15 metros sin desbloqueo previo.
  - *Entonces* el sistema dispara una alerta crítica al móvil del usuario y registra el evento en el Core.

---

## 3. Matriz de Dependencias Cruzadas
En LC Tech existen componentes interconectados:
- **LC-Tech-Core (Middleware / Backend Central):** Autenticación, facturación, servicios compartidos, gestión de clientes.
- **Salva:** Aplicación de seguridad / asistencia.
- **Bike Tracker:** Dispositivo físico / app de geolocalización ciclista.

**Regla de Sincronización:**
Ninguna historia de frontend o mobile debe enviarse a desarrollo en Claude sin que el contrato de API del Core correspondiente esté diseñado y aprobado por el PM y el CEO.
