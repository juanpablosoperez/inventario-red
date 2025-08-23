/**
 * Cliente de API para el Sistema de Inventario
 * Sistema de inventario - TP Integrador de Redes y Comunicación
 */

// Hacer las funciones disponibles globalmente
console.log("🔧 Inicializando window.API...");
window.API = {};
console.log("✅ window.API inicializado:", window.API);

// Configuración de la API
const API_BASE_URL = "/api";
const API_ENDPOINTS = {
    // Autenticación
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
    STATUS: `${API_BASE_URL}/auth/status`,
    
    // Productos
    PRODUCTS: `${API_BASE_URL}/products`,
    PRODUCT_SEARCH: `${API_BASE_URL}/products/search`,
    
    // Sistema
    HEALTH: `${API_BASE_URL}/health`,
    INFO: `${API_BASE_URL}/info`
};

/**
 * Configuración por defecto para las peticiones fetch
 */
const DEFAULT_FETCH_OPTIONS = {
    credentials: "same-origin", // Incluir cookies de sesión
    headers: {
        "Content-Type": "application/json"
    }
};

/**
 * Función helper para realizar peticiones HTTP
 * @param {string} url - URL de la petición
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<Object>} Respuesta parseada
 */
async function apiRequest(url, options = {}) {
    try {
        const fetchOptions = {
            ...DEFAULT_FETCH_OPTIONS,
            ...options
        };

        const response = await fetch(url, fetchOptions);
        
        // Manejar diferentes códigos de estado HTTP
        if (response.status === 401) {
            // No autorizado - redirigir al login
            window.location.href = "index.html";
            throw new Error("No autorizado");
        }
        
        if (response.status === 403) {
            // Acceso denegado
            throw new Error("Acceso denegado - No tiene permisos para esta acción");
        }
        
        if (response.status === 404) {
            throw new Error("Recurso no encontrado");
        }
        
        if (response.status === 409) {
            throw new Error("Conflicto - El recurso ya existe");
        }
        
        if (response.status >= 500) {
            throw new Error("Error interno del servidor");
        }
        
        // Para respuestas exitosas o errores 4xx
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || data.error || "Error en la petición");
        }
        
        return {
            success: true,
            data: data,
            status: response.status
        };
        
    } catch (error) {
        console.error("Error en API request:", error);
        
        // Si es un error de red, no redirigir
        if (error.name === "TypeError" && error.message.includes("fetch")) {
            return {
                success: false,
                error: "Error de conexión con el servidor",
                details: error.message
            };
        }
        
        return {
            success: false,
            error: error.message || "Error desconocido",
            details: error.toString()
        };
    }
}

// ============================================================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================================================

/**
 * Inicia sesión del usuario
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function login(username, password) {
    const response = await apiRequest(API_ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify({ username, password })
    });
    
    if (response.success) {
        // Almacenar información del usuario en sessionStorage para uso local
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
    }
    
    return response;
}

// Hacer disponible globalmente
window.API.login = login;
console.log("🔐 Función login asignada a window.API");

/**
 * Cierra la sesión del usuario
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function logout() {
    const response = await apiRequest(API_ENDPOINTS.LOGOUT, {
        method: "POST"
    });
    
    if (response.success) {
        // Limpiar datos locales
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("products");
    }
    
    return response;
}

// Hacer disponible globalmente
window.API.logout = logout;

/**
 * Obtiene información del usuario autenticado
 * @returns {Promise<Object>} Información del usuario
 */
async function getCurrentUser() {
    const response = await apiRequest(API_ENDPOINTS.ME, {
        method: "GET"
    });
    
    if (response.success) {
        // Actualizar información local
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
    }
    
    return response;
}

// Hacer disponible globalmente
window.API.getCurrentUser = getCurrentUser;

/**
 * Verifica el estado de autenticación
 * @returns {Promise<Object>} Estado de autenticación
 */
async function getAuthStatus() {
    return await apiRequest(API_ENDPOINTS.STATUS, {
        method: "GET"
    });
}

// Hacer disponible globalmente
window.API.getAuthStatus = getAuthStatus;

// ============================================================================
// FUNCIONES DE PRODUCTOS
// ============================================================================

/**
 * Obtiene todos los productos
 * @returns {Promise<Object>} Lista de productos
 */
async function getProducts() {
    const response = await apiRequest(API_ENDPOINTS.PRODUCTS, {
        method: "GET"
    });
    
    if (response.success) {
        // Cachear productos localmente
        sessionStorage.setItem("products", JSON.stringify(response.data.products));
    }
    
    return response;
}

// Hacer disponible globalmente
window.API.getProducts = getProducts;

/**
 * Obtiene un producto específico por ID
 * @param {number} id - ID del producto
 * @returns {Promise<Object>} Producto
 */
async function getProduct(id) {
    return await apiRequest(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
        method: "GET"
    });
}

