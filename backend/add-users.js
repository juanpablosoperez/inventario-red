import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";

console.log("👥 Agregando usuarios al sistema...");

try {
    const db = await open({
        filename: "src/db/inventario.db",
        driver: sqlite3.Database
    });
    
    // Lista de usuarios para agregar
    const users = [
        {
            username: "admin",
            password: "admin123",
            role: "admin"
        },
        {
            username: "viewer",
            password: "viewer123",
            role: "viewer"
        },
        {
            username: "manager",
            password: "manager123",
            role: "admin"
        },
        {
            username: "analyst",
            password: "analyst123",
            role: "viewer"
        },
        {
            username: "supervisor",
            password: "super123",
            role: "admin"
        },
        {
            username: "operator",
            password: "oper123",
            role: "viewer"
        },
        {
            username: "auditor",
            password: "audit123",
            role: "viewer"
        },
        {
            username: "coordinator",
            password: "coord123",
            role: "admin"
        }
    ];
    
    console.log(`📋 Insertando ${users.length} usuarios...`);
    
    for (const user of users) {
        // Encriptar la contraseña
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(user.password, saltRounds);
        
        await db.run(
            "INSERT OR REPLACE INTO users (username, password_hash, role) VALUES (?, ?, ?)",
            [user.username, passwordHash, user.role]
        );
        
        console.log(`   ✅ ${user.username} (${user.role}) - Contraseña: ${user.password}`);
    }
    
    // Verificar el total de usuarios
    const totalUsers = await db.get("SELECT COUNT(*) as count FROM users");
    console.log(`\n📊 Total de usuarios en el sistema: ${totalUsers.count}`);
    
    // Mostrar usuarios por rol
    const adminUsers = await db.all("SELECT username, role FROM users WHERE role = 'admin'");
    const viewerUsers = await db.all("SELECT username, role FROM users WHERE role = 'viewer'");
    
    console.log("\n👑 Usuarios ADMIN:");
    adminUsers.forEach(user => {
        console.log(`   - ${user.username}`);
    });
    
    console.log("\n👁️ Usuarios VIEWER:");
    viewerUsers.forEach(user => {
        console.log(`   - ${user.username}`);
    });
    
    await db.close();
    console.log("\n🎉 Usuarios agregados exitosamente!");
    console.log("\n🔐 CREDENCIALES DE ACCESO:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👑 ADMINISTRADORES (acceso completo):");
    console.log("   - admin / admin123");
    console.log("   - manager / manager123");
    console.log("   - supervisor / super123");
    console.log("   - coordinator / coord123");
    console.log("");
    console.log("👁️ VISUALIZADORES (solo lectura):");
    console.log("   - viewer / viewer123");
    console.log("   - analyst / analyst123");
    console.log("   - operator / oper123");
    console.log("   - auditor / audit123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
} catch (error) {
    console.error("❌ Error al agregar usuarios:", error);
    process.exit(1);
}
