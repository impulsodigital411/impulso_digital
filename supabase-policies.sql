-- =====================================================
-- IMPULSO DIGITAL - Policies de desarrollo para Supabase
-- Ejecutar en Supabase SQL Editor si RLS bloquea el panel.
--
-- IMPORTANTE: estas policies son abiertas para desarrollo local.
-- En produccion, proteger SELECT/UPDATE/DELETE con un backend seguro
-- o policies basadas en autenticacion real. No usar service_role en frontend.
-- =====================================================

ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;

-- Permisos temporales para el rol anon usado por la publishable/anon key.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.consultas TO anon;

DROP POLICY IF EXISTS "Permitir insertar consultas" ON public.consultas;
DROP POLICY IF EXISTS "Permitir insertar consultas publicas" ON public.consultas;
DROP POLICY IF EXISTS "Permitir leer consultas" ON public.consultas;
DROP POLICY IF EXISTS "Permitir leer consultas en desarrollo" ON public.consultas;
DROP POLICY IF EXISTS "Permitir actualizar consultas" ON public.consultas;
DROP POLICY IF EXISTS "Permitir eliminar consultas" ON public.consultas;
DROP POLICY IF EXISTS "Permitir eliminar consultas en desarrollo" ON public.consultas;

CREATE POLICY "Permitir insertar consultas publicas"
ON public.consultas
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Permitir leer consultas en desarrollo"
ON public.consultas
FOR SELECT
TO anon
USING (true);

-- Solo para que funcionen las acciones del panel durante desarrollo.
CREATE POLICY "Permitir actualizar consultas"
ON public.consultas
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir eliminar consultas en desarrollo"
ON public.consultas
FOR DELETE
TO anon
USING (true);

-- =====================================================
-- Validacion defensiva de telefonos
-- Antes de aplicar el CHECK, revisar/corregir registros viejos:
--
-- SELECT id, nombre_cliente, telefono
-- FROM public.consultas
-- WHERE telefono IS NOT NULL
-- AND telefono !~ '^[0-9]{8,15}$';
--
-- Ejemplo de correccion manual:
-- UPDATE public.consultas
-- SET telefono = '2644160466'
-- WHERE id = 1;
-- =====================================================

ALTER TABLE public.consultas
DROP CONSTRAINT IF EXISTS consultas_telefono_solo_numeros;

ALTER TABLE public.consultas
ADD CONSTRAINT consultas_telefono_solo_numeros
CHECK (
  telefono IS NULL OR telefono ~ '^[0-9]{8,15}$'
);
