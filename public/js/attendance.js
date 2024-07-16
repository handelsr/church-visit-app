const ws = new WebSocket(`wss://${window.location.hostname}:8080`);
let selectedVisitId = null;

ws.onopen = () => {
    console.log('Conexión establecida con el servidor WebSocket.');
};

ws.onerror = (error) => {
    console.error('Error en la conexión WebSocket:', error);
};

document.addEventListener('DOMContentLoaded', () => {
    loadVisitsTable();

    const newVisitBtn = document.getElementById('new-visit-btn');
    newVisitBtn.addEventListener('click', () => {
        $('#new-visit-modal').modal('show');
    });

    const backSecretariesBtn = document.getElementById('back-secretaries-btn');
    backSecretariesBtn.addEventListener('click', () => {
        window.location.href = '/secretaries.html';
    });

    const homeBtn = document.getElementById('home-btn');
    homeBtn.addEventListener('click', () => {
        window.location.href = '/index.html';
    });

    const viewAllVisitsBtn = document.getElementById('view-all-visits-btn');
    viewAllVisitsBtn.addEventListener('click', () => {
        loadAllVisits();
        $('#all-visits-modal').modal('show');
    });

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        filterVisitsTable(searchInput.value);
    });

    const allVisitsSearch = document.getElementById('all-visits-search');
    allVisitsSearch.addEventListener('input', () => {
        filterAllVisitsTable(allVisitsSearch.value);
    });

    $('#visit-modal').on('hidden.bs.modal', () => {
        selectedVisitId = null;
    });

    const confirmAttendanceBtn = document.getElementById('confirm-attendance-btn');
    confirmAttendanceBtn.addEventListener('click', () => {
        if (selectedVisitId) {
            confirmAttendance(selectedVisitId);
        }
    });

    const newVisitForm = document.getElementById('new-visit-form');
    newVisitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveNewVisit();
    });
});

function loadVisitsTable() {
    const churchId = localStorage.getItem('selectedChurch');
    fetch(`/api/attendance/visits?churchId=${churchId}`)
        .then(response => response.json())
        .then(visits => {
            renderVisitsTable(visits);
        })
        .catch(error => console.error('Error al cargar las visitas:', error));
}

function renderVisitsTable(visits) {
    const visitsTable = document.getElementById('visits-table');
    visitsTable.innerHTML = '';

    if (visits.length === 0) {
        visitsTable.innerHTML = '<p>No hay visitas registradas.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'table table-striped';

    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    trHead.innerHTML = `
        <th>Nombre</th>
        <th>Teléfono</th>
        <th>Invitado por</th>
        <th>Acciones</th>
    `;
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    visits.forEach(visit => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${visit.name}</td>
            <td>${visit.phone}</td>
            <td>${visit.invited_by}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="showVisitDetails(${visit.id})">Ver</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    visitsTable.appendChild(table);
}

function showVisitDetails(visitId) {
    fetch(`/api/attendance/visit/${visitId}`)
        .then(response => response.json())
        .then(visit => {
            selectedVisitId = visit.id;
            document.getElementById('visit-name').textContent = visit.name;
            document.getElementById('visit-phone').textContent = visit.phone;
            document.getElementById('visit-address').textContent = visit.address || 'No especificado';
            document.getElementById('visit-invited-by').textContent = visit.invited_by;
            $('#visit-modal').modal('show');
        })
        .catch(error => console.error('Error al cargar los detalles de la visita:', error));
}

function confirmAttendance(visitId) {
    const secretaryId = localStorage.getItem('selectedSecretary');
    fetch(`/api/attendance/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ visitId, secretaryId })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            Swal.fire({
                title: 'Asistencia Confirmada',
                text: 'La asistencia ha sido confirmada exitosamente.',
                icon: 'success'
            });
            $('#visit-modal').modal('hide');
            loadVisitsTable();
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al confirmar la asistencia.',
                icon: 'error'
            });
        }
    })
    .catch(error => console.error('Error al confirmar la asistencia:', error));
}

function saveNewVisit() {
    const churchId = localStorage.getItem('selectedChurch');
    const secretaryId = localStorage.getItem('selectedSecretary');
    const name = document.getElementById('new-visit-name').value;
    const phone = document.getElementById('new-visit-phone').value;
    const address = document.getElementById('new-visit-address').value;
    const invitedBy = document.getElementById('new-visit-invited-by').value;

    fetch('/api/attendance/visit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, phone, address, invited_by: invitedBy, church_id: churchId, secretary_id: secretaryId })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            Swal.fire({
                title: 'Visita Registrada',
                text: 'La nueva visita ha sido registrada exitosamente.',
                icon: 'success'
            });
            $('#new-visit-modal').modal('hide');
            document.getElementById('new-visit-form').reset();
            loadVisitsTable();
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al registrar la visita.',
                icon: 'error'
            });
        }
    })
    .catch(error => console.error('Error al registrar la visita:', error));
}

function loadAllVisits() {
    const churchId = localStorage.getItem('selectedChurch');
    fetch(`/api/attendance/all_visits?churchId=${churchId}`)
        .then(response => response.json())
        .then(visits => {
            renderAllVisitsTable(visits);
        })
        .catch(error => console.error('Error al cargar todas las visitas:', error));
}

function renderAllVisitsTable(visits) {
    const allVisitsTable = document.getElementById('all-visits-table');
    allVisitsTable.innerHTML = '';

    if (visits.length === 0) {
        allVisitsTable.innerHTML = '<p>No hay visitas registradas.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'table table-striped';

    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    trHead.innerHTML = `
        <th>Nombre</th>
        <th>Teléfono</th>
        <th>Invitado por</th>
    `;
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    visits.forEach(visit => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${visit.name}</td>
            <td>${visit.phone}</td>
            <td>${visit.invited_by}</td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    allVisitsTable.appendChild(table);
}

function filterVisitsTable(query) {
    const rows = document.querySelectorAll('#visits-table table tbody tr');
    rows.forEach(row => {
        const name = row.children[0].textContent.toLowerCase();
        const phone = row.children[1].textContent.toLowerCase();
        const invitedBy = row.children[2].textContent.toLowerCase();
        if (name.includes(query.toLowerCase()) || phone.includes(query.toLowerCase()) || invitedBy.includes(query.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function filterAllVisitsTable(query) {
    const rows = document.querySelectorAll('#all-visits-table table tbody tr');
    rows.forEach(row => {
        const name = row.children[0].textContent.toLowerCase();
        const phone = row.children[1].textContent.toLowerCase();
        const invitedBy = row.children[2].textContent.toLowerCase();
        if (name.includes(query.toLowerCase()) || phone.includes(query.toLowerCase()) || invitedBy.includes(query.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
