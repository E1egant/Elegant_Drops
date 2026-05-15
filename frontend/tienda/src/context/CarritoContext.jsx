import { createContext, useContext, useState } from 'react'

const CarritoContext = createContext()

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('carrito')) || []
    } catch {
      return []
    }
  })

  const guardar = (nuevoCarrito) => {
    setCarrito(nuevoCarrito)
    sessionStorage.setItem('carrito', JSON.stringify(nuevoCarrito))
  }

  const agregar = (item) => {
    const nuevo = [...carrito]
    const existente = nuevo.find(i => i.id === item.id)
    if (existente) {
      existente.cantidad++
    } else {
      nuevo.push({ ...item, cantidad: 1 })
    }
    guardar(nuevo)
  }

  const eliminar = (id) => {
    guardar(carrito.filter(i => i.id !== id))
  }

  const cambiarCantidad = (id, delta) => {
    const nuevo = carrito.map(i => i.id === id ? { ...i, cantidad: i.cantidad + delta } : i)
      .filter(i => i.cantidad > 0)
    guardar(nuevo)
  }

  const vaciar = () => {
    guardar([])
  }

  const total = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
  const count = carrito.reduce((acc, i) => acc + i.cantidad, 0)

  return (
    <CarritoContext.Provider value={{ carrito, agregar, eliminar, cambiarCantidad, vaciar, total, count }}>
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  return useContext(CarritoContext)
}