/**
 * Lógica de Interfaz de Usuario para el Sistema de Inventario
 * Sistema de inventario - TP Integrador de Redes y Comunicación
 */

// ============================================================================
// FUNCIONES DE VALIDACIÓN DEL CLIENTE
// ============================================================================

/**
 * Valida el formato del SKU
 * @param {string} sku - SKU a validar
 * @returns {Object} Resultado de la validación
 */
export function validateSKU(sku) {
    if (!sku || sku.trim() === "") {
        return { valid: false, error: "El SKU es obligatorio" };
    }
    
    if (sku.length > 20) {
        return { valid: false, error: "El SKU no puede exceder 20 caracteres" };
    }
    
    if (!/^[A-Z0-9]+$/.test(sku)) {
        return { valid: false, error: "El SKU solo puede contener letras mayúsculas y números" };
    }
    
    return { valid: true };
}

/**
 * Valida el nombre del producto
 * @param {string} name - Nombre a validar
 * @returns {Object} Resultado de la validación
 */
export function validateProductName(name) {
    if (!name || name.trim() === "") {
        return { valid: false, error: "El nombre del producto es obligatorio" };
    }
    
    if (name.length > 100) {
        return { valid: false, error: "El nombre no puede exceder 100 caracteres" };
    }
    
    return { valid: true };
}

/**
 * Valida la cantidad del producto
 * @param {number} qty - Cantidad a validar
 * @returns {Object} Resultado de la validación
 */
export function validateQuantity(qty) {
    if (qty === null || qty === undefined || isNaN(qty)) {
        return { valid: false, error: "La cantidad debe ser un número válido" };
    }
    
    if (!Number.isInteger(qty)) {
        return { valid: false, error: "La cantidad debe ser un número entero" };
    }
    
    if (qty < 0) {
        return { valid: false, error: "La cantidad no puede ser negativa" };
    }
    
    if (qty > 999999) {
        return { valid: false, error: "La cantidad no puede exceder 999,999" };
    }
    
    return { valid: true };
}

/**
 * Valida el precio del producto
 * @param {number} price - Precio a validar
 * @returns {Object} Resultado de la validación
 */
export function validatePrice(price) {
    if (price === null || price === undefined || isNaN(price)) {
        return { valid: false, error: "El precio debe ser un número válido" };
    }
    
    if (price < 0) {
        return { valid: false, error: "El precio no puede ser negativo" };
    }
    
    if (price > 999999.99) {
        return { valid: false, error: "El precio no puede exceder 999,999.99" };
    }
    
    return { valid: true };
}

/**
 * Valida todos los campos de un producto
 * @param {Object} productData - Datos del producto a validar
 * @returns {Object} Resultado de la validación
 */
