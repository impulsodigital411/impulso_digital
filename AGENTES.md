# Agentes y Skills - IMPULSO

## Objetivo

Este documento organiza los agentes y skills utilizados para trabajar el proyecto **IMPULSO**. Sirve como índice general del sistema de documentación interna para que inteligencias artificiales puedan entender, analizar y modificar el proyecto de forma ordenada.

---

## Agentes disponibles

| #  | Agente                     | Archivo                                |
|----|----------------------------|----------------------------------------|
| 1  | Arquitecto del Proyecto    | [01-arquitecto-proyecto.md](agentes/01-arquitecto-proyecto.md) |
| 2  | Diseñador UI/UX            | [02-disenador-ui-ux.md](agentes/02-disenador-ui-ux.md)         |
| 3  | Desarrollador Frontend     | [03-desarrollador-frontend.md](agentes/03-desarrollador-frontend.md) |
| 4  | Integrador Supabase        | [04-integrador-supabase.md](agentes/04-integrador-supabase.md) |
| 5  | Revisor de Seguridad       | [05-revisor-seguridad.md](agentes/05-revisor-seguridad.md)     |
| 6  | Documentador del Proyecto  | [06-documentador-proyecto.md](agentes/06-documentador-proyecto.md) |

## Skills disponibles

| #  | Skill                            | Archivo                                  |
|----|----------------------------------|------------------------------------------|
| 1  | Analizar estructura actual       | [01-analizar-estructura.md](skills/01-analizar-estructura.md)         |
| 2  | Reestructurar carpetas           | [02-reestructurar-carpetas.md](skills/02-reestructurar-carpetas.md) |
| 3  | Crear login administrativo       | [03-crear-login-admin.md](skills/03-crear-login-admin.md)           |
| 4  | Crear dashboard administrativo   | [04-crear-dashboard-admin.md](skills/04-crear-dashboard-admin.md)   |
| 5  | Crear módulo de consultas        | [05-crear-modulo-consultas.md](skills/05-crear-modulo-consultas.md) |
| 6  | Preparar Supabase                | [06-preparar-supabase.md](skills/06-preparar-supabase.md)           |
| 7  | Guardar formulario de consulta   | [07-guardar-formulario-consulta.md](skills/07-guardar-formulario-consulta.md) |
| 8  | Revisar rutas y navegación       | [08-revisar-rutas-navegacion.md](skills/08-revisar-rutas-navegacion.md) |
| 9  | Crear README                     | [09-crear-readme.md](skills/09-crear-readme.md)                     |

---

## Reglas generales

- No romper el sitio público actual.
- No borrar archivos importantes sin justificarlo.
- No mezclar todo en un solo archivo.
- No usar email para el login.
- No usar Firebase.
- No poner contraseñas reales en JavaScript.
- No poner claves privadas en el frontend.
- No usar service_role key de Supabase en el frontend.
- No cambiar rutas sin actualizar enlaces.
- No duplicar funciones.
- No crear nombres raros o difíciles.
- Mantener nombres simples y entendibles.
- Separar sitio público y panel administrativo.
- Separar HTML, CSS y JavaScript.
- Mantener una estética profesional, moderna y tecnológica.
- Primero analizar, después modificar.

---

## Orden recomendado de trabajo

1. Analizar estructura actual.
2. Ordenar carpetas.
3. Crear login visual.
4. Crear dashboard visual.
5. Crear módulo consultas visual.
6. Agregar protección básica de rutas.
7. Preparar archivo de Supabase.
8. Conectar formulario de consultas.
9. Conectar dashboard con consultas reales.
10. Mejorar seguridad del login.
