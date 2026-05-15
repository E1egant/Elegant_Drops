import { useSearchParams } from 'react-router-dom'

export default function ErrorPago() {
  const [searchParams] = useSearchParams()
  const pendiente = searchParams.get('pendiente')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <nav style={{
        height: 72, background: 'rgba(17,16,9,0.97)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '0 24px'
      }}>
        <img src="/images/logo-elegant.png" alt="Logo"
          style={{ height: 44, width: 44, borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover' }} />
      </nav>

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>
          {pendiente ? '⏳' : '✕'}
        </div>
        <h1 className="font-luxury" style={{ fontSize: 26, textTransform: 'uppercase', marginBottom: 8 }}>
          {pendiente ? 'Pago Pendiente' : 'Pago No Completado'}
        </h1>
        <div style={{ height: 2, width: 48, background: 'var(--gold)', margin: '0 auto 24px' }} />

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 20, padding: '24px', marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {pendiente
              ? 'Tu pago está pendiente de confirmación. Te avisaremos por correo cuando se apruebe.'
              : 'El pago no pudo procesarse. Por favor intenta nuevamente o coordina tu pedido por WhatsApp.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href="https://wa.me/56982055029" target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px', borderRadius: 100, border: '1px solid var(--border-soft)', background: 'var(--bg-card)', color: 'var(--text-pure)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
            💬 Coordinar por WhatsApp
          </a>
          <a href="/" className="btn-primary" style={{ padding: '14px', display: 'block', textAlign: 'center' }}>
            Volver a la tienda
          </a>
        </div>
      </main>
    </div>
  )
}