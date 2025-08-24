#!/bin/bash

# Script de instalación rápida para migración a PostgreSQL
# Sistema de Inventario - TP Integrador de Redes y Comunicación

echo "🚀 Iniciando migración a PostgreSQL..."
echo "========================================"

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    echo "📖 Visita: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    echo "📖 Visita: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker y Docker Compose verificados"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << EOF
# Configuración del servidor
PORT=3000

# Seguridad de sesiones (CAMBIAR EN PRODUCCIÓN)
SESSION_SECRET=cambia-esto-por-uno-largo-y-seguro-en-produccion

# Configuración de PostgreSQL (Docker)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventario_db
DB_USER=postgres
DB_PASSWORD=postgres123
DB_SSL=false

# Configuración de cookies
COOKIE_SECURE=false
COOKIE_HTTPONLY=true
COOKIE_SAMESITE=lax
EOF
    echo "✅ Archivo .env creado"
else
    echo "✅ Archivo .env ya existe"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo "✅ Dependencias instaladas"

# Iniciar PostgreSQL con Docker
echo "🐘 Iniciando PostgreSQL..."
docker-compose up -d postgres

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Verificar que PostgreSQL esté corriendo
if ! docker-compose ps postgres | grep -q "Up"; then
    echo "❌ Error al iniciar PostgreSQL"
    docker-compose logs postgres
    exit 1
fi

echo "✅ PostgreSQL iniciado correctamente"

# Ejecutar migración
echo "🔧 Ejecutando migración..."
npm run migrate

if [ $? -ne 0 ]; then
    echo "❌ Error en la migración"
    exit 1
fi

echo "✅ Migración completada"

# Ejecutar seed
echo "🌱 Ejecutando seed de datos..."
npm run seed

if [ $? -ne 0 ]; then
    echo "❌ Error en el seed"
    exit 1
fi

echo "✅ Seed completado"

echo ""
echo "🎉 ¡Migración completada exitosamente!"
echo "========================================"
echo "📊 Base de datos: PostgreSQL corriendo en Docker"
echo "🌐 Servidor: Listo para ejecutar"
echo "🔐 Credenciales por defecto:"
echo "   - Admin: admin / admin123"
echo "   - Viewer: viewer / viewer123"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   npm run dev"
echo ""
echo "🔍 Para ver logs de PostgreSQL:"
echo "   docker-compose logs postgres"
echo ""
echo "🛑 Para detener PostgreSQL:"
echo "   docker-compose down"
