import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import Avatar from '../../common/Avatar'
import Button from '../../common/Button'
import StarRating from '../../common/StarRating'
import { useToast } from '../../../context/ToastContext'
import type { Tutor } from '../../../services/tutorService'
import { formatBDT } from '../../../utils/currency'
import { tutorDetailsPath } from '../../../routes/routePaths'

interface TutorCardProps {
  tutor: Tutor
}

function TutorCard({ tutor }: TutorCardProps) {
  const { showToast } = useToast()
  const detailsPath = tutorDetailsPath(tutor.slug)

  function handleBookClass() {
    showToast(`Booking request sent to ${tutor.name}`, 'info')
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -6 }}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover"
    >
      <Link to={detailsPath} className="flex items-center gap-3">
        <Avatar name={tutor.name} size="lg" />
        <div className="min-w-0">
          <h3 className="line-clamp-1 font-semibold text-ink transition-colors hover:text-primary">{tutor.name}</h3>
          <p className="flex items-center gap-1 text-sm text-ink-soft">
            <GraduationCap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{tutor.university}</span>
          </p>
        </div>
      </Link>

      <div className="flex flex-wrap gap-1.5">
        {tutor.subjects.map((subject) => (
          <span key={subject} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {subject}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <StarRating rating={tutor.rating} reviewCount={tutor.reviewCount} size="sm" />
        <span className="text-base font-bold text-ink">
          {formatBDT(tutor.pricePerClass)}
          <span className="text-xs font-normal text-ink-soft">/class</span>
        </span>
      </div>

      <Button size="sm" fullWidth onClick={handleBookClass}>
        Book a Class
      </Button>
    </motion.article>
  )
}

export default TutorCard
