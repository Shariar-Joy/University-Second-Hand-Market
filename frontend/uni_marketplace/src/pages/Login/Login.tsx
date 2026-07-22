import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import * as authService from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { extractErrorMessage } from '../../utils/errorMessage'
import { APP_NAME } from '../../constants'
import { ROUTES } from '../../routes/routePaths'
import styles from './Login.module.css'

interface LocationState {
  justRegistered?: boolean
  email?: string
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuth()
  const state = location.state as LocationState | null

  const [email, setEmail] = useState(state?.email ?? '')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address.'
    }
    if (password.length === 0) {
      errors.password = 'Password is required.'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const user = await authService.login({ email, password, rememberMe })
      setUser(user)
      navigate(ROUTES.HOME, { replace: true })
    } catch (error) {
      setFormError(extractErrorMessage(error, 'Invalid email or password.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Log in to {APP_NAME} with your university email.</p>

        {state?.justRegistered && !formError && (
          <p className={styles.formSuccess} role="status">
            Account created! Please log in.
          </p>
        )}

        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input
            label="University Email"
            name="email"
            type="email"
            placeholder="you@university.edu"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
            required
          />

          <div className={styles.optionsRow}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Remember me
            </label>
          </div>

          <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log In'}
          </Button>
        </form>

        <p className={styles.footerText}>
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className={styles.footerLink}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
