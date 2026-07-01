-- =====================================================
-- IMPULSO - Login propio para panel admin
-- Compatible con Supabase / PostgreSQL
--
-- IMPORTANTE: este script recrea public.usuarios_admin.
-- Ejecutar solamente si no hay datos importantes en esa tabla.
-- =====================================================

BEGIN;

DROP TABLE IF EXISTS public.usuarios_admin CASCADE;

CREATE TABLE public.usuarios_admin (
    id BIGSERIAL PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(30) NOT NULL DEFAULT 'admin',
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT usuarios_admin_rol_check CHECK (rol IN ('admin', 'editor')),
    CONSTRAINT usuarios_admin_estado_check CHECK (estado IN ('activo', 'inactivo'))
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER usuarios_admin_set_updated_at
BEFORE UPDATE ON public.usuarios_admin
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.usuarios_admin ENABLE ROW LEVEL SECURITY;

-- Sin policies publicas: anon/authenticated no pueden leer password_hash.
REVOKE ALL ON TABLE public.usuarios_admin FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.usuarios_admin_id_seq FROM anon, authenticated;

COMMENT ON TABLE public.usuarios_admin IS 'Perfiles admin para login propio. password_hash se valida solo desde backend seguro.';
COMMENT ON COLUMN public.usuarios_admin.password_hash IS 'Hash bcrypt/compatible. Nunca guardar contrasena en texto plano.';

COMMIT;
