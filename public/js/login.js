document.addEventListener('DOMContentLoaded', function() {
    // Verificar si ya hay un token almacenado
    const token = localStorage.getItem('token');
    if (token) {
        // Verificar a qué página redirigir según el rol
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role === 'secretary') {
            window.location.href = '/attendance.html';
        } else {
            window.location.href = '/consultation.html';
        }
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                displayMessage('Por favor ingrese usuario y contraseña', 'error');
                return;
            }
            
            // Mostrar indicador de carga
            document.getElementById('loading-indicator').style.display = 'block';
            document.getElementById('login-button').disabled = true;
            
            fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Error durante el inicio de sesión');
                    });
                }
                return response.json();
            })
            .then(data => {
                // Guardar token
                localStorage.setItem('token', data.token);
                
                // Guardar datos del usuario
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redireccionar según el rol
                if (data.user.role === 'admin') {
                    window.location.href = '/attendance.html';
                } else if (data.user.role === 'secretary') {
                    window.location.href = '/attendance.html';
                } else if (data.user.role === 'viewer') {
                    window.location.href = '/consultation.html';
                } else {
                    displayMessage('Rol de usuario no reconocido', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                displayMessage(error.message, 'error');
            })
            .finally(() => {
                // Ocultar indicador de carga y habilitar el botón
                document.getElementById('loading-indicator').style.display = 'none';
                document.getElementById('login-button').disabled = false;
            });
        });
    }
}); 