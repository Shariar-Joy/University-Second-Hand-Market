import { useState, type FormEvent } from 'react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { APP_NAME } from '../../constants'
import styles from './Contact.module.css'

interface FormValues {
  name: string
  email: string
  message: string
}

const INITIAL_VALUES: FormValues = { name: '', email: '', message: '' }

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
    <div className={styles.page}>
      <div className={styles.intro}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.subtitle}>Questions, feedback, or a campus safety concern? Reach out any time.</p>

        <div className={styles.infoList}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email</span>
            <span>support@campusexchange.example</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Phone</span>
            <span>+880 1XXX-XXXXXX</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Hours</span>
            <span>Sunday – Thursday, 9am – 6pm</span>
          </div>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {submitted && (
          <p className={styles.success} role="status">
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
        <div className={styles.field}>
          <label htmlFor="message" className={styles.label}>
            Message <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            className={styles.textarea}
            rows={5}
            placeholder="How can we help?"
            value={values.message}
            onChange={(event) => updateField('message', event.target.value)}
            required
          />
        </div>

        <Button type="submit" size="lg" fullWidth>
          Send Message
        </Button>
      </form>
    </div>
  )
}

export default Contact
