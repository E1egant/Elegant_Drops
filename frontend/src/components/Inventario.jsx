import { useState, useEffect } from 'react'
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core'
import {
    SortableContext, verticalListSortingStrategy, arrayMove, useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import axios from 'axios'
import ModalFragancia from './ModalFragancia.jsx'
import ModalFormato from './ModalFormato.jsx'
import ModalPack from './ModalPack.jsx'

function FilaFragancia({ fragancia, onEdit, onDelete, onToggle, onAgregarFormato, onEliminarFormato }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: fragancia.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <tr ref={setNodeRef} style={style}>
            <td style={{ padding: '20px 24px', width: 40 }}>
        <span className="drag-handle" {...attributes} {...listeners}>
          ⠿
        </span>
            </td>
            <td style={{ padding: '20px 24px' }}>
                <button
                    className={fragancia.disponible ? 'badge badge-disponible' : 'badge badge-agotado'}
                    onClick={() => onToggle(fragancia.id)}
                >
                    {fragancia.disponible ? 'En Stock' : 'Agotado'}
                </button>
            </td>
            <td style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {fragancia.imagen ? (
                        <img src={fragancia.imagen} alt={fragancia.nombre}
                             style={{ width: 48, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-soft)', flexShrink: 0 }} />
                    ) : (
                        <div style={{ width: 48, height: 60, borderRadius: 8, background: 'var(--bg-input)', border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: 'var(--text-faint)', fontSize: 18 }}>🖼</span>
                        </div>
                    )}
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.25em' }}>{fragancia.marca}</p>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-pure)', textTransform: 'uppercase' }}>{fragancia.nombre}</p>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                            {[fragancia.concentracion, fragancia.genero, fragancia.tipo].filter(Boolean).join(' · ')}
                        </p>
                        {fragancia.descripcion && (
                            <p style={{ fontSize: 11, color: 'var(--text-faint)', fontStyle: 'italic', marginTop: 4, maxWidth: 300 }}>{fragancia.descripcion}</p>
                        )}
                    </div>
                </div>
            </td>
            <td style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    {fragancia.formatos?.map(f => (
                        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="badge">{f.ml}ml · ${f.precio?.toLocaleString('es-CL')}</span>
                            <button className="btn-danger" style={{ fontSize: 10 }} onClick={() => onEliminarFormato(f.id)}>✕</button>
                        </div>
                    ))}
                    <button onClick={() => onAgregarFormato(fragancia)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>
                        +
                    </button>
                </div>
            </td>
            <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                    <button className="btn-icon" onClick={() => onEdit(fragancia)}>✏️</button>
                    <button className="btn-danger" onClick={() => {
                        if (confirm('¿Eliminar este perfume y todos sus formatos?')) onDelete(fragancia.id)
                    }}>🗑</button>
                </div>
            </td>
        </tr>
    )
}

