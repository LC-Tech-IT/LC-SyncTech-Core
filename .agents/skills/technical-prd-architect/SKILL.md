---
name: technical-prd-architect
description: Framework para redactar Documentos de Requerimientos de Producto (PRD) de alta fidelidad, historias de usuario, casos de borde, contratos de interfaz y criterios de aceptación listos para desarrollo en el ecosistema LC Tech.
---

# Technical PRD Architect - LC Tech

## Propósito
Este skill estandariza la creación de Documentos de Requerimientos de Producto (PRD) de nivel técnico ejecutivo. Transforma ideas estratégicas y decisiones de negocio en especificaciones inequívocas, detalladas y listas para ser implementadas por los ingenieros (especialmente Claude).

---

## Cuándo Utilizar Este Skill
- Al definir una nueva funcionalidad, módulo o producto completo (ej. *Salva*, *LC Rider*, *LC-Tech-Core*).
- Al estructurar cambios arquitectónicos o rediseños de flujos críticos de usuario.
- Antes de redactar cualquier prompt de desarrollo para Claude.

---

## Estructura Estándar de un PRD LC Tech

Cada PRD generado debe contener las siguientes secciones obligatorias:

### 1. Resumen Ejecutivo & Contexto
- **Nombre del Producto / Feature:**
- **Versión:**
- **Autor / PM:** Product Manager LC Tech
- **Problema de Negocio:** ¿Qué dolor del cliente o del mercado resuelve?
- **Propuesta de Valor:** ¿Por qué nuestra solución es superior o disruptiva?
- **Métricas de Éxito (KPIs):** ¿Cómo medimos que funcionó? (Ej: tiempo de respuesta < 2s, 95% de retención en onboarding).

### 2. Personas & Flujos de Usuario (User Journeys)
- **Actor Principal:** Perfil demográfico y técnico del usuario.
- **Actores Secundarios:** Administradores, operadores de soporte, sistemas externos (sensores, APIs de terceros).
- **Happy Path:** Paso a paso cronológico de la interacción ideal.
- **Unhappy Paths:** Caída de red, sensor desconectado, credenciales inválidas, límite de cuota alcanzado.

### 3. Requerimientos Funcionales (FR)
Organizados por ID único (`FR-001`, `FR-002`...):
- **Como** [rol], **quiero** [acción], **para** [beneficio].
- **Lógica de negocio detallada:** Reglas matemáticas, validaciones de campos, permisos de acceso.
- **Diagrama de Estados:** Si el objeto cambia de estado (ej: `PENDIENTE` -> `ACTIVO` -> `EN_ALERTA` -> `RESUELTO`).

### 4. Requerimientos No Funcionales (NFR)
- **Rendimiento:** Tiempos de latencia máxima, tamaño de payload, concurrencia estimada.
- **Seguridad:** Cifrado en reposo/tránsito, manejo de tokens (JWT, OAuth2), privacidad de datos (ubicación GPS, datos sensibles).
- **Disponibilidad y Tolerancia a Fallos:** Modo offline, sincronización diferida, reintentos exponenciales.

### 5. Contratos de Interfaz & Modelo de Datos
- **Entidades de Base de Datos:** Campos, tipos de datos, llaves primarias/foráneas, índices requeridos.
- **Endpoints de API (REST/GraphQL/WebSockets):**
  - Método y ruta (`POST /api/v1/...`)
  - Request Payload (ejemplo JSON tipado)
  - Response Payload (éxito `200/201`, errores `400/401/404/500`)

### 6. Casos de Borde (Edge Cases) & Manejo de Excepciones
- ¿Qué pasa si el dispositivo pierde señal GPS en un túnel?
- ¿Qué sucede ante peticiones duplicadas (idempotencia)?
- ¿Cómo se recupera la app tras un crash inesperado?

### 7. Criterios de Aceptación (Definition of Done - DoD)
- Lista de verificación en formato Gherkin (`Dado que... Cuando... Entonces...`) o checklist booleano que Claude y el equipo de QA deben cumplir al 100% para considerar la tarea terminada.
