import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../../components/common/Avatar'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../routes/routePaths'
import styles from './Profile.module.css'

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
    return <div className={styles.wrapper} />
  }

  if (!user) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>You're not signed in</h1>
          <p className={styles.subtitle}>Log in to view your profile.</p>
          <div className={styles.actions}>
            <Button to={ROUTES.LOGIN} variant="outline" size="lg">
              Log In
            </Button>
            <Button to={ROUTES.REGISTER} size="lg">
              Create Account
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <Avatar name={user.fullName} size="lg" />
        <h1 className={styles.title}>{user.fullName}</h1>
        <p className={styles.username}>@{user.username}</p>

        <dl className={styles.details}>
          <div className={styles.detailRow}>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt>University</dt>
            <dd>{user.university}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt>Department</dt>
            <dd>{user.department}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt>Student ID</dt>
            <dd>{user.studentId}</dd>
          </div>
          {user.phone && (
            <div className={styles.detailRow}>
              <dt>Phone</dt>
              <dd>{user.phone}</dd>
            </div>
          )}
        </dl>

        <Button variant="outline" size="lg" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? 'Logging out…' : 'Log Out'}
        </Button>
      </div>
    </div>
  )
}

export default Profile
