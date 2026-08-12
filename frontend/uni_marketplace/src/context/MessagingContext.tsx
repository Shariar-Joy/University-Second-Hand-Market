import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { extractErrorMessage } from '../utils/errorMessage'
import * as messagingService from '../services/messagingService'
import type { Conversation } from '../services/messagingService'

const POLL_INTERVAL_MS = 45_000

interface MessagingContextValue {
  conversations: Conversation[]
  isLoading: boolean
  error: string | null
  unreadCount: number
  refresh: () => Promise<void>
  upsertConversation: (conversation: Conversation) => void
}

const MessagingContext = createContext<MessagingContextValue | undefined>(undefined)

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    if (!user) {
      setConversations([])
      setError(null)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const fetched = await messagingService.listConversations()
      setConversations(fetched)
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load your conversations. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    if (!user) return

    const interval = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  function upsertConversation(updated: Conversation) {
    setConversations((previous) => {
      const exists = previous.some((item) => item.id === updated.id)
      const next = exists ? previous.map((item) => (item.id === updated.id ? updated : item)) : [updated, ...previous]
      return [...next].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    })
  }

  const unreadCount = conversations.filter((conversation) => conversation.unread).length

  return (
    <MessagingContext.Provider value={{ conversations, isLoading, error, unreadCount, refresh, upsertConversation }}>
      {children}
    </MessagingContext.Provider>
  )
}

export function useMessaging(): MessagingContextValue {
  const context = useContext(MessagingContext)
  if (!context) throw new Error('useMessaging must be used within a MessagingProvider')
  return context
}
