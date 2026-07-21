import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import * as authService from '../../services/authService'
import { APP_NAME, APP_TAGLINE } from '../../constants'
import { ROUTES } from '../../routes/routePaths'
import styles from './Home.module.css'

interface LocationState {
  justAuthed?: boolean
  name?: string
}

function Home() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null

  const [displayName, setDisplayName] = useState<string | null>(state?.justAuthed ? (state.name ?? null) : null)
  const [checkedSession, setCheckedSession] = useState(Boolean(state?.justAuthed))
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (state?.justAuthed) return

    let isMounted = true
    authService
      .fetchCurrentUser()
      .then((user) => {
        if (isMounted) setDisplayName(user.fullName)
      })
      .catch(() => {
        if (isMounted) setDisplayName(null)
      })
      .finally(() => {
        if (isMounted) setCheckedSession(true)
      })

    return () => {
      isMounted = false
    }
  }, [state?.justAuthed])

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await authService.logout()
    } finally {
      setIsLoggingOut(false)
      setDisplayName(null)
      navigate(ROUTES.HOME, { replace: true })
    }
  }

  const isAuthenticated = Boolean(displayName)

  if (!checkedSession) {
    return <div className={styles.wrapper} />
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {isAuthenticated && <span className={styles.badge}>You're signed in</span>}
        <h1 className={styles.title}>{isAuthenticated ? `Welcome, ${displayName}!` : `Welcome to ${APP_NAME}`}</h1>
        <p className={styles.subtitle}>{APP_TAGLINE}</p>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <Button variant="outline" size="lg" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? 'Logging out…' : 'Log Out'}
            </Button>
          ) : (
            <>
              <Button to={ROUTES.LOGIN} variant="outline" size="lg">
                Log In
              </Button>
              <Button to={ROUTES.REGISTER} size="lg">
                Create Account
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
