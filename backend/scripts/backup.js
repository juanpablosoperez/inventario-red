#!/usr/bin/env node

/**
 * Script de backup automático para PostgreSQL
 * Sistema de Inventario - TP Integrador de Redes y Comunicación
 */

import { exec } from "child_process";
import { promisify } from "util";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

const execAsync = promisify(exec);

// Cargar variables de entorno
dotenv.config();

// Configuración de backup
const BACKUP_CONFIG = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "inventario_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres123",
    backupDir: process.env.BACKUP_DIR || "./backups",
    maxBackups: parseInt(process.env.MAX_BACKUPS) || 10,
    compress: process.env.COMPRESS_BACKUP !== "false"
};

/**
 * Crear directorio de backup si no existe
 */
function ensureBackupDir() {
    if (!existsSync(BACKUP_CONFIG.backupDir)) {
        mkdirSync(BACKUP_CONFIG.backupDir, { recursive: true });
        console.log(`✅ Directorio de backup creado: ${BACKUP_CONFIG.backupDir}`);
    }
}

/**
 * Generar nombre de archivo de backup
 */
function generateBackupFilename() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const extension = BACKUP_CONFIG.compress ? "sql.gz" : "sql";
    return `inventario_backup_${timestamp}.${extension}`;
}

/**
 * Ejecutar backup de PostgreSQL
 */
async function performBackup() {
    const filename = generateBackupFilename();
    const filepath = join(BACKUP_CONFIG.backupDir, filename);
    
    // Configurar variables de entorno para pg_dump
    const env = {
        ...process.env,
        PGPASSWORD: BACKUP_CONFIG.password
    };
    
    // Comando de backup
    let command;
    if (BACKUP_CONFIG.compress) {
        command = `pg_dump -h ${BACKUP_CONFIG.host} -p ${BACKUP_CONFIG.port} -U ${BACKUP_CONFIG.user} -d ${BACKUP_CONFIG.database} | gzip > "${filepath}"`;
    } else {
        command = `pg_dump -h ${BACKUP_CONFIG.host} -p ${BACKUP_CONFIG.port} -U ${BACKUP_CONFIG.user} -d ${BACKUP_CONFIG.database} > "${filepath}"`;
    }
    
    try {
        console.log(`🔄 Iniciando backup: ${filename}`);
        const startTime = Date.now();
        
        await execAsync(command, { env });
        
        const duration = Date.now() - startTime;
        console.log(`✅ Backup completado en ${duration}ms: ${filepath}`);
        
        return filepath;
    } catch (error) {
        console.error(`❌ Error en backup: ${error.message}`);
        throw error;
    }
}

/**
 * Limpiar backups antiguos
 */
async function cleanupOldBackups() {
    try {
        const { stdout } = await execAsync(`ls -t "${BACKUP_CONFIG.backupDir}"/*.sql* 2>/dev/null | tail -n +${BACKUP_CONFIG.maxBackups + 1}`);
        
        if (stdout.trim()) {
            const filesToDelete = stdout.trim().split('\n');
            console.log(`🗑️  Eliminando ${filesToDelete.length} backups antiguos...`);
            
            for (const file of filesToDelete) {
                await execAsync(`rm "${file}"`);
                console.log(`   Eliminado: ${file}`);
            }
        }
    } catch (error) {
        // No hay archivos para eliminar o error al listar
        console.log("ℹ️  No hay backups antiguos para eliminar");
    }
}

/**
 * Verificar integridad del backup
 */
async function verifyBackup(filepath) {
    try {
        if (BACKUP_CONFIG.compress) {
            // Verificar archivo comprimido
            await execAsync(`gunzip -t "${filepath}"`);
        } else {
            // Verificar archivo SQL
            await execAsync(`head -n 1 "${filepath}" | grep -q "PostgreSQL database dump"`);
        }
        
        console.log(`✅ Backup verificado: ${filepath}`);
        return true;
    } catch (error) {
        console.error(`❌ Backup corrupto: ${filepath}`);
        return false;
    }
}

/**
 * Función principal de backup
 */
async function main() {
    try {
        console.log("🚀 Iniciando proceso de backup automático...");
        console.log("=============================================");
        
        // Verificar configuración
        console.log("📋 Configuración de backup:");
        console.log(`   Host: ${BACKUP_CONFIG.host}:${BACKUP_CONFIG.port}`);
        console.log(`   Base de datos: ${BACKUP_CONFIG.database}`);
        console.log(`   Usuario: ${BACKUP_CONFIG.user}`);
        console.log(`   Directorio: ${BACKUP_CONFIG.backupDir}`);
        console.log(`   Máximo backups: ${BACKUP_CONFIG.maxBackups}`);
        console.log(`   Comprimir: ${BACKUP_CONFIG.compress ? "Sí" : "No"}`);
        console.log("");
        
        // Crear directorio de backup
        ensureBackupDir();
        
        // Ejecutar backup
        const backupFile = await performBackup();
        
        // Verificar integridad
        const isValid = await verifyBackup(backupFile);
        
        if (isValid) {
            // Limpiar backups antiguos
            await cleanupOldBackups();
            
            // Mostrar resumen
            const { stdout } = await execAsync(`ls -la "${BACKUP_CONFIG.backupDir}"/*.sql* 2>/dev/null | wc -l`);
            const totalBackups = parseInt(stdout.trim()) || 0;
            
            console.log("");
            console.log("📊 Resumen del backup:");
            console.log(`   ✅ Backup creado: ${backupFile}`);
            console.log(`   📁 Total de backups: ${totalBackups}`);
            console.log(`   🗑️  Máximo permitido: ${BACKUP_CONFIG.maxBackups}`);
            console.log("");
            console.log("🎉 Proceso de backup completado exitosamente!");
        } else {
            console.error("❌ Backup falló la verificación de integridad");
            process.exit(1);
        }
        
    } catch (error) {
        console.error("❌ Error fatal en el proceso de backup:", error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { performBackup, cleanupOldBackups, verifyBackup };
