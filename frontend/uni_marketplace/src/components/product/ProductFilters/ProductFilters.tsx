import { useId } from 'react'
import { X } from 'lucide-react'
import Button from '../../common/Button'
import Input from '../../common/Input'
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from '../../../data/products'
import type { ProductAvailability, ProductSort } from '../../../services/productService'

export interface ProductFilterValues {
  category: string
  condition: string
  minPrice: string
  maxPrice: string
  availability: ProductAvailability | ''
  sort: ProductSort | ''
}

export const EMPTY_PRODUCT_FILTERS: ProductFilterValues = {
  category: '',
  condition: '',
  minPrice: '',
  maxPrice: '',
  availability: '',
  sort: '',
}

export function hasActiveProductFilters(values: ProductFilterValues): boolean {
  return Object.values(values).some((value) => value !== '')
}

interface ProductFiltersProps {
  values: ProductFilterValues
  onChange: (values: ProductFilterValues) => void
  onClear: () => void
  /** Hide the internal "Filters" heading + Clear row -- set when an ancestor (e.g. a Drawer) already renders its own title. */
  hideHeading?: boolean
}

function selectClasses(): string {
  return 'h-11 w-full appearance-none rounded-lg border border-border bg-white px-3.5 text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-primary/10'
}

function ProductFilters({ values, onChange, onClear, hideHeading = false }: ProductFiltersProps) {
  function updateField<K extends keyof ProductFilterValues>(field: K, value: ProductFilterValues[K]) {
    onChange({ ...values, [field]: value })
  }

  const isActive = hasActiveProductFilters(values)
  // Both the desktop sidebar and the mobile drawer render this component at the same time (one
  // hidden via CSS, not unmounted), so ids must be unique per instance to stay valid HTML and
  // keep each <label for=...> pointing at the right control.
  const uid = useId()
  const categoryId = `${uid}-category`
  const conditionId = `${uid}-condition`
  const availabilityId = `${uid}-availability`
  const sortId = `${uid}-sort`

  return (
    <div className="flex flex-col gap-5">
      {!hideHeading && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Filters</span>
          {isActive && (
            <Button variant="ghost" size="sm" onClick={onClear} className="px-2! text-ink-soft">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor={categoryId} className="text-sm font-medium text-ink">
          Category
        </label>
        <select
          id={categoryId}
          value={values.category}
          onChange={(event) => updateField('category', event.target.value)}
          className={selectClasses()}
        >
          <option value="">All categories</option>
          {PRODUCT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={conditionId} className="text-sm font-medium text-ink">
          Condition
        </label>
        <select
          id={conditionId}
          value={values.condition}
          onChange={(event) => updateField('condition', event.target.value)}
          className={selectClasses()}
        >
          <option value="">Any condition</option>
          {PRODUCT_CONDITIONS.map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Price range (BDT)</span>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            aria-label="Minimum price"
            value={values.minPrice}
            onChange={(event) => updateField('minPrice', event.target.value)}
          />
          <Input
            type="number"
            min={0}
            placeholder="Max"
            aria-label="Maximum price"
            value={values.maxPrice}
            onChange={(event) => updateField('maxPrice', event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={availabilityId} className="text-sm font-medium text-ink">
          Availability
        </label>
        <select
          id={availabilityId}
          value={values.availability}
          onChange={(event) => updateField('availability', event.target.value as ProductAvailability | '')}
          className={selectClasses()}
        >
          <option value="">Available &amp; reserved</option>
          <option value="available">Available only</option>
          <option value="reserved">Reserved only</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={sortId} className="text-sm font-medium text-ink">
          Sort by
        </label>
        <select
          id={sortId}
          value={values.sort}
          onChange={(event) => updateField('sort', event.target.value as ProductSort | '')}
          className={selectClasses()}
        >
          <option value="">Default</option>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  )
}

export default ProductFilters
