import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import './TextInput.css'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode
  description?: ReactNode
  errorMessage?: ReactNode
  containerClassName?: string
}

export function TextInput({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  className,
  containerClassName,
  description,
  errorMessage,
  id,
  label,
  required,
  ...inputProps
}: TextInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = description ? `${inputId}-description` : undefined
  const errorId = errorMessage ? `${inputId}-error` : undefined
  const describedBy =
    [ariaDescribedBy, descriptionId, errorId].filter(Boolean).join(' ') || undefined
  const containerClasses = ['ds-text-input', containerClassName].filter(Boolean).join(' ')
  const inputClasses = ['ds-text-input__control', className].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      <label className="ds-text-input__label" htmlFor={inputId}>
        {label}
        {required && (
          <span aria-hidden="true" className="ds-text-input__required">
            {' '}
            *
          </span>
        )}
      </label>
      {description && (
        <div className="ds-text-input__description" id={descriptionId}>
          {description}
        </div>
      )}
      <input
        {...inputProps}
        aria-describedby={describedBy}
        aria-invalid={errorMessage ? true : ariaInvalid}
        className={inputClasses}
        id={inputId}
        required={required}
      />
      {errorMessage && (
        <div className="ds-text-input__error" id={errorId}>
          {errorMessage}
        </div>
      )}
    </div>
  )
}

export type { TextInputProps }
