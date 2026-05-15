import { useCarrito } from '../context/CarritoContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function PanelCarrito({ abierto, onCerrar }) {
  const { carrito, eliminar, cambiarCantidad, total } = useCarrito()
  const navigate = useNavigate()

  const irAlCheckout = () => {
    onCerrar()
    navigate('/checkout')
  }

  return (
    <>
      {abierto && (
        <div onClick={onCerrar} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199
        }} />
      )}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100%', width: '100%', maxWidth: 380,
        background: 'var(--bg-card)', borderLeft: '1px solid var(--border-soft)',
        zIndex: 200, transform: abierto ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="font-luxury" style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Carrito</h3>
          <button onClick={onCerrar} style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {carrito.length === 0 ? (
            <p style={{ color: 'var(--text-faint)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center', marginTop: 40 }}>
              Tu carrito está vacío
            </p>
          ) : carrito.map(item => (
            <div key={item.id} style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-medium)',
              borderRadius: 12, padding: '12px 16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                    {item.esPack ? 'Pack' : item.marca}
                  </p>
                  <p style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>{item.nombre}</p>
                  {!item.esPack && <p style={{ fontSize: 10, color: 'var(--text-faint)' }}>{item.ml}ml</p>}
                </div>
                <button onClick={() => eliminar(item.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 12 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}>
                  ✕
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => cambiarCantidad(item.id, -1)} style={{
                    width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border-medium)',
                    background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14
                  }}>−</button>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{item.cantidad}</span>
                  <button onClick={() => cambiarCantidad(item.id, 1)} style={{
                    width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border-medium)',
                    background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14
                  }}>+</button>
                </div>
                <span style={{ fontWeight: 700 }}>${(item.precio * item.cantidad).toLocaleString('es-CL')}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Total</span>
            <span style={{ fontWeight: 700, fontSize: 20 }}>${total.toLocaleString('es-CL')}</span>
          </div>
          <button className="btn-primary" onClick={irAlCheckout} style={{ width: '100%', padding: '14px' }}>
            Proceder al pago
          </button>
        </div>
      </div>
    </>
  )
}