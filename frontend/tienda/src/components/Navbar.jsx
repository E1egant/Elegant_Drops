import { Link } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext.jsx'

export default function Navbar({ onToggleCarrito }) {
    const { count } = useCarrito()

    return (
        <nav className="navbar">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none' }}>
                <img src="/images/logo-elegant.png" alt="Logo"
                     style={{ height: 48, width: 48, borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover' }} />
                <div style={{ borderLeft: '1px solid var(--border-soft)', paddingLeft: 16 }}>
                    <p className="font-luxury" style={{ fontSize: 14, color: 'var(--text-pure)', textTransform: 'uppercase' }}>
                        Elegant Drops
                    </p>
                    <p style={{ fontSize: 7, letterSpacing: '0.3em', color: 'var(--gold)', fontWeight: 800, textTransform: 'uppercase', marginTop: 3 }}>
                        Decants & Fragrances
                    </p>
                </div>
            </Link>

            <button onClick={onToggleCarrito} style={{
                background: 'transparent', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', position: 'relative', padding: 8,
                transition: 'color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
                <i className="fa-solid fa-cart-shopping" style={{ fontSize: 20 }}></i>
                {count > 0 && (
                    <span style={{
                        position: 'absolute', top: 0, right: 0,
                        background: 'var(--gold)', color: '#0e0d0b',
                        fontSize: 9, fontWeight: 900, width: 16, height: 16,
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
            {count}
          </span>
                )}
            </button>
        </nav>
    )
}