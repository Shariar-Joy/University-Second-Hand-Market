import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from './routePaths'

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isCheckingSession } = useAuth()

  if (isCheckingSession) return null
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />
  if (!user.isAdmin) return <Navigate to={ROUTES.HOME} replace />

  return <>{children}</>
}

export default RequireAdmin
