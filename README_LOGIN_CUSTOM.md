# Login propio y panel admin

Este proyecto usa un login propio temporal para desarrollo local. No usa Supabase Auth ni Edge Functions para el acceso admin.

## Login de desarrollo

El login de `admin/login.html` llama desde `js/auth.js` a la RPC de Supabase:

```js
db.rpc("validar_login_admin", {
  p_usuario: usuario,
  p_password: password
})
```

Si la RPC devuelve `ok: true`, el frontend guarda una sesión temporal no sensible en `sessionStorage` con `usuario`, `nombre`, `rol`, `created_at` y `expires_at`. No se guarda la contraseña ni `password_hash`.

`js/admin-guard.js` valida esa sesión temporal para permitir entrar a `admin/dashboard.html` y al resto del panel.

## Tabla usada por dashboard y consultas

El dashboard y `admin/consultas.html` leen datos reales desde `public.consultas` usando `js/dashboard.js` y `js/consultas.js`.

Columnas esperadas:

- `id`
- `nombre_cliente`
- `telefono`
- `email`
- `servicio_consultado`
- `mensaje`
- `estado`
- `fecha_consulta`

El panel ordena por `fecha_consulta` descendente. Si `servicio_consultado` viene `NULL`, se muestra `Consulta general`.

Estados soportados para conteo:

- `pendiente`
- `respondido`
- `respondida`

## Policy temporal para desarrollo

Si las consultas se insertan correctamente pero el dashboard muestra `0`, probablemente RLS está bloqueando `SELECT` para el rol `anon`.

Para desarrollo local, ejecutar en Supabase SQL Editor el archivo:

```sql
supabase-policies.sql
```

Policy mínima de lectura temporal:

```sql
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leer consultas en desarrollo" ON public.consultas;
CREATE POLICY "Permitir leer consultas en desarrollo"
ON public.consultas
FOR SELECT
TO anon
USING (true);
```

El archivo `supabase-policies.sql` también incluye policies abiertas de `INSERT`, `UPDATE` y `DELETE` para que funcionen el formulario público y las acciones del panel durante desarrollo.

Policy mínima para eliminar consultas desde el panel temporal:

```sql
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir eliminar consultas en desarrollo" ON public.consultas;
CREATE POLICY "Permitir eliminar consultas en desarrollo"
ON public.consultas
FOR DELETE
TO anon
USING (true);
```

`admin/consultas.html` abre un modal de detalle al hacer click sobre una fila. Ese modal muestra la información completa de `public.consultas`, incluido el mensaje completo con saltos de línea.

## Validación de teléfono

El formulario público de `index.html` valida `telefono` como dato opcional. Si se completa, solo acepta números, con mínimo 8 dígitos y máximo 15 dígitos. El input usa `type="tel"`, `inputmode="numeric"`, `minlength="8"`, `maxlength="15"` y `pattern="[0-9]{8,15}"`. `script.js` también limpia caracteres no numéricos mientras se escribe, limita a 15 dígitos y bloquea el envío si el valor no cumple `^[0-9]{8,15}$`.

Para revisar teléfonos inválidos existentes antes de agregar la restricción en Supabase:

```sql
SELECT id, nombre_cliente, telefono
FROM public.consultas
WHERE telefono IS NOT NULL
AND telefono !~ '^[0-9]{8,15}$';
```

Corregir manualmente cada registro antes de aplicar el `CHECK`, por ejemplo:

```sql
UPDATE public.consultas
SET telefono = '2644160466'
WHERE id = 1;
```

Si el teléfono no corresponde, también se puede dejar sin valor:

```sql
UPDATE public.consultas
SET telefono = NULL
WHERE id = 1;
```

Restricción recomendada para que Supabase rechace teléfonos con letras:

```sql
ALTER TABLE public.consultas
DROP CONSTRAINT IF EXISTS consultas_telefono_solo_numeros;

ALTER TABLE public.consultas
ADD CONSTRAINT consultas_telefono_solo_numeros
CHECK (
  telefono IS NULL OR telefono ~ '^[0-9]{8,15}$'
);
```

## Producción

Las policies `SELECT`, `UPDATE` y `DELETE` para `anon` son solo temporales/desarrollo. En producción, las consultas son datos privados y no deben quedar expuestas al rol `anon`.

Antes de publicar:

- Reemplazar la sesión de `sessionStorage` por una sesión segura emitida por backend o Cloudflare Worker.
- Mover lecturas y cambios admin de `consultas` a un backend protegido.
- Quitar o restringir las policies abiertas de `SELECT`, `UPDATE` y `DELETE` para `anon`.
- No usar Supabase Auth si se mantiene el login propio, salvo que se decida migrar todo el flujo.
- No exponer `service_role` en frontend.
- No leer ni enviar `password_hash` al navegador.
