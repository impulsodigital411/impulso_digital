-- =====================================================
-- IMPULSO DIGITAL - Policies de prueba para Supabase
-- Copiar y ejecutar en Supabase SQL Editor si RLS bloquea
-- insert, select, update o delete sobre la tabla consultas.
--
-- IMPORTANTE: estas policies son abiertas para etapa de prueba.
-- En produccion, proteger el panel admin con login y policies
-- basadas en usuarios autenticados.
-- =====================================================

ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.consultas
ADD COLUMN IF NOT EXISTS servicio VARCHAR(160);

ALTER TABLE public.consultas
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP POLICY IF EXISTS "Permitir insertar consultas" ON public.consultas;
DROP POLICY IF EXISTS "Permitir leer consultas" ON public.consultas;
DROP POLICY IF EXISTS "Permitir actualizar consultas" ON public.consultas;
DROP POLICY IF EXISTS "Permitir eliminar consultas" ON public.consultas;

CREATE POLICY "Permitir insertar consultas"
ON public.consultas
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Permitir leer consultas"
ON public.consultas
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Permitir actualizar consultas"
ON public.consultas
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir eliminar consultas"
ON public.consultas
FOR DELETE
TO anon
USING (true);
