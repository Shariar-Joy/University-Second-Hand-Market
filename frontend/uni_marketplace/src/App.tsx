import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { WishlistProvider } from './context/WishlistContext'

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <ToastProvider>
          <BrowserRouter>
            <Navbar />
            <main className="flex flex-1 flex-col">
              <AppRoutes />
            </main>
            <Footer />
          </BrowserRouter>
        </ToastProvider>
      </WishlistProvider>
    </AuthProvider>
  )
}

export default App
