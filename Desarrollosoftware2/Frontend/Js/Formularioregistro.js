// FormularioRegistro.js
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const termsCheckbox = document.getElementById('terms');
    
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const termsError = document.getElementById('terms-error');

    // Función para validar el nombre
    function validateName(name) {
        return name.length >= 3;
    }

    // Función para validar el email
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Función para validar la contraseña
    function validatePassword(password) {
        return password.length >= 8;
    }

    // Función para validar que las contraseñas coinciden
    function validatePasswordsMatch(password, confirmPassword) {
        return password === confirmPassword;
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

    // Validaciones en tiempo real
    nameInput.addEventListener('input', function() {
        if (!validateName(this.value)) {
            showError(this, nameError, 'El nombre debe tener al menos 3 caracteres');
        } else {
            clearError(this, nameError);
        }
    });

    emailInput.addEventListener('input', function() {
        if (!validateEmail(this.value)) {
            showError(this, emailError, 'Por favor, introduce un email válido');
        } else {
            clearError(this, emailError);
        }
    });

    passwordInput.addEventListener('input', function() {
        if (!validatePassword(this.value)) {
            showError(this, passwordError, 'La contraseña debe tener al menos 8 caracteres');
        } else {
            clearError(this, passwordError);
            
            // Si cambia la contraseña, validar nuevamente la confirmación
            if (confirmPasswordInput.value) {
                if (!validatePasswordsMatch(this.value, confirmPasswordInput.value)) {
                    showError(confirmPasswordInput, confirmPasswordError, 'Las contraseñas no coinciden');
                } else {
                    clearError(confirmPasswordInput, confirmPasswordError);
                }
            }
        }
    });

    confirmPasswordInput.addEventListener('input', function() {
        if (!validatePasswordsMatch(passwordInput.value, this.value)) {
            showError(this, confirmPasswordError, 'Las contraseñas no coinciden');
        } else {
            clearError(this, confirmPasswordError);
        }
    });

    termsCheckbox.addEventListener('change', function() {
        if (!this.checked) {
            showError(this, termsError, 'Debes aceptar los términos y condiciones');
        } else {
            clearError(this, termsError);
        }
    });

    // Manejo del envío del formulario
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const termsAccepted = termsCheckbox.checked;

        // Validar todos los campos antes de enviar
        let isValid = true;

        if (!validateName(name)) {
            showError(nameInput, nameError, 'El nombre debe tener al menos 3 caracteres');
            isValid = false;
        }

        if (!validateEmail(email)) {
            showError(emailInput, emailError, 'Por favor, introduce un email válido');
            isValid = false;
        }

        if (!validatePassword(password)) {
            showError(passwordInput, passwordError, 'La contraseña debe tener al menos 8 caracteres');
            isValid = false;
        }

        if (!validatePasswordsMatch(password, confirmPassword)) {
            showError(confirmPasswordInput, confirmPasswordError, 'Las contraseñas no coinciden');
            isValid = false;
        }

        if (!termsAccepted) {
            showError(termsCheckbox, termsError, 'Debes aceptar los términos y condiciones');
            isValid = false;
        }

        if (isValid) {
            try {
                // En un entorno real, aquí harías una llamada a tu API
                // Por ahora, simulamos con localStorage como en iniciosesion.js
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                
                if (users.some(u => u.email === email)) {
                    showError(emailInput, emailError, 'Este email ya está registrado');
                    return;
                }

                const newUser = { name, email, password };
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(newUser));

                // Mostrar notificación de éxito
                mostrarNotificacion('Registro exitoso. ¡Bienvenido!', 'success');
                
                // Redirigir al usuario a la página principal
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
                
            } catch (error) {
                console.error('Error:', error);
                mostrarNotificacion('Error de conexión. Por favor, intenta más tarde.', 'error');
            }
        }
    });

    // Función de notificación (similar a la de iniciosesion.js)
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
});