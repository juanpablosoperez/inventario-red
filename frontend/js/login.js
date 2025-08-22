// Lógica de la página de login
console.log("🔐 Cargando lógica de login...");

// Función para verificar el estado del servidor
function checkServerHealth() {
    fetch("/api/health")
        .then(response => {
            if (response.ok) {
                document.getElementById("serverStatus").textContent = "🟢 Conectado";
                document.getElementById("serverStatus").className = "status-connected";
            } else {
                document.getElementById("serverStatus").textContent = "🔴 Error";
                document.getElementById("serverStatus").className = "status-error";
            }
        })
        .catch(error => {
            document.getElementById("serverStatus").textContent = "🔴 Sin conexión";
            document.getElementById("serverStatus").className = "status-error";
            console.error("Error al conectar con el servidor:", error);
        });
}

// Función para configurar el formulario de login
function setupLoginForm() {
    const form = document.getElementById("loginForm");
    const errorMessage = document.getElementById("errorMessage");

    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        console.log("📝 Formulario enviado");
        
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        
        // Validación básica del lado del cliente
        if (!username || !password) {
            showError("Por favor complete todos los campos");
            return;
        }

        // Mostrar estado de carga
        setLoadingState(true);
        hideError();

        try {
            console.log("🔐 Intentando login con:", username);
            const response = await window.API.login(username, password);
            console.log("📊 Respuesta del login:", response);
            
            if (response.success) {
                console.log("✅ Login exitoso!");
                // Redirigir al inventario
                window.location.href = "inventario.html";
            } else {
                showError(response.error || "Error al iniciar sesión");
            }
        } catch (error) {
            console.error("💥 Error en el login:", error);
            showError("Error de conexión con el servidor");
        } finally {
            setLoadingState(false);
        }
    });
}

// Función para mostrar/ocultar estado de carga
function setLoadingState(loading) {
    const btnText = document.querySelector(".btn-text");
    const btnLoading = document.querySelector(".btn-loading");
    const btn = document.querySelector(".btn-login");

    if (loading) {
        btnText.style.display = "none";
        btnLoading.style.display = "flex";
        btn.disabled = true;
    } else {
        btnText.style.display = "block";
        btnLoading.style.display = "none";
        btn.disabled = false;
    }
}

// Función para mostrar errores
function showError(message) {
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    
    // Ocultar error después de 5 segundos
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Función para ocultar errores
function hideError() {
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.style.display = "none";
}

// Inicialización cuando se carga la página
document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Página de login cargada");
    
    // Verificar estado del servidor
    checkServerHealth();
    
    // Configurar formulario de login
    setupLoginForm();
});

console.log("✅ Lógica de login cargada");
