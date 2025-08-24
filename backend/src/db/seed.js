import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from "bcrypt";
import { pool } from "./connection.js";

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Inicializa la base de datos con datos de prueba
 */
async function seedDatabase() {
    let client;
    
    try {
        console.log("🌱 Iniciando seed de la base de datos PostgreSQL...");
        
        // Obtener conexión del pool
        client = await pool.connect();
        console.log("✅ Conectado a PostgreSQL");
        
        // Verificar que las tablas existen
        const tablesCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'products')
        `);
        
        if (tablesCheck.rows.length < 2) {
            console.error("❌ Las tablas no existen. Ejecuta primero: npm run migrate");
            process.exit(1);
        }
        
        // Crear usuarios de prueba
        console.log("👥 Creando usuarios de prueba...");
        
        // Usuario admin
        const adminPassword = "admin123";
        const adminHash = await bcrypt.hash(adminPassword, 12);
        
        await client.query(
            "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role",
            ["admin", adminHash, "admin"]
        );
        
        // Usuario viewer
        const viewerPassword = "viewer123";
        const viewerHash = await bcrypt.hash(viewerPassword, 12);
        
        await client.query(
            "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role",
            ["viewer", viewerHash, "viewer"]
        );
        
        // Crear algunos productos de ejemplo
        console.log("📦 Creando productos de ejemplo...");
        
        const sampleProducts = [
            {
                sku: "LAP001",
                name: "Laptop Dell Inspiron 15",
                qty: 10,
                price: 899.99
            },
            {
                sku: "MON002",
                name: "Monitor Samsung 24\" Full HD",
                qty: 25,
                price: 199.99
            },
            {
                sku: "TEC003",
                name: "Teclado mecánico RGB",
                qty: 15,
                price: 89.99
            },
            {
                sku: "MOU004",
                name: "Mouse gaming inalámbrico",
                qty: 30,
                price: 59.99
            },
            {
                sku: "HEA005",
                name: "Auriculares con micrófono",
                qty: 20,
                price: 79.99
            }
        ];
        
        for (const product of sampleProducts) {
            await client.query(
                "INSERT INTO products (sku, name, qty, price) VALUES ($1, $2, $3, $4) ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, qty = EXCLUDED.qty, price = EXCLUDED.price",
                [product.sku, product.name, product.qty, product.price]
            );
        }
        
        console.log("✅ Productos de ejemplo creados correctamente");
        
        // Verificar datos insertados
        const usersCount = await client.query("SELECT COUNT(*) as count FROM users");
        const productsCount = await client.query("SELECT COUNT(*) as count FROM products");
        
        console.log(`📊 Usuarios en la base de datos: ${usersCount.rows[0].count}`);
        console.log(`📊 Productos en la base de datos: ${productsCount.rows[0].count}`);
        
        // Mostrar credenciales creadas
        console.log("\n🔐 CREDENCIALES DE ACCESO:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("👑 ADMIN:");
        console.log(`   Usuario: admin`);
        console.log(`   Contraseña: ${adminPassword}`);
        console.log(`   Rol: admin (acceso completo)`);
        console.log("");
        console.log("👁️  VIEWER:");
        console.log(`   Usuario: viewer`);
        console.log(`   Contraseña: ${viewerPassword}`);
        console.log(`   Rol: viewer (solo lectura)`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("");
        console.log("📊 PRODUCTOS CREADOS:", sampleProducts.length);
        console.log("🌐 Servidor listo para ejecutar con: npm run dev");
        console.log("");
        
    } catch (error) {
        console.error("❌ Error durante el seed:", error);
        process.exit(1);
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
    }
}

// Ejecutar el seed si se llama directamente
seedDatabase();
