import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext.jsx'
import axios from 'axios'

export default function Confirmacion() {
  const [searchParams] = useSearchParams()
  const [datos, setDatos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [resena, setResena] = useState({ nombre: '', calificacion: 5, comentario: '' })
  const [resenaEnviada, setResenaEnviada] = useState(false)
  const { vaciar } = useCarrito()
  const navigate = useNavigate()

  const paymentId = searchParams.get('payment_id')
  const externalRef = searchParams.get('external_reference')

  useEffect(() => {
    if (!externalRef) { navigate('/'); return }
    vaciar()
    axios.get(`/api/checkout/exito?payment_id=${paymentId || ''}&external_reference=${externalRef}`)
      .then(res => { setDatos(res.data); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [])

  const enviarResena = async () => {
    if (!resena.comentario.trim()) return
    try {
      const fd = new FormData()
      fd.append('nombre', resena.nombre || datos?.nombre || 'Cliente')
      fd.append('calificacion', resena.calificacion)
      fd.append('comentario', resena.comentario)
      fd.append('codigoTransaccion', paymentId || externalRef)
      await axios.post('/resena/guardar', fd)
      setResenaEnviada(true)
    } catch { alert('Error al enviar reseña') }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-faint)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Procesando...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <nav style={{
        height: 72, background: 'rgba(17,16,9,0.97)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '0 24px'
      }}>
        <img src="/images/logo-elegant.png" alt="Logo"
          style={{ height: 44, width: 44, borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover' }} />
      </nav>

      <main style={{ maxWidth: 520, margin: '0 auto', padding: '48px 24px 80px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(201,150,122,0.1)', border: '1px solid rgba(201,150,122,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>
          ✓
        </div>
        <h1 className="font-luxury" style={{ fontSize: 28, textTransform: 'uppercase', marginBottom: 8 }}>Pedido Confirmado</h1>
        <div style={{ height: 2, width: 48, background: 'var(--gold)', margin: '0 auto 32px' }} />

        {datos && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 20, padding: '24px', textAlign: 'left', marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
              Gracias <strong style={{ color: 'var(--text-pure)' }}>{datos.nombre}</strong>, tu pedido fue registrado correctamente.
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
              Enviamos un comprobante a <span style={{ color: 'var(--gold)' }}>{datos.correo}</span>.
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              {datos.tipo === 'envio'
                ? 'Coordinaremos el envío contigo por correo o WhatsApp.'
                : 'Te contactaremos para coordinar el retiro en la estación seleccionada.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-soft)', paddingTop: 16 }}>
              <span style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: 18 }}>{datos.total}</span>
            </div>
          </div>
        )}

        {/* RESEÑA */}
        {!resenaEnviada ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 20, padding: '24px', textAlign: 'left', marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}>
              ¿Cómo fue tu experiencia?
            </p>
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setResena({ ...resena, calificacion: n })}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 22, color: n <= resena.calificacion ? 'var(--gold)' : 'var(--text-faint)', transition: 'color 0.2s' }}>
                  ★
                </button>
              ))}
            </div>
            <input className="input" value={resena.nombre} onChange={e => setResena({ ...resena, nombre: e.target.value })}
              placeholder="Tu nombre" style={{ marginBottom: 10 }} />
            <textarea className="input" value={resena.comentario} onChange={e => setResena({ ...resena, comentario: e.target.value })}
              placeholder="Cuéntanos tu experiencia..." rows={3} style={{ resize: 'none', marginBottom: 12 }} />
            <button className="btn-primary" onClick={enviarResena} style={{ width: '100%', padding: '12px' }}>
              Enviar reseña
            </button>
          </div>
        ) : (
          <div style={{ padding: '16px', borderRadius: 12, border: '1px solid rgba(201,150,122,0.3)', background: 'rgba(201,150,122,0.05)', marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800 }}>
              ✓ ¡Gracias por tu reseña!
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href="https://wa.me/56982055029" target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px', borderRadius: 100, border: '1px solid var(--border-soft)', background: 'var(--bg-card)', color: 'var(--text-pure)', textDecoration: 'none', fontSize: 13, fontWeight: 700, transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,150,122,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-soft)'}>
            💬 Coordinar por WhatsApp
          </a>
          <a href="/" className="btn-primary" style={{ padding: '14px', display: 'block', textAlign: 'center' }}>
            Volver a la tienda
          </a>
        </div>
      </main>
    </div>
  )
}