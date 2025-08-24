/**
 * Rutas de productos (CRUD)
 * Sistema de inventario - TP Integrador de Redes y Comunicación
 */

import express from "express";
import { z } from "zod";
import { getDb } from "../db/connection.js";
import { requireAuth, requireAdmin, requireProductPermission } from "../middleware/auth.js";
import { validate, validateParams, sanitizeInputs } from "../middleware/validate.js";

const router = express.Router();

// Esquemas de validación Zod
const createProductSchema = z.object({
    sku: z.string()
        .min(1, "El SKU es obligatorio")
        .max(20, "El SKU no puede exceder 20 caracteres")
        .regex(/^[A-Z0-9]+$/, "El SKU solo puede contener letras mayúsculas y números"),
    name: z.string()
        .min(1, "El nombre del producto es obligatorio")
        .max(100, "El nombre no puede exceder 100 caracteres"),
    qty: z.number()
        .int("La cantidad debe ser un número entero")
        .min(0, "La cantidad no puede ser negativa")
        .max(999999, "La cantidad no puede exceder 999,999"),
    price: z.number()
        .min(0, "El precio no puede ser negativo")
        .max(999999.99, "El precio no puede exceder 999,999.99")
});

const updateProductSchema = z.object({
    name: z.string()
        .min(1, "El nombre del producto es obligatorio")
        .max(100, "El nombre no puede exceder 100 caracteres")
        .optional(),
    qty: z.number()
        .int("La cantidad debe ser un número entero")
        .min(0, "La cantidad no puede ser negativa")
        .max(999999, "La cantidad no puede exceder 999,999")
        .optional(),
    price: z.number()
        .min(0, "El precio no puede ser negativo")
        .max(999999.99, "El precio no puede exceder 999,999.99")
        .optional()
});

const productIdSchema = z.object({
    id: z.string()
        .regex(/^\d+$/, "El ID debe ser un número válido")
        .transform(val => parseInt(val))
});

/**
 * GET /api/products
 * Lista todos los productos (accesible para admin y viewer)
 */
router.get("/", 
    requireProductPermission("read"),
    async (req, res) => {
        try {
            const db = await getDb();
            
            // Obtener todos los productos ordenados por nombre
            const productsResult = await db.query(`
                SELECT id, sku, name, qty, price, created_at, updated_at
                FROM products 
                ORDER BY name ASC
            `);
            
            const products = productsResult.rows;
            
            // Calcular totales
            const totalProducts = products.length;
            const totalValue = products.reduce((sum, product) => sum + (product.qty * product.price), 0);
            const totalQuantity = products.reduce((sum, product) => sum + product.qty, 0);
            
            res.status(200).json({
                products,
                summary: {
                    totalProducts,
                    totalQuantity,
                    totalValue: Math.round(totalValue * 100) / 100
                }
            });
            
        } catch (error) {
            console.error("❌ Error al obtener productos:", error);
            res.status(500).json({
                error: "Error interno del servidor",
                message: "No se pudieron obtener los productos"
            });
        }
    }
);

/**
 * GET /api/products/:id
 * Obtiene un producto específico por ID
 */
router.get("/:id",
    requireProductPermission("read"),
    validateParams(productIdSchema),
    async (req, res) => {
        try {
            const { id } = req.params;
            const db = await getDb();
            
            // Buscar producto por ID
            const productResult = await db.query(
                "SELECT id, sku, name, qty, price, created_at, updated_at FROM products WHERE id = $1",
                [id]
            );
            
            const product = productResult.rows[0];
            
            if (!product) {
                return res.status(404).json({
                    error: "Producto no encontrado",
                    message: `No existe un producto con el ID ${id}`
                });
            }
            
            res.status(200).json({ product });
            
        } catch (error) {
            console.error("❌ Error al obtener producto:", error);
            res.status(500).json({
                error: "Error interno del servidor",
                message: "No se pudo obtener el producto"
            });
        }
    }
);

/**
 * POST /api/products
 * Crea un nuevo producto (solo admin)
 */
router.post("/",
    requireAdmin,
    sanitizeInputs,
    validate(createProductSchema),
    async (req, res) => {
        try {
            const { sku, name, qty, price } = req.body;
            const db = await getDb();
            
            // Verificar si el SKU ya existe
            const existingProductResult = await db.query(
                "SELECT id FROM products WHERE sku = $1",
                [sku]
            );
            
            const existingProduct = existingProductResult.rows[0];
            
            if (existingProduct) {
                return res.status(409).json({
                    error: "SKU duplicado",
                    message: `Ya existe un producto con el SKU '${sku}'`
                });
            }
            
            // Insertar nuevo producto
            const result = await db.query(
                "INSERT INTO products (sku, name, qty, price) VALUES ($1, $2, $3, $4) RETURNING id",
                [sku, name, qty, price]
            );
            
            // Obtener el producto creado
            const newProductResult = await db.query(
                "SELECT id, sku, name, qty, price, created_at, updated_at FROM products WHERE id = $1",
                [result.rows[0].id]
            );
            
            const newProduct = newProductResult.rows[0];
            
            console.log(`✅ Producto creado: ${name} (SKU: ${sku}) por usuario ${req.user.username}`);
            
            res.status(201).json({
                message: "Producto creado correctamente",
                product: newProduct
            });
            
        } catch (error) {
            console.error("❌ Error al crear producto:", error);
            res.status(500).json({
                error: "Error interno del servidor",
                message: "No se pudo crear el producto"
            });
        }
    }
);

