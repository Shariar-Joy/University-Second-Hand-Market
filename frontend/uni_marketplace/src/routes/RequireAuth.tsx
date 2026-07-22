import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from './routePaths'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isCheckingSession } = useAuth()

  if (isCheckingSession) return null
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />

  return <>{children}</>
}

export default RequireAuth
