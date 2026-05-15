import { useNavigate } from 'react-router-dom'

export default function Filtros({ ruta, filtroActivo }) {
  const navigate = useNavigate()

  const filtros = [
    { key: 'todos', label: 'Todos' },
    { key: 'Nicho', label: 'Nicho' },
    { key: 'Diseñador', label: 'Diseñador' },
    { key: 'Árabe', label: 'Árabe' },
    { key: 'separador', label: null },
    { key: 'Hombre', label: 'Hombre' },
    { key: 'Mujer', label: 'Mujer' },
    { key: 'Unisex', label: 'Unisex' },
  ]

  return (
    <div className="filtros-bar">
      {filtros.map((f, i) => {
        if (f.key === 'separador') return <div key={i} className="separador" />
        return (
          <button key={f.key}
            className={`btn-ghost ${filtroActivo === f.key ? 'activo' : ''}`}
            onClick={() => navigate(`${ruta}${f.key !== 'todos' ? `?filtro=${f.key}` : ''}`)}
            style={{ whiteSpace: 'nowrap', padding: '6px 16px' }}>
            {f.label}
          </button>
        )
      })}
    </div>
  )
}