import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Hash, LogOut, Mail, Phone, UserRound } from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import Button from '../../components/common/Button'
import { ProfileSkeleton } from '../../components/ui/LoadingSkeleton'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../routes/routePaths'

function Profile() {
  const { user, isCheckingSession, logout } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
      navigate(ROUTES.HOME)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
        <ProfileSkeleton />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-bold text-ink">You're not signed in</h1>
        <p className="text-sm text-ink-soft">Log in to view your profile.</p>
        <div className="mt-2 flex gap-3">
          <Button to={ROUTES.LOGIN} variant="outline" size="lg">
            Log In
          </Button>
          <Button to={ROUTES.REGISTER} size="lg">
            Create Account
          </Button>
        </div>
      </div>
    )
  }

  const details = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Building2, label: 'University', value: user.university },
    { icon: UserRound, label: 'Department', value: user.department },
    { icon: Hash, label: 'Student ID', value: user.studentId },
    ...(user.phone ? [{ icon: Phone, label: 'Phone', value: user.phone }] : []),
  ]

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl border border-border bg-white p-8 shadow-card"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar name={user.fullName} size="lg" />
          <div>
            <h1 className="text-xl font-bold text-ink">{user.fullName}</h1>
            <p className="text-sm text-ink-soft">@{user.username}</p>
          </div>
        </div>

        <dl className="mt-8 flex flex-col divide-y divide-border rounded-2xl border border-border">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs text-ink-soft">{label}</dt>
                <dd className="truncate text-sm font-medium text-ink">{value}</dd>
              </div>
            </div>
          ))}
        </dl>

        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={handleLogout}
          loading={isLoggingOut}
          className="mt-8"
        >
          {!isLoggingOut && <LogOut className="h-4 w-4" aria-hidden="true" />}
          {isLoggingOut ? 'Logging out…' : 'Log Out'}
        </Button>
      </motion.div>
    </div>
  )
}

export default Profile
