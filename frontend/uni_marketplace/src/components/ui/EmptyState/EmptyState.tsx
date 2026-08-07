import type { ComponentType, ReactNode } from 'react'
import type { LucideProps } from 'lucide-react'

interface EmptyStateProps {
  icon: ComponentType<LucideProps>
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={['flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-white/60 px-6 py-14 text-center', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-soft">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export default EmptyState
