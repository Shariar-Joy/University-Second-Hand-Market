import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
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

/** Reusable button that renders a native <button> or, when given a `to` prop, a router <Link> with identical styling. */
function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', fullWidth = false, className, children, ...rest } = props
  const classes = [styles.button, styles[variant], styles[size], fullWidth ? styles.fullWidth : '', className]
    .filter(Boolean)
    .join(' ')

  if ('to' in rest && rest.to !== undefined) {
    return (
      <Link className={classes} {...rest} to={rest.to}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  )
}

export default Button
