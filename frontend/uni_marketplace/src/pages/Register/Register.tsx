import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown, GraduationCap } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { universities } from '../../data/universities'
import { isUniversityEmail, isValidEmailFormat } from '../../utils/emailValidation'
import { validatePasswordStrength } from '../../utils/passwordValidation'
import * as authService from '../../services/authService'
import { extractErrorMessage } from '../../utils/errorMessage'
import { APP_NAME } from '../../constants'
import { ROUTES } from '../../routes/routePaths'

interface FormValues {
  fullName: string
  username: string
  email: string
  university: string
  department: string
  studentId: string
  phone: string
  password: string
  confirmPassword: string
}

const INITIAL_VALUES: FormValues = {
  fullName: '',
  username: '',
  email: '',
  university: '',
  department: '',
  studentId: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

type FieldErrors = Partial<Record<keyof FormValues | 'terms', string>>

function validate(values: FormValues, agreedToTerms: boolean): FieldErrors {
  const errors: FieldErrors = {}

  if (values.fullName.trim().length < 2) errors.fullName = 'Enter your full name.'
  if (!/^[a-zA-Z0-9_.]{3,30}$/.test(values.username)) {
    errors.username = 'Username must be 3-30 characters: letters, numbers, dots, or underscores.'
  }
  if (!isValidEmailFormat(values.email)) {
    errors.email = 'Enter a valid email address.'
  } else if (!isUniversityEmail(values.email)) {
    errors.email = 'Please use your university email, not a personal email provider.'
  }
  if (!values.university) errors.university = 'Select your university.'
  if (values.department.trim().length === 0) errors.department = 'Enter your department.'
  if (values.studentId.trim().length === 0) errors.studentId = 'Enter your student ID.'

  const passwordError = validatePasswordStrength(values.password)
  if (passwordError) errors.password = passwordError
  if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match.'

  if (!agreedToTerms) errors.terms = 'You must agree to the Terms of Service to continue.'

  return errors
}

function Register() {
  const navigate = useNavigate()

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    const errors = validate(values, agreedToTerms)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      await authService.register({
        fullName: values.fullName.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
        university: values.university,
        department: values.department.trim(),
        studentId: values.studentId.trim(),
        phone: values.phone.trim() || undefined,
        password: values.password,
        confirmPassword: values.confirmPassword,
      })
      navigate(ROUTES.LOGIN, { state: { justRegistered: true, email: values.email.trim() } })
    } catch (error) {
      setFormError(extractErrorMessage(error, 'Could not create your account. Please try again.'))
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
        className="w-full max-w-2xl rounded-3xl border border-border bg-white p-8 shadow-pop sm:p-10"
      >
        <div className="flex items-center gap-2 text-lg font-extrabold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          {APP_NAME}
        </div>

        <h1 className="mt-6 text-2xl font-bold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink-soft">Join {APP_NAME} — free for every verified student.</p>

        {formError && (
          <p className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-red-700" role="alert">
            {formError}
          </p>
        )}

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <Input
            label="Full Name"
            name="fullName"
            placeholder="Shariar Joy"
            value={values.fullName}
            onChange={(event) => updateField('fullName', event.target.value)}
            error={fieldErrors.fullName}
            required
          />
          <Input
            label="Username"
            name="username"
            placeholder="shariar_joy"
            value={values.username}
            onChange={(event) => updateField('username', event.target.value)}
            error={fieldErrors.username}
            required
          />
          <Input
            label="University Email"
            name="email"
            type="email"
            placeholder="you@university.edu"
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            error={fieldErrors.email}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="university" className="text-sm font-medium text-ink">
              University <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <select
                id="university"
                name="university"
                value={values.university}
                onChange={(event) => updateField('university', event.target.value)}
                required
                className={[
                  'h-11 w-full appearance-none rounded-lg border bg-white px-3.5 pr-10 text-sm text-ink outline-none transition-colors',
                  'focus:border-primary focus:ring-4 focus:ring-primary/10',
                  fieldErrors.university ? 'border-danger' : 'border-border',
                ].join(' ')}
              >
                <option value="" disabled>
                  Select your university
                </option>
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.name}>
                    {uni.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            </div>
            {fieldErrors.university && (
              <p className="text-sm text-danger" role="alert">
                {fieldErrors.university}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Department"
              name="department"
              placeholder="CSE"
              value={values.department}
              onChange={(event) => updateField('department', event.target.value)}
              error={fieldErrors.department}
              required
            />
            <Input
              label="Student ID"
              name="studentId"
              placeholder="2024-001"
              value={values.studentId}
              onChange={(event) => updateField('studentId', event.target.value)}
              error={fieldErrors.studentId}
              required
            />
          </div>

          <Input
            label="Phone (optional)"
            name="phone"
            type="tel"
            placeholder="+880 1XXXXXXXXX"
            value={values.phone}
            onChange={(event) => updateField('phone', event.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={values.password}
              onChange={(event) => updateField('password', event.target.value)}
              error={fieldErrors.password}
              required
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={values.confirmPassword}
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              error={fieldErrors.confirmPassword}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-start gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(event) => setAgreedToTerms(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary/40"
              />
              I agree to the Terms of Service and Privacy Policy
            </label>
            {fieldErrors.terms && (
              <p className="text-sm text-danger" role="alert">
                {fieldErrors.terms}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Register
