import { useNavigate, useParams } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import Button from '../../components/common/Button'
import EmptyState from '../../components/ui/EmptyState'
import { TextLineSkeleton } from '../../components/ui/LoadingSkeleton'
import ConversationThread from './ConversationThread'
import { useAuth } from '../../context/AuthContext'
import { useMessaging } from '../../context/MessagingContext'
import { messageThreadPath, ROUTES } from '../../routes/routePaths'
import type { Conversation } from '../../services/messagingService'

function formatUpdatedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(iso))
  } catch {
    return ''
  }
}

function Messages() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { conversations, isLoading, error, refresh, upsertConversation } = useMessaging()
  const { conversationId } = useParams<{ conversationId?: string }>()
  const selectedId = conversationId ? Number(conversationId) : null

  function handleConversationUpdated(updated: Conversation) {
    upsertConversation(updated)
  }

  if (!user) return null

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-ink sm:text-3xl">Messages</h1>

      <div className="flex h-[calc(100vh-260px)] min-h-105 flex-1 overflow-hidden rounded-2xl border border-border bg-white shadow-card">
        <div
          className={[
            selectedId ? 'hidden md:flex' : 'flex',
            'w-full flex-col border-r border-border md:w-80 md:shrink-0',
          ].join(' ')}
        >
          {isLoading && conversations.length === 0 && (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <TextLineSkeleton key={index} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="flex flex-1 items-center p-4">
              <EmptyState
                icon={MessageCircle}
                title="Could not load conversations"
                description={error}
                action={
                  <Button size="sm" onClick={() => refresh()}>
                    Try Again
                  </Button>
                }
                className="w-full"
              />
            </div>
          )}

          {!isLoading && !error && conversations.length === 0 && (
            <div className="flex flex-1 items-center p-4">
              <EmptyState
                icon={MessageCircle}
                title="No conversations yet"
                description="Contact a seller from a product page to start chatting."
                action={
                  <Button to={ROUTES.HOME} size="sm">
                    Browse Marketplace
                  </Button>
                }
                className="w-full"
              />
            </div>
          )}

          {(!isLoading || conversations.length > 0) && !error && conversations.length > 0 && (
            <ul className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => {
                const otherParty = user.id === conversation.buyer.id ? conversation.seller : conversation.buyer
                const isActive = conversation.id === selectedId
                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => navigate(messageThreadPath(conversation.id))}
                      className={[
                        'flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-slate-50',
                        isActive ? 'bg-primary/5' : '',
                      ].join(' ')}
                    >
                      <span className="relative shrink-0">
                        <Avatar name={otherParty.fullName} src={otherParty.profileImage} size="md" />
                        {conversation.unread && (
                          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-primary" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={[
                              'truncate text-sm',
                              conversation.unread ? 'font-bold text-ink' : 'font-semibold text-ink',
                            ].join(' ')}
                          >
                            {otherParty.fullName}
                          </p>
                          {conversation.lastMessage && (
                            <span className="shrink-0 text-[11px] text-ink-faint">
                              {formatUpdatedAt(conversation.updatedAt)}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-ink-soft">{conversation.product.name}</p>
                        {conversation.lastMessage && (
                          <p
                            className={[
                              'mt-0.5 truncate text-xs',
                              conversation.unread ? 'font-semibold text-ink' : 'text-ink-faint',
                            ].join(' ')}
                          >
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className={[selectedId ? 'flex' : 'hidden md:flex', 'flex-1 flex-col'].join(' ')}>
          {selectedId ? (
            <ConversationThread
              key={selectedId}
              conversationId={selectedId}
              currentUserId={user.id}
              onConversationUpdated={handleConversationUpdated}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                icon={MessageCircle}
                title="Select a conversation"
                description="Choose a conversation from the list to view messages."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages
