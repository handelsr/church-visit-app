// consultation.js

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
    const userInfoElement = document.getElementById('user-info');
    if (userInfoElement && user) {
        // Usar solo el username
        userInfoElement.textContent = user.username;
    }

    // Configurar ajustes de entrada para mejorar la experiencia en móviles
    setupMobileInputBehavior();

    // Dejar el filtro de fecha vacío por defecto
    document.getElementById('date-filter').value = '';
    
    // Cargar todos los visitantes al inicio, filtrando por la iglesia del usuario si no es admin
    // Mostrar indicador de carga
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.style.display = 'block';
    }
    
    console.log('Cargando visitantes...');
    
    // Determinar la URL correcta según el rol del usuario
    let url = '/api/visitors';
    
    // Si es secretary o viewer, filtrar por la iglesia a la que pertenece
    if (user && (user.role === 'secretary' || user.role === 'viewer') && user.church_id) {
        url = `/api/visitors/church?churchId=${user.church_id}`;
        console.log(`Filtrando por iglesia del usuario (ID: ${user.church_id})`);
    }
    
    // Cargar los visitantes según el filtro
    fetch(url)
        .then(response => {
            console.log('Respuesta de la API:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(visitors => {
            console.log('Visitantes recibidos:', visitors);
            if (visitors && Array.isArray(visitors) && visitors.length > 0) {
                console.log(`Se encontraron ${visitors.length} visitantes`);
                renderVisitsTable(visitors);
            } else {
                console.warn('No se recibieron visitas en la base de datos.');
                const visitsTable = document.getElementById('visits-table');
                if (visitsTable) {
                    visitsTable.innerHTML = `
                        <div class="alert alert-info text-center p-4">
                            <p>No se encontraron visitas en la base de datos.</p>
                        </div>
                    `;
                }
            }
        })
        .catch(error => {
            console.error('Error al cargar visitas:', error);
            const visitsTable = document.getElementById('visits-table');
            if (visitsTable) {
                visitsTable.innerHTML = `
                    <div class="alert alert-danger text-center">
                        <p>Error al cargar visitas. Por favor intente nuevamente.</p>
                        <small>${error.message}</small>
                    </div>
                `;
            }
        })
        .finally(() => {
            // Ocultar indicador de carga
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
        });
    
    // Si el usuario es administrador, mostrar el selector de iglesias, ocultar para otros roles
    if (user && user.role === 'admin') {
        document.getElementById('church-filter-container').style.display = 'block';
        loadChurches();
    } else {
        // Ocultar el filtro de iglesias para otros roles (secretary, viewer)
        document.getElementById('church-filter-container').style.display = 'none';
    }
    
    // Mostrar/ocultar el botón de asistencias según el rol
    const attendanceButton = document.getElementById('attendance-btn');
    if (attendanceButton) {
        // Mostrar el botón solo para secretarias
        if (user.role === 'secretary') {
            attendanceButton.style.display = 'inline-block';
        } else {
            attendanceButton.style.display = 'none';
        }
    }
    
    // Mostrar/ocultar botón de gestión de usuarios según el rol
    const adminUsersBtn = document.getElementById('admin-users-btn');
    if (adminUsersBtn && user) {
        // Solo mostrar para administradores
        if (user.role === 'admin') {
            adminUsersBtn.style.display = 'inline-block';
        } else {
            adminUsersBtn.style.display = 'none';
        }
    }
    
    // Configurar botón de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('selectedChurch');
            localStorage.removeItem('selectedSecretary');
            localStorage.removeItem('role');
            localStorage.removeItem('isAdmin');
            
            window.location.href = 'login.html';
        });
    }
    
    // Configurar botón de búsqueda por fecha
    const searchByDateBtn = document.getElementById('search-by-date-btn');
    if (searchByDateBtn) {
        searchByDateBtn.addEventListener('click', () => {
            const date = document.getElementById('date-filter').value;
            if (date) {
                // Si hay una fecha, buscar por esa fecha
                loadVisitsByDate(date);
            } else {
                // Si la fecha está vacía, cargar los visitantes según el rol del usuario
                console.log('Campo de fecha vacío, cargando visitantes');
                
                // Mostrar indicador de carga
                const loadingMessage = document.getElementById('loading-message');
                if (loadingMessage) {
                    loadingMessage.style.display = 'block';
                }
                
                // Determinar la URL correcta según el rol del usuario
                let url = '/api/visitors';
                
                // Si es secretary o viewer, filtrar por la iglesia a la que pertenece
                if (user && (user.role === 'secretary' || user.role === 'viewer') && user.church_id) {
                    url = `/api/visitors/church?churchId=${user.church_id}`;
                    console.log(`Filtrando por iglesia del usuario (ID: ${user.church_id})`);
                }
                
                // Usar la API de visitantes con el filtro adecuado
                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error ${response.status}: ${response.statusText}`);
                        }
                        return response.json();
                    })
                    .then(visitors => {
                        console.log('Visitantes recibidos:', visitors);
                        renderVisitsTable(visitors);
                    })
                    .catch(error => {
                        console.error('Error al cargar visitantes:', error);
                        const visitsTable = document.getElementById('visits-table');
                        if (visitsTable) {
                            visitsTable.innerHTML = `
                                <div class="alert alert-danger text-center">
                                    <p>Error al cargar los visitantes. Por favor intente nuevamente.</p>
                                    <small>${error.message}</small>
                                </div>
                            `;
                        }
                    })
                    .finally(() => {
                        // Ocultar indicador de carga
                        if (loadingMessage) {
                            loadingMessage.style.display = 'none';
                        }
                    });
            }
        });
    }
    
    // Configurar botón de filtro por iglesia (solo visible para admin)
    const filterByChurchBtn = document.getElementById('filter-by-church-btn');
    if (filterByChurchBtn) {
        filterByChurchBtn.addEventListener('click', () => {
            const churchId = document.getElementById('church-filter').value;
            loadVisitsByChurch(churchId);
        });
    }
    
    // Configurar búsqueda en tiempo real
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterVisitsTable(searchInput.value);
        });
    }
});

// Cargar iglesias para el filtro (solo para admin)
function loadChurches() {
    fetch('/api/churches')
        .then(response => response.json())
        .then(churches => {
            const select = document.getElementById('church-filter');
            if (!select) return;
            
            // Limpiar opciones existentes excepto la primera (Todas las iglesias)
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            churches.forEach(church => {
                const option = document.createElement('option');
                option.value = church.id;
                option.textContent = church.name;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error al cargar las iglesias:', error));
}

// Cargar todas las visitas
function loadAllVisits() {
    const user = JSON.parse(localStorage.getItem('user'));
    let url = '/api/visits';
    
    // Si es secretaria, filtrar por su ID
    if (user.role === 'secretary' && user.secretary_id) {
        url += `?secretary_id=${user.secretary_id}`;
    } else if (user.role === 'admin' && document.getElementById('church-filter').value) {
        // Si es admin y hay una iglesia seleccionada
        url += `?church_id=${document.getElementById('church-filter').value}`;
    }
    
    console.log('Consultando URL:', url);
    
    fetch(url)
        .then(response => {
            console.log('Respuesta de la API:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos recibidos:', data);
            // Verificar la estructura de los datos
            if (data && Array.isArray(data)) {
                // Si la respuesta es un array directamente
                renderVisitsTable(data);
            } else if (data && data.visits && Array.isArray(data.visits)) {
                // Si la respuesta tiene una propiedad 'visits' que es un array
                renderVisitsTable(data.visits);
            } else {
                // Si no se ajusta a ninguna estructura esperada
                console.error('Estructura de datos no reconocida:', data);
                throw new Error('Los datos recibidos no tienen el formato esperado');
            }
        })
        .catch(error => {
            console.error('Error al cargar visitas:', error);
            const visitsTable = document.getElementById('visits-table');
            if (visitsTable) {
                visitsTable.innerHTML = `
                    <div class="alert alert-danger text-center">
                        <p>Error al cargar visitas. Por favor intente nuevamente.</p>
                        <small>${error.message}</small>
                    </div>
                `;
            }
        });
}

// Cargar visitas por fecha
function loadVisitsByDate(date) {
    // Mostrar indicador de carga
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.style.display = 'block';
    }
    
    fetch(`/api/visitors/date?date=${date}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(visits => {
            renderVisitsTable(visits);
        })
        .catch(error => {
            console.error('Error al cargar las visitas por fecha:', error);
            const visitsTable = document.getElementById('visits-table');
            if (visitsTable) {
                visitsTable.innerHTML = `
                    <div class="alert alert-danger text-center">
                        <p>Error al cargar las visitas. Por favor intente nuevamente.</p>
                        <small>${error.message}</small>
                    </div>
                `;
            }
        })
        .finally(() => {
            // Ocultar indicador de carga
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
        });
}

// Cargar visitas por iglesia
function loadVisitsByChurch(churchId) {
    // Mostrar indicador de carga
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.style.display = 'block';
    }
    
    // Si no hay churchId, cargar todas las visitas
    const url = churchId ? `/api/visitors/church?churchId=${churchId}` : '/api/visitors';
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(visits => {
            renderVisitsTable(visits);
        })
        .catch(error => {
            console.error('Error al cargar las visitas por iglesia:', error);
            const visitsTable = document.getElementById('visits-table');
            if (visitsTable) {
                visitsTable.innerHTML = `
                    <div class="alert alert-danger text-center">
                        <p>Error al cargar las visitas. Por favor intente nuevamente.</p>
                        <small>${error.message}</small>
                    </div>
                `;
            }
        })
        .finally(() => {
            // Ocultar indicador de carga
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
        });
}

// Configurar ajustes de entrada para mejorar la experiencia en móviles
function setupMobileInputBehavior() {
    // Detectar si estamos en un dispositivo móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        const searchInput = document.getElementById('search-input');
        const dateFilter = document.getElementById('date-filter');
        const churchFilter = document.getElementById('church-filter');
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
        
        // Agregar eventos a los inputs
        if (searchInput) {
            searchInput.addEventListener('focus', handleFocus);
            searchInput.addEventListener('blur', handleBlur);
        }
        
        if (dateFilter) {
            dateFilter.addEventListener('focus', handleFocus);
            dateFilter.addEventListener('blur', handleBlur);
        }
        
        if (churchFilter) {
            churchFilter.addEventListener('focus', handleFocus);
            churchFilter.addEventListener('blur', handleBlur);
        }
        
        // Función para desplazarse a la tabla cuando se envía un formulario
        function scrollToResults() {
            const visitsTable = document.getElementById('visits-table');
            if (visitsTable) {
                setTimeout(() => {
                    visitsTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 500);
            }
        }
        
        // Agregar eventos a los botones de búsqueda
        const searchByDateBtn = document.getElementById('search-by-date-btn');
        if (searchByDateBtn) {
            searchByDateBtn.addEventListener('click', scrollToResults);
        }
        
        const filterByChurchBtn = document.getElementById('filter-by-church-btn');
        if (filterByChurchBtn) {
            filterByChurchBtn.addEventListener('click', scrollToResults);
        }
    }
}

// Renderizar tabla de visitas
function renderVisitsTable(visits) {
    const visitsTable = document.getElementById('visits-table');
    if (!visitsTable) {
        console.error('No se encontró el elemento #visits-table');
        return;
    }
    
    visitsTable.innerHTML = '';
    
    // Verificar si visits es un array válido
    if (!visits || !Array.isArray(visits)) {
        visitsTable.innerHTML = '<div class="alert alert-warning text-center p-4"><p>No se recibieron datos de visitas en el formato esperado</p></div>';
        return;
    }
    
    // Si el array está vacío
    if (visits.length === 0) {
        visitsTable.innerHTML = '<div class="alert alert-info text-center p-4"><p>No se encontraron visitas</p></div>';
        return;
    }
    
    // Verificar si estamos filtrando por fecha
    const isDateFiltered = visits[0].hasOwnProperty('arrival_time');
    
    // Si es filtrado por fecha, ordenar por hora de llegada
    if (isDateFiltered) {
        visits.sort((a, b) => {
            return new Date('1970/01/01 ' + a.arrival_time) - new Date('1970/01/01 ' + b.arrival_time);
        });
    }
    
    const table = document.createElement('table');
    table.className = 'table table-striped table-hover';
    
    const thead = document.createElement('thead');
    thead.className = 'thead-light';
    const theadRow = document.createElement('tr');
    
    // Definir encabezados según el tipo de consulta
    let headers;
    // Determinar si estamos en un dispositivo móvil para ajustar encabezados
    const isMobile = window.innerWidth < 768;
    
    if (isDateFiltered) {
        if (isMobile) {
            // Versión reducida para móviles
            headers = [
                { text: 'Nombre', align: 'left' },
                { text: 'Hora', align: 'center' },
                { text: 'Pie', align: 'center' },
                { text: 'Acciones', align: 'center' }
            ];
        } else {
            // Versión completa para tablets/desktop
            headers = [
                { text: 'Nombre', align: 'left' },
                { text: 'Invitado por', align: 'left' },
                { text: 'Hora de llegada', align: 'center' },
                { text: 'Se puso de pie', align: 'center' },
                { text: 'Total visitas', align: 'center' },
                { text: 'Acciones', align: 'center' }
            ];
        }
    } else {
        if (isMobile) {
            // Versión reducida para móviles
            headers = [
                { text: 'Nombre', align: 'left' },
                { text: 'Veces de pie', align: 'center' },
                { text: 'Acciones', align: 'center' }
            ];
        } else {
            // Versión completa para tablets/desktop
            headers = [
                { text: 'Nombre', align: 'left' },
                { text: 'Invitado por', align: 'left' },
                { text: 'Veces de pie', align: 'center' },
                { text: 'Total visitas', align: 'center' },
                { text: 'Acciones', align: 'center' }
            ];
        }
    }
    
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.text;
        th.scope = 'col';
        th.style.textAlign = header.align;
        theadRow.appendChild(th);
    });
    
    thead.appendChild(theadRow);
    table.appendChild(thead);
    
    // Cuerpo de la tabla
    const tbody = document.createElement('tbody');
    
    visits.forEach(visit => {
        const row = document.createElement('tr');
        
        // Nombre
        const nameCell = document.createElement('td');
        nameCell.textContent = visit.name;
        nameCell.style.textAlign = 'left';
        row.appendChild(nameCell);
        
        // Invitado por (solo mostrar en escritorio)
        if (!isMobile || (isMobile && isDateFiltered)) {
            if (!isMobile) { // Solo en escritorio o si es filtrado por fecha en móvil
                const invitedByCell = document.createElement('td');
                invitedByCell.textContent = visit.invited_by || 'N/A';
                invitedByCell.style.textAlign = 'left';
                row.appendChild(invitedByCell);
            }
        }
        
        // Si es filtrado por fecha, mostrar hora de llegada y si se puso de pie
        if (isDateFiltered) {
            // Hora de llegada
            const arrivalTimeCell = document.createElement('td');
            const formattedTime = formatTime(visit.arrival_time);
            arrivalTimeCell.textContent = formattedTime;
            arrivalTimeCell.style.textAlign = 'center';
            row.appendChild(arrivalTimeCell);
            
            // Se puso de pie (para la fecha específica)
            const stoodUpCell = document.createElement('td');
            const stoodUpIcon = document.createElement('i');
            
            if (visit.stood_up) {
                stoodUpIcon.className = 'fas fa-check fa-lg check-icon';
                stoodUpIcon.title = 'Sí se puso de pie';
            } else {
                stoodUpIcon.className = 'fas fa-times fa-lg cross-icon';
                stoodUpIcon.title = 'No se puso de pie';
            }
            
            stoodUpCell.appendChild(stoodUpIcon);
            stoodUpCell.style.textAlign = 'center';
            row.appendChild(stoodUpCell);
        } else {
            // Veces que se ha puesto de pie (total histórico)
            const stoodUpCountCell = document.createElement('td');
            stoodUpCountCell.textContent = visit.stood_up_count || '0';
            stoodUpCountCell.style.textAlign = 'center';
            row.appendChild(stoodUpCountCell);
        }
        
        // Total de visitas (solo mostrar en escritorio)
        if (!isMobile) {
            const visitsCountCell = document.createElement('td');
            visitsCountCell.textContent = visit.visits_count || '0';
            visitsCountCell.style.textAlign = 'center';
            row.appendChild(visitsCountCell);
        }
        
        // Botón para ver detalles
        const actionsCell = document.createElement('td');
        actionsCell.style.textAlign = 'center';
        
        const detailsButton = document.createElement('button');
        detailsButton.className = 'btn btn-sm btn-info';
        
        // En móvil, solo mostrar el ícono sin texto
        if (isMobile) {
            detailsButton.innerHTML = '<i class="fas fa-eye"></i>';
        } else {
            detailsButton.innerHTML = '<i class="fas fa-eye"></i> Detalles';
        }
        
        detailsButton.title = 'Ver detalles del visitante';
        detailsButton.addEventListener('click', () => showVisitorDetails(visit));
        
        actionsCell.appendChild(detailsButton);
        row.appendChild(actionsCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    visitsTable.appendChild(table);
    
    // Agregar contador y tiempo de carga
    const timestamp = document.createElement('div');
    timestamp.className = 'mt-2 text-right small text-muted';
    timestamp.textContent = `Mostrando ${visits.length} registro(s) - ${new Date().toLocaleString()}`;
    visitsTable.appendChild(timestamp);
}

// Función para formatear la hora
function formatTime(timeString) {
    if (!timeString) return 'N/A';
    
    try {
        // Convertir el formato de 24 horas a 12 horas con AM/PM
        const timeParts = timeString.split(':');
        let hours = parseInt(timeParts[0], 10);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // Convertir 0 a 12
        
        return `${hours}:${minutes} ${ampm}`;
    } catch (error) {
        console.error('Error al formatear la hora:', error);
        return timeString;
    }
}

// Filtrar tabla por texto
function filterVisitsTable(query) {
    query = query.toLowerCase();
    const rows = document.querySelectorAll('#visits-table tbody tr');
    
    let visibleCount = 0;
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(query)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Actualizar contador de resultados filtrados
    const timestamp = document.querySelector('#visits-table .text-right');
    if (timestamp && query) {
        const totalRows = rows.length;
        timestamp.textContent = `Mostrando ${visibleCount} de ${totalRows} registro(s) - Filtrado por: "${query}"`;
    }
}

// Función para mostrar los detalles del visitante en un modal
function showVisitorDetails(visitor) {
    // Mostrar un indicador de carga inicial
    Swal.fire({
        title: 'Cargando datos',
        html: 'Obteniendo información del visitante...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Obtener los datos completos del visitante desde la API
    fetch(`/api/visitors/${visitor.id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(visitorData => {
            // Cerrar el indicador de carga
            Swal.close();
            
            // Si no hay datos, mostrar error
            if (!visitorData || visitorData.length === 0) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo obtener la información del visitante',
                    icon: 'error'
                });
                return;
            }
            
            // Usar los datos completos del visitante
            const visitorInfo = visitorData[0];
            
            // Verificar si estamos en un dispositivo móvil
            const isMobile = window.innerWidth < 768;
            
            // Crear una versión simplificada para móviles
            if (isMobile) {
                Swal.fire({
                    title: visitorInfo.name,
                    html: `
                        <div class="text-left">
                            <p><i class="fas fa-phone mr-2 text-info"></i> <strong>Teléfono:</strong> ${visitorInfo.phone || 'No registrado'}</p>
                            <p><i class="fas fa-map-marker-alt mr-2 text-info"></i> <strong>Dirección:</strong> ${visitorInfo.address || 'No registrada'}</p>
                            <p><i class="fas fa-user-friends mr-2 text-info"></i> <strong>Invitado por:</strong> ${visitorInfo.invited_by || 'No registrado'}</p>
                        </div>
                    `,
                    confirmButtonText: 'Cerrar',
                    confirmButtonColor: '#3085d6'
                });
                return;
            }
            
            // Versión de escritorio (modal Bootstrap)
            // Crear el contenido del modal HTML
            let modalHTML = `
                <div class="modal-header bg-info text-white">
                    <h5 class="modal-title">
                        <i class="fas fa-id-card mr-2"></i>
                        Información de Contacto
                    </h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Cerrar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-4">
                        <h3>${visitorInfo.name}</h3>
                    </div>
                    
                    <div class="card">
                        <div class="card-body">
                            <p><i class="fas fa-phone mr-2 text-info"></i> <strong>Teléfono:</strong> ${visitorInfo.phone || 'No registrado'}</p>
                            <p><i class="fas fa-map-marker-alt mr-2 text-info"></i> <strong>Dirección:</strong> ${visitorInfo.address || 'No registrada'}</p>
                            <p><i class="fas fa-user-friends mr-2 text-info"></i> <strong>Invitado por:</strong> ${visitorInfo.invited_by || 'No registrado'}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                </div>
            `;
            
            // Crear un div para el modal
            const modalContainer = document.createElement('div');
            modalContainer.className = 'modal fade';
            modalContainer.id = 'visitorDetailsModal';
            modalContainer.tabIndex = '-1';
            modalContainer.role = 'dialog';
            modalContainer.setAttribute('aria-labelledby', 'visitorDetailsModalLabel');
            modalContainer.setAttribute('aria-hidden', 'true');
            
            const modalDialog = document.createElement('div');
            modalDialog.className = 'modal-dialog';
            modalDialog.role = 'document';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            modalContent.innerHTML = modalHTML;
            
            modalDialog.appendChild(modalContent);
            modalContainer.appendChild(modalDialog);
            
            // Eliminar modal anterior si existe
            const existingModal = document.getElementById('visitorDetailsModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // Añadir el modal al DOM
            document.body.appendChild(modalContainer);
            
            // Mostrar el modal
            $('#visitorDetailsModal').modal('show');
        })
        .catch(error => {
            console.error('Error al obtener los datos del visitante:', error);
            Swal.fire({
                title: 'Error',
                text: `No se pudo obtener la información del visitante: ${error.message}`,
                icon: 'error'
            });
        });
}

// Función para formatear una fecha
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch (error) {
        console.error('Error al formatear la fecha:', error);
        return dateString;
    }
}
