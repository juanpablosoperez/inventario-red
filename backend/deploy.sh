#!/bin/bash

# Script de despliegue para PRODUCCIÓN
# Sistema de Inventario - TP Integrador de Redes y Comunicación

set -e  # Salir en caso de error

echo "🚀 Iniciando despliegue en PRODUCCIÓN..."
echo "========================================"

# Verificar que estemos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Debes ejecutar este script desde el directorio backend/"
    exit 1
fi

# Verificar variables de entorno de producción
if [ ! -f ".env.production" ]; then
    echo "❌ Error: Archivo .env.production no encontrado"
    echo "📝 Crea el archivo .env.production con la configuración de producción"
    exit 1
fi

# Cargar variables de producción
source .env.production

# Verificar variables críticas
required_vars=("DB_HOST" "DB_NAME" "DB_USER" "DB_PASSWORD" "SESSION_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Variable $var no está configurada en .env.production"
        exit 1
    fi
done

echo "✅ Variables de entorno verificadas"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    exit 1
fi

echo "✅ Docker y Docker Compose verificados"

# Crear archivo .env para producción
echo "📝 Configurando variables de entorno para producción..."
cp .env.production .env

# Construir imagen de la aplicación
echo "🔨 Construyendo imagen de la aplicación..."
docker build -t inventario-app:latest .

if [ $? -ne 0 ]; then
    echo "❌ Error al construir la imagen Docker"
    exit 1
fi

echo "✅ Imagen construida correctamente"

# Detener servicios existentes
echo "🛑 Deteniendo servicios existentes..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Iniciar servicios de producción
echo "🚀 Iniciando servicios de producción..."
docker-compose -f docker-compose.prod.yml up -d

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 15

# Verificar que PostgreSQL esté corriendo
if ! docker-compose -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
    echo "❌ Error: PostgreSQL no se inició correctamente"
    docker-compose -f docker-compose.prod.yml logs postgres
    exit 1
fi

echo "✅ PostgreSQL iniciado correctamente"

# Ejecutar migración
echo "🔧 Ejecutando migración en producción..."
docker-compose -f docker-compose.prod.yml exec -T app npm run migrate

if [ $? -ne 0 ]; then
    echo "❌ Error en la migración"
    exit 1
fi

echo "✅ Migración completada"

# Ejecutar seed (opcional)
read -p "¿Deseas ejecutar el seed de datos? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Ejecutando seed de datos..."
    docker-compose -f docker-compose.prod.yml exec -T app npm run seed
    echo "✅ Seed completado"
fi

# Verificar que la aplicación esté funcionando
echo "🔍 Verificando estado de la aplicación..."
sleep 5

if ! docker-compose -f docker-compose.prod.yml ps app | grep -q "Up"; then
    echo "❌ Error: La aplicación no se inició correctamente"
    docker-compose -f docker-compose.prod.yml logs app
    exit 1
fi

echo "✅ Aplicación iniciada correctamente"

# Verificar health check
echo "🏥 Verificando health check..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Health check exitoso"
else
    echo "❌ Health check falló"
    exit 1
fi

# Mostrar estado final
echo ""
echo "🎉 ¡Despliegue en PRODUCCIÓN completado exitosamente!"
echo "========================================"
echo "📊 Servicios corriendo:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "🌐 URLs de acceso:"
echo "   - Aplicación: http://localhost:3000"
echo "   - API: http://localhost:3000/api"
echo "   - Health: http://localhost:3000/api/health"
echo ""
echo "🔍 Comandos útiles:"
echo "   - Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   - Ver estado: docker-compose -f docker-compose.prod.yml ps"
echo "   - Detener: docker-compose -f docker-compose.prod.yml down"
echo "   - Reiniciar: docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Configura tu proxy reverso (Nginx/Apache) para HTTPS"
echo "   - Configura certificados SSL válidos"
echo "   - Configura firewall y monitoreo de seguridad"
echo "   - Configura backups automáticos de la base de datos"
echo ""

# Mostrar logs recientes
echo "📋 Logs recientes de la aplicación:"
docker-compose -f docker-compose.prod.yml logs --tail=20 app
