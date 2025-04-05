let selectedVisitId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay un token en localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        // Redirigir a la página de login si no hay token
        window.location.href = '/login.html';
        return;
    }

    // Obtener los datos del usuario desde localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Mostrar el nombre de usuario en la interfaz
    const secretaryNameElement = document.getElementById('secretary-name');
    if (secretaryNameElement && user) {
        // Usar solo el username
        secretaryNameElement.textContent = user.username;
    }
    
    // Configurar ajustes de entrada para mejorar la experiencia en móviles
    setupMobileInputBehavior();
    
    // Si es administrador, mostrar selector de iglesias
    if (user && user.role === 'admin') {
        document.getElementById('admin-controls').style.display = 'block';
        loadChurches();
    } else {
        // Si es secretaria, cargar directamente la tabla de visitas
        loadVisitsTable();
    }

    const newVisitBtn = document.getElementById('new-visit-btn');
    if (newVisitBtn) {
        newVisitBtn.addEventListener('click', () => {
            // Limpiar formulario antes de mostrar el modal
            clearNewVisitForm();
            
            // Mostrar el modal sin usar aria-hidden
            const modal = document.getElementById('new-visit-modal');
            $(modal).modal({
                show: true,
                // Esto evita que Bootstrap ponga aria-hidden="true" al modal
                keyboard: true
            });
            
            // Enfocar el primer input después de mostrar el modal
            $(modal).on('shown.bs.modal', function() {
                document.getElementById('new-visit-name').focus();
            });
        });
    }

    // Botón para cerrar sesión
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Limpiar localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('selectedChurch');
            localStorage.removeItem('selectedSecretary');
            localStorage.removeItem('role');
            localStorage.removeItem('isAdmin');
            
            // Redirigir a login
            window.location.href = 'login.html';
        });
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterVisitsTable(searchInput.value);
        });
    }

    $('#visit-modal').on('hidden.bs.modal', () => {
        selectedVisitId = null;
        // Devolver el foco al elemento que abrió el modal
        document.getElementById('visits-table').focus();
    });

    const newVisitForm = document.getElementById('new-visit-form');
    if (newVisitForm) {
        newVisitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveNewVisit();
        });
        
        // Manejar el cierre del modal correctamente
        $('#new-visit-modal').on('hidden.bs.modal', function () {
            // Asegurarse de que ningún elemento del modal tenga el foco
            document.activeElement.blur();
            // Devolver el foco al botón que abrió el modal
            setTimeout(() => {
                document.getElementById('new-visit-btn').focus();
            }, 10);
        });
    }
    
    // Manejar orientación en dispositivos móviles
    window.addEventListener('resize', handleOrientationChange);
    handleOrientationChange();
});

// Configurar ajustes de entrada para mejorar la experiencia en móviles
function setupMobileInputBehavior() {
    // Detectar si estamos en un dispositivo móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        const searchInput = document.getElementById('search-input');
        const formInputs = document.querySelectorAll('#new-visit-form input');
        const body = document.body;
        
        // Función para manejar el enfoque en inputs
        function handleFocus(e) {
            // Agregar clase al body cuando se enfoca un input
            body.classList.add('has-keyboard-open');
            
            // Asegurarnos que el input esté visible
            setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
        
        // Función para manejar la pérdida de enfoque
        function handleBlur() {
            // Quitar clase cuando se pierde el enfoque
            setTimeout(() => {
                body.classList.remove('has-keyboard-open');
            }, 100);
        }
        
        // Agregar eventos al input de búsqueda
        if (searchInput) {
            searchInput.addEventListener('focus', handleFocus);
            searchInput.addEventListener('blur', handleBlur);
        }
        
        // Agregar eventos a los inputs del formulario
        formInputs.forEach(input => {
            input.addEventListener('focus', handleFocus);
            input.addEventListener('blur', handleBlur);
        });
    }
    
    // Corregir comportamiento de modales para accesibilidad
    fixModalAccessibility();
}

