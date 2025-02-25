// recuperarPassword.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM - Formularios
    const recoveryForm = document.getElementById('recoveryForm');
    const verificationForm = document.getElementById('verificationForm');
    const resetForm = document.getElementById('resetForm');
    
    // Elementos del DOM - Inputs
    const emailInput = document.getElementById('email');
    const codeInput = document.getElementById('verification-code');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    // Elementos del DOM - Errores
    const emailError = document.getElementById('email-error');
    const codeError = document.getElementById('code-error');
    const newPasswordError = document.getElementById('new-password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    
    // Variables para almacenar datos entre pasos
    let recoveryEmail = '';
    let recoveryCode = '';
    
    // Función para mostrar mensajes de error
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
    
    // Validar email
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Validar contraseña
    function validatePassword(password) {
        return password.length >= 8;
    }
    
    // Validar que las contraseñas coinciden
    function validatePasswordsMatch(password, confirmPassword) {
        return password === confirmPassword;
    }
    
    // Generar código aleatorio de 6 dígitos
    function generateRandomCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    // Mostrar notificaciones
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
    
    // Evento para validar email en tiempo real
    emailInput.addEventListener('input', function() {
        if (!validateEmail(this.value)) {
            showError(this, emailError, 'Por favor, introduce un email válido');
        } else {
            clearError(this, emailError);
        }
    });
    
    // Evento para validar nueva contraseña en tiempo real
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            if (!validatePassword(this.value)) {
                showError(this, newPasswordError, 'La contraseña debe tener al menos 8 caracteres');
            } else {
                clearError(this, newPasswordError);
                
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
    }
    
    // Evento para validar confirmación de contraseña en tiempo real
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (!validatePasswordsMatch(newPasswordInput.value, this.value)) {
                showError(this, confirmPasswordError, 'Las contraseñas no coinciden');
            } else {
                clearError(this, confirmPasswordError);
            }
        });
    }
    
    // Paso 1: Enviar solicitud de recuperación
    recoveryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value;
        let isValid = true;
        
        if (!validateEmail(email)) {
            showError(emailInput, emailError, 'Por favor, introduce un email válido');
            isValid = false;
        }
        
        if (isValid) {
            // En un entorno real, aquí harías una llamada al backend
            // Por ahora, verificamos en localStorage si el email existe
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email);
            
            if (!user) {
                showError(emailInput, emailError, 'No existe una cuenta con este email');
                return;
            }
            
            // Almacenar email para pasos posteriores
            recoveryEmail = email;
            
            // Generar y almacenar código de verificación
            recoveryCode = generateRandomCode();
            
            // En un entorno real, aquí enviarías el código por email
            // Por ahora, lo mostramos en una notificación (solo para desarrollo)
            mostrarNotificacion(`Código de verificación: ${recoveryCode}`, 'info');
            
            // Ocultar formulario actual y mostrar el siguiente
            recoveryForm.classList.add('hidden');
            verificationForm.classList.remove('hidden');
        }
    });
    
    // Paso 2: Verificar código
    verificationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const code = codeInput.value;
        
        if (code !== recoveryCode) {
            showError(codeInput, codeError, 'Código de verificación incorrecto');
            return;
        }
        
        // Ocultar formulario actual y mostrar el siguiente
        verificationForm.classList.add('hidden');
        resetForm.classList.remove('hidden');
    });
    
    // Paso 3: Restablecer contraseña
    resetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        let isValid = true;
        
        if (!validatePassword(newPassword)) {
            showError(newPasswordInput, newPasswordError, 'La contraseña debe tener al menos 8 caracteres');
            isValid = false;
        }
        
        if (!validatePasswordsMatch(newPassword, confirmPassword)) {
            showError(confirmPasswordInput, confirmPasswordError, 'Las contraseñas no coinciden');
            isValid = false;
        }
        
        if (isValid) {
            // En un entorno real, aquí harías una llamada al backend
            // Por ahora, actualizamos en localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.email === recoveryEmail);
            
            if (userIndex !== -1) {
                users[userIndex].password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
                
                mostrarNotificacion('Contraseña restablecida correctamente', 'success');
                
                // Redirigir a la página de inicio de sesión después de un breve retraso
                setTimeout(() => {
                    window.location.href = 'Formularioinicio.html';
                }, 2000);
            }
        }
    });
});