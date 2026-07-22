import Avatar from '../../common/Avatar'
import Button from '../../common/Button'
import StarRating from '../../common/StarRating'
import { useToast } from '../../../context/ToastContext'
import type { Tutor } from '../../../data/tutors'
import { formatBDT } from '../../../utils/currency'
import styles from './TutorCard.module.css'

interface TutorCardProps {
  tutor: Tutor
}

function TutorCard({ tutor }: TutorCardProps) {
  const { showToast } = useToast()

  function handleBookClass() {
    showToast(`Booking request sent to ${tutor.name}`, 'info')
  }

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <Avatar name={tutor.name} size="lg" />
        <div>
          <h3 className={styles.name}>{tutor.name}</h3>
          <p className={styles.university}>{tutor.university}</p>
        </div>
      </div>

      <div className={styles.subjects}>
        {tutor.subjects.map((subject) => (
          <span key={subject} className={styles.subjectTag}>
            {subject}
          </span>
        ))}
      </div>

      <div className={styles.footer}>
        <StarRating rating={tutor.rating} reviewCount={tutor.reviewCount} size="sm" />
        <span className={styles.price}>
          {formatBDT(tutor.pricePerClass)}
          <span className={styles.perClass}>/class</span>
        </span>
      </div>

      <Button size="sm" fullWidth onClick={handleBookClass}>
        Book a Class
      </Button>
    </article>
  )
}

export default TutorCard
