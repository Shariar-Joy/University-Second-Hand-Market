import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, id, className, required, type, ...rest },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? rest.name ?? generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword && showPassword ? 'text' : type

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          type={resolvedType}
          required={required}
          className={[
            'h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-ink placeholder:text-ink-faint transition-colors duration-150 outline-none',
            'focus:border-primary focus:ring-4 focus:ring-primary/10',
            error ? 'border-danger focus:border-danger focus:ring-danger/10' : 'border-border',
            isPassword ? 'pr-11' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-faint transition-colors hover:text-ink-soft"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="text-sm text-ink-soft">
          {helperText}
        </p>
      )}
    </div>
  )
})

export default Input
