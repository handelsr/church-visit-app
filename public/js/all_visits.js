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
        .then(visitors => updateVisitsTable(visitors))
        .catch(error => console.error('Error al obtener la lista de visitas:', error));
});

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

function goBack() {
    window.location.href = 'index.html';
}
