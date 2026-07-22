import { useEffect, useState } from 'react'
import Button from '../../components/common/Button'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { getProductImage } from '../../data/products'
import * as productService from '../../services/productService'
import type { Product } from '../../services/productService'
import { formatBDT } from '../../utils/currency'
import { ROUTES } from '../../routes/routePaths'
import styles from './Cart.module.css'

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
    return <div className={styles.emptyWrapper} />
  }

  if (lines.length === 0) {
    return (
      <div className={styles.emptyWrapper}>
        <div className={styles.emptyCard}>
          <h1 className={styles.title}>Your cart is empty</h1>
          <p className={styles.subtitle}>Browse the marketplace and add items you'd like to buy.</p>
          <Button to={ROUTES.HOME} size="lg">
            Browse Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Your Cart</h1>

      <div className={styles.list}>
        {lines.map(({ product, quantity }) => (
          <div key={product.id} className={styles.row}>
            <img src={getProductImage(product)} alt="" className={styles.thumb} />
            <div className={styles.info}>
              <h3 className={styles.name}>{product.name}</h3>
              <p className={styles.unitPrice}>{formatBDT(product.price)}</p>
            </div>
            <div className={styles.qty}>
              <button
                type="button"
                className={styles.qtyButton}
                onClick={() => updateQuantity(product.id, quantity - 1)}
                disabled={quantity <= 1}
                aria-label={`Decrease quantity of ${product.name}`}
              >
                −
              </button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button
                type="button"
                className={styles.qtyButton}
                onClick={() => updateQuantity(product.id, quantity + 1)}
                aria-label={`Increase quantity of ${product.name}`}
              >
                +
              </button>
            </div>
            <span className={styles.lineTotal}>{formatBDT(product.price * quantity)}</span>
            <button
              type="button"
              className={styles.remove}
              onClick={() => removeItem(product.id)}
              aria-label={`Remove ${product.name} from cart`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <span className={styles.summaryLabel}>Total</span>
        <span className={styles.summaryTotal}>{formatBDT(total)}</span>
      </div>

      <div className={styles.actions}>
        <Button variant="outline" size="lg" onClick={clearCart}>
          Clear Cart
        </Button>
        <Button size="lg" onClick={handleCheckout}>
          Checkout
        </Button>
      </div>
    </div>
  )
}

export default Cart