// Función para corregir la accesibilidad en modales
function fixModalAccessibility() {
    // Corregir el nuevo modal de visita
    const newVisitModal = document.getElementById('new-visit-modal');
    if (newVisitModal) {
        // Escuchar el evento que Bootstrap dispara antes de mostrar el modal
        $(newVisitModal).on('show.bs.modal', function() {
            // Remover el atributo aria-hidden que Bootstrap podría haber añadido
            this.removeAttribute('aria-hidden');
        });
        
        // Añadir atributos de accesibilidad adicionales
        newVisitModal.setAttribute('aria-modal', 'true');
        newVisitModal.setAttribute('aria-labelledby', 'modal-title');
    }
    
    // Corregir el modal de detalles de visita
    const visitModal = document.getElementById('visit-modal');
    if (visitModal) {
        $(visitModal).on('show.bs.modal', function() {
            this.removeAttribute('aria-hidden');
        });
        
        visitModal.setAttribute('aria-modal', 'true');
        visitModal.setAttribute('aria-labelledby', 'visit-modal-title');
    }
}

// Manejar cambios de orientación en dispositivos móviles
function handleOrientationChange() {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        // Ajustar la tabla para móviles
        adjustTableForMobile();
    }
}

// Ajustar tabla para dispositivos móviles
function adjustTableForMobile() {
    const existingTable = document.querySelector('#visits-table table');
    if (existingTable) {
        const headers = existingTable.querySelectorAll('th');
        const rows = existingTable.querySelectorAll('tbody tr');
        
        // En pantallas muy pequeñas, compactar aún más
        if (window.innerWidth < 480) {
            // Reducir padding en las celdas
            const allCells = existingTable.querySelectorAll('td, th');
            allCells.forEach(cell => {
                cell.style.padding = '8px 4px';
            });
            
            // Ajustar tamaño de fuente
            existingTable.style.fontSize = '0.85rem';
        } else {
            // Restaurar estilos en pantallas más grandes
            const allCells = existingTable.querySelectorAll('td, th');
            allCells.forEach(cell => {
                cell.style.padding = '';
            });
            existingTable.style.fontSize = '';
        }
    }
}

// Limpiar formulario de nueva visita
function clearNewVisitForm() {
    const form = document.getElementById('new-visit-form');
    if (form) {
        form.reset();
    }
}

function loadVisitsTable() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const churchId = user.church_id || localStorage.getItem('selectedChurch');
    
    if (!churchId) {
        console.error('No se encontró churchId');
        return;
    }
    
    // Mostrar indicador de carga
    const visitsTable = document.getElementById('visits-table');
    if (visitsTable) {
        visitsTable.innerHTML = `
            <div class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Cargando...</span>
                </div>
                <p class="mt-2">Cargando datos de visitas...</p>
            </div>
        `;
    }
    
    // Primero, cargar todos los visitantes
    fetch(`/api/attendance/visits?churchId=${churchId}`)
        .then(response => response.json())
        .then(visits => {
            // Luego, cargar las asistencias de hoy
            fetch(`/api/attendance/today?churchId=${churchId}`)
                .then(response => response.json())
                .then(attendances => {
                    renderVisitsTable(visits, attendances);
                    // Ajustar tabla para dispositivos móviles después de renderizar
                    setTimeout(adjustTableForMobile, 100);
                })
                .catch(error => {
                    console.error('Error al cargar las asistencias:', error);
                    showErrorMessage(visitsTable, 'Error al cargar asistencias');
                });
        })
        .catch(error => {
            console.error('Error al cargar las visitas:', error);
            showErrorMessage(visitsTable, 'Error al cargar visitas');
        });
}

// Mostrar mensaje de error en la tabla
function showErrorMessage(container, message) {
    if (container) {
        container.innerHTML = `
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-circle mr-2"></i>
                <p>${message}. Por favor intente nuevamente.</p>
            </div>
        `;
    }
}

