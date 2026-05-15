import { useState, useEffect } from 'react'
import './index.css'
import Inventario from './components/Inventario'
import Ventas from './components/Ventas'
import Resenas from './components/Resenas'

const adminPath = window.ADMIN_PATH || 'elegant-2026'

export default function App() {
    const [tab, setTab] = useState('inventario')

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>

            {/* NAVBAR */}
            <nav style={{
                height: 80,
                background: 'rgba(17,16,9,0.97)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 48px',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <img src="/images/logo-elegant.png" alt="Logo"
                         style={{ height: 52, width: 52, borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover' }} />
                    <div style={{ borderLeft: '1px solid var(--border-soft)', paddingLeft: 24 }}>
                        <p className="font-luxury" style={{ fontSize: 16, color: 'var(--text-pure)', textTransform: 'uppercase' }}>
                            Elegant Drops
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    <a href="/" target="_blank" style={{ color: 'var(--text-faint)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none' }}>
                        Tienda
                    </a>
                    <a href={`/${adminPath}/logout`} style={{ color: '#b91c1c', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none' }}>
                        Salir
                    </a>
                </div>
            </nav>

            {/* TABS */}
            <div style={{
                position: 'sticky', top: 80, zIndex: 40,
                background: 'rgba(17,16,9,0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-soft)',
                padding: '0 48px'
            }}>
                <div className="tabs">
                    {['inventario', 'ventas', 'resenas'].map(t => (
                        <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                            {t === 'resenas' ? 'Reseñas' : t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENIDO */}
            <main style={{ padding: '48px', maxWidth: 1400, margin: '0 auto' }}>
                {tab === 'inventario' && <Inventario adminPath={adminPath} />}
                {tab === 'ventas' && <Ventas adminPath={adminPath} />}
                {tab === 'resenas' && <Resenas adminPath={adminPath} />}
            </main>

        </div>
    )
}