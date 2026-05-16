import { useState, useEffect } from 'react'
import axios from 'axios'

export default function ModalPack({ pack, fragancias, adminPath, onClose, onSave }) {
    const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '' })
    const [imagenFile, setImagenFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (pack) {
            setForm({
                nombre: pack.nombre || '',
                descripcion: pack.descripcion || '',
                precio: pack.precio || '',
            })
            setPreview(pack.imagen || null)
            setItems(pack.items?.map(i => ({
                fraganciaId: i.fragancia?.id,
                ml: i.ml,
                cantidad: i.cantidad || 1,
                nombre: `${i.fragancia?.marca} ${i.fragancia?.nombre}`
            })) || [])
        }
    }, [pack])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleFile = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setImagenFile(file)
        setPreview(URL.createObjectURL(file))
    }

    const agregarItem = () => {
        setItems([...items, { fraganciaId: '', ml: '', cantidad: 1, nombre: '' }])
    }

    const actualizarItem = (index, campo, valor) => {
        const nuevos = [...items]
        if (campo === 'fraganciaId') {
            const f = fragancias.find(f => f.id === parseInt(valor))
            nuevos[index] = { ...nuevos[index], fraganciaId: valor, nombre: f ? `${f.marca} ${f.nombre}` : '' }
        } else {
            nuevos[index] = { ...nuevos[index], [campo]: valor }
        }
        setItems(nuevos)
    }

    const eliminarItem = (index) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {
        if (!form.nombre || !form.precio) {
            alert('Nombre y precio son obligatorios')
            return
        }
        if (items.length === 0) {
            alert('Agrega al menos un producto al pack')
            return
        }
        setLoading(true)
        try {
            const data = new FormData()
            if (pack?.id) data.append('id', pack.id)
            Object.entries(form).forEach(([k, v]) => { if (v !== '') data.append(k, v) })
            if (imagenFile) data.append('imagenFile', imagenFile)

            const itemsJson = items
                .filter(i => i.fraganciaId && i.ml)
                .map(i => `${i.fraganciaId}:${i.ml}:${i.cantidad}`)
                .join('|')
            data.append('itemsJson', itemsJson)

            await axios.post(`/${adminPath}/api/packs/guardar`, data)
            onSave()
        } catch (e) {
            alert('Error al guardar pack')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 580 }}>
                <h3 className="font-luxury" style={{ fontSize: 20, marginBottom: 28, textTransform: 'uppercase', color: 'var(--text-pure)' }}>
                    {pack ? 'Editar Pack' : 'Nuevo Pack'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Nombre *</label>
                            <input className="input" name="nombre" value={form.nombre} onChange={handleChange} placeholder="ej: Pack Sister" />
                        </div>
                        <div>
                            <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Precio (CLP) *</label>
                            <input className="input" name="precio" type="number" value={form.precio} onChange={handleChange} placeholder="ej: 25000" min={0} />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Descripción</label>
                        <textarea className="input" name="descripcion" value={form.descripcion} onChange={handleChange}
                                  placeholder="Describe el pack..." rows={2} style={{ resize: 'none' }} />
                    </div>

                    <div>
                        <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Imagen</label>
                        <div className="file-input-wrapper">
                            <input type="file" accept="image/*" onChange={handleFile} />
                            <div className="file-input-label">
                                <span>📷</span>
                                <span>{imagenFile ? imagenFile.name : pack?.imagen ? 'Cambiar imagen' : 'Seleccionar imagen'}</span>
                            </div>
                        </div>
                    </div>

                    {preview && (
                        <img src={preview} alt="Preview"
                             style={{ height: 64, width: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-soft)' }} />
                    )}

                    {/* ITEMS DEL PACK */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Productos incluidos
                            </label>
                            <button className="btn-ghost" onClick={agregarItem} style={{ padding: '6px 14px', fontSize: 9 }}>
                                + Agregar producto
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {items.map((item, index) => (
                                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                                    <select className="input" value={item.fraganciaId} onChange={(e) => actualizarItem(index, 'fraganciaId', e.target.value)}>
                                        <option value="">Seleccionar perfume</option>
                                        {fragancias.map(f => (
                                            <option key={f.id} value={f.id}>{f.marca} {f.nombre}</option>
                                        ))}
                                    </select>
                                    <input className="input" type="number" value={item.ml} onChange={(e) => actualizarItem(index, 'ml', e.target.value)}
                                           placeholder="ml" min={1} />
                                    <input className="input" type="number" value={item.cantidad} onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)}
                                           placeholder="cant." min={1} />
                                    <button className="btn-danger" onClick={() => eliminarItem(index)}>✕</button>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <p style={{ fontSize: 11, color: 'var(--text-faint)', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
                                    Agrega productos al pack
                                </p>
                            )}
                        </div>
                    </div>

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