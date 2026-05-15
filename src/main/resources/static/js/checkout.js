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

function validarFormulario() {
    if (!tipoSeleccionado) { alert('Por favor selecciona un tipo de entrega'); return false; }
    if (carrito.length === 0) { alert('Tu carrito está vacío'); return false; }

    const nombre = document.getElementById('inputNombre').value.trim();
    const apellido = document.getElementById('inputApellido').value.trim();
    const rut = document.getElementById('inputRut').value.trim();
    const telefono = document.getElementById('inputTelefono').value.trim();
    const correo = document.getElementById('inputCorreo').value.trim();

    if (!nombre || !apellido || !rut || !telefono || !correo) {
        alert('Por favor completa todos tus datos');
        return false;
    }

    if (tipoSeleccionado === 'envio') {
        const direccion = document.getElementById('inputDireccion').value.trim();
        if (!direccion) { alert('Por favor ingresa tu dirección de envío'); return false; }
    }

    if (tipoSeleccionado === 'retiro') {
        const estacion = document.getElementById('inputEstacion').value;
        if (!estacion) { alert('Por favor selecciona una estación de retiro'); return false; }
    }

    return true;
}

function obtenerDatos() {
    const nombre = document.getElementById('inputNombre').value.trim();
    const apellido = document.getElementById('inputApellido').value.trim();
    const rut = document.getElementById('inputRut').value.trim();
    const telefono = document.getElementById('inputTelefono').value.trim();
    const correo = document.getElementById('inputCorreo').value.trim();
    const direccion = tipoSeleccionado === 'envio' ? document.getElementById('inputDireccion').value.trim() : '';
    const estacion = tipoSeleccionado === 'retiro' ? document.getElementById('inputEstacion').value : '';

    let resumenHtml = '';
    let total = 0;
    let itemsJson = '';

    carrito.forEach(item => {
        total += item.precio * item.cantidad;
        if (item.esPack) {
            resumenHtml += `<p>${item.cantidad}x Pack ${item.nombre} — $${(item.precio * item.cantidad).toLocaleString('es-CL')}</p>`;
            itemsJson += `Pack ${item.nombre};${item.cantidad};${item.precio};${item.id}|`;
        } else {
            resumenHtml += `<p>${item.cantidad}x ${item.marca} ${item.nombre} ${item.ml}ml — $${(item.precio * item.cantidad).toLocaleString('es-CL')}</p>`;
            itemsJson += `${item.marca} ${item.nombre} ${item.ml}ml;${item.cantidad};${item.precio};${item.id}|`;
        }
    });
    itemsJson = itemsJson.slice(0, -1);

    return { nombre, apellido, rut, telefono, correo, direccion, estacion, resumenHtml, total, itemsJson };
}

async function iniciarPago(e) {
    e.preventDefault();
    if (!validarFormulario()) return;

    const { nombre, apellido, rut, telefono, correo, direccion, estacion, resumenHtml, total, itemsJson } = obtenerDatos();

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

        if (preferenceId === 'error') throw new Error('Error al crear preferencia');

        const mp = new MercadoPago(MP_PUBLIC_KEY, { locale: 'es-CL' });
        mp.checkout({ preference: { id: preferenceId }, autoOpen: true });

    } catch (error) {
        console.error(error);
        alert('Hubo un error al procesar el pago. Por favor intenta nuevamente.');
        btn.innerText = 'Pagar con tarjeta';
        btn.disabled = false;
    }
}

function finalizarWhatsApp() {
    if (!validarFormulario()) return;

    const { nombre, apellido, rut, telefono, correo, direccion, estacion, total } = obtenerDatos();

    let mensaje = `Hola, quiero hacer un pedido 🛍️\n\n`;
    mensaje += `*Datos del cliente:*\n`;
    mensaje += `Nombre: ${nombre} ${apellido}\n`;
    mensaje += `RUT: ${rut}\n`;
    mensaje += `Teléfono: ${telefono}\n`;
    mensaje += `Correo: ${correo}\n\n`;
    mensaje += `*Productos:*\n`;

    carrito.forEach(item => {
        if (item.esPack) {
            mensaje += `• ${item.cantidad}x Pack ${item.nombre} — $${(item.precio * item.cantidad).toLocaleString('es-CL')}\n`;
        } else {
            mensaje += `• ${item.cantidad}x ${item.marca} ${item.nombre} ${item.ml}ml — $${(item.precio * item.cantidad).toLocaleString('es-CL')}\n`;
        }
    });

    mensaje += `\n*Total: $${total.toLocaleString('es-CL')}*\n\n`;

    if (tipoSeleccionado === 'envio') {
        mensaje += `*Entrega:* Envío a domicilio\n`;
        mensaje += `Dirección: ${direccion}\n`;
    } else {
        mensaje += `*Entrega:* Retiro en Metro ${estacion}\n`;
    }

    const url = `https://wa.me/56982055029?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
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

        if (item.esPack) {
            div.innerHTML = `
                <div>
                    <p class="text-[9px] font-black text-[#c9967a] uppercase tracking-widest">Pack</p>
                    <p class="text-white font-bold text-sm uppercase">${item.nombre}</p>
                    <p class="text-zinc-500 text-[10px]">× ${item.cantidad}</p>
                </div>
                <span class="text-white font-bold">$${(item.precio * item.cantidad).toLocaleString('es-CL')}</span>
            `;
        } else {
            div.innerHTML = `
                <div>
                    <p class="text-[9px] font-black text-[#c9967a] uppercase tracking-widest">${item.marca}</p>
                    <p class="text-white font-bold text-sm uppercase">${item.nombre}</p>
                    <p class="text-zinc-500 text-[10px]">${item.ml}ml × ${item.cantidad}</p>
                </div>
                <span class="text-white font-bold">$${(item.precio * item.cantidad).toLocaleString('es-CL')}</span>
            `;
        }
        contenedor.appendChild(div);
    });

    totalEl.innerText = '$' + total.toLocaleString('es-CL');
}

renderResumen();