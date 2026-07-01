# Skill: Crear login administrativo

## Objetivo

Crear una pantalla de login para el panel administrativo de IMPULSO.

## Archivo principal

admin/login.html

## Campos

- Usuario
- Contraseña

## No usar

- Email.
- Google login.
- Registro público.
- Firebase.

## Debe incluir

- Diseño profesional.
- Logo o nombre IMPULSO.
- Validación de campos vacíos.
- Mensaje de error claro.
- Botón Ingresar.
- Redirección a admin/dashboard.html cuando el login sea correcto.

## Lógica

La lógica debe estar separada en:

js/login.js

## Reglas

- No escribir usuario y contraseña reales en JavaScript.
- Dejar preparada la conexión futura con Supabase.
- Usar localStorage solo como sesión temporal.
- No afirmar que localStorage es seguridad definitiva.
- No romper el sitio público.

## Resultado esperado

Una pantalla de login funcional para pruebas y preparada para seguridad real futura.
