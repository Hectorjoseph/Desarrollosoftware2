// login.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');

    // Función para validar el email
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Función para validar la contraseña
    function validatePassword(password) {
        return password.length >= 8;
    }

    // Función para mostrar errores
    function showError(element, errorElement, message) {
        element.classList.add('error');
        errorElement.style.display = 'block';
        errorElement.textContent = message;
    }

    // Función para limpiar errores
    function clearError(element, errorElement) {
        element.classList.remove('error');
        errorElement.style.display = 'none';
        errorElement.textContent = '';
    }

    // Validación en tiempo real para el email
    emailInput.addEventListener('input', function() {
        if (!validateEmail(this.value)) {
            showError(this, emailError, 'Por favor, introduce un email válido');
        } else {
            clearError(this, emailError);
        }
    });

    // Validación en tiempo real para la contraseña
    passwordInput.addEventListener('input', function() {
        if (!validatePassword(this.value)) {
            showError(this, passwordError, 'La contraseña debe tener al menos 8 caracteres');
        } else {
            clearError(this, passwordError);
        }
    });

    // Manejo del envío del formulario
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;
        const remember = document.getElementById('remember').checked;

        // Validar campos antes de enviar
        let isValid = true;

        if (!validateEmail(email)) {
            showError(emailInput, emailError, 'Por favor, introduce un email válido');
            isValid = false;
        }

        if (!validatePassword(password)) {
            showError(passwordInput, passwordError, 'La contraseña debe tener al menos 8 caracteres');
            isValid = false;
        }

        if (isValid) {
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        remember
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Guardar el token si existe
                    if (data.token) {
                        localStorage.setItem('authToken', data.token);
                    }
                    
                    // Redirigir al usuario a la página principal
                    window.location.href = '/';
                } else {
                    // Mostrar mensaje de error
                    showError(emailInput, emailError, data.message || 'Error al iniciar sesión');
                }
            } catch (error) {
                console.error('Error:', error);
                showError(emailInput, emailError, 'Error de conexión. Por favor, intenta más tarde.');
            }
        }
    });
});