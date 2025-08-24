/**
 * Rutas de autenticación
 * Sistema de inventario - TP Integrador de Redes y Comunicación
 */

import express from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { getDb } from "../db/connection.js";
import { requireAuth } from "../middleware/auth.js";
import { validate, sanitizeInputs } from "../middleware/validate.js";

const router = express.Router();

// Esquemas de validación Zod
const loginSchema = z.object({
    username: z.string()
        .min(1, "El nombre de usuario es obligatorio")
        .max(50, "El nombre de usuario no puede exceder 50 caracteres")
        .regex(/^[a-zA-Z0-9_]+$/, "El nombre de usuario solo puede contener letras, números y guiones bajos"),
    password: z.string()
        .min(1, "La contraseña es obligatoria")
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .max(100, "La contraseña no puede exceder 100 caracteres")
});

/**
 * POST /api/auth/login
 * Inicia sesión del usuario
 */
router.post("/login", 
    sanitizeInputs,
    validate(loginSchema),
    async (req, res) => {
        try {
            const { username, password } = req.body;
            
            // Obtener conexión a la base de datos
            const db = await getDb();
            
            // Buscar usuario por username
            const userResult = await db.query(
                "SELECT id, username, password_hash, role FROM users WHERE username = $1",
                [username]
            );
            
            const user = userResult.rows[0];
            
            // Verificar si el usuario existe
            if (!user) {
                return res.status(401).json({
                    error: "Credenciales inválidas",
                    message: "El nombre de usuario o contraseña son incorrectos"
                });
            }
            
            // Verificar la contraseña
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            
            if (!isPasswordValid) {
                return res.status(401).json({
                    error: "Credenciales inválidas",
                    message: "El nombre de usuario o contraseña son incorrectos"
                });
            }
            
            // Crear sesión del usuario
            req.session.user = {
                id: user.id,
                username: user.username,
                role: user.role
            };
            
            // Guardar la sesión
            req.session.save((err) => {
                if (err) {
                    console.error("❌ Error al guardar sesión:", err);
                    return res.status(500).json({
                        error: "Error interno del servidor",
                        message: "No se pudo iniciar sesión"
                    });
                }
                
                // Log de acceso exitoso
                console.log(`🔐 Usuario ${username} (${user.role}) inició sesión desde ${req.ip}`);
                
                // Responder con éxito
                res.status(200).json({
                    message: "OK",
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role
                    }
                });
            });
            
        } catch (error) {
            console.error("❌ Error en login:", error);
            res.status(500).json({
                error: "Error interno del servidor",
                message: "Ocurrió un error durante el inicio de sesión"
            });
        }
    }
);

/**
 * POST /api/auth/logout
 * Cierra la sesión del usuario
 */
router.post("/logout", requireAuth, (req, res) => {
    try {
        const username = req.user.username;
        
        // Destruir la sesión
        req.session.destroy((err) => {
            if (err) {
                console.error("❌ Error al destruir sesión:", err);
                return res.status(500).json({
                    error: "Error interno del servidor",
                    message: "No se pudo cerrar sesión"
                });
            }
            
            // Log de cierre de sesión
            console.log(`🔒 Usuario ${username} cerró sesión desde ${req.ip}`);
            
            // Limpiar cookie de sesión
            res.clearCookie("connect.sid");
            
            res.status(200).json({
                message: "Sesión cerrada correctamente"
            });
        });
        
    } catch (error) {
        console.error("❌ Error en logout:", error);
        res.status(500).json({
            error: "Error interno del servidor",
            message: "Ocurrió un error durante el cierre de sesión"
        });
    }
});

/**
 * GET /api/auth/me
 * Obtiene información del usuario autenticado
 */
router.get("/me", requireAuth, (req, res) => {
    try {
        res.status(200).json({
            user: {
                id: req.user.id,
                username: req.user.username,
                role: req.user.role
            }
        });
    } catch (error) {
        console.error("❌ Error al obtener usuario:", error);
        res.status(500).json({
            error: "Error interno del servidor",
            message: "No se pudo obtener la información del usuario"
        });
    }
});

/**
 * GET /api/auth/status
 * Verifica el estado de autenticación (para verificar si la sesión está activa)
 */
router.get("/status", (req, res) => {
    try {
        if (req.session && req.session.user) {
            res.status(200).json({
                authenticated: true,
                user: {
                    id: req.session.user.id,
                    username: req.session.user.username,
                    role: req.session.user.role
                }
            });
        } else {
            res.status(200).json({
                authenticated: false,
                user: null
            });
        }
    } catch (error) {
        console.error("❌ Error al verificar estado de autenticación:", error);
        res.status(500).json({
            error: "Error interno del servidor",
            message: "No se pudo verificar el estado de autenticación"
        });
    }
});

export default router;
