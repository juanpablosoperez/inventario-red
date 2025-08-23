/**
 * Configuración principal de la aplicación Express
 * Sistema de inventario - TP Integrador de Redes y Comunicación
 */

import express from "express";
import session from "express-session";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();

// Configuración de seguridad con Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// Configuración de sesiones
const sessionConfig = {
    secret: process.env.SESSION_SECRET || "cambia-esto-por-uno-largo-y-seguro-en-produccion",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: process.env.COOKIE_HTTPONLY === "true" || true,
        secure: process.env.COOKIE_SECURE === "true" || false, // true en HTTPS
        sameSite: process.env.COOKIE_SAMESITE || "lax",
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    },
    name: "inventario.sid" // Cambiar nombre por defecto de la cookie
};

// Aplicar configuración de sesiones
app.use(session(sessionConfig));

// Middleware para parsear JSON
app.use(express.json({ 
    limit: "10mb" // Límite de tamaño para prevenir ataques
}));

// Middleware para parsear URL-encoded
app.use(express.urlencoded({ 
    extended: true, 
    limit: "10mb" 
}));

// Middleware de logging personalizado
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get("User-Agent");
    
    console.log(`[${timestamp}] ${method} ${url} - ${ip} - ${userAgent}`);
    next();
});

// Middleware para agregar headers de seguridad adicionales
app.use((req, res, next) => {
    // Prevenir clickjacking
    res.setHeader("X-Frame-Options", "DENY");
    
    // Prevenir MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    // Prevenir XSS
    res.setHeader("X-XSS-Protection", "1; mode=block");
    
    // Referrer policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // Permissions policy
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    
    next();
});

// Middleware para manejar CORS básico (configurar según necesidades)
app.use((req, res, next) => {
    // Permitir solo el origen local por defecto
    const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    
    // Manejar preflight requests
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Ruta de healthcheck
app.get("/api/health", (req, res) => {
    res.status(200).json({
        ok: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0"
    });
});

// Ruta de información del sistema
app.get("/api/info", (req, res) => {
    res.status(200).json({
        name: "Sistema de Inventario",
        description: "TP Integrador de Redes y Comunicación",
        version: "1.0.0",
        author: "Equipo de Desarrollo",
        endpoints: {
            auth: "/api/auth",
            products: "/api/products",
            health: "/api/health"
        }
    });
});

// Aplicar rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Servir archivos estáticos del frontend
const frontendPath = path.resolve(__dirname, "../../frontend");
app.use(express.static(frontendPath));

// Ruta para la página principal
app.get("/", (req, res) => {
    const indexPath = path.resolve(__dirname, "../../frontend/index.html");
    res.sendFile(indexPath);
});

// Ruta para la página de inventario
app.get("/inventario", (req, res) => {
    const inventarioPath = path.resolve(__dirname, "../../frontend/inventario.html");
    res.sendFile(inventarioPath);
});

// Ruta para la página de prueba de login
app.get("/test-login", (req, res) => {
    const testPath = path.resolve(__dirname, "../../frontend/test-login.html");
    res.sendFile(testPath);
});

// Ruta para la página de prueba simple
app.get("/test-simple", (req, res) => {
    const testSimplePath = path.resolve(__dirname, "../../frontend/test-simple.html");
    res.sendFile(testSimplePath);
});

// Middleware para manejar rutas no encontradas
app.use("/api/*", (req, res) => {
    res.status(404).json({
        error: "Endpoint no encontrado",
        message: `La ruta ${req.method} ${req.originalUrl} no existe`,
        availableEndpoints: [
            "GET /api/health",
            "GET /api/info",
            "POST /api/auth/login",
            "POST /api/auth/logout",
            "GET /api/auth/me",
            "GET /api/auth/status",
            "GET /api/products",
            "GET /api/products/:id",
            "POST /api/products",
            "PUT /api/products/:id",
            "DELETE /api/products/:id",
            "GET /api/products/search/:query"
        ]
    });
});

// Middleware para manejar errores globales
app.use((error, req, res, next) => {
    console.error("❌ Error no manejado:", error);
    
    // Error de validación
    if (error.name === "ValidationError") {
        return res.status(400).json({
            error: "Error de validación",
            message: error.message
        });
    }
    
    // Error de base de datos
    if (error.code === "SQLITE_CONSTRAINT") {
        return res.status(409).json({
            error: "Conflicto de datos",
            message: "Los datos proporcionados violan una restricción de la base de datos"
        });
    }
    
    // Error de sesión
    if (error.name === "SessionError") {
        return res.status(401).json({
            error: "Error de sesión",
            message: "Su sesión ha expirado o es inválida"
        });
    }
    
    // Error genérico
    res.status(500).json({
        error: "Error interno del servidor",
        message: "Ocurrió un error inesperado en el servidor"
    });
});

// Middleware para manejar requests no manejados
app.use("*", (req, res) => {
    res.status(404).json({
        error: "Ruta no encontrada",
        message: `La ruta ${req.method} ${req.originalUrl} no existe en este servidor`,
        apiBase: "/api"
    });
});

export default app;
