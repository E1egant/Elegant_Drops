import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext.jsx'
import PanelCarrito from '../components/PanelCarrito.jsx'
import WhatsAppBtn from '../components/WhatsAppBtn.jsx'
import axios from 'axios'

export default function Landing() {
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const { count } = useCarrito()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (busqueda.trim().length < 2) { setResultados([]); return }
      setBuscando(true)
      try {
        const res = await axios.get(`/api/tienda/buscar?q=${encodeURIComponent(busqueda)}`)
        setResultados(res.data)
      } catch { setResultados([]) }
      finally { setBuscando(false) }
    }, 350)
    return () => clearTimeout(timer)
  }, [busqueda])

  const secciones = [
    { key: 'decants', label: 'Decants', subtexto: 'Muestras en 2, 5 y 10ml', ruta: '/decants', imagen: '/images/landing-decants.jpg' },
    { key: 'completos', label: 'Perfumes Completos', subtexto: 'Frascos originales y testers', ruta: '/completos', imagen: '/images/landing-completos.jpg' },
    { key: 'packs', label: 'Packs', subtexto: 'Combinaciones especiales', ruta: '/packs', imagen: '/images/landing-packs.jpg' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>

      {/* NAVBAR LANDING */}
      <nav style={{
        height: 72, background: 'rgba(17,16,9,0.97)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/images/logo-elegant.png" alt="Logo"
            style={{ height: 44, width: 44, borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover' }} />
          <div style={{ borderLeft: '1px solid var(--border-soft)', paddingLeft: 16 }}>
            <p className="font-luxury" style={{ fontSize: 14, color: 'var(--text-pure)', textTransform: 'uppercase' }}>
              Elegant Drops
            </p>
            <p style={{ fontSize: 7, letterSpacing: '0.3em', color: 'var(--gold)', fontWeight: 800, textTransform: 'uppercase', marginTop: 3 }}>
              Decants & Fragrances
            </p>
          </div>
        </div>
        <button onClick={() => setCarritoAbierto(true)} style={{
          background: 'transparent', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', position: 'relative', padding: 8, fontSize: 20
        }}>
          🛍
          {count > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2, background: 'var(--gold)',
              color: '#0e0d0b', fontSize: 9, fontWeight: 900, width: 16, height: 16,
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{count}</span>
          )}
        </button>
      </nav>

      {/* HERO */}
      <div style={{ padding: '48px 24px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: 9, letterSpacing: '0.4em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 16, fontWeight: 800 }}>
          Excellence in Every Drop
        </p>
        <h1 className="font-luxury" style={{ fontSize: 'clamp(28px, 6vw, 52px)', color: 'var(--text-pure)', textTransform: 'uppercase', marginBottom: 8 }}>
          Elegant Drops
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-faint)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 32 }}>
          Fragancias de lujo al alcance de todos
        </p>

        {/* BUSCADOR */}
        <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: 14 }}>🔍</span>
            <input
              className="input"
              style={{ paddingLeft: 44, borderRadius: 100 }}
              placeholder="Buscar fragancia, marca..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          {(resultados.length > 0 || buscando) && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
              background: 'var(--bg-card)', border: '1px solid var(--border-medium)',
              borderRadius: 16, overflow: 'hidden', zIndex: 100,
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}>
              {buscando ? (
                <p style={{ padding: '16px', fontSize: 11, color: 'var(--text-faint)', textAlign: 'center' }}>Buscando...</p>
              ) : resultados.map(f => (
                <div key={f.id}
                  onClick={() => {
                    setBusqueda('')
                    setResultados([])
                    navigate(f.categoria === 'COMPLETO' ? '/completos' : '/decants')
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    cursor: 'pointer', borderBottom: '1px solid var(--border-soft)', transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {f.imagen && <img src={f.imagen} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />}
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: 9, color: 'var(--gold)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{f.marca}</p>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>{f.nombre}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECCIONES */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {secciones.map(s => (
          <div key={s.key}
            onClick={() => navigate(s.ruta)}
            style={{
              position: 'relative', borderRadius: 20, overflow: 'hidden',
              height: 220, cursor: 'pointer', border: '1px solid var(--border-soft)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(201,150,122,0.5)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-soft)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}>
            {/* FONDO */}
            <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-card)' }}>
              <img src={s.imagen} alt={s.label}
                onError={e => e.target.style.display = 'none'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(17,16,9,0.8) 0%, rgba(17,16,9,0.3) 100%)' }} />
            </div>
            {/* CONTENIDO */}
            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 32px' }}>
              <h2 className="font-luxury" style={{ fontSize: 'clamp(18px, 4vw, 26px)', textTransform: 'uppercase', color: 'var(--text-pure)', marginBottom: 8 }}>
                {s.label}
              </h2>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 20 }}>
                {s.subtexto}
              </p>
              <span style={{
                display: 'inline-block', border: '1px solid var(--gold)', color: 'var(--gold)',
                fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
                padding: '8px 20px', borderRadius: 100, width: 'fit-content',
                transition: 'all 0.2s'
              }}>
                Ver {s.label} →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <div style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center' }}>
          {[
            { icon: '🚚', titulo: 'Envío a todo Chile', sub: 'Vía Blue Express' },
            { icon: '✅', titulo: '100% Original', sub: 'Garantizado' },
            { icon: '💬', titulo: 'Atención personalizada', sub: 'Por WhatsApp' },
          ].map((f, i) => (
            <div key={i}>
              <p style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-pure)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{f.titulo}</p>
              <p style={{ fontSize: 10, color: 'var(--text-faint)' }}>{f.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 20 }}>
          {[
            { icon: '📷', label: 'Instagram', url: 'https://instagram.com/elegantdrops.cl' },
            { icon: '🎵', label: 'TikTok', url: 'https://tiktok.com/@elegantdrops.cl' },
            { icon: '📘', label: 'Facebook', url: 'https://facebook.com/elegantdrops.cl' },
            { icon: '✉️', label: 'Correo', url: 'mailto:ventas.elegantdrops@gmail.com' },
          ].map((red, i) => (
            <a key={i} href={red.url} target="_blank" rel="noreferrer"
              style={{ color: 'var(--text-faint)', textDecoration: 'none', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'color 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}>
              <span style={{ fontSize: 20 }}>{red.icon}</span>
              {red.label}
            </a>
          ))}
        </div>
        <p style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          Elegant Drops Chile · Excelencia en cada gota
        </p>
      </footer>

      <PanelCarrito abierto={carritoAbierto} onCerrar={() => setCarritoAbierto(false)} />
      <WhatsAppBtn />
    </div>
  )
}