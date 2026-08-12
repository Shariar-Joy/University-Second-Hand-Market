import { Compass } from 'lucide-react'
import Button from '../../components/common/Button'
import EmptyState from '../../components/ui/EmptyState'
import { ROUTES } from '../../routes/routePaths'

function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
      <span className="text-6xl font-extrabold tracking-tight text-primary/30">404</span>
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you're looking for doesn't exist or may have been moved."
        action={
          <Button to={ROUTES.HOME} size="lg">
            Back to Marketplace
          </Button>
        }
      />
    </div>
  )
}

export default NotFound
