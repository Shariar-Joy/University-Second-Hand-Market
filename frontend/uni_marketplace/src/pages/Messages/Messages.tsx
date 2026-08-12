import { useLocation } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import Button from '../../components/common/Button'
import EmptyState from '../../components/ui/EmptyState'
import { ROUTES, productDetailsPath } from '../../routes/routePaths'

interface ContactContext {
  sellerName?: string
  productName?: string
  productSlug?: string
}

function Messages() {
  const location = useLocation()
  const context = (location.state as ContactContext | null) ?? null

  const description = context?.sellerName
    ? `Direct messaging is coming soon. For now, reach out to ${context.sellerName} on campus about "${context.productName}".`
    : 'Direct messaging is coming soon. Once you contact a seller, your conversation will appear here.'

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
      <EmptyState
        icon={MessageCircle}
        title="Messages"
        description={description}
        action={
          <Button to={context?.productSlug ? productDetailsPath(context.productSlug) : ROUTES.HOME} size="lg">
            {context?.productSlug ? 'Back to Listing' : 'Browse Marketplace'}
          </Button>
        }
      />
    </div>
  )
}

export default Messages
