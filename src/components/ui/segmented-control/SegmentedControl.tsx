import { useId, type ReactNode } from 'react'
import './SegmentedControl.css'

interface SegmentedControlOption<Value extends string> {
  value: Value
  label: ReactNode
  disabled?: boolean
}

interface SegmentedControlProps<Value extends string> {
  ariaLabel: string
  options: readonly SegmentedControlOption<Value>[]
  value: Value
  onValueChange: (value: Value) => void
  disabled?: boolean
  className?: string
}

export function SegmentedControl<Value extends string>({
  ariaLabel,
  className,
  disabled = false,
  onValueChange,
  options,
  value,
}: SegmentedControlProps<Value>) {
  const name = useId()
  const classes = ['ds-segmented-control', className].filter(Boolean).join(' ')

  return (
    <div aria-label={ariaLabel} className={classes} role="radiogroup">
      {options.map((option) => (
        <label className="ds-segmented-control__option" key={option.value}>
          <input
            checked={option.value === value}
            disabled={disabled || option.disabled}
            name={name}
            onChange={() => onValueChange(option.value)}
            type="radio"
            value={option.value}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  )
}

export type { SegmentedControlOption, SegmentedControlProps }