export function validateProductData(productData) {
    const errors = [];
    
    // Validar SKU
    const skuValidation = validateSKU(productData.sku);
    if (!skuValidation.valid) {
        errors.push(skuValidation.error);
    }
    
    // Validar nombre
    const nameValidation = validateProductName(productData.name);
    if (!nameValidation.valid) {
        errors.push(nameValidation.error);
    }
    
    // Validar cantidad
    const qtyValidation = validateQuantity(productData.qty);
    if (!qtyValidation.valid) {
        errors.push(qtyValidation.error);
    }
    
    // Validar precio
    const priceValidation = validatePrice(productData.price);
    if (!priceValidation.valid) {
        errors.push(priceValidation.error);
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// ============================================================================
// FUNCIONES DE FORMATEO Y PRESENTACIÓN
// ============================================================================

/**
 * Formatea un precio para mostrar
 * @param {number} price - Precio a formatear
 * @param {string} currency - Moneda (por defecto USD)
 * @returns {string} Precio formateado
 */
export function formatPrice(price, currency = "USD") {
    if (price === null || price === undefined || isNaN(price)) {
        return "N/A";
    }
    
    const formatter = new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    return formatter.format(price);
}

/**
 * Formatea una fecha para mostrar
 * @param {string|Date} date - Fecha a formatear
 * @param {string} locale - Locale para el formateo
 * @returns {string} Fecha formateada
 */
export function formatDate(date, locale = "es-ES") {
    if (!date) {
        return "N/A";
    }
    
    try {
        const dateObj = new Date(date);
        
        if (isNaN(dateObj.getTime())) {
            return "Fecha inválida";
        }
        
        return dateObj.toLocaleDateString(locale, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    } catch (error) {
        console.error("Error al formatear fecha:", error);
        return "Error de fecha";
    }
}

/**
 * Formatea un número para mostrar
 * @param {number} number - Número a formatear
 * @param {number} decimals - Decimales a mostrar
 * @returns {string} Número formateado
 */
export function formatNumber(number, decimals = 0) {
    if (number === null || number === undefined || isNaN(number)) {
        return "N/A";
    }
    
    const formatter = new Intl.NumberFormat("es-ES", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
    
    return formatter.format(number);
}

/**
 * Formatea un SKU para mostrar
 * @param {string} sku - SKU a formatear
 * @returns {string} SKU formateado
 */
export function formatSKU(sku) {
    if (!sku) {
        return "N/A";
    }
    
    // Agregar espacios cada 3 caracteres para mejor legibilidad
    return sku.replace(/(.{3})/g, "$1 ").trim();
}

// ============================================================================
// FUNCIONES DE MANIPULACIÓN DEL DOM
// ============================================================================

/**
 * Crea un elemento HTML con atributos
 * @param {string} tag - Tag del elemento
 * @param {Object} attributes - Atributos del elemento
 * @param {string} textContent - Contenido de texto
 * @returns {HTMLElement} Elemento creado
 */
export function createElement(tag, attributes = {}, textContent = "") {
    const element = document.createElement(tag);
    
    // Aplicar atributos
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === "className") {
            element.className = value;
        } else if (key === "textContent") {
            element.textContent = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Aplicar contenido de texto
    if (textContent) {
        element.textContent = textContent;
    }
    
    return element;
}

/**
 * Agrega o remueve clases CSS de un elemento
 * @param {HTMLElement} element - Elemento a modificar
 * @param {string} className - Clase CSS
 * @param {boolean} add - True para agregar, false para remover
 */
export function toggleClass(element, className, add) {
    if (add) {
        element.classList.add(className);
    } else {
        element.classList.remove(className);
    }
}

/**
 * Muestra u oculta un elemento
 * @param {HTMLElement} element - Elemento a mostrar/ocultar
 * @param {boolean} show - True para mostrar, false para ocultar
 * @param {string} displayType - Tipo de display cuando se muestra
 */
export function toggleElement(element, show, displayType = "block") {
    if (show) {
        element.style.display = displayType;
    } else {
        element.style.display = "none";
    }
}

/**
 * Limpia el contenido de un elemento
 * @param {HTMLElement} element - Elemento a limpiar
 */
export function clearElement(element) {
    element.innerHTML = "";
}

// ============================================================================
// FUNCIONES DE NOTIFICACIONES Y ALERTAS
// ============================================================================

/**
 * Muestra una notificación
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, warning, info)
 * @param {number} duration - Duración en milisegundos
 */
export function showNotification(message, type = "info", duration = 5000) {
    const container = document.getElementById("notificationContainer") || createNotificationContainer();
    
    const notification = createElement("div", {
        className: `notification notification-${type}`
    }, message);
    
    // Agregar botón de cerrar
    const closeBtn = createElement("button", {
        className: "notification-close",
        type: "button"
    }, "×");
    
    closeBtn.addEventListener("click", () => {
        notification.remove();
    });
    
    notification.appendChild(closeBtn);
    container.appendChild(notification);
    
    // Auto-ocultar después del tiempo especificado
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }
    
    return notification;
}

/**
 * Crea el contenedor de notificaciones si no existe
 * @returns {HTMLElement} Contenedor de notificaciones
 */
function createNotificationContainer() {
    const container = createElement("div", {
        id: "notificationContainer",
        className: "notification-container"
    });
    
    document.body.appendChild(container);
    return container;
}

/**
 * Muestra un modal de confirmación
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje del modal
 * @param {string} confirmText - Texto del botón de confirmación
 * @param {string} cancelText - Texto del botón de cancelación
 * @returns {Promise<boolean>} True si se confirma, false si se cancela
 */
export function showConfirmModal(title, message, confirmText = "Confirmar", cancelText = "Cancelar") {
    return new Promise((resolve) => {
        const modal = createElement("div", {
            className: "modal confirm-modal"
        });
        
        const content = createElement("div", {
            className: "modal-content"
        });
        
        const header = createElement("div", {
            className: "modal-header"
        });
        
        const titleElement = createElement("h2", {}, title);
        header.appendChild(titleElement);
        
        const body = createElement("div", {
            className: "modal-body"
        });
        
        const messageElement = createElement("p", {}, message);
        body.appendChild(messageElement);
        
        const actions = createElement("div", {
            className: "modal-actions"
        });
        
        const cancelBtn = createElement("button", {
            className: "btn btn-secondary"
        }, cancelText);
        
        const confirmBtn = createElement("button", {
            className: "btn btn-primary"
        }, confirmText);
        
        cancelBtn.addEventListener("click", () => {
            modal.remove();
            resolve(false);
        });
        
        confirmBtn.addEventListener("click", () => {
            modal.remove();
            resolve(true);
        });
        
        actions.appendChild(cancelBtn);
        actions.appendChild(confirmBtn);
        
        content.appendChild(header);
        content.appendChild(body);
        content.appendChild(actions);
        modal.appendChild(content);
        
        document.body.appendChild(modal);
        
        // Enfocar el botón de cancelación por defecto
        cancelBtn.focus();
    });
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Escapa HTML para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} Texto escapado
 */
export function escapeHtml(text) {
    if (typeof text !== "string") {
        return text;
    }
    
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Debounce para funciones que se ejecutan frecuentemente
 * @param {Function} func - Función a debounce
 * @param {number} wait - Tiempo de espera en milisegundos
 * @returns {Function} Función con debounce
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle para funciones que se ejecutan frecuentemente
 * @param {Function} func - Función a throttle
 * @param {number} limit - Límite de tiempo en milisegundos
 * @returns {Function} Función con throttle
 */
export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Genera un ID único
 * @returns {string} ID único
 */
export function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Copia texto al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} True si se copió exitosamente
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback para navegadores más antiguos
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const result = document.execCommand("copy");
            textArea.remove();
            return result;
        }
    } catch (error) {
        console.error("Error al copiar al portapapeles:", error);
        return false;
    }
}

