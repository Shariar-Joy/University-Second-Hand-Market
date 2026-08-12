import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  PackageSearch,
} from 'lucide-react'
import Button from '../../components/common/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/common/Avatar'
import EmptyState from '../../components/ui/EmptyState'
import ProductCard from '../../components/product/ProductCard'
import ListingActions from '../../components/product/ListingActions'
import { TextLineSkeleton } from '../../components/ui/LoadingSkeleton'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useWishlist } from '../../context/WishlistContext'
import { ApiError } from '../../services/apiClient'
import { getProductImage, handleImageFallback, type ProductCondition } from '../../data/products'
import * as productService from '../../services/productService'
import type { Product } from '../../services/productService'
import { formatBDT } from '../../utils/currency'
import { ROUTES } from '../../routes/routePaths'

const CONDITION_VARIANT: Record<ProductCondition, 'success' | 'primary' | 'neutral' | 'warning'> = {
  New: 'success',
  'Like New': 'primary',
  Good: 'neutral',
  Fair: 'warning',
}

const STATUS_BADGE: Record<string, { label: string; variant: 'warning' | 'danger' | 'neutral' } | undefined> = {
  reserved: { label: 'Reserved', variant: 'warning' },
  sold: { label: 'Sold', variant: 'danger' },
  archived: { label: 'Archived', variant: 'neutral' },
}

function formatPostedDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso))
  } catch {
    return iso
  }
}

function ProductDetails() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { isWishlisted, addToWishlist, removeFromWishlist, refresh: refreshWishlist } = useWishlist()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isWishlistBusy, setIsWishlistBusy] = useState(false)

  useEffect(() => {
    if (!slug) return
    let isMounted = true
    setIsLoading(true)
    setNotFound(false)
    setActiveImageIndex(0)

    productService
      .getProductBySlug(slug)
      .then((fetched) => {
        if (!isMounted) return
        setProduct(fetched)
        setActiveImageIndex(0)
        return productService.listProducts().then((all) => {
          if (!isMounted) return
          setRelatedProducts(all.filter((item) => item.category === fetched.category && item.id !== fetched.id).slice(0, 4))
        })
      })
      .catch((error) => {
        if (!isMounted) return
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true)
        } else {
          showToast('Could not load this listing. Please try again.', 'error')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <TextLineSkeleton className="h-5 w-32" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <TextLineSkeleton className="aspect-4/3 w-full rounded-2xl" />
          <div className="flex flex-col gap-4">
            <TextLineSkeleton className="h-8 w-3/4" />
            <TextLineSkeleton className="h-5 w-1/2" />
            <TextLineSkeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={PackageSearch}
          title="Product not found"
          description="This listing may have been sold or removed."
          action={
            <Button to={ROUTES.HOME} size="lg">
              Back to Marketplace
            </Button>
          }
        />
      </div>
    )
  }

  const conditionVariant = CONDITION_VARIANT[product.condition as ProductCondition] ?? 'neutral'
  const statusBadge = STATUS_BADGE[product.status]
  const isOwner = user !== null && product.sellerId === user.id

  const galleryImages =
    product.imageDetails.length > 0
      ? [...product.imageDetails].sort((a, b) => a.position - b.position).map((image) => image.url)
      : [getProductImage(product)]
  const hasMultipleImages = galleryImages.length > 1
  const activeImage = galleryImages[activeImageIndex] ?? galleryImages[0]

  function showPreviousImage() {
    setActiveImageIndex((index) => (index === 0 ? galleryImages.length - 1 : index - 1))
  }

  function showNextImage() {
    setActiveImageIndex((index) => (index === galleryImages.length - 1 ? 0 : index + 1))
  }

  function handleContactSeller() {
    if (!user) {
      navigate(ROUTES.LOGIN, { state: { from: location.pathname } })
      return
    }
    navigate(ROUTES.MESSAGES, {
      state: {
        sellerName: product!.seller,
        productName: product!.name,
        productSlug: product!.slug,
      },
    })
  }

  async function handleToggleWishlist() {
    if (!user) {
      navigate(ROUTES.LOGIN, { state: { from: location.pathname } })
      return
    }
    const productId = product!.id
    setIsWishlistBusy(true)
    try {
      if (isWishlisted(productId)) {
        await removeFromWishlist(productId)
      } else {
        await addToWishlist(productId)
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // Already wishlisted from another tab/click -- resync instead of showing an error.
        await refreshWishlist()
      } else {
        showToast(
          error instanceof ApiError ? error.message : 'Could not update your wishlist. Please try again.',
          'error',
        )
      }
    } finally {
      setIsWishlistBusy(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <Link to={ROUTES.HOME} className="flex w-fit items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-primary">
        <ChevronLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-1 gap-10 md:grid-cols-2"
      >
        <div className="flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-slate-100 shadow-card">
            <img
              src={activeImage}
              alt={product.name}
              onError={(event) => handleImageFallback(event, product.category)}
              className="aspect-4/3 w-full object-cover"
            />
            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  aria-label="Previous photo"
                  className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-card transition-colors hover:bg-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  aria-label="Next photo"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-card transition-colors hover:bg-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                  {activeImageIndex + 1} / {galleryImages.length}
                </span>
              </>
            )}
          </div>
          {hasMultipleImages && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {galleryImages.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`View photo ${index + 1}`}
                  className={[
                    'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                    index === activeImageIndex ? 'border-primary' : 'border-transparent hover:border-border',
                  ].join(' ')}
                >
                  <img
                    src={url}
                    alt=""
                    onError={(event) => handleImageFallback(event, product.category)}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="neutral">{product.category}</Badge>
            <Badge variant={conditionVariant}>{product.condition}</Badge>
            {product.negotiable && <Badge variant="primary">Negotiable</Badge>}
            {statusBadge && <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>}
          </div>

          <h1 className="text-2xl font-bold text-ink sm:text-3xl">{product.name}</h1>
          <p className="text-3xl font-extrabold text-primary">{formatBDT(product.price)}</p>

          {product.description && <p className="text-sm text-ink-soft">{product.description}</p>}

          <div className="flex flex-col gap-2 text-sm text-ink-soft">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              {product.location ? `${product.location} · ${product.university}` : product.university}
            </span>
            {product.department && (
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                {product.department}
              </span>
            )}
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
              Posted on {formatPostedDate(product.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-slate-50 p-4">
            <Avatar name={product.seller} size="md" />
            <div>
              <p className="text-sm font-semibold text-ink">{product.seller}</p>
              <p className="text-xs text-ink-soft">Seller · {product.university}</p>
            </div>
          </div>

          {isOwner ? (
            <div className="flex flex-col gap-2 pt-2">
              <p className="text-sm font-medium text-ink-soft">This is your listing.</p>
              <ListingActions
                product={product}
                onUpdated={setProduct}
                onDeleted={() => navigate(ROUTES.PROFILE)}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                size="lg"
                fullWidth
                onClick={handleContactSeller}
                disabled={product.status === 'sold'}
              >
                <MessageCircle className="h-4.5 w-4.5" aria-hidden="true" />
                {product.status === 'sold' ? 'Sold' : 'Contact Seller'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                fullWidth
                onClick={handleToggleWishlist}
                loading={isWishlistBusy}
              >
                {!isWishlistBusy && (
                  <Heart
                    className="h-4.5 w-4.5"
                    aria-hidden="true"
                    fill={isWishlisted(product.id) ? 'currentColor' : 'none'}
                  />
                )}
                {isWishlisted(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {relatedProducts.length > 0 && (
        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-ink">Related Listings</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetails
