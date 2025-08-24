import dotenv from "dotenv";

// Cargar variables de entorno según el entorno
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });

// Configuración de la base de datos
export const dbConfig = {
    development: {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || "inventario_db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres123",
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    },
    production: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : true,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    },
    test: {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || "inventario_test",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres123",
        ssl: false,
        max: 5,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 1000,
    }
};

// Obtener configuración según el entorno
export const getDbConfig = () => {
    const config = dbConfig[env];
    
    if (!config) {
        throw new Error(`Entorno de base de datos no válido: ${env}`);
    }
    
    // Validar configuración en producción
    if (env === "production") {
        const requiredFields = ["host", "database", "user", "password"];
        for (const field of requiredFields) {
            if (!config[field]) {
                throw new Error(`Variable de entorno requerida no configurada: DB_${field.toUpperCase()}`);
            }
        }
    }
    
    return config;
};

// Configuración del servidor
export const serverConfig = {
    port: parseInt(process.env.PORT) || 3000,
    nodeEnv: env,
    sessionSecret: process.env.SESSION_SECRET || "default-secret-change-in-production",
    cookieSecure: process.env.COOKIE_SECURE === "true",
    cookieHttpOnly: process.env.COOKIE_HTTPONLY !== "false",
    cookieSameSite: process.env.COOKIE_SAMESITE || "lax",
    cookieMaxAge: parseInt(process.env.COOKIE_MAX_AGE) || 86400000,
};

// Configuración de seguridad
export const securityConfig = {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    corsOrigin: process.env.CORS_ORIGIN || "*",
};

// Función para validar configuración
export const validateConfig = () => {
    try {
        const db = getDbConfig();
        const server = serverConfig;
        const security = securityConfig;
        
        console.log("✅ Configuración validada:");
        console.log(`   Entorno: ${env}`);
        console.log(`   Puerto: ${server.port}`);
        console.log(`   Base de datos: ${db.host}:${db.port}/${db.database}`);
        console.log(`   Usuario DB: ${db.user}`);
        console.log(`   SSL: ${db.ssl ? "Habilitado" : "Deshabilitado"}`);
        
        return true;
    } catch (error) {
        console.error("❌ Error en configuración:", error.message);
        return false;
    }
};

export default {
    db: getDbConfig(),
    server: serverConfig,
    security: securityConfig,
    validate: validateConfig,
};
