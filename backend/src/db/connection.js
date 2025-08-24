import pg from "pg";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Configuración de la base de datos PostgreSQL
const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "inventario_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    max: 20, // máximo de conexiones en el pool
    idleTimeoutMillis: 30000, // tiempo de inactividad antes de cerrar conexión
    connectionTimeoutMillis: 2000, // tiempo máximo para establecer conexión
};

// Crear pool de conexiones
const pool = new pg.Pool(dbConfig);

// Variable global para la conexión
let client = null;

/**
 * Obtiene una conexión del pool de la base de datos
 * @returns {Promise<Object>} Cliente de la base de datos
 */
export async function getDb() {
    if (!client) {
        try {
            client = await pool.connect();
            console.log(`✅ Base de datos PostgreSQL conectada: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
        } catch (error) {
            console.error("❌ Error al conectar con la base de datos:", error);
            throw error;
        }
    }
    return client;
}

/**
 * Obtiene una nueva conexión del pool (para operaciones independientes)
 * @returns {Promise<Object>} Cliente de la base de datos
 */
export async function getPoolClient() {
    try {
        const client = await pool.connect();
        return client;
    } catch (error) {
        console.error("❌ Error al obtener cliente del pool:", error);
        throw error;
    }
}

/**
 * Cierra la conexión actual a la base de datos
 */
export async function closeDb() {
    if (client) {
        client.release();
        client = null;
        console.log("🔒 Conexión a la base de datos cerrada");
    }
}

/**
 * Cierra el pool de conexiones
 */
export async function closePool() {
    await pool.end();
    console.log("🔒 Pool de conexiones cerrado");
}

/**
 * Ejecuta una consulta SQL con parámetros
 * @param {string} sql - Consulta SQL
 * @param {Array} params - Parámetros de la consulta
 * @returns {Promise<Array>} Resultado de la consulta
 */
export async function executeQuery(sql, params = []) {
    const database = await getDb();
    try {
        const result = await database.query(sql, params);
        return result.rows;
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
        const result = await database.query(sql, params);
        return result;
    } catch (error) {
        console.error("❌ Error en actualización SQL:", error);
        throw error;
    }
}

/**
 * Ejecuta una transacción
 * @param {Function} callback - Función que contiene las operaciones de la transacción
 * @returns {Promise<any>} Resultado de la transacción
 */
export async function executeTransaction(callback) {
    const client = await getPoolClient();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Manejar cierre graceful del proceso
process.on("SIGINT", async () => {
    console.log("\n🔄 Cerrando conexiones...");
    await closeDb();
    await closePool();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("\n🔄 Cerrando conexiones...");
    await closeDb();
    await closePool();
    process.exit(0);
});

// Manejar errores del pool
pool.on('error', (err) => {
    console.error('❌ Error inesperado del pool de PostgreSQL:', err);
    process.exit(-1);
});

export { pool };
