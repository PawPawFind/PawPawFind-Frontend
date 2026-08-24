import { useId, useState } from 'react'
import { SelectableChip } from '@/components/ui/selectable-chip'
import './SightingReportFilterPanel.css'

interface SightingReportFilterOption {
  value: string
  label: string
  disabled?: boolean
}
interface SightingReportFilterGroup {
  key: string
  label: string
  options: readonly SightingReportFilterOption[]
  selectionType?: 'single' | 'multiple'
}
interface SightingReportFilterPanelProps {
  groups: readonly SightingReportFilterGroup[]
  selectedValues: readonly string[]
  onToggle: (value: string) => void
  disabled?: boolean
}

export function SightingReportFilterPanel({
  disabled = false,
  groups,
  onToggle,
  selectedValues,
}: SightingReportFilterPanelProps) {
  const panelId = useId()
  const [openGroupKey, setOpenGroupKey] = useState<string | null>(null)

  return (
    <section aria-label="목격 제보 필터" className="sighting-report-filter-panel">
      {groups.map((group) => {
        const isOpen = openGroupKey === group.key
        const selectedLabels = group.options
          .filter((option) => selectedValues.includes(option.value))
          .map((option) => option.label)
          .join(', ')
        const optionsId = `${panelId}-${group.key}`

        return (
          <div className="sighting-report-filter-panel__group" key={group.key}>
            <button
              aria-controls={optionsId}
              aria-expanded={isOpen}
              className="sighting-report-filter-panel__disclosure"
              disabled={disabled}
              onClick={() => setOpenGroupKey(isOpen ? null : group.key)}
              type="button"
            >
              <span>{group.label}</span>
              <span className="sighting-report-filter-panel__summary">{selectedLabels}</span>
              <span aria-hidden="true" className="sighting-report-filter-panel__chevron">
                {isOpen ? '▴' : '▾'}
              </span>
            </button>
            {isOpen && (
              <div className="sighting-report-filter-panel__options" id={optionsId}>
                {group.options.map((option) => (
                  <SelectableChip
                    disabled={option.disabled || disabled}
                    key={option.value}
                    onClick={() => onToggle(option.value)}
                    selected={selectedValues.includes(option.value)}
                  >
                    {option.label}
                  </SelectableChip>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}

export type {
  SightingReportFilterGroup,
  SightingReportFilterOption,
  SightingReportFilterPanelProps,
}
