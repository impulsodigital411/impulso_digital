# Impulso · Actualización sobre V7

## Marca, portada y contacto

El header usa `imagenes/logo/impulso.png` y el footer usa `imagenes/logo/impulso-footer.png`. Los archivos `impulso-digital.png` e `impulso-digital-footer.png` son idénticos a esos PNG y se mantienen como alias sin descargarlos adicionalmente. El favicon usa `favicon.png`, y las dos caras de la animación en Y comparten `impulso-isotipo.png`. Se verificaron los seis archivos suministrados sin modificar sus bytes. Los PNG se muestran con su transparencia original, sin cápsulas ni discos detrás.

El formulario anterior se entregaba con `hidden` y dependía de que toda la cadena de módulos JavaScript cargara correctamente para hacerse visible. Ahora se renderiza desde el HTML, sin animación de entrada en el panel del formulario. Al bloquear el módulo de animación, sigue validando y preparando consultas; si no hay JavaScript, conserva los campos visibles y ofrece un enlace directo a WhatsApp. Incluye empresa opcional y diez servicios. Las [capturas de revisión](preview/LEEME.md) muestran el resultado.

## Vista local y despliegue

Desde la raíz, ejecutá `python -m http.server 8765 --bind 127.0.0.1` y abrí `http://127.0.0.1:8765/`. Los módulos ES necesitan un servidor HTTP; abrir el archivo con `file://` no ejecuta el sitio completo.

En [Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/), el sitio funciona como HTML estático sin compilación ni dependencias de producción. La salida debe contener `index.html`, los archivos JavaScript de la raíz, `estilos/` e `imagenes/logo/`. Si se sirve el repositorio desde la raíz, usá el preset **None** y el directorio de salida `.`. No se encontraron configuraciones de despliegue versionadas ni se modificó el panel de Cloudflare.

## Mantenimiento

- `index.html`: contenido base español, navegación y contactos. El formulario compone un borrador, que la persona revisa y envía desde WhatsApp. No almacena los datos del formulario ni usa un backend. Sin JavaScript quedan disponibles el contenido y los contactos directos.
- `translations.js`: contenido, etiquetas accesibles, título de página, validaciones, borradores y avisos en español, inglés, alemán, francés, ruso, chino simplificado (`zh-Hans`), japonés y coreano. `script.js` aplica las traducciones y guarda la preferencia en `localStorage`.
- `estilos/motion.css` y `motion.js`: rotación en Y de dos caras, órbitas, ondas, entradas escalonadas, parallax y respuesta al cursor. `IntersectionObserver` activa o pausa las animaciones según visibilidad, y `visibilitychange` pausa las capas al cambiar de pestaña. El visitante puede pausar el movimiento; también se respeta `prefers-reduced-motion`.
- `catalog.js`: conserva los cinco rubros y enlaza cada consulta con el servicio correcto. En `solutions.c1` a `solutions.c5` se pueden agregar `description: { es, en, de, fr, ru, zh, ja, ko }`, `screenshots: [{ src, width, height, alt: { es, en, de, fr, ru, zh, ja, ko } }]` y `demo: { href, label: { es, en, de, fr, ru, zh, ja, ko } }`. Usá rutas relativas para las capturas y WebP con dimensiones reales. Una imagen solo aparece después de cargar; si no hay material, no se muestra un bloque vacío. Cargá las traducciones de los ocho idiomas al incorporar material aprobado.

### Elección técnica de animaciones

[GSAP/ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) ofrece secuencias, sincronización con scroll y *pinning*. La [licencia estándar de GSAP](https://gsap.com/standard-license/) permite uso comercial gratuito para este sitio. También se consideró [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) para secuencias controladas desde JavaScript. Se eligieron [animaciones CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations) de `transform` y `opacity`, [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) y `requestAnimationFrame` para el scroll y el puntero: ofrecen los efectos previstos sin descargar una biblioteca, controlar la rueda ni mantener una animación JavaScript ejecutándose en bucle.

## Pruebas realizadas

| Área | Verificación |
| --- | --- |
| Responsive e idiomas | Chromium y Firefox: 320×568, 360×640, 390×844, 768×1024, 1024×768, 1440×900 y 1920×1080. Ocho idiomas por resolución, 112 combinaciones en total. Sin desbordamiento horizontal detectado; se verificaron contenido, etiquetas accesibles, metadatos y persistencia. |
| Revisión visual y marca | Capturas del header, footer, portada, entrada de Servicios y formulario a 390 y 1440 px. Los seis PNG se cargaron y se decodificaron en Chromium y Firefox. |
| Navegación y accesibilidad | Anclas, historial, indicador de progreso, salto al contenido, apertura/cierre del menú por teclado y foco. axe sin infracciones automáticas en 390 y 1440 px en ambos motores. |
| Movimiento | En XAMPP se midieron tres vueltas completas en más de 15 segundos, con el isotipo centrado y las partículas y ondas en movimiento. Se comprobó el arranque sin el módulo de animación, la pausa manual y fuera de pantalla, y el respeto de la preferencia de movimiento reducido. |
| Catálogo | Cinco rubros y preselección del servicio; el borrador se traduce sin pisar ediciones manuales. Se probó con datos temporales la carga de detalle/captura/demo y la omisión de una imagen inválida. |
| Contacto y enlaces | Cinco errores localizados por idioma; borradores de WhatsApp con empresa, servicio y descripción ordenados. Se verificó correo o teléfono válido, caracteres especiales y el enlace alternativo. Campos visibles sin JavaScript; borrador funcional con `motion.js` bloqueado. Los flujos normales no arrojaron errores HTTP ni de consola. |

El enlace [wa.me/5492646313348](https://wa.me/5492646313348) devolvió un perfil público llamado **Impulso**. En la página se sigue mostrando **264 631 3348**. No se envió ningún mensaje real ni se comprobó la recepción del correo.

Para repetir las pruebas en PowerShell, con el servidor local activo y Node.js instalado:

```powershell
$qa = Join-Path $env:TEMP 'impulso-qa'
npm install --prefix $qa playwright@1.65.1 @axe-core/playwright@4.14.1
& (Join-Path $qa 'node_modules\.bin\playwright.cmd') install chromium firefox
$env:NODE_PATH = Join-Path $qa 'node_modules'
node tests/site.cjs
```

Opcional: configurá `IMPULSO_URL` para otro servidor local, `IMPULSO_BROWSER` para ejecutar un solo navegador (`chromium` o `firefox`), o `IMPULSO_SCREENSHOTS` con el directorio de las capturas.

## Antes del lanzamiento

- Confirmar el dominio público para incluir la URL canónica, la imagen social con URL absoluta y el sitemap. Las traducciones se aplican en la misma URL; para que cada idioma se indexe por separado harán falta páginas con URLs propias y `hreflang`.
- Hacer una revisión editorial con hablantes nativos y una prueba en dispositivos físicos, especialmente Safari/iOS. La verificación automatizada se hizo en Chromium y Firefox de escritorio con viewports simulados.
- Validar la vista previa de Cloudflare Pages cuando se autorice la publicación. No se hizo commit, push ni despliegue.
