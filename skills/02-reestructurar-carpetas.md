# Skill: Reestructurar carpetas

## Objetivo

Ordenar el proyecto IMPULSO DIGITAL con una estructura clara y mantenible.

## Instrucción

Reestructurá las carpetas del proyecto respetando una separación clara entre:

- Sitio público.
- Panel administrativo.
- Estilos.
- Scripts.
- Imágenes.
- Assets.
- Documentación.

## Estructura sugerida

```
/index.html
/servicios.html
/contacto.html

/admin/
    login.html
    dashboard.html
    consultas.html
    servicios.html
    categorias.html

/css/
    estilos.css
    admin.css

/js/
    main.js
    supabaseClient.js
    login.js
    dashboard.js
    consultas.js

/imagenes/
    logo/
    servicios/

/assets/
    iconos/
```

## Reglas

- No borrar archivos importantes.
- No cambiar rutas sin actualizar los enlaces.
- No mezclar archivos públicos con archivos admin.
- Si se mueve un archivo, corregir todas las referencias.
- Mantener nombres claros.
- No crear carpetas innecesarias.

## Resultado esperado

Un proyecto más ordenado y fácil de mantener.
