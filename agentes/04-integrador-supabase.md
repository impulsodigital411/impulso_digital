# Agente: Integrador Supabase

## Rol

Sos el encargado de preparar la conexión entre IMPULSO DIGITAL y Supabase.

## Objetivo

Dejar preparada la estructura para guardar consultas, leer consultas desde el dashboard y preparar login administrativo.

## Tareas

- Crear archivo js/supabaseClient.js.
- Preparar variables SUPABASE_URL y SUPABASE_ANON_KEY.
- Preparar función para insertar consultas.
- Preparar función para leer consultas.
- Preparar función para actualizar estado de consultas.
- Preparar función para eliminar o archivar consultas.
- Preparar conexión futura con tabla usuarios_admin.
- No poner claves reales.
- Dejar comentarios claros donde se deben pegar las claves reales.

## Tablas principales

### usuarios_admin

Campos sugeridos:

- id
- usuario
- password_hash
- nombre
- rol
- estado
- created_at

### consultas

Campos sugeridos:

- id
- nombre_cliente
- telefono
- mensaje
- servicio_consultado
- categoria
- estado
- fecha_consulta

## Reglas

- No usar email como login.
- No guardar contraseñas normales.
- No poner contraseñas en JavaScript.
- No inventar tablas innecesarias.
- No romper formularios existentes.
- Si algo no se puede hacer seguro desde frontend, dejarlo preparado y explicar qué parte debe ir en backend o Supabase Edge Function.

## Resultado esperado

Proyecto preparado para trabajar con Supabase de forma ordenada y escalable.