/**
 * Descarga un archivo
 * @param {string} content - Contenido del archivo
 * @param {string} filename - Nombre del archivo
 * @param {string} mimeType - Tipo MIME del archivo
 */
export function downloadFile(content, filename, mimeType = "text/plain") {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = createElement("a", {
        href: url,
        download: filename
    });
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

/**
 * Verifica si el navegador soporta una característica
 * @param {string} feature - Característica a verificar
 * @returns {boolean} True si se soporta
 */
export function isFeatureSupported(feature) {
    const features = {
        "fetch": typeof fetch !== "undefined",
        "localStorage": typeof localStorage !== "undefined",
        "sessionStorage": typeof sessionStorage !== "undefined",
        "clipboard": navigator.clipboard !== undefined,
        "serviceWorker": "serviceWorker" in navigator,
        "webGL": !!window.WebGLRenderingContext,
        "webAudio": !!window.AudioContext || !!window.webkitAudioContext
    };
    
    return features[feature] || false;
}

/**
 * Obtiene información del navegador
 * @returns {Object} Información del navegador
 */
export function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browser = "Unknown";
    let version = "Unknown";
    
    if (userAgent.includes("Firefox")) {
        browser = "Firefox";
        version = userAgent.match(/Firefox\/(\d+)/)?.[1] || "Unknown";
    } else if (userAgent.includes("Chrome")) {
        browser = "Chrome";
        version = userAgent.match(/Chrome\/(\d+)/)?.[1] || "Unknown";
    } else if (userAgent.includes("Safari")) {
        browser = "Safari";
        version = userAgent.match(/Version\/(\d+)/)?.[1] || "Unknown";
    } else if (userAgent.includes("Edge")) {
        browser = "Edge";
        version = userAgent.match(/Edge\/(\d+)/)?.[1] || "Unknown";
    }
    
    return {
        browser,
        version,
        userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        online: navigator.onLine
    };
}
