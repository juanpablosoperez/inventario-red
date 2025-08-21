import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from "bcrypt";
import { getDb, closeDb } from "./connection.js";

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Inicializa la base de datos con el esquema y datos de prueba
 */
async function seedDatabase() {
    try {
        console.log("🌱 Iniciando seed de la base de datos...");
        
        // Leer el archivo de esquema
        const schemaPath = join(__dirname, "schema.sql");
        const schema = readFileSync(schemaPath, "utf8");
        
        // Obtener conexión a la base de datos
        const db = await getDb();
        
        // Ejecutar el esquema
        console.log("📋 Ejecutando esquema de la base de datos...");
        await db.exec(schema);
        console.log("✅ Esquema ejecutado correctamente");
        
        // Crear usuarios de prueba
        console.log("👥 Creando usuarios de prueba...");
        
        // Usuario admin
        const adminPassword = "admin123";
        const adminHash = await bcrypt.hash(adminPassword, 12);
        
        await db.run(
            "INSERT OR REPLACE INTO users (username, password_hash, role) VALUES (?, ?, ?)",
            ["admin", adminHash, "admin"]
        );
        
        // Usuario viewer
        const viewerPassword = "viewer123";
        const viewerHash = await bcrypt.hash(viewerPassword, 12);
        
        await db.run(
            "INSERT OR REPLACE INTO users (username, password_hash, role) VALUES (?, ?, ?)",
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
            await db.run(
                "INSERT OR REPLACE INTO products (sku, name, qty, price) VALUES (?, ?, ?, ?)",
                [product.sku, product.name, product.qty, product.price]
            );
        }
        
        console.log("✅ Productos de ejemplo creados correctamente");
        
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
        await closeDb();
    }
}

// Ejecutar el seed si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    seedDatabase();
}
