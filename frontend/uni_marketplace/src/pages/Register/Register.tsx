import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { universities } from '../../data/universities'
import { isUniversityEmail, isValidEmailFormat } from '../../utils/emailValidation'
import { validatePasswordStrength } from '../../utils/passwordValidation'
import * as authService from '../../services/authService'
import { extractErrorMessage } from '../../utils/errorMessage'
import { APP_NAME } from '../../constants'
import { ROUTES } from '../../routes/routePaths'
import styles from './Register.module.css'

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
      const user = await authService.register({
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
      navigate(ROUTES.HOME, { state: { justAuthed: true, name: user.fullName } })
    } catch (error) {
      setFormError(extractErrorMessage(error, 'Could not create your account. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Join {APP_NAME} — free for every verified student.</p>

        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
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

          <div className={styles.field}>
            <label htmlFor="university" className={styles.label}>
              University <span aria-hidden="true">*</span>
            </label>
            <select
              id="university"
              name="university"
              className={styles.select}
              value={values.university}
              onChange={(event) => updateField('university', event.target.value)}
              required
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
            {fieldErrors.university && (
              <p className={styles.errorText} role="alert">
                {fieldErrors.university}
              </p>
            )}
          </div>

          <div className={styles.formRow}>
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

          <div className={styles.formRow}>
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

          <div className={styles.field}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(event) => setAgreedToTerms(event.target.checked)}
              />
              I agree to the Terms of Service and Privacy Policy
            </label>
            {fieldErrors.terms && (
              <p className={styles.errorText} role="alert">
                {fieldErrors.terms}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <p className={styles.footerText}>
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className={styles.footerLink}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
