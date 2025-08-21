import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta de la base de datos
const DB_PATH = process.env.DB_PATH || join(__dirname, "inventario.db");

// Variable global para la conexión
let db = null;

/**
 * Obtiene la conexión a la base de datos
 * @returns {Promise<Object>} Instancia de la base de datos
 */
export async function getDb() {
    if (!db) {
        try {
            db = await open({
                filename: DB_PATH,
                driver: sqlite3.Database
            });
            
            // Habilitar foreign keys y configuraciones de seguridad
            await db.exec("PRAGMA foreign_keys = ON");
            await db.exec("PRAGMA journal_mode = WAL");
            await db.exec("PRAGMA synchronous = NORMAL");
            
            console.log(`✅ Base de datos conectada: ${DB_PATH}`);
        } catch (error) {
            console.error("❌ Error al conectar con la base de datos:", error);
            throw error;
        }
    }
    return db;
}

/**
 * Cierra la conexión a la base de datos
 */
export async function closeDb() {
    if (db) {
        await db.close();
        db = null;
        console.log("🔒 Conexión a la base de datos cerrada");
    }
}

/**
 * Ejecuta una consulta SQL con parámetros
 * @param {string} sql - Consulta SQL
 * @param {Array} params - Parámetros de la consulta
 * @returns {Promise<Object>} Resultado de la consulta
 */
export async function executeQuery(sql, params = []) {
    const database = await getDb();
    try {
        return await database.all(sql, params);
    } catch (error) {
        console.error("❌ Error en consulta SQL:", error);
        throw error;
    }
}

/**
 * Ejecuta una consulta SQL que modifica datos
 * @param {string} sql - Consulta SQL
 * @param {Array} params - Parámetros de la consulta
 * @returns {Promise<Object>} Resultado de la consulta
 */
export async function executeUpdate(sql, params = []) {
    const database = await getDb();
    try {
        const result = await database.run(sql, params);
        return result;
    } catch (error) {
        console.error("❌ Error en actualización SQL:", error);
        throw error;
    }
}

// Manejar cierre graceful del proceso
process.on("SIGINT", async () => {
    console.log("\n🔄 Cerrando conexiones...");
    await closeDb();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("\n🔄 Cerrando conexiones...");
    await closeDb();
    process.exit(0);
});