function renderVisitsTable(visits, attendances) {
    const visitsTable = document.getElementById('visits-table');
    visitsTable.innerHTML = '';

    if (visits.length === 0) {
        visitsTable.innerHTML = `
            <div class="alert alert-info text-center p-4">
                <i class="fas fa-info-circle fa-2x mb-3"></i>
                <p>No hay visitas registradas.</p>
            </div>`;
        return;
    }

    const table = document.createElement('table');
    table.className = 'table table-hover table-striped';

    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    
    // Detectar si estamos en un dispositivo móvil
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        trHead.innerHTML = `
            <th style="width: 40px; text-align: center;"><i class="fas fa-check-square" title="Estado"></i></th>
            <th>Nombre</th>
            <th>Invitado por</th>
            <th style="width: 50px; text-align: center;">Acción</th>
        `;
    } else {
        trHead.innerHTML = `
            <th style="width: 50px; text-align: center;"><i class="fas fa-check-square" title="Estado"></i></th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Invitado por</th>
            <th style="width: 70px; text-align: center;">Acción</th>
        `;
    }
    
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    
    // Crear un mapa de asistencias por id de visitante para acceso rápido
    const attendanceMap = new Map();
    attendances.forEach(attendance => {
        attendanceMap.set(attendance.visitor_id, attendance);
    });
    
    visits.forEach(visit => {
        // Verificar si el visitante tiene asistencia hoy
        const hasAttendance = attendanceMap.has(visit.id);
        const attendance = attendanceMap.get(visit.id);
        
        const tr = document.createElement('tr');
        
        // Añadir clase para resaltar visitas con asistencia confirmada
        if (hasAttendance) {
            tr.className = 'table-primary'; // Color azul para asistencias confirmadas
        }
        
        // Columna para el checkbox de "se puso de pie"
        const stoodUpCell = document.createElement('td');
        stoodUpCell.style.textAlign = 'center';
        stoodUpCell.style.verticalAlign = 'middle';
        
        const stoodUpCheckbox = document.createElement('input');
        stoodUpCheckbox.type = 'checkbox';
        stoodUpCheckbox.className = 'form-check-input';
        stoodUpCheckbox.id = `stood-up-${visit.id}`;
        stoodUpCheckbox.style.position = 'relative';
        stoodUpCheckbox.style.margin = '0 auto';
        
        // Si hay asistencia, establecer el estado del checkbox
        if (hasAttendance) {
            stoodUpCheckbox.checked = attendance.stood_up;
            stoodUpCheckbox.disabled = false;
            
            // Evento para actualizar cuando se cambia el checkbox
            stoodUpCheckbox.addEventListener('change', (e) => {
                e.stopPropagation(); // Evitar que el click propague a la fila
                updateStoodUp(attendance.id, e.target.checked);
            });
        } else {
            // Si no hay asistencia, desactivar el checkbox
            stoodUpCheckbox.disabled = true;
        }
        
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'd-flex justify-content-center align-items-center';
        checkboxWrapper.appendChild(stoodUpCheckbox);
        stoodUpCell.appendChild(checkboxWrapper);
        
        tr.appendChild(stoodUpCell);
        
        // Columna de nombre
        const nameCell = document.createElement('td');
        nameCell.textContent = visit.name;
        nameCell.style.verticalAlign = 'middle';
        tr.appendChild(nameCell);
        
        if (isMobile) {
            // En móvil, mostrar "invitado por" en lugar de teléfono
            const invitedByCell = document.createElement('td');
            invitedByCell.textContent = visit.invited_by || 'N/A';
            invitedByCell.style.verticalAlign = 'middle';
            tr.appendChild(invitedByCell);
            
            // Botón de acción (ojo para ver detalles)
            const actionCell = document.createElement('td');
            actionCell.style.textAlign = 'center';
            actionCell.style.verticalAlign = 'middle';
            
            const detailsButton = document.createElement('button');
            detailsButton.className = 'btn btn-sm btn-info';
            detailsButton.innerHTML = '<i class="fas fa-eye"></i>';
            detailsButton.title = 'Ver detalles';
            
            detailsButton.addEventListener('click', (e) => {
                e.stopPropagation();
                showVisitDetails(visit);
            });
            
            actionCell.appendChild(detailsButton);
            tr.appendChild(actionCell);
        } else {
            // En escritorio, mostrar teléfono y luego invitado por
            const phoneCell = document.createElement('td');
            phoneCell.textContent = visit.phone || 'N/A';
            phoneCell.style.verticalAlign = 'middle';
            tr.appendChild(phoneCell);
            
            const invitedByCell = document.createElement('td');
            invitedByCell.textContent = visit.invited_by || 'N/A';
            invitedByCell.style.verticalAlign = 'middle';
            tr.appendChild(invitedByCell);
            
            // Añadir botón de detalles también en escritorio
            const actionCell = document.createElement('td');
            actionCell.style.textAlign = 'center';
            actionCell.style.verticalAlign = 'middle';
            
            const detailsButton = document.createElement('button');
            detailsButton.className = 'btn btn-sm btn-info';
            detailsButton.innerHTML = '<i class="fas fa-eye"></i>';
            detailsButton.title = 'Ver detalles';
            
            detailsButton.addEventListener('click', (e) => {
                e.stopPropagation();
                showVisitDetails(visit);
            });
            
            actionCell.appendChild(detailsButton);
            tr.appendChild(actionCell);
        }
        
        // Agregar data-id para acceso fácil
        tr.dataset.visitId = visit.id;
        
        // Click simple para confirmar asistencia
        tr.addEventListener('click', function(e) {
            // No confirmar asistencia si se hizo clic en el checkbox o botón
            if (e.target.type === 'checkbox' || e.target.tagName.toLowerCase() === 'button' || 
                e.target.closest('button')) return;
            
            if (!hasAttendance) {
                confirmAttendance(visit.id);
            }
        });
        
        // Doble click para eliminar asistencia
        tr.addEventListener('dblclick', function(e) {
            // No eliminar asistencia si se hizo doble clic en el checkbox o botón
            if (e.target.type === 'checkbox' || e.target.tagName.toLowerCase() === 'button' || 
                e.target.closest('button')) return;
            
            if (hasAttendance) {
                deleteAttendance(visit.id);
            }
        });
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    visitsTable.appendChild(table);
}

function showVisitDetails(visit) {
    console.log('Mostrando detalles de visita:', visit);
    
    // Si recibimos un objeto completo de visita
    if (typeof visit === 'object' && visit !== null) {
        selectedVisitId = visit.id;
        document.getElementById('visit-name').textContent = visit.name;
        document.getElementById('visit-phone').textContent = visit.phone || 'N/A';
        document.getElementById('visit-address').textContent = visit.address || 'N/A';
        document.getElementById('visit-invited-by').textContent = visit.invited_by || 'N/A';
        
        // Mostrar el modal de visita con las mismas protecciones de accesibilidad
        const modal = document.getElementById('visit-modal');
        $(modal).modal({
            show: true,
            keyboard: true
        });
        
        // Asegurarnos de que el modal esté accesible
        modal.removeAttribute('aria-hidden');
        
        // Enfocar el botón de cerrar del modal
        $(modal).on('shown.bs.modal', function() {
            const closeBtn = modal.querySelector('.modal-footer .btn');
            if (closeBtn) closeBtn.focus();
        });
    } 
    // Si recibimos un ID de visita
    else if (typeof visit === 'number' || (typeof visit === 'string' && !isNaN(visit))) {
        const visitId = parseInt(visit);
        fetch(`/api/visits/${visitId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener detalles de la visita');
                }
                return response.json();
            })
            .then(visitData => {
                if (visitData && visitData.length) {
                    showVisitDetails(visitData[0]); // Llamada recursiva con el objeto completo
                } else {
                    console.error('No se encontraron datos para la visita ID:', visitId);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudieron obtener los datos de la visita'
                    });
                }
            })
            .catch(error => {
                console.error('Error al cargar los detalles de la visita:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al cargar los detalles de la visita'
                });
            });
    } else {
        console.error('Formato de visita no válido:', visit);
    }
}

function confirmAttendance(visitId) {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user.id;
    
    if (!visitId || !userId) {
        console.error('Falta ID de visitante o usuario');
        return;
    }
    
    const data = {
        visitor_id: visitId,
        user_id: userId
    };
    
    console.log('Enviando datos de asistencia:', data);
    
    fetch('/api/attendance/confirm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al confirmar asistencia');
        }
        return response.json();
    })
    .then(result => {
        // Emitir evento de asistencia confirmada
        emitConfirmAttendance({
            visitor_id: visitId,
            user_id: userId,
            attendance_id: result.id,
            timestamp: new Date()
        });
        
        // Cerrar modal y actualizar tabla
        $('#visit-modal').modal('hide');
        loadVisitsTable();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function deleteAttendance(visitId) {
    fetch(`/api/attendance/delete/${visitId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // Emitir evento de asistencia eliminada
            emitDeleteAttendance({
                visitor_id: visitId,
                timestamp: new Date()
            });
            
            // Recargar tabla
            loadVisitsTable();
        } else {
            console.error('Error al eliminar asistencia:', result.message);
        }
    })
    .catch(error => {
        console.error('Error al eliminar la asistencia:', error);
    });
}

function updateStoodUp(attendanceId, stoodUp) {
    fetch(`/api/attendance/${attendanceId}/stood-up`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stood_up: stoodUp })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al actualizar el estado');
        }
        return response.json();
    })
    .then(result => {
        // Emitir evento de asistencia actualizada
        emitUpdateAttendance({
            attendance_id: attendanceId,
            visitor_id: result.visitor_id,
            stood_up: stoodUp,
            timestamp: new Date()
        });
    })
    .catch(error => {
        console.error('Error:', error);
        // Revertir el cambio en la UI
        const checkbox = document.getElementById(`stood-up-${attendanceId}`);
        if (checkbox) {
            checkbox.checked = !stoodUp;
        }
    });
}

