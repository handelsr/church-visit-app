document.addEventListener('DOMContentLoaded', () => {
    // Conectar al servidor de WebSockets
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
        console.log('Conexión establecida con el servidor WebSocket.');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'update_visits') {
            updateVisitsTable(data.visits);
        }
    };

    socket.onerror = (error) => {
        console.error('Error en la conexión WebSocket:', error);
    };

    socket.onclose = () => {
        console.log('Conexión WebSocket cerrada.');
    };

    // Solicitar la lista inicial de visitas al cargar la página
    fetch('/api/visitors')
        .then(response => response.json())
        .then(visitors => { 
             visitorsData = visitors
             updateVisitsTable(visitors)
            })
        .catch(error => console.error('Error al obtener la lista de visitas:', error));

    // Filtrar visitas en función del texto introducido en el campo de búsqueda
    document.getElementById('search-input').addEventListener('input', (event) => {
        const searchQuery = event.target.value.toLowerCase();
        filterVisits(searchQuery);
    });
});

let visitorsData = [];

function updateVisitsTable(visitors) {
    const tableBody = document.getElementById('visits-body');
    tableBody.innerHTML = '';

    visitors.forEach(visitor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${visitor.name}</td>
            <td>${visitor.phone}</td>
            <td>${visitor.address ? visitor.address : ''}</td>
            <td>${visitor.invited_by}</td>
            <td>${visitor.secretary_name}</td>
            <td>${visitor.church_name}</td>
            <td>${visitor.visits_count}</td>
        `;
        tableBody.appendChild(row);
    });
}

function filterVisits(query) {
    const filteredVisitors = visitorsData.filter(visitor => {
        return (
            visitor.name.toLowerCase().includes(query) ||
            visitor.phone.toLowerCase().includes(query) ||
            (visitor.address && visitor.address.toLowerCase().includes(query)) ||
            visitor.invited_by.toLowerCase().includes(query) ||
            visitor.secretary_name.toLowerCase().includes(query) ||
            visitor.church_name.toLowerCase().includes(query) ||
            visitor.visits_count.toString().includes(query)
        );
    });
    updateVisitsTable(filteredVisitors);
}

function goBack() {
    window.location.href = 'consultation.html';
}

function goToMain() {
    window.location.href = 'index.html'; // Reemplazar con la URL de tu pantalla principal
}
