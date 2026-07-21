import { useLocation } from 'react-router-dom'
import Button from '../../components/common/Button'
import { APP_NAME, APP_TAGLINE } from '../../constants'
import { ROUTES } from '../../routes/routePaths'
import styles from './Home.module.css'

interface LocationState {
  justAuthed?: boolean
  name?: string
}

function Home() {
  const location = useLocation()
  const state = location.state as LocationState | null

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {state?.justAuthed && <span className={styles.badge}>You're signed in</span>}
        <h1 className={styles.title}>{state?.justAuthed ? `Welcome, ${state.name}!` : `Welcome to ${APP_NAME}`}</h1>
        <p className={styles.subtitle}>{APP_TAGLINE}</p>

        {!state?.justAuthed && (
          <div className={styles.actions}>
            <Button to={ROUTES.LOGIN} variant="outline" size="lg">
              Log In
            </Button>
            <Button to={ROUTES.REGISTER} size="lg">
              Create Account
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
