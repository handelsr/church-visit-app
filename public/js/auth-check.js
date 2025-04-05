/**
 * auth-check.js - Verificación de autenticación y configuración inicial
 * Este archivo se ejecuta en todas las páginas que requieren autenticación.
 */

(function() {
    // Verificar autenticación al cargar la página
    document.addEventListener('DOMContentLoaded', function() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const currentPage = window.location.pathname.split('/').pop();
        
        // Lista de páginas que requieren autenticación
        const authRequiredPages = ['attendance.html', 'consultation.html'];
        
        // Si estamos en la página de login y ya hay sesión activa, redirigir según rol
        if (currentPage === 'login.html' && token && user.role) {
            if (user.role === 'secretary') {
                window.location.href = 'attendance.html';
            } else {
                window.location.href = 'consultation.html';
            }
            return;
        }
        
        // Si estamos en una página protegida y no hay token, redirigir a login
        if (authRequiredPages.includes(currentPage) && !token) {
            window.location.href = 'login.html';
            return;
        }
        
        // Verificación de acceso por rol
        if (token && user.role) {
            // Si es admin intentando acceder a attendance.html, redirigir a consultation.html
            if (user.role === 'admin' && currentPage === 'attendance.html') {
                window.location.href = 'consultation.html';
                return;
            }
            
            // Si no es secretary intentando acceder a attendance.html, redirigir a consultation.html
            if (user.role !== 'secretary' && currentPage === 'attendance.html') {
                window.location.href = 'consultation.html';
                return;
            }
            
            // Establecer secretaryId si aplica (solo para secretarias)
            if (user.role === 'secretary') {
                // Establecer churchId para secretarias
                if (user.church_id) {
                    localStorage.setItem('selectedChurch', user.church_id);
                }
                
                // Establecer secretaryId
                if (user.secretary_id) {
                    localStorage.setItem('selectedSecretary', user.secretary_id);
                }
            }
            
            // Establecer bandera de admin para facilitar verificaciones
            if (user.role === 'admin') {
                localStorage.setItem('isAdmin', 'true');
            } else {
                localStorage.removeItem('isAdmin');
            }
        }
    });
})(); 