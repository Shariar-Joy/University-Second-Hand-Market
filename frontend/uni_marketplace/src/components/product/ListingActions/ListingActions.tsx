import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Tag, Trash2 } from 'lucide-react'
import Button from '../../common/Button'
import Input from '../../common/Input'
import Modal from '../../ui/Modal'
import { useToast } from '../../../context/ToastContext'
import { ApiError } from '../../../services/apiClient'
import * as productService from '../../../services/productService'
import type { Product } from '../../../services/productService'
import { editListingPath } from '../../../routes/routePaths'

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

interface ListingActionsProps {
  product: Product
  onUpdated: (product: Product) => void
  onDeleted: () => void
  className?: string
}

function ListingActions({ product, onUpdated, onDeleted, className }: ListingActionsProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [isBusy, setIsBusy] = useState(false)
  const [isSoldModalOpen, setIsSoldModalOpen] = useState(false)
  const [buyerIdentifier, setBuyerIdentifier] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  async function handleSetStatus(status: 'available' | 'reserved' | 'archived') {
    setIsBusy(true)
    try {
      const updated = await productService.setStatus(product.id, status)
      onUpdated(updated)
      showToast(`Listing marked as ${status}.`, 'success')
    } catch (error) {
      showToast(errorMessage(error, 'Could not update this listing.'), 'error')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleConfirmSold(event: FormEvent) {
    event.preventDefault()
    setIsBusy(true)
    try {
      const updated = await productService.markAsSold(product.id, buyerIdentifier.trim() || undefined)
      onUpdated(updated)
      setIsSoldModalOpen(false)
      showToast('Listing marked as sold.', 'success')
    } catch (error) {
      showToast(errorMessage(error, 'Could not mark this listing as sold.'), 'error')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleDelete() {
    setIsBusy(true)
    try {
      await productService.deleteProduct(product.id)
      setIsDeleteModalOpen(false)
      showToast('Listing deleted.', 'success')
      onDeleted()
    } catch (error) {
      showToast(errorMessage(error, 'Could not delete this listing.'), 'error')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <>
      <div className={className}>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(editListingPath(product.id))}>
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={product.status === 'sold'}
            title={product.status === 'sold' ? "Sold listings can't be deleted — archive it instead." : undefined}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Delete
          </Button>
        </div>

        {(product.status === 'available' || product.status === 'reserved') && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" loading={isBusy} onClick={() => setIsSoldModalOpen(true)}>
              <Tag className="h-3.5 w-3.5" aria-hidden="true" />
              Mark Sold
            </Button>
            {product.status === 'available' ? (
              <Button variant="outline" size="sm" loading={isBusy} onClick={() => handleSetStatus('reserved')}>
                Reserve
              </Button>
            ) : (
              <Button variant="outline" size="sm" loading={isBusy} onClick={() => handleSetStatus('available')}>
                Unreserve
              </Button>
            )}
            <Button variant="outline" size="sm" loading={isBusy} onClick={() => handleSetStatus('archived')}>
              Archive
            </Button>
          </div>
        )}

        {product.status === 'archived' && (
          <Button
            variant="outline"
            size="sm"
            loading={isBusy}
            className="mt-1.5"
            onClick={() => handleSetStatus('available')}
          >
            Restore to Available
          </Button>
        )}

        {product.status === 'sold' && (
          <p className="mt-1.5 text-center text-xs text-ink-soft">
            Sold{product.buyerName ? ` to ${product.buyerName}` : ''}
          </p>
        )}
      </div>

      <Modal isOpen={isSoldModalOpen} onClose={() => setIsSoldModalOpen(false)} title="Mark as Sold" size="sm">
        <form onSubmit={handleConfirmSold} className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft">
            Mark <span className="font-semibold text-ink">{product.name}</span> as sold. Optionally record who
            bought it.
          </p>
          <Input
            label="Buyer username or email (optional)"
            value={buyerIdentifier}
            onChange={(event) => setBuyerIdentifier(event.target.value)}
            placeholder="e.g. nusrat.jahan"
          />
          <Button type="submit" size="lg" fullWidth loading={isBusy}>
            Confirm Sold
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Listing" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft">
            Permanently delete <span className="font-semibold text-ink">{product.name}</span>? This can't be undone.
          </p>
          <Button variant="danger" size="lg" fullWidth loading={isBusy} onClick={handleDelete}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete Listing
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default ListingActions
