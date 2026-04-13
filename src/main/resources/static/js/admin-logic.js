function openModalFragancia() {
    document.getElementById('modalTitle').innerText = 'Nuevo Perfume';
    document.getElementById('fraganciaId').value = '';
    document.getElementById('inputNombre').value = '';
    document.getElementById('inputMarca').value = '';
    document.getElementById('inputConcentracion').value = '';
    document.getElementById('inputGenero').value = '';
    document.getElementById('inputTipo').value = '';
    document.getElementById('inputDescripcion').value = '';
    document.getElementById('inputOrden').value = '';
    document.getElementById('inputImagen').value = '';
    document.getElementById('fileNameLabel').innerText = 'Seleccionar imagen del perfume';
    document.getElementById('previewContainer').classList.add('hidden');
    document.getElementById('modalFragancia').classList.remove('hidden');
}

function editFragancia(btn) {
    document.getElementById('modalTitle').innerText = 'Editar Perfume';
    document.getElementById('fraganciaId').value = btn.getAttribute('data-id');
    document.getElementById('inputNombre').value = btn.getAttribute('data-nombre');
    document.getElementById('inputMarca').value = btn.getAttribute('data-marca');
    document.getElementById('inputConcentracion').value = btn.getAttribute('data-concentracion');
    document.getElementById('inputGenero').value = btn.getAttribute('data-genero') || '';
    document.getElementById('inputTipo').value = btn.getAttribute('data-tipo') || '';
    document.getElementById('inputDescripcion').value = btn.getAttribute('data-descripcion');
    document.getElementById('inputOrden').value = btn.getAttribute('data-orden') || '';
    document.getElementById('inputImagen').value = '';
    document.getElementById('fileNameLabel').innerText = 'Cambiar imagen (opcional)';
    document.getElementById('previewContainer').classList.add('hidden');
    document.getElementById('modalFragancia').classList.remove('hidden');
}

function handleOpenFormato(button) {
    document.getElementById('fraganciaIdInput').value = button.getAttribute('data-id');
    document.getElementById('nombrePerfumeFormato').innerText = button.getAttribute('data-nombre');
    document.getElementById('modalFormato').classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

document.getElementById('inputImagen').addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        document.getElementById('fileNameLabel').innerText = file.name;
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imagenPreview').src = e.target.result;
            document.getElementById('previewContainer').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

window.onclick = function(event) {
    if (event.target.classList.contains('backdrop-blur-md')) {
        event.target.classList.add('hidden');
    }
}