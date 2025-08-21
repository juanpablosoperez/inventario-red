# Sistema de Inventario - TP Integrador de Redes y Comunicación

Un sistema completo de gestión de inventario desarrollado con Node.js para el backend y HTML/CSS/JavaScript vanilla para el frontend, diseñado para funcionar en red local con múltiples equipos.

## 🎯 **Objetivo del Proyecto**

Implementar el TP Integrador de Redes y Comunicación: una aplicación web de inventario que funcione en red local con 3 equipos (1 servidor + 2 clientes), permita operaciones CRUD de productos, tenga autenticación robusta, roles diferenciados (admin y viewer), acceso remoto de solo lectura por HTTPS, endurecimiento de servidor/puertos, validación/sanitización de datos, y pruebas con herramientas de red como nmap y Wireshark.

## 🚀 **Características Implementadas**

- **Backend robusto** con Express.js y SQLite
- **Frontend responsivo** con interfaz moderna y roles diferenciados
- **Autenticación segura** con bcrypt y sesiones HTTP-only
- **Validación de datos** con Zod y sanitización de inputs
- **Seguridad mejorada** con Helmet, headers de seguridad y protección XSS
- **Base de datos SQLite** con esquema optimizado y triggers
- **Sistema de roles** (admin: CRUD completo, viewer: solo lectura)
- **API REST** con validación, manejo de errores y logging
- **Middleware de seguridad** para autenticación y autorización
- **Manejo de sesiones** con cookies seguras y configuración de seguridad

## 📁 **Estructura del Proyecto**

```
inventario-red/
├── .gitignore
├── README.md
├── LICENSE
├── backend/
│   ├── package.json          # Dependencias y scripts
│   ├── env.example           # Variables de entorno de ejemplo
│   └── src/
│       ├── app.js            # Configuración de Express y middleware
│       ├── server.js         # Servidor principal
│       ├── db/
│       │   ├── schema.sql    # Esquema de la base de datos
│       │   ├── connection.js # Conexión y funciones de BD
│       │   └── seed.js       # Datos iniciales y usuarios
│       ├── middleware/
│       │   ├── auth.js       # Autenticación y autorización
│       │   └── validate.js   # Validación con Zod
│       └── routes/
│           ├── auth.js       # Rutas de autenticación
│           └── products.js   # Rutas CRUD de productos
└── frontend/
    ├── index.html            # Página de login
    ├── inventario.html       # Página de inventario
    ├── css/
    │   └── styles.css        # Estilos principales
    └── js/
        ├── api.js            # Cliente de API
        └── ui.js             # Lógica de interfaz
```

## 🛠️ **Stack Tecnológico**

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web con middleware de seguridad
- **SQLite** - Base de datos ligera con consultas preparadas
- **bcrypt** - Encriptación de contraseñas (salt rounds: 12)
- **express-session** - Manejo de sesiones con cookies seguras
- **Helmet** - Headers de seguridad HTTP
- **Zod** - Validación y sanitización de esquemas
- **nodemon** - Reinicio automático en desarrollo

### Frontend
- **HTML5** - Estructura semántica y accesible
- **CSS3** - Estilos responsivos con Grid y Flexbox
- **JavaScript ES6+** - Lógica del cliente con Fetch API
- **Cookies de sesión** - Autenticación automática

