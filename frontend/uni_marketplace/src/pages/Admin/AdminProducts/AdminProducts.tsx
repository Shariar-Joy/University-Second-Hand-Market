import { useCallback, useEffect, useState } from 'react'
import { ShoppingBag, Trash2 } from 'lucide-react'
import AdminNav from '../../../components/admin/AdminNav'
import Button from '../../../components/common/Button'
import Badge from '../../../components/ui/Badge'
import EmptyState from '../../../components/ui/EmptyState'
import { TextLineSkeleton } from '../../../components/ui/LoadingSkeleton'
import Modal from '../../../components/ui/Modal'
import { useToast } from '../../../context/ToastContext'
import * as adminService from '../../../services/adminService'
import type { Product } from '../../../services/productService'
import { extractErrorMessage } from '../../../utils/errorMessage'
import { formatBDT } from '../../../utils/currency'

const STATUS_BADGE_VARIANT: Record<string, 'neutral' | 'primary' | 'success' | 'warning' | 'danger'> = {
  available: 'success',
  reserved: 'warning',
  sold: 'primary',
  archived: 'neutral',
}

function AdminProducts() {
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = useCallback(() => {
    setIsLoading(true)
    setError('')
    adminService
      .listProducts()
      .then(setProducts)
      .catch((loadError) => setError(extractErrorMessage(loadError, 'Could not load products.')))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleDelete() {
    if (!productToDelete) return
    setIsDeleting(true)
    try {
      await adminService.deleteProduct(productToDelete.id)
      setProducts((previous) => previous.filter((product) => product.id !== productToDelete.id))
      showToast('Listing removed.', 'success')
      setProductToDelete(null)
    } catch (deleteError) {
      showToast(extractErrorMessage(deleteError, 'Could not remove this listing.'), 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {isLoading ? 'Loading listings…' : `${products.length} listing${products.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <AdminNav />
      </div>

      <div className="mt-8">
        {error ? (
          <EmptyState
            icon={ShoppingBag}
            title="Could not load products"
            description={error}
            action={<Button onClick={load}>Try Again</Button>}
          />
        ) : isLoading ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-card">
            {Array.from({ length: 6 }, (_, index) => (
              <TextLineSkeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="No listings yet" description="Marketplace listings will appear here." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-card">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-semibold tracking-wide text-ink-soft uppercase">
                  <th className="px-5 py-3">Listing</th>
                  <th className="px-5 py-3">Seller</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">{product.name}</td>
                    <td className="px-5 py-3 text-ink-soft">{product.seller}</td>
                    <td className="px-5 py-3 text-ink-soft">{product.category}</td>
                    <td className="px-5 py-3 text-ink-soft">{formatBDT(product.price)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={STATUS_BADGE_VARIANT[product.status] ?? 'neutral'}>{product.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setProductToDelete(product)}>
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={productToDelete !== null} onClose={() => setProductToDelete(null)} title="Remove Listing" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft">
            Permanently remove <span className="font-semibold text-ink">{productToDelete?.name}</span> from the
            marketplace? This can't be undone.
          </p>
          <Button variant="danger" size="lg" fullWidth loading={isDeleting} onClick={handleDelete}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Remove Listing
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default AdminProducts
