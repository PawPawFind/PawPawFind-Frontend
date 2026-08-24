import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './SelectableChip.css'

interface SelectableChipProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-pressed' | 'children'
> {
  children: ReactNode
  selected: boolean
}

export function SelectableChip({
  children,
  className,
  selected,
  type = 'button',
  ...buttonProps
}: SelectableChipProps) {
  const classes = ['ds-selectable-chip', className].filter(Boolean).join(' ')

  return (
    <button aria-pressed={selected} className={classes} type={type} {...buttonProps}>
      {children}
    </button>
  )
}

export type { SelectableChipProps }