## 🚀 **Instalación y Configuración**

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Git

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd inventario-red
   ```

2. **Configurar variables de entorno**
   ```bash
   cd backend
   cp env.example .env
   # Editar .env con tus configuraciones
   ```

3. **Instalar dependencias del backend**
   ```bash
   npm install
   ```

4. **Inicializar la base de datos**
   ```bash
   npm run seed
   ```

5. **Ejecutar el servidor**
   ```bash
   # Modo desarrollo (con nodemon)
   npm run dev
   
   # Modo producción
   npm start
   ```

6. **Acceder al frontend**
   - Abrir `frontend/index.html` en tu navegador
   - O servir los archivos estáticos desde un servidor web

## 📖 **Uso del Sistema**

### Scripts Disponibles

- `npm run dev` - Ejecuta el servidor en modo desarrollo con nodemon
- `npm start` - Ejecuta el servidor en modo producción
- `npm run seed` - Inicializa la base de datos con datos de ejemplo
- `npm run lint` - Verificación de código (placeholder)
- `npm test` - Tests unitarios (placeholder)

### Credenciales de Acceso

- **👑 ADMIN**: `admin` / `admin123` (acceso completo CRUD)
- **👁️ VIEWER**: `viewer` / `viewer123` (solo lectura)

## 🔌 **API REST - Contrato**

### Base URL
```
http://localhost:3000/api
```

### Autenticación
- **POST** `/auth/login` → Iniciar sesión
  - Body: `{ "username": "...", "password": "..." }`
  - Respuesta: `200 { "message": "OK", "user": {...} }`
  - Errores: `400/401 { "error": "...", "message": "..." }`

- **POST** `/auth/logout` → Cerrar sesión
  - Respuesta: `200 { "message": "Sesión cerrada correctamente" }`

- **GET** `/auth/me` → Obtener usuario actual
  - Respuesta: `200 { "user": {...} }`

- **GET** `/auth/status` → Verificar estado de autenticación
  - Respuesta: `200 { "authenticated": true/false, "user": {...} }`

### Productos (requiere sesión)
- **GET** `/products` → Lista todos los productos (admin y viewer)
  - Respuesta: `200 { "products": [...], "summary": {...} }`

- **GET** `/products/:id` → Obtiene producto específico
  - Respuesta: `200 { "product": {...} }`

- **POST** `/products` → Crea nuevo producto (solo admin)
  - Body: `{ "sku": "...", "name": "...", "qty": number, "price": number }`
  - Respuesta: `201 { "message": "...", "product": {...} }`

- **PUT** `/products/:id` → Actualiza producto (solo admin)
  - Body: `{ "name": "...", "qty": number, "price": number }` (campos opcionales)
  - Respuesta: `200 { "message": "...", "product": {...} }`

- **DELETE** `/products/:id` → Elimina producto (solo admin)
  - Respuesta: `204` (sin contenido)

- **GET** `/products/search/:query` → Búsqueda por nombre o SKU
  - Respuesta: `200 { "products": [...], "searchQuery": "...", "totalResults": number }`

### Sistema
- **GET** `/health` → Healthcheck del servidor
  - Respuesta: `200 { "ok": true, "timestamp": "...", "uptime": number }`

- **GET** `/info` → Información del sistema
  - Respuesta: `200 { "name": "...", "description": "...", "endpoints": {...} }`

## 🔒 **Seguridad Implementada**

### Autenticación y Autorización
- **Sesiones seguras** con cookies HTTP-only y SameSite
- **Encriptación de contraseñas** con bcrypt (12 salt rounds)
- **Sistema de roles** granular (admin vs viewer)
- **Middleware de autenticación** para proteger rutas
- **Verificación de permisos** por acción y recurso

### Protección de Datos
- **Validación con Zod** en todas las entradas
- **Sanitización de inputs** (trim, escape XSS básico)
- **Consultas preparadas** para prevenir SQL injection
- **Límites de tamaño** en requests (10MB)
- **Validación de tipos** y rangos de datos

### Headers de Seguridad (Helmet)
- **Content Security Policy** (CSP) restrictivo
- **HTTP Strict Transport Security** (HSTS)
- **X-Frame-Options** para prevenir clickjacking
- **X-Content-Type-Options** para prevenir MIME sniffing
- **X-XSS-Protection** para prevenir XSS
- **Referrer Policy** restrictivo
- **Permissions Policy** para APIs sensibles

### Configuración de Cookies
- **httpOnly: true** - Previene acceso desde JavaScript
- **secure: false** (desarrollo) / **true** (producción HTTPS)
- **sameSite: "lax"** - Protección CSRF
- **maxAge: 24 horas** - Expiración automática

## 🗄️ **Base de Datos**

### Esquema SQLite
- **Tabla users**: `id`, `username` (UNIQUE), `password_hash`, `role` (CHECK)
- **Tabla products**: `id`, `sku` (UNIQUE), `name`, `qty`, `price`, timestamps
- **Índices optimizados** para consultas frecuentes
- **Triggers automáticos** para timestamps de modificación
- **Constraints de integridad** (UNIQUE, CHECK, NOT NULL)

### Características
- **Consultas preparadas** para prevenir SQL injection
- **Transacciones** para operaciones críticas
- **Manejo de errores** con códigos específicos
- **Logging** de operaciones de modificación
- **Cierre graceful** de conexiones

## 🌐 **Frontend**

### Características de la Interfaz
- **Diseño responsivo** para móviles y escritorio
- **Roles diferenciados** (admin vs viewer)
- **Formularios validados** con feedback visual
- **Tabla de productos** con ordenamiento y búsqueda
- **Modales** para edición y confirmación
- **Estados de carga** y manejo de errores

### Funcionalidades por Rol
- **👑 ADMIN**: CRUD completo, gestión de inventario
- **👁️ VIEWER**: Solo visualización, sin controles de edición

## 🚀 **Despliegue y Red**

### Despliegue Local
1. Ejecutar `npm start` en la carpeta backend
2. Abrir archivos HTML del frontend en el navegador
3. Acceder a `http://localhost:3000`

