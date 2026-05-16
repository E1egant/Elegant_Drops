export default function TarjetaPerfume({ fragancia, onClick }) {
  const precioMinimo = fragancia.formatos?.[0]?.precio
  const esCompleto = fragancia.categoria === 'COMPLETO'

  return (
    <div className="tarjeta" onClick={() => onClick(fragancia)}>
      <div className="imagen-container">
        {fragancia.imagen ? (
          <img src={fragancia.imagen} alt={fragancia.nombre} />
        ) : (
          <span style={{ fontSize: 40, opacity: 0.3 }}>🌿</span>
        )}
      </div>
      <div style={{ padding: '12px 16px' }}>
        <p style={{ fontSize: 9, fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 4 }}>
          {fragancia.marca}
        </p>
        <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, lineHeight: 1.3 }}>
          {fragancia.nombre}
        </h3>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
          {fragancia.concentracion && <span className="tag-badge">{fragancia.concentracion}</span>}
          {fragancia.tipo && <span className="tag-badge">{fragancia.tipo}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
              <p style={{ fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  {esCompleto ? 'Precio' : 'Desde'}
              </p>
            <p style={{ fontWeight: 700, fontSize: 16 }}>
              {precioMinimo ? `$${precioMinimo.toLocaleString('es-CL')}` : '—'}
            </p>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '1px solid rgba(201,150,122,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--gold)', fontSize: 12, transition: 'all 0.2s'
          }}>+</div>
        </div>
      </div>
    </div>
  )
}