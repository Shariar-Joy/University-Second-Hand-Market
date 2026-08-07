import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

export type ToastVariant = 'success' | 'info' | 'error'

export interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastProps {
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}

const VARIANT_STYLES: Record<ToastVariant, { icon: typeof Info; classes: string; iconClasses: string }> = {
  success: { icon: CheckCircle2, classes: 'border-success/20 bg-success-soft', iconClasses: 'text-success' },
  info: { icon: Info, classes: 'border-primary/20 bg-primary/5', iconClasses: 'text-primary' },
  error: { icon: XCircle, classes: 'border-danger/20 bg-danger-soft', iconClasses: 'text-danger' },
}

function Toast({ toasts, onDismiss }: ToastProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-100 flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const { icon: Icon, classes, iconClasses } = VARIANT_STYLES[toast.variant]
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={[
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-pop backdrop-blur-sm',
                classes,
              ].join(' ')}
            >
              <Icon className={['mt-0.5 h-5 w-5 shrink-0', iconClasses].join(' ')} aria-hidden="true" />
              <span className="flex-1 text-sm font-medium text-ink">{toast.message}</span>
              <button
                type="button"
                className="shrink-0 rounded-full p-0.5 text-ink-faint transition-colors hover:bg-ink/5 hover:text-ink"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default Toast
