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
  const { carrito, total, vaciar } = useCarrito()
  const navigate = useNavigate()
  const [tipo, setTipo] = useState(null)
  const [form, setForm] = useState({ nombre: '', apellido: '', rut: '', telefono: '', correo: '', direccion: '', estacion: '' })
  const [errores, setErrores] = useState({})
  const [procesando, setProcesando] = useState(false)

  useEffect(() => {
    if (carrito.length === 0) navigate('/')
  }, [carrito])

  const handleChange = (e) => {
    const { name, value } = e.target
    // Límite de caracteres por campo
    const limites = { nombre: 50, apellido: 50, rut: 12, telefono: 15, correo: 100, direccion: 200, estacion: 100 }
    if (value.length > (limites[name] || 200)) return
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
      e.rut = 'RUT inválido — formato: 12345678-9'
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

  const pagarConTarjeta = async () => {
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

      const res = await axios.post('/api/checkout/crear-preferencia', formData)
      const { preferenceId } = res.data

      const mp = new window.MercadoPago(window.MP_PUBLIC_KEY, { locale: 'es-CL' })
      mp.checkout({ preference: { id: preferenceId }, autoOpen: true })
    } catch (err) {
      if (err.response?.data) setErrores(err.response.data)
      else alert('Error al procesar el pago. Intenta nuevamente.')
    } finally {
      setProcesando(false)
    }
  }

  const finalizarWhatsApp = () => {
    const e = validar()
    if (Object.keys(e).length > 0) { setErrores(e); return }

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
  }

  const inputStyle = (campo) => ({
    ...{},
    borderColor: errores[campo] ? '#ef4444' : undefined
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>

      {/* NAVBAR */}
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
        <a href="/" style={{ color: 'var(--text-faint)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none' }}>
          ← Volver
        </a>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="font-luxury" style={{ fontSize: 32, textTransform: 'uppercase' }}>Checkout</h1>
          <div style={{ height: 2, width: 48, background: 'var(--gold)', marginTop: 12 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', gap: 32 }}>

            {/* FORMULARIO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* TIPO ENTREGA */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>
                  1. Tipo de entrega
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { key: 'envio', icon: '🚚', titulo: 'Envío a domicilio', sub: 'Vía Blue Express' },
                    { key: 'retiro', icon: '🚇', titulo: 'Retiro en metro', sub: 'Línea 2 — sin costo' },
                  ].map(t => (
                    <button key={t.key} onClick={() => { setTipo(t.key); setErrores({ ...errores, tipo: null }) }}
                      style={{
                        padding: '16px', borderRadius: 16, border: `1px solid ${tipo === t.key ? 'var(--gold)' : 'var(--border-soft)'}`,
                        background: tipo === t.key ? 'rgba(201,150,122,0.08)' : 'var(--bg-card)',
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                      }}>
                      <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-pure)', textTransform: 'uppercase' }}>{t.titulo}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2 }}>{t.sub}</p>
                    </button>
                  ))}
                </div>
                {errores.tipo && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 6 }}>{errores.tipo}</p>}
              </div>

              {/* DATOS */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>
                  2. Tus datos
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <input className={`input ${errores.nombre ? 'error' : ''}`} name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" />
                      {errores.nombre && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>{errores.nombre}</p>}
                    </div>
                    <div>
                      <input className={`input ${errores.apellido ? 'error' : ''}`} name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido" />
                      {errores.apellido && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>{errores.apellido}</p>}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <input className={`input ${errores.rut ? 'error' : ''}`} name="rut" value={form.rut} onChange={handleChange} placeholder="RUT (12345678-9)" />
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
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8, marginTop: 8 }}>
                        3. Dirección de envío
                      </p>
                      <input className={`input ${errores.direccion ? 'error' : ''}`} name="direccion" value={form.direccion} onChange={handleChange} placeholder="Calle, número, comuna" />
                      {errores.direccion && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>{errores.direccion}</p>}
                      <div style={{ marginTop: 10, padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(201,150,122,0.2)', background: 'rgba(201,150,122,0.03)' }}>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          ℹ️ El costo del envío es pagado por el destinatario — coordinado vía <strong>Blue Express</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {tipo === 'retiro' && (
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8, marginTop: 8 }}>
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

              {/* BOTONES PAGO */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                <button className="btn-primary" onClick={pagarConTarjeta} disabled={procesando}
                  style={{ width: '100%', padding: '14px', opacity: procesando ? 0.7 : 1 }}>
                  💳 {procesando ? 'Procesando...' : 'Pagar con tarjeta'}
                </button>
                <button onClick={finalizarWhatsApp}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 100, border: 'none',
                    background: '#25D366', color: 'white', fontWeight: 800, fontSize: 11,
                    textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#20b858'}
                  onMouseLeave={e => e.currentTarget.style.background = '#25D366'}>
                  💬 Coordinar por WhatsApp
                </button>
                <p style={{ fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Recibirás un comprobante por correo al pagar con tarjeta
                </p>
              </div>
            </div>

            {/* RESUMEN */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>
                Resumen del pedido
              </p>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 20, padding: '20px 24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {carrito.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 12, borderBottom: '1px solid var(--border-soft)' }}>
                      <div>
                        <p style={{ fontSize: 9, fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                          {item.esPack ? 'Pack' : item.marca}
                        </p>
                        <p style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>{item.nombre}</p>
                        <p style={{ fontSize: 10, color: 'var(--text-faint)' }}>
                          {item.esPack ? `× ${item.cantidad}` : `${item.ml}ml × ${item.cantidad}`}
                        </p>
                      </div>
                      <span style={{ fontWeight: 700 }}>${(item.precio * item.cantidad).toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Total</span>
                  <span style={{ fontWeight: 700, fontSize: 22 }}>${total.toLocaleString('es-CL')}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}