### Despliegue en Red Local
1. **Servidor**: Ejecutar backend en equipo principal
2. **Clientes**: Acceder desde otros equipos usando IP del servidor
3. **Configuración**: Ajustar CORS y allowed origins según red

### Acceso Remoto con HTTPS
Para acceso remoto de solo lectura, configurar proxy reverso:

#### Con Caddy (recomendado)
```bash
# Instalar Caddy
# Crear Caddyfile
inventario.midominio.com {
    reverse_proxy localhost:3000
    tls tu-email@dominio.com
}

# Ejecutar
caddy run --config Caddyfile
```

#### Con Nginx
```nginx
server {
    listen 443 ssl;
    server_name inventario.midominio.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Puertos y Firewall
- **Puerto 3000**: API del backend (interno)
- **Puerto 80/443**: Proxy HTTPS (externo)
- **Puerto 22**: SSH para administración

#### Configuración UFW (Ubuntu)
```bash
sudo ufw default deny incoming
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 🧪 **Pruebas de Seguridad y Red**

### Herramientas de Prueba
- **nmap**: Escaneo de puertos y servicios
- **Wireshark**: Análisis de tráfico de red
- **curl**: Pruebas de API y headers
- **Burp Suite**: Análisis de seguridad web

### Comandos de Prueba

#### Escaneo de Puertos
```bash
# Escaneo básico
nmap -sC -sV <IP_SERVIDOR>

# Escaneo completo
nmap -p- -A <IP_SERVIDOR>

# Verificar puertos específicos
nmap -p 22,80,443,3000 <IP_SERVIDOR>
```

#### Pruebas de API
```bash
# Healthcheck
curl -v http://localhost:3000/api/health

# Login (crear sesión)
curl -v -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt

# Acceso con sesión
curl -v -b cookies.txt http://localhost:3000/api/products
```

#### Análisis de Tráfico
```bash
# Capturar tráfico HTTP
sudo tcpdump -i any -w capture.pcap port 3000

# Analizar con Wireshark
wireshark capture.pcap
```

### Verificaciones de Seguridad

#### Headers HTTP
```bash
curl -I http://localhost:3000/api/health
# Verificar: X-Frame-Options, X-Content-Type-Options, etc.
```

#### Cookies de Sesión
```bash
# Verificar que las cookies sean httpOnly
curl -v -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

#### Validación de Inputs
```bash
# Probar inyección SQL
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"sku":"TEST","name":"<script>alert(1)</script>","qty":1,"price":10}'
```

## 🔄 **Estado del Proyecto**

### ✅ **Completado**
- Backend funcional con Express.js y SQLite
- Base de datos con esquema optimizado
- Sistema de autenticación y autorización
- API REST completa con validación
- Middleware de seguridad implementado
- Frontend básico con roles diferenciados
- Documentación completa del sistema
- Scripts de instalación y configuración

### 🔄 **En Progreso**
- Mejoras de UI/UX del frontend
- Tests unitarios y de integración
- Monitoreo y logging avanzado
- Optimización de rendimiento

### 📋 **Pendiente**
- Tests automatizados completos
- Dashboard de administración
- Reportes y estadísticas
- Backup automático de base de datos
- Monitoreo de seguridad en tiempo real

## 🤝 **Contribución**

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- **Strings**: Usar comillas dobles (`"texto"`)
- **Nombres**: Descriptivos y en inglés
- **Comentarios**: JSDoc para funciones públicas
- **Modularidad**: Separar responsabilidades claramente
- **Validación**: Validar todas las entradas
- **Manejo de errores**: Errores descriptivos y logging

## 📝 **Licencia**

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## 📞 **Soporte y Contacto**

Si tienes alguna pregunta o necesitas ayuda:
- Abre un issue en el repositorio
- Revisa la documentación de la API
- Contacta al equipo de desarrollo

## 🔗 **Enlaces Útiles**

- [Documentación de Express.js](https://expressjs.com/)
- [Guía de seguridad de Helmet](https://helmetjs.github.io/)
- [Documentación de Zod](https://zod.dev/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)

---

**Desarrollado con ❤️ para el TP Integrador de Redes y Comunicación**

*Sistema de inventario seguro, escalable y listo para producción*
