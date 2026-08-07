import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, MapPin, ShoppingCart } from 'lucide-react'
import Button from '../../common/Button'
import Badge from '../../ui/Badge'
import Modal from '../../ui/Modal'
import { useCart } from '../../../context/CartContext'
import { useToast } from '../../../context/ToastContext'
import { getProductImage, type ProductCondition } from '../../../data/products'
import type { Product } from '../../../services/productService'
import { formatBDT } from '../../../utils/currency'
import { productDetailsPath } from '../../../routes/routePaths'

const CONDITION_VARIANT: Record<ProductCondition, 'success' | 'primary' | 'neutral' | 'warning'> = {
  New: 'success',
  'Like New': 'primary',
  Good: 'neutral',
  Fair: 'warning',
}

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  function handleAddToCart() {
    addItem(product.id)
    showToast(`Added "${product.name}" to cart`, 'success')
  }

  const conditionVariant = CONDITION_VARIANT[product.condition as ProductCondition] ?? 'neutral'
  const detailsPath = productDetailsPath(product.slug)

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.35 }}
        whileHover={{ y: -6 }}
        className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card transition-shadow duration-300 hover:shadow-card-hover"
      >
        <Link to={detailsPath} className="relative block aspect-4/3 overflow-hidden bg-slate-100">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-black/35 to-transparent" aria-hidden="true" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge variant="neutral">{product.category}</Badge>
            <Badge variant={conditionVariant}>{product.condition}</Badge>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              setQuickViewOpen(true)
            }}
            className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-soft opacity-0 shadow-card backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 hover:bg-white hover:text-primary"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye className="h-4 w-4" />
          </button>
        </Link>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <Link to={detailsPath}>
            <h3 className="line-clamp-1 font-semibold text-ink transition-colors hover:text-primary">{product.name}</h3>
          </Link>
          <p className="flex items-center gap-1 text-sm text-ink-soft">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">
              {product.seller} · {product.university}
            </span>
          </p>
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-lg font-bold text-ink">{formatBDT(product.price)}</span>
            <Button size="sm" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Add
            </Button>
          </div>
        </div>
      </motion.article>

      <Modal isOpen={quickViewOpen} onClose={() => setQuickViewOpen(false)} title="Quick View" size="md">
        <div className="flex flex-col gap-4 sm:flex-row">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="h-48 w-full rounded-xl object-cover sm:h-40 sm:w-40"
          />
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="neutral">{product.category}</Badge>
              <Badge variant={conditionVariant}>{product.condition}</Badge>
            </div>
            <h3 className="text-lg font-bold text-ink">{product.name}</h3>
            <p className="flex items-center gap-1 text-sm text-ink-soft">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {product.seller} · {product.university}
            </p>
            <span className="text-xl font-bold text-ink">{formatBDT(product.price)}</span>
            <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row">
              <Button
                fullWidth
                onClick={() => {
                  handleAddToCart()
                  setQuickViewOpen(false)
                }}
              >
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                Add to Cart
              </Button>
              <Button to={detailsPath} variant="outline" fullWidth>
                View Details
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default ProductCard
