import { APP_NAME } from '../../constants'
import styles from './About.module.css'

const STEPS = [
  {
    title: 'Sign up with your university email',
    description: 'Verification keeps the marketplace limited to real students across Bangladeshi universities.',
  },
  {
    title: 'List or browse',
    description: 'Sell books, electronics, and furniture you no longer need — or find tutors for your toughest courses.',
  },
  {
    title: 'Meet on campus & trade',
    description: 'Arrange a safe, on-campus meetup with fellow students to complete the exchange.',
  },
]

function About() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>About {APP_NAME}</h1>
        <p className={styles.subtitle}>
          {APP_NAME} is a student-only marketplace where university students buy and sell second-hand items and
          connect with peer tutors — all within a trusted campus community.
        </p>
      </section>

      <section className={styles.steps}>
        {STEPS.map((step, index) => (
          <div key={step.title} className={styles.step}>
            <span className={styles.stepNumber}>{index + 1}</span>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.description}</p>
          </div>
        ))}
      </section>

      <section className={styles.mission}>
        <h2>Our Mission</h2>
        <p>
          Textbooks, calculators, and lab equipment are expensive — and most of it only gets used for a semester or
          two. We built {APP_NAME} to make it easy for students to pass those items on to the next batch instead of
          letting them gather dust, while also making it simple to find affordable, peer-to-peer tutoring for the
          courses that need the most help.
        </p>
      </section>
    </div>
  )
}

export default About
