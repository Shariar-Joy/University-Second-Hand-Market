import { useState } from 'react'
import { Heart } from 'lucide-react'
import Button from '../../components/common/Button'
import EmptyState from '../../components/ui/EmptyState'
import { ProductCardSkeleton } from '../../components/ui/LoadingSkeleton'
import ProductCard from '../../components/product/ProductCard'
import { useWishlist } from '../../context/WishlistContext'
import { useToast } from '../../context/ToastContext'
import { extractErrorMessage } from '../../utils/errorMessage'
import { ROUTES } from '../../routes/routePaths'

function Wishlist() {
  const { items, isLoading, error, removeFromWishlist, refresh } = useWishlist()
  const { showToast } = useToast()
  const [removingId, setRemovingId] = useState<number | null>(null)

  async function handleRemove(productId: number) {
    setRemovingId(productId)
    try {
      await removeFromWishlist(productId)
      showToast('Removed from wishlist.', 'success')
    } catch (removeError) {
      showToast(extractErrorMessage(removeError, 'Could not remove this item. Please try again.'), 'error')
    } finally {
      setRemovingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">My Wishlist</h1>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-1 items-center px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={Heart}
          title="Could not load your wishlist"
          description={error}
          action={
            <Button size="lg" onClick={() => refresh()}>
              Try Again
            </Button>
          }
          className="w-full"
        />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-1 items-center px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save products you're interested in and find them here later."
          action={
            <Button to={ROUTES.HOME} size="lg">
              Browse Marketplace
            </Button>
          }
          className="w-full"
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">My Wishlist</h1>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-2">
            <ProductCard product={item.product} />
            <Button
              variant="outline"
              size="sm"
              fullWidth
              loading={removingId === item.product.id}
              onClick={() => handleRemove(item.product.id)}
            >
              Remove from Wishlist
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Wishlist
