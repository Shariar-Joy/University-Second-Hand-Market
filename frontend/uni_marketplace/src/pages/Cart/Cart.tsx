import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import Button from '../../components/common/Button'
import EmptyState from '../../components/ui/EmptyState'
import { TextLineSkeleton } from '../../components/ui/LoadingSkeleton'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { getProductImage } from '../../data/products'
import * as productService from '../../services/productService'
import type { Product } from '../../services/productService'
import { formatBDT } from '../../utils/currency'
import { ROUTES } from '../../routes/routePaths'

function Cart() {
  const { items, updateQuantity, removeItem, clearCart } = useCart()
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

  const lines = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product ? { product, quantity: item.quantity } : null
    })
    .filter((line): line is { product: Product; quantity: number } => line !== null)

  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0)

  function handleCheckout() {
    showToast('Checkout is not available yet — this is a demo cart.', 'info')
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
        <TextLineSkeleton className="h-8 w-40" />
        <TextLineSkeleton className="h-24 w-full rounded-2xl" />
        <TextLineSkeleton className="h-24 w-full rounded-2xl" />
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-1 items-center px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse the marketplace and add items you'd like to buy."
          action={
            <Button to={ROUTES.HOME} size="lg">
              Browse Products
            </Button>
          }
          className="w-full"
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Your Cart</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {lines.map(({ product, quantity }) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-card"
            >
              <img src={getProductImage(product)} alt={product.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-1 font-semibold text-ink">{product.name}</h3>
                <p className="text-sm text-ink-soft">{formatBDT(product.price)}</p>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-border p-1">
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  disabled={quantity <= 1}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
                  aria-label={`Decrease quantity of ${product.name}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-semibold text-ink">{quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-slate-100"
                  aria-label={`Increase quantity of ${product.name}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="hidden w-24 shrink-0 text-right font-semibold text-ink sm:block">
                {formatBDT(product.price * quantity)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(product.id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
                aria-label={`Remove ${product.name} from cart`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-card">
            <h2 className="font-semibold text-ink">Order Summary</h2>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-ink-soft">Total</span>
              <span className="text-xl font-bold text-ink">{formatBDT(total)}</span>
            </div>
            <Button size="lg" fullWidth onClick={handleCheckout}>
              Checkout
            </Button>
            <Button variant="outline" size="lg" fullWidth onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
