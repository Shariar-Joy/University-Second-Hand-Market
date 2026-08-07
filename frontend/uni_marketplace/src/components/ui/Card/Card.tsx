import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const PADDING_CLASSES: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

function Card({ children, hoverable = false, padding = 'md', className, ...rest }: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl border border-border bg-white shadow-card',
        hoverable ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover' : '',
        PADDING_CLASSES[padding],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}

export default Card
