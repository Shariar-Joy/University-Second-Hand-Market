import { useEffect, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, GripVertical, ImagePlus, Loader2, Star, X } from 'lucide-react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useToast } from '../../context/ToastContext'
import { ApiError } from '../../services/apiClient'
import * as productService from '../../services/productService'
import type { Product, ProductImage } from '../../services/productService'
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from '../../data/products'
import { ROUTES, productDetailsPath } from '../../routes/routePaths'

const MAX_IMAGES = 5
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

interface FormValues {
  name: string
  description: string
  price: string
  negotiable: boolean
  category: string
  condition: string
  location: string
  department: string
}

const EMPTY_FORM: FormValues = {
  name: '',
  description: '',
  price: '',
  negotiable: false,
  category: '',
  condition: '',
  location: '',
  department: '',
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

function selectClasses(hasError: boolean): string {
  return [
    'h-11 w-full appearance-none rounded-lg border bg-white px-3.5 text-sm text-ink outline-none transition-colors',
    'focus:border-primary focus:ring-4 focus:ring-primary/10',
    hasError ? 'border-danger' : 'border-border',
  ].join(' ')
}

function CreateListing() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [values, setValues] = useState<FormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [product, setProduct] = useState<Product | null>(null)
  const [existingImages, setExistingImages] = useState<ProductImage[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [busyImageAction, setBusyImageAction] = useState<'removing' | 'primary' | 'reordering' | null>(null)
  const [isDropzoneActive, setIsDropzoneActive] = useState(false)
  const [draggedImageId, setDraggedImageId] = useState<number | null>(null)

  useEffect(() => {
    if (!isEditMode || !id) return
    let isMounted = true
    productService
      .listMine()
      .then((products) => {
        const match = products.find((item) => item.id === Number(id))
        if (!isMounted) return
        if (!match) {
          showToast('Listing not found.', 'error')
          navigate(ROUTES.PROFILE)
          return
        }
        setProduct(match)
        setValues({
          name: match.name,
          description: match.description ?? '',
          price: String(match.price),
          negotiable: match.negotiable,
          category: match.category,
          condition: match.condition,
          location: match.location ?? '',
          department: match.department ?? '',
        })
        setExistingImages([...match.imageDetails].sort((a, b) => a.position - b.position))
      })
      .catch((error) => showToast(errorMessage(error, 'Could not load this listing.'), 'error'))
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode])

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }))
  }

  function addFiles(files: File[]) {
    if (files.length === 0) return
    if (existingImages.length + newFiles.length + files.length > MAX_IMAGES) {
      showToast(`A listing can have at most ${MAX_IMAGES} photos.`, 'error')
      return
    }
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        showToast('Please choose JPEG, PNG, WEBP, or GIF images.', 'error')
        return
      }
      if (file.size > MAX_IMAGE_BYTES) {
        showToast('Each photo must be 5MB or smaller.', 'error')
        return
      }
    }
    setNewFiles((previous) => [...previous, ...files])
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    addFiles(files)
  }

  function handleDropFiles(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDropzoneActive(false)
    addFiles(Array.from(event.dataTransfer.files ?? []))
  }

  function removeNewFile(index: number) {
    setNewFiles((previous) => previous.filter((_, fileIndex) => fileIndex !== index))
  }

  async function removeExistingImage(imageId: number) {
    if (!product) return
    setBusyImageAction('removing')
    try {
      const updated = await productService.removeProductImage(product.id, imageId)
      setExistingImages([...updated.imageDetails].sort((a, b) => a.position - b.position))
      showToast('Photo removed.', 'success')
    } catch (error) {
      showToast(errorMessage(error, 'Could not remove that photo.'), 'error')
    } finally {
      setBusyImageAction(null)
    }
  }

  async function makeImagePrimary(imageId: number) {
    if (!product) return
    setBusyImageAction('primary')
    try {
      const updated = await productService.setPrimaryImage(product.id, imageId)
      setExistingImages([...updated.imageDetails].sort((a, b) => a.position - b.position))
    } catch (error) {
      showToast(errorMessage(error, 'Could not update the main photo.'), 'error')
    } finally {
      setBusyImageAction(null)
    }
  }

  function handleImageDragStart(imageId: number) {
    setDraggedImageId(imageId)
  }

  async function handleImageDropReorder(targetId: number) {
    if (!product || draggedImageId === null || draggedImageId === targetId) {
      setDraggedImageId(null)
      return
    }
    const fromIndex = existingImages.findIndex((image) => image.id === draggedImageId)
    const toIndex = existingImages.findIndex((image) => image.id === targetId)
    setDraggedImageId(null)
    if (fromIndex === -1 || toIndex === -1) return

    const reordered = [...existingImages]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    setExistingImages(reordered)

    setBusyImageAction('reordering')
    try {
      const updated = await productService.reorderProductImages(product.id, reordered.map((image) => image.id))
      setExistingImages([...updated.imageDetails].sort((a, b) => a.position - b.position))
    } catch (error) {
      showToast(errorMessage(error, 'Could not reorder photos.'), 'error')
      setExistingImages([...existingImages])
    } finally {
      setBusyImageAction(null)
    }
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {}
    if (values.name.trim().length < 2) nextErrors.name = 'Enter a title for your listing.'
    const price = Number(values.price)
    if (!values.price || Number.isNaN(price) || price <= 0) nextErrors.price = 'Enter a price greater than 0.'
    if (!values.category) nextErrors.category = 'Select a category.'
    if (!values.condition) nextErrors.condition = 'Select a condition.'
    if (existingImages.length + newFiles.length === 0) nextErrors.images = 'Add at least one photo.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        price: Number(values.price),
        negotiable: values.negotiable,
        category: values.category,
        condition: values.condition,
        location: values.location.trim() || undefined,
        department: values.department.trim() || undefined,
      }

      let saved = isEditMode && product
        ? await productService.updateProduct(product.id, payload)
        : await productService.createProduct(payload)

      if (newFiles.length > 0) {
        saved = await productService.uploadProductImages(saved.id, newFiles)
      }

      showToast(isEditMode ? 'Listing updated.' : 'Listing created.', 'success')
      navigate(productDetailsPath(saved.slug))
    } catch (error) {
      showToast(errorMessage(error, 'Could not save this listing. Please try again.'), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <div className="animate-pulse rounded-3xl border border-border bg-white p-8 shadow-card">
          <div className="h-6 w-1/3 rounded bg-slate-200" />
          <div className="mt-6 h-11 w-full rounded bg-slate-200" />
          <div className="mt-4 h-24 w-full rounded bg-slate-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl border border-border bg-white p-8 shadow-card"
      >
        <h1 className="text-xl font-bold text-ink">{isEditMode ? 'Edit Listing' : 'Create a Listing'}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {isEditMode ? 'Update your listing details below.' : 'Fill in the details to list an item for sale.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label="Title"
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            error={errors.name}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="listing-description" className="text-sm font-medium text-ink">
              Description
            </label>
            <textarea
              id="listing-description"
              rows={4}
              placeholder="Condition details, reason for selling, anything a buyer should know…"
              value={values.description}
              onChange={(event) => updateField('description', event.target.value)}
              className="w-full resize-none rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Price (BDT)"
              type="number"
              min={1}
              value={values.price}
              onChange={(event) => updateField('price', event.target.value)}
              error={errors.price}
              required
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink">Negotiable?</span>
              <label className="flex h-11 items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={values.negotiable}
                  onChange={(event) => updateField('negotiable', event.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                />
                Buyer can negotiate the price
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="listing-category" className="text-sm font-medium text-ink">
                Category <span className="text-danger">*</span>
              </label>
              <select
                id="listing-category"
                value={values.category}
                onChange={(event) => updateField('category', event.target.value)}
                className={selectClasses(Boolean(errors.category))}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-sm text-danger">{errors.category}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="listing-condition" className="text-sm font-medium text-ink">
                Condition <span className="text-danger">*</span>
              </label>
              <select
                id="listing-condition"
                value={values.condition}
                onChange={(event) => updateField('condition', event.target.value)}
                className={selectClasses(Boolean(errors.condition))}
              >
                <option value="" disabled>
                  Select a condition
                </option>
                {PRODUCT_CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
              {errors.condition && <p className="text-sm text-danger">{errors.condition}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Pickup Location"
              placeholder="e.g. Library entrance"
              value={values.location}
              onChange={(event) => updateField('location', event.target.value)}
            />
            <Input
              label="Department"
              placeholder="e.g. CSE"
              value={values.department}
              onChange={(event) => updateField('department', event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-2 text-sm font-medium text-ink">
              Photos <span className="text-danger">*</span>
              {busyImageAction && <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-soft" aria-hidden="true" />}
            </span>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((image) => (
                <div
                  key={image.id}
                  draggable={existingImages.length > 1}
                  onDragStart={() => handleImageDragStart(image.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleImageDropReorder(image.id)}
                  className={[
                    'group relative h-20 w-20 overflow-hidden rounded-lg border',
                    image.isPrimary ? 'border-primary ring-2 ring-primary/30' : 'border-border',
                    existingImages.length > 1 ? 'cursor-grab' : '',
                  ].join(' ')}
                >
                  <img src={image.url} alt="Listing" className="h-full w-full object-cover" />
                  {existingImages.length > 1 && (
                    <span className="absolute bottom-0.5 left-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <GripVertical className="h-3 w-3" />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => makeImagePrimary(image.id)}
                    disabled={image.isPrimary || busyImageAction !== null}
                    className={[
                      'absolute top-0.5 left-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white transition-colors',
                      image.isPrimary ? 'bg-primary' : 'bg-black/50 opacity-0 group-hover:opacity-100 hover:bg-primary',
                    ].join(' ')}
                    aria-label={image.isPrimary ? 'Main photo' : 'Set as main photo'}
                    title={image.isPrimary ? 'Main photo' : 'Set as main photo'}
                  >
                    <Star className="h-3 w-3" fill={image.isPrimary ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeExistingImage(image.id)}
                    disabled={busyImageAction !== null}
                    className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {newFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                  <img src={URL.createObjectURL(file)} alt="Selected upload" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewFile(index)}
                    className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {existingImages.length + newFiles.length < MAX_IMAGES && (
                <label
                  onDragOver={(event) => {
                    event.preventDefault()
                    setIsDropzoneActive(true)
                  }}
                  onDragLeave={() => setIsDropzoneActive(false)}
                  onDrop={handleDropFiles}
                  className={[
                    'flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-ink-faint transition-colors hover:border-primary/40 hover:text-primary',
                    isDropzoneActive ? 'border-primary bg-primary/5 text-primary' : 'border-border',
                  ].join(' ')}
                >
                  <ImagePlus className="h-5 w-5" aria-hidden="true" />
                  <span className="text-[11px]">Add</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
            {errors.images && <p className="text-sm text-danger">{errors.images}</p>}
            <p className="text-xs text-ink-soft">
              Up to {MAX_IMAGES} photos. Drag to reorder, or click the star to set the main photo.
            </p>
          </div>

          <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-2">
            {isEditMode ? 'Save Changes' : 'Publish Listing'}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}

export default CreateListing
