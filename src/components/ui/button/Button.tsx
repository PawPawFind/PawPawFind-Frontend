import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

type ButtonVariant = 'primary' | 'secondary'
type ButtonSize = 'medium' | 'large'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  loadingLabel?: ReactNode
}

export function Button({
  children,
  className,
  disabled,
  loading = false,
  loadingLabel,
  size = 'medium',
  type = 'button',
  variant = 'primary',
  ...buttonProps
}: ButtonProps) {
  const classes = ['ds-button', `ds-button--${variant}`, `ds-button--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      aria-busy={loading || undefined}
      className={classes}
      disabled={disabled || loading}
      type={type}
      {...buttonProps}
    >
      {loading && <span aria-hidden="true" className="ds-button__spinner" />}
      <span>{loading ? (loadingLabel ?? children) : children}</span>
    </button>
  )
}

export type { ButtonProps }
