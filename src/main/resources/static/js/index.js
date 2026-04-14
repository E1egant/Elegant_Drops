let carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
let formatoSeleccionado = null;

function abrirModal(card) {
    const nombre = card.getAttribute('data-nombre');
    const marca = card.getAttribute('data-marca');
    const concentracion = card.getAttribute('data-concentracion');
    const tipo = card.getAttribute('data-tipo');
    const genero = card.getAttribute('data-genero');
    const descripcion = card.getAttribute('data-descripcion');
    const imagen = card.getAttribute('data-imagen');
    const formatosRaw = card.getAttribute('data-formatos');
    const formatoIdsRaw = card.getAttribute('data-formatoids');

    formatoSeleccionado = null;

    document.getElementById('modalMarca').innerText = marca;
    document.getElementById('modalNombre').innerText = nombre;
    document.getElementById('modalConcentracion').innerText = concentracion || '';
    document.getElementById('modalTipo').innerText = tipo || '';
    document.getElementById('modalGenero').innerText = genero || '';
    document.getElementById('modalDescripcion').innerText = descripcion || '';
    document.getElementById('modalPrecio').innerText = '—';

    const imgEl = document.getElementById('modalImagen');
    const placeholderEl = document.getElementById('modalImagenPlaceholder');
    if (imagen && imagen !== 'null' && imagen !== '') {
        imgEl.src = imagen;
        imgEl.classList.remove('hidden');
        placeholderEl.classList.add('hidden');
    } else {
        imgEl.classList.add('hidden');
        placeholderEl.classList.remove('hidden');
    }

    const contenedor = document.getElementById('modalFormatos');
    contenedor.innerHTML = '';

    if (formatosRaw && formatosRaw !== '[]') {
        const formatos = formatosRaw.replace('[', '').replace(']', '').split(', ');
        const ids = formatoIdsRaw.replace('[', '').replace(']', '').split(', ');

        formatos.forEach((f, i) => {
            const [ml, precio] = f.split(':');
            const btn = document.createElement('button');
            btn.className = 'btn-ml';
            btn.innerText = ml + 'ml';
            btn.onclick = () => seleccionarFormato(btn, ml, precio, ids[i], nombre, marca);
            contenedor.appendChild(btn);
        });
    }

    document.getElementById('modalDetalle').classList.remove('hidden');
}

function seleccionarFormato(btn, ml, precio, id, nombre, marca) {
    document.querySelectorAll('.btn-ml').forEach(b => b.classList.remove('seleccionado'));
    btn.classList.add('seleccionado');
    document.getElementById('modalPrecio').innerText = '$' + Number(precio).toLocaleString('es-CL');
    formatoSeleccionado = { ml, precio: Number(precio), id, nombre, marca };
}

function cerrarModal() {
    document.getElementById('modalDetalle').classList.add('hidden');
    formatoSeleccionado = null;
}

function agregarAlCarrito() {
    if (!formatoSeleccionado) {
        alert('Selecciona un tamaño primero');
        return;
    }

    const existente = carrito.find(i => i.id === formatoSeleccionado.id);
    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({
            id: formatoSeleccionado.id,
            nombre: formatoSeleccionado.nombre,
            marca: formatoSeleccionado.marca,
            ml: formatoSeleccionado.ml,
            precio: formatoSeleccionado.precio,
            cantidad: 1
        });
    }

    sessionStorage.setItem('carrito', JSON.stringify(carrito));
    renderCarrito();
    cerrarModal();
    toggleCarrito();
}

function eliminarItem(id) {
    carrito = carrito.filter(i => i.id !== id);
    sessionStorage.setItem('carrito', JSON.stringify(carrito));
    renderCarrito();
}

function cambiarCantidad(id, delta) {
    const item = carrito.find(i => i.id === id);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
        carrito = carrito.filter(i => i.id !== id);
    }
    sessionStorage.setItem('carrito', JSON.stringify(carrito));
    renderCarrito();
}

function renderCarrito() {
    const contenedor = document.getElementById('carritoItems');
    const countEl = document.getElementById('carritoCount');
    const totalEl = document.getElementById('carritoTotal');

    if (!contenedor || !countEl || !totalEl) return;

    contenedor.innerHTML = '';

    if (carrito.length === 0) {
        const p = document.createElement('p');
        p.className = 'text-zinc-600 text-xs uppercase tracking-widest text-center py-8';
        p.innerText = 'Tu carrito está vacío';
        contenedor.appendChild(p);
        countEl.classList.add('hidden');
        totalEl.innerText = '$0';
        return;
    }

    let total = 0;
    let count = 0;

    carrito.forEach((item) => {
        total += item.precio * item.cantidad;
        count += item.cantidad;

        const div = document.createElement('div');
        div.className = 'carrito-item';
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <p class="text-[9px] font-black text-[#c9967a] uppercase tracking-widest">${item.marca}</p>
                    <p class="text-white font-bold text-sm uppercase">${item.nombre}</p>
                    <p class="text-zinc-500 text-[10px]">${item.ml}ml</p>
                </div>
                <button onclick="eliminarItem('${item.id}')" class="text-zinc-700 hover:text-red-500 transition text-xs mt-1">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <button onclick="cambiarCantidad('${item.id}', -1)" class="text-zinc-600 hover:text-white transition w-6 h-6 border border-zinc-800 rounded-full flex items-center justify-center text-xs">−</button>
                    <span class="text-white text-sm font-bold">${item.cantidad}</span>
                    <button onclick="cambiarCantidad('${item.id}', 1)" class="text-zinc-600 hover:text-white transition w-6 h-6 border border-zinc-800 rounded-full flex items-center justify-center text-xs">+</button>
                </div>
                <span class="text-white font-bold">$${(item.precio * item.cantidad).toLocaleString('es-CL')}</span>
            </div>
        `;
        contenedor.appendChild(div);
    });

    countEl.innerText = count;
    countEl.classList.remove('hidden');
    totalEl.innerText = '$' + total.toLocaleString('es-CL');
}

function toggleCarrito() {
    const panel = document.getElementById('panelCarrito');
    const overlay = document.getElementById('carritoOverlay');
    const waBtn = document.querySelector('#whatsappBtn');
    const abierto = !panel.classList.contains('translate-x-full');

    if (abierto) {
        panel.classList.add('translate-x-full');
        overlay.classList.add('hidden');
        if (waBtn) waBtn.classList.remove('hidden');
    } else {
        panel.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        renderCarrito();
        if (waBtn) waBtn.classList.add('hidden');
    }
}

function irAlCheckout() {
    if (carrito.length === 0) return;
    sessionStorage.setItem('carrito', JSON.stringify(carrito));
    window.location.href = '/checkout';
}

document.getElementById('modalDetalle').addEventListener('click', function(e) {
    if (e.target === this) cerrarModal();
});

renderCarrito();