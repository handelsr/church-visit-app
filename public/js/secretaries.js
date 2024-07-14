document.addEventListener('DOMContentLoaded', () => {
    const churchId = localStorage.getItem('selectedChurch');
    if (churchId) {
        fetch(`/api/secretaries?church_id=${churchId}`)
            .then(response => response.json())
            .then(data => {
                const list = document.getElementById('secretaries-list');
                data.forEach(secretary => {
                    const item = document.createElement('div');
                    item.textContent = secretary.name;
                    item.setAttribute('data-secretaryid', secretary.id)
                    list.appendChild(item);
                });

                document.getElementById('secretaries-list').addEventListener('click', function(event) {
                    const secretaryId = event.target.dataset.secretaryid;
                    if (secretaryId) {
                      // Redirige a la pantalla de attendance pasando el ID de la secretaria como parámetro
                      localStorage.setItem('selectedSecretary', secretaryId)
                      window.location.href = `/attendance.html`;
                    }
                  });
            });
    } else {
        alert('No se ha seleccionado una iglesia.');
        window.location.href = 'index.html';
    }
});

function goBack() {
    window.location.href = 'index.html';
}
