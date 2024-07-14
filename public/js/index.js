function selectChurch(churchId) {
    localStorage.setItem('selectedChurch', churchId);
    window.location.href = 'secretaries.html'; // redirigir a la pantalla de secretarias
}

function continueAsConsultant() {
    localStorage.setItem('selectedChurch', null);
    window.location.href = 'consultation.html'; // redirigir a la pantalla de consulta
}
