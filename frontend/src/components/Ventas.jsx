import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Ventas({ adminPath }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    const cargar = () => {
        axios.get(`/${adminPath}/api/ventas`).then(res => {
            setData(res.data)
            setLoading(false)
        })
    }

    useEffect(() => { cargar() }, [])

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-faint)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Cargando...
        </div>
    )

    const fmt = (n) => `$${Number(n).toLocaleString('es-CL')}`

    const cambiarEstado = async (id, estado) => {
        await axios.post(`/${adminPath}/api/ventas/${id}/estado?estado=${estado}`)
        cargar()
    }

    const eliminar = async (id) => {
        if (!confirm('¿Eliminar esta venta?')) return
        await axios.delete(`/${adminPath}/api/ventas/${id}`)
        cargar()
    }

    return (
        <div>
            <div style={{ marginBottom: 40 }}>
                <h2 className="font-luxury" style={{ fontSize: 36, color: 'var(--text-pure)', textTransform: 'uppercase' }}>Ventas</h2>
                <div style={{ height: 2, width: 48, background: 'var(--gold)', marginTop: 12 }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
                {[
                    { label: 'Esta semana', valor: data.gananciasSemana },
                    { label: 'Este mes', valor: data.gananciasMes },
                    { label: 'Este año', valor: data.gananciasAnio },
                ].map(({ label, valor }) => (
                    <div key={label} className="card" style={{ padding: 32 }}>
                        <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>{label}</p>
                        <p className="font-luxury" style={{ fontSize: 28, color: 'var(--text-pure)' }}>{fmt(valor)}</p>
                    </div>
                ))}
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                        {['Fecha', 'Cliente', 'Detalle', 'Entrega', 'Estado', 'Total', ''].map(h => (
                            <th key={h} style={{ padding: '16px 24px', textAlign: h === 'Total' ? 'right' : 'left', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)' }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {data.ventas.length === 0 ? (
                        <tr>
                            <td colSpan={7} style={{ padding: '64px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                Aún no hay ventas registradas
                            </td>
                        </tr>
                    ) : data.ventas.map(v => (
                        <tr key={v.id} style={{ borderBottom: '1px solid var(--border-soft)', opacity: v.estado === 'PENDIENTE' ? 0.7 : 1 }}>
                            <td style={{ padding: '20px 24px' }}>
                                <p style={{ fontWeight: 700, fontSize: 13 }}>{new Date(v.fecha).toLocaleDateString('es-CL')}</p>
                                <p style={{ fontSize: 10, color: 'var(--text-faint)' }}>{new Date(v.fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                            </td>
                            <td style={{ padding: '20px 24px' }}>
                                <p style={{ fontSize: 12, fontWeight: 700 }}>{v.nombre}</p>
                                <p style={{ fontSize: 10, color: 'var(--text-faint)' }}>{v.correo}</p>
                            </td>
                            <td style={{ padding: '20px 24px' }}>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{v.detalle}</p>
                            </td>
                            <td style={{ padding: '20px 24px' }}>
                                <span className="badge">{v.tipoEntrega === 'envio' ? 'Envío' : 'Retiro'}</span>
                            </td>
                            <td style={{ padding: '20px 24px' }}>
                  <span style={{
                      padding: '4px 12px', borderRadius: 100, fontSize: 9, fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      background: v.estado === 'PAGADO' ? 'rgba(34,197,94,0.1)' : 'rgba(201,150,122,0.1)',
                      color: v.estado === 'PAGADO' ? '#22c55e' : 'var(--gold)',
                      border: `1px solid ${v.estado === 'PAGADO' ? 'rgba(34,197,94,0.3)' : 'rgba(201,150,122,0.3)'}`
                  }}>
                    {v.estado}
                  </span>
                            </td>
                            <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                <p style={{ fontWeight: 700, fontSize: 15 }}>{fmt(v.total)}</p>
                            </td>
                            <td style={{ padding: '20px 24px' }}>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                    {v.estado === 'PENDIENTE' && (
                                        <button onClick={() => cambiarEstado(v.id, 'PAGADO')}
                                                style={{ padding: '6px 14px', borderRadius: 100, border: '1px solid rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.08)', color: '#22c55e', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '0.1em' }}>
                                            Marcar pagado
                                        </button>
                                    )}
                                    <button onClick={() => eliminar(v.id)}
                                            style={{ padding: '6px 14px', borderRadius: 100, border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '0.1em' }}>
                                        Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}