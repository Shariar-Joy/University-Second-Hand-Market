import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as authService from '../services/authService'
import type { User } from '../services/authService'

interface AuthContextValue {
  user: User | null
  isCheckingSession: boolean
  setUser: (user: User | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    let isMounted = true
    authService
      .fetchCurrentUser()
      .then((current) => {
        if (isMounted) setUser(current)
      })
      .catch(() => {
        if (isMounted) setUser(null)
      })
      .finally(() => {
        if (isMounted) setIsCheckingSession(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  async function logout() {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isCheckingSession, setUser, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
