# Skill: Crear módulo de consultas

## Objetivo

Crear una pantalla administrativa para ver las consultas recibidas desde la web.

## Archivo principal

admin/consultas.html

## Tabla visible

Debe mostrar una tabla con:

- Fecha.
- Nombre del cliente.
- Teléfono.
- Servicio consultado.
- Mensaje.
- Estado.
- Acciones.

## Acciones

- Marcar como pendiente.
- Marcar como respondida.
- Archivar o eliminar.

## Lógica

La lógica debe estar en:

js/consultas.js

## Tabla futura en Supabase

consultas

## Campos esperados

- id
- nombre_cliente
- telefono
- mensaje
- servicio_consultado
- categoria
- estado
- fecha_consulta

## Reglas

- Si todavía no está conectado Supabase, dejar datos de prueba separados y fáciles de quitar.
- No mezclar datos de prueba con datos reales.
- Dejar preparada la función para leer consultas desde Supabase.
- No enviar consultas por correo electrónico.

## Resultado esperado

Un módulo administrativo claro para visualizar y gestionar consultas.
