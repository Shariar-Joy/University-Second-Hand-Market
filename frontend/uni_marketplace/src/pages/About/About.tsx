import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Handshake, Search, UserPlus } from 'lucide-react'
import SectionTitle from '../../components/ui/SectionTitle'
import { APP_NAME } from '../../constants'

const STEPS = [
  {
    icon: UserPlus,
    title: 'Sign up with your university email',
    description: 'Verification keeps the marketplace limited to real students across Bangladeshi universities.',
  },
  {
    icon: Search,
    title: 'List or browse',
    description: 'Sell books, electronics, and furniture you no longer need — or find tutors for your toughest courses.',
  },
  {
    icon: Handshake,
    title: 'Meet on campus & trade',
    description: 'Arrange a safe, on-campus meetup with fellow students to complete the exchange.',
  },
]

const FAQS = [
  {
    question: 'Who can use Campus Exchange?',
    answer: 'Anyone with a verified university email can sign up — the marketplace is limited to real students only.',
  },
  {
    question: 'How do I meet a seller safely?',
    answer: 'We recommend arranging a public, on-campus meetup during daytime hours to inspect and exchange items.',
  },
  {
    question: 'Is booking a tutor free?',
    answer: 'Browsing tutor profiles is always free. Tutors set their own per-class rates, shown on each profile.',
  },
  {
    question: 'Can I sell items outside the listed categories?',
    answer: 'Yes — pick the closest matching category or "Other" when you create your listing.',
  },
]

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-border bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-semibold text-ink">{question}</span>
        <ChevronDown
          className={['h-5 w-5 shrink-0 text-ink-soft transition-transform duration-200', open ? 'rotate-180' : ''].join(' ')}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-4 text-sm text-ink-soft">{answer}</p>
      </motion.div>
    </div>
  )
}

function About() {
  return (
    <div className="flex flex-col">
      <section className="bg-linear-to-b from-primary/5 to-white px-4 py-16 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-2xl"
        >
          <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">About {APP_NAME}</h1>
          <p className="mt-4 text-lg text-ink-soft">
            {APP_NAME} is a student-only marketplace where university students buy and sell second-hand items and
            connect with peer tutors — all within a trusted campus community.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="How it works" title="Three simple steps" align="center" />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-white p-6 text-center shadow-card"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="font-semibold text-ink">{title}</h3>
              <p className="text-sm text-ink-soft">{description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-ink">Our Mission</h2>
          <p className="mt-4 text-ink-soft">
            Textbooks, calculators, and lab equipment are expensive — and most of it only gets used for a semester or
            two. We built {APP_NAME} to make it easy for students to pass those items on to the next batch instead of
            letting them gather dust, while also making it simple to find affordable, peer-to-peer tutoring for the
            courses that need the most help.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="FAQ" title="Frequently asked questions" align="center" />
        <div className="mt-8 flex flex-col gap-3">
          {FAQS.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default About
