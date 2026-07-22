import styles from './StarRating.module.css'

interface StarRatingProps {
  rating: number
  reviewCount?: number
  size?: 'sm' | 'md'
}

function StarRating({ rating, reviewCount, size = 'md' }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, rating))
  const percent = (clamped / 5) * 100

  return (
    <span className={[styles.wrapper, styles[size]].join(' ')}>
      <span className={styles.stars} aria-label={`Rated ${clamped.toFixed(1)} out of 5`}>
        <span className={styles.starsBg} aria-hidden="true">
          ★★★★★
        </span>
        <span className={styles.starsFg} style={{ width: `${percent}%` }} aria-hidden="true">
          ★★★★★
        </span>
      </span>
      <span className={styles.value}>{clamped.toFixed(1)}</span>
      {reviewCount !== undefined && <span className={styles.count}>({reviewCount})</span>}
    </span>
  )
}

export default StarRating
