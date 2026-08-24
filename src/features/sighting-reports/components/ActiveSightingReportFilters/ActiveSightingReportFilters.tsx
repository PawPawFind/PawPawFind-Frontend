import './ActiveSightingReportFilters.css'

interface ActiveSightingReportFilter {
  value: string
  label: string
}
interface ActiveSightingReportFiltersProps {
  filters: readonly ActiveSightingReportFilter[]
  onRemove: (value: string) => void
  disabled?: boolean
}

export function ActiveSightingReportFilters({
  disabled = false,
  filters,
  onRemove,
}: ActiveSightingReportFiltersProps) {
  if (filters.length === 0) return null
  return (
    <div aria-label="적용된 필터" className="active-sighting-report-filters" role="group">
      {filters.map((filter) => (
        <button
          aria-label={`${filter.label} 필터 제거`}
          disabled={disabled}
          key={filter.value}
          onClick={() => onRemove(filter.value)}
          type="button"
        >
          <span>{filter.label}</span>
          <span aria-hidden="true">×</span>
        </button>
      ))}
    </div>
  )
}

export type { ActiveSightingReportFilter, ActiveSightingReportFiltersProps }
