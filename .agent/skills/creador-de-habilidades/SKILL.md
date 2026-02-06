---
name: creador-de-habilidades
description: Crea nuevas habilidades para Antigravity siguiendo las mejores prácticas y en idioma español.
---

# Creador de Habilidades

Esta habilidad te permite generar nuevas capacidades para el asistente de Antigravity, asegurando que sigan una estructura estandarizada y estén documentadas correctamente en español.

## Cuándo usar esta habilidad
- Cuando el usuario pida crear una nueva "habilidad" (skill) o capacidad específica.
- Cuando se necesite automatizar una tarea recurrente mediante una habilidad.

## Reglas de Implementación
1. **Ruta de Creación**: Las habilidades deben crearse en `.agent/skills/<nombre-de-la-habilidad>/`.
2. **Archivo Obligatorio**: Cada habilidad DEBE tener un archivo `SKILL.md`.
3. **Frontmatter**: El `SKILL.md` debe empezar con YAML frontmatter:
   ```yaml
   ---
   name: nombre-habilidad
   description: Descripción clara en tercera persona.
   ---
   ```
4. **Idioma**: Todas las instrucciones, descripciones y documentación deben estar en español.
5. **Estructura Adicional**: Si es necesario, crea carpetas `scripts/`, `examples/` o `resources/` dentro del directorio de la habilidad.

## Proceso de Creación
1. Pregunta al usuario el nombre y el objetivo de la nueva habilidad si no están claros.
2. Propón una estructura para el `SKILL.md`.
3. Una vez aprobado, crea los archivos necesarios.
