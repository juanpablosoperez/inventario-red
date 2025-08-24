import { pool } from "../src/db/connection.js";

/**
 * Health check completo para la aplicación
 * Verifica la conectividad de la base de datos y el estado general
 */

export async function healthCheck() {
    const startTime = Date.now();
    const health = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        checks: {
            database: "unknown",
            memory: "unknown",
            disk: "unknown"
        },
        metrics: {
            responseTime: 0,
            memoryUsage: process.memoryUsage(),
            activeConnections: 0
        }
    };

    try {
        // Verificar base de datos
        const dbStart = Date.now();
        const client = await pool.connect();
        
        try {
            await client.query("SELECT 1");
            health.checks.database = "healthy";
            health.metrics.responseTime = Date.now() - dbStart;
            
            // Obtener estadísticas de conexiones
            const stats = await client.query("SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active'");
            health.metrics.activeConnections = parseInt(stats.rows[0].active_connections);
        } finally {
            client.release();
        }

        // Verificar uso de memoria
        const memUsage = process.memoryUsage();
        const memUsageMB = {
            rss: Math.round(memUsage.rss / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024)
        };

        // Considerar memoria saludable si está por debajo de 500MB
        if (memUsageMB.heapUsed < 500) {
            health.checks.memory = "healthy";
        } else {
            health.checks.memory = "warning";
        }

        // Verificar espacio en disco (simplificado)
        health.checks.disk = "healthy"; // En producción, verificar espacio real

        // Determinar estado general
        const allHealthy = Object.values(health.checks).every(check => check === "healthy");
        health.status = allHealthy ? "healthy" : "degraded";

        if (health.checks.database === "unknown") {
            health.status = "unhealthy";
        }

    } catch (error) {
        health.status = "unhealthy";
        health.checks.database = "unhealthy";
        health.error = error.message;
    }

    health.metrics.responseTime = Date.now() - startTime;

    return health;
}

/**
 * Health check simple para Docker
 */
export async function simpleHealthCheck() {
    try {
        const client = await pool.connect();
        await client.query("SELECT 1");
        client.release();
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Health check detallado para monitoreo
 */
export async function detailedHealthCheck() {
    const health = await healthCheck();
    
    // Agregar información adicional para monitoreo
    health.version = process.env.npm_package_version || "1.0.0";
    health.nodeVersion = process.version;
    health.platform = process.platform;
    health.arch = process.arch;
    
    // Agregar métricas de rendimiento
    health.performance = {
        cpuUsage: process.cpuUsage(),
        resourceUsage: process.resourceUsage(),
        pid: process.pid,
        title: process.title
    };

    return health;
}
