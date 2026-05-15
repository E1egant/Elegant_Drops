import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Resenas({ adminPath }) {
    const [resenas, setResenas] = useState([])
    const [loading, setLoading] = useState(true)

    const cargar = async () => {
        const res = await axios.get(`/${adminPath}/api/resenas`)
        setResenas(res.data)
        setLoading(false)
    }

    useEffect(() => { cargar() }, [])

    const eliminar = async (id) => {
        if (!confirm('¿Eliminar esta reseña?')) return
        await axios.delete(`/${adminPath}/api/resenas/${id}`)
        cargar()
    }

    const Estrellas = ({ n }) => (
        <div style={{ display: 'flex', gap: 2 }}>
            {[1,2,3,4,5].map(i => (
                <span key={i} style={{ color: i <= n ? 'var(--gold)' : 'var(--text-faint)', fontSize: 13 }}>★</span>
            ))}
        </div>
    )

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-faint)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Cargando...
        </div>
    )

    return (
        <div>
            <div style={{ marginBottom: 40 }}>
                <h2 className="font-luxury" style={{ fontSize: 36, color: 'var(--text-pure)', textTransform: 'uppercase' }}>Reseñas</h2>
                <div style={{ height: 2, width: 48, background: 'var(--gold)', marginTop: 12 }}></div>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                        {['Fecha', 'Cliente', 'Calificación', 'Comentario', 'Acciones'].map(h => (
                            <th key={h} style={{ padding: '16px 24px', textAlign: h === 'Acciones' ? 'right' : 'left', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)' }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {resenas.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ padding: '64px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                Aún no hay reseñas registradas
                            </td>
                        </tr>
                    ) : resenas.map(r => (
                        <tr key={r.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                            <td style={{ padding: '20px 24px' }}>
                                <p style={{ fontWeight: 700, fontSize: 13 }}>{new Date(r.fecha).toLocaleDateString('es-CL')}</p>
                                <p style={{ fontSize: 10, color: 'var(--text-faint)' }}>{new Date(r.fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                            </td>
                            <td style={{ padding: '20px 24px' }}>
                                <p style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{r.nombre}</p>
                            </td>
                            <td style={{ padding: '20px 24px' }}>
                                <Estrellas n={r.calificacion} />
                            </td>
                            <td style={{ padding: '20px 24px' }}>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: 320, lineHeight: 1.6 }}>{r.comentario}</p>
                            </td>
                            <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                <button className="btn-danger" onClick={() => eliminar(r.id)}>🗑</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}