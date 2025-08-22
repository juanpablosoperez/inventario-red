// API simplificada para diagnóstico
console.log("🔍 Cargando API simplificada...");

// Función de login básica
async function login(username, password) {
    console.log("🔐 Intentando login con:", username);
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        console.log("📊 Respuesta del servidor:", data);
        
        if (response.ok) {
            console.log("✅ Login exitoso!");
            return { success: true, data: data };
        } else {
            console.log("❌ Error en login:", data.error);
            return { success: false, error: data.error || data.message };
        }
        
    } catch (error) {
        console.error("💥 Error de conexión:", error);
        return { success: false, error: "Error de conexión con el servidor" };
    }
}

// Hacer disponible globalmente
window.API = {
    login: login
};

console.log("✅ API simplificada cargada. window.API =", window.API);
