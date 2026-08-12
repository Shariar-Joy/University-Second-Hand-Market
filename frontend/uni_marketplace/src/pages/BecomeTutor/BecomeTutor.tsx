import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, GraduationCap, Plus, X } from 'lucide-react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { ApiError } from '../../services/apiClient'
import * as tutorService from '../../services/tutorService'
import { tutorDetailsPath } from '../../routes/routePaths'

const MAX_SUBJECTS = 8

interface FormValues {
  priceInput: string
  availability: string
  department: string
  experienceInput: string
  bio: string
}

const EMPTY_FORM: FormValues = {
  priceInput: '',
  availability: '',
  department: '',
  experienceInput: '',
  bio: '',
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

function BecomeTutor() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [values, setValues] = useState<FormValues>(EMPTY_FORM)
  const [subjects, setSubjects] = useState<string[]>([])
  const [subjectInput, setSubjectInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true
    tutorService
      .getMyTutorProfile()
      .then((tutor) => {
        if (!isMounted) return
        setIsEditMode(true)
        setSubjects(tutor.subjects)
        setValues({
          priceInput: String(tutor.pricePerClass),
          availability: tutor.availability ?? '',
          department: tutor.department ?? '',
          experienceInput: tutor.experience !== null && tutor.experience !== undefined ? String(tutor.experience) : '',
          bio: tutor.bio ?? '',
        })
      })
      .catch((error) => {
        if (!isMounted) return
        if (!(error instanceof ApiError && error.status === 404)) {
          showToast(errorMessage(error, 'Could not load your tutor profile.'), 'error')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }))
  }

  function addSubject() {
    const value = subjectInput.trim()
    if (!value) return
    if (subjects.some((subject) => subject.toLowerCase() === value.toLowerCase())) {
      setSubjectInput('')
      return
    }
    if (subjects.length >= MAX_SUBJECTS) {
      showToast(`You can list up to ${MAX_SUBJECTS} subjects.`, 'error')
      return
    }
    setSubjects((previous) => [...previous, value])
    setSubjectInput('')
  }

  function handleSubjectKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      addSubject()
    }
  }

  function removeSubject(subject: string) {
    setSubjects((previous) => previous.filter((item) => item !== subject))
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {}
    if (subjects.length === 0) nextErrors.subjects = 'Add at least one subject you can tutor.'

    const price = Number(values.priceInput)
    if (!values.priceInput || Number.isNaN(price) || price <= 0) {
      nextErrors.priceInput = 'Enter a price greater than 0.'
    } else if (price > 100_000) {
      nextErrors.priceInput = 'Price per class must be 100,000 BDT or less.'
    }

    if (values.availability.trim().length < 3) {
      nextErrors.availability = 'Describe your availability.'
    }

    if (values.experienceInput) {
      const experience = Number(values.experienceInput)
      if (Number.isNaN(experience) || experience < 0 || experience > 60) {
        nextErrors.experienceInput = 'Enter a realistic number of years.'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const payload = {
        subjects,
        pricePerClass: Number(values.priceInput),
        availability: values.availability.trim(),
        department: values.department.trim() || undefined,
        experience: values.experienceInput ? Number(values.experienceInput) : undefined,
        bio: values.bio.trim() || undefined,
      }

      const saved = isEditMode
        ? await tutorService.updateTutorProfile(payload)
        : await tutorService.createTutorProfile(payload)

      showToast(isEditMode ? 'Tutor profile updated.' : "You're now listed as a tutor!", 'success')
      navigate(tutorDetailsPath(saved.slug))
    } catch (error) {
      showToast(errorMessage(error, 'Could not save your tutor profile. Please try again.'), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <div className="animate-pulse rounded-3xl border border-border bg-white p-8 shadow-card">
          <div className="h-6 w-1/3 rounded bg-slate-200" />
          <div className="mt-6 h-11 w-full rounded bg-slate-200" />
          <div className="mt-4 h-24 w-full rounded bg-slate-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl border border-border bg-white p-8 shadow-card"
      >
        <div className="flex items-center gap-2 text-primary">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-semibold">{isEditMode ? 'Edit Tutor Profile' : 'Become a Tutor'}</span>
        </div>
        <h1 className="mt-1 text-xl font-bold text-ink">
          {isEditMode ? 'Update your tutor profile' : 'Share your knowledge, earn on your own schedule'}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Your profile will show as{' '}
          <span className="font-semibold text-ink">
            {user?.fullName} · {user?.university}
          </span>
          . This is pulled from your account and can be changed from your profile.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tutor-subjects" className="text-sm font-medium text-ink">
              Subjects you can tutor <span className="text-danger">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                id="tutor-subjects"
                placeholder="e.g. Calculus I"
                value={subjectInput}
                onChange={(event) => setSubjectInput(event.target.value)}
                onKeyDown={handleSubjectKeyDown}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addSubject}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add
              </Button>
            </div>
            {subjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {subjects.map((subject) => (
                  <span
                    key={subject}
                    className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                  >
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeSubject(subject)}
                      aria-label={`Remove ${subject}`}
                      className="rounded-full hover:text-danger"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.subjects && <p className="text-sm text-danger">{errors.subjects}</p>}
            <p className="text-xs text-ink-soft">Up to {MAX_SUBJECTS} subjects. Press Enter or click Add.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Price per Class (BDT)"
              type="number"
              min={1}
              value={values.priceInput}
              onChange={(event) => updateField('priceInput', event.target.value)}
              error={errors.priceInput}
              required
            />
            <Input
              label="Years of Experience"
              type="number"
              min={0}
              placeholder="Optional"
              value={values.experienceInput}
              onChange={(event) => updateField('experienceInput', event.target.value)}
              error={errors.experienceInput}
            />
          </div>

          <Input
            label="Availability"
            placeholder="e.g. Weekday evenings, Saturday mornings"
            value={values.availability}
            onChange={(event) => updateField('availability', event.target.value)}
            error={errors.availability}
            required
          />

          <Input
            label="Department"
            placeholder="Optional — e.g. CSE"
            value={values.department}
            onChange={(event) => updateField('department', event.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="tutor-bio" className="text-sm font-medium text-ink">
              Bio
            </label>
            <textarea
              id="tutor-bio"
              rows={4}
              maxLength={1000}
              placeholder="Tell students about your teaching style, what you specialize in, anything that builds trust…"
              value={values.bio}
              onChange={(event) => updateField('bio', event.target.value)}
              className="w-full resize-none rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-2">
            {isEditMode ? 'Save Changes' : 'Publish Tutor Profile'}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}

export default BecomeTutor
