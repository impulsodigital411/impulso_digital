-- =====================================================
-- IMPULSO DIGITAL - Base SQL inicial
-- Compatible con MySQL / MariaDB
-- Preparado para adaptar cuando se conecte el sistema real
-- =====================================================

CREATE DATABASE IF NOT EXISTS impulso_digital
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE impulso_digital;

CREATE TABLE IF NOT EXISTS usuarios_admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'admin',
    estado VARCHAR(30) NOT NULL DEFAULT 'activo',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS consultas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cliente VARCHAR(120) NOT NULL,
    telefono VARCHAR(40),
    email VARCHAR(160),
    servicio_consultado VARCHAR(160),
    mensaje TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    fecha_consulta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(140) NOT NULL UNIQUE,
    descripcion TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    descripcion TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO servicios (nombre, descripcion, estado)
VALUES
    ('Desarrollo de paginas web', 'Sitios web profesionales para negocios y emprendedores.', 'activo'),
    ('Sistemas de gestion', 'Herramientas a medida para administrar procesos internos.', 'activo'),
    ('Tiendas online', 'E-commerce con estructura preparada para venta digital.', 'activo')
ON DUPLICATE KEY UPDATE nombre = nombre;

INSERT INTO categorias (nombre, descripcion, estado)
VALUES
    ('Web', 'Servicios relacionados con sitios y presencia digital.', 'activo'),
    ('Sistemas', 'Soluciones de gestion y automatizacion.', 'activo'),
    ('Marketing digital', 'Campanas, contenido y crecimiento online.', 'activo')
ON DUPLICATE KEY UPDATE nombre = nombre;