function saveNewVisit() {
    const name = document.getElementById('new-visit-name').value;
    const phone = document.getElementById('new-visit-phone').value;
    const address = document.getElementById('new-visit-address').value;
    const invitedBy = document.getElementById('new-visit-invited-by').value;
    
    if (!name || !phone || !invitedBy) {
        console.error('Por favor completa los campos obligatorios');
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user'));
    const churchId = user.church_id || localStorage.getItem('selectedChurch');
    const userId = user.id;
    
    if (!churchId) {
        console.error('No se encontró churchId');
        return;
    }
    
    if (!userId) {
        console.error('No se encontró userId');
        return;
    }
    
    const visitData = {
        name,
        phone,
        address,
        invited_by: invitedBy,
        church_id: churchId,
        user_id: userId
    };
    
    fetch('/api/visitors', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al registrar la visita');
        }
        return response.json();
    })
    .then(result => {
        // Emitir evento de nueva visita
        emitNewVisit({
            visitor: result,
            church_id: churchId,
            timestamp: new Date()
        });
        
        // Cerrar modal manualmente para evitar problemas con aria-hidden
        $('#new-visit-modal').modal('hide');
        
        // Resetear formulario
        document.getElementById('new-visit-form').reset();
        
        // Actualizar tabla
        loadVisitsTable();
        
        // Restaurar el foco al botón que abrió el modal
        setTimeout(() => {
            document.getElementById('new-visit-btn').focus();
        }, 300);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function filterVisitsTable(query) {
    const rows = document.querySelectorAll('#visits-table table tbody tr');
    rows.forEach(row => {
        const name = row.children[1].textContent.toLowerCase();
        const phone = row.children[2].textContent.toLowerCase();
        const invitedBy = row.children[3].textContent.toLowerCase();
        if (name.includes(query.toLowerCase()) || phone.includes(query.toLowerCase()) || invitedBy.includes(query.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
