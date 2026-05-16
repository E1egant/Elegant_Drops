import { useState } from 'react'

export default function WhatsAppBtn({ oculto = false }) {
    const [abierto, setAbierto] = useState(false)

    const opciones = [
        {
            texto: '¿Quieres más ml?',
            subtexto: 'Consulta por 30ml, 50ml y más',
            msg: 'Hola, me gustaría consultar por un decant en mayor cantidad de ml, ¿tienen disponible en 30ml o 50ml? 🌿'
        },
        {
            texto: '¿Buscas un perfume?',
            subtexto: 'Si no está en la lista, lo conseguimos',
            msg: 'Hola, estoy buscando un perfume que no está en la página, ¿pueden conseguirlo? 🌿'
        },
        {
            texto: '¿Tienes dudas?',
            subtexto: 'Te asesoramos sobre cualquier fragancia',
            msg: 'Hola, tengo una duda sobre una fragancia 🌿'
        },
    ]

    if (oculto) return null

    return (
        <div style={{ position: 'fixed', bottom: 24, right: 16, zIndex: 100 }}>
            {abierto && (
                <>
                    <div onClick={() => setAbierto(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
                    <div style={{
                        position: 'absolute', bottom: '100%', right: 0, marginBottom: 12,
                        background: 'var(--bg-card)', border: '1px solid var(--border-soft)',
                        borderRadius: 16, overflow: 'hidden', width: 280, zIndex: 100,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-soft)' }}>
                            <p style={{ fontSize: 9, fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                ¿En qué podemos ayudarte?
                            </p>
                        </div>
                        {opciones.map((op, i) => (
                            <a key={i}
                               href={`https://wa.me/56982055029?text=${encodeURIComponent(op.msg)}`}
                               target="_blank"
                               rel="noreferrer"
                               style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', textDecoration: 'none', borderBottom: '1px solid var(--border-soft)', transition: 'background 0.2s' }}
                               onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                               onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(37,211,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <i className="fa-brands fa-whatsapp" style={{ fontSize: 16, color: '#25D366' }}></i>
                                </div>
                                <div>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-pure)' }}>{op.texto}</p>
                                    <p style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2 }}>{op.subtexto}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </>
            )}
            <button onClick={() => setAbierto(!abierto)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#25D366', color: 'white', border: 'none',
                padding: '12px 20px', borderRadius: 100, cursor: 'pointer',
                fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                boxShadow: '0 4px 20px rgba(37,211,102,0.3)', transition: 'all 0.3s',
                zIndex: 100, position: 'relative'
            }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <i className="fa-brands fa-whatsapp" style={{ fontSize: 20 }}></i>
                Consultas
            </button>
        </div>
    )
}