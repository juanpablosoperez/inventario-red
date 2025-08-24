-- Archivo de inicialización para Docker PostgreSQL
-- Este archivo se ejecuta automáticamente al crear el contenedor

-- Crear la base de datos si no existe
-- (PostgreSQL ya la crea automáticamente con las variables de entorno)

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos PostgreSQL inicializada correctamente';
    RAISE NOTICE 'Usuario: postgres';
    RAISE NOTICE 'Base de datos: inventario_db';
    RAISE NOTICE 'Puerto: 5432';
END $$;
