import { useState } from 'react'
import axios from 'axios'

export default function ModalFormato({ fragancia, categoria, adminPath, onClose, onSave }) {
    const [ml, setMl] = useState('')
    const [precio, setPrecio] = useState('')
    const [loading, setLoading] = useState(false)

    const esCompleto = categoria === 'COMPLETO'

    const handleSubmit = async () => {
        if (!ml || !precio) {
            alert('Completa todos los campos')
            return
        }
        setLoading(true)
        try {
            const data = new FormData()
            data.append('fraganciaId', fragancia.id)
            data.append('ml', ml)
            data.append('precio', precio)
            await axios.post(`/${adminPath}/api/formatos/guardar`, data)
            onSave()
        } catch (e) {
            alert('Error al guardar formato')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 380 }}>
                <h3 className="font-luxury" style={{ fontSize: 18, marginBottom: 6, textTransform: 'uppercase', color: 'var(--text-pure)' }}>
                    {esCompleto ? 'Tamaño del frasco' : 'Nuevo formato'}
                </h3>
                <p style={{ fontSize: 10, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 28 }}>
                    {fragancia.marca} {fragancia.nombre}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                            {esCompleto ? 'Tamaño del frasco (ml)' : 'Mililitros (ml)'}
                        </label>
                        <input
                            className="input"
                            type="number"
                            value={ml}
                            onChange={(e) => setMl(e.target.value)}
                            placeholder={esCompleto ? 'ej: 100' : 'ej: 5'}
                            min={1}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                            Precio (CLP)
                        </label>
                        <input
                            className="input"
                            type="number"
                            value={precio}
                            onChange={(e) => setPrecio(e.target.value)}
                            placeholder="ej: 25000"
                            min={0}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
                    <button className="btn-primary" onClick={handleSubmit} disabled={loading}
                            style={{ width: '100%', padding: '14px', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Guardando...' : esCompleto ? 'Confirmar tamaño' : 'Agregar formato'}
                    </button>
                    <button onClick={onClose}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', padding: '8px' }}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}