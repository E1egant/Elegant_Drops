import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Ventas({ adminPath }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`/${adminPath}/api/ventas`).then(res => {
            setData(res.data)
            setLoading(false)
        })
    }, [])

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-faint)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Cargando...
        </div>
    )

    const fmt = (n) => `$${Number(n).toLocaleString('es-CL')}`

    return (
        <div>
            <div style={{ marginBottom: 40 }}>
                <h2 className="font-luxury" style={{ fontSize: 36, color: 'var(--text-pure)', textTransform: 'uppercase' }}>Ventas</h2>
                <div style={{ height: 2, width: 48, background: 'var(--gold)', marginTop: 12 }}></div>
            </div>

            {/* RESUMEN */}
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

            {/* TABLA */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                        {['Fecha', 'Detalle', 'Entrega', 'Transacción', 'Total'].map(h => (
                            <th key={h} style={{ padding: '16px 24px', textAlign: h === 'Total' ? 'right' : 'left', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)' }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {data.ventas.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ padding: '64px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                Aún no hay ventas registradas
                            </td>
                        </tr>
                    ) : data.ventas.map(v => (
                        <tr key={v.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                            <td style={{ padding: '20px 24px' }}>
                                <p style={{ fontWeight: 700, fontSize: 13 }}>{new Date(v.fecha).toLocaleDateString('es-CL')}</p>
                                <p style={{ fontSize: 10, color: 'var(--text-faint)' }}>{new Date(v.fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                            </td>
                            <td style={{ padding: '20px 24px' }}>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{v.detalle}</p>
                            </td>
                            <td style={{ padding: '20px 24px' }}>
                                <span className="badge">{v.tipoEntrega === 'envio' ? 'Envío' : 'Retiro'}</span>
                            </td>
                            <td style={{ padding: '20px 24px' }}>
                                <p style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'monospace' }}>{v.codigoTransaccion}</p>
                            </td>
                            <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                <p style={{ fontWeight: 700, fontSize: 15 }}>{fmt(v.total)}</p>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}