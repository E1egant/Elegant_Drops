import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Decants from './pages/Decants.jsx'
import Completos from './pages/Completos.jsx'
import Packs from './pages/Packs.jsx'
import Checkout from './pages/Checkout.jsx'
import Confirmacion from './pages/Confirmacion.jsx'
import ErrorPago from './pages/ErrorPago.jsx'
import { CarritoProvider } from './context/CarritoContext.jsx'
import './index.css'

export default function App() {
  return (
    <CarritoProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/decants" element={<Decants />} />
          <Route path="/completos" element={<Completos />} />
          <Route path="/packs" element={<Packs />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmacion" element={<Confirmacion />} />
          <Route path="/error-pago" element={<ErrorPago />} />
        </Routes>
      </BrowserRouter>
    </CarritoProvider>
  )
}