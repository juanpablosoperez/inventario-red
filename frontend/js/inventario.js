// Lógica de la página de inventario
console.log("📦 Cargando lógica de inventario...");

// Variables globales
let currentUser = null;
let products = [];
let editingProductId = null;

// Inicialización de la página
document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Página de inventario cargada");
    
    // Verificar autenticación
    checkAuthentication();
    
    // Configurar eventos
    setupEventListeners();
    
    // Cargar productos
    loadProducts();
});

async function checkAuthentication() {
    try {
        console.log("🔐 Verificando autenticación...");
        const response = await window.API.getCurrentUser();
        if (response.success) {
            currentUser = response.data.user;
            console.log("✅ Usuario autenticado:", currentUser.username);
            updateUserInterface();
        } else {
            console.log("❌ Usuario no autenticado, redirigiendo...");
            // Redirigir al login si no está autenticado
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("💥 Error al verificar autenticación:", error);
        window.location.href = "index.html";
    }
}

function updateUserInterface() {
    // Actualizar información del usuario
    document.getElementById("username").textContent = currentUser.username;
    document.getElementById("userRole").textContent = currentUser.role === "admin" ? "👑" : "👁️";
    
    // Mostrar/ocultar panel de admin
    const adminPanel = document.getElementById("adminPanel");
    const actionsHeader = document.getElementById("actionsHeader");
    
    if (currentUser.role === "admin") {
        adminPanel.style.display = "block";
        actionsHeader.style.display = "table-cell";
        console.log("👑 Panel de administrador habilitado");
    } else {
        adminPanel.style.display = "none";
        actionsHeader.style.display = "none";
        console.log("👁️ Modo visualizador");
    }
}

function setupEventListeners() {
    console.log("🔧 Configurando eventos...");
    
    // Botón de logout
    document.getElementById("logoutBtn").addEventListener("click", handleLogout);
    
    // Búsqueda
    document.getElementById("searchBtn").addEventListener("click", handleSearch);
    document.getElementById("searchInput").addEventListener("keypress", function(e) {
        if (e.key === "Enter") handleSearch();
    });
    
    // Ordenamiento
    document.getElementById("sortSelect").addEventListener("change", handleSort);
    
    // Botones de admin
    document.getElementById("addProductBtn").addEventListener("click", showAddProductModal);
    document.getElementById("exportBtn").addEventListener("click", handleExport);
    
    // Modal de producto
    document.getElementById("closeModalBtn").addEventListener("click", hideProductModal);
    document.getElementById("cancelBtn").addEventListener("click", hideProductModal);
    document.getElementById("productForm").addEventListener("submit", handleProductSubmit);
    
    // Modal de eliminación
    document.getElementById("closeDeleteModalBtn").addEventListener("click", hideDeleteModal);
    document.getElementById("cancelDeleteBtn").addEventListener("click", hideDeleteModal);
    document.getElementById("confirmDeleteBtn").addEventListener("click", handleDeleteConfirm);
    
    console.log("✅ Eventos configurados");
}

async function loadProducts() {
    try {
        console.log("📋 Cargando productos...");
        showLoadingState();
        const response = await window.API.getProducts();
        
        if (response.success) {
            products = response.data.products;
            console.log(`✅ ${products.length} productos cargados`);
            updateProductsTable();
            updateStats(response.data.summary);
        } else {
            console.error("❌ Error al cargar productos:", response.error);
            showNotification("Error al cargar productos: " + response.error, "error");
        }
    } catch (error) {
        console.error("💥 Error al cargar productos:", error);
        showNotification("Error de conexión al cargar productos", "error");
    } finally {
        hideLoadingState();
    }
}

// Funciones de UI implementadas
function showLoadingState() {
    const tbody = document.getElementById("productsTableBody");
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="loading-message">
                <div class="spinner"></div>
                Cargando productos...
            </td>
        </tr>
    `;
}

function hideLoadingState() {
    // El estado se oculta cuando se actualiza la tabla
}

function updateProductsTable() {
    console.log("📊 Actualizando tabla de productos...");
    const tbody = document.getElementById("productsTableBody");
    tbody.innerHTML = "";
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="no-products">
                    No se encontraron productos
                </td>
            </tr>
        `;
        return;
    }
    
    products.forEach(product => {
        const row = createProductRow(product);
        tbody.appendChild(row);
    });
}

