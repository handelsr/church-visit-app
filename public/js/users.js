// users.js - Gestión CRUD de usuarios (admin)

// Variable para almacenar el ID del usuario a editar o eliminar
let selectedUserId = null;

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
    
    // Verificar si el usuario es administrador
    if (!user || user.role !== 'admin') {
        // Si no es admin, redirigir a consulta
        Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'Solo los administradores pueden acceder a esta página',
            confirmButtonText: 'Entendido'
        }).then(() => {
            window.location.href = '/consultation.html';
        });
        return;
    }
    
    // Mostrar el nombre de usuario en la interfaz
    const userInfoElement = document.getElementById('user-info');
    if (userInfoElement && user) {
        // Usar el nombre si está disponible, sino usar el username
        const displayName = user.name || user.username;
        userInfoElement.textContent = `${displayName} | Administrador`;
    }
    
    // Cargar iglesias para el selector
    loadChurches();
    
    // Cargar la tabla de usuarios
    loadUsersTable();
    
    // Botón para nuevo usuario
    const newUserBtn = document.getElementById('new-user-btn');
    if (newUserBtn) {
        newUserBtn.addEventListener('click', () => {
            // Resetear el formulario
            document.getElementById('user-form').reset();
            // Limpiar ID seleccionado
            selectedUserId = null;
            // Cambiar título del modal
            document.getElementById('modal-title').textContent = 'Nuevo Usuario';
            // Mostrar el modal
            $('#user-modal').modal('show');
        });
    }
    
    // Botón para guardar usuario
    const saveUserBtn = document.getElementById('save-user-btn');
    if (saveUserBtn) {
        saveUserBtn.addEventListener('click', saveUser);
    }
    
    // Botón para confirmar eliminación
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', deleteUser);
    }
    
    // Campo de búsqueda
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterUsersTable(searchInput.value);
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
});

