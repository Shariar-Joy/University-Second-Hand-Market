import Button from '../../common/Button'
import { useCart } from '../../../context/CartContext'
import { useToast } from '../../../context/ToastContext'
import { getProductImage, type ProductCondition } from '../../../data/products'
import type { Product } from '../../../services/productService'
import { formatBDT } from '../../../utils/currency'
import styles from './ProductCard.module.css'

const conditionClass: Record<ProductCondition, string> = {
  New: 'conditionNew',
  'Like New': 'conditionLikeNew',
  Good: 'conditionGood',
  Fair: 'conditionFair',
}

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { showToast } = useToast()

  function handleAddToCart() {
    addItem(product.id)
    showToast(`Added "${product.name}" to cart`, 'success')
  }

  const conditionKey = conditionClass[product.condition as ProductCondition] ?? 'conditionGood'

  return (
    <article className={styles.card}>
      <div className={styles.thumb}>
        <img src={getProductImage(product)} alt="" className={styles.thumbImage} />
      </div>
      <div className={styles.body}>
        <span className={[styles.condition, styles[conditionKey]].join(' ')}>{product.condition}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.meta}>
          {product.category} · {product.university}
        </p>
        <div className={styles.footer}>
          <span className={styles.price}>{formatBDT(product.price)}</span>
          <Button size="sm" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
