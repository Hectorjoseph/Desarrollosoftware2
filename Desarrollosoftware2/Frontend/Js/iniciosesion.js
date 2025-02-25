// iniciosesion.js - gestiona el estado de autenticación en toda la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');

    // Inicialización
    checkAuthState();

    // Event Listeners
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Comprueba el estado de autenticación al cargar la página
    function checkAuthState() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            updateUIForLoggedInUser(currentUser);
        } else {
            updateUIForLoggedOutUser();
        }
    }

    // Función para cerrar sesión
    function handleLogout() {
        localStorage.removeItem('currentUser');
        updateUIForLoggedOutUser();
        mostrarNotificacion('Sesión cerrada', 'info');
        
        // Redirigir a la página principal
        window.location.href = 'index.html';
    }

    // Actualiza la UI cuando el usuario está autenticado
    function updateUIForLoggedInUser(user) {
        if (authButtons && userMenu && userName) {
            authButtons.classList.add('hidden');
            userMenu.classList.remove('hidden');
            userName.textContent = user.name;
        }
    }

    // Actualiza la UI cuando el usuario no está autenticado
    function updateUIForLoggedOutUser() {
        if (authButtons && userMenu) {
            authButtons.classList.remove('hidden');
            userMenu.classList.add('hidden');
            if (userName) {
                userName.textContent = '';
            }
        }
    }

    // Función para mostrar notificaciones
    function mostrarNotificacion(mensaje, tipo) {
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${mensaje}</span>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Exponer funciones útiles al ámbito global
    window.mostrarNotificacion = mostrarNotificacion;
    window.checkAuthState = checkAuthState;
});