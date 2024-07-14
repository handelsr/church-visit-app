// attendance.js

const ws = new WebSocket('ws://localhost:8080');
let selectedVisitId = null;

ws.onopen = () => {
    console.log('Conexión establecida con el servidor WebSocket.');
};

ws.onerror = (error) => {
    console.error('Error en la conexión WebSocket:', error);
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'update_visits') {
        loadVisitsTable();
    }
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
    visitsTable.innerHTML = ''; // Limpiar tabla anterior

    if (visits.length === 0) {
        visitsTable.innerHTML = '<p>No hay visitas registradas.</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('table', 'table-striped', 'table-hover');
    const header = table.createTHead();
    const row = header.insertRow();
    row.innerHTML = '<th>Nombre</th><th>Teléfono</th><th>Dirección</th><th>Invitado por</th><th>Acciones</th>';

    const tbody = table.createTBody();
    visits.forEach(visit => {
        const tr = tbody.insertRow();
        tr.innerHTML = `
            <td>${visit.name}</td>
            <td>${visit.phone}</td>
            <td>${visit.address ? visit.address : ''}</td>
            <td>${visit.invited_by}</td>
            <td><button class="btn btn-info view-btn" data-id="${visit.id}">Ver</button></td>`;
    });

    tbody.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('view-btn')) {
            const visitId = target.getAttribute('data-id');
            openVisitModal(visitId);
        }
    });

    visitsTable.appendChild(table);
}

function filterVisitsTable(query) {
    const rows = document.querySelectorAll('#visits-table tbody tr');
    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const phone = row.cells[1].textContent.toLowerCase();
        const address = row.cells[2].textContent.toLowerCase();
        const invitedBy = row.cells[3].textContent.toLowerCase();
        const searchQuery = query.toLowerCase();

        if (name.includes(searchQuery) || phone.includes(searchQuery) || address.includes(searchQuery) || invitedBy.includes(searchQuery)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function loadAllVisits() {
    fetch('/api/visitors')
        .then(response => response.json())
        .then(visits => {
            renderAllVisitsTable(visits);
        })
        .catch(error => console.error('Error al cargar todas las visitas:', error));
}

function renderAllVisitsTable(visits) {
    const allVisitsTable = document.getElementById('all-visits-table');
    allVisitsTable.innerHTML = ''; // Limpiar tabla anterior

    if (visits.length === 0) {
        allVisitsTable.innerHTML = '<p>No hay visitas registradas.</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('table', 'table-striped', 'table-hover');
    const header = table.createTHead();
    const row = header.insertRow();
    row.innerHTML = `
        <th>Nombre</th>
        <th>Teléfono</th>
        <th>Dirección</th>
        <th>Invitado por</th>
        <th>Secretaria</th>
        <th>Iglesia</th>
        <th>Cantidad de Visitas</th>`;

    const tbody = table.createTBody();
    visits.forEach(visit => {
        const tr = tbody.insertRow();
        tr.innerHTML = `
            <td>${visit.name}</td>
            <td>${visit.phone}</td>
            <td>${visit.address ? visit.address : ''}</td>
            <td>${visit.invited_by}</td>
            <td>${visit.secretary_name}</td>
            <td>${visit.church_name}</td>
            <td>${visit.visits_count}</td>`;
    });

    tbody.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('view-btn')) {
            const visitId = target.getAttribute('data-id');
            openVisitModal(visitId);
        }
    });

    allVisitsTable.appendChild(table);
}

function filterAllVisitsTable(query) {
    const rows = document.querySelectorAll('#all-visits-table tbody tr');
    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const phone = row.cells[1].textContent.toLowerCase();
        const address = row.cells[2].textContent.toLowerCase();
        const invitedBy = row.cells[3].textContent.toLowerCase();
        const searchQuery = query.toLowerCase();

        if (name.includes(searchQuery) || phone.includes(searchQuery) || address.includes(searchQuery) || invitedBy.includes(searchQuery)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function openVisitModal(visitId) {
    selectedVisitId = visitId;
    fetch(`/api/visits/${visitId}`)
        .then(response => response.json())
        .then(visit => {
            if (visit.length) {
                document.getElementById('visit-name').textContent = visit[0].name;
                document.getElementById('visit-phone').textContent = visit[0].phone;
                document.getElementById('visit-address').textContent = visit[0].address ? visit[0].address : '';
                document.getElementById('visit-invited-by').textContent = visit[0].invited_by;
                $('#visit-modal').modal('show');
            }
        })
        .catch(error => console.error('Error al cargar los detalles de la visita:', error));
}

function confirmAttendance(visitId) {
    const secretaryId = localStorage.getItem('selectedSecretary');
    fetch(`/api/attendance/${visitId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ secretary_id: secretaryId }) // Reemplazar con el ID de la secretaria actual
    })
    .then(response => {
        if (response.ok) {
            $('#visit-modal').modal('hide');
            ws.send(JSON.stringify({ type: 'update_visits' }));
            Swal.fire({
                title: "¡Buenas noticias!",
                text: "La asistencia ha sido confirmada",
                icon: "success"
              });
        } else {
            Swal.fire({
                title: "Malas noticias!",
                text: "La asistencia no se pudo confirmar",
                icon: "error"
              });
        }
    })
    .catch(error => {
        Swal.fire({
            title: "Malas noticias!",
            text: "La asistencia no se pudo confirmar",
            icon: "error"
          });
    });
}

function saveNewVisit() {
    const newVisitName = document.getElementById('new-visit-name').value;
    const newVisitPhone = document.getElementById('new-visit-phone').value;
    const newVisitAddress = document.getElementById('new-visit-address').value;
    const newVisitInvitedBy = document.getElementById('new-visit-invited-by').value;
    const secretaryId = localStorage.getItem('selectedSecretary');
    const churchId = localStorage.getItem('selectedChurch');

    fetch('/api/visits', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: newVisitName,
            phone: newVisitPhone,
            address: newVisitAddress,
            invited_by: newVisitInvitedBy,
            church_id: churchId,
            secretary_id: secretaryId
        })
    })
    .then(response => {
        if (response.ok) {
            $('#new-visit-modal').modal('hide');
            ws.send(JSON.stringify({ type: 'update_visits' }));
            Swal.fire({
                title: "¡Buenas noticias!",
                text: "La visita ha sido registrada",
                icon: "success"
              });
        } else {
            Swal.fire({
                title: "Malas noticias!",
                text: "La asistencia no se pudo registrar",
                icon: "error"
              });
        }
    })
    .catch(error => {
        Swal.fire({
            title: "Malas noticias!",
            text: "La asistencia no se pudo registrar",
            icon: "error"
          });
        });
}
