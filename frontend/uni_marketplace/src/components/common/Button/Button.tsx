import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  className?: string
  children: ReactNode
}

type NativeButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: undefined
  }

type LinkButtonProps = CommonProps &
  Omit<LinkProps, 'className' | 'children'> & {
    to: LinkProps['to']
  }

export type ButtonProps = NativeButtonProps | LinkButtonProps

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white shadow-sm shadow-primary/20 hover:bg-primary-hover hover:shadow-md hover:shadow-primary/25',
  secondary: 'bg-accent/10 text-primary hover:bg-accent/20',
  outline: 'border border-border bg-white text-ink hover:border-primary/40 hover:bg-primary/5',
  ghost: 'text-ink-soft hover:bg-ink/5 hover:text-ink',
  danger: 'bg-danger text-white shadow-sm shadow-danger/20 hover:bg-red-600',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
  icon: 'h-10 w-10 p-0',
}

/** Reusable button that renders a native <button> or, when given a `to` prop, a router <Link> with identical styling. */
function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    className,
    children,
    ...rest
  } = props

  const classes = [
    BASE_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </>
  )

  if (rest.to !== undefined) {
    return (
      <Link className={classes} {...rest} to={rest.to}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" {...rest} className={classes} disabled={loading || rest.disabled}>
      {content}
    </button>
  )
}

export default Button
