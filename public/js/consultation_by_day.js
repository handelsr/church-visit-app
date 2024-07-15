const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('Conexión establecida con el servidor WebSocket.');
};

ws.onerror = (error) => {
    console.error('Error en la conexión WebSocket:', error);
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'confirm_attendance') {
        filterVisitsByDate(document.getElementById('date').value);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const filterBtn = document.getElementById('filter-btn');
    filterBtn.addEventListener('click', () => {
        const selectedDate = document.getElementById('date').value;
        filterVisitsByDate(selectedDate);
    });

    // Por defecto, cargar las visitas del día actual
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('date').value = today;
    filterVisitsByDate(today);
});

function filterVisitsByDate(date) {
    fetch(`/api/visits?date=${date}`)
        .then(response => response.json())
        .then(visits => {
            updateVisitsTable(visits);
        })
        .catch(error => console.error('Error al obtener las visitas:', error));
}

function updateVisitsTable(visits) {
    const visitsTable = document.getElementById('visits-table');
    visitsTable.innerHTML = ''; // Limpiar tabla anterior

    if (visits.length === 0) {
        visitsTable.innerHTML = '<p>No se encontraron visitas para esta fecha.</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('table', 'table-striped', 'table-hover');
    const header = table.createTHead();
    const row = header.insertRow();
    row.innerHTML = `
        <th>Nombre</th>
        <th>Teléfono</th>
        <th>Hora de Llegada</th>
        <th>Nombre de quien Invitó</th>
        <th>Cantidad de Visitas</th>
        <th>Puesto de Pie</th>`;

    const tbody = table.createTBody();
    visits.forEach(visit => {
        const tr = tbody.insertRow();
        tr.innerHTML = `
            <td>${visit.name}</td>
            <td>${visit.phone}</td>
            <td>${visit.arrival_time}</td>
            <td>${visit.invited_by}</td>
            <td>${visit.count}</td>
            <td>
                <button class="btn btn-${visit.stood_up ? 'success' : 'secondary'}" onclick="toggleStoodUp(${visit.attendance_id}, ${!visit.stood_up}, this)">
                    ${visit.stood_up ? 'Sí' : 'No'}
                </button>
            </td>`;
    });

    visitsTable.appendChild(table);
}

function toggleStoodUp(visitId, stoodUp, el) {
    el.classList.remove(stoodUp ? "btn-secondary" : "btn-success");
    el.classList.add(stoodUp ? "btn-success" : "btn-secondary");
    el.innerHTML = stoodUp ? "Sí" : "No";

    fetch(`/api/attendance/stand_up/${visitId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stood_up: stoodUp })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            filterVisitsByDate(document.getElementById('date').value);
        } else {
            console.error('Error al actualizar la visita:', data.message);
        }
    })
    .catch(error => console.error('Error al actualizar la visita:', error));
}

function goBack() {
    window.location.href = 'consultation.html';
}

function goToMain() {
    window.location.href = 'index.html'; // Reemplazar con la URL de tu pantalla principal
}
