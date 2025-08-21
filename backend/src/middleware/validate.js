/**
 * Middleware de validación usando Zod
 * Sistema de inventario - TP Integrador de Redes y Comunicación
 */

import { ZodError } from "zod";

/**
 * Middleware para validar el body de la request usando un esquema Zod
 * @param {Object} schema - Esquema de validación Zod
 * @returns {Function} Middleware de Express
 */
export function validate(schema) {
    return (req, res, next) => {
        try {
            // Validar el body de la request
            const validatedData = schema.parse(req.body);
            
            // Reemplazar el body con los datos validados y sanitizados
            req.body = validatedData;
            
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Error de validación Zod
                const validationErrors = error.errors.map(err => ({
                    field: err.path.join("."),
                    message: err.message,
                    code: err.code
                }));
                
                return res.status(400).json({
                    error: "Datos de entrada inválidos",
                    message: "Los datos proporcionados no cumplen con el formato requerido",
                    details: validationErrors
                });
            }
            
            // Otro tipo de error
            console.error("❌ Error de validación:", error);
            return res.status(500).json({
                error: "Error interno del servidor",
                message: "Ocurrió un error durante la validación de datos"
            });
        }
    };
}

/**
 * Middleware para validar parámetros de URL usando un esquema Zod
 * @param {Object} schema - Esquema de validación Zod para params
 * @returns {Function} Middleware de Express
 */
export function validateParams(schema) {
    return (req, res, next) => {
        try {
            // Validar los parámetros de la URL
            const validatedParams = schema.parse(req.params);
            
            // Reemplazar los params con los datos validados
            req.params = validatedParams;
            
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const validationErrors = error.errors.map(err => ({
                    field: err.path.join("."),
                    message: err.message,
                    code: err.code
                }));
                
                return res.status(400).json({
                    error: "Parámetros de URL inválidos",
                    message: "Los parámetros de la URL no cumplen con el formato requerido",
                    details: validationErrors
                });
            }
            
            console.error("❌ Error de validación de parámetros:", error);
            return res.status(500).json({
                error: "Error interno del servidor",
                message: "Ocurrió un error durante la validación de parámetros"
            });
        }
    };
}

/**
 * Middleware para validar query parameters usando un esquema Zod
 * @param {Object} schema - Esquema de validación Zod para query
 * @returns {Function} Middleware de Express
 */
export function validateQuery(schema) {
    return (req, res, next) => {
        try {
            // Validar los query parameters
            const validatedQuery = schema.parse(req.query);
            
            // Reemplazar los query params con los datos validados
            req.query = validatedQuery;
            
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const validationErrors = error.errors.map(err => ({
                    field: err.path.join("."),
                    message: err.message,
                    code: err.code
                }));
                
                return res.status(400).json({
                    error: "Parámetros de consulta inválidos",
                    message: "Los parámetros de consulta no cumplen con el formato requerido",
                    details: validationErrors
                });
            }
            
            console.error("❌ Error de validación de query:", error);
            return res.status(500).json({
                error: "Error interno del servidor",
                message: "Ocurrió un error durante la validación de parámetros de consulta"
            });
        }
    };
}

/**
 * Middleware para sanitizar strings básicos
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
export function sanitizeInputs(req, res, next) {
    // Sanitizar strings en el body
    if (req.body && typeof req.body === "object") {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === "string") {
                // Trim y escape básico de strings
                req.body[key] = req.body[key]
                    .trim()
                    .replace(/[<>]/g, "") // Remover < y > para prevenir XSS básico
                    .replace(/javascript:/gi, "") // Remover javascript: protocol
                    .replace(/on\w+=/gi, ""); // Remover event handlers
            }
        });
    }
    
    // Sanitizar parámetros de URL
    if (req.params && typeof req.params === "object") {
        Object.keys(req.params).forEach(key => {
            if (typeof req.params[key] === "string") {
                req.params[key] = req.params[key].trim();
            }
        });
    }
    
    // Sanitizar query parameters
    if (req.query && typeof req.query === "object") {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === "string") {
                req.query[key] = req.query[key].trim();
            }
        });
    }
    
    next();
}

/**
 * Middleware para validar y sanitizar en una sola función
 * @param {Object} bodySchema - Esquema para validar el body
 * @param {Object} paramsSchema - Esquema para validar parámetros (opcional)
 * @param {Object} querySchema - Esquema para validar query (opcional)
 * @returns {Function} Middleware de Express
 */
export function validateAll(bodySchema, paramsSchema = null, querySchema = null) {
    const middlewares = [sanitizeInputs];
    
    if (bodySchema) {
        middlewares.push(validate(bodySchema));
    }
    
    if (paramsSchema) {
        middlewares.push(validateParams(paramsSchema));
    }
    
    if (querySchema) {
        middlewares.push(validateQuery(querySchema));
    }
    
    return middlewares;
}
