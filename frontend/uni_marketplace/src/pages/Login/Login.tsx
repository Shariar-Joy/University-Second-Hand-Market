import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import * as authService from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { extractErrorMessage } from '../../utils/errorMessage'
import { APP_NAME } from '../../constants'
import { ROUTES } from '../../routes/routePaths'

interface LocationState {
  justRegistered?: boolean
  email?: string
  from?: string
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuth()
  const { showToast } = useToast()
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
      navigate(state?.from ?? ROUTES.HOME, { replace: true })
    } catch (error) {
      setFormError(extractErrorMessage(error, 'Invalid email or password.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-linear-to-br from-primary/5 via-white to-accent/5 px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-white shadow-pop lg:grid-cols-2"
      >
        <div className="hidden flex-col justify-between bg-linear-to-br from-primary to-blue-700 p-10 text-white lg:flex">
          <span className="flex items-center gap-2 text-lg font-extrabold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
            {APP_NAME}
          </span>

          <div>
            <h2 className="text-2xl font-bold">Join thousands of students trading smarter.</h2>
            <ul className="mt-5 flex flex-col gap-3 text-sm text-white/85">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                Verified university students only
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                Buy, sell, and find tutors in one place
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                Safe, on-campus meetups
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm">
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
            Free for every verified student.
          </div>
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-10">
          <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-soft">Log in to {APP_NAME} with your university email.</p>

          {state?.justRegistered && !formError && (
            <p className="mt-4 rounded-xl bg-success-soft px-4 py-3 text-sm font-medium text-green-700" role="status">
              Account created! Please log in.
            </p>
          )}

          {formError && (
            <p className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-red-700" role="alert">
              {formError}
            </p>
          )}

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
                />
                Remember me
              </label>
              <ShieldCheck className="h-4 w-4 text-ink-faint" aria-hidden="true" />
            </div>

            <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
              {isSubmitting ? 'Logging in…' : 'Log In'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-ink-faint">
            <span className="h-px flex-1 bg-border" />
            OR CONTINUE WITH
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => showToast('Social login is not available yet.', 'info')}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-ink-soft transition-colors hover:bg-slate-50"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => showToast('Social login is not available yet.', 'info')}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-ink-soft transition-colors hover:bg-slate-50"
            >
              Microsoft
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-ink-soft">
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} className="font-semibold text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