function createProductRow(product) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${product.id}</td>
        <td><span class="sku">${product.sku}</span></td>
        <td>${escapeHtml(product.name)}</td>
        <td>${product.qty}</td>
        <td>$${formatPrice(product.price)}</td>
        <td>$${formatPrice(product.qty * product.price)}</td>
        <td>${formatDate(product.updated_at || product.created_at)}</td>
        <td class="actions-cell" style="display: ${currentUser.role === "admin" ? "table-cell" : "none"}">
            <button class="btn btn-sm btn-primary edit-btn" data-id="${product.id}">
                ✏️ Editar
            </button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${product.id}">
                🗑️ Eliminar
            </button>
        </td>
    `;

    // Agregar eventos a los botones de acción
    if (currentUser.role === "admin") {
        row.querySelector(".edit-btn").addEventListener("click", () => showEditProductModal(product));
        row.querySelector(".delete-btn").addEventListener("click", () => showDeleteModal(product));
    }

    return row;
}

function updateStats(summary) {
    console.log("📈 Actualizando estadísticas...");
    
    // Si no hay summary, calcular desde los productos
    if (!summary) {
        summary = {
            totalProducts: products.length,
            totalQuantity: products.reduce((sum, p) => sum + p.qty, 0),
            totalValue: products.reduce((sum, p) => sum + (p.qty * p.price), 0)
        };
    }
    
    document.getElementById("totalProducts").textContent = summary.totalProducts;
    document.getElementById("totalQuantity").textContent = summary.totalQuantity;
    document.getElementById("totalValue").textContent = `$${formatPrice(summary.totalValue)}`;
}

// Funciones de utilidad
function escapeHtml(text) {
    if (typeof text !== "string") return text;
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function formatPrice(price) {
    if (price === null || price === undefined || isNaN(price)) return "0.00";
    return parseFloat(price).toFixed(2);
}

function formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Fecha inválida";
        
        return date.toLocaleDateString("es-ES", {
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

function showNotification(message, type) {
    console.log(`🔔 Notificación [${type}]:`, message);
    // Implementar notificaciones usando window.showNotification si está disponible
}

// Funciones de manejo de eventos (placeholder)
async function handleLogout() {
    try {
        console.log("🚪 Cerrando sesión...");
        await window.API.logout();
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        // Forzar redirección
        window.location.href = "index.html";
    }
}

function handleSearch() {
    const query = document.getElementById("searchInput").value.trim();
    if (query) {
        searchProducts(query);
    } else {
        loadProducts();
    }
}

async function searchProducts(query) {
    try {
        console.log("🔍 Buscando productos...");
        showLoadingState();
        const response = await window.API.searchProductsAPI(query);
        
        if (response.success) {
            products = response.data.products;
            updateProductsTable();
            updateStats();
        } else {
            console.error("❌ Error en búsqueda:", response.error);
            showNotification("Error en la búsqueda: " + response.error, "error");
        }
    } catch (error) {
        console.error("💥 Error en búsqueda:", error);
        showNotification("Error de conexión en la búsqueda", "error");
    } finally {
        hideLoadingState();
    }
}

function handleSort() {
    const sortBy = document.getElementById("sortSelect").value;
    console.log("📊 Ordenando productos por:", sortBy);
    
    products.sort((a, b) => {
        switch (sortBy) {
            case "name":
                return a.name.localeCompare(b.name);
            case "sku":
                return a.sku.localeCompare(b.sku);
            case "qty":
                return a.qty - b.qty;
            case "price":
                return a.price - b.price;
            default:
                return 0;
        }
    });
    
    updateProductsTable();
}

function showAddProductModal() {
    console.log("➕ Mostrando modal de agregar producto...");
    editingProductId = null;
    document.getElementById("modalTitle").textContent = "Agregar Producto";
    document.getElementById("productForm").reset();
    document.getElementById("modalSku").disabled = false;
    showProductModal();
}

function showEditProductModal(product) {
    console.log("✏️ Mostrando modal de editar producto...");
    editingProductId = product.id;
    document.getElementById("modalTitle").textContent = "Editar Producto";
    document.getElementById("modalSku").value = product.sku;
    document.getElementById("modalName").value = product.name;
    document.getElementById("modalQty").value = product.qty;
    document.getElementById("modalPrice").value = product.price;
    document.getElementById("modalSku").disabled = true;
    showProductModal();
}

function showProductModal() {
    document.getElementById("productModal").style.display = "block";
}

function handleExport() {
    console.log("📤 Exportando datos...");
    // Implementar exportación (CSV, Excel, etc.)
    showNotification("Función de exportación en desarrollo", "info");
}

function setSaveButtonLoading(loading) {
    const btnText = document.querySelector("#saveBtn .btn-text");
    const btnLoading = document.querySelector("#saveBtn .btn-loading");
    const btn = document.getElementById("saveBtn");

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

function hideProductModal() {
    console.log("❌ Ocultando modal de producto...");
    document.getElementById("productModal").style.display = "none";
}

async function handleProductSubmit(e) {
    e.preventDefault();
    console.log("💾 Enviando formulario de producto...");
    
    const formData = new FormData(e.target);
    const productData = {
        sku: formData.get("sku"),
        name: formData.get("name"),
        qty: parseInt(formData.get("qty")),
        price: parseFloat(formData.get("price"))
    };
    
    try {
        setSaveButtonLoading(true);
        
        let response;
        if (editingProductId) {
            response = await window.API.updateProduct(editingProductId, productData);
        } else {
            response = await window.API.createProduct(productData);
        }
        
        if (response.success) {
            showNotification(
                editingProductId ? "Producto actualizado correctamente" : "Producto creado correctamente",
                "success"
            );
            hideProductModal();
            loadProducts();
        } else {
            showNotification("Error: " + response.error, "error");
        }
    } catch (error) {
        console.error("💥 Error al guardar producto:", error);
        showNotification("Error de conexión al guardar", "error");
    } finally {
        setSaveButtonLoading(false);
    }
}

function showDeleteModal(product) {
    console.log("🗑️ Mostrando modal de eliminación...");
    editingProductId = product.id;
    document.getElementById("deleteModalProductName").textContent = product.name;
    document.getElementById("deleteModal").style.display = "block";
}

function hideDeleteModal() {
    console.log("❌ Ocultando modal de eliminación...");
    document.getElementById("deleteModal").style.display = "none";
}

async function handleDeleteConfirm() {
    try {
        console.log("🗑️ Confirmando eliminación...");
        const response = await window.API.deleteProduct(editingProductId);
        
        if (response.success) {
            showNotification("Producto eliminado correctamente", "success");
            hideDeleteModal();
            loadProducts();
        } else {
            showNotification("Error al eliminar: " + response.error, "error");
        }
    } catch (error) {
        console.error("💥 Error al eliminar producto:", error);
        showNotification("Error de conexión al eliminar", "error");
    }
}

console.log("✅ Lógica de inventario cargada");
