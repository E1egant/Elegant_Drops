import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar.jsx'
import PanelCarrito from '../components/PanelCarrito.jsx'
import WhatsAppBtn from '../components/WhatsAppBtn.jsx'
import { useCarrito } from '../context/CarritoContext.jsx'

export default function Packs() {
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [packSel, setPackSel] = useState(null)
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const { agregar } = useCarrito()

  useEffect(() => {
    axios.get('/api/tienda/packs').then(res => {
      setPacks(res.data)
      setLoading(false)
    })
  }, [])

  const agregarPack = (pack) => {
    agregar({
      id: 'pack-' + pack.id,
      nombre: pack.nombre,
      marca: 'Pack',
      ml: null,
      precio: pack.precio,
      esPack: true
    })
    setPackSel(null)
    setCarritoAbierto(true)
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar onToggleCarrito={() => setCarritoAbierto(true)} />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="font-luxury" style={{ fontSize: 32, textTransform: 'uppercase' }}>Packs</h1>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 6 }}>
            Combinaciones especiales
          </p>
          <div style={{ height: 2, width: 48, background: 'var(--gold)', marginTop: 12 }} />
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-faint)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center', padding: '64px 0' }}>
            Cargando...
          </p>
        ) : packs.length === 0 ? (
          <p style={{ color: 'var(--text-faint)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center', padding: '64px 0' }}>
            No hay packs disponibles
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {packs.map(p => (
              <div key={p.id} className="tarjeta" onClick={() => setPackSel(p)}>
                <div className="imagen-container">
                  {p.imagen ? (
                    <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 48, opacity: 0.2 }}>🎁</span>
                  )}
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <p style={{ fontSize: 9, fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 6 }}>Pack</p>
                  <h3 style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>{p.nombre}</h3>
                  {p.descripcion && <p style={{ fontSize: 11, color: 'var(--text-faint)', fontStyle: 'italic', marginBottom: 12 }}>{p.descripcion}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 8, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Precio pack</p>
                      <p style={{ fontWeight: 700, fontSize: 18 }}>${p.precio?.toLocaleString('es-CL')}</p>
                    </div>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(201,150,122,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: 12 }}>+</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL PACK */}
      {packSel && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPackSel(null)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: '2rem', width: '100%', maxWidth: 480, overflow: 'hidden' }}>
            {packSel.imagen && (
              <div style={{ height: 200, overflow: 'hidden' }}>
                <img src={packSel.imagen} alt={packSel.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ padding: '28px 32px' }}>
              <button onClick={() => setPackSel(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', marginBottom: 16 }}>
                ✕ Cerrar
              </button>
              <p style={{ fontSize: 9, fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 6 }}>Pack</p>
              <h2 className="font-luxury" style={{ fontSize: 22, textTransform: 'uppercase', marginBottom: 8 }}>{packSel.nombre}</h2>
              {packSel.descripcion && <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 16 }}>{packSel.descripcion}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <p style={{ fontSize: 9, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Precio pack</p>
                  <p style={{ fontWeight: 700, fontSize: 24 }}>${packSel.precio?.toLocaleString('es-CL')}</p>
                </div>
              </div>
              <button className="btn-primary" onClick={() => agregarPack(packSel)} style={{ width: '100%', padding: '14px' }}>
                🛍 Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}

      <PanelCarrito abierto={carritoAbierto} onCerrar={() => setCarritoAbierto(false)} />
      <WhatsAppBtn />
    </div>
  )
}