/**
 * PUT /api/products/:id
 * Actualiza un producto existente (solo admin)
 */
router.put("/:id",
    requireAdmin,
    sanitizeInputs,
    validateParams(productIdSchema),
    validate(updateProductSchema),
    async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const db = await getDb();
            
            // Verificar si el producto existe
            const existingProductResult = await db.query(
                "SELECT id, sku, name FROM products WHERE id = $1",
                [id]
            );
            
            const existingProduct = existingProductResult.rows[0];
            
            if (!existingProduct) {
                return res.status(404).json({
                    error: "Producto no encontrado",
                    message: `No existe un producto con el ID ${id}`
                });
            }
            
            // Construir query de actualización dinámicamente
            const updateFields = [];
            const updateValues = [];
            let paramCount = 1;
            
            if (updateData.name !== undefined) {
                updateFields.push(`name = $${paramCount++}`);
                updateValues.push(updateData.name);
            }
            
            if (updateData.qty !== undefined) {
                updateFields.push(`qty = $${paramCount++}`);
                updateValues.push(updateData.qty);
            }
            
            if (updateData.price !== undefined) {
                updateFields.push(`price = $${paramCount++}`);
                updateValues.push(updateData.price);
            }
            
            if (updateFields.length === 0) {
                return res.status(400).json({
                    error: "Datos inválidos",
                    message: "Debe proporcionar al menos un campo para actualizar"
                });
            }
            
            // Agregar ID al final de los valores
            updateValues.push(id);
            
            // Ejecutar actualización
            await db.query(
                `UPDATE products SET ${updateFields.join(", ")} WHERE id = $${paramCount}`,
                updateValues
            );
            
            // Obtener el producto actualizado
            const updatedProductResult = await db.query(
                "SELECT id, sku, name, qty, price, created_at, updated_at FROM products WHERE id = $1",
                [id]
            );
            
            const updatedProduct = updatedProductResult.rows[0];
            
            console.log(`✅ Producto actualizado: ${updatedProduct.name} (ID: ${id}) por usuario ${req.user.username}`);
            
            res.status(200).json({
                message: "Producto actualizado correctamente",
                product: updatedProduct
            });
            
        } catch (error) {
            console.error("❌ Error al actualizar producto:", error);
            res.status(500).json({
                error: "Error interno del servidor",
                message: "No se pudo actualizar el producto"
            });
        }
    }
);

/**
 * DELETE /api/products/:id
 * Elimina un producto (solo admin)
 */
router.delete("/:id",
    requireAdmin,
    validateParams(productIdSchema),
    async (req, res) => {
        try {
            const { id } = req.params;
            const db = await getDb();
            
            // Verificar si el producto existe
            const existingProductResult = await db.query(
                "SELECT id, sku, name FROM products WHERE id = $1",
                [id]
            );
            
            const existingProduct = existingProductResult.rows[0];
            
            if (!existingProduct) {
                return res.status(404).json({
                    error: "Producto no encontrado",
                    message: `No existe un producto con el ID ${id}`
                });
            }
            
            // Eliminar el producto
            await db.query("DELETE FROM products WHERE id = $1", [id]);
            
            console.log(`🗑️  Producto eliminado: ${existingProduct.name} (SKU: ${existingProduct.sku}) por usuario ${req.user.username}`);
            
            res.status(204).send();
            
        } catch (error) {
            console.error("❌ Error al eliminar producto:", error);
            res.status(500).json({
                error: "Error interno del servidor",
                message: "No se pudo eliminar el producto"
            });
        }
    }
);

/**
 * GET /api/products/search/:query
 * Busca productos por nombre o SKU (accesible para admin y viewer)
 */
router.get("/search/:query",
    requireProductPermission("read"),
    async (req, res) => {
        try {
            const { query } = req.params;
            const db = await getDb();
            
            // Buscar productos que coincidan con la consulta
            const productsResult = await db.query(`
                SELECT id, sku, name, qty, price, created_at, updated_at
                FROM products 
                WHERE name ILIKE $1 OR sku ILIKE $2
                ORDER BY name ASC
            `, [`%${query}%`, `%${query}%`]);
            
            const products = productsResult.rows;
            
            res.status(200).json({
                products,
                searchQuery: query,
                totalResults: products.length
            });
            
        } catch (error) {
            console.error("❌ Error en búsqueda de productos:", error);
            res.status(500).json({
                error: "Error interno del servidor",
                message: "No se pudo realizar la búsqueda"
            });
        }
    }
);

export default router;