// Hacer disponible globalmente
window.API.getProduct = getProduct;

/**
 * Crea un nuevo producto
 * @param {Object} productData - Datos del producto
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function createProduct(productData) {
    const response = await apiRequest(API_ENDPOINTS.PRODUCTS, {
        method: "POST",
        body: JSON.stringify(productData)
    });
    
    if (response.success) {
        // Limpiar cache de productos para forzar recarga
        sessionStorage.removeItem("products");
    }
    
    return response;
}

// Hacer disponible globalmente
window.API.createProduct = createProduct;

/**
 * Actualiza un producto existente
 * @param {number} id - ID del producto
 * @param {Object} productData - Datos a actualizar
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function updateProduct(id, productData) {
    const response = await apiRequest(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData)
    });
    
    if (response.success) {
        // Limpiar cache de productos para forzar recarga
        sessionStorage.removeItem("products");
    }
    
    return response;
}

// Hacer disponible globalmente
window.API.updateProduct = updateProduct;

/**
 * Elimina un producto
 * @param {number} id - ID del producto
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function deleteProduct(id) {
    const response = await apiRequest(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
        method: "DELETE"
    });
    
    if (response.success) {
        // Limpiar cache de productos para forzar recarga
        sessionStorage.removeItem("products");
    }
    
    return response;
}

// Hacer disponible globalmente
window.API.deleteProduct = deleteProduct;

/**
 * Busca productos por nombre o SKU
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Object>} Resultados de búsqueda
 */
async function searchProductsAPI(query) {
    return await apiRequest(`${API_ENDPOINTS.PRODUCT_SEARCH}/${encodeURIComponent(query)}`, {
        method: "GET"
    });
}

// Hacer disponible globalmente
window.API.searchProductsAPI = searchProductsAPI;

// ============================================================================
// FUNCIONES DEL SISTEMA
// ============================================================================

/**
 * Verifica la salud del servidor
 * @returns {Promise<Object>} Estado del servidor
 */
async function checkServerHealth() {
    return await apiRequest(API_ENDPOINTS.HEALTH, {
        method: "GET"
    });
}

// Hacer disponible globalmente
window.API.checkServerHealth = checkServerHealth;

/**
 * Obtiene información del sistema
 * @returns {Promise<Object>} Información del sistema
 */
async function getSystemInfo() {
    return await apiRequest(API_ENDPOINTS.INFO, {
        method: "GET"
    });
}

// Hacer disponible globalmente
window.API.getSystemInfo = getSystemInfo;

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} Estado de autenticación
 */
function isAuthenticated() {
    const user = sessionStorage.getItem("user");
    return user !== null;
}

// Hacer disponible globalmente
window.API.isAuthenticated = isAuthenticated;

/**
 * Obtiene el usuario actual desde el cache local
 * @returns {Object|null} Usuario actual o null
 */
function getCurrentUserLocal() {
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}

// Hacer disponible globalmente
window.API.getCurrentUserLocal = getCurrentUserLocal;

/**
 * Obtiene productos desde el cache local
 * @returns {Array|null} Lista de productos o null
 */
function getProductsLocal() {
    const products = sessionStorage.getItem("products");
    return products ? JSON.parse(products) : null;
}

// Hacer disponible globalmente
window.API.getProductsLocal = getProductsLocal;

/**
 * Limpia el cache local
 */
function clearLocalCache() {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("products");
}

// Hacer disponible globalmente
window.API.clearLocalCache = clearLocalCache;

/**
 * Maneja errores de red de manera consistente
 * @param {Error} error - Error capturado
 * @returns {Object} Error formateado
 */
function handleNetworkError(error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
        return {
            success: false,
            error: "Error de conexión",
            message: "No se pudo conectar con el servidor. Verifique su conexión a internet."
        };
    }
    
    return {
        success: false,
        error: "Error desconocido",
        message: error.message || "Ocurrió un error inesperado"
    };
}

// Hacer disponible globalmente
window.API.handleNetworkError = handleNetworkError;

/**
 * Configura interceptores para manejar errores globalmente
 */
function setupApiInterceptors() {
    // Interceptor para peticiones fallidas
    window.addEventListener("unhandledrejection", function(event) {
        console.error("Promesa rechazada no manejada:", event.reason);
        
        // Si es un error de API, manejarlo
        if (event.reason && event.reason.error) {
            console.error("Error de API:", event.reason.error);
        }
        
        // Prevenir el comportamiento por defecto
        event.preventDefault();
    });
}

// Inicializar interceptores cuando se carga el módulo
setupApiInterceptors();

// Hacer disponible globalmente
window.API.setupApiInterceptors = setupApiInterceptors;

// Log final de confirmación
console.log("🎯 API completamente cargada. Funciones disponibles:", Object.keys(window.API));
