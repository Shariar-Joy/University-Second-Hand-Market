import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, ChevronLeft, MapPin, MessageCircle, PackageSearch, ShoppingCart } from 'lucide-react'
import Button from '../../components/common/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/common/Avatar'
import EmptyState from '../../components/ui/EmptyState'
import ProductCard from '../../components/product/ProductCard'
import { TextLineSkeleton } from '../../components/ui/LoadingSkeleton'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { getProductImage, type ProductCondition } from '../../data/products'
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

function formatPostedDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso))
  } catch {
    return iso
  }
}

function ProductDetails() {
  const { slug } = useParams<{ slug: string }>()
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    productService
      .listProducts()
      .then((fetched) => {
        if (isMounted) setProducts(fetched)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

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

  const product = products.find((item) => item.slug === slug)

  if (!product) {
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

  const currentProduct = product
  const conditionVariant = CONDITION_VARIANT[currentProduct.condition as ProductCondition] ?? 'neutral'

  const relatedProducts = products
    .filter((item) => item.category === currentProduct.category && item.id !== currentProduct.id)
    .slice(0, 4)

  function handleAddToCart() {
    addItem(currentProduct.id)
    showToast(`Added "${currentProduct.name}" to cart`, 'success')
  }

  function handleContactSeller() {
    showToast(`Contacting sellers isn't wired up yet — reach ${currentProduct.seller} on campus for now.`, 'info')
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
        <div className="overflow-hidden rounded-2xl border border-border bg-slate-100 shadow-card">
          <img src={getProductImage(product)} alt={product.name} className="aspect-4/3 w-full object-cover" />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="neutral">{product.category}</Badge>
            <Badge variant={conditionVariant}>{product.condition}</Badge>
          </div>

          <h1 className="text-2xl font-bold text-ink sm:text-3xl">{product.name}</h1>
          <p className="text-3xl font-extrabold text-primary">{formatBDT(product.price)}</p>

          <div className="flex flex-col gap-2 text-sm text-ink-soft">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              {product.university}
            </span>
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

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button size="lg" fullWidth onClick={handleAddToCart}>
              <ShoppingCart className="h-4.5 w-4.5" aria-hidden="true" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" fullWidth onClick={handleContactSeller}>
              <MessageCircle className="h-4.5 w-4.5" aria-hidden="true" />
              Contact Seller
            </Button>
          </div>
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
