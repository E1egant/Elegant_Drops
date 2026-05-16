import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar.jsx'
import Filtros from '../components/Filtros.jsx'
import TarjetaPerfume from '../components/TarjetaPerfume.jsx'
import ModalPerfume from '../components/ModalPerfume.jsx'
import PanelCarrito from '../components/PanelCarrito.jsx'
import WhatsAppBtn from '../components/WhatsAppBtn.jsx'

export default function Decants() {
  const [fragancias, setFragancias] = useState([])
  const [loading, setLoading] = useState(true)
  const [fragSeleccionada, setFragSeleccionada] = useState(null)
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [searchParams] = useSearchParams()
  const filtro = searchParams.get('filtro') || 'todos'

  useEffect(() => {
    setLoading(true)
    const url = filtro !== 'todos' ? `/api/tienda/decants?filtro=${filtro}` : '/api/tienda/decants'
    axios.get(url).then(res => {
      setFragancias(res.data)
      setLoading(false)
    })
  }, [filtro])

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar onToggleCarrito={() => setCarritoAbierto(true)} />
      <Filtros ruta="/decants" filtroActivo={filtro} />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="font-luxury" style={{ fontSize: 32, textTransform: 'uppercase' }}>Decants</h1>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 6 }}>
            Muestras en formato pequeño
          </p>
          <div style={{ height: 2, width: 48, background: 'var(--gold)', marginTop: 12 }} />
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-faint)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center', padding: '64px 0' }}>
            Cargando...
          </p>
        ) : fragancias.length === 0 ? (
          <p style={{ color: 'var(--text-faint)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center', padding: '64px 0' }}>
            No hay fragancias disponibles en esta categoría
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            {fragancias.map(f => (
              <TarjetaPerfume key={f.id} fragancia={f} onClick={setFragSeleccionada} />
            ))}
          </div>
        )}
      </main>

      {fragSeleccionada && (
        <ModalPerfume
          fragancia={fragSeleccionada}
          onCerrar={() => setFragSeleccionada(null)}
          onAgregarExito={() => setCarritoAbierto(true)}
        />
      )}
      <PanelCarrito abierto={carritoAbierto} onCerrar={() => setCarritoAbierto(false)} />
        <WhatsAppBtn oculto={carritoAbierto} />
    </div>
  )
}