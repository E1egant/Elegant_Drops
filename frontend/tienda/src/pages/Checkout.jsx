import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext.jsx'
import axios from 'axios'

const ESTACIONES = [
    'Vespucio Norte','Zapadores','Dorsal','Einstein','Cementerios','Cerro Blanco',
    'Patronato','Puente Cal y Canto','Santa Ana','Los Héroes','Toesca','Parque O\'Higgins',
    'Rondizzoni','Franklin','El Llano','San Miguel','Lo Vial','Departamental',
    'Ciudad del Niño','Lo Ovalle','El Parrón','La Cisterna','El Bosque','Observatorio',
    'Copa Lo Martínez','Hospital El Pino'
]

function validarRutFrontend(rut) {
    if (!rut) return false
    rut = rut.trim().toUpperCase().replace(/\./g, '')
    if (!/^[0-9]{7,8}-[0-9K]$/.test(rut)) return false
    const [cuerpo, dv] = rut.split('-')
    let suma = 0, multiplo = 2
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplo
        multiplo = multiplo === 7 ? 2 : multiplo + 1
    }
    const dvEsperado = 11 - (suma % 11)
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : String(dvEsperado)
    return dv === dvCalculado
}

export default function Checkout() {
    const [toast, setToast] = useState(null)
    const mostrarToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(null), 4000)
    }
    const { carrito, total, vaciar } = useCarrito()
    const navigate = useNavigate()
    const [tipo, setTipo] = useState(null)
    const [form, setForm] = useState({ nombre: '', apellido: '', rut: '', telefono: '', correo: '', direccion: '', estacion: '' })
    const [errores, setErrores] = useState({})
    const [procesando, setProcesando] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    useEffect(() => {
        if (carrito.length === 0) navigate('/')
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [carrito])

    const handleChange = (e) => {
        let { name, value } = e.target
        const limites = { nombre: 50, apellido: 50, rut: 12, telefono: 15, correo: 100, direccion: 200, estacion: 100 }
        if (name === 'rut') {
            value = value.replace(/[^0-9kK]/g, '').toUpperCase()
            if (value.length > 9) value = value.slice(0, 9)
            if (value.length > 1) {
                const cuerpo = value.slice(0, -1)
                const dv = value.slice(-1)
                value = cuerpo + '-' + dv
            }
        } else {
            if (value.length > (limites[name] || 200)) return
        }
        setForm({ ...form, [name]: value })
        if (errores[name]) setErrores({ ...errores, [name]: null })
    }

    const validar = () => {
        const e = {}
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-']{2,50}$/.test(form.nombre.trim()))
            e.nombre = 'Nombre inválido — solo letras, mínimo 2 caracteres'
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-']{2,50}$/.test(form.apellido.trim()))
            e.apellido = 'Apellido inválido — solo letras, mínimo 2 caracteres'
        if (!validarRutFrontend(form.rut))
            e.rut = 'RUT inválido — verifica que sea correcto'
        if (!/^(\+?56)?[0-9]{8,9}$/.test(form.telefono.trim().replace(/\s/g, '')))
            e.telefono = 'Teléfono inválido — formato chileno requerido'
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.correo.trim()))
            e.correo = 'Correo electrónico inválido'
        if (tipo === 'envio' && form.direccion.trim().length < 10)
            e.direccion = 'Dirección inválida — mínimo 10 caracteres'
        if (tipo === 'retiro' && !form.estacion)
            e.estacion = 'Selecciona una estación de retiro'
        if (!tipo) e.tipo = 'Selecciona un tipo de entrega'
        return e
    }

    const construirItemsJson = () => {
        return carrito.map(item => {
            if (item.esPack) return `Pack ${item.nombre};${item.cantidad};${item.precio};${item.id}`
            return `${item.marca} ${item.nombre} ${item.ml}ml;${item.cantidad};${item.precio};${item.id}`
        }).join('|')
    }

    const construirResumen = () => {
        return carrito.map(item => {
            if (item.esPack) return `<p>${item.cantidad}x Pack ${item.nombre} — $${(item.precio * item.cantidad).toLocaleString('es-CL')}</p>`
            return `<p>${item.cantidad}x ${item.marca} ${item.nombre} ${item.ml}ml — $${(item.precio * item.cantidad).toLocaleString('es-CL')}</p>`
        }).join('')
    }

    const finalizarPedido = async () => {
        const e = validar()
        if (Object.keys(e).length > 0) { setErrores(e); return }
        setProcesando(true)
        try {
            const formData = new FormData()
            Object.entries(form).forEach(([k, v]) => formData.append(k, v))
            formData.append('tipo', tipo)
            formData.append('resumenPedido', construirResumen())
            formData.append('total', '$' + total.toLocaleString('es-CL'))
            formData.append('itemsJson', construirItemsJson())
            await axios.post('/api/checkout/crear-preferencia', formData)
            vaciar()

            let mensaje = `Hola, quiero hacer un pedido 🛍️\n\n`
            mensaje += `*Datos:*\n`
            mensaje += `Nombre: ${form.nombre} ${form.apellido}\n`
            mensaje += `RUT: ${form.rut}\n`
            mensaje += `Teléfono: ${form.telefono}\n`
            mensaje += `Correo: ${form.correo}\n\n`
            mensaje += `*Productos:*\n`
            carrito.forEach(item => {
                if (item.esPack) mensaje += `• ${item.cantidad}x Pack ${item.nombre} — $${(item.precio * item.cantidad).toLocaleString('es-CL')}\n`
                else mensaje += `• ${item.cantidad}x ${item.marca} ${item.nombre} ${item.ml}ml — $${(item.precio * item.cantidad).toLocaleString('es-CL')}\n`
            })
            mensaje += `\n*Total: $${total.toLocaleString('es-CL')}*\n\n`
            if (tipo === 'envio') mensaje += `*Entrega:* Envío a domicilio\nDirección: ${form.direccion}\n`
            else mensaje += `*Entrega:* Retiro en Metro ${form.estacion}\n`
            window.open(`https://wa.me/56982055029?text=${encodeURIComponent(mensaje)}`, '_blank')
        } catch {
            mostrarToast('Error al procesar el pedido. Intenta nuevamente.')
        } finally {
            setProcesando(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>

            <nav style={{
                height: 72, background: 'rgba(17,16,9,0.97)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50
            }}>
                <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none' }}>
                    <img src="/images/logo-elegant.png" alt="Logo"
                         style={{ height: 44, width: 44, borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover' }} />
                    <div style={{ borderLeft: '1px solid var(--border-soft)', paddingLeft: 16 }}>
                        <p className="font-luxury" style={{ fontSize: 14, color: 'var(--text-pure)', textTransform: 'uppercase' }}>Elegant Drops</p>
                    </div>
                </a>
                <a href="/" style={{ color: 'var(--text-faint)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-solid fa-arrow-left"></i> Volver
                </a>
            </nav>

            <main style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px 80px' }}>
                <div style={{ marginBottom: 40 }}>
                    <h1 className="font-luxury" style={{ fontSize: 36, textTransform: 'uppercase' }}>Checkout</h1>
                    <div style={{ height: 2, width: 48, background: 'var(--gold)', marginTop: 12 }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 48 }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                        <div>
                            <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>
                                1. Tipo de entrega
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {[
                                    { key: 'envio', icon: 'fa-solid fa-truck-fast', titulo: 'Envío a domicilio', sub: 'Vía Blue Express' },
                                    { key: 'retiro', icon: 'fa-solid fa-train-subway', titulo: 'Retiro en metro', sub: 'Línea 2 — sin costo' },
                                ].map(t => (
                                    <button key={t.key} onClick={() => { setTipo(t.key); setErrores({ ...errores, tipo: null }) }}
                                            style={{
                                                padding: '20px 16px', borderRadius: 16,
                                                border: `1px solid ${tipo === t.key ? 'var(--gold)' : 'var(--border-soft)'}`,
                                                background: tipo === t.key ? 'rgba(201,150,122,0.08)' : 'var(--bg-card)',
                                                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                                            }}>
                                        <i className={t.icon} style={{ fontSize: 22, color: 'var(--gold)', marginBottom: 10, display: 'block' }}></i>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-pure)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{t.titulo}</p>
                                        <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.sub}</p>
                                    </button>
                                ))}
                            </div>
                            {errores.tipo && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 8 }}>{errores.tipo}</p>}
                        </div>

                        <div>
                            <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>
                                2. Tus datos
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <input className={`input ${errores.nombre ? 'error' : ''}`} name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" />
                                        {errores.nombre && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>{errores.nombre}</p>}
                                    </div>
                                    <div>
                                        <input className={`input ${errores.apellido ? 'error' : ''}`} name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido" />
                                        {errores.apellido && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>{errores.apellido}</p>}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <input className={`input ${errores.rut ? 'error' : ''}`} name="rut" value={form.rut} onChange={handleChange} placeholder="RUT (ej: 12345678-9)" maxLength={12} />
                                        {errores.rut && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>{errores.rut}</p>}
                                    </div>
                                    <div>
                                        <input className={`input ${errores.telefono ? 'error' : ''}`} name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" />
                                        {errores.telefono && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>{errores.telefono}</p>}
                                    </div>
                                </div>
                                <div>
                                    <input className={`input ${errores.correo ? 'error' : ''}`} name="correo" value={form.correo} onChange={handleChange} placeholder="Correo electrónico" />
                                    {errores.correo && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>{errores.correo}</p>}
                                </div>

                                {tipo === 'envio' && (
                                    <div style={{ marginTop: 8 }}>
                                        <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>
                                            3. Dirección de envío
                                        </p>
                                        <input className={`input ${errores.direccion ? 'error' : ''}`} name="direccion" value={form.direccion} onChange={handleChange} placeholder="Calle, número, comuna" />
                                        {errores.direccion && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>{errores.direccion}</p>}
                                        <div style={{ marginTop: 10, padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(201,150,122,0.2)', background: 'rgba(201,150,122,0.03)' }}>
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                <i className="fa-solid fa-circle-info" style={{ color: 'var(--gold)', marginRight: 8 }}></i>
                                                El costo del envío es pagado por el destinatario — coordinado vía <strong>Blue Express</strong>.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {tipo === 'retiro' && (
                                    <div style={{ marginTop: 8 }}>
                                        <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>
                                            3. Estación de retiro
                                        </p>
                                        <select className={`input ${errores.estacion ? 'error' : ''}`} name="estacion" value={form.estacion} onChange={handleChange}>
                                            <option value="">Selecciona una estación</option>
                                            {ESTACIONES.map(e => <option key={e} value={e}>{e}</option>)}
                                        </select>
                                        {errores.estacion && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>{errores.estacion}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <button onClick={finalizarPedido} disabled={procesando}
                                    style={{
                                        width: '100%', padding: '16px', borderRadius: 100, border: 'none',
                                        background: '#25D366', color: 'white', fontWeight: 800, fontSize: 12,
                                        textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer',
                                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                        opacity: procesando ? 0.7 : 1
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#20b858'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#25D366'}>
                                <i className="fa-brands fa-whatsapp" style={{ fontSize: 18 }}></i>
                                {procesando ? 'Procesando...' : 'Confirmar pedido por WhatsApp'}
                            </button>
                            <p style={{ fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Recibirás confirmación por correo
                            </p>
                        </div>
                    </div>

                    <div>
                        <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>
                            Resumen del pedido
                        </p>
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 20, padding: '20px 24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                                {carrito.map(item => (
                                    <div key={item.id} style={{
                                        display: 'flex', alignItems: 'center', gap: 16,
                                        paddingBottom: 16, borderBottom: '1px solid var(--border-soft)'
                                    }}>
                                        <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#111009', border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {item.imagen ? (
                                                <img src={item.imagen} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <i className="fa-solid fa-spray-can-sparkles" style={{ fontSize: 20, color: 'var(--text-faint)' }}></i>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 9, fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 3 }}>
                                                {item.esPack ? 'Pack' : item.marca}
                                            </p>
                                            <p style={{ fontWeight: 700, fontSize: 14, textTransform: 'uppercase', marginBottom: 4 }}>{item.nombre}</p>
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                                                {item.esPack ? `× ${item.cantidad}` : `${item.ml}ml × ${item.cantidad}`}
                                            </p>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                      ${(item.precio * item.cantidad).toLocaleString('es-CL')}
                    </span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Total</span>
                                <span style={{ fontWeight: 700, fontSize: 24 }}>${total.toLocaleString('es-CL')}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {toast && (
                <div style={{
                    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                    background: '#1a0a0a', border: '1px solid #ef4444', color: '#ef4444',
                    padding: '14px 24px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.1em', zIndex: 999,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)', whiteSpace: 'nowrap'
                }}>
                    {toast}
                </div>
            )}
        </div>
    )
}