import { BrowserRouter, Link } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { APP_NAME } from './constants'
import { ROUTES } from './routes/routePaths'
import styles from './App.module.css'

function App() {
  return (
    <BrowserRouter>
      <header className={styles.header}>
        <Link to={ROUTES.HOME} className={styles.brand}>
          {APP_NAME}
        </Link>
      </header>
      <main className={styles.main}>
        <AppRoutes />
      </main>
    </BrowserRouter>
  )
}

export default App
