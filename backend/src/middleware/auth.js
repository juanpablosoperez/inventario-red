/**
 * Middleware de autenticación y autorización
 * Sistema de inventario - TP Integrador de Redes y Comunicación
 */

/**
 * Middleware para verificar que el usuario esté autenticado
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export function requireAuth(req, res, next) {
    // Verificar si existe sesión y usuario
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            error: "No autorizado",
            message: "Debe iniciar sesión para acceder a este recurso"
        });
    }
    
    // Agregar información del usuario al request para uso posterior
    req.user = req.session.user;
    next();
}

/**
 * Middleware para verificar que el usuario tenga un rol específico
 * @param {string} role - Rol requerido ("admin" o "viewer")
 * @returns {Function} Middleware de Express
 */
export function requireRole(role) {
    return (req, res, next) => {
        // Primero verificar autenticación
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                error: "No autorizado",
                message: "Debe iniciar sesión para acceder a este recurso"
            });
        }
        
        const userRole = req.session.user.role;
        
        // Verificar si el rol del usuario coincide con el requerido
        if (userRole !== role) {
            return res.status(403).json({
                error: "Acceso denegado",
                message: `Se requiere rol '${role}' para acceder a este recurso. Su rol actual es '${userRole}'`
            });
        }
        
        // Agregar información del usuario al request
        req.user = req.session.user;
        next();
    };
}

/**
 * Middleware para verificar que el usuario sea admin
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export function requireAdmin(req, res, next) {
    requireRole("admin")(req, res, next);
}

/**
 * Helper para obtener información del usuario autenticado
 * @param {Object} req - Request de Express
 * @returns {Object|null} Información del usuario o null si no está autenticado
 */
export function getCurrentUser(req) {
    return req.session?.user || null;
}

/**
 * Middleware opcional para verificar autenticación (no bloquea si no está autenticado)
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export function optionalAuth(req, res, next) {
    if (req.session && req.session.user) {
        req.user = req.session.user;
    }
    next();
}

/**
 * Middleware para verificar permisos de producto
 * @param {string} action - Acción a realizar ("read", "create", "update", "delete")
 * @returns {Function} Middleware de Express
 */
export function requireProductPermission(action) {
    return (req, res, next) => {
        // Verificar autenticación
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                error: "No autorizado",
                message: "Debe iniciar sesión para acceder a este recurso"
            });
        }
        
        const userRole = req.session.user.role;
        
        // Permisos por rol
        const permissions = {
            admin: ["read", "create", "update", "delete"],
            viewer: ["read"]
        };
        
        // Verificar si el usuario tiene permiso para la acción
        if (!permissions[userRole] || !permissions[userRole].includes(action)) {
            return res.status(403).json({
                error: "Acceso denegado",
                message: `No tiene permisos para realizar la acción '${action}' con su rol '${userRole}'`
            });
        }
        
        req.user = req.session.user;
        next();
    };
}
