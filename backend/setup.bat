@echo off
REM Script de instalación rápida para migración a PostgreSQL (Windows)
REM Sistema de Inventario - TP Integrador de Redes y Comunicación

echo 🚀 Iniciando migración a PostgreSQL...
echo ========================================

REM Verificar si Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está instalado. Por favor instala Docker Desktop primero.
    echo 📖 Visita: https://docs.docker.com/desktop/install/windows/
    pause
    exit /b 1
)

REM Verificar si Docker Compose está instalado
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose no está instalado. Por favor instala Docker Compose primero.
    echo 📖 Visita: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo ✅ Docker y Docker Compose verificados

REM Crear archivo .env si no existe
if not exist .env (
    echo 📝 Creando archivo .env...
    (
        echo # Configuración del servidor
        echo PORT=3000
        echo.
        echo # Seguridad de sesiones ^(CAMBIAR EN PRODUCCIÓN^)
        echo SESSION_SECRET=cambia-esto-por-uno-largo-y-seguro-en-produccion
        echo.
        echo # Configuración de PostgreSQL ^(Docker^)
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=inventario_db
        echo DB_USER=postgres
        echo DB_PASSWORD=postgres123
        echo DB_SSL=false
        echo.
        echo # Configuración de cookies
        echo COOKIE_SECURE=false
        echo COOKIE_HTTPONLY=true
        echo COOKIE_SAMESITE=lax
    ) > .env
    echo ✅ Archivo .env creado
) else (
    echo ✅ Archivo .env ya existe
)

REM Instalar dependencias
echo 📦 Instalando dependencias...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas

REM Iniciar PostgreSQL con Docker
echo 🐘 Iniciando PostgreSQL...
docker-compose up -d postgres

REM Esperar a que PostgreSQL esté listo
echo ⏳ Esperando a que PostgreSQL esté listo...
timeout /t 10 /nobreak >nul

REM Verificar que PostgreSQL esté corriendo
docker-compose ps postgres | findstr "Up" >nul
if %errorlevel% neq 0 (
    echo ❌ Error al iniciar PostgreSQL
    docker-compose logs postgres
    pause
    exit /b 1
)

echo ✅ PostgreSQL iniciado correctamente

REM Ejecutar migración
echo 🔧 Ejecutando migración...
call npm run migrate

if %errorlevel% neq 0 (
    echo ❌ Error en la migración
    pause
    exit /b 1
)

echo ✅ Migración completada

REM Ejecutar seed
echo 🌱 Ejecutando seed de datos...
call npm run seed

if %errorlevel% neq 0 (
    echo ❌ Error en el seed
    pause
    exit /b 1
)

echo ✅ Seed completado

echo.
echo 🎉 ¡Migración completada exitosamente!
echo ========================================
echo 📊 Base de datos: PostgreSQL corriendo en Docker
echo 🌐 Servidor: Listo para ejecutar
echo 🔐 Credenciales por defecto:
echo    - Admin: admin / admin123
echo    - Viewer: viewer / viewer123
echo.
echo 🚀 Para iniciar el servidor:
echo    npm run dev
echo.
echo 🔍 Para ver logs de PostgreSQL:
echo    docker-compose logs postgres
echo.
echo 🛑 Para detener PostgreSQL:
echo    docker-compose down
echo.
pause
