import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import Navbar from './components/layout/Navbar'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import styles from './App.module.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <BrowserRouter>
            <Navbar />
            <main className={styles.main}>
              <AppRoutes />
            </main>
          </BrowserRouter>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
