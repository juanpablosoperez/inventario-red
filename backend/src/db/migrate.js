import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { pool } from './connection.js';

// Cargar variables de entorno
dotenv.config();

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Ejecuta la migración de la base de datos PostgreSQL
 */
async function migrateDatabase() {
    let client;
    
    try {
        console.log('🚀 Iniciando migración a PostgreSQL...');
        
        // Conectar al pool
        client = await pool.connect();
        console.log('✅ Conectado a PostgreSQL');
        
        // Leer el archivo de esquema
        const schemaPath = join(__dirname, 'schema.sql');
        const schema = readFileSync(schemaPath, 'utf8');
        
        // Ejecutar el esquema
        console.log('📋 Ejecutando esquema de la base de datos...');
        await client.query(schema);
        console.log('✅ Esquema ejecutado correctamente');
        
        // Verificar que las tablas se crearon
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'products')
            ORDER BY table_name
        `);
        
        console.log('📊 Tablas creadas:', tablesResult.rows.map(row => row.table_name));
        
        console.log('\n🎉 Migración completada exitosamente!');
        console.log('📝 Ahora puedes ejecutar: npm run seed');
        
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
    }
}

// Ejecutar la migración
migrateDatabase();
