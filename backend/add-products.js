import sqlite3 from "sqlite3";
import { open } from "sqlite";

console.log("📦 Agregando productos al inventario...");

try {
    const db = await open({
        filename: "src/db/inventario.db",
        driver: sqlite3.Database
    });
    
    // Lista de productos para agregar
    const products = [
        {
            sku: "LAP001",
            name: "Laptop Dell Inspiron 15 3000",
            qty: 15,
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
            name: "Teclado mecánico RGB Logitech G Pro",
            qty: 20,
            price: 149.99
        },
        {
            sku: "MOU004",
            name: "Mouse gaming inalámbrico Logitech G Pro X",
            qty: 30,
            price: 129.99
        },
        {
            sku: "HEA005",
            name: "Auriculares con micrófono HyperX Cloud II",
            qty: 18,
            price: 89.99
        },
        {
            sku: "WEB006",
            name: "Webcam Logitech C920 HD Pro",
            qty: 12,
            price: 79.99
        },
        {
            sku: "MIC007",
            name: "Micrófono Blue Yeti USB",
            qty: 8,
            price: 129.99
        },
        {
            sku: "TAB008",
            name: "Tableta gráfica Wacom Intuos",
            qty: 10,
            price: 199.99
        },
        {
            sku: "SPK009",
            name: "Altavoces Logitech Z623 2.1",
            qty: 15,
            price: 119.99
        },
        {
            sku: "NET010",
            name: "Switch de red TP-Link 8 puertos",
            qty: 5,
            price: 39.99
        },
        {
            sku: "ROU011",
            name: "Router WiFi TP-Link Archer C7",
            qty: 7,
            price: 89.99
        },
        {
            sku: "CAB012",
            name: "Cable HDMI 2.0 2 metros",
            qty: 50,
            price: 12.99
        },
        {
            sku: "USB013",
            name: "Memoria USB Kingston 32GB",
            qty: 40,
            price: 19.99
        },
        {
            sku: "SSD014",
            name: "Disco SSD Samsung 500GB 870 EVO",
            qty: 12,
            price: 79.99
        },
        {
            sku: "RAM015",
            name: "Memoria RAM DDR4 16GB Corsair",
            qty: 15,
            price: 89.99
        }
    ];
    
    console.log(`📋 Insertando ${products.length} productos...`);
    
    for (const product of products) {
        await db.run(
            "INSERT OR REPLACE INTO products (sku, name, qty, price) VALUES (?, ?, ?, ?)",
            [product.sku, product.name, product.qty, product.price]
        );
        console.log(`   ✅ ${product.sku}: ${product.name}`);
    }
    
    // Verificar el total de productos
    const totalProducts = await db.get("SELECT COUNT(*) as count FROM products");
    console.log(`\n📊 Total de productos en inventario: ${totalProducts.count}`);
    
    // Mostrar algunos productos para verificar
    const sampleProducts = await db.all("SELECT sku, name, qty, price FROM products LIMIT 5");
    console.log("\n🔍 Primeros 5 productos:");
    sampleProducts.forEach(product => {
        console.log(`   - ${product.sku}: ${product.name} (${product.qty} unidades, $${product.price})`);
    });
    
    await db.close();
    console.log("\n🎉 Productos agregados exitosamente!");
    
} catch (error) {
    console.error("❌ Error al agregar productos:", error);
    process.exit(1);
}
