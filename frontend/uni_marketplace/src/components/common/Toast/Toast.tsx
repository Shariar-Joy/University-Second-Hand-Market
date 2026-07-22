import styles from './Toast.module.css'

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

function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null

  return (
    <div className={styles.container} role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={[styles.toast, styles[toast.variant]].join(' ')}>
          <span>{toast.message}</span>
          <button
            type="button"
            className={styles.dismiss}
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

export default Toast
