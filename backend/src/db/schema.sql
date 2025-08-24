-- Esquema de la base de datos para el sistema de inventario
-- Sistema de inventario - TP Integrador de Redes y Comunicación
-- Compatible con PostgreSQL

-- Tabla de usuarios con roles de autenticación
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'viewer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos del inventario
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    qty INTEGER DEFAULT 0 CHECK (qty >= 0),
    price DECIMAL(10,2) DEFAULT 0.00 CHECK (price >= 0.00),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Función para actualizar automáticamente el timestamp de modificación
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar automáticamente el timestamp de modificación
DROP TRIGGER IF EXISTS update_users_timestamp ON users;
CREATE TRIGGER update_users_timestamp 
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_timestamp ON products;
CREATE TRIGGER update_products_timestamp 
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
