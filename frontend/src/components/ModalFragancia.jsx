import { useState, useEffect } from 'react'
import axios from 'axios'

export default function ModalFragancia({ fragancia, categoria, adminPath, onClose, onSave }) {
    const [form, setForm] = useState({
        nombre: '',
        marca: '',
        concentracion: '',
        genero: '',
        tipo: '',
        descripcion: '',
        categoria: categoria || 'DECANT',
    })
    const [imagenFile, setImagenFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (fragancia) {
            setForm({
                nombre: fragancia.nombre || '',
                marca: fragancia.marca || '',
                concentracion: fragancia.concentracion || '',
                genero: fragancia.genero || '',
                tipo: fragancia.tipo || '',
                descripcion: fragancia.descripcion || '',
                categoria: fragancia.categoria || categoria || 'DECANT',
            })
            setPreview(fragancia.imagen || null)
        }
    }, [fragancia])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleFile = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setImagenFile(file)
        setPreview(URL.createObjectURL(file))
    }

    const handleSubmit = async () => {
        if (!form.nombre || !form.marca) {
            alert('Nombre y marca son obligatorios')
            return
        }
        setLoading(true)
        try {
            const data = new FormData()
            if (fragancia?.id) data.append('id', fragancia.id)
            Object.entries(form).forEach(([k, v]) => { if (v !== '') data.append(k, v) })
            if (imagenFile) data.append('imagenFile', imagenFile)

            await axios.post(`/${adminPath}/api/fragancias/guardar`, data)
            onSave()
        } catch (e) {
            alert('Error al guardar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box">
                <h3 className="font-luxury" style={{ fontSize: 20, marginBottom: 28, textTransform: 'uppercase', color: 'var(--text-pure)' }}>
                    {fragancia ? 'Editar' : 'Nuevo'} {categoria === 'COMPLETO' ? 'Perfume Completo' : 'Decant'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Nombre *</label>
                            <input className="input" name="nombre" value={form.nombre} onChange={handleChange} placeholder="ej: Sauvage" />
                        </div>
                        <div>
                            <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Marca *</label>
                            <input className="input" name="marca" value={form.marca} onChange={handleChange} placeholder="ej: Dior" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Concentración</label>
                            <input className="input" name="concentracion" value={form.concentracion} onChange={handleChange} placeholder="ej: EDP" />
                        </div>
                        <div>
                            <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Género</label>
                            <select className="input" name="genero" value={form.genero} onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                <option value="Hombre">Hombre</option>
                                <option value="Mujer">Mujer</option>
                                <option value="Unisex">Unisex</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Tipo</label>
                            <select className="input" name="tipo" value={form.tipo} onChange={handleChange}>
                                <option value="">Seleccionar</option>
                                <option value="Nicho">Nicho</option>
                                <option value="Diseñador">Diseñador</option>
                                <option value="Árabe">Árabe</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Descripción</label>
                        <textarea className="input" name="descripcion" value={form.descripcion} onChange={handleChange}
                                  placeholder="Notas olfativas..." rows={3} style={{ resize: 'none' }} />
                    </div>

                    <div>
                        <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Imagen</label>
                        <div className="file-input-wrapper">
                            <input type="file" accept="image/*" onChange={handleFile} />
                            <div className="file-input-label">
                                <span>📷</span>
                                <span>{imagenFile ? imagenFile.name : fragancia?.imagen ? 'Cambiar imagen' : 'Seleccionar imagen'}</span>
                            </div>
                        </div>
                    </div>

                    {preview && (
                        <img src={preview} alt="Preview"
                             style={{ height: 80, width: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-soft)' }} />
                    )}

                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
                    <button className="btn-primary" onClick={handleSubmit} disabled={loading}
                            style={{ width: '100%', padding: '14px', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Guardando...' : 'Confirmar'}
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