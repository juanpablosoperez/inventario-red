# 🚀 Migración de SQLite a PostgreSQL

Este documento describe cómo migrar el proyecto de inventario de SQLite a PostgreSQL, manteniendo toda la funcionalidad existente.

## 📋 Cambios Realizados

### 1. Dependencias Actualizadas
- ❌ Removido: `sqlite`, `sqlite3`
- ✅ Agregado: `pg` (PostgreSQL client para Node.js)

### 2. Archivos Modificados
- `backend/package.json` - Dependencias actualizadas
- `backend/src/db/connection.js` - Conexión PostgreSQL con pool
- `backend/src/db/schema.sql` - Esquema compatible con PostgreSQL
- `backend/src/db/seed.js` - Script de datos adaptado
- `backend/src/routes/auth.js` - Consultas SQL actualizadas
- `backend/src/routes/products.js` - Consultas SQL actualizadas

### 3. Archivos Nuevos
- `backend/src/db/migrate.js` - Script de migración
- `backend/docker-compose.yml` - Configuración Docker
- `backend/src/db/init.sql` - Inicialización Docker
- `backend/env.production` - Configuración para producción

## 🛠️ Instalación y Configuración

### Opción 1: Docker (Recomendado para desarrollo)

1. **Instalar Docker y Docker Compose**
   ```bash
   # Verificar instalación
   docker --version
   docker-compose --version
   ```

2. **Iniciar PostgreSQL**
   ```bash
   cd backend
   docker-compose up -d postgres
   ```

3. **Instalar dependencias**
   ```bash
   npm install
   ```

4. **Ejecutar migración**
   ```bash
   npm run migrate
   ```

5. **Ejecutar seed de datos**
   ```bash
   npm run seed
   ```

6. **Iniciar servidor**
   ```bash
   npm run dev
   ```

### Opción 2: PostgreSQL Local

1. **Instalar PostgreSQL**
   - **Windows**: Descargar desde [postgresql.org](https://www.postgresql.org/download/windows/)
   - **macOS**: `brew install postgresql`
   - **Ubuntu/Debian**: `sudo apt-get install postgresql postgresql-contrib`

2. **Crear base de datos**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE inventario_db;
   CREATE USER inventario_user WITH PASSWORD 'tu_password';
   GRANT ALL PRIVILEGES ON DATABASE inventario_db TO inventario_user;
   \q
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   # Editar .env con tus credenciales
   ```

4. **Instalar dependencias y ejecutar**
   ```bash
   npm install
   npm run migrate
   npm run seed
   npm run dev
   ```

## 🔧 Configuración de Variables de Entorno

### Desarrollo Local (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventario_db
DB_USER=postgres
DB_PASSWORD=postgres123
DB_SSL=false
```

### Producción (env.production)
```env
DB_HOST=tu_host_postgresql
DB_PORT=5432
DB_NAME=inventario_db
DB_USER=tu_usuario
DB_PASSWORD=tu_password_seguro
DB_SSL=true
```

## 📊 Diferencias SQLite vs PostgreSQL

| Característica | SQLite | PostgreSQL |
|----------------|---------|------------|
| Sintaxis | `?` placeholders | `$1, $2, $3` placeholders |
| Tipos de datos | `INTEGER`, `TEXT`, `REAL` | `SERIAL`, `VARCHAR`, `DECIMAL` |
| Timestamps | `DATETIME` | `TIMESTAMP` |
| Triggers | SQLite syntax | PL/pgSQL functions |
| Búsqueda | `LIKE` | `ILIKE` (case-insensitive) |
| Auto-increment | `AUTOINCREMENT` | `SERIAL` |

## 🚀 Despliegue en la Nube

### Heroku
1. **Crear app en Heroku**
2. **Agregar addon PostgreSQL**
3. **Configurar variables de entorno**
4. **Deploy**

### Railway
1. **Conectar repositorio**
2. **Agregar servicio PostgreSQL**
3. **Configurar variables de entorno**
4. **Deploy automático**

### DigitalOcean
1. **Crear droplet con PostgreSQL**
2. **Configurar firewall**
3. **Deploy aplicación**
4. **Configurar nginx reverse proxy**

## 🔍 Verificación de la Migración

### 1. Verificar conexión
```bash
npm run migrate
# Debe mostrar: "✅ Base de datos PostgreSQL conectada"
```

### 2. Verificar esquema
```bash
npm run seed
# Debe crear usuarios y productos sin errores
```

### 3. Verificar API
```bash
# Probar endpoints:
curl http://localhost:3000/api/auth/status
curl http://localhost:3000/api/products
```

## 🐛 Solución de Problemas

### Error de conexión
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps
# o
sudo systemctl status postgresql
```

### Error de autenticación
```bash
# Verificar credenciales en .env
# Verificar que el usuario tenga permisos
```

### Error de puerto ocupado
```bash
# Cambiar puerto en .env
PORT=3001
```

## 📝 Comandos Útiles

```bash
# Ver logs de PostgreSQL
docker-compose logs postgres

# Conectar a PostgreSQL
docker-compose exec postgres psql -U postgres -d inventario_db

# Reiniciar servicios
docker-compose restart

# Parar servicios
docker-compose down

# Limpiar volúmenes (¡CUIDADO! Borra datos)
docker-compose down -v
```

## ✅ Checklist de Migración

- [ ] Instalar dependencias PostgreSQL
- [ ] Configurar variables de entorno
- [ ] Ejecutar migración (`npm run migrate`)
- [ ] Ejecutar seed (`npm run seed`)
- [ ] Verificar conexión a la API
- [ ] Probar autenticación
- [ ] Probar CRUD de productos
- [ ] Configurar para producción

## 🎯 Próximos Pasos

1. **Monitoreo**: Implementar logging y métricas
2. **Backup**: Configurar backups automáticos
3. **Performance**: Optimizar consultas y índices
4. **Seguridad**: Implementar rate limiting y validaciones adicionales
5. **Testing**: Agregar tests unitarios y de integración

---

**¡Migración completada! 🎉**

El proyecto ahora usa PostgreSQL y mantiene toda la funcionalidad original:
- ✅ Autenticación por sesión
- ✅ CRUD completo de productos
- ✅ Control de acceso por roles
- ✅ Validación de datos
- ✅ Manejo de errores robusto
