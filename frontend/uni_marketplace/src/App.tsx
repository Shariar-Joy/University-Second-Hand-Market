import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <BrowserRouter>
            <Navbar />
            <main className="flex flex-1 flex-col">
              <AppRoutes />
            </main>
            <Footer />
          </BrowserRouter>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
