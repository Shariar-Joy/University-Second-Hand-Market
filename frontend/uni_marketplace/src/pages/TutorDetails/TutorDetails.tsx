import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, CalendarClock, ChevronLeft, GraduationCap, MessageCircle, UserRoundSearch } from 'lucide-react'
import Button from '../../components/common/Button'
import Avatar from '../../components/common/Avatar'
import StarRating from '../../components/common/StarRating'
import EmptyState from '../../components/ui/EmptyState'
import TutorCard from '../../components/tutor/TutorCard'
import { TextLineSkeleton } from '../../components/ui/LoadingSkeleton'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { ApiError } from '../../services/apiClient'
import * as tutorService from '../../services/tutorService'
import type { Tutor } from '../../services/tutorService'
import * as messagingService from '../../services/messagingService'
import { formatBDT } from '../../utils/currency'
import { messageThreadPath, ROUTES } from '../../routes/routePaths'

function TutorDetails() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [relatedTutors, setRelatedTutors] = useState<Tutor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isContactingTutor, setIsContactingTutor] = useState(false)

  useEffect(() => {
    if (!slug) return
    let isMounted = true
    setIsLoading(true)
    setNotFound(false)

    tutorService
      .getTutorBySlug(slug)
      .then((fetched) => {
        if (!isMounted) return
        setTutor(fetched)
        return tutorService.listTutors().then((all) => {
          if (!isMounted) return
          setRelatedTutors(
            all
              .filter((item) => item.id !== fetched.id && item.subjects.some((subject) => fetched.subjects.includes(subject)))
              .slice(0, 4),
          )
        })
      })
      .catch((error) => {
        if (!isMounted) return
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true)
        } else {
          showToast('Could not load this tutor profile. Please try again.', 'error')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <TextLineSkeleton className="h-5 w-32" />
        <div className="flex items-center gap-4">
          <TextLineSkeleton className="h-20 w-20 rounded-full" />
          <TextLineSkeleton className="h-8 w-1/3" />
        </div>
        <TextLineSkeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  if (notFound || !tutor) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={UserRoundSearch}
          title="Tutor not found"
          description="This tutor profile may no longer be available."
          action={
            <Button to={ROUTES.HOME} size="lg">
              Back to Marketplace
            </Button>
          }
        />
      </div>
    )
  }

  const isOwner = user !== null && tutor.userId === user.id
  const isContactable = tutor.userId !== null

  async function handleContactTutor() {
    if (!user) {
      navigate(ROUTES.LOGIN, { state: { from: location.pathname } })
      return
    }
    setIsContactingTutor(true)
    try {
      const conversation = await messagingService.startTutorConversation(tutor!.id)
      navigate(messageThreadPath(conversation.id))
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : 'Could not start a conversation. Please try again.',
        'error',
      )
    } finally {
      setIsContactingTutor(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <Link to={ROUTES.HOME} className="flex w-fit items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-primary">
        <ChevronLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-6 rounded-2xl border border-border bg-white p-6 shadow-card sm:p-8"
      >
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Avatar name={tutor.name} size="lg" />
          <div className="flex flex-1 flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{tutor.name}</h1>
            <p className="flex items-center gap-1.5 text-sm text-ink-soft">
              <GraduationCap className="h-4 w-4 shrink-0" aria-hidden="true" />
              {tutor.university}
              {tutor.department && <span> · {tutor.department}</span>}
            </p>
            <StarRating rating={tutor.rating} reviewCount={tutor.reviewCount} />
          </div>
          <div className="text-left sm:text-right">
            <p className="text-2xl font-extrabold text-primary">{formatBDT(tutor.pricePerClass)}</p>
            <p className="text-xs text-ink-soft">per class</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tutor.subjects.map((subject) => (
            <span key={subject} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              {subject}
            </span>
          ))}
        </div>

        {tutor.bio && <p className="text-sm text-ink-soft">{tutor.bio}</p>}

        <div className="flex flex-col gap-2 text-sm text-ink-soft">
          {tutor.availability && (
            <span className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 shrink-0" aria-hidden="true" />
              {tutor.availability}
            </span>
          )}
          {tutor.experience !== null && tutor.experience !== undefined && (
            <span className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 shrink-0" aria-hidden="true" />
              {tutor.experience} {tutor.experience === 1 ? 'year' : 'years'} of tutoring experience
            </span>
          )}
        </div>

        {isOwner ? (
          <div className="flex flex-col gap-2 pt-2">
            <p className="text-sm font-medium text-ink-soft">This is your tutor profile.</p>
            <Button to={ROUTES.BECOME_TUTOR} size="lg">
              Manage Profile
            </Button>
          </div>
        ) : (
          <Button
            size="lg"
            onClick={handleContactTutor}
            disabled={!isContactable}
            loading={isContactingTutor}
          >
            {!isContactingTutor && <MessageCircle className="h-4.5 w-4.5" aria-hidden="true" />}
            {isContactable ? 'Contact Tutor' : 'Contact Unavailable'}
          </Button>
        )}
      </motion.div>

      {relatedTutors.length > 0 && (
        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-ink">Similar Tutors</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedTutors.map((related) => (
              <TutorCard key={related.id} tutor={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default TutorDetails
