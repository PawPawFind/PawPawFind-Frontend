import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import './TimeBandSelect.css'

interface TimeBandSelectOption<Value extends string> {
  value: Value
  label: string
}

interface TimeBandSelectProps<Value extends string> {
  label: string
  options: readonly TimeBandSelectOption<Value>[]
  value: Value
  onValueChange: (value: Value) => void
  description?: string
  disabled?: boolean
  className?: string
}

function getWrappedIndex(index: number, length: number) {
  return (index + length) % length
}

export function TimeBandSelect<Value extends string>({
  className,
  description,
  disabled = false,
  label,
  onValueChange,
  options,
  value,
}: TimeBandSelectProps<Value>) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()
  const labelId = `${id}-label`
  const valueId = `${id}-value`
  const descriptionId = `${id}-description`
  const listboxId = `${id}-listbox`
  const selectedIndex = options.findIndex((option) => option.value === value)
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined
  const classes = ['ds-time-band-select', className].filter(Boolean).join(' ')

  const openMenu = (nextIndex = selectedIndex >= 0 ? selectedIndex : 0) => {
    if (disabled || options.length === 0) return

    setActiveIndex(nextIndex)
    setIsOpen(true)
  }

  const closeMenu = (restoreFocus = false) => {
    setIsOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  const selectOption = (option: TimeBandSelectOption<Value>) => {
    onValueChange(option.value)
    closeMenu(true)
  }

  const moveFocus = (index: number) => {
    if (options.length === 0) return
    setActiveIndex(getWrappedIndex(index, options.length))
  }

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openMenu(
        selectedIndex >= 0 ? selectedIndex : event.key === 'ArrowDown' ? 0 : options.length - 1,
      )
    }
  }

  const handleOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        moveFocus(index + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveFocus(index - 1)
        break
      case 'Home':
        event.preventDefault()
        moveFocus(0)
        break
      case 'End':
        event.preventDefault()
        moveFocus(options.length - 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        selectOption(options[index])
        break
      case 'Escape':
        event.preventDefault()
        closeMenu(true)
        break
      case 'Tab':
        closeMenu()
        break
    }
  }

  useEffect(() => {
    if (!isOpen) return

    const activeOption = optionRefs.current[activeIndex]
    const listbox = listboxRef.current

    activeOption?.focus({ preventScroll: true })

    if (!activeOption || !listbox || listbox.clientHeight === 0) return

    const optionTop = activeOption.offsetTop
    const optionBottom = optionTop + activeOption.offsetHeight
    const visibleTop = listbox.scrollTop
    const visibleBottom = visibleTop + listbox.clientHeight

    if (optionTop < visibleTop) {
      listbox.scrollTop = optionTop
    } else if (optionBottom > visibleBottom) {
      listbox.scrollTop = optionBottom - listbox.clientHeight
    }
  }, [activeIndex, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  useEffect(() => {
    if (disabled) setIsOpen(false)
  }, [disabled])

  return (
    <div className={classes} ref={rootRef}>
      <div className="ds-time-band-select__heading">
        <span className="ds-time-band-select__label" id={labelId}>
          {label}
        </span>
        {description && (
          <span className="ds-time-band-select__description" id={descriptionId}>
            {description}
          </span>
        )}
      </div>

      <div className="ds-time-band-select__control">
        <button
          aria-controls={listboxId}
          aria-describedby={description ? descriptionId : undefined}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={`${labelId} ${valueId}`}
          className="ds-time-band-select__trigger"
          data-open={isOpen || undefined}
          disabled={disabled}
          onClick={() => (isOpen ? closeMenu() : openMenu())}
          onKeyDown={handleTriggerKeyDown}
          ref={triggerRef}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="ds-time-band-select__clock"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.6V12l3.2 2" />
          </svg>
          <span className="ds-time-band-select__value" id={valueId}>
            {selectedOption?.label ?? ''}
          </span>
          <svg
            aria-hidden="true"
            className="ds-time-band-select__caret"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path d="m6 9.5 6 6 6-6" />
          </svg>
        </button>

        {isOpen && (
          <div
            aria-labelledby={labelId}
            className="ds-time-band-select__listbox"
            id={listboxId}
            ref={listboxRef}
            role="listbox"
          >
            {options.map((option, index) => {
              const selected = option.value === value

              return (
                <button
                  aria-selected={selected}
                  className="ds-time-band-select__option"
                  key={option.value}
                  onClick={() => selectOption(option)}
                  onFocus={() => setActiveIndex(index)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                  ref={(element) => {
                    optionRefs.current[index] = element
                  }}
                  role="option"
                  tabIndex={index === activeIndex ? 0 : -1}
                  type="button"
                >
                  <span>{option.label}</span>
                  {selected && (
                    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                      <path d="m5.5 12.5 4 4 9-9" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export type { TimeBandSelectOption, TimeBandSelectProps }
