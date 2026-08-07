import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  reviewCount?: number
  size?: 'sm' | 'md'
}

const ICON_SIZE: Record<NonNullable<StarRatingProps['size']>, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
}

const TEXT_SIZE: Record<NonNullable<StarRatingProps['size']>, string> = {
  sm: 'text-xs',
  md: 'text-sm',
}

function StarRating({ rating, reviewCount, size = 'md' }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, rating))

  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Rated ${clamped.toFixed(1)} out of 5`}>
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.max(0, Math.min(1, clamped - index)) * 100
          return (
            <span key={index} className="relative inline-flex">
              <Star className={[ICON_SIZE[size], 'text-slate-200'].join(' ')} fill="currentColor" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
                <Star className={[ICON_SIZE[size], 'text-amber-400'].join(' ')} fill="currentColor" />
              </span>
            </span>
          )
        })}
      </span>
      <span className={[TEXT_SIZE[size], 'font-semibold text-ink'].join(' ')}>{clamped.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className={[TEXT_SIZE[size], 'text-ink-soft'].join(' ')}>({reviewCount})</span>
      )}
    </span>
  )
}

export default StarRating
