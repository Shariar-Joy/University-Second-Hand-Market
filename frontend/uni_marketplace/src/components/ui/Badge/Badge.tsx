import type { HTMLAttributes, ReactNode } from 'react'

type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  variant?: BadgeVariant
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-white text-ink-soft shadow-sm',
  primary: 'bg-blue-100 text-primary',
  success: 'bg-success-soft text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-danger-soft text-red-700',
}

function Badge({ children, variant = 'neutral', className, ...rest }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        VARIANT_CLASSES[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </span>
  )
}

export default Badge
