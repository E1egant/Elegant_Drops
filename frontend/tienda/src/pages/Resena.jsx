import { useState } from 'react'
import axios from 'axios'

export default function Resena() {
    const [form, setForm] = useState({ nombre: '', calificacion: 5, comentario: '' })
    const [enviado, setEnviado] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async () => {
        if (!form.nombre.trim() || !form.comentario.trim()) {
            setError('Por favor completa todos los campos')
            return
        }
        try {
            const fd = new FormData()
            fd.append('nombre', form.nombre)
            fd.append('calificacion', form.calificacion)
            fd.append('comentario', form.comentario)
            await axios.post('/api/resena/guardar', fd)
            setEnviado(true)
        } catch {
            setError('Error al enviar la reseña. Intenta nuevamente.')
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: 72,
                background: 'rgba(17,16,9,0.97)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 50
            }}>
                <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none' }}>
                    <img src="/images/logo-elegant.png" alt="Logo"
                         style={{ height: 44, width: 44, borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover' }} />
                    <p className="font-luxury" style={{ fontSize: 14, color: 'var(--text-pure)', textTransform: 'uppercase' }}>Elegant Drops</p>
                </a>
            </nav>

            <div style={{ maxWidth: 480, width: '100%', marginTop: 72 }}>
                {!enviado ? (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 24, padding: '40px 32px' }}>
                        <p className="font-luxury" style={{ fontSize: 28, textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }}>Tu Reseña</p>
                        <div style={{ height: 2, width: 48, background: 'var(--gold)', margin: '0 auto 32px' }} />

                        <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Calificación</p>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                            {[1,2,3,4,5].map(n => (
                                <button key={n} onClick={() => setForm({ ...form, calificacion: n })}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 28, color: n <= form.calificacion ? 'var(--gold)' : 'var(--text-faint)', transition: 'color 0.2s' }}>
                                    ★
                                </button>
                            ))}
                        </div>

                        <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Nombre</p>
                        <input className="input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                               placeholder="Tu nombre" style={{ marginBottom: 20 }} />

                        <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Comentario</p>
                        <textarea className="input" value={form.comentario} onChange={e => setForm({ ...form, comentario: e.target.value })}
                                  placeholder="Cuéntanos tu experiencia..." rows={4} style={{ resize: 'none', marginBottom: 24 }} />

                        {error && <p style={{ fontSize: 11, color: '#ef4444', marginBottom: 16 }}>{error}</p>}

                        <button className="btn-primary" onClick={handleSubmit} style={{ width: '100%', padding: '14px' }}>
                            Enviar reseña
                        </button>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(201,150,122,0.1)', border: '1px solid rgba(201,150,122,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>
                            ✓
                        </div>
                        <p className="font-luxury" style={{ fontSize: 24, textTransform: 'uppercase', marginBottom: 8 }}>¡Gracias!</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 32 }}>Tu reseña fue enviada correctamente.</p>
                        <a href="/" className="btn-primary" style={{ padding: '14px 32px', display: 'inline-block' }}>Volver a la tienda</a>
                    </div>
                )}
            </div>
        </div>
    )
}