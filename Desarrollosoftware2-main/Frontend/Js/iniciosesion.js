// auth.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    const closeBtns = document.querySelectorAll('.close-btn');

    // Estado inicial
    checkAuthState();

    // Event Listeners
    loginBtn.addEventListener('click', () => loginModal.classList.remove('hidden'));
    registerBtn.addEventListener('click', () => registerModal.classList.remove('hidden'));
    logoutBtn.addEventListener('click', handleLogout);

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.classList.add('hidden');
            registerModal.classList.add('hidden');
        });
    });

    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    // Funciones de autenticación
    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Aquí normalmente harías una llamada a tu API
        // Por ahora, simularemos con localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateUIForLoggedInUser(user);
            loginModal.classList.add('hidden');
            loginForm.reset();
            mostrarNotificacion('Sesión iniciada correctamente', 'success');
        } else {
            mostrarNotificacion('Credenciales incorrectas', 'error');
        }
    }

    function handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;

        if (password !== passwordConfirm) {
            mostrarNotificacion('Las contraseñas no coinciden', 'error');
            return;
        }

        // Simular registro con localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.some(u => u.email === email)) {
            mostrarNotificacion('El email ya está registrado', 'error');
            return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        updateUIForLoggedInUser(newUser);
        registerModal.classList.add('hidden');
        registerForm.reset();
        mostrarNotificacion('Registro exitoso', 'success');
    }

    function handleLogout() {
        localStorage.removeItem('currentUser');
        updateUIForLoggedOutUser();
        mostrarNotificacion('Sesión cerrada', 'info');
    }

    function checkAuthState() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            updateUIForLoggedInUser(currentUser);
        } else {
            updateUIForLoggedOutUser();
        }
    }

    function updateUIForLoggedInUser(user) {
        authButtons.classList.add('hidden');
        userMenu.classList.remove('hidden');
        userName.textContent = user.name;
    }

    function updateUIForLoggedOutUser() {
        authButtons.classList.remove('hidden');
        userMenu.classList.add('hidden');
        userName.textContent = '';
    }

    // Función de notificación (asumiendo que está definida en script.js)
    function mostrarNotificacion(mensaje, tipo) {
        // Si no existe la función en el scope global, la definimos aquí
        if (typeof window.mostrarNotificacion !== 'function') {
            const notification = document.createElement('div');
            notification.className = `notification ${tipo}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span>${mensaje}</span>
                </div>
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        } else {
            window.mostrarNotificacion(mensaje, tipo);
        }
    }
});