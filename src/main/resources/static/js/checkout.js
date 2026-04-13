let carrito = JSON.parse(sessionStorage.getItem('carrito')) || [];
let tipoSeleccionado = null;

function seleccionarTipo(tipo) {
    tipoSeleccionado = tipo;

    document.getElementById('btnEnvio').classList.remove('border-[#c9967a]', 'bg-[#c9967a]/10');
    document.getElementById('btnRetiro').classList.remove('border-[#c9967a]', 'bg-[#c9967a]/10');
    document.getElementById('btnEnvio').classList.add('border-white/10');
    document.getElementById('btnRetiro').classList.add('border-white/10');

    if (tipo === 'envio') {
        document.getElementById('btnEnvio').classList.add('border-[#c9967a]', 'bg-[#c9967a]/10');
        document.getElementById('btnEnvio').classList.remove('border-white/10');
        document.getElementById('campoEnvio').classList.remove('hidden');
        document.getElementById('campoRetiro').classList.add('hidden');
    } else {
        document.getElementById('btnRetiro').classList.add('border-[#c9967a]', 'bg-[#c9967a]/10');
        document.getElementById('btnRetiro').classList.remove('border-white/10');
        document.getElementById('campoRetiro').classList.remove('hidden');
        document.getElementById('campoEnvio').classList.add('hidden');
    }
}

async function iniciarPago(e) {
    e.preventDefault();

    if (!tipoSeleccionado) {
        alert('Por favor selecciona un tipo de entrega');
        return;
    }

    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }

    const nombre = document.getElementById('inputNombre').value.trim();
    const apellido = document.getElementById('inputApellido').value.trim();
    const rut = document.getElementById('inputRut').value.trim();
    const telefono = document.getElementById('inputTelefono').value.trim();
    const correo = document.getElementById('inputCorreo').value.trim();

    if (!nombre || !apellido || !rut || !telefono || !correo) {
        alert('Por favor completa todos tus datos');
        return;
    }

    if (tipoSeleccionado === 'envio') {
        const direccion = document.getElementById('inputDireccion').value.trim();
        if (!direccion) {
            alert('Por favor ingresa tu dirección de envío');
            return;
        }
    }

    if (tipoSeleccionado === 'retiro') {
        const estacion = document.getElementById('inputEstacion').value;
        if (!estacion) {
            alert('Por favor selecciona una estación de retiro');
            return;
        }
    }

    let resumenHtml = '';
    let total = 0;
    let itemsJson = '';

    carrito.forEach(item => {
        total += item.precio * item.cantidad;
        resumenHtml += `<p>${item.cantidad}x ${item.marca} ${item.nombre} ${item.ml}ml — $${(item.precio * item.cantidad).toLocaleString('es-CL')}</p>`;
        itemsJson += `${item.marca} ${item.nombre} ${item.ml}ml;${item.cantidad};${item.precio};${item.id}|`;
    });
    itemsJson = itemsJson.slice(0, -1);

    const direccion = tipoSeleccionado === 'envio' ? document.getElementById('inputDireccion').value : '';
    const estacion = tipoSeleccionado === 'retiro' ? document.getElementById('inputEstacion').value : '';

    const btn = e.target;
    btn.innerText = 'Procesando...';
    btn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('apellido', apellido);
        formData.append('rut', rut);
        formData.append('telefono', telefono);
        formData.append('correo', correo);
        formData.append('tipo', tipoSeleccionado);
        formData.append('direccion', direccion);
        formData.append('estacion', estacion);
        formData.append('resumenPedido', resumenHtml);
        formData.append('total', '$' + total.toLocaleString('es-CL'));
        formData.append('itemsJson', itemsJson);

        const response = await fetch('/checkout/crear-preferencia', {
            method: 'POST',
            body: formData
        });

        const preferenceId = await response.text();

        if (preferenceId === 'error') {
            throw new Error('Error al crear preferencia');
        }

        const mp = new MercadoPago(MP_PUBLIC_KEY, { locale: 'es-CL' });
        mp.checkout({
            preference: { id: preferenceId },
            autoOpen: true
        });

    } catch (error) {
        console.error(error);
        alert('Hubo un error al procesar el pago. Por favor intenta nuevamente.');
        btn.innerText = 'Pagar con MercadoPago';
        btn.disabled = false;
    }
}

function renderResumen() {
    const contenedor = document.getElementById('resumenItems');
    const totalEl = document.getElementById('resumenTotal');

    if (!contenedor || carrito.length === 0) {
        if (contenedor) contenedor.innerHTML = '<p class="text-zinc-600 text-xs uppercase tracking-widest">Tu carrito está vacío</p>';
        return;
    }

    let total = 0;
    contenedor.innerHTML = '';

    carrito.forEach(item => {
        total += item.precio * item.cantidad;
        const div = document.createElement('div');
        div.className = 'flex justify-between items-start py-3 border-b border-white/[0.04]';
        div.innerHTML = `
            <div>
                <p class="text-[9px] font-black text-[#c9967a] uppercase tracking-widest">${item.marca}</p>
                <p class="text-white font-bold text-sm uppercase">${item.nombre}</p>
                <p class="text-zinc-500 text-[10px]">${item.ml}ml × ${item.cantidad}</p>
            </div>
            <span class="text-white font-bold">$${(item.precio * item.cantidad).toLocaleString('es-CL')}</span>
        `;
        contenedor.appendChild(div);
    });

    totalEl.innerText = '$' + total.toLocaleString('es-CL');
}

const style = document.createElement('style');
style.textContent = `.tipo-entrega-btn { cursor: pointer; transition: all 0.2s ease; } .tipo-entrega-btn:hover { border-color: rgba(201, 150, 122, 0.3) !important; }`;
document.head.appendChild(style);

renderResumen();