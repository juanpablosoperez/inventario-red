/**
 * Servidor principal de la aplicación
 * Sistema de inventario - TP Integrador de Redes y Comunicación
 */

import app from "./app.js";
import dotenv from "dotenv";
import { closeDb } from "./db/connection.js";

// Cargar variables de entorno
dotenv.config();

// Configuración del servidor
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Función para iniciar el servidor
async function startServer() {
    try {
        // Iniciar el servidor HTTP
        const server = app.listen(PORT, () => {
            console.log("🚀 Sistema de Inventario iniciado");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log(`🌐 Servidor ejecutándose en: http://localhost:${PORT}`);
            console.log(`🔧 Entorno: ${NODE_ENV}`);
            console.log(`📊 API disponible en: http://localhost:${PORT}/api`);
            console.log(`❤️  Healthcheck: http://localhost:${PORT}/api/health`);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("");
            console.log("📋 Endpoints disponibles:");
            console.log("   🔐 Autenticación:");
            console.log("      POST /api/auth/login");
            console.log("      POST /api/auth/logout");
            console.log("      GET  /api/auth/me");
            console.log("      GET  /api/auth/status");
            console.log("");
            console.log("   📦 Productos:");
            console.log("      GET    /api/products");
            console.log("      GET    /api/products/:id");
            console.log("      POST   /api/products (admin)");
            console.log("      PUT    /api/products/:id (admin)");
            console.log("      DELETE /api/products/:id (admin)");
            console.log("      GET    /api/products/search/:query");
            console.log("");
            console.log("   📊 Sistema:");
            console.log("      GET /api/health");
            console.log("      GET /api/info");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("");
            console.log("🔐 Credenciales de prueba:");
            console.log("   👑 Admin: admin / admin123");
            console.log("   👁️  Viewer: viewer / viewer123");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        });
        
        // Configurar manejo de errores del servidor
        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                console.error(`❌ Error: El puerto ${PORT} ya está en uso`);
                console.error("💡 Soluciones:");
                console.error("   1. Detener otros servicios que usen el puerto");
                console.error("   2. Cambiar el puerto en el archivo .env");
                console.error("   3. Usar: lsof -i :${PORT} para ver qué usa el puerto");
            } else {
                console.error("❌ Error del servidor:", error);
            }
            process.exit(1);
        });
        
        // Configurar manejo de señales del sistema
        process.on("SIGINT", async () => {
            console.log("\n🔄 Recibida señal SIGINT, cerrando servidor...");
            await gracefulShutdown(server);
        });
        
        process.on("SIGTERM", async () => {
            console.log("\n🔄 Recibida señal SIGTERM, cerrando servidor...");
            await gracefulShutdown(server);
        });
        
        // Manejar errores no capturados
        process.on("uncaughtException", (error) => {
            console.error("❌ Error no capturado:", error);
            gracefulShutdown(server);
        });
        
        process.on("unhandledRejection", (reason, promise) => {
            console.error("❌ Promesa rechazada no manejada:", reason);
            gracefulShutdown(server);
        });
        
    } catch (error) {
        console.error("❌ Error al iniciar el servidor:", error);
        process.exit(1);
    }
}

// Función para cierre graceful del servidor
async function gracefulShutdown(server) {
    try {
        console.log("🔄 Cerrando conexiones de la base de datos...");
        await closeDb();
        
        console.log("🔄 Cerrando servidor HTTP...");
        server.close(() => {
            console.log("✅ Servidor cerrado correctamente");
            process.exit(0);
        });
        
        // Timeout de 10 segundos para forzar el cierre
        setTimeout(() => {
            console.error("⚠️  Forzando cierre del servidor...");
            process.exit(1);
        }, 10000);
        
    } catch (error) {
        console.error("❌ Error durante el cierre graceful:", error);
        process.exit(1);
    }
}

// Función para verificar la salud del sistema
function checkSystemHealth() {
    const health = {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid
    };
    
    console.log("📊 Estado del sistema:", health);
    return health;
}

// Verificar salud del sistema cada 5 minutos en producción
if (NODE_ENV === "production") {
    setInterval(checkSystemHealth, 5 * 60 * 1000);
}

// Iniciar el servidor
startServer();
