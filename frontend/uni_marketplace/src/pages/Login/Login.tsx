import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { APP_NAME } from '../../constants'
import { ROUTES } from '../../routes/routePaths'
import styles from './Login.module.css'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    // No backend yet — simulate a successful login and hand off to Home.
    window.setTimeout(() => {
      navigate(ROUTES.HOME, { state: { justAuthed: true, name: email.split('@')[0] } })
    }, 400)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Log in to {APP_NAME} with your university email.</p>

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
