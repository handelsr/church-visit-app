/**
 * real-time.js - Manejo de comunicación en tiempo real
 * Este archivo gestiona la comunicación de Socket.io entre el cliente y el servidor
 */

// Conexión al servidor de Socket.io
const socket = io({
    reconnectionDelayMax: 10000,
    timeout: 60000,
});

// Manejo de eventos de conexión
socket.on('connect', () => {
    console.log('Conectado al servidor de Socket.io');
});

socket.on('connect_error', (error) => {
    console.error('Error de conexión Socket.io:', error);
});

// Evento de bienvenida del servidor
socket.on('welcome', (data) => {
    console.log('Mensaje del servidor:', data.message);
});

// Evento ping para mantener la conexión activa
socket.on('ping', (data) => {
    console.log('Ping del servidor:', new Date(data.time).toLocaleTimeString());
});

// Función para actualizar la vista actual en consultation.html
function updateConsultationView() {
    if (!window.location.pathname.endsWith('consultation.html')) return;
    
    const dateFilter = document.getElementById('date-filter');
    const churchFilter = document.getElementById('church-filter');
    
    // Si hay una fecha específica seleccionada
    if (dateFilter && dateFilter.value) {
        if (typeof loadVisitsByDate === 'function') {
            console.log('Actualizando vista de consulta por fecha:', dateFilter.value);
            loadVisitsByDate(dateFilter.value);
            return;
        }
    } 
    
    // Si hay una iglesia específica seleccionada (para admin)
    if (churchFilter && churchFilter.value) {
        if (typeof loadVisitsByChurch === 'function') {
            console.log('Actualizando vista de consulta por iglesia:', churchFilter.value);
            loadVisitsByChurch(churchFilter.value);
            return;
        }
    } 
    
    // Si no hay filtros activos o las funciones anteriores no existen, cargar todas las visitas
    if (typeof loadAllVisits === 'function') {
        console.log('Actualizando vista de consulta - todas las visitas');
        loadAllVisits();
    }
}

// Eventos específicos para actualización de asistencia
socket.on('attendance_confirmed', (data) => {
    console.log('Asistencia confirmada:', data);
    
    // Actualizar la interfaz según la página actual
    if (window.location.pathname.endsWith('attendance.html') && typeof loadVisitsTable === 'function') {
        loadVisitsTable();
    } else if (window.location.pathname.endsWith('consultation.html')) {
        // Actualizar inmediatamente la vista actual en consultation.html
        updateConsultationView();
    }
});

socket.on('attendance_updated', (data) => {
    console.log('Asistencia actualizada:', data);
    
    // Actualizar la interfaz según la página actual
    if (window.location.pathname.endsWith('attendance.html') && typeof loadVisitsTable === 'function') {
        // En la página de asistencia, solo actualizar la fila específica
        const checkbox = document.getElementById(`stood-up-${data.attendance_id}`);
        if (checkbox) {
            checkbox.checked = data.stood_up;
        } else {
            loadVisitsTable();
        }
    } else if (window.location.pathname.endsWith('consultation.html')) {
        // Actualizar inmediatamente la vista actual en consultation.html
        updateConsultationView();
    }
});

socket.on('new_visit', (data) => {
    console.log('Nueva visita registrada:', data);
    
    // Actualizar la interfaz según la página actual
    if (window.location.pathname.endsWith('attendance.html') && typeof loadVisitsTable === 'function') {
        loadVisitsTable();
    } else if (window.location.pathname.endsWith('consultation.html')) {
        // Actualizar inmediatamente la vista actual en consultation.html
        updateConsultationView();
    }
});

socket.on('attendance_deleted', (data) => {
    console.log('Asistencia eliminada:', data);
    
    // Actualizar la interfaz según la página actual
    if (window.location.pathname.endsWith('attendance.html') && typeof loadVisitsTable === 'function') {
        loadVisitsTable();
    } else if (window.location.pathname.endsWith('consultation.html')) {
        // Actualizar inmediatamente la vista actual en consultation.html
        updateConsultationView();
    }
});

// Funciones para emitir eventos
function emitConfirmAttendance(attendanceData) {
    socket.emit('confirm_attendance', attendanceData);
}

function emitUpdateAttendance(attendanceData) {
    socket.emit('attendance_updated', attendanceData);
}

function emitNewVisit(visitData) {
    socket.emit('new_visit', visitData);
}

function emitDeleteAttendance(attendanceData) {
    socket.emit('attendance_deleted', attendanceData);
}