// Cargar la tabla de usuarios
function loadUsersTable() {
    const tableContainer = document.getElementById('users-table');
    const loadingMessage = document.getElementById('loading-message');
    
    if (loadingMessage) {
        loadingMessage.style.display = 'block';
    }
    
    fetch('/api/users', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(users => {
            renderUsersTable(users);
        })
        .catch(error => {
            console.error('Error al cargar usuarios:', error);
            if (tableContainer) {
                tableContainer.innerHTML = `
                    <div class="alert alert-danger text-center">
                        <p>Error al cargar los usuarios. Por favor intente nuevamente.</p>
                        <small>${error.message}</small>
                    </div>
                `;
            }
        })
        .finally(() => {
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
        });
}

// Cargar iglesias para el selector
function loadChurches() {
    fetch('/api/churches', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
        .then(response => response.json())
        .then(churches => {
            const select = document.getElementById('church-id');
            if (!select) return;
            
            // Limpiar opciones existentes excepto la primera
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

// Renderizar tabla de usuarios
function renderUsersTable(users) {
    const tableContainer = document.getElementById('users-table');
    tableContainer.innerHTML = '';
    
    if (!users || users.length === 0) {
        tableContainer.innerHTML = '<div class="alert alert-info text-center p-4"><p>No hay usuarios registrados</p></div>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'table table-striped table-hover';
    
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    trHead.innerHTML = `
        <th>Nombre de usuario</th>
        <th>Nombre completo</th>
        <th>Rol</th>
        <th>Iglesia</th>
        <th class="text-center">Acciones</th>
    `;
    thead.appendChild(trHead);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        
        // Columnas de información
        const usernameCell = document.createElement('td');
        usernameCell.textContent = user.username;
        tr.appendChild(usernameCell);
        
        const nameCell = document.createElement('td');
        nameCell.textContent = user.name || user.username;
        tr.appendChild(nameCell);
        
        const roleCell = document.createElement('td');
        roleCell.textContent = translateRole(user.role);
        tr.appendChild(roleCell);
        
        const churchCell = document.createElement('td');
        churchCell.textContent = user.church_name || 'No asignada';
        tr.appendChild(churchCell);
        
        // Columna de acciones
        const actionsCell = document.createElement('td');
        actionsCell.className = 'text-center';
        
        // Botón editar
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-info mr-2';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Editar usuario';
        editBtn.addEventListener('click', () => showEditUserModal(user));
        actionsCell.appendChild(editBtn);
        
        // Botón eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Eliminar usuario';
        deleteBtn.addEventListener('click', () => showDeleteConfirmation(user));
        actionsCell.appendChild(deleteBtn);
        
        tr.appendChild(actionsCell);
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

// Traducir role a español
function translateRole(role) {
    const roles = {
        'admin': 'Administrador',
        'secretary': 'Secretaria',
        'viewer': 'Consulta'
    };
    return roles[role] || role;
}

// Mostrar modal para editar usuario
function showEditUserModal(user) {
    selectedUserId = user.id;
    
    // Actualizar título del modal
    document.getElementById('modal-title').textContent = 'Editar Usuario';
    
    // Llenar el formulario con los datos del usuario
    document.getElementById('user-id').value = user.id;
    document.getElementById('username').value = user.username;
    document.getElementById('name').value = user.name || '';
    document.getElementById('password').value = ''; // No mostrar contraseña
    
    // Seleccionar el rol
    const roleSelect = document.getElementById('role');
    for (let i = 0; i < roleSelect.options.length; i++) {
        if (roleSelect.options[i].value === user.role) {
            roleSelect.selectedIndex = i;
            break;
        }
    }
    
    // Seleccionar la iglesia
    const churchSelect = document.getElementById('church-id');
    if (user.church_id) {
        for (let i = 0; i < churchSelect.options.length; i++) {
            if (churchSelect.options[i].value == user.church_id) {
                churchSelect.selectedIndex = i;
                break;
            }
        }
    } else {
        churchSelect.selectedIndex = 0;
    }
    
    // Mostrar el modal
    $('#user-modal').modal('show');
}

// Mostrar confirmación para eliminar usuario
function showDeleteConfirmation(user) {
    selectedUserId = user.id;
    document.getElementById('delete-username').textContent = user.username;
    $('#delete-modal').modal('show');
}

// Guardar usuario (crear o actualizar)
function saveUser() {
    // Obtener datos del formulario
    const username = document.getElementById('username').value;
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const churchId = document.getElementById('church-id').value;
    
    // Validar campos requeridos
    if (!username || !name || !role || !churchId) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor complete todos los campos requeridos'
        });
        return;
    }
    
    // Crear objeto con datos del usuario
    const userData = {
        username,
        name,
        role,
        church_id: churchId
    };
    
    // Si hay contraseña (nuevo usuario o cambio de contraseña)
    if (password) {
        userData.password = password;
    }
    
    // Determinar si es creación o actualización
    const url = selectedUserId 
        ? `/api/users/${selectedUserId}` 
        : '/api/users';
    
    const method = selectedUserId ? 'PUT' : 'POST';
    
    // Enviar solicitud
    fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error en la operación') });
        }
        return response.json();
    })
    .then(result => {
        // Cerrar modal
        $('#user-modal').modal('hide');
        
        // Mostrar mensaje de éxito
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: selectedUserId 
                ? 'Usuario actualizado correctamente' 
                : 'Usuario creado correctamente'
        });
        
        // Recargar tabla
        loadUsersTable();
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Ha ocurrido un error'
        });
    });
}

// Eliminar usuario
function deleteUser() {
    if (!selectedUserId) {
        console.error('No hay ID de usuario seleccionado');
        return;
    }
    
    fetch(`/api/users/${selectedUserId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error al eliminar usuario') });
        }
        return response.json();
    })
    .then(result => {
        // Cerrar modal
        $('#delete-modal').modal('hide');
        
        // Mostrar mensaje de éxito
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Usuario eliminado correctamente'
        });
        
        // Recargar tabla
        loadUsersTable();
    })
    .catch(error => {
        console.error('Error:', error);
        $('#delete-modal').modal('hide');
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Ha ocurrido un error al eliminar el usuario'
        });
    });
}

// Filtrar tabla de usuarios
function filterUsersTable(query) {
    query = query.toLowerCase();
    const rows = document.querySelectorAll('#users-table tbody tr');
    
    rows.forEach(row => {
        const username = row.cells[0].textContent.toLowerCase();
        const name = row.cells[1].textContent.toLowerCase();
        const role = row.cells[2].textContent.toLowerCase();
        const church = row.cells[3].textContent.toLowerCase();
        
        if (username.includes(query) || name.includes(query) || 
            role.includes(query) || church.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
} 