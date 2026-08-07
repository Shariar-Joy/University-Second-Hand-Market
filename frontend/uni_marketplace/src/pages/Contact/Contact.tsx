import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Clock, Mail, Phone } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { APP_NAME } from '../../constants'

interface FormValues {
  name: string
  email: string
  message: string
}

const INITIAL_VALUES: FormValues = { name: '', email: '', message: '' }

const INFO_ITEMS = [
  { icon: Mail, label: 'Email', value: 'support@campusexchange.example' },
  { icon: Phone, label: 'Phone', value: '+880 1XXX-XXXXXX' },
  { icon: Clock, label: 'Hours', value: 'Sunday – Thursday, 9am – 6pm' },
]

function Contact() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
  const [submitted, setSubmitted] = useState(false)

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    setValues(INITIAL_VALUES)
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Contact Us</h1>
        <p className="mt-3 text-ink-soft">Questions, feedback, or a campus safety concern? Reach out any time.</p>

        <div className="mt-8 flex flex-col gap-4">
          {INFO_ITEMS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-card">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs text-ink-soft">{label}</p>
                <p className="text-sm font-medium text-ink">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 rounded-3xl border border-border bg-white p-6 shadow-card sm:p-8"
      >
        {submitted && (
          <p className="rounded-xl bg-success-soft px-4 py-3 text-sm font-medium text-green-700" role="status">
            Thanks for reaching out! The {APP_NAME} team will get back to you soon.
          </p>
        )}

        <Input
          label="Your Name"
          name="name"
          placeholder="Shariar Joy"
          value={values.name}
          onChange={(event) => updateField('name', event.target.value)}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@university.edu"
          value={values.email}
          onChange={(event) => updateField('email', event.target.value)}
          required
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="text-sm font-medium text-ink">
            Message <span className="text-danger">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            placeholder="How can we help?"
            value={values.message}
            onChange={(event) => updateField('message', event.target.value)}
            required
            className="w-full resize-none rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <Button type="submit" size="lg" fullWidth>
          Send Message
        </Button>
      </motion.form>
    </div>
  )
}

export default Contact
