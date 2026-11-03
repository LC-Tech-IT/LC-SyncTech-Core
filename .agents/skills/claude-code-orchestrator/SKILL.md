---
name: claude-code-orchestrator
description: Metodología avanzada de Prompt Engineering para delegar tareas de desarrollo, arquitectura de software y diseño a Claude sin ambigüedades, con restricciones estrictas, contratos de interfaz y criterios de aceptación verificables.
---

# Claude Code Orchestrator - LC Tech

## Propósito
Este skill define el estándar de oro para transformar decisiones estratégicas y PRDs de LC Tech en **Prompts de Alta Precisión Quirúrgica para Claude**. Claude actúa como nuestro desarrollador e implementador líder de código y UI; este framework garantiza que Claude reciba instrucciones sin ambigüedades, respetando la arquitectura, sin inventar dependencias innecesarias y produciendo código listo para producción.

---

## Principios Fundamentales al Redactar para Claude

1. **Contexto Aislado y Rico:** Claude necesita saber exactamente qué componente toca, qué arquitectura existe y qué patrones de diseño debe respetar.
2. **Estructura con Etiquetas XML:** Usar etiquetas XML (`<context>`, `<objective>`, `<technical_stack>`, `<requirements>`, `<negative_constraints>`, `<acceptance_criteria>`, `<output_format>`) para evitar confusión entre instrucciones y datos.
3. **Restricciones Negativas Explícitas:** Es más importante decirle a Claude qué **NO** debe hacer (ej. "no modifiques el esquema de usuarios", "no uses librerías externas para animaciones simples", "no agregues dependencias pesadas innecesarias").
4. **Criterios de Aceptación Verificables:** Entregar una lista de chequeo binaria que Claude debe autoverificar antes de dar por cerrada su respuesta.

---

## Plantilla Maestra de Prompt para Claude

Al generar un prompt para el CEO/Desarrollo, seguir siempre este formato:

```markdown
### 📋 INSTRUCCIONES PARA CLAUDE

<role>
Eres el Ingeniero de Software Principal y Especialista en UI/UX de LC Tech. Tu tarea es implementar de forma rigurosa, modular y limpia la funcionalidad especificada a continuación.
</role>

<context>
[Descripción del proyecto, arquitectura existente, archivos relevantes y estado actual del código]
</context>

<objective>
[Objetivo claro y conciso de esta iteración/tarea]
</objective>

<technical_stack>
- Lenguaje / Runtime: [ej. Python 3.11 / FastAPI / TypeScript / React]
- Base de Datos / ORM: [ej. PostgreSQL / SQLAlchemy / SQLite]
- UI / Styling: [ej. CSS Moderno, Tailwind si aplica, Componentes modulares]
</technical_stack>

<requirements>
1. [Requerimiento 1 detallado con inputs y outputs esperados]
2. [Requerimiento 2 con lógica de negocio y validaciones]
3. [Requerimiento 3 con manejo de excepciones y errores específicos]
</requirements>

<architecture_and_file_structure>
[Indicar qué archivos crear o modificar, sus rutas relativas y responsabilidades]
</architecture_and_file_structure>

<negative_constraints>
- NO instales paquetes adicionales salvo los expresamente listados.
- NO dejes funciones mock o datos quemados (hardcoded) en la lógica de negocio final.
- NO rompas la compatibilidad con los módulos existentes de [módulo relacionado].
- NO generes código spaguetti: separa en capas (controlador, servicio, modelo/repositorio).
</negative_constraints>

<acceptance_criteria>
- [ ] Todas las funciones tienen tipado estricto y docstrings explicativos.
- [ ] Las validaciones de payload devuelven códigos HTTP y mensajes de error estandarizados.
- [ ] Se contemplan los casos de borde: [lista de casos clave].
- [ ] El código incluye tests unitarios o script de verificación funcional.
</acceptance_criteria>

<output_format>
Proporciona el código completo de cada archivo con su ruta exacta, explicando brevemente las decisiones técnicas clave y el comando exacto para probarlo.
</output_format>
```

---

## Modos de Operación para Claude
- **Modo Creación Inicial (Greenfield):** Enfocado en cimientos limpios, estructura de carpetas, configuración de entorno y modelos de datos base.
- **Modo Feature Incremental:** Enfocado en agregar funcionalidad sin tocar código funcional previo, manteniendo contratos de interfaz hacia atrás.
- **Modo Refactor / Debugging:** Enfocado en análisis de causa raíz, corrección quirúrgica sin efectos secundarios colaterales.