function TablaFragancias({ fragancias, setFragancias, onEdit, onDelete, onToggle, onAgregarFormato, onEliminarFormato, adminPath }) {
    const sensors = useSensors(useSensor(PointerSensor))

    const handleDragEnd = async (event) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = fragancias.findIndex(f => f.id === active.id)
        const newIndex = fragancias.findIndex(f => f.id === over.id)
        const nuevo = arrayMove(fragancias, oldIndex, newIndex)

        setFragancias(nuevo)

        await axios.post(`/${adminPath}/api/fragancias/reordenar`,
            nuevo.map((f, i) => ({ id: f.id, orden: i + 1 }))
        )
    }

    if (fragancias.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-faint)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                No hay registros en esta categoría
            </div>
        )
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                        {['', 'Estado', 'Fragancia', 'Formatos', 'Acciones'].map(h => (
                            <th key={h} style={{ padding: '16px 24px', textAlign: h === 'Acciones' ? 'right' : 'left', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)' }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <SortableContext items={fragancias.map(f => f.id)} strategy={verticalListSortingStrategy}>
                        <tbody>
                        {fragancias.map(f => (
                            <FilaFragancia
                                key={f.id}
                                fragancia={f}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onToggle={onToggle}
                                onAgregarFormato={onAgregarFormato}
                                onEliminarFormato={onEliminarFormato}
                            />
                        ))}
                        </tbody>
                    </SortableContext>
                </table>
            </div>
        </DndContext>
    )
}

export default function Inventario({ adminPath }) {
    const [subTab, setSubTab] = useState('decants')
    const [fragancias, setFragancias] = useState([])
    const [packs, setPacks] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalFragancia, setModalFragancia] = useState(false)
    const [modalFormato, setModalFormato] = useState(false)
    const [modalPack, setModalPack] = useState(false)
    const [fraganciaSel, setFraganciaSel] = useState(null)
    const [packSel, setPackSel] = useState(null)

    const cargarFragancias = async () => {
        const res = await axios.get(`/${adminPath}/api/fragancias`)
        setFragancias(res.data)
        setLoading(false)
    }

    const cargarPacks = async () => {
        const res = await axios.get(`/${adminPath}/api/packs`)
        setPacks(res.data)
    }

    useEffect(() => {
        cargarFragancias()
        cargarPacks()
    }, [])

    const decants = fragancias.filter(f => f.categoria === 'DECANT' || f.categoria === null)
    const completos = fragancias.filter(f => f.categoria === 'COMPLETO')

    const handleDelete = async (id) => {
        await axios.delete(`/${adminPath}/api/fragancias/${id}`)
        cargarFragancias()
    }

    const handleToggle = async (id) => {
        await axios.post(`/${adminPath}/api/fragancias/${id}/toggle`)
        cargarFragancias()
    }

    const handleEliminarFormato = async (id) => {
        await axios.delete(`/${adminPath}/api/formatos/${id}`)
        cargarFragancias()
    }

    const handleDeletePack = async (id) => {
        if (confirm('¿Eliminar este pack?')) {
            await axios.delete(`/${adminPath}/api/packs/${id}`)
            cargarPacks()
        }
    }

    const handleTogglePack = async (id) => {
        await axios.post(`/${adminPath}/api/packs/${id}/toggle`)
        cargarPacks()
    }

    const abrirNuevo = () => {
        setFraganciaSel(null)
        setModalFragancia(true)
    }

    const abrirEditar = (f) => {
        setFraganciaSel(f)
        setModalFragancia(true)
    }

    const abrirFormato = (f) => {
        setFraganciaSel(f)
        setModalFormato(true)
    }

    const abrirNuevoPack = () => {
        setPackSel(null)
        setModalPack(true)
    }

    const abrirEditarPack = (p) => {
        setPackSel(p)
        setModalPack(true)
    }

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-faint)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Cargando...
        </div>
    )

    return (
        <div>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
                <div>
                    <h2 className="font-luxury" style={{ fontSize: 36, color: 'var(--text-pure)', textTransform: 'uppercase' }}>Inventario</h2>
                    <div style={{ height: 2, width: 48, background: 'var(--gold)', marginTop: 12 }}></div>
                </div>
                <button className="btn-primary" onClick={subTab === 'packs' ? abrirNuevoPack : abrirNuevo}>
                    + Nuevo {subTab === 'decants' ? 'Decant' : subTab === 'completos' ? 'Perfume' : 'Pack'}
                </button>
            </div>

            {/* SUBTABS */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
                {[
                    { key: 'decants', label: `Decants (${decants.length})` },
                    { key: 'completos', label: `Completos (${completos.length})` },
                    { key: 'packs', label: `Packs (${packs.length})` },
                ].map(t => (
                    <button key={t.key} className={`btn-ghost ${subTab === t.key ? 'active' : ''}`}
                            style={subTab === t.key ? { borderColor: 'var(--gold)', color: 'var(--gold)' } : {}}
                            onClick={() => setSubTab(t.key)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* TABLA DECANTS */}
            {subTab === 'decants' && (
                <TablaFragancias
                    fragancias={decants}
                    setFragancias={(nuevo) => setFragancias(prev => [...prev.filter(f => f.categoria === 'COMPLETO'), ...nuevo])}
                    onEdit={abrirEditar}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    onAgregarFormato={abrirFormato}
                    onEliminarFormato={handleEliminarFormato}
                    adminPath={adminPath}
                />
            )}

            {/* TABLA COMPLETOS */}
            {subTab === 'completos' && (
                <TablaFragancias
                    fragancias={completos}
                    setFragancias={(nuevo) => setFragancias(prev => [...prev.filter(f => f.categoria !== 'COMPLETO'), ...nuevo])}
                    onEdit={abrirEditar}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    onAgregarFormato={abrirFormato}
                    onEliminarFormato={handleEliminarFormato}
                    adminPath={adminPath}
                />
            )}

            {/* TABLA PACKS */}
            {subTab === 'packs' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    {packs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-faint)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                            No hay packs creados
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                                {['Estado', 'Pack', 'Precio', 'Acciones'].map(h => (
                                    <th key={h} style={{ padding: '16px 24px', textAlign: h === 'Acciones' ? 'right' : 'left', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {packs.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                                    <td style={{ padding: '20px 24px' }}>
                                        <button className={p.disponible ? 'badge badge-disponible' : 'badge badge-agotado'} onClick={() => handleTogglePack(p.id)}>
                                            {p.disponible ? 'Disponible' : 'Agotado'}
                                        </button>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            {p.imagen && <img src={p.imagen} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />}
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: 14, textTransform: 'uppercase' }}>{p.nombre}</p>
                                                {p.descripcion && <p style={{ fontSize: 11, color: 'var(--text-faint)', fontStyle: 'italic', marginTop: 2 }}>{p.descripcion}</p>}
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                                                    {p.items?.map(item => (
                                                        <span key={item.id} className="badge">
                                {item.fragancia?.marca} {item.fragancia?.nombre} {item.ml}ml
                              </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <p style={{ fontWeight: 700, fontSize: 16 }}>${p.precio?.toLocaleString('es-CL')}</p>
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                                            <button className="btn-icon" onClick={() => abrirEditarPack(p)}>✏️</button>
                                            <button className="btn-danger" onClick={() => handleDeletePack(p.id)}>🗑</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* MODALES */}
            {modalFragancia && (
                <ModalFragancia
                    fragancia={fraganciaSel}
                    categoria={subTab === 'completos' ? 'COMPLETO' : 'DECANT'}
                    adminPath={adminPath}
                    onClose={() => setModalFragancia(false)}
                    onSave={() => { setModalFragancia(false); cargarFragancias() }}
                />
            )}
            {modalFormato && fraganciaSel && (
                <ModalFormato
                    fragancia={fraganciaSel}
                    categoria={fraganciaSel.categoria}
                    adminPath={adminPath}
                    onClose={() => setModalFormato(false)}
                    onSave={() => { setModalFormato(false); cargarFragancias() }}
                />
            )}
            {modalPack && (
                <ModalPack
                    pack={packSel}
                    fragancias={fragancias}
                    adminPath={adminPath}
                    onClose={() => setModalPack(false)}
                    onSave={() => { setModalPack(false); cargarPacks() }}
                />
            )}
        </div>
    )
}