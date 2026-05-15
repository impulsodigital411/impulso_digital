# Skill: Preparar Supabase

## Objetivo

Preparar la conexión entre el proyecto IMPULSO DIGITAL y Supabase.

## Archivo principal

js/supabaseClient.js

## Variables de ejemplo

```js
const SUPABASE_URL = "PEGAR_URL_DE_SUPABASE";
const SUPABASE_ANON_KEY = "PEGAR_ANON_KEY_DE_SUPABASE";
```

## Reglas

- No poner claves reales.
- No poner service_role key.
- No exponer contraseñas.
- Preparar funciones reutilizables.
- Exportar o dejar accesible el cliente Supabase de forma ordenada.

## Funciones sugeridas

- insertarConsulta()
- obtenerConsultas()
- actualizarEstadoConsulta()
- eliminarConsulta()

## Tablas sugeridas

### usuarios_admin

- id
- usuario
- password_hash
- nombre
- rol
- estado
- created_at

### consultas

- id
- nombre_cliente
- telefono
- mensaje
- servicio_consultado
- categoria
- estado
- fecha_consulta

## Resultado esperado

Archivo de Supabase preparado para ser completado con las claves reales del proyecto.
