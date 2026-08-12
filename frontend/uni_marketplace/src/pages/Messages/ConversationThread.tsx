import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Send } from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import Button from '../../components/common/Button'
import EmptyState from '../../components/ui/EmptyState'
import { TextLineSkeleton } from '../../components/ui/LoadingSkeleton'
import { useToast } from '../../context/ToastContext'
import { extractErrorMessage } from '../../utils/errorMessage'
import { getProductImage, handleImageFallback } from '../../data/products'
import * as messagingService from '../../services/messagingService'
import type { Conversation, Message } from '../../services/messagingService'
import { formatBDT } from '../../utils/currency'
import { productDetailsPath, ROUTES } from '../../routes/routePaths'

const POLL_INTERVAL_MS = 5_000

interface ConversationThreadProps {
  conversationId: number
  currentUserId: number
  onConversationUpdated: (conversation: Conversation) => void
}

function formatMessageTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function ConversationThread({ conversationId, currentUserId, onConversationUpdated }: ConversationThreadProps) {
  const { showToast } = useToast()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isMounted = true
    let isPolling = false
    setIsLoading(true)
    setError(null)
    setDraft('')

    async function load(isBackground: boolean) {
      if (isBackground && isPolling) return
      isPolling = isBackground
      try {
        const { conversation: fetchedConversation, messages: fetchedMessages } =
          await messagingService.getConversationMessages(conversationId)
        if (!isMounted) return
        setConversation(fetchedConversation)
        setMessages(fetchedMessages)
        onConversationUpdated(fetchedConversation)
        if (!isBackground) setError(null)
      } catch (err) {
        // Background polls fail silently so a flaky request doesn't interrupt an open chat --
        // the next poll a few seconds later will just retry.
        if (!isMounted || isBackground) return
        setError(extractErrorMessage(err, 'Could not load this conversation. Please try again.'))
      } finally {
        isPolling = false
        if (!isBackground && isMounted) setIsLoading(false)
      }
    }

    load(false)
    const interval = setInterval(() => load(true), POLL_INTERVAL_MS)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.length])

  async function submitDraft() {
    const content = draft.trim()
    if (!content || !conversation || isSending) return

    setIsSending(true)
    try {
      const message = await messagingService.sendMessage(conversationId, content)
      setMessages((previous) => [...previous, message])
      setDraft('')
      const updatedConversation = { ...conversation, updatedAt: message.createdAt, lastMessage: message }
      setConversation(updatedConversation)
      onConversationUpdated(updatedConversation)
    } catch (err) {
      showToast(extractErrorMessage(err, 'Could not send your message. Please try again.'), 'error')
    } finally {
      setIsSending(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    submitDraft()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submitDraft()
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <TextLineSkeleton className="h-10 w-2/3" />
        <TextLineSkeleton className="h-16 w-3/4 rounded-2xl" />
        <TextLineSkeleton className="ml-auto h-16 w-3/4 rounded-2xl" />
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <EmptyState
          icon={AlertTriangle}
          title="Could not load this conversation"
          description={error ?? "This conversation may not exist or you don't have access to it."}
          action={
            <Button to={ROUTES.MESSAGES} size="sm">
              Back to Messages
            </Button>
          }
        />
      </div>
    )
  }

  const otherParty = currentUserId === conversation.buyer.id ? conversation.seller : conversation.buyer

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link
          to={ROUTES.MESSAGES}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-slate-100 md:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <Avatar name={otherParty.fullName} src={otherParty.profileImage} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{otherParty.fullName}</p>
          <Link
            to={productDetailsPath(conversation.product.slug)}
            className="truncate text-xs text-ink-soft transition-colors hover:text-primary"
          >
            {conversation.product.name} · {formatBDT(conversation.product.price)}
          </Link>
        </div>
        <img
          src={getProductImage(conversation.product)}
          alt={conversation.product.name}
          onError={(event) => handleImageFallback(event, conversation.product.category)}
          className="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-ink-soft">
            Say hello — start the conversation about "{conversation.product.name}".
          </p>
        )}
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId
          return (
            <div key={message.id} className={['flex', isOwn ? 'justify-end' : 'justify-start'].join(' ')}>
              <div
                className={[
                  'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                  isOwn ? 'bg-primary text-white' : 'bg-slate-100 text-ink',
                ].join(' ')}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <p className={['mt-1 text-[11px]', isOwn ? 'text-white/70' : 'text-ink-faint'].join(' ')}>
                  {formatMessageTime(message.createdAt)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-border p-3">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          maxLength={2000}
          className="max-h-32 flex-1 resize-none rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        <Button type="submit" size="icon" loading={isSending} disabled={!draft.trim()} aria-label="Send message">
          {!isSending && <Send className="h-4.5 w-4.5" aria-hidden="true" />}
        </Button>
      </form>
    </div>
  )
}

export default ConversationThread
