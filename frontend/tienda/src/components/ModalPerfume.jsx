import { useState } from 'react'
import { useCarrito } from '../context/CarritoContext.jsx'

export default function ModalPerfume({ fragancia, onCerrar, onAgregarExito }) {
    const [formatoSel, setFormatoSel] = useState(null)
    const [toast, setToast] = useState(null)
    const { agregar } = useCarrito()

    if (!fragancia) return null

    const mostrarToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3000)
    }

    const handleAgregar = () => {
        if (!formatoSel) { mostrarToast('Selecciona un tamaño primero'); return }
        agregar({
            id: formatoSel.id,
            nombre: fragancia.nombre,
            marca: fragancia.marca,
            ml: formatoSel.ml,
            precio: formatoSel.precio,
            imagen: fragancia.imagen || null,
            esPack: false
        })
        onCerrar()
        onAgregarExito()
    }

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCerrar()}
             style={{ zIndex: 200 }}>
            <div className="modal-box" style={{ zIndex: 201, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>

                    <div style={{ background: '#111009', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                        {fragancia.imagen ? (
                            <img src={fragancia.imagen} alt={fragancia.nombre}
                                 style={{ maxHeight: 220, width: 'auto', objectFit: 'contain' }} />
                        ) : (
                            <i className="fa-solid fa-spray-can-sparkles" style={{ fontSize: 48, color: 'var(--text-faint)', opacity: 0.3 }}></i>
                        )}
                    </div>

                    <div style={{ padding: '28px 32px' }}>
                        <button onClick={onCerrar} style={{
                            background: 'transparent', border: 'none', color: 'var(--text-faint)',
                            fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em',
                            cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6
                        }}>
                            <i className="fa-solid fa-xmark"></i> Cerrar
                        </button>

                        <p style={{ fontSize: 9, fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 6 }}>
                            {fragancia.marca}
                        </p>
                        <h2 className="font-luxury" style={{ fontSize: 22, textTransform: 'uppercase', marginBottom: 8 }}>
                            {fragancia.nombre}
                        </h2>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                            {fragancia.concentracion && <span className="tag-badge">{fragancia.concentracion}</span>}
                            {fragancia.tipo && <span className="tag-badge">{fragancia.tipo}</span>}
                            {fragancia.genero && <span className="tag-badge">{fragancia.genero}</span>}
                        </div>
                        {fragancia.descripcion && (
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 20 }}>
                                {fragancia.descripcion}
                            </p>
                        )}

                        <p style={{ fontSize: 9, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>
                            Selecciona el tamaño
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                            {fragancia.formatos?.map(f => (
                                <button key={f.id}
                                        className={`btn-ghost ${formatoSel?.id === f.id ? 'activo' : ''}`}
                                        onClick={() => setFormatoSel(f)}
                                        style={{ padding: '8px 16px' }}>
                                    {f.ml}ml
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <p style={{ fontSize: 9, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Precio</p>
                                <p style={{ fontWeight: 700, fontSize: 24 }}>
                                    {formatoSel ? `$${formatoSel.precio.toLocaleString('es-CL')}` : '—'}
                                </p>
                            </div>
                        </div>

                        <button className="btn-primary" onClick={handleAgregar} style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <i className="fa-solid fa-cart-shopping"></i> Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>

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